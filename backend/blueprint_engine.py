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
    #  DYNAMIC ARCHITECTURAL RELATIONSHIPS & INFLUENCES
    # ──────────────────────────────────────────────────────────────────────────

    def _relationships(self, building_type: str, profile: UserProfile) -> List[str]:
        rel = []
        bt = building_type

        if bt == "Residential":
            rel.extend([
                "Main Living Room and Dining form the primary public entry zone.",
                "Kitchen connects directly to Dining and Service/Pantry area.",
                "Bedrooms are grouped into quiet private sleeping zones.",
            ])
            if str(getattr(profile, "cross_ventilation", "")).lower() in ("high", "yes", "true"):
                rel.append("Perimeter openings aligned to promote passive cross-ventilation flow.")
            if str(getattr(profile, "natural_light", "")).lower() in ("high", "yes", "true"):
                rel.append("Primary living and sleeping spaces placed along exterior walls to maximize daylighting.")
            if getattr(profile, "solar_ready", False):
                rel.append("Solar Utility Hub positioned in service zone with direct roof conduit access.")
            if getattr(profile, "rainwater_harvesting", False):
                rel.append("Rainwater storage utility integrated into service/outdoor perimeter.")
            if getattr(profile, "accessibility_required", False) or (getattr(profile, "elderly_occupants", 0) or 0) > 0:
                rel.append("Direct, step-free circulation path and accessible ground-floor suite provided.")
            if getattr(profile, "future_expansion", "None") == "Vertical":
                rel.append("Staircase Core centrally aligned to support future upper-floor expansion.")
        elif bt == "Commercial":
            rel.extend([
                "Lobby and reception control main public access.",
                "Meeting rooms buffer private executive offices from general workstation areas.",
                "Restrooms and service utilities are centrally accessible."
            ])
        elif bt == "Industrial":
            rel.extend([
                "Loading bays open directly into the main warehouse floor.",
                "Administrative offices are acoustically buffered from production zones."
            ])
        elif bt == "Educational":
            rel.extend([
                "Classrooms arranged along clear linear circulation corridors.",
                "Administrative offices supervise the primary entrance."
            ])
        elif bt == "Healthcare":
            rel.extend([
                "Emergency department has dedicated, uncluttered access.",
                "Inpatient wards are isolated in quiet clinical zones."
            ])
        elif bt == "Hotel":
            rel.extend([
                "Ground floor lobby connects smoothly to restaurant and reception amenities.",
                "Guest rooms stacked efficiently along central corridors with dual elevator cores."
            ])
        return rel

    # ──────────────────────────────────────────────────────────────────────────
    #  SPATIAL ADJACENCY & ZONAL PLACEMENT PACKER
    # ──────────────────────────────────────────────────────────────────────────

    def _pack_floor_rooms(self, rooms_to_place: List[Dict], width: float, depth: float,
                           floor_idx: int, total_floors: int) -> List[Dict]:
        """
        Packs rooms into non-overlapping spatial zones fitted to (width × depth).
        Enforces realistic spatial adjacency:
        - Front band (y ~ 0): Public spaces & Reception / Entrance
        - Central spine: Circulation corridor & vertical cores
        - Side/Rear bands: Kitchen, Dining, Service, Bathrooms, Private Bedrooms
        """
        placed = []
        if not rooms_to_place:
            return placed

        # Separate circulation cores from regular rooms
        cores = [r for r in rooms_to_place if "core" in r.get("name", "").lower() or r.get("type") == "CIRCULATION"]
        regular_rooms = [r for r in rooms_to_place if r not in cores]

        # Fixed coordinates for vertical circulation cores across all floors
        core_x = 0.5
        core_y = round(depth - 2.8, 2)
        stair_w, stair_h = 2.5, 2.2
        elev_w, elev_h = 1.8, 2.2

        has_stair = False
        has_elev = False

        for r in cores:
            name_lower = r.get("name", "").lower()
            if "elevator" in name_lower and not has_elev:
                placed.append({
                    "id": f"elevator_core_{floor_idx}",
                    "label": r.get("name", "Elevator Core"),
                    "type": "CIRCULATION",
                    "zone": "circulation",
                    "x": round(core_x + stair_w + 0.3, 2),
                    "y": core_y,
                    "w": elev_w,
                    "h": elev_h,
                    "area": round(elev_w * elev_h, 1)
                })
                has_elev = True
            elif "staircase" in name_lower or "main circulation" in name_lower or not has_stair:
                placed.append({
                    "id": f"staircase_core_{floor_idx}",
                    "label": r.get("name", "Staircase Core"),
                    "type": "CIRCULATION",
                    "zone": "circulation",
                    "x": core_x,
                    "y": core_y,
                    "w": stair_w,
                    "h": stair_h,
                    "area": round(stair_w * stair_h, 1)
                })
                has_stair = True

        if total_floors > 1 and not has_stair:
            placed.append({
                "id": f"staircase_core_{floor_idx}",
                "label": "Staircase Core",
                "type": "CIRCULATION",
                "zone": "circulation",
                "x": core_x,
                "y": core_y,
                "w": stair_w,
                "h": stair_h,
                "area": round(stair_w * stair_h, 1)
            })

        # Define central corridor spine
        corr_y = round(depth / 2 - 0.9, 2)
        corr_h = 1.8
        corr_w = round(width - 1.0, 2)
        placed.append({
            "id": f"central_corridor_{floor_idx}",
            "label": "Central Corridor",
            "type": "CIRCULATION",
            "zone": "circulation",
            "x": 0.5,
            "y": corr_y,
            "w": corr_w,
            "h": corr_h,
            "area": round(corr_w * corr_h, 1)
        })

        if not regular_rooms:
            return placed

        # Categorize regular rooms into Top Band (y=0.5..corr_y-0.2) and Bottom Band (y=corr_y+corr_h+0.2..depth-0.5)
        # Top Band: Public / Living / Dining / Master Bedroom / Office
        # Bottom Band: Kitchen / Pantry / Bathrooms / Utility / Secondary Bedrooms
        top_zone_keys = {"public", "dining", "academic", "conference", "reception", "guestroom"}
        top_rooms = []
        bottom_rooms = []

        for r in regular_rooms:
            z = r.get("zone", "service")
            t = r.get("type", "")
            name = r.get("name", "")
            if z in top_zone_keys or t in ("LIVING_ROOM", "DINING_ROOM", "OFFICE", "RECEPTION") or "master" in name.lower():
                top_rooms.append(r)
            else:
                bottom_rooms.append(r)

        # Re-balance bands if one side is empty
        if not top_rooms and bottom_rooms:
            half = len(bottom_rooms) // 2
            top_rooms, bottom_rooms = bottom_rooms[:half], bottom_rooms[half:]
        elif not bottom_rooms and top_rooms:
            half = len(top_rooms) // 2
            top_rooms, bottom_rooms = top_rooms[:half], top_rooms[half:]

        def layout_band(rooms_list: List[Dict], start_x: float, start_y: float, band_w: float, band_h: float, prefix: str):
            if not rooms_list:
                return
            n = len(rooms_list)
            cell_w = band_w / n
            for i, room in enumerate(rooms_list):
                rx = round(start_x + (i * cell_w), 2)
                rw = round(cell_w - 0.2, 2)
                ry = start_y
                rh = round(band_h, 2)
                placed.append({
                    "id": f"{prefix}_{room.get('name', 'room').replace(' ', '_').lower()}_{floor_idx}_{i}",
                    "label": room.get("name", "Room"),
                    "type": room.get("type", "HABITABLE"),
                    "zone": room.get("zone", "private"),
                    "x": rx,
                    "y": ry,
                    "w": rw,
                    "h": rh,
                    "area": round(rw * rh, 1)
                })

        # Top Band Layout
        top_y = 0.5
        top_h = round(corr_y - top_y - 0.3, 2)
        if top_h > 2.0:
            layout_band(top_rooms, 0.5, top_y, width - 1.0, top_h, "top")

        # Bottom Band Layout (reserve space for Staircase/Elevator core if on bottom right)
        bot_y = round(corr_y + corr_h + 0.3, 2)
        bot_h = round(depth - bot_y - 0.5, 2)
        if bot_h > 2.0:
            # If cores take up bottom-left (x=0.5 to x=5.0), start bottom band from x=5.2
            bot_start_x = 5.2 if has_stair else 0.5
            bot_w = round(width - bot_start_x - 0.5, 2)
            layout_band(bottom_rooms, bot_start_x, bot_y, bot_w, bot_h, "bot")

        return placed

    # ──────────────────────────────────────────────────────────────────────────
    #  WALL, DOOR & WINDOW GEOMETRY GENERATOR
    # ──────────────────────────────────────────────────────────────────────────

    def _generate_geometry(self, floors_data: List[Dict], width: float, depth: float, profile: UserProfile):
        """Calculates explicit geometric vectors for walls, doors, and exterior windows."""
        high_vent = str(getattr(profile, "cross_ventilation", "")).lower() in ("high", "yes", "true")
        high_light = str(getattr(profile, "natural_light", "")).lower() in ("high", "yes", "true")

        walls = []
        doors = []
        windows = []

        # Exterior Perimeter Walls
        walls.append({"x1": 0, "y1": 0, "x2": width, "y2": 0, "type": "exterior"})
        walls.append({"x1": width, "y1": 0, "x2": width, "y2": depth, "type": "exterior"})
        walls.append({"x1": width, "y1": depth, "x2": 0, "y2": depth, "type": "exterior"})
        walls.append({"x1": 0, "y1": depth, "x2": 0, "y2": 0, "type": "exterior"})

        if floors_data:
            ground_floor = floors_data[0]
            for r in ground_floor.get("rooms", []):
                rx, ry, rw, rh = r["x"], r["y"], r["w"], r["h"]
                rtype = r["type"]

                # Internal partition walls
                walls.append({"x1": rx, "y1": ry, "x2": rx + rw, "y2": ry, "type": "interior"})
                walls.append({"x1": rx, "y1": ry, "x2": rx, "y2": ry + rh, "type": "interior"})

                # Door placement connecting to circulation corridor or entry
                if rtype != "CIRCULATION":
                    doors.append({
                        "x": round(rx + rw / 2, 2),
                        "y": round(ry + rh, 2),
                        "w": 0.9,
                        "room_id": r["id"],
                        "label": f"Door to {r['label']}"
                    })

                # Exterior Windows placement for perimeter rooms
                is_perimeter = (abs(ry - 0.5) < 0.2) or (abs(ry + rh - (depth - 0.5)) < 0.4) or (abs(rx - 0.5) < 0.2) or (abs(rx + rw - (width - 0.5)) < 0.4)
                if is_perimeter and rtype not in ("CIRCULATION", "SERVICE", "PARKING"):
                    win_width = 1.4 if (high_light or high_vent) else 1.0
                    win_y = ry if abs(ry - 0.5) < 0.2 else (ry + rh)
                    windows.append({
                        "x": round(rx + rw / 2, 2),
                        "y": round(win_y, 2),
                        "w": win_width,
                        "room_id": r["id"],
                        "label": f"Window ({r['label']})"
                    })

        return walls, doors, windows

    # ──────────────────────────────────────────────────────────────────────────
    #  PUBLIC ENTRY POINT
    # ──────────────────────────────────────────────────────────────────────────

    def generate_blueprint(self, building_program: Dict[str, Any], profile: UserProfile, building_type: str,
                           num_floors: int) -> Dict[str, Any]:
        config = self.sector_configs.get(building_type, self.sector_configs["Residential"])
        num_floors = max(1, num_floors)

        all_rooms = building_program.get("rooms", [])
        total_area = building_program.get("total_gross_area", 100.0)
        net_area = building_program.get("total_net_area", 80.0)

        # Footprint dimensions
        area_per_floor = total_area / num_floors
        width = round(math.sqrt(area_per_floor * config["aspect"]), 1)
        depth = round(area_per_floor / width, 1)

        # Ensure minimum functional dimensions for layouts
        width = max(16.0, width)
        depth = max(12.0, depth)

        floors_data = []

        if building_type == "Hotel":
            # Procedural Hotel Layout Generator
            staircase_core = {"id": "staircase_core", "label": "Staircase Core", "type": "CIRCULATION", "zone": "circulation", "x": 0.5, "y": depth - 2.8, "w": 2.5, "h": 2.2, "area": 5.5}
            elevator_core = {"id": "elevator_core", "label": "Elevator Core", "type": "CIRCULATION", "zone": "circulation", "x": 3.2, "y": depth - 2.8, "w": 1.8, "h": 2.2, "area": 4.0}

            for f in range(num_floors):
                f_stair = staircase_core.copy()
                f_stair["id"] = f"staircase_core_{f}"
                f_elev = elevator_core.copy()
                f_elev["id"] = f"elevator_core_{f}"

                floor_rooms = [f_stair, f_elev]

                if f == 0:
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
                    corridor_w = round(width - 5.7, 2)
                    floor_rooms.append({"id": f"corridor_{f}", "label": "Central Corridor", "type": "CIRCULATION", "zone": "circulation", "x": 5.2, "y": round(depth/2 - 0.9, 2), "w": corridor_w, "h": 1.8, "area": round(corridor_w*1.8, 1)})
                    suite_w = round(corridor_w / 2, 2)
                    floor_rooms.append({"id": f"suite_1_{f}", "label": "Executive Suite A", "type": "GUEST_ROOM", "zone": "guestroom", "x": 5.2, "y": 0.5, "w": round(suite_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(suite_w*4, 1)})
                    floor_rooms.append({"id": f"suite_2_{f}", "label": "Executive Suite B", "type": "GUEST_ROOM", "zone": "guestroom", "x": round(5.2 + suite_w, 2), "y": 0.5, "w": round(suite_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(suite_w*4, 1)})
                    floor_rooms.append({"id": f"roof_facilities_{f}", "label": "Roof Facilities", "type": "OUTDOOR", "zone": "outdoor", "x": 5.2, "y": round(depth/2 + 1.0, 2), "w": round(corridor_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(corridor_w*4, 1)})
                    floors_data.append({"level": f, "label": "TOP FLOOR", "rooms": floor_rooms})
                else:
                    corridor_w = round(width - 5.7, 2)
                    floor_rooms.append({"id": f"corridor_{f}", "label": "Central Corridor", "type": "CIRCULATION", "zone": "circulation", "x": 5.2, "y": round(depth/2 - 0.9, 2), "w": corridor_w, "h": 1.8, "area": round(corridor_w*1.8, 1)})
                    num_rooms_per_side = 3
                    room_w = round(corridor_w / num_rooms_per_side, 2)
                    for i in range(num_rooms_per_side):
                        rx = round(5.2 + (i * room_w), 2)
                        floor_rooms.append({
                            "id": f"guest_room_t_{i}_{f}", "label": f"Guest Room {100*f + i + 1}", "type": "GUEST_ROOM", "zone": "guestroom",
                            "x": rx, "y": 0.5, "w": round(room_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(room_w * (depth/2 - 1.5), 1)
                        })
                        floor_rooms.append({
                            "id": f"guest_room_b_{i}_{f}", "label": f"Guest Room {100*f + i + 4}", "type": "GUEST_ROOM", "zone": "guestroom",
                            "x": rx, "y": round(depth/2 + 1.0, 2), "w": round(room_w - 0.2, 2), "h": round(depth/2 - 1.5, 2), "area": round(room_w * (depth/2 - 1.5), 1)
                        })
                    floors_data.append({"level": f, "label": f"LEVEL {f + 1}", "rooms": floor_rooms})
        else:
            # Questionnaire-Driven Zonal Layout Generator for Residential, Commercial, Educational, Healthcare, Industrial
            zone_ground_keys = {"public", "dining", "reception", "service", "utility", "outdoor", "parking", "emergency", "production", "storage", "academic", "sports"}
            
            ground_rooms = [r for r in all_rooms if r.get("zone", "service") in zone_ground_keys]
            upper_rooms = [r for r in all_rooms if r.get("zone", "service") not in zone_ground_keys]

            if num_floors == 1:
                placed = self._pack_floor_rooms(all_rooms, width, depth, 0, 1)
                floors_data.append({"level": 0, "label": "GROUND FLOOR", "rooms": placed})
            else:
                # Ground Floor
                placed_gnd = self._pack_floor_rooms(ground_rooms, width, depth, 0, num_floors)
                floors_data.append({"level": 0, "label": "GROUND FLOOR", "rooms": placed_gnd})

                # Upper floors: distribute upper_rooms evenly across remaining levels WITHOUT fallback duplication
                per_floor = math.ceil(len(upper_rooms) / (num_floors - 1)) if len(upper_rooms) > 0 else 0
                for f in range(1, num_floors):
                    if per_floor > 0:
                        chunk = upper_rooms[(f - 1) * per_floor: f * per_floor]
                    else:
                        chunk = []
                    
                    placed_upper = self._pack_floor_rooms(chunk, width, depth, f, num_floors)
                    label = "MEZZANINE" if f == 1 and building_type in ("Commercial", "Industrial") else f"LEVEL {f + 1}"
                    floors_data.append({"level": f, "label": label, "rooms": placed_upper})

        # Attach furniture placement and evaluation
        style_pref = getattr(profile, "style_pref", "Modern") or "Modern"
        for floor in floors_data:
            for room in floor["rooms"]:
                items, evaluation = compute_furniture_placement(
                    room["label"], room["w"], room["h"],
                    building_type=building_type,
                    style=style_pref,
                )
                room["furniture"] = items
                room["layout_evaluation"] = evaluation

        # Building-level Layout Metrics Aggregation
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
                "rooms_evaluated": len(all_evals),
                "avg_placement_success": _avg("placement_success_rate"),
                "avg_space_utilization": _avg("space_utilization"),
                "avg_circulation_score": _avg("circulation_score"),
                "avg_functional_coverage": _avg("functional_coverage"),
                "avg_constraint_compliance": _avg("constraint_compliance"),
                "avg_sustainability": _avg("estimated_sustainability"),
                "total_items_placed": sum(e["items_placed"] for e in all_evals),
                "avg_design_score": _avg_nested("layout_score", "overall"),
            }
        else:
            layout_metrics = {}

        # Geometric vectors calculation (walls, doors, windows)
        walls, doors, windows = self._generate_geometry(floors_data, width, depth, profile)

        # Dynamic Relationships & Blueprint Summary
        relationships = self._relationships(building_type, profile)
        disclaimer = (
            "GreenConstructAI Conceptual Planning Engine — Generates preliminary architectural "
            "spatial zoning, room program sizing, and environmental layout analysis. "
            "Final construction documentation requires licensed professional architectural and structural engineering approval."
        )

        blueprint_summary = {
            "relationships": relationships,
            "disclaimer": disclaimer,
            "zone_distribution": {
                "public_rooms": len([r for r in all_rooms if r.get("zone") in ("public", "dining", "reception")]),
                "private_rooms": len([r for r in all_rooms if r.get("zone") in ("private", "guestroom")]),
                "service_rooms": len([r for r in all_rooms if r.get("zone") in ("service", "utility")]),
                "circulation_cores": len([r for r in all_rooms if r.get("zone") == "circulation"]),
            }
        }

        return {
            "building_type": building_type,
            "num_floors": num_floors,
            "total_area": round(total_area, 1),
            "net_area": round(net_area, 1),
            "footprint": {"w": width, "h": depth},
            "floors_data": floors_data,
            "relationships": relationships,
            "blueprint_summary": blueprint_summary,
            "style_pref": getattr(profile, "style_pref", "Modern"),
            "rooms": all_rooms,
            "circulation": round(total_area - net_area, 1),
            "walls": walls,
            "doors": doors,
            "windows": windows,
            "layout_metrics": layout_metrics,
            "disclaimer": disclaimer,
        }


blueprint_engine = BlueprintEngine()
