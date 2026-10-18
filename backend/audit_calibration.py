import os
import sys
import json
import statistics

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from recommendation_engine import recommendation_engine
from questionnaire_engine import UserProfile
from audit_engine import audit_engine

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

all_ml_scores = []
low_ml_winners = []

for sc in scenarios:
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
        ml_score = log["ml_score"] if log["ml_score"] is not None else 0.0
        categories[cat].append({
            "name": log["item_name"],
            "eng_score": log["engineering_score"],
            "ml_score": ml_score,
            "hybrid_score": log["hybrid_score"]
        })
        all_ml_scores.append(ml_score)
        
    for cat, items in categories.items():
        # Find the winning item under 70/30 (highest hybrid score)
        winner = max(items, key=lambda x: x["hybrid_score"])
        if winner["ml_score"] < 10.0:
            low_ml_winners.append({
                "scenario": sc['name'],
                "category": cat,
                "material": winner["name"],
                "ml_score": winner["ml_score"],
                "eng_score": winner["eng_score"],
                "hybrid_score": winner["hybrid_score"]
            })

# Statistics
stats = {
    "min": min(all_ml_scores),
    "max": max(all_ml_scores),
    "mean": sum(all_ml_scores) / len(all_ml_scores) if all_ml_scores else 0,
    "median": statistics.median(all_ml_scores) if all_ml_scores else 0,
    "std_dev": statistics.stdev(all_ml_scores) if len(all_ml_scores) > 1 else 0
}

counts = {
    "below_1": sum(1 for x in all_ml_scores if x < 1.0),
    "below_5": sum(1 for x in all_ml_scores if x < 5.0),
    "below_10": sum(1 for x in all_ml_scores if x < 10.0),
    "above_90": sum(1 for x in all_ml_scores if x > 90.0),
    "total": len(all_ml_scores)
}

# Histogram buckets
histogram = {
    "0-10": sum(1 for x in all_ml_scores if 0 <= x <= 10),
    "10-20": sum(1 for x in all_ml_scores if 10 < x <= 20),
    "20-30": sum(1 for x in all_ml_scores if 20 < x <= 30),
    "30-40": sum(1 for x in all_ml_scores if 30 < x <= 40),
    "40-50": sum(1 for x in all_ml_scores if 40 < x <= 50),
    "50-60": sum(1 for x in all_ml_scores if 50 < x <= 60),
    "60-70": sum(1 for x in all_ml_scores if 60 < x <= 70),
    "70-80": sum(1 for x in all_ml_scores if 70 < x <= 80),
    "80-90": sum(1 for x in all_ml_scores if 80 < x <= 90),
    "90-100": sum(1 for x in all_ml_scores if 90 < x <= 100),
}

output = {
    "stats": stats,
    "counts": counts,
    "histogram": histogram,
    "low_ml_winners": low_ml_winners
}

with open("calibration_analysis.json", "w") as f:
    json.dump(output, f, indent=2)

print("Calibration analysis complete. Results saved.")
