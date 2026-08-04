import sys
import os
import joblib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'greenconstruct_model.pkl')

print("=" * 70)
print("LOADING MODEL")
print("=" * 70)

model_data = joblib.load(MODEL_PATH)

if isinstance(model_data, dict):
    print(f"model_data keys: {list(model_data.keys())}")
    model = model_data["model"]
    features = model_data.get("features", [])
    print(f"features: {features}")
else:
    model = model_data

print(f"\nModel type: {type(model)}")
print(f"Has predict_proba: {hasattr(model, 'predict_proba')}")
print(f"Has classes_: {hasattr(model, 'classes_')}")

print("\n" + "=" * 70)
print("model.classes_ OVERVIEW")
print("=" * 70)

classes_ = model.classes_
print(f"type(model.classes_): {type(classes_)}")
print(f"len(model.classes_): {len(classes_)}")

for i, cls in enumerate(classes_):
    print(f"\n--- Output index {i} ---")
    print(f"  type(cls):        {type(cls)}")
    print(f"  cls.dtype:        {cls.dtype if hasattr(cls, 'dtype') else 'N/A'}")
    print(f"  len(cls):         {len(cls)}")
    print(f"  First 50 values:  {list(cls[:50])}")
    print(f"  dtype of element: {type(cls[0]) if len(cls) > 0 else 'empty'}")

print("\n" + "=" * 70)
print("FOUNDATION CLASSES (index 0) — DETAILED")
print("=" * 70)

cls0 = model.classes_[0]
print(f"Full classes_[0]: {list(cls0)}")

print("\n" + "=" * 70)
print("DATABASE CHECK — Material_ID for Foundation materials")
print("=" * 70)

from database import get_all_materials, format_material

all_rows = get_all_materials()
all_mats = [format_material(r) for r in all_rows]

foundation_mats = [m for m in all_mats if m["Category"].lower() == "foundation"]
print(f"\nFoundation materials in DB ({len(foundation_mats)} found):")
for m in foundation_mats:
    mat_id = m["Material_ID"]
    mat_id_type = type(mat_id)
    in_cls0 = mat_id in cls0
    print(f"  ID={mat_id!r}  type={mat_id_type.__name__}  in classes_[0]={in_cls0}  name={m['Name']}")

print("\n" + "=" * 70)
print("MEMBERSHIP TYPE TEST — int vs numpy vs string")
print("=" * 70)

target_id = 120
print(f"\ntarget_id = {target_id!r}  type={type(target_id).__name__}")
print(f"  int(120) in cls0:     {int(120) in cls0}")
print(f"  str(120) in cls0:     {str(120) in cls0}")
print(f"  float(120) in cls0:   {float(120) in cls0}")

import numpy as np
print(f"  np.int64(120) in cls0: {np.int64(120) in cls0}")
print(f"  np.int32(120) in cls0: {np.int32(120) in cls0}")

print("\nFirst 10 raw elements of cls0 with full type info:")
for v in cls0[:10]:
    print(f"  value={v!r}  type={type(v).__name__}  module={type(v).__module__}")

print("\n" + "=" * 70)
print("ALL MATERIAL IDs IN DB (ALL CATEGORIES)")
print("=" * 70)
all_ids = [(m["Material_ID"], type(m["Material_ID"]).__name__, m["Category"]) for m in all_mats]
for mid, mtype, mcat in all_ids[:30]:
    print(f"  ID={mid!r}  type={mtype}  category={mcat}")
