"""
GreenConstructAI — Experimental Evaluation Runner
==================================================
Prompt 1: Automatic Experimental Evaluation

Executes 50 predefined engineering scenarios against the live backend API at
http://127.0.0.1:5000/api/recommendations/generate and exports all backend
output fields to evaluation_results.csv.

NO manual values. Every result originates from the API response.

Run:
    cd "C:/Users/ASUS/Desktop/Material specification/backend"
    python evaluation/01_run_evaluation.py
"""

import json
import time
import csv
import traceback
from pathlib import Path
from datetime import datetime

import requests

# ── Config ────────────────────────────────────────────────────────────────────
API_BASE = "http://127.0.0.1:5000"
ENDPOINT = f"{API_BASE}/api/recommendations/generate"
OUTPUT_DIR = Path(__file__).parent / "results"
OUTPUT_DIR.mkdir(exist_ok=True)
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_CSV = OUTPUT_DIR / f"evaluation_results_{TIMESTAMP}.csv"
LATEST_CSV = OUTPUT_DIR / "evaluation_results_latest.csv"

# ── 50 Predefined Scenarios ───────────────────────────────────────────────────
# Covers: Residential, Commercial, School, Office, Warehouse, Hotel, Hospital
# Across: Wet Zone, Dry Zone, Coastal Zone, Extreme Coastal Zone
# Structural: Reinforced Concrete Frame, Steel Frame, Timber Frame, Load-Bearing Masonry
SCENARIOS = [
    # ── RESIDENTIAL (12 scenarios) ──
    {"id": "S01", "buildingType": "Residential", "location": "Colombo",      "floorCount": 2, "totalArea": 180.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "High"},
    {"id": "S02", "buildingType": "Residential", "location": "Galle",        "floorCount": 1, "totalArea": 120.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S03", "buildingType": "Residential", "location": "Jaffna",       "floorCount": 2, "totalArea": 200.0,  "structuralSystem": "Load-Bearing Masonry",      "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S04", "buildingType": "Residential", "location": "Kandy",        "floorCount": 3, "totalArea": 300.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S05", "buildingType": "Residential", "location": "Batticaloa",   "floorCount": 1, "totalArea": 110.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Medium"},
    {"id": "S06", "buildingType": "Residential", "location": "Negombo",      "floorCount": 2, "totalArea": 160.0,  "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S07", "buildingType": "Residential", "location": "Trincomalee",  "floorCount": 2, "totalArea": 170.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S08", "buildingType": "Residential", "location": "Matara",       "floorCount": 1, "totalArea":  90.0,  "structuralSystem": "Load-Bearing Masonry",      "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S09", "buildingType": "Residential", "location": "Anuradhapura", "floorCount": 2, "totalArea": 250.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "High"},
    {"id": "S10", "buildingType": "Residential", "location": "Ampara",       "floorCount": 1, "totalArea": 140.0,  "structuralSystem": "Load-Bearing Masonry",      "budgetLevel": "Budget",   "sustainabilityPreference": "Medium"},
    {"id": "S11", "buildingType": "Residential", "location": "Kurunegala",   "floorCount": 3, "totalArea": 320.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S12", "buildingType": "Residential", "location": "Hambantota",   "floorCount": 2, "totalArea": 190.0,  "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    # ── OFFICE (10 scenarios) ──
    {"id": "S13", "buildingType": "Office", "location": "Colombo",      "floorCount": 5, "totalArea":  750.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S14", "buildingType": "Office", "location": "Galle",        "floorCount": 3, "totalArea":  480.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S15", "buildingType": "Office", "location": "Jaffna",       "floorCount": 2, "totalArea":  350.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S16", "buildingType": "Office", "location": "Kandy",        "floorCount": 4, "totalArea":  600.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S17", "buildingType": "Office", "location": "Negombo",      "floorCount": 2, "totalArea":  400.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S18", "buildingType": "Office", "location": "Matara",       "floorCount": 3, "totalArea":  520.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S19", "buildingType": "Office", "location": "Trincomalee",  "floorCount": 5, "totalArea":  800.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S20", "buildingType": "Office", "location": "Anuradhapura", "floorCount": 2, "totalArea":  380.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S21", "buildingType": "Office", "location": "Kurunegala",   "floorCount": 4, "totalArea":  650.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S22", "buildingType": "Office", "location": "Batticaloa",   "floorCount": 3, "totalArea":  450.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    # ── COMMERCIAL (8 scenarios) ──
    {"id": "S23", "buildingType": "Commercial", "location": "Colombo",      "floorCount": 6, "totalArea": 1200.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S24", "buildingType": "Commercial", "location": "Galle",        "floorCount": 3, "totalArea":  800.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S25", "buildingType": "Commercial", "location": "Negombo",      "floorCount": 4, "totalArea":  950.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S26", "buildingType": "Commercial", "location": "Jaffna",       "floorCount": 2, "totalArea":  600.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S27", "buildingType": "Commercial", "location": "Kandy",        "floorCount": 5, "totalArea": 1100.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S28", "buildingType": "Commercial", "location": "Matara",       "floorCount": 3, "totalArea":  700.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S29", "buildingType": "Commercial", "location": "Hambantota",   "floorCount": 2, "totalArea":  500.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S30", "buildingType": "Commercial", "location": "Trincomalee",  "floorCount": 4, "totalArea":  900.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    # ── SCHOOL / EDUCATIONAL (6 scenarios) ──
    {"id": "S31", "buildingType": "School", "location": "Colombo",      "floorCount": 3, "totalArea": 1500.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "High"},
    {"id": "S32", "buildingType": "School", "location": "Kandy",        "floorCount": 2, "totalArea": 1200.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Medium"},
    {"id": "S33", "buildingType": "School", "location": "Jaffna",       "floorCount": 2, "totalArea": 1000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S34", "buildingType": "School", "location": "Galle",        "floorCount": 3, "totalArea": 1400.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "High"},
    {"id": "S35", "buildingType": "School", "location": "Anuradhapura", "floorCount": 2, "totalArea": 1100.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Medium"},
    {"id": "S36", "buildingType": "School", "location": "Batticaloa",   "floorCount": 2, "totalArea":  900.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    # ── WAREHOUSE / INDUSTRIAL (6 scenarios) ──
    {"id": "S37", "buildingType": "Warehouse", "location": "Colombo",     "floorCount": 1, "totalArea": 2000.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Low"},
    {"id": "S38", "buildingType": "Warehouse", "location": "Galle",       "floorCount": 1, "totalArea": 1500.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S39", "buildingType": "Warehouse", "location": "Hambantota",  "floorCount": 1, "totalArea": 3000.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Balanced", "sustainabilityPreference": "Low"},
    {"id": "S40", "buildingType": "Warehouse", "location": "Trincomalee", "floorCount": 1, "totalArea": 2500.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "Medium"},
    {"id": "S41", "buildingType": "Warehouse", "location": "Jaffna",      "floorCount": 1, "totalArea": 1800.0, "structuralSystem": "Steel Frame",               "budgetLevel": "Budget",   "sustainabilityPreference": "Low"},
    {"id": "S42", "buildingType": "Warehouse", "location": "Kurunegala",  "floorCount": 1, "totalArea": 2200.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    # ── HOTEL (5 scenarios) ──
    {"id": "S43", "buildingType": "Hotel", "location": "Colombo",    "floorCount": 10, "totalArea": 5000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S44", "buildingType": "Hotel", "location": "Galle",      "floorCount":  5, "totalArea": 2500.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S45", "buildingType": "Hotel", "location": "Negombo",    "floorCount":  8, "totalArea": 4000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S46", "buildingType": "Hotel", "location": "Kandy",      "floorCount":  4, "totalArea": 2000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S47", "buildingType": "Hotel", "location": "Trincomalee","floorCount":  6, "totalArea": 3000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    # ── HOSPITAL / HEALTHCARE (3 scenarios) ──
    {"id": "S48", "buildingType": "Hospital", "location": "Colombo", "floorCount": 6, "totalArea": 8000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Premium",  "sustainabilityPreference": "High"},
    {"id": "S49", "buildingType": "Hospital", "location": "Kandy",   "floorCount": 4, "totalArea": 5000.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Balanced", "sustainabilityPreference": "Medium"},
    {"id": "S50", "buildingType": "Hospital", "location": "Jaffna",  "floorCount": 3, "totalArea": 3500.0, "structuralSystem": "Reinforced Concrete Frame", "budgetLevel": "Budget",   "sustainabilityPreference": "Medium"},
]

FIELDNAMES = [
    "scenario_id", "building_type", "location", "floor_count", "total_area",
    "structural_system", "budget_level", "sustainability_preference",
    "climate_zone", "climate_humidity", "climate_salinity", "climate_rainfall_mm",
    "top_material_structural", "top_material_walling", "top_material_roofing",
    "top_material_flooring", "top_material_external_wall",
    "overall_hybrid_score", "engineering_score", "ml_confidence",
    "average_sustainability", "decision_confidence_score", "decision_confidence_level",
    "engineering_weight", "ml_weight", "score_formula",
    "structural_compatibility", "climate_compatibility", "sls_compliance",
    "engine_structural_system",
    "eco_rating", "embodied_carbon_avg", "lifecycle_avg",
    "runtime_ms", "api_status",
]


def _safe(d, *keys, default="N/A"):
    cur = d
    for k in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(k, default)
        if cur is None:
            return default
    return cur


def _top_material(data: dict, category_hint: str) -> str:
    candidates = data.get("top3_candidates", {})
    for cat_key, items in candidates.items():
        if category_hint.lower() in cat_key.lower():
            if items:
                return items[0].get("material", "N/A")
    recs = data.get("recommendations", {})
    for cat_key, items in recs.items():
        if category_hint.lower() in cat_key.lower():
            if isinstance(items, list) and items:
                return items[0].get("name", "N/A") if isinstance(items[0], dict) else str(items[0])
    return "N/A"


def run_scenario(scenario: dict) -> dict:
    sid = scenario["id"]
    payload = {k: v for k, v in scenario.items() if k != "id"}
    print(f"  [{sid}] {scenario['buildingType']:12s} | {scenario['location']:15s} | {scenario['structuralSystem']:30s} ...", end=" ", flush=True)
    start = time.perf_counter()
    try:
        resp = requests.post(ENDPOINT, json=payload, timeout=120)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
        if resp.status_code != 200:
            print(f"FAIL ({resp.status_code})")
            return {"scenario_id": sid, "building_type": scenario["buildingType"],
                    "location": scenario["location"], "floor_count": scenario["floorCount"],
                    "total_area": scenario["totalArea"], "structural_system": scenario["structuralSystem"],
                    "budget_level": scenario["budgetLevel"],
                    "sustainability_preference": scenario["sustainabilityPreference"],
                    "runtime_ms": elapsed_ms, "api_status": f"HTTP_{resp.status_code}"}
        data = resp.json()
        if data.get("success") and "data" in data:
            data = data["data"]
        metrics    = data.get("metrics", {})
        breakdown  = data.get("score_breakdown", {})
        confidence = data.get("confidence", {})
        climate    = data.get("climate_profile", {})
        bp         = data.get("blueprint", {})
        engine_structural = bp.get("structural_system", "N/A")
        audit_log = data.get("audit_log", [])
        structural_ok, climate_ok, sls_ok = "PASS", "PASS", "PASS"
        for entry in audit_log:
            reason = (entry.get("rejection_reason") or "").lower()
            if "structural" in reason or "incompatible structure" in reason:
                structural_ok = "FAIL"
            if "climate" in reason or "humidity" in reason or "salinity" in reason:
                climate_ok = "FAIL"
            if "sls" in reason or "load" in reason or "deflect" in reason:
                sls_ok = "FAIL"
        recs = data.get("recommendations", {})
        eco_ratings, embodied_carbons, lifecycles = [], [], []
        for cat_items in recs.values():
            if isinstance(cat_items, list) and cat_items:
                top = cat_items[0]
                if isinstance(top, dict):
                    if top.get("sustainability_score") is not None:
                        eco_ratings.append(float(top["sustainability_score"]))
                    if top.get("embodied_carbon") is not None:
                        embodied_carbons.append(float(top["embodied_carbon"]))
                    if top.get("service_life") is not None:
                        lifecycles.append(float(top["service_life"]))
        eco_rating           = round(sum(eco_ratings)/len(eco_ratings), 2) if eco_ratings else _safe(metrics, "average_sustainability")
        embodied_carbon_avg  = round(sum(embodied_carbons)/len(embodied_carbons), 4) if embodied_carbons else "N/A"
        lifecycle_avg        = round(sum(lifecycles)/len(lifecycles), 1) if lifecycles else "N/A"
        row = {
            "scenario_id":              sid,
            "building_type":            scenario["buildingType"],
            "location":                 scenario["location"],
            "floor_count":              scenario["floorCount"],
            "total_area":               scenario["totalArea"],
            "structural_system":        scenario["structuralSystem"],
            "budget_level":             scenario["budgetLevel"],
            "sustainability_preference":scenario["sustainabilityPreference"],
            "climate_zone":             _safe(climate, "type"),
            "climate_humidity":         _safe(climate, "humidity"),
            "climate_salinity":         _safe(climate, "salinity"),
            "climate_rainfall_mm":      _safe(climate, "rainfall_mm"),
            "top_material_structural":  _top_material(data, "structural") or _top_material(data, "frame"),
            "top_material_walling":     _top_material(data, "wall"),
            "top_material_roofing":     _top_material(data, "roof"),
            "top_material_flooring":    _top_material(data, "floor"),
            "top_material_external_wall": _top_material(data, "external"),
            "overall_hybrid_score":     _safe(metrics, "overall_hybrid_score"),
            "engineering_score":        _safe(metrics, "project_eng_score"),
            "ml_confidence":            _safe(metrics, "project_ml_score"),
            "average_sustainability":   _safe(metrics, "average_sustainability"),
            "decision_confidence_score":_safe(confidence, "confidence_score"),
            "decision_confidence_level":_safe(confidence, "confidence_level"),
            "engineering_weight":       _safe(breakdown, "engineering_rules_weight"),
            "ml_weight":                _safe(breakdown, "ml_prediction_weight"),
            "score_formula":            _safe(breakdown, "formula"),
            "structural_compatibility": structural_ok,
            "climate_compatibility":    climate_ok,
            "sls_compliance":           sls_ok,
            "engine_structural_system": engine_structural,
            "eco_rating":               eco_rating,
            "embodied_carbon_avg":      embodied_carbon_avg,
            "lifecycle_avg":            lifecycle_avg,
            "runtime_ms":               elapsed_ms,
            "api_status":               "OK",
        }
        print(f"OK  | Hybrid={row['overall_hybrid_score']}  Eng={row['engineering_score']}  ML={row['ml_confidence']}  RT={elapsed_ms}ms")
        return row
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
        print(f"ERROR: {exc}")
        traceback.print_exc()
        return {"scenario_id": sid, "building_type": scenario["buildingType"],
                "location": scenario["location"], "floor_count": scenario["floorCount"],
                "total_area": scenario["totalArea"], "structural_system": scenario["structuralSystem"],
                "budget_level": scenario["budgetLevel"],
                "sustainability_preference": scenario["sustainabilityPreference"],
                "runtime_ms": elapsed_ms, "api_status": f"ERROR: {str(exc)[:80]}"}


def main():
    print("=" * 80)
    print(" GreenConstructAI — Experimental Evaluation Runner")
    print(f" Endpoint : {ENDPOINT}")
    print(f" Scenarios: {len(SCENARIOS)}")
    print(f" Output   : {OUTPUT_CSV}")
    print("=" * 80)
    try:
        requests.get(f"{API_BASE}/docs", timeout=5)
        print("[OK] Server is reachable\n")
    except Exception:
        print("[FAIL] Cannot reach server. Ensure uvicorn is running on port 5000.\n")
        raise SystemExit(1)
    results = []
    for i, scenario in enumerate(SCENARIOS, 1):
        print(f"[{i:02d}/{len(SCENARIOS)}] ", end="")
        row = run_scenario(scenario)
        results.append(row)
    for csv_path in [OUTPUT_CSV, LATEST_CSV]:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDNAMES, extrasaction="ignore")
            writer.writeheader()
            for row in results:
                writer.writerow(row)
    ok = sum(1 for r in results if r.get("api_status") == "OK")
    print("\n" + "=" * 80)
    print(f" Complete: {ok}/{len(SCENARIOS)} scenarios passed")
    print(f" Output: {OUTPUT_CSV}")
    print("=" * 80)


if __name__ == "__main__":
    main()
