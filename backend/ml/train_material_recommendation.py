# backend/ml/train_material_recommendation.py
"""
GreenConstructAI - Material Recommendation Model Training Pipeline
==================================================================

Trains a binary classifier that answers:
  "Given THIS building AND THIS material, should this material be recommended?"

Dataset: GreenConstructAI_ML_Dataset.csv (~11,000 rows x 36 columns)
Each row = one building scenario + one candidate material.

Target: 'recommended' (0/1)

Pipeline:
  1. Load CSV, clean, deduplicate, impute missing values
  2. Drop non-feature columns (row_id, decision_reasons, recommendation_score)
  3. Encode categoricals with OrdinalEncoder
  4. Stratified 80/20 train-test split (random_state=42)
  5. Train RandomForest, XGBoost, LightGBM
  6. Evaluate: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
  7. 5-fold Stratified Cross Validation
  8. Generate plots: confusion matrix, ROC curve, PR curve
  9. SHAP summary plot (fallback: permutation importance)
 10. Select best model: ROC-AUC -> F1 -> CV mean (within 1% prefer RandomForest)
 11. Save artefacts: best_model.pkl, encoder.pkl, feature_columns.pkl,
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

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import OrdinalEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve,
)
from sklearn.ensemble import RandomForestClassifier

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

# Columns to DROP before training (non-feature columns)
DROP_COLUMNS = ['row_id', 'decision_reasons', 'recommendation_score']
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
    
    # Drop non-feature columns
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
    
    print(f"[TRAIN] Final dataset shape: {df.shape}")
    print(f"[TRAIN] Target distribution:\n{df[TARGET_COLUMN].value_counts()}")
    return df

# ============================================================================
# Feature Encoding
# ============================================================================
def encode_features(df: pd.DataFrame):
    """Encode categorical features with OrdinalEncoder.
    
    Returns:
        X: numpy array of encoded features
        y: numpy array of target values
        encoder: fitted OrdinalEncoder
        feature_columns: list of feature column names (in order)
        cat_cols: list of categorical column names
        num_cols: list of numeric column names
    """
    X_df = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN].values
    
    feature_columns = X_df.columns.tolist()
    cat_cols = X_df.select_dtypes(include=['object', 'category']).columns.tolist()
    num_cols = X_df.select_dtypes(include=[np.number]).columns.tolist()
    
    print(f"[TRAIN] Feature columns ({len(feature_columns)}): {feature_columns}")
    print(f"[TRAIN] Categorical ({len(cat_cols)}): {cat_cols}")
    print(f"[TRAIN] Numeric ({len(num_cols)}): {num_cols}")
    
    # Create and fit OrdinalEncoder on categorical columns
    encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    if cat_cols:
        X_df[cat_cols] = encoder.fit_transform(X_df[cat_cols])
    
    X = X_df.values.astype(np.float32)
    return X, y, encoder, feature_columns, cat_cols, num_cols

# ============================================================================
# Model Training
# ============================================================================
def train_models(X_train, y_train):
    """Train RandomForest, XGBoost, and LightGBM classifiers."""
    models = {}
    
    # 1. Random Forest (always available)
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
    
    # 2. XGBoost
    if XGB_AVAILABLE:
        print("[TRAIN] Training XGBoost...")
        t0 = time.time()
        # Compute scale_pos_weight for imbalanced data
        n_pos = int(y_train.sum())
        n_neg = len(y_train) - n_pos
        scale_pos_weight = n_neg / max(n_pos, 1)
        xgb = XGBClassifier(
            n_estimators=300,
            max_depth=10,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos_weight,
            eval_metric='logloss',
            random_state=RANDOM_STATE,
            n_jobs=-1,
        )
        xgb.fit(X_train, y_train)
        models['XGBoost'] = xgb
        print(f"[TRAIN] XGBoost trained in {time.time()-t0:.1f}s")
    
    # 3. LightGBM
    if LGBM_AVAILABLE:
        print("[TRAIN] Training LightGBM...")
        t0 = time.time()
        lgb = LGBMClassifier(
            n_estimators=300,
            max_depth=10,
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
    y_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_proba >= 0.5).astype(int)
    
    metrics = {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision': float(precision_score(y_test, y_pred, zero_division=0)),
        'recall': float(recall_score(y_test, y_pred, zero_division=0)),
        'f1': float(f1_score(y_test, y_pred, zero_division=0)),
        'roc_auc': float(roc_auc_score(y_test, y_proba)),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'y_proba': y_proba,
        'y_pred': y_pred,
    }
    
    print(f"\n[EVAL] {model_name}:")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1:        {metrics['f1']:.4f}")
    print(f"  ROC-AUC:   {metrics['roc_auc']:.4f}")
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
        'std_accuracy': float(np.std(fold_accuracies)),
        'mean_roc_auc': float(np.mean(fold_roc_aucs)),
        'std_roc_auc': float(np.std(fold_roc_aucs)),
        'mean_f1': float(np.mean(fold_f1s)),
        'std_f1': float(np.std(fold_f1s)),
    }
    print(f"[CV] {model_name}: Mean Acc={cv_results['mean_accuracy']:.4f} "
          f"Mean ROC-AUC={cv_results['mean_roc_auc']:.4f} "
          f"Mean F1={cv_results['mean_f1']:.4f}")
    return cv_results

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

def generate_feature_importance(model, X_sample, y_sample, feature_names, model_name: str, out_dir: Path):
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

# ============================================================================
# Model Selection
# ============================================================================
def select_best_model(results: dict) -> str:
    """Select best model using ranking order:
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
            # Prefer RandomForest if it's one of the top two
            for r in ranking[:2]:
                if r['name'] == 'RandomForest':
                    print(f"[SELECT] Models within 1% — preferring RandomForest for explainability.")
                    return 'RandomForest'
    
    return best['name']

