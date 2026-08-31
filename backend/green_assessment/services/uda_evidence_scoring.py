from datetime import datetime
from types import SimpleNamespace
from typing import Optional

from sqlalchemy.orm import Session, joinedload, selectinload

from green_assessment import models
from green_assessment.services.uda_evidence_value_extraction import (
    ExtractedScoringValue,
    extract_scoring_value,
)
from green_assessment.services.uda_scoring import evaluate_uda_criterion


ASSESSMENT_STAGE = "DA"
MACHINE_SCORABLE_STATUSES = {"defined", "partially_defined"}
SUMMARY_REVIEW_STATUSES = {
    "unreviewed",
    "confirmed",
    "corrected",
    "insufficient_evidence",
    "manual_assessment_required",
}


def build_evidence_scoring(db: Session, project: models.Project) -> dict:
    evidence_rows = _project_evidence(db, project.id)
    if not evidence_rows:
        raise ValueError("No UDA evidence analysis records found. Run UDA document analysis first.")

    criteria = {
        criterion.criterion_code: criterion
        for criterion in db.query(models.UdaCriterion)
        .options(selectinload(models.UdaCriterion.scoring_rules))
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .all()
    }

    grouped = {}
    for evidence in evidence_rows:
        final_label = _resolved_evidence_label(evidence)
        if not final_label or final_label == "OTHER":
            continue
        grouped.setdefault(final_label, []).append(evidence)

    _add_machine_value_groups(grouped, evidence_rows, criteria)
    _remove_stale_unreviewed_summaries(db, project.id, set(grouped))

    summaries = []
    for criterion_code, rows in sorted(grouped.items()):
        criterion = criteria.get(criterion_code)
        if not criterion:
            continue
        summaries.append(_upsert_summary_for_criterion(db, project, criterion, rows))

    db.commit()
    return evidence_scoring_summary(db, project)


def evidence_scoring_summary(db: Session, project: models.Project) -> dict:
    summaries = (
        db.query(models.UdaProjectCriterionEvidenceSummary)
        .options(
            joinedload(models.UdaProjectCriterionEvidenceSummary.source_document),
            joinedload(models.UdaProjectCriterionEvidenceSummary.source_evidence),
            joinedload(models.UdaProjectCriterionEvidenceSummary.proposed_rule),
        )
        .filter(models.UdaProjectCriterionEvidenceSummary.project_id == project.id)
        .order_by(models.UdaProjectCriterionEvidenceSummary.criterion_code)
        .all()
    )
    criteria = {
        criterion.criterion_code: criterion
        for criterion in db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .all()
    }
    return {
        "project_id": project.id,
        "project_name": project.name,
        "summary_count": len(summaries),
        "scored_count": sum(1 for item in summaries if item.scoring_status == "scored"),
        "need_specialist_review_count": sum(
            1 for item in summaries if item.scoring_status == "need_specialist_review"
        ),
        "insufficient_evidence_count": sum(
            1 for item in summaries if item.scoring_status == "insufficient_evidence"
        ),
        "manual_criterion_count": sum(
            1 for item in summaries if item.scoring_status == "manual_criterion"
        ),
        "official_certification_notice": (
            "This is a preliminary assessment and is not an official UDA certification."
        ),
        "criteria": [_summary_item(item, criteria.get(item.criterion_code)) for item in summaries],
    }


