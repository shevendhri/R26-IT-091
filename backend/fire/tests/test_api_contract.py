from backend.fire.api_contract import AssessmentRequest, _fixed_count_profile_results


def payload(evidence, complete=False):
    return AssessmentRequest.model_validate({
        "project": {
            "project_name": "Count test", "building_use": "School",
            "storeys": 1, "building_height_m": 4, "building_area_m2": 100,
            "relevant_plan_set_complete": complete,
        },
        "evidence": evidence,
    })


def row(rows, item_type):
    return next(item for item in rows if item["rule_id"] == f"FG-FIXED-COUNT-{item_type.upper()}")


def test_fixed_count_profile_passes_when_detected_count_matches_requirement():
    rows = _fixed_count_profile_results(payload([{
        "item_type": "smoke_detector", "count": 2, "confidence": "high",
        "evidence_description": "Two smoke detectors", "source": "vision_api",
    }]))
    result = row(rows, "smoke_detector")
    assert result["status"] == "PASS"
    assert result["actual"] == result["required"] == 2


def test_fixed_count_profile_marks_wrong_count_as_violation():
    rows = _fixed_count_profile_results(payload([{
        "item_type": "fire_extinguisher", "count": 1, "confidence": "high",
        "evidence_description": "One extinguisher", "source": "vision_api",
    }]))
    assert row(rows, "fire_extinguisher")["status"] == "VIOLATION"
    assert row(rows, "fire_hose_reel")["status"] == "VIOLATION"


def test_fixed_count_profile_marks_absent_item_as_violation():
    rows = _fixed_count_profile_results(payload([]))
    assert row(rows, "fire_hose_reel")["status"] == "VIOLATION"
