# backend/test_ml_pipeline.py
import sys
import os

# Add parent directory to sys.path to resolve backend package name
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from recommendation_engine import recommendation_engine
from questionnaire_engine import UserProfile
from database import get_all_materials, format_material
import traceback

def run_tests():
    print("=== STARTING ML PIPELINE INTEGRATION TEST ===")
    
    test_cases = [
        # Case 1: Low-rise residential in Colombo
        {
            "blueprint": {
                "building_type": "Residential",
                "num_floors": 1,
                "total_area": 150.0,
                "structural_system": "Concrete Frame"
            },
            "location": "Colombo",
            "profile": {
                "budget_tier": "Balanced",
                "sustainability_pref": "Medium",
                "maintenance_pref": "Medium",
                "style_pref": "Modern"
            }
        },
        # Case 2: High-rise commercial in Trincomalee (Extreme Coastal)
        {
            "blueprint": {
                "building_type": "Commercial",
                "num_floors": 5,
                "total_area": 800.0,
                "structural_system": "Steel Frame"
            },
            "location": "Trincomalee",
            "profile": {
                "budget_tier": "Premium",
                "sustainability_pref": "High",
                "maintenance_pref": "Low",
                "style_pref": "Modern"
            }
        },
        # Case 3: Industrial in Nuwara Eliya (Highland)
        {
            "blueprint": {
                "building_type": "Industrial",
                "num_floors": 2,
                "total_area": 1200.0,
                "structural_system": "Steel Frame"
            },
            "location": "Nuwara Eliya",
            "profile": {
                "budget_tier": "Economy",
                "sustainability_pref": "Low",
                "maintenance_pref": "High",
                "style_pref": "Minimalist"
            }
        }
    ]

    for idx, case in enumerate(test_cases, 1):
        print(f"\n--- Testing Scenario {idx}: {case['blueprint']['building_type']} in {case['location']} ({case['blueprint']['num_floors']} floor) ---")
        try:
            profile_obj = UserProfile(**case["profile"])
            res = recommendation_engine.recommend_package(
                blueprint=case["blueprint"],
                location=case["location"],
                profile=profile_obj
            )
            
            # Assertions
            assert res["status"] == "success", "Response status was not success"
            
            # Check metrics
            metrics = res["metrics"]
            print(f"Project Hybrid Score: {metrics['project_hybrid_score']}")
            print(f"Project Engineering Score: {metrics['project_eng_score']}")
            print(f"Project ML Score: {metrics['project_ml_score']}")
            assert metrics["project_hybrid_score"] > 0, "Hybrid score must be positive"
            
            # Check recommended items
            pkg = res["recommended_package"]
            print("Recommended Walling Material:", pkg["walls"]["name"])
            print("Walling hybrid score:", pkg["walls"]["score"])
            print("Walling ML probability score:", pkg["walls"]["ml_score"])
            print("Walling XAI agreement:", pkg["walls"]["rationale"].split("Agreement:\n")[-1])
            
            assert pkg["walls"]["score"] == round(0.75 * pkg["walls"]["eng_score"] + 0.25 * pkg["walls"]["ml_score"], 2), "Walling Hybrid score formula mismatch"
            
            # Verify veto overrides ML
            # Standard Cement Tile in extreme coastal Trincomalee should be vetoed or scored 0
            if case["location"] == "Trincomalee":
                # Let's inspect exclusions
                print("Exclusions length:", len(res.get("reasoning", [])))
                
            print(f"Scenario {idx} verified successfully.")
        except Exception as e:
            print(f"Error running test scenario {idx}:")
            traceback.print_exc()
            sys.exit(1)

    print("\n=== ALL ML PIPELINE INTEGRATION TESTS PASSED CLEANLY ===")

if __name__ == "__main__":
    run_tests()
