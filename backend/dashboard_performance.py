from fastapi import APIRouter, HTTPException
from recommendation_engine import RecommendationEngine

router = APIRouter()
_engine = RecommendationEngine()

@router.get("/api/dashboard/performance", summary="Model performance metrics for dashboard")
def get_performance():
    """Return core model performance metrics for the research validation dashboard.
    Includes training accuracy and cross‑validation score loaded from the validation report.
    """
    try:
        return {
            "status": "success",
            "metrics": {
                "training_accuracy": round(_engine.training_accuracy, 4),
                "cross_validation_score": round(_engine.cross_validation_score, 4)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
