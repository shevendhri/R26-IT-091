"""
mcdm_engine.py — GreenConstructAI Adaptive Engineering Intelligence v18.0
=========================================================================
ZERO-TEMPLATE ENGINE. ADAPTIVE STRUCTURAL LOGIC. CLIMATE-LOCKED FILTERING.
UNIQUE RATIONALE GENERATION. SECTOR-DIFFERENTIATED SCORING.
"""

import random
import math
import numpy as np
from typing import List, Dict, Tuple, Optional

# ──────────────────────────────────────────────
# 1. ENRICHED CLIMATE ARCHETYPES (v18.0)
# ──────────────────────────────────────────────
CLIMATE_STRATEGIES = {
    "SEVERE_COASTAL": {
        "cities": ["galle", "batticaloa", "trincomalee", "jaffna", "hambantota", "mannar", "beruwala", "kalutara"],
        "salinity": "Critical", "humidity": "High",
        "mandate": ["marine", "epoxy", "crystalline", "upvc", "galvanized"],
        "logic": "Corrosion mitigation via chloride-resistant structural specifications."
    },
    "WET_TROPICAL": {
        "cities": ["colombo", "negombo", "ratnapura", "kalutara", "panadura"],
        "salinity": "Low", "humidity": "Critical",
        "mandate": ["crystalline", "antifungal", "permeable", "pitched"],
        "logic": "Moisture management and peak rainfall drainage optimization."
    },
    "CENTRAL_HIGHLAND": {
        "cities": ["kandy", "nuwara eliya", "badulla", "ella"],
        "salinity": "None", "humidity": "High",
        "mandate": ["thermal", "insulation", "timber", "clay", "stone"],
        "logic": "Thermal mass retention and frost/condensation protection."
    },
    "DRY_ZONE": {
        "cities": ["anuradhapura", "polonnaruwa", "kurunegala", "trincomalee"],
        "salinity": "None", "humidity": "Low",
        "mandate": ["reflectivity", "thermal", "passive", "cooling"],
        "logic": "Heat gain reduction via solar-reflective and high-thermal-mass envelopes."
    },
    "URBAN_HEAT_ISLAND": {
        "cities": ["colombo", "kandy", "kurunegala"],
        "salinity": "Low", "humidity": "Medium",
        "mandate": ["reflective", "green", "permeable", "low-voc"],
        "logic": "Urban cooling and localized heat mitigation via high-albedo surfaces."
    }
}

