from typing import Dict, Any, List

class BuildingFormEngine:
    def __init__(self):
        pass

    def generate_building_form(self, style_profile: Dict[str, Any], total_area: float, num_floors: int, building_type: str = "Residential") -> Dict[str, Any]:
        """
        Generates dynamic 3D massing dimensions, footprint shape, cantilevers,
        roof structures, and facade articulation offsets based on architectural style rules.
        """
        style_name = style_profile.get("style", "Modern").lower()
        area_per_floor = total_area / max(1, num_floors)
        
        # 1. Determine Massing Shape & Footprint
        massing_shape = "Rectangular"
        has_courtyard = False
        courtyard_dims = None
        legs = []

        if "traditional" in style_name or "sri lankan" in style_name:
            if area_per_floor >= 120.0:
                massing_shape = "Courtyard"
                has_courtyard = True
                courtyard_dims = {"w": 3.0, "d": 3.0, "x": 0.0, "z": 0.0}
            else:
                massing_shape = "L-Shape"
        elif "tropical" in style_name or "villa" in style_name:
            massing_shape = "L-Shape"
        elif "minimalist" in style_name or "contemporary" in style_name:
            if area_per_floor >= 140.0:
                massing_shape = "U-Shape"
            else:
                massing_shape = "Rectangular"
        else:
            massing_shape = "Rectangular"

        # 2. Facade Projections and Cantilevers
        cantilever_depth = 0.0
        facade_projection = 0.0
        
        facade_geom_str = style_profile.get("facade_theme", "")
        # Parse from style profile
        facade_geom_raw = style_profile.get("raw_dataset_row", {})
        facade_geom_config = facade_geom_raw.get("Facade_Geometry", "cantilever:0.0,projection:0.0")
        
        # Parse "cantilever:X,projection:Y"
        try:
            parts = dict(item.split(":") for item in facade_geom_config.split(","))
            cantilever_depth = float(parts.get("cantilever", 0.0))
            facade_projection = float(parts.get("projection", 0.0))
        except Exception:
            # Fallbacks
            if "contemporary" in style_name or "villa" in style_name:
                cantilever_depth = 1.2
                facade_projection = 1.5
            elif "minimalist" in style_name:
                cantilever_depth = 1.0
                facade_projection = 0.5
            elif "tropical" in style_name:
                cantilever_depth = 0.8
                facade_projection = 1.2

        # 3. Floor-by-floor offsets (massing profiles)
        floor_offsets = []
        for f in range(num_floors):
            # Ground floor is always base, upper floors can cantilever or step back
            if f == 0:
                floor_offsets.append({"level": 0, "dx": 0.0, "dz": 0.0, "scale_w": 1.0, "scale_d": 1.0})
            else:
                if "contemporary" in style_name or "villa" in style_name:
                    # Sift or shift upper floor forward to create a cantilever
                    floor_offsets.append({
                        "level": f,
                        "dx": 0.0,
                        "dz": cantilever_depth,  # Shift forward
                        "scale_w": 1.0,
                        "scale_d": 1.0
                    })
                elif "minimalist" in style_name:
                    # Symmetrical smaller footprint on upper level (setback)
                    floor_offsets.append({
                        "level": f,
                        "dx": 0.0,
                        "dz": 0.0,
                        "scale_w": 0.9,
                        "scale_d": 0.9
                    })
                else:
                    floor_offsets.append({"level": f, "dx": 0.0, "dz": 0.0, "scale_w": 1.0, "scale_d": 1.0})

        # 4. Entrance Portal and Hierarchy
        entrance_hierarchy = {
            "canopy_width": 2.5,
            "canopy_depth": 1.5 if "modern" in style_name else 2.0,
            "steps_count": 3,
            "column_pairs": 1 if "colonial" in style_name or "traditional" in style_name or "tropical" in style_name else 0,
            "door_width": 1.8 if "colonial" in style_name or "traditional" in style_name else 1.2
        }

        # 5. Roof Profile
        roof_profile = {
            "type": style_profile.get("roof_type", "Flat Parapet"),
            "pitch": style_profile.get("roof_pitch", 0.0),
            "overhang": style_profile.get("roof_overhang", 0.3),
            "thickness": 0.15,
            "fascia_board_depth": 0.22,
            "has_gutters": "flat" not in style_profile.get("roof_type", "").lower()
        }

        # Generate leg geometry parameters (relative coords)
        # For L-Shape, add a secondary wing
        if massing_shape == "L-Shape":
            legs = [
                {"id": "main", "x": 0.0, "z": -1.0, "w_pct": 1.0, "d_pct": 0.65},
                {"id": "wing", "x": 2.0, "z": 1.5, "w_pct": 0.45, "d_pct": 0.75}
            ]
        elif massing_shape == "U-Shape":
            legs = [
                {"id": "main", "x": 0.0, "z": -1.5, "w_pct": 1.0, "d_pct": 0.5},
                {"id": "wing_left", "x": -2.2, "z": 1.0, "w_pct": 0.35, "d_pct": 0.8},
                {"id": "wing_right", "x": 2.2, "z": 1.0, "w_pct": 0.35, "d_pct": 0.8}
            ]
        else:
            legs = [
                {"id": "main", "x": 0.0, "z": 0.0, "w_pct": 1.0, "d_pct": 1.0}
            ]

        # 6. Architectural Template (V2)
        architectural_template = self._get_architectural_template(building_type, style_name, num_floors)

        return {
            "massing_shape": massing_shape,
            "has_courtyard": has_courtyard,
            "courtyard_dims": courtyard_dims,
            "legs": legs,
            "cantilever_depth": cantilever_depth,
            "facade_projection": facade_projection,
            "floor_offsets": floor_offsets,
            "entrance_hierarchy": entrance_hierarchy,
            "roof_profile": roof_profile,
            "facade_articulation": style_profile.get("facade_theme", "Standard render"),
            "architectural_template": architectural_template
        }

    def _get_architectural_template(self, building_type: str, style_name: str, num_floors: int) -> Dict[str, Any]:
        """
        Returns a curated massing composition template for V2 Asset-Driven Architecture.
        """
        bt = building_type.lower()
        sn = style_name.lower()

        # Defaults
        masses = []

        if bt == "commercial":
            if "minimalist" in sn or "contemporary" in sn:
                template_id = "Commercial_Minimalist"
                masses = [
                    {"id": "primary", "w_pct": 1.0, "d_pct": 0.7, "x": 0.0, "z": -0.15, "floors": num_floors, "material_role": "primary", "window_strategy": "curtain_wall", "roof_style": "flat"},
                    {"id": "storefront", "w_pct": 0.9, "d_pct": 0.3, "x": 0.0, "z": 0.35, "floors": 1, "material_role": "secondary", "window_strategy": "storefront", "roof_style": "flat"},
                    {"id": "service_core", "w_pct": 0.3, "d_pct": 0.4, "x": -0.35, "z": -0.4, "floors": num_floors + 1, "material_role": "accent", "window_strategy": "none", "roof_style": "flat"}
                ]
            else:
                template_id = "Commercial_Modern"
                masses = [
                    {"id": "primary", "w_pct": 1.0, "d_pct": 0.8, "x": 0.0, "z": 0.0, "floors": num_floors, "material_role": "primary", "window_strategy": "ribbon", "roof_style": "flat"},
                    {"id": "entrance_portal", "w_pct": 0.4, "d_pct": 0.2, "x": 0.0, "z": 0.45, "floors": 1, "material_role": "accent", "window_strategy": "storefront", "roof_style": "flat"}
                ]

        elif bt == "industrial":
            template_id = "Industrial_Warehouse"
            masses = [
                {"id": "warehouse", "w_pct": 1.0, "d_pct": 0.8, "x": 0.0, "z": -0.1, "floors": max(num_floors, 2), "material_role": "primary", "window_strategy": "high_ribbon", "roof_style": "gable"},
                {"id": "office", "w_pct": 0.5, "d_pct": 0.2, "x": -0.25, "z": 0.4, "floors": 1, "material_role": "secondary", "window_strategy": "casement", "roof_style": "flat"},
                {"id": "loading_bay", "w_pct": 0.4, "d_pct": 0.2, "x": 0.3, "z": 0.4, "floors": 1, "material_role": "accent", "window_strategy": "roller_door", "roof_style": "flat"}
            ]

        else: # Residential
            if "minimalist" in sn or "contemporary" in sn:
                template_id = "Residential_Minimalist"
                masses = [
                    {"id": "primary", "w_pct": 0.8, "d_pct": 0.6, "x": 0.1, "z": -0.2, "floors": num_floors, "material_role": "primary", "window_strategy": "floor_to_ceiling", "roof_style": "flat"},
                    {"id": "secondary", "w_pct": 0.6, "d_pct": 0.5, "x": -0.2, "z": 0.1, "floors": 1, "material_role": "secondary", "window_strategy": "horizontal_slit", "roof_style": "flat"},
                    {"id": "entrance_canopy", "w_pct": 0.3, "d_pct": 0.2, "x": 0.0, "z": 0.4, "floors": 0.5, "material_role": "accent", "window_strategy": "none", "roof_style": "flat"}
                ]
            elif "tropical" in sn or "villa" in sn:
                template_id = "Residential_Tropical"
                masses = [
                    {"id": "primary", "w_pct": 0.9, "d_pct": 0.7, "x": 0.0, "z": 0.0, "floors": num_floors, "material_role": "primary", "window_strategy": "casement", "roof_style": "hipped"},
                    {"id": "veranda", "w_pct": 0.9, "d_pct": 0.3, "x": 0.0, "z": 0.5, "floors": 1, "material_role": "secondary", "window_strategy": "open", "roof_style": "mono"}
                ]
            else:
                template_id = "Residential_Traditional"
                masses = [
                    {"id": "primary", "w_pct": 1.0, "d_pct": 0.8, "x": 0.0, "z": -0.1, "floors": num_floors, "material_role": "primary", "window_strategy": "casement", "roof_style": "gable"},
                    {"id": "porch", "w_pct": 0.4, "d_pct": 0.2, "x": 0.0, "z": 0.4, "floors": 1, "material_role": "accent", "window_strategy": "open", "roof_style": "gable"}
                ]

        return {
            "template_id": template_id,
            "masses": masses
        }

building_form_engine = BuildingFormEngine()
