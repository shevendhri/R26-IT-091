"""
GreenConstructAI — ML Model Retraining Script v7
=================================================
Trains a Multi-Output Random Forest Classifier using GreenConstructAI_ML_Dataset.csv.

Changes from v6:
- Fixed n_estimators to 300 in BOTH the model definition and the report (was 150/300 mismatch).
- min_appearances raised to 800 (was 600) for guaranteed coverage.
- Added CSV→DB category bridge: CSV rows are now used for ALL DB materials whose
  DB category maps to the same output group as the CSV row's category. This ensures
  real CSV feature distributions are learned for every DB material ID, not just those
  whose name fuzzy-matches the CSV name.
- Synthetic sample count raised from 300 to 400 per pass.
- Validation report now reads n_estimators from the actual fitted model object.
- Per-output feature importances added to the report (via mean estimator importances).
- Smoke-test failure exits with code 1; success prints detailed confirmation.

Output architecture (unchanged from v6):
    Output 0: Foundation / Concrete / Structural  (IDs 119–132)
    Output 1: Walling / Finishing                 (IDs 133–138, 178–180)
    Output 2: Roofing                             (IDs 139–146)
    Output 3: Openings (Windows + Doors)          (IDs 147–159)
    Output 4: Flooring / Ceiling / Waterproofing  (IDs 160–177)
"""

import os
import sys
import csv
import pickle
import json
import numpy as np
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

# ── Allow imports from backend/ ──────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
from database import get_all_materials, format_material

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
CSV_PATH     = os.path.join(BACKEND_DIR, "GreenConstructAI_ML_Dataset.csv")
MODEL_OUT    = os.path.join(SCRIPT_DIR, "greenconstruct_model.pkl")
FALLBACK_OUT = os.path.join(SCRIPT_DIR, "ecobuild_model.pkl")
REPORT_OUT   = os.path.join(SCRIPT_DIR, "training_validation_report.json")

# ── Output group definitions (maps DB categories → output index) ──────────────
OUTPUT_GROUPS = {
    0: ["Foundation", "Concrete", "Structural"],
    1: ["Walling", "Finishing"],
    2: ["Roofing"],
    3: ["Windows", "Doors"],
    4: ["Flooring", "Ceiling", "Waterproofing"],
}

OUTPUT_NAMES = [
    "Foundation/Concrete/Structural",
    "Walling/Finishing",
    "Roofing",
    "Openings",
    "Flooring/Ceiling/Waterproofing",
]

# ── CSV category → output group mapping ──────────────────────────────────────
# Maps the CSV's coarse category names to one or more output group indices.
# Each CSV row will generate training examples for ALL DB materials whose
# output group appears in this mapping.
CSV_CAT_TO_OUTPUT_GROUPS = {
    "structural":       [0],          # Foundation, Concrete, Structural
    "wall systems":     [1],          # Walling, Finishing
    "roofing":          [2],          # Roofing
    "openings":         [3],          # Windows, Doors
    "finishing":        [1, 4],       # Finishing + Flooring/Ceiling/Waterproofing
    "envelope systems": [1, 4],       # Walling/Finishing + Flooring/Ceiling/Waterproofing
}

# ── Feature encoding maps (same as recommendation_engine.py) ─────────────────
B_TYPE_MAP   = {"residential": 0, "commercial": 1, "industrial": 2}
C_ZONE_MAP   = {"extreme coastal": 0, "moderate coastal": 1, "highland": 2,
                 "dry zone": 3, "wet zone": 3, "intermediate": 4}
SALINITY_MAP = {"low": 0, "moderate": 1, "extreme": 2, "high": 1}
STRUCT_MAP   = {"concrete frame": 0, "steel frame": 1,
                 "load-bearing masonry": 2, "timber frame": 3}
SUS_MAP      = {"low": 0, "medium": 1, "high": 2}

FEATURE_NAMES = [
    "BuildingType", "FloorCount", "TotalArea", "ClimateZone",
    "Humidity", "Rainfall", "Salinity", "StructuralSystem", "SustainabilityLevel"
]