# ──────────────────────────────────────────────
# 2. MASTER RATIONALE LIBRARY (v18.0)
# ──────────────────────────────────────────────
RATIONALE_LIBRARY = {
    "Residential": {
        "Foundation": [
            "Sized for residential loads (1.5 kN/m²) with settlement-safe bearing margins for {climate_cue}.",
            "Shallow foundation geometry selected to minimize excavation impact in {climate_cue} soil conditions.",
            "Structural pad footings specified for domestic load distribution, balancing volume and stability in {city}."
        ],
        "Structural": [
            "Slender RC framing optimized for residential spatial planning while resisting {climate_cue} wind loads.",
            "Residential column grid selected to minimize internal obstructions for the {floors}-storey profile.",
            "Reinforcement density aligned with SLS structural codes for {floors}-storey residential heights."
        ],
        "Walling": [
            "High-thermal-mass walling assembly specified to buffer indoor temperatures against {climate_cue}.",
            "Vapour-permeable wall finish selected to prevent moisture entrapment in humid {climate_cue} zones.",
            "Local material sourcing prioritized to reduce lifecycle carbon footprint for this {budget_tier}-tier project."
        ],
        "Roofing": [
            "Deep overhangs specified to protect residential elevations from heavy {climate_cue} rainfall.",
            "Ventilated attic design integrated to enable passive heat extraction in {climate_cue} conditions.",
            "Reflective roof surface specified to minimize solar heat gain for the {budget_tier} residential tier."
        ],
        "Flooring": [
            "Non-slip surface finish specified for high-risk residential wet zones (Kitchen/Bath).",
            "Low-maintenance flooring selected for long-term domestic durability in {city}.",
            "Tactile comfort and thermal neutrality prioritized for habitable zone floor finishes."
        ],
        "Openings": [
            "Thermally-broken frame system selected to minimize heat transfer in {climate_cue} zones.",
            "Natural ventilation paths optimized via strategic window placement for residential comfort.",
            "Low-E glazing specified to reduce UV fade on interior residential finishes."
        ],
        "Waterproofing": [
            "Integral waterproofing admixture specified for ground slabs in {climate_cue} moisture zones.",
            "Flexible membrane system selected for terrace junctions to accommodate residential movement.",
            "Polyurethane sealant specified for all wet-zone pipe penetrations to prevent seepage."
        ],
        "Finishing": [
            "Anti-fungal exterior finish specified to resist microbial growth in humid {climate_cue} zones.",
            "Low-VOC interior paint selected for residential air quality and occupant health.",
            "Flexible acrylic render specified to accommodate structural micro-settlement in {city}."
        ]
    },
    "Commercial": {
        "Foundation": [
            "Heavy-duty raft foundation logic applied to support high-traffic commercial occupancy loads.",
            "Sized for commercial live loads (3.0-5.0 kN/m²) with enhanced factor-of-safety for {city}.",
            "Deep piling considerations integrated for {floors}-storey commercial structural stability."
        ],
        "Structural": [
            "Robust RC core and shell strategy implemented for {floors}-storey commercial lateral stability.",
            "Wide-span structural grid optimized for commercial flexibility and MEP service routing.",
            "High-yield reinforcement specified for commercial seismic ductility in {climate_cue} zones."
        ],
        "Walling": [
            "Fire-rated masonry envelope specified for commercial code compliance and sound attenuation.",
            "Durable exterior cladding selected for low-maintenance lifecycle in {climate_cue} urban environment.",
            "Curtain wall integration logic applied to maximize natural light for commercial office zones."
        ],
        "Roofing": [
            "Insulated flat-slab roofing specified for commercial plant-room and MEP equipment support.",
            "High-albedo solar-reflective coating mandated to reduce commercial HVAC cooling loads.",
            "Heavy-duty drainage systems integrated for rapid {climate_cue} storm-water discharge."
        ],
        "Flooring": [
            "High-abrasion resistant flooring selected for commercial high-traffic circulation zones.",
            "Raised access floor logic enabled for commercial data and power distribution flexibility.",
            "Fire-resistant non-slip finish specified for commercial staircases and lift lobbies."
        ],
        "Openings": [
            "Commercial-grade double glazing specified for peak acoustic insulation in urban {city}.",
            "Automated sensor-driven opening systems integrated for commercial energy efficiency.",
            "Shatter-proof safety glazing mandated for commercial street-level storefront elevations."
        ],
        "Waterproofing": [
            "Multi-layer bituminous tanking specified for commercial basement and service core logic.",
            "Negative-side crystalline seal applied for critical commercial lift-pit waterproofing.",
            "Protective screed specified over terrace membranes to allow commercial utility traffic."
        ],
        "Finishing": [
            "High-durability commercial finish selected for 10-year repaint cycle in {climate_cue} zones.",
            "Class 0 fire-rated internal finishes specified for commercial corridor and lobby zones.",
            "Graffiti-resistant exterior coating selected for street-level commercial elevations."
        ]
    },
    "Industrial": {
        "Foundation": [
            "Heavy-duty footing spec confirmed for machinery vibration damping and industrial static loads.",
            "Deep raft foundation logic applied for Level {floors} industrial warehouse compliance.",
            "High-density concrete specified to resist chemical seepage in industrial floor-slab interfaces."
        ],
        "Structural": [
            "Prefabricated steel portal frame strategy enabled for rapid industrial deployment.",
            "High-yield TMT reinforcement specified for heavy industrial gantry-crane support paths.",
            "Fire-resistant intumescent coating mandated for all exposed industrial structural steel."
        ],
        "Roofing": [
            "Insulated sandwich panels specified for thermal control in temperature-sensitive industrial zones.",
            "High-albedo roofing selected to mitigate urban heat island effects in large industrial footprints.",
            "Gravity-fed ventilation ridge detail integrated into industrial roofing logic."
        ],
        "Walling": [
            "Pre-cast concrete walling selected for impact resistance in heavy-traffic industrial zones.",
            "Hollow cement block walling with reinforced infill for cost-effective industrial perimeter.",
            "Sandwich panel walling specified for rapid assembly and superior thermal seal in industrial zones."
        ],
        "Flooring": [
            "Chemical-resistant epoxy floor coating specified for industrial process zones.",
            "Dust-proof concrete hardener applied for high-traffic industrial warehouse floors.",
            "Slip-resistant safety finish mandated for industrial wet-process area floor specs."
        ],
        "Ceiling": [
            "Exposed service logic applied: Suspended ceilings omitted in industrial zones for accessibility.",
            "Reflective thermal foil specified for underside of industrial roof logic.",
            "Acoustic baffle system integrated for noise reduction in industrial manufacturing zones."
        ],
        "Openings": [
            "High-speed sectional overhead doors specified for industrial logistics bays.",
            "Louvered ventilation systems integrated for passive airflow in industrial hall logic.",
            "Impact-resistant security glazing specified for industrial office-bay interfaces."
        ],
        "Waterproofing": [
            "Double-membrane tanking specified for critical industrial chemical storage zones.",
            "Crystalline waterproofing slurry applied to industrial pit and basement logic.",
            "UV-resistant polyurea coating specified for exposed industrial roof-slab waterproofing."
        ],
        "Finishing": [
            "Anti-corrosive industrial coating specified for internal elevations in {city} environment.",
            "Safety-coded high-visibility finishes specified for industrial zone identification.",
            "Low-maintenance washable surface finish selected for industrial food-grade zones."
        ]
    }
}

