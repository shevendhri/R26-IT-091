from typing import Dict, Any, List

class RecommendationAuditEngine:
    def __init__(self):
        self._audit_store: List[Dict[str, Any]] = []

    def clear_logs(self):
        """Clears the audit logs for a new evaluation cycle."""
        self._audit_store.clear()

    def log_audit(
        self,
        category: str,
        item_name: str,
        dataset_source: str,
        dataset_row: Any,
        ml_score: float,
        engineering_score: float,
        hybrid_score: float,
        ranking: int,
        explanation: str,
        # Expanded FYP research audit fields
        material_id: int = None,
        confidence: Dict[str, Any] = None,
        prediction_source: str = None,
        engineering_rank: int = None,
        ml_rank: int = None,
        hybrid_rank: int = None,
        selection_reason: Dict[str, str] = None,
        recommendation_quality: str = None,
        engineering_confidence: Dict[str, Any] = None,
        climate_confidence: Dict[str, Any] = None,
    ) -> None:
        """
        Logs a recommendation audit trail.
        """
        audit_record = {
            "category": category,
            "item_name": item_name,
            "dataset_source": dataset_source,
            "dataset_row": dataset_row,
            "ml_score": ml_score,
            "engineering_score": engineering_score,
            "hybrid_score": hybrid_score,
            "ranking": ranking,
            "explanation": explanation,
            "material_id": material_id if material_id is not None else dataset_row,
            "confidence": confidence,
            "prediction_source": prediction_source or "ML_MODEL",
            "engineering_rank": engineering_rank if engineering_rank is not None else ranking,
            "ml_rank": ml_rank if ml_rank is not None else ranking,
            "hybrid_rank": hybrid_rank if hybrid_rank is not None else ranking,
            "selection_reason": selection_reason,
            "recommendation_quality": recommendation_quality,
            "engineering_confidence": engineering_confidence,
            "climate_confidence": climate_confidence,
        }

        # Avoid duplicate logs for the same item/category
        for r in self._audit_store:
            if r["category"] == category and r["item_name"] == item_name:
                return
        self._audit_store.append(audit_record)

    def get_logs(self) -> List[Dict[str, Any]]:
        """Returns the logged audit records."""
        return self._audit_store

audit_engine = RecommendationAuditEngine()
