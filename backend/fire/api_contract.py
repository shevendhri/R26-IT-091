"""Public FireGuard plan-analysis and assessment API."""
from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from io import BytesIO
from typing import Literal

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field, field_validator

from .config import get_settings
from .drawing_understanding.input_inspector import inspect_upload
from .pdf_utils import DocumentError, normalize_image, render_pdf
from .ml.model_service import FireGuardModelService
from .rules import evaluate_project
from .schemas import BBox, BuildingInfo, Door, FireEquipment, ProjectSchema

router = APIRouter(prefix="/api/fireguard", tags=["FireGuardAI"])
logger = logging.getLogger("fireguard.api_contract")

# Product configuration approved for the FireGuard fixed-count assessment.
# These rows are intentionally kept separate from ICTAD/UDA regulation rules:
# they are a deterministic plan-profile check, applied once per declared storey.
FIXED_FIRE_ITEM_COUNTS = {
    "emergency_exit": (2, "Emergency exits"),
    "exit_sign": (2, "Exit signs"),
    "fire_hose_reel": (1, "Hydraulic hose reels"),
    "manual_call_point": (2, "Manual call points"),
    "fire_extinguisher": (2, "Portable fire extinguishers"),
    "smoke_detector": (2, "Smoke detectors"),
    "emergency_lighting": (2, "Emergency lights"),
}

class ProjectInput(BaseModel):
    project_name: str = Field(min_length=1)
    building_use: str = Field(min_length=1)
    purpose_group: str | None = None
    storeys: int = Field(ge=1)
    building_height_m: float = Field(ge=0)
    building_area_m2: float = Field(gt=0)
    max_floor_area_per_storey_m2: float | None = Field(default=None, gt=0)
    number_of_exits: int | None = Field(default=None, ge=0)
    number_of_staircases: int | None = Field(default=None, ge=0)
    travel_distance_m: float | None = Field(default=None, ge=0)
    corridor_width_m: float | None = Field(default=None, gt=0)
    stair_width_m: float | None = Field(default=None, gt=0)
    protected_stair: bool | None = None
    highest_habitable_floor_level_m: float | None = Field(default=None, ge=0)
    escape_arrangement: Literal["ONE_WAY", "TWO_WAY", "one_way", "two_way"] | None = "TWO_WAY"
    sprinkler_protected: bool | None = None
    largest_room_occupant_load: int | None = Field(default=None, ge=0)
    exit_door_swing_outward: bool | None = None
    minimum_exit_door_clear_width_m: float | None = Field(default=None, gt=0)
    minimum_exit_door_clear_height_m: float | None = Field(default=None, gt=0)
    exit_lighting_confirmed: bool | None = None
    exit_signs_confirmed: bool | None = None
    fire_alarm_system_confirmed: bool | None = None
    manual_call_points_confirmed: bool | None = None
    external_hydrants_confirmed: bool | None = None
    relevant_plan_set_complete: bool | None = None

    @field_validator("purpose_group", mode="before")
    @classmethod
    def blank_group(cls, value): return None if isinstance(value, str) and not value.strip() else value

    @field_validator("storeys", "number_of_exits", "number_of_staircases", "largest_room_occupant_load", mode="before")
    @classmethod
    def integer_counts(cls, value):
        if value is None: return value
        if isinstance(value, bool) or not isinstance(value, int): raise ValueError("This count must be a nonnegative integer.")
        return value

    @field_validator("protected_stair", "sprinkler_protected", "exit_door_swing_outward", "exit_lighting_confirmed", "exit_signs_confirmed", "fire_alarm_system_confirmed", "manual_call_points_confirmed", "external_hydrants_confirmed", "relevant_plan_set_complete", mode="before")
    @classmethod
    def tristate(cls, value):
        if isinstance(value, str):
            value = value.strip().lower()
            if value in {"", "unknown", "null"}: return None
            if value in {"yes", "true"}: return True
            if value in {"no", "false"}: return False
        return value

class EvidenceItem(BaseModel):
    item_type: Literal["emergency_exit", "exit_sign", "exit_door", "escape_direction_arrow", "staircase", "fire_extinguisher", "smoke_detector", "heat_detector", "manual_call_point", "fire_alarm_control_panel", "hydrant", "fire_hose_reel", "sprinkler_symbol", "emergency_lighting", "unclear_area"]
    count: int | None = Field(default=None, ge=0)
    confidence: Literal["high", "medium", "low"]
    evidence_description: str = Field(min_length=1)
    source_page: int | None = Field(default=None, ge=1)
    floor: str | None = None
    bbox: BBox | None = None
    detection_status: Literal["DETECTED", "UNCLEAR"] = "DETECTED"
    needs_manual_review: bool = False
    source: Literal["user", "vision_api", "manual_review"] = "vision_api"
    @field_validator("count", mode="before")
    @classmethod
    def integer_count(cls, value):
        if value is None: return value
        if isinstance(value, bool) or not isinstance(value, int): raise ValueError("Count must be a nonnegative integer.")
        return value

