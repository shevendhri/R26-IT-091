# backend/inference/predictor.py
"""
GreenConstructAI - Material Recommendation Inference Module
============================================================

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
        material_features={'material_name': 'Cement Block', 'compressive_strength_mpa': 7, ...}
    )
    # result = {
    #     'probability': 91.6,
    #     'prediction': True,
    #     'confidence_level': 'High',
    #     'model': 'RandomForest',
    #     'model_version': '2.0',
    # }
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
_feature_columns = None
_label_encoders = None
_metadata = None
_feature_metadata = None
_model_loaded = False
_load_error = None


def _load_artefacts():
    """Load all model artefacts from disk. Called once at module import."""
    global _model, _encoder, _feature_columns, _label_encoders
    global _metadata, _feature_metadata, _model_loaded, _load_error

    try:
        model_path = _ML_DIR / 'best_model.pkl'
        encoder_path = _ML_DIR / 'encoder.pkl'
        fc_path = _ML_DIR / 'feature_columns.pkl'
        le_path = _ML_DIR / 'label_encoders.pkl'
        meta_path = _ML_DIR / 'metadata.json'
        fm_path = _ML_DIR / 'feature_metadata.json'

        if not model_path.exists():
            _load_error = f"Model file not found: {model_path}"
            warnings.warn(f"[Predictor] {_load_error}")
            return

        _model = joblib.load(model_path)
        print(f"[Predictor] Loaded model from {model_path}")

        if encoder_path.exists():
            _encoder = joblib.load(encoder_path)
            print(f"[Predictor] Loaded encoder from {encoder_path}")

        if fc_path.exists():
            _feature_columns = joblib.load(fc_path)
            print(f"[Predictor] Loaded {len(_feature_columns)} feature columns")

        if le_path.exists():
            _label_encoders = joblib.load(le_path)
            print(f"[Predictor] Loaded label encoders for {len(_label_encoders)} columns")

        if meta_path.exists():
            with open(meta_path, 'r', encoding='utf-8') as f:
                _metadata = json.load(f)
            print(f"[Predictor] Model: {_metadata.get('model_name', 'Unknown')}")

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
# Feature Vector Construction
# ============================================================================
def _build_feature_vector(project_features: Dict[str, Any],
                          material_features: Dict[str, Any]) -> np.ndarray:
    """Construct a single-row feature vector matching the training column order.

    Merges project_features and material_features into one dict,
    then orders them according to _feature_columns and encodes
    categoricals using the saved OrdinalEncoder.
    """
    if _feature_columns is None:
        raise RuntimeError("Feature columns not loaded. Cannot build feature vector.")

    # Merge both dicts
    combined = {}
    combined.update(project_features)
    combined.update(material_features)

    # Build row in correct column order
    row = []
    cat_cols = _metadata.get('categorical_features', []) if _metadata else []

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
                # Use -1 for unknown categories
                for idx in cat_indices:
                    try:
                        row_array[0, idx] = float(row_array[0, idx])
                    except (ValueError, TypeError):
                        row_array[0, idx] = -1

    return row_array.astype(np.float32)


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
    # proba shape: (1, 2) for binary classification
    return float(proba[0][1])


# ============================================================================
# Public API
# ============================================================================
def predict_material(project_features: Dict[str, Any],
                     material_features: Dict[str, Any]) -> Dict[str, Any]:
    """Predict whether a material should be recommended for a given project.

    Parameters
    ----------
    project_features : dict
        Building/project attributes (e.g., climate_zone, sector, floor_count, etc.)
    material_features : dict
        Material properties (e.g., material_name, compressive_strength, etc.)

    Returns
    -------
    dict with keys:
        - probability: float (0-100) — recommendation probability from predict_proba()
        - prediction: bool — True if probability >= 50
        - confidence_level: str — 'Low' (<30), 'Medium' (30-70), 'High' (>70)
        - model: str — name of the model used
        - model_version: str — version identifier
    """
    if not _model_loaded or _model is None:
        return {
            'probability': 0.0,
            'prediction': False,
            'confidence_level': 'N/A',
            'model': 'NOT_LOADED',
            'model_version': 'N/A',
            'error': _load_error or 'Model not loaded',
        }

    try:
        # Build feature vector
        feature_vec = _build_feature_vector(project_features, material_features)

        # Use cached prediction
        feature_tuple = tuple(feature_vec[0].tolist())
        prob_class1 = _cached_predict(feature_tuple)

        # Convert to percentage (0-100)
        probability = round(prob_class1 * 100, 2)
        prediction = probability >= 50.0

        # Confidence level
        if probability < 30:
            confidence_level = 'Low'
        elif probability <= 70:
            confidence_level = 'Medium'
        else:
            confidence_level = 'High'

        model_name = _metadata.get('model_name', 'Unknown') if _metadata else 'Unknown'
        model_version = '2.0'

        return {
            'probability': probability,
            'prediction': prediction,
            'confidence_level': confidence_level,
            'model': model_name,
            'model_version': model_version,
        }

    except Exception as e:
        warnings.warn(f"[Predictor] Prediction error: {e}")
        return {
            'probability': 0.0,
            'prediction': False,
            'confidence_level': 'Error',
            'model': 'ERROR',
            'model_version': 'N/A',
            'error': str(e),
        }


def predict_material_batch(project_features: Dict[str, Any],
                           materials: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Predict recommendations for a batch of materials given the same project.

    Parameters
    ----------
    project_features : dict
        Building/project attributes (shared across all materials).
    materials : list[dict]
        List of material property dicts.

    Returns
    -------
    list[dict] — one prediction result per material.
    """
    results = []
    for mat in materials:
        result = predict_material(project_features, mat)
        result['material_name'] = mat.get('material_name', mat.get('Name', 'Unknown'))
        results.append(result)
    return results


def get_model_info() -> Dict[str, Any]:
    """Return current model metadata for diagnostics."""
    if not _model_loaded:
        return {
            'loaded': False,
            'error': _load_error,
        }

    training_metrics_path = _ML_DIR / 'training_metrics.json'
    training_metrics = {}
    if training_metrics_path.exists():
        with open(training_metrics_path, 'r', encoding='utf-8') as f:
            training_metrics = json.load(f)

    return {
        'loaded': True,
        'model_name': _metadata.get('model_name', 'Unknown') if _metadata else 'Unknown',
        'model_file': _metadata.get('model_file', '') if _metadata else '',
        'feature_count': len(_feature_columns) if _feature_columns else 0,
        'feature_columns': _feature_columns or [],
        'training_date': _metadata.get('training_date', '') if _metadata else '',
        'engineering_weight': _metadata.get('engineering_weight', 0.75) if _metadata else 0.75,
        'ml_weight': _metadata.get('ml_weight', 0.25) if _metadata else 0.25,
        'training_metrics': training_metrics,
        'model_version': '2.0',
        'cache_info': _cached_predict.cache_info()._asdict(),
    }


def clear_cache():
    """Clear the prediction cache."""
    _cached_predict.cache_clear()
    print("[Predictor] Cache cleared.")
