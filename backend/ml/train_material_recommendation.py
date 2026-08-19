# backend/ml/train_material_recommendation.py
"""
GreenConstructAI - Material Recommendation Model Training Pipeline v3.0
========================================================================

MAJOR CHANGES FROM v2.0:
  - Fixed critical data leakage: recommendation_score now correctly excluded
  - Dropped zero-variance feature: suitable_for_dry_zone (all-1 column)
  - Added 6 engineered interaction features:
      floor_to_limit_ratio, sector_match, zone_match,
      coastal_corrosion_match, humidity_moisture_match, budget_sustainability_fit
  - Added StandardScaler for numeric features (improves gradient-based models)
  - Added ExtraTrees and GradientBoosting to model comparison
  - Added RandomizedSearchCV for hyperparameter optimization on best model
  - Saves scaler.pkl alongside encoder.pkl

Pipeline:
  1. Load CSV, clean, deduplicate, impute missing values
  2. Drop non-feature columns + zero-variance columns
  3. Engineer 6 interaction features
  4. Encode categoricals with OrdinalEncoder
  5. Scale numerics with StandardScaler
  6. Stratified 80/20 train-test split (random_state=42)
  7. Train RandomForest, ExtraTrees, GradientBoosting, XGBoost (opt), LightGBM (opt)
  8. Evaluate: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
  9. 5-fold Stratified Cross Validation on all models
 10. RandomizedSearchCV hyperparameter optimization on selected best model
 11. Generate plots: confusion matrix, ROC curve, PR curve
 12. SHAP summary plot (fallback: permutation importance)
 13. Select best model: ROC-AUC -> F1 -> CV mean
 14. Save artefacts: best_model.pkl, encoder.pkl, scaler.pkl, feature_columns.pkl,
     metadata.json, training_metrics.json, feature_metadata.json

Usage:
  python train_material_recommendation.py
"""

import os
import sys
import json
import time
import warnings
import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, StratifiedKFold, RandomizedSearchCV
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve,
)
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier

# Optional imports with graceful fallback
try:
    from xgboost import XGBClassifier
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False
    warnings.warn("xgboost not installed; XGBoost model will be skipped.")

try:
    from lightgbm import LGBMClassifier
    LGBM_AVAILABLE = True
except ImportError:
    LGBM_AVAILABLE = False
    warnings.warn("lightgbm not installed; LightGBM model will be skipped.")

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    warnings.warn("shap not installed; will use permutation importance.")

# ============================================================================
# Configuration
# ============================================================================
RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5
HYPERPARAM_ITER = 30   # RandomizedSearchCV iterations for best model

# Columns to DROP before training (non-feature columns + leakage columns)
DROP_COLUMNS = [
    'row_id',
    'decision_reasons',
    'recommendation_score',   # CRITICAL: removed — was leaking the label
    'suitable_for_dry_zone',  # FIXED: zero variance (all-1) — pure noise
]
TARGET_COLUMN = 'recommended'

# Resolve paths relative to this script
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent

# Dataset location (check both possible locations)
DATASET_CANDIDATES = [
    BACKEND_DIR / 'GreenConstructAI_ML_Dataset.csv',
    BACKEND_DIR / 'data' / 'GreenConstructAI_ML_Dataset.csv',
]
OUTPUT_DIR = SCRIPT_DIR  # Save artefacts alongside models

# ============================================================================
# Data Loading & Cleaning
# ============================================================================
def find_dataset() -> Path:
    """Find the dataset CSV file."""
    for p in DATASET_CANDIDATES:
        if p.exists():
            return p
    raise FileNotFoundError(
        f"Dataset not found. Checked:\n" +
        "\n".join(f"  - {p}" for p in DATASET_CANDIDATES)
    )


def load_and_clean(csv_path: Path) -> pd.DataFrame:
    """Load CSV, drop duplicates, strip whitespace, handle missing values."""
    print(f"[TRAIN] Loading dataset from {csv_path}")
    df = pd.read_csv(csv_path)
    original_rows = len(df)

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Drop non-feature columns (including leakage columns)
    cols_to_drop = [c for c in DROP_COLUMNS if c in df.columns]
    df = df.drop(columns=cols_to_drop)
    print(f"[TRAIN] Dropped columns: {cols_to_drop}")

    # Remove exact duplicate rows
    df = df.drop_duplicates()
    removed = original_rows - len(df)
    print(f"[TRAIN] Removed {removed} duplicate rows. Remaining: {len(df)}")

    # Identify column types
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

    # Remove target from lists if present
    if TARGET_COLUMN in numeric_cols:
        numeric_cols.remove(TARGET_COLUMN)
    if TARGET_COLUMN in categorical_cols:
        categorical_cols.remove(TARGET_COLUMN)

    # Impute missing values
    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"[TRAIN] Imputed {col} with median={median_val:.2f}")

    for col in categorical_cols:
        if df[col].isnull().any():
            mode_val = df[col].mode()[0]
            df[col] = df[col].fillna(mode_val)
            print(f"[TRAIN] Imputed {col} with mode='{mode_val}'")

    print(f"[TRAIN] Final dataset shape after cleaning: {df.shape}")
    print(f"[TRAIN] Target distribution:\n{df[TARGET_COLUMN].value_counts()}")
    return df


