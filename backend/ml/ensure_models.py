# backend/ml/ensure_models.py
"""
GreenConstructAI — Auto-Train on First Deploy
===============================================
Checks if required model artefacts exist in backend/ml/.
If any are missing (e.g. first deployment where .pkl files are gitignored),
automatically runs the training pipeline to generate them.

This script is designed to be called once at backend startup.
It is idempotent — if models already exist, it returns immediately.

Usage:
    from ml.ensure_models import ensure_models
    ensure_models()   # blocks until models are ready
"""

import os
import sys
import time
from pathlib import Path

# ── Required artefact files ──────────────────────────────────────────────────
ML_DIR = Path(__file__).resolve().parent

REQUIRED_ARTEFACTS = [
    'best_model.pkl',
    'encoder.pkl',
    'feature_columns.pkl',
    'label_encoders.pkl',
    'metadata.json',
]

# Optional but good to have
OPTIONAL_ARTEFACTS = [
    'scaler.pkl',
    'calibrated_model.pkl',
    'training_metrics.json',
    'feature_metadata.json',
]


def models_exist() -> bool:
    """Check if all required model artefacts exist."""
    for fname in REQUIRED_ARTEFACTS:
        if not (ML_DIR / fname).exists():
            return False
    return True


def ensure_models(force_retrain: bool = False) -> None:
    """
    Ensure ML model artefacts exist. If missing, run the training pipeline.
    
    Args:
        force_retrain: If True, retrain even if models already exist.
    """
    if not force_retrain and models_exist():
        print("[ensure_models] All required model artefacts found. Skipping training.")
        return

    # Report what's missing
    missing = [f for f in REQUIRED_ARTEFACTS if not (ML_DIR / f).exists()]
    if missing:
        print(f"[ensure_models] Missing artefacts: {missing}")
    elif force_retrain:
        print("[ensure_models] Force retrain requested.")

    print("[ensure_models] Starting model training pipeline...")
    start = time.time()

    try:
        # Add backend dir to path so the training script can import database, etc.
        backend_dir = str(ML_DIR.parent)
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)

        # Import and run the training pipeline
        from ml.train_material_recommendation import main as train_main
        train_main()

        elapsed = time.time() - start
        print(f"[ensure_models] Training completed in {elapsed:.1f}s")

        # Verify artefacts were created
        still_missing = [f for f in REQUIRED_ARTEFACTS if not (ML_DIR / f).exists()]
        if still_missing:
            print(f"[ensure_models] WARNING: Still missing after training: {still_missing}")
        else:
            print("[ensure_models] All required artefacts verified.")

    except Exception as e:
        elapsed = time.time() - start
        print(f"[ensure_models] ERROR: Training failed after {elapsed:.1f}s: {e}")
        import traceback
        traceback.print_exc()
        
        # Don't crash the server — the backend can still serve non-ML endpoints
        print("[ensure_models] WARNING: ML features may be unavailable until models are trained.")


if __name__ == '__main__':
    ensure_models(force_retrain='--force' in sys.argv)
