import math
from typing import Dict, List, Any
from database import get_all_materials, format_material
from mcdm_engine import mcdm_engine

# This module generates three preset material packages (Budget, Balanced, Premium)
# based on the user's questionnaire profile and the hybrid scoring engine.

def _score_material(mat: Dict[str, Any], blueprint: Dict[str, Any], profile: Any, ml_weight: float = 0.3, eng_weight: float = 0.7) -> float:
    """Calculate a hybrid score for a material (used for package selection)."""
    from material_engine import _ml_score  # internal helper
    climate = blueprint.get("climate_profile", {})
    building_type = blueprint.get("building_type", "Residential")
    budget = blueprint.get("budget", 0.0)
    eng_score, reasons, is_vetoed, _, _, _ = mcdm_engine.evaluate_material(mat, climate, building_type, blueprint.get("num_floors", 1), profile)
    ml_score = _ml_score(mat.get("Category", ""), climate, building_type, budget)
    return eng_weight * eng_score + ml_weight * ml_score


def build_packages(blueprint: Dict[str, Any], profile: Any) -> Dict[str, Dict[str, Any]]:
    """Generate Budget, Balanced, and Premium packages.

    Returns a dict with keys "budget", "balanced", "premium" each containing a mapping
    of component -> material name (and optional score).
    """
    # Load full catalog
    raw = get_all_materials()
    catalog = [format_material(r) for r in raw]

    # Define component categories (matching material_engine components)
    components = {
        "Foundation": ["Foundation"],
        "Structural System": ["Structural"],
        "Walls": ["Walling", "Walls"],
        "Roof": ["Roofing"],
        "Windows": ["Openings"],
        "Doors": ["Openings"],
        "Flooring": ["Flooring"],
        "Ceiling": ["Ceiling"],
        "Finishes": ["Finishing"],
        "Paint": ["Finishing"],  # Paint considered a finishing type
        "Insulation": ["Roofing", "Ceiling"]  # treat insulation as roof/ceiling options
    }

    # Pre‑score all materials once
    scored = []
    for mat in catalog:
        score = _score_material(mat, blueprint, profile)
        scored.append({"material": mat, "score": score})

    # Helper to pick best material for a component according to a selector function
    def pick_best(comp_key: str, selector):
        cat_list = components.get(comp_key, [])
        candidates = [s for s in scored if any(cat.lower() in s["material"]["Category"].lower() for cat in cat_list)]
        if not candidates:
            return {"name": "Standard Specification", "score": 70}
        best = selector(candidates)
        return {"name": best["material"]["Name"], "score": round(best["score"]) }

    # Build each package with different selector strategies
    packages = {}

    # Budget: prioritize low cost (Rate_LKR) then score
    def budget_selector(cands):
        cands.sort(key=lambda x: (x["material"]["Rate_LKR"], -x["score"]))
        return cands[0]
    packages["budget"] = {comp: pick_best(comp, budget_selector) for comp in components}

    # Balanced: prioritize highest hybrid score
    def balanced_selector(cands):
        cands.sort(key=lambda x: -x["score"])  # descending score
        return cands[0]
    packages["balanced"] = {comp: pick_best(comp, balanced_selector) for comp in components}

    # Premium: prioritize sustainability rating then score
    def premium_selector(cands):
        cands.sort(key=lambda x: (-x["material"].get("Sustainability_Rating", 0), -x["score"]))
        return cands[0]
    packages["premium"] = {comp: pick_best(comp, premium_selector) for comp in components}

    return packages
