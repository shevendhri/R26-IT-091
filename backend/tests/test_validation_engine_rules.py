"""
test_validation_engine_rules.py — Final Consistency Audit Test Suite (12 Validation Rules)
===========================================================================================
Comprehensive automated pytest suite testing all 12 mandatory validation rules for GreenConstructAI.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.recommendation_engine import recommendation_engine
from backend.questionnaire_engine import UserProfile
from backend.material_quantity_engine import MaterialQuantityEngine, MAX_OPENING_RATIO_BY_BUILDING_TYPE
from backend.geometry_validator import GeometryValidator
from backend.utils import calculate_hybrid_score
from backend.inference.explainability import compute_agreement_level
from backend.weather_engine import get_climate_profile
from backend.database import get_all_materials, format_material, validate_canonical_component, normalize_canonical_component


# ── TEST 1: Windows never return Doors ───────────────────────────────────────
def test_1_windows_never_return_doors():
    for location in ["Colombo", "Galle", "Jaffna", "Kandy", "Nuwara Eliya", "Trincomalee"]:
        for b_type in ["Residential", "Commercial", "Healthcare", "Industrial"]:
            profile = UserProfile(building_type=b_type)
            bp = {"building_type": b_type, "num_floors": 2, "total_area": 300.0}
            rec = recommendation_engine.recommend_package(bp, location, profile)
            window_mat = rec["recommended_package"]["windows"]
            assert "door" not in window_mat["name"].lower(), f"Window returned door in {location} ({b_type}): {window_mat['name']}"
            assert window_mat["component"] == "Windows"


# ── TEST 2: Doors never return Windows ───────────────────────────────────────
def test_2_doors_never_return_windows():
    for location in ["Colombo", "Galle", "Jaffna", "Kandy", "Nuwara Eliya", "Trincomalee"]:
        for b_type in ["Residential", "Commercial", "Healthcare", "Industrial"]:
            profile = UserProfile(building_type=b_type)
            bp = {"building_type": b_type, "num_floors": 2, "total_area": 300.0}
            rec = recommendation_engine.recommend_package(bp, location, profile)
            door_mat = rec["recommended_package"]["doors"]
            assert "window" not in door_mat["name"].lower(), f"Door returned window in {location} ({b_type}): {door_mat['name']}"
            assert "glazing" not in door_mat["name"].lower() or "door" in door_mat["name"].lower()
            assert door_mat["component"] == "Doors"


# ── TEST 3: Every recommendation has an exact canonical component match ─────
def test_3_every_recommendation_has_exact_canonical_component_match():
    canonical_slots = [
        "foundation", "structural_frame", "reinforcement", "walling", "roofing",
        "windows", "doors", "flooring", "ceiling", "finishes", "waterproofing"
    ]
    slot_to_expected = {
        "foundation": "Foundation",
        "structural_frame": "Structural Frame",
        "reinforcement": "Reinforcement",
        "walling": "Walling",
        "roofing": "Roofing",
        "windows": "Windows",
        "doors": "Doors",
        "flooring": "Flooring",
        "ceiling": "Ceiling",
        "finishes": "Finishes",
        "waterproofing": "Waterproofing"
    }
    profile = UserProfile(building_type="Residential", sustainability_pref="High")
    bp = {"building_type": "Residential", "num_floors": 3, "total_area": 500.0}
    rec = recommendation_engine.recommend_package(bp, "Colombo", profile)
    pkg = rec["recommended_package"]

    for slot in canonical_slots:
        item = pkg.get(slot)
        assert item is not None, f"Missing slot '{slot}' in recommendation package"
        expected = slot_to_expected[slot]
        assert item["component"] == expected, f"Slot '{slot}' returned component '{item['component']}', expected '{expected}'"


# ── TEST 4: No invalid catalog mapping can enter MCDM ranking ────────────────
def test_4_no_invalid_catalog_mapping_can_enter_mcdm_ranking():
    # Test FRP Door cannot match Windows slot
    frp_door = {"Name": "FRP Fiberglass Reinforced Door", "Component": "Doors", "Category": "Doors"}
    assert not validate_canonical_component(frp_door, "Windows")
    assert validate_canonical_component(frp_door, "Doors")

    # Test Window cannot match Doors slot
    dgu_window = {"Name": "Commercial Double-Glazed Unit (DGU Low-E)", "Component": "Windows", "Category": "Windows"}
    assert not validate_canonical_component(dgu_window, "Doors")
    assert validate_canonical_component(dgu_window, "Windows")

    # Test Rebar cannot match Structural Frame slot
    rebar = {"Name": "Epoxy-Coated Rebar (ASTM A775)", "Component": "Reinforcement", "Category": "Reinforcement"}
    assert not validate_canonical_component(rebar, "Structural Frame")
    assert validate_canonical_component(rebar, "Reinforcement")

    # Test Concrete cannot match Reinforcement slot
    concrete = {"Name": "Gr. 25 Standard Structural Concrete", "Component": "Structural Frame", "Category": "Structural Frame"}
    assert not validate_canonical_component(concrete, "Reinforcement")
    assert validate_canonical_component(concrete, "Structural Frame")


# ── TEST 5: Opening ratio never exceeds the building-type maximum ───────────
def test_5_opening_ratio_never_exceeds_building_type_maximum():
    for b_type, max_ratio in MAX_OPENING_RATIO_BY_BUILDING_TYPE.items():
        if b_type == "Default":
            continue
        quantities = MaterialQuantityEngine.calculate_quantities(
            building_type=b_type,
            floor_count=3,
            total_floor_area=6432.8
        )
        gross_wall = quantities["gross_wall_area_m2"]
        total_openings = quantities["window_area_m2"] + quantities["door_area_m2"]
        ratio = total_openings / gross_wall if gross_wall > 0 else 0.0
        assert ratio <= max_ratio + 0.005, f"Opening ratio {ratio:.3f} exceeded max {max_ratio} for {b_type}"


# ── TEST 6: Net wall area is never negative ──────────────────────────────────
def test_6_net_wall_area_is_never_negative():
    # Extreme inputs: small gross wall, massive openings
    quantities = MaterialQuantityEngine.calculate_quantities(
        building_type="Healthcare",
        floor_count=5,
        total_floor_area=10000.0,
        wall_area=200.0,
        window_area=800.0,
        door_area=400.0
    )
    assert quantities["net_wall_area_m2"] >= 0.0, f"Net wall area was negative: {quantities['net_wall_area_m2']}"


# ── TEST 7: Wall quantities scale plausibly with building area ───────────────
def test_7_wall_quantities_scale_plausibly_with_building_area():
    areas = [100.0, 500.0, 2000.0, 6432.8]
    previous_gross = 0.0
    previous_net = 0.0

    for a in areas:
        q = MaterialQuantityEngine.calculate_quantities(
            building_type="Commercial",
            floor_count=3,
            total_floor_area=a
        )
        gross = q["gross_wall_area_m2"]
        net = q["net_wall_area_m2"]
        assert gross > previous_gross, f"Gross wall area did not increase with area ({gross} <= {previous_gross})"
        assert net > previous_net, f"Net wall area did not increase with area ({net} <= {previous_net})"
        previous_gross = gross
        previous_net = net


# ── TEST 8: Low ML confidence always produces ENGINEERING-LED mode ───────────
def test_8_low_ml_confidence_always_produces_engineering_led():
    for low_conf in [5.0, 15.0, 25.0, 29.9]:
        agreement = compute_agreement_level(engineering_score=85.0, ml_recommendation_score=30.0, ml_confidence=low_conf)
        assert agreement["decision_mode"] == "ENGINEERING-LED RECOMMENDATION"
        assert agreement["engineering_led"] is True
        assert "low" in agreement["description"].lower() or "dominate" in agreement["description"].lower()


# ── TEST 9: High-confidence ML can contribute more weight ───────────────────
def test_9_high_confidence_ml_can_contribute():
    agreement_high = compute_agreement_level(engineering_score=85.0, ml_recommendation_score=82.0, ml_confidence=80.0)
    assert agreement_high["decision_mode"] == "HYBRID RECOMMENDATION"
    assert agreement_high["engineering_led"] is False

    # Verify score with high ML confidence is sensitive to ML score
    score_ml_high = calculate_hybrid_score(80.0, 95.0, ml_probability=90.0)
    score_ml_low = calculate_hybrid_score(80.0, 20.0, ml_probability=90.0)
    assert score_ml_high > score_ml_low, "Hybrid score should be higher when ML score is higher"


# ── TEST 10: Hybrid score always remains between 0 and 100 ──────────────────
def test_10_hybrid_score_always_between_0_and_100():
    test_cases = [
        (120.0, 150.0, 85.0),
        (-50.0, -20.0, 15.0),
        (90.0, 80.0, 45.0),
        (0.0, 0.0, 0.0),
        (100.0, 100.0, 100.0),
        (50.0, 50.0, None),
    ]
    for eng, ml, prob in test_cases:
        score = calculate_hybrid_score(eng, ml, ml_probability=prob)
        assert 0.0 <= score <= 100.0, f"Hybrid score {score} out of bounds for inputs ({eng}, {ml}, {prob})"


# ── TEST 11: Invalid or missing materials are handled gracefully ─────────────
def test_11_invalid_or_missing_materials_handled_gracefully():
    # Empty / None material validation
    assert not validate_canonical_component(None, "Windows")
    assert not validate_canonical_component({}, "Doors")
    assert not validate_canonical_component({"Name": "Corrupt Material"}, "InvalidSlot")

    # Non-existent location fallback
    climate = get_climate_profile("NonExistentCity")
    assert climate is not None
    assert "type" in climate


# ── TEST 12: Large healthcare buildings produce geometrically plausible preliminary quantities ──
def test_12_large_healthcare_building_geometrically_plausible_quantities():
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
    gross_wall = quantities["gross_wall_area_m2"]
    net_wall = quantities["net_wall_area_m2"]
    total_openings = quantities["window_area_m2"] + quantities["door_area_m2"]

    # Geometric plausibility checks
    assert abs(gross_wall - 1667.07) < 5.0, f"Gross wall area {gross_wall} deviates from geometric perimeter derivation"
    assert total_openings <= 0.605 * gross_wall, f"Openings ({total_openings}) exceeded 60% Healthcare max opening ratio"
    assert net_wall > 0, "Net wall area must be positive"
    assert net_wall >= 0.39 * gross_wall, f"Net wall area {net_wall} should be >= 40% of gross wall area ({gross_wall})"

    # Critical Windows vs Doors validation
    pkg = result["recommended_package"]
    window_mat = pkg["windows"]
    door_mat = pkg["doors"]

    assert window_mat["component"] == "Windows", f"Windows slot has component {window_mat['component']}"
    assert "door" not in window_mat["name"].lower(), f"Windows returned door material: {window_mat['name']}"
    assert door_mat["component"] == "Doors", f"Doors slot has component {door_mat['component']}"
    assert "window" not in door_mat["name"].lower(), f"Doors returned window material: {door_mat['name']}"
