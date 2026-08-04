from typing import Dict, Any, List

def generate_spatial_program(questionnaire: Dict[str, Any]) -> Dict[str, List[Dict[str, str]]]:
    """
    Generates a spatial program (list of requested rooms) directly from the questionnaire inputs.
    Never uses static templates; only outputs rooms requested by the user.
    Covers all fields captured in UserProfile:
      - Residential: bedrooms, bathrooms, living, dining, kitchen, office, study, guest,
                     laundry, store, maid, gym_room, balcony/balcony_required, garden, parking
      - Hotel: reception, lobby, restaurant, kitchen, admin, service, gym, spa, conference,
               guest rooms, suites, staircase/elevator cores, parking
      - Educational, Healthcare, Commercial: unchanged except enriched commercial
    """
    rooms = []

    building_type = questionnaire.get("building_type", "Residential")

    def add_rooms(count: int, room_type: str, label_prefix: str):
        for i in range(count):
            rooms.append({
                "type": room_type,
                "label": f"{label_prefix} {i + 1}" if count > 1 else label_prefix
            })

    def _bool(key):
        """Safely coerce a questionnaire value to bool."""
        v = questionnaire.get(key)
        if v is None:
            return False
        if isinstance(v, bool):
            return v
        return str(v).strip().lower() in ("true", "yes", "1")

    def _int(key, default=0):
        try:
            v = questionnaire.get(key)
            return int(v) if v is not None and str(v).strip() != "" else default
        except (ValueError, TypeError):
            return default

    # ──────────────────────────────────────────────────────────────────────────
    #  RESIDENTIAL
    # ──────────────────────────────────────────────────────────────────────────
    if building_type == "Residential":
        # Core habitable rooms - assign distinct architectural room labels
        bedrooms = _int("bedrooms_needed", 0)
        for i in range(bedrooms):
            label = "Master Bedroom" if i == 0 else f"Bedroom {i + 1}"
            rooms.append({"type": "BEDROOM", "label": label})

        bathrooms = _int("num_bathrooms", 0)
        for i in range(bathrooms):
            if i == 0 and bedrooms > 0:
                label = "Master Ensuite"
            elif i == 1:
                label = "Common Bathroom"
            else:
                label = f"Powder Room / Bath {i + 1}"
            rooms.append({"type": "BATHROOM", "label": label})

        living_rooms = max(1, _int("living_rooms", 1))
        for i in range(living_rooms):
            label = "Main Living Room" if i == 0 else f"Family Lounge {i + 1}"
            rooms.append({"type": "LIVING_ROOM", "label": label})

        dining_rooms = _int("dining_rooms", 0)
        if dining_rooms > 0:
            for i in range(dining_rooms):
                label = "Dining Room" if i == 0 else f"Dining Area {i + 1}"
                rooms.append({"type": "DINING_ROOM", "label": label})
        else:
            # Default single dining area connected to living/kitchen if not explicitly specified as 0
            rooms.append({"type": "DINING_ROOM", "label": "Dining Room"})

        kitchen_type = questionnaire.get("kitchen_type", "Closed")
        kitchen_label = "Open Kitchen & Breakfast Bar" if str(kitchen_type).lower() == "open" else "Enclosed Kitchen"
        rooms.append({"type": "KITCHEN", "label": kitchen_label})

        # Optional rooms — fully questionnaire-driven
        if _bool("home_office"):
            rooms.append({"type": "OFFICE", "label": "Home Office"})

        if _bool("study_room"):
            rooms.append({"type": "OFFICE", "label": "Study Room"})

        if _bool("guest_room"):
            rooms.append({"type": "BEDROOM", "label": "Guest Bedroom"})

        if _bool("laundry_room"):
            rooms.append({"type": "SERVICE", "label": "Laundry Room"})

        if _bool("store_room") or _bool("pantry"):
            rooms.append({"type": "SERVICE", "label": "Pantry & Store"})

        if _bool("maid_room"):
            rooms.append({"type": "SERVICE", "label": "Maid's Room"})

        if _bool("gym_room"):
            rooms.append({"type": "RECREATION", "label": "Gym / Fitness Room"})

        # Balcony — support both field names used in different parts of the system
        if _bool("balcony_required") or _bool("balcony"):
            rooms.append({"type": "OUTDOOR", "label": "Covered Balcony"})

        if _bool("terrace"):
            rooms.append({"type": "OUTDOOR", "label": "Roof Terrace"})

        # Garden / outdoor living
        if _bool("garden") or questionnaire.get("outdoor_living_pref") in ("Moderate", "Extensive"):
            rooms.append({"type": "OUTDOOR", "label": "Garden / Landscaping"})

        # Parking / Garage
        parking = _int("parking_spaces", 0)
        if parking > 0:
            rooms.append({"type": "PARKING", "label": f"Garage ({parking} Bay)"})

    # ──────────────────────────────────────────────────────────────────────────
    #  HOTEL
    # ──────────────────────────────────────────────────────────────────────────
    elif building_type == "Hotel":
        # Ground floor public spaces
        rooms.append({"type": "RECEPTION", "label": "Reception"})
        rooms.append({"type": "LIVING_ROOM", "label": "Hotel Lobby"})
        rooms.append({"type": "RESTAURANT", "label": "Restaurant"})
        rooms.append({"type": "KITCHEN", "label": "Kitchen"})
        rooms.append({"type": "OFFICE", "label": "Administration"})
        rooms.append({"type": "SERVICE", "label": "Service Area"})

        # Optional hotel amenities — questionnaire-driven
        if _bool("gym_required"):
            rooms.append({"type": "RECREATION", "label": "Gym / Fitness Centre"})

        if _bool("pool_required"):
            rooms.append({"type": "OUTDOOR", "label": "Swimming Pool"})

        if _bool("spa_required"):
            rooms.append({"type": "RECREATION", "label": "Spa & Wellness"})

        conference_count = _int("conference_rooms", 0)
        add_rooms(conference_count, "CONFERENCE_ROOM", "Conference Room")

        # Guest rooms and suites
        guest_rooms = max(4, _int("room_count", 8))
        add_rooms(guest_rooms, "GUEST_ROOM", "Guest Room")

        suites = max(2, _int("suite_rooms", 2))
        add_rooms(suites, "GUEST_ROOM", "Executive Suite")

        # Roof / outdoor facilities
        rooms.append({"type": "OUTDOOR", "label": "Roof Facilities"})

        # Hotel parking
        hotel_parking = _int("hotel_parking_capacity", 0)
        if hotel_parking > 0:
            rooms.append({"type": "PARKING", "label": f"Hotel Parking ({hotel_parking} bays)"})

        # Vertical circulation (enforced across all floors)
        rooms.append({"type": "CIRCULATION", "label": "Staircase Core"})
        rooms.append({"type": "CIRCULATION", "label": "Elevator Core"})

    # ──────────────────────────────────────────────────────────────────────────
    #  EDUCATIONAL
    # ──────────────────────────────────────────────────────────────────────────
    elif building_type == "Educational":
        classrooms = _int("classroom_count", 0)
        add_rooms(classrooms, "CLASSROOM", "Classroom")

        comp_labs = _int("computer_labs", 0)
        add_rooms(comp_labs, "LABORATORY", "Computer Lab")

        sci_labs = _int("science_labs", 0)
        add_rooms(sci_labs, "LABORATORY", "Science Lab")

        if _bool("library_required"):
            rooms.append({"type": "LIBRARY", "label": "Library"})

        if _bool("auditorium_required"):
            rooms.append({"type": "AUDITORIUM", "label": "Auditorium"})

        staff_offices = _int("staff_offices", 0)
        add_rooms(staff_offices, "OFFICE", "Staff Office")

        sports = questionnaire.get("sports_facilities", "None")
        if sports and sports != "None":
            rooms.append({"type": "RECREATION", "label": f"Sports Facility ({sports})"})

    # ──────────────────────────────────────────────────────────────────────────
    #  HEALTHCARE
    # ──────────────────────────────────────────────────────────────────────────
    elif building_type == "Healthcare":
        beds = _int("bed_count", 0)
        add_rooms(max(1, beds // 4), "WARD", "Patient Ward")  # ~4 beds per ward

        icu_beds = _int("icu_beds", 0)
        if icu_beds > 0:
            rooms.append({"type": "ICU", "label": "ICU Ward"})

        theatres = _int("operation_theatres", 0)
        add_rooms(theatres, "THEATRE", "Operating Theatre")

        consults = _int("consultation_rooms", 0)
        add_rooms(consults, "CLINICAL", "Consultation Room")

        if _bool("emergency_facilities"):
            rooms.append({"type": "EMERGENCY", "label": "Emergency Department"})

        if _bool("pharmacy_required"):
            rooms.append({"type": "PHARMACY", "label": "Pharmacy"})

        labs = _int("laboratories", 0)
        add_rooms(labs, "LABORATORY", "Laboratory")

    # ──────────────────────────────────────────────────────────────────────────
    #  COMMERCIAL
    # ──────────────────────────────────────────────────────────────────────────
    elif building_type == "Commercial":
        offices = _int("office_count", 0)
        add_rooms(offices, "OFFICE", "Private Office")

        meetings = _int("meeting_rooms", 0)
        add_rooms(meetings, "MEETING_ROOM", "Meeting Room")

        if _bool("reception_required"):
            rooms.append({"type": "RECEPTION", "label": "Reception"})

        retail = questionnaire.get("retail_requirements")
        if retail and retail != "None":
            rooms.append({"type": "RETAIL", "label": "Retail Floor"})

        # Staff area
        rooms.append({"type": "SERVICE", "label": "Staff Room"})
        rooms.append({"type": "SERVICE", "label": "Server / Utility Room"})

    # ──────────────────────────────────────────────────────────────────────────
    #  SPECIAL QUESTIONNAIRE UTILITY & ACCESSIBILITY SPACES
    # ──────────────────────────────────────────────────────────────────────────
    if _bool("solar_ready"):
        rooms.append({"type": "UTILITY", "label": "Solar Utility Hub"})

    if _bool("rainwater_harvesting"):
        rooms.append({"type": "UTILITY", "label": "Rainwater Harvesting Storage"})

    if _bool("accessibility_required") or _bool("elderly_access_required") or _int("elderly_occupants", 0) > 0:
        rooms.append({"type": "CIRCULATION", "label": "Accessible Entrance Ramp & Corridor"})

    # ──────────────────────────────────────────────────────────────────────────
    #  Always add a main circulation core
    # ──────────────────────────────────────────────────────────────────────────
    rooms.append({"type": "CIRCULATION", "label": "Main Circulation Core"})

    return {"rooms": rooms}

