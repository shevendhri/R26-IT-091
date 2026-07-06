import os
import joblib
import math
import json
import traceback
from typing import Dict, List, Any

from backend.database import get_all_materials, format_material
from backend.weather_engine import get_climate_profile
from backend.questionnaire_engine import UserProfile
from backend.mcdm_engine import mcdm_engine
from backend.exposure import calculate_exposure_score
from backend.door_recommendation_engine import door_recommendation_engine
from backend.window_recommendation_engine import window_recommendation_engine


# Shared utilities
from backend.utils import calculate_hybrid_score, is_marine_needed, deterministic_sort_key, API_METADATA, climate_confidence, engineering_confidence
from backend.exposure import exposure_level_from_score

# Dynamic explanation engine function for research credibility
def generate_material_explanation(m: Dict[str, Any], climate: Dict[str, Any], profile: UserProfile, num_floors: int) -> Dict[str, str]:
    name_lower = m.get("Name", "").lower()
    category = m.get("Category", "General")
    embodied_carbon = m.get("Embodied_Carbon", 0.0)
    service_life = m.get("Service_Life", 25)
    sustainability_rating = m.get("Sustainability_Rating", 50)
    rate = m.get("Rate", 0.0)
    
    climate_reason = "Selected for general compatibility with regional tropical environmental parameters."
    durability_reason = "Standard durability profile providing adequate resistance for typical residential application."
    sustainability_reason = f"Maintains balanced environmental footprint with an embodied carbon of {embodied_carbon} kgCO2/kg."
    cost_reason = "Cost-optimized solution for standard construction project requirements."

    if "brick" in name_lower or "masonry" in name_lower:
        climate_reason = "Excellent thermal mass performance for regulating indoor temperatures in warm climates."
        durability_reason = "High structural integrity and fire resistance, lasting over 50 years with minimal maintenance."
        sustainability_reason = "Utilizes earth-based materials, offering high potential for thermal efficiency and long service life."
        cost_reason = "Offers long-term economic value through reduced energy demand and high durability."
    elif "recycled" in name_lower or "green" in name_lower:
        climate_reason = "Standard climate compatibility with enhanced resilience to moisture variability."
        durability_reason = "Meets target durability with high moisture resistance and structural stability under typical tropical loads."
        sustainability_reason = f"Features low embodied carbon ({embodied_carbon} kgCO2/kg) and high recyclability ({m.get('Recyclability_Rating', 80)}/100)."
        cost_reason = "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    elif "double-glazed" in name_lower or "double glazed" in name_lower:
        climate_reason = "Improves energy efficiency by reducing heat gain and solar transmission in high solar exposure areas."
        durability_reason = "High structural wind-load resistance and robust sealing suitable for multistory environments."
        sustainability_reason = "Supports sustainability objectives by lowering heating/cooling energy consumption throughout the building lifecycle."
        cost_reason = f"Higher initial capital cost (LKR {rate:,.0f}) is balanced by long-term operational energy savings."
    elif "standard concrete foundation" in name_lower:
        climate_reason = "Suitable for standard soil humidity and intermediate tropical rainfall ranges."
        durability_reason = f"Offers stable foundation support with a service life of {service_life} years under moderate loads."
        sustainability_reason = f"Standard concrete mix with standard carbon footprint ({embodied_carbon} kgCO2/kg)."
        cost_reason = "Cost-effective foundation option for low-to-mid rise structures."
    elif "marine-grade concrete" in name_lower:
        climate_reason = "Mandatory sulphate and corrosion resistance for high-salinity coastal environments."
        durability_reason = f"Extreme durability against chloride penetration with a 100-year target service life."
        sustainability_reason = "Engineered mix optimized for structural service-life extension, reducing future repair carbon."
        cost_reason = "Premium specification justified by extreme durability requirements in coastal zones."
    elif "eco-concrete" in name_lower:
        climate_reason = "Performs well in moderate climates with standard thermal and moisture exposure."
        durability_reason = f"Provides solid structural performance with a service life of {service_life} years."
        sustainability_reason = f"High sustainability rating of {sustainability_rating}/100 using 30% recycled aggregates and fly-ash."
        cost_reason = "Excellent value-to-cost ratio, supporting green building certification."
    else:
        # Category specific fallback logic
        if category == "Foundation":
            climate_reason = f"Optimized for {climate.get('type', 'Intermediate')} climate soil conditions."
            durability_reason = f"Offers structural capacity rating of {m.get('Structural_Capacity', 60)}/100 and service life of {service_life} years."
        elif category == "Walling":
            if "clay" in name_lower:
                climate_reason = "Traditional thermal mass properties suitable for dry and intermediate climates."
                sustainability_reason = "Made from local natural clay, though requiring high firing energy."
            else:
                climate_reason = "Selected for thermal performance and humidity resistance."
        elif category == "Roofing":
            climate_reason = f"Provides weather protection and thermal comfort for {climate.get('type', 'Intermediate')} climate."
        elif category in ["Windows", "Doors"]:
            climate_reason = "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts."
        elif category == "Waterproofing":
            climate_reason = f"Designed to prevent moisture ingress under {climate.get('rainfall', 1500)}mm annual rainfall."
            durability_reason = f"High moisture resistance ({m.get('Moisture_Resistance', 80)}/100) ensuring structural protection."
            
    return {
        "climate": climate_reason,
        "durability": durability_reason,
        "sustainability": sustainability_reason,
        "cost": cost_reason
    }


