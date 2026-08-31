from sqlalchemy.orm import Session, joinedload, selectinload

from green_assessment import models


CERTIFICATION_LEVELS = [
    (40, "Certified"),
    (50, "Silver"),
    (60, "Gold"),
    (70, "Platinum"),
]

FAILED_PREREQUISITE_STATUSES = {
    "missing",
    "not_achieved",
    "missing_evidence",
}

GAP_STATUSES = {
    "missing",
    "not_achieved",
    "partially_achieved",
    "missing_evidence",
}


def calculate_project_score(project: models.Project, db: Session):
    categories = (
        db.query(models.Category)
        .join(models.Framework)
        .options(selectinload(models.Category.criteria))
        .filter(models.Category.framework_id == project.framework_id)
        .order_by(models.Category.code)
        .all()
    )

    assessments = (
        db.query(models.CriterionScore)
        .options(
            joinedload(models.CriterionScore.criterion).joinedload(
                models.Criterion.category
            )
        )
        .filter(models.CriterionScore.project_id == project.id)
        .all()
    )
    assessments_by_criterion_id = {
        assessment.criterion_id: assessment for assessment in assessments
    }

    total_score = 0.0
    max_possible_score = sum(category.max_points or 0 for category in categories)
    category_scores = []
    gaps = []
    missing_evidence = []
    prerequisite_status = "passed"

    for category in categories:
        category_achieved_points = 0.0

        for criterion in category.criteria:
            assessment = assessments_by_criterion_id.get(criterion.id)
            criterion_type = _criterion_type(criterion)
            status = assessment.status if assessment else "missing"
            achieved_points = _capped_achieved_points(assessment, criterion)

            if criterion_type == "prerequisite":
                if status in FAILED_PREREQUISITE_STATUSES:
                    prerequisite_status = "failed"
                if assessment and not assessment.evidence_provided:
                    missing_evidence.append(_missing_evidence_item(criterion, status))
                if status in GAP_STATUSES:
                    gaps.append(_gap_item(criterion, status, 0))
                continue

            category_achieved_points += achieved_points
            total_score += achieved_points

            lost_points = max((criterion.max_points or 0) - achieved_points, 0)
            if status in GAP_STATUSES:
                gaps.append(_gap_item(criterion, status, lost_points))
            if assessment and not assessment.evidence_provided:
                missing_evidence.append(_missing_evidence_item(criterion, status))

        category_scores.append(
            {
                "category": category.name,
                "achieved_points": category_achieved_points,
                "max_points": category.max_points or 0,
            }
        )

    certification_level = _certification_level(total_score)
    next_level, points_needed = _next_level(total_score)

    return {
        "project_id": project.id,
        "project_name": project.name,
        "total_score": total_score,
        "max_possible_score": max_possible_score,
        "certification_level": certification_level,
        "next_level": next_level,
        "points_needed": points_needed,
        "prerequisite_status": prerequisite_status,
        "category_scores": category_scores,
        "gaps": gaps,
        "missing_evidence": missing_evidence,
    }


def _criterion_type(criterion: models.Criterion):
    intent = criterion.intent or ""
    for line in intent.splitlines():
        if line.lower().startswith("type:"):
            return line.split(":", 1)[1].strip().lower()
    if criterion.max_points == 0:
        return "prerequisite"
    return "credit"


def _capped_achieved_points(assessment, criterion: models.Criterion):
    if assessment is None:
        return 0.0
    achieved_points = assessment.awarded_points or 0
    max_points = criterion.max_points or 0
    return min(max(achieved_points, 0), max_points)


def _certification_level(total_score: float):
    level = "Not Certified"
    for threshold, name in CERTIFICATION_LEVELS:
        if total_score >= threshold:
            level = name
    return level


def _next_level(total_score: float):
    for threshold, name in CERTIFICATION_LEVELS:
        if total_score < threshold:
            return name, threshold - total_score
    return None, 0


def _gap_item(criterion: models.Criterion, status: str, lost_points: float):
    return {
        "criterion_code": criterion.code,
        "criterion_name": criterion.title,
        "status": status,
        "lost_points": lost_points,
        "recommendation_template": _recommendation_template(criterion),
    }


def _missing_evidence_item(criterion: models.Criterion, status: str):
    return {
        "criterion_code": criterion.code,
        "criterion_name": criterion.title,
        "status": status,
    }


def _recommendation_template(criterion: models.Criterion):
    requirements = criterion.requirements or ""
    for line in requirements.splitlines():
        if line.lower().startswith("recommendation template:"):
            return line.split(":", 1)[1].strip()
    return None
