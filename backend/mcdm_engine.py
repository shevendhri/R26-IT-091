import math
from typing import Dict, Any, Tuple, List

class MCDMEngine:
    """
    Multi-Criteria Decision Making (MCDM) Engine.
    Handles the 70% Engineering Validation phase.
    """
    
    def __init__(self):
        pass

    def evaluate_material(self, m: Dict[str, Any], climate: Dict[str, Any], b_type: str, floors: int, profile: Any) -> Tuple[float, List[str], bool, Dict[str, Any], float, float]:
        """
        Scores a material based on engineering criteria, environment and preferences.
        Returns (score: float, reasons: list of str, is_vetoed: bool, criterion_breakdown: dict, eng_conf: float, clim_conf: float)
        """
        name = m["Name"].lower()
        category = m["Category"]
        
        # 1. Engineering metadata constraints (sector & climate)
        from backend.utils import engineering_confidence, climate_confidence
        from backend.constraint_engine import evaluate_constraints
        constraints = evaluate_constraints(
            material=m,
            blueprint={"building_type": b_type, "floors": floors},
            climate_profile=climate,
            user_profile=profile,
        )
        # Extract confidence metrics
        total = constraints.get("total_checks", 0)
        passed = constraints.get("passed_checks", 0)
        eng_conf = engineering_confidence(passed, total) if total > 0 else 100.0
        clim_conf = climate_confidence(m, climate)
        is_vetoed = constraints["veto"]
        # Existing code uses constraints["allowed"] etc.
        
        # Base suitability score replaced by weighted criteria sum
        # Define criteria weights (must sum to 100)
        criteria_weights = {
            "structural": 25,
            "climate": 20,
            "durability": 15,
            "service_life": 10,
            "fire": 10,
            "thermal": 10,
            "maintenance": 5,
            "sustainability": 5,
        }

        # Compute individual criterion scores (0-100)
        # Structural suitability: simple proxy using category match and structural capacity
        structural_score = 0.0
        if category.lower() in ["structural", "foundation"]:
            structural_score = 100.0
        else:
            # Use Structural_Capacity if available
            structural_score = float(m.get("Structural_Capacity", 50))

        # Climate compatibility: use constraints result
        climate_score = 100.0 if constraints["allowed"] else 0.0

        # Durability: combine Structural_Capacity and Service_Life
        durability_score = (float(m.get("Structural_Capacity", 50)) + min(100.0, float(m.get("Service_Life", 30)) * 1.5)) / 2.0
        durability_score = max(0.0, min(100.0, durability_score))

        # Service life score (higher is better)
        service_life_score = float(m.get("Service_Life", 30))
        service_life_score = max(0.0, min(100.0, service_life_score * 2))  # assume 50 years => 100

        # Fire resistance (if field exists)
        fire_score = float(m.get("Fire_Rating", 50))

        # Thermal performance
        thermal_score = float(m.get("Thermal_Rating", 50))

        # Maintenance (lower level is better)
        maintenance_score = max(0.0, min(100.0, 100.0 - float(m.get("Maintenance_Level", 50))))

        # Sustainability rating
        sustainability_score = float(m.get("Sustainability_Rating", 50))

        # Compute weighted sum (same as before)
        weighted_sum = (
            criteria_weights["structural"] * structural_score +
            criteria_weights["climate"] * climate_score +
            criteria_weights["durability"] * durability_score +
            criteria_weights["service_life"] * service_life_score +
            criteria_weights["fire"] * fire_score +
            criteria_weights["thermal"] * thermal_score +
            criteria_weights["maintenance"] * maintenance_score +
            criteria_weights["sustainability"] * sustainability_score
        ) / 100.0
        # Diagnostic prints for weighted sum and final score
        print("[DIAG] weighted_sum =", weighted_sum)

        # Criterion breakdown dictionary (score out of max for each)
        criterion_breakdown = {
            "structural": {"score": round(structural_score * criteria_weights["structural"] / 100, 2), "max": criteria_weights["structural"]},
            "climate": {"score": round(climate_score * criteria_weights["climate"] / 100, 2), "max": criteria_weights["climate"]},
            "durability": {"score": round(durability_score * criteria_weights["durability"] / 100, 2), "max": criteria_weights["durability"]},
            "service_life": {"score": round(service_life_score * criteria_weights["service_life"] / 100, 2), "max": criteria_weights["service_life"]},
            "fire": {"score": round(fire_score * criteria_weights["fire"] / 100, 2), "max": criteria_weights["fire"]},
            "thermal": {"score": round(thermal_score * criteria_weights["thermal"] / 100, 2), "max": criteria_weights["thermal"]},
            "maintenance": {"score": round(maintenance_score * criteria_weights["maintenance"] / 100, 2), "max": criteria_weights["maintenance"]},
            "sustainability": {"score": round(sustainability_score * criteria_weights["sustainability"] / 100, 2), "max": criteria_weights["sustainability"]}
        }

        # Apply any constraint penalty (score_modifier) if needed
        if constraints["allowed"]:
            final_score = weighted_sum
        else:
            final_score = max(0.0, weighted_sum - constraints.get("score_modifier", 0))
        print("[DIAG] final_score =", final_score)

        # existing code unchanged up to weighted sum calculation
        # After final_score computation, return along with new confidences
        # Generate reasons summary based on criterion breakdown
        reasons = []
        for crit, data in criterion_breakdown.items():
            if data["score"] < data["max"] * 0.5:
                reasons.append(f"{crit} score is low ({data['score']}/{data['max']})")
        if not reasons:
            reasons.append("All criteria meet expectations")
        return final_score, reasons, is_vetoed, criterion_breakdown, eng_conf, clim_conf
# Legacy code removed - unified scoring logic (previous dead block)toed

mcdm_engine = MCDMEngine()
