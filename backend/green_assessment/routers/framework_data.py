from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from green_assessment import models, schemas
from green_assessment.database import get_db
from green_assessment.seed.uda_seed import FRAMEWORK_CODE

router = APIRouter(tags=["framework-data"])


@router.get("/frameworks", response_model=List[schemas.Framework])
def get_frameworks(db: Session = Depends(get_db)):
    return db.query(models.Framework).order_by(models.Framework.name).all()


@router.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.code).all()


@router.get("/criteria", response_model=List[schemas.Criterion])
def get_uda_criteria(db: Session = Depends(get_db)):
    return (
        db.query(models.Criterion)
        .join(models.Category)
        .join(models.Framework)
        .filter(models.Framework.name == FRAMEWORK_CODE)
        .order_by(models.Category.code, models.Criterion.code)
        .all()
    )


@router.get("/criteria/grouped", response_model=List[schemas.CategoryWithCriteria])
def get_uda_criteria_grouped(db: Session = Depends(get_db)):
    return (
        db.query(models.Category)
        .join(models.Framework)
        .options(selectinload(models.Category.criteria))
        .filter(models.Framework.name == FRAMEWORK_CODE)
        .order_by(models.Category.code)
        .all()
    )


@router.get("/criteria/{code}", response_model=schemas.Criterion)
def get_criterion_by_code(code: str, db: Session = Depends(get_db)):
    criterion = (
        db.query(models.Criterion)
        .join(models.Category)
        .join(models.Framework)
        .filter(
            models.Framework.name == FRAMEWORK_CODE,
            models.Criterion.code == code,
        )
        .first()
    )
    if criterion is None:
        raise HTTPException(status_code=404, detail="Criterion not found")
    return criterion


