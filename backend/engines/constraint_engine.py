# backend/engines/constraint_engine.py
"""Engineering Constraint Engine - Engineering Decision Support System (EDSS).

Evaluates materials against deterministic engineering rules and computes a
realistically varying, weighted engineering score based on 9 specific criteria.
Handles weight redistribution (normalization) for non-applicable criteria (e.g.
structural safety for paint).
"""

import os
import json
import sqlite3
import pathlib
from typing import Dict, Any, Tuple, List

from .weight_config import WEIGHTS, HYBRID_ENGINEERING_WEIGHT, HYBRID_ML_WEIGHT

DB_PATH = pathlib.Path(r"C:/Users/ASUS/Desktop/Material specification/backend/data/materials.db")
_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'material_profiles.json')

def _load_profiles() -> Dict[str, Any]:
    try:
        with open(_CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ConstraintEngine] WARNING – could not load profiles: {e}")
        return {}

_profiles = _load_profiles()

def _load_material_compatibility(material_id: int) -> Dict[str, List[str]]:
    """Fetch building and climate compatibility lists for a material from the database."""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cur = conn.cursor()
        cur.execute(
            "SELECT building_type FROM MaterialBuildingCompatibility WHERE material_id = ?",
            (material_id,)
        )
        building = [row[0].lower().strip() for row in cur.fetchall()]
        cur.execute(
            "SELECT climate_zone FROM MaterialClimateCompatibility WHERE material_id = ?",
            (material_id,)
        )
        climate = [row[0].lower().strip() for row in cur.fetchall()]
        conn.close()
        return {"building": building, "climate": climate}
    except Exception:
        return {"building": [], "climate": []}

def evaluate_material(material: Dict[str, Any], occupancy: str, blueprint: Dict[str, Any]) -> Tuple[float, str, str, str]:
    """Legacy helper compatibility wrapper."""
    res = evaluate_constraints(material, occupancy, blueprint)
    status = "Pass" if res["passed"] else "Fail"
    checks_desc = "; ".join([c["message"] for c in res["validation_checks"]])
    return res["engineering_score"], status, checks_desc, res["reason_code"]

