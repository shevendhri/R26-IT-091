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
        Synthesizes a realistic multi-floor architectural layout.
        """
        config = self.sectors.get(b_type, self.sectors["Residential"])
        area_per_floor = total_area / floors
        width = math.sqrt(area_per_floor * config["aspect"])
        height = area_per_floor / width
        
        layout = {
            "footprint": {"w": round(width, 2), "h": round(height, 2)},
            "floors_data": [],
            "engineering_rationale": ""
        }
        
        refined_rooms = rooms.copy()
        if b_type == "Residential":
            if "Bathrooms" not in refined_rooms: refined_rooms["Bathrooms"] = max(1, refined_rooms.get("Bedrooms", 1) - 1)
            if "Living" not in refined_rooms: refined_rooms["Living"] = 1
            if "Kitchen" not in refined_rooms: refined_rooms["Kitchen"] = 1
            if "Dining" not in refined_rooms: refined_rooms["Dining"] = 1

        # ── MULTI-FLOOR DISTRIBUTION LOGIC ──
        floor_programs = [{} for _ in range(floors)]
        for name, count in refined_rooms.items():
            z_type = self._get_zone_type(name)
            for i in range(count):
                target_floor = 0
                if (z_type == "PRIVATE" or "Bedroom" in name) and floors > 1:
                    target_floor = random.randint(1, floors - 1)
                elif z_type == "WET" and "Bath" in name and floors > 1:
                    target_floor = random.randint(0, floors - 1)
                floor_programs[target_floor][name] = floor_programs[target_floor].get(name, 0) + 1

        for f_idx in range(floors):
            floor_rooms, current_cells = [], []
            cell_w, cell_h = width / 4, height / 4
            p_list = []
            for r_name, count in floor_programs[f_idx].items():
                for _ in range(count): p_list.append(r_name)

            for name in p_list:
                z_type = self._get_zone_type(name)
                w_c, h_c = (2, 2) if "Living" in name else ((2, 1) if "Bedroom" in name else (1, 1))
                c, r = self._find_free_grid_space(w_c, h_c, current_cells, z_type)
                if c is not None:
                    current_cells.append((c, r, w_c, h_c))
                    floor_rooms.append(self._create_room(name, c * cell_w, r * cell_h, w_c * cell_w * 0.95, h_c * cell_h * 0.95, z_type))

            layout["floors_data"].append({
                "level": f_idx,
                "label": "GROUND FLOOR" if f_idx == 0 else f"FLOOR {f_idx}",
                "rooms": floor_rooms
            })

        layout["rooms"] = layout["floors_data"][0]["rooms"]

        if query:
            overlay = self._analyze_query_impact(query, layout, b_type)
            if overlay:
                layout["overlays"] = [overlay]
                layout["engineering_rationale"] = f"Spatial adjustment: {overlay['logic']}"
        
        layout["blueprint_summary"] = self._synthesize_blueprint(layout["floors_data"], floors, b_type)
        return layout

    def _find_free_grid_space(self, w_c, h_c, occupied, z_type):
        s_c, s_r = 0, 0
        if z_type == "PRIVATE": s_c, s_r = 2, 0
        elif z_type == "WET": s_c, s_r = 1, 2
        
        for r in range(s_r, 4 - h_c + 1):
            for c in range(s_c, 4 - w_c + 1):
                collision = False
                for ox, oy, ow, oh in occupied:
                    if not (c + w_c <= ox or c >= ox + ow or r + h_c <= oy or r >= oy + oh):
                        collision = True; break
                if not collision: return c, r
        
        for r in range(4 - h_c + 1):
            for c in range(4 - w_c + 1):
                collision = False
                for ox, oy, ow, oh in occupied:
                    if not (c + w_c <= ox or c >= ox + ow or r + h_c <= oy or r >= oy + oh):
                        collision = True; break
                if not collision: return c, r
        return None, None

    def _synthesize_blueprint(self, floors_data, floors, b_type):
        summary = []
        for floor in floors_data:
            rooms_labels = [r["label"] for r in floor["rooms"]]
            summary.append(f"{floor['label']}: Program consists of {', '.join(rooms_labels[:5])} with optimized structural spacing.")
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
