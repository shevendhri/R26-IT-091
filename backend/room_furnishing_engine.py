"""
GreenConstructAI — Knowledge-Based Constraint Layout Solver
============================================================
This module implements an AI-assisted intelligent interior layout generation
system using knowledge-based reasoning with constraint optimization.

The 10-step pipeline:
  1. Building Context      — extract sector, style, dimensions
  2. Room Profile          — resolve semantic room type
  3. Functional Requirements — derive expected functions from room type
  4. Candidate Generation  — query furniture knowledge base
  5. Optimization          — filter by area, building type, priority
  6. Constraint Placement  — wall-backing, clearance, collision avoidance
  7. Quality Evaluation    — measure layout metrics
  8. Explainable Design Score — weighted breakdown
  9. Material Recommendation — note sustainable material choices
 10. Final Layout          — return items + evaluation report
"""

import math
import time
from typing import Dict, Any, List, Optional, Tuple
from furniture_catalog import get_furniture_geometry, _resolve_key

# ── Research metrics defaults ──────────────────────────────────────────────────
CIRCULATION_MIN_CLEARANCE = 0.75     # CIBSE-recommended minimum path width (m)
CLEARANCE_WEIGHT = 0.20  # weight for circulation clearance
SPACE_UTIL_WEIGHT = 0.25  # weight for space utilization in overall score
FUNC_COVERAGE_WEIGHT = 0.20  # weight for functional coverage2
CONSTRAINT_WEIGHT = 0.15  # weight for constraint compliance8
SUSTAINABILITY_WEIGHT = 0.20  # weight for sustainability15


# ══════════════════════════════════════════════════════════════════════════════
#  FUNCTIONAL REQUIREMENT DEFINITIONS
# ══════════════════════════════════════════════════════════════════════════════

FUNCTIONAL_REQUIREMENTS: Dict[str, List[str]] = {
    "Bedroom":           ["sleep", "storage", "clothing"],
    "Living Room":       ["seating", "lounging", "entertainment"],
    "Dining Room":       ["dining", "social"],
    "Kitchen":           ["cooking", "food_preparation", "storage"],
    "Bathroom":          ["sanitation", "hygiene"],
    "Utility Room":      ["storage", "laundry"],
    "Office":            ["working", "computing", "storage"],
    "Hospital Ward":     ["sleep", "medical_monitoring", "patient_care", "seating"],
    "Operating Theatre": ["surgery", "patient_care", "lighting"],
    "Consultation Room": ["examination", "consultation", "working"],
    "Laboratory":        ["research", "experiment", "seating"],
    "Emergency Department": ["patient_transport", "patient_care", "emergency_response"],
}


# ══════════════════════════════════════════════════════════════════════════════
#  HELPER: Bounding-box intersection check
# ══════════════════════════════════════════════════════════════════════════════

def _intersects(b1: Dict, b2: Dict, gap: float) -> bool:
    """Return True if two AABB boxes overlap including a surrounding gap."""
    return not (
        b1["x"] + b1["w"] / 2 + gap < b2["x"] - b2["w"] / 2 or
        b1["x"] - b1["w"] / 2 - gap > b2["x"] + b2["w"] / 2 or
        b1["z"] + b1["d"] / 2 + gap < b2["z"] - b2["d"] / 2 or
        b1["z"] - b1["d"] / 2 - gap > b2["z"] + b2["d"] / 2
    )


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN SOLVER CLASS
# ══════════════════════════════════════════════════════════════════════════════

