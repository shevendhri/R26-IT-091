# backend/evaluation/run_evaluation.py
"""
GreenConstructAI - Complete Model Evaluation Suite v3.0
=======================================================

Runs all evaluation diagnostics for the trained ML model:
  1. Confusion Matrix
  2. ROC Curve (per model if training_metrics.json has multiple)
  3. Precision-Recall Curve
  4. Feature Importance Plot
  5. SHAP Summary Plot (if SHAP available)
  6. Learning Curve
  7. Cross-Validation Report (CSV + console table)
  8. Sensitivity Analysis (how ML probability varies with project context)

Output: All plots saved to backend/evaluation/plots/
        Report saved to backend/evaluation/evaluation_report.json

Usage:
    cd backend
    python evaluation/run_evaluation.py
"""

import os
import sys
import json
import time
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, StratifiedKFold, learning_curve
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve,
)

# ── Paths ──
EVAL_DIR = Path(__file__).resolve().parent
BACKEND_DIR = EVAL_DIR.parent
ML_DIR = BACKEND_DIR / 'ml'
PLOTS_DIR = EVAL_DIR / 'plots'
PLOTS_DIR.mkdir(exist_ok=True)

RANDOM_STATE = 42


def load_artefacts():
    """Load trained model, encoder, scaler, and feature columns."""
    print("[EVAL] Loading model artefacts...")
    model    = joblib.load(ML_DIR / 'best_model.pkl')
    encoder  = joblib.load(ML_DIR / 'encoder.pkl')
    fc       = joblib.load(ML_DIR / 'feature_columns.pkl')

    scaler = None
    if (ML_DIR / 'scaler.pkl').exists():
        scaler = joblib.load(ML_DIR / 'scaler.pkl')
        print("[EVAL] Scaler loaded.")
    else:
        print("[EVAL] WARNING: scaler.pkl not found — run training pipeline v3.0 first.")

    with open(ML_DIR / 'metadata.json', 'r', encoding='utf-8') as f:
        meta = json.load(f)
    with open(ML_DIR / 'training_metrics.json', 'r', encoding='utf-8') as f:
        metrics = json.load(f)

    print(f"[EVAL] Model: {meta.get('model_name')} v{meta.get('pipeline_version', '?')}")
    return model, encoder, scaler, fc, meta, metrics


def load_and_prepare_dataset(encoder, scaler, feature_columns, meta):
    """Load dataset and reproduce the training preprocessing (v3.0)."""
    csv_path = BACKEND_DIR / 'GreenConstructAI_ML_Dataset.csv'
    if not csv_path.exists():
        csv_path = BACKEND_DIR / 'data' / 'GreenConstructAI_ML_Dataset.csv'

    print(f"[EVAL] Loading dataset from {csv_path}")
    df = pd.read_csv(csv_path)

    # Drop same columns as training
    drop_cols = ['row_id', 'decision_reasons', 'recommendation_score', 'suitable_for_dry_zone']
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])

    # Engineer interaction features (mirror train_material_recommendation.py)
    df['floor_to_limit_ratio']      = df['actual_floor_count'] / df['max_recommended_floors'].clip(lower=1)
    df['sector_match']              = (
        ((df['sector'] == 'Residential') & (df['recommended_for_residential'] == 1)) |
        ((df['sector'] == 'Commercial')  & (df['recommended_for_commercial']  == 1)) |
        ((df['sector'] == 'Industrial')  & (df['recommended_for_industrial']  == 1))
    ).astype(int)
    df['zone_match']                = (
        ((df['climate_zone'] == 'Coastal')      & (df['suitable_for_coastal']  == 1)) |
        ((df['climate_zone'] == 'Wet Zone')     & (df['suitable_for_wet_zone'] == 1)) |
        ((df['climate_zone'] == 'Highland')     & (df['suitable_for_highland'] == 1)) |
        ((df['climate_zone'] == 'Intermediate') & (
            (df['suitable_for_wet_zone'] == 1) | (df['suitable_for_highland'] == 1)
        )) |
        (df['climate_zone'] == 'Dry Zone')
    ).astype(int)
    df['coastal_corrosion_match']   = df['coastal_exposure'] * df['corrosion_resistance_score'] / 100.0
    df['humidity_moisture_match']   = df['humidity_exposure'] * df['moisture_resistance_score'] / 100.0
    budget_fit = (
        ((df['budget_tier'] == 'Low')     & (df['carbon_footprint_kgco2e'] < 200)) |
        ((df['budget_tier'] == 'Medium')  & (df['carbon_footprint_kgco2e'] < 600)) |
        ((df['budget_tier'] == 'Premium') & (df['sustainability_score']    > 70))
    )
    df['budget_sustainability_fit'] = budget_fit.astype(int)

    y = df['recommended'].values
    X_df = df[feature_columns].copy()

    cat_cols = meta.get('categorical_features', [])
    num_cols = meta.get('numeric_features', [])

    if encoder is not None and cat_cols:
        present_cats = [c for c in cat_cols if c in X_df.columns]
        X_df[present_cats] = encoder.transform(X_df[present_cats])

    X = X_df.values.astype(np.float32)

    if scaler is not None and num_cols:
        num_indices = [i for i, col in enumerate(feature_columns) if col in num_cols]
        if num_indices:
            X[:, num_indices] = scaler.transform(X[:, num_indices])

    print(f"[EVAL] Prepared X: {X.shape}, y distribution: {np.bincount(y)}")
    return X, y


