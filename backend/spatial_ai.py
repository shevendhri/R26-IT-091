import math
import random

class SpatialIntelligence:
    """
    GreenConstructAI v17.0 - Spatial Intelligence Engine
    Generates deterministic architectural layouts and query-aware blueprint overlays.
    """
    
    def __init__(self):
        self.sectors = {
            "Residential": {"aspect": 1.2, "min_room_size": 9, "circulation_factor": 0.15},
            "Commercial": {"aspect": 1.5, "min_room_size": 12, "circulation_factor": 0.25},
            "Industrial": {"aspect": 2.0, "min_room_size": 25, "circulation_factor": 0.20}
        }

    def generate_layout(self, rooms, total_area, floors, b_type, query=""):
        """
        Synthesizes a 2D spatial arrangement based on room program and engineering constraints.
        """
        config = self.sectors.get(b_type, self.sectors["Residential"])
        area_per_floor = total_area / floors
        
        # Determine footprint dimensions
        width = math.sqrt(area_per_floor * config["aspect"])
        height = area_per_floor / width
        
        layout = {
            "footprint": {"w": round(width, 2), "h": round(height, 2)},
            "rooms": [],
            "overlays": [],
            "engineering_rationale": ""
        }
        
        # 1. Zoned Room Placement v18.1
        # Group rooms by zone type
        zones = {"HABITABLE": [], "WET": [], "SERVICE": []}
        for room_name, count in rooms.items():
            if not isinstance(count, int): continue
            for i in range(count):
                zones[self._get_zone_type(room_name)].append(room_name)

        # Placement Logic: Habitable rooms on one side, Wet/Service in a core/spine
        current_y = 0.0
        
        # Habitable Zone (Primary)
        hab_width = width * 0.65
        hab_y = 0.0
        for name in zones["HABITABLE"]:
            base_size = config["min_room_size"] * (2.0 if "Living" in name or "Workshop" in name else 1.2)
            r_w = hab_width * 0.9
            r_h = base_size / r_w
            if hab_y + r_h > height: break # Safety break
            layout["rooms"].append(self._create_room(name, 0.0, hab_y, r_w, r_h, "HABITABLE"))
            hab_y += r_h

        # Wet/Service Spine
        spine_width = width - hab_width
        spine_y = 0.0
        for name in zones["WET"] + zones["SERVICE"]:
            base_size = config["min_room_size"] * 0.8
            r_w = spine_width * 0.8
            r_h = base_size / r_w
            if spine_y + r_h > height: break
            layout["rooms"].append(self._create_room(name, hab_width, spine_y, r_w, r_h, self._get_zone_type(name)))
            spine_y += r_h

        # 2. Query-Aware Intelligence (The "Spatial Planner" part)
        if query:
            overlay = self._analyze_query_impact(query, layout, b_type)
            if overlay:
                layout["overlays"].append(overlay)
                layout["engineering_rationale"] = f"Spatial adjustment triggered by: '{query}'. {overlay['logic']}"
        
        # 3. Generate Blueprint Summary (Architectural Adjacency Logic)
        layout["blueprint_summary"] = self._synthesize_blueprint(layout["rooms"], floors, b_type)
        
        return layout

    def _synthesize_blueprint(self, rooms, floors, b_type):
        summary = []
        rooms_labels = [r["label"] for r in rooms]
        
        if b_type == "Residential":
            summary.append(f"GROUND FLOOR: Open-plan zoning with {', '.join(rooms_labels[:4])} centered around a central circulation spine.")
            if floors > 1:
                summary.append(f"UPPER FLOORS (1-{floors}): Private dormitory zoning with {', '.join(rooms_labels[4:8])} and vertical service shaft alignment.")
        elif b_type == "Commercial":
            summary.append(f"LEVEL 1: Public-facing lobby and retail suites. Central MEP service core integrated for vertical efficiency.")
            summary.append(f"PROFESSIONAL ZONES: Modular office arrangements with fire-rated corridors and dedicated service hubs.")
        else:
            summary.append(f"MAIN BAY: Clear-span industrial hall logic with {rooms_labels[0]} prioritized for clear heights.")
            summary.append(f"LOGISTICS: Perimeter positioning for loading docks and administrative blocks to optimize circulation flow.")
            
        return summary

    def _create_room(self, name, x, y, w, h, z_type):
        return {
            "id": f"{name}_{random.randint(1000, 9999)}",
            "label": name.replace("_", " "),
            "x": round(x, 2),
            "y": round(y, 2),
            "w": round(w, 2),
            "h": round(h, 2),
            "type": z_type
        }

    def _get_zone_type(self, name):
        name = name.lower()
        if any(x in name for x in ["living", "bedroom", "office", "master", "suite", "study"]): return "HABITABLE"
        if any(x in name for x in ["kitchen", "bath", "laundry", "toilet", "pantry"]): return "WET"
        return "SERVICE"

    def _analyze_query_impact(self, query, layout, b_type):
        """
        Detects if user is asking for spatial modifications.
        """
        q = query.lower()
        
        if "laundry" in q or "utility" in q:
            return {
                "type": "ADDITION",
                "target": "WET_ZONE",
                "label": "PROPOSED LAUNDRY EXTENSION",
                "x": layout["footprint"]["w"] * 0.7,
                "y": layout["footprint"]["h"] * 0.8,
                "w": 3.0,
                "h": 2.5,
                "logic": "Integrated into plumbing core for hydraulic efficiency."
            }
        
        if "expansion" in q or "larger" in q or "big" in q:
            return {
                "type": "MODIFICATION",
                "target": "HABITABLE",
                "label": "VOLUME EXPANSION ZONE",
                "x": 0,
                "y": 0,
                "w": layout["footprint"]["w"] * 0.4,
                "h": layout["footprint"]["h"] * 0.4,
                "logic": "Structural grid optimized for double-height void."
            }
            
        return None

spatial_engine = SpatialIntelligence()
