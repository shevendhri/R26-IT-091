# backend/inference/predictor.py
"""
GreenConstructAI - Material Recommendation Inference Module v3.0
=================================================================

CHANGES IN v3.0:
  - _build_feature_vector() now computes 6 interaction features to match
    the new training pipeline (floor_to_limit_ratio, sector_match, zone_match,
    coastal_corrosion_match, humidity_moisture_match, budget_sustainability_fit)
  - Loads and applies scaler.pkl (StandardScaler) for numeric features
  - Optional SHAP explanation via explain=True parameter
  - ml_probability now passed back to caller for adaptive hybrid weighting

Provides `predict_material()` which takes project features AND material
features, runs them through the trained model using predict_proba(),
and returns a recommendation probability (0-100).

This module:
  - Loads model artefacts ONCE at import time (cached)
  - Uses predict_proba() exclusively (never predict())
  - Returns real probabilities from the trained model
  - NEVER uses placeholder, heuristic, or hardcoded confidence values

Usage:
    from backend.inference.predictor import predict_material

    result = predict_material(
        project_features={'climate_zone': 'Wet Zone', 'sector': 'Residential', ...},
        material_features={'material_name': 'Cement Block', ...},
        explain=True   # optional: include SHAP explanation
    )
"""

import os
import json
import warnings
import functools
from pathlib import Path
from typing import Dict, Any, Optional, List

import numpy as np
import joblib

# ============================================================================
# Module-level artefact loading (happens ONCE at import)
# ============================================================================
_SCRIPT_DIR = Path(__file__).resolve().parent
_ML_DIR = _SCRIPT_DIR.parent / 'ml'

_model = None
_encoder = None
_scaler = None
_feature_columns = None
_label_encoders = None
_metadata = None
_feature_metadata = None
_model_loaded = False
_load_error = None


def _load_artefacts():
    """Load all model artefacts from disk. Called once at module import."""
    global _model, _encoder, _scaler, _feature_columns, _label_encoders
    global _metadata, _feature_metadata, _model_loaded, _load_error

    try:
        model_path   = _ML_DIR / 'best_model.pkl'
        encoder_path = _ML_DIR / 'encoder.pkl'
        scaler_path  = _ML_DIR / 'scaler.pkl'
        fc_path      = _ML_DIR / 'feature_columns.pkl'
        le_path      = _ML_DIR / 'label_encoders.pkl'
        meta_path    = _ML_DIR / 'metadata.json'
        fm_path      = _ML_DIR / 'feature_metadata.json'

        if not model_path.exists():
            _load_error = f"Model file not found: {model_path}"
            warnings.warn(f"[Predictor] {_load_error}")
            return

        calibrated_model_path = _ML_DIR / 'calibrated_model.pkl'
        if calibrated_model_path.exists():
            _model = joblib.load(calibrated_model_path)
            print(f"[Predictor] Loaded calibrated model from {calibrated_model_path}")
        else:
            _model = joblib.load(model_path)
            print(f"[Predictor] Loaded base model from {model_path}")

        if encoder_path.exists():
            _encoder = joblib.load(encoder_path)
            print(f"[Predictor] Loaded encoder from {encoder_path}")

        if scaler_path.exists():
            _scaler = joblib.load(scaler_path)
            print(f"[Predictor] Loaded scaler from {scaler_path}")
        else:
            warnings.warn("[Predictor] scaler.pkl not found — numeric features will not be scaled. "
                          "Retrain the model with train_material_recommendation.py v3.0.")

        if fc_path.exists():
            _feature_columns = joblib.load(fc_path)
            print(f"[Predictor] Loaded {len(_feature_columns)} feature columns")

        if le_path.exists():
            _label_encoders = joblib.load(le_path)
            print(f"[Predictor] Loaded label encoders for {len(_label_encoders)} columns")

        if meta_path.exists():
            with open(meta_path, 'r', encoding='utf-8') as f:
                _metadata = json.load(f)
            print(f"[Predictor] Model: {_metadata.get('model_name', 'Unknown')} "
                  f"v{_metadata.get('pipeline_version', '2.0')}")

        if fm_path.exists():
            with open(fm_path, 'r', encoding='utf-8') as f:
                _feature_metadata = json.load(f)

        _model_loaded = True
        print(f"[Predictor] All artefacts loaded successfully.")

    except Exception as e:
        _load_error = str(e)
        warnings.warn(f"[Predictor] Failed to load artefacts: {e}")