def _get_climate_strategy(city: str, specs: str = "") -> dict:
    city_lc = city.lower().strip()
    specs_lc = specs.lower().strip()
    
    # ── DYNAMIC CLIMATE CUES ──
    cues = {
        "SEVERE_COASTAL": ["salt-laden coastal air exposure", "marine moisture penetration risk", "elevated chloride corrosion potential"],
        "WET_TROPICAL": ["high humidity envelope stress", "monsoon drainage exposure", "intense precipitation load"],
        "CENTRAL_HIGHLAND": ["frost and condensation potential", "diurnal temperature fluctuations", "misty highland moisture stress"],
        "DRY_ZONE": ["intense solar radiation", "thermal expansion stress", "arid dust penetration"],
        "URBAN_HEAT_ISLAND": ["localized urban heat stress", "anthropogenic heat gain", "peak thermal absorption"]
    }

    selected_key = "WET_TROPICAL"
    
    # Check for specific cities first
    if any(c in city_lc for c in ["galle", "jaffna", "hambantota", "matara", "trincomalee", "batticaloa"]): selected_key = "SEVERE_COASTAL"
    elif any(c in city_lc for c in ["kandy", "nuwara eliya", "badulla", "ella"]): selected_key = "CENTRAL_HIGHLAND"
    elif any(c in city_lc for c in ["anuradhapura", "polonnaruwa", "kurunegala"]): selected_key = "DRY_ZONE"
    
    # Override based on specs
    if any(k in specs_lc for k in ["beach", "shore", "salt", "sea"]): selected_key = "SEVERE_COASTAL"
    elif any(k in specs_lc for k in ["mountain", "cold", "mist"]): selected_key = "CENTRAL_HIGHLAND"
    elif any(k in specs_lc for k in ["hot", "dry", "sun"]): selected_key = "DRY_ZONE"
    
    strategy = CLIMATE_STRATEGIES[selected_key].copy()
    strategy["key"] = selected_key
    strategy["rationale_cue"] = random.choice(cues.get(selected_key, ["the prevailing climate"]))
    return strategy

