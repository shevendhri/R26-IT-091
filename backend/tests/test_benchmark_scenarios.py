"""
test_benchmark_scenarios.py — GreenConstructAI Benchmark Test Scenarios (TC01 - TC05)
=====================================================================================
Structured test cases to validate system performance across diverse climates, scales,
building typologies, and boundary conditions.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.recommendation_engine import recommendation_engine
from backend.questionnaire_engine import UserProfile
from backend.material_quantity_engine import MaterialQuantityEngine
from backend.geometry_validator import GeometryValidator


# ── TC01: Residential Anuradhapura Dry Zone ──────────────────────────────────
def test_tc01_anuradhapura_dry_zone():
    """
    TC01: Residential, Anuradhapura, Dry Zone, ~264.5 m², 3 Floors.
    Expectation: Prioritize thermal performance, durability, and dry/hot climate suitability.
    """
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="Medium",
        budget_tier="Balanced",
        structural_system="Concrete Frame"
    )
    blueprint = {
        "building_type": "Residential",
        "num_floors": 3,
        "total_area": 264.5,
        "structural_system": "Concrete Frame"
    }

    result = recommendation_engine.recommend_package(blueprint, "Anuradhapura", profile)

    assert result["status"] == "success"
    climate = result["climate_profile"]
    assert climate["city"] == "Anuradhapura"
    assert "dry" in climate["type"].lower()

    pkg = result["recommended_package"]
    assert "walling" in pkg
    walling = pkg["walling"]
    
    # Assert thermal performance & engineering metrics recorded
    assert walling["engineering_validation"] > 0
    assert walling["hybrid_score"] >= 0 and walling["hybrid_score"] <= 100
    assert "decision_mode" in walling
    assert walling["quantity_status"] in ["PASS", "WARNING"]

    # Record telemetry record
    record = {
        "tc": "TC01",
        "location": "Anuradhapura",
        "validation_status": result["project_validation"]["status"],
        "walling_material": walling["name"],
        "eng_score": walling["engineering_validation"],
        "ml_confidence": walling["ml_confidence"],
        "hybrid_score": walling["hybrid_score"],
        "decision_mode": walling["decision_mode"],
        "quantity_status": walling["quantity_status"]
    }
    assert record["validation_status"] == "PASS"


# ── TC02: Residential Jaffna Extreme Coastal Saline ───────────────────────────
def test_tc02_jaffna_extreme_coastal():
    """
    TC02: Residential, Jaffna, Extreme Coastal Saline, ~142.6 m², 3 Floors.
    Expectation: High corrosion resistance, moisture resistance, and coastal durability suitability.
    """
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="High",
        budget_tier="Balanced",
        structural_system="Concrete Frame"
    )
    blueprint = {
        "building_type": "Residential",
        "num_floors": 3,
        "total_area": 142.6,
        "structural_system": "Concrete Frame"
    }

    result = recommendation_engine.recommend_package(blueprint, "Jaffna", profile)

    assert result["status"] == "success"
    climate = result["climate_profile"]
    assert climate["city"] == "Jaffna"
    assert climate["salinity"].lower() in ["high", "extreme"] or climate["distance_km"] < 5.0

    pkg = result["recommended_package"]
    foundation = pkg["foundation"]
    
    # Foundation must have high corrosion resistance / engineering validation
    assert foundation["engineering_validation"] >= 60.0
    assert foundation["hybrid_score"] >= 0 and foundation["hybrid_score"] <= 100
    assert "decision_mode" in foundation
    assert foundation["quantity_status"] in ["PASS", "WARNING"]


# ── TC03: Healthcare Galle Moderate Coastal Humid (Large Geometry) ────────────
def test_tc03_galle_healthcare_large_geometry():
    """
    TC03: Healthcare, Galle, Moderate Coastal Humid, ~6432.8 m², 3 Floors.
    Expectation: Handle large geometry, apply opening ratio sanity limits (max 60%),
    validate quantities, prevent cross-component material misclassification.
    """
    profile = UserProfile(
        building_type="Healthcare",
        sustainability_pref="High",
        budget_tier="Premium",
        structural_system="Concrete Frame"
    )
    blueprint = {
        "building_type": "Healthcare",
        "num_floors": 3,
        "total_area": 6432.8,
        "structural_system": "Concrete Frame"
    }

    result = recommendation_engine.recommend_package(blueprint, "Galle", profile)

    assert result["status"] == "success"
    quantities = result["building_quantities"]
    
    # Opening area sanity check: opening ratio must not exceed 60% (Healthcare limit)
    gross_wall = quantities["gross_wall_area_m2"]
    net_wall = quantities["net_wall_area_m2"]
    total_openings = quantities["window_area_m2"] + quantities["door_area_m2"]
    
    opening_ratio = total_openings / gross_wall
    assert opening_ratio <= 0.605, f"Opening ratio {opening_ratio:.2f} exceeds 60% Healthcare max limit!"
    assert net_wall > 0, "Net wall area must remain strictly positive!"

    pkg = result["recommended_package"]
    # Ensure Windows recommendation returns a window, not a door
    window_item = pkg["windows"]
    door_item = pkg["doors"]
    
    assert "door" not in window_item["name"].lower(), "Window recommendation returned a door!"
    assert "window" not in door_item["name"].lower(), "Door recommendation returned a window!"
    assert window_item["component"] == "Windows"
    assert door_item["component"] == "Doors"


# ── TC04: Residential Small-Scale Building ───────────────────────────────────
def test_tc04_small_scale_residential():
    """
    TC04: Residential small-scale building (~80–120 m²).
    Expectation: Small geometry handled correctly with positive net wall area and correct takeoffs.
    """
    profile = UserProfile(
        building_type="Residential",
        sustainability_pref="Low",
        budget_tier="Economy",
        structural_system="Concrete Frame"
    )
    blueprint = {
        "building_type": "Residential",
        "num_floors": 1,
        "total_area": 95.0,
        "structural_system": "Concrete Frame"
    }

    result = recommendation_engine.recommend_package(blueprint, "Colombo", profile)

    assert result["status"] == "success"
    quantities = result["building_quantities"]
    assert quantities["total_floor_area_m2"] == 95.0
    assert quantities["footprint_area_m2"] == 95.0
    assert quantities["net_wall_area_m2"] > 0
    
    pkg = result["recommended_package"]
    assert pkg["walling"]["quantity"] > 0
    assert pkg["flooring"]["quantity"] > 0


# ── TC05: Invalid or Extreme Input Handling ─────────────────────────────────
def test_tc05_invalid_or_extreme_inputs():
    """
    TC05: Invalid or extreme input handling (zero area, negative area, missing location, extreme floor count).
    Expectation: Geometry validation catches invalid parameters and returns warnings/errors gracefully.
    """
    # Case A: Zero / Negative total area
    v_report_zero = GeometryValidator.validate_geometry(total_floor_area=0.0, number_of_floors=1)
    assert v_report_zero["geometry"]["total_floor_area"]["value"] >= 1.0

    # Case B: Extreme floor count vs small area
    v_report_extreme = GeometryValidator.validate_geometry(total_floor_area=50.0, number_of_floors=25)
    assert v_report_extreme["status"] == "REVIEW REQUIRED"
    assert len(v_report_extreme["issues"]) > 0

    # Case C: Recommendation pipeline fallback on missing/unsupported inputs
    profile = UserProfile(building_type="UnknownType", sustainability_pref="Medium")
    blueprint = {"building_type": "UnknownType", "num_floors": 100, "total_area": -50.0}

    result = recommendation_engine.recommend_package(blueprint, "UnknownCity", profile)
    assert result["status"] == "success"
    assert "project_validation" in result
    assert result["building_quantities"]["total_floor_area_m2"] >= 1.0
