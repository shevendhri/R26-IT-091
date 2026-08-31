import csv
import json
import random
import re
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import joinedload

from green_assessment import models
from green_assessment.services.uda_label_suggestions import HIGH_MARGIN


AUDIT_EXPORT_PATH = Path("dataset_exports") / "uda_provisional_audit.csv"
TRAINING_CANDIDATES_EXPORT_PATH = (
    Path("dataset_exports") / "uda_training_candidates.csv"
)

# Rule-assisted labels are weak/provisional supervision derived from deterministic
# UDA criterion matching. They are not equivalent to labels independently
# validated by a green-building specialist.

GENERIC_OTHER_PATTERNS = [
    r"\bcopyright\b",
    r"\ball rights reserved\b",
    r"\bisbn\b",
    r"\bpublication or report no\b",
    r"\btable of contents\b",
    r"\bcontents\b.{0,80}\bchapter\b",
    r"\breferences\b",
    r"\bbibliography\b",
    r"\bappendix\b.{0,80}\bpage\b",
    r"\bindex\b.{0,80}\bpage\b",
    r"\bdisclaimer\b",
    r"\backnowledg(e)?ments\b",
]

GENERIC_OTHER_EXCLUSIONS = [
    "photovoltaic",
    "renewable energy",
    "rainwater",
    "wastewater",
    "recycled content",
    "thermal comfort",
    "co2",
    "carbon dioxide",
    "lighting power",
    "energy consumption",
    "stormwater",
    "low-voc",
    "voc",
]


def create_provisional_labels(db):
    chunks = (
        db.query(models.DatasetSourceChunk)
        .options(joinedload(models.DatasetSourceChunk.source_document))
        .order_by(models.DatasetSourceChunk.id)
        .all()
    )

    summary = {
        "chunks_scanned": len(chunks),
        "provisional_uda_labels": 0,
        "provisional_other": 0,
        "verified": 0,
        "need_specialist_review": 0,
        "excluded": 0,
        "preserved_human_labels": 0,
        "training_candidates": 0,
        "class_distribution": {},
    }

    for chunk in chunks:
        _apply_chunk_provisional_state(chunk, summary)
        chunk.updated_at = datetime.utcnow()

    db.commit()
    audit_path = export_provisional_audit(db)
    training_path = export_training_candidates(db)
    distribution = class_distribution(db)

    summary.update(
        {
            "audit_csv_path": str(audit_path),
            "training_candidates_csv_path": str(training_path),
            "class_distribution": distribution["classes"],
            "other_count": distribution["other_count"],
            "training_candidates": distribution["total_training_candidates"],
        }
    )
    return summary


def export_provisional_audit(db, export_path: Path = AUDIT_EXPORT_PATH) -> Path:
    export_path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    criteria = [
        criterion.criterion_code
        for criterion in db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.criterion_code)
        .all()
    ]
    for label in criteria:
        rows.extend(_sample_chunks(db, label, 5))
    rows.extend(_sample_chunks(db, "OTHER", 50))
    random.Random(42).shuffle(rows)

    with export_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "chunk_id",
                "filename",
                "source_folder",
                "page_number",
                "chunk_text",
                "provisional_label",
                "provisional_confidence",
                "provisional_reason",
                "label_source",
                "verification_status",
            ],
        )
        writer.writeheader()
        for chunk in rows:
            writer.writerow(_audit_row(chunk))
    return export_path


def export_training_candidates(
    db, export_path: Path = TRAINING_CANDIDATES_EXPORT_PATH
) -> Path:
    export_path.parent.mkdir(parents=True, exist_ok=True)
    rows = (
        db.query(models.DatasetSourceChunk)
        .options(joinedload(models.DatasetSourceChunk.source_document))
        .order_by(models.DatasetSourceChunk.id)
        .all()
    )
    with export_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "chunk_id",
                "filename",
                "source_folder",
                "page_number",
                "chunk_text",
                "final_training_label",
                "label_source",
                "verification_status",
                "confidence",
                "reason",
            ],
        )
        writer.writeheader()
        for chunk in rows:
            candidate = _training_candidate_row(chunk)
            if candidate:
                writer.writerow(candidate)
    return export_path


