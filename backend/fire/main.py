import logging
import os
import subprocess
import asyncio
from contextlib import asynccontextmanager
from io import BytesIO
from time import perf_counter
from fastapi import FastAPI,File,HTTPException,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .config import get_settings
from .drawing_understanding.ocr.ocr_engine import OCREngine
from .drawing_understanding.plan_reader import DrawingUnderstandingService
from .openai_diagnostics import get_openai_config_diagnostics, make_openai_client, run_openai_preflight
from .pdf_utils import DocumentError
from .panel_mode import load_validated_demo_project, manual_project, panel_review_response, project_summary as panel_project_summary
from .project_builder import build_project
from .recommendations import build_recommendations
from .rules import evaluate_project
from .rules.applicability import purpose_group_for_project
from .rules.models import RuleStatus,Severity
from .schemas import Document, FireEquipment
from .schemas import ProjectSchema
from .ml.model_schema import ModelInferenceResult
from .ml.model_service import FireGuardModelService
from .model_evidence import build_fireguard_project_schema

logger=logging.getLogger("fireguard")
settings=get_settings()
PIPELINE_VERSION="semantic-plan-v3"
ANALYSIS_STAGES=[
    "UPLOADING",
    "PREPARING_PLAN",
    "READING_OVERVIEW",
    "READING_DETAILS",
    "BUILDING_PROJECT_SCHEMA",
    "CHECKING_ICTAD_RULES",
    "PREPARING_ASSESSMENT",
    "COMPLETE",
]
CRITICAL_FIELDS=("purpose_group","storey_count","building_height_m","highest_habitable_floor_level_m","total_building_area_m2","max_floor_area_per_storey_m2")
RICH_EXTRACTION_FIELDS=(
    "project_name","drawing_title","building_use_text","storey_count","floor_names","highest_storey_floor_level_m","building_height_m",
    "floor_areas","total_floor_area_m2","designed_occupants","visible_staircase_count","confirmed_staircase_count","stair_clear_width_m",
    "protected_stair_present","visible_exit_count","confirmed_independent_exit_count","escape_type","corridor_width_m","travel_distance_m",
    "door_schedule","door_marks","door_width","door_height","door_type","exit_door_width_m","exit_door_height_m",
    "exit_door_opens_in_escape_direction","sprinkler_present","wet_riser_present","hose_reel_count","fire_lift_present","fire_alarm_present",
    "manual_call_point_count","smoke_detector_count","heat_detector_count","emergency_light_count","exit_sign_count","fire_extinguisher_count",
    "hydrant_present","public_hydrant_distance_m","fire_pump_present","generator_room_present","panel_room_present","electrical_room_present",
    "other_special_risk_rooms",
)
FAST_EXTRACTION_FIELDS=(
    "project_name",
    "building_use_text",
    "storey_count",
    "floor_names",
    "floor_areas",
    "total_floor_area_m2",
    "door_schedule",
    "window_schedule",
    "highest_storey_floor_level_m",
    "building_height_m",
    "visible_stair_count",
    "room_labels",
    "visible_fire_features",
)

MISSING_EVIDENCE_FIELD_MAP={
    "highest storey floor level":"highest_habitable_floor_level_m",
    "highest habitable storey level":"highest_habitable_floor_level_m",
    "habitable floor level":"highest_habitable_floor_level_m",
    "building height":"building_height_m",
    "confirmed exits or staircases":"confirmed_independent_exit_count",
    "confirmed exits":"confirmed_independent_exit_count",
    "confirmed staircases":"confirmed_stair_count",
    "stair width":"stair_clear_width_m",
    "escape arrangement":"escape_arrangement",
    "measured travel distance":"travel_distance_m",
    "validated route travel_distance_m":"travel_distance_m",
    "sprinkler condition":"sprinkler_system",
    "sprinkler evidence":"sprinkler_system",
    "wet rising main evidence":"hydrant_system",
    "hose reel evidence":"hose_reel_count",
    "fire alarm evidence":"alarm_system",
    "manual call point evidence/coverage":"manual_call_point_count",
    "fire lift evidence":"fire_lift_system",
    "public hydrant distance":"public_hydrant_distance_m",
}

class UserConfirmationPayload(BaseModel):
    project_schema: ProjectSchema
    confirmations: dict[str,str|int|float|bool|None] = Field(default_factory=dict)

