# backend/engines/engineering_rule_engine.py
"""Engineering Rule Engine for GreenConstructAI.

Evaluates every candidate material against Sri Lankan engineering practice
using the approved priority order:

    1. Structural Safety
    2. SLS Compliance
    3. Climate Compatibility
    4. Building Type Compatibility
    5. Number of Floors
    6. Structural System Compatibility
    7. User Priorities
    8. Sustainability
    9. Budget Compatibility

The engine reads material metadata from `backend/config/material_profiles.json`
and from the constraint engine (database compatibility tables).  It returns
a tuple compatible with the existing MCDM interface so that the
recommendation engine can drop it in as a replacement without breaking the
API contract.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Tuple

# ---------------------------------------------------------------------------
# Load material profiles once at module level
# ---------------------------------------------------------------------------
_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'material_profiles.json')

def _load_profiles() -> Dict[str, Any]:
    """Load material profiles JSON.  Returns a dict keyed by material name."""
    try:
        with open(_CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[EngineeringRuleEngine] WARNING – could not load profiles: {e}")
        return {}

_profiles: Dict[str, Any] = _load_profiles()

# ---------------------------------------------------------------------------
# Availability & local‑preference scoring tables (from plan §4)
# ---------------------------------------------------------------------------
_AVAILABILITY_BONUS = {
    "Very High": 8,
    "High":      5,
    "Medium":    2,
    "Low":      -10,
    "Very Low": -15,
}

_LOCAL_PREF_BONUS = {
    5:  5,
    4:  4,
    3:  2,
    2: -2,
    1: -5,
}


# ---------------------------------------------------------------------------
# Floor range helper
# ---------------------------------------------------------------------------
def _floor_range_ok(floor_range: List[str], num_floors: int) -> bool:
    """Check whether *num_floors* falls within the material's allowed range."""
    if not floor_range:
        return True  # no constraint means allowed anywhere
    for rng in floor_range:
        rng = rng.strip()
        if rng == "1-2" and 1 <= num_floors <= 2:
            return True
        if rng == "3-5" and 3 <= num_floors <= 5:
            return True
        if rng == "6+" and num_floors >= 6:
            return True
    return False


# ---------------------------------------------------------------------------
# Climate normalisation helper
# ---------------------------------------------------------------------------
_CLIMATE_ALIASES = {
    "wet zone":           "wet",
    "dry zone":           "dry",
    "intermediate zone":  "intermediate",
    "extreme coastal":    "extreme coastal",
    "moderate coastal":   "coastal",
    "coastal":            "coastal",
    "highland":           "highland",
    "urban":              "intermediate",
}

def _normalise_climate(climate_type: str) -> str:
    """Map the weather‑engine's verbose climate type to a short key."""
    lower = climate_type.strip().lower()
    return _CLIMATE_ALIASES.get(lower, lower)


# ===================================================================
# PUBLIC API
# ===================================================================

