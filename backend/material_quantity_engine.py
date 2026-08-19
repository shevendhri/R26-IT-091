import math
from typing import Dict, Any, List

class MaterialQuantityEngine:
    """
    Centralized Quantity Calculation Engine (Preliminary Engineering Takeoff).
    Calculates application-specific quantities, unit counts, and estimated costs
    based on geometric parameters with explicit calculation assumptions.
    """

    @staticmethod
    def calculate_quantities(
        building_type: str = "Residential",
        floor_count: int = 1,
        total_floor_area: float = 100.0,
        wall_area: float = None,
        roof_area: float = None,
        window_area: float = None,
        door_count: int = None,
        structural_system: str = "Concrete Frame",
        location: str = "Colombo",
        is_blueprint_derived: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates preliminary component-specific quantities.
        """
        floor_count = max(1, int(floor_count))
        total_floor_area = max(10.0, float(total_floor_area))
        footprint_area = round(total_floor_area / floor_count, 2)

        # Defensive coercion — form data may pass strings
        try:
            wall_area = float(wall_area) if wall_area is not None else None
        except (TypeError, ValueError):
            wall_area = None
        try:
            door_count = int(door_count) if door_count is not None else None
        except (TypeError, ValueError):
            door_count = None
        try:
            window_area = float(window_area) if window_area is not None else None
        except (TypeError, ValueError):
            window_area = None
        try:
            roof_area = float(roof_area) if roof_area is not None else None
        except (TypeError, ValueError):
            roof_area = None

        # 1. Geometry estimation if not explicitly supplied
        if wall_area is None or wall_area <= 0:
            # Approximate perimeter for rectangular footprint
            perimeter = 4.0 * math.sqrt(footprint_area)
            story_height = 3.0  # meters
            gross_wall_area = round(perimeter * story_height * floor_count, 2)
        else:
            gross_wall_area = round(wall_area, 2)

        if door_count is None or door_count <= 0:
            door_count = max(2, int(total_floor_area / 25.0) + floor_count)
        else:
            door_count = int(door_count)

        if window_area is None or window_area <= 0:
            # Approx 15% of floor area for natural daylighting
            window_area = round(total_floor_area * 0.15, 2)
        else:
            window_area = round(window_area, 2)

        door_area = round(door_count * 1.89, 2) # Standard 0.9m x 2.1m door = 1.89 m2

        # Net wall area deducting openings
        net_wall_area = max(5.0, round(gross_wall_area - window_area - door_area, 2))

        # 2. Roof Surface Area with pitch factor (15-30 deg pitch = ~1.15 multiplier on footprint)
        if roof_area is None or roof_area <= 0:
            roof_pitch_factor = 1.18 if "timber" in structural_system.lower() or "masonry" in structural_system.lower() else 1.12
            calc_roof_area = round(footprint_area * roof_pitch_factor, 2)
        else:
            calc_roof_area = round(roof_area, 2)

        # 3. Foundation Concrete Volume (m3)
        # Structural system determines footing depth and size
        sys_lower = structural_system.lower()
        if "concrete frame" in sys_lower:
            foundation_depth_factor = 0.28 # m3 concrete per m2 footprint
            slab_factor = 0.12 # 120mm suspended/ground slab
            col_beam_factor = 0.08 # Column & beam allowance
            steel_kg_per_m3 = 90.0 # ~90kg steel per m3 concrete
        elif "steel frame" in sys_lower:
            foundation_depth_factor = 0.22
            slab_factor = 0.08
            col_beam_factor = 0.02
            steel_kg_per_m3 = 45.0
        elif "load-bearing masonry" in sys_lower:
            foundation_depth_factor = 0.25 # Continuous strip footings
            slab_factor = 0.10
            col_beam_factor = 0.03
            steel_kg_per_m3 = 35.0
        else: # Timber / Light Frame
            foundation_depth_factor = 0.18
            slab_factor = 0.07
            col_beam_factor = 0.01
            steel_kg_per_m3 = 25.0

        found_concrete_vol = round(footprint_area * foundation_depth_factor, 2)
        frame_concrete_vol = round(total_floor_area * (slab_factor + col_beam_factor), 2)
        total_concrete_vol = round(found_concrete_vol + frame_concrete_vol, 2)
        total_steel_tons = round((total_concrete_vol * steel_kg_per_m3) / 1000.0, 3)

        # 4. Floor Finish and Ceiling Areas with wastage factors
        floor_finish_area = round(total_floor_area * 1.05, 2) # 5% cutting & tile wastage
        ceiling_finish_area = round(total_floor_area * 1.03, 2) # 3% false ceiling trim allowance

        # 5. Waterproofing Area
        # Wet zones (bathrooms/toilets ~12% total area) + plinth/roof exposure
        wet_room_area = round(total_floor_area * 0.12, 2)
        if "concrete frame" in sys_lower:
            plinth_roof_waterproofing = round(footprint_area * 0.5, 2) # Roof slab / plinth
        else:
            plinth_roof_waterproofing = round(footprint_area * 0.2, 2)
        total_waterproofing_area = round(wet_room_area + plinth_roof_waterproofing, 2)

        # 6. Surface Finishes / Paint
        # Internal walls (2 faces) + External walls (1 face) - openings + ceiling
        wall_paint_area = round((net_wall_area * 2.0) + (gross_wall_area * 0.8), 2)

        # Assumptions documentation
        assumptions = [
            f"Building footprint: {footprint_area} m² across {floor_count} storey(s).",
            f"Foundation volume is a preliminary parametric estimate ({found_concrete_vol} m³); actual foundation design requires site-specific geotechnical soil investigation (SPT/borehole) and detailed structural engineering.",
            f"Gross wall area: {gross_wall_area} m², Window deductions: {window_area} m², Door deductions: {door_area} m² ({door_count} doors).",
            f"Net masonry wall area: {net_wall_area} m² (assumes 10mm mortar joint allowance and 5% wastage).",
            f"Roof pitch multiplier: 1.15–1.18× footprint ({calc_roof_area} m² true roof surface).",
            f"Concrete framing factor: {slab_factor + col_beam_factor} m³/m² floor area for {structural_system}.",
            f"Reinforcement steel ratio: {steel_kg_per_m3} kg/m³ concrete ({total_steel_tons} metric tons).",
            f"Wet area waterproofing allowance: 12% of floor area + plinth/slab perimeter ({total_waterproofing_area} m²).",
            f"Flooring and ceiling wastage allowances: 5% and 3% respectively.",
            "All quantities are preliminary decision-support estimates and do not substitute for detailed Bills of Quantities (BOQ) or professional structural certification."
        ]

        geometry_source = "Blueprint Extraction" if is_blueprint_derived else "Preliminary estimated quantity"

        return {
            "geometry_source": geometry_source,
            "footprint_area_m2": footprint_area,
            "total_floor_area_m2": total_floor_area,
            "floor_count": floor_count,
            "gross_wall_area_m2": gross_wall_area,
            "net_wall_area_m2": net_wall_area,
            "foundation_volume_m3": found_concrete_vol,
            "concrete_volume_m3": total_concrete_vol,
            "steel_tonnage_tons": total_steel_tons,
            "roof_surface_area_m2": calc_roof_area,
            "window_area_m2": window_area,
            "door_area_m2": door_area,
            "door_count": door_count,
            "floor_finish_area_m2": floor_finish_area,
            "ceiling_area_m2": ceiling_finish_area,
            "waterproofing_area_m2": total_waterproofing_area,
            "paint_area_m2": wall_paint_area,
            "assumptions": assumptions
        }

    @staticmethod
    def resolve_material_takeoff(component: str, material: Dict[str, Any], quantities: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolves specific unit quantity, piece count, unit rate, and preliminary cost for a material.
        """
        comp_lower = component.lower()
        mat_name = material.get("Name", "")
        name_lower = mat_name.lower()
        unit = material.get("Unit") or "m²"
        unit_rate = float(material.get("Unit_Rate") or material.get("Rate_LKR") or 0.0)

        quantity = 0.0
        unit_count_label = None

        if "foundation" in comp_lower:
            quantity = quantities.get("foundation_volume_m3", 25.0)
            unit = "m³"
            unit_count_label = f"{quantity:.1f} m³ structural foundation volume"

        elif "structural" in comp_lower or "concrete" in comp_lower:
            if "rebar" in name_lower or "steel" in name_lower or "gfrp" in name_lower or unit == "ton":
                quantity = quantities.get("steel_tonnage_tons", 1.8)
                unit = "ton"
                unit_count_label = f"{quantity:.2f} metric tons ({int(quantity * 1000)} kg) rebar"
            else:
                quantity = quantities.get("concrete_volume_m3", 20.0)
                unit = "m³"
                unit_count_label = f"{quantity:.1f} m³ frame concrete"

        elif "wall" in comp_lower:
            quantity = quantities.get("net_wall_area_m2", 100.0)
            unit = "m²"
            if "brick" in name_lower or "wire-cut" in name_lower:
                # 9-inch brick wall ~110 bricks/m2 including mortar & wastage
                units_needed = int(math.ceil(quantity * 110))
                unit_count_label = f"Approx. {units_needed:,} bricks ({quantity:.1f} m² net wall)"
            elif "aac" in name_lower:
                units_needed = int(math.ceil(quantity * 8.33)) # 600x200 blocks
                unit_count_label = f"Approx. {units_needed:,} AAC blocks ({quantity:.1f} m² net wall)"
            elif "cseb" in name_lower:
                units_needed = int(math.ceil(quantity * 88))
                unit_count_label = f"Approx. {units_needed:,} earth blocks ({quantity:.1f} m² net wall)"
            elif "hollow clay" in name_lower:
                units_needed = int(math.ceil(quantity * 16.5))
                unit_count_label = f"Approx. {units_needed:,} hollow clay blocks ({quantity:.1f} m²)"
            else:
                units_needed = int(math.ceil(quantity * 12.5)) # Standard 400x200x150 block
                unit_count_label = f"Approx. {units_needed:,} cement blocks ({quantity:.1f} m² net wall)"

        elif "roof" in comp_lower:
            quantity = quantities.get("roof_surface_area_m2", 80.0)
            unit = "m²"
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
            quantity = quantities.get("window_area_m2", 15.0)
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² window aperture glazing"

        elif "door" in comp_lower:
            quantity = float(quantities.get("door_count", 4))
            unit = "units"
            unit_count_label = f"{int(quantity)} door units"

        elif "floor" in comp_lower:
            quantity = quantities.get("floor_finish_area_m2", 100.0)
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² floor surface area (+5% wastage)"

        elif "ceiling" in comp_lower:
            quantity = quantities.get("ceiling_area_m2", 100.0)
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² ceiling system (+3% trim allowance)"

        elif "waterproof" in comp_lower:
            quantity = quantities.get("waterproofing_area_m2", 30.0)
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m² wet area & plinth waterproofing"

        elif "finish" in comp_lower or "paint" in comp_lower:
            quantity = quantities.get("paint_area_m2", 250.0)
            unit = "m²"
            liters = int(math.ceil(quantity / 10.0 * 2)) # 10m2/L 2 coats
            unit_count_label = f"{quantity:.1f} m² surface (~{liters}L paint for 2 coats)"

        else:
            quantity = quantities.get("total_floor_area_m2", 100.0)
            unit = "m²"
            unit_count_label = f"{quantity:.1f} m²"

        # Preliminary Cost Calculation
        if unit_rate > 0:
            total_cost_lkr = round(quantity * unit_rate, 2)
            cost_label = f"LKR {total_cost_lkr:,.2f}"
            rate_label = f"LKR {unit_rate:,.2f} / {unit}"
            rate_status = "Preliminary rate"
        else:
            total_cost_lkr = None
            cost_label = "Rate unavailable"
            rate_label = "Rate unavailable"
            rate_status = "Rate unavailable"

        # Embodied carbon calculation
        embodied_carbon_factor = float(material.get("Embodied_Carbon") or 0.35)
        # For tons of rebar, embodied carbon factor is per kg -> multiply by quantity * 1000
        if unit == "ton":
            embodied_carbon_kg = round(quantity * 1000.0 * embodied_carbon_factor, 2)
        elif unit == "m³":
            embodied_carbon_kg = round(quantity * 2400.0 * embodied_carbon_factor, 2) # approx concrete density 2400kg/m3
        else:
            embodied_carbon_kg = round(quantity * 25.0 * embodied_carbon_factor, 2)

        return {
            "quantity": round(quantity, 2),
            "unit": unit,
            "unit_count_label": unit_count_label,
            "unit_rate_lkr": unit_rate if unit_rate > 0 else None,
            "rate_label": rate_label,
            "rate_status": rate_status,
            "rate_basis": material.get("Rate_Basis") or "Preliminary illustrative rate (Colombo baseline)",
            "data_quality": material.get("Data_Quality") or "Prototype / illustrative data",
            "standard_reference": material.get("Standard_Reference") or "SLS-Referenced Rule Check",
            "total_cost_lkr": total_cost_lkr,
            "cost_label": cost_label,
            "embodied_carbon_kg": embodied_carbon_kg,
            "embodied_carbon_tons": round(embodied_carbon_kg / 1000.0, 3)
        }
