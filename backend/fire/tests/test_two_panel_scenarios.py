import json
from pathlib import Path

from backend.fire.ml.validated_replay import load_validated_replay
from backend.fire.model_evidence import build_fireguard_project_schema
from backend.fire.rules import evaluate_project
from backend.fire.rules.applicability import purpose_group_for_project
from backend.fire.rules.models import RuleStatus

FIXTURES = Path(__file__).parents[1] / "fixtures"
SHARED_PLAN = FIXTURES / "validated_compliant_plan.json"
SCHOOL_INPUT = FIXTURES / "validated_compliant_user_input.json"
OFFICE_INPUT = FIXTURES / "validated_office_violation_user_input.json"


def run_scenario(input_path: Path):
    user = json.loads(input_path.read_text(encoding="utf-8"))
    model = load_validated_replay(SHARED_PLAN)
    project = build_fireguard_project_schema(user, model)
    results = evaluate_project(project)
    return user, project, results


def violations(results):
    return [result for result in results if result.status == RuleStatus.VIOLATION]


def by_id(results, rule_id):
    return next(result for result in results if result.rule_id == rule_id)


def test_compliant_school_has_zero_confirmed_violations():
    _, project, results = run_scenario(SCHOOL_INPUT)
    assert project.building_info.project_title == "FireGuard Compliant Demo School"
    assert project.building_info.building_use_text == "School"
    assert project.building_info.purpose_group == "2(a)"
    assert project.building_info.storey_count == 2
    assert project.building_info.highest_habitable_floor_level_m == 9
    assert project.building_info.building_height_m == 12
    assert project.building_info.total_building_area_m2 == 500
    assert project.project["confirmed_independent_exit_count"] == 2
    assert project.project["escape_arrangement"] == "TWO_WAY"
    assert project.project["travel_distance_m"] == 35
    assert project.project["corridor_width_m"] == 1.2
    assert project.project["confirmed_stair_count"] == 2
    assert project.project["stair_clear_width_m"] == 1.2
    assert project.project["protected_staircase"] is True
    assert violations(results) == []


def test_office_violation_scenario_has_confirmed_violations():
    _, project, results = run_scenario(OFFICE_INPUT)
    assert project.building_info.project_title == "FireGuard Office Complex"
    assert project.building_info.building_use_text == "Office Building"
    assert purpose_group_for_project(project)["purpose_group"] == "3"
    assert project.building_info.storey_count == 4
    assert project.project["confirmed_independent_exit_count"] == 1
    assert project.project["travel_distance_m"] == 52
    assert project.project["confirmed_stair_count"] == 1
    assert len(violations(results)) == 3


def test_exit_input_changes_rule_result_with_same_plan():
    _, _, school_results = run_scenario(SCHOOL_INPUT)
    _, _, office_results = run_scenario(OFFICE_INPUT)
    assert by_id(school_results, "CH2-EXITS-STOREY-COUNT").status != RuleStatus.VIOLATION
    office_exit = by_id(office_results, "CH2-EXITS-STOREY-COUNT")
    assert office_exit.status == RuleStatus.VIOLATION
    assert office_exit.actual == 1 and office_exit.required == 2


def test_travel_input_changes_rule_result_with_same_plan():
    _, _, school_results = run_scenario(SCHOOL_INPUT)
    _, _, office_results = run_scenario(OFFICE_INPUT)
    assert by_id(school_results, "CH2-TRAVEL-DISTANCE-TABLE5").status != RuleStatus.VIOLATION
    office_travel = by_id(office_results, "CH2-TRAVEL-DISTANCE-TABLE5")
    assert office_travel.status == RuleStatus.VIOLATION
    assert office_travel.actual == 52 and office_travel.required == 45


def test_model_stair_candidate_does_not_override_user_exit_count():
    _, school, _ = run_scenario(SCHOOL_INPUT)
    _, office, _ = run_scenario(OFFICE_INPUT)
    assert school.project["stair_candidate_count"] == 1
    assert school.project["confirmed_independent_exit_count"] == 2
    assert school.project["confirmed_stair_count"] == 2
    assert office.project["stair_candidate_count"] == 1
    assert office.project["confirmed_independent_exit_count"] == 1
    assert office.project["confirmed_stair_count"] == 1


def test_new_assessment_does_not_reuse_previous_inputs():
    _, first_school, _ = run_scenario(SCHOOL_INPUT)
    _, office, _ = run_scenario(OFFICE_INPUT)
    _, second_school, _ = run_scenario(SCHOOL_INPUT)
    assert first_school.project["confirmed_independent_exit_count"] == 2
    assert office.project["confirmed_independent_exit_count"] == 1
    assert second_school.project["confirmed_independent_exit_count"] == 2
    assert first_school is not second_school


def test_project_name_and_building_use_are_separate():
    _, school, _ = run_scenario(SCHOOL_INPUT)
    _, office, _ = run_scenario(OFFICE_INPUT)
    assert (school.building_info.project_title, school.building_info.building_use_text) == ("FireGuard Compliant Demo School", "School")
    assert (office.building_info.project_title, office.building_info.building_use_text) == ("FireGuard Office Complex", "Office Building")


def test_shared_fixture_contains_evidence_not_saved_results():
    payload = json.loads(SHARED_PLAN.read_text(encoding="utf-8"))
    for forbidden in ("violations", "rule_results", "approved", "overall_status"):
        assert forbidden not in payload
