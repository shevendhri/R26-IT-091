import csv
import logging
import shutil
from io import StringIO
from datetime import datetime
from pathlib import Path
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.services.document_extraction import (
    DocumentExtractionError,
    extract_document_text,
    read_extracted_text,
)
from green_assessment.services.recommendations import generate_project_recommendations
from green_assessment.services.scoring import calculate_project_score
from green_assessment.services.text_chunking import build_text_chunks
from green_assessment.services import uda_evidence_scoring, uda_project_analysis
from green_assessment.services.uda_model_inference import UdaModelInferenceError
from green_assessment.seed.uda_seed import FRAMEWORK_CODE

router = APIRouter(tags=["projects"])
logger = logging.getLogger(__name__)

MODULE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = MODULE_DIR / "uploads"
EXTRACTED_TEXT_ROOT = MODULE_DIR / "extracted_text"
ALLOWED_DOCUMENT_CATEGORIES = {
    "BOQ / Cost Documents",
    "Material Specifications",
    "Energy Reports",
    "Water Reports",
    "Indoor Environmental Quality Reports",
    "Sustainable Site and Environmental Management Reports",
    "Green Innovation Documents",
    "Socio-Cultural Compatibility Documents",
    "Certificates",
    "Other",
}
ALLOWED_FILE_TYPES = {"pdf", "docx", "xlsx", "xls", "csv", "png", "jpg", "jpeg"}


def _get_uda_framework(db: Session):
    framework = (
        db.query(models.Framework)
        .filter(models.Framework.name == FRAMEWORK_CODE)
        .first()
    )
    if framework is None:
        raise HTTPException(
            status_code=404,
            detail="UDA Blue Green Sri Lanka framework not found",
        )
    return framework


def _get_project_or_404(project_id: int, db: Session):
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _get_uda_criterion_or_404(criterion_code: str, db: Session):
    criterion = (
        db.query(models.Criterion)
        .join(models.Category)
        .join(models.Framework)
        .filter(
            models.Framework.name == FRAMEWORK_CODE,
            models.Criterion.code == criterion_code,
        )
        .first()
    )
    if criterion is None:
        raise HTTPException(status_code=404, detail="Criterion not found")
    return criterion


