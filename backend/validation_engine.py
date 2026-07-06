import json
import os
from typing import Dict, List, Any
from datetime import datetime

# Path for the research validation log
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
LOG_PATH = os.path.join(LOG_DIR, "research_validation_log.json")
MAX_LOG_ENTRIES = 1000

def _calculate_rule_score(value: float, threshold: float, higher_is_better: bool = True) -> float:
    if not threshold: return 100.0
    if higher_is_better:
        return min(100.0, (value / threshold) * 100.0) if value else 0.0
    else:
        return min(100.0, (threshold / value) * 100.0) if value else 0.0

def validate_project(inputs: Dict[str, Any]) -> Dict[str, Any]:
    warnings: List[str] = []
    recommendations: List[str] = []
    rule_results: List[Dict[str, Any]] = []
    overall_severity = "low"

    def add_rule_result(rule_name: str, score: float, sev: str, msg: str = None):
        nonlocal overall_severity
        order = {"low": 0, "medium": 1, "high": 2}
        if sev and order[sev] > order[overall_severity]:
            overall_severity = sev
        if msg and sev != "low":
            warnings.append(f"{msg} ({sev.capitalize()})")
        rule_results.append({"rule": rule_name, "score": score, "severity": sev})

    building_type = inputs.get('building_type', 'Residential')
    total_area = float(inputs.get('total_area', 0) or 0)

    if building_type == 'Residential':
        bedrooms = int(inputs.get('bedrooms_needed') or 0)
        if bedrooms and total_area:
            area_per_bed = total_area / bedrooms
            if area_per_bed < 15: add_rule_result("bedroom adequacy", 50, "high", f"Bedroom area too small: {area_per_bed:.1f} m²/bed")
            elif area_per_bed < 20: add_rule_result("bedroom adequacy", 75, "medium", f"Bedroom area marginal: {area_per_bed:.1f} m²/bed")
            else: add_rule_result("bedroom adequacy", 100, "low")
        
        occupants = int(inputs.get('family_size') or 0)
        bathrooms = int(inputs.get('num_bathrooms') or 0)
        if occupants and bathrooms:
            occ_per_bath = occupants / bathrooms
            if occ_per_bath > 6: add_rule_result("bathroom adequacy", 50, "high", f"High occupant-to-bathroom ratio: {occ_per_bath:.1f}")
            elif occ_per_bath > 4: add_rule_result("bathroom adequacy", 75, "medium", f"Marginal occupant-to-bathroom ratio: {occ_per_bath:.1f}")
            else: add_rule_result("bathroom adequacy", 100, "low")
            
        if occupants and total_area:
            area_per_occ = total_area / occupants
            if area_per_occ < 8: add_rule_result("area per occupant", 40, "high", f"High occupancy density: {area_per_occ:.1f} m²/occ")
            elif area_per_occ < 12: add_rule_result("area per occupant", 70, "medium", f"Medium occupancy density: {area_per_occ:.1f} m²/occ")
            else: add_rule_result("area per occupant", 100, "low")

    elif building_type == 'Hotel':
        rooms = int(inputs.get('room_count') or 0)
        if rooms and total_area:
            area_per_room = total_area / rooms
            if area_per_room < 15: add_rule_result("room density", 40, "high", f"Hotel room area too small: {area_per_room:.1f} m²")
            elif area_per_room < 25: add_rule_result("room density", 75, "medium", f"Hotel room area marginal: {area_per_room:.1f} m²")
            else: add_rule_result("room density", 100, "low")

    elif building_type == 'Educational':
        students = int(inputs.get('student_count') or 0)
        classrooms = int(inputs.get('classroom_count') or 0)
        if students and classrooms:
            stu_per_class = students / classrooms
            if stu_per_class > 45: add_rule_result("students per classroom", 40, "high", f"Too many students per classroom: {stu_per_class:.1f}")
            elif stu_per_class > 35: add_rule_result("students per classroom", 75, "medium", f"Marginal students per classroom: {stu_per_class:.1f}")
            else: add_rule_result("students per classroom", 100, "low")

    elif building_type == 'Healthcare':
        beds = int(inputs.get('bed_count') or 0)
        if beds and total_area:
            area_per_bed = total_area / beds
            if area_per_bed < 10: add_rule_result("bed density", 40, "high", f"Hospital bed area too low: {area_per_bed:.1f} m²")
            elif area_per_bed < 15: add_rule_result("bed density", 75, "medium", f"Hospital bed area marginal: {area_per_bed:.1f} m²")
            else: add_rule_result("bed density", 100, "low")

    elif building_type == 'Commercial':
        workstations = int(inputs.get('workstation_capacity') or 0)
        if workstations and total_area:
            area_per_emp = total_area / workstations
            if area_per_emp < 5: add_rule_result("employee density", 40, "high", f"Employee density too high: {area_per_emp:.1f} m²/emp")
            elif area_per_emp < 8: add_rule_result("employee density", 75, "medium", f"Employee density marginal: {area_per_emp:.1f} m²/emp")
            else: add_rule_result("employee density", 100, "low")

    elif building_type == 'Mixed-Use':
        add_rule_result("cross-use occupancy checks", 90, "low")
        
    validation_score = int(round(sum(r["score"] for r in rule_results) / len(rule_results))) if rule_results else 100

    return {
        "validation_score": validation_score,
        "severity": overall_severity,
        "warnings": warnings,
        "recommendations": recommendations,
        "rule_results": rule_results
    }


def generate_validation_log(validation_result: Dict[str, Any], inputs: Dict[str, Any]) -> None:
    os.makedirs(LOG_DIR, exist_ok=True)
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "questionnaire": inputs,
        "validation_result": validation_result
    }
    
    data = []
    if os.path.exists(LOG_PATH):
        try:
            with open(LOG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
            
    data.append(entry)
    if len(data) > MAX_LOG_ENTRIES:
        data = data[-MAX_LOG_ENTRIES:]
        
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