def class_distribution(db):
    criteria = [
        criterion.criterion_code
        for criterion in db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.criterion_code)
        .all()
    ]
    chunks = db.query(models.DatasetSourceChunk).all()
    classes = []
    total_training = 0
    for label in criteria:
        provisional_count = sum(
            1
            for chunk in chunks
            if chunk.provisional_label == label
            and chunk.verification_status == "provisional"
        )
        verified_count = sum(1 for chunk in chunks if chunk.human_label == label)
        training_count = verified_count + sum(
            1
            for chunk in chunks
            if chunk.provisional_label == label
            and chunk.verification_status == "provisional"
            and chunk.provisional_confidence == "high"
            and not _looks_like_ocr_garbage(chunk.chunk_text)
        )
        total_training += training_count
        classes.append(
            {
                "label": label,
                "provisional_count": provisional_count,
                "verified_count": verified_count,
                "training_candidate_count": training_count,
            }
        )

    other_provisional = sum(
        1
        for chunk in chunks
        if chunk.provisional_label == "OTHER"
        and chunk.verification_status == "provisional"
    )
    other_verified = sum(1 for chunk in chunks if chunk.human_label == "OTHER")
    other_training_count = other_verified + sum(
        1
        for chunk in chunks
        if chunk.provisional_label == "OTHER"
        and chunk.verification_status == "provisional"
        and chunk.provisional_confidence == "high"
        and not _looks_like_ocr_garbage(chunk.chunk_text)
    )
    total_training += other_training_count

    return {
        "classes": classes,
        "other_count": other_provisional + other_verified,
        "other_provisional_count": other_provisional,
        "other_verified_count": other_verified,
        "other_training_candidate_count": other_training_count,
        "need_specialist_review_count": sum(
            1
            for chunk in chunks
            if chunk.verification_status == "need_specialist_review"
        ),
        "excluded_count": sum(
            1 for chunk in chunks if chunk.verification_status == "excluded"
        ),
        "total_training_candidates": total_training,
    }


def _apply_chunk_provisional_state(chunk, summary):
    if chunk.human_label:
        chunk.provisional_label = None
        chunk.provisional_confidence = None
        chunk.provisional_reason = None
        chunk.label_source = "manually_corrected"
        chunk.verification_status = "verified"
        chunk.specialist_review_reason = None
        summary["verified"] += 1
        summary["preserved_human_labels"] += 1
        return

    candidate = _top_candidate(chunk)
    if _is_high_confidence_eligible(chunk, candidate):
        chunk.provisional_label = chunk.suggested_label
        chunk.provisional_confidence = chunk.suggestion_confidence
        chunk.provisional_reason = chunk.suggestion_reason
        chunk.label_source = "rule_assisted"
        chunk.verification_status = "provisional"
        chunk.specialist_review_reason = None
        summary["provisional_uda_labels"] += 1
        return

    if _is_safe_other(chunk):
        chunk.provisional_label = "OTHER"
        chunk.provisional_confidence = "high"
        chunk.provisional_reason = "Rule-assisted OTHER: generic publication, navigation, reference, or administration text with no UDA sustainability topic detected."
        chunk.label_source = "rule_assisted"
        chunk.verification_status = "provisional"
        chunk.specialist_review_reason = None
        summary["provisional_other"] += 1
        return

    chunk.provisional_label = None
    chunk.provisional_confidence = chunk.suggestion_confidence
    chunk.provisional_reason = None
    chunk.label_source = None
    chunk.verification_status = "need_specialist_review"
    chunk.specialist_review_reason = _specialist_review_reason(chunk, candidate)
    summary["need_specialist_review"] += 1


def _is_high_confidence_eligible(chunk, candidate) -> bool:
    if not chunk.suggested_label or chunk.suggestion_confidence != "high":
        return False
    if not candidate:
        return False
    if not candidate.get("strong"):
        return False
    if candidate.get("conflicts"):
        return False
    score = float(candidate.get("score") or 0)
    runner_up = _runner_up(chunk)
    runner_up_score = float(runner_up.get("score") or 0) if runner_up else 0
    return score - runner_up_score >= HIGH_MARGIN


