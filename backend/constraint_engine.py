import pathlib
import sqlite3
from typing import Dict, Any, List

# Global collector for rejected material diagnostics
REJECTED_MATERIALS: List[Dict[str, Any]] = []

# Resolve the path to the shared materials database (same location used by the
# populate_metadata script).
DB_PATH = pathlib.Path(r"C:/Users/ASUS/Desktop/Material specification/backend/data/materials.db")


def _load_material_compatibility(material_id: int) -> Dict[str, List[str]]:
    """Fetch building and climate compatibility lists for a material.

    Returns a dict with keys ``building`` and ``climate`` containing the raw
    strings stored in the database.
    """
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute(
        "SELECT building_type FROM MaterialBuildingCompatibility WHERE material_id = ?",
        (material_id,)
    )
    building = [row[0].lower() for row in cur.fetchall()]
    cur.execute(
        "SELECT climate_zone FROM MaterialClimateCompatibility WHERE material_id = ?",
        (material_id,)
    )
    climate = [row[0].lower() for row in cur.fetchall()]
    conn.close()
    return {"building": building, "climate": climate}


def evaluate_constraints(
    material: Dict[str, Any],
    blueprint: Dict[str, Any],
    climate_profile: Dict[str, Any],
    user_profile: Any,
) -> Dict[str, Any]:
    """Evaluate engineering constraints for a single material.

    Parameters
    ----------
    material: dict
        The raw material row from the ``materials`` table.
    blueprint: dict
        Expected keys ``building_type`` (str) and ``floors`` (int).
    climate_profile: dict
        Climate information supplied by the frontend (e.g. ``type``, ``salinity``).
    user_profile: any
        The same profile object passed to the MCDM engine – retained for future
        extensions but not used by the current rule set.

    Returns
    -------
    dict with keys:
        * ``allowed`` (bool) – compatibility exists.
        * ``veto`` (bool) – hard engineering rejection.
        * ``score_modifier`` (int) – absolute value to add/subtract from the
          base score when ``allowed`` is False.
        * ``reasons`` (list[str]) – human‑readable explanations.
        * ``total_checks`` (int)
        * ``passed_checks`` (int)
    """
    material_id = material.get("Material_ID")
    if material_id is None:
        return {"allowed": False, "veto": True, "score_modifier": 100, "reasons": ["Missing material identifier"], "total_checks": 0, "passed_checks": 0}

    # Load compatibility records from the DB.
    compat = _load_material_compatibility(material_id)
    # ---------- Diagnostic Logging ----------
    b_type_raw = blueprint.get("building_type", "")
    city_climate_raw = climate_profile.get("type", "")
    print("[DIAG] evaluate_constraints called")
    print(f"    b_type_raw               : {repr(b_type_raw)}")
    print(f"    compat[\"building\"]    : {compat.get('building')}")
    print(f"    city_climate_raw         : {repr(city_climate_raw)}")
    print(f"    compat[\"climate\"]     : {compat.get('climate')}")
    # Raw vs lowered matches
    print(f"Raw building match        : {b_type_raw in compat.get('building', [])}")
    print(f"Lower building match      : {b_type_raw.strip().lower() in compat.get('building', [])}")
    print(f"Raw climate match         : {city_climate_raw in compat.get('climate', [])}")
    print(f"Lower climate match       : {city_climate_raw.strip().lower() in compat.get('climate', [])}")
    # Climate taxonomy info
    print(f"Climate supplied: {city_climate_raw}")
    print(f"Material climates: {compat.get('climate')}")
    # -----------------------------------------

    b_type = b_type_raw.strip().lower()
    floors = blueprint.get("floors", 0)
    
    reasons: List[str] = []
    allowed = True
    veto = False
    score_modifier = 0
    total_checks = 0
    passed_checks = 0

    # ---------------------------------------------------------------------
    # 1. Building sector compatibility (replaces hard‑coded sector check).
    # ---------------------------------------------------------------------
    total_checks += 1
    sector_mismatch = False
    if b_type not in compat["building"]:
        allowed = False
        sector_mismatch = True
        score_modifier += 20  # mirrors the original -20 penalty (absolute value)
        reasons.append("Sector mismatch (metadata)")
    else:
        passed_checks += 1

    # ---------------------------------------------------------------------
    # 2. Climate zone compatibility (replaces hard‑coded climate strings).
    # ---------------------------------------------------------------------
    total_checks += 1
    city_climate = climate_profile.get("type", "").lower()
    climate_incompatible = False
    if city_climate and city_climate not in compat["climate"]:
        # Original engine could veto for highly sensitive materials; we now treat this as a penalty rather than a hard veto.
        climate_incompatible = True
        score_modifier += 50
        reasons.append("Climate incompatibility (metadata) – material unsuitable for the project location")
    else:
        passed_checks += 1

    # ---------------------------------------------------------------------
    # 3. Marine grade unnecessary check – still based on material field but
    #    driven by climate metadata.
    # ---------------------------------------------------------------------
    from backend.utils import is_marine_needed

    marine_needed = is_marine_needed(
        climate_profile.get("salinity", "Low"),
        climate_profile.get("distance_km", 999.0),
    )


    is_marine_grade = material.get("Corrosion_Resistance", 0) >= 90
    total_checks += 1
    marine_unnecessary = False
    if not marine_needed and is_marine_grade:
        # Marine grade not required; apply penalty instead of hard veto.
        marine_unnecessary = True
        score_modifier += 50
        reasons.append("Marine grade unnecessary for low‑salinity/inland environment (metadata)")
    else:
        passed_checks += 1

    result = {
        "allowed": allowed,
        "veto": veto,
        "score_modifier": score_modifier,
        "reasons": reasons,
        "total_checks": total_checks,
        "passed_checks": passed_checks,
    }
    # Diagnostic prints for constraint outcome
    print("[DIAG] allowed =", allowed)
    print("[DIAG] score_modifier =", score_modifier)
    print("[DIAG] veto =", veto)

    # ---------------------------------------------------------------
    # Diagnostic collection for rejected materials
    # ---------------------------------------------------------------
    if not allowed or veto:
        REJECTED_MATERIALS.append({
            "material_id": material_id,
            "material_name": material.get("Name", "<unknown>"),
            "building_compatibility": "Allowed" if not sector_mismatch else "Sector mismatch",
            "climate_compatibility": "Allowed" if not climate_incompatible else "Climate incompatibility",
            "structural_compatibility": "N/A",  # No structural rule in current engine
            "final_veto_reason": ", ".join(reasons) if reasons else "None",
        })

    return result
