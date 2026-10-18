import json
from pathlib import Path
from typing import Any

from .rules.applicability import purpose_group_for_project
from .schemas import BuildingInfo, Document, ProjectSchema
from .scripts.complete_real_plan import build_project_from_complete_fixture

FIXTURE_PATH = Path(__file__).resolve().parent / "tests" / "fixtures" / "20260509181148921_complete_extraction.json"

PANEL_REVIEW_GROUPS = [
    {
        "title": "Project Information",
        "fields": [
            {"field": "project_title", "label": "Project", "type": "text"},
            {"field": "building_use_text", "label": "Building use", "type": "text"},
        ],
    },
    {
        "title": "Building Information",
        "fields": [
            {"field": "storey_count", "label": "Storey count", "type": "number"},
            {"field": "total_building_area_m2", "label": "Total floor area", "type": "number", "unit": "m2"},
            {"field": "highest_habitable_floor_level_m", "label": "Highest habitable floor level", "type": "number", "unit": "m"},
            {"field": "building_height_m", "label": "Building height", "type": "number", "unit": "m"},
            {"field": "designed_occupants", "label": "Designed occupants", "type": "number"},
        ],
    },
    {
        "title": "Means of Escape",
        "fields": [
            {"field": "confirmed_independent_exit_count", "label": "Independent exits", "type": "number"},
            {"field": "confirmed_stair_count", "label": "Confirmed staircases", "type": "number"},
            {"field": "stair_clear_width_m", "label": "Stair clear width", "type": "number", "unit": "m"},
            {"field": "protected_staircase", "label": "Protected staircase", "type": "boolean"},
            {"field": "escape_arrangement", "label": "Escape arrangement", "type": "select", "options": ["one_way", "two_way"]},
            {"field": "travel_distance_m", "label": "Maximum travel distance", "type": "number", "unit": "m"},
            {"field": "corridor_width_m", "label": "Corridor width", "type": "number", "unit": "m"},
        ],
    },
    {
        "title": "Fire Protection",
        "fields": [
            {"field": "sprinkler_system", "label": "Sprinkler system", "type": "boolean"},
            {"field": "hydrant_system", "label": "Wet rising main", "type": "boolean"},
            {"field": "hose_reel_system", "label": "Hose reels", "type": "boolean"},
            {"field": "hose_reel_count", "label": "Hose reel count", "type": "number"},
            {"field": "alarm_system", "label": "Fire alarm", "type": "boolean"},
            {"field": "manual_call_points", "label": "Manual call points", "type": "boolean"},
            {"field": "fire_lift_system", "label": "Fire lift", "type": "boolean"},
            {"field": "public_hydrant_distance_m", "label": "Public hydrant distance", "type": "number", "unit": "m"},
        ],
    },
]

BUILDING_FIELDS = {
    "project_title",
    "building_use_text",
    "storey_count",
    "total_building_area_m2",
    "highest_habitable_floor_level_m",
    "building_height_m",
    "designed_occupants",
}

SYSTEM_FIELDS = {"sprinkler_system", "hydrant_system", "alarm_system", "fire_lift_system"}


def load_validated_demo_project() -> ProjectSchema:
    payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    project, _, _ = build_project_from_complete_fixture(payload)
    schema = ProjectSchema.model_validate(project)
    schema.extraction["panel_mode"] = {
        "dataset": "Validated Demonstration Dataset",
        "message": "Previously validated drawing evidence is being used for this demonstration. ICTAD compliance evaluation is executed live by FireGuard.",
    }
    return schema


def manual_project(documents: list[Document]) -> ProjectSchema:
    project = ProjectSchema(documents=documents)
    project.extraction["panel_mode"] = {"dataset": "Manual / Assisted Assessment"}
    return project


def project_summary(project: ProjectSchema) -> dict[str, Any]:
    classification = purpose_group_for_project(project)
    return {
        "project_name": project.building_info.project_title,
        "building_use": project.building_info.building_use_text,
        "purpose_group": classification.get("purpose_group"),
        "purpose_group_classification": classification,
        "building_purpose_groups": [item["code"] for item in classification.get("purpose_groups", [])],
        "storeys": project.building_info.storey_count,
        "storey_count_status": "DETERMINED" if project.building_info.storey_count is not None else "UNKNOWN",
        "designed_occupants": project.building_info.designed_occupants,
        "height_m": project.building_info.building_height_m,
        "highest_habitable_floor_level_m": project.building_info.highest_habitable_floor_level_m,
        "floor_areas_m2": project.building_info.floor_areas_m2,
        "total_floor_area_m2": project.building_info.total_building_area_m2,
    }


def field_value(project: ProjectSchema, field: str) -> Any:
    if field in BUILDING_FIELDS:
        return getattr(project.building_info, field)
    if field in SYSTEM_FIELDS:
        return getattr(project, field)
    if field == "hose_reel_system":
        return any(item.type == "hose_reel" for item in project.fire_equipment) or None
    if field == "hose_reel_count":
        return next((item.count for item in project.fire_equipment if item.type == "hose_reel" and item.count is not None), None)
    return project.project.get(field)


def panel_review_groups(project: ProjectSchema, required_fields: list[dict] | None = None, *, include_all: bool) -> list[dict]:
    required = {item["field"] for item in required_fields or [] if isinstance(item, dict) and item.get("field")}
    required.update({"project_title", "building_use_text"})
    groups = []
    for group in PANEL_REVIEW_GROUPS:
        fields = []
        for spec in group["fields"]:
            value = field_value(project, spec["field"])
            if not include_all and spec["field"] not in required and value is None:
                continue
            fields.append({**spec, "value": value, "status": "Verified" if value is not None else "Needs input"})
        if fields:
            groups.append({"title": group["title"], "fields": fields})
    return groups


def panel_review_response(project: ProjectSchema, *, source: str, required_fields: list[dict] | None = None, include_all_fields: bool = False) -> dict:
    summary = project_summary(project)
    return {
        "overall_status": "AWAITING_USER_INPUT",
        "source": source,
        "panel_mode": True,
        "review_screen_payload": True,
        "project_summary": summary,
        "fields_needing_verification": required_fields or [],
        "panel_review_groups": panel_review_groups(project, required_fields, include_all=include_all_fields),
        "analysis_mode": project.extraction.get("panel_mode", {}),
        "extraction_summary": {
            "plan_reader_provider": "validated_fixture" if source == "validated_demo" else "manual_panel",
            "plan_reader_status": "NOT_RUN",
            "openai_status": "NOT_RUN",
            "openai_called": False,
            "pages_analyzed": sum(doc.page_count for doc in project.documents) if project.documents else 0,
            "door_schedule_entries": len(project.doors) if project.doors else None,
            "door_schedule_status": "EXTRACTED" if project.doors else "UNKNOWN",
            "window_schedule_entries": len(project.windows) if project.windows else None,
            "window_schedule_status": "EXTRACTED" if project.windows else "UNKNOWN",
        },
        "extracted_evidence": {
            "metadata": project.extraction.get("metadata_evidence", {}),
            "room_labels_detected": len(project.rooms),
            "door_schedule_entries": len(project.doors) if project.doors else None,
            "stair_labels_detected": len(project.stairs),
            "fire_equipment_labels_detected": len(project.fire_equipment),
            "fire_feature_evidence": project.fire_features_detected,
        },
        "required_fire_features": [],
        "rule_summary": {},
        "rules": [],
        "rule_results": [],
        "recommendations": [],
        "manual_review_items": [],
        "normalized_project_schema": project.model_dump(mode="json"),
        "project_schema": project.model_dump(mode="json"),
    }
