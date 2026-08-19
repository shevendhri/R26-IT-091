# backend/inference/explainer.py
"""
GreenConstructAI - ML Prediction Explainer v3.1 (Phase 4)
===========================================================

Provides human-readable SHAP / feature contribution explanations for material predictions.

Returns structured dictionary containing:
  - top_positive_features: list of positive human-readable factor strings (e.g. "Zone Match (+18%)")
  - top_negative_features: list of negative human-readable factor strings (e.g. "Floor Ratio (-5%)")
  - feature_contributions: dict of feature_name -> contribution %
  - base_probability: float
  - formatted_explanations: list of all top factor strings
"""

import warnings
from typing import Dict, Any, List, Optional
import numpy as np

# Feature display name mapping for research & production UI readability
FEATURE_DISPLAY_NAMES = {
    'zone_match': 'Zone Match',
    'sector_match': 'Sector Match',
    'floor_to_limit_ratio': 'Floor Ratio',
    'coastal_corrosion_match': 'Coastal Corrosion Resistance',
    'humidity_moisture_match': 'Humidity Moisture Resistance',
    'budget_sustainability_fit': 'Budget Fit',
    'corrosion_resistance_score': 'Corrosion Resistance',
    'moisture_resistance_score': 'Moisture Resistance',
    'compressive_strength_mpa': 'Compressive Strength',
    'thermal_performance_score': 'Thermal Performance',
    'fire_resistance_score': 'Fire Resistance',
    'durability_score': 'Durability Rating',
    'maintenance_score': 'Maintenance Rating',
    'sustainability_score': 'Sustainability Rating',
    'carbon_footprint_kgco2e': 'Embodied Carbon',
    'service_life_years': 'Service Life',
    'actual_floor_count': 'Floor Count',
    'building_area_m2': 'Building Area',
    'max_recommended_floors': 'Max Recommended Floors',
    'coastal_exposure': 'Coastal Exposure Flag',
    'humidity_exposure': 'Humidity Exposure Flag',
    'suitable_for_coastal': 'Coastal Suitable Flag',
    'suitable_for_wet_zone': 'Wet Zone Suitable Flag',
    'suitable_for_dry_zone': 'Dry Zone Suitable Flag',
    'suitable_for_highland': 'Highland Suitable Flag',
    'recommended_for_residential': 'Residential Sector Flag',
    'recommended_for_commercial': 'Commercial Sector Flag',
    'recommended_for_industrial': 'Industrial Sector Flag',
    'material_name': 'Material Name',
    'category': 'Category',
    'subcategory': 'Subcategory',
    'building_phase': 'Building Phase',
    'climate_zone': 'Climate Zone',
    'sector': 'Sector',
    'budget_tier': 'Budget Tier',
    'maintenance_preference': 'Maintenance Preference',
    'sustainability_priority': 'Sustainability Priority',
    'user_priority': 'User Priority',
    'climate_exposure_level': 'Climate Exposure Level',
}

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

_shap_explainer = None
_explainer_model_id = None


def _get_shap_explainer(model):
    """Load or return cached SHAP TreeExplainer for the given model."""
    global _shap_explainer, _explainer_model_id

    # If wrapped in CalibratedClassifierCV, unwrap base estimator for SHAP
    base_model = model
    if hasattr(model, 'calibrated_classifiers_') and len(model.calibrated_classifiers_) > 0:
        base_model = model.calibrated_classifiers_[0].estimator
    elif hasattr(model, 'estimator'):
        base_model = model.estimator

    model_id = id(base_model)
    if _shap_explainer is not None and _explainer_model_id == model_id:
        return _shap_explainer

    if not SHAP_AVAILABLE:
        return None

    try:
        _shap_explainer = shap.TreeExplainer(base_model)
        _explainer_model_id = model_id
        return _shap_explainer
    except Exception as e:
        warnings.warn(f"[Explainer] Could not build SHAP explainer: {e}")
        return None


