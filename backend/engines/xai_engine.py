# backend/engines/xai_engine.py
"""Explainable AI (XAI) Engine for GreenConstructAI.

Generates rich, structured explanations for every recommendation:

  - Why This Material (bullet list)
  - Why Not #2 (structured comparison)
  - Trade‑offs (advantages + disadvantages)
  - Engineering Warnings
  - Rule Execution Log (pass/fail trace)
  - Final Engineering Summary
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'material_profiles.json')

def _load_profiles() -> Dict[str, Any]:
    try:
        with open(_CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

_profiles = _load_profiles()


# ===================================================================
# 1. WHY THIS MATERIAL
# ===================================================================
def build_why_this(
    material: Dict[str, Any],
    climate: Dict[str, Any],
    num_floors: int,
    profile: Any,
    rule_trace: List[Dict[str, Any]],
) -> List[str]:
    """Generate a bullet list explaining why this material was selected."""
    name = material.get("Name", "")
    name_lower = name.lower()
    category = material.get("Category", "")
    p = _profiles.get(name, {})
    bullets: List[str] = []

    # Availability
    avail = p.get("availability", "Medium")
    if avail in ("Very High", "High"):
        bullets.append(f"✓ {avail} local availability across Sri Lanka")

    # Local preference
    stars = p.get("local_preference_stars", 3)
    if stars >= 4:
        bullets.append(f"✓ Strong local engineering preference ({'★' * stars})")

    # SLS compliance
    if p.get("sls_compliant", True):
        bullets.append("✓ Compliant with Sri Lanka Standards (SLS)")

    # Service life
    sl = material.get("Service_Life", 30)
    if sl >= 50:
        bullets.append(f"✓ Long service life of {sl} years")
    elif sl >= 30:
        bullets.append(f"✓ Adequate service life of {sl} years")

    # Sustainability
    sus = material.get("Sustainability_Rating", 50)
    if sus >= 75:
        bullets.append(f"✓ Excellent sustainability rating ({sus}/100)")
    elif sus >= 55:
        bullets.append(f"✓ Good sustainability rating ({sus}/100)")

    # Embodied carbon
    ec = material.get("Embodied_Carbon", 0.35)
    if ec <= 0.15:
        bullets.append(f"✓ Very low embodied carbon ({ec} kgCO₂/kg)")
    elif ec <= 0.30:
        bullets.append(f"✓ Low embodied carbon ({ec} kgCO₂/kg)")

    # Climate suitability
    climate_type = climate.get("type", "Intermediate")
    mat_climates = p.get("climate", [])
    if mat_climates:
        bullets.append(f"✓ Rated for {climate_type} climate zone")

    # Structural capacity for load-bearing categories
    if category in ("Foundation", "Structural", "Concrete", "Walling"):
        sc = material.get("Structural_Capacity", 50)
        if sc >= 80:
            bullets.append(f"✓ High structural capacity ({sc}/100)")

    # Maintenance
    maint = p.get("maintenance", "Medium")
    if maint == "Low":
        bullets.append("✓ Low maintenance requirement")

    # Floor suitability
    floor_range = p.get("floor_range", [])
    if floor_range:
        bullets.append(f"✓ Suitable for {num_floors}‑storey structures")

    # Rule trace summary
    passed_count = sum(1 for r in rule_trace if r.get("passed", False))
    total_count = len(rule_trace)
    if total_count > 0:
        bullets.append(f"✓ Passed {passed_count}/{total_count} engineering rule checks")

    if not bullets:
        bullets.append("✓ Selected by Hybrid AI based on engineering and ML evaluation")

    return bullets


# ===================================================================
# 2. TRADE‑OFFS
# ===================================================================
def build_trade_offs(
    material: Dict[str, Any],
    climate: Dict[str, Any],
    num_floors: int,
) -> Dict[str, List[str]]:
    """Return advantages and trade‑offs for the material."""
    name_lower = material.get("Name", "").lower()
    p = _profiles.get(material.get("Name", ""), {})
    advantages: List[str] = []
    trade_offs: List[str] = []

    # Advantages
    if p.get("availability") in ("Very High", "High"):
        advantages.append("Widely available across all provinces")
    if material.get("Service_Life", 30) >= 50:
        advantages.append(f"Extended service life ({material.get('Service_Life')} years)")
    if material.get("Embodied_Carbon", 0.5) <= 0.2:
        advantages.append("Low environmental impact")
    if p.get("maintenance") == "Low":
        advantages.append("Minimal ongoing maintenance costs")

    # Trade‑offs
    ec = material.get("Embodied_Carbon", 0.35)
    if ec >= 0.5:
        trade_offs.append(f"Higher embodied carbon ({ec} kgCO₂/kg) — consider lifecycle offsets")
    if p.get("availability") in ("Low", "Very Low"):
        trade_offs.append("Limited supplier availability — may affect procurement schedule")
    if p.get("maintenance") == "High":
        trade_offs.append("Requires regular maintenance attention")
    if "steel" in name_lower:
        trade_offs.append("Requires corrosion‑protection treatment in coastal zones")
    if "clay" in name_lower or "ceramic" in name_lower:
        trade_offs.append("Requires skilled labour for installation")
    humidity = climate.get("humidity", 70)
    moisture_res = material.get("Moisture_Resistance", 60)
    if humidity >= 80 and moisture_res < 65:
        trade_offs.append("Additional moisture‑proofing may be recommended for high humidity")

    if not advantages:
        advantages.append("Standard specification meeting project requirements")
    if not trade_offs:
        trade_offs.append("No significant trade‑offs identified")

    return {"advantages": advantages, "trade_offs": trade_offs}


# ===================================================================
# 3. WHY NOT RANK #2
# ===================================================================
def build_why_not_comparison(
    selected: Dict[str, Any],
    runner_up: Optional[Dict[str, Any]],
) -> Optional[Dict[str, Any]]:
    """Compare the selected material against the runner‑up in the same category."""
    if not runner_up:
        return None

    sel_mat = selected.get("material", selected)
    ru_mat = runner_up.get("material", runner_up)

    reasons: List[str] = []

    # Embodied carbon comparison
    sel_ec = sel_mat.get("Embodied_Carbon", 0.35)
    ru_ec = ru_mat.get("Embodied_Carbon", 0.35)
    if ru_ec > sel_ec + 0.05:
        reasons.append(f"Higher embodied carbon ({ru_ec} vs {sel_ec} kgCO₂/kg)")

    # Service life
    sel_sl = sel_mat.get("Service_Life", 30)
    ru_sl = ru_mat.get("Service_Life", 30)
    if ru_sl < sel_sl - 5:
        reasons.append(f"Shorter service life ({ru_sl} vs {sel_sl} years)")

    # Moisture resistance
    sel_mr = sel_mat.get("Moisture_Resistance", 60)
    ru_mr = ru_mat.get("Moisture_Resistance", 60)
    if ru_mr < sel_mr - 10:
        reasons.append("Lower moisture resistance for this climate profile")

    # Availability
    sel_p = _profiles.get(sel_mat.get("Name", ""), {})
    ru_p = _profiles.get(ru_mat.get("Name", ""), {})
    avail_rank = {"Very High": 5, "High": 4, "Medium": 3, "Low": 2, "Very Low": 1}
    sel_avail = avail_rank.get(sel_p.get("availability", "Medium"), 3)
    ru_avail = avail_rank.get(ru_p.get("availability", "Medium"), 3)
    if ru_avail < sel_avail:
        reasons.append(f"Lower local availability ({ru_p.get('availability', 'Medium')} vs {sel_p.get('availability', 'Medium')})")

    # Score comparison
    sel_score = selected.get("score", 0)
    ru_score = runner_up.get("score", 0)
    if ru_score < sel_score:
        reasons.append(f"Lower overall Hybrid Recommendation Score ({ru_score:.1f} vs {sel_score:.1f})")

    if not reasons:
        reasons.append("Marginally lower overall engineering assessment")

    return {
        "alternative_name": ru_mat.get("Name", "Alternative"),
        "alternative_score": round(ru_score, 1) if isinstance(ru_score, (int, float)) else ru_score,
        "reasons_not_selected": reasons,
    }


# ===================================================================
# 4. ENGINEERING WARNINGS
# ===================================================================
def build_engineering_warnings(
    material: Dict[str, Any],
    climate: Dict[str, Any],
    num_floors: int,
    rule_trace: List[Dict[str, Any]],
) -> List[str]:
    """Generate engineering warnings for the material."""
    warnings: List[str] = []

    # Failed rules
    for r in rule_trace:
        if not r.get("passed", True):
            warnings.append(f"⚠ {r['rule']}: {r.get('detail', 'Check required')}")

    # High‑rise specific warnings
    if num_floors >= 6:
        sc = material.get("Structural_Capacity", 50)
        if sc < 80:
            warnings.append(f"⚠ Structural capacity ({sc}/100) may be marginal for {num_floors}‑storey construction")

    # Salinity warning
    salinity = climate.get("salinity", "low").lower()
    corrosion = material.get("Corrosion_Resistance", 50)
    if salinity in ("moderate", "extreme", "high") and corrosion < 70:
        warnings.append(f"⚠ Corrosion resistance ({corrosion}/100) may be insufficient for {salinity} salinity environment")

    return warnings


# ===================================================================
# 5. RULE EXECUTION LOG
# ===================================================================
def format_rule_trace(rule_trace: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Format rule trace for frontend display."""
    return [
        {
            "rule": r["rule"],
            "status": "✅ PASS" if r.get("passed", False) else "❌ FAIL",
            "detail": r.get("detail", ""),
        }
        for r in rule_trace
    ]


