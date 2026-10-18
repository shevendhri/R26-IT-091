# backend/structural_rules.py
"""Structural Design Rule Engine

Determines the appropriate structural system based on building characteristics and
filters out incompatible materials before ML ranking.
"""
from typing import Dict, List

# Mapping of building type + floor range to recommended structural systems
STRUCTURAL_SYSTEM_MAP = {
    ("Residential", "low"): ["Masonry/RC"],
    ("Apartment", "mid"): ["RC Frame"],
    ("Hotel", "high"): ["Reinforced Concrete Frame", "Shear Core"],
    ("Hospital", "high"): ["Reinforced Concrete Frame", "Shear Core"],
    ("School", "mid"): ["RC Frame"],
    ("Office", "mid"): ["RC Frame"],
    ("Industrial", "mid"): ["Steel Frame"],
    # Add more mappings as needed
}

def _categorize_floor_count(floor_count: int) -> str:
    """Categorize floor count into low / mid / high tiers.

    Low: 1‑2 floors
    Mid: 3‑5 floors
    High: 6+ floors
    """
    if floor_count <= 2:
        return "low"
    if floor_count <= 5:
        return "mid"
    return "high"

def determine_structural_system(building_type: str, floor_count: int, building_area: float, loading_factor: float = 1.0) -> List[str]:
    """Return a list of structural system keywords appropriate for the building.

    The function uses a simple heuristic based on building type and floor tier.
    ``loading_factor`` can be used to upgrade the system for unusually high loads.
    """
    tier = _categorize_floor_count(floor_count)
    key = (building_type.title(), tier)
    systems = STRUCTURAL_SYSTEM_MAP.get(key, ["RC Frame"])  # default to RC Frame
    # Adjust for high loading factor (e.g., >1.5) by adding Shear Core
    if loading_factor > 1.5 and "Shear Core" not in systems:
        systems.append("Shear Core")
    return systems

def filter_by_structural_compatibility(materials: List[Dict], structural_systems: List[str]) -> List[Dict]:
    """Remove materials that are incompatible with the determined structural system.

    Each material entry is expected to contain a ``Structural_Capacity`` rating and a
    ``Style_Compatibility`` string that lists permissible structural systems.
    """
    compatible = []
    for mat in materials:
        compat_str = mat.get("Style_Compatibility", "").lower()
        if any(sys.lower() in compat_str for sys in structural_systems):
            compatible.append(mat)
    return compatible
