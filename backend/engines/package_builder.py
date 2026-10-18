# backend/engines/package_builder.py
"""Engineering Package Builder for GreenConstructAI.

Assembles the final recommendation into three engineering packages:

    1. Structural Package  – Foundation, Concrete, Structural (Reinforcement)
    2. Envelope Package    – Walling, Roofing, Windows, Doors, Waterproofing
    3. Finishing Package   – Flooring, Ceiling, Finishes

Each package contains the top‑ranked material per category along with
its full XAI explanation block.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional


# Package definitions: package name → list of category keys (slot names)
PACKAGE_DEFINITIONS = {
    "structural": {
        "label": "Structural Package",
        "description": "Load‑bearing and structural elements forming the building skeleton",
        "slots": ["foundation", "concrete", "structural"],
    },
    "envelope": {
        "label": "Envelope Package",
        "description": "Weather‑resistant shell protecting the interior environment",
        "slots": ["walls", "roofing", "windows", "doors", "waterproofing"],
    },
    "finishing": {
        "label": "Finishing Package",
        "description": "Interior finishes contributing to occupant comfort and aesthetics",
        "slots": ["flooring", "ceiling", "finishes"],
    },
}


def build_engineering_packages(
    recommended_package: Dict[str, Any],
) -> Dict[str, Any]:
    """Group the flat recommended_package into engineering packages.

    Parameters
    ----------
    recommended_package : dict
        The ``recommended_package`` dict from the recommendation engine.
        Keys are slot names and values are material detail dicts.

    Returns
    -------
    dict
        Keys are package identifiers (``structural``, ``envelope``,
        ``finishing``).  Each value is a dict with ``label``,
        ``description``, ``materials`` (list), and ``package_score``.
    """
    packages: Dict[str, Any] = {}

    for pkg_id, pkg_def in PACKAGE_DEFINITIONS.items():
        materials: List[Dict[str, Any]] = []
        scores: List[float] = []

        for slot in pkg_def["slots"]:
            item = recommended_package.get(slot)
            if item and isinstance(item, dict) and item.get("name"):
                materials.append({
                    "slot": slot,
                    **item,
                })
                if isinstance(item.get("score"), (int, float)):
                    scores.append(item["score"])

        pkg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        packages[pkg_id] = {
            "label": pkg_def["label"],
            "description": pkg_def["description"],
            "materials": materials,
            "package_score": pkg_score,
            "material_count": len(materials),
        }

    return packages


def build_alternative_comparison_table(
    scored_materials: List[Dict[str, Any]],
    selected_names: List[str],
) -> List[Dict[str, Any]]:
    """Build the alternative comparison table for the frontend.

    Shows all non‑vetoed materials in the same categories as the selected
    materials, sorted by hybrid score descending.  The selected material
    is marked with ``is_selected: True``.

    Returns a list of dicts, one per material, with columns:
        Material | Overall | Engineering | ML | Eco | Maintenance |
        Availability | Budget | Service Life
    """
    # Collect categories of selected materials
    selected_cats = set()
    for sm in scored_materials:
        if sm["material"]["Name"] in selected_names and not sm.get("vetoed", False):
            selected_cats.add(sm["material"]["Category"])

    table: List[Dict[str, Any]] = []
    for sm in scored_materials:
        if sm.get("vetoed", False) or sm.get("score") is None:
            continue
        cat = sm["material"]["Category"]
        if cat not in selected_cats:
            continue

        mat = sm["material"]
        name = mat.get("Name", "")
        table.append({
            "name": name,
            "category": cat,
            "is_selected": name in selected_names,
            "overall_score": round(sm.get("score", 0), 1),
            "engineering_score": round(sm.get("eng_score", 0), 1) if sm.get("eng_score") is not None else "N/A",
            "ml_score": round(sm.get("ml_score", 0), 1) if sm.get("ml_score") is not None else "N/A",
            "eco_score": mat.get("Sustainability_Rating", 50),
            "maintenance": sm.get("performance_metrics", {}).get("Maintenance", 70),
            "availability": _get_availability(name),
            "budget": sm.get("budget_compatibility", "Balanced"),
            "service_life": mat.get("Service_Life", 30),
        })

    # Sort by category then descending score
    table.sort(key=lambda x: (x["category"], -(x["overall_score"] if isinstance(x["overall_score"], (int, float)) else 0)))

    return table


def _get_availability(name: str) -> str:
    """Look up availability from profiles."""
    import json
    import os
    config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'material_profiles.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            profiles = json.load(f)
        return profiles.get(name, {}).get("availability", "Medium")
    except Exception:
        return "Medium"