def update_evidence_scoring_review(
    db: Session,
    project: models.Project,
    criterion_code: str,
    reviewed_status: str,
    specialist_value: Optional[float] = None,
    input_unit: Optional[str] = None,
) -> dict:
    if reviewed_status not in SUMMARY_REVIEW_STATUSES:
        raise ValueError("Invalid review status.")
    summary = (
        db.query(models.UdaProjectCriterionEvidenceSummary)
        .filter(
            models.UdaProjectCriterionEvidenceSummary.project_id == project.id,
            models.UdaProjectCriterionEvidenceSummary.criterion_code == criterion_code,
        )
        .first()
    )
    if not summary:
        raise ValueError("Evidence scoring summary was not found for this criterion.")

    criterion = (
        db.query(models.UdaCriterion)
        .options(selectinload(models.UdaCriterion.scoring_rules))
        .filter(
            models.UdaCriterion.framework == "UDA_BLUE_GREEN",
            models.UdaCriterion.criterion_code == criterion_code,
        )
        .first()
    )
    if not criterion:
        raise ValueError("UDA criterion was not found.")

    summary.reviewed_status = reviewed_status
    if input_unit is not None:
        summary.input_unit = input_unit
    if reviewed_status in {"confirmed", "corrected"}:
        value = specialist_value if specialist_value is not None else summary.proposed_input_value
        if value is None:
            raise ValueError("A scoring input value is required before confirmation.")
        if value < 0:
            raise ValueError("Scoring input value cannot be negative.")
        summary.specialist_value = value
        result = _evaluate_value(criterion, summary.proposed_input_metric, value, summary.input_unit)
        _apply_result_to_summary(summary, result, source="specialist")
        summary.specialist_score = result.awarded_marks
        _apply_assessment_if_safe(db, project.id, criterion, summary, result, "evidence_confirmed")
    elif reviewed_status == "insufficient_evidence":
        summary.scoring_status = "insufficient_evidence"
        summary.scoring_explanation = "Specialist marked this criterion as having insufficient scoring evidence."
    elif reviewed_status == "manual_assessment_required":
        summary.scoring_status = "manual_criterion"
        summary.scoring_explanation = "Specialist marked this criterion for manual assessment."

    summary.updated_at = datetime.utcnow()
    db.commit()
    return evidence_scoring_summary(db, project)


def _upsert_summary_for_criterion(
    db: Session,
    project: models.Project,
    criterion: models.UdaCriterion,
    evidence_rows: list[models.UdaProjectChunkEvidence],
) -> models.UdaProjectCriterionEvidenceSummary:
    summary = (
        db.query(models.UdaProjectCriterionEvidenceSummary)
        .filter(
            models.UdaProjectCriterionEvidenceSummary.project_id == project.id,
            models.UdaProjectCriterionEvidenceSummary.criterion_code
            == criterion.criterion_code,
        )
        .first()
    )
    if not summary:
        summary = models.UdaProjectCriterionEvidenceSummary(
            project_id=project.id,
            criterion_code=criterion.criterion_code,
            reviewed_status="unreviewed",
        )
        db.add(summary)
        db.flush()

    if summary.reviewed_status in {"confirmed", "corrected"}:
        return summary

    summary.updated_at = datetime.utcnow()
    summary.evidence_count = len(evidence_rows)
    if not _has_machine_rules(criterion):
        _set_manual_summary(summary, evidence_rows, "Manual Assessment Required")
        return summary

    extracted = [
        (evidence, extract_scoring_value(criterion.criterion_code, evidence.chunk_text))
        for evidence in evidence_rows
        if _evidence_allowed_for_value_extraction(evidence)
    ]
    usable = [
        (evidence, value)
        for evidence, value in extracted
        if value.metric and value.value is not None and value.confidence in {"high", "medium"}
    ]

    if not usable:
        if _has_unreviewed_review_evidence(evidence_rows):
            _set_review_summary(
                summary,
                evidence_rows,
                (
                    "Need Review From Specialist because detected evidence remains "
                    "unresolved and no clear configured scoring input value was extracted."
                ),
            )
        else:
            _set_insufficient_summary(summary, evidence_rows, extracted)
        return summary

    conflict = _conflict_notes(usable)
    if conflict:
        evidence, value = usable[0]
        _copy_value_to_summary(summary, evidence, value)
        summary.conflict_detected = True
        summary.conflict_notes = conflict
        summary.scoring_status = "need_specialist_review"
        summary.scoring_explanation = (
            "Need Review From Specialist because multiple credible evidence values conflict."
        )
        return summary

    evidence, value = _best_value(usable)
    _copy_value_to_summary(summary, evidence, value)
    result = _evaluate_value(criterion, value.metric, value.value, value.unit)
    _apply_result_to_summary(summary, result, source="proposed")
    if _has_unreviewed_review_evidence(evidence_rows):
        summary.scoring_explanation = (
            f"{summary.scoring_explanation} Specialist review recommended because "
            "one or more evidence-classification records for this criterion remain unresolved."
        )
    _apply_assessment_if_safe(db, project.id, criterion, summary, result, "evidence_proposed")
    return summary