def evaluate_material(
    material: Dict[str, Any],
    climate: Dict[str, Any],
    building_type: str,
    num_floors: int,
    profile: Any,
    *,
    structural_system: str = "RC Frame",
) -> Tuple[float, List[str], bool, Dict[str, Any], float, float]:
    """Score a material against engineering rules.

    Returns
    -------
    (eng_score, reasons, is_vetoed, criterion_breakdown,
     engineering_confidence, climate_confidence)

    Fully compatible with the ``mcdm_engine.evaluate_material`` signature
    so it can be used as a drop‑in replacement.
    """
    name = material.get("Name", "")
    category = material.get("Category", "")
    mat_id = material.get("Material_ID")
    profile_data = _profiles.get(name, {})

    # ── 1. Delegate to legacy constraint engine for DB‑level checks ───────
    from backend.constraint_engine import evaluate_constraints
    constraints = evaluate_constraints(
        material=material,
        blueprint={"building_type": building_type, "floors": num_floors},
        climate_profile=climate,
        user_profile=profile,
    )

    # ── 2. Prepare rule trace ─────────────────────────────────────────────
    rule_trace: List[Dict[str, Any]] = []
    reasons: List[str] = []
    is_vetoed = constraints.get("veto", False)

    total_rules = 0
    passed_rules = 0

    # Helper to record a rule evaluation
    def _check(rule_name: str, passed: bool, detail: str = "") -> bool:
        nonlocal total_rules, passed_rules
        total_rules += 1
        if passed:
            passed_rules += 1
        rule_trace.append({
            "rule": rule_name,
            "passed": passed,
            "detail": detail,
        })
        if not passed:
            reasons.append(f"{rule_name}: {detail}" if detail else rule_name)
        return passed

    # ── Rule 1: Structural Safety ─────────────────────────────────────────
    struct_cap = float(material.get("Structural_Capacity", 0))
    if category in ("Foundation", "Structural", "Concrete", "Walling"):
        struct_ok = struct_cap >= 40
        _check(
            "Structural Safety",
            struct_ok,
            f"Structural Capacity {struct_cap}/100 {'≥' if struct_ok else '<'} 40 (minimum for load‑bearing elements)"
        )
        if not struct_ok and category in ("Foundation", "Structural"):
            is_vetoed = True
    else:
        _check("Structural Safety", True, "Non‑structural category – rule not applicable")

    # ── Rule 2: SLS Compliance ────────────────────────────────────────────
    sls_flag = profile_data.get("sls_compliant", True)
    _check(
        "SLS Compliance",
        sls_flag,
        "Material meets SLS standard requirements" if sls_flag else "Material does NOT meet SLS standards"
    )
    if not sls_flag and category in ("Foundation", "Structural", "Concrete"):
        is_vetoed = True

    # ── Rule 3: Climate Compatibility ─────────────────────────────────────
    project_climate = _normalise_climate(climate.get("type", "intermediate"))
    mat_climates = [c.strip().lower() for c in profile_data.get("climate", [])]
    climate_ok = (not mat_climates) or (project_climate in mat_climates) or ("all" in mat_climates)

    # Also treat "extreme coastal" ⊂ "coastal"
    if not climate_ok and project_climate == "extreme coastal" and "coastal" in mat_climates:
        climate_ok = True

    _check(
        "Climate Compatibility",
        climate_ok,
        f"Project climate '{project_climate}' {'∈' if climate_ok else '∉'} material climates {mat_climates}"
    )

    # ── Rule 4: Building Type Compatibility ───────────────────────────────
    bt_lower = building_type.strip().lower()
    # Use DB compatibility table result
    building_ok = constraints.get("allowed", True)
    _check(
        "Building Type Compatibility",
        building_ok,
        f"Building type '{bt_lower}' is {'compatible' if building_ok else 'incompatible'} per metadata"
    )

    # ── Rule 5: Number of Floors ──────────────────────────────────────────
    floor_range = profile_data.get("floor_range", [])
    floors_ok = _floor_range_ok(floor_range, num_floors)
    _check(
        "Floor Count Suitability",
        floors_ok,
        f"{num_floors} floors {'within' if floors_ok else 'outside'} range {floor_range}"
    )

    # ── Rule 6: Structural System Compatibility ───────────────────────────
    mat_systems = [s.lower() for s in profile_data.get("structural_systems", [])]
    sys_lower = structural_system.strip().lower()
    system_ok = (not mat_systems) or (sys_lower in mat_systems) or ("load bearing" in mat_systems and sys_lower in ("rc frame", "load bearing"))
    _check(
        "Structural System Compatibility",
        system_ok,
        f"System '{sys_lower}' {'∈' if system_ok else '∉'} material systems {mat_systems}"
    )

    # ── Rule 7: Marine‑grade check ────────────────────────────────────────
    from backend.utils import is_marine_needed
    marine_needed = is_marine_needed(
        climate.get("salinity", "Low"),
        climate.get("distance_km", 999.0),
    )
    corrosion_res = float(material.get("Corrosion_Resistance", 50))
    is_marine_mat = corrosion_res >= 90

    if marine_needed:
        # In marine zones, high corrosion resistance is beneficial
        _check("Marine Grade Requirement", True, "Marine zone – material assessed for corrosion protection")
    elif is_marine_mat:
        # Over‑specifying marine grade in non‑marine zones
        _check(
            "Marine Grade Necessity",
            False,
            "Marine‑grade material specified in low‑salinity/inland zone – over‑specification"
        )
    else:
        _check("Marine Grade Necessity", True, "Appropriate specification level for exposure zone")

    # ── Compute weighted engineering score (0‑100) ────────────────────────
    # Base score from legacy MCDM weighted criteria
    criteria_weights = {
        "structural":     25,
        "climate":        20,
        "durability":     15,
        "service_life":   10,
        "fire":           10,
        "thermal":        10,
        "maintenance":     5,
        "sustainability":  5,
    }

    structural_score = 100.0 if category.lower() in ("structural", "foundation") else float(material.get("Structural_Capacity", 50))
    climate_score = 100.0 if climate_ok else 0.0
    durability_score = max(0, min(100, (float(material.get("Structural_Capacity", 50)) + min(100, float(material.get("Service_Life", 30)) * 1.5)) / 2))
    service_life_score = max(0, min(100, float(material.get("Service_Life", 30)) * 2))
    fire_score = float(material.get("Fire_Rating", material.get("Fire_Resistance", 50)))
    thermal_score = float(material.get("Thermal_Rating", material.get("Thermal_Performance_Rating", 50)))
    maintenance_score = max(0, min(100, 100 - float(material.get("Maintenance_Level", 50))))
    sustainability_score = float(material.get("Sustainability_Rating", 50))

    weighted_sum = (
        criteria_weights["structural"]     * structural_score +
        criteria_weights["climate"]        * climate_score +
        criteria_weights["durability"]     * durability_score +
        criteria_weights["service_life"]   * service_life_score +
        criteria_weights["fire"]           * fire_score +
        criteria_weights["thermal"]        * thermal_score +
        criteria_weights["maintenance"]    * maintenance_score +
        criteria_weights["sustainability"] * sustainability_score
    ) / 100.0

    criterion_breakdown = {
        k: {
            "score": round(locals()[f"{k}_score"] * criteria_weights[k] / 100, 2),
            "max": criteria_weights[k],
        }
        for k in criteria_weights
    }

    # ── Apply bonuses / penalties from plan §4 ────────────────────────────
    avail = profile_data.get("availability", "Medium")
    avail_bonus = _AVAILABILITY_BONUS.get(avail, 0)

    pref_stars = profile_data.get("local_preference_stars", 3)
    pref_bonus = _LOCAL_PREF_BONUS.get(pref_stars, 0)

    # Constraint penalty from legacy engine
    constraint_penalty = constraints.get("score_modifier", 0) if not constraints.get("allowed", True) else 0

    eng_score = weighted_sum + avail_bonus + pref_bonus - constraint_penalty
    eng_score = max(0.0, min(100.0, eng_score))

    if is_vetoed:
        eng_score = 0.0

    # ── Confidence metrics ────────────────────────────────────────────────
    from backend.utils import engineering_confidence as _eng_conf_fn, climate_confidence as _clim_conf_fn
    eng_conf = _eng_conf_fn(passed_rules, total_rules) if total_rules > 0 else 100.0
    clim_conf = _clim_conf_fn(material, climate)

    # Attach rule trace to breakdown for XAI
    criterion_breakdown["_rule_trace"] = rule_trace
    criterion_breakdown["_availability_bonus"] = avail_bonus
    criterion_breakdown["_local_pref_bonus"] = pref_bonus
    criterion_breakdown["_constraint_penalty"] = constraint_penalty

    return eng_score, reasons, is_vetoed, criterion_breakdown, eng_conf, clim_conf