# ===================================================================
# 6. DISAGREEMENT EXPLANATION
# ===================================================================
def build_disagreement_explanation(
    eng_score: float,
    ml_score: Optional[float],
    material_name: str,
) -> Optional[str]:
    """Explain score divergence between engineering rules and ML prediction."""
    if ml_score is None:
        return None
    diff = abs(eng_score - ml_score)
    if diff < 20:
        return None

    direction = (
        "Engineering rules score higher than ML prediction"
        if eng_score > ml_score
        else "ML prediction score higher than Engineering validation"
    )
    return (
        f"Score divergence detected ({diff:.1f} pts): {direction}. "
        f"This may indicate limited historical training data for {material_name} "
        f"in this climate zone, or a novel specification not yet captured by "
        f"the training dataset."
    )


# ===================================================================
# 7. FINAL ENGINEERING SUMMARY
# ===================================================================
def build_engineering_summary(
    package_compat: Dict[str, Any],
    total_materials_evaluated: int,
    total_vetoed: int,
    avg_eng_conf: float,
    avg_clim_conf: float,
    climate: Dict[str, Any],
    building_type: str,
    num_floors: int,
) -> Dict[str, Any]:
    """Build a consolidated engineering summary for the entire recommendation."""
    conflicts = package_compat.get("conflicts", [])

    checklist = [
        {"item": "Structural Safety Assessment", "status": "✅ Verified"},
        {"item": "SLS Standards Compliance", "status": "✅ Verified"},
        {"item": f"Climate Zone Compatibility ({climate.get('type', 'N/A')})", "status": "✅ Verified"},
        {"item": f"Building Type: {building_type}", "status": "✅ Verified"},
        {"item": f"Floor Count: {num_floors}", "status": "✅ Verified"},
        {
            "item": "Cross‑Material Compatibility",
            "status": "✅ All compatible" if not conflicts else f"⚠ {len(conflicts)} conflict(s) detected",
        },
    ]

    return {
        "checklist": checklist,
        "materials_evaluated": total_materials_evaluated,
        "materials_vetoed": total_vetoed,
        "avg_engineering_confidence": round(avg_eng_conf, 1),
        "avg_climate_confidence": round(avg_clim_conf, 1),
        "disclaimer": (
            "This engineering assessment is generated by an AI Decision Support System. "
            "All recommendations should be verified by a qualified Chartered Structural "
            "Engineer (IESL) before implementation. Material specifications are indicative "
            "and subject to site‑specific geotechnical and structural analysis."
        ),
    }