def _evaluate_value(criterion, metric: Optional[str], value: float, unit: Optional[str]):
    evidence_input = SimpleNamespace(
        metric=metric,
        value=value,
        unit=unit,
        values={metric: value} if metric else {},
        evidence_boolean=None,
    )
    return evaluate_uda_criterion(criterion, evidence_input)


def _apply_result_to_summary(summary, result, source: str) -> None:
    summary.proposed_score = result.awarded_marks
    if source == "proposed":
        summary.specialist_score = None
    summary.proposed_rule_id = result.matched_rule.id if result.matched_rule else None
    summary.scoring_status = "scored"
    summary.scoring_explanation = (
        f"Proposed Score from document evidence: {result.explanation}"
        if source == "proposed"
        else f"Confirmed Score from specialist-reviewed value: {result.explanation}"
    )
    summary.conflict_detected = False
    summary.conflict_notes = None


def _apply_assessment_if_safe(
    db: Session,
    project_id: int,
    criterion,
    summary,
    result,
    score_source: str,
) -> None:
    assessment = (
        db.query(models.UdaProjectAssessment)
        .filter(
            models.UdaProjectAssessment.project_id == project_id,
            models.UdaProjectAssessment.criterion_id == criterion.id,
            models.UdaProjectAssessment.assessment_stage == ASSESSMENT_STAGE,
        )
        .first()
    )
    if assessment and assessment.scoring_mode == "manual":
        summary.scoring_explanation = (
            f"{summary.scoring_explanation} Existing manual assessment takes precedence, "
            "so the proposed score was not applied to the project score summary."
        )
        return
    if not assessment:
        assessment = models.UdaProjectAssessment(
            project_id=project_id,
            criterion_id=criterion.id,
            assessment_stage=ASSESSMENT_STAGE,
        )
        db.add(assessment)

    assessment.assessment_status = result.assessment_status
    assessment.scoring_mode = result.scoring_mode
    assessment.awarded_marks = result.awarded_marks
    assessment.maximum_marks = criterion.maximum_marks
    assessment.evidence_value = summary.specialist_value or summary.proposed_input_value
    assessment.evidence_unit = summary.input_unit
    assessment.selected_rule_id = result.matched_rule.id if result.matched_rule else None
    assessment.manual_marks = None
    assessment.requires_manual_review = result.requires_manual_review
    assessment.explanation = summary.scoring_explanation
    assessment.evidence_summary_id = summary.id
    assessment.score_source = score_source
    assessment.updated_at = datetime.utcnow()


def _set_manual_summary(summary, evidence_rows, message: str) -> None:
    evidence = evidence_rows[0] if evidence_rows else None
    summary.source_evidence_id = evidence.id if evidence else None
    summary.source_document_id = evidence.document_id if evidence else None
    summary.source_page = evidence.source_page if evidence else None
    summary.proposed_input_metric = None
    summary.proposed_input_value = None
    summary.input_unit = None
    summary.proposed_score = None
    summary.scoring_status = "manual_criterion"
    summary.scoring_explanation = message
    summary.conflict_detected = False
    summary.conflict_notes = None


def _set_review_summary(summary, evidence_rows, message: str) -> None:
    evidence = evidence_rows[0] if evidence_rows else None
    summary.source_evidence_id = evidence.id if evidence else None
    summary.source_document_id = evidence.document_id if evidence else None
    summary.source_page = evidence.source_page if evidence else None
    summary.proposed_score = None
    summary.scoring_status = "need_specialist_review"
    summary.scoring_explanation = message
    summary.conflict_detected = False
    summary.conflict_notes = None