def evaluate_constraints(
    material: Dict[str, Any],
    occupancy: str,
    blueprint: Dict[str, Any],
    climate: Dict[str, Any] = None,
    profile: Any = None,
) -> Dict[str, Any]:
    """Evaluate engineering constraints and calculate weighted, normalized criteria scores.

    Parameters
    ----------
    material: dict
        The material attributes dict.
    occupancy: str
        The building occupancy category (e.g. "Residential").
    blueprint: dict
        Blueprint parameters containing "floors", "structural_system", "total_area", etc.
    climate: dict, optional
        Climate profile containing "type", "salinity", "distance_km", "humidity", "rainfall".
    profile: UserProfile, optional
        The user preferences profile containing "budget_tier", "sustainability_pref", etc.

    Returns
    -------
    dict with keys:
        - engineering_score: float (0‑100)
        - passed: bool indicating overall Pass/Fail
        - validation_checks: list of dicts with rule, status, message
        - rejection_reasons: list of messages for failed rules
        - constraint_breakdown: detailed weight contributions per engineering criterion
        - reason_code: short identifier for debugging
    """
    category = material.get("Category", "").title()
    material_id = material.get("Material_ID")
    name = material.get("Name", "")
    profile_data = _profiles.get(name, {})

    # Defaults for climate and profile
    if climate is None:
        climate = {
            "type": "Intermediate",
            "salinity": "Low",
            "distance_km": 999.0,
            "humidity": "70%",
            "rainfall": "1500mm",
        }
    if profile is None:
        budget_tier = "Balanced"
        sustainability_pref = "Medium"
        maintenance_pref = "Medium"
    else:
        budget_tier = getattr(profile, "budget_tier", "Balanced")
        sustainability_pref = getattr(profile, "sustainability_pref", "Medium")
        maintenance_pref = getattr(profile, "maintenance_pref", "Medium")

    num_floors = int(blueprint.get("floors", blueprint.get("num_floors", 1)))

    validation_checks = []
    rejection_reasons = []
    veto = False
    reason_codes = []

    # Fetch DB compatibility
    db_compat = {"building": [], "climate": []}
    if material_id is not None:
        db_compat = _load_material_compatibility(material_id)

    # 1. Structural Safety (Weight: 25)
    # Check structural compatibility. Structural categories require structural capacity.
    is_structural = category in ("Foundation", "Structural", "Concrete", "Walling")
    structural_safety_score = None
    if is_structural:
        cap = float(material.get("Structural_Capacity", 60))
        # Structural capacity adequacy evaluated relative to building height / floor count
        if num_floors <= 2:
            structural_safety_score = min(100.0, cap * 1.35) if cap >= 50 else cap
        elif num_floors <= 5:
            structural_safety_score = min(100.0, cap * 1.15) if cap >= 65 else cap
        else:
            structural_safety_score = cap
        struct_ok = cap >= 40
        if not struct_ok:
            rejection_reasons.append(f"FAIL: Structural capacity ({cap}/100) falls below required safety limit of 40")
            reason_codes.append("STRUCT_VETO")
            if category in ("Foundation", "Structural"):
                veto = True
            validation_checks.append({"rule": "Structural Safety", "status": False, "message": f"Structural capacity {cap}/100 is below minimum safety limit"})
        else:
            validation_checks.append({"rule": "Structural Safety", "status": True, "message": f"Structural capacity {cap}/100 verified"})
    else:
        # Non-structural materials are Not Applicable for structural safety.
        validation_checks.append({"rule": "Structural Safety", "status": True, "message": "Not Applicable (Weight redistributed)"})

    # 2. SLS-Referenced Rule Check (Weight: 20)
    sls_flag = profile_data.get("sls_compliant", True)
    sls_compliance_score = 100.0 if sls_flag else 0.0
    if not sls_flag:
        rejection_reasons.append("FAIL: Material does not meet SLS-referenced engineering rule thresholds")
        reason_codes.append("SLS_VETO")
        if category in ("Foundation", "Structural", "Concrete"):
            veto = True
        validation_checks.append({"rule": "SLS-Referenced Rule Check", "status": False, "message": "Non-compliant with SLS-referenced engineering thresholds"})
    else:
        validation_checks.append({"rule": "SLS-Referenced Rule Check", "status": True, "message": "Verified SLS-Referenced Rule Check"})

    # 3. Climate Compatibility (Weight: 15)
    project_climate = climate.get("type", "intermediate").lower().strip()
    climate_aliases = [
        ("extreme coastal", "extreme coastal"),
        ("moderate coastal", "coastal"),
        ("coastal", "coastal"),
        ("highland", "highland"),
        ("montane", "highland"),
        ("dry zone", "dry"),
        ("dry", "dry"),
        ("wet zone", "wet"),
        ("wet", "wet"),
        ("intermediate", "intermediate"),
        ("urban", "intermediate")
    ]
    mapped_climate = project_climate
    for k, v in climate_aliases:
        if k in project_climate:
            mapped_climate = v
            break

    suitable_str = material.get("Suitable_Climates", "")
    suitable_list = [c.strip().lower() for c in suitable_str.split(",")] if suitable_str else []
    
    # Union of DB compat and CSV text compat list
    allowed_climates = list(set(suitable_list + db_compat["climate"]))

    from ..utils import is_marine_needed
    marine_needed = is_marine_needed(
        climate.get("salinity", "Low"),
        climate.get("distance_km", 999.0),
    )
    corrosion_res = float(material.get("Corrosion_Resistance", 50))
    is_marine_mat = corrosion_res >= 90 or "marine" in name.lower() or "epoxy" in name.lower()

    salinity_val = str(climate.get("salinity", "Low")).lower() if climate else "low"
    dist_val = float(climate.get("distance_km", 999.0)) if climate else 999.0

    # Range-based Climate Compatibility scoring
    if not allowed_climates or "all" in allowed_climates or mapped_climate in allowed_climates:
        if marine_needed or salinity_val in ("extreme", "high") or dist_val <= 5.0:
            climate_score = 100.0 if is_marine_mat else 55.0  # Marine zone: marine-grade gets full positive advantage
        elif salinity_val == "moderate" or dist_val <= 15.0:
            climate_score = 90.0 if is_marine_mat else 85.0   # Moderate coastal: both eligible, slight marine edge
        else:
            # Low / inland salinity: standard materials get full preference (100); marine-grade over-specification score (35)
            if is_marine_mat:
                climate_score = 35.0
                rejection_reasons.append("Marine-grade specification is not required solely due to climate. It is retained only if corrosion exposure or project-specific requirements justify the additional specification.")
            else:
                climate_score = 100.0
    elif mapped_climate == "extreme coastal" and "coastal" in allowed_climates:
        climate_score = 90.0 if is_marine_mat else 50.0
    else:
        # Purely coastal materials in inland zone remain eligible with over-specification rating
        if is_marine_mat and salinity_val == "low":
            climate_score = 35.0
            rejection_reasons.append("Marine-grade specification is not required solely due to climate. It is retained only if corrosion exposure or project-specific requirements justify the additional specification.")
        else:
            climate_score = 20.0  # Unsuitable

    # Moisture adjustment under high humidity
    hum_str = str(climate.get("humidity", "70%")).replace("%", "")
    try:
        humidity_val = float(hum_str)
    except ValueError:
        humidity_val = 70.0

    moisture_res = float(material.get("Moisture_Resistance", 60))
    if humidity_val >= 80 and moisture_res < 65:
        climate_score = min(climate_score, 75.0)  # capped at Acceptable

    if climate_score < 50:
        rejection_reasons.append(f"FAIL: Unsuitable climate profile (Zone: {project_climate})")
        reason_codes.append("CLIMATE_MISMATCH")
    
    climate_status_label = "Optimal" if climate_score == 100.0 else "Good" if climate_score >= 90.0 else "Acceptable" if climate_score >= 75.0 else "Marginal" if climate_score >= 50.0 else "Over-specified / Unsuitable"
    validation_checks.append({"rule": "Climate Compatibility", "status": climate_score >= 50, "message": f"{climate_status_label} climate compatibility verified"})

    # 4. Occupancy Suitability (Weight: 15)
    sectors_str = material.get("Building_Sectors", "")
    sectors_list = [s.strip().lower() for s in sectors_str.split(",")] if sectors_str else []
    allowed_sectors = list(set(sectors_list + db_compat["building"]))
    project_occ = occupancy.lower().strip()

    is_sector_ok = (not allowed_sectors) or (project_occ in allowed_sectors) or ("all" in allowed_sectors)
    base_occ_score = 100.0 if is_sector_ok else 40.0

    # Multi-attribute engineering assessment
    deductions = 0

    # Height suitability
    floor_range_str = material.get("Floor_Count_Range", "")
    floor_ranges = [r.strip() for r in floor_range_str.split(",")] if floor_range_str else []
    floors_ok = False
    if not floor_ranges:
        floors_ok = True
    else:
        for rng in floor_ranges:
            if rng == "1-2" and 1 <= num_floors <= 2:
                floors_ok = True
            elif rng == "3-5" and 3 <= num_floors <= 5:
                floors_ok = True
            elif rng == "6+" and num_floors >= 6:
                floors_ok = True

    if not floors_ok:
        deductions += 20
        rejection_reasons.append(
            f"FAIL: Material floor-range specification ({floor_range_str}) does not cover "
            f"the required {num_floors}-storey building height"
        )

    # Fire resistance requirements – uses derived Fire_Resistance field from format_material()
    fire_res = float(material.get("Fire_Resistance", 60))
    high_fire_occ = {"apartment", "commercial", "hotel", "school", "healthcare"}
    if project_occ in high_fire_occ:
        if fire_res < 60:
            deductions += 20
            rejection_reasons.append(
                f"FAIL: Fire resistance ({fire_res}/100) is insufficient for "
                f"{project_occ} occupancy — minimum 60/100 required per SLS fire code"
            )
        elif fire_res < 75:
            deductions += 8

    # Hygiene / Moisture requirements for healthcare/schools/hotels
    if project_occ in ("healthcare", "school", "hotel"):
        if moisture_res < 60:
            deductions += 15
            rejection_reasons.append(
                f"FAIL: Moisture resistance ({moisture_res}/100) below minimum of 60/100 "
                f"required for {project_occ} occupancy"
            )

    # Traffic density / Durability requirements
    structural_capacity = float(material.get("Structural_Capacity", 50))
    if project_occ in ("commercial", "school", "hotel", "healthcare"):
        if structural_capacity < 70:
            deductions += 15
            rejection_reasons.append(
                f"FAIL: Structural capacity ({structural_capacity}/100) insufficient for "
                f"high-traffic {project_occ} occupancy — minimum 70/100 required"
            )

    occupancy_score = max(10.0, min(100.0, base_occ_score - deductions))

    if occupancy_score < 50:
        reason_codes.append("OCCUPANCY_MISMATCH")

    occ_label = "Pass" if occupancy_score >= 50 else "Fail"
    validation_checks.append({"rule": "Occupancy Suitability", "status": occupancy_score >= 50,
                              "message": f"[{occ_label}] Occupancy suitability score: {occupancy_score:.0f}/100 for {project_occ}"})

    # ── Coastal zone hard veto for materials known to fail in saline environments ──
    salinity_str = climate.get("salinity", "Low").lower() if climate else "low"
    is_extreme_coastal = (salinity_str in ("extreme", "high") or
                          "extreme coastal" in climate.get("type", "").lower() if climate else False)
    mat_name_lc = name.lower()
    if is_extreme_coastal:
        if "gypsum" in mat_name_lc and category == "Ceiling":
            veto = True
            rejection_reasons.append(
                "VETO: Standard gypsum board is not suitable for extreme coastal / saline "
                "environments — moisture absorption causes rapid structural failure"
            )
            reason_codes.append("COASTAL_MATERIAL_VETO")
        if any(k in mat_name_lc for k in ["louvre", "timber louvre"]) and category in ("Windows", "Doors"):
            veto = True
            rejection_reasons.append(
                "VETO: Timber louvre window/door is not suitable for extreme coastal saline "
                "zones — untreated hardwood degrades rapidly under salt-spray conditions"
            )
            reason_codes.append("COASTAL_MATERIAL_VETO")

    # 5. Structural System Compatibility (Weight: 10)
    structural_system = blueprint.get("structural_system", "Concrete Frame")
    sys_lower = structural_system.lower().strip()
    
    # Read compatibility directly from the DB field we added
    mat_compat = material.get("Structural_System_Compatibility", "All").lower()
    
    system_ok = True
    if is_structural and mat_compat != "all":
        if sys_lower not in mat_compat:
            system_ok = False
            
    system_score = 100.0 if system_ok else 0.0

    if not system_ok:
        rejection_reasons.append(f"VETO: Material ({material.get('Name')}) is incompatible with project structural system ({structural_system})")
        reason_codes.append("SYSTEM_INCOMPATIBLE")
        veto = True

    validation_checks.append({"rule": "Structural System Compatibility", "status": system_ok, "message": f"{'Compatible' if system_ok else 'Incompatible'} with {structural_system}"})


    # 6. Service Life (Weight: 5)
    sl = int(material.get("Service_Life", 30))
    if sl > 100:
        service_life_score = 100.0
    elif sl >= 75:
        service_life_score = 95.0
    elif sl >= 50:
        service_life_score = 85.0
    elif sl >= 30:
        service_life_score = 70.0
    elif sl >= 15:
        service_life_score = 55.0
    else:
        service_life_score = 40.0
    validation_checks.append({"rule": "Service Life", "status": True, "message": f"Service life rating: {sl} Years"})

    # 7. Maintenance (Weight: 5)
    ml = float(material.get("Maintenance_Level", 50))
    if ml <= 20:
        maintenance_score = 100.0
    elif ml <= 40:
        maintenance_score = 90.0
    elif ml <= 60:
        maintenance_score = 75.0
    elif ml <= 80:
        maintenance_score = 60.0
    else:
        maintenance_score = 40.0
    validation_checks.append({"rule": "Maintenance Level", "status": True, "message": f"Maintenance score: {maintenance_score:.0f}/100"})

    # 8. Sustainability
    sustainability_rating = float(material.get("Sustainability_Rating", 50))
    recyclability_rating = float(material.get("Recyclability_Rating", 50))
    ec = float(material.get("Embodied_Carbon", 0.35))
    
    if ec <= 0.15:
        carbon_score = 100.0
    elif ec <= 0.30:
        carbon_score = 90.0
    elif ec <= 0.60:
        carbon_score = 80.0
    elif ec <= 1.50:
        carbon_score = 65.0
    elif ec <= 5.00:
        carbon_score = 45.0
    else:
        carbon_score = 25.0

    sustainability_score = (sustainability_rating + recyclability_rating + carbon_score) / 3.0
    validation_checks.append({"rule": "Sustainability", "status": True, "message": f"Eco-sustainability score: {sustainability_score:.1f}/100"})

    # Compile raw evaluations
    raw_scores = {
        "structural_safety": structural_safety_score,
        "sls_compliance": sls_compliance_score,
        "climate_compatibility": climate_score,
        "occupancy_requirements": occupancy_score,
        "structural_system_compatibility": system_score,
        "service_life": service_life_score,
        "maintenance": maintenance_score,
        "sustainability": sustainability_score,
    }

    # Weight Normalization Logic for N/A criteria
    applicable_keys = [k for k, v in raw_scores.items() if v is not None]
    applicable_weight_sum = sum(WEIGHTS.get(k, 0.0) for k in applicable_keys)

    breakdown = {}
    weighted_sum = 0.0
    for k in WEIGHTS.keys():
        val = raw_scores[k]
        weight = WEIGHTS[k]
        if k in applicable_keys:
            normalized_weight = weight / applicable_weight_sum
            weighted_sum += val * normalized_weight
            crit_reasons = [r for r in rejection_reasons if k.replace('_', ' ') in r.lower() or (k == 'climate_compatibility' and ('salin' in r.lower() or 'climate' in r.lower() or 'marine' in r.lower() or 'over-specification' in r.lower()))]
            note_str = crit_reasons[0] if crit_reasons else ("Evaluated against preliminary engineering criteria" if not val or val >= 60 else "Marginal preliminary compliance")
            breakdown[k] = {
                "score": round(val, 2),
                "max": round(weight * 100, 2),
                "contribution": round(val * weight, 2),
                "normalized_weight": round(normalized_weight, 4),
                "notes": note_str,
                "reason": note_str,
                "is_na": False
            }
        else:
            breakdown[k] = {
                "score": 0.0,
                "max": round(weight * 100, 2),
                "contribution": 0.0,
                "normalized_weight": 0.0,
                "notes": "Not applicable for this component",
                "reason": "Not applicable for this component",
                "is_na": True
            }

    eng_score = round(weighted_sum, 2)
    if veto:
        eng_score = 0.0

    # A material passes if it has not been hard-vetoed.
    # Soft rejection reasons (climate mismatch, occupancy concerns, system incompatibility)
    # reduce the engineering score but do NOT prevent the material from being considered.
    passed = not veto

    reason_code = ",".join(reason_codes) if reason_codes else "Pass"

    return {
        "engineering_score": eng_score,
        "passed": passed,
        "veto": veto,
        "validation_checks": validation_checks,
        "rejection_reasons": rejection_reasons,
        "constraint_breakdown": breakdown,
        "reason_code": reason_code,
    }

def calculate_hybrid_score(engineering_score: float, ml_score: float, vetoed: bool = False) -> float:
    """Combine engineering and ML scores using the configured hybrid weights."""
    if vetoed or engineering_score == 0.0:
        return 0.0
    return engineering_score * HYBRID_ENGINEERING_WEIGHT + ml_score * HYBRID_ML_WEIGHT
