# backend/inference/explainability.py
"""
GreenConstructAI - Explainable AI Module
==========================================

Provides ML explanations for material recommendations:
  - Top contributing features per prediction (SHAP or permutation-based)
  - Engineering-ML agreement level
  - Human-readable explanation strings

All explanations come directly from the trained model — no fake or hardcoded values.
"""

import warnings
from typing import Dict, Any, List, Optional

import numpy as np

# Try to import SHAP
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

from backend.inference.predictor import (
    _model, _feature_columns, _model_loaded, _metadata, _encoder,
    _build_feature_vector,
)

# ============================================================================
# SHAP Explainer (created once, cached)
# ============================================================================
_shap_explainer = None


def _get_shap_explainer():
    """Get or create the SHAP TreeExplainer (cached)."""
    global _shap_explainer
    if _shap_explainer is not None:
        return _shap_explainer
    if not SHAP_AVAILABLE or _model is None:
        return None
    try:
        _shap_explainer = shap.TreeExplainer(_model)
        print("[XAI] SHAP TreeExplainer created successfully.")
        return _shap_explainer
    except Exception as e:
        warnings.warn(f"[XAI] Failed to create SHAP explainer: {e}")
        return None


# ============================================================================
# Feature Name Mapping (technical -> human-readable)
# ============================================================================
FEATURE_DISPLAY_NAMES = {
    'material_name': 'Material Type',
    'category': 'Material Category',
    'subcategory': 'Material Subcategory',
    'building_phase': 'Building Phase',
    'climate_zone': 'Climate Zone',
    'sector': 'Building Sector',
    'actual_floor_count': 'Floor Count',
    'building_area_m2': 'Building Area',
    'budget_tier': 'Budget Tier',
    'maintenance_preference': 'Maintenance Preference',
    'sustainability_priority': 'Sustainability Priority',
    'user_priority': 'User Priority',
    'climate_exposure_level': 'Climate Exposure Level',
    'coastal_exposure': 'Coastal Exposure',
    'humidity_exposure': 'Humidity Exposure',
    'max_recommended_floors': 'Max Recommended Floors',
    'compressive_strength_mpa': 'Compressive Strength',
    'thermal_performance_score': 'Thermal Performance',
    'moisture_resistance_score': 'Moisture Resistance',
    'corrosion_resistance_score': 'Corrosion Resistance',
    'fire_resistance_score': 'Fire Resistance',
    'durability_score': 'Durability',
    'maintenance_score': 'Maintenance Rating',
    'sustainability_score': 'Sustainability Rating',
    'carbon_footprint_kgco2e': 'Carbon Footprint',
    'service_life_years': 'Service Life',
    'suitable_for_coastal': 'Coastal Suitability',
    'suitable_for_wet_zone': 'Wet Zone Suitability',
    'suitable_for_dry_zone': 'Dry Zone Suitability',
    'suitable_for_highland': 'Highland Suitability',
    'recommended_for_residential': 'Residential Compatibility',
    'recommended_for_commercial': 'Commercial Compatibility',
    'recommended_for_industrial': 'Industrial Compatibility',
}


def _get_display_name(feature: str) -> str:
    """Return human-readable feature name."""
    return FEATURE_DISPLAY_NAMES.get(feature, feature.replace('_', ' ').title())


# ============================================================================
# ML Explanation Generation
# ============================================================================
def explain_prediction(project_features: Dict[str, Any],
                       material_features: Dict[str, Any],
                       top_n: int = 5) -> Dict[str, Any]:
    """Generate ML explanation for a single material prediction.

    Returns:
        dict with:
          - ml_top_features: list of {feature, display_name, value, impact, direction}
          - explanation_method: 'shap' or 'feature_importance'
          - feature_contributions: raw feature contribution values
    """
    if not _model_loaded or _model is None or _feature_columns is None:
        return {
            'ml_top_features': [],
            'explanation_method': 'none',
            'error': 'Model not loaded',
        }

    try:
        # Build feature vector
        feature_vec = _build_feature_vector(project_features, material_features)

        # Try SHAP first
        explainer = _get_shap_explainer()
        if explainer is not None:
            return _explain_with_shap(explainer, feature_vec, project_features,
                                       material_features, top_n)

        # Fallback: feature importance from the model
        return _explain_with_importance(feature_vec, project_features,
                                        material_features, top_n)

    except Exception as e:
        warnings.warn(f"[XAI] Explanation failed: {e}")
        return {
            'ml_top_features': [],
            'explanation_method': 'error',
            'error': str(e),
        }


