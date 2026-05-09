"""
feasibility_validator.py — GreenConstructAI Macro-Level Feasibility Engine v18.0
===================================================================================
TRUE ENGINEERING FEASIBILITY VALIDATION.
Enforces 2025/2026 Sri Lankan Construction Benchmarks including Overhead & MEP.
"""

from typing import Tuple, Dict

# ─────────────────────────────────────────────────────────────────────────────
# MINIMUM REALISTIC BASE RATES (LKR per m2) — 2025/2026 Benchmarks
# ─────────────────────────────────────────────────────────────────────────────
# These represent the "all-in" cost per floor area including structure + basic finish
BASE_RATES = {
    "Residential": 135000, 
    "Commercial": 195000, 
    "Industrial": 155000
}

# Structural Escalation per floor (Height Complexity)
HEIGHT_MULTIPLIER = 0.085 # +8.5% cost per additional floor due to vertical logistics & reinforcement

# Sector Specific MEP & Service Premiums
MEP_PREMIUM = {
    "Residential": 0.12,  # 12% for basic plumbing/electrical
    "Commercial": 0.28,   # 28% for HVAC, Fire suppression, Lift systems
    "Industrial": 0.22    # 22% for heavy power, extraction, safety
}

# ─────────────────────────────────────────────────────────────────────────────
# MINIMUM THRESHOLDS (LKR)
# ─────────────────────────────────────────────────────────────────────────────
RESIDENTIAL_THRESHOLDS = {
    1: {"min": 8_500_000,  "label": "Single-storey minimum (Load-bearing masonry)"},
    2: {"min": 18_000_000, "label": "Two-storey minimum (RC Frame + Plinth)"},
    3: {"min": 32_000_000, "label": "Three-storey minimum (Structural Columns + Slabs)"},
    5: {"min": 65_000_000, "label": "Five-storey (Shear walls + Mandatory Lift core)"},
    8: {"min": 180_000_000,"label": "Eight-storey (High-rise RC + Shear Core + Deep Pile)"},
}

COASTAL_PREMIUM = 0.15  
HIGH_SUS_PREMIUM = 0.12  
CONTRACTOR_OVERHEAD = 0.15 # Mandatory 15% for profit/mgmt
CONTINGENCY = 0.05        # 5% safety margin

COASTAL_CITIES = {"galle", "batticaloa", "trincomalee", "jaffna", "hambantota", "mannar",
                  "colombo", "negombo", "matara", "panadura", "beruwala", "kalutara", "hikkaduwa", "bentota"}

def validate_feasibility(
    budget: float,
    b_type: str,
    floors: int,
    city: str,
    sustainability_pref: str = "Medium",
    total_area: float = 150.0
) -> Dict:
    """
    MASTER FEASIBILITY AUDIT v18.0
    """
    city_lc = city.lower().strip()
    
    # 1. Calculate Base Engineering Cost
    base_rate = BASE_RATES.get(b_type, 135000)
    
    # Apply height complexity escalation
    height_factor = 1.0 + (max(0, floors - 1) * HEIGHT_MULTIPLIER)
    if floors >= 5: height_factor += 0.15 # Structural core jump
    if floors >= 8: height_factor += 0.25 # High-rise pile/shear jump
    
    # Calculate Raw Construction Cost
    raw_cost = (total_area * base_rate) * height_factor
    
    # Add MEP & Services
    mep_cost = raw_cost * MEP_PREMIUM.get(b_type, 0.15)
    
    # Apply Premiums
    is_coastal = any(c in city_lc for c in COASTAL_CITIES)
    coastal_mod = (1 + COASTAL_PREMIUM) if is_coastal else 1.0
    sus_mod = (1 + HIGH_SUS_PREMIUM) if sustainability_pref == "High" else 1.0
    
    subtotal = (raw_cost + mep_cost) * coastal_mod * sus_mod
    
    # 2. APPLY CONTRACTOR & AUDIT OVERHEADS
    total_estimated = subtotal * (1 + CONTRACTOR_OVERHEAD) * (1 + CONTINGENCY)
    
    # 3. Floor-Count Validation Logic
    status = "FEASIBLE"
    reasons = []
    suggestions = []
    
    # Strict Rejection Logic (Structural Gating)
    if floors >= 8 and budget < 120_000_000:
        status = "STRUCTURALLY UNDERFUNDED"
        reasons.append(f"High-rise structural compliance (8 storeys) is impossible at LKR {budget:,.0f}. Minimum threshold for high-rise RC shear cores is LKR 120M+.")
    
    elif floors >= 5 and budget < 55_000_000:
        status = "CONDITIONALLY INFEASIBLE"
        reasons.append("Buildings 5+ storeys require mandatory shear walls and lift cores per SLS standards. Current budget fails life-safety structural requirements.")
    
    elif floors >= 3 and budget < 15_000_000:
        status = "CONDITIONALLY INFEASIBLE"
        reasons.append("Multi-storey structural framing (3+ floors) requires reinforced column-beam matrices. Budget is insufficient for safe vertical load transfer.")

    # 4. Budget Ratio Check
    cost_diff_pct = ((total_estimated - budget) / budget) * 100
    if status == "FEASIBLE" and cost_diff_pct > 15:
        status = "CONDITIONALLY INFEASIBLE"
        reasons.append(f"Project cost estimate (LKR {total_estimated:,.0f}) exceeds budget by {cost_diff_pct:.1f}%. High risk of structural corner-cutting.")

    # 5. Final Intelligence Synthesis
    budget_ratio = min(1.0, budget / total_estimated)
    
    return {
        "is_feasible": status == "FEASIBLE",
        "status_label": status,
        "confidence": int(budget_ratio * 100),
        "total_estimated": round(total_estimated, 2),
        "shortfall": round(max(0, total_estimated - budget), 2),
        "is_coastal": is_coastal,
        "audit_logs": reasons,
        "suggestions": suggestions,
        "engineering_warnings": _get_v18_warnings(b_type, floors, is_coastal)
    }

def _get_v18_warnings(b_type, floors, is_coastal):
    w = []
    if b_type == "Industrial":
        w.append("SPAN_ALERT: Portal frames over 15m require lateral bracing and haunched rafters.")
    elif b_type == "Commercial":
        w.append("FIRE_SAFETY: Mandatory fire escape staircases required for occupancy levels.")
    
    if floors >= 5:
        w.append("CORE_STABILITY: Structural shear core required for lateral wind load resistance.")
    if is_coastal:
        w.append("CORROSION: Marine-grade concrete cover (50mm min) mandatory for all RC elements.")
    
    w.append("AUDIT_NOTICE: Estimate includes 15% contractor overhead and 5% contingency.")
    return w[:5]
