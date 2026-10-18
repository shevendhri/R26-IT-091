"""
V7 Model Inspection Script
Read-only analysis — no file modifications.
"""
import joblib
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

MODEL_PATH = os.path.join(BACKEND_DIR, "ml", "greenconstruct_model.pkl")

print("=" * 70)
print("V7 MODEL INSPECTION")
print("=" * 70)

data = joblib.load(MODEL_PATH)
model = data["model"]

print(f"\nVersion            : {data.get('version', 'unknown')}")
print(f"all_db_ids_in_model: {data.get('all_db_ids_in_model', 'NOT SET')}")
print(f"n_estimators       : {model.n_estimators}")
print(f"n_outputs_         : {model.n_outputs_}")

db_ids = data.get("db_material_ids", [])
print(f"\nDB material IDs in bundle ({len(db_ids)} total): {db_ids}")

# Check for any legacy IDs (< 100)
legacy = [i for i in db_ids if i < 100]
print(f"Legacy IDs (< 100) present: {legacy if legacy else 'NONE — confirmed clean'}")

# Check range
if db_ids:
    print(f"ID range in bundle: {min(db_ids)} – {max(db_ids)}")

print("\n" + "=" * 70)
print("classes_ per output")
print("=" * 70)

OUTPUT_NAMES = [
    "Foundation/Concrete/Structural",
    "Walling/Finishing",
    "Roofing",
    "Openings",
    "Flooring/Ceiling/Waterproofing",
]

for i, cls_arr in enumerate(model.classes_):
    cls_list = sorted(cls_arr.tolist())
    legacy_in_cls = [c for c in cls_list if c < 100]
    print(f"\nclasses_[{i}]  ({OUTPUT_NAMES[i]}):")
    print(f"  Count  : {len(cls_list)}")
    print(f"  Values : {cls_list}")
    print(f"  Range  : {min(cls_list)} – {max(cls_list)}")
    if legacy_in_cls:
        print(f"  WARNING: legacy IDs present: {legacy_in_cls}")
    else:
        print(f"  Legacy IDs: NONE")

# --- Coverage check: are all DB IDs in model.classes_? ---
print("\n" + "=" * 70)
print("DB-ID COVERAGE SMOKE TEST")
print("=" * 70)

from database import get_all_materials, format_material

OUTPUT_GROUPS = {
    0: ["Foundation", "Concrete", "Structural"],
    1: ["Walling", "Finishing"],
    2: ["Roofing"],
    3: ["Windows", "Doors"],
    4: ["Flooring", "Ceiling", "Waterproofing"],
}

cat_to_group = {}
for gidx, cats in OUTPUT_GROUPS.items():
    for c in cats:
        cat_to_group[c.lower()] = gidx

rows = get_all_materials()
mats = [format_material(r) for r in rows]
print(f"\nLive DB materials: {len(mats)}")

total_ids = 0
covered = 0
fallback_ids = []

for m in mats:
    mid  = m["Material_ID"]
    gidx = cat_to_group.get(m["Category"].lower(), -1)
    if gidx < 0:
        continue
    total_ids += 1
    cls_arr = model.classes_[gidx]
    if mid in cls_arr:
        covered += 1
    else:
        fallback_ids.append((mid, m["Name"], gidx))

print(f"IDs in mapped groups  : {total_ids}")
print(f"Covered by model      : {covered}")
print(f"Will use fallback     : {len(fallback_ids)}")
if fallback_ids:
    for mid, name, gidx in fallback_ids:
        print(f"  FALLBACK  ID={mid}  group={gidx}  {name}")
else:
    print("  NONE — material_id in classes will ALWAYS be True for current DB")

pct = 100 * covered / total_ids if total_ids else 0
print(f"\nCoverage: {covered}/{total_ids}  ({pct:.1f}%)")

print("\n" + "=" * 70)
print("RECOMMENDATION ENGINE PATH CONFIRMATION")
print("=" * 70)
if covered == total_ids:
    print("""
  The code block:

      if material_id in classes:
          idx = list(classes).index(material_id)
          return float(probs[idx] * 100)

  WILL EXECUTE for ALL {total_ids} current DB materials.
  The heuristic fallback branch is DEAD CODE for the current database.
""".format(total_ids=total_ids))
else:
    print(f"  WARNING: {len(fallback_ids)} IDs will still hit the heuristic fallback.")
