from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.services import uda_evidence_scoring


router = APIRouter(
    prefix="/projects/{project_id}/uda-scoring-from-evidence",
    tags=["uda-evidence-scoring"],
)


@router.post("", response_model=schemas.UdaEvidenceScoringSummary)
def build_scoring_from_evidence(project_id: int, db: Session = Depends(get_db)):
    project = _project_or_404(db, project_id)
    try:
        return uda_evidence_scoring.build_evidence_scoring(db, project)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=schemas.UdaEvidenceScoringSummary)
def get_scoring_from_evidence(project_id: int, db: Session = Depends(get_db)):
    project = _project_or_404(db, project_id)
    return uda_evidence_scoring.evidence_scoring_summary(db, project)


@router.patch(
    "/{criterion_code}",
    response_model=schemas.UdaEvidenceScoringSummary,
)
def review_scoring_from_evidence(
    project_id: int,
    criterion_code: str,
    payload: schemas.UdaEvidenceScoringReviewUpdate,
    db: Session = Depends(get_db),
):
    project = _project_or_404(db, project_id)
    try:
        return uda_evidence_scoring.update_evidence_scoring_review(
            db,
            project,
            criterion_code=criterion_code.upper(),
            reviewed_status=payload.reviewed_status,
            specialist_value=payload.specialist_value,
            input_unit=payload.input_unit,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _project_or_404(db: Session, project_id: int) -> models.Project:
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project
