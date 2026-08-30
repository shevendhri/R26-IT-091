import json
from typing import Optional

from sqlalchemy.orm import selectinload

from green_assessment import models
from green_assessment.services.uda_preassessment_levels import get_preassessment_level


OFFICIAL_NOTICE = (
    "This is a preliminary recommendation and does not guarantee official UDA "
    "certification."
)

COST_RANK = {
    "very_low": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
    "very_high": 4,
    "unknown": 5,
}


def build_uda_recommendations(
    db,
    project,
    mode: str = "low_cost",
    target: Optional[float] = None,
):
    criteria = (
        db.query(models.UdaCriterion)
        .options(
            selectinload(models.UdaCriterion.scoring_rules),
            selectinload(models.UdaCriterion.required_documents),
            selectinload(models.UdaCriterion.recommendation_rules),
        )
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.category_code, models.UdaCriterion.criterion_code)
        .all()
    )
    assessments = (
        db.query(models.UdaProjectAssessment)
        .filter(
            models.UdaProjectAssessment.project_id == project.id,
            models.UdaProjectAssessment.assessment_stage == "DA",
        )
        .all()
    )
    assessment_by_criterion = {
        assessment.criterion_id: assessment for assessment in assessments
    }
    evidence_summaries = (
        db.query(models.UdaProjectCriterionEvidenceSummary)
        .options(
            selectinload(models.UdaProjectCriterionEvidenceSummary.source_document),
            selectinload(models.UdaProjectCriterionEvidenceSummary.proposed_rule),
        )
        .filter(models.UdaProjectCriterionEvidenceSummary.project_id == project.id)
        .all()
    )
    summary_by_code = {
        summary.criterion_code: summary for summary in evidence_summaries
    }

    current_score = sum(assessment.awarded_marks for assessment in assessments)
    confirmed_score = sum(
        assessment.awarded_marks
        for assessment in assessments
        if assessment.score_source in {"manual", "evidence_confirmed"}
    )
    total_configured_max = sum(criterion.maximum_marks for criterion in criteria)
    review_required_count = sum(
        1
        for summary in evidence_summaries
        if summary.scoring_status == "need_specialist_review"
        or summary.reviewed_status == "manual_assessment_required"
        or summary.conflict_detected
    )

    recommendations = []
    for criterion in criteria:
        assessment = assessment_by_criterion.get(criterion.id)
        evidence_summary = summary_by_code.get(criterion.criterion_code)
        state = _criterion_state(criterion, assessment, evidence_summary)
        current_marks = state["current_marks"]
        if current_marks >= criterion.maximum_marks:
            continue

        recommendation_rule = _recommendation_rule_for(criterion)
        machine_rules = _machine_rules_for(criterion)
        if machine_rules:
            next_rule = _selected_machine_rule(
                machine_rules,
                current_marks,
                "low_cost",
            )
            maximum_rule = _selected_machine_rule(
                machine_rules,
                current_marks,
                "maximum_score",
            )
            selected_rule = maximum_rule if mode == "maximum_score" else next_rule
            if selected_rule is None:
                continue
            potential_marks = min(selected_rule.marks or 0, criterion.maximum_marks)
            potential_gain = max(potential_marks - current_marks, 0)
            if potential_gain <= 0:
                continue
            maximum_potential_marks = (
                min(maximum_rule.marks or 0, criterion.maximum_marks)
                if maximum_rule
                else current_marks
            )
            maximum_gain = max(maximum_potential_marks - current_marks, 0)
            if state["specialist_review_required"]:
                recommendation_text = _review_recommendation_text(
                    criterion,
                    evidence_summary,
                    recommendation_rule,
                )
                reason = _review_reason(criterion, evidence_summary, selected_rule)
                recommendation_type = "specialist_review"
                potential_marks = current_marks + maximum_gain
                potential_gain = maximum_gain
                requires_manual_review = True
            elif state["current_status"] == "insufficient_evidence":
                recommendation_text = _documentation_recommendation_text(
                    criterion,
                    recommendation_rule,
                )
                reason = (
                    f"{criterion.criterion_code} has identified evidence but lacks a "
                    "clear configured scoring input. Verify DA evidence before "
                    "design changes are assumed."
                )
                recommendation_type = "documentation"
                requires_manual_review = True
            else:
                recommendation_text = _machine_recommendation_text(
                    recommendation_rule.recommendation_text,
                    selected_rule,
                )
                reason = _machine_reason(criterion, selected_rule, assessment, evidence_summary)
                recommendation_type = recommendation_rule.recommendation_type
                requires_manual_review = False
            matched_rule_id = selected_rule.id
            matched_rule_text = selected_rule.condition_text
            next_score = min((next_rule.marks if next_rule else potential_marks) or 0, criterion.maximum_marks)
        else:
            if not assessment and not evidence_summary:
                continue
            potential_marks = current_marks
            potential_gain = 0.0
            maximum_gain = 0.0
            next_score = current_marks
            recommendation_text = recommendation_rule.recommendation_text
            reason = (
                f"{criterion.criterion_code} is not safely machine-assessable "
                "from the current UDA guideline. Assessor review is required; "
                "no guaranteed marks gain is claimed."
            )
            requires_manual_review = True
            recommendation_type = "specialist_review"
            matched_rule_id = None
            matched_rule_text = None

        recommendations.append(
            {
                "criterion_id": criterion.id,
                "criterion_code": criterion.criterion_code,
                "criterion_name": criterion.criterion_name,
                "category_code": criterion.category_code,
                "category_name": criterion.category_name,
                "current_marks": current_marks,
                "current_score": current_marks,
                "potential_marks": potential_marks,
                "maximum_marks": criterion.maximum_marks,
                "potential_marks_gain": potential_gain,
                "max_score": criterion.maximum_marks,
                "next_score": next_score,
                "maximum_gain": maximum_gain,
                "current_status": state["current_status"],
                "score_source": state["score_source"],
                "recommendation": recommendation_text,
                "recommendation_text": recommendation_text,
                "recommendation_type": recommendation_type,
                "cost_level": recommendation_rule.cost_level,
                "implementation_difficulty": (
                    recommendation_rule.implementation_difficulty
                ),
                "required_documents": _da_documents_for(
                    criterion,
                    recommendation_rule,
                ),
                "reason": reason,
                "source_basis": recommendation_rule.source_basis,
                "matched_rule_id": matched_rule_id,
                "matched_rule_text": matched_rule_text,
                "requires_manual_review": requires_manual_review,
                "specialist_review_required": requires_manual_review,
                "source_document": (
                    evidence_summary.source_document.original_filename
                    if evidence_summary and evidence_summary.source_document
                    else None
                ),
                "source_page": evidence_summary.source_page if evidence_summary else None,
                "evidence_summary": _evidence_summary_text(evidence_summary),
                "notes": recommendation_rule.notes,
            }
        )

    ranked = _rank_recommendations(recommendations, mode)
    selected = _target_recommendations(ranked, current_score, target) if mode == "target_score" else ranked
    total_gain = sum(item["potential_marks_gain"] for item in selected)
    potential_score = min(current_score + total_gain, total_configured_max)
    current_level = get_preassessment_level(current_score)
    potential_level = get_preassessment_level(potential_score)
    target_level = get_preassessment_level(target) if target is not None else None
    target_reachable = (
        potential_score >= target if mode == "target_score" and target is not None else None
    )

    return {
        "project_id": project.id,
        "project_name": project.name,
        "current_score": current_score,
        "current_proposed_score": current_score,
        "reviewed_confirmed_score": confirmed_score,
        "current_preassessment_level": current_level["level"],
        "next_preassessment_level": current_level["next_level"],
        "next_level_threshold": current_level["next_threshold"],
        "marks_to_next_level": current_level["marks_to_next_level"],
        "highest_level_reached": current_level["is_highest_level"],
        "mode": mode,
        "target_score": target,
        "target_preassessment_level": target_level["level"] if target_level else None,
        "target_gap": max((target or current_score) - current_score, 0)
        if mode == "target_score"
        else None,
        "target_reachable": target_reachable,
        "potential_score": potential_score,
        "potential_preassessment_level": potential_level["level"],
        "potential_next_preassessment_level": potential_level["next_level"],
        "potential_marks_to_next_level": potential_level["marks_to_next_level"],
        "total_potential_gain": potential_score - current_score,
        "total_configured_max_marks": total_configured_max,
        "recommendations_count": len(selected),
        "need_specialist_review_count": review_required_count,
        "official_certification_notice": OFFICIAL_NOTICE,
        "recommendations": selected,
    }


