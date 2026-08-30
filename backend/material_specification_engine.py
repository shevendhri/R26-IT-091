import os
import pickle
import joblib
import math
import time
import logging
import copy
from pathlib import Path
from typing import Dict, List, Any, Tuple
from database import get_all_materials, format_material, validate_canonical_component
from blueprint_engine import blueprint_engine
from architectural_style_engine import style_engine
from questionnaire_engine import UserProfile
from spatial_program_engine import generate_spatial_program
from building_program_engine import generate_building_program
from weather_engine import get_climate_profile
from material_quantity_engine import MaterialQuantityEngine

# Configure logger for debugging ML model interactions
logger = logging.getLogger(__name__)
if not logger.handlers:
    log_path = Path(__file__).resolve().parent / 'scratch' / 'ml_debug.log'
    log_path.parent.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(log_path)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)


class MaterialSpecificationEngine:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "greenconstruct_model.pkl")
        if os.path.exists(model_path):
            try:
                data = joblib.load(model_path)
                if isinstance(data, dict) and "model" in data:
                    self.model = data["model"]
                    self.model_loaded = True
                    logger.info("[OK] MaterialSpecificationEngine loaded ML model.")
                    logger.debug(f"Model details: {self.model}")
            except Exception as e:
                print(f"[Error] Failed to load ML model in engine: {e}")

    def generate_report(self, building_info: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a professional material specification report.

        The function now:
        â€¢ Measures computation time.
        â€¢ Provides realistic ML scores (fallback uses sustainability & carbon).
        â€¢ Returns detailed metadata (app version, environment, ML model, material registry).
        â€¢ Adds `cost_per_unit_lkr` field and clarifies units.
        â€¢ Supplies `recommendation_notes` explaining excluded materials.
        â€¢ Highlights sustainability metrics in the summary.
        """
        start_time = time.time()  # start timing
        # 1. Parse building info and preferences
        b_type = building_info.get("building_type", "Residential")
        floor_count = int(building_info.get("floor_count", 1))
        total_floor_area = float(building_info.get("total_floor_area", 100.0))
        wall_area = float(building_info.get("wall_area", 150.0))
        roof_area = float(building_info.get("roof_area", 80.0))
        window_area = float(building_info.get("window_area", 20.0))
        door_count = int(building_info.get("door_count", 4))
        structural_system = building_info.get("structural_system", "Concrete Frame")
        location = building_info.get("location", "Colombo")

        sus_level = preferences.get("sustainability_level", "Medium")
        maint_pref = preferences.get("maintenance_preference", "Medium")
        int_finish = preferences.get("interior_finish", "Modern")
        ext_finish = preferences.get("exterior_finish", "Modern")
        material_priority = preferences.get("material_priority", "Durability")

        # 2. Get Geoclimatic data
        climate = get_climate_profile(location)
        climate_zone_name = climate.get("type", "Intermediate Tropical")
        humidity = climate.get("humidity", 70)
        rainfall = climate.get("rainfall", 1500)
        salinity = climate.get("salinity", "Low")

        # 3. Calculate building quantities using the Quantity Engine
        quantities = MaterialQuantityEngine.calculate_quantities(
            building_type=b_type,
            floor_count=floor_count,
            total_floor_area=total_floor_area,
            wall_area=wall_area,
            roof_area=roof_area,
            window_area=window_area,
            door_count=door_count,
            structural_system=structural_system,
            location=location
        )

        # 4. Fetch all materials
        raw_materials = get_all_materials()
        catalog = [format_material(r) for r in raw_materials]
        
        # Define component lists
        components = [
            "Foundation Materials", "Concrete", "Reinforcement Steel", "Walls",
            "Roofing", "Windows", "Doors", "Flooring", "Ceiling Systems",
            "Waterproofing", "Surface Finishes"
        ]

        # 5. Base weights for MCDM by Package
        base_weights = {
            "standard": {
                "structural": 0.25, "climate": 0.10, "sustainability": 0.05,
                "durability": 0.20, "maintenance": 0.15, "availability": 0.25
            },
            "sustainable": {
                "sustainability": 0.35, "climate": 0.15, "durability": 0.15,
                "structural": 0.10, "maintenance": 0.10, "availability": 0.15
            },
            "climate_resilient": {
                "climate": 0.35, "durability": 0.25, "structural": 0.20,
                "sustainability": 0.10, "maintenance": 0.10, "availability": 0.10
            }
        }

        # adjusted_weights loop removed as constraint_engine handles weights internally

        # 6. Evaluate all materials for each package
        packages_data = {
            "Standard Package": {},
            "Sustainable Package": {},
            "Climate Resilient Package": {}
        }

        # Track excluded materials per component
        component_exclusions: Dict[str, List[str]] = {}
        
        component_category_map = {
            "Foundation Materials": ["foundation"],
            "Concrete": ["concrete"],
            "Reinforcement Steel": ["structural"],
            "Walls": ["walling"],
            "Roofing": ["roofing"],
            "Windows": ["windows"],
            "Doors": ["doors"],
            "Flooring": ["flooring"],
            "Ceiling Systems": ["ceiling"],
            "Waterproofing": ["waterproofing"],
            "Surface Finishes": ["finishing"]
        }

        ml_probs = None
        ml_classes = None
        if self.model_loaded:
            try:
                b_type_map = {"residential": 0, "commercial": 1, "industrial": 2}
                c_zone_map = {"extreme coastal": 0, "moderate coastal": 1, "highland": 2, "dry zone": 3, "intermediate": 4}
                salinity_map = {"low": 0, "moderate": 1, "extreme": 2}
                struct_sys_map = {"concrete frame": 0, "steel frame": 1, "load-bearing masonry": 2, "timber frame": 3}
                sus_level_map = {"low": 0, "medium": 1, "high": 2}

                zone_code = 4
                for code, val in c_zone_map.items():
                    if code in climate_zone_name.lower():
                        zone_code = val
                        break

                ml_features = [[
                    float(b_type_map.get(b_type.lower(), 0)),
                    float(floor_count),
                    float(total_floor_area),
                    float(zone_code),
                    float(humidity),
                    float(rainfall),
                    float(salinity_map.get(salinity.lower(), 0)),
                    float(struct_sys_map.get(structural_system.lower(), 0)),
                    float(sus_level_map.get(sus_level.lower(), 1))
                ]]
                ml_probs = self.model.predict_proba(ml_features)
                ml_classes = self.model.classes_
                logger.debug(f"ML inference completed. probs: {ml_probs}, classes: {ml_classes}")
            except Exception as e:
                logger.warning(f"ML inference error: {e}")
                print(f"[Warning] ML inference error: {e}")

        package_names_map = {
            "Standard Package": "standard",
            "Sustainable Package": "sustainable",
            "Climate Resilient Package": "climate_resilient"
        }

        try:
            profile_dict = {
                "family_size": building_info.get("family_size", 4),
                "bedrooms_needed": building_info.get("bedrooms_needed", 2),
                "maintenance_pref": preferences.get("maintenance_preference", "Medium"),
                "sustainability_pref": preferences.get("sustainability_level", "Medium"),
                "style_pref": preferences.get("architectural_style", "Modern"),
                "climate_concerns": building_info.get("climate_concerns", ""),
                "future_expansion": building_info.get("future_expansion", "None"),
                "budget_tier": preferences.get("budget_tier", "Balanced"),
                "building_type": building_info.get("building_type", "Residential")
            }
            profile_obj = UserProfile(**profile_dict)
            spatial_prog = generate_spatial_program(profile_dict)
            building_prog = generate_building_program(spatial_prog, profile_dict)
            blueprint = blueprint_engine.generate_blueprint(building_prog, profile_obj, building_info.get("building_type", "Residential"), floor_count)
        except Exception as e:
            print(f"[Warning] Blueprint generation failed: {e}")
            blueprint = {}
        
        # Build a package-level blueprint dict that the constraint engine accepts
        spec_blueprint = {
            "building_type": b_type,
            "floors": floor_count,
            "num_floors": floor_count,
            "structural_system": structural_system,
            "total_area": total_floor_area,
        }

        for pkg_title, pkg_key in package_names_map.items():
            selected_items = []

            comp_to_canonical = {
                "Foundation Materials": "Foundation",
                "Concrete": "Structural Frame",
                "Reinforcement Steel": "Reinforcement",
                "Walls": "Walling",
                "Roofing": "Roofing",
                "Windows": "Windows",
                "Doors": "Doors",
                "Flooring": "Flooring",
                "Ceiling Systems": "Ceiling",
                "Waterproofing": "Waterproofing",
                "Surface Finishes": "Finishes"
            }

            for comp in components:
                best_mat = None
                best_score = -1.0
                best_mcdm = 0.0
                best_ml = 50.0
                best_reasons = []

                target_canon = comp_to_canonical.get(comp, comp)
                mats = [m for m in catalog if validate_canonical_component(m, target_canon)]

                # Collect exclusions for this component
                exclusions: List[str] = []

                for mat in mats:
                    # â”€â”€ TASK 1: Use constraint_engine as single source of truth â”€â”€
                    from backend.engines.constraint_engine import evaluate_constraints
                    try:
                        profile_obj = UserProfile(**{
                            "building_type": b_type,
                            "sustainability_pref": sus_level,
                            "maintenance_pref": maint_pref,
                            "style_pref": int_finish,
                            "budget_tier": preferences.get("budget_tier", "Balanced"),
                        })
                    except Exception:
                        profile_obj = None

                    eval_res = evaluate_constraints(
                        material=mat,
                        occupancy=b_type,
                        blueprint=spec_blueprint,
                        climate=climate,
                        profile=profile_obj,
                    )
                    mcdm_score = eval_res["engineering_score"]
                    reasons = eval_res["rejection_reasons"]
                    veto = eval_res["veto"]

                    # â”€â”€ Package-specific sustainability/climate weight boost â”€â”€
                    if not veto:
                        s_rating = float(mat.get("Sustainability_Rating", 50))
                        carbon = float(mat.get("Embodied_Carbon", 0.5))
                        moisture = float(mat.get("Moisture_Resistance", 50))
                        corrosion = float(mat.get("Corrosion_Resistance", 50))
                        if pkg_key == "sustainable":
                            if s_rating >= 80 or carbon <= 0.15:
                                mcdm_score = min(100.0, mcdm_score + 5.0)
                        elif pkg_key == "climate_resilient":
                            if moisture >= 90 or corrosion >= 90:
                                mcdm_score = min(100.0, mcdm_score + 5.0)

                    if veto:
                        exclusions.append(mat["Name"])

                    # Heuristic ML score (consistent with recommendation_engine fallback)
                    ml_base = self._get_ml_score(comp, mat["Material_ID"], ml_probs, ml_classes, mat)
                    ml_score = self._enrich_ml_score(ml_base, mat, pkg_key)

                    hybrid_score = (0.75 * mcdm_score) + (0.25 * ml_score)
                    if veto:
                        hybrid_score = 0.0
                    filtered_reasons = [r for r in reasons if "VETO" not in r and "Sector mismatch" not in r]
                    if hybrid_score > best_score and not veto:
                        best_score = hybrid_score
                        best_mat = mat
                        best_mcdm = mcdm_score
                        best_ml = ml_score
                        best_reasons = filtered_reasons

                if exclusions:
                    component_exclusions.setdefault(comp, []).extend(exclusions)

                if not best_mat:
                    raise ValueError(f"No viable material selected for component '{comp}'.")

                qty, unit, count_label = self._resolve_qty_details(comp, best_mat["Name"], quantities)

                total_cost = 0
                total_carbon = round(qty * best_mat["Embodied_Carbon"], 2)

                selected_items.append({
                    "component": comp,
                    "id": best_mat["Material_ID"],
                    "name": best_mat["Name"],
                    "description": best_mat["Description"],
                    "quantity": qty,
                    "unit": unit,
                    "count_label": count_label,
                    "rate_lkr": None,
                    "cost_per_unit_lkr": None,
                    "total_cost_lkr": None,
                    "embodied_carbon_tons": total_carbon,
                    "service_life_years": best_mat["Service_Life"],
                    "sustainability_rating": best_mat.get("Sustainability_Rating", 50),
                    "local_availability": best_mat.get("Local_Availability", "High"),
                    "supplier_density": best_mat.get("Supplier_Density", "Western: High"),
                    "mcdm_score": round(best_mcdm),
                    "ml_confidence": round(best_ml),
                    "hybrid_score": round(best_score),
                    "justifications": best_reasons
                })

            total_pkg_cost = None
            total_pkg_carbon = sum(item["embodied_carbon_tons"] for item in selected_items)
            avg_pkg_life = sum(item["service_life_years"] for item in selected_items) / len(selected_items)
            avg_sustainability = sum(item["sustainability_rating"] for item in selected_items) / len(selected_items)

            eco_ratio = avg_pkg_life / max(0.1, total_pkg_carbon)
            eco_efficiency = min(100, round(eco_ratio * 38, 1))

            packages_data[pkg_title] = {
                "materials": selected_items,
                "summary": {
                    "total_cost_lkr": None,
                    "total_embodied_carbon_tons": round(total_pkg_carbon, 2),
                    "average_service_life_years": round(avg_pkg_life, 1),
                    "average_sustainability_rating": round(avg_sustainability, 1),
                    "eco_efficiency_score": eco_efficiency,
                    "average_ml_confidence": round(sum(item["ml_confidence"] for item in selected_items) / len(selected_items), 1),
                    "average_hybrid_score": round(sum(item["hybrid_score"] for item in selected_items) / len(selected_items), 1)
                }
            }

        recommendation_notes = {}
        for comp, excl in component_exclusions.items():
            if excl:
                recommendation_notes[comp] = list(set(excl))

        response = {
            "status": "success",
            "metadata": {
                "app_version": "GreenConstructAI v1.0",
                "environment": "Production",
                "ml_model": "Random Forest Sustainability Predictor",
                "material_registry": "GreenConstructAI Material Dataset v3",
                "computation_time_ms": str(int((time.time() - start_time) * 1000)),
                "location": location,
                "building_type": b_type,
                "floor_count": floor_count,
                "total_floor_area": total_floor_area,
                "structural_system": structural_system,
                "climate_zone": climate_zone_name,
                "humidity": f"{humidity}%",
                "rainfall": f"{rainfall} mm",
                "salinity": salinity
            },
            "preferences": {
                "sustainability_level": sus_level,
                "maintenance_preference": maint_pref,
                "interior_finish": int_finish,
                "exterior_finish": ext_finish,
                "material_priority": material_priority,
                "adjusted_weights": {}
            },
            "quantities": quantities,
            "geoclimatic": {
                "zone": climate_zone_name,
                "humidity": humidity,
                "rainfall": rainfall,
                "salinity": salinity,
                "is_coastal": "coastal" in climate_zone_name.lower(),
                "is_highland": "highland" in climate_zone_name.lower(),
                "is_dry": "dry" in climate_zone_name.lower()
            },
            "recommendation_notes": recommendation_notes,
            "packages": packages_data,
            "blueprint": blueprint,
            "formula": "Final Score = 0.75 Ã— Engineering (Constraint Engine) + 0.25 Ã— ML",
            "disclaimer": "GreenConstructAI provides preliminary decision support and does not replace detailed structural design, architectural approval, quantity surveying, or professional engineering certification.",
            "future_roadmap": {
                "description": "3D Material Visualization Pipeline via Planner5D Integration",
                "steps": [
                    "Plan Analyzer extracts architectural layers, room boundaries, and spatial parameters.",
                    "Material Specification Engine calculates construction quantities and applies MCDM decision scoring.",
                    "Bill of Materials (BOM) is generated with component quantities, units, cost, embodied carbon, and service life.",
                    "Planner5D integration will render a 3D interior/exterior layout mapping material textures to coordinates."
                ]
            }
        }
        return response

    def _enrich_ml_score(self, ml_base: float, mat: Dict[str, Any], pkg_key: str) -> float:
        s_rating = float(mat.get("Sustainability_Rating", 50))
        carbon = float(mat.get("Embodied_Carbon", 0.5))
        service_life = float(mat.get("Service_Life", 30))
        structural_cap = float(mat.get("Structural_Capacity", 50))
        recyclability = float(mat.get("Recyclability_Rating", 40))

        if pkg_key == "sustainable":
            prop_signal = (s_rating * 0.4) + ((1.0 - min(1.0, carbon)) * 40.0) + (recyclability * 0.2)
        elif pkg_key == "climate_resilient":
            moisture = float(mat.get("Moisture_Resistance", 50))
            corrosion = float(mat.get("Corrosion_Resistance", 50))
            prop_signal = (moisture * 0.3) + (corrosion * 0.3) + (min(service_life, 80) / 80.0 * 40.0)
        else:
            prop_signal = (structural_cap * 0.4) + (min(service_life, 60) / 60.0 * 40.0) + (s_rating * 0.2)

        enriched = (0.60 * ml_base) + (0.40 * prop_signal)
        return max(10.0, min(100.0, enriched))

    def _get_ml_score(self, component: str, material_id: int, ml_probs: List[Any], ml_classes: List[Any], mat: Dict[str, Any]) -> float:
        """Map component to model output index and return probability Ã— 100.
        If model inference fails, a heuristic based on sustainability rating and carbon footprint is used.
        """
        target_idx = {
            "Foundation Materials": 0,
            "Concrete": 0,
            "Reinforcement Steel": 0,
            "Walls": 1,
            "Roofing": 2,
            "Windows": 3,
            "Doors": 3,
            "Flooring": 4,
            "Ceiling Systems": 4,
            "Waterproofing": 4,
            "Surface Finishes": 1
        }.get(component, 0)
        
        try:
            classes = ml_classes[target_idx]
            probs = ml_probs[target_idx][0]
            if material_id in classes:
                idx = list(classes).index(material_id)
                ml_score = float(probs[idx] * 100)
                logger.debug(f"ML score for component '{component}', material {material_id}: {ml_score} (probability)")
                return ml_score
        except Exception as e:
            logger.debug(f"ML score fallback triggered for component '{component}', material {material_id}: {e}")
            pass
        # Heuristic fallback: combine sustainability rating and low carbon for a more realistic baseline
        s_rating = float(mat.get("Sustainability_Rating", 50))
        carbon = float(mat.get("Embodied_Carbon", 0.5))
        heuristic = (s_rating * 0.6) + ((1.0 - min(1.0, carbon)) * 40.0)
        logger.debug(f"Heuristic ML score for component '{component}', material {material_id}: {heuristic}")
        return max(30.0, min(100.0, heuristic))

    def _resolve_qty_details(self, component: str, name: str, quantities: Dict[str, float]) -> Tuple[float, str, str]:
        """Resolves specific quantity, unit, and piece counts based on material choice."""
        if component == "Foundation Materials":
            return quantities["foundation_volume"], "mÂ³", f"Soil volume: {quantities['foundation_volume'] * 1.25:.1f} mÂ³ (bulking factored)"
        
        elif component == "Concrete":
            return quantities["concrete_volume"], "mÂ³", f"Ready-mix delivery: {math.ceil(quantities['concrete_volume'] / 6.0)} truck(s) (6mÂ³ capacity)"
        
        elif component == "Reinforcement Steel":
            return quantities["steel_tonnage"], "Tons", f"Standard 12m rebars: ~{int(quantities['steel_tonnage'] * 80)} nos (weighted average)"
        
        elif component == "Walls":
            net_area = quantities["net_wall_area"]
            count = MaterialQuantityEngine.calculate_block_count(name, net_area)
            return net_area, "mÂ²", f"Masonry units: {count:,} blocks/bricks required"
        
        elif component == "Roofing":
            area = quantities["roof_area"]
            count = MaterialQuantityEngine.calculate_roof_count(name, area)
            return area, "mÂ²", f"Roofing units: {count:,} tiles/sheets required"
        
        elif component == "Windows":
            return quantities["window_area"], "mÂ²", f"Standard frame size (1.2m Ã— 1.2m): ~{max(1, int(quantities['window_area'] / 1.44))} opening(s)"
        
        elif component == "Doors":
            return float(quantities["door_count"]), "Nos", f"Door leaves + frames: {quantities['door_count']} sets"
        
        elif component == "Flooring":
            return quantities["floor_finish_area"], "mÂ²", f"Tile coverage (600Ã—600): ~{int(quantities['floor_finish_area'] * 3.1)} tiles (incl. 10% wastage)"
        
        elif component == "Ceiling Systems":
            return quantities["ceiling_area"], "mÂ²", f"Ceiling panels (1.2m Ã— 0.6m): ~{int(quantities['ceiling_area'] / 0.72)} sheets"
        
        elif component == "Waterproofing":
            return quantities["waterproofing_area"], "mÂ²", f"Liquid coverage (2 coats): ~{math.ceil(quantities['waterproofing_area'] / 4.0)} buckets (20L cap.)"
        
        elif component == "Surface Finishes":
            # Paint area = all walls (interior) + ceiling
            paint_area = quantities.get("net_wall_area", 0) + quantities.get("ceiling_area", 0)
            litres = math.ceil(paint_area / 8.0 * 2)  # 8mÂ²/L, 2 coats
            return paint_area, "mÂ²", f"Paint requirement: ~{litres} litres (2 finish coats + 1 primer coat)"
        
        return 1.0, "units", "Standard specs apply."


material_specification_engine = MaterialSpecificationEngine()