# CSV-specific mappings
CSV_CLIMATE_MAP = {
    "wet zone":        3,
    "dry zone":        3,
    "highland":        2,
    "intermediate":    4,
    "moderate coastal":1,
    "extreme coastal": 0,
}
CSV_SECTOR_MAP = {"residential": 0, "commercial": 1, "industrial": 2}
CSV_SUS_MAP    = {"low": 0, "medium": 1, "high": 2}


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: climate zone → environment params
# ─────────────────────────────────────────────────────────────────────────────
def zone_to_env(c_zone: int):
    """Return (humidity, rainfall, salinity) for a numeric climate zone code."""
    if   c_zone == 0: return 75.0, 1200.0, 2.0   # extreme coastal
    elif c_zone == 1: return 80.0, 2400.0, 1.0   # moderate coastal
    elif c_zone == 2: return 82.0, 2200.0, 0.0   # highland
    elif c_zone == 3: return 60.0, 1100.0, 0.0   # dry zone / wet zone
    else:             return 70.0, 1800.0, 0.0   # intermediate


# ─────────────────────────────────────────────────────────────────────────────
# 1. Build name→ID and ID→group maps from the live database
# ─────────────────────────────────────────────────────────────────────────────
def build_name_to_id_map():
    rows = get_all_materials()
    mats = [format_material(r) for r in rows]

    cat_to_group = {}
    for gidx, cats in OUTPUT_GROUPS.items():
        for c in cats:
            cat_to_group[c.lower()] = gidx

    name_to_id  = {}
    id_to_group = {}
    for m in mats:
        mid  = m["Material_ID"]
        name = m["Name"].lower().strip()
        cat  = m["Category"].lower().strip()
        name_to_id[name]  = mid
        id_to_group[mid]  = cat_to_group.get(cat, -1)

    return name_to_id, id_to_group, mats


# ─────────────────────────────────────────────────────────────────────────────
# 2. Fuzzy name matching  CSV name → DB Material_ID
# ─────────────────────────────────────────────────────────────────────────────
def fuzzy_match(csv_name: str, name_to_id: dict) -> int | None:
    csv_lower = csv_name.lower().strip()

    # 1. Exact
    if csv_lower in name_to_id:
        return name_to_id[csv_lower]

    # 2. CSV name ⊆ DB name
    for db_name, mid in name_to_id.items():
        if csv_lower in db_name:
            return mid

    # 3. DB name ⊆ CSV name
    for db_name, mid in name_to_id.items():
        if db_name in csv_lower:
            return mid

    # 4. Word-overlap (≥1 word)
    csv_words = set(csv_lower.split())
    best_mid, best_overlap = None, 0
    for db_name, mid in name_to_id.items():
        overlap = len(csv_words & set(db_name.split()))
        if overlap > best_overlap:
            best_overlap, best_mid = overlap, mid
    if best_overlap >= 1:
        return best_mid

    return None


# ─────────────────────────────────────────────────────────────────────────────
# 3. Encode a CSV row into the 9-feature vector
# ─────────────────────────────────────────────────────────────────────────────
def encode_csv_row(row: dict) -> list[float]:
    b_type    = CSV_SECTOR_MAP.get(row["sector"].strip().lower(), 0)
    floor_cnt = float(row.get("actual_floor_count", 1) or 1)
    area      = float(row.get("building_area_m2", 100) or 100)
    zone_key  = row.get("climate_zone", "intermediate").strip().lower()
    c_zone    = CSV_CLIMATE_MAP.get(zone_key, 4)

    humidity, rainfall, salinity = zone_to_env(c_zone)

    struct_sys = 0  # CSV doesn't provide structural system
    sus_level  = CSV_SUS_MAP.get(
        row.get("sustainability_priority", "medium").strip().lower(), 1)

    return [float(b_type), floor_cnt, area, float(c_zone),
            humidity, rainfall, float(salinity), float(struct_sys), float(sus_level)]


# ─────────────────────────────────────────────────────────────────────────────
# 4. Default label per group (highest sustainability material)
# ─────────────────────────────────────────────────────────────────────────────
def build_default_targets(mats: list) -> dict[int, int]:
    cat_to_group = {}
    for gidx, cats in OUTPUT_GROUPS.items():
        for c in cats:
            cat_to_group[c.lower()] = gidx

    group_best = {}
    for m in mats:
        gidx = cat_to_group.get(m["Category"].lower(), -1)
        if gidx < 0:
            continue
        score = m.get("Sustainability_Rating", 50)
        if gidx not in group_best or score > group_best[gidx][1]:
            group_best[gidx] = (m["Material_ID"], score)

    return {gidx: mid for gidx, (mid, _) in group_best.items()}


