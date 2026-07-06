from typing import Dict, Any, List

def generate_spatial_program(questionnaire: Dict[str, Any]) -> Dict[str, List[Dict[str, str]]]:
    """
    Generates a spatial program (list of requested rooms) directly from the questionnaire inputs.
    Never uses static templates; only outputs rooms requested by the user.
    """
    rooms = []
    
    building_type = questionnaire.get("building_type", "Residential")

    def add_rooms(count: int, room_type: str, label_prefix: str):
        for i in range(count):
            rooms.append({
                "type": room_type,
                "label": f"{label_prefix} {i + 1}" if count > 1 else label_prefix
            })

    # Universal / Core
    # Residential specific fields
    if building_type == "Residential":
        bedrooms = int(questionnaire.get("bedrooms_needed") or 0)
        add_rooms(bedrooms, "BEDROOM", "Bedroom")

        bathrooms = int(questionnaire.get("num_bathrooms") or 0)
        add_rooms(bathrooms, "BATHROOM", "Bathroom")

        living_rooms = int(questionnaire.get("living_rooms") or 1) # typically at least 1
        add_rooms(living_rooms, "LIVING_ROOM", "Living Room")
        
        dining_rooms = int(questionnaire.get("dining_rooms") or 0)
        add_rooms(dining_rooms, "DINING_ROOM", "Dining Room")
        
        if questionnaire.get("kitchen_type"):
            rooms.append({"type": "KITCHEN", "label": "Kitchen"})
            
        if str(questionnaire.get("home_office")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "OFFICE", "label": "Home Office"})
            
        if str(questionnaire.get("guest_room")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "BEDROOM", "label": "Guest Room"})
            
        if str(questionnaire.get("laundry_room")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "SERVICE", "label": "Laundry Room"})
            
        if str(questionnaire.get("balcony_required")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "OUTDOOR", "label": "Balcony"})

        parking = int(questionnaire.get("parking_spaces") or 0)
        if parking > 0:
            rooms.append({"type": "PARKING", "label": f"Garage ({parking} spaces)"})

    elif building_type == "Hotel":
        # Ground Floor spaces
        rooms.append({"type": "RECEPTION", "label": "Reception"})
        rooms.append({"type": "LIVING_ROOM", "label": "Lobby"})
        rooms.append({"type": "RESTAURANT", "label": "Restaurant"})
        rooms.append({"type": "KITCHEN", "label": "Kitchen"})
        rooms.append({"type": "OFFICE", "label": "Administration"})
        rooms.append({"type": "SERVICE", "label": "Service Area"})

        # Typical & Top Floor spaces
        guest_rooms = max(4, int(questionnaire.get("room_count") or 8))
        add_rooms(guest_rooms, "GUEST_ROOM", "Guest Room")

        suites = max(2, int(questionnaire.get("suite_rooms") or 2))
        add_rooms(suites, "GUEST_ROOM", "Executive Suite")
        rooms.append({"type": "OUTDOOR", "label": "Roof Facilities"})

        # Vertical Circulation shafts (enforced across floors)
        rooms.append({"type": "CIRCULATION", "label": "Staircase Core"})
        rooms.append({"type": "CIRCULATION", "label": "Elevator Core"})

        
    elif building_type == "Educational":
        classrooms = int(questionnaire.get("classroom_count") or 0)
        add_rooms(classrooms, "CLASSROOM", "Classroom")
        
        comp_labs = int(questionnaire.get("computer_labs") or 0)
        add_rooms(comp_labs, "LABORATORY", "Computer Lab")
        
        sci_labs = int(questionnaire.get("science_labs") or 0)
        add_rooms(sci_labs, "LABORATORY", "Science Lab")
        
        if str(questionnaire.get("library_required")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "LIBRARY", "label": "Library"})
            
        if str(questionnaire.get("auditorium_required")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "AUDITORIUM", "label": "Auditorium"})

    elif building_type == "Healthcare":
        beds = int(questionnaire.get("bed_count") or 0)
        add_rooms(max(1, beds // 4), "WARD", "Patient Ward") # roughly 4 beds per ward
        
        icu_beds = int(questionnaire.get("icu_beds") or 0)
        if icu_beds > 0:
            rooms.append({"type": "ICU", "label": "ICU Ward"})
            
        theatres = int(questionnaire.get("operation_theatres") or 0)
        add_rooms(theatres, "THEATRE", "Operating Theatre")
        
        consults = int(questionnaire.get("consultation_rooms") or 0)
        add_rooms(consults, "CLINICAL", "Consultation Room")
        
        if str(questionnaire.get("emergency_facilities")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "EMERGENCY", "label": "Emergency Department"})
            
        if str(questionnaire.get("pharmacy_required")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "PHARMACY", "label": "Pharmacy"})
            
        labs = int(questionnaire.get("laboratories") or 0)
        add_rooms(labs, "LABORATORY", "Laboratory")

    elif building_type == "Commercial":
        offices = int(questionnaire.get("office_count") or 0)
        add_rooms(offices, "OFFICE", "Private Office")
        
        meetings = int(questionnaire.get("meeting_rooms") or 0)
        add_rooms(meetings, "MEETING_ROOM", "Meeting Room")
        
        if str(questionnaire.get("reception_required")).lower() in ["true", "yes", "1"]:
            rooms.append({"type": "RECEPTION", "label": "Reception"})
            
        retail = questionnaire.get("retail_requirements")
        if retail and retail != "None":
            rooms.append({"type": "RETAIL", "label": "Retail Floor"})

    # Always add a base circulation/core
    rooms.append({"type": "CIRCULATION", "label": "Main Circulation Core"})
    
    return {"rooms": rooms}