def _recommendation_rule_for(criterion):
    if criterion.recommendation_rules:
        return criterion.recommendation_rules[0]
    return _FallbackRecommendationRule(criterion)


def _machine_rules_for(criterion):
    return [
        rule
        for rule in sorted(criterion.scoring_rules, key=lambda item: item.rule_order)
        if rule.machine_rule_json and not rule.requires_manual_review
    ]


def _selected_machine_rule(machine_rules, current_marks: float, mode: str):
    higher_rules = [
        rule for rule in machine_rules if (rule.marks or 0) > current_marks
    ]
    if not higher_rules:
        return None
    if mode == "maximum_score":
        return max(higher_rules, key=lambda item: item.marks or 0)
    return min(higher_rules, key=lambda item: item.marks or 0)


def _machine_recommendation_text(base_text: str, selected_rule) -> str:
    return f"{base_text} Target scoring band: {selected_rule.condition_text}."


def _machine_reason(criterion, selected_rule, assessment, evidence_summary=None) -> str:
    current_text = "not yet assessed"
    if assessment:
        current_text = (
            f"currently awarded {assessment.awarded_marks} of "
            f"{criterion.maximum_marks} marks from {assessment.score_source}"
        )
    source_text = ""
    if evidence_summary and evidence_summary.proposed_input_value is not None:
        source_text = (
            f" Current evidence input is {evidence_summary.proposed_input_value}"
            f"{evidence_summary.input_unit or ''}"
            f" from {evidence_summary.source_document.original_filename if evidence_summary.source_document else 'project evidence'}"
            f", page {evidence_summary.source_page if evidence_summary.source_page is not None else 'not available'}."
        )
    return (
        f"{criterion.criterion_code} is {current_text}. The next selected UDA "
        f"DA scoring band awards {selected_rule.marks} marks when: "
        f"{selected_rule.condition_text}.{source_text}"
    )


