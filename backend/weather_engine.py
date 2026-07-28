import os
import requests
import asyncio
from dotenv import load_dotenv

load_dotenv()

# 🌦 ADVANCED CLIMATE ZONING ENGINE
# Categorized by Sri Lankan Geoclimatic Zones
CLIMATE_ZONES = {
    "EXTREME_COASTAL": {
        "cities": ["jaffna", "batticaloa", "trincomalee", "mannar"],
        "data": {
            "type": "Extreme Coastal Saline", "temp": "28\u00b0C - 34\u00b0C", "humidity": 75, "rainfall": 1200,
            "salinity": "Extreme", "corrosion": "Extreme", "flood": "Low", "fungal": "Moderate",
            "thermal": "High", "seismic": "Low", "uv": "Extreme"
        }
    },
    "MODERATE_COASTAL": {
        "cities": ["colombo", "galle", "matara", "negombo", "kalutara", "moratuwa", "chilaw"],
        "data": {
            "type": "Moderate Coastal Humid", "temp": "26\u00b0C - 32\u00b0C", "humidity": 80, "rainfall": 2400,
            "salinity": "Moderate", "corrosion": "Moderate", "flood": "Moderate", "fungal": "High",
            "thermal": "Moderate", "seismic": "Low", "uv": "High"
        }
    },
    "HIGHLAND": {
        "cities": ["nuwara eliya", "badulla", "ella", "haputale"],
        "data": {
            "type": "Highland Montane", "temp": "12\u00b0C - 22\u00b0C", "humidity": 82, "rainfall": 2200,
            "salinity": "None", "corrosion": "Low", "flood": "Low", "fungal": "High",
            "thermal": "None", "seismic": "Moderate", "uv": "Moderate"
        }
    },
    "DRY_ZONE": {
        "cities": ["anuradhapura", "polonnaruwa", "hambantota", "puttalam", "vavuniya", "kilinochchi"],
        "data": {
            "type": "Dry Zone Tropical Arid", "temp": "28\u00b0C - 36\u00b0C", "humidity": 60, "rainfall": 1100,
            "salinity": "None", "corrosion": "Low", "flood": "Low", "fungal": "Low",
            "thermal": "Extreme", "seismic": "Low", "uv": "Extreme"
        }
    },
    "INTERMEDIATE": {
        "cities": ["kurunegala", "kandy", "gampaha", "ratnapura", "kegalle", "avissawella"],
        "data": {
            "type": "Intermediate Tropical", "temp": "25\u00b0C - 32\u00b0C", "humidity": 70, "rainfall": 1800,
            "salinity": "None", "corrosion": "Moderate", "flood": "Low", "fungal": "Moderate",
            "thermal": "Moderate", "seismic": "Low", "uv": "High"
        }
    }
}

CITY_COORDS = {
    # Extreme Coastal
    "jaffna":       {"lat": 9.66,  "lon": 80.02, "distance_km": 1.0},
    "batticaloa":   {"lat": 7.71,  "lon": 81.69, "distance_km": 1.0},
    "trincomalee":  {"lat": 8.57,  "lon": 81.23, "distance_km": 1.0},
    "mannar":       {"lat": 8.98,  "lon": 79.90, "distance_km": 1.5},
    # Moderate Coastal
    "colombo":      {"lat": 6.92,  "lon": 79.86, "distance_km": 0.5},
    "galle":        {"lat": 6.05,  "lon": 80.21, "distance_km": 0.5},
    "matara":       {"lat": 5.94,  "lon": 80.54, "distance_km": 0.5},
    "negombo":      {"lat": 7.21,  "lon": 79.84, "distance_km": 1.5},
    "kalutara":     {"lat": 6.59,  "lon": 79.96, "distance_km": 1.0},
    "moratuwa":     {"lat": 6.77,  "lon": 79.88, "distance_km": 1.0},
    "chilaw":       {"lat": 7.58,  "lon": 79.80, "distance_km": 2.0},
    # Highland
    "nuwara eliya": {"lat": 6.97,  "lon": 80.78, "distance_km": 150.0},
    "badulla":      {"lat": 6.99,  "lon": 81.05, "distance_km": 100.0},
    # Dry Zone
    "anuradhapura": {"lat": 8.31,  "lon": 80.41, "distance_km": 90.0},
    "polonnaruwa":  {"lat": 7.94,  "lon": 81.00, "distance_km": 70.0},
    "hambantota":   {"lat": 6.12,  "lon": 81.12, "distance_km": 5.0},
    "puttalam":     {"lat": 8.03,  "lon": 79.84, "distance_km": 5.0},
    "vavuniya":     {"lat": 8.75,  "lon": 80.50, "distance_km": 55.0},
    # Intermediate / Wet
    "kurunegala":   {"lat": 7.48,  "lon": 80.36, "distance_km": 50.0},
    "kandy":        {"lat": 7.29,  "lon": 80.63, "distance_km": 100.0},
    "gampaha":      {"lat": 7.09,  "lon": 80.01, "distance_km": 20.0},
    "ratnapura":    {"lat": 6.68,  "lon": 80.40, "distance_km": 60.0},
    "kegalle":      {"lat": 7.25,  "lon": 80.35, "distance_km": 70.0},
    "avissawella":  {"lat": 6.95,  "lon": 80.21, "distance_km": 45.0},
}

