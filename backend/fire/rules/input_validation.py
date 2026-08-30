from copy import deepcopy
from ..schemas import ProjectSchema

CRITICAL_BUILDING_FIELDS = (
    "purpose_group",
    "storey_count",
    "building_height_m",
    "highest_habitable_floor_level_m",
    "total_building_area_m2",
    "max_floor_area_per_storey_m2",
)

CRITICAL_PROJECT_FIELDS = (
    "visible_stair_candidate_count",
    "confirmed_exit_count",
    "confirmed_stair_count",
    "confirmed_independent_exit_count",
    "confirmed_exit_door_count",
    "travel_distance_m",
)

def validate_rule_inputs(project: ProjectSchema) -> ProjectSchema:
    validated = deepcopy(project)
    metadata = project.extraction.get("metadata_evidence", {}) if isinstance(project.extraction, dict) else {}
    critical = {}
    for field in CRITICAL_BUILDING_FIELDS:
        item = metadata.get(field)
        value = getattr(validated.building_info, field)
        if item and item.get("validation_status") not in {"CONFIRMED","USER_CONFIRMED"}:
            setattr(validated.building_info, field, None)
            critical[field] = "UNKNOWN"
        elif value is None:
            critical[field] = "UNKNOWN"
        else:
            critical[field] = item.get("validation_status","CONFIRMED") if item else "CONFIRMED"
    for field in CRITICAL_PROJECT_FIELDS:
        if field in validated.project and validated.project[field] is None:
            critical[field] = "UNKNOWN"
        elif field in validated.project:
            critical[field] = "CONFIRMED"
    validated.extraction = {**(validated.extraction or {}), "critical_field_validation": critical}
    return validated
