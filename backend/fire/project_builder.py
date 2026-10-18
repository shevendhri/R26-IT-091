from typing import Any
import logging
from time import perf_counter
from .rules.applicability import purpose_group_for_project
from .schemas import Conflict, Document, PageExtraction, ProjectSchema

logger=logging.getLogger("fireguard")

SCALARS=("project_title","building_use_text","building_type","purpose_group","storey_count","building_height_m","highest_habitable_floor_level_m","designed_occupants","floor_areas_m2","total_building_area_m2","max_floor_area_per_storey_m2")
CRITICAL_RULE_FIELDS={"purpose_group","storey_count","building_height_m","highest_habitable_floor_level_m","total_building_area_m2","max_floor_area_per_storey_m2"}
HEIGHT_CONTEXT=("BUILDING HEIGHT","TOTAL HEIGHT","OVERALL HEIGHT","HEIGHT OF BUILDING","HIGHEST HABITABLE","ROOF","PARAPET","FFL","RL","FLOOR LEVEL","SECTION","ELEVATION")
SYSTEM_FEATURE_TYPES={
    "alarm_system":"FIRE_ALARM_PANEL",
    "sprinkler_system":"SPRINKLER",
    "hydrant_system":"LANDING_VALVE",
    "fire_pump_system":"FIRE_PUMP",
    "escape_route_lighting":"EMERGENCY_LIGHT",
    "exit_signage":"EXIT_SIGN",
    "fire_lift_system":"FIRE_LIFT",
}
EQUIPMENT_FEATURE_TYPES={
    "portable_fire_extinguisher":"FIRE_EXTINGUISHER",
    "hose_reel":"HOSE_REEL",
    "manual_call_point":"MANUAL_CALL_POINT",
    "detector":"SMOKE_DETECTOR",
    "escape_route_lighting":"EMERGENCY_LIGHT",
    "exit_signage":"EXIT_SIGN",
    "sprinkler":"SPRINKLER",
    "wet_riser":"WET_RISING_MAIN",
    "alarm_system":"FIRE_ALARM_PANEL",
}

def _key(item: Any) -> tuple:
    if item.__class__.__name__=="Door": return (item.mark,item.floor,item.width_m,item.height_mm)
    return (getattr(item,"type",None),getattr(item,"label",None),getattr(item,"floor",None),getattr(item,"source_file",None),getattr(item,"bbox",None).__str__())

def _provider_priority(provider: str) -> int:
    return {"openai":3,"pdf_native_text":2,"ocr_or_native_text":1}.get(provider,0)

def _critical_validation_status(field: str, value: Any, provider: str, evidence: str | None) -> str:
    if field not in CRITICAL_RULE_FIELDS:
        return "CONFIRMED"
    if isinstance(evidence, dict):
        return evidence.get("validation_status") or "UNKNOWN"
    if provider=="openai":
        return "CONFIRMED"
    if field in {"building_height_m","highest_habitable_floor_level_m"}:
        text=(evidence or "").upper()
        return "CONFIRMED" if any(token in text for token in HEIGHT_CONTEXT) else "UNKNOWN"
    if value is None:
        return "UNKNOWN"
    return "CONFIRMED"