def _explain_with_shap(explainer, feature_vec, project_features,
                       material_features, top_n) -> dict:
    """Generate explanation using SHAP values."""
    shap_values = explainer.shap_values(feature_vec)

    # Handle binary classification format
    if isinstance(shap_values, list) and len(shap_values) == 2:
        sv = shap_values[1][0]  # class 1 (recommended), first sample
    elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 2:
        sv = shap_values[0]
    else:
        sv = shap_values[0] if isinstance(shap_values, list) else shap_values

    # Get absolute values and sort
    abs_sv = np.abs(sv)
    top_indices = np.argsort(abs_sv)[::-1][:top_n]

    combined = {}
    combined.update(project_features)
    combined.update(material_features)

    top_features = []
    for idx in top_indices:
        col = _feature_columns[idx]
        impact = float(sv[idx])
        value = combined.get(col, feature_vec[0, idx])
        top_features.append({
            'feature': col,
            'display_name': _get_display_name(col),
            'value': value if not isinstance(value, (np.integer, np.floating)) else float(value),
            'impact': round(impact, 4),
            'direction': 'positive' if impact > 0 else 'negative',
        })

    return {
        'ml_top_features': top_features,
        'explanation_method': 'shap',
    }


_cached_feature_importances = None

def _explain_with_importance(feature_vec, project_features,
                              material_features, top_n) -> dict:
    """Fallback: use model feature importances."""
    global _cached_feature_importances
    if _cached_feature_importances is None:
        try:
            _cached_feature_importances = _model.feature_importances_
        except AttributeError:
            _cached_feature_importances = []
            
    if len(_cached_feature_importances) == 0:
        return {
            'ml_top_features': [],
            'explanation_method': 'unavailable',
        }

    importances = _cached_feature_importances
    top_indices = np.argsort(importances)[::-1][:top_n]

    combined = {}
    combined.update(project_features)
    combined.update(material_features)

    top_features = []
    for idx in top_indices:
        col = _feature_columns[idx]
        importance = float(importances[idx])
        value = combined.get(col, feature_vec[0, idx])
        top_features.append({
            'feature': col,
            'display_name': _get_display_name(col),
            'value': value if not isinstance(value, (np.integer, np.floating)) else float(value),
            'impact': round(importance, 4),
            'direction': 'positive',  # importance doesn't have direction
        })

    return {
        'ml_top_features': top_features,
        'explanation_method': 'feature_importance',
    }


# ============================================================================
# Agreement Level
# ============================================================================
def compute_agreement_level(engineering_score: float,
                            ml_probability: float) -> Dict[str, Any]:
    """Compute the Engineering-ML agreement level.

    Parameters
    ----------
    engineering_score : float (0-100)
    ml_probability : float (0-100)

    Returns
    -------
    dict with:
        - agreement_level: 'High', 'Medium', or 'Low'
        - score_difference: absolute difference
        - description: human-readable explanation
    """
    diff = abs(engineering_score - ml_probability)

    if diff <= 15:
        level = 'High'
        description = (
            f"Engineering rules ({engineering_score:.1f}) and ML prediction "
            f"({ml_probability:.1f}) are in strong agreement. "
            f"Both systems independently confirm this recommendation."
        )
    elif diff <= 30:
        level = 'Medium'
        description = (
            f"Moderate divergence ({diff:.1f} pts) between engineering "
            f"({engineering_score:.1f}) and ML ({ml_probability:.1f}). "
            f"This may indicate edge-case material-climate interaction."
        )
    else:
        level = 'Low'
        higher = 'Engineering' if engineering_score > ml_probability else 'ML'
        description = (
            f"Significant divergence ({diff:.1f} pts): {higher} scores higher. "
            f"This may indicate limited training data for this material in "
            f"this specific climate/structural configuration."
        )

    return {
        'agreement_level': level,
        'score_difference': round(diff, 1),
        'description': description,
    }


# ============================================================================
# Full Explanation Object
# ============================================================================
def build_full_explanation(
    project_features: Dict[str, Any],
    material_features: Dict[str, Any],
    engineering_score: float,
    ml_probability: float,
    engineering_explanations: List[str],
    top_n: int = 5,
) -> Dict[str, Any]:
    """Build the complete explanation payload for a single material.

    Combines engineering explanations, ML explanations, and agreement level
    into a single object for the frontend.
    """
    # ML explanation
    ml_explanation = explain_prediction(project_features, material_features, top_n)

    # Agreement
    agreement = compute_agreement_level(engineering_score, ml_probability)

    return {
        'engineering_explanations': engineering_explanations,
        'ml_confidence': round(ml_probability, 1),
        'ml_top_features': ml_explanation.get('ml_top_features', []),
        'explanation_method': ml_explanation.get('explanation_method', 'none'),
        'engine_ml_agreement': agreement['agreement_level'],
        'agreement_details': agreement,
    }