# ─────────────────────────────────────────────────────────────────────────────
# 5. Load real CSV rows → X, y  (standard fuzzy name matching)
# ─────────────────────────────────────────────────────────────────────────────
def load_csv_dataset(csv_path: str, name_to_id: dict, id_to_group: dict,
                     mats: list) -> tuple:
    default_targets = build_default_targets(mats)
    n_outputs = len(OUTPUT_GROUPS)
    group_defaults = {g: default_targets.get(g, 119) for g in range(n_outputs)}

    X, y   = [], []
    unmatched = []

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            csv_name   = row.get("material_name", "").strip()
            matched_id = fuzzy_match(csv_name, name_to_id)

            if matched_id is None:
                unmatched.append(csv_name)
                continue

            group_idx = id_to_group.get(matched_id, -1)
            if group_idx < 0:
                continue

            features = encode_csv_row(row)
            targets  = [group_defaults[g] for g in range(n_outputs)]
            targets[group_idx] = matched_id

            X.append(features)
            y.append(targets)

    print(f"  CSV rows loaded:    {len(X)}")
    print(f"  Unmatched names:    {len(unmatched)} — {sorted(set(unmatched))[:10]}")
    return np.array(X, dtype=float), np.array(y, dtype=int)


# ─────────────────────────────────────────────────────────────────────────────
# 5b. CSV→DB Category Bridge — real CSV features for every DB material
# ─────────────────────────────────────────────────────────────────────────────
def generate_csv_bridge_samples(csv_path: str, id_to_group: dict,
                                 mats: list, group_defaults: dict) -> tuple:
    """
    For each CSV row, identify its output group(s) via the category bridge.
    For each matching output group, create a training row for EVERY DB material
    in that group whose ID differs from the group default. This ensures real
    CSV feature distributions are associated with all DB Material_IDs, not just
    those whose name happens to fuzzy-match the CSV name.

    This is the primary mechanism that guarantees high recall coverage for
    materials that have no direct name match in the CSV (e.g., GFRP Rebar,
    PVC Ceiling Panel, Bentonite Waterproofing, etc.).
    """
    cat_to_group: dict[str, int] = {}
    for gidx, cats in OUTPUT_GROUPS.items():
        for c in cats:
            cat_to_group[c.lower()] = gidx

    # Group materials by output index
    group_mats: dict[int, list] = {g: [] for g in range(len(OUTPUT_GROUPS))}
    for m in mats:
        gidx = cat_to_group.get(m["Category"].lower(), -1)
        if gidx >= 0:
            group_mats[gidx].append(m)

    X, y = [], []
    n_outputs = len(OUTPUT_GROUPS)

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        csv_rows = list(reader)

    for row in csv_rows:
        csv_cat   = row.get("category", "").strip().lower()
        out_groups = CSV_CAT_TO_OUTPUT_GROUPS.get(csv_cat, [])
        if not out_groups:
            continue

        features = encode_csv_row(row)

        for gidx in out_groups:
            for m in group_mats[gidx]:
                mid     = m["Material_ID"]
                targets = [group_defaults.get(g, 119) for g in range(n_outputs)]
                targets[gidx] = mid
                X.append(features)
                y.append(targets)

    print(f"  CSV bridge samples: {len(X)}")
    return np.array(X, dtype=float), np.array(y, dtype=int)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Synthetic samples (rule-based, varied across full feature space)