def _is_safe_other(chunk) -> bool:
    if chunk.suggested_label:
        return False
    text = _normalize(chunk.chunk_text)
    if any(term in text for term in GENERIC_OTHER_EXCLUSIONS):
        return False
    if chunk.word_count > 120:
        return False
    return any(re.search(pattern, text) for pattern in GENERIC_OTHER_PATTERNS)


def _specialist_review_reason(chunk, candidate) -> str:
    if not chunk.suggested_label:
        return "No reliable criterion-specific rule-assisted suggestion."
    if chunk.suggestion_confidence in {"medium", "low"}:
        return f"{chunk.suggestion_confidence.title()} suggestion strength requires specialist validation."
    if candidate and candidate.get("conflicts"):
        return "Conflicting or exclusion phrases detected."
    if candidate and not candidate.get("strong"):
        return "No strong criterion-specific evidence phrase was matched."
    return "Multiple or ambiguous UDA topics may be present."


def _sample_chunks(db, label: str, limit: int):
    query = (
        db.query(models.DatasetSourceChunk)
        .options(joinedload(models.DatasetSourceChunk.source_document))
        .filter(models.DatasetSourceChunk.provisional_label == label)
        .filter(models.DatasetSourceChunk.verification_status == "provisional")
        .all()
    )
    if len(query) <= limit:
        return query
    return random.Random(label).sample(query, limit)


def _training_candidate_row(chunk):
    if chunk.human_label and chunk.verification_status == "verified":
        return {
            "chunk_id": chunk.id,
            "filename": chunk.source_document.filename,
            "source_folder": chunk.source_folder,
            "page_number": chunk.page_number,
            "chunk_text": chunk.chunk_text,
            "final_training_label": chunk.human_label,
            "label_source": chunk.label_source or "manually_corrected",
            "verification_status": "verified",
            "confidence": "verified",
            "reason": chunk.annotation_notes or "Verified label saved by researcher/specialist.",
        }
    if (
        chunk.provisional_label
        and chunk.label_source == "rule_assisted"
        and chunk.verification_status == "provisional"
        and chunk.provisional_confidence == "high"
        and not _looks_like_ocr_garbage(chunk.chunk_text)
    ):
        return {
            "chunk_id": chunk.id,
            "filename": chunk.source_document.filename,
            "source_folder": chunk.source_folder,
            "page_number": chunk.page_number,
            "chunk_text": chunk.chunk_text,
            "final_training_label": chunk.provisional_label,
            "label_source": "rule_assisted",
            "verification_status": "provisional",
            "confidence": chunk.provisional_confidence,
            "reason": chunk.provisional_reason,
        }
    return None


def _audit_row(chunk):
    return {
        "chunk_id": chunk.id,
        "filename": chunk.source_document.filename,
        "source_folder": chunk.source_folder,
        "page_number": chunk.page_number,
        "chunk_text": chunk.chunk_text,
        "provisional_label": chunk.provisional_label,
        "provisional_confidence": chunk.provisional_confidence,
        "provisional_reason": chunk.provisional_reason,
        "label_source": chunk.label_source,
        "verification_status": chunk.verification_status,
    }


def _top_candidate(chunk):
    try:
        candidates = json.loads(chunk.suggestion_candidates_json or "[]")
    except json.JSONDecodeError:
        return None
    return candidates[0] if candidates else None


def _runner_up(chunk):
    try:
        candidates = json.loads(chunk.suggestion_candidates_json or "[]")
    except json.JSONDecodeError:
        return None
    return candidates[1] if len(candidates) > 1 else None


def _looks_like_ocr_garbage(text: str) -> bool:
    stripped = "".join(text.split())
    if len(stripped) < 30:
        return True
    alpha_count = sum(1 for char in stripped if char.isalpha())
    return alpha_count / max(len(stripped), 1) < 0.35


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())