# ── Plot 1: Confusion Matrix ──────────────────────────────────────────────────
def plot_confusion_matrix(model, X_test, y_test, model_name):
    y_pred = (model.predict_proba(X_test)[:, 1] >= 0.5).astype(int)
    cm = confusion_matrix(y_test, y_pred)

    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                xticklabels=['Not Recommended', 'Recommended'],
                yticklabels=['Not Recommended', 'Recommended'])
    ax.set_xlabel('Predicted')
    ax.set_ylabel('True')
    ax.set_title(f'Confusion Matrix — {model_name} v3.0')
    plt.tight_layout()
    out = PLOTS_DIR / 'confusion_matrix.png'
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  -> Saved: {out}")
    return cm.tolist()


# ── Plot 2: ROC Curve ─────────────────────────────────────────────────────────
def plot_roc_curve(model, X_test, y_test, model_name, training_metrics):
    y_proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    auc = roc_auc_score(y_test, y_proba)

    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, 'b-', lw=2, label=f'{model_name} (AUC={auc:.3f})')
    plt.plot([0, 1], [0, 1], 'k--', alpha=0.4, label='Random')
    plt.fill_between(fpr, tpr, alpha=0.08)
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve — {model_name} (v3.0 Pipeline)')
    plt.legend(loc='lower right')
    plt.tight_layout()
    out = PLOTS_DIR / 'roc_curve.png'
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  -> Saved: {out}")
    return float(auc)


# ── Plot 3: PR Curve ──────────────────────────────────────────────────────────
def plot_pr_curve(model, X_test, y_test, model_name):
    y_proba = model.predict_proba(X_test)[:, 1]
    prec, rec, _ = precision_recall_curve(y_test, y_proba)

    plt.figure(figsize=(6, 5))
    plt.plot(rec, prec, 'g-', lw=2, label=model_name)
    plt.fill_between(rec, prec, alpha=0.08, color='green')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title(f'Precision-Recall Curve — {model_name}')
    plt.legend(loc='upper right')
    plt.tight_layout()
    out = PLOTS_DIR / 'pr_curve.png'
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  -> Saved: {out}")


# ── Plot 4: Feature Importance ────────────────────────────────────────────────
def plot_feature_importance(model, feature_columns, model_name, top_n=25):
    if not hasattr(model, 'feature_importances_'):
        print("  [!] Model has no feature_importances_ attribute.")
        return {}

    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]
    top_names = [feature_columns[i] for i in indices]
    top_vals  = importances[indices]

    interaction_features = [
        'floor_to_limit_ratio', 'sector_match', 'zone_match',
        'coastal_corrosion_match', 'humidity_moisture_match', 'budget_sustainability_fit'
    ]
    colors = ['#27ae60' if n in interaction_features else '#2980b9' for n in top_names]

    plt.figure(figsize=(9, 7))
    bars = plt.barh(range(len(top_names)), top_vals[::-1], color=colors[::-1])
    plt.yticks(range(len(top_names)), top_names[::-1], fontsize=9)
    plt.xlabel('Gini Feature Importance')
    plt.title(f'Feature Importance (Top {top_n}) — {model_name} v3.0\n'
              f'[Green = engineered interaction features]')

    # Legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#27ae60', label='Interaction feature (NEW)'),
        Patch(facecolor='#2980b9', label='Original feature'),
    ]
    plt.legend(handles=legend_elements, loc='lower right', fontsize=8)
    plt.tight_layout()
    out = PLOTS_DIR / 'feature_importance.png'
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  -> Saved: {out}")

    # Return as dict for report
    return {feature_columns[i]: float(importances[i]) for i in indices}


