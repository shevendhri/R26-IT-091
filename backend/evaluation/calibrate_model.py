# backend/evaluation/calibrate_model.py
"""
GreenConstructAI — Model Calibration Module (Phase 3)
======================================================

Evaluates probability calibration of the trained material recommendation model.
Computes:
  - Reliability Diagram / Calibration Curve
  - Expected Calibration Error (ECE)
  - Maximum Calibration Error (MCE)
  - Brier Score
Fits CalibratedClassifierCV using both 'isotonic' and 'sigmoid' methods.
Selects the better calibrated model, saves calibrated_model.pkl to backend/ml/,
and generates calibration_report.json.

Usage:
    cd backend
    python evaluation/calibrate_model.py
"""

import os
import sys
import json
import time
import hashlib
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.calibration import calibration_curve, CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, roc_auc_score, accuracy_score

# Paths
EVAL_DIR = Path(__file__).resolve().parent
BACKEND_DIR = EVAL_DIR.parent
ML_DIR = BACKEND_DIR / 'ml'
PLOTS_DIR = EVAL_DIR / 'plots'
FIGURES_DIR = EVAL_DIR / 'figures'
PLOTS_DIR.mkdir(exist_ok=True)
FIGURES_DIR.mkdir(exist_ok=True)

RANDOM_STATE = 42


def compute_ece_mce(y_true, y_prob, n_bins=10):
    """Compute Expected Calibration Error (ECE) and Maximum Calibration Error (MCE)."""
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]

    ece = 0.0
    mce = 0.0
    total_samples = len(y_true)

    bin_accs = []
    bin_confs = []
    bin_sizes = []

    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = (y_prob > bin_lower) & (y_prob <= bin_upper)
        bin_size = np.sum(in_bin)
        bin_sizes.append(int(bin_size))

        if bin_size > 0:
            accuracy = np.mean(y_true[in_bin])
            confidence = np.mean(y_prob[in_bin])
            abs_diff = abs(accuracy - confidence)
            ece += (bin_size / total_samples) * abs_diff
            mce = max(mce, abs_diff)
            bin_accs.append(float(accuracy))
            bin_confs.append(float(confidence))
        else:
            bin_accs.append(0.0)
            bin_confs.append(0.0)

    return float(ece), float(mce), bin_accs, bin_confs, bin_sizes


def load_dataset_and_preprocess(meta):
    """Load and preprocess dataset matching training pipeline v3.0."""
    csv_path = BACKEND_DIR / 'GreenConstructAI_ML_Dataset.csv'
    if not csv_path.exists():
        csv_path = BACKEND_DIR / 'data' / 'GreenConstructAI_ML_Dataset.csv'

    df = pd.read_csv(csv_path)

    drop_cols = ['row_id', 'decision_reasons', 'recommendation_score', 'suitable_for_dry_zone']
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])

    # Engineer interaction features
    df['floor_to_limit_ratio'] = df['actual_floor_count'] / df['max_recommended_floors'].clip(lower=1)
    df['sector_match'] = (
        ((df['sector'] == 'Residential') & (df['recommended_for_residential'] == 1)) |
        ((df['sector'] == 'Commercial')  & (df['recommended_for_commercial']  == 1)) |
        ((df['sector'] == 'Industrial')  & (df['recommended_for_industrial']  == 1))
    ).astype(int)
    df['zone_match'] = (
        ((df['climate_zone'] == 'Coastal')      & (df['suitable_for_coastal']  == 1)) |
        ((df['climate_zone'] == 'Wet Zone')     & (df['suitable_for_wet_zone'] == 1)) |
        ((df['climate_zone'] == 'Highland')     & (df['suitable_for_highland'] == 1)) |
        ((df['climate_zone'] == 'Intermediate') & (
            (df['suitable_for_wet_zone'] == 1) | (df['suitable_for_highland'] == 1)
        )) |
        (df['climate_zone'] == 'Dry Zone')
    ).astype(int)
    df['coastal_corrosion_match'] = df['coastal_exposure'] * df['corrosion_resistance_score'] / 100.0
    df['humidity_moisture_match'] = df['humidity_exposure'] * df['moisture_resistance_score'] / 100.0
    budget_fit = (
        ((df['budget_tier'] == 'Low')     & (df['carbon_footprint_kgco2e'] < 200)) |
        ((df['budget_tier'] == 'Medium')  & (df['carbon_footprint_kgco2e'] < 600)) |
        ((df['budget_tier'] == 'Premium') & (df['sustainability_score']    > 70))
    )
    df['budget_sustainability_fit'] = budget_fit.astype(int)

    y = df['recommended'].values
    fc = joblib.load(ML_DIR / 'feature_columns.pkl')
    X_df = df[fc].copy()

    encoder = joblib.load(ML_DIR / 'encoder.pkl')
    cat_cols = meta.get('categorical_features', [])
    num_cols = meta.get('numeric_features', [])

    if encoder is not None and cat_cols:
        present_cats = [c for c in cat_cols if c in X_df.columns]
        X_df[present_cats] = encoder.transform(X_df[present_cats])

    X = X_df.values.astype(np.float32)

    if (ML_DIR / 'scaler.pkl').exists():
        scaler = joblib.load(ML_DIR / 'scaler.pkl')
        num_indices = [i for i, col in enumerate(fc) if col in num_cols]
        if num_indices:
            X[:, num_indices] = scaler.transform(X[:, num_indices])

    return X, y, fc