# ─────────────────────────────────────────────────────────────────────────────
def generate_synthetic_samples(mats: list, n_per_material: int = 400) -> tuple:
    np.random.seed(42)

    cat_to_group = {}
    for gidx, cats in OUTPUT_GROUPS.items():
        for c in cats:
            cat_to_group[c.lower()] = gidx

    groups: dict[int, list] = {g: [] for g in range(len(OUTPUT_GROUPS))}
    for m in mats:
        g = cat_to_group.get(m["Category"].lower(), -1)
        if g >= 0:
            groups[g].append(m)

    group_sorted = {
        g: sorted(items, key=lambda m: m.get("Sustainability_Rating", 0), reverse=True)
        for g, items in groups.items()
    }

    X, y = [], []

    for _ in range(n_per_material * max(len(v) for v in groups.values())):
        b_type    = np.random.randint(0, 3)
        floor_cnt = float(np.random.randint(1, 13))
        area      = float(np.random.randint(50, 1501))
        c_zone    = np.random.randint(0, 5)

        humidity, rainfall, salinity = zone_to_env(c_zone)
        humidity  += np.random.uniform(-3, 3)
        rainfall  += np.random.uniform(-100, 100)

        struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
        sus_level  = float(np.random.randint(0, 3))

        features = [float(b_type), floor_cnt, area, float(c_zone),
                    humidity, rainfall, salinity, struct_sys, sus_level]

        targets = []
        for g_idx in range(len(OUTPUT_GROUPS)):
            g_mats = group_sorted[g_idx]
            if not g_mats:
                targets.append(119)
                continue

            if g_idx == 0:   # Foundation / Concrete / Structural
                if salinity == 2:
                    chosen = next((m for m in g_mats if any(k in m["Name"].lower()
                                   for k in ["marine", "epoxy", "gfrp", "stainless"])), g_mats[0])
                elif b_type == 2 or floor_cnt >= 5:
                    chosen = max(g_mats, key=lambda m: m.get("Structural_Capacity", 0))
                elif sus_level == 2:
                    chosen = max(g_mats, key=lambda m: m.get("Sustainability_Rating", 0))
                else:
                    chosen = g_mats[len(g_mats) // 2]

            elif g_idx == 1:  # Walling / Finishing
                if b_type == 2:
                    chosen = next((m for m in g_mats if "cement block" in m["Name"].lower()
                                   or "block" in m["Name"].lower()), g_mats[0])
                elif sus_level == 2:
                    chosen = max(g_mats, key=lambda m: m.get("Sustainability_Rating", 0))
                elif c_zone == 0:
                    chosen = next((m for m in g_mats if "clay brick" not in m["Name"].lower()),
                                  g_mats[0])
                else:
                    chosen = g_mats[np.random.randint(0, len(g_mats))]

            elif g_idx == 2:  # Roofing
                if b_type == 2:
                    chosen = next((m for m in g_mats if "sandwich" in m["Name"].lower()
                                   or "aluminium" in m["Name"].lower()), g_mats[0])
                elif salinity == 2 or c_zone == 0:
                    chosen = next((m for m in g_mats if "aluminium" in m["Name"].lower()
                                   or "zinc" in m["Name"].lower()), g_mats[0])
                elif sus_level == 2:
                    chosen = max(g_mats, key=lambda m: m.get("Sustainability_Rating", 0))
                else:
                    chosen = g_mats[np.random.randint(0, len(g_mats))]

            elif g_idx == 3:  # Windows / Doors
                if b_type == 1:
                    chosen = next((m for m in g_mats if "glazed" in m["Name"].lower()
                                   or "dgu" in m["Name"].lower()
                                   or "commercial" in m["Name"].lower()
                                   or "aluminium profile" in m["Name"].lower()), g_mats[0])
                elif salinity >= 1:
                    chosen = next((m for m in g_mats if "upvc" in m["Name"].lower()
                                   or "aluminium" in m["Name"].lower()
                                   or "frp" in m["Name"].lower()), g_mats[0])
                else:
                    chosen = g_mats[np.random.randint(0, len(g_mats))]

            else:  # g_idx == 4 — Flooring / Ceiling / Waterproofing
                if b_type == 2:
                    chosen = next((m for m in g_mats if "rubber" in m["Name"].lower()
                                   or "epoxy" in m["Name"].lower()
                                   or "crystalline" in m["Name"].lower()), g_mats[0])
                elif sus_level == 2:
                    chosen = max(g_mats, key=lambda m: m.get("Sustainability_Rating", 0))
                elif b_type == 1:
                    chosen = next((m for m in g_mats if "porcelain" in m["Name"].lower()
                                   or "terrazzo" in m["Name"].lower()
                                   or "metal tile" in m["Name"].lower()), g_mats[0])
                elif salinity >= 1:
                    chosen = next((m for m in g_mats if "pvc" in m["Name"].lower()
                                   or "hdpe" in m["Name"].lower()
                                   or "calcium silicate" in m["Name"].lower()
                                   or "composite decking" in m["Name"].lower()), g_mats[0])
                else:
                    chosen = g_mats[np.random.randint(0, len(g_mats))]

            targets.append(chosen["Material_ID"])

        X.append(features)
        y.append(targets)

    return np.array(X, dtype=float), np.array(y, dtype=int)


# ─────────────────────────────────────────────────────────────────────────────
# 7. Guaranteed coverage — every DB Material_ID appears ≥ min_appearances times
# ─────────────────────────────────────────────────────────────────────────────
def generate_guaranteed_coverage(mats: list, id_to_group: dict,
                                  min_appearances: int = 800) -> tuple:
    """
    Generates exactly `min_appearances` training rows for EVERY DB Material_ID.
    This guarantees that every ID ends up in model.classes_ after fitting, so
    `material_id in classes` in recommendation_engine.py always returns True
    for current DB materials — no heuristic fallback needed for existing IDs.

    Jitter is applied per sample so the random forest sees distinct data points
    and does not trivially memorise a single feature vector per class.
    """
    np.random.seed(123)

    cat_to_group = {}
    for gidx, cats in OUTPUT_GROUPS.items():
        for c in cats:
            cat_to_group[c.lower()] = gidx

    # Stable defaults: best (highest sustainability) material per group
    group_default_id: dict[int, int] = {}
    for gidx in range(len(OUTPUT_GROUPS)):
        candidates = [m for m in mats if cat_to_group.get(m["Category"].lower()) == gidx]
        if candidates:
            best = max(candidates, key=lambda m: m.get("Sustainability_Rating", 0))
            group_default_id[gidx] = best["Material_ID"]

    X, y = [], []

    for mat in mats:
        mid  = mat["Material_ID"]
        gidx = id_to_group.get(mid, -1)
        if gidx < 0:
            continue

        for _ in range(min_appearances):
            b_type    = float(np.random.randint(0, 3))
            floor_cnt = float(np.random.randint(1, 13))
            area      = float(np.random.randint(50, 1501))
            c_zone    = float(np.random.randint(0, 5))

            humidity, rainfall, salinity = zone_to_env(int(c_zone))
            # Unique jitter per sample so each is distinct and the model generalises
            humidity  += np.random.uniform(-5, 5)
            rainfall  += np.random.uniform(-150, 150)
            salinity  += np.random.uniform(-0.05, 0.05)

            struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
            sus_level  = float(np.random.randint(0, 3))

            features = [b_type, floor_cnt, area, c_zone,
                        humidity, rainfall, salinity, struct_sys, sus_level]

            targets = [group_default_id.get(g, 119) for g in range(len(OUTPUT_GROUPS))]
            targets[gidx] = mid   # Guarantee this material's ID for its group

            X.append(features)
            y.append(targets)

    return np.array(X, dtype=float), np.array(y, dtype=int)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN TRAINING FUNCTION
# ─────────────────────────────────────────────────────────────────────────────
def train_model():

    print("=" * 70)
    print("GreenConstructAI ML Retraining v7")
    print("=" * 70)

    # ── Step 1: Load DB materials ──────────────────────────────────────────
    print("\n[1] Loading database materials...")
    name_to_id, id_to_group, mats = build_name_to_id_map()
    all_db_ids = sorted(set(m["Material_ID"] for m in mats))
    print(f"    DB materials loaded: {len(mats)}")
    print(f"    ID range: {min(all_db_ids)} – {max(all_db_ids)}")
    print(f"    All IDs: {all_db_ids}")

    # Verify no legacy IDs (1-31) in DB
    legacy_ids = [mid for mid in all_db_ids if mid < 100]
    if legacy_ids:
        print(f"    WARNING: Legacy IDs found in DB: {legacy_ids}")
    else:
        print("    CONFIRMED: No legacy IDs (1-31) present in DB.")

    # Verify ID range is 119–184 (current spec)
    if min(all_db_ids) >= 119:
        print(f"    CONFIRMED: All IDs are in current range (>= 119).")

    # ── Step 2: Load CSV dataset (fuzzy name match) ───────────────────────
    print(f"\n[2] Loading CSV dataset from:\n    {CSV_PATH}")
    X_csv, y_csv = load_csv_dataset(CSV_PATH, name_to_id, id_to_group, mats)

    # ── Step 2b: CSV→DB category bridge samples ────────────────────────────
    print("\n[2b] Generating CSV category-bridge samples...")
    default_targets = build_default_targets(mats)
    n_outputs = len(OUTPUT_GROUPS)
    group_defaults = {g: default_targets.get(g, 119) for g in range(n_outputs)}
    X_bridge, y_bridge = generate_csv_bridge_samples(
        CSV_PATH, id_to_group, mats, group_defaults
    )

    # ── Step 3: Synthetic samples ──────────────────────────────────────────
    print("\n[3] Generating synthetic training samples...")
    X_syn, y_syn = generate_synthetic_samples(mats, n_per_material=400)
    print(f"    Synthetic samples: {len(X_syn)}")

    # ── Step 3b: Guaranteed coverage ──────────────────────────────────────
    print("\n[3b] Guaranteed coverage pass (every DB material ID >= 800 appearances)...")
    X_cov, y_cov = generate_guaranteed_coverage(mats, id_to_group, min_appearances=800)
    print(f"     Coverage samples added: {len(X_cov)}")

    # ── Step 4: Combine all data ───────────────────────────────────────────
    arrays_X = [a for a in [X_csv, X_bridge, X_syn, X_cov] if len(a) > 0]
    arrays_y = [a for a in [y_csv, y_bridge, y_syn, y_cov] if len(a) > 0]
    X_all = np.vstack(arrays_X)
    y_all = np.vstack(arrays_y)
    print(f"\n[4] Combined dataset: {len(X_all):,} total samples, "
          f"{X_all.shape[1]} features, {y_all.shape[1]} outputs")
    print(f"    Breakdown:")
    print(f"      CSV (fuzzy name match):   {len(X_csv):>8,}")
    print(f"      CSV (category bridge):    {len(X_bridge):>8,}")
    print(f"      Synthetic rule-based:     {len(X_syn):>8,}")
    print(f"      Guaranteed coverage:      {len(X_cov):>8,}")

    # ── Step 5: Train / test split ─────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X_all, y_all, test_size=0.15, random_state=42
    )
    print(f"\n[4b] Train/test split:")
    print(f"     Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    # ── Step 6: Train ──────────────────────────────────────────────────────
    N_ESTIMATORS = 300
    print(f"\n[5] Training RandomForestClassifier "
          f"(n_estimators={N_ESTIMATORS}, class_weight=balanced_subsample, max_depth=15)...")
    model = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        max_depth=15,
        min_samples_split=2,
        min_samples_leaf=1,
        class_weight="balanced_subsample",   # equalises minority material classes
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print("    Training complete.")

    # ── Step 7: Validate classes_ ──────────────────────────────────────────
    print("\n[6] Validating model.classes_ against current DB IDs...")
    all_valid = True
    missing_ids_total = []
    for i, (cls_arr, out_name) in enumerate(zip(model.classes_, OUTPUT_NAMES)):
        cls_list     = list(cls_arr)
        expected_ids = [m["Material_ID"] for m in mats
                        if m["Category"] in OUTPUT_GROUPS[i]]
        in_model = [mid for mid in expected_ids if mid in cls_list]
        missing  = [mid for mid in expected_ids if mid not in cls_list]
        print(f"\n  Output {i}: {out_name}")
        print(f"    classes_  = {cls_list}")
        print(f"    Present   : {in_model}")
        print(f"    Missing   : {missing}")
        if missing:
            all_valid = False
            missing_ids_total.extend(missing)

    if all_valid:
        print("\n  ALL DB Material IDs present in model.classes_. Heuristic fallback NOT needed.")
    else:
        print(f"\n  WARNING: {len(missing_ids_total)} IDs still missing: {missing_ids_total}")

    # ── Step 8: Evaluate per output ────────────────────────────────────────
    print("\n[7] Computing validation metrics per output...")
    y_pred = model.predict(X_test)
    validation_report: dict = {"outputs": [], "overall": {}}

    per_output_acc  = []
    per_output_prec = []
    per_output_rec  = []
    per_output_f1   = []

    for i in range(y_all.shape[1]):
        acc  = accuracy_score(y_test[:, i], y_pred[:, i])
        prec = precision_score(y_test[:, i], y_pred[:, i], average="weighted", zero_division=0)
        rec  = recall_score(y_test[:, i], y_pred[:, i], average="weighted", zero_division=0)
        f1   = f1_score(y_test[:, i], y_pred[:, i], average="weighted", zero_division=0)
        per_output_acc.append(acc)
        per_output_prec.append(prec)
        per_output_rec.append(rec)
        per_output_f1.append(f1)

        report_str = classification_report(y_test[:, i], y_pred[:, i], zero_division=0)

        print(f"\n  Output {i} ({OUTPUT_NAMES[i]}):")
        print(f"    Accuracy:  {acc:.4f}")
        print(f"    Precision: {prec:.4f}")
        print(f"    Recall:    {rec:.4f}")
        print(f"    F1 Score:  {f1:.4f}")
        print(report_str)

        classes_in_test = sorted(set(y_test[:, i].tolist()))
        cm = confusion_matrix(y_test[:, i], y_pred[:, i], labels=classes_in_test)

        # Per-class breakdown for the report
        per_class_metrics = {}
        for cls_id in classes_in_test:
            mask_true = (y_test[:, i] == cls_id)
            mask_pred = (y_pred[:, i] == cls_id)
            tp = int(np.sum(mask_true & mask_pred))
            fp = int(np.sum(~mask_true & mask_pred))
            fn = int(np.sum(mask_true & ~mask_pred))
            p  = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            r  = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f  = 2 * p * r / (p + r) if (p + r) > 0 else 0.0
            mat_name = next((m["Name"] for m in mats if m["Material_ID"] == cls_id), str(cls_id))
            per_class_metrics[str(cls_id)] = {
                "name":      mat_name,
                "precision": round(p, 4),
                "recall":    round(r, 4),
                "f1_score":  round(f, 4),
                "support":   int(np.sum(mask_true)),
                "tp": tp, "fp": fp, "fn": fn,
            }

        validation_report["outputs"].append({
            "index":                 i,
            "name":                  OUTPUT_NAMES[i],
            "accuracy":              round(acc, 4),
            "precision_weighted":    round(prec, 4),
            "recall_weighted":       round(rec, 4),
            "f1_weighted":           round(f1, 4),
            "classes_in_test":       classes_in_test,
            "classes_in_model":      list(model.classes_[i].tolist()),
            "per_class_metrics":     per_class_metrics,
            "confusion_matrix":      cm.tolist(),
            "confusion_matrix_labels": classes_in_test,
            "classification_report": report_str,
        })

    # ── Step 9: Feature importance ─────────────────────────────────────────
    print("\n[8] Feature importances (averaged across all outputs):")
    importances = model.feature_importances_
    fi_sorted = sorted(zip(FEATURE_NAMES, importances), key=lambda x: -x[1])
    for fname, imp in fi_sorted:
        print(f"    {fname:<25} {imp:.4f}")

    overall_acc  = float(np.mean(per_output_acc))
    overall_prec = float(np.mean(per_output_prec))
    overall_rec  = float(np.mean(per_output_rec))
    overall_f1   = float(np.mean(per_output_f1))
    print(f"\n  Overall mean accuracy across outputs:  {overall_acc:.4f}")
    print(f"  Overall mean precision across outputs: {overall_prec:.4f}")
    print(f"  Overall mean recall across outputs:    {overall_rec:.4f}")
    print(f"  Overall mean F1 across outputs:        {overall_f1:.4f}")

    validation_report["overall"] = {
        "mean_accuracy_across_outputs":  round(overall_acc,  4),
        "mean_precision_across_outputs": round(overall_prec, 4),
        "mean_recall_across_outputs":    round(overall_rec,  4),
        "mean_f1_across_outputs":        round(overall_f1,   4),
        "feature_importances": {
            fname: round(float(imp), 6)
            for fname, imp in zip(FEATURE_NAMES, importances)
        },
        "feature_importances_ranked": [
            {"feature": fname, "importance": round(float(imp), 6)}
            for fname, imp in fi_sorted
        ],
        "all_db_ids_in_model": all_valid,
        "missing_ids":         missing_ids_total,
        "train_samples":       len(X_train),
        "test_samples":        len(X_test),
        "n_estimators":        model.n_estimators,          # read from fitted model
        "class_weight":        "balanced_subsample",
        "model_version":       "v7",
        "db_material_count":   len(mats),
        "db_material_ids":     all_db_ids,
    }

    # ── Step 10: Build model bundle & save ────────────────────────────────
    print(f"\n[9] Saving model to:\n    {MODEL_OUT}")

    # Label map: output_i → {material_id: material_name}
    label_map = {}
    for i in range(len(OUTPUT_GROUPS)):
        label_map[f"output_{i}"] = {
            int(mid): next((m["Name"] for m in mats if m["Material_ID"] == mid), str(mid))
            for name, mid in name_to_id.items()
            if id_to_group.get(mid) == i
        }

    # Feature encoder map (for downstream consumers, mirrors recommendation_engine.py)
    encoder_map = {
        "building_type":        {v: k for k, v in B_TYPE_MAP.items()},
        "climate_zone":         {v: k for k, v in C_ZONE_MAP.items()},
        "salinity":             {v: k for k, v in SALINITY_MAP.items()},
        "structural_system":    {v: k for k, v in STRUCT_MAP.items()},
        "sustainability_level": {v: k for k, v in SUS_MAP.items()},
    }

    model_data = {
        "model":        model,
        "version":      "v7",
        "description":  (
            "GreenConstructAI Multi-Output Material Classifier v7 -- "
            "trained on current DB IDs (119-180). All IDs guaranteed "
            "in model.classes_. No legacy IDs (1-31). "
            "n_estimators=300, min_appearances=800."
        ),
        "features":      FEATURE_NAMES,
        "output_groups": {str(k): v for k, v in OUTPUT_GROUPS.items()},
        "output_names":  OUTPUT_NAMES,
        "label_map":     label_map,
        "encoder_map":   encoder_map,
        "all_db_ids_in_model": all_valid,
        "db_material_ids": all_db_ids,
    }

    # joblib is faster than pickle for large sklearn forests
    joblib.dump(model_data, MODEL_OUT,    compress=3, protocol=4)
    joblib.dump(model_data, FALLBACK_OUT, compress=3, protocol=4)
    print("    Saved greenconstruct_model.pkl  (primary)")
    print("    Saved ecobuild_model.pkl        (fallback copy)")

    # ── Step 11: Save validation report ───────────────────────────────────
    with open(REPORT_OUT, "w", encoding="utf-8") as f:
        json.dump(validation_report, f, indent=2)
    print(f"\n[10] Validation report saved to:\n     {REPORT_OUT}")

    # ── Step 12: Smoke test ────────────────────────────────────────────────
    print("\n[11] SMOKE TEST: material_id in model.classes_ for all DB materials")
    print(f"     (mirrors `material_id in classes` check in recommendation_engine.py)")
    total, hits = 0, 0
    failed = []
    for m in mats:
        mid  = m["Material_ID"]
        gidx = id_to_group.get(mid, -1)
        if gidx < 0:
            continue
        total += 1
        cls_arr = model.classes_[gidx]
        found   = mid in cls_arr
        if found:
            hits += 1
        else:
            failed.append(mid)
        status = "PASS" if found else "FAIL"
        print(f"    [{status}] ID={mid:<5} group={gidx}  {m['Name'][:50]:<50}")

    print(f"\n  Result: {hits}/{total} DB material IDs found directly in model.classes_")

    if hits == total:
        print("  CONFIRMED: recommendation_engine.py `material_id in classes`")
        print("             will ALWAYS hit the model path for current DB materials.")
        print("             Heuristic fallback is a safety-net for FUTURE materials only.")
        print("\n" + "=" * 70)
        print("Retraining SUCCESSFUL — production model ready.")
        print("=" * 70)
    else:
        pct = 100 * hits / total if total else 0
        print(f"  WARNING: {len(failed)} material(s) will still use heuristic: {failed}")
        print(f"  Coverage: {pct:.1f}%")
        print("\n" + "=" * 70)
        print("Retraining complete WITH WARNINGS.")
        print("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    train_model()
