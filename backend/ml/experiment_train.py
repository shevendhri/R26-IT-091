import os
import sys
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from ml.temp_train_materials import (
    build_name_to_id_map, load_csv_dataset, generate_csv_bridge_samples,
    generate_synthetic_samples, generate_guaranteed_coverage, build_default_targets,
    OUTPUT_GROUPS, OUTPUT_NAMES, FEATURE_NAMES, B_TYPE_MAP, C_ZONE_MAP,
    SALINITY_MAP, STRUCT_MAP, SUS_MAP
)

def train_calibration_models():
    CSV_PATH = os.path.join(BACKEND_DIR, "GreenConstructAI_ML_Dataset.csv")
    
    # 1. Load data
    print("[1] Loading and generating data...")
    name_to_id, id_to_group, mats = build_name_to_id_map()
    all_db_ids = sorted(set(m["Material_ID"] for m in mats))
    
    X_csv, y_csv = load_csv_dataset(CSV_PATH, name_to_id, id_to_group, mats)
    
    default_targets = build_default_targets(mats)
    n_outputs = len(OUTPUT_GROUPS)
    group_defaults = {g: default_targets.get(g, 119) for g in range(n_outputs)}
    
    X_bridge, y_bridge = generate_csv_bridge_samples(CSV_PATH, id_to_group, mats, group_defaults)
    X_syn, y_syn = generate_synthetic_samples(mats, n_per_material=400)
    X_cov, y_cov = generate_guaranteed_coverage(mats, id_to_group, min_appearances=800)
    
    arrays_X = [a for a in [X_csv, X_bridge, X_syn, X_cov] if len(a) > 0]
    arrays_y = [a for a in [y_csv, y_bridge, y_syn, y_cov] if len(a) > 0]
    X_all = np.vstack(arrays_X)
    y_all = np.vstack(arrays_y)
    
    X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.15, random_state=42)
    print(f"Dataset generated. Train size: {len(X_train)}")

    # 2. Build model payload functions
    label_map = {}
    for i in range(len(OUTPUT_GROUPS)):
        label_map[f"output_{i}"] = {
            int(mid): next((m["Name"] for m in mats if m["Material_ID"] == mid), str(mid))
            for name, mid in name_to_id.items()
            if id_to_group.get(mid) == i
        }

    encoder_map = {
        "building_type":        {v: k for k, v in B_TYPE_MAP.items()},
        "climate_zone":         {v: k for k, v in C_ZONE_MAP.items()},
        "salinity":             {v: k for k, v in SALINITY_MAP.items()},
        "structural_system":    {v: k for k, v in STRUCT_MAP.items()},
        "sustainability_level": {v: k for k, v in SUS_MAP.items()},
    }
    
    def save_model(model_obj, filename, desc):
        model_data = {
            "model":        model_obj,
            "version":      "v7",
            "description":  desc,
            "features":      FEATURE_NAMES,
            "output_groups": {str(k): v for k, v in OUTPUT_GROUPS.items()},
            "output_names":  OUTPUT_NAMES,
            "label_map":     label_map,
            "encoder_map":   encoder_map,
            "all_db_ids_in_model": True,
            "db_material_ids": all_db_ids,
        }
        out_path = os.path.join(BACKEND_DIR, "ml", filename)
        joblib.dump(model_data, out_path, compress=3, protocol=4)
        print(f"Saved {filename}")

    models = [
        {"name": "A", "max_depth": 15, "min_samples_leaf": 1, "desc": "Model A (Current Baseline)"},
        {"name": "B", "max_depth": 15, "min_samples_leaf": 10, "desc": "Model B (Moderate Smoothing)"},
        {"name": "C", "max_depth": 10, "min_samples_leaf": 20, "desc": "Model C (Strong Smoothing)"}
    ]
    
    for cfg in models:
        print(f"\nTraining Model {cfg['name']} (depth={cfg['max_depth']}, leaf={cfg['min_samples_leaf']})")
        model = RandomForestClassifier(
            n_estimators=300,
            max_depth=cfg['max_depth'],
            min_samples_split=2,
            min_samples_leaf=cfg['min_samples_leaf'],
            class_weight="balanced_subsample",
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X_train, y_train)
        save_model(model, f"model_{cfg['name']}.pkl", cfg['desc'])

if __name__ == "__main__":
    train_calibration_models()
