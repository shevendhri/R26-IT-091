# backend/utils.py
"""Utility functions and constants for GreenConstructAI backend.
Centralizes scoring, exposure classification, marine‑grade detection,
and category normalization to guarantee a single source of truth.
"""

from __future__ import annotations
import os

# ---------------------------------------------------------------------------
# Category aliases – canonical mapping used throughout the pipeline
# ---------------------------------------------------------------------------
CATEGORY_MAP = {
    "Foundation": "foundation",
    "Structural": "structural",
    "Concrete": "concrete",
    "Walling": "walls",
    "Roofing": "roofing",
    "Windows": "windows",
    "Doors": "doors",
    "Flooring": "flooring",
    "Ceiling": "ceiling",
    "Waterproofing": "waterproofing",
    "Finishing": "finishes",
}

# ---------------------------------------------------------------------------
# Hybrid scoring helper
# ---------------------------------------------------------------------------
def annual_lifecycle_cost(initial_cost: float, service_life: float, maintenance_factor: float | None = None) -> float:
    """Calculate an annualized lifecycle cost.

    ``initial_cost / service_life`` gives a base annual cost.
    ``maintenance_factor`` (if provided) is added; otherwise a
    fallback of 5 % of the initial cost is used.
    """
    if service_life <= 0:
        return float('inf')
    base = initial_cost / service_life
    if maintenance_factor is None:
        maintenance_factor = 0.05 * initial_cost
    return round(base + maintenance_factor, 2)

def calculate_hybrid_score(
    eng_score: float | None,
    ml_score: float | None,
    vetoed: bool = False,
    ml_probability: float | None = None,
    return_details: bool = False,
) -> float | tuple[float | None, dict] | None:
    """Return the hybrid score using adaptive confidence-based weighting.

    Rules:
    * Engineering veto is unconditional — if ``vetoed`` is True the score
      is forced to ``0.0`` regardless of ML confidence.
    * If either component score is ``None`` the hybrid score cannot be
      computed and ``None`` is returned.
    * Adaptive weighting schedule based on ML prediction confidence:

        ML prob < 30%  →  Engineering 85% / ML 15%  (low ML confidence)
        30% ≤ ML prob < 60% → Engineering 70% / ML 30% (moderate ML confidence)
        ML prob ≥ 60%  →  Engineering 60% / ML 40%  (good/high ML confidence)

    * Final score is normalized to [0, 100].
    """
    if vetoed:
        weight_info = {
            'eng_weight': 1.0, 'ml_weight': 0.0,
            'reason': 'engineering_veto', 'ml_probability': ml_probability,
        }
        return (0.0, weight_info) if return_details else 0.0

    if eng_score is None or ml_score is None:
        return (None, {}) if return_details else None

    # Adaptive weighting based on ML prediction confidence (Issue 4 threshold spec)
    if ml_probability is not None:
        p = float(ml_probability)
        if p >= 60.0:
            eng_weight = 0.60
            reason = 'high_ml_confidence'
        elif p >= 30.0:
            eng_weight = 0.70
            reason = 'moderate_ml_confidence'
        else:
            eng_weight = 0.85
            reason = 'low_ml_confidence'
    else:
        # Fallback: env-var or default
        try:
            eng_weight = float(os.getenv("HYBRID_ENGINEERING_WEIGHT", "0.70"))
            if not 0 <= eng_weight <= 1:
                eng_weight = 0.70
        except Exception:
            eng_weight = 0.70
        reason = 'default_fixed'

    ml_weight = round(1.0 - eng_weight, 2)
    raw_score = (eng_weight * float(eng_score)) + (ml_weight * float(ml_score))
    score = round(max(0.0, min(100.0, raw_score)), 2)
    weight_info = {
        'eng_weight': round(eng_weight, 2),
        'ml_weight': ml_weight,
        'reason': reason,
        'ml_probability': ml_probability,
    }
    return (score, weight_info) if return_details else score

# ---------------------------------------------------------------------------
# Marine‑grade need detection
# ---------------------------------------------------------------------------
def is_marine_needed(salinity: str, distance_km: float) -> bool:
    """Return ``True`` when marine‑grade materials are required.

    The rule is *high* salinity **or** distance to coast < 2 km.
    ``salinity`` is case‑insensitive.
    """
    return salinity.lower() == "high" or distance_km < 2.0

