"""
material_quantity_engine.py — GreenConstructAI Quantity Calculation Engine
===========================================================================
Centralized parametric and blueprint-derived quantity takeoff engine.
Calculates engineering-accurate structural quantities, piece counts, and
enforces explicit calculation bases and source telemetry.
"""

import math
from typing import Dict, Any, List, Optional
try:
    from backend.geometry_validator import GeometryValidator
except ImportError:
    from geometry_validator import GeometryValidator


MAX_OPENING_RATIO_BY_BUILDING_TYPE = {
    "Residential": 0.40,
    "Commercial": 0.60,
    "Healthcare": 0.60,
    "Industrial": 0.30,
    "School": 0.45,
    "Hotel": 0.55,
    "Default": 0.50
}


class MaterialQuantityEngine:
    """
    Centralized Quantity Calculation Engine (Preliminary Engineering Takeoff).
    Calculates component-specific quantities, unit counts, and calculation bases
    derived strictly from geometric parameters.
    """

    @staticmethod
    def calculate_quantities(
        building_type: str = "Residential",
        floor_count: int = 1,
        total_floor_area: float = 100.0,
        wall_area: Optional[float] = None,
        roof_area: Optional[float] = None,
        window_area: Optional[float] = None,
        door_count: Optional[int] = None,
        door_area: Optional[float] = None,
        structural_system: str = "Concrete Frame",
        location: str = "Colombo",
        is_blueprint_derived: bool = False,
        building_height: Optional[float] = None,
        foundation_volume: Optional[float] = None,
        concrete_volume: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates preliminary component-specific quantities and attaches geometry validation telemetry.
        """
        quantity_warnings: List[str] = []

        floor_count = max(1, int(floor_count or 1))
        total_floor_area = max(1.0, float(total_floor_area or 100.0))
        footprint_area = round(total_floor_area / floor_count, 2)

        # Defensive coercion
        try:
            wall_area_val = float(wall_area) if wall_area is not None and float(wall_area) > 0 else None
        except (TypeError, ValueError):
            wall_area_val = None

        try:
            door_count_val = int(door_count) if door_count is not None and int(door_count) > 0 else None
        except (TypeError, ValueError):
            door_count_val = None

        try:
            door_area_val = float(door_area) if door_area is not None and float(door_area) > 0 else None
        except (TypeError, ValueError):
            door_area_val = None

        try:
            window_area_val = float(window_area) if window_area is not None and float(window_area) > 0 else None
        except (TypeError, ValueError):
            window_area_val = None

        try:
            roof_area_val = float(roof_area) if roof_area is not None and float(roof_area) > 0 else None
        except (TypeError, ValueError):
            roof_area_val = None

        try:
            height_val = float(building_height) if building_height is not None and float(building_height) > 0 else None
        except (TypeError, ValueError):
            height_val = None

        # 1. Height & Gross Wall Estimation
        story_height = round(height_val / floor_count, 2) if (height_val and height_val > 0) else 3.0
        total_height = height_val if (height_val and height_val > 0) else round(story_height * floor_count, 2)
        perimeter = round(4.0 * math.sqrt(footprint_area), 2)
        estimated_gross_wall = round(perimeter * total_height, 2)

        if wall_area_val is None:
            gross_wall_area = estimated_gross_wall
            wall_source = "Preliminary estimated quantity"
            wall_conf = 75.0
        else:
            gross_wall_area = round(wall_area_val, 2)
            wall_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"
            wall_conf = 90.0 if is_blueprint_derived else 80.0

        # 2. Openings Estimation with Configurable Sanity Validation
        if door_count_val is None:
            door_count_val = max(2, int(total_floor_area / 25.0) + floor_count)
            door_source = "Preliminary estimated quantity"
            door_conf = 75.0
        else:
            door_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"
            door_conf = 92.0 if is_blueprint_derived else 85.0

        if door_area_val is None:
            door_area_val = round(door_count_val * 1.89, 2)  # 0.9m x 2.1m standard door leaf
        else:
            door_area_val = round(door_area_val, 2)

        if window_area_val is None:
            window_area_val = round(total_floor_area * 0.15, 2)  # 15% aperture guideline for daylighting
            win_source = "Preliminary estimated quantity"
            win_conf = 75.0
        else:
            window_area_val = round(window_area_val, 2)
            win_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"
            win_conf = 90.0 if is_blueprint_derived else 80.0

        # Configurable maximum opening ratio by building type
        b_type_key = building_type.strip().title() if building_type else "Default"
        max_opening_ratio = MAX_OPENING_RATIO_BY_BUILDING_TYPE.get(b_type_key, MAX_OPENING_RATIO_BY_BUILDING_TYPE["Default"])

        total_openings = round(window_area_val + door_area_val, 2)
        opening_ratio = (total_openings / gross_wall_area) if gross_wall_area > 0 else 0.0

        # Sanity adjustment if opening ratio exceeds configurable maximum
        if opening_ratio > max_opening_ratio and gross_wall_area > 0:
            allowed_max_openings = round(gross_wall_area * max_opening_ratio, 2)
            scale = allowed_max_openings / total_openings if total_openings > 0 else 1.0
            window_area_val = round(window_area_val * scale, 2)
            door_area_val = round(door_area_val * scale, 2)
            total_openings = allowed_max_openings
            quantity_warnings.append(
                f"Preliminary quantity estimate adjusted by geometry sanity constraints: opening area capped at {max_opening_ratio*100:.0f}% of gross wall area ({gross_wall_area} m²) to ensure positive structural envelope plausibility."
            )

        net_wall_area = max(0.0, round(gross_wall_area - total_openings, 2))

        # 3. Roof Surface Area with pitch factor
        sys_lower = structural_system.lower()
        if "timber" in sys_lower or "masonry" in sys_lower:
            pitch_factor = 1.18  # Pitched timber roof
        elif "steel" in sys_lower:
            pitch_factor = 1.14
        else:
            pitch_factor = 1.12  # Concrete flat/low-pitch roof

        if roof_area_val is None:
            calc_roof_area = round(footprint_area * pitch_factor, 2)
            roof_source = "Preliminary estimated quantity"
            roof_conf = 75.0
        else:
            calc_roof_area = round(roof_area_val, 2)
            roof_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"
            roof_conf = 90.0 if is_blueprint_derived else 80.0

        # 4. Foundation Concrete Volume (m3) & Structural Concrete
        if "concrete frame" in sys_lower:
            foundation_depth_factor = 0.28  # m3 concrete per m2 footprint
            slab_factor = 0.12              # 120mm suspended/ground slab
            col_beam_factor = 0.08          # Column & beam structural matrix allowance
            steel_kg_per_m3 = 90.0          # ~90kg steel per m3 concrete (SLS 375)
        elif "steel frame" in sys_lower:
            foundation_depth_factor = 0.22
            slab_factor = 0.08
            col_beam_factor = 0.02
            steel_kg_per_m3 = 45.0
        elif "load-bearing masonry" in sys_lower:
            foundation_depth_factor = 0.25
            slab_factor = 0.10
            col_beam_factor = 0.03
            steel_kg_per_m3 = 35.0
        else:  # Timber / Light Frame
            foundation_depth_factor = 0.18
            slab_factor = 0.07
            col_beam_factor = 0.01
            steel_kg_per_m3 = 25.0

        if foundation_volume and float(foundation_volume) > 0:
            found_concrete_vol = round(float(foundation_volume), 2)
            found_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"
            found_conf = 85.0
        else:
            found_concrete_vol = round(footprint_area * foundation_depth_factor, 2)
            found_source = "Preliminary estimated quantity"
            found_conf = 75.0

        if concrete_volume and float(concrete_volume) > 0:
            total_concrete_vol = round(float(concrete_volume), 2)
            conc_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"
            conc_conf = 85.0
        else:
            frame_concrete_vol = round(total_floor_area * (slab_factor + col_beam_factor), 2)
            total_concrete_vol = round(found_concrete_vol + frame_concrete_vol, 2)
            conc_source = "Preliminary estimated quantity"
            conc_conf = 75.0

        total_steel_tons = round((total_concrete_vol * steel_kg_per_m3) / 1000.0, 3)

        # 5. Floor Finish and Ceiling Areas with standard trim/wastage factors
        floor_finish_area = round(total_floor_area * 1.05, 2)  # 5% cutting & tile wastage
        ceiling_finish_area = round(total_floor_area * 1.03, 2)  # 3% false ceiling trim allowance

        # 6. Waterproofing Area
        # Wet zones (~12% total floor area for bathrooms/toilets) + plinth/roof exposure
        wet_room_area = round(total_floor_area * 0.12, 2)
        if "concrete frame" in sys_lower:
            plinth_roof_waterproofing = round(footprint_area * 0.5, 2)
        else:
            plinth_roof_waterproofing = round(footprint_area * 0.2, 2)
        total_waterproofing_area = round(wet_room_area + plinth_roof_waterproofing, 2)

        # 7. Surface Finishes / Paint
        # Internal wall faces (2x net wall) + external wall face (1x gross wall - windows) + ceiling
        wall_paint_area = round((net_wall_area * 2.0) + (gross_wall_area * 0.85) + ceiling_finish_area, 2)

        # 8. Run Geometry Plausibility Validation
        validation_report = GeometryValidator.validate_geometry(
            total_floor_area=total_floor_area,
            number_of_floors=floor_count,
            building_height=total_height,
            footprint_area=footprint_area,
            roof_area=calc_roof_area,
            wall_area=gross_wall_area,
            window_area=window_area_val,
            door_area=door_area_val,
            foundation_volume=found_concrete_vol,
            concrete_volume=total_concrete_vol,
            is_blueprint_derived=is_blueprint_derived,
            building_type=building_type
        )

        geometry_source = "Blueprint-extracted" if is_blueprint_derived else "Preliminary estimated quantity"

        assumptions = [
            f"Building footprint: {footprint_area} m² across {floor_count} storey(s).",
            f"Foundation volume is a preliminary parametric estimate ({found_concrete_vol} m³); actual foundation design requires site-specific geotechnical soil investigation and professional engineering.",
            f"Gross wall area: {gross_wall_area} m², Window deductions: {window_area_val} m², Door deductions: {door_area_val} m² ({door_count_val} doors).",
            f"Net masonry wall area: {net_wall_area} m² (assumes 10mm mortar joint allowance and 5% wastage).",
            f"Roof pitch multiplier: {pitch_factor}× footprint ({calc_roof_area} m² true roof surface).",
            f"Concrete framing factor: {slab_factor + col_beam_factor:.2f} m³/m² floor area for {structural_system}.",
            f"Reinforcement steel ratio: {steel_kg_per_m3} kg/m³ concrete ({total_steel_tons} metric tons).",
            f"Wet area waterproofing allowance: 12% of floor area + plinth/slab perimeter ({total_waterproofing_area} m²).",
            f"Flooring and ceiling wastage allowances: 5% and 3% respectively.",
            "All quantities are preliminary decision-support estimates and do not substitute for detailed Bills of Quantities (BOQ) or professional structural certification."
        ]

        def _make_qty_field(val, unit, basis, src, conf):
            return {
                "quantity": val,
                "unit": unit,
                "calculation_basis": basis,
                "source": src,
                "confidence": conf
            }

        return {
            "geometry_source": geometry_source,
            "validation_status": validation_report["status"],
            "validation_report": validation_report,
            "footprint_area_m2": footprint_area,
            "total_floor_area_m2": total_floor_area,
            "gross_floor_area_m2": total_floor_area,
            "floor_count": floor_count,
            "building_height_m": total_height,
            "gross_wall_area_m2": gross_wall_area,
            "net_wall_area_m2": net_wall_area,
            "foundation_volume_m3": found_concrete_vol,
            "concrete_volume_m3": total_concrete_vol,
            "steel_tonnage_tons": total_steel_tons,
            "roof_surface_area_m2": calc_roof_area,
            "window_area_m2": window_area_val,
            "door_area_m2": door_area_val,
            "door_count": door_count_val,
            "floor_finish_area_m2": floor_finish_area,
            "ceiling_area_m2": ceiling_finish_area,
            "waterproofing_area_m2": total_waterproofing_area,
            "paint_area_m2": wall_paint_area,
            "assumptions": assumptions,
            # Structured takeoff objects for direct component consumption
            "takeoffs": {
                "foundation": _make_qty_field(
                    found_concrete_vol, "m³",
                    f"{found_concrete_vol} m³ — Estimated from footprint ({footprint_area} m²) × depth factor ({foundation_depth_factor})",
                    found_source, found_conf
                ),
                "structural_frame": _make_qty_field(
                    total_concrete_vol, "m³",
                    f"{total_concrete_vol} m³ — Estimated from structural frame allowance ({slab_factor + col_beam_factor:.2f} m³/m²)",
                    conc_source, conc_conf
                ),
                "reinforcement": _make_qty_field(
                    total_steel_tons, "tons",
                    f"{total_steel_tons} metric tons — Estimated from concrete volume ({total_concrete_vol} m³) × {steel_kg_per_m3} kg/m³",
                    conc_source, conc_conf
                ),
                "walling": _make_qty_field(
                    net_wall_area, "m²",
                    f"{net_wall_area} m² — Calculated from gross wall ({gross_wall_area} m²) minus openings ({total_openings} m²)",
                    wall_source, wall_conf
                ),
                "roofing": _make_qty_field(
                    calc_roof_area, "m²",
                    f"{calc_roof_area} m² — Calculated from footprint ({footprint_area} m²) × pitch factor ({pitch_factor})",
                    roof_source, roof_conf
                ),
                "windows": _make_qty_field(
                    window_area_val, "m²",
                    f"{window_area_val} m² — Calculated from 15% daylight aperture ratio on floor area",
                    win_source, win_conf
                ),
                "doors": _make_qty_field(
                    float(door_count_val), "nos",
                    f"{door_count_val} door units — Estimated from occupancy and floor count",
                    door_source, door_conf
                ),
                "flooring": _make_qty_field(
                    floor_finish_area, "m²",
                    f"{floor_finish_area} m² — Floor area ({total_floor_area} m²) + 5% tile wastage factor",
                    geometry_source, 85.0
                ),
                "ceiling": _make_qty_field(
                    ceiling_finish_area, "m²",
                    f"{ceiling_finish_area} m² — Ceiling area ({total_floor_area} m²) + 3% trim allowance",
                    geometry_source, 85.0
                ),
                "waterproofing": _make_qty_field(
                    total_waterproofing_area, "m²",
                    f"{total_waterproofing_area} m² — Wet areas (12% floor area = {wet_room_area} m²) + plinth/roof exposure",
                    geometry_source, 80.0
                ),
                "finishes": _make_qty_field(
                    wall_paint_area, "m²",
                    f"{wall_paint_area} m² — Internal net walls (2 faces) + external wall face + ceiling",
                    geometry_source, 80.0
                )
            }
        }

    @staticmethod
    def resolve_material_takeoff(component: str, material: Dict[str, Any], quantities: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolves specific unit quantity, piece count, and calculation basis for a material recommendation.
        """
        comp_lower = component.lower()
        mat_name = material.get("Name", "")
        name_lower = mat_name.lower()
        unit = material.get("Unit") or "m²"
        data_quality = material.get("Data_Quality") or "Prototype / illustrative data"
        standard_ref = material.get("Standard_Reference") or "SLS-Referenced Rule Check"
        is_blueprint = quantities.get("geometry_source") == "Blueprint-extracted"
        source_label = "Blueprint-extracted" if is_blueprint else "Preliminary estimated quantity"

        takeoffs = quantities.get("takeoffs", {})

        quantity = 0.0
        unit_count_label = None
        calculation_basis = "Parametric preliminary takeoff"

        if "foundation" in comp_lower:
            t = takeoffs.get("foundation", {})
            quantity = t.get("quantity", quantities.get("foundation_volume_m3", 25.0))
            unit = "m³"
            unit_count_label = f"{quantity:.1f} m³ structural foundation volume"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m³ — Estimated from footprint and soil depth factor")

        elif "structural" in comp_lower or "concrete" in comp_lower:
            if "rebar" in name_lower or "steel" in name_lower or "gfrp" in name_lower or unit == "ton":
                t = takeoffs.get("reinforcement", {})
                quantity = t.get("quantity", quantities.get("steel_tonnage_tons", 1.8))
                unit = "ton"
                unit_count_label = f"{quantity:.2f} metric tons ({int(quantity * 1000)} kg) rebar"
                calculation_basis = t.get("calculation_basis", f"{quantity:.2f} tons — Estimated from concrete reinforcement ratio")
            else:
                t = takeoffs.get("structural_frame", {})
                quantity = t.get("quantity", quantities.get("concrete_volume_m3", 20.0))
                unit = "m³"
                unit_count_label = f"{quantity:.1f} m³ structural frame concrete"
                calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m³ — Estimated from structural frame matrix")

        elif "wall" in comp_lower:
            t = takeoffs.get("walling", {})
            quantity = t.get("quantity", quantities.get("net_wall_area_m2", 100.0))
            unit = "m²"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Calculated from gross wall area minus window/door apertures")
            if "brick" in name_lower or "wire-cut" in name_lower:
                units_needed = int(math.ceil(quantity * 110))
                unit_count_label = f"Approx. {units_needed:,} bricks ({quantity:.1f} m² net wall)"
            elif "aac" in name_lower:
                units_needed = int(math.ceil(quantity * 8.33))
                unit_count_label = f"Approx. {units_needed:,} AAC blocks ({quantity:.1f} m² net wall)"
            elif "cseb" in name_lower:
                units_needed = int(math.ceil(quantity * 88))
                unit_count_label = f"Approx. {units_needed:,} earth blocks ({quantity:.1f} m² net wall)"
            elif "hollow clay" in name_lower:
                units_needed = int(math.ceil(quantity * 16.5))
                unit_count_label = f"Approx. {units_needed:,} hollow clay blocks ({quantity:.1f} m²)"
            else:
                units_needed = int(math.ceil(quantity * 12.5))
                unit_count_label = f"Approx. {units_needed:,} cement blocks ({quantity:.1f} m² net wall)"

        elif "roof" in comp_lower:
            t = takeoffs.get("roofing", {})
            quantity = t.get("quantity", quantities.get("roof_surface_area_m2", 80.0))
            unit = "m²"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Calculated from building footprint × pitch factor")
            if "clay tile" in name_lower or "terracotta" in name_lower:
                units_needed = int(math.ceil(quantity * 16))
                unit_count_label = f"Approx. {units_needed:,} clay tiles ({quantity:.1f} m² roof)"
            elif "cement tile" in name_lower:
                units_needed = int(math.ceil(quantity * 12))
                unit_count_label = f"Approx. {units_needed:,} cement tiles ({quantity:.1f} m² roof)"
            elif "aluminium" in name_lower or "zinc" in name_lower or "corrugated" in name_lower:
                sheets = int(math.ceil(quantity / 2.8))
                unit_count_label = f"Approx. {sheets} roofing sheets ({quantity:.1f} m² surface)"
            elif "sandwich" in name_lower:
                panels = int(math.ceil(quantity / 5.5))
                unit_count_label = f"Approx. {panels} sandwich panels ({quantity:.1f} m² surface)"
            else:
                unit_count_label = f"{quantity:.1f} m² roof coverage"

        elif "window" in comp_lower:
            t = takeoffs.get("windows", {})
            quantity = t.get("quantity", quantities.get("window_area_m2", 15.0))
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² window aperture glazing"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Calculated from 15% natural daylight aperture ratio")

        elif "door" in comp_lower:
            t = takeoffs.get("doors", {})
            quantity = t.get("quantity", float(quantities.get("door_count", 4)))
            unit = "nos"
            unit_count_label = f"{int(quantity)} door units"
            calculation_basis = t.get("calculation_basis", f"{int(quantity)} units — Derived from room program and floor count")

        elif "floor" in comp_lower:
            t = takeoffs.get("flooring", {})
            quantity = t.get("quantity", quantities.get("floor_finish_area_m2", 100.0))
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² floor surface area (+5% wastage)"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Total floor area + 5% tile cutting allowance")

        elif "ceiling" in comp_lower:
            t = takeoffs.get("ceiling", {})
            quantity = t.get("quantity", quantities.get("ceiling_area_m2", 100.0))
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² ceiling system (+3% trim allowance)"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Total floor area + 3% false ceiling trim allowance")

        elif "waterproof" in comp_lower:
            t = takeoffs.get("waterproofing", {})
            quantity = t.get("quantity", quantities.get("waterproofing_area_m2", 30.0))
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² wet area & plinth waterproofing"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Wet rooms (12% floor area) + plinth moisture barrier")

        elif "finish" in comp_lower or "paint" in comp_lower:
            t = takeoffs.get("finishes", {})
            quantity = t.get("quantity", quantities.get("paint_area_m2", 250.0))
            unit = "m²"
            liters = int(math.ceil(quantity / 10.0 * 2))  # 10m2/L 2 coats
            unit_count_label = f"{quantity:.1f} m² surface (~{liters}L paint for 2 coats)"
            calculation_basis = t.get("calculation_basis", f"{quantity:.1f} m² — Internal net walls (2 coats) + external face + ceiling")

        else:
            quantity = quantities.get("total_floor_area_m2", 100.0)
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m²"
            calculation_basis = f"{quantity:.1f} m² — Gross area parameter"

        # Embodied carbon calculation
        embodied_carbon_factor = float(material.get("Embodied_Carbon") or 0.35)
        if unit == "ton":
            embodied_carbon_kg = round(quantity * 1000.0 * embodied_carbon_factor, 2)
        elif unit == "m³":
            embodied_carbon_kg = round(quantity * 2400.0 * embodied_carbon_factor, 2)
        else:
            embodied_carbon_kg = round(quantity * 25.0 * embodied_carbon_factor, 2)

        # Validation status check for preliminary quantity takeoff
        status = "PASS"
        msg = "Preliminary quantity takeoff validated using parametric heuristics."

        if quantity < 0:
            status = "FAIL"
            msg = "Calculated quantity is negative, which is an invalid geometry error."
        elif quantity == 0 and comp_lower not in ("waterproofing",):
            status = "WARNING"
            msg = "Calculated preliminary quantity is zero."
        elif any("adjusted by geometry sanity constraints" in str(a) for a in quantities.get("assumptions", [])):
            status = "WARNING"
            msg = "Estimate adjusted using parametric sanity constraints."

        return {
            "quantity": round(quantity, 2),
            "unit": unit,
            "status": status,
            "message": msg,
            "unit_count_label": unit_count_label,
            "calculation_basis": calculation_basis,
            "source": source_label,
            "data_quality": data_quality,
            "standard_reference": standard_ref,
            "embodied_carbon_kg": embodied_carbon_kg,
            "embodied_carbon_tons": round(embodied_carbon_kg / 1000.0, 3)
        }
