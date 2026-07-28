# backend/engines/compatibility_engine.py
"""Cross‑material Compatibility Engine for GreenConstructAI.

Checks whether the selected materials across different categories are
mutually compatible.  For example:

  - Marine‑grade concrete should be paired with marine‑grade reinforcement.
  - Lightweight walling (AAC) should be paired with appropriate foundations.
  - Coastal windows should match coastal exposure requirements.

Incompatibilities trigger a score penalty (−15 pts per conflict, per the plan).
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Tuple

# Load profiles for compatible_with and category data
_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'material_profiles.json')

def _load_profiles() -> Dict[str, Any]:
    try:
        with open(_CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

_profiles = _load_profiles()


# ---------------------------------------------------------------------------
# Rule‑based compatibility pairs
# ---------------------------------------------------------------------------
# Each rule is: (category_A, name_pattern_A, category_B, name_pattern_B, reason)
# If A is selected and B is NOT selected, a warning is raised.
_PAIRING_RULES: List[Tuple[str, str, str, str, str]] = [
    # Marine concrete must pair with marine / epoxy‑coated rebar
    ("Concrete", "marine", "Structural", "epoxy|marine|stainless|galvanized",
     "Marine‑grade concrete should be paired with corrosion‑resistant reinforcement"),

    # Lightweight walling (AAC / CSEB) works best on strip foundations
    ("Walling", "aac|cseb|compressed", "Foundation", "strip|pad",
     "Lightweight walling systems perform best on strip or pad foundations"),

    # High‑rise (6+) requires high‑capacity structural + foundation
    ("Structural", "tmt|epoxy|stainless", "Foundation", "pile|raft",
     "High‑capacity reinforcement should be paired with pile or raft foundations for tall structures"),
]


def _name_matches(name: str, pattern: str) -> bool:
    """Check if *name* contains any of the ``|``‑separated tokens."""
    name_lower = name.lower()
    for token in pattern.split("|"):
        if token.strip() in name_lower:
            return True
    return False


def check_package_compatibility(
    package: Dict[str, Any],
    climate: Dict[str, Any],
    num_floors: int,
) -> Dict[str, Any]:
    """Evaluate cross‑material compatibility for a recommended package.

    Parameters
    ----------
    package : dict
        The ``recommended_package`` dict from the recommendation engine.
        Keys are slot names (``foundation``, ``structural``, ``walls``, …)
        and values are dicts with at least a ``name`` key.
    climate : dict
        Climate profile from the weather engine.
    num_floors : int
        Number of storeys.

    Returns
    -------
    dict with keys:
        * ``compatible`` (bool) – True if no conflicts found.
        * ``conflicts`` (list[dict]) – Each conflict has ``rule``, ``detail``,
          ``penalty``.
        * ``total_penalty`` (int) – Sum of all penalties.
    """
    conflicts: List[Dict[str, Any]] = []

    # Flatten package to {category: material_name}
    slot_to_cat = {
        "foundation":    "Foundation",
        "structural":    "Structural",
        "concrete":      "Concrete",
        "walls":         "Walling",
        "roofing":       "Roofing",
        "windows":       "Windows",
        "doors":         "Doors",
        "flooring":      "Flooring",
        "ceiling":       "Ceiling",
        "finishes":      "Finishing",
        "waterproofing": "Waterproofing",
    }

    cat_to_name: Dict[str, str] = {}
    for slot, cat in slot_to_cat.items():
        item = package.get(slot)
        if item and isinstance(item, dict) and item.get("name"):
            cat_to_name[cat] = item["name"]

    # ── Apply pairing rules ───────────────────────────────────────────────
    for cat_a, pat_a, cat_b, pat_b, reason in _PAIRING_RULES:
        name_a = cat_to_name.get(cat_a, "")
        name_b = cat_to_name.get(cat_b, "")
        if name_a and _name_matches(name_a, pat_a):
            if name_b and not _name_matches(name_b, pat_b):
                conflicts.append({
                    "rule": f"{cat_a}↔{cat_b} pairing",
                    "detail": reason,
                    "material_a": name_a,
                    "material_b": name_b,
                    "penalty": 15,
                })

    # ── Climate coherence check ───────────────────────────────────────────
    salinity = climate.get("salinity", "low").lower()
    if salinity in ("moderate", "extreme", "high"):
        for cat, mat_name in cat_to_name.items():
            p = _profiles.get(mat_name, {})
            mat_climates = [c.lower() for c in p.get("climate", [])]
            if mat_climates and "coastal" not in mat_climates and "extreme coastal" not in mat_climates:
                conflicts.append({
                    "rule": "Climate coherence",
                    "detail": f"{mat_name} ({cat}) is not rated for coastal/marine exposure but project has {salinity} salinity",
                    "material_a": mat_name,
                    "material_b": "",
                    "penalty": 10,
                })

    total_penalty = sum(c["penalty"] for c in conflicts)

    return {
        "compatible": len(conflicts) == 0,
        "conflicts": conflicts,
        "total_penalty": total_penalty,
    }
