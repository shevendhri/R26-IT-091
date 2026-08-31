import json
from copy import deepcopy
from pathlib import Path

from backend.fire.ml.model_schema import ModelInferenceResult
from backend.fire.ml.validated_replay import load_validated_replay
from backend.fire.model_evidence import build_fireguard_project_schema
from backend.fire.rules import evaluate_project
from backend.fire.rules.models import RuleStatus

FIXTURES = Path(__file__).parents[1] / "fixtures"
USER_INPUT = FIXTURES / "validated_compliant_user_input.json"
PLAN_EVIDENCE = FIXTURES / "validated_compliant_plan.json"


def compliant_inputs() -> tuple[dict, ModelInferenceResult]:
    user_data = json.loads(USER_INPUT.read_text(encoding="utf-8"))
    return user_data, load_validated_replay(PLAN_EVIDENCE)


def violations(user_data: dict, model_result: ModelInferenceResult):
    project = build_fireguard_project_schema(user_data, model_result)
    return [result for result in evaluate_project(project) if result.status == RuleStatus.VIOLATION]


def test_compliant_fixture_contains_input_evidence_not_saved_outcome():
    payload = json.loads(PLAN_EVIDENCE.read_text(encoding="utf-8"))
    assert "violations" not in payload
    assert "result" not in payload
    assert payload.get("overall_status") is None
    assert payload["inference_mode"] == "VALIDATED_REPLAY"


def test_compliant_school_inputs_produce_zero_confirmed_violations():
    user_data, model_result = compliant_inputs()
    assert violations(user_data, model_result) == []


def test_reducing_only_independent_exits_changes_live_rule_result():
    user_data, model_result = compliant_inputs()
    changed = deepcopy(user_data)
    changed["independent_exit_count"] = 1
    rule_ids = {result.rule_id for result in violations(changed, model_result)}
    assert "CH2-EXITS-STOREY-COUNT" in rule_ids


def test_increasing_only_travel_distance_uses_existing_45m_limit():
    user_data, model_result = compliant_inputs()
    changed = deepcopy(user_data)
    changed["travel_distance_m"] = 52
    travel = next(result for result in violations(changed, model_result) if result.rule_id == "CH2-TRAVEL-DISTANCE-TABLE5")
    assert travel.actual == 52
    assert travel.required == 45
