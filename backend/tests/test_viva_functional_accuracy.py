"""
Automated Test Suite for GreenConstructAI Viva-Ready Functional Accuracy.
Covers Tests 1 through 10:
1. Colombo 80m² Single-Storey Residential Baseline
2. Kandy 170m² Two-Storey Residential Geometry & Climate
3. Galle Coastal Marine Chloride Exposure
4. Anuradhapura Dry-Zone Inland Standard Concrete Scoring
5. Nuwara Eliya Highland Montane Cold/Humid Thermal Suitability
6. 5-Floor / 16.8m² / 16m Height Anomaly Detection & Review Flagging
7. Material Taxonomy & Component Mismatch Prevention
8. Low ML Confidence (<40%) -> Engineering-Led Classification
9. Engineering / ML Divergence (|Eng - ML| >= 20) Handling
10. Blueprint Geometry Extraction & Recommendation Context Transfer
"""

import sys
import os
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.geometry_validator import GeometryValidator
from backend.material_quantity_engine import MaterialQuantityEngine
from backend.recommendation_engine import recommendation_engine
from backend.questionnaire_engine import UserProfile
from backend.weather_engine import get_climate_profile
from backend.engines.constraint_engine import evaluate_constraints
from backend.database import get_all_materials, format_material


# ── TEST 1: Colombo 80m² Single-Storey Residential Baseline ──────────────────
def test_colombo_80m2_residential():
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="Medium",
        budget_tier="Balanced",
        structural_system="Concrete Frame"
    )
    bp = {
        "building_type": "Residential",
        "num_floors": 1,
        "total_area": 80.0,
        "structural_system": "Concrete Frame",
        "footprint_area": 80.0
    }
    
    rec = recommendation_engine.recommend_package(bp, "Colombo", profile)
    
    assert rec["status"] == "success"
    assert "project_validation" in rec
    assert rec["project_validation"]["status"] == "PASS"
    assert "disclaimer" in rec
    assert "preliminary decision support" in rec["disclaimer"].lower()
    
    # 11 Canonical Components check
    pkg = rec["recommended_package"]
    canonical_keys = [
        "foundation", "structural_frame", "reinforcement", "walling",
        "roofing", "windows", "doors", "flooring", "ceiling", "finishes", "waterproofing"
    ]
    for key in canonical_keys:
        assert key in pkg, f"Canonical key '{key}' missing from package"
        item = pkg[key]
        assert item is not None, f"Item for '{key}' is None"
        assert "name" in item
        assert "engineering_validation" in item
        assert "ml_confidence" in item
        assert "hybrid_score" in item
        assert "classification" in item
        assert item["classification"] in ["ENGINEERING-LED RECOMMENDATION", "HYBRID RECOMMENDATION"]
        assert "quantity" in item
        assert "unit" in item
        assert "calculation_basis" in item


# ── TEST 2: Kandy 170m² Two-Storey Residential Geometry & Climate ────────────
def test_kandy_170m2_two_storey():
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="High",
        budget_tier="Balanced",
        structural_system="Concrete Frame"
    )
    bp = {
        "building_type": "Residential",
        "num_floors": 2,
        "total_area": 170.0,
        "structural_system": "Concrete Frame",
        "footprint_area": 85.0
    }
    
    rec = recommendation_engine.recommend_package(bp, "Kandy", profile)
    quantities = rec["building_quantities"]
    
    assert rec["status"] == "success"
    assert rec["climate_profile"]["city"] == "Kandy"
    # Footprint should be 85 m2 (170 / 2)
    assert quantities["footprint_area_m2"] == 85.0
    assert quantities["gross_floor_area_m2"] == 170.0
    # Net walling area should be positive and less than gross walling
    assert quantities["net_wall_area_m2"] < quantities["gross_wall_area_m2"]
    assert quantities["net_wall_area_m2"] > 0
    # Roof area should be ~85 * 1.15 = ~97.75
    assert quantities["roof_surface_area_m2"] > 85.0


# ── TEST 3: Galle Coastal Marine Chloride Exposure ───────────────────────────
def test_galle_coastal_marine():
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="Medium",
        budget_tier="Balanced",
        structural_system="Concrete Frame"
    )
    bp = {
        "building_type": "Residential",
        "num_floors": 2,
        "total_area": 150.0,
        "structural_system": "Concrete Frame"
    }
    
    rec = recommendation_engine.recommend_package(bp, "Galle", profile)
    pkg = rec["recommended_package"]
    struct = pkg.get("structural_frame", {})
    
    assert rec["status"] == "success"
    assert rec["climate_profile"]["salinity"] in ["High", "Extreme", "Moderate"]
    # Structural concrete or frame in Galle coastal should have high engineering validation score
    assert struct["engineering_validation"] >= 80.0
    # Rationale or why_this_material should reference marine / corrosion resistance
    reasons_text = " ".join(struct.get("why_this_material", []) + [struct.get("rationale", "")]).lower()
    assert any(w in reasons_text for w in ["marine", "chloride", "corrosion", "coastal", "sls", "durability", "dense"])


