from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session, joinedload

from green_assessment import models
from green_assessment.services.uda_label_suggestions import suggest_uda_label_for_text
from green_assessment.services.uda_model_inference import (
    DEFAULT_BATCH_SIZE,
    MODEL_VERSION,
    model_metadata,
    predict_uda_criteria,
)


CANDIDATE_EVIDENCE = "candidate_evidence"
NEED_SPECIALIST_REVIEW = "need_specialist_review"
OTHER = "other"
MODEL_AMBIGUITY_MARGIN = 0.04
MODEL_LOW_CONFIDENCE = 0.12
VALID_REVIEW_STATUSES = {"unreviewed", "confirmed", "corrected", "excluded"}


def run_project_uda_analysis(
    db: Session,
    project: models.Project,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> dict:
    criteria = _uda_criteria(db)
    if not criteria:
        raise ValueError("UDA criteria are not configured.")

    chunks = (
        db.query(models.TextChunk)
        .options(joinedload(models.TextChunk.document))
        .filter(models.TextChunk.project_id == project.id)
        .order_by(models.TextChunk.document_id, models.TextChunk.chunk_index)
        .all()
    )
    if not chunks:
        raise ValueError("No project chunks found. Complete extraction and chunking first.")

    analyzable_chunks = [chunk for chunk in chunks if _is_readable_chunk(chunk.chunk_text)]
    skipped_chunks = len(chunks) - len(analyzable_chunks)
    model_predictions = predict_uda_criteria(
        [chunk.chunk_text for chunk in analyzable_chunks],
        batch_size=batch_size,
    )

    existing_by_chunk = {
        evidence.chunk_id: evidence
        for evidence in db.query(models.UdaProjectChunkEvidence)
        .filter(models.UdaProjectChunkEvidence.project_id == project.id)
        .all()
    }

    for chunk, model_prediction in zip(analyzable_chunks, model_predictions):
        rule_suggestion = suggest_uda_label_for_text(
            chunk.chunk_text,
            criteria,
            source_folder=_source_folder_hint(chunk.document),
        )
        decision = _decide_evidence(rule_suggestion, model_prediction)
        evidence = existing_by_chunk.get(chunk.id)
        if not evidence:
            evidence = models.UdaProjectChunkEvidence(
                project_id=project.id,
                document_id=chunk.document_id,
                chunk_id=chunk.id,
                reviewed_status="unreviewed",
            )
            db.add(evidence)

        evidence.document_id = chunk.document_id
        evidence.chunk_text = chunk.chunk_text
        evidence.source_page = chunk.page_number
        evidence.model_version = MODEL_VERSION
        evidence.model_label = model_prediction["predicted_label"]
        evidence.model_confidence = model_prediction["confidence"]
        evidence.model_second_label = model_prediction["second_label"]
        evidence.model_second_confidence = model_prediction["second_confidence"]
        evidence.model_margin = model_prediction["margin"]
        evidence.rule_label = rule_suggestion.label
        evidence.rule_confidence = rule_suggestion.confidence
        evidence.rule_reason = rule_suggestion.reason
        evidence.rule_runner_up = _runner_up_label(rule_suggestion)
        evidence.rule_model_agreement = bool(
            rule_suggestion.label
            and rule_suggestion.label != "OTHER"
            and rule_suggestion.label == model_prediction["predicted_label"]
        )
        evidence.criterion_code = decision["criterion_code"]
        evidence.decision_status = decision["decision_status"]
        evidence.decision_reason = decision["decision_reason"]
        evidence.updated_at = datetime.utcnow()

    db.commit()
    return project_analysis_summary(db, project)


def project_analysis_summary(db: Session, project: models.Project) -> dict:
    metadata = model_metadata()
    evidence_rows = _evidence_query(db, project.id).all()
    total_chunks = (
        db.query(models.TextChunk)
        .filter(models.TextChunk.project_id == project.id)
        .count()
    )
    grouped = _grouped_evidence(db, evidence_rows)
    return {
        "project_id": project.id,
        "project_name": project.name,
        "total_chunks": total_chunks,
        "analyzed_chunks": len(evidence_rows),
        "skipped_chunks": max(total_chunks - len(evidence_rows), 0),
        "candidate_evidence": sum(
            1 for item in evidence_rows if item.decision_status == CANDIDATE_EVIDENCE
        ),
        "need_specialist_review": sum(
            1 for item in evidence_rows if item.decision_status == NEED_SPECIALIST_REVIEW
        ),
        "other": sum(1 for item in evidence_rows if item.decision_status == OTHER),
        "criteria_detected": len(
            {item.criterion_code for item in evidence_rows if item.criterion_code}
        ),
        "documents_analyzed": len({item.document_id for item in evidence_rows}),
        "model_version": metadata["model_version"],
        "device": metadata["device"],
        "cuda_available": metadata["cuda_available"],
        "gpu": metadata["gpu"],
        "note": (
            "AI-assisted evidence classification is intended for design-stage "
            "pre-assessment. Results should be reviewed where specialist "
            "verification is indicated."
        ),
        "grouped_by_criterion": grouped,
    }


def criterion_evidence(
    db: Session,
    project: models.Project,
    criterion_code: str,
) -> dict:
    criterion = _criterion_by_code(db, criterion_code)
    if not criterion:
        raise ValueError("UDA criterion was not found.")

    rows = (
        _evidence_query(db, project.id)
        .filter(models.UdaProjectChunkEvidence.criterion_code == criterion_code)
        .all()
    )
    return {
        "project_id": project.id,
        "criterion_code": criterion.criterion_code,
        "criterion_name": criterion.criterion_name,
        "category_code": criterion.category_code,
        "category_name": criterion.category_name,
        "evidence_count": len(rows),
        "candidate_evidence": sum(
            1 for item in rows if item.decision_status == CANDIDATE_EVIDENCE
        ),
        "need_specialist_review": sum(
            1 for item in rows if item.decision_status == NEED_SPECIALIST_REVIEW
        ),
        "other": sum(1 for item in rows if item.decision_status == OTHER),
        "evidence": [_evidence_item(item) for item in rows],
    }


def update_evidence_review(
    db: Session,
    project: models.Project,
    evidence_id: int,
    reviewed_status: str,
    reviewed_label: Optional[str] = None,
) -> dict:
    if reviewed_status not in VALID_REVIEW_STATUSES:
        raise ValueError("Invalid review status.")

    evidence = (
        _evidence_query(db, project.id)
        .filter(models.UdaProjectChunkEvidence.id == evidence_id)
        .first()
    )
    if not evidence:
        raise ValueError("Evidence record was not found for this project.")

    valid_labels = {criterion.criterion_code for criterion in _uda_criteria(db)} | {"OTHER"}
    if reviewed_label and reviewed_label not in valid_labels:
        raise ValueError("Invalid reviewed label.")

    if reviewed_status == "confirmed":
        evidence.reviewed_label = reviewed_label or evidence.criterion_code
        if not evidence.reviewed_label:
            raise ValueError("There is no proposed criterion to confirm.")
    elif reviewed_status == "corrected":
        if not reviewed_label:
            raise ValueError("A corrected criterion label is required.")
        evidence.reviewed_label = reviewed_label
    elif reviewed_status == "excluded":
        evidence.reviewed_label = reviewed_label or "OTHER"
    else:
        evidence.reviewed_label = reviewed_label

    evidence.reviewed_status = reviewed_status
    evidence.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(evidence)
    return _evidence_item(evidence)


def _decide_evidence(rule_suggestion, model_prediction: dict) -> dict:
    model_label = model_prediction["predicted_label"]
    model_confidence = model_prediction["confidence"]
    model_margin = model_prediction["margin"]
    model_is_ambiguous = model_margin < MODEL_AMBIGUITY_MARGIN
    model_is_low = model_confidence < MODEL_LOW_CONFIDENCE
    rule_label = rule_suggestion.label
    rule_is_high = rule_suggestion.confidence == "high"
    rule_has_conflict = bool(
        rule_suggestion.candidates and rule_suggestion.candidates[0].conflicts
    )
    rule_is_ambiguous = (
        len(rule_suggestion.candidates) > 1
        and (rule_suggestion.candidates[0].score - rule_suggestion.candidates[1].score) < 4
    )

    if not rule_label and (model_label == "OTHER" or model_is_low):
        return {
            "criterion_code": None,
            "decision_status": OTHER,
            "decision_reason": "No reliable UDA criterion evidence was identified.",
        }

    if rule_has_conflict or rule_is_ambiguous or model_is_ambiguous:
        return {
            "criterion_code": rule_label or (None if model_label == "OTHER" else model_label),
            "decision_status": NEED_SPECIALIST_REVIEW,
            "decision_reason": (
                "Need review from specialist because rule or model signals are ambiguous."
            ),
        }

    if rule_is_high and rule_label and rule_label == model_label:
        return {
            "criterion_code": rule_label,
            "decision_status": CANDIDATE_EVIDENCE,
            "decision_reason": (
                "Candidate evidence: high-confidence deterministic rule signal agrees "
                "with DistilBERT V1."
            ),
        }

    if rule_label and model_label and rule_label != model_label and model_label != "OTHER":
        return {
            "criterion_code": rule_label,
            "decision_status": NEED_SPECIALIST_REVIEW,
            "decision_reason": (
                "Need review from specialist because deterministic rule and "
                "DistilBERT V1 predict different criteria."
            ),
        }

    if rule_is_high and rule_label:
        return {
            "criterion_code": rule_label,
            "decision_status": NEED_SPECIALIST_REVIEW,
            "decision_reason": (
                "Need review from specialist: deterministic rule found strong evidence, "
                "but the model signal is uncertain or does not agree."
            ),
        }

    if not rule_label and model_label != "OTHER":
        return {
            "criterion_code": model_label,
            "decision_status": NEED_SPECIALIST_REVIEW,
            "decision_reason": (
                "Need review from specialist: only DistilBERT V1 identified a UDA topic."
            ),
        }

    return {
        "criterion_code": rule_label,
        "decision_status": NEED_SPECIALIST_REVIEW,
        "decision_reason": "Need review from specialist before using this chunk as evidence.",
    }


def _evidence_query(db: Session, project_id: int):
    return (
        db.query(models.UdaProjectChunkEvidence)
        .options(
            joinedload(models.UdaProjectChunkEvidence.document),
            joinedload(models.UdaProjectChunkEvidence.chunk),
        )
        .filter(models.UdaProjectChunkEvidence.project_id == project_id)
        .order_by(
            models.UdaProjectChunkEvidence.criterion_code,
            models.UdaProjectChunkEvidence.document_id,
            models.UdaProjectChunkEvidence.source_page,
            models.UdaProjectChunkEvidence.chunk_id,
        )
    )


def _grouped_evidence(db: Session, evidence_rows) -> list[dict]:
    criteria = {criterion.criterion_code: criterion for criterion in _uda_criteria(db)}
    groups = {}
    for item in evidence_rows:
        if not item.criterion_code:
            continue
        group = groups.setdefault(
            item.criterion_code,
            {
                "criterion_code": item.criterion_code,
                "criterion_name": criteria.get(item.criterion_code).criterion_name
                if item.criterion_code in criteria
                else item.criterion_code,
                "category_code": criteria.get(item.criterion_code).category_code
                if item.criterion_code in criteria
                else None,
                "category_name": criteria.get(item.criterion_code).category_name
                if item.criterion_code in criteria
                else None,
                "evidence_count": 0,
                "candidate_evidence": 0,
                "need_specialist_review": 0,
                "other": 0,
                "evidence": [],
            },
        )
        group["evidence_count"] += 1
        if item.decision_status == CANDIDATE_EVIDENCE:
            group["candidate_evidence"] += 1
        elif item.decision_status == NEED_SPECIALIST_REVIEW:
            group["need_specialist_review"] += 1
        elif item.decision_status == OTHER:
            group["other"] += 1
        group["evidence"].append(_evidence_item(item))

    return sorted(groups.values(), key=lambda group: group["criterion_code"])


def _evidence_item(item: models.UdaProjectChunkEvidence) -> dict:
    return {
        "id": item.id,
        "project_id": item.project_id,
        "document_id": item.document_id,
        "document_name": item.document.original_filename if item.document else None,
        "chunk_id": item.chunk_id,
        "criterion_code": item.criterion_code,
        "chunk_text": item.chunk_text,
        "source_page": item.source_page,
        "model_version": item.model_version,
        "model_label": item.model_label,
        "model_confidence": item.model_confidence,
        "model_second_label": item.model_second_label,
        "model_second_confidence": item.model_second_confidence,
        "model_margin": item.model_margin,
        "rule_label": item.rule_label,
        "rule_confidence": item.rule_confidence,
        "rule_reason": item.rule_reason,
        "rule_runner_up": item.rule_runner_up,
        "rule_model_agreement": item.rule_model_agreement,
        "decision_status": item.decision_status,
        "decision_reason": item.decision_reason,
        "reviewed_label": item.reviewed_label,
        "reviewed_status": item.reviewed_status,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def _uda_criteria(db: Session) -> list[models.UdaCriterion]:
    return (
        db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.criterion_code)
        .all()
    )


def _criterion_by_code(db: Session, criterion_code: str):
    return (
        db.query(models.UdaCriterion)
        .filter(
            models.UdaCriterion.framework == "UDA_BLUE_GREEN",
            models.UdaCriterion.criterion_code == criterion_code,
        )
        .first()
    )


def _runner_up_label(rule_suggestion) -> Optional[str]:
    if len(rule_suggestion.candidates) < 2:
        return None
    return rule_suggestion.candidates[1].label


def _source_folder_hint(document: Optional[models.UploadedDocument]) -> str:
    if not document:
        return ""
    category = (document.document_category or "").lower()
    if "energy" in category:
        return "energy"
    if "water" in category:
        return "water"
    if "material" in category or "boq" in category:
        return "materials"
    if "architectural" in category:
        return "site"
    if "mep" in category:
        return "mixed_green_building_reports"
    return "mixed_green_building_reports"


def _is_readable_chunk(text: str) -> bool:
    stripped = " ".join((text or "").split())
    if len(stripped) < 40:
        return False
    words = stripped.split()
    if len(words) < 8:
        return False
    letters = sum(1 for char in stripped if char.isalpha())
    return letters / max(len(stripped), 1) >= 0.25
