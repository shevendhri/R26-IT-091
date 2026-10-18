import csv
import sys
import json
from pathlib import Path

# Add project root to Python path (workspace root is two levels up from this script)
project_root = Path(__file__).resolve().parents[1]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from backend.recommendation_engine import recommendation_engine
from backend.mcdm_engine import mcdm_engine
from backend.database import get_all_materials, format_material
from backend.weather_engine import get_climate_profile

# Define scenarios as per user request
SCENARIOS = [
    {"building_type": "Residential", "location": "Colombo"},
    {"building_type": "Residential", "location": "Jaffna"},
    {"building_type": "Residential", "location": "Nuwara Eliya"},
    {"building_type": "Office", "location": "Colombo"},
    {"building_type": "Hospital", "location": "Jaffna"},
    {"building_type": "Industrial", "location": "Hambantota"},
]

# Simple deterministic user profile used for scoring (mirrors defaults in UI)
class SimpleProfile:
    def __init__(self):
        self.sustainability_pref = "Medium"
        self.elderly_occupants = 0
        self.children_count = 0
        self.solar_ready = False
        self.rainwater_harvesting = False
        self.home_office = False
        self.cross_ventilation = "Medium"
        self.future_expansion = "None"
        self.ai_priority_weights = None

profile = SimpleProfile()

def evaluate_material(material, blueprint, location):
    climate = get_climate_profile(location)
    eng_score, reasons, is_vetoed, criterion_breakdown = mcdm_engine.evaluate_material(
        material, climate, blueprint["building_type"], blueprint.get("num_floors", 1), profile
    )
    ml_score, _ = recommendation_engine._get_ml_score(
        material_category=material["Category"],
        material_id=material["Material_ID"],
        climate=climate,
        b_type=blueprint["building_type"],
        budget=blueprint.get("budget", 0.0),
        floor_count=blueprint.get("num_floors", 1),
        total_area=blueprint.get("total_area", 100.0),
        structural_system=blueprint.get("structural_system", "Concrete Frame"),
        sustainability_pref=profile.sustainability_pref,
        mat=material,
    )
    # Use the shared hybrid scoring function from utils for consistency
    from backend.utils import calculate_hybrid_score
    hybrid = calculate_hybrid_score(eng_score, ml_score, vetoed=is_vetoed) if not is_vetoed else 0.0
    return eng_score, ml_score, hybrid, is_vetoed, criterion_breakdown

def main():
    materials = [format_material(r) for r in get_all_materials()]
    output_path = Path(__file__).parent / "score_report.csv"
    fieldnames = [
        "material_id",
        "material_name",
        "category",
        "scenario",
        "engineering_score",
        "ml_score",
        "hybrid_score",
        "selected",
        "criterion_breakdown",
    ]
    with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for scenario in SCENARIOS:
            blueprint = {
                "building_type": scenario["building_type"],
                "num_floors": 1,
                "total_area": 100.0,
                "budget": 0.0,
                "structural_system": "Concrete Frame",
            }
            scores = []
            for mat in materials:
                eng, ml, hyb, veto, breakdown = evaluate_material(mat, blueprint, scenario["location"])
                scores.append({
                    "material": mat,
                    "eng": eng,
                    "ml": ml,
                    "hyb": hyb,
                    "veto": veto,
                    "breakdown": breakdown,
                })
            # Determine max hybrid score among non‑vetoed materials
            max_hybrid = max((s["hyb"] for s in scores if not s["veto"]), default=None)
            for s in scores:
                selected = "Yes" if (not s["veto"] and s["hyb"] == max_hybrid) else "No"
                writer.writerow({
                    "material_id": s["material"]["Material_ID"],
                    "material_name": s["material"]["Name"],
                    "category": s["material"]["Category"],
                    "scenario": f"{scenario['building_type']} - {scenario['location']}",
                    "engineering_score": round(s["eng"], 2) if s["eng"] is not None else "",
                    "ml_score": round(s["ml"], 2) if s["ml"] is not None else "",
                    "hybrid_score": round(s["hyb"], 2) if s["hyb"] is not None else "",
                    "selected": selected,
                    "criterion_breakdown": json.dumps(s["breakdown"]),
                })
    print(f"Score report generated at {output_path}")

    # Compute summary statistics for engineering scores across all scenarios
    import pandas as pd
    import numpy as np
    df = pd.read_csv(output_path)
    eng_scores = df['engineering_score'].replace('', np.nan).astype(float)
    if not eng_scores.empty:
        print("Engineering Score Summary:")
        print(f"  Min: {eng_scores.min():.2f}")
        print(f"  Max: {eng_scores.max():.2f}")
        print(f"  Mean: {eng_scores.mean():.2f}")
        print(f"  Std Dev: {eng_scores.std():.2f}")
    else:
        print("No engineering scores available for summary.")

if __name__ == "__main__":
    main()
