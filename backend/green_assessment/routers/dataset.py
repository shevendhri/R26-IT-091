import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.services.dataset_source_pipeline import export_dataset_source_chunks
from green_assessment.services.uda_label_suggestions import (
    criterion_reference,
    dataset_statistics,
    export_labelled_training_data,
    generate_suggestions,
    suggest_label_for_chunk,
    valid_labels,
)
from green_assessment.services.uda_provisional_labelling import (
    create_provisional_labels,
    export_provisional_audit,
    export_training_candidates,
)


router = APIRouter(prefix="/dataset", tags=["dataset-annotation"])


def _chunk_or_404(chunk_id: int, db: Session):
    chunk = (
        db.query(models.DatasetSourceChunk)
        .options(joinedload(models.DatasetSourceChunk.source_document))
        .filter(models.DatasetSourceChunk.id == chunk_id)
        .first()
    )
    if chunk is None:
        raise HTTPException(status_code=404, detail="Dataset source chunk not found")
    return chunk


def _chunk_item(chunk):
    document = chunk.source_document
    return {
        "id": chunk.id,
        "source_document_id": chunk.source_document_id,
        "filename": document.filename,
        "source_path": document.source_path,
        "source_folder": chunk.source_folder,
        "chunk_index": chunk.chunk_index,
        "page_number": chunk.page_number,
        "chunk_text": chunk.chunk_text,
        "word_count": chunk.word_count,
        "token_estimate": chunk.token_estimate,
        "suggested_label": chunk.suggested_label,
        "suggestion_confidence": chunk.suggestion_confidence,
        "suggestion_reason": chunk.suggestion_reason,
        "suggestion_score": chunk.suggestion_score,
        "suggestion_candidates_json": chunk.suggestion_candidates_json,
        "provisional_label": chunk.provisional_label,
        "provisional_confidence": chunk.provisional_confidence,
        "provisional_reason": chunk.provisional_reason,
        "label_source": chunk.label_source,
        "verification_status": chunk.verification_status,
        "specialist_review_reason": chunk.specialist_review_reason,
        "human_label": chunk.human_label,
        "is_relevant": chunk.is_relevant,
        "annotation_status": chunk.annotation_status,
        "annotation_notes": chunk.annotation_notes,
        "reviewed_at": chunk.reviewed_at,
        "created_at": chunk.created_at,
        "updated_at": chunk.updated_at,
    }


@router.get("/chunks", response_model=schemas.DatasetChunkListResponse)
def get_dataset_chunks(
    source_folder: Optional[str] = None,
    annotation_status: Optional[str] = None,
    suggested_label: Optional[str] = None,
    human_label: Optional[str] = None,
    provisional_label: Optional[str] = None,
    label_source: Optional[str] = None,
    verification_status: Optional[str] = None,
    criterion: Optional[str] = None,
    filename: Optional[str] = None,
    only_unlabelled: bool = True,
    limit: int = 25,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 100))
    query = db.query(models.DatasetSourceChunk).options(
        joinedload(models.DatasetSourceChunk.source_document)
    )
    if source_folder:
        query = query.filter(models.DatasetSourceChunk.source_folder == source_folder)
    if annotation_status:
        query = query.filter(
            models.DatasetSourceChunk.annotation_status == annotation_status
        )
    elif only_unlabelled:
        query = query.filter(
            models.DatasetSourceChunk.annotation_status.in_(
                ["unlabelled", "suggested", "review_required"]
            )
        )
    if suggested_label:
        query = query.filter(models.DatasetSourceChunk.suggested_label == suggested_label)
    if human_label:
        query = query.filter(models.DatasetSourceChunk.human_label == human_label)
    if provisional_label:
        query = query.filter(
            models.DatasetSourceChunk.provisional_label == provisional_label
        )
    if label_source:
        query = query.filter(models.DatasetSourceChunk.label_source == label_source)
    if verification_status:
        query = query.filter(
            models.DatasetSourceChunk.verification_status == verification_status
        )
    if criterion:
        query = query.filter(
            (models.DatasetSourceChunk.human_label == criterion)
            | (models.DatasetSourceChunk.provisional_label == criterion)
            | (models.DatasetSourceChunk.suggested_label == criterion)
        )
    if filename:
        query = query.join(models.DatasetSourceDocument).filter(
            models.DatasetSourceDocument.filename.ilike(f"%{filename}%")
        )

    total = query.count()
    chunks = query.order_by(models.DatasetSourceChunk.id).offset(offset).limit(limit).all()
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "chunks": [_chunk_item(chunk) for chunk in chunks],
    }


@router.get("/chunks/{chunk_id}", response_model=schemas.DatasetChunkDetail)
def get_dataset_chunk(chunk_id: int, db: Session = Depends(get_db)):
    chunk = _chunk_or_404(chunk_id, db)
    item = _chunk_item(chunk)
    item["suggested_criterion"] = criterion_reference(db, chunk.suggested_label)
    return item


