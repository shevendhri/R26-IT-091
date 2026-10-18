from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.seed.uda_seed import UDA_CATEGORIES
from green_assessment.services.uda_preassessment_levels import get_preassessment_level
from green_assessment.services.uda_recommendations import build_uda_recommendations
from green_assessment.services.uda_scoring import evaluate_uda_criterion


router = APIRouter(tags=["uda-design-assessment"])
ASSESSMENT_STAGE = "DA"
OFFICIAL_NOTICE = "This is a preliminary assessment and is not an official UDA certification."


def _get_project_or_404(project_id: int, db: Session):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _get_uda_criterion_or_404(criterion_code: str, db: Session):
    criterion = (
        db.query(models.UdaCriterion)
        .options(selectinload(models.UdaCriterion.scoring_rules))
        .filter(
            models.UdaCriterion.framework == "UDA_BLUE_GREEN",
            models.UdaCriterion.criterion_code == criterion_code.upper(),
        )
        .first()
    )
    if criterion is None:
        raise HTTPException(status_code=404, detail="UDA criterion not found")
    return criterion


def _get_assessment(project_id: int, criterion_id: int, db: Session):
    return (
        db.query(models.UdaProjectAssessment)
        .options(
            joinedload(models.UdaProjectAssessment.criterion),
            joinedload(models.UdaProjectAssessment.selected_rule),
        )
        .filter(
            models.UdaProjectAssessment.project_id == project_id,
            models.UdaProjectAssessment.criterion_id == criterion_id,
            models.UdaProjectAssessment.assessment_stage == ASSESSMENT_STAGE,
        )
        .first()
    )


def _get_or_create_assessment(project_id: int, criterion, db: Session):
    assessment = _get_assessment(project_id, criterion.id, db)
    if assessment is None:
        assessment = models.UdaProjectAssessment(
            project_id=project_id,
            criterion_id=criterion.id,
            assessment_stage=ASSESSMENT_STAGE,
            assessment_status="not_assessed",
            scoring_mode=(
                "automatic_rule"
                if _has_machine_rules(criterion)
                else "not_machine_assessable"
            ),
            awarded_marks=0,
            maximum_marks=criterion.maximum_marks,
            requires_manual_review=not _has_machine_rules(criterion),
            explanation=(
                "Not assessed yet."
                if _has_machine_rules(criterion)
                else "Manual review required before scoring."
            ),
        )
        db.add(assessment)
        db.flush()
        assessment.criterion = criterion
    return assessment


def _has_machine_rules(criterion) -> bool:
    return any(
        rule.machine_rule_json and not rule.requires_manual_review
        for rule in criterion.scoring_rules
    )


def _assessment_response(assessment):
    criterion = assessment.criterion
    selected_rule = assessment.selected_rule
    return {
        "id": assessment.id,
        "project_id": assessment.project_id,
        "criterion_id": assessment.criterion_id,
        "criterion_code": criterion.criterion_code,
        "criterion_name": criterion.criterion_name,
        "category_code": criterion.category_code,
        "category_name": criterion.category_name,
        "assessment_stage": assessment.assessment_stage,
        "assessment_status": assessment.assessment_status,
        "scoring_mode": assessment.scoring_mode,
        "awarded_marks": assessment.awarded_marks,
        "maximum_marks": assessment.maximum_marks,
        "evidence_value": assessment.evidence_value,
        "evidence_unit": assessment.evidence_unit,
        "evidence_boolean": assessment.evidence_boolean,
        "selected_rule_id": assessment.selected_rule_id,
        "selected_rule_text": selected_rule.condition_text if selected_rule else None,
        "evidence_summary_id": assessment.evidence_summary_id,
        "score_source": assessment.score_source,
        "manual_marks": assessment.manual_marks,
        "assessor_notes": assessment.assessor_notes,
        "requires_manual_review": assessment.requires_manual_review,
        "explanation": assessment.explanation,
        "scoring_status": criterion.scoring_status,
        "automation_type": criterion.automation_type,
        "created_at": assessment.created_at,
        "updated_at": assessment.updated_at,
    }


def _default_assessment_response(project_id: int, criterion):
    machine_assessable = _has_machine_rules(criterion)
    return {
        "id": None,
        "project_id": project_id,
        "criterion_id": criterion.id,
        "criterion_code": criterion.criterion_code,
        "criterion_name": criterion.criterion_name,
        "category_code": criterion.category_code,
        "category_name": criterion.category_name,
        "assessment_stage": ASSESSMENT_STAGE,
        "assessment_status": "not_assessed",
        "scoring_mode": "automatic_rule" if machine_assessable else "not_machine_assessable",
        "awarded_marks": 0,
        "maximum_marks": criterion.maximum_marks,
        "evidence_value": None,
        "evidence_unit": None,
        "evidence_boolean": None,
        "selected_rule_id": None,
        "selected_rule_text": None,
        "evidence_summary_id": None,
        "score_source": "manual",
        "manual_marks": None,
        "assessor_notes": None,
        "requires_manual_review": not machine_assessable,
        "explanation": "Not assessed yet.",
        "scoring_status": criterion.scoring_status,
        "automation_type": criterion.automation_type,
        "created_at": None,
        "updated_at": None,
    }