def build_project(
    pages: list[PageExtraction],
    documents: list[Document],
    page_analysis: list[dict] | None = None,
    evidence_warnings: list[str] | None = None,
    geometry_analysis: dict | None = None,
    spatial_graph: dict | None = None,
) -> ProjectSchema:
    started = perf_counter()
    project=ProjectSchema(documents=documents)
    confidence: dict[str,tuple[int,float]]={}
    metadata_evidence: dict[str,dict]= {}
    seen: dict[str,set[tuple]]={name:set() for name in ("rooms","doors","windows","stairs","escape_routes","fire_equipment","special_risk_rooms")}
    for page in pages:
        if page.classification.value in ("ARCHITECTURAL","COMBINED"): project.architectural_plan_present=True
        if page.classification.value=="FIRE": project.fire_plan_present=True
        if page.classification.value=="COMBINED": project.fire_annotations_present=True
        project.warnings.extend(page.warnings)
        for field in SCALARS:
            value=getattr(page.building_info,field)
            if value is None: continue
            current=getattr(project.building_info,field)
            score=max([getattr(x,"confidence",0) for group in (page.rooms,page.doors,page.fire_equipment) for x in group] or [0.5])
            provider=page.extraction_provider or ("openai" if any(getattr(item,"data",{}).get("provider")=="openai" for item in [*page.rooms,*page.stairs,*page.escape_routes]) else "ocr_or_native_text")
            rank=(_provider_priority(provider),score)
            if current is not None and current != value:
                project.conflicts.append(Conflict(field=f"building_info.{field}",values=[current,value],sources=["prior extraction",f"{page.source_file}:p{page.source_page}"],message="Credible sources disagree; higher-confidence value retained"))
            if current is None or rank > confidence.get(field,(-1,-1)):
                evidence=page.building_info.critical_evidence.get(field,str(value))
                validation_status=_critical_validation_status(field,value,provider,evidence)
                setattr(project.building_info,field,value if validation_status=="CONFIRMED" else None); confidence[field]=rank
                metadata_evidence[field]={
                    "value":evidence.get("value",value) if isinstance(evidence,dict) else value,
                    "confidence":evidence.get("confidence",score) if isinstance(evidence,dict) else score,
                    "source":evidence.get("source",provider) if isinstance(evidence,dict) else provider,
                    "page":evidence.get("source_page",page.source_page) if isinstance(evidence,dict) else page.source_page,
                    "source_file":page.source_file,
                    "evidence":evidence.get("evidence") if isinstance(evidence,dict) else evidence,
                    "validation_status":validation_status,
                }
                if field in {"project_title","storey_count"}:
                    logger.debug(
                        "fireguard_trace function=build_project source_file=%s field=%s extracted_value=%r evidence=%r status=SELECTED",
                        page.source_file,
                        field,
                        value,
                        metadata_evidence[field],
                    )
        for field in seen:
            for item in getattr(page,field):
                key=_key(item)
                if key in seen[field]: continue
                seen[field].add(key); getattr(project,field).append(item)
        for system,value in page.systems.items():
            if system in {"alarm_system","sprinkler_system","hydrant_system","fire_pump_system","escape_route_lighting","exit_signage","fire_lift_system"} and value is not None:
                old=getattr(project,system)
                if old is not None and old != value: project.conflicts.append(Conflict(field=system,values=[old,value],sources=["multiple drawing pages"],message="System presence evidence conflicts"))
                else: setattr(project,system,value)
                logger.debug(
                    "fireguard_trace function=build_project source_file=%s field=%s extracted_value=%r evidence=%r status=SELECTED",
                    page.source_file,
                    system,
                    value,
                    {"page":page.source_page,"source_file":page.source_file,"source":"systems"},
                )
                project.fire_features_detected.append({
                    "feature_type":SYSTEM_FEATURE_TYPES.get(system,system.upper()),
                    "feature":system,
                    "presence":"CONFIRMED_PRESENT" if value is True else "UNKNOWN",
                    "quantity":None,
                    "quantity_status":"UNKNOWN",
                    "source":"ocr_or_native_text",
                    "page":page.source_page,
                    "source_file":page.source_file,
                    "bbox":None,
                    "raw_evidence":system,
                    "confidence":0.7,
                })
        for item in page.fire_equipment:
            project.fire_features_detected.append({
                "feature_type":EQUIPMENT_FEATURE_TYPES.get(item.type,item.type.upper()),
                "feature":item.type,
                "presence":"CONFIRMED_PRESENT",
                "quantity":item.count,
                "quantity_status":"KNOWN" if item.count is not None else "UNKNOWN",
                "source":"ocr_or_native_text",
                "page":item.source_page,
                "source_file":item.source_file,
                "bbox":item.bbox.model_dump(mode="json") if item.bbox else None,
                "raw_evidence":item.evidence,
                "confidence":item.confidence,
            })
    storey_evidence=[region for page in (page_analysis or []) for region in page.get("sheet_regions",[]) if region.get("type")=="FLOOR_PLAN"]
    project.extraction={"page_count":len(pages),"architectural_plan_present":project.architectural_plan_present,"fire_plan_present":project.fire_plan_present,"fire_annotations_present":project.fire_annotations_present,"metadata_evidence":metadata_evidence,"storey_evidence":storey_evidence,"fire_feature_evidence":project.fire_features_detected}
    project.page_analysis=page_analysis or []
    project.evidence_warnings=evidence_warnings or []
    project.geometry_analysis=geometry_analysis or {}
    project.spatial_graph=spatial_graph or {}
    classification_started = perf_counter()
    classification=purpose_group_for_project(project)
    logger.info("[FireGuard] purpose-group classification completed in %.2fs", perf_counter() - classification_started)
    project.building_info.purpose_group_classification=classification
    project.building_info.building_purpose_groups=[item["code"] for item in classification.get("purpose_groups",[])]
    if classification.get("status")=="CONFIRMED" and not project.building_info.purpose_group:
        project.building_info.purpose_group=classification.get("purpose_group")
    validated = ProjectSchema.model_validate(project.model_dump())
    logger.info("[FireGuard] project_schema validation completed in %.2fs", perf_counter() - started)
    return validated
