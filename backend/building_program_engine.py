from typing import Dict, Any, List

def generate_building_program(spatial_program: Dict[str, List[Dict[str, str]]], questionnaire: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts spatial requirements into engineering spaces.
    Adds estimated areas, assigns zones, and calculates circulation allowances.
    """
    rooms = spatial_program.get("rooms", [])
    building_type = questionnaire.get("building_type", "Residential")
    
    # Area sizing heuristics per building type and room type
    # Default sizes for room types (in m^2)
    room_sizes = {
        "BEDROOM": 15.0,
        "BATHROOM": 6.0,
        "LIVING_ROOM": 25.0,
        "DINING_ROOM": 15.0,
        "KITCHEN": 12.0,
        "OFFICE": 12.0,
        "SERVICE": 8.0,
        "OUTDOOR": 15.0,
        "PARKING": 15.0,
        "GUEST_ROOM": 25.0,
        "RESTAURANT": 80.0,
        "CONFERENCE_ROOM": 50.0,
        "RECREATION": 100.0,
        "STAFF_ROOM": 20.0,
        "CLASSROOM": 56.0,
        "LABORATORY": 65.0,
        "LIBRARY": 100.0,
        "AUDITORIUM": 200.0,
        "WARD": 35.0,
        "ICU": 60.0,
        "THEATRE": 60.0,
        "CLINICAL": 16.0,
        "EMERGENCY": 150.0,
        "PHARMACY": 35.0,
        "MEETING_ROOM": 20.0,
        "RECEPTION": 30.0,
        "RETAIL": 100.0,
        "CIRCULATION": 15.0
    }
    
    # Zones mapping
    zone_mapping = {
        "BEDROOM": "private",
        "BATHROOM": "service",
        "LIVING_ROOM": "public",
        "DINING_ROOM": "public",
        "KITCHEN": "service",
        "OFFICE": "private",
        "SERVICE": "service",
        "OUTDOOR": "outdoor",
        "PARKING": "service",
        "GUEST_ROOM": "guestroom",
        "RESTAURANT": "dining",
        "CONFERENCE_ROOM": "conference",
        "RECREATION": "recreation",
        "STAFF_ROOM": "staff",
        "CLASSROOM": "academic",
        "LABORATORY": "academic",
        "LIBRARY": "academic",
        "AUDITORIUM": "public",
        "WARD": "inpatient",
        "ICU": "icu",
        "THEATRE": "surgical",
        "CLINICAL": "outpatient",
        "EMERGENCY": "emergency",
        "PHARMACY": "service",
        "MEETING_ROOM": "private",
        "RECEPTION": "public",
        "RETAIL": "public",
        "CIRCULATION": "circulation"
    }

    # Adjust circulation factor based on building type and traffic intensity
    circulation_factor = {
        "Residential": 0.15,
        "Commercial": 0.25,
        "Industrial": 0.12,
        "Educational": 0.28,
        "Healthcare": 0.35,
        "Hotel": 0.30
    }.get(building_type, 0.15)
    
    traffic = str(questionnaire.get("traffic_intensity", "Medium")).lower()
    if traffic == "high":
        circulation_factor += 0.05
    elif traffic == "low":
        circulation_factor -= 0.05

    enriched_rooms = []
    total_net_area = 0.0
    
    for r in rooms:
        rtype = r["type"]
        area = room_sizes.get(rtype, 15.0)
        zone = zone_mapping.get(rtype, "service")
        
        enriched_rooms.append({
            "name": r["label"],
            "type": rtype,
            "zone": zone,
            "area": area
        })
        total_net_area += area
        
    circulation_area = total_net_area * circulation_factor
    # Update the core circulation area
    for r in enriched_rooms:
        if r["type"] == "CIRCULATION":
            r["area"] += circulation_area
            break

    total_gross_area = total_net_area + circulation_area

    return {
        "rooms": enriched_rooms,
        "total_net_area": total_net_area,
        "total_gross_area": total_gross_area,
        "circulation_factor": circulation_factor
    }