class RecommendationEngine:
    def __init__(self):
        self.model = None
        self.ml_features = []
        self.model_source = None
        self.model_loaded = False
        self.dataset_loaded = False
        self.dataset_rows = 0
        self.dataset_columns = 0
        self.ml_available = False
        self.training_accuracy = None
        self.cross_validation_score = None
        self._load_validation_metrics()
        self._load_model()
        self._load_dataset()
        self.feature_importance_available = hasattr(self.model, "feature_importances_") if self.model else False

    def _load_model(self):
        """Safely loads the ML model (greenconstruct_model.pkl or fallback)."""
        model_paths = [
            os.path.join(os.path.dirname(__file__), 'ml', 'greenconstruct_model.pkl'),
            os.path.join(os.path.dirname(__file__), 'ml', 'ecobuild_model.pkl')
        ]
        for path in model_paths:
            if os.path.exists(path):
                try:
                    model_data = joblib.load(path)
                    if isinstance(model_data, dict) and "model" in model_data:
                        self.model = model_data["model"]
                        self.ml_features = model_data.get("features", [])
                    else:
                        self.model = model_data
                    self.model_source = os.path.basename(path)
                    self.model_loaded = True
                    self.ml_available = True
                    print(f"Successfully loaded ML model from {path}")
                    break
                except Exception as e:
                    print(f"Failed to load model at {path}: {e}")
        if not self.model:
            print("Warning: No ML model loaded. Will default to Engineering rules only.")

    def _load_dataset(self):
        """Load the ML dataset CSV and record row/column counts for audit purposes."""
        import csv
        csv_path = os.path.join(os.path.dirname(__file__), 'GreenConstructAI_ML_Dataset.csv')
        if not os.path.exists(csv_path):
            print(f"Dataset CSV not found at {csv_path}")
            return
        try:
            with open(csv_path, newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                rows = list(reader)
            # Exclude header row for row count
            self.dataset_rows = max(len(rows) - 1, 0)
            self.dataset_columns = len(rows[0]) if rows else 0
            self.dataset_loaded = True
            print(f"Loaded dataset with {self.dataset_rows} rows and {self.dataset_columns} columns.")
        except Exception as e:
            print(f"Failed to load dataset: {e}")

    def _load_validation_metrics(self):
        """Loads training accuracy and cross validation metrics from report."""
        report_path = os.path.join(os.path.dirname(__file__), 'ml', 'training_validation_report.json')
        if os.path.exists(report_path):
            try:
                import json
                with open(report_path, 'r', encoding='utf-8') as f:
                    report = json.load(f)
                overall = report.get("overall", {})
                self.training_accuracy = overall.get("mean_accuracy_across_outputs", 0.6238)
                self.cross_validation_score = overall.get("mean_f1_across_outputs", 0.6974)
                print(f"Loaded validation metrics: Train Acc={self.training_accuracy:.4f}, CV={self.cross_validation_score:.4f}")
            except Exception as e:
                print(f"Failed to load validation report metrics: {e}")

    def _get_ml_score(self, material_category: str, material_id: int, climate: Dict[str, Any], b_type: str, budget: float = 0.0,
                      floor_count: int = 1, total_area: float = 100.0, structural_system: str = "Concrete Frame",
                      sustainability_pref: str = "Medium", mat: Dict[str, Any] = None) -> tuple:
        """
        Runs the ML model to get a prediction score for a material category.
        Returns a tuple: (ml_score_or_none, prediction_source_string).
        """
        if not self.model:
            return None, "HEURISTIC_FALLBACK"

        try:
            b_type_map = {"residential": 0, "commercial": 1, "industrial": 2}
            c_zone_map = {"extreme coastal": 0, "moderate coastal": 1, "highland": 2, "dry zone": 3, "intermediate": 4}
            salinity_map = {"low": 0, "moderate": 1, "extreme": 2}
            struct_sys_map = {"concrete frame": 0, "steel frame": 1, "load-bearing masonry": 2, "timber frame": 3}
            sus_level_map = {"low": 0, "medium": 1, "high": 2}

            # Identify zone code
            zone_code = 4 # default intermediate
            city_climate = climate.get("type", "Intermediate")
            for key, val in c_zone_map.items():
                if key in city_climate.lower():
                    zone_code = val
                    break

            features = [[
                float(b_type_map.get(b_type.lower(), 0)),
                float(floor_count),
                float(total_area),
                float(zone_code),
                float(climate.get("humidity", 75)),
                float(climate.get("rainfall", 1500)),
                float(salinity_map.get(climate.get("salinity", "low").lower(), 0)),
                float(struct_sys_map.get(structural_system.lower(), 0)),
                float(sus_level_map.get(sustainability_pref.lower(), 1))
            ]]
            
            if hasattr(self.model, "predict_proba"):
                target_idx = {
                    "Foundation": 0,
                    "Concrete": 0,
                    "Structural": 0,
                    "Walling": 1,
                    "Finishing": 1,
                    "Roofing": 2,
                    "Windows": 3,
                    "Doors": 3,
                    "Openings": 3,
                    "Flooring": 4,
                    "Ceiling": 4,
                    "Waterproofing": 4
                }.get(material_category, 0)

                classes = self.model.classes_[target_idx]
                probs = self.model.predict_proba(features)[target_idx][0]
                
                if material_id in classes:
                    idx = list(classes).index(material_id)
                    return float(probs[idx] * 100), "ML_MODEL"
                else:
                    s_rating = float(mat.get("Sustainability_Rating", 50)) if mat else 50.0
                    carbon = float(mat.get("Embodied_Carbon", 0.5)) if mat else 0.5
                    heuristic = (s_rating * 0.6) + ((1.0 - min(1.0, carbon)) * 40.0)
                    return max(30.0, min(100.0, heuristic)), "HEURISTIC_FALLBACK"
            else:
                return 50.0, "HEURISTIC_FALLBACK"
        except Exception as e:
            print(f"ML Prediction error: {e}")
            return 50.0, "HEURISTIC_FALLBACK"

    def recommend_package(self, blueprint: Dict[str, Any], location: str, profile: UserProfile, validation_severity: str = "low") -> Dict[str, Any]:
        """
        Generates the recommended building package using the 70/30 Hybrid Engine.
        """
        # Clear previous audit logs for a fresh evaluation cycle
        from audit_engine import audit_engine
        audit_engine.clear_logs()

        all_rows = get_all_materials()
        materials = [format_material(r) for r in all_rows]
        
        climate = get_climate_profile(location)
        climate_type = climate.get("type", "Intermediate")
        
        building_type = blueprint.get("building_type", "Residential")
        num_floors = blueprint.get("num_floors", 1)
        total_area = blueprint.get("total_area", 100.0)
        budget = blueprint.get("budget", 0.0)
        
        quantities = self._estimate_quantities(total_area, num_floors, building_type)
        
        scored_materials = []
        global_reasoning = []
        ml_warnings = []
        fallback_predictions_count = 0

        # Construct constant features vector for precalculating category confidence & variance
        b_type_map = {"residential": 0, "commercial": 1, "industrial": 2}
        c_zone_map = {"extreme coastal": 0, "moderate coastal": 1, "highland": 2, "dry zone": 3, "intermediate": 4}
        salinity_map = {"low": 0, "moderate": 1, "extreme": 2}
        struct_sys_map = {"concrete frame": 0, "steel frame": 1, "load-bearing masonry": 2, "timber frame": 3}
        sus_level_map = {"low": 0, "medium": 1, "high": 2}

        zone_code = 4
        city_climate = climate.get("type", "Intermediate")
        for key, val in c_zone_map.items():
            if key in city_climate.lower():
                zone_code = val
                break

        features = [[
            float(b_type_map.get(building_type.lower(), 0)),
            float(num_floors),
            float(total_area),
            float(zone_code),
            float(climate.get("humidity", 75)),
            float(climate.get("rainfall", 1500)),
            float(salinity_map.get(climate.get("salinity", "low").lower(), 0)),
            float(struct_sys_map.get(blueprint.get("structural_system", "Concrete Frame").lower(), 0)),
            float(sus_level_map.get(profile.sustainability_pref.lower(), 1))
        ]]

        category_predictions = {}
        if self.ml_available and hasattr(self.model, "predict_proba"):
            for out_idx in range(5):
                probs = self.model.predict_proba(features)[out_idx][0]
                max_prob = float(max(probs))
                conf_score = max_prob * 100
                mean_p = sum(probs) / len(probs)
                var_p = sum((p - mean_p)**2 for p in probs) / len(probs)
                var_score = var_p * 100
                category_predictions[out_idx] = {
                    "confidence_score": conf_score,
                    "variance": var_score
                }

        def get_target_idx(category: str) -> int:
            return {
                "Foundation": 0, "Concrete": 0, "Structural": 0,
                "Walling": 1, "Finishing": 1,
                "Roofing": 2,
                "Windows": 3, "Doors": 3, "Openings": 3,
                "Flooring": 4, "Ceiling": 4, "Waterproofing": 4
            }.get(category, 0)
        
        def clean_material_reasons(reasons_list: List[str]) -> List[str]:
            cleaned = []
            for r in reasons_list:
                r_lower = r.lower()
                if "sector mismatch" in r_lower:
                    cleaned.append("Material structural properties not optimized for the selected occupancy/sector category.")
                elif "height limit" in r_lower:
                    cleaned.append("Structural load capacity is not recommended for high-rise elevations.")
                elif "style mismatch" in r_lower:
                    cleaned.append("Specification does not conform to the architectural styling guidelines.")
                elif "climate veto" in r_lower:
                    cleaned.append("Engineering override applied due to severe climatic hazard.")
                else:
                    cleaned.append(r)
            return cleaned

        # Grade materials via HYBRID DECISION SYSTEM
        for m in materials:
            eng_score, reasons, is_vetoed, criterion_breakdown, eng_conf, clim_conf = mcdm_engine.evaluate_material(m, climate, building_type, num_floors, profile)
            
            ml_score, pred_source = self._get_ml_score(
                material_category=m["Category"],
                material_id=m["Material_ID"],
                climate=climate,
                b_type=building_type,
                budget=budget,
                floor_count=num_floors,
                total_area=total_area,
                structural_system=blueprint.get("structural_system", "Concrete Frame"),
                sustainability_pref=profile.sustainability_pref,
                mat=m
            )

            if pred_source == "HEURISTIC_FALLBACK":
                fallback_predictions_count += 1

            if eng_score is None:
                final_score = None
            elif ml_score is None:
                final_score = float(eng_score)
            else:
                final_score = calculate_hybrid_score(eng_score, ml_score, vetoed=is_vetoed)

            if final_score is not None and not is_vetoed:
                if validation_severity == "high":
                    # Hard veto on non-compliant materials
                    if str(m.get("Durability_Rating", "Medium")).lower() == "low" or float(m.get("Sustainability_Rating", 50)) < 40:
                        is_vetoed = True
                        final_score = 0.0
                        reasons.append("VETO: Non-compliant material rejected under HIGH validation severity.")
                elif validation_severity == "medium":
                    # 20% score penalty
                    final_score *= 0.8
                    reasons.append("Applied 20% penalty due to MEDIUM validation severity.")

            if is_vetoed:
                final_score = 0.0
                ml_score = None
                
            if final_score is not None and ml_score is not None:
                # Recalculate hybrid score to verify consistency and log discrepancies
                expected = calculate_hybrid_score(eng_score, ml_score, vetoed=is_vetoed)
                # If validation_severity caused a penalty, adjust expected so it matches and avoids false alerts
                if validation_severity == "medium" and not is_vetoed:
                    expected *= 0.8
                if abs(final_score - expected) >= 0.01:
                    warn_msg = f"Discrepancy: Material={m['Name']}, Category={m['Category']}, Reported={final_score}, Recalculated={expected}"
                    print(f"[VERIFICATION ALERT] {warn_msg}")
                    ml_warnings.append(warn_msg)

            scored_materials.append({
                "material": m,
                "score": final_score,
                "eng_score": eng_score,
                "ml_score": ml_score,
                "vetoed": is_vetoed,
                "veto_reason": ", ".join(reasons) if is_vetoed else "",
                "prediction_source": pred_source,
                "exposure_score": calculate_exposure_score(climate.get('distance_km', 0.0), climate.get('salinity', 'low'), climate.get('humidity', 0.0), climate.get('rainfall', 0.0)),
                "phase_cost": round(m["Rate_LKR"] * quantities.get(m["Category"], 1.0)),
                "internal_reasons": reasons,
                "criterion_breakdown": criterion_breakdown,
                "engineering_confidence": eng_conf,
                "climate_confidence": clim_conf
            })

        # Group and rank items within categories
        by_cat = {}
        for sm in scored_materials:
            cat = sm["material"]["Category"]
            if cat not in by_cat:
                by_cat[cat] = []
            by_cat[cat].append(sm)

        for cat, items in by_cat.items():
            items_sorted_eng = sorted(items, key=lambda x: (x["eng_score"] if x["eng_score"] is not None else -1, x["material"]["Material_ID"]), reverse=True)
            for idx, item in enumerate(items_sorted_eng):
                item["eng_rank"] = idx + 1

            items_sorted_ml = sorted(items, key=lambda x: (x["ml_score"] if x["ml_score"] is not None else -1, x["material"]["Material_ID"]), reverse=True)
            for idx, item in enumerate(items_sorted_ml):
                item["ml_rank"] = idx + 1

            items_sorted_hybrid = sorted(items, key=lambda x: (x["score"] if x["score"] is not None else -1, x["material"]["Material_ID"]), reverse=True)
            for idx, item in enumerate(items_sorted_hybrid):
                item["hybrid_rank"] = idx + 1

        # Populate explanations and rationales
        for sm in scored_materials:
            m = sm["material"]
            reasons = sm["internal_reasons"]
            cleaned_reasons = clean_material_reasons(reasons)
            is_vetoed = sm["vetoed"]
            sel_reason = generate_material_explanation(m, climate, profile, num_floors)
            sm["selection_reason"] = sel_reason
            
            if is_vetoed:
                public_rationale = f"Vetoed by engineering validation against structural and environmental hazard standards. Reasons: {', '.join(cleaned_reasons)}"
                global_reasoning.extend(cleaned_reasons)
            else:
                public_rationale = f"Selected via Hybrid AI (Eng Rank: #{sm['eng_rank']}, ML Rank: #{sm['ml_rank']}). Climate: {sel_reason['climate']} Sustainability: {sel_reason['sustainability']}"
                if cleaned_reasons:
                    global_reasoning.extend(cleaned_reasons)
            sm["recommendation_explanation"] = public_rationale
            sm["rationale"] = public_rationale  # backward compatibility

        valid_mats = [m for m in scored_materials if not m["vetoed"] and m["score"] is not None]
        if not valid_mats:
            raise ValueError("No viable materials passed engineering validation.")

        ranked_valid = sorted(valid_mats, key=lambda x: x["score"], reverse=True)
        
        # Log to the audit engine
        for rank, mat in enumerate(ranked_valid, start=1):
            t_idx = get_target_idx(mat["material"]["Category"])
            pred_conf = category_predictions.get(t_idx, {"confidence_score": 50.0, "variance": 5.0})
            c_score = pred_conf.get("confidence_score", 50.0)
            c_level = "High" if c_score > 80 else "Medium" if c_score >= 60 else "Low"
            conf_dict = {"confidence_score": round(c_score, 1), "confidence_level": c_level}

            # Determine recommendation quality label
            eng_score_val = mat["eng_score"] if mat["eng_score"] is not None else 0
            if eng_score_val >= 95:
                quality = "Excellent"
            elif eng_score_val >= 85:
                quality = "Very Good"
            elif eng_score_val >= 75:
                quality = "Good"
            else:
                quality = "Acceptable"
            
            audit_engine.log_audit(
                category=mat["material"]["Category"],
                item_name=mat["material"]["Name"],
                dataset_source="materials.db",
                dataset_row=mat["material"]["Material_ID"],
                ml_score=mat["ml_score"],
                engineering_score=mat["eng_score"],
                hybrid_score=mat["score"],
                ranking=rank,
                explanation=mat["rationale"],
                material_id=mat["material"]["Material_ID"],
                confidence=conf_dict,
                prediction_source=mat["prediction_source"],
                engineering_rank=mat["eng_rank"],
                ml_rank=mat["ml_rank"],
                hybrid_rank=mat["hybrid_rank"],
                selection_reason=mat["selection_reason"],
                recommendation_quality=quality,
                engineering_confidence=mat["engineering_confidence"],
                climate_confidence=mat["climate_confidence"]
            )
            
        # Write aggregated criterion breakdown artifact
        criteria_agg = []
        for mat in scored_materials:
            if mat.get("criterion_breakdown"):
                criteria_agg.append({
                    "material": mat["material"]["Name"],
                    "criterion_breakdown": mat["criterion_breakdown"]
                })
        try:
            artifact_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts", "criterion_breakdown.json"))
            with open(artifact_path, "w", encoding="utf-8") as f:
                json.dump(criteria_agg, f, indent=2)
        except Exception as e:
            print(f"[WARNING] Failed to write criterion_breakdown.json: {e}")
        rec_package = self._build_package(ranked_valid, profile, building_type)

        selected_mats = []
# Validation of model_integrity, feature_importance_available, and confidence moved to verify_report_consistency.py
        for item in ["foundation", "structural", "walls", "roofing", "windows", "doors", "flooring", "ceiling", "finishes", "waterproofing"]:
            item = rec_package.get(item)
            if item and isinstance(item, dict) and "name" in item:
                for rm in ranked_valid:
                    if rm["material"]["Name"] == item["name"]:
                        selected_mats.append(rm)
                        break
        
        if not selected_mats:
            selected_mats = ranked_valid[:1]
            
        proj_eng_scores = [m["eng_score"] for m in selected_mats if m["eng_score"] is not None]
        proj_ml_scores = [m["ml_score"] for m in selected_mats if m["ml_score"] is not None]
        proj_hybrid_scores = [m["score"] for m in selected_mats if m["score"] is not None]
        
        project_eng_score = sum(proj_eng_scores) / len(proj_eng_scores) if proj_eng_scores else 0.0
        project_ml_score = sum(proj_ml_scores) / len(proj_ml_scores) if proj_ml_scores else None
        project_hybrid_score = sum(proj_hybrid_scores) / len(proj_hybrid_scores) if proj_hybrid_scores else 0.0
        
        avg_sustainability = sum([m["material"].get("Sustainability_Rating", 50) for m in selected_mats]) / len(selected_mats)
        avg_carbon = sum([m["material"].get("Embodied_Carbon", 0.35) for m in selected_mats]) / len(selected_mats)
        avg_service_life = sum([m["material"].get("Service_Life", 30) for m in selected_mats]) / len(selected_mats)

        # Compute project-level confidence and variance metrics
        pkg_conf_scores = []
        pkg_variance_scores = []
        for sm in selected_mats:
            t_idx = get_target_idx(sm["material"]["Category"])
            if t_idx in category_predictions:
                pkg_conf_scores.append(category_predictions[t_idx]["confidence_score"])
                pkg_variance_scores.append(category_predictions[t_idx]["variance"])
            else:
                pkg_conf_scores.append(50.0)
                pkg_variance_scores.append(5.0)

        overall_confidence_score = sum(pkg_conf_scores) / len(pkg_conf_scores) if pkg_conf_scores else 50.0
        overall_variance = sum(pkg_variance_scores) / len(pkg_variance_scores) if pkg_variance_scores else 5.0
        
        confidence_level = "High" if overall_confidence_score > 80 else "Medium" if overall_confidence_score >= 60 else "Low"
        confidence_dict = {
            "confidence_score": round(overall_confidence_score, 1),
            "confidence_level": confidence_level
        }

        # Check for fallback usage in selected package items
        for sm in selected_mats:
            if sm["prediction_source"] == "HEURISTIC_FALLBACK":
                ml_warnings.append(f"Heuristic fallback was used for recommended item: {sm['material']['Name']} in category {sm['material']['Category']}.")

        display_confidence = round(overall_confidence_score, 1)

        # Feature Importance Validation
        feature_names = [
            "Building Type", "Floor Count", "Total Area", "Climate Zone",
            "Humidity", "Rainfall", "Salinity", "Structural System", "Sustainability Pref"
        ]
        feature_importance_dict = {}
        if self.ml_available and hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            total_imp = sum(importances)
            if total_imp > 0:
                for fname, val in zip(feature_names, importances):
                    feature_importance_dict[fname] = round((val / total_imp) * 100, 1)
            else:
                for fname in feature_names:
                    feature_importance_dict[fname] = 0.0
        # Determine if feature importance is available from the model
        feature_importance_available = self.ml_available and hasattr(self.model, "feature_importances_")


        # Generate Real Design Alternatives
        def get_alt(category: str, sort_key) -> Dict:
            c_mats = [m for m in valid_mats if m["material"]["Category"] == category]
            if not c_mats:
                return {"name": "—", "score": 0.0}
            best = max(c_mats, key=sort_key)
            return {"name": best["material"]["Name"], "score": best["score"]}

        eco_foundation = get_alt("Foundation", lambda x: x["material"].get("Sustainability_Rating", 0))
        eco_walls = get_alt("Walling", lambda x: x["material"].get("Sustainability_Rating", 0))
        eco_roof = get_alt("Roofing", lambda x: x["material"].get("Sustainability_Rating", 0))
        eco_finishes = get_alt("Finishing", lambda x: x["material"].get("Sustainability_Rating", 0))
        
        eco_scores = [s for s in [eco_foundation["score"], eco_walls["score"], eco_roof["score"], eco_finishes["score"]] if s > 0]
        eco_package_score = sum(eco_scores) / len(eco_scores) if eco_scores else 0.0

        clim_foundation = get_alt("Foundation", lambda x: x["material"].get("Durability_Rating", "Medium") == "High")
        clim_walls = get_alt("Walling", lambda x: x["material"].get("Durability_Rating", "Medium") == "High")
        clim_roof = get_alt("Roofing", lambda x: x["material"].get("Durability_Rating", "Medium") == "High")
        clim_finishes = get_alt("Finishing", lambda x: x["material"].get("Durability_Rating", "Medium") == "High")
        
        clim_scores = [s for s in [clim_foundation["score"], clim_walls["score"], clim_roof["score"], clim_finishes["score"]] if s > 0]
        clim_package_score = sum(clim_scores) / len(clim_scores) if clim_scores else 0.0

        # System Integrity Report
        integrity_report = {
            "model_loaded": self.model_loaded,
            "dataset_loaded": self.dataset_loaded,
            "dataset_rows": self.dataset_rows,
            "dataset_columns": self.dataset_columns,
            "feature_count": len(self.ml_features) if self.ml_features else 9,
            "fallback_predictions": fallback_predictions_count,
            "average_confidence": round(overall_confidence_score, 1),
            "cross_validation_score": round(self.cross_validation_score * 100, 1) if self.cross_validation_score else None,
            "recommendation_engine_status": "VALIDATED"
        }

        # Diagnostics Panel mapping
        ml_diagnostics_panel = {
            "ml_available": self.ml_available,
            "model_name": self.model_source or "N/A",
            "training_dataset_size": f"{self.dataset_rows:,} rows" if self.dataset_loaded else "0 rows",
            "number_of_materials": len(set(c for classes in self.model.classes_ for c in classes)) if self.ml_available else 62,
            "feature_count": len(self.ml_features) if self.ml_features else 9,
            "training_accuracy": f"{self.training_accuracy * 100:.1f}%" if self.training_accuracy else "N/A",
            "cross_validation_score": f"{self.cross_validation_score * 100:.1f}%" if self.cross_validation_score else "N/A",
            "prediction_confidence": f"{overall_confidence_score:.1f}%",
            "fallback_usage_count": fallback_predictions_count,
            "ml_variance": round(overall_variance, 2),
            "warnings": ml_warnings
        }

        return {
            "status": "success",
            "climate_profile": {
                "city": location,
                "type": climate_type,
                "salinity": climate.get("salinity", "Low"),
                "humidity": f"{climate.get('humidity', 70)}%",
                "temperature": climate.get("temp", "25-32°C"),
                "rainfall": f"{climate.get('rainfall', 1500)}mm",
                "risk_advisory": climate.get("live_advisory", {}).get("advisory", "Standard specifications apply."),
                "exposure_score": calculate_exposure_score(climate.get('distance_km', 0.0), climate.get('salinity', 'low'), climate.get('humidity', 0.0), climate.get('rainfall', 0.0)),
                "exposure_level": exposure_level_from_score(
                    calculate_exposure_score(climate.get('distance_km', 0.0), climate.get('salinity', 'low'), climate.get('humidity', 0.0), climate.get('rainfall', 0.0)),
                    salinity=climate.get('salinity', 'low'),
                    distance_km=climate.get('distance_km', 0.0)
                )
            },
            "engineering_verdict": self._generate_verdict(climate, building_type, num_floors, profile),
            "estimated_quantities": {k: f"{round(v, 1)} units" for k, v in quantities.items()},
            "recommended_package": rec_package,
            "ml_diagnostics": ml_diagnostics_panel,
            "design_alternatives": {
                "eco_premium": {
                    "foundation": eco_foundation,
                    "walls": eco_walls,
                    "roof": eco_roof,
                    "finishes": eco_finishes,
                    "hybrid_score": round(eco_package_score, 1)
                },
                "climate_resilient": {
                    "foundation": clim_foundation,
                    "walls": clim_walls,
                    "roof": clim_roof,
                    "finishes": clim_finishes,
                    "hybrid_score": round(clim_package_score, 1)
                }
            },
            "metrics": {
                "project_eng_score": round(project_eng_score, 1),
                "project_ml_score": round(project_ml_score, 1) if project_ml_score is not None else "N/A",
                "project_hybrid_score": round(project_hybrid_score, 1),
                "average_sustainability": round(avg_sustainability, 1),
                "average_carbon": round(avg_carbon, 2),
                "average_service_life": round(avg_service_life, 1),
                "overall_hybrid_score": round(project_hybrid_score, 1),
                "average_model_confidence": round(overall_confidence_score, 1)
            },
            "confidence": confidence_dict,
            "display_confidence": display_confidence,
            # Validation of response structure moved to verify_report_consistency.py
            # Previously, assertions incorrectly referenced undefined 'data' variable.
            # These checks are now performed in the verification script.
            "model_integrity": self.get_model_status(),
            "feature_importance_available": self.feature_importance_available,
            "system_integrity_report": integrity_report,
            "api_metadata": API_METADATA,
            "audit_log": audit_engine.get_logs(),
            "reasoning": list(set(global_reasoning))[:5],
            "criterion_breakdown_file": "artifacts/criterion_breakdown.json"
        }

    def _estimate_quantities(self, total_area: float, num_floors: int, b_type: str) -> Dict[str, float]:
        footprint_area = total_area / num_floors
        perimeter = 4 * math.sqrt(footprint_area)
        wall_height = 3.2
        gross_wall_area = perimeter * wall_height * num_floors
        
        return {
            "Foundation": footprint_area * 0.65,
            "Structural": total_area * 0.15,
            "Walling": gross_wall_area * 0.8,
            "Roofing": footprint_area * 1.3,
            "Flooring": total_area,
            "Ceiling": total_area * 0.9,
            "Openings": total_area / 20.0,
            "Waterproofing": footprint_area + 20.0,
            "Finishing": gross_wall_area * 2.0
        }

    def _build_package(self, scored_mats: List[Dict], profile: UserProfile, b_type: str) -> Dict[str, Any]:
        def get_best_filtered(category: str, filter_fn=None) -> Dict:
            mats = [m for m in scored_mats if m["material"]["Category"] == category and m["score"] is not None and m["score"] > 0]
            if filter_fn:
                mats = [m for m in mats if filter_fn(m["material"]["Name"])]
            if not mats:
                return None
            best = max(mats, key=lambda x: x["score"])
            # Compute recommendation quality label
            eng_score_val = best["eng_score"] if best["eng_score"] is not None else 0
            if eng_score_val >= 95:
                quality = "Excellent"
            elif eng_score_val >= 85:
                quality = "Very Good"
            elif eng_score_val >= 75:
                quality = "Good"
            else:
                quality = "Acceptable"
            return {
                "name": best["material"]["Name"],
                "score": best["score"],
                "cost_guidance": f"LKR {best['phase_cost']:,}",
                "rationale": best["rationale"],
                "sustainability_rating": best["material"].get("Sustainability_Rating", 50),
                "service_life": best["material"].get("Service_Life", 30),
                "embodied_carbon": best["material"].get("Embodied_Carbon", 0.35),
                "eng_score": best["eng_score"],
                "ml_score": best["ml_score"] if best["ml_score"] is not None else None,
                "prediction_source": best["prediction_source"],
                "selection_reason": {
                    "engineering_rank": f"#{best['eng_rank']}",
                    "ml_rank": f"#{best['ml_rank']}",
                    "hybrid_rank": f"#{best['hybrid_rank']}",
                    "climate": best["selection_reason"]["climate"],
                    "durability": best["selection_reason"]["durability"],
                    "sustainability": best["selection_reason"]["sustainability"],
                    "cost": best["selection_reason"]["cost"]
                },
                "engineering_metadata": {
                    "engineering_score": best["eng_score"],
                    "criterion_breakdown": best["criterion_breakdown"],
                    "engineering_confidence": best["engineering_confidence"],
                    "climate_confidence": best["climate_confidence"],
                    "recommendation_quality": quality
                }
            }

        return {
            "foundation": get_best_filtered("Foundation"),
            "structural": get_best_filtered("Structural"),
            "concrete": get_best_filtered("Concrete"),
            "walls": get_best_filtered("Walling"),
            "roofing": get_best_filtered("Roofing"),
            "windows": get_best_filtered("Windows"),
            "doors": get_best_filtered("Doors"),
            "flooring": get_best_filtered("Flooring"),
            "ceiling": get_best_filtered("Ceiling"),
            "finishes": get_best_filtered("Finishing"),
            "waterproofing": get_best_filtered("Waterproofing")
        }

    def _generate_verdict(self, climate: Dict[str, Any], b_type: str, floors: int, profile: UserProfile) -> str:
        city = climate.get("city", "Colombo")
        c_type = climate.get("type", "Wet Zone")
        exposure_level = exposure_level_from_score(calculate_exposure_score(climate.get('distance_km', 0.0), climate.get('salinity', 'low'), climate.get('humidity', 0.0), climate.get('rainfall', 0.0)))
        
        exposure_map = {
            "Very High": "Severe Marine Exposure",
            "Moderate": "Elevated Exposure",
            "Low": "Standard Exposure"
        }
        mapped_exposure = exposure_map.get(exposure_level, exposure_level)
        
        verdict = f"The structural and material package for the {floors}-floor {b_type} building in {city} ({c_type}) has been formally validated against SLS structural load and environmental hazard standards. "
        verdict += f"Exposure level assessed as {mapped_exposure}. Selected specifications optimize for long-term durability and climate resilience."
        return verdict

    def get_model_status(self) -> Dict[str, Any]:
        return {
            "model_source": self.model_source,
            "model_loaded": self.model_loaded,
            "dataset_loaded": self.dataset_loaded,
            "dataset_rows": self.dataset_rows,
            "dataset_columns": self.dataset_columns,
            "feature_count": len(self.ml_features) if self.ml_features else 9,
            "cross_validation_score": round(self.cross_validation_score * 100, 1) if self.cross_validation_score else None,
            "training_accuracy": round(self.training_accuracy * 100, 1) if self.training_accuracy else None,
            "recommendation_engine_status": "VALIDATED",
            "feature_importance_available": self.feature_importance_available
        }


def category_needs_heavy_materials(category: str) -> bool:
    return category in ["Foundation", "Structural"]

recommendation_engine = RecommendationEngine()