class AssessmentRequest(BaseModel):
    project: ProjectInput
    evidence: list[EvidenceItem] = Field(default_factory=list)

def _manual(description, page=None):
    return EvidenceItem(item_type="unclear_area", confidence="low", evidence_description=description, source_page=page, detection_status="UNCLEAR", needs_manual_review=True, source="manual_review")


def _normalise_extracted_item(item: dict, source_page: int | None) -> EvidenceItem | None:
    """Accept normal vision-model labels without allowing one bad item to drop all evidence."""
    raw_type = str(item.get("item_type", "")).strip().lower()
    normalized_type = raw_type.replace("-", " ").replace("/", " ")
    normalized_type = "_".join(normalized_type.split())
    aliases = {
        "fire_exit": "emergency_exit", "emergency_exit_sign": "exit_sign",
        "emergency_exit": "emergency_exit", "exit_signage": "exit_sign",
        "fire_extinguisher": "fire_extinguisher", "fire_hose_reel": "fire_hose_reel",
        "hose_reel": "fire_hose_reel", "manual_callpoint": "manual_call_point",
        "fire_alarm_panel": "fire_alarm_control_panel", "emergency_light": "emergency_lighting",
    }
    item_type = aliases.get(normalized_type, normalized_type)
    if item_type not in EvidenceItem.model_fields["item_type"].annotation.__args__:
        logger.warning("Ignoring unsupported fire-plan evidence label: %s", raw_type)
        return None
    candidate = dict(item)
    candidate["item_type"] = item_type
    candidate["source_page"] = candidate.get("source_page") or source_page
    candidate["source"] = "vision_api"
    confidence = candidate.get("confidence", "medium")
    if isinstance(confidence, (int, float)):
        candidate["confidence"] = "high" if confidence >= 0.75 else "medium" if confidence >= 0.45 else "low"
    elif str(confidence).strip().lower() not in {"high", "medium", "low"}:
        candidate["confidence"] = "medium"
    # The public API accepts normalized {x,y,width,height} coordinates.  The
    # model may return pixel rectangles; omit those rather than rejecting the
    # otherwise valid detected count.
    if not isinstance(candidate.get("bbox"), dict):
        candidate.pop("bbox", None)
    candidate.setdefault("detection_status", "DETECTED")
    candidate.setdefault("needs_manual_review", False)
    try:
        return EvidenceItem.model_validate(candidate)
    except Exception as exc:
        logger.warning("Ignoring invalid fire-plan evidence item: %s", exc)
        return None


def _extract_with_openai(image: bytes, source_page: int | None = None) -> list[EvidenceItem]:
    settings = get_settings()
    if not settings.openai_api_key:
        return []
    try:
        from openai import OpenAI
        prompt = "Return JSON array of detected fire-plan evidence. Fields: item_type,count,confidence,evidence_description,bbox,floor,needs_manual_review,source. floor must be the explicit plan floor. Never count a legend, key, schedule, notes, or title block as installed equipment."
        data_url = "data:image/png;base64," + base64.b64encode(image).decode("ascii")
        raw = OpenAI(api_key=settings.openai_api_key).responses.create(model=settings.openai_model, input=[{"role":"user","content":[{"type":"input_text","text":prompt},{"type":"input_image","image_url":data_url}]}]).output_text
        parsed = json.loads(raw.removeprefix("```json").removesuffix("```").strip())
        if isinstance(parsed, dict): parsed = parsed.get("evidence", [])
        if not isinstance(parsed, list):
            return []
        return [normalized for item in parsed if isinstance(item, dict) if (normalized := _normalise_extracted_item(item, source_page))]
    except Exception:
        logger.exception("OpenAI fire-plan extraction failed for page %s", source_page)
        return []


