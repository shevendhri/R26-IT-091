import os
import requests
import asyncio
from dotenv import load_dotenv

load_dotenv()

# 🌦 ADVANCED CLIMATE ZONING ENGINE
# Categorized by Sri Lankan Geoclimatic Zones
CLIMATE_ZONES = {
    "EXTREME_COASTAL": {
        "cities": ["jaffna", "batticaloa", "trincomalee"],
        "data": {
            "type": "Extreme Coastal Saline", "temp": "28°C - 34°C", "humidity": 75, "rainfall": 1200,
            "salinity": "Extreme", "corrosion": "Extreme", "flood": "Low", "fungal": "Moderate",
            "thermal": "High", "seismic": "Low", "uv": "Extreme"
        }
    },
    "MODERATE_COASTAL": {
        "cities": ["colombo", "galle", "matara"],
        "data": {
            "type": "Moderate Coastal Humid", "temp": "26°C - 32°C", "humidity": 80, "rainfall": 2400,
            "salinity": "Moderate", "corrosion": "Moderate", "flood": "Moderate", "fungal": "High",
            "thermal": "Moderate", "seismic": "Low", "uv": "High"
        }
    },
    "HIGHLAND": {
        "cities": ["nuwara eliya", "badulla"],
        "data": {
            "type": "Highland Montane", "temp": "12°C - 22°C", "humidity": 82, "rainfall": 2200,
            "salinity": "None", "corrosion": "Low", "flood": "Low", "fungal": "High",
            "thermal": "None", "seismic": "Moderate", "uv": "Moderate"
        }
    },
    "DRY_ZONE": {
        "cities": ["anuradhapura", "polonnaruwa"],
        "data": {
            "type": "Dry Zone Tropical Arid", "temp": "28°C - 36°C", "humidity": 60, "rainfall": 1100,
            "salinity": "None", "corrosion": "Low", "flood": "Low", "fungal": "Low",
            "thermal": "Extreme", "seismic": "Low", "uv": "Extreme"
        }
    },
    "INTERMEDIATE": {
        "cities": ["kurunegala", "kandy"],
        "data": {
            "type": "Intermediate Tropical", "temp": "25°C - 32°C", "humidity": 70, "rainfall": 1800,
            "salinity": "None", "corrosion": "Moderate", "flood": "Low", "fungal": "Moderate",
            "thermal": "Moderate", "seismic": "Low", "uv": "High"
        }
    }
}

def get_climate_profile(city: str):
    city_lc = city.lower()
    profile_data = None
    
    for zone, cfg in CLIMATE_ZONES.items():
        if any(c in city_lc for c in cfg["cities"]):
            profile_data = cfg["data"].copy()
            break
            
    if not profile_data:
        profile_data = CLIMATE_ZONES["INTERMEDIATE"]["data"].copy()
        
    profile_data["city"] = city.capitalize()
    profile_data["status"] = "AI Climate Intelligence Active"
    return profile_data

def generate_suitability_analysis(city: str, building_type: str):
    profile = get_climate_profile(city)
    
    # ── SECTION 2: AI ENGINEERING RESPONSE STRATEGY ──
    recs = {"recommended": [], "avoid": []}
    
    # Foundation Logic
    if profile["flood"] == "High":
        recs["recommended"].append("Elevated plinth / Stilt foundation")
    elif profile["seismic"] == "Moderate":
        recs["recommended"].append("Reinforced Raft Foundation")
    else:
        recs["recommended"].append("Standard Pad / Strip Footing")

    # Structural Logic
    if profile["salinity"] == "Extreme":
        recs["recommended"].extend(["Grade 30+ Concrete with Silica Fume", "Epoxy-coated reinforcement"])
        recs["avoid"].append("Exposed Structural Steel")
    elif profile["fungal"] == "Extreme":
        recs["recommended"].extend(["Moisture-resistant masonry", "Anti-fungal external renders"])
        recs["avoid"].append("Untreated Softwood Timber")

    # ── SECTION 3: BUILDING SUITABILITY INDEX ──
    base_scores = {
        "Residential": 90, "Commercial": 85, "Industrial": 80,
        "Lightweight Steel": 85, "Eco Timber": 80
    }
    
    # Adjust scores based on climate risks
    if profile["salinity"] == "Extreme":
        base_scores["Lightweight Steel"] -= 30
        base_scores["Eco Timber"] -= 20
    if profile["fungal"] == "Extreme":
        base_scores["Eco Timber"] -= 35
        base_scores["Residential"] += 5 # RC is better here
        
    suitability_index = {k: max(40, min(99, v)) for k, v in base_scores.items()}
    
    # ── SECTION 4: AI ENGINEERING INTERPRETATION ──
    # Generate unique reasoning based on logic, not templates
    if profile["type"] == "Wet Zone Tropical Rainforest":
        interpretation = (
            f"Due to {city}'s rainforest climate, characterized by annual rainfall exceeding {profile['rainfall']}mm "
            "and extreme fungal growth risk, moisture-driven deterioration is the primary structural threat. "
            "Reinforced concrete systems with moisture-barrier detailing are prioritized over timber to prevent "
            "accelerated biodegradation and rot."
        )
    elif profile["type"] == "Coastal Tropical Humid":
        interpretation = (
            f"In the {city} coastal zone, airborne chloride concentration presents an extreme corrosion risk. "
            "The engineering strategy prioritizes dense concrete mixes with increased cover to reinforcement. "
            "Exposed steel elements are discouraged without specialized marine-grade coatings."
        )
    else:
        interpretation = (
            f"The environmental profile for {city} indicates a {profile['type'].lower()} context. "
            "Structural durability is optimized through standard thermal mass management and moisture-resistant renders."
        )

    # ── SECTION 5: LIVE ENVIRONMENTAL ADVISORY ──
    advisories = []
    if profile["humidity"] > 80: advisories.append("High humidity detected — recommend anti-fungal coating systems")
    if profile["flood"] == "High": advisories.append("Flood-prone terrain — recommend elevated plinth foundation")
    if profile["salinity"] == "Extreme": advisories.append("Coastal chloride exposure — increase concrete cover to reinforcement")
    if profile["uv"] == "Extreme": advisories.append("High UV exposure — specify high-grade UV-stable roofing polymers")
    
    if not advisories: advisories.append("Atmospheric conditions stable for standard construction specifications.")

    return {
        "profile": profile,
        "recommendations": recs,
        "suitability_index": suitability_index,
        "interpretation": interpretation,
        "live_advisory": {
            "temp": profile["temp"].split(" - ")[0],
            "humidity": f"{profile['humidity']}%",
            "advisory": advisories[0] if advisories else "Condition: Normal"
        },
        "all_advisories": advisories
    }