class FireGuardBuildingData(BaseModel):
    project_name: str
    building_use: str
    purpose_group: str
    storey_count: int = Field(ge=1)
    highest_habitable_floor_level_m: float = Field(ge=0)
    building_height_m: float = Field(ge=0)
    total_floor_area_m2: float = Field(gt=0)
    independent_exit_count: int = Field(ge=0)
    escape_arrangement: str
    travel_distance_m: float = Field(ge=0)
    corridor_width_m: float = Field(gt=0)
    staircase_count: int = Field(ge=0)
    stair_width_m: float = Field(gt=0)
    protected_stair: bool

class FireGuardAssessmentPayload(BaseModel):
    building_data: FireGuardBuildingData
    model_result: ModelInferenceResult
    documents: list[Document] = Field(default_factory=list)

def _git_commit() -> str | None:
    cwd=os.getcwd()
    safe_cwd=cwd.replace("\\","/")
    try:
        result=subprocess.run(
            ["git","-c",f"safe.directory={safe_cwd}","rev-parse","--short","HEAD"],
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True,
            timeout=2,
        )
    except Exception:
        return None
    return result.stdout.strip() or None

def startup_diagnostics():
    diag=get_openai_config_diagnostics(settings)
    logger.info(
        "FireGuard OpenAI configuration: PLAN_READER=%s OPENAI_API_KEY=%s OPENAI_PLAN_MODEL=%s base_url_host=%s key_fingerprint=%s sdk=%s",
        diag["plan_reader"],
        "present" if diag["api_key_present"] else "missing",
        diag["model"],
        diag["base_url_host"],
        diag["api_key_fingerprint"],
        diag["sdk_version"],
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_diagnostics()
    yield

app=FastAPI(title="FireGuard API",version="0.1.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=settings.origins,allow_credentials=True,allow_methods=["GET","POST"],allow_headers=["*"])

@app.get("/health")
def health(): return {"status":"ok","app":"FireGuard","build":settings.fireguard_build_id}

@app.get("/api/fireguard/version")
def fireguard_version():
    return {
        "service":"FireGuard",
        "pipeline_version":PIPELINE_VERSION,
        "git_commit":_git_commit(),
        "working_directory":os.getcwd(),
        "openai_model":settings.openai_model,
        "plan_reader":settings.effective_plan_reader,
        "fast_mode":settings.fireguard_fast_mode,
        "request_timeout_seconds":settings.openai_request_timeout_seconds or (25 if settings.fireguard_fast_mode else settings.openai_plan_timeout_seconds),
        "analysis_timeout_seconds":settings.fireguard_fast_analysis_timeout_seconds if settings.fireguard_fast_mode else None,
        "max_detail_regions":1 if settings.fireguard_fast_mode else settings.openai_max_detail_regions,
        "detail_concurrency":1 if settings.fireguard_fast_mode else settings.openai_detail_concurrency,
        "critical_evidence_validation":True,
        "adaptive_plan_reader":True,
        "panel_mode":settings.fireguard_panel_mode,
    }

@app.get("/api/fireguard/ocr-health")
def ocr_health():
    return OCREngine(settings).diagnostics(initialize=True)

@app.get("/api/fireguard/openai-health")
def openai_health():
    diag=get_openai_config_diagnostics(settings)
    client_status="skipped"
    client_error=None
    if diag["api_key_present"]:
        try:
            make_openai_client(settings)
            client_status="ok"
        except Exception as exc:
            client_status="failed"
            client_error=exc.__class__.__name__
    preflight=run_openai_preflight(settings) if diag["api_key_present"] else {"api_access":"NOT_RUN","model_access":"NOT_RUN","responses_api":"NOT_RUN","error":None,"cached":False}
    return {
        "configured": diag["api_key_present"] and diag["plan_reader"] in {"openai","auto"},
        "key_present": diag["api_key_present"],
        "key_length": diag["api_key_length"],
        "key_fingerprint": diag["api_key_fingerprint"],
        "model": diag["model"],
        "plan_reader": diag["plan_reader"],
        "base_url_host": diag["base_url_host"],
        "organization_configured": diag["organization_configured"],
        "project_configured": diag["project_configured"],
        "sdk_version": diag["sdk_version"],
        "python_version": diag["python_version"],
        "client_initialization": client_status,
        "client_error": client_error,
        "api_access": preflight["api_access"],
        "model_access": preflight["model_access"],
        "responses_api": preflight["responses_api"],
        "preflight_cached": preflight["cached"],
        "error": preflight["error"],
    }

async def _analyze_drawings(files: list[UploadFile]):
    if settings.effective_plan_reader not in {"openai","local","auto"}:
        raise HTTPException(503,f"Unsupported PLAN_READER: {settings.plan_reader}")
    try:
        result=await DrawingUnderstandingService(settings).analyze_uploads(files)
    except DocumentError as exc:
        raise HTTPException(422,str(exc)) from exc
    return result.pages,result.documents,[x.model_dump(mode="json") for x in result.page_analysis],result.evidence_warnings,result.geometry_analysis,result.spatial_graph

async def _materialize_uploads(files: list[UploadFile]) -> list[UploadFile]:
    materialized=[]
    for file in files:
        data=await file.read()
        materialized.append(UploadFile(file=BytesIO(data),filename=file.filename,headers={"content-type":file.content_type or "application/octet-stream"}))
    return materialized

async def _documents_from_uploads(files: list[UploadFile] | None) -> list[Document]:
    documents=[]
    for file in files or []:
        data=await file.read()
        documents.append(Document(filename=file.filename or "upload",media_type=file.content_type or "application/octet-stream",page_count=1))
        file.file=BytesIO(data)
    return documents

async def _analyze_drawings_fast(files: list[UploadFile]):
    materialized=await _materialize_uploads(files)
    timeout=max(1,settings.fireguard_fast_analysis_timeout_seconds)
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(lambda: asyncio.run(_analyze_drawings(materialized))),
            timeout=timeout,
        )
    except TimeoutError:
        diagnostic="Automatic plan reading did not complete. Enter the required building information below to continue."
        logger.warning(
            "[FireGuard] live extraction timed out fast_mode=true timeout_triggered=true total_extraction_seconds=%.2f analysis_timeout_seconds=%s",
            float(timeout),
            timeout,
        )
        documents=[Document(filename=file.filename or "upload",media_type=file.content_type or "application/octet-stream",page_count=1) for file in materialized]
        geometry_analysis={
            "status":"UNKNOWN",
            "plan_reader":{
                "provider":"openai_fast",
                "status":"TIMEOUT",
                "openai_status":"TIMEOUT",
                "pages_interpreted":0,
                "overview_status":"TIMEOUT",
                "overview_pages":0,
                "tiles_analyzed":0,
                "semantic_regions_analyzed":0,
                "semantic_regions_requested":0,
                "semantic_regions_successful":0,
                "semantic_regions_failed":0,
                "primary_reader":"openai_fast",
                "primary_status":"TIMEOUT",
                "supplementary_ocr_used":False,
                "fallback_activated":False,
                "fallback_used":False,
                "native_pdf_text":"unknown",
                "local_ocr_fallback":False,
                "diagnostics":[diagnostic],
                "cache_hits":0,
                "fast_mode":True,
                "max_openai_calls":1,
                "timeout_triggered":True,
                "detail_skipped_due_to_budget":True,
            },
            "warnings":[diagnostic],
        }
        return [],documents,[],[diagnostic],geometry_analysis,{}

def _page_status(page_analysis: list[dict], key: str, confirmed: str) -> str:
    values=[page.get(key) for page in page_analysis]
    if any(value==confirmed for value in values):
        return confirmed
    return "UNKNOWN"

def _object_count_detail(name: str, count: int, segmentation_available: bool, label_kind: str | None = None, fire_plan_present: bool = False) -> dict:
    if segmentation_available:
        return {"count":count,"status":"DETERMINED","evidence_count":count,"reason":f"Configured geometry/object extraction covered {name}."}
    if count > 0:
        if name=="doors":
            return {"count":None,"status":"PARTIAL","evidence_count":count,"labels_detected":count,"reason":"Door schedule or label evidence was found, but physical door count is not confirmed without geometry/object detection."}
        if name=="fire_equipment" and not fire_plan_present:
            return {"count":None,"status":"UNKNOWN","evidence_count":count,"labels_detected":count,"reason":"Fire-equipment text evidence on an architectural plan does not confirm complete fire-equipment presence or count."}
        return {"count":None,"status":"PARTIAL","evidence_count":count,"labels_detected":count,"reason":f"{label_kind or name.title()} label evidence was found, but complete physical count is not confirmed without geometry/object detection."}
    return {"count":None,"status":"UNKNOWN","evidence_count":0,"reason":f"No reliable {name} detector result is available; absence is not confirmed."}

def _extraction_summary(project, pages: list, page_analysis: list[dict]) -> dict:
    segmentation=project.geometry_analysis.get("segmentation",{}) if isinstance(project.geometry_analysis,dict) else {}
    segmentation_available=bool(segmentation.get("available"))
    count_details={
        "doors":_object_count_detail("doors",len(project.doors),segmentation_available),
        "stairs":_object_count_detail("stairs",len(project.stairs),segmentation_available,"Stair"),
        "rooms":_object_count_detail("rooms",len(project.rooms),segmentation_available,"Room"),
        "fire_equipment":_object_count_detail("fire_equipment",len(project.fire_equipment),segmentation_available,fire_plan_present=project.fire_plan_present),
    }
    fire_feature_evidence_count=len(project.fire_features_detected)
    if count_details["fire_equipment"]["status"]=="UNKNOWN" and fire_feature_evidence_count:
        count_details["fire_equipment"]={
            "count":None,
            "status":"PARTIAL",
            "evidence_count":fire_feature_evidence_count,
            "labels_detected":len(project.fire_equipment),
            "reason":"Fire-safety feature evidence is present, but complete equipment quantity/coverage is not confirmed.",
        }
    statuses={detail["status"] for detail in count_details.values()}
    count_status="DETERMINED" if statuses=={"DETERMINED"} else "UNKNOWN" if statuses=={"UNKNOWN"} else "PARTIAL"
    for field, detail in count_details.items():
        logger.debug(
            "fireguard_trace function=_extraction_summary source_file=project field=%s extracted_value=%r evidence=%r status=%s",
            field,
            detail.get("count"),
            {"evidence_count":detail.get("evidence_count"),"labels_detected":detail.get("labels_detected"),"reason":detail.get("reason")},
            detail.get("status"),
        )
    logger.debug(
        "fireguard_trace function=_extraction_summary source_file=project field=object_counts_status extracted_value=%r evidence=%r status=%s",
        count_status,
        {key:value.get("status") for key,value in count_details.items()},
        count_status,
    )
    plan_reader=project.geometry_analysis.get("plan_reader",{}) if isinstance(project.geometry_analysis,dict) else {}
    metadata=project.extraction.get("metadata_evidence",{}) if isinstance(project.extraction,dict) else {}
    critical_statuses={key:metadata.get(key,{}).get("validation_status","UNKNOWN") for key in CRITICAL_FIELDS}
    physical_pages=sum(doc.page_count for doc in project.documents) if project.documents else len(page_analysis)
    door_schedule_status="EXTRACTED" if project.doors else "UNKNOWN"
    window_schedule_status="EXTRACTED" if project.windows else "UNKNOWN"
    return {
        "architectural_plan_present":project.architectural_plan_present,
        "architectural_plan_status":_page_status(page_analysis,"architectural_plan_status","CONFIRMED_ARCHITECTURAL"),
        "fire_plan_present":project.fire_plan_present,
        "fire_plan_status":_page_status(page_analysis,"fire_plan_status","CONFIRMED_FIRE_PLAN"),
        "fire_annotations_present":project.fire_annotations_present,
        "pages_analyzed":physical_pages,
        "evidence_pages":len(pages),
        "plan_reader":plan_reader,
        "plan_reader_provider":plan_reader.get("provider","local"),
        "plan_reader_status":plan_reader.get("status","UNKNOWN"),
        "openai_status":plan_reader.get("openai_status","UNKNOWN"),
        "pages_interpreted":plan_reader.get("pages_interpreted",0),
        "overview_status":plan_reader.get("overview_status","UNKNOWN"),
        "overview_pages":plan_reader.get("overview_pages",0),
        "tiles_analyzed":plan_reader.get("tiles_analyzed",0),
        "semantic_regions_analyzed":plan_reader.get("semantic_regions_analyzed",0),
        "semantic_regions_requested":plan_reader.get("semantic_regions_requested",plan_reader.get("semantic_regions_analyzed",0)),
        "semantic_regions_successful":plan_reader.get("semantic_regions_successful",plan_reader.get("semantic_regions_analyzed",0)),
        "semantic_regions_failed":plan_reader.get("semantic_regions_failed",0),
        "primary_reader":plan_reader.get("primary_reader",plan_reader.get("provider","local")),
        "primary_status":plan_reader.get("primary_status",plan_reader.get("openai_status","UNKNOWN")),
        "supplementary_ocr_used":plan_reader.get("supplementary_ocr_used",False),
        "fallback_activated":plan_reader.get("fallback_activated",False),
        "fallback_used":plan_reader.get("fallback_used",False),
        "critical_fields_extracted":sum(key in metadata for key in CRITICAL_FIELDS),
        "critical_fields_confirmed":sum(status in {"CONFIRMED","USER_CONFIRMED"} for status in critical_statuses.values()),
        "critical_fields_needs_verification":sum(status in {"EXTRACTED","PARTIAL","NEEDS_VERIFICATION"} for status in critical_statuses.values()),
        "critical_fields_unknown":sum(status=="UNKNOWN" for status in critical_statuses.values()),
        "native_pdf_text":plan_reader.get("native_pdf_text","unknown"),
        "local_ocr_fallback":plan_reader.get("local_ocr_fallback",False),
        "object_counts_status":count_status,
        "doors":count_details["doors"]["count"],
        "stairs":count_details["stairs"]["count"],
        "rooms":count_details["rooms"]["count"],
        "fire_equipment_items":count_details["fire_equipment"]["count"],
        "physical_door_count":count_details["doors"]["count"],
        "door_count_status":count_details["doors"]["status"],
        "doors_count_status":count_details["doors"]["status"],
        "door_schedule_entries":len(project.doors) if door_schedule_status=="EXTRACTED" else None,
        "door_schedule_status":door_schedule_status,
        "window_schedule_entries":len(project.windows) if window_schedule_status=="EXTRACTED" else None,
        "window_schedule_status":window_schedule_status,
        "stair_count":count_details["stairs"]["count"],
        "stair_count_status":count_details["stairs"]["status"],
        "stairs_count_status":count_details["stairs"]["status"],
        "stair_candidates":len(project.stairs),
        "room_count":count_details["rooms"]["count"],
        "room_count_status":count_details["rooms"]["status"],
        "rooms_count_status":count_details["rooms"]["status"],
        "room_labels_detected":len(project.rooms),
        "fire_equipment_count":count_details["fire_equipment"]["count"],
        "fire_equipment_count_status":count_details["fire_equipment"]["status"],
        "fire_feature_evidence_count":fire_feature_evidence_count,
        "object_count_details":count_details,
        "warnings":project.warnings,
    }

def _rule_presentation(status: RuleStatus) -> dict:
    return {
        RuleStatus.PASS: {"tone":"success","severity_label":"NONE","is_error":False,"label":"Pass"},
        RuleStatus.VIOLATION: {"tone":"error","severity_label":"ERROR","is_error":True,"label":"Violation"},
        RuleStatus.MANUAL_REVIEW: {"tone":"warning","severity_label":"REVIEW","is_error":False,"label":"Manual review"},
        RuleStatus.NOT_APPLICABLE: {"tone":"neutral","severity_label":"NONE","is_error":False,"label":"Not applicable"},
    }[status]

def _public_rule_dump(result):
    data=result.model_dump(mode="json")
    if result.status in {RuleStatus.PASS,RuleStatus.NOT_APPLICABLE}:
        data["recommendation"]=None
    if result.status in {RuleStatus.PASS,RuleStatus.NOT_APPLICABLE}:
        data["severity"]="NONE"
    elif result.status==RuleStatus.MANUAL_REVIEW:
        data["severity"]="REVIEW"
    data["presentation"]=_rule_presentation(result.status)
    data["is_error"]=data["presentation"]["is_error"]
    return data

def _extracted_evidence(project, extraction_summary: dict) -> dict:
    metadata=project.extraction.get("metadata_evidence",{}) if isinstance(project.extraction,dict) else {}
    count_details=extraction_summary.get("object_count_details",{})
    return {
        "metadata":metadata,
        "room_labels_detected":len(project.rooms),
        "door_schedule_entries":len(project.doors),
        "stair_labels_detected":len(project.stairs),
        "fire_equipment_labels_detected":len(project.fire_equipment),
        "fire_feature_evidence":project.fire_features_detected,
        "storey_evidence":project.extraction.get("storey_evidence",[]) if isinstance(project.extraction,dict) else [],
        "count_statuses":count_details,
    }

def _fields_needing_verification(project, manual_items: list[dict]) -> list[dict]:
    metadata=project.extraction.get("metadata_evidence",{}) if isinstance(project.extraction,dict) else {}
    required_fields=[]
    for item in manual_items:
        data=item if isinstance(item,dict) else item.model_dump(mode="json") if hasattr(item,"model_dump") else {}
        for evidence in data.get("missing_evidence",[]) or []:
            field=_verification_field_for(str(evidence))
            if field and field not in required_fields:
                required_fields.append(field)
    needs=[]
    for field in required_fields:
        status=metadata.get(field,{}).get("validation_status","UNKNOWN")
        if status in {"UNKNOWN","NEEDS_VERIFICATION","EXTRACTED","PARTIAL"}:
            needs.append({"field":field,"label":field.replace("_"," "),"status":status})
        elif field not in metadata:
            needs.append({"field":field,"label":field.replace("_"," "),"status":"UNKNOWN"})
    return needs[:12]

def _verification_field_for(text: str) -> str | None:
    normalized=text.strip().lower()
    for needle, field in MISSING_EVIDENCE_FIELD_MAP.items():
        if needle in normalized:
            return field
    if "riser" in normalized:
        return "hydrant_system"
    if "sprinkler" in normalized:
        return "sprinkler_system"
    if "alarm" in normalized:
        return "alarm_system"
    if "travel" in normalized:
        return "travel_distance_m"
    if "exit" in normalized and "door" not in normalized:
        return "confirmed_independent_exit_count"
    if "height" in normalized or "level" in normalized:
        return "highest_habitable_floor_level_m"
    return None

def _coerce_confirmation(value):
    if isinstance(value,str):
        text=value.strip()
        if text.lower() in {"yes","true"}:
            return True
        if text.lower() in {"no","false"}:
            return False
        if text.lower() in {"","unknown","null"}:
            return None
        try:
            return float(text) if "." in text else int(text)
        except ValueError:
            return text
    return value

def _apply_user_confirmations(project: ProjectSchema, confirmations: dict) -> ProjectSchema:
    updated=ProjectSchema.model_validate(project.model_dump(mode="json"))
    user_meta=updated.extraction.setdefault("user_confirmed_evidence",{})
    metadata=updated.extraction.setdefault("metadata_evidence",{})
    for field, raw in confirmations.items():
        value=_coerce_confirmation(raw)
        if value is None:
            continue
        if field in {"project_title","building_use_text","building_height_m","highest_habitable_floor_level_m","storey_count","total_building_area_m2","max_floor_area_per_storey_m2","designed_occupants"}:
            setattr(updated.building_info,field,value)
        elif field in {"confirmed_independent_exit_count","confirmed_stair_count","travel_distance_m","escape_arrangement","manual_call_points","public_hydrant_distance_m","stair_clear_width_m","corridor_width_m","protected_staircase"}:
            updated.project[field]=value
        elif field=="hose_reel_system":
            if value is True and not any(item.type=="hose_reel" for item in updated.fire_equipment):
                updated.fire_equipment.append(FireEquipment(type="hose_reel",source_file="user_review",source_page=1,evidence="User confirmed hose reels",confidence=1.0,count=None))
            elif value is False:
                updated.fire_equipment=[item for item in updated.fire_equipment if item.type!="hose_reel"]
        elif field=="hose_reel_count":
            existing=next((item for item in updated.fire_equipment if item.type=="hose_reel"),None)
            if existing:
                existing.count=int(value)
            else:
                updated.fire_equipment.append(FireEquipment(type="hose_reel",source_file="user_review",source_page=1,evidence="User confirmed hose reel count",confidence=1.0,count=int(value)))
        elif field in {"sprinkler_system","hydrant_system","alarm_system","fire_lift_system","fire_pump_system"}:
            setattr(updated,field,value)
        record={"value":value,"status":"USER_CONFIRMED","source":"user_review","validation_status":"USER_CONFIRMED"}
        user_meta[field]=record
        metadata.setdefault(field,{})
        metadata[field]={**metadata[field],"value":value,"validation_status":"USER_CONFIRMED","user_confirmed":record}
    classification=purpose_group_for_project(updated)
    updated.building_info.purpose_group_classification=classification
    updated.building_info.building_purpose_groups=[item["code"] for item in classification.get("purpose_groups",[])]
    if classification.get("status")=="CONFIRMED":
        updated.building_info.purpose_group=classification.get("purpose_group")
    return updated

def _assessment_response(project: ProjectSchema, results: list, *, source: str) -> dict:
    features,recommendations,manual=build_recommendations(results)
    counts={status.value.lower():sum(r.status==status for r in results) for status in RuleStatus}
    error_violation=any(r.status==RuleStatus.VIOLATION and r.severity==Severity.ERROR for r in results)
    overall="REQUIRES_REVISION" if error_violation else "REQUIRES_REVIEW" if manual else "COMPLIANT"
    rule_output=[_public_rule_dump(r) for r in results]
    return {
        "overall_status":overall,
        "source":source,
        "required_fire_features":features,
        "rule_summary":counts,
        "rules":rule_output,
        "rule_results":rule_output,
        "recommendations":recommendations,
        "manual_review_items":manual,
        "fields_needing_verification":_fields_needing_verification(project,manual),
        "project_summary":panel_project_summary(project),
        "normalized_project_schema":project.model_dump(mode="json"),
        "project_schema":project.model_dump(mode="json"),
    }

@app.post("/api/fireguard/panel/validated-demo")
async def panel_validated_demo():
    project=load_validated_demo_project()
    results=evaluate_project(project)
    features,recommendations,manual=build_recommendations(results)
    fields=_fields_needing_verification(project,manual)
    return panel_review_response(project,source="validated_demo",required_fields=fields,include_all_fields=False)

@app.post("/api/fireguard/panel/manual")
async def panel_manual(files:list[UploadFile]|None=File(default=None)):
    documents=await _documents_from_uploads(files)
    project=manual_project(documents)
    return panel_review_response(project,source="manual_assessment",required_fields=[],include_all_fields=True)

@app.post("/api/fireguard/model/analyze")
async def analyze_fireguard_model(files:list[UploadFile]=File(...), replay: bool=True):
    if not files:
        raise HTTPException(400,"At least one fire-safety plan is required")
    data=await files[0].read()
    service=FireGuardModelService()
    result=service.analyze(data,allow_replay=replay)
    return {"model_result":result.model_dump(mode="json"),"model_metrics":service.metrics()}

@app.post("/api/fireguard/assessment")
async def run_fireguard_assessment(payload: FireGuardAssessmentPayload):
    project=build_fireguard_project_schema(payload.building_data.model_dump(mode="json"),payload.model_result,payload.documents)
    # Compliance is evaluated separately by the deterministic ICTAD engine
    results=evaluate_project(project)
    response=_assessment_response(project,results,source="user_and_model_evidence")
    response["model_result"]=payload.model_result.model_dump(mode="json")
    return response

@app.post("/api/fireguard/analyze")
async def analyze(files:list[UploadFile]=File(...), experimental: bool=False):
    api_started=perf_counter()
    if not files: raise HTTPException(400,"At least one drawing is required")
    if settings.fireguard_panel_mode and not experimental:
        documents=await _documents_from_uploads(files)
        project=manual_project(documents)
        return panel_review_response(project,source="manual_assessment",required_fields=[],include_all_fields=True)
    stage_timings={}
    stage_started=perf_counter()
    if settings.fireguard_fast_mode:
        pages,documents,page_analysis,evidence_warnings,geometry_analysis,spatial_graph=await _analyze_drawings_fast(files)
    else:
        pages,documents,page_analysis,evidence_warnings,geometry_analysis,spatial_graph=await _analyze_drawings(files)
    stage_timings["preparing_plan_and_reading"]=round(perf_counter()-stage_started,3)
    stage_started=perf_counter()
    project=build_project(pages,documents,page_analysis,evidence_warnings,geometry_analysis,spatial_graph)
    stage_timings["project_schema"]=round(perf_counter()-stage_started,3)
    stage_started=perf_counter()
    results=evaluate_project(project)
    stage_timings["rule_engine"]=round(perf_counter()-stage_started,3)
    recommendations_started=perf_counter()
    features,recommendations,manual=build_recommendations(results)
    logger.info("[FireGuard] recommendation generation completed in %.2fs", perf_counter() - recommendations_started)
    travel_result=next((r for r in results if r.rule_id=="CH2-TRAVEL-DISTANCE-TABLE5"),None)
    travel_limit=(travel_result.source_evidence[0] if travel_result and travel_result.source_evidence else None)
    counts={status.value.lower():sum(r.status==status for r in results) for status in RuleStatus}
    error_violation=any(r.status==RuleStatus.VIOLATION and r.severity==Severity.ERROR for r in results)
    overall="REQUIRES_REVISION" if error_violation else "REQUIRES_REVIEW" if manual else "COMPLIANT"
    rule_output=[_public_rule_dump(r) for r in results]
    extraction_summary=_extraction_summary(project,pages,page_analysis)
    stage_timings["serialization"]=round(perf_counter()-api_started,3)
    requested_fields=FAST_EXTRACTION_FIELDS if settings.fireguard_fast_mode else RICH_EXTRACTION_FIELDS
    response={"overall_status":overall,"build":settings.fireguard_build_id,"analysis_stages":ANALYSIS_STAGES,"stage_timings":stage_timings,"fields_requested":len(requested_fields),"fields_needing_verification":_fields_needing_verification(project,manual),"project_summary":{"project_name":project.building_info.project_title,"building_use":project.building_info.building_use_text,"purpose_group":project.building_info.purpose_group,"purpose_group_classification":project.building_info.purpose_group_classification,"building_purpose_groups":project.building_info.building_purpose_groups,"storeys":project.building_info.storey_count,"storey_count_status":"DETERMINED" if project.building_info.storey_count is not None else "UNKNOWN","designed_occupants":project.building_info.designed_occupants,"height_m":project.building_info.building_height_m,"highest_habitable_floor_level_m":project.building_info.highest_habitable_floor_level_m,"floor_areas_m2":project.building_info.floor_areas_m2,"total_floor_area_m2":project.building_info.total_building_area_m2},"travel_distance_limit":travel_limit,"extraction_summary":extraction_summary,"extracted_evidence":_extracted_evidence(project,extraction_summary),"evidence_warnings":project.evidence_warnings,"conflicts":[c.model_dump(mode="json") for c in project.conflicts],"page_analysis":project.page_analysis,"geometry_analysis":project.geometry_analysis,"spatial_graph":project.spatial_graph,"required_fire_features":features,"rule_summary":counts,"rules":rule_output,"rule_results":rule_output,"recommendations":recommendations,"manual_review_items":manual,"normalized_project_schema":project.model_dump(mode="json"),"project_schema":project.model_dump(mode="json")}
    response["extraction_quality"]={key:extraction_summary[key] for key in ("plan_reader_provider","plan_reader_status","pages_interpreted","overview_status","overview_pages","tiles_analyzed","semantic_regions_analyzed","semantic_regions_requested","semantic_regions_successful","semantic_regions_failed","openai_status","primary_reader","primary_status","supplementary_ocr_used","fallback_activated","fallback_used","critical_fields_extracted","critical_fields_confirmed","critical_fields_needs_verification","critical_fields_unknown")}
    response["extraction_quality"]["model"]=settings.openai_plan_model or settings.openai_model
    response["extraction_quality"]["total_openai_calls"]=extraction_summary.get("plan_reader",{}).get("max_openai_calls") if settings.fireguard_fast_mode and extraction_summary.get("openai_status") in {"SUCCESS","PARTIAL_SUCCESS"} else 1+int(extraction_summary.get("semantic_regions_requested",0)) if extraction_summary.get("openai_status") in {"SUCCESS","PARTIAL_SUCCESS"} else 0
    response["extraction_quality"]["images_sent"]=extraction_summary.get("plan_reader",{}).get("images_sent")
    response["extraction_quality"]["fields_requested"]=len(requested_fields)
    response["extraction_quality"]["fields_extracted"]=extraction_summary["critical_fields_extracted"]+len(project.doors)+len(project.rooms)+len(project.stairs)+len(project.fire_features_detected)
    response["extraction_quality"]["openai_error"]=extraction_summary.get("plan_reader",{}).get("error")
    response["extraction_quality"]["pipeline_version"]=PIPELINE_VERSION
    if settings.fireguard_debug_extraction:
        response["debug_extraction"]={"metadata_evidence":project.extraction.get("metadata_evidence",{}),"storey_evidence":project.extraction.get("storey_evidence",[]),"room_evidence":[item.model_dump(mode="json") for item in project.rooms],"door_schedule_entries":[item.model_dump(mode="json") for item in project.doors],"physical_door_candidates":[],"stair_candidates":[item.model_dump(mode="json") for item in project.stairs],"fire_feature_evidence":project.fire_features_detected,"count_statuses":extraction_summary.get("object_count_details",{})}
    logger.info("[FireGuard] final API serialization completed in %.2fs", perf_counter() - api_started)
    return response

@app.post("/api/fireguard/review")
async def review_confirmations(payload: UserConfirmationPayload):
    project=_apply_user_confirmations(payload.project_schema,payload.confirmations)
    results=evaluate_project(project)
    return _assessment_response(project,results,source="user_review")