def _extract_with_local_model(image: bytes, source_page: int | None = None) -> list[EvidenceItem]:
    """Use the local detector only as a real fallback; never replay demo evidence."""
    type_map = {
        "fire_exit": "emergency_exit", "emergency_exit_sign": "exit_sign",
        "fire_extinguisher": "fire_extinguisher", "smoke_detector": "smoke_detector",
        "hydrant": "hydrant", "hose_reel": "fire_hose_reel",
    }
    try:
        from PIL import Image
        result = FireGuardModelService().analyze(Image.open(BytesIO(image)).convert("RGB"), allow_replay=False)
        if result.inference_mode != "LIVE":
            return []
        counts = {}
        for detection in result.detections:
            item_type = type_map.get(detection.class_name)
            if item_type:
                counts[item_type] = counts.get(item_type, 0) + 1
        return [EvidenceItem(
            item_type=item_type, count=count, confidence="medium",
            evidence_description=f"Local detector identified {count} {item_type.replace('_', ' ')} symbol(s).",
            source_page=source_page, source="vision_api",
        ) for item_type, count in counts.items()]
    except Exception:
        logger.exception("Local fire-plan detector failed for page %s", source_page)
        return []

def _to_project(request: AssessmentRequest) -> ProjectSchema:
    p = request.project
    canonical = {"exit_sign":"EXIT_SIGN", "escape_direction_arrow":"ESCAPE_DIRECTION_ARROW", "staircase":"STAIRCASE", "fire_hose_reel":"HOSE_REEL", "manual_call_point":"MANUAL_CALL_POINT", "fire_extinguisher":"FIRE_EXTINGUISHER", "smoke_detector":"SMOKE_DETECTOR", "heat_detector":"HEAT_DETECTOR", "fire_alarm_control_panel":"FIRE_ALARM_PANEL", "emergency_exit":"EXIT_ROUTE", "exit_door":"EXIT_DOOR", "hydrant":"HYDRANT", "sprinkler_symbol":"SPRINKLER", "emergency_lighting":"EMERGENCY_LIGHT"}
    equipment_types = {"fire_hose_reel":"hose_reel", "fire_extinguisher":"fire_extinguisher", "hydrant":"hydrant"}
    evidence=[]; seen=set()
    for item in request.evidence:
        raw=item.model_dump(); feature=canonical.get(item.item_type, item.item_type.upper()); key=(feature,item.floor,item.source_page,repr(raw.get("bbox")),item.evidence_description)
        if key in seen: continue
        seen.add(key); evidence.append({**raw,"feature_type":feature,"feature":item.item_type,"presence":"INDICATED_ON_PLAN","verification_state":"UNVERIFIED_PLAN_INDICATION","quantity_status":"KNOWN" if item.count is not None else "UNKNOWN"})
    equipment=[FireEquipment(type=equipment_types[item.item_type],floor=item.floor,count=item.count,source_file=item.source,source_page=item.source_page or 1,evidence=item.evidence_description,confidence=1.0) for item in request.evidence if item.source=="user" and item.item_type in equipment_types]
    project=ProjectSchema(project={"confirmed_independent_exit_count":p.number_of_exits,"confirmed_stair_count":p.number_of_staircases,"travel_distance_m":p.travel_distance_m,"corridor_width_m":p.corridor_width_m,"stair_clear_width_m":p.stair_width_m,"protected_staircase":p.protected_stair,"escape_arrangement":p.escape_arrangement,"manual_call_points":p.manual_call_points_confirmed,"relevant_plan_set_complete":p.relevant_plan_set_complete,"vision_evidence":evidence},building_info=BuildingInfo(project_title=p.project_name,building_use_text=p.building_use,purpose_group=p.purpose_group,storey_count=p.storeys,floor_names=[f"Floor {n}" for n in range(1,p.storeys+1)],building_height_m=p.building_height_m,highest_habitable_floor_level_m=p.highest_habitable_floor_level_m,total_building_area_m2=p.building_area_m2,max_floor_area_per_storey_m2=p.max_floor_area_per_storey_m2),fire_equipment=equipment,sprinkler_system=p.sprinkler_protected,alarm_system=p.fire_alarm_system_confirmed,hydrant_system=p.external_hydrants_confirmed,escape_route_lighting=p.exit_lighting_confirmed,exit_signage=p.exit_signs_confirmed)
    project.fire_features_detected=evidence; project.extraction["fire_feature_evidence"]=evidence
    return project