# ============================================================================
# Feature Engineering — Interaction Features
# ============================================================================
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add 6 interaction features that capture the key structural rules the
    engineering engine uses, making them explicit for the ML model.

    These features allow Random Forest (and all tree models) to split
    directly on the decision boundaries rather than learning them implicitly
    across a 33-feature space.
    """
    print("\n[FEATURES] Engineering interaction features...")

    # 1. FLOOR-TO-LIMIT RATIO
    # Captures: "how close is this building to exceeding the material's floor limit?"
    # This is the single most important engineering rule (floor violation = reject).
    df['floor_to_limit_ratio'] = (
        df['actual_floor_count'] / df['max_recommended_floors'].clip(lower=1)
    ).round(4)
    print("  [+] floor_to_limit_ratio = actual_floor_count / max_recommended_floors")

    # 2. SECTOR MATCH
    # Captures: "does this material's sector suitability flag match the current sector?"
    # Eliminates ambiguity between material suitability and current project sector.
    sector_match = (
        ((df['sector'] == 'Residential') & (df['recommended_for_residential'] == 1)) |
        ((df['sector'] == 'Commercial')  & (df['recommended_for_commercial']  == 1)) |
        ((df['sector'] == 'Industrial')  & (df['recommended_for_industrial']  == 1))
    )
    df['sector_match'] = sector_match.astype(int)
    print("  [+] sector_match = sector × recommended_for_{sector}")

    # 3. ZONE MATCH
    # Captures: "does this material's climate suitability flag match the current zone?"
    zone_match = (
        ((df['climate_zone'] == 'Coastal')      & (df['suitable_for_coastal']  == 1)) |
        ((df['climate_zone'] == 'Wet Zone')     & (df['suitable_for_wet_zone'] == 1)) |
        ((df['climate_zone'] == 'Highland')     & (df['suitable_for_highland'] == 1)) |
        ((df['climate_zone'] == 'Intermediate') & (
            (df['suitable_for_wet_zone'] == 1) | (df['suitable_for_highland'] == 1)
        )) |
        (df['climate_zone'] == 'Dry Zone')   # all materials cleared dry zone after dedup
    )
    df['zone_match'] = zone_match.astype(int)
    print("  [+] zone_match = climate_zone × suitable_for_{zone}")

    # 4. COASTAL × CORROSION MATCH
    # Captures: "is this a coastal project with a corrosion-resistant material?"
    # High coastal_exposure + high corrosion_resistance_score = good match.
    df['coastal_corrosion_match'] = (
        df['coastal_exposure'] * df['corrosion_resistance_score'] / 100.0
    ).round(4)
    print("  [+] coastal_corrosion_match = coastal_exposure × corrosion_resistance / 100")

    # 5. HUMIDITY × MOISTURE MATCH
    # Captures: "is this a high-humidity project with a moisture-resistant material?"
    df['humidity_moisture_match'] = (
        df['humidity_exposure'] * df['moisture_resistance_score'] / 100.0
    ).round(4)
    print("  [+] humidity_moisture_match = humidity_exposure × moisture_resistance / 100")

    # 6. BUDGET × SUSTAINABILITY FIT
    # Captures: "is this material's environmental cost aligned with the user's budget tier?"
    budget_fit = (
        ((df['budget_tier'] == 'Low')     & (df['carbon_footprint_kgco2e'] < 200)) |
        ((df['budget_tier'] == 'Medium')  & (df['carbon_footprint_kgco2e'] < 600)) |
        ((df['budget_tier'] == 'Premium') & (df['sustainability_score']    > 70))
    )
    df['budget_sustainability_fit'] = budget_fit.astype(int)
    print("  [+] budget_sustainability_fit = budget_tier × carbon/sustainability thresholds")

    new_features = [
        'floor_to_limit_ratio', 'sector_match', 'zone_match',
        'coastal_corrosion_match', 'humidity_moisture_match', 'budget_sustainability_fit'
    ]
    print(f"[FEATURES] Added {len(new_features)} interaction features: {new_features}")
    return df


# ============================================================================
# Feature Encoding & Scaling
# ============================================================================
def encode_and_scale_features(df: pd.DataFrame):
    """
    Encode categorical features with OrdinalEncoder.
    Scale numeric features with StandardScaler.

    Returns:
        X: numpy array of processed features
        y: numpy array of target values
        encoder: fitted OrdinalEncoder
        scaler: fitted StandardScaler
        feature_columns: list of feature column names (in order)
        cat_cols: list of categorical column names
        num_cols: list of numeric column names
    """
    X_df = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN].values

    feature_columns = X_df.columns.tolist()
    cat_cols = X_df.select_dtypes(include=['object', 'category']).columns.tolist()
    num_cols = X_df.select_dtypes(include=[np.number]).columns.tolist()

    print(f"\n[ENCODE] Feature columns ({len(feature_columns)}): {feature_columns}")
    print(f"[ENCODE] Categorical ({len(cat_cols)}): {cat_cols}")
    print(f"[ENCODE] Numeric ({len(num_cols)}): {num_cols}")

    # Encode categoricals with OrdinalEncoder
    encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    if cat_cols:
        X_df[cat_cols] = encoder.fit_transform(X_df[cat_cols])

    # Scale numerics with StandardScaler (critical for GradientBoosting, also helps RF)
    scaler = StandardScaler()
    if num_cols:
        X_df[num_cols] = scaler.fit_transform(X_df[num_cols])

    X = X_df.values.astype(np.float32)
    return X, y, encoder, scaler, feature_columns, cat_cols, num_cols


# ============================================================================
# Model Training
# ============================================================================
def train_models(X_train, y_train):
    """Train RandomForest, ExtraTrees, GradientBoosting, XGBoost, LightGBM."""
    models = {}

    # 1. Random Forest
    print("\n[TRAIN] Training RandomForest...")
    t0 = time.time()
    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    models['RandomForest'] = rf
    print(f"[TRAIN] RandomForest trained in {time.time()-t0:.1f}s")

    # 2. Extra Trees (often faster, sometimes better for interaction features)
    print("[TRAIN] Training ExtraTrees...")
    t0 = time.time()
    et = ExtraTreesClassifier(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    et.fit(X_train, y_train)
    models['ExtraTrees'] = et
    print(f"[TRAIN] ExtraTrees trained in {time.time()-t0:.1f}s")

    # 3. Gradient Boosting (sequential, captures residual error better)
    print("[TRAIN] Training GradientBoosting (this may take a few minutes)...")
    t0 = time.time()
    gb = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        random_state=RANDOM_STATE,
    )
    gb.fit(X_train, y_train)
    models['GradientBoosting'] = gb
    print(f"[TRAIN] GradientBoosting trained in {time.time()-t0:.1f}s")

    # 4. XGBoost (if available)
    if XGB_AVAILABLE:
        print("[TRAIN] Training XGBoost...")
        t0 = time.time()
        n_pos = int(y_train.sum())
        n_neg = len(y_train) - n_pos
        scale_pos_weight = n_neg / max(n_pos, 1)
        xgb = XGBClassifier(
            n_estimators=300,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos_weight,
            eval_metric='logloss',
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbosity=0,
        )
        xgb.fit(X_train, y_train)
        models['XGBoost'] = xgb
        print(f"[TRAIN] XGBoost trained in {time.time()-t0:.1f}s")

    # 5. LightGBM (if available)
    if LGBM_AVAILABLE:
        print("[TRAIN] Training LightGBM...")
        t0 = time.time()
        lgb = LGBMClassifier(
            n_estimators=300,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            is_unbalance=True,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbose=-1,
        )
        lgb.fit(X_train, y_train)
        models['LightGBM'] = lgb
        print(f"[TRAIN] LightGBM trained in {time.time()-t0:.1f}s")

    return models


# ============================================================================
# Evaluation
# ============================================================================
def evaluate_model(model, X_test, y_test, model_name: str) -> dict:
    """Evaluate a single model and return metrics dict."""
    t_start = time.time()
    y_proba = model.predict_proba(X_test)[:, 1]
    pred_time = (time.time() - t_start) * 1000  # ms
    y_pred = (y_proba >= 0.5).astype(int)

    metrics = {
        'accuracy':         float(accuracy_score(y_test, y_pred)),
        'precision':        float(precision_score(y_test, y_pred, zero_division=0)),
        'recall':           float(recall_score(y_test, y_pred, zero_division=0)),
        'f1':               float(f1_score(y_test, y_pred, zero_division=0)),
        'roc_auc':          float(roc_auc_score(y_test, y_proba)),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'pred_time_ms':     round(pred_time, 2),
        'y_proba':          y_proba,
        'y_pred':           y_pred,
    }

    print(f"\n[EVAL] {model_name}:")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1:        {metrics['f1']:.4f}")
    print(f"  ROC-AUC:   {metrics['roc_auc']:.4f}")
    print(f"  Pred time: {metrics['pred_time_ms']:.1f}ms (test set)")
    print(f"  Confusion Matrix: {metrics['confusion_matrix']}")

    return metrics


def cross_validate_model(model_class, model_kwargs, X, y, model_name: str) -> dict:
    """Perform 5-fold stratified CV and return mean metrics."""
    skf = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)

    fold_accuracies = []
    fold_roc_aucs = []
    fold_f1s = []

    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), 1):
        X_tr, X_val = X[train_idx], X[val_idx]
        y_tr, y_val = y[train_idx], y[val_idx]

        model = model_class(**model_kwargs)
        model.fit(X_tr, y_tr)

        y_proba = model.predict_proba(X_val)[:, 1]
        y_pred = (y_proba >= 0.5).astype(int)

        acc = accuracy_score(y_val, y_pred)
        roc = roc_auc_score(y_val, y_proba)
        f1 = f1_score(y_val, y_pred, zero_division=0)

        fold_accuracies.append(acc)
        fold_roc_aucs.append(roc)
        fold_f1s.append(f1)
        print(f"  Fold {fold}/{CV_FOLDS}: Acc={acc:.4f} ROC-AUC={roc:.4f} F1={f1:.4f}")

    cv_results = {
        'mean_accuracy': float(np.mean(fold_accuracies)),
        'std_accuracy':  float(np.std(fold_accuracies)),
        'mean_roc_auc':  float(np.mean(fold_roc_aucs)),
        'std_roc_auc':   float(np.std(fold_roc_aucs)),
        'mean_f1':       float(np.mean(fold_f1s)),
        'std_f1':        float(np.std(fold_f1s)),
    }
    print(f"[CV] {model_name}: Mean Acc={cv_results['mean_accuracy']:.4f} "
          f"Mean ROC-AUC={cv_results['mean_roc_auc']:.4f} "
          f"Mean F1={cv_results['mean_f1']:.4f}")
    return cv_results


# ============================================================================
# Hyperparameter Optimization
# ============================================================================
def optimize_hyperparameters(best_name: str, best_model, X_train, y_train) -> object:
    """
    Run RandomizedSearchCV on the best model to find optimal hyperparameters.
    Returns the optimized model (refitted on full training set).
    """
    print(f"\n[HYPERPARAM] Running RandomizedSearchCV for {best_name} ({HYPERPARAM_ITER} iterations)...")

    if best_name in ('RandomForest', 'ExtraTrees'):
        ModelClass = RandomForestClassifier if best_name == 'RandomForest' else ExtraTreesClassifier
        param_dist = {
            'n_estimators':      [100, 200, 300, 500],
            'max_depth':         [8, 10, 12, 15, 20, None],
            'max_features':      ['sqrt', 'log2', 0.5, 0.7],
            'min_samples_leaf':  [1, 2, 5, 10],
            'min_samples_split': [2, 5, 10],
        }
        base_model = ModelClass(class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1)

    elif best_name == 'GradientBoosting':
        ModelClass = GradientBoostingClassifier
        param_dist = {
            'n_estimators':  [100, 200, 300],
            'max_depth':     [3, 5, 6, 8],
            'learning_rate': [0.05, 0.1, 0.15, 0.2],
            'subsample':     [0.7, 0.8, 0.9, 1.0],
            'max_features':  ['sqrt', 'log2', None],
        }
        base_model = GradientBoostingClassifier(random_state=RANDOM_STATE)

    elif best_name == 'XGBoost' and XGB_AVAILABLE:
        n_pos = int(y_train.sum())
        n_neg = len(y_train) - n_pos
        param_dist = {
            'n_estimators':      [100, 200, 300, 500],
            'max_depth':         [4, 6, 8, 10],
            'learning_rate':     [0.05, 0.1, 0.15, 0.2],
            'subsample':         [0.7, 0.8, 0.9],
            'colsample_bytree':  [0.7, 0.8, 0.9],
        }
        base_model = XGBClassifier(
            scale_pos_weight=n_neg / max(n_pos, 1),
            eval_metric='logloss',
            random_state=RANDOM_STATE, n_jobs=-1, verbosity=0
        )

    elif best_name == 'LightGBM' and LGBM_AVAILABLE:
        param_dist = {
            'n_estimators':  [100, 200, 300, 500],
            'max_depth':     [4, 6, 8, 10, -1],
            'learning_rate': [0.05, 0.1, 0.15, 0.2],
            'subsample':     [0.7, 0.8, 0.9],
            'num_leaves':    [31, 63, 127],
        }
        base_model = LGBMClassifier(
            is_unbalance=True, random_state=RANDOM_STATE, n_jobs=-1, verbose=-1
        )
    else:
        print(f"[HYPERPARAM] No tuning config for {best_name}, skipping.")
        return best_model

    search = RandomizedSearchCV(
        base_model,
        param_distributions=param_dist,
        n_iter=HYPERPARAM_ITER,
        cv=5,
        scoring='roc_auc',
        n_jobs=-1,
        random_state=RANDOM_STATE,
        verbose=1,
    )
    search.fit(X_train, y_train)

    print(f"\n[HYPERPARAM] Best params for {best_name}:")
    for k, v in search.best_params_.items():
        print(f"  {k}: {v}")
    print(f"[HYPERPARAM] Best CV ROC-AUC: {search.best_score_:.4f}")

    return search.best_estimator_


# ============================================================================
# Plot Generation
# ============================================================================
def plot_confusion_matrix(cm, model_name: str, out_path: Path):
    """Save confusion matrix heatmap."""
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                xticklabels=['Not Recommended', 'Recommended'],
                yticklabels=['Not Recommended', 'Recommended'])
    ax.set_ylabel('True Label')
    ax.set_xlabel('Predicted Label')
    ax.set_title(f'Confusion Matrix - {model_name}')
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"  -> Saved {out_path}")


def plot_roc(y_test, y_proba, model_name: str, out_path: Path):
    """Save ROC curve plot."""
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    auc = roc_auc_score(y_test, y_proba)
    plt.figure(figsize=(5, 4))
    plt.plot(fpr, tpr, label=f'{model_name} (AUC={auc:.3f})')
    plt.plot([0, 1], [0, 1], 'k--', alpha=0.5)
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve - {model_name}')
    plt.legend(loc='lower right')
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"  -> Saved {out_path}")


def plot_roc_comparison(results: dict, y_test, out_path: Path):
    """Save overlay ROC curve for all models."""
    plt.figure(figsize=(6, 5))
    for name, info in results.items():
        m = info['metrics']
        fpr, tpr, _ = roc_curve(y_test, m['y_proba'])
        auc = m['roc_auc']
        plt.plot(fpr, tpr, label=f'{name} (AUC={auc:.3f})')
    plt.plot([0, 1], [0, 1], 'k--', alpha=0.4, label='Random')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve Comparison — All Models')
    plt.legend(loc='lower right', fontsize=8)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"  -> Saved ROC comparison: {out_path}")


def plot_pr(y_test, y_proba, model_name: str, out_path: Path):
    """Save Precision-Recall curve plot."""
    prec, rec, _ = precision_recall_curve(y_test, y_proba)
    plt.figure(figsize=(5, 4))
    plt.plot(rec, prec, label=model_name)
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title(f'Precision-Recall Curve - {model_name}')
    plt.legend(loc='lower left')
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"  -> Saved {out_path}")


def plot_feature_importance(model, feature_names, model_name: str, out_path: Path, top_n: int = 20):
    """Save feature importance bar chart (top N features)."""
    if not hasattr(model, 'feature_importances_'):
        return
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]
    top_names = [feature_names[i] for i in indices]
    top_vals = importances[indices]

    plt.figure(figsize=(8, 6))
    colors = ['#2ecc71' if 'match' in n or 'ratio' in n else '#3498db' for n in top_names]
    plt.barh(range(len(indices)), top_vals[::-1], color=colors[::-1])
    plt.yticks(range(len(indices)), top_names[::-1])
    plt.xlabel('Gini Importance')
    plt.title(f'Feature Importance (Top {top_n}) — {model_name}\n'
              f'[Green = engineered interaction features]')
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"  -> Saved feature importance: {out_path}")


def generate_shap_or_permutation(model, X_sample, y_sample, feature_names, model_name: str, out_dir: Path):
    """Generate SHAP summary plot; fall back to permutation importance if SHAP fails."""
    shap_path = out_dir / f'shap_{model_name}.png'
    perm_path = out_dir / f'perm_importance_{model_name}.png'

    if SHAP_AVAILABLE:
        try:
            print(f"[SHAP] Computing SHAP values for {model_name}...")
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_sample)
            # For binary classification, shap_values may be a list [class_0, class_1]
            if isinstance(shap_values, list) and len(shap_values) == 2:
                sv = shap_values[1]  # class 1 (recommended)
            else:
                sv = shap_values

            plt.figure()
            shap.summary_plot(sv, X_sample, feature_names=feature_names, show=False)
            plt.tight_layout()
            plt.savefig(shap_path, dpi=150, bbox_inches='tight')
            plt.close()
            print(f"  -> Saved SHAP plot: {shap_path}")
            return str(shap_path), 'shap'
        except Exception as e:
            print(f"[SHAP] Failed for {model_name}: {e}")
            print("[SHAP] Falling back to permutation importance...")

    # Fallback: permutation importance
    from sklearn.inspection import permutation_importance
    print(f"[PERM] Computing permutation importance for {model_name}...")
    result = permutation_importance(model, X_sample, y_sample, n_repeats=10,
                                     random_state=RANDOM_STATE, n_jobs=-1)
    importances = result.importances_mean
    sorted_idx = np.argsort(importances)[::-1][:15]  # top 15

    plt.figure(figsize=(8, 6))
    plt.barh(range(len(sorted_idx)), importances[sorted_idx][::-1])
    plt.yticks(range(len(sorted_idx)),
               [feature_names[i] for i in sorted_idx][::-1])
    plt.xlabel('Mean Importance')
    plt.title(f'Permutation Feature Importance - {model_name}')
    plt.tight_layout()
    plt.savefig(perm_path, dpi=150)
    plt.close()
    print(f"  -> Saved permutation importance: {perm_path}")
    return str(perm_path), 'permutation'


def plot_model_comparison_table(results: dict, out_path: Path):
    """Save a model comparison table as an image."""
    rows = []
    for name, info in results.items():
        m = info['metrics']
        cv = info['cv']
        rows.append({
            'Model': name,
            'Accuracy': f"{m['accuracy']:.4f}",
            'Precision': f"{m['precision']:.4f}",
            'Recall': f"{m['recall']:.4f}",
            'F1': f"{m['f1']:.4f}",
            'ROC-AUC': f"{m['roc_auc']:.4f}",
            'CV ROC-AUC': f"{cv['mean_roc_auc']:.4f} ± {cv['std_roc_auc']:.4f}",
            'Pred (ms)': f"{m.get('pred_time_ms', 0):.1f}",
        })

    df_table = pd.DataFrame(rows)
    fig, ax = plt.subplots(figsize=(14, len(rows) * 0.6 + 1.5))
    ax.axis('off')
    tbl = ax.table(
        cellText=df_table.values,
        colLabels=df_table.columns,
        loc='center',
        cellLoc='center'
    )
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(9)
    tbl.scale(1, 1.5)
    plt.title('Model Comparison — GreenConstruct AI v3.0', fontsize=12, pad=12)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  -> Saved model comparison table: {out_path}")


# ============================================================================
# Model Selection
# ============================================================================
def select_best_model(results: dict) -> str:
    """Select best model using ranking:
    1. ROC-AUC (primary)
    2. F1 Score (secondary)
    3. CV Mean ROC-AUC (tertiary)
    If top two models are within 1% on ROC-AUC and F1, prefer RandomForest.
    """
    ranking = []
    for name, info in results.items():
        m = info['metrics']
        cv = info['cv']
        ranking.append({
            'name': name,
            'roc_auc': m['roc_auc'],
            'f1': m['f1'],
            'cv_mean_roc_auc': cv['mean_roc_auc'],
        })

    # Sort descending by (roc_auc, f1, cv_mean_roc_auc)
    ranking.sort(key=lambda x: (x['roc_auc'], x['f1'], x['cv_mean_roc_auc']), reverse=True)

    best = ranking[0]
    print(f"\n[SELECT] Model ranking:")
    for i, r in enumerate(ranking, 1):
        marker = " <-- BEST" if r['name'] == best['name'] else ""
        print(f"  {i}. {r['name']}: ROC-AUC={r['roc_auc']:.4f} F1={r['f1']:.4f} "
              f"CV-ROC={r['cv_mean_roc_auc']:.4f}{marker}")

    # Check if top two are within 1% — prefer simpler model (RandomForest)
    if len(ranking) >= 2:
        second = ranking[1]
        roc_diff = abs(best['roc_auc'] - second['roc_auc'])
        f1_diff = abs(best['f1'] - second['f1'])
        if roc_diff <= 0.01 and f1_diff <= 0.01:
            for r in ranking[:2]:
                if r['name'] == 'RandomForest':
                    print(f"[SELECT] Models within 1% — preferring RandomForest for explainability.")
                    return 'RandomForest'

    return best['name']


# ============================================================================
# Save Artefacts
# ============================================================================
def save_artefacts(best_name, results, encoder, scaler, feature_columns, cat_cols, num_cols, df, out_dir):
    """Save all model artefacts to disk."""
    best_model = results[best_name]['model']
    best_metrics = results[best_name]['metrics']
    best_cv = results[best_name]['cv']

    # 1. Save best model
    model_path = out_dir / 'best_model.pkl'
    joblib.dump(best_model, model_path)
    model_size_mb = model_path.stat().st_size / (1024 * 1024)
    print(f"\n[SAVE] Best model saved: {model_path} ({model_size_mb:.1f} MB)")

    # 2. Save encoder
    encoder_path = out_dir / 'encoder.pkl'
    joblib.dump(encoder, encoder_path)
    print(f"[SAVE] Encoder saved: {encoder_path}")

    # 3. Save scaler (NEW in v3.0)
    scaler_path = out_dir / 'scaler.pkl'
    joblib.dump(scaler, scaler_path)
    print(f"[SAVE] Scaler saved: {scaler_path}")

    # 4. Save feature columns
    fc_path = out_dir / 'feature_columns.pkl'
    joblib.dump(feature_columns, fc_path)
    print(f"[SAVE] Feature columns saved: {fc_path}")

    # 5. Save label_encoders (encoder categories for each categorical column)
    label_encoders = {}
    if cat_cols and hasattr(encoder, 'categories_'):
        for i, col in enumerate(cat_cols):
            label_encoders[col] = encoder.categories_[i].tolist()
    le_path = out_dir / 'label_encoders.pkl'
    joblib.dump(label_encoders, le_path)
    print(f"[SAVE] Label encoders saved: {le_path}")

    # 6. Save metadata.json
    metadata = {
        'model_name': best_name,
        'pipeline_version': '3.0',
        'model_file': 'best_model.pkl',
        'encoder_file': 'encoder.pkl',
        'scaler_file': 'scaler.pkl',
        'feature_columns_file': 'feature_columns.pkl',
        'label_encoders_file': 'label_encoders.pkl',
        'training_date': datetime.datetime.utcnow().isoformat() + 'Z',
        'random_state': RANDOM_STATE,
        'train_test_split': f'{int((1-TEST_SIZE)*100)}/{int(TEST_SIZE*100)} stratified',
        'cv_folds': CV_FOLDS,
        'engineering_weight': 0.70,   # Default; overridden by adaptive logic at runtime
        'ml_weight': 0.30,
        'adaptive_weighting': True,
        'model_size_mb': round(model_size_mb, 2),
        'feature_count': len(feature_columns),
        'categorical_features': cat_cols,
        'numeric_features': num_cols,
        'interaction_features': [
            'floor_to_limit_ratio', 'sector_match', 'zone_match',
            'coastal_corrosion_match', 'humidity_moisture_match', 'budget_sustainability_fit'
        ],
        'dataset_rows': len(df),
        'target_distribution': df[TARGET_COLUMN].value_counts().to_dict() if TARGET_COLUMN in df.columns else {},
        'fixed_leakage': ['recommendation_score'],
        'removed_zero_variance': ['suitable_for_dry_zone'],
    }
    with open(out_dir / 'metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print(f"[SAVE] metadata.json saved")

    # 7. Save training_metrics.json (all models + best model details)
    all_model_metrics = {}
    for name, info in results.items():
        m = info['metrics']
        cv = info['cv']
        all_model_metrics[name] = {
            'accuracy': m['accuracy'],
            'precision': m['precision'],
            'recall': m['recall'],
            'f1': m['f1'],
            'roc_auc': m['roc_auc'],
            'confusion_matrix': m['confusion_matrix'],
            'pred_time_ms': m.get('pred_time_ms', 0),
            'cv_mean_accuracy': cv['mean_accuracy'],
            'cv_std_accuracy': cv['std_accuracy'],
            'cv_mean_roc_auc': cv['mean_roc_auc'],
            'cv_std_roc_auc': cv['std_roc_auc'],
            'cv_mean_f1': cv['mean_f1'],
            'cv_std_f1': cv['std_f1'],
        }

    training_metrics = {
        'selected_model': best_name,
        'pipeline_version': '3.0',
        'accuracy': best_metrics['accuracy'],
        'precision': best_metrics['precision'],
        'recall': best_metrics['recall'],
        'f1': best_metrics['f1'],
        'roc_auc': best_metrics['roc_auc'],
        'cv_mean_accuracy': best_cv['mean_accuracy'],
        'cv_mean_roc_auc': best_cv['mean_roc_auc'],
        'cv_mean_f1': best_cv['mean_f1'],
        'training_date': metadata['training_date'],
        'dataset_size': len(df),
        'feature_count': len(feature_columns),
        'model_version': '3.0',
        'random_seed': RANDOM_STATE,
        'leakage_fix_applied': True,
        'interaction_features_added': 6,
        'all_models': all_model_metrics,
    }
    with open(out_dir / 'training_metrics.json', 'w', encoding='utf-8') as f:
        json.dump(training_metrics, f, indent=2)
    print(f"[SAVE] training_metrics.json saved")

    # 8. Save feature_metadata.json
    X_df = df.drop(columns=[TARGET_COLUMN])
    feature_meta = []
    for col in feature_columns:
        entry = {'feature': col, 'datatype': str(X_df[col].dtype)}
        if X_df[col].dtype.kind in 'bifc':  # numeric
            entry['encoding'] = 'scaled_numeric'
            entry['min'] = float(X_df[col].min())
            entry['max'] = float(X_df[col].max())
            entry['is_interaction'] = col in metadata['interaction_features']
        else:  # categorical
            entry['encoding'] = 'ordinal'
            entry['allowed_values'] = sorted(X_df[col].dropna().unique().tolist())
        feature_meta.append(entry)

    with open(out_dir / 'feature_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(feature_meta, f, indent=2)
    print(f"[SAVE] feature_metadata.json saved")


# ============================================================================
# Main
# ============================================================================
def main():
    print("=" * 70)
    print("GreenConstructAI - Material Recommendation Model Training v3.0")
    print("=" * 70)
    print("KEY CHANGES: Leakage fix + Interaction features + Model comparison")
    print("=" * 70)

    start_time = time.time()

    # 1. Load and clean data
    csv_path = find_dataset()
    df = load_and_clean(csv_path)

    # 2. Engineer interaction features
    df = engineer_features(df)

    # 3. Encode + Scale features
    X, y, encoder, scaler, feature_columns, cat_cols, num_cols = encode_and_scale_features(df)

    # 4. Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE
    )
    print(f"\n[SPLIT] Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"[SPLIT] Train pos rate: {y_train.mean():.4f} | Test pos rate: {y_test.mean():.4f}")

    # 5. Train all models
    models = train_models(X_train, y_train)

    # 6. Evaluate all models
    results = {}
    for name, model in models.items():
        metrics = evaluate_model(model, X_test, y_test, name)
        results[name] = {'model': model, 'metrics': metrics}

    # 7. Cross-validate all models
    print(f"\n{'='*50}")
    print(f"5-Fold Stratified Cross Validation")
    print(f"{'='*50}")

    cv_configs = {
        'RandomForest': (RandomForestClassifier, {
            'n_estimators': 300, 'max_depth': 15, 'min_samples_leaf': 5,
            'class_weight': 'balanced', 'random_state': RANDOM_STATE, 'n_jobs': -1
        }),
        'ExtraTrees': (ExtraTreesClassifier, {
            'n_estimators': 300, 'max_depth': 15, 'min_samples_leaf': 5,
            'class_weight': 'balanced', 'random_state': RANDOM_STATE, 'n_jobs': -1
        }),
        'GradientBoosting': (GradientBoostingClassifier, {
            'n_estimators': 200, 'max_depth': 6, 'learning_rate': 0.1,
            'subsample': 0.8, 'random_state': RANDOM_STATE
        }),
    }
    if XGB_AVAILABLE:
        n_pos = int(y.sum()); n_neg = len(y) - n_pos
        cv_configs['XGBoost'] = (XGBClassifier, {
            'n_estimators': 300, 'max_depth': 8, 'learning_rate': 0.1,
            'subsample': 0.8, 'colsample_bytree': 0.8,
            'scale_pos_weight': n_neg / max(n_pos, 1),
            'eval_metric': 'logloss', 'random_state': RANDOM_STATE, 'n_jobs': -1, 'verbosity': 0
        })
    if LGBM_AVAILABLE:
        cv_configs['LightGBM'] = (LGBMClassifier, {
            'n_estimators': 300, 'max_depth': 8, 'learning_rate': 0.1,
            'subsample': 0.8, 'colsample_bytree': 0.8, 'is_unbalance': True,
            'random_state': RANDOM_STATE, 'n_jobs': -1, 'verbose': -1
        })

    for name in models.keys():
        if name in cv_configs:
            cls, kwargs = cv_configs[name]
            print(f"\n[CV] {name}:")
            cv_result = cross_validate_model(cls, kwargs, X, y, name)
            results[name]['cv'] = cv_result
        else:
            results[name]['cv'] = {
                'mean_accuracy': results[name]['metrics']['accuracy'],
                'std_accuracy': 0.0,
                'mean_roc_auc': results[name]['metrics']['roc_auc'],
                'std_roc_auc': 0.0,
                'mean_f1': results[name]['metrics']['f1'],
                'std_f1': 0.0,
            }

    # 8. Select best model (before hyperparameter optimization)
    best_name = select_best_model(results)

    # 9. Hyperparameter optimization on best model
    print(f"\n{'='*50}")
    print(f"Hyperparameter Optimization — {best_name}")
    print(f"{'='*50}")
    optimized_model = optimize_hyperparameters(best_name, results[best_name]['model'], X_train, y_train)

    # Re-evaluate the optimized model
    print(f"\n[EVAL] Optimized {best_name} (after RandomizedSearchCV):")
    optimized_metrics = evaluate_model(optimized_model, X_test, y_test, f"{best_name}_Optimized")
    results[best_name]['model'] = optimized_model
    results[best_name]['metrics'] = optimized_metrics

    # 10. Generate plots
    print(f"\n{'='*50}")
    print(f"Generating Evaluation Plots")
    print(f"{'='*50}")
    for name, info in results.items():
        m = info['metrics']
        cm = np.array(m['confusion_matrix'])
        plot_confusion_matrix(cm, name, OUTPUT_DIR / f'confusion_{name}.png')
        plot_roc(y_test, m['y_proba'], name, OUTPUT_DIR / f'roc_{name}.png')
        plot_pr(y_test, m['y_proba'], name, OUTPUT_DIR / f'pr_{name}.png')

    # Overlay ROC comparison
    plot_roc_comparison(results, y_test, OUTPUT_DIR / 'roc_comparison_all_models.png')

    # Feature importance for best model
    plot_feature_importance(
        results[best_name]['model'], feature_columns, best_name,
        OUTPUT_DIR / f'feature_importance_{best_name}.png', top_n=20
    )

    # Model comparison table
    plot_model_comparison_table(results, OUTPUT_DIR / 'model_comparison_table.png')

    # 11. SHAP / permutation importance
    print(f"\n{'='*50}")
    print(f"Feature Importance / SHAP ({best_name})")
    print(f"{'='*50}")
    sample_size = min(500, len(X_test))
    rng = np.random.RandomState(RANDOM_STATE)
    sample_idx = rng.choice(len(X_test), size=sample_size, replace=False)
    X_sample = X_test[sample_idx]
    y_sample = y_test[sample_idx]
    fi_path, fi_method = generate_shap_or_permutation(
        results[best_name]['model'], X_sample, y_sample, feature_columns, best_name, OUTPUT_DIR
    )

    # 12. Save all artefacts
    print(f"\n{'='*50}")
    print(f"Saving Artefacts")
    print(f"{'='*50}")
    save_artefacts(best_name, results, encoder, scaler, feature_columns, cat_cols, num_cols, df, OUTPUT_DIR)

    # 13. Summary
    elapsed = time.time() - start_time
    best_m = results[best_name]['metrics']
    best_cv = results[best_name]['cv']

    print(f"\n{'='*70}")
    print(f"TRAINING COMPLETE — v3.0")
    print(f"{'='*70}")
    print(f"Best Model:      {best_name}")
    print(f"Accuracy:        {best_m['accuracy']:.4f}")
    print(f"Precision:       {best_m['precision']:.4f}")
    print(f"Recall:          {best_m['recall']:.4f}")
    print(f"F1 Score:        {best_m['f1']:.4f}")
    print(f"ROC-AUC:         {best_m['roc_auc']:.4f}")
    print(f"CV Mean ROC-AUC: {best_cv['mean_roc_auc']:.4f} ± {best_cv['std_roc_auc']:.4f}")
    print(f"FI Method:       {fi_method}")
    print(f"Total Time:      {elapsed:.1f}s")
    print(f"Features:        {len(feature_columns)} (including 6 new interaction features)")
    print(f"{'='*70}")


if __name__ == '__main__':
    main()
