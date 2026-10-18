from typing import Any

from .ml.model_schema import ModelInferenceResult
from .schemas import Document, Door, FireEquipment, ProjectSchema

EVIDENCE_FIELD_MAP = {
    "fire_exit": "visible_exit_candidate_count", "emergency_exit_sign": "exit_sign_count",
    "fire_extinguisher": "extinguisher_count", "smoke_detector": "smoke_detector_count",
    "sprinkler": "sprinkler_detection_count", "fire_alarm": "fire_alarm_detection_count",
    "fire_door": "fire_door_candidate_count", "staircase": "stair_candidate_count",
    "hydrant": "hydrant_count", "hose_reel": "hose_reel_count",
    "assembly_point": "assembly_point_count", "emergency_telephone": "emergency_telephone_count",
}


def normalize_model_evidence(result: ModelInferenceResult) -> dict[str, dict[str, Any]]:
    evidence = {}
    for class_name, count in result.class_counts.items():
        field = EVIDENCE_FIELD_MAP.get(class_name)
        if field:
            confidences = [item.confidence for item in result.detections if item.class_name == class_name]
            evidence[field] = {"value": count, "source": "MODEL_DETECTED", "confidence": round(sum(confidences) / len(confidences), 4) if confidences else None}
    return evidence


def build_fireguard_project_schema(user_building_data: dict[str, Any], model_result: ModelInferenceResult, documents: list[Document] | None = None) -> ProjectSchema:
    project = ProjectSchema(documents=documents or [])
    building = project.building_info
    for target, source in {
        "project_title": "project_name", "building_use_text": "building_use", "purpose_group": "purpose_group",
        "storey_count": "storey_count", "highest_habitable_floor_level_m": "highest_habitable_floor_level_m",
        "building_height_m": "building_height_m", "total_building_area_m2": "total_floor_area_m2",
    }.items():
        setattr(building, target, user_building_data.get(source))
    if building.total_building_area_m2 is not None and building.storey_count:
        building.max_floor_area_per_storey_m2 = building.total_building_area_m2 / building.storey_count
    for target, source in {
        "confirmed_independent_exit_count": "independent_exit_count", "escape_arrangement": "escape_arrangement",
        "travel_distance_m": "travel_distance_m", "corridor_width_m": "corridor_width_m",
        "confirmed_stair_count": "staircase_count", "stair_clear_width_m": "stair_width_m",
        "protected_staircase": "protected_stair",
    }.items():
        project.project[target] = user_building_data.get(source)

    model_evidence = normalize_model_evidence(model_result)
    project.extraction["user_confirmed_evidence"] = {key: {"value": value, "source": "USER_CONFIRMED", "validation_status": "USER_CONFIRMED"} for key, value in user_building_data.items() if value is not None}
    project.extraction["model_detected_evidence"] = model_evidence
    project.extraction["evidence_provenance"] = {"user": "USER_CONFIRMED", "model": "MODEL_DETECTED"}
    project.fire_plan_present = bool(documents)
    project.fire_annotations_present = bool(model_result.detections) or None
    project.fire_features_detected = [item.model_dump(mode="json") for item in model_result.detections]
    equipment_classes = {"fire_extinguisher", "smoke_detector", "sprinkler", "fire_alarm", "hydrant", "hose_reel", "assembly_point", "emergency_telephone", "emergency_exit_sign"}
    for class_name, count in model_result.class_counts.items():
        if class_name in equipment_classes:
            confidence = model_evidence.get(EVIDENCE_FIELD_MAP[class_name], {}).get("confidence") or 0.0
            project.fire_equipment.append(FireEquipment(type=class_name, count=count, source_file="fireguard_model", source_page=1, evidence="FireGuard YOLOv8 candidate evidence; compliance is evaluated separately.", confidence=confidence))
    # A visible staircase remains a candidate and never overwrites confirmed exits.
    project.project["stair_candidate_count"] = model_evidence.get("stair_candidate_count", {}).get("value")
    validated = model_result.validated_plan_evidence if model_result.inference_mode == "VALIDATED_REPLAY" else None
    if validated:
        project.sprinkler_system = validated.sprinkler_system
        project.alarm_system = validated.alarm_system
        project.escape_route_lighting = validated.escape_route_lighting
        project.exit_signage = validated.exit_signage
        project.project.update({
            "manual_call_points": validated.manual_call_points,
            "manual_call_point_count": validated.manual_call_point_count,
            "manual_call_point_max_travel_m": validated.manual_call_point_max_travel_m,
            "manual_call_point_mounting_height_m": validated.manual_call_point_mounting_height_m,
            "manual_call_point_status": validated.manual_call_point_status,
            "extinguisher_rating": validated.extinguisher_rating,
            "extinguisher_max_travel_m": validated.extinguisher_max_travel_m,
            "extinguisher_mounting_height_m": validated.extinguisher_mounting_height_m,
            "extinguisher_status": validated.extinguisher_status,
            "hose_reel_coverage_verified": validated.hose_reel_coverage_verified,
            "hose_reel_status": validated.hose_reel_status,
            "directional_exit_signage": validated.directional_exit_signage,
            "exit_signage_status": validated.exit_signage_status,
            "public_hydrant_distance_m": validated.public_hydrant_distance_m,
        })
        if validated.manual_call_point_count is not None:
            project.fire_equipment.append(FireEquipment(type="manual_call_point", count=validated.manual_call_point_count, source_file="validated_compliant_plan", source_page=1, evidence="Validated manual call-point evidence", confidence=1.0))
        if validated.extinguisher_count is not None:
            project.fire_equipment.append(FireEquipment(type="fire_extinguisher", count=validated.extinguisher_count, source_file="validated_compliant_plan", source_page=1, evidence="Validated 13A extinguisher evidence", confidence=1.0))
        if validated.hose_reel_count is not None and not any(item.type == "hose_reel" for item in project.fire_equipment):
            project.fire_equipment.append(FireEquipment(type="hose_reel", count=validated.hose_reel_count, source_file="validated_compliant_plan", source_page=1, evidence="Validated hose-reel evidence", confidence=1.0))
        for door in validated.exit_doors:
            project.doors.append(Door(mark=door.mark, width_m=door.width_m, height_mm=door.height_mm, is_exit=True, opens_in_exit_direction=door.opens_in_exit_direction, source_file="validated_compliant_plan", source_page=1, evidence="Validated exit-door schedule evidence", confidence=1.0))
        project.extraction["validated_plan_evidence"] = validated.model_dump(mode="json")
    return project