# ============================================================================
# Save Artefacts
# ============================================================================
def save_artefacts(best_name, results, encoder, feature_columns, cat_cols, num_cols, df, out_dir):
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
    
    # 3. Save feature columns
    fc_path = out_dir / 'feature_columns.pkl'
    joblib.dump(feature_columns, fc_path)
    print(f"[SAVE] Feature columns saved: {fc_path}")
    
    # 4. Save label_encoders (encoder categories for each categorical column)
    label_encoders = {}
    if cat_cols and hasattr(encoder, 'categories_'):
        for i, col in enumerate(cat_cols):
            label_encoders[col] = encoder.categories_[i].tolist()
    le_path = out_dir / 'label_encoders.pkl'
    joblib.dump(label_encoders, le_path)
    print(f"[SAVE] Label encoders saved: {le_path}")
    
    # 5. Save metadata.json
    metadata = {
        'model_name': best_name,
        'model_file': 'best_model.pkl',
        'encoder_file': 'encoder.pkl',
        'feature_columns_file': 'feature_columns.pkl',
        'label_encoders_file': 'label_encoders.pkl',
        'training_date': datetime.datetime.utcnow().isoformat() + 'Z',
        'random_state': RANDOM_STATE,
        'train_test_split': f'{int((1-TEST_SIZE)*100)}/{int(TEST_SIZE*100)} stratified',
        'cv_folds': CV_FOLDS,
        'engineering_weight': 0.75,
        'ml_weight': 0.25,
        'model_size_mb': round(model_size_mb, 2),
        'feature_count': len(feature_columns),
        'categorical_features': cat_cols,
        'numeric_features': num_cols,
        'dataset_rows': len(df),
        'target_distribution': df[TARGET_COLUMN].value_counts().to_dict() if TARGET_COLUMN in df.columns else {},
    }
    with open(out_dir / 'metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print(f"[SAVE] metadata.json saved")
    
    # 6. Save training_metrics.json (all models + best model details)
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
            'cv_mean_accuracy': cv['mean_accuracy'],
            'cv_std_accuracy': cv['std_accuracy'],
            'cv_mean_roc_auc': cv['mean_roc_auc'],
            'cv_std_roc_auc': cv['std_roc_auc'],
            'cv_mean_f1': cv['mean_f1'],
            'cv_std_f1': cv['std_f1'],
        }
    
    training_metrics = {
        'selected_model': best_name,
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
        'model_version': '2.0',
        'random_seed': RANDOM_STATE,
        'all_models': all_model_metrics,
    }
    with open(out_dir / 'training_metrics.json', 'w', encoding='utf-8') as f:
        json.dump(training_metrics, f, indent=2)
    print(f"[SAVE] training_metrics.json saved")
    
    # 7. Save feature_metadata.json
    feature_meta = []
    X_df = df.drop(columns=[TARGET_COLUMN])
    for col in feature_columns:
        entry = {'feature': col, 'datatype': str(X_df[col].dtype)}
        if X_df[col].dtype.kind in 'bifc':  # numeric
            entry['encoding'] = 'none'
            entry['min'] = float(X_df[col].min())
            entry['max'] = float(X_df[col].max())
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
    print("GreenConstructAI - Material Recommendation Model Training")
    print("=" * 70)
    
    start_time = time.time()
    
    # 1. Load and clean data
    csv_path = find_dataset()
    df = load_and_clean(csv_path)
    
    # 2. Encode features
    X, y, encoder, feature_columns, cat_cols, num_cols = encode_features(df)
    
    # 3. Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE
    )
    print(f"\n[SPLIT] Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"[SPLIT] Train pos rate: {y_train.mean():.4f} | Test pos rate: {y_test.mean():.4f}")
    
    # 4. Train models
    models = train_models(X_train, y_train)
    
    # 5. Evaluate all models
    results = {}
    for name, model in models.items():
        metrics = evaluate_model(model, X_test, y_test, name)
        results[name] = {'model': model, 'metrics': metrics}
    
    # 6. Cross-validate all models
    print(f"\n{'='*50}")
    print(f"5-Fold Stratified Cross Validation")
    print(f"{'='*50}")
    
    cv_configs = {
        'RandomForest': (RandomForestClassifier, {
            'n_estimators': 300, 'max_depth': 15, 'min_samples_leaf': 5,
            'class_weight': 'balanced', 'random_state': RANDOM_STATE, 'n_jobs': -1
        }),
    }
    if XGB_AVAILABLE:
        n_pos = int(y.sum())
        n_neg = len(y) - n_pos
        cv_configs['XGBoost'] = (XGBClassifier, {
            'n_estimators': 300, 'max_depth': 10, 'learning_rate': 0.1,
            'subsample': 0.8, 'colsample_bytree': 0.8,
            'scale_pos_weight': n_neg / max(n_pos, 1),
            'eval_metric': 'logloss', 'random_state': RANDOM_STATE, 'n_jobs': -1
        })
    if LGBM_AVAILABLE:
        cv_configs['LightGBM'] = (LGBMClassifier, {
            'n_estimators': 300, 'max_depth': 10, 'learning_rate': 0.1,
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
    
    # 7. Generate plots for all models
    print(f"\n{'='*50}")
    print(f"Generating Evaluation Plots")
    print(f"{'='*50}")
    for name, info in results.items():
        m = info['metrics']
        cm = np.array(m['confusion_matrix'])
        plot_confusion_matrix(cm, name, OUTPUT_DIR / f'confusion_{name}.png')
        plot_roc(y_test, m['y_proba'], name, OUTPUT_DIR / f'roc_{name}.png')
        plot_pr(y_test, m['y_proba'], name, OUTPUT_DIR / f'pr_{name}.png')
    
    # 8. Select best model
    best_name = select_best_model(results)
    best_model = results[best_name]['model']
    
    # 9. Feature importance for best model
    print(f"\n{'='*50}")
    print(f"Feature Importance ({best_name})")
    print(f"{'='*50}")
    # Use a sample for SHAP (max 500 rows for speed)
    sample_size = min(500, len(X_test))
    rng = np.random.RandomState(RANDOM_STATE)
    sample_idx = rng.choice(len(X_test), size=sample_size, replace=False)
    X_sample = X_test[sample_idx]
    y_sample = y_test[sample_idx]
    fi_path, fi_method = generate_feature_importance(
        best_model, X_sample, y_sample, feature_columns, best_name, OUTPUT_DIR
    )
    
    # 10. Save all artefacts
    print(f"\n{'='*50}")
    print(f"Saving Artefacts")
    print(f"{'='*50}")
    save_artefacts(best_name, results, encoder, feature_columns, cat_cols, num_cols, df, OUTPUT_DIR)
    
    # 11. Summary
    elapsed = time.time() - start_time
    best_m = results[best_name]['metrics']
    best_cv = results[best_name]['cv']
    
    print(f"\n{'='*70}")
    print(f"TRAINING COMPLETE")
    print(f"{'='*70}")
    print(f"Best Model:      {best_name}")
    print(f"Accuracy:        {best_m['accuracy']:.4f}")
    print(f"Precision:       {best_m['precision']:.4f}")
    print(f"Recall:          {best_m['recall']:.4f}")
    print(f"F1 Score:        {best_m['f1']:.4f}")
    print(f"ROC-AUC:         {best_m['roc_auc']:.4f}")
    print(f"CV Mean Acc:     {best_cv['mean_accuracy']:.4f}")
    print(f"CV Mean ROC-AUC: {best_cv['mean_roc_auc']:.4f}")
    print(f"CV Mean F1:      {best_cv['mean_f1']:.4f}")
    print(f"FI Method:       {fi_method}")
    print(f"Total Time:      {elapsed:.1f}s")
    print(f"{'='*70}")

if __name__ == '__main__':
    main()
