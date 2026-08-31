from green_assessment import models  # noqa: F401 - ensure SQLAlchemy models are registered
from green_assessment.database import Base, SessionLocal, engine, ensure_sqlite_schema
from green_assessment.routers import (
    dataset,
    framework_data,
    projects,
    uda,
    uda_analysis,
    uda_assessments,
    uda_evidence_scoring,
)
from green_assessment.seed.uda_seed import seed_uda_data
from fastapi import APIRouter

router = APIRouter()
router.include_router(framework_data.router)
router.include_router(projects.router)
router.include_router(uda.router)
router.include_router(uda_assessments.router)
router.include_router(uda_analysis.router)
router.include_router(uda_evidence_scoring.router)
router.include_router(dataset.router)


def init_green_assessment() -> None:
    """Create and seed the separate Green Assessment SQLite database."""
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_schema()
    with SessionLocal() as seed_db:
        seed_uda_data(seed_db)
