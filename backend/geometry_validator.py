"""
geometry_validator.py — GreenConstructAI Geometry Validation Layer
===================================================================
Provides robust, defensible geometric sanity and plausibility validation
for blueprint-extracted and parametric preliminary building dimensions.
"""

import math
from typing import Dict, Any, List, Optional


class GeometryValidator:
    """
    Validates structural and spatial geometry plausibility for academic decision support.
    Distinguishes blueprint-extracted data from parametric estimates and tags
    potential geometric inconsistencies for human review before quantities are generated.
    """

    # Engineering benchmark ranges for tropical building geometry
    MIN_FLOOR_HEIGHT_M = 2.4       # Absolute minimum clear storey height
    MAX_FLOOR_HEIGHT_M = 5.5       # Maximum typical single-storey height
    TYPICAL_STOREY_HEIGHT_M = 3.0  # Standard floor-to-floor height
    MIN_HABITABLE_AREA_PER_FLOOR_M2 = 8.0  # Absolute minimum footprint for multi-storey
    MIN_ROOF_TO_FOOTPRINT_RATIO = 0.80     # Flat or minimal overhang roof
    MAX_OPENINGS_RATIO = 0.70              # Openings must be < 70% of gross wall area
    MIN_FOUNDATION_DEPTH_RATIO = 0.12      # Min m3 foundation concrete per m2 footprint

    @staticmethod
    def validate_geometry(
        total_floor_area: float,
        number_of_floors: int = 1,
        building_height: Optional[float] = None,
        footprint_area: Optional[float] = None,
        roof_area: Optional[float] = None,
        wall_area: Optional[float] = None,
        window_area: Optional[float] = None,
        door_area: Optional[float] = None,
        foundation_volume: Optional[float] = None,
        concrete_volume: Optional[float] = None,
        structural_frame_area: Optional[float] = None,
        envelope_area: Optional[float] = None,
        is_blueprint_derived: bool = False,
        building_type: str = "Residential"
    ) -> Dict[str, Any]:
        """
        Performs multi-rule geometric plausibility checks.

        Returns structured dictionary with:
        - status: "PASS" | "REVIEW REQUIRED"
        - summary: Summary sentence
        - issues: List of critical inconsistencies requiring review
        - warnings: List of minor advisory observations
        - checks: List of individual rule checks with status and messages
        - geometry: Structured dictionary of validated geometry fields
        """
        issues: List[str] = []
        warnings: List[str] = []
        checks: List[Dict[str, Any]] = []

        # 1. Flexible Unpacking if passed as dictionary in first argument
        if isinstance(total_floor_area, dict):
            raw = total_floor_area
            total_floor_area = raw.get("total_floor_area") or raw.get("total_area") or 100.0
            number_of_floors = raw.get("number_of_floors") or raw.get("floor_count") or number_of_floors
            building_height = raw.get("building_height") or raw.get("height") or building_height
            footprint_area = raw.get("footprint_area") or footprint_area
            roof_area = raw.get("roof_area") or roof_area
            wall_area = raw.get("gross_wall_area") or raw.get("wall_area") or wall_area
            window_area = raw.get("window_area") or window_area
            door_area = raw.get("door_area") or (float(raw.get("door_count", 0)) * 1.89 if raw.get("door_count") else door_area)
            foundation_volume = raw.get("foundation_volume") or foundation_volume
            concrete_volume = raw.get("concrete_volume") or concrete_volume
            structural_frame_area = raw.get("structural_frame_area") or structural_frame_area
            envelope_area = raw.get("envelope_area") or envelope_area
            is_blueprint_derived = raw.get("is_blueprint_derived", is_blueprint_derived)
            building_type = raw.get("building_type", building_type)

        # Defensive Coercion
        try:
            total_floor_area = max(1.0, float(total_floor_area or 100.0))
        except (ValueError, TypeError):
            total_floor_area = 100.0

        try:
            number_of_floors = max(1, int(number_of_floors or 1))
        except (ValueError, TypeError):
            number_of_floors = 1

        source_label = "Blueprint-extracted" if is_blueprint_derived else "Estimated"

        # 2. Derive Footprint
        derived_footprint = round(total_floor_area / number_of_floors, 2)
        actual_footprint = float(footprint_area) if footprint_area and footprint_area > 0 else derived_footprint

        # 3. Derive Height & Floor-to-Floor Height
        if building_height and building_height > 0:
            actual_height = float(building_height)
            height_source = "Blueprint-extracted" if is_blueprint_derived else "Estimated"
        else:
            actual_height = round(number_of_floors * GeometryValidator.TYPICAL_STOREY_HEIGHT_M, 2)
            height_source = "Estimated"

        floor_to_floor_h = round(actual_height / number_of_floors, 2)

        # Check 1: Floor Area & Storey Plausibility
        area_per_floor = total_floor_area / number_of_floors
        if area_per_floor < GeometryValidator.MIN_HABITABLE_AREA_PER_FLOOR_M2 and number_of_floors > 1:
            issues.append(
                f"Floor area ({total_floor_area} m² across {number_of_floors} floors = {area_per_floor:.1f} m²/floor) "
                f"is unusually constricted for a {number_of_floors}-storey {building_type} structure."
            )
            checks.append({
                "rule": "Storey Floor Area Plausibility",
                "status": False,
                "severity": "High",
                "message": f"Extremely small area per floor: {area_per_floor:.1f} m²/floor."
            })
        else:
            checks.append({
                "rule": "Storey Floor Area Plausibility",
                "status": True,
                "severity": "Low",
                "message": f"Plausible floor area distribution: {area_per_floor:.1f} m²/floor."
            })

        # Check 2: Floor-to-Floor Height Plausibility
        if floor_to_floor_h < GeometryValidator.MIN_FLOOR_HEIGHT_M:
            issues.append(
                f"Calculated floor-to-floor height ({floor_to_floor_h}m) is below statutory habitable clearance (minimum 2.4m)."
            )
            checks.append({
                "rule": "Floor-to-Floor Height",
                "status": False,
                "severity": "High",
                "message": f"Height {floor_to_floor_h}m is below minimum clearance (2.4m)."
            })
        elif floor_to_floor_h > GeometryValidator.MAX_FLOOR_HEIGHT_M:
            warnings.append(
                f"Floor-to-floor height ({floor_to_floor_h}m) is unusually high for standard {building_type} typology."
            )
            checks.append({
                "rule": "Floor-to-Floor Height",
                "status": True,
                "severity": "Medium",
                "message": f"High storey clearance: {floor_to_floor_h}m per floor."
            })
        else:
            checks.append({
                "rule": "Floor-to-Floor Height",
                "status": True,
                "severity": "Low",
                "message": f"Storey height conforms to standards: {floor_to_floor_h}m/floor."
            })

        # Check 3: Footprint vs Total Floor Area Consistency
        footprint_discrepancy = abs(actual_footprint * number_of_floors - total_floor_area) / total_floor_area
        if footprint_discrepancy > 0.20:
            warnings.append(
                f"Supplied footprint area ({actual_footprint} m²) differs from total area / floors ({derived_footprint} m²) by {footprint_discrepancy*100:.1f}%."
            )
            checks.append({
                "rule": "Footprint-to-Total Area Consistency",
                "status": False,
                "severity": "Medium",
                "message": f"Footprint discrepancy of {footprint_discrepancy*100:.1f}% detected."
            })
        else:
            checks.append({
                "rule": "Footprint-to-Total Area Consistency",
                "status": True,
                "severity": "Low",
                "message": "Footprint and total floor area are internally consistent."
            })

        # 4. Roof Area vs Footprint Validation
        if roof_area and roof_area > 0:
            actual_roof = float(roof_area)
            roof_source = "Blueprint-extracted" if is_blueprint_derived else "Estimated"
        else:
            actual_roof = round(actual_footprint * 1.15, 2)
            roof_source = "Estimated"

        if actual_roof < (actual_footprint * GeometryValidator.MIN_ROOF_TO_FOOTPRINT_RATIO):
            issues.append(
                f"Roof area ({actual_roof} m²) is dramatically smaller than the building footprint ({actual_footprint} m²). "
                f"Roof coverage must normally equal or exceed footprint area."
            )
            checks.append({
                "rule": "Roof-to-Footprint Ratio",
                "status": False,
                "severity": "High",
                "message": f"Roof area ({actual_roof} m²) is insufficient to cover footprint ({actual_footprint} m²)."
            })
        else:
            checks.append({
                "rule": "Roof-to-Footprint Ratio",
                "status": True,
                "severity": "Low",
                "message": f"Roof area ({actual_roof} m²) properly covers footprint ({actual_footprint} m²)."
            })

        # 5. Wall Area & Openings Plausibility
        perimeter = 4.0 * math.sqrt(actual_footprint)
        estimated_gross_wall = round(perimeter * actual_height, 2)
        if wall_area and wall_area > 0:
            actual_wall = float(wall_area)
            wall_source = "Blueprint-extracted" if is_blueprint_derived else "Estimated"
        else:
            actual_wall = estimated_gross_wall
            wall_source = "Estimated"

        actual_win = float(window_area) if window_area and window_area > 0 else round(total_floor_area * 0.15, 2)
        win_source = "Blueprint-extracted" if (window_area and is_blueprint_derived) else "Estimated"

        actual_door = float(door_area) if door_area and door_area > 0 else round((int(total_floor_area / 25.0) + number_of_floors) * 1.89, 2)
        door_source = "Blueprint-extracted" if (door_area and is_blueprint_derived) else "Estimated"

        total_openings = round(actual_win + actual_door, 2)

        if total_openings >= actual_wall:
            issues.append(
                f"Total opening area (windows: {actual_win} m² + doors: {actual_door} m² = {total_openings} m²) "
                f"exceeds or equals gross wall area ({actual_wall} m²), which is physically impossible."
            )
            checks.append({
                "rule": "Wall Aperture Ratio",
                "status": False,
                "severity": "High",
                "message": f"Apertures ({total_openings} m²) exceed gross wall area ({actual_wall} m²)."
            })
        elif total_openings > (actual_wall * GeometryValidator.MAX_OPENINGS_RATIO):
            warnings.append(
                f"Opening area constitutes {total_openings/actual_wall*100:.1f}% of gross wall area (exceeds typical 70% max solid-to-void ratio)."
            )
            checks.append({
                "rule": "Wall Aperture Ratio",
                "status": True,
                "severity": "Medium",
                "message": f"High opening-to-wall ratio: {total_openings/actual_wall*100:.1f}%."
            })
        else:
            checks.append({
                "rule": "Wall Aperture Ratio",
                "status": True,
                "severity": "Low",
                "message": f"Aperture ratio conforms to structural envelope limits ({total_openings/actual_wall*100:.1f}% of wall)."
            })

        net_wall_area = max(1.0, round(actual_wall - total_openings, 2))

        # 6. Foundation & Structural Volumes Plausibility
        if foundation_volume and foundation_volume > 0:
            actual_found_vol = float(foundation_volume)
            found_source = "Blueprint-extracted" if is_blueprint_derived else "Estimated"
        else:
            actual_found_vol = round(actual_footprint * 0.28, 2)
            found_source = "Estimated"

        if actual_found_vol <= 0:
            issues.append("Foundation volume must be a positive quantity.")
            checks.append({
                "rule": "Foundation Volume Plausibility",
                "status": False,
                "severity": "High",
                "message": "Foundation volume is zero or negative."
            })
        elif actual_found_vol < (actual_footprint * GeometryValidator.MIN_FOUNDATION_DEPTH_RATIO):
            warnings.append(
                f"Foundation volume ({actual_found_vol} m³) appears low relative to footprint ({actual_footprint} m²). Structural footing design should be checked."
            )
            checks.append({
                "rule": "Foundation Volume Plausibility",
                "status": True,
                "severity": "Medium",
                "message": f"Low foundation volume ratio: {actual_found_vol/actual_footprint:.2f} m³/m²."
            })
        else:
            checks.append({
                "rule": "Foundation Volume Plausibility",
                "status": True,
                "severity": "Low",
                "message": f"Foundation volume conforms to parametric baseline ({actual_found_vol} m³)."
            })

        # 7. Concrete Volume & Multi-storey Structural Quantities Scaling
        if concrete_volume and concrete_volume > 0:
            actual_conc_vol = float(concrete_volume)
            conc_source = "Blueprint-extracted" if is_blueprint_derived else "Estimated"
        else:
            # Framing slabs, columns and beams (~0.20 m3/m2 total floor area) + foundation
            actual_conc_vol = round(actual_found_vol + (total_floor_area * 0.20), 2)
            conc_source = "Estimated"

        if structural_frame_area and structural_frame_area > 0:
            actual_frame_area = float(structural_frame_area)
            frame_source = "Blueprint-extracted" if is_blueprint_derived else "Estimated"
        else:
            actual_frame_area = round(total_floor_area * 0.08, 2)
            frame_source = "Estimated"

        # Multi-storey structural scaling check
        if number_of_floors >= 4 and actual_conc_vol < (total_floor_area * 0.15):
            warnings.append(
                f"Concrete volume ({actual_conc_vol} m³) appears low for a {number_of_floors}-storey building requiring reinforced framing."
            )
            checks.append({
                "rule": "Multi-Storey Structural Concrete Scaling",
                "status": True,
                "severity": "Medium",
                "message": "Concrete volume is marginal for multi-storey vertical frame loads."
            })
        else:
            checks.append({
                "rule": "Multi-Storey Structural Concrete Scaling",
                "status": True,
                "severity": "Low",
                "message": "Structural concrete volume scales appropriately with floor count."
            })

        # 8. Overall Status Gate
        status = "REVIEW REQUIRED" if len(issues) > 0 else "PASS"
        if status == "REVIEW REQUIRED":
            summary = (
                "Input geometry requires review: floor count, total area, building height, "
                "or component dimensions appear inconsistent. Extracted geometry should be reviewed "
                "before material quantities are treated as reliable."
            )
        else:
            summary = "Preliminary geometry sanity validation passed. Dimensions conform to structural heuristics."

        # 9. Build Telemetry Geometry Object
        def _build_geom_item(val, unit, src, conf, ok, warn_msg=None):
            return {
                "value": round(float(val), 2),
                "unit": unit,
                "source": src,
                "confidence": conf if ok else max(20.0, conf - 40.0),
                "validation_status": "PASS" if ok else "Potential geometry inconsistency",
                "warning": warn_msg
            }

        geometry_dict = {
            "total_floor_area": _build_geom_item(
                total_floor_area, "m²", source_label, 95.0 if is_blueprint_derived else 80.0,
                area_per_floor >= GeometryValidator.MIN_HABITABLE_AREA_PER_FLOOR_M2 or number_of_floors == 1
            ),
            "number_of_floors": {
                "value": number_of_floors,
                "unit": "storeys",
                "source": source_label,
                "confidence": 98.0,
                "validation_status": "PASS"
            },
            "building_height": _build_geom_item(
                actual_height, "m", height_source, 90.0 if is_blueprint_derived else 75.0,
                GeometryValidator.MIN_FLOOR_HEIGHT_M <= floor_to_floor_h <= GeometryValidator.MAX_FLOOR_HEIGHT_M
            ),
            "floor_to_floor_height": _build_geom_item(
                floor_to_floor_h, "m", height_source, 90.0,
                GeometryValidator.MIN_FLOOR_HEIGHT_M <= floor_to_floor_h <= GeometryValidator.MAX_FLOOR_HEIGHT_M
            ),
            "footprint_area": _build_geom_item(
                actual_footprint, "m²", source_label, 90.0 if is_blueprint_derived else 75.0,
                footprint_discrepancy <= 0.20
            ),
            "roof_area": _build_geom_item(
                actual_roof, "m²", roof_source, 88.0 if is_blueprint_derived else 70.0,
                actual_roof >= (actual_footprint * GeometryValidator.MIN_ROOF_TO_FOOTPRINT_RATIO),
                "Roof area is smaller than footprint." if actual_roof < (actual_footprint * GeometryValidator.MIN_ROOF_TO_FOOTPRINT_RATIO) else None
            ),
            "gross_wall_area": _build_geom_item(
                actual_wall, "m²", wall_source, 85.0 if is_blueprint_derived else 70.0,
                total_openings < actual_wall
            ),
            "net_wall_area": _build_geom_item(
                net_wall_area, "m²", "Calculated (Gross Wall - Openings)", 85.0,
                net_wall_area > 0
            ),
            "window_area": _build_geom_item(
                actual_win, "m²", win_source, 85.0 if is_blueprint_derived else 70.0,
                actual_win < actual_wall
            ),
            "door_area": _build_geom_item(
                actual_door, "m²", door_source, 85.0 if is_blueprint_derived else 70.0,
                actual_door < actual_wall
            ),
            "total_openings_area": _build_geom_item(
                total_openings, "m²", "Calculated (Windows + Doors)", 85.0,
                total_openings < actual_wall
            ),
            "foundation_volume": _build_geom_item(
                actual_found_vol, "m³", found_source, 80.0 if is_blueprint_derived else 65.0,
                actual_found_vol > 0
            ),
            "concrete_volume": _build_geom_item(
                actual_conc_vol, "m³", conc_source, 80.0 if is_blueprint_derived else 65.0,
                actual_conc_vol > 0
            ),
            "structural_frame_area": _build_geom_item(
                actual_frame_area, "m²", frame_source, 75.0,
                actual_frame_area > 0
            )
        }

        return {
            "status": status,
            "summary": summary,
            "is_blueprint_derived": is_blueprint_derived,
            "data_source": "Blueprint-extracted" if is_blueprint_derived else "Parametric / Estimated",
            "issues": issues,
            "warnings": warnings,
            "checks": checks,
            "geometry": geometry_dict
        }


geometry_validator = GeometryValidator()