def explain_prediction(
    feature_vec: np.ndarray,
    model,
    feature_names: List[str],
    top_n: int = 5,
    base_probability: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Compute human-readable feature explanations for a single material recommendation prediction.
    """
    explanation = {
        'top_positive': [],
        'top_negative': [],
        'top_positive_features': [],
        'top_negative_features': [],
        'feature_contributions': {},
        'base_probability': base_probability or 50.0,
        'formatted_explanations': [],
        'method': 'none',
    }

    if feature_vec is None or len(feature_names) == 0:
        return explanation

    # Unwrap if CalibratedClassifierCV
    target_model = model
    if hasattr(model, 'calibrated_classifiers_') and len(model.calibrated_classifiers_) > 0:
        target_model = model.calibrated_classifiers_[0].estimator
    elif hasattr(model, 'estimator'):
        target_model = model.estimator

    # ── SHAP Explanation ───────────────────────────────────────────────────
    explainer = _get_shap_explainer(target_model)
    if explainer is not None:
        try:
            shap_vals = explainer.shap_values(feature_vec)
            if isinstance(shap_vals, list) and len(shap_vals) == 2:
                sv = shap_vals[1][0]
                base_val = float(explainer.expected_value[1])
            else:
                sv = shap_vals[0] if shap_vals.ndim == 2 else shap_vals
                base_val = float(explainer.expected_value) if np.isscalar(explainer.expected_value) else float(explainer.expected_value[0])

            sv_pct = sv * 100.0

            contributions = []
            feat_dict = {}
            for i, name in enumerate(feature_names):
                val_pct = round(float(sv_pct[i]), 2)
                disp_name = FEATURE_DISPLAY_NAMES.get(name, name.replace('_', ' ').title())
                feat_dict[disp_name] = val_pct
                contributions.append({'raw': name, 'display': disp_name, 'shap': val_pct})

            contributions.sort(key=lambda x: abs(x['shap']), reverse=True)

            positives = [c for c in contributions if c['shap'] > 0][:top_n]
            negatives = [c for c in contributions if c['shap'] < 0][:top_n]

            def fmt_str(c: dict) -> str:
                sign = '+' if c['shap'] >= 0 else ''
                return f"{c['display']} ({sign}{c['shap']:.0f}%)"

            pos_strings = [fmt_str(c) for c in positives]
            neg_strings = [fmt_str(c) for c in negatives]

            explanation['top_positive'] = pos_strings
            explanation['top_negative'] = neg_strings
            explanation['top_positive_features'] = pos_strings
            explanation['top_negative_features'] = neg_strings
            explanation['feature_contributions'] = feat_dict
            explanation['base_probability'] = round(base_val * 100, 2)
            explanation['formatted_explanations'] = pos_strings + neg_strings
            explanation['method'] = 'shap'

            return explanation

        except Exception as e:
            warnings.warn(f"[Explainer] SHAP inference failed: {e}. Falling back.")

    # ── Fallback: Gini Feature Importance ──────────────────────────────────
    if hasattr(target_model, 'feature_importances_'):
        importances = target_model.feature_importances_
        contributions = []
        feat_dict = {}

        for i, name in enumerate(feature_names):
            val = float(feature_vec[0, i]) if feature_vec.ndim == 2 else float(feature_vec[i])
            disp_name = FEATURE_DISPLAY_NAMES.get(name, name.replace('_', ' ').title())
            direction = 1.0 if val >= 0 else -1.0
            pct = round(float(importances[i] * 100 * direction), 2)
            feat_dict[disp_name] = pct
            contributions.append({
                'raw': name,
                'display': disp_name,
                'importance': float(importances[i] * 100),
                'direction': direction,
                'pct': pct
            })

        contributions.sort(key=lambda x: abs(x['importance']), reverse=True)
        positives = [c for c in contributions if c['direction'] >= 0][:top_n]
        negatives = [c for c in contributions if c['direction'] < 0][:top_n]

        def fmt_imp(c: dict) -> str:
            sign = '+' if c['direction'] >= 0 else '-'
            return f"{c['display']} ({sign}{c['importance']:.0f}%)"

        pos_strings = [fmt_imp(c) for c in positives]
        neg_strings = [fmt_imp(c) for c in negatives]

        explanation['top_positive'] = pos_strings
        explanation['top_negative'] = neg_strings
        explanation['top_positive_features'] = pos_strings
        explanation['top_negative_features'] = neg_strings
        explanation['feature_contributions'] = feat_dict
        explanation['base_probability'] = 50.0
        explanation['formatted_explanations'] = pos_strings + neg_strings
        explanation['method'] = 'feature_importance'

    return explanation


def clear_explainer_cache():
    """Clear the cached SHAP explainer."""
    global _shap_explainer, _explainer_model_id
    _shap_explainer = None
    _explainer_model_id = None