def _criterion_state(criterion, assessment, evidence_summary):
    current_marks = assessment.awarded_marks if assessment else 0.0
    score_source = assessment.score_source if assessment else "unassessed"
    current_status = assessment.assessment_status if assessment else "not_assessed"
    specialist_review_required = False

    if evidence_summary:
        if evidence_summary.scoring_status in {
            "need_specialist_review",
            "insufficient_evidence",
            "manual_criterion",
        }:
            current_status = evidence_summary.scoring_status
        if evidence_summary.scoring_status == "scored" and assessment:
            current_status = f"{assessment.assessment_status}_from_{assessment.score_source}"
        specialist_review_required = (
            evidence_summary.scoring_status == "need_specialist_review"
            or evidence_summary.reviewed_status == "manual_assessment_required"
            or evidence_summary.conflict_detected
        )

    return {
        "current_marks": current_marks,
        "score_source": score_source,
        "current_status": current_status,
        "specialist_review_required": specialist_review_required,
    }


def _review_recommendation_text(criterion, evidence_summary, recommendation_rule):
    base = (
        f"Confirm the detected {criterion.criterion_code} evidence with a "
        "green-building specialist before treating the current score as final."
    )
    if evidence_summary and evidence_summary.proposed_input_metric:
        base += (
            f" Verify {evidence_summary.proposed_input_metric.replace('_', ' ')} "
            "against the Design Assessment evidence."
        )
    return f"{base} {recommendation_rule.recommendation_text}"


def _documentation_recommendation_text(criterion, recommendation_rule):
    return (
        f"Provide or verify the required Design Assessment evidence for "
        f"{criterion.criterion_code} before determining whether design improvement "
        f"is needed. {recommendation_rule.recommendation_text}"
    )


def _review_reason(criterion, evidence_summary, selected_rule):
    source = ""
    if evidence_summary and evidence_summary.source_document:
        source = (
            f" Evidence source: {evidence_summary.source_document.original_filename}, "
            f"page {evidence_summary.source_page if evidence_summary.source_page is not None else 'not available'}."
        )
    rule_text = (
        f" Potential opportunity can be assessed against: {selected_rule.condition_text}."
        if selected_rule
        else ""
    )
    return (
        f"{criterion.criterion_code} has unresolved evidence and should not be "
        f"treated as confirmed failure or confirmed achievement.{source}{rule_text}"
    )


def _evidence_summary_text(evidence_summary):
    if not evidence_summary:
        return None
    if evidence_summary.proposed_input_value is not None:
        return (
            f"Detected {evidence_summary.proposed_input_value}"
            f"{evidence_summary.input_unit or ''} for "
            f"{(evidence_summary.proposed_input_metric or 'scoring input').replace('_', ' ')}."
        )
    if evidence_summary.scoring_status == "need_specialist_review":
        return "Evidence was identified, but it requires specialist verification before scoring."
    if evidence_summary.scoring_status == "insufficient_evidence":
        return "Evidence was identified, but a reliable scoring value could not be extracted."
    return evidence_summary.scoring_explanation


def _da_documents_for(criterion, recommendation_rule):
    if recommendation_rule.required_documents:
        try:
            loaded = json.loads(recommendation_rule.required_documents)
            if isinstance(loaded, list):
                return loaded
        except json.JSONDecodeError:
            pass
    return [
        document.requirement_text
        for document in sorted(
            criterion.required_documents,
            key=lambda item: item.requirement_order,
        )
        if document.assessment_stage == "DA"
    ]


def _rank_recommendations(recommendations: list[dict], mode: str):
    if mode == "maximum_score":
        return sorted(
            recommendations,
            key=lambda item: (
                -item["potential_marks_gain"],
                COST_RANK.get(item["cost_level"], 5),
                item["criterion_code"],
            ),
        )
    return sorted(
        recommendations,
        key=lambda item: (
            COST_RANK.get(item["cost_level"], 5),
            -item["potential_marks_gain"],
            item["criterion_code"],
        ),
    )


def _target_recommendations(
    recommendations: list[dict],
    current_score: float,
    target: Optional[float],
):
    if target is None or target <= current_score:
        return []

    selected = []
    running_gain = 0.0
    for item in recommendations:
        if item["potential_marks_gain"] <= 0:
            continue
        selected.append(item)
        running_gain += item["potential_marks_gain"]
        if current_score + running_gain >= target:
            break
    return selected


class _FallbackRecommendationRule:
    recommendation_text = (
        "Review the UDA criterion methodology and Design Assessment evidence "
        "requirements with a qualified assessor."
    )
    recommendation_type = "manual_review"
    cost_level = "unknown"
    implementation_difficulty = "unknown"
    required_documents = None
    source_basis = None
    notes = (
        "Qualitative cost and difficulty levels are heuristic research-prototype "
        "placeholders and must be validated with industry experts before "
        "operational use."
    )