# ── Plot 5: SHAP Summary ──────────────────────────────────────────────────────
def plot_shap_summary(model, X_test, feature_columns, sample_size=300):
    try:
        import shap
        print("[EVAL] Computing SHAP values (this may take ~30s)...")
        sample_idx = np.random.RandomState(RANDOM_STATE).choice(len(X_test), size=min(sample_size, len(X_test)), replace=False)
        X_sample = X_test[sample_idx]

        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X_sample)

        if isinstance(shap_vals, list) and len(shap_vals) == 2:
            sv = shap_vals[1]
        else:
            sv = shap_vals

        plt.figure()
        shap.summary_plot(sv, X_sample, feature_names=feature_columns, show=False, max_display=20)
        plt.title('SHAP Summary — GreenConstruct AI v3.0')
        plt.tight_layout()
        out = PLOTS_DIR / 'shap_summary.png'
        plt.savefig(out, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  -> Saved: {out}")
        return True
    except ImportError:
        print("  [!] SHAP not installed. Skipping SHAP summary.")
        return False
    except Exception as e:
        print(f"  [!] SHAP failed: {e}")
        return False


# ── Plot 6: Learning Curve ────────────────────────────────────────────────────
def plot_learning_curve(model, X, y, model_name):
    print("[EVAL] Computing learning curve (5-fold, 6 sizes)...")
    train_sizes, train_scores, val_scores = learning_curve(
        model, X, y,
        cv=5,
        scoring='roc_auc',
        train_sizes=np.linspace(0.1, 1.0, 6),
        n_jobs=1,
        random_state=RANDOM_STATE,
    )

    train_mean = train_scores.mean(axis=1)
    train_std  = train_scores.std(axis=1)
    val_mean   = val_scores.mean(axis=1)
    val_std    = val_scores.std(axis=1)

    plt.figure(figsize=(7, 5))
    plt.plot(train_sizes, train_mean, 'b-o', label='Training ROC-AUC')
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1, color='b')
    plt.plot(train_sizes, val_mean, 'g-o', label='Validation ROC-AUC')
    plt.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.1, color='g')
    plt.xlabel('Training Set Size')
    plt.ylabel('ROC-AUC')
    plt.title(f'Learning Curve — {model_name}')
    plt.legend(loc='lower right')
    plt.ylim(0.5, 1.05)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    out = PLOTS_DIR / 'learning_curve.png'
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"  -> Saved: {out}")
    return {'train_final': float(train_mean[-1]), 'val_final': float(val_mean[-1])}


# ── Table 7: Cross-Validation Report ─────────────────────────────────────────
def cross_validation_report(training_metrics):
    all_models = training_metrics.get('all_models', {})
    if not all_models:
        print("[EVAL] No multi-model metrics found.")
        return

    rows = []
    for name, m in all_models.items():
        rows.append({
            'Model': name,
            'Accuracy':    f"{m.get('accuracy', 0):.4f}",
            'Precision':   f"{m.get('precision', 0):.4f}",
            'Recall':      f"{m.get('recall', 0):.4f}",
            'F1':          f"{m.get('f1', 0):.4f}",
            'ROC-AUC':     f"{m.get('roc_auc', 0):.4f}",
            'CV ROC-AUC':  f"{m.get('cv_mean_roc_auc', 0):.4f} ± {m.get('cv_std_roc_auc', 0):.4f}",
            'CV F1':       f"{m.get('cv_mean_f1', 0):.4f} ± {m.get('cv_std_f1', 0):.4f}",
        })

    df = pd.DataFrame(rows)
    csv_path = EVAL_DIR / 'cross_validation_report.csv'
    df.to_csv(csv_path, index=False)
    print(f"\n[EVAL] Cross-Validation Report:")
    print(df.to_string(index=False))
    print(f"\n  -> Saved CSV: {csv_path}")