def _project_response(project: models.Project):
    return {
        "id": project.id,
        "framework_id": project.framework_id,
        "project_name": project.name,
        "building_type": project.building_type,
        "location": project.location,
        "gross_floor_area": project.gross_floor_area,
        "owner_name": project.owner_name,
        "description": project.description,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


def _assessment_response(assessment: models.CriterionScore):
    return {
        "id": assessment.id,
        "project_id": assessment.project_id,
        "criterion_id": assessment.criterion_id,
        "criterion_code": assessment.criterion.code,
        "criterion_name": assessment.criterion.title,
        "status": assessment.status,
        "achieved_value": assessment.achieved_value,
        "achieved_points": assessment.awarded_points,
        "evidence_provided": assessment.evidence_provided,
        "notes": assessment.notes,
        "created_at": assessment.created_at,
        "updated_at": assessment.updated_at,
    }


def _document_response(document: models.UploadedDocument):
    return {
        "id": document.id,
        "project_id": document.project_id,
        "original_filename": document.original_filename,
        "stored_filename": document.stored_filename,
        "document_category": document.document_category,
        "file_type": document.file_type,
        "storage_path": document.storage_path,
        "upload_status": document.upload_status,
        "processing_status": document.processing_status,
        "uploaded_at": document.uploaded_at,
        "extraction_status": document.extraction_status,
        "extraction_method": document.extraction_method,
        "extracted_text_path": document.extracted_text_path,
        "extracted_char_count": document.extracted_char_count,
        "extraction_error": document.extraction_error,
        "processed_at": document.processed_at,
    }


def _extraction_summary(document: models.UploadedDocument):
    extracted_text = read_extracted_text(document)
    return {
        "document": _document_response(document),
        "extraction_status": document.extraction_status,
        "extraction_method": document.extraction_method,
        "extracted_char_count": document.extracted_char_count or 0,
        "processed_at": document.processed_at,
        "text_preview": extracted_text[:1000] if extracted_text else "",
        "extraction_error": document.extraction_error,
    }


def _get_document_or_404(project_id: int, document_id: int, db: Session):
    document = (
        db.query(models.UploadedDocument)
        .filter(
            models.UploadedDocument.id == document_id,
            models.UploadedDocument.project_id == project_id,
        )
        .first()
    )
    if document is None:
        raise HTTPException(status_code=404, detail="Uploaded document not found")
    return document


def _get_chunk_or_404(project_id: int, chunk_id: int, db: Session):
    chunk = (
        db.query(models.TextChunk)
        .options(joinedload(models.TextChunk.document))
        .filter(
            models.TextChunk.id == chunk_id,
            models.TextChunk.project_id == project_id,
        )
        .first()
    )
    if chunk is None:
        raise HTTPException(status_code=404, detail="Text chunk not found")
    return chunk


def _chunk_response(chunk: models.TextChunk):
    document = chunk.document
    return {
        "id": chunk.id,
        "project_id": chunk.project_id,
        "document_id": chunk.document_id,
        "document_name": document.original_filename if document else None,
        "document_category": document.document_category if document else None,
        "chunk_index": chunk.chunk_index,
        "page_number": chunk.page_number,
        "chunk_text": chunk.chunk_text,
        "char_count": chunk.char_count,
        "token_estimate": chunk.token_estimate,
        "human_label": chunk.human_label,
        "evidence_type": chunk.evidence_type,
        "is_relevant": chunk.is_relevant,
        "annotation_status": chunk.annotation_status,
        "annotation_notes": chunk.annotation_notes,
        "created_at": chunk.created_at,
        "updated_at": chunk.updated_at,
    }


def _document_has_extracted_text(document: models.UploadedDocument) -> bool:
    if document.extraction_status != "extracted":
        return False
    return bool(read_extracted_text(document))


def _extract_document_for_analysis(
    db: Session,
    project_id: int,
    document: models.UploadedDocument,
) -> None:
    document.extraction_status = "processing"
    document.processing_status = "processing"
    document.extraction_error = None
    db.commit()
    db.refresh(document)

    try:
        result = extract_document_text(document, project_id)
        document.extraction_status = "extracted"
        document.processing_status = "extracted"
        document.extraction_method = result.method
        document.extracted_text_path = result.text_path
        document.extracted_char_count = result.char_count
        document.extraction_error = None
    except (DocumentExtractionError, Exception) as exc:
        document.extraction_status = "failed"
        document.processing_status = "failed"
        document.extraction_error = str(exc)
    finally:
        document.processed_at = datetime.utcnow()
        db.commit()
        db.refresh(document)


def _ensure_document_chunks(
    db: Session,
    project_id: int,
    document: models.UploadedDocument,
) -> tuple[int, int, bool]:
    existing_count = (
        db.query(models.TextChunk)
        .filter(
            models.TextChunk.project_id == project_id,
            models.TextChunk.document_id == document.id,
        )
        .count()
    )
    if existing_count > 0:
        return existing_count, 0, True

    extracted_text = read_extracted_text(document)
    if not extracted_text:
        return 0, 0, False

    chunk_candidates = build_text_chunks(extracted_text)
    for chunk_candidate in chunk_candidates:
        db.add(
            models.TextChunk(
                project_id=project_id,
                document_id=document.id,
                chunk_index=chunk_candidate.chunk_index,
                page_number=chunk_candidate.page_number,
                chunk_text=chunk_candidate.chunk_text,
                char_count=chunk_candidate.char_count,
                token_estimate=chunk_candidate.token_estimate,
                annotation_status="unlabelled",
            )
        )
    db.commit()
    return len(chunk_candidates), len(chunk_candidates), False


def _safe_stored_filename(original_filename: str, file_type: str):
    safe_stem = "".join(
        character if character.isalnum() else "_"
        for character in Path(original_filename).stem
    ).strip("_")
    safe_stem = safe_stem[:60] or "document"
    return f"{uuid4().hex}_{safe_stem}.{file_type}"


def _safe_project_directory(root: Path, project_id: int) -> Path:
    base = root.resolve()
    project_dir = (root / f"project_{project_id}").resolve()
    if project_dir != base and base in project_dir.parents:
        return project_dir
    raise HTTPException(status_code=500, detail="Unsafe project file cleanup path")


def _cleanup_project_files(project_id: int) -> list[str]:
    removed_paths = []
    for root in (UPLOAD_ROOT, EXTRACTED_TEXT_ROOT):
        project_dir = _safe_project_directory(root, project_id)
        if not project_dir.exists():
            continue
        if not project_dir.is_dir():
            raise HTTPException(
                status_code=500,
                detail="Project file cleanup failed. Please contact the system administrator.",
            )
        try:
            shutil.rmtree(project_dir)
            removed_paths.append(str(project_dir))
        except OSError as exc:
            logger.exception("Failed to remove project directory %s", project_dir)
            raise HTTPException(
                status_code=500,
                detail="Project file cleanup failed. Please contact the system administrator.",
            ) from exc
    return removed_paths


@router.post("/projects", response_model=schemas.Project)
def create_project(project_data: schemas.ProjectCreate, db: Session = Depends(get_db)):
    framework = _get_uda_framework(db)
    project = models.Project(
        framework_id=framework.id,
        name=project_data.project_name,
        building_type=project_data.building_type,
        location=project_data.location,
        gross_floor_area=project_data.gross_floor_area,
        owner_name=project_data.owner_name,
        description=project_data.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _project_response(project)


@router.get("/projects", response_model=List[schemas.Project])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).order_by(models.Project.created_at.desc()).all()
    return [_project_response(project) for project in projects]


@router.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    return _project_response(project)


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    removed_paths = _cleanup_project_files(project_id)

    try:
        db.query(models.UdaProjectAssessment).filter(
            models.UdaProjectAssessment.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.UdaProjectCriterionEvidenceSummary).filter(
            models.UdaProjectCriterionEvidenceSummary.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.UdaProjectChunkEvidence).filter(
            models.UdaProjectChunkEvidence.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.TextChunk).filter(
            models.TextChunk.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.UploadedDocument).filter(
            models.UploadedDocument.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.CriterionScore).filter(
            models.CriterionScore.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.AssessmentResult).filter(
            models.AssessmentResult.project_id == project_id
        ).delete(synchronize_session=False)
        db.query(models.Recommendation).filter(
            models.Recommendation.project_id == project_id
        ).delete(synchronize_session=False)
        db.delete(project)
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.exception("Failed to delete project %s", project_id)
        raise HTTPException(
            status_code=500,
            detail="Project deletion failed. Please try again or contact the system administrator.",
        ) from exc

    return {
        "message": "Project deleted successfully.",
        "project_id": project_id,
        "removed_paths": removed_paths,
    }


@router.post(
    "/projects/{project_id}/documents",
    response_model=schemas.UploadedDocument,
)
async def upload_project_document(
    project_id: int,
    document_category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)

    if document_category not in ALLOWED_DOCUMENT_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unsupported document category")

    original_filename = file.filename or ""
    file_type = Path(original_filename).suffix.lower().lstrip(".")
    if file_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    project_upload_dir = UPLOAD_ROOT / f"project_{project_id}"
    project_upload_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = _safe_stored_filename(original_filename, file_type)
    storage_path = project_upload_dir / stored_filename
    storage_path.write_bytes(file_content)

    document = models.UploadedDocument(
        project_id=project_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        document_category=document_category,
        file_type=file_type.upper(),
        storage_path=str(storage_path),
        upload_status="uploaded",
        processing_status="not_processed",
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return _document_response(document)


@router.get(
    "/projects/{project_id}/documents",
    response_model=List[schemas.UploadedDocument],
)
def get_project_documents(project_id: int, db: Session = Depends(get_db)):
    _get_project_or_404(project_id, db)
    documents = (
        db.query(models.UploadedDocument)
        .filter(models.UploadedDocument.project_id == project_id)
        .order_by(models.UploadedDocument.uploaded_at.desc())
        .all()
    )
    return [_document_response(document) for document in documents]


@router.post(
    "/projects/{project_id}/prepare-uda-analysis",
    response_model=schemas.ProjectUdaAnalysisPreparationSummary,
)
def prepare_project_uda_analysis(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    documents = (
        db.query(models.UploadedDocument)
        .filter(models.UploadedDocument.project_id == project_id)
        .order_by(models.UploadedDocument.uploaded_at.asc())
        .all()
    )
    if not documents:
        raise HTTPException(
            status_code=400,
            detail="Upload at least one project document before viewing UDA analysis.",
        )

    document_results = []
    documents_processed = 0
    documents_failed = 0
    chunks_created = 0

    for document in documents:
        if not _document_has_extracted_text(document):
            _extract_document_for_analysis(db, project_id, document)
            documents_processed += 1

        chunk_count = 0
        created_count = 0
        already_had_chunks = False
        error = document.extraction_error
        if document.extraction_status == "extracted":
            chunk_count, created_count, already_had_chunks = _ensure_document_chunks(
                db,
                project_id,
                document,
            )
            chunks_created += created_count
        else:
            documents_failed += 1

        document_results.append(
            {
                "document_id": document.id,
                "document_name": document.original_filename,
                "extraction_status": document.extraction_status,
                "extraction_method": document.extraction_method,
                "extracted_char_count": document.extracted_char_count or 0,
                "chunk_count": chunk_count,
                "created_chunks": created_count,
                "already_had_chunks": already_had_chunks,
                "error": error,
            }
        )

    total_chunks = (
        db.query(models.TextChunk)
        .filter(models.TextChunk.project_id == project_id)
        .count()
    )
    if total_chunks == 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "One or more documents could not be processed. Please check the "
                "uploaded file and try again."
            ),
        )

    try:
        analysis = uda_project_analysis.run_project_uda_analysis(db, project)
    except UdaModelInferenceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    evidence_scoring = None
    scoring_warning = None
    try:
        evidence_scoring = uda_evidence_scoring.build_evidence_scoring(db, project)
    except ValueError as exc:
        scoring_warning = (
            "Document analysis completed, but proposed scoring could not be "
            f"completed for some evidence. {exc}"
        )

    return {
        "project_id": project.id,
        "project_name": project.name,
        "documents_found": len(documents),
        "documents_processed": documents_processed,
        "documents_failed": documents_failed,
        "chunks_created": chunks_created,
        "total_chunks": total_chunks,
        "document_results": document_results,
        "analysis": analysis,
        "evidence_scoring": evidence_scoring,
        "scoring_warning": scoring_warning,
    }


@router.post(
    "/projects/{project_id}/documents/{document_id}/extract",
    response_model=schemas.DocumentExtractionSummary,
)
def extract_project_document_text(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    document = _get_document_or_404(project_id, document_id, db)

    document.extraction_status = "processing"
    document.processing_status = "processing"
    document.extraction_error = None
    db.commit()
    db.refresh(document)

    try:
        result = extract_document_text(document, project_id)
        document.extraction_status = "extracted"
        document.processing_status = "extracted"
        document.extraction_method = result.method
        document.extracted_text_path = result.text_path
        document.extracted_char_count = result.char_count
        document.extraction_error = None
        document.processed_at = datetime.utcnow()
        db.commit()
        db.refresh(document)
        return _extraction_summary(document)
    except (DocumentExtractionError, Exception) as exc:
        document.extraction_status = "failed"
        document.processing_status = "failed"
        document.extraction_error = str(exc)
        document.processed_at = datetime.utcnow()
        db.commit()
        db.refresh(document)
        return _extraction_summary(document)


@router.get(
    "/projects/{project_id}/documents/{document_id}/extraction",
    response_model=schemas.DocumentExtractionSummary,
)
def get_project_document_extraction(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    document = _get_document_or_404(project_id, document_id, db)
    return _extraction_summary(document)


@router.get(
    "/projects/{project_id}/documents/{document_id}/text",
    response_model=schemas.DocumentTextResponse,
)
def get_project_document_text(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    document = _get_document_or_404(project_id, document_id, db)
    if document.extraction_status != "extracted":
        raise HTTPException(status_code=404, detail="Extracted text not found")

    extracted_text = read_extracted_text(document)
    if not extracted_text:
        raise HTTPException(status_code=404, detail="Extracted text file not found")

    return {
        "document_id": document.id,
        "project_id": document.project_id,
        "extracted_text": extracted_text,
    }


@router.post(
    "/projects/{project_id}/documents/{document_id}/chunks",
    response_model=schemas.TextChunkGenerationSummary,
)
def generate_document_chunks(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    document = _get_document_or_404(project_id, document_id, db)
    if document.extraction_status != "extracted":
        raise HTTPException(
            status_code=400,
            detail="Document must have successful text extraction before chunking",
        )

    existing_count = (
        db.query(models.TextChunk)
        .filter(
            models.TextChunk.project_id == project_id,
            models.TextChunk.document_id == document_id,
        )
        .count()
    )
    if existing_count > 0:
        return {
            "project_id": project_id,
            "document_id": document_id,
            "document_name": document.original_filename,
            "chunk_count": existing_count,
            "created_count": 0,
            "already_exists": True,
        }

    extracted_text = read_extracted_text(document)
    if not extracted_text:
        raise HTTPException(status_code=404, detail="Extracted text file not found")

    chunk_candidates = build_text_chunks(extracted_text)
    for chunk_candidate in chunk_candidates:
        db.add(
            models.TextChunk(
                project_id=project_id,
                document_id=document_id,
                chunk_index=chunk_candidate.chunk_index,
                page_number=chunk_candidate.page_number,
                chunk_text=chunk_candidate.chunk_text,
                char_count=chunk_candidate.char_count,
                token_estimate=chunk_candidate.token_estimate,
                annotation_status="unlabelled",
            )
        )

    db.commit()
    return {
        "project_id": project_id,
        "document_id": document_id,
        "document_name": document.original_filename,
        "chunk_count": len(chunk_candidates),
        "created_count": len(chunk_candidates),
        "already_exists": False,
    }


@router.get(
    "/projects/{project_id}/documents/{document_id}/chunks",
    response_model=List[schemas.TextChunk],
)
def get_document_chunks(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    _get_document_or_404(project_id, document_id, db)
    chunks = (
        db.query(models.TextChunk)
        .options(joinedload(models.TextChunk.document))
        .filter(
            models.TextChunk.project_id == project_id,
            models.TextChunk.document_id == document_id,
        )
        .order_by(models.TextChunk.chunk_index.asc())
        .all()
    )
    return [_chunk_response(chunk) for chunk in chunks]


@router.get(
    "/projects/{project_id}/documents/{document_id}",
    response_model=schemas.UploadedDocument,
)
def get_project_document(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    document = _get_document_or_404(project_id, document_id, db)
    return _document_response(document)


@router.delete("/projects/{project_id}/documents/{document_id}")
def delete_project_document(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    document = _get_document_or_404(project_id, document_id, db)
    storage_path = Path(document.storage_path)
    text_path = Path(document.extracted_text_path) if document.extracted_text_path else None

    if storage_path.exists() and storage_path.is_file():
        storage_path.unlink()
    if text_path is not None and text_path.exists() and text_path.is_file():
        text_path.unlink()

    (
        db.query(models.TextChunk)
        .filter(
            models.TextChunk.project_id == project_id,
            models.TextChunk.document_id == document_id,
        )
        .delete()
    )
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully", "document_id": document_id}


@router.get("/projects/{project_id}/score", response_model=schemas.ProjectScore)
def get_project_score(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    return calculate_project_score(project, db)


@router.get(
    "/projects/{project_id}/chunks",
    response_model=List[schemas.TextChunk],
)
def get_project_chunks(project_id: int, db: Session = Depends(get_db)):
    _get_project_or_404(project_id, db)
    chunks = (
        db.query(models.TextChunk)
        .options(joinedload(models.TextChunk.document))
        .filter(models.TextChunk.project_id == project_id)
        .order_by(models.TextChunk.document_id.asc(), models.TextChunk.chunk_index.asc())
        .all()
    )
    return [_chunk_response(chunk) for chunk in chunks]


@router.patch(
    "/projects/{project_id}/chunks/{chunk_id}",
    response_model=schemas.TextChunk,
)
def update_project_chunk_annotation(
    project_id: int,
    chunk_id: int,
    chunk_data: schemas.TextChunkUpdate,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    chunk = _get_chunk_or_404(project_id, chunk_id, db)
    update_data = chunk_data.model_dump(exclude_unset=True)

    for field_name, field_value in update_data.items():
        setattr(chunk, field_name, field_value)

    if "human_label" in update_data and update_data["human_label"]:
        chunk.human_label = update_data["human_label"].strip()

    db.commit()
    db.refresh(chunk)
    return _chunk_response(chunk)


@router.get("/projects/{project_id}/dataset/export")
def export_project_dataset(project_id: int, db: Session = Depends(get_db)):
    _get_project_or_404(project_id, db)
    chunks = (
        db.query(models.TextChunk)
        .options(joinedload(models.TextChunk.document))
        .filter(
            models.TextChunk.project_id == project_id,
            models.TextChunk.annotation_status == "labelled",
            models.TextChunk.human_label.isnot(None),
        )
        .order_by(models.TextChunk.document_id.asc(), models.TextChunk.chunk_index.asc())
        .all()
    )

    output = StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=[
            "chunk_id",
            "project_id",
            "document_id",
            "document_name",
            "document_category",
            "page_number",
            "chunk_text",
            "human_label",
            "evidence_type",
            "is_relevant",
            "annotation_status",
        ],
    )
    writer.writeheader()
    for chunk in chunks:
        document = chunk.document
        writer.writerow(
            {
                "chunk_id": chunk.id,
                "project_id": chunk.project_id,
                "document_id": chunk.document_id,
                "document_name": document.original_filename if document else "",
                "document_category": document.document_category if document else "",
                "page_number": chunk.page_number,
                "chunk_text": chunk.chunk_text,
                "human_label": chunk.human_label,
                "evidence_type": chunk.evidence_type,
                "is_relevant": chunk.is_relevant,
                "annotation_status": chunk.annotation_status,
            }
        )

    output.seek(0)
    filename = f"project_{project_id}_labelled_chunks.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get(
    "/projects/{project_id}/recommendations",
    response_model=schemas.ProjectRecommendations,
)
def get_project_recommendations(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    return generate_project_recommendations(project, db)


@router.post(
    "/projects/{project_id}/criteria/{criterion_code}/assessment",
    response_model=schemas.CriterionAssessment,
)
def save_criterion_assessment(
    project_id: int,
    criterion_code: str,
    assessment_data: schemas.CriterionAssessmentCreate,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    criterion = _get_uda_criterion_or_404(criterion_code, db)

    assessment = (
        db.query(models.CriterionScore)
        .filter(
            models.CriterionScore.project_id == project_id,
            models.CriterionScore.criterion_id == criterion.id,
        )
        .first()
    )

    if assessment is None:
        assessment = models.CriterionScore(
            project_id=project_id,
            criterion_id=criterion.id,
        )
        db.add(assessment)

    achieved_points = assessment_data.achieved_points
    assessment.status = assessment_data.status
    assessment.achieved_value = assessment_data.achieved_value
    assessment.awarded_points = achieved_points if achieved_points is not None else 0
    assessment.attempted_points = assessment.awarded_points
    assessment.evidence_provided = assessment_data.evidence_provided
    assessment.notes = assessment_data.notes

    db.commit()
    db.refresh(assessment)
    assessment.criterion = criterion
    return _assessment_response(assessment)


@router.get(
    "/projects/{project_id}/assessments",
    response_model=List[schemas.CriterionAssessment],
)
def get_project_assessments(project_id: int, db: Session = Depends(get_db)):
    _get_project_or_404(project_id, db)
    assessments = (
        db.query(models.CriterionScore)
        .options(joinedload(models.CriterionScore.criterion))
        .filter(models.CriterionScore.project_id == project_id)
        .order_by(models.CriterionScore.created_at.desc())
        .all()
    )
    return [_assessment_response(assessment) for assessment in assessments]