@router.post("/chunks/{chunk_id}/suggest", response_model=schemas.DatasetSuggestionResult)
def suggest_dataset_chunk_label(chunk_id: int, db: Session = Depends(get_db)):
    chunk = _chunk_or_404(chunk_id, db)
    criteria = (
        db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .all()
    )
    suggestion = suggest_label_for_chunk(chunk, criteria)
    chunk.suggested_label = suggestion.label
    chunk.suggestion_confidence = suggestion.confidence
    chunk.suggestion_reason = suggestion.reason
    chunk.suggestion_score = suggestion.score
    chunk.suggestion_candidates_json = json.dumps(
        [
            {
                "label": candidate.label,
                "score": candidate.score,
                "strong": candidate.strong,
                "medium": candidate.medium,
                "weak": candidate.weak,
                "conflicts": candidate.conflicts,
            }
            for candidate in suggestion.candidates
        ]
    )
    if suggestion.label and chunk.annotation_status == "unlabelled":
        chunk.annotation_status = "suggested"
    chunk.updated_at = datetime.utcnow()
    db.commit()
    return {
        "chunk_id": chunk.id,
        "suggested_label": chunk.suggested_label,
        "suggestion_confidence": chunk.suggestion_confidence,
        "suggestion_reason": chunk.suggestion_reason,
        "suggestion_score": chunk.suggestion_score,
        "suggestion_candidates_json": chunk.suggestion_candidates_json,
        "annotation_status": chunk.annotation_status,
    }


@router.patch("/chunks/{chunk_id}/annotation", response_model=schemas.DatasetChunkDetail)
def update_dataset_chunk_annotation(
    chunk_id: int,
    annotation: schemas.DatasetAnnotationUpdate,
    db: Session = Depends(get_db),
):
    chunk = _chunk_or_404(chunk_id, db)
    labels = valid_labels(db)
    if annotation.human_label and annotation.human_label not in labels:
        raise HTTPException(status_code=400, detail="Invalid UDA human label")

    chunk.human_label = annotation.human_label
    if annotation.human_label == "OTHER":
        chunk.is_relevant = False
        chunk.annotation_status = "labelled"
        chunk.label_source = "manually_corrected"
        chunk.verification_status = "verified"
        chunk.specialist_review_reason = None
    elif annotation.human_label:
        chunk.is_relevant = True if annotation.is_relevant is None else annotation.is_relevant
        chunk.annotation_status = "labelled"
        chunk.label_source = "manually_corrected"
        chunk.verification_status = "verified"
        chunk.specialist_review_reason = None
    else:
        chunk.is_relevant = annotation.is_relevant
        chunk.annotation_status = annotation.annotation_status

    if annotation.annotation_status == "review_required" and not annotation.human_label:
        chunk.annotation_status = "review_required"
        chunk.verification_status = "need_specialist_review"
        chunk.specialist_review_reason = (
            annotation.annotation_notes or "Specialist review required for primary UDA label."
        )
    chunk.annotation_notes = annotation.annotation_notes
    chunk.reviewed_at = datetime.utcnow()
    chunk.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(chunk)
    item = _chunk_item(chunk)
    item["suggested_criterion"] = criterion_reference(db, chunk.suggested_label)
    return item


@router.post(
    "/suggestions/generate",
    response_model=schemas.DatasetBulkSuggestionSummary,
)
def generate_dataset_suggestions(force: bool = False, db: Session = Depends(get_db)):
    return generate_suggestions(db, force=force)


@router.post(
    "/provisional-labels/generate",
    response_model=schemas.DatasetProvisionalSummary,
)
def generate_dataset_provisional_labels(db: Session = Depends(get_db)):
    return create_provisional_labels(db)


@router.get("/statistics", response_model=schemas.DatasetStatistics)
def get_dataset_statistics(db: Session = Depends(get_db)):
    return dataset_statistics(db)


@router.get("/export")
def export_dataset_chunks(db: Session = Depends(get_db)):
    export_path = export_dataset_source_chunks(db)
    return FileResponse(
        export_path,
        media_type="text/csv",
        filename=export_path.name,
    )


@router.get("/export/labelled")
def export_dataset_labelled_training_data(db: Session = Depends(get_db)):
    export_path = export_labelled_training_data(db)
    return FileResponse(
        export_path,
        media_type="text/csv",
        filename=export_path.name,
    )


@router.get("/export/provisional-audit")
def export_dataset_provisional_audit(db: Session = Depends(get_db)):
    export_path = export_provisional_audit(db)
    return FileResponse(
        export_path,
        media_type="text/csv",
        filename=export_path.name,
    )


@router.get("/export/training-candidates")
def export_dataset_training_candidates(db: Session = Depends(get_db)):
    export_path = export_training_candidates(db)
    return FileResponse(
        export_path,
        media_type="text/csv",
        filename=export_path.name,
    )