# ── Plot 8: Sensitivity Analysis ──────────────────────────────────────────────
def sensitivity_analysis(model, encoder, scaler, feature_columns, meta):
    """
    Test how the ML probability changes when we vary key context features.
    This validates that the model is context-sensitive after the v3.0 fix.
    """
    print("\n[EVAL] Running sensitivity analysis...")

    cat_cols = meta.get('categorical_features', [])
    num_cols = meta.get('numeric_features', [])

    def make_vector(overrides: dict) -> np.ndarray:
        """Build a feature vector with specific overrides."""
        defaults = {
            'material_name': 'Burnt Clay Brick',
            'category': 'Wall Systems',
            'subcategory': 'Masonry Unit',
            'building_phase': 'Superstructure',
            'climate_zone': 'Intermediate',
            'sector': 'Residential',
            'actual_floor_count': 2,
            'building_area_m2': 200,
            'budget_tier': 'Medium',
            'maintenance_preference': 'Low Maintenance',
            'sustainability_priority': 'Medium',
            'user_priority': 'Durability',
            'climate_exposure_level': 'Medium',
            'coastal_exposure': 0,
            'humidity_exposure': 0,
            'max_recommended_floors': 4,
            'compressive_strength_mpa': 7,
            'thermal_performance_score': 70,
            'moisture_resistance_score': 60,
            'corrosion_resistance_score': 55,
            'fire_resistance_score': 75,
            'durability_score': 70,
            'maintenance_score': 65,
            'sustainability_score': 55,
            'carbon_footprint_kgco2e': 200,
            'service_life_years': 50,
            'suitable_for_coastal': 0,
            'suitable_for_wet_zone': 1,
            'suitable_for_dry_zone': 1,
            'suitable_for_highland': 0,
            'recommended_for_residential': 1,
            'recommended_for_commercial': 1,
            'recommended_for_industrial': 0,
        }
        defaults.update(overrides)

        # Compute interaction features
        fl  = defaults['actual_floor_count']
        ml_ = max(defaults['max_recommended_floors'], 1)
        defaults['floor_to_limit_ratio']      = round(fl / ml_, 4)
        defaults['sector_match']              = int(
            (defaults['sector'] == 'Residential' and defaults['recommended_for_residential'] == 1) or
            (defaults['sector'] == 'Commercial'  and defaults['recommended_for_commercial']  == 1) or
            (defaults['sector'] == 'Industrial'  and defaults['recommended_for_industrial']  == 1)
        )
        defaults['zone_match']                = int(
            (defaults['climate_zone'] == 'Coastal'      and defaults['suitable_for_coastal']  == 1) or
            (defaults['climate_zone'] == 'Wet Zone'     and defaults['suitable_for_wet_zone'] == 1) or
            (defaults['climate_zone'] == 'Highland'     and defaults['suitable_for_highland'] == 1) or
            (defaults['climate_zone'] in ('Intermediate', 'Dry Zone'))
        )
        defaults['coastal_corrosion_match']   = round(defaults['coastal_exposure'] * defaults['corrosion_resistance_score'] / 100.0, 4)
        defaults['humidity_moisture_match']   = round(defaults['humidity_exposure'] * defaults['moisture_resistance_score'] / 100.0, 4)
        defaults['budget_sustainability_fit'] = int(
            (defaults['budget_tier'] == 'Low'     and defaults['carbon_footprint_kgco2e'] < 200) or
            (defaults['budget_tier'] == 'Medium'  and defaults['carbon_footprint_kgco2e'] < 600) or
            (defaults['budget_tier'] == 'Premium' and defaults['sustainability_score']    > 70)
        )

        # Build row
        row = [defaults.get(col, 0) for col in feature_columns]
        row_array = np.array([row], dtype=object)

        if encoder is not None and cat_cols:
            cat_indices = [i for i, c in enumerate(feature_columns) if c in cat_cols]
            if cat_indices:
                try:
                    row_array[:, cat_indices] = encoder.transform(row_array[:, cat_indices])
                except Exception:
                    pass

        row_float = row_array.astype(np.float32)
        if scaler is not None and num_cols:
            num_indices = [i for i, c in enumerate(feature_columns) if c in num_cols]
            if num_indices:
                try:
                    row_float[:, num_indices] = scaler.transform(row_float[:, num_indices])
                except Exception:
                    pass

        return row_float

    scenarios = {
        'Base (Residential, Intermediate, 2F)': {},
        'Coastal Zone (salinity risk)': {'climate_zone': 'Coastal', 'coastal_exposure': 1, 'suitable_for_coastal': 0},
        'Coastal + Coastal-Rated': {'climate_zone': 'Coastal', 'coastal_exposure': 1, 'suitable_for_coastal': 1},
        'Industrial Sector': {'sector': 'Industrial', 'recommended_for_residential': 0, 'recommended_for_industrial': 0},
        'Industrial + Material-Suited': {'sector': 'Industrial', 'recommended_for_residential': 0, 'recommended_for_industrial': 1},
        'Highland Zone': {'climate_zone': 'Highland', 'suitable_for_highland': 1, 'humidity_exposure': 1},
        'Floor Near Limit (3/4)': {'actual_floor_count': 3, 'max_recommended_floors': 4},
        'Floor Exceeds Limit (6/4)': {'actual_floor_count': 6, 'max_recommended_floors': 4},
        'Budget Low + High Carbon': {'budget_tier': 'Low', 'carbon_footprint_kgco2e': 800},
        'Budget Premium + Sustainable': {'budget_tier': 'Premium', 'sustainability_score': 85},
    }

    results = []
    for label, overrides in scenarios.items():
        try:
            vec = make_vector(overrides)
            prob = float(model.predict_proba(vec)[0][1] * 100)
            results.append({'Scenario': label, 'ML Probability (%)': round(prob, 2)})
        except Exception as e:
            results.append({'Scenario': label, 'ML Probability (%)': f'ERROR: {e}'})

    df = pd.DataFrame(results)
    print("\n  Sensitivity Analysis — Burnt Clay Brick:")
    print(df.to_string(index=False))

    csv_path = EVAL_DIR / 'sensitivity_analysis.csv'
    df.to_csv(csv_path, index=False)
    print(f"\n  -> Saved: {csv_path}")
    return results


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("GreenConstructAI — Model Evaluation Suite v3.0")
    print("=" * 65)
    start = time.time()

    # 1. Load artefacts
    model, encoder, scaler, feature_columns, meta, training_metrics = load_artefacts()
    model_name = meta.get('model_name', 'Unknown')

    # 2. Prepare dataset
    X, y = load_and_prepare_dataset(encoder, scaler, feature_columns, meta)

    # 3. Train-test split (same seed as training)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=RANDOM_STATE
    )

    report = {
        'model': model_name,
        'pipeline_version': meta.get('pipeline_version', '?'),
        'evaluation_date': pd.Timestamp.utcnow().isoformat(),
        'test_set_size': len(X_test),
        'feature_count': len(feature_columns),
        'interaction_features': meta.get('interaction_features', []),
    }

    print(f"\n{'='*50}")
    print("1. Confusion Matrix")
    print(f"{'='*50}")
    cm = plot_confusion_matrix(model, X_test, y_test, model_name)
    report['confusion_matrix'] = cm

    print(f"\n{'='*50}")
    print("2. ROC Curve")
    print(f"{'='*50}")
    auc = plot_roc_curve(model, X_test, y_test, model_name, training_metrics)
    report['test_roc_auc'] = auc

    print(f"\n{'='*50}")
    print("3. Precision-Recall Curve")
    print(f"{'='*50}")
    plot_pr_curve(model, X_test, y_test, model_name)

    print(f"\n{'='*50}")
    print("4. Feature Importance")
    print(f"{'='*50}")
    fi = plot_feature_importance(model, feature_columns, model_name)
    report['top_10_features'] = dict(list(fi.items())[:10])

    print(f"\n{'='*50}")
    print("5. SHAP Summary")
    print(f"{'='*50}")
    shap_ok = plot_shap_summary(model, X_test, feature_columns)
    report['shap_available'] = shap_ok

    print(f"\n{'='*50}")
    print("6. Learning Curve")
    print(f"{'='*50}")
    lc = plot_learning_curve(model, X, y, model_name)
    report['learning_curve'] = lc

    print(f"\n{'='*50}")
    print("7. Cross-Validation Report")
    print(f"{'='*50}")
    cross_validation_report(training_metrics)
    report['cv_summary'] = training_metrics.get('all_models', {})

    print(f"\n{'='*50}")
    print("8. Sensitivity Analysis")
    print(f"{'='*50}")
    sensitivity = sensitivity_analysis(model, encoder, scaler, feature_columns, meta)
    report['sensitivity_analysis'] = sensitivity

    # Save report
    report_path = EVAL_DIR / 'evaluation_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    elapsed = time.time() - start
    print(f"\n{'='*65}")
    print(f"EVALUATION COMPLETE in {elapsed:.1f}s")
    print(f"Plots saved to: {PLOTS_DIR}")
    print(f"Report saved to: {report_path}")
    print(f"{'='*65}")


if __name__ == '__main__':
    main()