def main():
    print("=" * 65)
    print("GreenConstructAI — Model Calibration & Probability Tuning")
    print("=" * 65)

    with open(ML_DIR / 'metadata.json', 'r', encoding='utf-8') as f:
        meta = json.load(f)

    base_model = joblib.load(ML_DIR / 'best_model.pkl')
    X, y, feature_columns = load_dataset_and_preprocess(meta)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=RANDOM_STATE
    )

    # 1. Uncalibrated Model Evaluation
    y_prob_uncal = base_model.predict_proba(X_test)[:, 1]
    brier_uncal = brier_score_loss(y_test, y_prob_uncal)
    ece_uncal, mce_uncal, accs_uncal, confs_uncal, sizes_uncal = compute_ece_mce(y_test, y_prob_uncal)
    auc_uncal = roc_auc_score(y_test, y_prob_uncal)
    acc_uncal = accuracy_score(y_test, (y_prob_uncal >= 0.5).astype(int))

    print(f"\n[UNCALIBRATED] Base Model ({meta.get('model_name', 'GradientBoosting')}):")
    print(f"  Brier Score: {brier_uncal:.4f}")
    print(f"  ECE:         {ece_uncal:.4f} ({ece_uncal*100:.2f}%)")
    print(f"  MCE:         {mce_uncal:.4f} ({mce_uncal*100:.2f}%)")
    print(f"  ROC-AUC:     {auc_uncal:.4f}")
    print(f"  Accuracy:    {acc_uncal:.4f}")

    # 2. Fit Isotonic Calibration
    print("\n[CALIBRATING] Training Isotonic CalibratedClassifierCV...")
    cal_iso = CalibratedClassifierCV(estimator=base_model, cv=5, method='isotonic')
    cal_iso.fit(X_train, y_train)
    y_prob_iso = cal_iso.predict_proba(X_test)[:, 1]
    brier_iso = brier_score_loss(y_test, y_prob_iso)
    ece_iso, mce_iso, accs_iso, confs_iso, _ = compute_ece_mce(y_test, y_prob_iso)

    # 3. Fit Sigmoidal Calibration
    print("[CALIBRATING] Training Sigmoid CalibratedClassifierCV...")
    cal_sig = CalibratedClassifierCV(estimator=base_model, cv=5, method='sigmoid')
    cal_sig.fit(X_train, y_train)
    y_prob_sig = cal_sig.predict_proba(X_test)[:, 1]
    brier_sig = brier_score_loss(y_test, y_prob_sig)
    ece_sig, mce_sig, accs_sig, confs_sig, _ = compute_ece_mce(y_test, y_prob_sig)

    print(f"\n[RESULTS] Comparison:")
    print(f"  Uncalibrated: ECE={ece_uncal:.4f}, Brier={brier_uncal:.4f}")
    print(f"  Isotonic:     ECE={ece_iso:.4f}, Brier={brier_iso:.4f}")
    print(f"  Sigmoid:      ECE={ece_sig:.4f}, Brier={brier_sig:.4f}")

    # Select best calibrated model (lowest ECE & Brier score)
    models_eval = [
        ('Uncalibrated', brier_uncal, ece_uncal, mce_uncal, base_model, y_prob_uncal),
        ('Isotonic', brier_iso, ece_iso, mce_iso, cal_iso, y_prob_iso),
        ('Sigmoid', brier_sig, ece_sig, mce_sig, cal_sig, y_prob_sig)
    ]
    models_eval.sort(key=lambda x: (x[2], x[1]))  # sort by ECE primary, Brier secondary

    best_cal_name, best_brier, best_ece, best_mce, best_cal_model, best_prob = models_eval[0]
    print(f"\n[SELECTED] Best calibration model: {best_cal_name} (ECE={best_ece:.4f}, Brier={best_brier:.4f})")

    # Save calibrated model if better or equal
    calibrated_file = ML_DIR / 'calibrated_model.pkl'
    joblib.dump(best_cal_model, calibrated_file)
    print(f"[SAVE] Saved calibrated model to {calibrated_file}")

    # Plot Calibration Curve / Reliability Diagram
    plt.figure(figsize=(7, 6))
    prob_true_uncal, prob_pred_uncal = calibration_curve(y_test, y_prob_uncal, n_bins=10)
    prob_true_iso, prob_pred_iso = calibration_curve(y_test, y_prob_iso, n_bins=10)
    prob_true_sig, prob_pred_sig = calibration_curve(y_test, y_prob_sig, n_bins=10)

    plt.plot([0, 1], [0, 1], 'k--', label='Perfectly Calibrated', alpha=0.6)
    plt.plot(prob_pred_uncal, prob_true_uncal, 's-', color='#e74c3c', label=f'Uncalibrated (ECE={ece_uncal:.3f})')
    plt.plot(prob_pred_iso, prob_true_iso, 'o-', color='#2ecc71', label=f'Isotonic (ECE={ece_iso:.3f})')
    plt.plot(prob_pred_sig, prob_true_sig, '^--', color='#3498db', label=f'Sigmoid (ECE={ece_sig:.3f})')

    plt.xlabel('Mean Predicted Probability', fontsize=11)
    plt.ylabel('Fraction of Positives (Empirical)', fontsize=11)
    plt.title('Reliability Diagram / Model Probability Calibration', fontsize=12, pad=12)
    plt.legend(loc='lower right', fontsize=10)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    plt.savefig(PLOTS_DIR / 'calibration_curve.png', dpi=150)
    plt.savefig(FIGURES_DIR / 'calibration_curve.png', dpi=300)
    plt.close()
    print(f"  -> Saved calibration plot: {PLOTS_DIR / 'calibration_curve.png'} & 300 DPI figure")

    # Compute model checksum
    with open(ML_DIR / 'best_model.pkl', 'rb') as f:
        model_checksum = hashlib.sha256(f.read()).hexdigest()

    # Save calibration_report.json
    report = {
        'timestamp': pd.Timestamp.now(tz='UTC').isoformat(),
        'selected_calibration': best_cal_name,
        'uncalibrated': {
            'brier_score': float(brier_uncal),
            'ece': float(ece_uncal),
            'mce': float(mce_uncal),
            'roc_auc': float(auc_uncal),
            'accuracy': float(acc_uncal),
        },
        'isotonic': {
            'brier_score': float(brier_iso),
            'ece': float(ece_iso),
            'mce': float(mce_iso),
        },
        'sigmoid': {
            'brier_score': float(brier_sig),
            'ece': float(ece_sig),
            'mce': float(mce_sig),
        },
        'calibration_improvement_ece': float(ece_uncal - best_ece),
        'model_checksum_sha256': model_checksum,
    }

    report_path = EVAL_DIR / 'calibration_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    # Also update metadata.json with calibration status
    meta['calibration'] = {
        'status': 'Calibrated',
        'method': best_cal_name,
        'ece': round(best_ece, 4),
        'brier_score': round(best_brier, 4),
        'model_checksum_sha256': model_checksum
    }
    with open(ML_DIR / 'metadata.json', 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)

    print(f"[SAVE] Saved calibration report: {report_path}")
    print("=" * 65)


if __name__ == '__main__':
    main()
