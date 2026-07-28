import os
import pickle
import math
from typing import Dict, List, Any, Optional

from database import get_all_materials, format_material
from weather_engine import get_climate_profile
from questionnaire_engine import UserProfile
from mcdm_engine import mcdm_engine
from pydantic import BaseModel
from audit_engine import audit_engine
from backend.utils import calculate_hybrid_score

# ---------------------------------------------------------------------------
# Pydantic schema for the material option returned to the frontend
# ---------------------------------------------------------------------------
class MaterialOption(BaseModel):
    id: str
    name: str
    image_url: str
    suitability_score: Optional[float] = None
    ml_score: Optional[float] = None
    eng_score: Optional[float] = None
    climate_score: Optional[float] = None
    style_score: Optional[float] = None
    sustainability_score: Optional[float] = None
    cost_score: Optional[float] = None
    hybrid_score: Optional[float] = None
    durability_rating: str
    sustainability_rating: str
    maintenance_rating: str
    service_life_years: int
    carbon_impact_kg_co2: float
    climate_compatible: bool
    engineering_reasoning: List[str]

# ---------------------------------------------------------------------------
# Helper: load ML model (same logic as old RecommendationEngine)
# ---------------------------------------------------------------------------
def _load_ml_model() -> Any:
    model = None
    ml_features = []
    model_paths = [
        os.path.join(os.path.dirname(__file__), "ml", "greenconstruct_model.pkl"),
        os.path.join(os.path.dirname(__file__), "ml", "ecobuild_model.pkl"),
    ]
    for path in model_paths:
        if os.path.exists(path):
            try:
                with open(path, "rb") as f:
                    data = pickle.load(f)
                    if isinstance(data, dict) and "model" in data:
                        model = data["model"]
                        ml_features = data.get("features", [])
                    else:
                        model = data
                print(f"Loaded ML model from {path}")
                break
            except Exception as e:
                print(f"Failed to load ML model at {path}: {e}")
    if not model:
        print("No ML model found – ML scores will default to 50.")
    return model

_ml_model = _load_ml_model()

def _ml_score(
    material_category: str,
    material_id: int,
    climate: Dict[str, Any],
    building_type: str,
    budget: float = 0.0,
    floor_count: int = 1,
    total_area: float = 100.0,
    structural_system: str = "Concrete Frame",
    sustainability_pref: str = "Medium"
) -> float:
    """Return a 0‑100 suitability score from the ML model. Returns None if model is unavailable."""
    if not _ml_model:
        return None
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
            float(b_type_map.get(building_type.lower(), 0)),
            float(floor_count),
            float(total_area),
            float(zone_code),
            float(climate.get("humidity", 75)),
            float(climate.get("rainfall", 1500)),
            float(salinity_map.get(climate.get("salinity", "low").lower(), 0)),
            float(struct_sys_map.get(structural_system.lower(), 0)),
            float(sus_level_map.get(sustainability_pref.lower(), 1))
        ]]
        if hasattr(_ml_model, "predict_proba"):
            target_idx = {
                "Foundation": 0,
                "Concrete": 0,
                "Structural": 0,
                "Walling": 1,
                "Roofing": 2,
                "Openings": 3,
                "Flooring": 4,
                "Ceiling": 4,
                "Waterproofing": 4,
                "Finishing": 4
            }.get(material_category, 0)

            classes = _ml_model.classes_[target_idx]
            probs = _ml_model.predict_proba(features)[target_idx][0]
            
            if material_id in classes:
                idx = list(classes).index(material_id)
                return float(probs[idx] * 100)
            else:
                return None
        return None
    except Exception as e:
        print(f"ML scoring error: {e}")
        return None