def _rule_trace(result, project):
    data=dict(result); consumed=data.get("source_evidence") or data.get("evidence") or []
    feature_map={"CH2-EXIT-SIGNAGE":{"EXIT_SIGN","ESCAPE_DIRECTION_ARROW"},"CH4-HOSE-REEL":{"HOSE_REEL"},"CH4-MANUAL-CALL-POINTS":{"MANUAL_CALL_POINT"},"CH4-PORTABLE-EXTINGUISHERS":{"FIRE_EXTINGUISHER"}}
    observed=[x for x in project.fire_features_detected if x.get("feature_type") in feature_map.get(data.get("rule_id"),set()) and "legend" not in str(x.get("evidence_description") or "").lower()]
    if data.get("location"): observed=[x for x in observed if x.get("floor")==data["location"]]
    indicated=[*consumed,*[x for x in observed if x not in consumed]]
    if observed and data.get("actual") is None:
        parts=[f"{x.get('count')} {x.get('feature','feature').replace('_',' ')} indicated on {x.get('floor') or 'the uploaded plan'}" for x in observed if x.get("count") is not None]
        if parts: data["actual"]="; ".join(parts)
    return {**data,"ai_plan_evidence":indicated,"evidence_consumed":indicated,"actual_value":data.get("actual"),"evaluated_requirement":data.get("required")}


def _fixed_count_profile_results(payload: AssessmentRequest) -> list[dict]:
    """Return one deterministic pass/violation row per configured item type."""
    rows = []
    for item_type, (per_storey, label) in FIXED_FIRE_ITEM_COUNTS.items():
        required = per_storey * payload.project.storeys
        detected = [
            item for item in payload.evidence
            if item.item_type == item_type and item.detection_status == "DETECTED"
        ]
        actual = sum(item.count or 0 for item in detected)
        # The configured profile is intentionally a direct count comparison:
        # matching counts pass and every non-matching count is a violation.
        # Extraction itself fails before assessment, so a zero here means no
        # symbol of this type was detected on the uploaded plan.
        passed = actual == required
        status = "PASS" if passed else "VIOLATION"
        reason = f"Plan evidence shows {actual}; the configured requirement is {required}."
        rows.append({
            "rule_id": f"FG-FIXED-COUNT-{item_type.upper()}",
            "chapter": 0,
            "description": label,
            "title": f"{label} count",
            "regulation": "Configured fire-plan profile",
            "severity": "WARNING" if passed else "ERROR",
            "status": status,
            "applicable": True,
            "actual": actual,
            "required": required,
            "location": f"Building ({payload.project.storeys} storey{'s' if payload.project.storeys != 1 else ''})",
            "missing_evidence": [],
            "source_evidence": [item.model_dump() for item in detected],
            "evidence": [item.model_dump() for item in detected],
            "decision_reason": reason,
            "recommendation": None if passed else f"Provide or correct {label.lower()} to reach {required}.",
            "ai_plan_evidence": [item.model_dump() for item in detected],
            "evidence_consumed": [item.model_dump() for item in detected],
            "actual_value": actual,
            "evaluated_requirement": required,
        })
    return rows

@router.get("/health")
def health(): return {"status":"ok","app":"FireGuardAI","vision_configured":bool(get_settings().openai_api_key)}

@router.post("/analyze-plan")
async def analyze_plan(file: UploadFile=File(...)):
    upload=await inspect_upload(file,get_settings())
    try: pages=[(x.png_bytes,x.page_number) for x in render_pdf(upload.data,dpi=get_settings().pdf_dpi)] if upload.suffix==".pdf" else [(normalize_image(upload.data).png_bytes,1)]
    except DocumentError as exc: raise HTTPException(400,"The plan could not be converted to an image.") from exc
    evidence=[]
    for image, page in pages:
        page_evidence = _extract_with_openai(image, page)
        evidence.extend(page_evidence or _extract_with_local_model(image, page))
    if not evidence:
        raise HTTPException(
            422,
            "No fire-safety symbols could be read from this plan. Check the API/model configuration or upload a clearer plan; no count assessment was created.",
        )
    return {"evidence":[x.model_dump() for x in evidence],"manual_review_required":any(x.needs_manual_review for x in evidence)}

@router.post("/assessment")
def assessment(payload: AssessmentRequest, request: Request):
    trace_id=request.headers.get("X-FireGuard-Trace-ID") or uuid.uuid4().hex[:12]; project=_to_project(payload); project.project["trace_id"]=trace_id
    results=evaluate_project(project); rules=[_rule_trace(x.model_dump(mode="json"),project) for x in results]
    rules.extend(_fixed_count_profile_results(payload))
    violations=[x for x in rules if x["status"]=="VIOLATION"]; review=[x for x in rules if x["status"]=="MANUAL_REVIEW"]
    status="Requires Revision" if violations else "Requires Review" if review else "Compliant"
    return {"status":status,"final_status":status,"trace_id":trace_id,"violations":violations,"manual_review_items":review,"evidence":[x.model_dump() for x in payload.evidence],"applied_rules":rules,"normalized_project_schema":project.model_dump(mode="json")}