def _set_insufficient_summary(summary, evidence_rows, extracted) -> None:
    evidence = evidence_rows[0] if evidence_rows else None
    value = extracted[0][1] if extracted else None
    if evidence and value:
        _copy_value_to_summary(summary, evidence, value)
    else:
        summary.source_evidence_id = evidence.id if evidence else None
        summary.source_document_id = evidence.document_id if evidence else None
        summary.source_page = evidence.source_page if evidence else None
        summary.proposed_input_metric = None
        summary.proposed_input_value = None
        summary.input_unit = None
        summary.matched_text = None
    summary.proposed_score = None
    summary.proposed_rule_id = None
    summary.scoring_status = "insufficient_evidence"
    summary.scoring_explanation = (
        "Criterion evidence was identified, but no clear configured scoring input value was extracted."
    )
    summary.conflict_detected = False
    summary.conflict_notes = None


def _copy_value_to_summary(
    summary,
    evidence: models.UdaProjectChunkEvidence,
    value: ExtractedScoringValue,
) -> None:
    summary.proposed_input_metric = value.metric
    summary.proposed_input_value = value.value
    summary.input_unit = value.unit
    summary.extraction_method = value.extraction_method
    summary.extraction_confidence = value.confidence
    summary.source_evidence_id = evidence.id
    summary.source_document_id = evidence.document_id
    summary.source_page = evidence.source_page
    summary.matched_text = value.matched_text


def _project_evidence(db: Session, project_id: int):
    return (
        db.query(models.UdaProjectChunkEvidence)
        .options(joinedload(models.UdaProjectChunkEvidence.document))
        .filter(models.UdaProjectChunkEvidence.project_id == project_id)
        .order_by(
            models.UdaProjectChunkEvidence.criterion_code,
            models.UdaProjectChunkEvidence.document_id,
            models.UdaProjectChunkEvidence.source_page,
            models.UdaProjectChunkEvidence.chunk_id,
        )
        .all()
    )


def _resolved_evidence_label(evidence) -> Optional[str]:
    if evidence.reviewed_status == "excluded":
        return None
    if evidence.reviewed_status in {"confirmed", "corrected"} and evidence.reviewed_label:
        return evidence.reviewed_label
    if evidence.decision_status == "other":
        return None
    return evidence.criterion_code


def _evidence_allowed_for_value_extraction(evidence) -> bool:
    if evidence.reviewed_status == "excluded":
        return False
    if evidence.decision_status == "other":
        return False
    return True


def _has_unreviewed_review_evidence(evidence_rows) -> bool:
    return any(
        evidence.decision_status == "need_specialist_review"
        and evidence.reviewed_status == "unreviewed"
        for evidence in evidence_rows
    )


def _has_machine_rules(criterion) -> bool:
    if criterion.scoring_status not in MACHINE_SCORABLE_STATUSES:
        return False
    return any(
        rule.machine_rule_json and not rule.requires_manual_review
        for rule in criterion.scoring_rules
    )


def _add_machine_value_groups(grouped, evidence_rows, criteria) -> None:
    machine_criteria = [
        criterion
        for criterion in criteria.values()
        if _has_machine_rules(criterion)
    ]
    active_evidence = [
        evidence for evidence in evidence_rows if _evidence_allowed_for_value_extraction(evidence)
    ]
    for criterion in machine_criteria:
        criterion_rows = grouped.setdefault(criterion.criterion_code, [])
        known_ids = {evidence.id for evidence in criterion_rows}
        for evidence in active_evidence:
            if evidence.id in known_ids:
                continue
            value = extract_scoring_value(criterion.criterion_code, evidence.chunk_text)
            if value.metric and value.value is not None and value.confidence in {"high", "medium"}:
                criterion_rows.append(evidence)
                known_ids.add(evidence.id)
        if not criterion_rows:
            grouped.pop(criterion.criterion_code, None)


def _conflict_notes(usable_values) -> Optional[str]:
    by_metric = {}
    for evidence, value in usable_values:
        by_metric.setdefault(value.metric, []).append((evidence, value))
    conflicts = []
    for metric, rows in by_metric.items():
        values = sorted({round(value.value or 0, 3) for _, value in rows})
        if len(values) <= 1:
            continue
        tolerance = 5 if metric == "building_energy_index" else 2
        if max(values) - min(values) > tolerance:
            conflicts.append(f"{metric}: {values}")
    return "; ".join(conflicts) if conflicts else None