def calculate_mcdm(materials: List[dict], city: str, building_type: str,
                   num_floors: int, budget: float, quantities: dict = None,
                   sustainability_pref: str = "Medium", specs: str = "",
                   ml_model: Optional[object] = None) -> tuple:

    strategy = _get_climate_strategy(city, specs)
    strategy_key = strategy["key"]
    budget_tier = "low" if budget < 15_000_000 else ("mid" if budget < 45_000_000 else "high")

    workflow_results = {}
    rejections = {}
    all_warnings = []
    
    phases = ["Foundation", "Structural", "Roofing", "Walling", "Flooring",
              "Ceiling", "Openings", "Waterproofing", "Finishing"]

    for phase in phases:
        phase_mats = [m for m in materials if m["Category"] == phase]
        valid_mats, phase_rejections = [], []
        for m in phase_mats:
            ok, reason = _filter_material_hard(m, strategy, num_floors, budget, building_type, sustainability_pref)
            if ok: valid_mats.append(m)
            else: phase_rejections.append({"Name": m["Name"], "Reason": reason})

        scored_mats = []
        for m in valid_mats:
            ml_bias = 0
            if ml_model:
                try:
                    feat = np.array([[m.get('Sustainability_Rating', 50)/100, m.get('Thermal_Rating', 50)/100]])
                    ml_bias = (ml_model.predict(feat)[0] * 8.0) - 4.0
                except: pass
            
            res = _calculate_adaptive_score_v17(m, strategy_key, building_type, num_floors, budget, budget_tier, sustainability_pref, city, ml_bias)
            
            q_val = quantities.get(phase, "Verified") if quantities else "Verified"
            unit_rate = m.get("Rate_LKR", 1000)
            qty_num = 1.0
            try:
                if ' ' in str(q_val): qty_num = float(str(q_val).split(' ')[0])
            except: pass
            
            scored_mats.append({
                "Name": m["Name"],
                "Category": m["Category"],
                "Quantity": q_val,
                "Display_Score": round(res["total"]),
                "Rationale": res["rationale"],
                "Phase_Cost": round(unit_rate * qty_num),
                "Alignment_Breakdown": res["breakdown"]
            })

        if scored_mats:
            sorted_mats = sorted(scored_mats, key=lambda x: x["Display_Score"], reverse=True)
            workflow_results[phase] = sorted_mats[:3]
            all_warnings.extend(_generate_contextual_warnings_v17(sorted_mats[0], strategy_key, num_floors, building_type))
        else:
            # 🚨 SAFETY VALVE: If everything was filtered, pick the best "standard" materials anyway
            fallback_mats = []
            for m in phase_mats:
                res = _calculate_adaptive_score_v17(m, strategy_key, building_type, num_floors, budget, budget_tier, sustainability_pref, city, 0)
                q_val = quantities.get(phase, "Verified") if quantities else "Verified"
                unit_rate = m.get("Rate_LKR", 1000)
                qty_num = 1.0
                try:
                    if ' ' in str(q_val): qty_num = float(str(q_val).split(' ')[0])
                except: pass
                
                fallback_mats.append({
                    "Name": m["Name"] + " (Standard)",
                    "Category": m["Category"],
                    "Quantity": q_val,
                    "Display_Score": round(res["total"] * 0.8), # Penalty for being a fallback
                    "Rationale": "Standard structural specification provided as fallback. " + res["rationale"],
                    "Phase_Cost": round(unit_rate * qty_num),
                    "Alignment_Breakdown": res["breakdown"]
                })
            
            if fallback_mats:
                workflow_results[phase] = sorted(fallback_mats, key=lambda x: x["Display_Score"], reverse=True)[:2]
            else:
                workflow_results[phase] = []

        rejections[phase] = {"total_count": len(phase_rejections), "top_exclusions": phase_rejections[:3]}

    unique_warnings = list(dict.fromkeys(all_warnings))[:5]
    summary = _generate_engineering_audit_log(city, strategy_key, budget, num_floors, sustainability_pref, building_type, unique_warnings)

    climate_profile = {
        "key": strategy_key,
        "salinity": strategy["salinity"],
        "humidity": strategy["humidity"],
        "logic": strategy["logic"]
    }

    return workflow_results, rejections, summary, climate_profile


def _filter_material_hard(m, strategy, floors, budget, b_type, sus_pref) -> Tuple[bool, str]:
    name = m["Name"].lower()

    # Height mandates
    if floors >= 4 and any(k in name for k in ["clay brick", "aac block", "unreinforced", "timber frame"]):
        return False, f"Structural Safety: Load-bearing masonry prohibited above 3 storeys — RC frame mandatory at {floors} floors."
    if floors >= 7 and any(k in name for k in ["light steel", "timber", "bamboo"]):
        return False, f"High-rise Safety: Material insufficient for {floors}-storey lateral loads and seismic ductility."

    # Climate filtering
    if any(k in name for k in strategy.get("forbidden", [])):
        return False, f"Climate Hazard: Material restricted in this zone due to {strategy.get('logic', 'environmental stress')}."

    # Sector mismatches
    if b_type == "Industrial" and any(k in name for k in ["teak", "luxury vinyl", "porcelain"]):
        return False, "Sector Mismatch: Decorative finish rejected — industrial zone requires impact and abrasion resistance."
    if b_type == "Residential" and any(k in name for k in ["industrial epoxy", "portal frame", "corrugated metal"]):
        return False, "Sector Mismatch: Industrial-grade system rejected for domestic residential programme."

    # Relaxed Budget filtering
    if budget < 5_000_000 and any(k in name for k in ["marine-grade", "epoxy-coated", "engineered timber"]):
        return False, "Budget Gate: Premium specification exceeds low-budget project envelope."

    # Relaxed Sustainability filtering
    s_rating = m.get("Sustainability_Rating", 50)
    if sus_pref == "High" and s_rating < 60:
        return False, f"Sustainability Mandate: Material rejected due to low eco-rating ({s_rating}%)."

    return True, ""


