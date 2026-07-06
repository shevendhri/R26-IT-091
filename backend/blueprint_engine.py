import math
from typing import Dict, List, Any
from questionnaire_engine import UserProfile
from room_engine import compute_furniture_placement


class BlueprintEngine:
    def __init__(self):
        # Footprint aspect ratios and circulation factors per building type
        self.sector_configs = {
            "Residential":  {"aspect": 1.25, "circulation_factor": 0.15},
            "Commercial":   {"aspect": 1.60, "circulation_factor": 0.25},
            "Industrial":   {"aspect": 2.20, "circulation_factor": 0.12},
            "Educational":  {"aspect": 1.80, "circulation_factor": 0.28},
            "Healthcare":   {"aspect": 1.50, "circulation_factor": 0.35},
            "Hotel":        {"aspect": 1.40, "circulation_factor": 0.30},
        }

    # ──────────────────────────────────────────────────────────────────────────
    #  RELATIONSHIP DESCRIPTIONS
    # ──────────────────────────────────────────────────────────────────────────

    def _relationships(self, building_type: str, profile: UserProfile) -> List[str]:
        bt = building_type
        if bt == "Residential":
            rel = [
                "Kitchen is positioned for efficient food service.",
                "Bedrooms are grouped in private zones.",
                "Living area acts as the central hub.",
            ]
            if profile.future_expansion == "Vertical":
                rel.append("Stairway Core is centrally placed.")
            if (profile.elderly_occupants or 0) > 0:
                rel.append("Ground floor accessibility prioritized for elderly occupants.")
            return rel
        if bt == "Commercial":
            return ["Lobby connects to public zones.", "Restrooms are centrally accessible."]
        if bt == "Industrial":
            return ["Loading bay opens to warehouse.", "Admin buffered from production noise."]
        if bt == "Educational":
            return ["Classrooms grouped along corridors.", "Admin controls entrance."]
        if bt == "Healthcare":
            return ["Emergency has separate access.", "Wards are in quiet zones."]
        if bt == "Hotel":
            return ["Lobby connects to amenities.", "Guest rooms stacked efficiently."]
        return []

    # ──────────────────────────────────────────────────────────────────────────
    #  LAYOUT PACKER — places rooms into a grid on each floor
    # ──────────────────────────────────────────────────────────────────────────

    def _pack_rooms(self, rooms_list: List[Dict], width: float, depth: float,
                    floor_idx: int) -> List[Dict]:
        """Pack rooms into a 2D grid fitted to (width × depth)."""
        # Sort: circulation & service at ends, private in middle
        zone_order = {
            "public": 0, "outdoor": 1, "academic": 2, "guestroom": 3,
            "private": 4, "admin": 5, "inpatient": 6, "ward": 6, "icu": 7,
            "production": 1, "storage": 2, "emergency": 0,
            "outpatient": 2, "diagnostic": 5, "surgical": 7,
            "dining": 1, "conference": 3, "recreation": 4,
            "circulation": 8, "service": 9, "sports": 5,
        }
        rooms_list = sorted(rooms_list, key=lambda r: zone_order.get(r.get("zone", "service"), 8))

        total_area = sum(r.get("area", 15.0) for r in rooms_list)

        # Determine grid columns
        n = len(rooms_list)
        grid_cols = 2 if n <= 4 else (3 if n <= 9 else 4)
        grid_rows = math.ceil(n / grid_cols) if n > 0 else 1

        cell_w = width  / grid_cols
        cell_h = depth  / grid_rows

        placed = []
        for idx, room in enumerate(rooms_list):
            col = idx % grid_cols
            row = idx // grid_cols

            rw = round(cell_w * 0.95, 2)
            rh = round(cell_h * 0.95, 2)
            rx = round(col * cell_w, 2)
            ry = round(row * cell_h, 2)

            placed.append({
                "id":    f"{room.get('name', 'Room').replace(' ', '_').lower()}_{floor_idx}_{idx}",
                "label": room.get("name", "Room"),
                "type":  room.get("type", "SERVICE"),
                "zone":  room.get("zone", "service"),
                "x":     rx,
                "y":     ry,
                "w":     rw,
                "h":     rh,
                "area":  round(rw * rh, 1),
            })
        return placed

    # ──────────────────────────────────────────────────────────────────────────
    #  PUBLIC ENTRY POINT
    # ──────────────────────────────────────────────────────────────────────────

    def generate_blueprint(self, building_program: Dict[str, Any], profile: UserProfile, building_type: str,
                           num_floors: int) -> Dict[str, Any]:
        config     = self.sector_configs.get(building_type, self.sector_configs["Residential"])
        num_floors = max(1, num_floors)

        all_rooms = building_program.get("rooms", [])
        total_area = building_program.get("total_gross_area", 100.0)
        net_area = building_program.get("total_net_area", 80.0)

        # Footprint dimensions
        area_per_floor = total_area / num_floors
        width  = round(math.sqrt(area_per_floor * config["aspect"]), 1)
        depth  = round(area_per_floor / width, 1)

        # Ensure minimum functional dimensions for layouts
        width = max(16.0, width)
        depth = max(12.0, depth)

        floors_data = []

        if building_type == "Hotel":
            # Procedural Hotel Layout Generator
            # Align Cores
            staircase_core = {"id": "staircase_core", "label": "Staircase Core", "type": "CIRCULATION", "zone": "circulation", "x": 0.5, "y": depth - 2.8, "w": 2.5, "h": 2.2, "area": 5.5}
            elevator_core = {"id": "elevator_core", "label": "Elevator Core", "type": "CIRCULATION", "zone": "circulation", "x": 3.2, "y": depth - 2.8, "w": 1.8, "h": 2.2, "area": 4.0}
            
            for f in range(num_floors):
                # Copy cores so they are independent objects per floor
                f_stair = staircase_core.copy()
                f_stair["id"] = f"staircase_core_{f}"
                f_elev = elevator_core.copy()
                f_elev["id"] = f"elevator_core_{f}"
                
                floor_rooms = [f_stair, f_elev]
                
                if f == 0:
                    # Ground Floor: Reception, Lobby, Restaurant, Kitchen, Administration, Service Areas
                    floor_rooms.extend([
                        {"id": f"lobby_{f}", "label": "Lobby", "type": "PUBLIC", "zone": "public", "x": round(width/3, 2), "y": 0.5, "w": round(width/3 - 0.2, 2), "h": round(depth - 1.0, 2), "area": round((width/3)*depth, 1)},
                        {"id": f"reception_{f}", "label": "Reception", "type": "PUBLIC", "zone": "reception", "x": round(width/3 + 0.5, 2), "y": round(depth - 3.2, 2), "w": round(width/3 - 1.0, 2), "h": 2.2, "area": 10.0},
                        {"id": f"restaurant_{f}", "label": "Restaurant", "type": "PUBLIC", "zone": "dining", "x": 0.5, "y": 0.5, "w": round(width/3 - 1.0, 2), "h": round(depth - 3.8, 2), "area": 30.0},
                        {"id": f"kitchen_{f}", "label": "Kitchen", "type": "WET", "zone": "service", "x": 0.5, "y": round(depth - 3.2, 2), "w": round(width/3 - 1.0, 2), "h": 2.5, "area": 15.0},
                        {"id": f"administration_{f}", "label": "Administration", "type": "OFFICE", "zone": "admin", "x": round(2*width/3 + 0.5, 2), "y": 0.5, "w": round(width/3 - 1.0, 2), "h": round(depth/2 - 0.5, 2), "area": 12.0},
                        {"id": f"service_area_{f}", "label": "Service Area", "type": "SERVICE", "zone": "service", "x": round(2*width/3 + 0.5, 2), "y": round(depth/2 + 0.5, 2), "w": round(width/3 - 1.0, 2), "h": round(depth/2 - 1.0, 2), "area": 12.0}
                    ])
                    floors_data.append({"level": f, "label": "GROUND FLOOR", "rooms": floor_rooms})
                elif f == num_floors - 1 and num_floors > 1:
                    # Top Floor: Executive Suites, Roof Facilities
                    corridor_w = round(width - 5.7, 2)
                    floor_rooms.append({"id": f"corridor_{f}", "label": "Central Corridor", "type": "CIRCULATION", "zone": "circulation", "x": 5.2, "y": round(depth/2 - 0.9, 2), "w": corridor_w, "h": 1.8, "area": round(corridor_w*1.8, 1)})
                    
                    suite_w = round(corridor_w / 2, 2)
                    floor_rooms.append({"id": f"suite_1_{f}", "label": "Executive Suite A", "type": "GUEST_ROOM", "zone": "guestroom", "x": 5.2, "y": 0.5, "w": round(suite_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(suite_w*4, 1)})
                    floor_rooms.append({"id": f"suite_2_{f}", "label": "Executive Suite B", "type": "GUEST_ROOM", "zone": "guestroom", "x": round(5.2 + suite_w, 2), "y": 0.5, "w": round(suite_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(suite_w*4, 1)})
                    
                    floor_rooms.append({"id": f"roof_facilities_{f}", "label": "Roof Facilities", "type": "OUTDOOR", "zone": "outdoor", "x": 5.2, "y": round(depth/2 + 1.0, 2), "w": round(corridor_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(corridor_w*4, 1)})
                    
                    floors_data.append({"level": f, "label": "TOP FLOOR", "rooms": floor_rooms})
                else:
                    # Typical Floors: Central Corridor, Guest Rooms
                    corridor_w = round(width - 5.7, 2)
                    floor_rooms.append({"id": f"corridor_{f}", "label": "Central Corridor", "type": "CIRCULATION", "zone": "circulation", "x": 5.2, "y": round(depth/2 - 0.9, 2), "w": corridor_w, "h": 1.8, "area": round(corridor_w*1.8, 1)})
                    
                    num_rooms_per_side = 3
                    room_w = round(corridor_w / num_rooms_per_side, 2)
                    
                    for i in range(num_rooms_per_side):
                        rx = round(5.2 + (i * room_w), 2)
                        floor_rooms.append({
                            "id": f"guest_room_t_{i}_{f}",
                            "label": f"Guest Room {100*f + i + 1}",
                            "type": "GUEST_ROOM",
                            "zone": "guestroom",
                            "x": rx,
                            "y": 0.5,
                            "w": round(room_w - 0.2, 2),
                            "h": round(depth/2 - 1.5, 2),
                            "area": round(room_w * (depth/2 - 1.5), 1)
                        })
                        floor_rooms.append({
                            "id": f"guest_room_b_{i}_{f}",
                            "label": f"Guest Room {100*f + i + 4}",
                            "type": "GUEST_ROOM",
                            "zone": "guestroom",
                            "x": rx,
                            "y": round(depth/2 + 1.0, 2),
                            "w": round(room_w - 0.2, 2),
                            "h": round(depth/2 - 1.5, 2),
                            "area": round(room_w * (depth/2 - 1.5), 1)
                        })
                    floors_data.append({"level": f, "label": f"LEVEL {f + 1}", "rooms": floor_rooms})
        else:
            # Non-hotel building layout: standard pack but inject staircase/elevator if > 3 floors
            zone_priority_ground = {
                "public", "outdoor", "service", "emergency", "reception",
                "production", "storage", "sports", "dining", "conference",
            }

            ground_rooms = [r for r in all_rooms if r.get("zone", "service") in zone_priority_ground]
            upper_rooms  = [r for r in all_rooms if r.get("zone", "service") not in zone_priority_ground]

            # If num_floors > 3, we inject Staircase Core and Elevator Core at fixed locations on all floors
            if num_floors > 3:
                # Remove the existing CIRCULATION cores from lists to avoid duplicates
                ground_rooms = [r for r in ground_rooms if "staircase" not in r.get("name", "").lower() and "elevator" not in r.get("name", "").lower() and "circulation" not in r.get("name", "").lower()]
                upper_rooms = [r for r in upper_rooms if "staircase" not in r.get("name", "").lower() and "elevator" not in r.get("name", "").lower() and "circulation" not in r.get("name", "").lower()]

            if num_floors == 1:
                placed = self._pack_rooms(all_rooms, width, depth, 0)
                floors_data.append({"level": 0, "label": "GROUND FLOOR", "rooms": placed})
            else:
                # Ground floor
                placed_gnd = self._pack_rooms(ground_rooms, width, depth, 0)
                if num_floors > 3:
                    placed_gnd = [
                        {"id": "staircase_core_0", "label": "Staircase Core", "type": "CIRCULATION", "zone": "circulation", "x": 0.5, "y": depth - 2.8, "w": 2.5, "h": 2.2, "area": 5.5},
                        {"id": "elevator_core_0", "label": "Elevator Core", "type": "CIRCULATION", "zone": "circulation", "x": 3.2, "y": depth - 2.8, "w": 1.8, "h": 2.2, "area": 4.0}
                    ] + [r for r in placed_gnd if r["x"] >= 5.0 or r["y"] < depth - 3.0]
                floors_data.append({"level": 0, "label": "GROUND FLOOR", "rooms": placed_gnd})

                # Upper floors
                per_floor = math.ceil(len(upper_rooms) / (num_floors - 1)) if num_floors > 1 else len(upper_rooms)
                for f in range(1, num_floors):
                    chunk = upper_rooms[(f - 1) * per_floor: f * per_floor]
                    if not chunk:
                        chunk = all_rooms[:3]  # fallback
                    placed = self._pack_rooms(chunk, width, depth, f)
                    if num_floors > 3:
                        placed = [
                            {"id": f"staircase_core_{f}", "label": "Staircase Core", "type": "CIRCULATION", "zone": "circulation", "x": 0.5, "y": depth - 2.8, "w": 2.5, "h": 2.2, "area": 5.5},
                            {"id": f"elevator_core_{f}", "label": "Elevator Core", "type": "CIRCULATION", "zone": "circulation", "x": 3.2, "y": depth - 2.8, "w": 1.8, "h": 2.2, "area": 4.0}
                        ] + [r for r in placed if r["x"] >= 5.0 or r["y"] < depth - 3.0]
                    label  = "MEZZANINE" if f == 1 and building_type in ("Hotel", "Commercial") else f"LEVEL {f + 1}"
                    floors_data.append({"level": f, "label": label, "rooms": placed})

        # Attach furniture with layout evaluation
        style_pref = getattr(profile, "style_pref", "Modern") or "Modern"
        for floor in floors_data:
            for room in floor["rooms"]:
                items, evaluation = compute_furniture_placement(
                    room["label"], room["w"], room["h"],
                    building_type=building_type,
                    style=style_pref,
                )
                room["furniture"]         = items
                room["layout_evaluation"] = evaluation


        # ── Building-level Layout Metrics Aggregation ─────────────────────────
        all_evals = [
            room["layout_evaluation"]
            for floor in floors_data
            for room in floor["rooms"]
            if "layout_evaluation" in room
        ]
        if all_evals:
            def _avg(key): return round(sum(e[key] for e in all_evals) / len(all_evals), 1)
            def _avg_nested(outer, inner):
                return round(sum(e[outer][inner] for e in all_evals) / len(all_evals), 1)
            layout_metrics = {
                "rooms_evaluated":         len(all_evals),
                "avg_placement_success":   _avg("placement_success_rate"),
                "avg_space_utilization":   _avg("space_utilization"),
                "avg_circulation_score":   _avg("circulation_score"),
                "avg_functional_coverage": _avg("functional_coverage"),
                "avg_constraint_compliance": _avg("constraint_compliance"),
                "avg_sustainability":       _avg("estimated_sustainability"),
                "total_items_placed":       sum(e["items_placed"] for e in all_evals),
                "avg_design_score":        _avg_nested("layout_score", "overall"),
            }
        else:
            layout_metrics = {}

        # Prepare relationship descriptions and a simple blueprint summary
        relationships = self._relationships(building_type, profile)
        blueprint_summary = {"relationships": relationships}
        return {
            "building_type":     building_type,
            "num_floors":        num_floors,
            "total_area":        round(total_area, 1),
            "net_area":          round(net_area, 1),
            "footprint":         {"w": width, "h": depth},
            "floors_data":       floors_data,
            "relationships":     relationships,
            "blueprint_summary": blueprint_summary,
            "style_pref":        profile.style_pref,
            "rooms":             all_rooms,
            "circulation":       total_area - net_area,
            "walls":             [],
            "doors":             [],
            "windows":           [],
            "layout_metrics":    layout_metrics,
        }


blueprint_engine = BlueprintEngine()
