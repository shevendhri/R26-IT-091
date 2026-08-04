import sys
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(base_dir)
sys.path.insert(0, parent_dir)

from backend.recommendation_engine import RecommendationEngine, get_all_materials, format_material
from backend.questionnaire_engine import UserProfile
from backend.utils import calculate_hybrid_score

engine = RecommendationEngine()

scenarios = [
    {"name": "Timber Frame", "blueprint": {"structural_system": "Timber Frame"}, "location": "Colombo", "profile": UserProfile()},
    {"name": "Steel Frame", "blueprint": {"structural_system": "Steel Frame"}, "location": "Colombo", "profile": UserProfile()},
    {"name": "RC Frame", "blueprint": {"structural_system": "Reinforced Concrete Frame"}, "location": "Colombo", "profile": UserProfile()},
    {"name": "High Sustainability", "blueprint": {}, "location": "Colombo", "profile": UserProfile(sustainability_pref="High")},
    {"name": "Low Sustainability", "blueprint": {}, "location": "Colombo", "profile": UserProfile(sustainability_pref="Low")},
    {"name": "Low Budget", "blueprint": {"budget": 1000.0}, "location": "Colombo", "profile": UserProfile(budget_tier="Economy")},
    {"name": "High Budget", "blueprint": {"budget": 1000000.0}, "location": "Colombo", "profile": UserProfile(budget_tier="Premium")},
    {"name": "Extreme Coastal", "blueprint": {}, "location": "Batticaloa", "profile": UserProfile()},
    {"name": "Dry Zone", "blueprint": {}, "location": "Anuradhapura", "profile": UserProfile()},
    {"name": "Commercial Building", "blueprint": {"building_type": "Commercial"}, "location": "Colombo", "profile": UserProfile()},
]

default_blueprint = {
    "building_type": "Residential",
    "num_floors": 2,
    "total_area": 150.0,
    "budget": 50000.0,
    "structural_system": "Concrete Frame"
}

def check_score(rec):
    overall = rec.get("hybrid_score", 0.0)
    eng = rec.get("eng_score", 0.0)
    ml = rec.get("ml_score", 0.0)
    if ml is None:
        return True, 0.0, 0.0, overall # Skipped ml calculation
    
    # User's formula: (Eng * 0.75) + (ML * 0.25) + Climate Adj + Blueprint Adj
    # But wait, we don't have climate_adj and blueprint_adj per material in the JSON?
    # Let's just calculate (Eng * 0.75) + (ML * 0.25)
    expected = (eng * 0.75) + (ml * 0.25)
    diff = abs(overall - expected)
    
    return diff < 0.01, expected, diff, overall

print("--- PHASE 2 & 3: AUTOMATED SCENARIO RUNNER ---\n")

for sc in scenarios:
    print(f"\nRunning Scenario: {sc['name']}")
    bp = default_blueprint.copy()
    bp.update(sc['blueprint'])
    
    res = engine.recommend_package(bp, sc['location'], sc['profile'])
    
    # Check Structural Compatibility
    package = res.get("recommended_package", {})
    structural_mat = package.get("Structural", {})
    
    print(f"  Top Structural Material: {structural_mat.get('Material_Name', 'None')}")
    
    # Check overall score math
    for cat, mat in package.items():
        if mat.get("Material_Name", "None selected") != "None selected":
            passed, expected, diff, overall = check_score(mat)
            if not passed:
                print(f"  [MATH FAIL] {mat.get('Material_Name')}: expected={expected} != overall={overall} (diff={diff})")
            
    print(f"  Decision Confidence: {res.get('confidence', {}).get('confidence_score')}")

print("\n--- DONE ---")