# ---------------------------------------------------------------------------
# Exposure level classification
# ---------------------------------------------------------------------------
def engineering_confidence(constraints_passed: int, total_constraints: int) -> float:
    """Calculate engineering confidence as the percentage of constraints passed.

    Returns a value between 0 and 100.
    """
    if total_constraints == 0:
        return 100.0
    return round((constraints_passed / total_constraints) * 100, 1)

def classify_exposure(score: float, salinity: str, distance_km: float) -> str:
    """Classify exposure based on score, salinity and distance.

    Returns internal identifiers that are later mapped to UI‑friendly labels.
    """
    if score > 70 and (salinity.lower() == "high" or distance_km < 2.0):
        return "Very High"
    if score >= 40:
        return "Moderate"
    return "Low"

# ---------------------------------------------------------------------------
# UI label mapping for exposure levels
# ---------------------------------------------------------------------------
EXPOSURE_UI_LABELS = {
    "Low": "Standard Exposure",
    "Moderate": "Elevated Exposure",
    "Very High": "Severe Marine Exposure",
}

# ---------------------------------------------------------------------------
# Helper to map internal exposure to UI label (frontend may import via API)
# ---------------------------------------------------------------------------
# Baseline carbon values (kg CO₂ per kg of material)
BASELINE_CARBON = {
    "Standard Concrete": 0.12,
    "Clay Brick": 0.10,
    "Steel Rebar": 1.80,
}

def co2_reduction(selected_carbon: float, baseline_material: str) -> float:
    """Calculate CO₂ reduction relative to a baseline material.

    ``baseline_material`` must be a key in ``BASELINE_CARBON``.
    Returns ``baseline - selected`` (positive = reduction).
    """
    baseline = BASELINE_CARBON.get(baseline_material, 0.0)
    return round(baseline - selected_carbon, 4)

def climate_confidence(material: dict, climate: dict) -> float:
    """Derive climate confidence from matching engineering criteria.

    Checks five climate‑related properties on the material and returns the
    percentage of criteria that meet the climate requirements.
    """
    criteria = {
        "moisture": float(material.get("Moisture_Resistance", 0)) >= 70,
        "corrosion": float(material.get("Corrosion_Resistance", 0)) >= 70,
        "thermal": float(material.get("Thermal_Rating", 0)) >= 70,
        "climate_risk": float(material.get("Climate_Risk_Score", 100)) <= 30,
        "sustainability": float(material.get("Sustainability_Rating", 0)) >= 50,
    }
    matched = sum(1 for v in criteria.values() if v)
    return round((matched / len(criteria)) * 100, 1)

def get_suitability_badge(eng_score: float) -> dict:
    """Returns the suitability label and color based on the engineering score."""
    if eng_score is None:
        return None
    if eng_score >= 95:
        return {"text": "Excellent Match", "color": "var(--eco-glow)"}
    elif eng_score >= 85:
        return {"text": "Very Good Match", "color": "#10b981"}
    elif eng_score >= 75:
        return {"text": "Good Match", "color": "#3b82f6"}
    elif eng_score >= 65:
        return {"text": "Acceptable", "color": "#fbbf24"}
    return {"text": "Conditional Recommendation", "color": "#ef4444"}


# ---------------------------------------------------------------------------
# Deterministic recommendation sorting helper (used in recommendation engine)
# ---------------------------------------------------------------------------
def deterministic_sort_key(item: dict) -> tuple:
    """Key for stable sorting of recommendation candidates.

    Sorting is performed in descending order, so the tuple is returned in the
    natural order used by ``sorted(..., reverse=True)``.
    """
    return (
        item.get("hybrid_score", 0),
        item.get("eng_score", 0),
        item.get("service_life", 0),
    )

# ---------------------------------------------------------------------------
# API version metadata (could be imported by ``app.py``)
# ---------------------------------------------------------------------------
API_METADATA = {
    "scoring_model": "hybrid_adaptive_v3",
    "audit_synced": True,
    "adaptive_weighting": True,
    "leakage_fix": True,
    "interaction_features": 6,
    "pipeline_version": "3.0",
}
