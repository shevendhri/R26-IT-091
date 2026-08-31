from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.services import uda_project_analysis
from green_assessment.services.uda_model_inference import UdaModelInferenceError


router = APIRouter(prefix="/projects/{project_id}/uda-analysis", tags=["uda-analysis"])


@router.post("", response_model=schemas.UdaProjectAnalysisSummary)
def run_uda_analysis(project_id: int, db: Session = Depends(get_db)):
    project = _project_or_404(db, project_id)
    try:
        return uda_project_analysis.run_project_uda_analysis(db, project)
    except UdaModelInferenceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=schemas.UdaProjectAnalysisSummary)
def get_uda_analysis(project_id: int, db: Session = Depends(get_db)):
    project = _project_or_404(db, project_id)
    try:
        return uda_project_analysis.project_analysis_summary(db, project)
    except UdaModelInferenceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.patch(
    "/evidence/{evidence_id}",
    response_model=schemas.UdaProjectEvidenceItem,
)
def review_uda_evidence(
    project_id: int,
    evidence_id: int,
    payload: schemas.UdaEvidenceReviewUpdate,
    db: Session = Depends(get_db),
):
    project = _project_or_404(db, project_id)
    try:
        return uda_project_analysis.update_evidence_review(
            db,
            project,
            evidence_id=evidence_id,
            reviewed_status=payload.reviewed_status,
            reviewed_label=payload.reviewed_label,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get(
    "/{criterion_code}",
    response_model=schemas.UdaCriterionEvidenceResponse,
)
def get_criterion_uda_evidence(
    project_id: int,
    criterion_code: str,
    db: Session = Depends(get_db),
):
    project = _project_or_404(db, project_id)
    try:
        return uda_project_analysis.criterion_evidence(db, project, criterion_code)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


def _project_or_404(db: Session, project_id: int) -> models.Project:
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project