@router.get(
    "/projects/{project_id}/uda-assessment",
    response_model=List[schemas.UdaProjectAssessment],
)
def get_project_uda_assessments(project_id: int, db: Session = Depends(get_db)):
    _get_project_or_404(project_id, db)
    criteria = (
        db.query(models.UdaCriterion)
        .options(selectinload(models.UdaCriterion.scoring_rules))
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.category_code, models.UdaCriterion.criterion_code)
        .all()
    )
    existing = {
        assessment.criterion_id: assessment
        for assessment in db.query(models.UdaProjectAssessment)
        .options(
            joinedload(models.UdaProjectAssessment.criterion),
            joinedload(models.UdaProjectAssessment.selected_rule),
        )
        .filter(
            models.UdaProjectAssessment.project_id == project_id,
            models.UdaProjectAssessment.assessment_stage == ASSESSMENT_STAGE,
        )
        .all()
    }
    return [
        _assessment_response(existing[criterion.id])
        if criterion.id in existing
        else _default_assessment_response(project_id, criterion)
        for criterion in criteria
    ]


@router.get(
    "/projects/{project_id}/uda-assessment/{criterion_code}",
    response_model=schemas.UdaProjectAssessment,
)
def get_project_uda_assessment(
    project_id: int,
    criterion_code: str,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    criterion = _get_uda_criterion_or_404(criterion_code, db)
    assessment = _get_assessment(project_id, criterion.id, db)
    if assessment is None:
        return _default_assessment_response(project_id, criterion)
    return _assessment_response(assessment)


@router.patch(
    "/projects/{project_id}/uda-assessment/{criterion_code}",
    response_model=schemas.UdaProjectAssessment,
)
def update_project_uda_assessment(
    project_id: int,
    criterion_code: str,
    assessment_data: schemas.UdaAssessmentUpdate,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    criterion = _get_uda_criterion_or_404(criterion_code, db)
    assessment = _get_or_create_assessment(project_id, criterion, db)

    manual_marks = assessment_data.manual_marks
    if manual_marks is not None:
        if manual_marks < 0:
            raise HTTPException(status_code=400, detail="Manual marks cannot be negative")
        if manual_marks > criterion.maximum_marks:
            raise HTTPException(
                status_code=400,
                detail="Manual marks cannot exceed criterion maximum marks",
            )
        assessment.manual_marks = manual_marks
        assessment.awarded_marks = manual_marks
        assessment.scoring_mode = "manual"
        assessment.assessment_status = (
            assessment_data.assessment_status
            or ("achieved" if manual_marks >= criterion.maximum_marks else "partially_achieved" if manual_marks > 0 else "not_achieved")
        )
        assessment.requires_manual_review = False
        assessment.explanation = (
            f"Manual DA assessment entered by assessor: {manual_marks} of "
            f"{criterion.maximum_marks} marks."
        )

    if assessment_data.assessment_status is not None and manual_marks is None:
        assessment.assessment_status = assessment_data.assessment_status
    if assessment_data.evidence_value is not None:
        assessment.evidence_value = assessment_data.evidence_value
    if assessment_data.evidence_unit is not None:
        assessment.evidence_unit = assessment_data.evidence_unit
    if assessment_data.evidence_boolean is not None:
        assessment.evidence_boolean = assessment_data.evidence_boolean
    if assessment_data.assessor_notes is not None:
        assessment.assessor_notes = assessment_data.assessor_notes

    assessment.maximum_marks = criterion.maximum_marks
    db.commit()
    db.refresh(assessment)
    return _assessment_response(assessment)


@router.post(
    "/projects/{project_id}/uda-assessment/{criterion_code}/evaluate",
    response_model=schemas.UdaEvaluationResult,
)
def evaluate_project_uda_assessment(
    project_id: int,
    criterion_code: str,
    evidence_input: schemas.UdaEvidenceInput,
    db: Session = Depends(get_db),
):
    _get_project_or_404(project_id, db)
    criterion = _get_uda_criterion_or_404(criterion_code, db)
    assessment = _get_or_create_assessment(project_id, criterion, db)
    result = evaluate_uda_criterion(criterion, evidence_input)

    assessment.assessment_status = result.assessment_status
    assessment.scoring_mode = result.scoring_mode
    assessment.awarded_marks = result.awarded_marks
    assessment.maximum_marks = criterion.maximum_marks
    assessment.evidence_value = evidence_input.value
    assessment.evidence_unit = evidence_input.unit
    assessment.evidence_boolean = evidence_input.evidence_boolean
    assessment.selected_rule_id = result.matched_rule.id if result.matched_rule else None
    assessment.manual_marks = None
    assessment.assessor_notes = evidence_input.assessor_notes
    assessment.requires_manual_review = result.requires_manual_review
    assessment.explanation = result.explanation
    assessment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assessment)
    assessment.criterion = criterion
    assessment.selected_rule = result.matched_rule

    return {
        "criterion_code": criterion.criterion_code,
        "awarded_marks": result.awarded_marks,
        "maximum_marks": criterion.maximum_marks,
        "matched_rule": result.matched_rule,
        "scoring_mode": result.scoring_mode,
        "assessment_status": result.assessment_status,
        "requires_manual_review": result.requires_manual_review,
        "explanation": result.explanation,
        "assessment": _assessment_response(assessment),
    }


@router.get(
    "/projects/{project_id}/uda-score",
    response_model=schemas.UdaProjectScoreSummary,
)
def get_project_uda_score(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    criteria = (
        db.query(models.UdaCriterion)
        .options(selectinload(models.UdaCriterion.scoring_rules))
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.category_code, models.UdaCriterion.criterion_code)
        .all()
    )
    assessments = (
        db.query(models.UdaProjectAssessment)
        .filter(
            models.UdaProjectAssessment.project_id == project_id,
            models.UdaProjectAssessment.assessment_stage == ASSESSMENT_STAGE,
        )
        .all()
    )
    assessment_by_criterion = {
        assessment.criterion_id: assessment for assessment in assessments
    }

    total_awarded = 0.0
    automatic_marks = 0.0
    manual_marks = 0.0
    assessed_count = 0
    manual_review_count = 0
    category_rows = []

    for category in UDA_CATEGORIES:
        category_criteria = [
            criterion
            for criterion in criteria
            if criterion.category_code == category["category_code"]
        ]
        category_awarded = 0.0
        category_assessed = 0
        category_manual_review = 0

        for criterion in category_criteria:
            assessment = assessment_by_criterion.get(criterion.id)
            if _criterion_still_requires_manual_review(criterion, assessment):
                category_manual_review += 1
            if assessment is None:
                continue
            category_awarded += assessment.awarded_marks
            if assessment.assessment_status != "not_assessed":
                category_assessed += 1

        category_rows.append(
            {
                "category_code": category["category_code"],
                "category_name": category["category_name"],
                "awarded_marks": category_awarded,
                "maximum_marks": sum(item.maximum_marks for item in category_criteria),
                "assessed_count": category_assessed,
                "total_criteria": len(category_criteria),
                "manual_review_required_count": category_manual_review,
            }
        )

    for criterion in criteria:
        assessment = assessment_by_criterion.get(criterion.id)
        if _criterion_still_requires_manual_review(criterion, assessment):
            manual_review_count += 1
        if assessment is None:
            continue
        total_awarded += assessment.awarded_marks
        if assessment.assessment_status != "not_assessed":
            assessed_count += 1
        if assessment.scoring_mode == "automatic_rule":
            automatic_marks += assessment.awarded_marks
        if assessment.scoring_mode == "manual":
            manual_marks += assessment.awarded_marks

    total_maximum = sum(criterion.maximum_marks for criterion in criteria)
    level = get_preassessment_level(total_awarded)
    return {
        "project_id": project.id,
        "project_name": project.name,
        "assessment_stage": ASSESSMENT_STAGE,
        "label": "UDA Design Pre-Assessment",
        "official_certification_notice": OFFICIAL_NOTICE,
        "total_awarded_marks": total_awarded,
        "total_configured_max_marks": total_maximum,
        "automatically_assessed_marks": automatic_marks,
        "manually_assessed_marks": manual_marks,
        "number_assessed": assessed_count,
        "number_not_assessed": len(criteria) - assessed_count,
        "number_manual_review_required": manual_review_count,
        "current_preassessment_level": level["level"],
        "next_preassessment_level": level["next_level"],
        "next_level_threshold": level["next_threshold"],
        "marks_to_next_level": level["marks_to_next_level"],
        "highest_level_reached": level["is_highest_level"],
        "category_breakdown": category_rows,
    }


def _criterion_still_requires_manual_review(criterion, assessment) -> bool:
    if assessment and assessment.scoring_mode == "manual":
        return False
    if assessment and assessment.requires_manual_review:
        return True
    return not _has_machine_rules(criterion)


@router.get(
    "/projects/{project_id}/uda-recommendations",
    response_model=schemas.UdaRecommendationsResponse,
)
def get_project_uda_recommendations(
    project_id: int,
    mode: str = "low_cost",
    target: Optional[float] = None,
    db: Session = Depends(get_db),
):
    if mode not in {"low_cost", "maximum_score", "target_score"}:
        raise HTTPException(
            status_code=400,
            detail="mode must be low_cost, maximum_score, or target_score",
        )
    if mode == "target_score" and target is None:
        raise HTTPException(
            status_code=400,
            detail="target is required when mode is target_score",
        )
    project = _get_project_or_404(project_id, db)
    return build_uda_recommendations(db, project, mode=mode, target=target)
