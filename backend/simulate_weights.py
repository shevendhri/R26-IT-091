import os
import sys
import json
import copy

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from recommendation_engine import recommendation_engine
from questionnaire_engine import UserProfile
from audit_engine import audit_engine
from database import get_all_materials
from recommendation_engine import format_material

scenarios = [
    {
        "name": "1. Residential - Colombo",
        "blueprint": {"building_type": "Residential", "num_floors": 2, "total_area": 250.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Colombo", "sustainability_pref": "Medium", "budget_pref": "Medium"}
    },
    {
        "name": "2. Residential - Kandy",
        "blueprint": {"building_type": "Residential", "num_floors": 2, "total_area": 250.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Kandy", "sustainability_pref": "Medium", "budget_pref": "Medium"}
    },
    {
        "name": "3. Residential - Jaffna",
        "blueprint": {"building_type": "Residential", "num_floors": 2, "total_area": 250.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Jaffna", "sustainability_pref": "Medium", "budget_pref": "Medium"}
    },
    {
        "name": "4. Commercial - Colombo",
        "blueprint": {"building_type": "Commercial", "num_floors": 10, "total_area": 2000.0, "structural_system": "Steel Frame"},
        "profile": {"location": "Colombo", "sustainability_pref": "High", "budget_pref": "High"}
    },
    {
        "name": "5. Commercial - Galle",
        "blueprint": {"building_type": "Commercial", "num_floors": 5, "total_area": 1000.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Galle", "sustainability_pref": "Medium", "budget_pref": "Medium"}
    },
    {
        "name": "6. Educational - Kandy",
        "blueprint": {"building_type": "Educational", "num_floors": 3, "total_area": 1500.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Kandy", "sustainability_pref": "High", "budget_pref": "Medium"}
    },
    {
        "name": "7. Industrial - Colombo",
        "blueprint": {"building_type": "Industrial", "num_floors": 1, "total_area": 5000.0, "structural_system": "Steel Frame"},
        "profile": {"location": "Colombo", "sustainability_pref": "Low", "budget_pref": "Low"}
    },
    {
        "name": "8. Hospitality - Galle",
        "blueprint": {"building_type": "Hospitality", "num_floors": 4, "total_area": 3000.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Galle", "sustainability_pref": "High", "budget_pref": "High"}
    },
    {
        "name": "9. Office - Colombo",
        "blueprint": {"building_type": "Office", "num_floors": 15, "total_area": 5000.0, "structural_system": "Steel Frame"},
        "profile": {"location": "Colombo", "sustainability_pref": "Medium", "budget_pref": "Medium"}
    },
    {
        "name": "10. Mixed Use - Kandy",
        "blueprint": {"building_type": "Mixed Use", "num_floors": 6, "total_area": 2500.0, "structural_system": "Concrete Frame"},
        "profile": {"location": "Kandy", "sustainability_pref": "High", "budget_pref": "Medium"}
    }
]

weights = {
    "70/30 Baseline": (0.7, 0.3),
    "60/40": (0.6, 0.4),
    "50/50": (0.5, 0.5),
    "40/60": (0.4, 0.6)
}

# Fetch material DB to get sustainability scores
all_mats = get_all_materials()
formatted_mats = [format_material(r) for r in all_mats]
sustainability_db = {m["Name"]: m.get("Sustainability_Rating", 50.0) for m in formatted_mats}

results = []

for sc in scenarios:
    print(f"Running scenario: {sc['name']}")
    profile = UserProfile(
        sustainability_pref=sc['profile']['sustainability_pref'],
        budget_pref=sc['profile']['budget_pref'],
        location=sc['profile']['location']
    )
    # Run the engine to populate audit logs
    res = recommendation_engine.recommend_package(sc['blueprint'], sc['profile']['location'], profile)
    logs = audit_engine.get_logs()
    
    # We group valid materials by category from the logs
    categories = {}
    for log in logs:
        cat = log["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "name": log["item_name"],
            "eng_score": log["engineering_score"],
            "ml_score": log["ml_score"] if log["ml_score"] is not None else 0.0
        })
    
    scenario_res = {"scenario": sc['name'], "weights": {}}
    
    # Simulate each weighting scheme
    for w_name, (w_eng, w_ml) in weights.items():
        package = {}
        for cat, items in categories.items():
            # Find the best item for this weight
            best_item = None
            best_score = -1.0
            for item in items:
                score = (w_eng * item["eng_score"]) + (w_ml * item["ml_score"])
                if score > best_score:
                    best_score = score
                    best_item = item
            
            package[cat] = {
                "name": best_item["name"],
                "eng_score": best_item["eng_score"],
                "ml_score": best_item["ml_score"],
                "hybrid_score": best_score,
                "sustainability": sustainability_db.get(best_item["name"], 50.0)
            }
        
        # Compute project metrics
        proj_eng = sum([v["eng_score"] for v in package.values()]) / len(package) if package else 0
        proj_ml = sum([v["ml_score"] for v in package.values()]) / len(package) if package else 0
        proj_hybrid = sum([v["hybrid_score"] for v in package.values()]) / len(package) if package else 0
        avg_sust = sum([float(v["sustainability"]) if v["sustainability"] else 0.0 for v in package.values()]) / len(package) if package else 0
        
        scenario_res["weights"][w_name] = {
            "package": package,
            "project_eng_score": proj_eng,
            "project_ml_score": proj_ml,
            "project_hybrid_score": proj_hybrid,
            "average_sustainability": avg_sust
        }
    
    # Calculate changes compared to 70/30 baseline
    base_pkg = scenario_res["weights"]["70/30 Baseline"]["package"]
    for w_name in weights.keys():
        if w_name == "70/30 Baseline":
            scenario_res["weights"][w_name]["changes"] = 0
            continue
        
        pkg = scenario_res["weights"][w_name]["package"]
        changes = sum([1 for cat in base_pkg.keys() if base_pkg[cat]["name"] != pkg[cat]["name"]])
        scenario_res["weights"][w_name]["changes"] = changes
        
    results.append(scenario_res)

with open("weight_simulation_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Simulation complete. Results saved to weight_simulation_results.json")
