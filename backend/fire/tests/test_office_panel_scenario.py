import json
from copy import deepcopy
from pathlib import Path

from backend.fire.ml.validated_replay import load_validated_replay
from backend.fire.model_evidence import build_fireguard_project_schema
from backend.fire.recommendations import build_recommendations
from backend.fire.rules import evaluate_project
from backend.fire.rules.applicability import purpose_group_for_project
from backend.fire.rules.models import RuleStatus

FIXTURES = Path(__file__).parents[1] / "fixtures"


def scenario(kind: str):
    user = json.loads((FIXTURES / f"validated_office_{kind}_user_input.json").read_text(encoding="utf-8"))
    model = load_validated_replay(FIXTURES / f"validated_office_{kind}_plan.json")
    project = build_fireguard_project_schema(user, model)
    results = evaluate_project(project)
    return user, project, results


def by_id(results, rule_id):
    return next(item for item in results if item.rule_id == rule_id)


def test_office_user_data_and_purpose_group_are_normalized():
    user, project, _ = scenario("violation")
    assert project.building_info.project_title == "FireGuard Office Complex"
    assert project.building_info.building_use_text == "Office Building"
    assert project.project["confirmed_independent_exit_count"] == 1
    assert project.project["confirmed_stair_count"] == 1
    assert purpose_group_for_project(project)["purpose_group"] == "3"
    assert project.extraction["user_confirmed_evidence"]["independent_exit_count"]["source"] == "USER_CONFIRMED"


def test_confirmed_office_model_evidence_is_merged_with_provenance():
    _, project, _ = scenario("violation")
    evidence = project.extraction["validated_plan_evidence"]
    assert evidence["hose_reel_count"] == 0
    assert evidence["hose_reel_status"] == "CONFIRMED"
    assert evidence["extinguisher_count"] == 3
    assert evidence["directional_exit_signage"] is False
    assert project.extraction["evidence_provenance"]["model"] == "MODEL_DETECTED"
    assert project.project["confirmed_independent_exit_count"] == 1


def test_office_violation_scenario_uses_live_rules_and_recommendations():
    _, _, results = scenario("violation")
    assert by_id(results, "CH2-EXITS-STOREY-COUNT").status == RuleStatus.VIOLATION
    travel = by_id(results, "CH2-TRAVEL-DISTANCE-TABLE5")
    assert travel.status == RuleStatus.VIOLATION and travel.actual == 52 and travel.required == 45
    assert by_id(results, "CH4-HOSE-REEL").status == RuleStatus.VIOLATION
    _, recommendations, _ = build_recommendations(results)
    violation_ids = {item.rule_id for item in results if item.status == RuleStatus.VIOLATION}
    assert violation_ids <= {item["rule_id"] for item in recommendations}


def test_unresolved_extinguisher_and_directional_signage_are_not_forced():
    _, project, results = scenario("violation")
    assert by_id(results, "CH4-PORTABLE-EXTINGUISHERS").status == RuleStatus.MANUAL_REVIEW
    assert by_id(results, "CH2-EXIT-SIGNAGE").status == RuleStatus.PASS
    assert project.project["directional_exit_signage"] is False


def test_compliant_counterpart_reduces_confirmed_violations_to_zero():
    _, _, unsafe_results = scenario("violation")
    _, _, improved_results = scenario("compliant")
    unsafe = [item for item in unsafe_results if item.status == RuleStatus.VIOLATION]
    improved = [item for item in improved_results if item.status == RuleStatus.VIOLATION]
    assert len(unsafe) == 3
    assert len(improved) == 0


def test_single_value_sensitivity_changes_exit_and_travel_rules():
    user, _, _ = scenario("compliant")
    model = load_validated_replay(FIXTURES / "validated_office_compliant_plan.json")
    exit_change = deepcopy(user)
    exit_change["independent_exit_count"] = 1
    assert by_id(evaluate_project(build_fireguard_project_schema(exit_change, model)), "CH2-EXITS-STOREY-COUNT").status == RuleStatus.VIOLATION
    travel_change = deepcopy(user)
    travel_change["travel_distance_m"] = 52
    assert by_id(evaluate_project(build_fireguard_project_schema(travel_change, model)), "CH2-TRAVEL-DISTANCE-TABLE5").status == RuleStatus.VIOLATION


def test_result_page_has_no_static_office_violation_array():
    source = (FIXTURES.parents[2] / "frontend/src/app/fire-safety/results/[id]/page.jsx").read_text(encoding="utf-8")
    assert "demoViolations" not in source
    assert "FireGuard Office Complex" not in source
    assert "rule.status==='VIOLATION'" in source