# ---------------------------------------------------------------------------
# Core function – generate top‑5 alternatives per component
# ---------------------------------------------------------------------------
def get_alternatives(
    blueprint: Dict[str, Any],
    location: str,
    questionnaire: UserProfile,
) -> Dict[str, List[MaterialOption]]:
    """Return a mapping of component name → list of five MaterialOption objects.

    Uses the authoritative 75/25 hybrid formula (consistent with constraint_engine):
        hybrid = (0.75 * eng_score) + (0.25 * ml_score)
    Engineering veto always forces hybrid_score = 0.0 regardless of ML confidence.
    """
    raw_rows = get_all_materials()
    catalog = [format_material(r) for r in raw_rows]

    climate = get_climate_profile(location)
    city_climate = climate.get("type", "Intermediate")
    building_type = blueprint.get("building_type", "Residential")
    num_floors = blueprint.get("num_floors", 1)
    budget = blueprint.get("budget", 0.0)

    scored: List[Dict[str, Any]] = []
    for mat in catalog:
        eng_score, reasons, veto, _, _, _ = mcdm_engine.evaluate_material(mat, climate, building_type, num_floors, questionnaire)
        ml_sc = _ml_score(
            material_category=mat.get("Category", ""),
            material_id=mat.get("Material_ID", 0),
            climate=climate,
            building_type=building_type,
            budget=budget,
            floor_count=num_floors,
            total_area=blueprint.get("total_area", 100.0),
            structural_system=blueprint.get("structural_system", "Concrete Frame"),
            sustainability_pref=questionnaire.sustainability_pref
        )
        
        # Calculate Climate Score (Internal audit only)
        climates = mat.get("Suitable_Climates", "").lower()
        climate_score = 60.0
        if any(c in climates for c in city_climate.lower().split("-")):
            climate_score = 90.0
        if veto:
            climate_score = 0.0

        # Calculate Style Score (Internal audit only)
        style_score = 50.0
        pref_style = getattr(questionnaire, "style_pref", "Modern").lower()
        name_lower = mat.get("Name", "").lower()
        if "modern" in pref_style:
            if any(k in name_lower for k in ["upvc", "glass", "epoxy", "nano", "porcelain"]):
                style_score = 95.0
        elif "traditional" in pref_style:
            if any(k in name_lower for k in ["clay", "terrazzo", "earth", "timber"]):
                style_score = 95.0
        elif "luxury" in pref_style:
            if any(k in name_lower for k in ["marble", "glass", "polished"]):
                style_score = 95.0
        elif "eco" in pref_style:
            if any(k in name_lower for k in ["earth", "bamboo", "hemp", "recycled"]):
                style_score = 95.0
        elif "industrial" in pref_style:
            if any(k in name_lower for k in ["steel", "concrete", "brick"]):
                style_score = 95.0

        # Calculate Sustainability Score (Internal audit only)
        sustainability_score = float(mat.get("Sustainability_Rating", 50))

        # Calculate Cost Score (Internal audit only)
        rate = float(mat.get("Rate_LKR", 0))
        if "structural" in mat.get("Category", "").lower():
            cost_score = max(0.0, min(100.0, 100.0 - (rate / 600000.0) * 80.0))
        elif "foundation" in mat.get("Category", "").lower():
            cost_score = max(0.0, min(100.0, 100.0 - (rate / 100000.0) * 80.0))
        else:
            cost_score = max(0.0, min(100.0, 100.0 - (rate / 15000.0) * 80.0))

        # Combine into Hybrid Score
        hybrid = calculate_hybrid_score(eng_score, ml_sc, vetoed=veto)

        reasoning = []
        if veto:
            hybrid = 0.0
            reasoning.extend(reasons)
            reasoning.append("Vetoed by engineering validation.")
        else:
            if not reasons:
                ml_sc_val = int(ml_sc) if ml_sc is not None else 'N/A'
                reasoning.append(f"Hybrid AI score (Eng {int(eng_score)}%, ML {ml_sc_val}%).")
            else:
                reasoning.extend(reasons)
        
        if hybrid is not None and ml_sc is not None and eng_score is not None:
            # Verify consistency – log discrepancy instead of crashing
            expected = (0.75 * eng_score) + (0.25 * ml_sc)
            if not (hybrid == 0.0) and abs(hybrid - expected) >= 0.05:
                print(f"[WARN] material_engine hybrid discrepancy: {mat.get('Name')} "
                      f"reported={hybrid:.2f} expected={expected:.2f}")

        option_dict = {
            "id": str(mat.get("Material_ID", "")),
            "name": mat.get("Name", "Unknown"),
            "image_url": mat.get("ImageURL", "/assets/materials/default_diffuse.jpg"),
            "suitability_score": round(hybrid, 2) if hybrid is not None else None,
            "ml_score": round(ml_sc, 1) if ml_sc is not None else None,
            "eng_score": round(eng_score, 1) if eng_score is not None else None,
            "climate_score": round(climate_score, 1),
            "style_score": round(style_score, 1),
            "sustainability_score": round(sustainability_score, 1),
            "cost_score": round(cost_score, 1),
            "hybrid_score": round(hybrid, 1) if hybrid is not None else None,
            "durability_rating": mat.get("Durability_Rating", "Medium"),
            "sustainability_rating": str(mat.get("Sustainability_Rating", "Medium")),
            "maintenance_rating": str(mat.get("Maintenance_Level", "Medium")),
            "service_life_years": int(mat.get("Service_Life", 30)),
            "carbon_impact_kg_co2": float(mat.get("Embodied_Carbon", 0.0)),
            "climate_compatible": not veto,
            "engineering_reasoning": reasoning,
        }
        scored.append({"material": mat, "option": option_dict, "score": hybrid if hybrid is not None else 0.0, "veto": veto})

# Map components to DB Categories (keys match Category column values, lowercased)
    component_category_map = {
        "Foundation":        ["foundation"],
        "Concrete":          ["concrete"],
        "Structural System": ["structural"],
        "Walls":             ["walling"],
        "Roof":              ["roofing"],
        "Windows":           ["windows"],
        "Doors":             ["doors"],
        "Flooring":          ["flooring"],
        "Ceiling":           ["ceiling"],
        "Waterproofing":     ["waterproofing"],
        "Finishes":          ["finishing"],
    }
    
    result: Dict[str, List[MaterialOption]] = {}
    for comp, keywords in component_category_map.items():
        matching = [
            s for s in scored
            if any(kw in str(s["material"].get("Category", "")).lower() for kw in keywords)
        ]
        matching.sort(key=lambda x: x["score"], reverse=True)
        top_five = matching[:5]
        
        if top_five:
            options_list = [MaterialOption(**item["option"]) for item in top_five]
            result[comp] = options_list
            
            # Log top alternatives to recommendation audit engine
            for rank, item in enumerate(options_list, 1):
                audit_engine.log_audit(
                    category=comp,
                    item_name=item.name,
                    dataset_source="materials.db",
                    dataset_row=item.id,
                    ml_score=item.ml_score,
                    engineering_score=item.eng_score,
                    hybrid_score=item.hybrid_score,
                    ranking=rank,
                    explanation=item.engineering_reasoning[0] if item.engineering_reasoning else "Optimal structural compatibility."
                )
    return result