# ── TEST 4: Anuradhapura Dry-Zone Inland Standard Mix ─────────────────────────
def test_anuradhapura_dry_zone_standard():
    climate = get_climate_profile("Anuradhapura")
    assert "dry" in climate.get("type", "").lower() or climate.get("salinity", "").lower() == "low"
    
    # Check Marine Grade Concrete in Anuradhapura
    marine_mat = {
        "Name": "Grade 35 Marine Concrete (Silica Fume)",
        "Category": "Concrete",
        "Subcategory": "High Performance",
        "Component": "Structural Frame",
        "Compressive_Strength": 35,
        "Cost_Tier": "High",
        "Rate_LKR": 32000,
        "Embodied_Carbon": 0.42,
        "Service_Life": 80,
        "Moisture_Resistance": 95,
        "Corrosion_Resistance": 95,
        "Sustainability_Rating": 65,
        "Maintenance_Level": 85,
        "Structural_Capacity": 90,
        "Local_Availability": "Medium",
        "Data_Source": "Baseline",
        "Standard_Reference": "SLS 107"
    }
    
    standard_mat = {
        "Name": "Grade 25 Standard Structural Mix",
        "Category": "Concrete",
        "Subcategory": "Structural Concrete",
        "Component": "Structural Frame",
        "Compressive_Strength": 25,
        "Cost_Tier": "Low",
        "Rate_LKR": 22000,
        "Embodied_Carbon": 0.32,
        "Service_Life": 50,
        "Moisture_Resistance": 70,
        "Corrosion_Resistance": 65,
        "Sustainability_Rating": 60,
        "Maintenance_Level": 70,
        "Structural_Capacity": 75,
        "Local_Availability": "High",
        "Data_Source": "Baseline",
        "Standard_Reference": "SLS 107"
    }
    
    bp = {"building_type": "Residential", "num_floors": 1, "total_area": 100.0}
    prof = UserProfile(building_type="Residential")
    
    eval_marine = evaluate_constraints(marine_mat, "Residential", bp, climate, prof)
    eval_std = evaluate_constraints(standard_mat, "Residential", bp, climate, prof)
    
    # Climate score for marine in dry zone should be penalized (35)
    assert eval_marine["constraint_breakdown"]["climate_compatibility"]["score"] == 35.0
    notes_text = eval_marine["constraint_breakdown"]["climate_compatibility"]["notes"].lower()
    assert "not required solely due to climate" in notes_text or "over-specification" in notes_text
    # Climate score for standard mix in dry zone should be 100
    assert eval_std["constraint_breakdown"]["climate_compatibility"]["score"] == 100.0


# ── TEST 5: Nuwara Eliya Highland Montane ────────────────────────────────────
def test_nuwara_eliya_highland():
    climate = get_climate_profile("Nuwara Eliya")
    assert "highland" in climate.get("type", "").lower()
    
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="High",
        budget_tier="Balanced",
        structural_system="Concrete Frame"
    )
    bp = {
        "building_type": "Residential",
        "num_floors": 2,
        "total_area": 160.0,
        "structural_system": "Concrete Frame"
    }
    rec = recommendation_engine.recommend_package(bp, "Nuwara Eliya", profile)
    
    assert rec["status"] == "success"
    assert "highland" in rec["climate_profile"]["type"].lower()
    pkg = rec["recommended_package"]
    assert "walling" in pkg
    assert "roofing" in pkg


# ── TEST 6: 5-floor / 16.8m² / 16m Height Anomaly Detection ──────────────────
def test_geometry_anomaly_review_required():
    anomaly_geom = {
        "floor_count": 5,
        "total_floor_area": 16.8,
        "building_height": 16.0,
        "roof_area": 4.4,
        "footprint_area": 3.36,
        "gross_wall_area": 117.6,
        "window_area": 1.2,
        "door_count": 2,
        "foundation_volume": 2.18
    }
    
    res = GeometryValidator.validate_geometry(anomaly_geom, "Residential")
    
    # Must flag REVIEW REQUIRED
    assert res["status"] == "REVIEW REQUIRED"
    assert len(res["issues"]) > 0
    # Must contain warning about physical plausibility / small footprint per floor
    issues_text = " ".join(res["issues"]).lower()
    assert "floor" in issues_text or "area" in issues_text or "roof" in issues_text


