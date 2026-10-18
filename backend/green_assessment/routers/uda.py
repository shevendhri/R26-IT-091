from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.seed.uda_seed import UDA_CATEGORIES


router = APIRouter(prefix="/uda", tags=["uda-blue-green"])


def _criterion_summary(criterion: models.UdaCriterion):
    return {
        "id": criterion.id,
        "framework": criterion.framework,
        "category_code": criterion.category_code,
        "category_name": criterion.category_name,
        "criterion_code": criterion.criterion_code,
        "criterion_name": criterion.criterion_name,
        "objective": criterion.objective,
        "methodology": criterion.methodology,
        "maximum_marks": criterion.maximum_marks,
        "source_page": criterion.source_page,
        "scoring_status": criterion.scoring_status,
        "automation_type": criterion.automation_type,
        "notes": criterion.notes,
    }


def _criterion_detail(criterion: models.UdaCriterion):
    required_documents = sorted(
        criterion.required_documents,
        key=lambda item: (item.assessment_stage, item.requirement_order),
    )
    return {
        **_criterion_summary(criterion),
        "scoring_rules": sorted(criterion.scoring_rules, key=lambda item: item.rule_order),
        "da_required_documents": [
            document
            for document in required_documents
            if document.assessment_stage == "DA"
        ],
        "cva_required_documents": [
            document
            for document in required_documents
            if document.assessment_stage == "CVA"
        ],
    }


@router.get("/categories")
def get_uda_categories(db: Session = Depends(get_db)):
    return [
        {
            **category,
            "framework": "UDA_BLUE_GREEN",
            "criteria_count": (
                db.query(models.UdaCriterion)
                .filter(
                    models.UdaCriterion.framework == "UDA_BLUE_GREEN",
                    models.UdaCriterion.category_code == category["category_code"],
                )
                .count()
            ),
        }
        for category in UDA_CATEGORIES
    ]


@router.get("/criteria", response_model=List[schemas.UdaCriterionSummary])
def get_uda_criteria(db: Session = Depends(get_db)):
    criteria = (
        db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.category_code, models.UdaCriterion.criterion_code)
        .all()
    )
    return [_criterion_summary(criterion) for criterion in criteria]


@router.get(
    "/criteria/grouped",
    response_model=List[schemas.UdaCategoryWithCriteria],
)
def get_uda_criteria_grouped(db: Session = Depends(get_db)):
    criteria = (
        db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.category_code, models.UdaCriterion.criterion_code)
        .all()
    )
    grouped = []
    for category in UDA_CATEGORIES:
        category_criteria = [
            _criterion_summary(criterion)
            for criterion in criteria
            if criterion.category_code == category["category_code"]
        ]
        grouped.append({**category, "criteria": category_criteria})
    return grouped


@router.get(
    "/criteria/{criterion_code}",
    response_model=schemas.UdaCriterionDetail,
)
def get_uda_criterion_by_code(criterion_code: str, db: Session = Depends(get_db)):
    criterion = (
        db.query(models.UdaCriterion)
        .options(
            selectinload(models.UdaCriterion.scoring_rules),
            selectinload(models.UdaCriterion.required_documents),
        )
        .filter(
            models.UdaCriterion.framework == "UDA_BLUE_GREEN",
            models.UdaCriterion.criterion_code == criterion_code.upper(),
        )
        .first()
    )
    if criterion is None:
        raise HTTPException(status_code=404, detail="UDA criterion not found")
    return _criterion_detail(criterion)