# Load artefacts at import time
_load_artefacts()


# ============================================================================
# Interaction Feature Construction
# ============================================================================
def _compute_interaction_features(combined: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute the 6 interaction features added in training pipeline v3.0.
    These must exactly mirror the logic in train_material_recommendation.py::engineer_features().

    Parameters
    ----------
    combined : dict
        Merged project + material features.

    Returns
    -------
    dict with 6 new keys added.
    """
    # Helper: safely get numeric value
    def num(key, default=0):
        val = combined.get(key, default)
        try:
            return float(val)
        except (TypeError, ValueError):
            return float(default)

    def cat(key, default=''):
        return str(combined.get(key, default)).strip()

    actual_floors    = num('actual_floor_count', 1)
    max_floors       = max(num('max_recommended_floors', 1), 1)
    coastal_exp      = num('coastal_exposure', 0)
    humidity_exp     = num('humidity_exposure', 0)
    corrosion        = num('corrosion_resistance_score', 50)
    moisture         = num('moisture_resistance_score', 50)
    carbon           = num('carbon_footprint_kgco2e', 300)
    sustainability   = num('sustainability_score', 50)
    sector           = cat('sector', '')
    climate_zone     = cat('climate_zone', '')
    budget_tier      = cat('budget_tier', '')

    rec_residential  = int(num('recommended_for_residential', 0))
    rec_commercial   = int(num('recommended_for_commercial', 0))
    rec_industrial   = int(num('recommended_for_industrial', 0))
    suit_coastal     = int(num('suitable_for_coastal', 0))
    suit_wet         = int(num('suitable_for_wet_zone', 0))
    suit_highland    = int(num('suitable_for_highland', 0))

    # 1. Floor-to-limit ratio
    floor_to_limit_ratio = round(actual_floors / max_floors, 4)

    # 2. Sector match
    sector_match = int(
        (sector == 'Residential' and rec_residential == 1) or
        (sector == 'Commercial'  and rec_commercial  == 1) or
        (sector == 'Industrial'  and rec_industrial  == 1)
    )

    # 3. Zone match
    zone_match = int(
        (climate_zone == 'Coastal'      and suit_coastal  == 1) or
        (climate_zone == 'Wet Zone'     and suit_wet      == 1) or
        (climate_zone == 'Highland'     and suit_highland == 1) or
        (climate_zone == 'Intermediate' and (suit_wet == 1 or suit_highland == 1)) or
        (climate_zone == 'Dry Zone')   # all materials cleared dry zone
    )

    # 4. Coastal × corrosion match
    coastal_corrosion_match = round(coastal_exp * corrosion / 100.0, 4)

    # 5. Humidity × moisture match
    humidity_moisture_match = round(humidity_exp * moisture / 100.0, 4)

    # 6. Budget × sustainability fit
    budget_sustainability_fit = int(
        (budget_tier == 'Low'     and carbon < 200) or
        (budget_tier == 'Medium'  and carbon < 600) or
        (budget_tier == 'Premium' and sustainability > 70)
    )

    return {
        'floor_to_limit_ratio':      floor_to_limit_ratio,
        'sector_match':              sector_match,
        'zone_match':                zone_match,
        'coastal_corrosion_match':   coastal_corrosion_match,
        'humidity_moisture_match':   humidity_moisture_match,
        'budget_sustainability_fit': budget_sustainability_fit,
    }


# ============================================================================
# Feature Vector Construction
# ============================================================================
def _build_feature_vector(project_features: Dict[str, Any],
                          material_features: Dict[str, Any]) -> np.ndarray:
    """Construct a single-row feature vector matching the training column order.

    Merges project_features and material_features, adds the 6 interaction
    features, orders them according to _feature_columns, encodes categoricals
    via the OrdinalEncoder, and scales numerics via StandardScaler.
    """
    if _feature_columns is None:
        raise RuntimeError("Feature columns not loaded. Cannot build feature vector.")

    # Merge all inputs
    combined = {}
    combined.update(project_features)
    combined.update(material_features)

    # Inject interaction features
    interaction = _compute_interaction_features(combined)
    combined.update(interaction)

    # Retrieve categorical column names from metadata
    cat_cols = _metadata.get('categorical_features', []) if _metadata else []
    num_cols = _metadata.get('numeric_features', [])    if _metadata else []

    # Build row in correct column order
    row = []
    for col in _feature_columns:
        val = combined.get(col)
        if val is None:
            # Try common name variations
            alt_keys = [col.lower(), col.replace('_', ' '), col.replace(' ', '_')]
            for ak in alt_keys:
                for k, v in combined.items():
                    if k.lower() == ak.lower():
                        val = v
                        break
                if val is not None:
                    break
            if val is None:
                val = 0  # fallback for truly missing features
        row.append(val)

    # Encode categoricals using the saved encoder
    row_array = np.array([row], dtype=object)

    if _encoder is not None and cat_cols:
        cat_indices = [i for i, col in enumerate(_feature_columns) if col in cat_cols]
        if cat_indices:
            cat_data = row_array[:, cat_indices]
            try:
                encoded = _encoder.transform(cat_data)
                for j, idx in enumerate(cat_indices):
                    row_array[0, idx] = encoded[0, j]
            except Exception as e:
                warnings.warn(f"[Predictor] Encoding error: {e}")
                for idx in cat_indices:
                    try:
                        row_array[0, idx] = float(row_array[0, idx])
                    except (ValueError, TypeError):
                        row_array[0, idx] = -1

    # Convert to float first
    row_float = row_array.astype(np.float32)

    # Scale numeric features using the saved StandardScaler
    if _scaler is not None and num_cols:
        num_indices = [i for i, col in enumerate(_feature_columns) if col in num_cols]
        if num_indices:
            try:
                num_data = row_float[:, num_indices]
                row_float[:, num_indices] = _scaler.transform(num_data)
            except Exception as e:
                warnings.warn(f"[Predictor] Scaling error: {e}")

    return row_float


# ============================================================================
# Prediction Cache (LRU)
# ============================================================================
@functools.lru_cache(maxsize=4096)
def _cached_predict(feature_tuple: tuple) -> float:
    """Cache predictions based on the feature tuple (hashable).
    Returns the raw probability for class 1.
    """
    features = np.array([list(feature_tuple)], dtype=np.float32)
    proba = _model.predict_proba(features)
    return float(proba[0][1])


# ============================================================================
# Public API
# ============================================================================
def predict_material(
    project_features: Dict[str, Any],
    material_features: Dict[str, Any],
    explain: bool = False,
) -> Dict[str, Any]:
    """Predict whether a material should be recommended for a given project.

    Parameters
    ----------
    project_features : dict
        Building/project attributes (e.g., climate_zone, sector, floor_count, etc.)
    material_features : dict
        Material properties (e.g., material_name, compressive_strength, etc.)
    explain : bool
        If True, include SHAP/feature-importance explanation in the result.

    Returns
    -------
    dict with keys:
        - probability: float (0-100) — recommendation probability from predict_proba()
        - prediction: bool — True if probability >= 50
        - confidence_level: str — 'Low' (<30), 'Medium' (30-70), 'High' (>70)
        - model: str — name of the model used
        - model_version: str — version identifier
        - pipeline_version: str — training pipeline version
        - shap_explanation: dict | None — SHAP factors (only if explain=True)
    """
    if not _model_loaded or _model is None:
        return {
            'probability': 0.0,
            'prediction': False,
            'confidence_level': 'N/A',
            'model': 'NOT_LOADED',
            'model_version': 'N/A',
            'pipeline_version': 'N/A',
            'error': _load_error or 'Model not loaded',
        }

    try:
        # Build feature vector (includes interaction features + scaling)
        feature_vec = _build_feature_vector(project_features, material_features)

        # Use cached prediction
        feature_tuple = tuple(feature_vec[0].tolist())
        prob_class1 = _cached_predict(feature_tuple)

        # Convert to percentage (0-100)
        probability = round(prob_class1 * 100, 2)
        prediction  = probability >= 50.0

        # Confidence level
        if probability < 30:
            confidence_level = 'Low'
        elif probability <= 70:
            confidence_level = 'Medium'
        else:
            confidence_level = 'High'

        model_name       = _metadata.get('model_name', 'Unknown') if _metadata else 'Unknown'
        pipeline_version = _metadata.get('pipeline_version', '2.0') if _metadata else '2.0'

        result = {
            'probability':       probability,
            'prediction':        prediction,
            'confidence_level':  confidence_level,
            'model':             model_name,
            'model_version':     '3.0',
            'pipeline_version':  pipeline_version,
            'shap_explanation':  None,
        }

        # Optional SHAP explanation
        if explain and _feature_columns:
            try:
                from backend.inference.explainer import explain_prediction
                explanation = explain_prediction(
                    feature_vec=feature_vec,
                    model=_model,
                    feature_names=_feature_columns,
                    top_n=5,
                    base_probability=None,
                )
                result['shap_explanation'] = explanation
            except Exception as e:
                warnings.warn(f"[Predictor] Explanation failed: {e}")
                result['shap_explanation'] = {'error': str(e)}

        return result

    except Exception as e:
        warnings.warn(f"[Predictor] Prediction error: {e}")
        return {
            'probability':      0.0,
            'prediction':       False,
            'confidence_level': 'Error',
            'model':            'ERROR',
            'model_version':    'N/A',
            'pipeline_version': 'N/A',
            'error':            str(e),
        }


def predict_material_batch(
    project_features: Dict[str, Any],
    materials: List[Dict[str, Any]],
    explain: bool = False,
) -> List[Dict[str, Any]]:
    """Predict recommendations for a batch of materials given the same project."""
    results = []
    for mat in materials:
        result = predict_material(project_features, mat, explain=explain)
        result['material_name'] = mat.get('material_name', mat.get('Name', 'Unknown'))
        results.append(result)
    return results


def get_model_info() -> Dict[str, Any]:
    """Return current model metadata for diagnostics."""
    if not _model_loaded:
        return {'loaded': False, 'error': _load_error}

    training_metrics_path = _ML_DIR / 'training_metrics.json'
    training_metrics = {}
    if training_metrics_path.exists():
        with open(training_metrics_path, 'r', encoding='utf-8') as f:
            training_metrics = json.load(f)

    return {
        'loaded':             True,
        'model_name':         _metadata.get('model_name', 'Unknown') if _metadata else 'Unknown',
        'pipeline_version':   _metadata.get('pipeline_version', '2.0') if _metadata else '2.0',
        'model_file':         _metadata.get('model_file', '') if _metadata else '',
        'feature_count':      len(_feature_columns) if _feature_columns else 0,
        'feature_columns':    _feature_columns or [],
        'interaction_features': _metadata.get('interaction_features', []) if _metadata else [],
        'training_date':      _metadata.get('training_date', '') if _metadata else '',
        'adaptive_weighting': _metadata.get('adaptive_weighting', False) if _metadata else False,
        'training_metrics':   training_metrics,
        'model_version':      '3.0',
        'scaler_loaded':      _scaler is not None,
        'cache_info':         _cached_predict.cache_info()._asdict(),
    }


def clear_cache():
    """Clear the prediction cache and SHAP explainer cache."""
    _cached_predict.cache_clear()
    try:
        from backend.inference.explainer import clear_explainer_cache
        clear_explainer_cache()
    except Exception:
        pass
    print("[Predictor] Cache cleared.")
