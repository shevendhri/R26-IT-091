import json

from backend.rules.models import RuleStatus
from backend.scripts.debug_live_plan import (
    DetailTileExtraction,
    DoorRow,
    WindowRow,
    _build_project_from_fixture,
    _validate_detail_schema,
)
from backend.scripts.complete_real_plan import FLOOR_AREA_SCHEDULE_BBOX
from backend.scripts.complete_real_plan import build_project_from_complete_fixture

def test_typed_detail_schema_validates_synthetic_schedule():
    result = _validate_detail_schema()
    assert result["valid"] is True
    assert result["example"]["door_rows"][0]["mark"] == "D1"
    assert result["unsupported_schema_tokens"] == []

def test_detail_schema_has_no_unconstrained_arbitrary_objects():
    schema = json.dumps(DetailTileExtraction.model_json_schema())
    assert "additionalProperties" in schema
    assert '"additionalProperties": true' not in schema
    assert "DoorRow" in schema
    assert "WindowRow" in schema

def test_detail_schema_accepts_null_schedule_fields():
    detail = DetailTileExtraction(
        schedule_found=True,
        door_rows=[DoorRow(mark="D1", width_m=None, height_m=2.1, door_type=None, raw_text=None, confidence=0.6)],
        window_rows=[WindowRow(mark="W1", width_m=None, height_m=None, window_type=None, raw_text=None, confidence=None)],
    )
    assert detail.door_rows[0].width_m is None
    assert detail.window_rows[0].height_m is None

def test_saved_fixture_builds_project_schema_and_rules_without_exit_fabrication():
    fixture = {
        "source_file": "20260509181148921.pdf",
        "overview": {
            "project_name": "Proposed Student Girls Hostel Development",
            "building_use_text": "Student girls hostel",
            "storey_count": 7,
        },
        "detail": {
            "schedule_found": True,
            "door_rows": [
                {"mark": "D1", "width_m": 1.219, "height_m": 2.438, "door_type": "TIMBER FRAMED SOLID SIDE HUNG DOOR", "raw_text": "D1 4'-0\" x 8'-0\"", "confidence": 0.9}
            ],
            "window_rows": [],
            "evidence_text": "Doors and Windows Opening Schedule",
        },
        "selected_tile": {"tile_id": "schedule_bottom_right_rotated"},
    }
    project, rules = _build_project_from_fixture(fixture)
    assert project["building_info"]["project_title"] == "Proposed Student Girls Hostel Development"
    assert project["building_info"]["building_use_text"] == "Student girls hostel"
    assert project["building_info"]["purpose_group"] == "2(b)"
    assert project["doors"][0]["mark"] == "D1"
    assert project["doors"][0]["is_exit"] is None
    assert project["extraction"]["metadata_evidence"]["storey_count"]["validation_status"] == "CONFIRMED"
    chapter2_width = next(rule for rule in rules if rule["rule_id"] == "CH2-EXIT-DOOR-WIDTH")
    assert chapter2_width["status"] == RuleStatus.MANUAL_REVIEW
    wet_riser = next(rule for rule in rules if rule["rule_id"] == "CH4-WET-RISING-MAIN")
    assert wet_riser["status"] == RuleStatus.MANUAL_REVIEW

def test_floor_area_target_region_includes_area_value_column():
    x, y, width, height = FLOOR_AREA_SCHEDULE_BBOX
    assert (x, y, width) == (0.72, 0.82, 0.28)
    assert height >= 0.18

def test_floor_area_values_require_contextual_row_labels():
    payload = {
        "source_file": "20260509181148921.pdf",
        "overview": {"project_name": "P", "building_use_text": "office", "storey_count": 2},
        "door_window_schedule": {"door_rows": []},
        "section_elevation": None,
        "floor_area_schedule": {
            "rows": [
                {"floor_name": None, "area_value": 2743, "area_unit": "sqft", "raw_text": "2743 sqft", "confidence": 0.8}
            ],
            "total_area_value": None,
            "total_area_unit": None,
            "evidence_text": "bare value without row label",
        },
        "stair_escape": {},
    }
    project, _, _ = build_project_from_complete_fixture(payload)
    assert project["building_info"]["floor_areas_m2"] == {}
    assert project["building_info"]["max_floor_area_per_storey_m2"] is None

def test_contextual_floor_area_rows_are_converted_after_extraction():
    payload = {
        "source_file": "20260509181148921.pdf",
        "overview": {"project_name": "P", "building_use_text": "office", "storey_count": 2},
        "door_window_schedule": {"door_rows": []},
        "section_elevation": None,
        "floor_area_schedule": {
            "rows": [
                {"floor_name": "GROUND FLOOR", "area_value": 2743, "area_unit": "sqft", "raw_text": "GROUND FLOOR - 2743 sqft", "confidence": 0.99}
            ],
            "total_area_value": 2743,
            "total_area_unit": "sqft",
            "evidence_text": "GROUND FLOOR - 2743 sqft",
        },
        "stair_escape": {},
    }
    project, _, _ = build_project_from_complete_fixture(payload)
    assert project["building_info"]["floor_areas_m2"] == {"GROUND FLOOR": 254.83}
    assert project["building_info"]["total_building_area_m2"] == 254.83

def test_complete_fixture_usage_metadata_is_optional_for_compliance():
    payload = {
        "source_file": "20260509181148921.pdf",
        "overview": {"project_name": "P", "building_use_text": "office", "storey_count": 2},
        "door_window_schedule": {"door_rows": []},
        "section_elevation": None,
        "floor_area_schedule": None,
        "stair_escape": {},
        "openai_usage": None,
    }
    project, rules, _ = build_project_from_complete_fixture(payload)
    assert project["building_info"]["project_title"] == "P"
    assert next(rule for rule in rules if rule["rule_id"] == "CH2-EXITS-STOREY-COUNT")["status"] == RuleStatus.MANUAL_REVIEW