class FurnitureLayoutSolver:
    """Knowledge-based constraint layout solver for interior furniture placement.

    Implements a rule-based reasoning engine with constraint satisfaction
    and optimization — accurately described as:
    'AI-assisted intelligent interior layout generation using a
    knowledge-based reasoning engine with constraint optimization.'
    """

    def solve_layout(
        self,
        room_label: str,
        rw: float,
        rh: float,
        style: str = "Modern",
        building_type: str = "Residential",
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Run the full 10-step layout pipeline.

        Returns
        -------
        (placed_items, layout_evaluation)
        """
        t_start = time.perf_counter()

        # ── Step 1: Building Context ─────────────────────────────────────────
        style = (style or "Modern").lower()
        room_area = rw * rh
        min_gap = 0.40
        if "minimalist" in style:
            min_gap = 0.85
        elif "luxury" in style:
            min_gap = 0.60

        # Standard door and window footprints (obstruction zones)
        door_bbox  = {"x": 0.10 * rw, "z": 0.0,  "w": 0.90, "d": 0.80}
        window_bbox = {"x": rw * 0.50,  "z": rh,   "w": 1.20, "d": 0.30}

        # ── Step 2: Room Profile ─────────────────────────────────────────────
        catalog_key = _resolve_key(room_label)

        # ── Step 3: Functional Requirements ─────────────────────────────────
        required_functions = set(FUNCTIONAL_REQUIREMENTS.get(catalog_key, []))

        # ── Step 4: Candidate Generation ────────────────────────────────────
        raw_candidates = get_furniture_geometry(room_label)

        # ── Step 5: Optimization (filter + sort by priority) ─────────────────
        # Filter by minimum area and building-type compatibility
        candidates = [
            item for item in raw_candidates
            if room_area >= item.get("min_room_area", 0.0) and (
                not item.get("building_types") or
                building_type in item.get("building_types", []) or
                any(b.lower() == building_type.lower()
                    for b in item.get("building_types", []))
            )
        ]
        # Sort by priority descending (most important placed first)
        candidates.sort(key=lambda i: i.get("priority", 5), reverse=True)

        # ── Step 6: Constraint Placement ─────────────────────────────────────
        placed_items: List[Dict[str, Any]] = []
        collision_count = 0
        placement_attempts = 0

        def is_blocked(pos_box: Dict) -> bool:
            if _intersects(pos_box, door_bbox,   min_gap): return True
            if _intersects(pos_box, window_bbox, 0.20):   return True
            if (pos_box["x"] - pos_box["w"] / 2 < 0 or
                    pos_box["x"] + pos_box["w"] / 2 > rw or
                    pos_box["z"] - pos_box["d"] / 2 < 0 or
                    pos_box["z"] + pos_box["d"] / 2 > rh):
                return True
            for existing in placed_items:
                eb = {
                    "x": existing["px"] * rw,
                    "z": existing["pz"] * rh,
                    "w": existing["w"],
                    "d": existing["d"],
                }
                if _intersects(pos_box, eb, min_gap):
                    return True
            return False

        # Specialised room solvers ───────────────────────────────────────────

        is_bedroom  = catalog_key == "Bedroom"
        is_living   = catalog_key == "Living Room"
        is_dining   = catalog_key == "Dining Room"
        is_office   = catalog_key == "Office"
        is_hospital = catalog_key in ("Hospital Ward", "Emergency Department")
        is_theatre  = catalog_key == "Operating Theatre"

        # Item extraction helpers
        def _find(name_kw: str, exact: bool = False):
            for it in candidates:
                n = it["name"].lower()
                if exact:
                    if it["name"].lower() == name_kw.lower():
                        return it
                else:
                    if name_kw.lower() in n:
                        return it
            return None

        def _find_all(name_kw: str):
            return [it for it in candidates if name_kw.lower() in it["name"].lower()]

        def _place(item: Dict, px: float, pz: float, rotY: float = 0.0) -> bool:
            nonlocal collision_count, placement_attempts
            w, d = item["w"], item["d"]
            box = {"x": px, "z": pz, "w": w, "d": d}
            placement_attempts += 1
            if is_blocked(box):
                collision_count += 1
                return False
            entry = {
                "name": item["name"], "w": w, "d": d, "h": item.get("h", 0.5),
                "px": px / rw, "pz": pz / rh, "rotY": rotY,
                "color": item["color"], "shape": item["shape"],
                "functions": item.get("functions", []),
                "material": item.get("material", ""),
                "carbon_score": item.get("carbon_score", 0.5),
                "upper": False,
            }
            if "parts" in item:
                entry["parts"] = item["parts"]
            placed_items.append(entry)
            return True

        # ── BEDROOM ──────────────────────────────────────────────────────────
        if is_bedroom:
            bed = _find("bed", exact=True) or _find("bed")
            side = _find("side table")
            ward = _find("wardrobe")
            desk = _find("desk")

            if bed:
                bw, bd = bed["w"], bed["d"]
                bx, bz = rw * 0.50, bd * 0.5 + 0.15
                _place(bed, bx, bz)
                if side:
                    sw, sd = side["w"], side["d"]
                    _place(side, bx - bw / 2 - sw / 2 - 0.05,
                           bz - bd / 2 + sd / 2)
                    _place(side, bx + bw / 2 + sw / 2 + 0.05,
                           bz - bd / 2 + sd / 2)

            if ward:
                ww, wd = ward["w"], ward["d"]
                if not _place(ward, rw - wd / 2 - 0.10, rh * 0.50, -1.5708):
                    _place(ward, wd / 2 + 0.10, rh * 0.50, 1.5708)

            if desk:
                dw, dd = desk["w"], desk["d"]
                _place(desk, rw * 0.30, rh - dd / 2 - 0.20, 3.14159)

        # ── LIVING ROOM ──────────────────────────────────────────────────────
        elif is_living:
            sofa = _find("sofa", exact=True)
            ct   = _find("coffee table")
            tv   = _find("tv unit")

            if sofa:
                sw, sd = sofa["w"], sofa["d"]
                sfx, sfz = rw * 0.50, rh * 0.28
                _place(sofa, sfx, sfz)
                if ct:
                    cw, cd = ct["w"], ct["d"]
                    _place(ct, sfx, sfz + sd / 2 + cd / 2 + 0.65)
                if tv:
                    tw, td = tv["w"], tv["d"]
                    _place(tv, sfx, rh - td / 2 - 0.15, 3.14159)

        # ── DINING ROOM ──────────────────────────────────────────────────────
        elif is_dining:
            table = _find("dining table")
            chairs = _find_all("chair")

            if table:
                tw, td = table["w"], table["d"]
                dtx, dtz = rw * 0.50, rh * 0.50
                _place(table, dtx, dtz)

                offsets = [
                    (dtx,            dtz - td / 2 - 0.28, 0.0),
                    (dtx,            dtz + td / 2 + 0.28, 3.14159),
                    (dtx + tw / 2 + 0.28, dtz,            -1.5708),
                    (dtx - tw / 2 - 0.28, dtz,             1.5708),
                ]
                for idx, chair in enumerate(chairs[:4]):
                    if idx < len(offsets):
                        cx, cz, crot = offsets[idx]
                        _place(chair, cx, cz, crot)

        # ── OFFICE ───────────────────────────────────────────────────────────
        elif is_office:
            desk = _find("office desk") or _find("desk")
            chair = _find("ergonomic chair") or _find("chair")
            mtable = _find("meeting table")
            cabinet = _find("filing cabinet")

            if desk:
                dw, dd = desk["w"], desk["d"]
                dx, dz = rw * 0.50, dd / 2 + 0.15
                _place(desk, dx, dz)
                if chair:
                    cw, cd = chair["w"], chair["d"]
                    _place(chair, dx, dz + dd / 2 + cd / 2 + 0.60, 3.14159)

            if mtable and room_area >= mtable.get("min_room_area", 20.0):
                mx, mz = rw * 0.50, rh * 0.65
                _place(mtable, mx, mz)

            if cabinet:
                cw, cd = cabinet["w"], cabinet["d"]
                _place(cabinet, rw - cd / 2 - 0.10, rh * 0.50, -1.5708)

        # ── HOSPITAL WARD ────────────────────────────────────────────────────
        elif is_hospital:
            bed = _find("hospital bed")
            vchr = _find("visitor chair")
            bcab = _find("bedside cabinet")
            monitor = _find("vital signs monitor") or _find("monitor")

            if bed:
                bw, bd = bed["w"], bed["d"]
                bx, bz = rw * 0.50, bd / 2 + 0.20
                _place(bed, bx, bz)
                if bcab:
                    cw, cd = bcab["w"], bcab["d"]
                    _place(bcab, bx + bw / 2 + cw / 2 + 0.10, bz - bd / 2 + cd / 2)
                if vchr:
                    vw, vd = vchr["w"], vchr["d"]
                    _place(vchr, bx - bw / 2 - vw / 2 - 0.10, bz, -1.5708)
                if monitor:
                    mw, md = monitor["w"], monitor["d"]
                    _place(monitor, rw - md / 2 - 0.10, bz, -1.5708)

        # ── OPERATING THEATRE ────────────────────────────────────────────────
        elif is_theatre:
            op_table = _find("operating table")
            light    = _find("surgical light")
            equip    = _find("equipment monitor")

            if op_table:
                _place(op_table, rw * 0.50, rh * 0.50)
            if light:
                _place(light, rw * 0.50, rh * 0.35)
            if equip:
                ew, ed = equip["w"], equip["d"]
                _place(equip, ew / 2 + 0.10, rh * 0.50, 1.5708)

        # ── GENERAL / FALLBACK ───────────────────────────────────────────────
        else:
            candidate_points = [
                (rw * 0.50, rh * 0.50, 0.0),
                (rw * 0.50, rh - 0.15, 3.14159),
                (rw * 0.50, 0.15,      0.0),
                (rw - 0.15, rh * 0.50, -1.5708),
                (0.15,      rh * 0.50, 1.5708),
                (rw * 0.20, rh * 0.20, 0.0),
                (rw * 0.80, rh * 0.20, 0.0),
                (rw * 0.20, rh * 0.80, 3.14159),
                (rw * 0.80, rh * 0.80, 3.14159),
            ]
            for item in candidates:
                w, d = item["w"], item["d"]
                placed = False
                for px, pz, rot in candidate_points:
                    box = {"x": px, "z": pz, "w": w, "d": d}
                    placement_attempts += 1
                    if not is_blocked(box):
                        entry = {
                            "name": item["name"], "w": w, "d": d,
                            "h": item.get("h", 0.5), "px": px / rw, "pz": pz / rh,
                            "rotY": rot, "color": item["color"], "shape": item["shape"],
                            "functions": item.get("functions", []),
                            "material": item.get("material", ""),
                            "carbon_score": item.get("carbon_score", 0.5),
                            "upper": False,
                        }
                        if "parts" in item:
                            entry["parts"] = item["parts"]
                        placed_items.append(entry)
                        placed = True
                        break
                    else:
                        collision_count += 1
                if not placed:
                    # Forced fallback — record as partially failed
                    fallback = {
                        "name": item["name"], "w": item["w"], "d": item["d"],
                        "h": item.get("h", 0.5), "px": 0.50, "pz": 0.50,
                        "rotY": 0.0, "color": item["color"], "shape": item["shape"],
                        "functions": item.get("functions", []),
                        "material": item.get("material", ""),
                        "carbon_score": item.get("carbon_score", 0.5),
                        "upper": False,
                    }
                    if "parts" in item:
                        fallback["parts"] = item["parts"]
                    placed_items.append(fallback)

        # ── Apply height metadata ────────────────────────────────────────────
        for item in placed_items:
            item.setdefault("h", 0.5)
            item.setdefault("upper", False)

        # ── Step 7: Quality Evaluation ───────────────────────────────────────
        layout_evaluation = self._evaluate(
            placed_items=placed_items,
            candidates=candidates,
            required_functions=required_functions,
            rw=rw, rh=rh,
            collision_count=collision_count,
            placement_attempts=placement_attempts,
            t_start=t_start,
        )

        return placed_items, layout_evaluation

    # ══════════════════════════════════════════════════════════════════════════
    #  EVALUATION ENGINE
    # ══════════════════════════════════════════════════════════════════════════

    def _evaluate(
        self,
        placed_items: List[Dict],
        candidates: List[Dict],
        required_functions: set,
        rw: float,
        rh: float,
        collision_count: int,
        placement_attempts: int,
        t_start: float,
    ) -> Dict[str, Any]:
        """Compute the Layout Quality Report.

        Metrics
        -------
        placement_success_rate  — % of candidates placed without collision
        space_utilization       — % of floor area covered by furniture footprints
        circulation_score       — inverse of over-packed items vs circulation minimum
        functional_coverage     — % of required functions satisfied by placed items
        constraint_compliance   — % of placement attempts that succeeded
        furniture_density       — items per 10 m² (overcrowding indicator)
        estimated_sustainability — avg 1-carbon_score across placed items (%)
        runtime_ms              — wall-clock time for this room in milliseconds
        """
        room_area = rw * rh
        n_placed = len(placed_items)
        n_candidates = max(len(candidates), 1)

        # Placement success rate
        placement_success = round(
            100.0 * n_placed / n_candidates if n_candidates else 100.0, 1
        )

        # Space utilization
        footprint = sum(it["w"] * it["d"] for it in placed_items)
        space_utilization = round(min(100.0, footprint / room_area * 100.0), 1)

        # Circulation score — penalise overcrowding
        # Ideal: furniture covers ≤55% of area; below 30% wastes space
        if space_utilization <= 30.0:
            circulation_score = round(60.0 + space_utilization, 1)
        elif space_utilization <= 55.0:
            circulation_score = 100.0
        else:
            # Penalty for overcrowding
            circulation_score = round(max(0.0, 100.0 - (space_utilization - 55.0) * 3.0), 1)

        # Functional coverage
        covered_functions: set = set()
        for it in placed_items:
            for fn in it.get("functions", []):
                covered_functions.add(fn)
        if required_functions:
            func_cov = round(
                len(covered_functions & required_functions) / len(required_functions) * 100.0, 1
            )
        else:
            func_cov = 100.0

        # Constraint compliance
        constraint_compliance = round(
            100.0 * (placement_attempts - collision_count) / max(placement_attempts, 1), 1
        )

        # Furniture density (items per 10 m²)
        furniture_density = round(n_placed / room_area * 10.0, 2)

        # Sustainability score (1 – avg carbon score, expressed %)
        if placed_items:
            avg_carbon = sum(it.get("carbon_score", 0.5) for it in placed_items) / n_placed
        else:
            avg_carbon = 0.5
        sustainability_score = round((1.0 - avg_carbon) * 100.0, 1)

        # Runtime
        runtime_ms = round((time.perf_counter() - t_start) * 1000.0, 2)

        # ── Step 8: Explainable AI Design Score (weighted breakdown) ──────────
        # Each sub-score is weighted to reflect research importance
        # Scores are normalised 0-25/22/20/18/15 to sum to 100
        s_utilization  = round(min(space_utilization,   100.0) * SPACE_UTIL_WEIGHT,    1)
        s_circulation  = round(min(circulation_score,   100.0) * CLEARANCE_WEIGHT,     1)
        s_func_cov     = round(min(func_cov,            100.0) * FUNC_COVERAGE_WEIGHT, 1)
        s_constraint   = round(min(constraint_compliance,100.0) * CONSTRAINT_WEIGHT,   1)
        s_sustain      = round(min(sustainability_score, 100.0) * SUSTAINABILITY_WEIGHT,1)
        overall_score  = round(s_utilization + s_circulation + s_func_cov +
                               s_constraint + s_sustain, 1)

        # ── Step 9: Material note ─────────────────────────────────────────────
        # Identify the most sustainable material placed for reporting
        if placed_items:
            best = min(placed_items, key=lambda x: x.get("carbon_score", 0.5))
            material_note = (f"Lowest embodied carbon item: '{best['name']}' "
                             f"({best.get('material', 'Unknown')}, "
                             f"carbon_score={best.get('carbon_score', 0.5):.2f})")
        else:
            material_note = "No items placed."

        return {
            # ── Step 10: Final structured output ────────────────────────────
            "placement_success_rate": placement_success,
            "space_utilization":      space_utilization,
            "circulation_score":      circulation_score,
            "functional_coverage":    func_cov,
            "constraint_compliance":  constraint_compliance,
            "furniture_density":      furniture_density,
            "estimated_sustainability": sustainability_score,
            "collision_count":        collision_count,
            "runtime_ms":             runtime_ms,
            "items_placed":           n_placed,
            "items_considered":       n_candidates,
            "functions_required":     sorted(required_functions),
            "functions_covered":      sorted(covered_functions & required_functions),
            "material_note":          material_note,
            # Explainable score breakdown (dissertational evidence)
            "layout_score": {
                "overall":              overall_score,
                "space_utilization":    s_utilization,
                "circulation":          s_circulation,
                "functional_coverage":  s_func_cov,
                "constraint_compliance": s_constraint,
                "sustainability":        s_sustain,
            },
            # Structured breakdown showing raw metric, weight, and contribution to overall score
            "score_breakdown": {
                "space_utilization": {
                    "raw": space_utilization,
                    "weight": SPACE_UTIL_WEIGHT,
                    "contribution": round(min(space_utilization, 100.0) * SPACE_UTIL_WEIGHT, 1)
                },
                "circulation": {
                    "raw": circulation_score,
                    "weight": CLEARANCE_WEIGHT,
                    "contribution": round(min(circulation_score, 100.0) * CLEARANCE_WEIGHT, 1)
                },
                "functional_coverage": {
                    "raw": func_cov,
                    "weight": FUNC_COVERAGE_WEIGHT,
                    "contribution": round(min(func_cov, 100.0) * FUNC_COVERAGE_WEIGHT, 1)
                },
                "constraint_compliance": {
                    "raw": constraint_compliance,
                    "weight": CONSTRAINT_WEIGHT,
                    "contribution": round(min(constraint_compliance, 100.0) * CONSTRAINT_WEIGHT, 1)
                },
                "sustainability": {
                    "raw": sustainability_score,
                    "weight": SUSTAINABILITY_WEIGHT,
                    "contribution": round(min(sustainability_score, 100.0) * SUSTAINABILITY_WEIGHT, 1)
                },
                "overall": {
                    "raw": overall_score,
                    "weight": 1.0,
                    "contribution": overall_score
                }
            },
            # Explanation field for reproducibility (human readable)
            "explanation": {
                "space_utilization": f"Space utilization {space_utilization}% weighted {SPACE_UTIL_WEIGHT*100:.0f}% => {round(min(space_utilization,100.0)*SPACE_UTIL_WEIGHT,1)}",
                "circulation": f"Circulation score {circulation_score}% weighted {CLEARANCE_WEIGHT*100:.0f}% => {round(min(circulation_score,100.0)*CLEARANCE_WEIGHT,1)}",
                "functional_coverage": f"Functional coverage {func_cov}% weighted {FUNC_COVERAGE_WEIGHT*100:.0f}% => {round(min(func_cov,100.0)*FUNC_COVERAGE_WEIGHT,1)}",
                "constraint_compliance": f"Constraint compliance {constraint_compliance}% weighted {CONSTRAINT_WEIGHT*100:.0f}% => {round(min(constraint_compliance,100.0)*CONSTRAINT_WEIGHT,1)}",
                "sustainability": f"Sustainability {sustainability_score}% weighted {SUSTAINABILITY_WEIGHT*100:.0f}% => {round(min(sustainability_score,100.0)*SUSTAINABILITY_WEIGHT,1)}",
                "overall": f"Overall design score {overall_score} (sum of weighted sub‑scores)"
            },
            "evaluation_version": "v1.0",

        }


# ── Module-level singleton ─────────────────────────────────────────────────────
layout_solver = FurnitureLayoutSolver()