def get_climate_profile(city: str):
    city_lc = city.lower()
    profile_data = None
    
    # 1. Base default from CLIMATE_ZONES
    for zone, cfg in CLIMATE_ZONES.items():
        if any(c in city_lc for c in cfg["cities"]):
            profile_data = cfg["data"].copy()
            break
            
    if not profile_data:
        profile_data = CLIMATE_ZONES["INTERMEDIATE"]["data"].copy()
        
    profile_data["city"] = city.capitalize()
    profile_data["status"] = "AI Climate Intelligence Active"
    
    # Distance logic for salinity
    coords = None
    for c_name, c_data in CITY_COORDS.items():
        if c_name in city_lc:
            coords = c_data
            break
    
    if coords is None:
        coords = {"lat": 7.87, "lon": 80.77, "distance_km": 50.0}
        
    profile_data["distance_km"] = coords["distance_km"]

    # Derive salinity from distance-to-coast \u2013 corrected thresholds
    # If zone already declares "Extreme" salinity (Extreme Coastal zone), keep it
    zone_salinity = profile_data.get("salinity", "Low")
    if zone_salinity == "Extreme":
        pass  # already correct
    elif coords["distance_km"] <= 2.0:
        profile_data["salinity"] = "Extreme"
    elif coords["distance_km"] <= 10.0:
        profile_data["salinity"] = "High"
    elif coords["distance_km"] <= 25.0:
        profile_data["salinity"] = "Moderate"
    else:
        profile_data["salinity"] = "Low"

    # City-specific rainfall overrides (where zone default is inaccurate)
    city_rainfall_overrides = {
        "ratnapura": 3750,   # Wettest city in Sri Lanka (Sabaragamuwa)
        "hambantota": 1000,  # Dry south coast
        "puttalam": 1050,    # Dry northwest coast
        "vavuniya": 1250,    # Semi-arid north
        "negombo": 2200,     # Wetter coastal suburb of Colombo
        "kalutara": 2500,    # South-western wet coast
        "gampaha": 1900,     # Sub-urban Colombo district
        "ratnapura": 3750,   # Sabaragamuwa ultra-wet zone
    }
    for city_key, rainfall_val in city_rainfall_overrides.items():
        if city_key in city_lc:
            profile_data["rainfall"] = rainfall_val
            break

    # Open-Meteo API Fetch
    climate_warning = None
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current=temperature_2m,relative_humidity_2m,precipitation"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})
        
        # Override with live API data if available
        if "temperature_2m" in current:
            profile_data["temp"] = f"{current['temperature_2m']}°C"
        if "relative_humidity_2m" in current:
            profile_data["humidity"] = current["relative_humidity_2m"]
        if "precipitation" in current:
            # simple scaling for annual rainfall approximation if needed, 
            # but we just keep the base rainfall logic for now unless we get historical.
            pass
            
    except Exception as e:
        climate_warning = f"Open-Meteo API failed ({e}). Using default climatic data."
        print(f"Climate API Error: {climate_warning}")
        
    if climate_warning:
        profile_data["climate_warning"] = climate_warning

    # Strict Validation
    required_keys = ["humidity", "rainfall", "salinity", "temp", "type"]
    for k in required_keys:
        if k not in profile_data or profile_data[k] is None or str(profile_data[k]).strip() in ["", "—", "-"]:
            raise ValueError(f"Climate profile missing required field: {k}")
            
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
