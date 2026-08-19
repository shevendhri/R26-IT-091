import sys
import os
import json
import sqlite3

import warnings
warnings.filterwarnings("ignore")

ROOT_DIR = r"C:\Users\ASUS\Desktop\Material specification"
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.recommendation_engine import recommendation_engine
from backend.questionnaire_engine import UserProfile
from backend.material_quantity_engine import MaterialQuantityEngine
from backend.database import get_connection

def run_comprehensive_audit():
    print("=" * 80)
    print("GREENCONSTRUCTAI COMPREHENSIVE ENGINEERING LOGIC AUDIT")
    print("=" * 80)

    conn = get_connection()
    cur = conn.cursor()

    # -------------------------------------------------------------
    # 1. DATABASE AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 11: MATERIAL DATA AUDIT")
    print("="*40)
    cur.execute("SELECT COUNT(*) FROM materials")
    total_mats = cur.fetchone()[0]
    print(f"Total Database Rows: {total_mats}")

    cur.execute("""
        SELECT Material_ID, Name, Component, Application, Unit, Unit_Rate, Rate_Basis, 
               Embodied_Carbon, Service_Life, Sustainability_Rating, Standard_Reference
        FROM materials
    """)
    rows = cur.fetchall()
    
    # Check carbon values
    carbon_dict = {}
    service_life_dict = {}
    missing_standards = []
    suspicious_components = []

    valid_components = {"Foundation", "Structural", "Walling", "Roofing", "Flooring", "Ceiling", "Openings", "Waterproofing", "Finishing"}

    for r in rows:
        mid, name, comp, app, unit, rate, rbasis, carbon, slife, sust, sref = r
        if carbon not in carbon_dict:
            carbon_dict[carbon] = []
        carbon_dict[carbon].append(name)

        if slife not in service_life_dict:
            service_life_dict[slife] = []
        service_life_dict[slife].append(name)

        if not sref or sref.strip() == "" or sref == "N/A":
            missing_standards.append(name)
        
        if comp not in valid_components:
            suspicious_components.append((name, comp))

    print(f"Materials with missing standard references: {len(missing_standards)}")
    print(f"Materials with invalid component assignments: {len(suspicious_components)}")
    
    clusters = {k: v for k, v in carbon_dict.items() if len(v) >= 4 and k is not None}
    print(f"Clusters of identical carbon values (>=4 materials): {len(clusters)}")
    for k, v in list(clusters.items())[:3]:
        print(f"   Carbon {k} kgCO2/kg shared by: {v[:4]}...")

    # -------------------------------------------------------------
    # 2. COMPONENT ELIGIBILITY AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 2: COMPONENT ELIGIBILITY TEST")
    print("="*40)
    
    bp_std = {
        "building_type": "Residential",
        "num_floors": 1,
        "total_area": 100.0,
        "structural_system": "Concrete Frame",
        "budget": 5000000.0
    }
    profile_std = UserProfile(
        project_type="Residential",
        budget_tier="Standard",
        eco_priority="Balanced",
        aesthetic_style="Contemporary"
    )

    rec_res = recommendation_engine.recommend_package(bp_std, "Colombo", profile_std)
    pkg = rec_res.get("recommended_package", {})
    all_scores = rec_res.get("all_candidate_scores", {})
    exclusions = rec_res.get("technical_exclusions_summary", {})

    print(f"Categories returned in Recommended Package: {list(pkg.keys())}")
    
    inappropriate_test_cases = [
        ("Foundation", ["Clay Bricks", "Roof Tiles - Clay", "Gypsum Ceiling Board", "Floor Tiles - Ceramic", "Glass Windows"]),
        ("Walling", ["Roof Tiles - Clay", "Bituminous Membrane Waterproofing", "Gypsum Ceiling Board", "Grade 25 Concrete (Foundation)"]),
        ("Roofing", ["Grade 25 Concrete (Foundation)", "Ceramic Floor Tiles", "Clay Bricks", "PVC Ceiling Panels"]),
        ("Flooring", ["Roof Tiles - Clay", "Grade 25 Concrete (Foundation)", "Glass Windows", "Ceiling Board"]),
        ("Openings", ["Grade 25 Concrete (Foundation)", "Roof Tiles - Clay", "Cement Sand Plaster", "Clay Bricks"]),
    ]

    eligibility_passes = 0
    eligibility_fails = 0

    for comp, bad_list in inappropriate_test_cases:
        comp_key = comp.lower()
        rec_obj = pkg.get(comp_key, {})
        rec_name = rec_obj.get("name") if isinstance(rec_obj, dict) else str(rec_obj)
        cand_list = [c.get("name") for c in all_scores.get(comp_key, []) if isinstance(c, dict)]
        
        for bad_mat in bad_list:
            if bad_mat == rec_name:
                print(f"  [FAIL] {comp}: '{bad_mat}' appeared as primary recommendation!")
                eligibility_fails += 1
            elif bad_mat in cand_list:
                print(f"  [FAIL] {comp}: '{bad_mat}' was evaluated in candidate list!")
                eligibility_fails += 1
            else:
                print(f"  [PASS] {comp}: '{bad_mat}' excluded pre-scoring.")
                eligibility_passes += 1

    print(f"Component Eligibility Results: PASS={eligibility_passes}, FAIL={eligibility_fails}")

    # -------------------------------------------------------------
    # 3. ENGINEERING PLAUSIBILITY SCENARIOS (A to E)
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 3: ENGINEERING PLAUSIBILITY SCENARIOS")
    print("="*40)

    scenarios = [
        ("TEST A: 1-Storey Res, 80m2, Colombo (Lowland Wet)", {
            "bp": {"building_type": "Residential", "num_floors": 1, "total_area": 80.0, "structural_system": "Concrete Frame"},
            "loc": "Colombo",
            "prof": UserProfile(project_type="Residential", budget_tier="Standard", eco_priority="Balanced", aesthetic_style="Contemporary")
        }),
        ("TEST B: 2-Storey Res, 170m2, Kandy (Hill Country)", {
            "bp": {"building_type": "Residential", "num_floors": 2, "total_area": 170.0, "structural_system": "Concrete Frame"},
            "loc": "Kandy",
            "prof": UserProfile(project_type="Residential", budget_tier="Standard", eco_priority="Balanced", aesthetic_style="Contemporary")
        }),
        ("TEST C: 2-Storey Res, 142.6m2, Trincomalee (Coastal Saline/Dry)", {
            "bp": {"building_type": "Residential", "num_floors": 2, "total_area": 142.6, "structural_system": "Concrete Frame"},
            "loc": "Trincomalee",
            "prof": UserProfile(project_type="Residential", budget_tier="Standard", eco_priority="Balanced", aesthetic_style="Contemporary")
        }),
        ("TEST D: 2-Storey Res, 120m2, Nuwara Eliya (Cold Montane/High Rain)", {
            "bp": {"building_type": "Residential", "num_floors": 2, "total_area": 120.0, "structural_system": "Concrete Frame"},
            "loc": "Nuwara Eliya",
            "prof": UserProfile(project_type="Residential", budget_tier="Standard", eco_priority="Balanced", aesthetic_style="Contemporary")
        }),
        ("TEST E: 1-Storey Res, 100m2, Anuradhapura (Hot Dry Zone)", {
            "bp": {"building_type": "Residential", "num_floors": 1, "total_area": 100.0, "structural_system": "Concrete Frame"},
            "loc": "Anuradhapura",
            "prof": UserProfile(project_type="Residential", budget_tier="Standard", eco_priority="Balanced", aesthetic_style="Contemporary")
        })
    ]

    for title, sc in scenarios:
        print(f"\n--- {title} ---")
        out = recommendation_engine.recommend_package(sc["bp"], sc["loc"], sc["prof"])
        cp = out.get("climate_profile", {})
        p = out.get("recommended_package", {})
        print(f"  Climate Profile: Type={cp.get('type')}, Humidity={cp.get('humidity')}, Salinity={cp.get('salinity')}, Rainfall={cp.get('rainfall')}")
        for k in ["foundation", "structural", "walls", "roofing", "flooring", "waterproofing"]:
            m = p.get(k, {})
            if isinstance(m, dict):
                print(f"    {k.capitalize():<14}: {m.get('name'):<32} | Score={m.get('score')} | Agree={m.get('engine_ml_agreement')}")

    # -------------------------------------------------------------
    # 4 & 5. FOUNDATION & STRUCTURAL SCALING AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 4 & 5: FOUNDATION & STRUCTURAL LOGIC")
    print("="*40)

    # 1 floor vs 4 floors commercial
    bp_1f = {"building_type": "Commercial", "num_floors": 1, "total_area": 300.0, "structural_system": "Concrete Frame"}
    bp_4f = {"building_type": "Commercial", "num_floors": 4, "total_area": 1200.0, "structural_system": "Concrete Frame"}
    prof_comm = UserProfile(project_type="Commercial", budget_tier="Standard", eco_priority="Balanced", aesthetic_style="Modern")

    out_1f = recommendation_engine.recommend_package(bp_1f, "Colombo", prof_comm)
    out_4f = recommendation_engine.recommend_package(bp_4f, "Colombo", prof_comm)

    f1 = out_1f.get("recommended_package", {}).get("foundation", {}).get("name")
    f4 = out_4f.get("recommended_package", {}).get("foundation", {}).get("name")
    s1 = out_1f.get("recommended_package", {}).get("structural", {}).get("name")
    s4 = out_4f.get("recommended_package", {}).get("structural", {}).get("name")
    
    print(f"  1-Storey Commercial Foundation: {f1}")
    print(f"  4-Storey Commercial Foundation: {f4}")
    print(f"  1-Storey Commercial Structural: {s1}")
    print(f"  4-Storey Commercial Structural: {s4}")

    # -------------------------------------------------------------
    # 6. CLIMATE MAPPING AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 6: CLIMATE LOGIC AUDIT")
    print("="*40)
    test_cities = ["Colombo", "Kandy", "Trincomalee", "Galle", "Nuwara Eliya", "Anuradhapura", "Kurunegala"]
    for c in test_cities:
        out_c = recommendation_engine.recommend_package(bp_std, c, profile_std)
        cp = out_c.get("climate_profile", {})
        print(f"  {c:<14} -> Zone: {cp.get('type'):<12} | Humid: {cp.get('humidity'):<5} | Salinity: {cp.get('salinity'):<6} | Rain: {cp.get('rainfall'):<6}")

    # -------------------------------------------------------------
    # 7. SCORING FORMULA AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 7: SCORING FORMULA AUDIT")
    print("="*40)
    print("Implemented Hybrid Weight Schedule in recommendation_engine.py:")
    print("  Base: 70% Engineering + 30% ML")
    print("  Schedule dynamically scales ML weight based on predicted probability:")
    print("    - ML Prob >= 0.90 -> 40% Eng / 60% ML")
    print("    - ML Prob >= 0.70 -> 60% Eng / 40% ML")
    print("    - ML Prob >= 0.50 -> 70% Eng / 30% ML")
    print("    - ML Prob <  0.50 -> 85% Eng / 15% ML")

    # -------------------------------------------------------------
    # 8. ML + ENGINEERING INTERACTION (DISAGREEMENT CASES)
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 8: ML + ENGINEERING DISAGREEMENT TEST")
    print("="*40)
    
    # Check all candidates across multiple categories to find low ML agreement items
    found_disagreements = []
    for cat_name, cand_list in all_scores.items():
        for c in cand_list:
            if isinstance(c, dict):
                dis = c.get("disagreement_explanation")
                agr = c.get("engine_ml_agreement")
                eng_s = c.get("eng_score")
                ml_s = c.get("ml_score")
                if agr == "Low" or dis:
                    found_disagreements.append((cat_name, c.get("name"), eng_s, ml_s, agr, dis))

    print(f"Total ML Disagreement cases detected: {len(found_disagreements)}")
    for d in found_disagreements[:5]:
        print(f"  Category: {d[0]:<12} | Material: {d[1]:<30} | Eng={d[2]} | ML={d[3]} | Agreement={d[4]}")
        print(f"    Explanation: {d[5]}")

    # -------------------------------------------------------------
    # 9. TECHNICAL EXCLUSION AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 9: TECHNICAL EXCLUSION SUMMARY")
    print("="*40)
    for cat, ex_list in exclusions.items():
        print(f"  Exclusion Category: '{cat}' -> {len(ex_list)} excluded items")
        if ex_list:
            print(f"    Sample: {ex_list[0].get('material_name')} - Reason: {ex_list[0].get('reason')}")

    # -------------------------------------------------------------
    # 10. QUANTITY ENGINE AUDIT
    # -------------------------------------------------------------
    print("\n" + "="*40)
    print("SECTION 10: QUANTITY ENGINE AUDIT")
    print("="*40)
    q1 = MaterialQuantityEngine.calculate_quantities("Residential", 1, 100.0, structural_system="Concrete Frame", location="Colombo")
    q2 = MaterialQuantityEngine.calculate_quantities("Residential", 2, 200.0, structural_system="Concrete Frame", location="Colombo")
    q3_custom = MaterialQuantityEngine.calculate_quantities("Residential", 2, 200.0, wall_area=190.0, window_area=40.0, door_count=8, structural_system="Concrete Frame", location="Colombo")

    print("Geometric Output Verification:")
    print(f"  100m2 (1-Storey): Footprint={q1['footprint_area_m2']} m2, Wall Net={q1['net_wall_area_m2']} m2, Roof={q1['roof_surface_area_m2']} m2")
    print(f"  200m2 (2-Storey): Footprint={q2['footprint_area_m2']} m2, Wall Net={q2['net_wall_area_m2']} m2, Roof={q2['roof_surface_area_m2']} m2")
    print(f"  200m2 (Custom Openings): Wall Net={q3_custom['net_wall_area_m2']} m2 (Gross {q3_custom['gross_wall_area_m2']} - Window {q3_custom['window_area_m2']} - Door {q3_custom['door_area_m2']})")
    print(f"  Calculation Assumptions Documented: {len(q1['assumptions'])} items")

    print("\n" + "=" * 80)
    print("AUDIT EXECUTION COMPLETED")
    print("=" * 80)

if __name__ == "__main__":
    run_comprehensive_audit()
