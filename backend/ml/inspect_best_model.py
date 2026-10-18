import joblib
import json
from pathlib import Path

ml_dir = Path(r"C:/Users/ASUS/Desktop/Material specification/backend/ml")
model = joblib.load(ml_dir / "best_model.pkl")
feature_cols = joblib.load(ml_dir / "feature_columns.pkl")
metadata = {}
if (ml_dir / "metadata.json").exists():
    with open(ml_dir / "metadata.json", "r") as f:
        metadata = json.load(f)

importances = model.feature_importances_
pairs = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)

print("=== ALL FEATURE IMPORTANCES ===")
for col, imp in pairs:
    is_cat = col in metadata.get("categorical_features", [])
    is_num = col in metadata.get("numeric_features", [])
    ftype = "Cat" if is_cat else ("Num" if is_num else "Unknown")
    print(f"{col:<30} ({ftype}): {imp:.6f}")
