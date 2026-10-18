# ──────────────────────────────────────────────────────────────────────────────
# GreenConstructAI — Furniture Knowledge Base
# ──────────────────────────────────────────────────────────────────────────────
# Each item defines:
#   name          – display name
#   w / h / d     – width / height / depth in metres
#   color         – hex colour string
#   shape         – "box" | "cylinder" | "flatbox"
#   placement     – default placement hint
#   functions     – semantic purpose tags for functional coverage scoring
#   building_types– list of compatible building sectors
#   min_room_area – minimum floor area (m²) to place this item
#   preferred_wall– directional hint ("north"|"south"|"east"|"west"|"center")
#   clearance     – minimum clearance zone around item (m) for circulation
#   material      – dominant material (for sustainability reasoning)
#   carbon_score  – embodied carbon score 0–1 (lower = better)
#   cost          – "Low" | "Medium" | "High" | "Premium"
#   priority      – placement priority (higher = placed first)
#   parts         – optional compound mesh list (dx/dy/dz offsets from centre)
# ──────────────────────────────────────────────────────────────────────────────

furniture_geometry = {

    # ══════════════════════════════════════════════════════
    #  BEDROOM
    # ══════════════════════════════════════════════════════
    "Bedroom": [
        {
            "name": "Bed", "w": 1.8, "h": 0.38, "d": 2.1,
            "color": "#E8DED0", "shape": "box", "placement": "wall-N",
            "functions": ["sleep"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 10.0, "preferred_wall": "north",
            "clearance": 0.9, "material": "Wood + Fabric", "carbon_score": 0.38, "cost": "Medium",
            "priority": 10,
            "parts": [
                {"dx": 0,    "dy": 0,    "dz": 0,     "w": 1.8,  "h": 0.38, "d": 2.1,  "color": "#E8DED0", "shape": "box"},
                {"dx": 0,    "dy": 0.30, "dz": -0.95, "w": 1.8,  "h": 0.55, "d": 0.10, "color": "#6B4C30", "shape": "box"},
                {"dx": -0.5, "dy": 0.24, "dz": -0.7,  "w": 0.55, "h": 0.09, "d": 0.38, "color": "#F8F4F0", "shape": "box"},
                {"dx":  0.5, "dy": 0.24, "dz": -0.7,  "w": 0.55, "h": 0.09, "d": 0.38, "color": "#F8F4F0", "shape": "box"},
                {"dx": 0,    "dy": 0.21, "dz": 0.35,  "w": 1.75, "h": 0.08, "d": 1.2,  "color": "#D4C8B8", "shape": "box"},
            ]
        },
        {
            "name": "Wardrobe", "w": 1.6, "h": 2.10, "d": 0.60,
            "color": "#5C4033", "shape": "box", "placement": "wall-E",
            "functions": ["storage", "clothing"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 10.0, "preferred_wall": "east",
            "clearance": 0.8, "material": "Engineered Wood", "carbon_score": 0.31, "cost": "Medium",
            "priority": 7,
            "parts": [
                {"dx": 0,    "dy": 0,    "dz": 0,    "w": 1.6,  "h": 2.10, "d": 0.60, "color": "#5C4033", "shape": "box"},
                {"dx": -0.4, "dy": 0,    "dz": -0.28,"w": 0.02, "h": 2.10, "d": 0.02, "color": "#3D2B1F", "shape": "box"},
                {"dx":  0.4, "dy": 0,    "dz": -0.28,"w": 0.02, "h": 2.10, "d": 0.02, "color": "#3D2B1F", "shape": "box"},
                {"dx": -0.2, "dy": 0,    "dz": -0.30,"w": 0.04, "h": 0.12, "d": 0.04, "color": "#C0A060", "shape": "cylinder"},
                {"dx":  0.2, "dy": 0,    "dz": -0.30,"w": 0.04, "h": 0.12, "d": 0.04, "color": "#C0A060", "shape": "cylinder"},
            ]
        },
        {
            "name": "Side Table", "w": 0.45, "h": 0.52, "d": 0.45,
            "color": "#A0855B", "shape": "box", "placement": "wall-N-offset",
            "functions": ["storage", "nightstand"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 10.0, "preferred_wall": "north",
            "clearance": 0.3, "material": "Wood", "carbon_score": 0.22, "cost": "Low",
            "priority": 6,
        },
    ],

    # ══════════════════════════════════════════════════════
    #  LIVING ROOM
    # ══════════════════════════════════════════════════════
    "Living Room": [
        {
            "name": "Sofa", "w": 2.4, "h": 0.42, "d": 0.95,
            "color": "#7C5C4E", "shape": "box", "placement": "center-S",
            "functions": ["seating", "lounging"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 14.0, "preferred_wall": "south",
            "clearance": 0.8, "material": "Fabric + Foam + Wood Frame", "carbon_score": 0.44, "cost": "Medium",
            "priority": 10,
            "parts": [
                {"dx": 0,     "dy": 0,    "dz": 0,    "w": 2.4,  "h": 0.42, "d": 0.95, "color": "#7C5C4E", "shape": "box"},
                {"dx": 0,     "dy": 0.45, "dz": -0.38,"w": 2.4,  "h": 0.48, "d": 0.18, "color": "#6B4C42", "shape": "box"},
                {"dx": -1.11, "dy": 0.30, "dz": 0,    "w": 0.18, "h": 0.30, "d": 0.95, "color": "#6B4C42", "shape": "box"},
                {"dx":  1.11, "dy": 0.30, "dz": 0,    "w": 0.18, "h": 0.30, "d": 0.95, "color": "#6B4C42", "shape": "box"},
                {"dx": -0.6,  "dy": 0.22, "dz": 0.1,  "w": 0.75, "h": 0.08, "d": 0.65, "color": "#9A7060", "shape": "box"},
                {"dx":  0.6,  "dy": 0.22, "dz": 0.1,  "w": 0.75, "h": 0.08, "d": 0.65, "color": "#9A7060", "shape": "box"},
            ]
        },
        {
            "name": "Coffee Table", "w": 1.1, "h": 0.42, "d": 0.6,
            "color": "#A0855B", "shape": "box", "placement": "center",
            "functions": ["surface", "display"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 14.0, "preferred_wall": "center",
            "clearance": 0.45, "material": "Wood", "carbon_score": 0.20, "cost": "Low",
            "priority": 8,
            "parts": [
                {"dx": 0,    "dy": 0,     "dz": 0, "w": 1.1,  "h": 0.05, "d": 0.6,  "color": "#8B6914", "shape": "box"},
                {"dx":-0.45,"dy":-0.18,"dz":-0.22,"w":0.06,"h":0.35, "d":0.06, "color": "#7A5C2E", "shape": "box"},
                {"dx": 0.45,"dy":-0.18,"dz":-0.22,"w":0.06,"h":0.35, "d":0.06, "color": "#7A5C2E", "shape": "box"},
                {"dx":-0.45,"dy":-0.18,"dz": 0.22,"w":0.06,"h":0.35, "d":0.06, "color": "#7A5C2E", "shape": "box"},
                {"dx": 0.45,"dy":-0.18,"dz": 0.22,"w":0.06,"h":0.35, "d":0.06, "color": "#7A5C2E", "shape": "box"},
            ]
        },
        {
            "name": "TV Unit", "w": 1.8, "h": 0.45, "d": 0.42,
            "color": "#2C2C2C", "shape": "box", "placement": "wall-N",
            "functions": ["entertainment", "media"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 14.0, "preferred_wall": "north",
            "clearance": 0.5, "material": "MDF + Electronics", "carbon_score": 0.60, "cost": "Medium",
            "priority": 7,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 1.8,  "h": 0.45, "d": 0.42, "color": "#2C2C2C", "shape": "box"},
                {"dx": 0, "dy": 0.62, "dz": -0.18,"w": 1.45, "h": 0.82, "d": 0.06, "color": "#0D0D1A", "shape": "box"},
                {"dx": 0, "dy": 0.62, "dz": -0.21,"w": 1.50, "h": 0.87, "d": 0.03, "color": "#1A1A1A", "shape": "box"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  DINING ROOM
    # ══════════════════════════════════════════════════════
    "Dining Room": [
        {
            "name": "Dining Table", "w": 1.6, "h": 0.75, "d": 0.9,
            "color": "#6B4226", "shape": "box", "placement": "center",
            "functions": ["dining", "social"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 12.0, "preferred_wall": "center",
            "clearance": 0.9, "material": "Hardwood", "carbon_score": 0.28, "cost": "Medium",
            "priority": 10,
            "parts": [
                {"dx": 0,    "dy": 0,     "dz": 0,    "w": 1.6,  "h": 0.06, "d": 0.9,  "color": "#7A4E2E", "shape": "box"},
                {"dx":-0.7,  "dy":-0.34,  "dz":-0.38, "w": 0.07, "h": 0.69, "d": 0.07, "color": "#5C3A22", "shape": "box"},
                {"dx": 0.7,  "dy":-0.34,  "dz":-0.38, "w": 0.07, "h": 0.69, "d": 0.07, "color": "#5C3A22", "shape": "box"},
                {"dx":-0.7,  "dy":-0.34,  "dz": 0.38, "w": 0.07, "h": 0.69, "d": 0.07, "color": "#5C3A22", "shape": "box"},
                {"dx": 0.7,  "dy":-0.34,  "dz": 0.38, "w": 0.07, "h": 0.69, "d": 0.07, "color": "#5C3A22", "shape": "box"},
            ]
        },
        {
            "name": "Dining Chair", "w": 0.45, "h": 0.85, "d": 0.45,
            "color": "#8B7355", "shape": "box", "placement": "center-N",
            "functions": ["seating"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 12.0, "preferred_wall": "center",
            "clearance": 0.5, "material": "Wood + Fabric", "carbon_score": 0.18, "cost": "Low",
            "priority": 8,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.45, "h": 0.06, "d": 0.42, "color": "#8B7355", "shape": "box"},
                {"dx": 0, "dy": 0.28, "dz":-0.18, "w": 0.45, "h": 0.42, "d": 0.05, "color": "#7A6242", "shape": "box"},
            ]
        },
        {
            "name": "Dining Chair 2", "w": 0.45, "h": 0.85, "d": 0.45,
            "color": "#8B7355", "shape": "box", "placement": "center-S",
            "functions": ["seating"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 12.0, "preferred_wall": "center",
            "clearance": 0.5, "material": "Wood + Fabric", "carbon_score": 0.18, "cost": "Low",
            "priority": 7,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.45, "h": 0.06, "d": 0.42, "color": "#8B7355", "shape": "box"},
                {"dx": 0, "dy": 0.28, "dz": 0.18, "w": 0.45, "h": 0.42, "d": 0.05, "color": "#7A6242", "shape": "box"},
            ]
        },
        {
            "name": "Dining Chair 3", "w": 0.45, "h": 0.85, "d": 0.45,
            "color": "#8B7355", "shape": "box", "placement": "center-E",
            "functions": ["seating"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 12.0, "preferred_wall": "center",
            "clearance": 0.5, "material": "Wood + Fabric", "carbon_score": 0.18, "cost": "Low",
            "priority": 6,
            "parts": [
                {"dx": 0,    "dy": 0,    "dz": 0,   "w": 0.42, "h": 0.06, "d": 0.45, "color": "#8B7355", "shape": "box"},
                {"dx": 0.18, "dy": 0.28, "dz": 0,   "w": 0.05, "h": 0.42, "d": 0.45, "color": "#7A6242", "shape": "box"},
            ]
        },
        {
            "name": "Dining Chair 4", "w": 0.45, "h": 0.85, "d": 0.45,
            "color": "#8B7355", "shape": "box", "placement": "center-W",
            "functions": ["seating"], "building_types": ["Residential", "Hotel", "Commercial"],
            "min_room_area": 12.0, "preferred_wall": "center",
            "clearance": 0.5, "material": "Wood + Fabric", "carbon_score": 0.18, "cost": "Low",
            "priority": 5,
            "parts": [
                {"dx": 0,     "dy": 0,    "dz": 0,   "w": 0.42, "h": 0.06, "d": 0.45, "color": "#8B7355", "shape": "box"},
                {"dx":-0.18,  "dy": 0.28, "dz": 0,   "w": 0.05, "h": 0.42, "d": 0.45, "color": "#7A6242", "shape": "box"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  KITCHEN
    # ══════════════════════════════════════════════════════
    "Kitchen": [
        {
            "name": "Kitchen Counter", "w": 2.6, "h": 0.92, "d": 0.62,
            "color": "#A89080", "shape": "box", "placement": "wall-S",
            "functions": ["cooking", "food_preparation"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 8.0, "preferred_wall": "south",
            "clearance": 1.0, "material": "Ceramic + Timber", "carbon_score": 0.35, "cost": "Medium",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 2.6,  "h": 0.88, "d": 0.60, "color": "#C8B8A8", "shape": "box"},
                {"dx": 0, "dy": 0.46, "dz": -0.01,"w": 2.65, "h": 0.04, "d": 0.63, "color": "#E0D4C8", "shape": "box"},
                {"dx": 0, "dy": 0.68, "dz":-0.29, "w": 2.65, "h": 0.40, "d": 0.04, "color": "#D8CCC0", "shape": "box"},
            ]
        },
        {
            "name": "Cabinets", "w": 2.5, "h": 0.70, "d": 0.35,
            "color": "#5C4033", "shape": "box", "placement": "wall-S-upper",
            "functions": ["storage"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 8.0, "preferred_wall": "south",
            "clearance": 0.4, "material": "Engineered Wood", "carbon_score": 0.29, "cost": "Medium",
            "priority": 7,
            "parts": [
                {"dx": 0, "dy": 0, "dz": 0, "w": 2.5, "h": 0.70, "d": 0.35, "color": "#7A5540", "shape": "box"},
                {"dx":-0.62,"dy":0,"dz":-0.16,"w":0.02,"h":0.70,"d":0.02,"color":"#4A3325","shape":"box"},
                {"dx": 0.62,"dy":0,"dz":-0.16,"w":0.02,"h":0.70,"d":0.02,"color":"#4A3325","shape":"box"},
            ]
        },
        {
            "name": "Sink", "w": 0.65, "h": 0.88, "d": 0.52,
            "color": "#D0D0D0", "shape": "box", "placement": "wall-E",
            "functions": ["hygiene", "cooking"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 8.0, "preferred_wall": "east",
            "clearance": 0.8, "material": "Stainless Steel", "carbon_score": 0.55, "cost": "Low",
            "priority": 9,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,   "w": 0.65, "h": 0.85, "d": 0.50, "color": "#C8C8C8", "shape": "box"},
                {"dx": 0, "dy": 0.44, "dz": 0,   "w": 0.50, "h": 0.08, "d": 0.38, "color": "#9A9A9A", "shape": "flatbox"},
                {"dx": 0, "dy": 0.55, "dz":-0.18,"w": 0.04, "h": 0.18, "d": 0.04, "color": "#B8B0A8", "shape": "cylinder"},
            ]
        },
        {
            "name": "Stove", "w": 0.75, "h": 0.92, "d": 0.62,
            "color": "#2C2C2C", "shape": "box", "placement": "wall-S-offset",
            "functions": ["cooking"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 8.0, "preferred_wall": "south",
            "clearance": 1.0, "material": "Stainless Steel", "carbon_score": 0.68, "cost": "Medium",
            "priority": 8,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.75, "h": 0.90, "d": 0.60, "color": "#3A3A3A", "shape": "box"},
                {"dx": 0, "dy": 0.46, "dz": 0,    "w": 0.72, "h": 0.04, "d": 0.58, "color": "#1A1A1A", "shape": "flatbox"},
                {"dx":-0.2,"dy":0.50, "dz":-0.14, "w": 0.16, "h": 0.03, "d": 0.16, "color": "#555555", "shape": "cylinder"},
                {"dx": 0.2,"dy":0.50, "dz":-0.14, "w": 0.16, "h": 0.03, "d": 0.16, "color": "#555555", "shape": "cylinder"},
                {"dx":-0.2,"dy":0.50, "dz": 0.12, "w": 0.16, "h": 0.03, "d": 0.16, "color": "#555555", "shape": "cylinder"},
                {"dx": 0.2,"dy":0.50, "dz": 0.12, "w": 0.16, "h": 0.03, "d": 0.16, "color": "#555555", "shape": "cylinder"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  BATHROOM
    # ══════════════════════════════════════════════════════
    "Bathroom": [
        {
            "name": "Toilet", "w": 0.40, "h": 0.42, "d": 0.68,
            "color": "#F0F0F0", "shape": "box", "placement": "wall-S",
            "functions": ["sanitation"], "building_types": ["Residential", "Hotel", "Healthcare", "Commercial"],
            "min_room_area": 3.0, "preferred_wall": "south",
            "clearance": 0.7, "material": "Ceramic", "carbon_score": 0.25, "cost": "Low",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0.08, "w": 0.38, "h": 0.38, "d": 0.52, "color": "#F2F2F0", "shape": "box"},
                {"dx": 0, "dy": 0.21, "dz": 0.08, "w": 0.36, "h": 0.04, "d": 0.48, "color": "#E8E6E2", "shape": "flatbox"},
                {"dx": 0, "dy": 0.14, "dz":-0.26, "w": 0.36, "h": 0.34, "d": 0.16, "color": "#F2F2F0", "shape": "box"},
            ]
        },
        {
            "name": "Sink", "w": 0.52, "h": 0.85, "d": 0.44,
            "color": "#E8E8E8", "shape": "cylinder", "placement": "wall-E",
            "functions": ["hygiene"], "building_types": ["Residential", "Hotel", "Healthcare", "Commercial"],
            "min_room_area": 3.0, "preferred_wall": "east",
            "clearance": 0.6, "material": "Ceramic", "carbon_score": 0.20, "cost": "Low",
            "priority": 9,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.50, "h": 0.12, "d": 0.42, "color": "#E8E8E8", "shape": "box"},
                {"dx": 0, "dy":-0.35, "dz": 0.05, "w": 0.18, "h": 0.58, "d": 0.18, "color": "#DCDCDC", "shape": "cylinder"},
                {"dx": 0, "dy": 0.12, "dz":-0.18, "w": 0.04, "h": 0.18, "d": 0.04, "color": "#B8B0A8", "shape": "cylinder"},
            ]
        },
        {
            "name": "Shower", "w": 0.95, "h": 0.06, "d": 0.95,
            "color": "#B8D4E3", "shape": "flatbox", "placement": "corner-NE",
            "functions": ["hygiene", "bathing"], "building_types": ["Residential", "Hotel"],
            "min_room_area": 5.0, "preferred_wall": "north",
            "clearance": 0.4, "material": "Ceramic + Glass", "carbon_score": 0.38, "cost": "Medium",
            "priority": 7,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.95, "h": 0.06, "d": 0.95, "color": "#B8D4E3", "shape": "flatbox"},
                {"dx": 0, "dy": 0.85, "dz":-0.42, "w": 0.04, "h": 0.90, "d": 0.04, "color": "#A0A8B0", "shape": "cylinder"},
                {"dx": 0, "dy": 0.90, "dz":-0.30, "w": 0.16, "h": 0.04, "d": 0.16, "color": "#909898", "shape": "cylinder"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  UTILITY ROOM
    # ══════════════════════════════════════════════════════
    "Utility Room": [
        {
            "name": "Storage Unit", "w": 1.2, "h": 1.85, "d": 0.50,
            "color": "#7A7A7A", "shape": "box", "placement": "wall-S",
            "functions": ["storage"], "building_types": ["Residential", "Commercial", "Industrial"],
            "min_room_area": 6.0, "preferred_wall": "south",
            "clearance": 0.7, "material": "Steel", "carbon_score": 0.42, "cost": "Low",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 1.2,  "h": 1.85, "d": 0.50, "color": "#7A7A7A", "shape": "box"},
                {"dx": 0, "dy": 0.45, "dz":-0.22, "w": 1.16, "h": 0.03, "d": 0.48, "color": "#9A9A9A", "shape": "box"},
                {"dx": 0, "dy": 0.78, "dz":-0.22, "w": 1.16, "h": 0.03, "d": 0.48, "color": "#9A9A9A", "shape": "box"},
                {"dx": 0, "dy": 1.10, "dz":-0.22, "w": 1.16, "h": 0.03, "d": 0.48, "color": "#9A9A9A", "shape": "box"},
            ]
        },
        {
            "name": "Washing Machine", "w": 0.62, "h": 0.86, "d": 0.62,
            "color": "#E0E0E0", "shape": "box", "placement": "wall-E",
            "functions": ["laundry"], "building_types": ["Residential"],
            "min_room_area": 5.0, "preferred_wall": "east",
            "clearance": 0.7, "material": "Steel + Plastics", "carbon_score": 0.72, "cost": "Medium",
            "priority": 8,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.62, "h": 0.86, "d": 0.62, "color": "#E8E8E8", "shape": "box"},
                {"dx": 0, "dy": 0.06, "dz":-0.29, "w": 0.36, "h": 0.36, "d": 0.06, "color": "#A0B8C8", "shape": "cylinder"},
                {"dx": 0, "dy": 0.36, "dz":-0.30, "w": 0.55, "h": 0.06, "d": 0.04, "color": "#C0D0D8", "shape": "box"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  OFFICE (Commercial / Study)
    # ══════════════════════════════════════════════════════
    "Office": [
        {
            "name": "Office Desk", "w": 1.6, "h": 0.78, "d": 0.80,
            "color": "#A0855B", "shape": "box", "placement": "wall-N",
            "functions": ["working", "computing"], "building_types": ["Commercial", "Residential", "Educational"],
            "min_room_area": 9.0, "preferred_wall": "north",
            "clearance": 1.2, "material": "Engineered Wood", "carbon_score": 0.30, "cost": "Medium",
            "priority": 10,
            "parts": [
                {"dx": 0,    "dy": 0,     "dz": 0,    "w": 1.6,  "h": 0.04, "d": 0.80, "color": "#A0855B", "shape": "box"},
                {"dx":-0.75, "dy":-0.36,  "dz": 0,    "w": 0.04, "h": 0.72, "d": 0.78, "color": "#8B6F40", "shape": "box"},
                {"dx": 0.75, "dy":-0.36,  "dz": 0,    "w": 0.04, "h": 0.72, "d": 0.78, "color": "#8B6F40", "shape": "box"},
                {"dx": 0,    "dy": 0.38,  "dz":-0.34, "w": 0.60, "h": 0.38, "d": 0.04, "color": "#1A1A2E", "shape": "box"},
                {"dx": 0,    "dy": 0.19,  "dz":-0.32, "w": 0.08, "h": 0.22, "d": 0.08, "color": "#3A3A3A", "shape": "box"},
            ]
        },
        {
            "name": "Ergonomic Chair", "w": 0.62, "h": 1.10, "d": 0.62,
            "color": "#2A2A3E", "shape": "cylinder", "placement": "center-N",
            "functions": ["seating", "working"], "building_types": ["Commercial", "Residential", "Educational"],
            "min_room_area": 9.0, "preferred_wall": "center",
            "clearance": 1.0, "material": "Recycled Mesh + Aluminium", "carbon_score": 0.39, "cost": "High",
            "priority": 9,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.55, "h": 0.08, "d": 0.52, "color": "#2A2A3E", "shape": "cylinder"},
                {"dx": 0, "dy": 0.38, "dz":-0.24, "w": 0.48, "h": 0.50, "d": 0.06, "color": "#1A1A2E", "shape": "box"},
                {"dx": 0, "dy":-0.26, "dz": 0,    "w": 0.08, "h": 0.44, "d": 0.08, "color": "#4A4A5E", "shape": "cylinder"},
            ]
        },
        {
            "name": "Meeting Table", "w": 2.4, "h": 0.76, "d": 1.0,
            "color": "#8B7355", "shape": "box", "placement": "center",
            "functions": ["meeting", "collaboration"], "building_types": ["Commercial"],
            "min_room_area": 20.0, "preferred_wall": "center",
            "clearance": 1.2, "material": "Tempered Glass + Steel", "carbon_score": 0.52, "cost": "High",
            "priority": 8,
            "parts": [
                {"dx": 0,    "dy": 0,     "dz": 0,    "w": 2.4,  "h": 0.05, "d": 1.0,  "color": "#B0A080", "shape": "box"},
                {"dx":-1.1,  "dy":-0.35,  "dz": 0,    "w": 0.05, "h": 0.70, "d": 0.70, "color": "#707070", "shape": "box"},
                {"dx": 1.1,  "dy":-0.35,  "dz": 0,    "w": 0.05, "h": 0.70, "d": 0.70, "color": "#707070", "shape": "box"},
            ]
        },
        {
            "name": "Filing Cabinet", "w": 0.50, "h": 1.30, "d": 0.60,
            "color": "#6A6A6A", "shape": "box", "placement": "wall-E",
            "functions": ["storage", "filing"], "building_types": ["Commercial", "Educational", "Healthcare"],
            "min_room_area": 9.0, "preferred_wall": "east",
            "clearance": 0.6, "material": "Steel", "carbon_score": 0.45, "cost": "Low",
            "priority": 5,
            "parts": [
                {"dx": 0,    "dy": 0,     "dz": 0,    "w": 0.50, "h": 1.30, "d": 0.60, "color": "#6A6A6A", "shape": "box"},
                {"dx": 0,    "dy": 0.32,  "dz":-0.29, "w": 0.44, "h": 0.02, "d": 0.04, "color": "#888888", "shape": "box"},
                {"dx": 0,    "dy":-0.05,  "dz":-0.29, "w": 0.44, "h": 0.02, "d": 0.04, "color": "#888888", "shape": "box"},
                {"dx": 0,    "dy":-0.42,  "dz":-0.29, "w": 0.44, "h": 0.02, "d": 0.04, "color": "#888888", "shape": "box"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  HOSPITAL WARD — Clinically appropriate furniture
    # ══════════════════════════════════════════════════════
    "Hospital Ward": [
        {
            "name": "Hospital Bed", "w": 1.1, "h": 0.85, "d": 2.1,
            "color": "#cbd5e1", "shape": "box", "placement": "wall-N",
            "functions": ["sleep", "medical_monitoring", "patient_care"],
            "building_types": ["Healthcare"],
            "min_room_area": 16.0, "preferred_wall": "north",
            "clearance": 1.2, "material": "Powder-coated Steel", "carbon_score": 0.41, "cost": "High",
            "priority": 10,
            "parts": [
                {"dx": 0,    "dy": 0.1,  "dz": 0,    "w": 1.1,  "h": 0.30, "d": 2.1,  "color": "#f8fafc", "shape": "box"},
                {"dx": 0,    "dy": -0.15,"dz": 0,    "w": 1.0,  "h": 0.20, "d": 2.0,  "color": "#94a3b8", "shape": "box"},
                {"dx": 0,    "dy": 0.35, "dz": -1.0, "w": 1.1,  "h": 0.60, "d": 0.08, "color": "#64748b", "shape": "box"},
                {"dx": 0,    "dy": 0.15, "dz": 1.0,  "w": 1.1,  "h": 0.40, "d": 0.08, "color": "#64748b", "shape": "box"},
                {"dx": -0.52,"dy": 0.3,  "dz": 0,    "w": 0.05, "h": 0.40, "d": 1.4,  "color": "#cbd5e1", "shape": "box"},
                {"dx":  0.52,"dy": 0.3,  "dz": 0,    "w": 0.05, "h": 0.40, "d": 1.4,  "color": "#cbd5e1", "shape": "box"},
            ]
        },
        {
            "name": "Visitor Chair", "w": 0.55, "h": 0.82, "d": 0.55,
            "color": "#475569", "shape": "box", "placement": "wall-N-offset",
            "functions": ["seating", "visitor_support"],
            "building_types": ["Healthcare"],
            "min_room_area": 14.0, "preferred_wall": "north",
            "clearance": 0.7, "material": "Vinyl + Steel Frame", "carbon_score": 0.30, "cost": "Low",
            "priority": 7,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.52, "h": 0.06, "d": 0.50, "color": "#475569", "shape": "box"},
                {"dx": 0, "dy": 0.32, "dz":-0.22, "w": 0.50, "h": 0.40, "d": 0.06, "color": "#334155", "shape": "box"},
            ]
        },
        {
            "name": "Bedside Cabinet", "w": 0.50, "h": 0.75, "d": 0.50,
            "color": "#94a3b8", "shape": "box", "placement": "wall-N-offset",
            "functions": ["storage", "patient_support"],
            "building_types": ["Healthcare"],
            "min_room_area": 14.0, "preferred_wall": "north",
            "clearance": 0.4, "material": "Laminated MDF", "carbon_score": 0.28, "cost": "Low",
            "priority": 8,
        },
        {
            "name": "Vital Signs Monitor", "w": 0.45, "h": 1.40, "d": 0.45,
            "color": "#1e293b", "shape": "box", "placement": "wall-E",
            "functions": ["medical_monitoring", "diagnostics"],
            "building_types": ["Healthcare"],
            "min_room_area": 14.0, "preferred_wall": "east",
            "clearance": 0.8, "material": "ABS Plastic + Electronics", "carbon_score": 0.68, "cost": "Premium",
            "priority": 6,
            "parts": [
                {"dx": 0, "dy": 0,    "dz": 0,    "w": 0.40, "h": 1.10, "d": 0.40, "color": "#1e293b", "shape": "box"},
                {"dx": 0, "dy": 0.60, "dz":-0.19, "w": 0.36, "h": 0.28, "d": 0.04, "color": "#0f172a", "shape": "box"},
            ]
        },
    ],

    # ══════════════════════════════════════════════════════
    #  OPERATING THEATRE
    # ══════════════════════════════════════════════════════
    "Operating Theatre": [
        {
            "name": "Operating Table", "w": 0.8, "h": 0.9, "d": 2.0,
            "color": "#475569", "shape": "box", "placement": "center",
            "functions": ["surgery", "patient_care"],
            "building_types": ["Healthcare"],
            "min_room_area": 30.0, "preferred_wall": "center",
            "clearance": 1.5, "material": "Stainless Steel", "carbon_score": 0.55, "cost": "Premium",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0.15, "dz": 0, "w": 0.8, "h": 0.15, "d": 2.0, "color": "#0f172a", "shape": "box"},
                {"dx": 0, "dy": -0.3, "dz": 0, "w": 0.4, "h": 0.6, "d": 0.6, "color": "#94a3b8", "shape": "cylinder"}
            ]
        },
        {
            "name": "Surgical Light", "w": 0.8, "h": 1.8, "d": 0.8,
            "color": "#f8fafc", "shape": "cylinder", "placement": "center-N",
            "functions": ["lighting", "surgery"],
            "building_types": ["Healthcare"],
            "min_room_area": 25.0, "preferred_wall": "center",
            "clearance": 1.0, "material": "Aluminium + LED", "carbon_score": 0.30, "cost": "Premium",
            "priority": 9,
            "parts": [
                {"dx": 0, "dy": 0.8, "dz": 0, "w": 0.8, "h": 0.1, "d": 0.8, "color": "#e2e8f0", "shape": "cylinder"},
                {"dx": 0, "dy": 0.1, "dz": 0, "w": 0.05, "h": 1.4, "d": 0.05, "color": "#94a3b8", "shape": "cylinder"}
            ]
        },
        {
            "name": "Equipment Monitor", "w": 0.6, "h": 1.5, "d": 0.6,
            "color": "#1e293b", "shape": "box", "placement": "wall-W",
            "functions": ["medical_monitoring"],
            "building_types": ["Healthcare"],
            "min_room_area": 25.0, "preferred_wall": "west",
            "clearance": 0.8, "material": "ABS Plastic + Electronics", "carbon_score": 0.66, "cost": "Premium",
            "priority": 7,
        }
    ],

    # ══════════════════════════════════════════════════════
    #  CONSULTATION ROOM
    # ══════════════════════════════════════════════════════
    "Consultation Room": [
        {
            "name": "Examination Table", "w": 0.8, "h": 0.8, "d": 1.9,
            "color": "#cbd5e1", "shape": "box", "placement": "wall-E",
            "functions": ["examination", "patient_care"],
            "building_types": ["Healthcare"],
            "min_room_area": 12.0, "preferred_wall": "east",
            "clearance": 1.0, "material": "Vinyl + Steel", "carbon_score": 0.40, "cost": "High",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0.1, "dz": 0, "w": 0.8, "h": 0.15, "d": 1.9, "color": "#f8fafc", "shape": "box"},
                {"dx": 0, "dy": -0.3, "dz": 0, "w": 0.75, "h": 0.6, "d": 1.8, "color": "#64748b", "shape": "box"}
            ]
        },
        {
            "name": "Doctor Desk", "w": 1.3, "h": 0.76, "d": 0.7,
            "color": "#cbd5e1", "shape": "box", "placement": "wall-N",
            "functions": ["working", "consultation"],
            "building_types": ["Healthcare"],
            "min_room_area": 12.0, "preferred_wall": "north",
            "clearance": 1.0, "material": "Laminated MDF", "carbon_score": 0.32, "cost": "Medium",
            "priority": 8,
        },
        {
            "name": "Office Chair", "w": 0.55, "h": 0.85, "d": 0.55,
            "color": "#334155", "shape": "cylinder", "placement": "center-N",
            "functions": ["seating", "working"],
            "building_types": ["Healthcare", "Commercial"],
            "min_room_area": 10.0, "preferred_wall": "center",
            "clearance": 0.9, "material": "Recycled Mesh + Aluminium", "carbon_score": 0.38, "cost": "Medium",
            "priority": 7,
        }
    ],

    # ══════════════════════════════════════════════════════
    #  LABORATORY
    # ══════════════════════════════════════════════════════
    "Laboratory": [
        {
            "name": "Lab Bench", "w": 2.2, "h": 0.9, "d": 0.75,
            "color": "#cbd5e1", "shape": "box", "placement": "wall-S",
            "functions": ["research", "experiment"],
            "building_types": ["Healthcare", "Educational"],
            "min_room_area": 20.0, "preferred_wall": "south",
            "clearance": 1.2, "material": "Chemical-resistant Laminate + Steel", "carbon_score": 0.48, "cost": "High",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0.43, "dz": 0, "w": 2.2, "h": 0.04, "d": 0.75, "color": "#f8fafc", "shape": "box"},
                {"dx": 0, "dy": -0.05, "dz": 0, "w": 2.1, "h": 0.86, "d": 0.7, "color": "#94a3b8", "shape": "box"}
            ]
        },
        {
            "name": "Lab Stool", "w": 0.4, "h": 0.65, "d": 0.4,
            "color": "#475569", "shape": "cylinder", "placement": "center",
            "functions": ["seating"],
            "building_types": ["Healthcare", "Educational"],
            "min_room_area": 15.0, "preferred_wall": "center",
            "clearance": 0.6, "material": "Stainless Steel + Vinyl", "carbon_score": 0.33, "cost": "Medium",
            "priority": 7,
        }
    ],

    # ══════════════════════════════════════════════════════
    #  EMERGENCY DEPARTMENT
    # ══════════════════════════════════════════════════════
    "Emergency Department": [
        {
            "name": "Gurney", "w": 0.9, "h": 0.8, "d": 2.0,
            "color": "#e2e8f0", "shape": "box", "placement": "center",
            "functions": ["patient_transport", "patient_care"],
            "building_types": ["Healthcare"],
            "min_room_area": 18.0, "preferred_wall": "center",
            "clearance": 1.4, "material": "Aluminium + Vinyl", "carbon_score": 0.38, "cost": "High",
            "priority": 10,
            "parts": [
                {"dx": 0, "dy": 0.1, "dz": 0, "w": 0.9, "h": 0.15, "d": 2.0, "color": "#f8fafc", "shape": "box"},
                {"dx": 0, "dy": -0.3, "dz": 0, "w": 0.8, "h": 0.6, "d": 1.8, "color": "#475569", "shape": "box"}
            ]
        },
        {
            "name": "Defibrillator Cart", "w": 0.6, "h": 1.2, "d": 0.6,
            "color": "#ef4444", "shape": "box", "placement": "wall-E",
            "functions": ["emergency_response", "medical_equipment"],
            "building_types": ["Healthcare"],
            "min_room_area": 15.0, "preferred_wall": "east",
            "clearance": 1.0, "material": "ABS Plastic + Electronics", "carbon_score": 0.65, "cost": "Premium",
            "priority": 8,
        }
    ],
}

# ── Backward-compat: simple name list ─────────────────────────────────────────
furniture_by_type = {k: [item["name"] for item in v] for k, v in furniture_geometry.items()}


def _resolve_key(room_label: str) -> str:
    """Normalise a room label to a canonical catalog key."""
    key = room_label.strip().title()
    lc = key.lower()

    # Healthcare / Hospital mappings
    if "ward" in lc or "patient" in lc or "icu" in lc:
        return "Hospital Ward"
    if "theatre" in lc or "operating" in lc:
        return "Operating Theatre"
    if "consult" in lc or "clinic" in lc or "exam" in lc:
        return "Consultation Room"
    if "lab" in lc or "pharmacy" in lc:
        return "Laboratory"
    if "emergency" in lc:
        return "Emergency Department"

    # Residential / Generic
    if "bedroom" in lc or "sleeping" in lc or "master" in lc or "guest room" in lc:
        return "Bedroom"
    if "living" in lc or "lounge" in lc:
        return "Living Room"
    if "dining" in lc:
        return "Dining Room"
    if "kitchen" in lc or "pantry" in lc:
        return "Kitchen"
    if "bath" in lc or "washroom" in lc or "wc" in lc or "toilet" in lc:
        return "Bathroom"
    if "utility" in lc or "service" in lc or "stairway" in lc or "laundry" in lc:
        return "Utility Room"
    if "office" in lc or "study" in lc or "admin" in lc or "home office" in lc:
        return "Office"

    # Commercial fallbacks
    if "lobby" in lc or "reception" in lc:
        return "Living Room"
    if "meeting" in lc or "conference" in lc:
        return "Office"
    if "restroom" in lc:
        return "Bathroom"
    if "server" in lc or "plant" in lc or "electrical" in lc:
        return "Utility Room"
    if "production" in lc or "storage" in lc or "loading" in lc or "elevator" in lc or "circulation" in lc:
        return "Utility Room"

    return "Utility Room"  # safe fallback – never empty


def get_furniture_for_room(room_label: str):
    """Return a list of furniture *name strings* (backward compatible)."""
    key = _resolve_key(room_label)
    return furniture_by_type.get(key, ["Generic Furniture"])


def get_furniture_geometry(room_label: str):
    """Return a list of furniture geometry dicts for the given room label."""
    key = _resolve_key(room_label)
    return furniture_geometry.get(key, [
        {
            "name": "Generic Item", "w": 0.8, "h": 0.8, "d": 0.8,
            "color": "#888888", "shape": "box", "placement": "center",
            "functions": ["general"], "building_types": [],
            "min_room_area": 1.0, "preferred_wall": "center",
            "clearance": 0.5, "material": "Unknown", "carbon_score": 0.50, "cost": "Low",
            "priority": 1,
        }
    ])
