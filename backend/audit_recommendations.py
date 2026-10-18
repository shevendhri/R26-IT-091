import os
import sys
import json
import copy

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from recommendation_engine import recommendation_engine
from questionnaire_engine import UserProfile

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

results = []

for sc in scenarios:
    print(f"Running scenario: {sc['name']}")
    profile = UserProfile(
        sustainability_pref=sc['profile']['sustainability_pref'],
        budget_pref=sc['profile']['budget_pref'],
        location=sc['profile']['location']
    )
    res = recommendation_engine.recommend_package(sc['blueprint'], sc['profile']['location'], profile)
    
    # Extract needed data
    pkg = res.get("recommended_package", {})
    metrics = res.get("metrics", {})
    
    components = {}
    for slot, item in pkg.items():
        if item:
            components[slot] = {
                "name": item.get("name"),
                "ml_score": item.get("ml_score"),
                "eng_score": item.get("eng_score"),
                "hybrid_score": item.get("score")
            }
            
    summary = {
        "scenario": sc['name'],
        "inputs": {"blueprint": sc['blueprint'], "profile": sc['profile']},
        "components": components,
        "metrics": {
            "project_ml_score": metrics.get("project_ml_score"),
            "project_eng_score": metrics.get("project_eng_score"),
            "project_hybrid_score": metrics.get("project_hybrid_score"),
            "total_project_cost": metrics.get("total_project_cost"),
            "average_sustainability": metrics.get("average_sustainability"),
            "carbon_footprint": metrics.get("average_embodied_carbon")
        }
    }
    results.append(summary)

with open("audit_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Audit complete. Results saved to audit_results.json")