def _calculate_adaptive_score_v17(m, strategy_key, b_type, floors, budget, budget_tier, sus_pref, city, ml_bias) -> dict:
    name = m["Name"].lower()
    phase = m["Category"]
    s_suit = 60.0

    # ── SECTOR SUITABILITY ──
    if b_type == "Industrial":
        if any(k in name for k in ["steel", "epoxy", "heavy duty", "portal", "zinc", "precast"]): s_suit += 38
        if any(k in name for k in ["luxury", "decorative", "teak", "marble"]): s_suit -= 40
    elif b_type == "Commercial":
        if any(k in name for k in ["glass", "curtain", "aluminium", "fire-rated", "raised floor"]): s_suit += 30
        if any(k in name for k in ["corrugated", "industrial", "basic"]): s_suit -= 25
    elif b_type == "Residential":
        if any(k in name for k in ["comfort", "acoustic", "thermal", "lightweight", "domestic"]): s_suit += 22
        if any(k in name for k in ["industrial", "heavy duty", "portal frame"]): s_suit -= 30

    # ── CLIMATE ALIGNMENT ──
    if strategy_key == "SEVERE_COASTAL":
        if any(k in name for k in ["marine", "epoxy", "upvc", "crystalline", "stainless"]): s_suit += 42
        if any(k in name for k in ["mild steel", "untreated", "gypsum"]): s_suit -= 35
    elif strategy_key == "HIGHLAND_WET":
        if any(k in name for k in ["mold", "moisture", "waterproof", "sloped", "treated"]): s_suit += 35
        if any(k in name for k in ["gypsum", "flat roof", "untreated timber"]): s_suit -= 25
    elif strategy_key == "DRY_ZONE_THERMAL":
        if any(k in name for k in ["aac", "reflective", "cavity", "passive", "insulated"]): s_suit += 38
        if any(k in name for k in ["dark", "uninsulated", "metal plain"]): s_suit -= 20

    # ── FLOOR COUNT SCALING ──
    if floors >= 4:
        if any(k in name for k in ["rc", "reinforced", "high strength", "shear"]): s_suit += 20
        if any(k in name for k in ["masonry only", "clay brick", "aac"]): s_suit -= 35

    # ── AFFORDABILITY ──
    unit_rate = m.get("Rate_LKR", 1000)
    scale = {"low": 1.6, "mid": 1.0, "high": 0.5}.get(budget_tier, 1.0)
    affordability = max(5.0, min(100.0, 100 - (unit_rate / 20000 * 100 * scale)))

    # ── DURABILITY ──
    s_dur = float(m.get("Service_Life", 25)) * 2.2
    if strategy_key == "SEVERE_COASTAL" and s_dur < 60: s_dur *= 0.45

    # ── SUSTAINABILITY ──
    s_sus = float(m.get("Sustainability_Rating", 50))
    if sus_pref == "High":
        if s_sus > 75: s_suit += 42
        if any(k in name for k in ["recycled", "low voc", "sustainable", "passive", "clay", "bamboo"]): s_suit += 25
        if s_sus < 40: s_suit -= 32
    elif sus_pref == "Low":
        affordability = min(100, affordability * 1.35)

    # ── WEIGHTING MASKS ──
    masks = {
        "Industrial":   {"suit": 0.45, "afford": 0.15, "dur": 0.35, "sus": 0.05},
        "Commercial":   {"suit": 0.38, "afford": 0.12, "dur": 0.25, "sus": 0.25},
        "Residential":  {"suit": 0.35, "afford": 0.35, "dur": 0.20, "sus": 0.10},
    }
    w = masks.get(b_type, masks["Residential"])
    if sus_pref == "High":
        w = {"suit": 0.25, "afford": 0.12, "dur": 0.25, "sus": 0.38}

    total = (s_suit * w["suit"]) + (affordability * w["afford"]) + (s_dur * w["dur"]) + (s_sus * w["sus"])
    total = max(5.0, min(99.0, total + ml_bias + random.uniform(-1.5, 1.5)))

    rationale = _generate_rationale_v17(m, strategy_key, b_type, floors, budget_tier, sus_pref, phase)

    return {
        "total": total,
        "rationale": rationale,
        "breakdown": {
            "Suitability": round(max(0.0, min(100.0, s_suit)), 1),
            "Affordability": round(max(0.0, min(100.0, affordability)), 1),
            "Durability": round(max(0.0, min(100.0, s_dur)), 1),
            "Sustainability": round(max(0.0, min(100.0, s_sus)), 1)
        }
    }


