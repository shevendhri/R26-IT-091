import math
from typing import Dict, Any

class MaterialQuantityEngine:
    """
    Calculates realistic construction material quantities and counts
    for 12 building dimensions based on structured plan analyzer output.
    """
    
    @staticmethod
    def calculate_quantities(
        building_type: str,
        floor_count: int,
        total_floor_area: float,
        wall_area: float,
        roof_area: float,
        window_area: float,
        door_count: int,
        structural_system: str,
        location: str
    ) -> Dict[str, Any]:
        
        # 1. Base Footprint Area
        floor_count = max(1, floor_count)
        footprint_area = total_floor_area / floor_count
        
        # 2. Foundation Volume (m3)
        # Concrete/Steel frames require deeper pads/beams
        if structural_system.lower() in ["concrete frame", "steel frame"]:
            foundation_vol = footprint_area * 0.35
        elif structural_system.lower() == "load-bearing masonry":
            foundation_vol = footprint_area * 0.28
        else: # Timber Frame or other
            foundation_vol = footprint_area * 0.20
            
        # 3. Concrete Volume (m3)
        # Slabs
        if structural_system.lower() in ["concrete frame", "load-bearing masonry"]:
            slab_concrete = total_floor_area * 0.12 # 120mm slab thickness
        else: # Steel/Timber Frame
            slab_concrete = total_floor_area * 0.07 # Ground slab + light composite deck topping
            
        # Columns & Beams
        col_beam_concrete = total_floor_area * 0.08 if structural_system.lower() == "concrete frame" else 0.0
        
        # Foundation Concrete
        if structural_system.lower() in ["concrete frame", "steel frame"]:
            found_concrete = footprint_area * 0.25
        else:
            found_concrete = footprint_area * 0.18
            
        total_concrete_vol = slab_concrete + col_beam_concrete + found_concrete
        
        # 4. Steel Quantity (Tons)
        if structural_system.lower() == "concrete frame":
            steel_tonnage = total_concrete_vol * 0.095 # ~95kg/m3 concrete
        elif structural_system.lower() == "steel frame":
            # High structural steel framing (45kg/m2 floor area) + composite slab reinforcement
            struct_steel = total_floor_area * 0.045
            rebar_steel = total_concrete_vol * 0.05
            steel_tonnage = struct_steel + rebar_steel
        elif structural_system.lower() == "load-bearing masonry":
            steel_tonnage = total_concrete_vol * 0.035
        else: # Timber Frame
            steel_tonnage = total_concrete_vol * 0.025
            
        # 5. Net Wall Area (m2)
        door_area = door_count * 2.0  # Approx 2m2 per door
        net_wall_area = max(1.0, wall_area - window_area - door_area)
        
        # 6. Floor Finish Area (m2)
        floor_finish_area = total_floor_area
        
        # 7. Ceiling Area (m2)
        ceiling_area = total_floor_area
        
        # 8. Waterproofing Area (m2)
        # Bathrooms/Wet zones (approx 12% of total floor area)
        wet_waterproofing = total_floor_area * 0.12
        # Flat roof or foundation plinth waterproofing
        if structural_system.lower() == "concrete frame":
            roof_waterproofing = footprint_area # Assume flat slab roof waterproofing
        else:
            roof_waterproofing = footprint_area * 0.15 # Balconies, plinth beam waterproofing
        total_waterproofing_area = wet_waterproofing + roof_waterproofing

        return {
            "footprint_area": round(footprint_area, 2),
            "foundation_volume": round(foundation_vol, 2),
            "concrete_volume": round(total_concrete_vol, 2),
            "steel_tonnage": round(steel_tonnage, 3),
            "net_wall_area": round(net_wall_area, 2),
            "roof_area": round(roof_area, 2),
            "window_area": round(window_area, 2),
            "door_count": door_count,
            "floor_finish_area": round(floor_finish_area, 2),
            "ceiling_area": round(ceiling_area, 2),
            "waterproofing_area": round(total_waterproofing_area, 2),
        }
        
    @staticmethod
    def calculate_block_count(material_name: str, wall_area: float) -> int:
        """Calculates quantity of brick/block units required based on material type."""
        name_lower = material_name.lower()
        if "wire-cut" in name_lower or "clay brick" in name_lower:
            # Standard 9-inch brick wall requires ~110 bricks/m2
            return int(math.ceil(wall_area * 110))
        elif "aac" in name_lower or "aerated" in name_lower:
            # Standard 600x200x200 blocks require ~10 blocks/m2
            return int(math.ceil(wall_area * 10))
        elif "stabilized earth" in name_lower or "cseb" in name_lower:
            # CSEB blocks require ~88 blocks/m2 for 9-inch load-bearing wall
            return int(math.ceil(wall_area * 88))
        else:
            # Default Cement Block (400x200x150) requires ~12.5 blocks/m2
            return int(math.ceil(wall_area * 12.5))

    @staticmethod
    def calculate_roof_count(material_name: str, roof_area: float) -> int:
        """Calculates quantity of tiles or panels required based on roof material."""
        name_lower = material_name.lower()
        if "clay tile" in name_lower or "portuguese" in name_lower:
            # Traditional clay tiles require ~16 tiles/m2 including overlaps
            return int(math.ceil(roof_area * 16))
        elif "cement tile" in name_lower:
            # Concrete tiles require ~12 tiles/m2
            return int(math.ceil(roof_area * 12))
        elif "aluminium" in name_lower or "metal" in name_lower:
            # Sheets are sold in lengths covering ~3m2 each
            return int(math.ceil(roof_area / 3.0))
        elif "sandwich" in name_lower:
            # Roof panels cover ~6m2 each
            return int(math.ceil(roof_area / 6.0))
        else:
            # Generic tiles or roof sheet units (defaulting to 15 units/m2)
            return int(math.ceil(roof_area * 15))
