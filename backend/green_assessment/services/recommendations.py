from sqlalchemy.orm import Session, selectinload

from green_assessment import models
from green_assessment.services.scoring import (
    FAILED_PREREQUISITE_STATUSES,
    calculate_project_score,
    _capped_achieved_points,
    _criterion_type,
    _recommendation_template,
)


RECOMMENDATION_STATUSES = {
    "not_achieved",
    "partially_achieved",
    "missing_evidence",
}


def generate_project_recommendations(project: models.Project, db: Session):
    score = calculate_project_score(project, db)
    categories = (
        db.query(models.Category)
        .options(selectinload(models.Category.criteria))
        .filter(models.Category.framework_id == project.framework_id)
        .order_by(models.Category.code)
        .all()
    )
    assessments = (
        db.query(models.CriterionScore)
        .filter(models.CriterionScore.project_id == project.id)
        .all()
    )
    assessments_by_criterion_id = {
        assessment.criterion_id: assessment for assessment in assessments
    }

    critical_recommendations = []
    score_improvement_recommendations = []

    for category in categories:
        for criterion in category.criteria:
            assessment = assessments_by_criterion_id.get(criterion.id)
            status = assessment.status if assessment else "missing"
            achieved_points = _capped_achieved_points(assessment, criterion)
            max_points = criterion.max_points or 0
            possible_points_gain = max(max_points - achieved_points, 0)

            if _criterion_type(criterion) == "prerequisite":
                if _is_failed_prerequisite(status, assessment):
                    critical_recommendations.append(
                        {
                            "criterion_code": criterion.code,
                            "criterion_name": criterion.title,
                            "reason": _prerequisite_reason(status, assessment),
                            "recommendation": _recommendation_template(criterion),
                        }
                    )
                continue

            if possible_points_gain <= 0:
                continue

            if status in RECOMMENDATION_STATUSES or achieved_points < max_points:
                score_improvement_recommendations.append(
                    {
                        "criterion_code": criterion.code,
                        "criterion_name": criterion.title,
                        "current_points": achieved_points,
                        "max_points": max_points,
                        "possible_points_gain": possible_points_gain,
                        "recommendation": _recommendation_template(criterion),
                    }
                )

    score_improvement_recommendations.sort(
        key=lambda item: item["possible_points_gain"],
        reverse=True,
    )

    selected_recommendations = _recommendations_for_next_level(
        score_improvement_recommendations,
        score["points_needed"],
    )

    return {
        "project_id": project.id,
        "project_name": project.name,
        "current_score": score["total_score"],
        "certification_level": score["certification_level"],
        "next_level": score["next_level"],
        "points_needed": score["points_needed"],
        "critical_recommendations": critical_recommendations,
        "score_improvement_recommendations": selected_recommendations,
    }


def _is_failed_prerequisite(status: str, assessment):
    if status in FAILED_PREREQUISITE_STATUSES:
        return True
    return bool(assessment and not assessment.evidence_provided)


def _prerequisite_reason(status: str, assessment):
    if assessment and not assessment.evidence_provided:
        return "Prerequisite missing evidence"
    if status == "missing":
        return "Prerequisite not assessed"
    if status == "missing_evidence":
        return "Prerequisite missing evidence"
    if status == "not_achieved":
        return "Prerequisite not achieved"
    return "Prerequisite not achieved"


def _recommendations_for_next_level(recommendations, points_needed: float):
    if points_needed <= 0:
        return []

    selected = []
    accumulated_points = 0.0
    for recommendation in recommendations:
        selected.append(recommendation)
        accumulated_points += recommendation["possible_points_gain"]
        if accumulated_points >= points_needed:
            break
    return selected
