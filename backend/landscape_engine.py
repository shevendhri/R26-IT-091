from typing import Dict, Any, List

class LandscapeIntelligenceEngine:
    def __init__(self):
        pass

    def generate_landscape(self, style_name: str, climate: Dict[str, Any], budget_tier: str, bp_w: float, bp_h: float) -> Dict[str, Any]:
        """
        Generates a site landscaping plan with pathways, gardens, boundary walls, 
        gates, water features, lighting, and plantings matching style, budget, and climate inputs.
        """
        style = style_name.lower()
        climate_type = climate.get("type", "Intermediate").lower()
        budget = budget_tier.lower()

        # 1. Base Materials & Ground color
        ground_color = "#2d6a2d" # Green grass
        if "tropical" in style or "traditional" in style:
            ground_color = "#1a4d10" # Lush dark green
        elif "minimalist" in style:
            ground_color = "#2a4018" # Muted olive green
        elif "colonial" in style:
            ground_color = "#1e3a1e" # Saturated English garden green

        # 2. Boundary Walls and Gates
        wall_material = "Plastered Brick"
        wall_height = 1.8
        if "eco" in style:
            wall_material = "Earth Rammed CSEB"
            wall_height = 1.6
        elif "luxury" in style:
            wall_material = "Precast Concrete & Stone Panels"
            wall_height = 2.2
        elif "industrial" in style:
            wall_material = "Exposed Brick & Wire Fencing"
            wall_height = 2.0

        gate_type = "Steel Sliding Gate"
        if "traditional" in style or "tropical" in style:
            gate_type = "Timber-clad sliding iron gate"
        elif "colonial" in style:
            gate_type = "Wrought iron double swing gate"
        elif "minimalist" in style or "luxury" in style:
            gate_type = "Seamless aluminum cantilever gate"

        # 3. Water Features (based on style + budget)
        water_feature = None
        if budget in ("balanced", "premium"):
            if "luxury" in style:
                water_feature = {
                    "type": "swimming_pool",
                    "position": {"x": -bp_w/2 - 7.5, "z": 0.0},
                    "dimensions": {"w": 7.8, "l": 12.5, "d": 1.5},
                    "description": "Premium infinity swimming pool with wooden deck."
                }
            elif "colonial" in style or "mediterranean" in style:
                water_feature = {
                    "type": "tiered_fountain",
                    "position": {"x": bp_w*0.3, "z": bp_h/2 + 9.5},
                    "dimensions": {"w": 2.4, "l": 2.4, "h": 1.4},
                    "description": "Three-tiered stone water fountain centerpiece."
                }
            elif "minimalist" in style or "scandinavian" in style:
                water_feature = {
                    "type": "reflection_pond",
                    "position": {"x": -bp_w/2 - 5.0, "z": -bp_h * 0.3},
                    "dimensions": {"w": 3.5, "l": 6.0, "d": 0.4},
                    "description": "Minimalist shallow reflection pond with black slate lining."
                }
            elif "tropical" in style or "traditional" in style:
                water_feature = {
                    "type": "natural_pond",
                    "position": {"x": -bp_w/2 - 6.0, "z": bp_h * 0.2},
                    "dimensions": {"w": 4.5, "l": 5.0, "d": 0.8},
                    "description": "Natural fish pond with rock borders and lilies."
                }

        # 4. Driveway and Paths
        driveway_w = 4.5
        driveway_l = 12.5
        driveway_material = "Concrete Paving Blocks"
        if "eco" in style or "traditional" in style:
            driveway_material = "Grass Grid Turf Pavers"
        elif "luxury" in style:
            driveway_material = "Granite Cobblestones"
        elif "industrial" in style:
            driveway_material = "Broom-Finish Stamped Concrete"

        # 5. Plantings (adjusted for climate & style)
        plantings = []
        tree_type = "Broadleaf Tree"
        if "tropical" in style or "traditional" in style or "coastal" in climate_type:
            tree_type = "Palm Tree"
        elif "highland" in climate_type:
            tree_type = "Pine Tree"
        
        # Position trees in corners and borders
        tree_positions = [
            {"x": -bp_w/2 - 5.0, "z": bp_h/2 + 4.5, "scale": 1.1},
            {"x": bp_w/2 + 5.0, "z": bp_h/2 + 4.5, "scale": 1.2},
            {"x": -bp_w/2 - 5.5, "z": -bp_h/2 - 4.5, "scale": 1.0},
            {"x": bp_w/2 + 5.5, "z": -bp_h/2 - 4.5, "scale": 1.3},
            {"x": -bp_w/2 - 5.5, "z": 2.0, "scale": 1.0},
            {"x": bp_w/2 + 5.5, "z": 2.0, "scale": 1.15}
        ]
        for idx, pos in enumerate(tree_positions):
            plantings.append({
                "id": f"tree_{idx}",
                "type": "Palm Tree" if (tree_type == "Palm Tree" and idx % 2 == 0) else "Broadleaf Tree",
                "x": pos["x"],
                "z": pos["z"],
                "scale": pos["scale"]
            })

        # 6. Lighting Locations
        lighting = [
            {"type": "Garden Lamp", "x": -1.2, "z": bp_h/2 + 8.5},
            {"type": "Garden Lamp", "x": bp_w * 0.3 + 2.6, "z": bp_h/2 + 5.0},
            {"type": "Garden Lamp", "x": -bp_w/2 - 0.5, "z": bp_h/2 + 1.0},
            {"type": "Garden Lamp", "x": bp_w/2 + 0.5, "z": bp_h/2 + 1.0}
        ]

        # 7. Gardens & Flowerbeds
        gardens = {
            "beds": [
                {"x": bp_w*0.4, "z": bp_h/2 + 0.6, "w": bp_w*0.25, "d": 0.9},
                {"x": -bp_w*0.4, "z": bp_h/2 + 0.6, "w": bp_w*0.25, "d": 0.9},
                {"x": bp_w/2 + 1.0, "z": 0.0, "w": 0.9, "d": bp_h*0.5},
                {"x": -bp_w/2 - 1.0, "z": 0.0, "w": 0.9, "d": bp_h*0.5}
            ],
            "lawn_type": "Buffalo Grass" if "tropical" in style else "Bermuda Grass",
            "has_hedges": "colonial" in style or "traditional" in style
        }

        return {
            "landscape_theme": style_name + " Landscaping",
            "ground_color": ground_color,
            "boundary_wall": {
                "height": wall_height,
                "material": wall_material,
                "gate_type": gate_type
            },
            "water_feature": water_feature,
            "driveway": {
                "w": driveway_w,
                "l": driveway_l,
                "material": driveway_material,
                "x_offset": bp_w * 0.3,
                "z_offset": bp_h/2 + 5.5
            },
            "pathways": {
                "w": 2.2,
                "l": 5.5,
                "material": "Stone Tiles" if "colonial" in style else "Concrete Flagstones"
            },
            "plantings": plantings,
            "lighting": lighting,
            "gardens": gardens
        }

landscape_engine = LandscapeIntelligenceEngine()
