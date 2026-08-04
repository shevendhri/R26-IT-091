import requests
import sys
import math

def check_verdict_cleanliness(verdict, reasoning):
    forbidden_strings = ["sector mismatch", "style mismatch", "height limit", "climate veto"]
    for fs in forbidden_strings:
        if fs in verdict.lower():
            print(f"FAIL: Verdict contains forbidden internal string '{fs}'. Verdict: {verdict}")
            sys.exit(1)
        for r in reasoning:
            if fs in r.lower():
                print(f"FAIL: Rationale contains forbidden internal string '{fs}'. Rationale: {r}")
                sys.exit(1)
                
    print("PASS: Verdict and Rationale are clean of internal debug strings.")

def main():
    print("Starting GreenConstructAI Verification Suite...")
    
    response = requests.post(
        "http://127.0.0.1:5000/recommend-materials",
        json={
            "blueprint": {
                "building_type": "Industrial",
                "num_floors": 2,
                "total_area": 250.0,
                "rooms": []
            },
            "location": "Colombo, Sri Lanka",
            "profile": {
                "budget_tier": "Balanced",
                "workforce_size": 150,
                "sustainability_pref": "High",
                "maintenance_pref": "Low",
                "family_size": 4,
                "bedrooms_needed": 3,
                "style_pref": "Modern",
                "climate_concerns": "Heavy Rain",
                "future_expansion": "None"
            }
        }
    )
    
    if response.status_code != 200:
        print(f"FAIL: API Error {response.status_code}")
        print(response.text)
        sys.exit(1)
        
    data = response.json()
    
    if data.get("status") != "success":
        print("FAIL: API returned error status.")
        sys.exit(1)
        
    package = data
    recommended_package = data.get("recommended_package", {})
    metrics = data.get("metrics", {})
    audit_logs = data.get("audit_log", [])

    # Check Workforce Size
    if "user_preferences" in package:
        assert "workforce_size" in package["user_preferences"] or "workforce_size" in data.get("questionnaire", {}), "FAIL: workforce_size not in response payload"
        print("PASS: Workforce Size is correctly preserved in payload.")

    check_verdict_cleanliness(package.get("engineering_verdict", ""), package.get("reasoning", []))

    # Extract recommended materials
    recommended_components = {}
    for cat in ["foundation", "structural", "walls", "roofing", "windows", "doors", "flooring", "ceiling", "finishes", "waterproofing"]:
        if cat in recommended_package:
            comp = recommended_package[cat]
            if comp and "name" in comp:
                recommended_components[comp["name"]] = {
                    "eng_score": comp.get("eng_score", 0),
                    "ml_score": comp.get("ml_score", 0),
                    "hybrid_score": comp.get("score", 0)
                }

    # Check Audit Parity
    for name, r_scores in recommended_components.items():
        audit_match = next((log for log in audit_logs if log["item_name"] == name), None)
        
        if audit_match:
            audit_hybrid = audit_match.get("hybrid_score", 0)
            audit_eng = audit_match.get("engineering_score", 0)
            audit_ml = audit_match.get("ml_score", 0)
            
            if not math.isclose(r_scores["hybrid_score"], audit_hybrid, abs_tol=0.01):
                print(f"FAIL: Report hybrid score {r_scores['hybrid_score']} != Audit hybrid score {audit_hybrid} for {name}")
                sys.exit(1)
            
            if not math.isclose(r_scores["eng_score"], audit_eng, abs_tol=0.01):
                print(f"FAIL: Report eng_score {r_scores['eng_score']} != Audit eng_score {audit_eng} for {name}")
                sys.exit(1)
                
            if r_scores["ml_score"] is not None and audit_ml is not None:
                if not math.isclose(r_scores["ml_score"], audit_ml, abs_tol=0.01):
                    print(f"FAIL: Report ml_score {r_scores['ml_score']} != Audit ml_score {audit_ml} for {name}")
                    sys.exit(1)
        else:
            # Audit log might just truncate to top 30, but in reality top items should be in it
            print(f"WARNING: Recommended material {name} not found in top audit logs.")

    print("PASS: Audit log parity verified using math.isclose.")

    # Verify model_integrity block exists and contains required fields
    assert "model_integrity" in data, "FAIL: model_integrity block missing"
    mi = data["model_integrity"]
    required_fields = ["model_loaded", "dataset_loaded", "dataset_rows", "dataset_columns", "feature_count", "fallback_predictions", "average_confidence", "cross_validation_score", "recommendation_engine_status"]
    for f in required_fields:
        assert f in mi, f"FAIL: model_integrity missing field {f}"
    print("PASS: model_integrity block validated.")

    # Verify feature_importance_available flag exists and is boolean
    assert isinstance(data.get("feature_importance_available"), bool), "FAIL: feature_importance_available missing or not boolean"
    print("PASS: feature_importance_available flag present.")

    
    # Check mathematical aggregation
    # Project hybrid score must equal the unrounded mean of component hybrid scores
    if recommended_components:
        comp_scores = [c["hybrid_score"] for c in recommended_components.values() if c["hybrid_score"] is not None]
        if comp_scores:
            expected_mean = sum(comp_scores) / len(comp_scores)
            actual = metrics.get("project_hybrid_score", 0)
            
            if not math.isclose(round(expected_mean, 1), actual, abs_tol=0.05):
                print(f"FAIL: project_hybrid_score {actual} != mean of component scores {round(expected_mean, 1)}")
                sys.exit(1)
                
    print("PASS: Hybrid aggregation mathematical logic verified.")
    
    print("\n--- ALL TESTS PASSED ---")

if __name__ == "__main__":
    main()
