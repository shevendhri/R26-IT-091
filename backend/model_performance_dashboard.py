import json
from fastapi import APIRouter, HTTPException
from recommendation_engine import RecommendationEngine

router = APIRouter()

# Shared engine instance
engine = RecommendationEngine()

@router.get("/api/model/metrics")
def get_model_metrics():
    """Return core model performance metrics for the dashboard."""
    try:
        metrics = {
            "training_accuracy": round(engine.training_accuracy, 4),
            "cross_validation_score": round(engine.cross_validation_score, 4)
        }
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