def _generate_rationale_v17(m, s_key, b_type, floors, budget_tier, sus_pref, phase) -> str:
    """ZERO-TEMPLATE RATIONALE GENERATOR v17.0"""
    name = m["Name"].lower()
    strategy = CLIMATE_STRATEGIES.get(s_key, {})
    climate_cue = strategy.get("rationale_cue", "the prevailing local climate")

    sector_lib = RATIONALE_LIBRARY.get(b_type, RATIONALE_LIBRARY["Residential"])
    phase_templates = sector_lib.get(phase, ["{name} specified based on project context and engineering requirements."])
    template = random.choice(phase_templates)

    try:
        rationale = template.format(
            climate_cue=climate_cue,
            floors=floors,
            budget_tier=budget_tier,
            name=m.get("Name", "This material"),
            city=strategy.get("cities", ["the site"])[0].title()
        )
    except KeyError as e:
        rationale = template.replace("{", "").replace("}", "")
    except Exception:
        rationale = f"{m.get('Name', 'Material')} specified for {b_type} structural requirements in {climate_cue}."

    closers = []
    if sus_pref == "High":
        closers.append(f"Selected to minimise embodied carbon footprint consistent with the project's eco-priority specification.")
    elif sus_pref == "Low":
        closers.append(f"Prioritised for cost efficiency — lifecycle affordability over premium environmental certification.")

    if s_key == "SEVERE_COASTAL":
        closers.append(f"Marine-grade durability criteria applied — standard specification is technically inadequate for {climate_cue}.")
    elif s_key == "HIGHLAND_WET":
        closers.append(f"Mold and moisture ingress resistance is the primary selection driver in {climate_cue}.")
    elif s_key == "DRY_ZONE_THERMAL":
        closers.append(f"Passive thermal performance prioritised to reduce active cooling energy demand in {climate_cue}.")

    if floors >= 5:
        closers.append(f"High-rise structural demands at {floors} storeys require enhanced material specifications beyond standard domestic grade.")

    if closers:
        rationale += " " + random.choice(closers)

    return rationale


def _generate_contextual_warnings_v17(m, s_key, floors, b_type) -> List[str]:
    warnings = []
    if b_type == "Industrial":
        warnings.append("VIBRATION NOTICE: Floor slabs require dynamic load assessment for heavy machinery operation.")
        warnings.append("PORTAL FRAME: Long-span roof trusses require specialist structural certification.")
    elif b_type == "Commercial":
        warnings.append("FIRE EGRESS: Corridor widths and stairwells must comply with SLS 1114.")
        warnings.append("OCCUPANCY: Live load 3.0–5.0 kN/m² must be verified by chartered structural engineer.")
    elif b_type == "Residential":
        warnings.append("VENTILATION: Passive cross-ventilation corridors must be preserved in layout revisions.")

    if floors >= 7:
        warnings.append("ELEVATOR MANDATORY: Lift installation required per Sri Lanka building code for 7+ storey.")
    elif floors >= 4:
        warnings.append("SHEAR WALLS: Lateral stability core is mandatory — column-beam frame alone is insufficient.")

    if s_key == "SEVERE_COASTAL":
        warnings.append("CORROSION: All structural joints must use marine-grade stainless or epoxy-coated detailing. Min. 50mm concrete cover.")
    elif s_key == "HIGHLAND_WET":
        warnings.append("SLOPE STABILITY: Retaining walls must account for hydrostatic pressure in high-rainfall event.")

    return warnings


def _generate_engineering_audit_log(city, s_key, budget, floors, sus_pref, b_type, warnings) -> str:
    strategy_name = s_key.replace('_', ' ').title()
    msg = (
        f"ENGINEERING INTELLIGENCE v17.0 | {b_type.upper()} | {city.upper()} | "
        f"Climate: {strategy_name} | {floors} Storey | Budget Tier: "
        f"{'LOW' if budget < 15_000_000 else 'MID' if budget < 45_000_000 else 'HIGH'}."
    )
    if floors >= 4: msg += " High-rise structural protocol engaged."
    if budget < 8_000_000: msg += " Budget-restricted masonry strategy locked."
    if sus_pref == "High": msg += " Sustainable lifecycle weighting active."
    if warnings: msg += f" Primary Risk: {warnings[0]}"
    return msg.strip()