def _best_value(usable_values):
    def rank(row):
        evidence, value = row
        review_rank = 2 if evidence.reviewed_status in {"confirmed", "corrected"} else 1
        confidence_rank = {"high": 3, "medium": 2, "low": 1}.get(value.confidence, 0)
        return review_rank, confidence_rank, evidence.id

    return sorted(usable_values, key=rank, reverse=True)[0]


def _summary_item(summary, criterion) -> dict:
    return {
        "id": summary.id,
        "project_id": summary.project_id,
        "criterion_code": summary.criterion_code,
        "criterion_name": criterion.criterion_name if criterion else summary.criterion_code,
        "category_code": criterion.category_code if criterion else None,
        "category_name": criterion.category_name if criterion else None,
        "maximum_marks": criterion.maximum_marks if criterion else None,
        "evidence_count": _evidence_count_for_summary(summary),
        "proposed_input_metric": summary.proposed_input_metric,
        "proposed_input_value": summary.proposed_input_value,
        "input_unit": summary.input_unit,
        "extraction_method": summary.extraction_method,
        "extraction_confidence": summary.extraction_confidence,
        "source_evidence_id": summary.source_evidence_id,
        "source_document_id": summary.source_document_id,
        "source_document_name": (
            summary.source_document.original_filename if summary.source_document else None
        ),
        "source_page": summary.source_page,
        "matched_text": summary.matched_text,
        "proposed_score": summary.proposed_score,
        "proposed_rule_id": summary.proposed_rule_id,
        "proposed_rule_text": (
            summary.proposed_rule.condition_text if summary.proposed_rule else None
        ),
        "scoring_status": summary.scoring_status,
        "scoring_explanation": summary.scoring_explanation,
        "specialist_value": summary.specialist_value,
        "specialist_score": summary.specialist_score,
        "reviewed_status": summary.reviewed_status,
        "conflict_detected": summary.conflict_detected,
        "conflict_notes": summary.conflict_notes,
        "specialist_review_recommended": _summary_review_recommended(summary),
        "created_at": summary.created_at,
        "updated_at": summary.updated_at,
    }


def _evidence_count_for_summary(summary) -> int:
    return summary.evidence_count or (1 if summary.source_evidence_id else 0)


def _summary_review_recommended(summary) -> bool:
    if summary.scoring_status in {"need_specialist_review", "manual_criterion"}:
        return True
    if summary.conflict_detected:
        return True
    explanation = (summary.scoring_explanation or "").lower()
    return "specialist review recommended" in explanation


def _remove_stale_unreviewed_summaries(
    db: Session,
    project_id: int,
    active_criterion_codes: set[str],
) -> None:
    stale_summaries = (
        db.query(models.UdaProjectCriterionEvidenceSummary)
        .filter(models.UdaProjectCriterionEvidenceSummary.project_id == project_id)
        .all()
    )
    for summary in stale_summaries:
        if summary.criterion_code in active_criterion_codes:
            continue
        if summary.reviewed_status in {"confirmed", "corrected"}:
            continue
        assessment = (
            db.query(models.UdaProjectAssessment)
            .filter(
                models.UdaProjectAssessment.project_id == project_id,
                models.UdaProjectAssessment.evidence_summary_id == summary.id,
                models.UdaProjectAssessment.score_source.in_(
                    ["evidence_proposed", "evidence_confirmed"]
                ),
            )
            .first()
        )
        if assessment:
            assessment.assessment_status = "not_assessed"
            assessment.awarded_marks = 0
            assessment.evidence_value = None
            assessment.evidence_unit = None
            assessment.selected_rule_id = None
            assessment.evidence_summary_id = None
            assessment.score_source = "manual"
            assessment.explanation = (
                "Evidence-derived proposal was cleared because the source "
                "evidence is no longer active for this criterion."
            )
        db.delete(summary)
