import json
from dataclasses import dataclass
from typing import Optional

from green_assessment import models


MACHINE_ASSESSABLE_CODES = {
    "EE6",
    "EE3",
    "EE4",
    "EQ1",
    "SM2",
    "SM10",
    "MR1",
    "MR2",
    "MR3",
    "MR4",
    "MR7",
    "WE1",
    "WE2",
    "WE4",
}


METRIC_ALIASES = {
    "EE3": {
        "renewable_energy_percentage": "electricity_contract_demand_met_by_solar_percentage",
    },
}


@dataclass
class UdaRuleEvaluation:
    awarded_marks: float
    matched_rule: Optional[models.UdaScoringRule]
    scoring_mode: str
    assessment_status: str
    requires_manual_review: bool
    explanation: str


def evaluate_uda_criterion(criterion, evidence_input) -> UdaRuleEvaluation:
    machine_rules = [
        rule
        for rule in sorted(criterion.scoring_rules, key=lambda item: item.rule_order)
        if rule.machine_rule_json and not rule.requires_manual_review
    ]

    if criterion.criterion_code not in MACHINE_ASSESSABLE_CODES or not machine_rules:
        return UdaRuleEvaluation(
            awarded_marks=0,
            matched_rule=None,
            scoring_mode="not_machine_assessable",
            assessment_status="manual_review_required",
            requires_manual_review=True,
            explanation=(
                f"{criterion.criterion_code} is not safely machine-assessable from "
                "the current UDA guideline rules. Manual DA review is required."
            ),
        )

    evidence_values = _evidence_values(criterion.criterion_code, evidence_input)
    if not evidence_values:
        return UdaRuleEvaluation(
            awarded_marks=0,
            matched_rule=None,
            scoring_mode="automatic_rule",
            assessment_status="insufficient_evidence",
            requires_manual_review=False,
            explanation="No structured evidence value was provided for automatic evaluation.",
        )

    matching_rules = []
    for rule in machine_rules:
        rule_json = json.loads(rule.machine_rule_json)
        if _rule_matches(rule_json, evidence_values):
            matching_rules.append(rule)

    if not matching_rules:
        return UdaRuleEvaluation(
            awarded_marks=0,
            matched_rule=None,
            scoring_mode="automatic_rule",
            assessment_status="not_achieved",
            requires_manual_review=False,
            explanation=(
                "Provided evidence values do not meet any stored UDA DA scoring band "
                f"for {criterion.criterion_code}."
            ),
        )

    matched_rule = max(matching_rules, key=lambda item: item.marks or 0)
    awarded_marks = min(matched_rule.marks or 0, criterion.maximum_marks)
    status = "achieved" if awarded_marks >= criterion.maximum_marks else "partially_achieved"
    return UdaRuleEvaluation(
        awarded_marks=awarded_marks,
        matched_rule=matched_rule,
        scoring_mode="automatic_rule",
        assessment_status=status,
        requires_manual_review=False,
        explanation=_explain_match(criterion, matched_rule, evidence_values),
    )


def _evidence_values(criterion_code: str, evidence_input) -> dict[str, float]:
    values = dict(evidence_input.values or {})
    if evidence_input.metric and evidence_input.value is not None:
        metric = METRIC_ALIASES.get(criterion_code, {}).get(
            evidence_input.metric,
            evidence_input.metric,
        )
        values[metric] = evidence_input.value
    return values


def _rule_matches(rule_json: dict, evidence_values: dict[str, float]) -> bool:
    if rule_json.get("logic") == "or":
        return any(
            _single_condition_matches(condition, evidence_values)
            for condition in rule_json["conditions"]
        )
    if rule_json.get("logic") == "and":
        return all(
            _single_condition_matches(condition, evidence_values)
            for condition in rule_json["conditions"]
        )
    return _single_condition_matches(rule_json, evidence_values)


def _single_condition_matches(condition: dict, evidence_values: dict[str, float]) -> bool:
    metric = condition["metric"]
    if metric not in evidence_values:
        return False

    value = evidence_values[metric]
    operator = condition["operator"]
    if operator == ">=":
        return value >= condition["value"]
    if operator == ">":
        return value > condition["value"]
    if operator == "<=":
        return value <= condition["value"]
    if operator == "<":
        return value < condition["value"]
    if operator == "range":
        return condition["min"] <= value <= condition["max"]
    if operator == "boolean":
        return bool(value) is bool(condition["value"])
    return False


def _explain_match(criterion, matched_rule, evidence_values: dict[str, float]) -> str:
    rule_json = json.loads(matched_rule.machine_rule_json)
    matched_condition = _find_matched_condition(rule_json, evidence_values)
    if not matched_condition:
        return (
            f"{criterion.criterion_code} matched rule {matched_rule.rule_order} "
            f"for {matched_rule.marks} marks."
        )

    metric = matched_condition["metric"]
    value = evidence_values[metric]
    unit = matched_condition.get("unit", "")
    operator = matched_condition["operator"]
    if operator == "range":
        threshold = f"between {matched_condition['min']} and {matched_condition['max']} {unit}".strip()
    else:
        threshold = f"{operator} {matched_condition['value']}{unit}".strip()
    return (
        f"{metric} value of {value}{unit} meets the {threshold} threshold "
        f"for {matched_rule.marks} marks under {criterion.criterion_code}."
    )


def _find_matched_condition(rule_json: dict, evidence_values: dict[str, float]):
    if rule_json.get("logic") == "or":
        for condition in rule_json["conditions"]:
            if _single_condition_matches(condition, evidence_values):
                return condition
        return None
    if _single_condition_matches(rule_json, evidence_values):
        return rule_json
    return None