# ── TEST 7: Component Mismatch Prevention ─────────────────────────────────────
def test_component_mismatch_prevention():
    raw_mats = get_all_materials()
    materials = [format_material(m) for m in raw_mats]
    
    # Check that each material's Component is canonical
    for mat in materials:
        comp = mat.get("Component")
        assert comp in [
            "Foundation", "Structural Frame", "Reinforcement", "Walling",
            "Roofing", "Windows", "Doors", "Flooring", "Ceiling", "Finishes", "Waterproofing"
        ], f"Non-canonical component '{comp}' for material '{mat['Name']}'"
    
    # Run recommendation and ensure no cross-component contamination
    bp = {"building_type": "Residential", "num_floors": 1, "total_area": 100.0}
    prof = UserProfile(building_type="Residential")
    rec = recommendation_engine.recommend_package(bp, "Colombo", prof)
    pkg = rec["recommended_package"]
    
    assert pkg["reinforcement"]["component"] == "Reinforcement"
    assert pkg["foundation"]["component"] == "Foundation"
    assert pkg["walling"]["component"] == "Walling"
    assert pkg["roofing"]["component"] == "Roofing"
    assert pkg["waterproofing"]["component"] == "Waterproofing"
    
    # Membrane should not be in Structural Frame
    assert "membrane" not in pkg["structural_frame"]["name"].lower()
    # Rebar should not be in Walling
    assert "rebar" not in pkg["walling"]["name"].lower()


# ── TEST 8: Low ML Confidence (<40%) -> Engineering-Led Classification ───────
def test_low_ml_confidence_engineering_led():
    bp = {"building_type": "Residential", "num_floors": 1, "total_area": 90.0}
    prof = UserProfile(building_type="Residential")
    rec = recommendation_engine.recommend_package(bp, "Colombo", prof)
    
    pkg = rec["recommended_package"]
    for comp_name, item in pkg.items():
        if isinstance(item, dict) and "ml_confidence" in item:
            ml_conf = item["ml_confidence"]
            eng_val = item["engineering_validation"]
            if ml_conf is not None and (ml_conf < 40 or abs(eng_val - ml_conf) >= 20):
                assert item["classification"] == "ENGINEERING-LED RECOMMENDATION"
                assert item["disagreement_explanation"] is not None
                assert "deterministic engineering rules" in item["disagreement_explanation"].lower()


# ── TEST 9: Divergence Handling (|Eng - ML| >= 20) ────────────────────────────
def test_divergence_handling():
    bp = {"building_type": "Commercial", "num_floors": 4, "total_area": 500.0}
    prof = UserProfile(building_type="Commercial")
    rec = recommendation_engine.recommend_package(bp, "Colombo", prof)
    
    pkg = rec["recommended_package"]
    for comp_name, item in pkg.items():
        if isinstance(item, dict) and "engineering_validation" in item and "ml_confidence" in item:
            eng = item["engineering_validation"] or 0
            ml = item["ml_confidence"] or 0
            diff = abs(eng - ml)
            if diff >= 20:
                assert item["classification"] == "ENGINEERING-LED RECOMMENDATION"
                assert item["agreement"] in ["Medium", "Low"]


# ── TEST 10: Blueprint to Material Recommendation Context Transfer ───────────
def test_blueprint_context_transfer():
    # Simulate extraction from plan analyzer
    extracted_info = {
        "building_type": "Residential",
        "floor_count": 2,
        "total_floor_area": 170.0,
        "structural_system": "Concrete Frame",
        "location": "Kandy",
        "is_blueprint_derived": True
    }
    
    # Run quantities from extracted info
    quantities = MaterialQuantityEngine.calculate_quantities(
        building_type=extracted_info["building_type"],
        floor_count=extracted_info["floor_count"],
        total_floor_area=extracted_info["total_floor_area"],
        structural_system=extracted_info["structural_system"],
        location=extracted_info["location"],
        is_blueprint_derived=True
    )
    
    assert quantities["geometry_source"] == "Blueprint-extracted"
    assert quantities["validation_report"]["status"] == "PASS"
    assert quantities["gross_floor_area_m2"] == 170.0
    
    # Pass into recommendation pipeline
    bp = {
        "building_type": extracted_info["building_type"],
        "num_floors": extracted_info["floor_count"],
        "total_area": extracted_info["total_floor_area"],
        "structural_system": extracted_info["structural_system"],
        "is_blueprint_derived": True
    }
    prof = UserProfile(building_type=extracted_info["building_type"])
    rec = recommendation_engine.recommend_package(bp, extracted_info["location"], prof)
    
    assert rec["status"] == "success"
    assert rec["project_validation"]["blueprint_data"] == "Blueprint-extracted"
    assert rec["building_quantities"]["gross_floor_area_m2"] == 170.0
