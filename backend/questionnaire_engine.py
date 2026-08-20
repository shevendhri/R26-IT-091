from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class UserProfile(BaseModel):
    # ── UNIVERSAL FIELDS (all building types) ─────────────────────────────────
    building_type: str = "Residential"
    family_size: int = 4
    bedrooms_needed: int = 3
    maintenance_pref: str = "Medium"       # "Low", "Medium", "High"
    sustainability_pref: str = "Medium"    # "Low", "Medium", "High"
    style_pref: str = "Modern"
    climate_concerns: str = "None"         # "Corrosion", "Extreme Heat", "Flooding", "High Humidity", "None"
    future_expansion: str = "None"         # "None", "Vertical", "Horizontal"
    budget_tier: str = "Balanced"          # "Budget", "Balanced", "Premium"

    # ── NEW OPERATIONAL PROFILE ───────────────────────────────────────────────
    expected_occupancy: Optional[int] = None
    peak_occupancy: Optional[int] = None
    operating_hours_per_day: Optional[int] = None
    traffic_intensity: Optional[str] = None
    accessibility_required: Optional[bool] = None
    elderly_access_required: Optional[bool] = None
    energy_usage_priority: Optional[str] = None

    # ── NEW ENVIRONMENTAL EXPOSURE ────────────────────────────────────────────
    coastal_environment: Optional[bool] = None
    flood_risk: Optional[str] = None
    high_wind_zone: Optional[bool] = None
    heavy_rainfall_exposure: Optional[bool] = None
    seismic_requirement: Optional[str] = None

    # ── RESIDENTIAL SPATIAL PROGRAM ───────────────────────────────────────────
    adults: Optional[int] = None
    children_count: Optional[int] = None
    elderly_occupants: Optional[int] = None

    num_bathrooms: Optional[int] = None
    living_rooms: Optional[int] = None
    dining_rooms: Optional[int] = None
    kitchen_type: Optional[str] = None          # "Open", "Closed"
    home_office: Optional[bool] = None
    study_room: Optional[bool] = None
    guest_room: Optional[bool] = None
    laundry_room: Optional[bool] = None
    store_room: Optional[bool] = None
    maid_room: Optional[bool] = None
    balcony_required: Optional[bool] = None
    parking_spaces: Optional[int] = None
    garage_type: Optional[str] = None           # "covered", "open", "basement"

    outdoor_living_pref: Optional[str] = None   # "Minimal", "Moderate", "Extensive"
    architectural_style_pref: Optional[str] = None

    # ── HOTEL SPATIAL PROGRAM ─────────────────────────────────────────────────
    hotel_category: Optional[str] = None        # "3 Star", "4 Star", "5 Star"
    room_count: Optional[int] = None
    single_rooms: Optional[int] = None
    double_rooms: Optional[int] = None
    suite_rooms: Optional[int] = None
    restaurant_capacity: Optional[int] = None
    conference_rooms: Optional[int] = None
    gym_required: Optional[bool] = None
    pool_required: Optional[bool] = None
    spa_required: Optional[bool] = None
    hotel_parking_capacity: Optional[int] = None
    staff_rooms_hotel: Optional[int] = None
    laundry_facility: Optional[bool] = None

    # Legacy hotel fields (keep for backward compat)
    star_rating_target: Optional[int] = None
    restaurants: Optional[int] = None
    conference_facilities: Optional[bool] = None
    recreational_facilities: Optional[str] = None

    # ── EDUCATIONAL SPATIAL PROGRAM ───────────────────────────────────────────
    student_count: Optional[int] = None
    classroom_count: Optional[int] = None
    computer_labs: Optional[int] = None
    science_labs: Optional[int] = None
    library_required: Optional[bool] = None
    auditorium_required: Optional[bool] = None
    staff_offices: Optional[int] = None
    edu_parking: Optional[int] = None
    sports_facilities: Optional[str] = None     # "None", "Indoor", "Outdoor", "Both"

    # Legacy educational fields
    lab_requirements: Optional[str] = None
    auditorium_requirements: Optional[bool] = None

    # ── HEALTHCARE SPATIAL PROGRAM ────────────────────────────────────────────
    bed_count: Optional[int] = None
    icu_beds: Optional[int] = None
    operation_theatres: Optional[int] = None
    consultation_rooms: Optional[int] = None
    laboratories: Optional[int] = None
    pharmacy_required: Optional[bool] = None
    emergency_facilities: Optional[bool] = None
    icu_requirements: Optional[bool] = None
    medical_equipment_loads: Optional[str] = None
    specialized_departments: Optional[List[str]] = None

    # ── COMMERCIAL SPATIAL PROGRAM ────────────────────────────────────────────
    office_count: Optional[int] = None
    meeting_rooms: Optional[int] = None
    workstation_capacity: Optional[int] = None
    reception_required: Optional[bool] = None
    commercial_parking_capacity: Optional[int] = None

    # Legacy commercial fields
    customer_capacity: Optional[int] = None
    daily_visitors: Optional[int] = None
    operating_hours: Optional[str] = None
    parking_demand: Optional[int] = None
    retail_requirements: Optional[str] = None
    security_requirements: Optional[str] = None
    hvac_requirements: Optional[str] = None

    # ── MIXED USE ─────────────────────────────────────────────────────────────
    residential_percentage: Optional[float] = None
    commercial_percentage: Optional[float] = None
    office_percentage: Optional[float] = None

    # ── INDUSTRIAL EXTRAS ─────────────────────────────────────────────────────
    production_type: Optional[str] = None
    equipment_loads: Optional[str] = None
    warehouse_area: Optional[float] = None
    fire_resistance_req: Optional[str] = None
    hazmat_storage: Optional[bool] = None
    heavy_vehicle_access: Optional[bool] = None
    expansion_requirements: Optional[str] = None
    workforce_size: Optional[int] = None

    # ── ADAPTIVE BUILDING REQUIREMENTS FIELDS ─────────────────────────────────
    solar_ready: Optional[bool] = None
    rainwater_harvesting: Optional[bool] = None
    cross_ventilation: Optional[str] = None
    natural_light: Optional[str] = None
    ai_priorities: Optional[List[str]] = None
    ai_priority_weights: Optional[Dict[str, float]] = None
    garden: Optional[bool] = None
    balcony: Optional[bool] = None
    gym_room: Optional[bool] = None


def process_questionnaire(data: dict) -> UserProfile:
    """
    Parses, validates, and refines raw questionnaire inputs into a UserProfile.
    All fields are read directly from the submitted data — no hard-coded defaults
    are injected so that the downstream Building Program Engine sees exactly what
    the user submitted.
    """
    def _int(key, default=None):
        try:
            v = data.get(key)
            return int(v) if v is not None and str(v).strip() != "" else default
        except (ValueError, TypeError):
            return default

    def _float(key, default=None):
        try:
            v = data.get(key)
            return float(v) if v is not None and str(v).strip() != "" else default
        except (ValueError, TypeError):
            return default

    def _bool(key, default=None):
        v = data.get(key)
        if v is None:
            return default
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "yes", "1")
        return bool(v)

    def _str(key, default=None):
        v = data.get(key)
        return str(v) if v is not None and str(v).strip() != "" else default

    profile = UserProfile(
        # Universal
        building_type=_str("building_type", "Residential"),
        family_size=_int("family_size", 4),
        bedrooms_needed=_int("bedrooms_needed", 3),
        maintenance_pref=_str("maintenance_pref", "Medium"),
        sustainability_pref=_str("sustainability_pref", "Medium"),
        style_pref=_str("style_pref", "Modern"),
        climate_concerns=_str("climate_concerns", "None"),
        future_expansion=_str("future_expansion", "None"),
        budget_tier=_str("budget_tier", "Balanced"),

        # Operational Profile
        expected_occupancy=_int("expected_occupancy"),
        peak_occupancy=_int("peak_occupancy"),
        operating_hours_per_day=_int("operating_hours_per_day"),
        traffic_intensity=_str("traffic_intensity"),
        accessibility_required=_bool("accessibility_required"),
        elderly_access_required=_bool("elderly_access_required"),
        energy_usage_priority=_str("energy_usage_priority"),

        # Environmental Exposure
        coastal_environment=_bool("coastal_environment"),
        flood_risk=_str("flood_risk"),
        high_wind_zone=_bool("high_wind_zone"),
        heavy_rainfall_exposure=_bool("heavy_rainfall_exposure"),
        seismic_requirement=_str("seismic_requirement"),

        # Residential spatial
        adults=_int("adults"),
        children_count=_int("children_count"),
        elderly_occupants=_int("elderly_occupants"),
        num_bathrooms=_int("num_bathrooms"),
        living_rooms=_int("living_rooms"),
        dining_rooms=_int("dining_rooms"),
        kitchen_type=_str("kitchen_type"),
        home_office=_bool("home_office"),
        study_room=_bool("study_room"),
        guest_room=_bool("guest_room"),
        laundry_room=_bool("laundry_room"),
        store_room=_bool("store_room"),
        maid_room=_bool("maid_room"),
        balcony_required=_bool("balcony_required"),
        parking_spaces=_int("parking_spaces"),
        garage_type=_str("garage_type"),
        outdoor_living_pref=_str("outdoor_living_pref"),
        architectural_style_pref=_str("architectural_style_pref"),

        # Hotel spatial
        hotel_category=_str("hotel_category"),
        room_count=_int("room_count"),
        single_rooms=_int("single_rooms"),
        double_rooms=_int("double_rooms"),
        suite_rooms=_int("suite_rooms"),
        restaurant_capacity=_int("restaurant_capacity"),
        conference_rooms=_int("conference_rooms"),
        gym_required=_bool("gym_required"),
        pool_required=_bool("pool_required"),
        spa_required=_bool("spa_required"),
        hotel_parking_capacity=_int("hotel_parking_capacity"),
        staff_rooms_hotel=_int("staff_rooms_hotel"),
        laundry_facility=_bool("laundry_facility"),
        star_rating_target=_int("star_rating_target"),
        restaurants=_int("restaurants"),
        conference_facilities=_bool("conference_facilities"),
        recreational_facilities=_str("recreational_facilities"),

        # Educational spatial
        student_count=_int("student_count"),
        classroom_count=_int("classroom_count"),
        computer_labs=_int("computer_labs"),
        science_labs=_int("science_labs"),
        library_required=_bool("library_required"),
        auditorium_required=_bool("auditorium_required"),
        staff_offices=_int("staff_offices"),
        edu_parking=_int("edu_parking"),
        sports_facilities=_str("sports_facilities"),
        lab_requirements=_str("lab_requirements"),
        auditorium_requirements=_bool("auditorium_requirements"),

        # Healthcare spatial
        bed_count=_int("bed_count"),
        icu_beds=_int("icu_beds"),
        operation_theatres=_int("operation_theatres"),
        consultation_rooms=_int("consultation_rooms"),
        laboratories=_int("laboratories"),
        pharmacy_required=_bool("pharmacy_required"),
        emergency_facilities=_bool("emergency_facilities"),
        icu_requirements=_bool("icu_requirements"),
        medical_equipment_loads=_str("medical_equipment_loads"),
        specialized_departments=data.get("specialized_departments"),

        # Commercial spatial
        office_count=_int("office_count"),
        meeting_rooms=_int("meeting_rooms"),
        workstation_capacity=_int("workstation_capacity"),
        reception_required=_bool("reception_required"),
        commercial_parking_capacity=_int("commercial_parking_capacity"),
        customer_capacity=_int("customer_capacity"),
        daily_visitors=_int("daily_visitors"),
        operating_hours=_str("operating_hours"),
        parking_demand=_int("parking_demand"),
        retail_requirements=_str("retail_requirements"),
        security_requirements=_str("security_requirements"),
        hvac_requirements=_str("hvac_requirements"),

        # Mixed use
        residential_percentage=_float("residential_percentage"),
        commercial_percentage=_float("commercial_percentage"),
        office_percentage=_float("office_percentage"),

        # Industrial
        production_type=_str("production_type"),
        equipment_loads=_str("equipment_loads"),
        warehouse_area=_float("warehouse_area"),
        fire_resistance_req=_str("fire_resistance_req"),
        hazmat_storage=_bool("hazmat_storage"),
        heavy_vehicle_access=_bool("heavy_vehicle_access"),
        expansion_requirements=_str("expansion_requirements"),
        workforce_size=_int("workforce_size"),

        # Adaptive building requirements fields
        solar_ready=_bool("solar_ready"),
        rainwater_harvesting=_bool("rainwater_harvesting"),
        cross_ventilation=_str("cross_ventilation"),
        natural_light=_str("natural_light"),
        ai_priorities=data.get("ai_priorities"),
        ai_priority_weights=data.get("ai_priority_weights"),
        garden=_bool("garden"),
        balcony=_bool("balcony"),
        gym_room=_bool("gym_room"),
    )
    return profile


# ── QUESTIONNAIRE SCHEMAS (dynamic field definitions per building type) ─────────
QUESTIONNAIRE_SCHEMAS: Dict[str, List[Dict[str, Any]]] = {
    "Residential": [
        # Occupancy
        {"key": "family_size",       "label": "Total Family Size (Occupants)",  "type": "number", "min": 1,  "max": 20, "default": 4,  "section": "Occupancy"},
        {"key": "adults",            "label": "Number of Adults",               "type": "number", "min": 1,  "max": 15, "default": 2,  "section": "Occupancy"},
        {"key": "children_count",    "label": "Number of Children",             "type": "number", "min": 0,  "max": 10, "default": 2,  "section": "Occupancy"},
        {"key": "elderly_occupants", "label": "Elderly / Mobility-Limited Persons", "type": "number", "min": 0, "max": 10, "default": 0, "section": "Occupancy"},
        # Spatial Program
        {"key": "bedrooms_needed",   "label": "Bedrooms Required",              "type": "number", "min": 1,  "max": 10, "default": 3,  "section": "Spatial Program"},
        {"key": "num_bathrooms",     "label": "Bathrooms Required",             "type": "number", "min": 1,  "max": 8,  "default": 2,  "section": "Spatial Program"},
        {"key": "living_rooms",      "label": "Living Rooms",                   "type": "number", "min": 1,  "max": 3,  "default": 1,  "section": "Spatial Program"},
        {"key": "dining_rooms",      "label": "Dining Rooms",                   "type": "number", "min": 0,  "max": 2,  "default": 1,  "section": "Spatial Program"},
        {"key": "kitchen_type",      "label": "Kitchen Type",                   "type": "select", "options": ["Open Plan", "Closed / Separate"], "default": "Open Plan", "section": "Spatial Program"},
        # Optional Rooms
        {"key": "home_office",       "label": "Home Office Needed?",            "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Optional Rooms"},
        {"key": "study_room",        "label": "Study Room Needed?",             "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Optional Rooms"},
        {"key": "guest_room",        "label": "Guest Room Needed?",             "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Optional Rooms"},
        {"key": "maid_room",         "label": "Maid's Room?",                   "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Optional Rooms"},
        {"key": "laundry_room",      "label": "Laundry Room?",                  "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Optional Rooms"},
        {"key": "store_room",        "label": "Store Room?",                    "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Optional Rooms"},
        {"key": "balcony_required",  "label": "Balcony Required?",              "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Optional Rooms"},
        # Parking
        {"key": "parking_spaces",    "label": "Parking Spaces",                 "type": "number", "min": 0,  "max": 6,  "default": 2,  "section": "Parking"},
        {"key": "garage_type",       "label": "Garage Type",                    "type": "select", "options": ["None", "Open Carport", "Covered", "Basement"], "default": "Covered", "section": "Parking"},
        # Preferences
        {"key": "outdoor_living_pref","label": "Outdoor Living Preference",     "type": "select", "options": ["Minimal", "Moderate", "Extensive"], "default": "Moderate", "section": "Preferences"},
        {"key": "future_expansion",  "label": "Expansion Strategy",             "type": "select", "options": ["None", "Vertical", "Horizontal"], "default": "None", "section": "Preferences"},
        {"key": "sustainability_pref","label": "Sustainability Priority",        "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "style_pref",        "label": "Architectural Style",            "type": "select", "options": ["Modern", "Contemporary", "Traditional Sri Lankan", "Tropical", "Minimalist", "Luxury Villa", "Colonial", "Industrial"], "default": "Modern", "section": "Preferences"},
        {"key": "maintenance_pref",  "label": "Maintenance Tolerance",          "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "climate_concerns",  "label": "Primary Climate Concerns",       "type": "select", "options": ["None", "Corrosion", "Extreme Heat", "Flooding", "High Humidity"], "default": "None", "section": "Preferences"},
        {"key": "budget_tier",       "label": "Budget Tier",                    "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Balanced", "section": "Preferences"},
    ],

    "Hotel": [
        # Hotel Category
        {"key": "hotel_category",        "label": "Hotel Category",             "type": "select", "options": ["3 Star", "4 Star", "5 Star"], "default": "4 Star", "section": "Hotel Classification"},
        # Guest Rooms
        {"key": "room_count",            "label": "Total Number of Guest Rooms","type": "number", "min": 10, "max": 1000, "default": 80, "section": "Guest Rooms"},
        {"key": "single_rooms",          "label": "Single Rooms",               "type": "number", "min": 0,  "max": 500,  "default": 30, "section": "Guest Rooms"},
        {"key": "double_rooms",          "label": "Double Rooms",               "type": "number", "min": 0,  "max": 500,  "default": 40, "section": "Guest Rooms"},
        {"key": "suite_rooms",           "label": "Suites",                     "type": "number", "min": 0,  "max": 100,  "default": 10, "section": "Guest Rooms"},
        # Facilities
        {"key": "restaurant_capacity",   "label": "Restaurant Seating Capacity","type": "number", "min": 0,  "max": 1000, "default": 120, "section": "F&B & Facilities"},
        {"key": "restaurants",           "label": "Number of Restaurants",      "type": "number", "min": 0,  "max": 10,   "default": 2,   "section": "F&B & Facilities"},
        {"key": "conference_rooms",      "label": "Conference Rooms",           "type": "number", "min": 0,  "max": 20,   "default": 2,   "section": "Meetings"},
        {"key": "gym_required",          "label": "Gym / Fitness Centre?",      "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Recreation"},
        {"key": "pool_required",         "label": "Swimming Pool?",             "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Recreation"},
        {"key": "spa_required",          "label": "Spa & Wellness?",            "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Recreation"},
        # Operations
        {"key": "hotel_parking_capacity","label": "Parking Spaces",             "type": "number", "min": 0,  "max": 500,  "default": 80, "section": "Operations"},
        {"key": "staff_rooms_hotel",     "label": "Staff Accommodation Rooms",  "type": "number", "min": 0,  "max": 200,  "default": 20, "section": "Operations"},
        {"key": "laundry_facility",      "label": "Laundry Facility Required?", "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Operations"},
        # Preferences
        {"key": "sustainability_pref",   "label": "Sustainability Priority",    "type": "select", "options": ["Low", "Medium", "High"], "default": "High", "section": "Preferences"},
        {"key": "style_pref",            "label": "Architectural Style",        "type": "select", "options": ["Modern", "Contemporary", "Tropical", "Colonial", "Luxury Villa"], "default": "Tropical", "section": "Preferences"},
        {"key": "maintenance_pref",      "label": "Maintenance Tolerance",      "type": "select", "options": ["Low", "Medium", "High"], "default": "High", "section": "Preferences"},
        {"key": "budget_tier",           "label": "Budget Tier",                "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Premium", "section": "Preferences"},
        {"key": "climate_concerns",      "label": "Primary Climate Concerns",   "type": "select", "options": ["None", "Corrosion", "Extreme Heat", "Flooding", "High Humidity"], "default": "None", "section": "Preferences"},
        {"key": "future_expansion",      "label": "Expansion Strategy",         "type": "select", "options": ["None", "Vertical", "Horizontal"], "default": "None", "section": "Preferences"},
    ],

    "Educational": [
        # Capacity
        {"key": "student_count",      "label": "Total Student Capacity",        "type": "number", "min": 50,  "max": 5000, "default": 500, "section": "Capacity"},
        {"key": "classroom_count",    "label": "Number of Classrooms",          "type": "number", "min": 5,   "max": 100,  "default": 20,  "section": "Capacity"},
        {"key": "staff_offices",      "label": "Staff Offices / Rooms",         "type": "number", "min": 1,   "max": 50,   "default": 10,  "section": "Capacity"},
        # Labs
        {"key": "computer_labs",      "label": "Computer Labs",                 "type": "number", "min": 0,   "max": 10,   "default": 2,   "section": "Laboratories"},
        {"key": "science_labs",       "label": "Science Labs",                  "type": "number", "min": 0,   "max": 10,   "default": 3,   "section": "Laboratories"},
        # Facilities
        {"key": "library_required",   "label": "Library Required?",             "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Facilities"},
        {"key": "auditorium_required","label": "Auditorium Required?",           "type": "select", "options": ["No", "Yes"], "default": "No",  "section": "Facilities"},
        {"key": "sports_facilities",  "label": "Sports Facilities",             "type": "select", "options": ["None", "Indoor", "Outdoor", "Both"], "default": "Outdoor", "section": "Facilities"},
        {"key": "edu_parking",        "label": "Parking Spaces",                "type": "number", "min": 0,   "max": 500,  "default": 50,  "section": "Infrastructure"},
        # Preferences
        {"key": "sustainability_pref","label": "Sustainability Priority",        "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "style_pref",         "label": "Architectural Style",           "type": "select", "options": ["Modern", "Contemporary", "Traditional Sri Lankan"], "default": "Modern", "section": "Preferences"},
        {"key": "maintenance_pref",   "label": "Maintenance Tolerance",         "type": "select", "options": ["Low", "Medium", "High"], "default": "Low", "section": "Preferences"},
        {"key": "budget_tier",        "label": "Budget Tier",                   "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Budget", "section": "Preferences"},
        {"key": "future_expansion",   "label": "Expansion Strategy",            "type": "select", "options": ["None", "Vertical", "Horizontal"], "default": "Horizontal", "section": "Preferences"},
        {"key": "climate_concerns",   "label": "Primary Climate Concerns",      "type": "select", "options": ["None", "Corrosion", "Extreme Heat", "Flooding", "High Humidity"], "default": "None", "section": "Preferences"},
    ],

    "Healthcare": [
        # Ward & Beds
        {"key": "bed_count",             "label": "Total Bed Capacity",         "type": "number", "min": 5,  "max": 2000, "default": 100, "section": "Beds & Wards"},
        {"key": "icu_beds",              "label": "ICU Beds",                   "type": "number", "min": 0,  "max": 200,  "default": 10,  "section": "Beds & Wards"},
        # Clinical Spaces
        {"key": "operation_theatres",    "label": "Operating Theatres",         "type": "number", "min": 0,  "max": 20,   "default": 3,   "section": "Clinical"},
        {"key": "consultation_rooms",    "label": "Consultation Rooms",         "type": "number", "min": 1,  "max": 50,   "default": 10,  "section": "Clinical"},
        {"key": "laboratories",          "label": "Pathology / Clinical Labs",  "type": "number", "min": 0,  "max": 10,   "default": 2,   "section": "Clinical"},
        # Departments
        {"key": "emergency_facilities",  "label": "Emergency Department (A&E)?","type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Departments"},
        {"key": "pharmacy_required",     "label": "Pharmacy Required?",         "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Departments"},
        {"key": "medical_equipment_loads","label": "Medical Equipment Level",   "type": "select", "options": ["Standard Clinic", "Heavy Imaging (MRI/CT)", "Full ICU Suite"], "default": "Standard Clinic", "section": "Equipment"},
        # Preferences
        {"key": "sustainability_pref",   "label": "Sustainability Priority",    "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "style_pref",            "label": "Architectural Style",        "type": "select", "options": ["Modern", "Contemporary"], "default": "Modern", "section": "Preferences"},
        {"key": "maintenance_pref",      "label": "Maintenance Tolerance",      "type": "select", "options": ["Low", "Medium", "High"], "default": "Low", "section": "Preferences"},
        {"key": "budget_tier",           "label": "Budget Tier",                "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Balanced", "section": "Preferences"},
        {"key": "future_expansion",      "label": "Expansion Strategy",         "type": "select", "options": ["None", "Vertical", "Horizontal"], "default": "Horizontal", "section": "Preferences"},
        {"key": "climate_concerns",      "label": "Primary Climate Concerns",   "type": "select", "options": ["None", "Corrosion", "Extreme Heat", "Flooding", "High Humidity"], "default": "None", "section": "Preferences"},
    ],

    "Commercial": [
        # Capacity
        {"key": "workstation_capacity",     "label": "Workstation / Desk Capacity",  "type": "number", "min": 5,  "max": 2000, "default": 100, "section": "Capacity"},
        {"key": "customer_capacity",        "label": "Customer Capacity",            "type": "number", "min": 0,  "max": 5000, "default": 200, "section": "Capacity"},
        # Offices & Meeting Rooms
        {"key": "office_count",             "label": "Private Offices",              "type": "number", "min": 0,  "max": 100,  "default": 10,  "section": "Office Spaces"},
        {"key": "meeting_rooms",            "label": "Meeting Rooms",                "type": "number", "min": 0,  "max": 30,   "default": 5,   "section": "Office Spaces"},
        {"key": "reception_required",       "label": "Reception / Front Desk?",      "type": "select", "options": ["No", "Yes"], "default": "Yes", "section": "Office Spaces"},
        # Visitors & Operations
        {"key": "daily_visitors",           "label": "Daily Visitors",               "type": "number", "min": 0,  "max": 10000,"default": 300,  "section": "Operations"},
        {"key": "operating_hours",          "label": "Operating Hours",              "type": "select", "options": ["8–18", "8–22", "24h", "Shift-based"], "default": "8–18", "section": "Operations"},
        {"key": "retail_requirements",      "label": "Retail Requirements",          "type": "select", "options": ["None", "Showroom", "Retail Floor", "Mixed-Use"], "default": "None", "section": "Operations"},
        {"key": "security_requirements",    "label": "Security Requirements",        "type": "select", "options": ["Standard", "Enhanced", "High Security"], "default": "Standard", "section": "Operations"},
        {"key": "hvac_requirements",        "label": "HVAC Requirements",            "type": "select", "options": ["Standard", "Enhanced VRF", "Precision Climate Control"], "default": "Standard", "section": "Operations"},
        # Parking
        {"key": "commercial_parking_capacity","label": "Parking Spaces",             "type": "number", "min": 0,  "max": 1000, "default": 100, "section": "Parking"},
        # Preferences
        {"key": "sustainability_pref",      "label": "Sustainability Priority",      "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "style_pref",               "label": "Architectural Style",          "type": "select", "options": ["Modern", "Contemporary", "Minimalist", "Industrial"], "default": "Modern", "section": "Preferences"},
        {"key": "maintenance_pref",         "label": "Maintenance Tolerance",        "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "budget_tier",              "label": "Budget Tier",                  "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Balanced", "section": "Preferences"},
        {"key": "future_expansion",         "label": "Expansion Strategy",           "type": "select", "options": ["None", "Vertical", "Horizontal"], "default": "None", "section": "Preferences"},
    ],

    "Mixed-Use": [
        {"key": "residential_percentage",  "label": "Residential %",             "type": "number", "min": 0, "max": 100, "default": 40, "section": "Mix Proportions"},
        {"key": "commercial_percentage",   "label": "Commercial / Retail %",     "type": "number", "min": 0, "max": 100, "default": 40, "section": "Mix Proportions"},
        {"key": "office_percentage",       "label": "Office %",                  "type": "number", "min": 0, "max": 100, "default": 20, "section": "Mix Proportions"},
        {"key": "sustainability_pref",     "label": "Sustainability Priority",   "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Preferences"},
        {"key": "style_pref",              "label": "Architectural Style",       "type": "select", "options": ["Modern", "Contemporary", "Minimalist"], "default": "Modern", "section": "Preferences"},
        {"key": "budget_tier",             "label": "Budget Tier",               "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Balanced", "section": "Preferences"},
        {"key": "climate_concerns",        "label": "Primary Climate Concerns",  "type": "select", "options": ["None", "Corrosion", "Extreme Heat", "Flooding", "High Humidity"], "default": "None", "section": "Preferences"},
    ],

    "Industrial": [
        {"key": "workforce_size",       "label": "Workforce Size (Workers)",      "type": "number", "min": 1, "max": 5000, "default": 50,  "section": "Workforce"},
        {"key": "production_type",      "label": "Production Type",               "type": "select", "options": ["Light Manufacturing", "Heavy Industry", "Clean Room", "Food Processing", "Logistics / Warehousing"], "default": "Light Manufacturing", "section": "Production"},
        {"key": "equipment_loads",      "label": "Equipment Loads",               "type": "select", "options": ["Light", "Medium", "Heavy"], "default": "Medium", "section": "Production"},
        {"key": "warehouse_area",       "label": "Warehouse Area Required (m²)",  "type": "number", "min": 100, "max": 20000, "default": 500, "section": "Production"},
        {"key": "fire_resistance_req",  "label": "Fire Resistance Requirement",   "type": "select", "options": ["Standard", "Enhanced", "Fire Rated 2Hr", "NFPA Compliant"], "default": "Standard", "section": "Safety"},
        {"key": "hazmat_storage",       "label": "Hazardous Material Storage",    "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Safety"},
        {"key": "heavy_vehicle_access", "label": "Heavy Vehicle Access (Loading Bay)", "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Infrastructure"},
        {"key": "expansion_requirements","label": "Expansion Requirements",       "type": "select", "options": ["None", "Vertical", "Horizontal", "Phase 2 Expansion"], "default": "None", "section": "Infrastructure"},
        {"key": "sustainability_pref",  "label": "Sustainability Priority",        "type": "select", "options": ["Low", "Medium", "High"], "default": "Low", "section": "Preferences"},
        {"key": "style_pref",           "label": "Architectural Style",           "type": "select", "options": ["Industrial", "Modern", "Contemporary"], "default": "Industrial", "section": "Preferences"},
        {"key": "maintenance_pref",     "label": "Maintenance Tolerance",         "type": "select", "options": ["Low", "Medium", "High"], "default": "High", "section": "Preferences"},
        {"key": "budget_tier",          "label": "Budget Tier",                   "type": "select", "options": ["Budget", "Balanced", "Premium"], "default": "Budget", "section": "Preferences"},
        {"key": "climate_concerns",     "label": "Primary Climate Concerns",      "type": "select", "options": ["None", "Corrosion", "Extreme Heat", "Flooding", "High Humidity"], "default": "None", "section": "Preferences"},
    ],
}


OPERATIONAL_PROFILE_SCHEMA = [
    {"key": "expected_occupancy", "label": "Expected Average Occupancy", "type": "number", "min": 0, "max": 10000, "default": 0, "section": "Operational Profile"},
    {"key": "peak_occupancy", "label": "Peak Occupancy", "type": "number", "min": 0, "max": 10000, "default": 0, "section": "Operational Profile"},
    {"key": "operating_hours_per_day", "label": "Operating Hours / Day", "type": "number", "min": 1, "max": 24, "default": 8, "section": "Operational Profile"},
    {"key": "traffic_intensity", "label": "Traffic Intensity", "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium", "section": "Operational Profile"},
    {"key": "accessibility_required", "label": "Accessibility Required?", "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Operational Profile"},
    {"key": "elderly_access_required", "label": "Elderly Access Required?", "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Operational Profile"},
    {"key": "energy_usage_priority", "label": "Energy Usage Priority", "type": "select", "options": ["Standard", "Efficiency Optimized", "Net Zero"], "default": "Standard", "section": "Operational Profile"},
]

ENVIRONMENTAL_EXPOSURE_SCHEMA = [
    {"key": "coastal_environment", "label": "Coastal Environment?", "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Environmental Exposure"},
    {"key": "flood_risk", "label": "Flood Risk", "type": "select", "options": ["Low", "Medium", "High"], "default": "Low", "section": "Environmental Exposure"},
    {"key": "high_wind_zone", "label": "High Wind Zone?", "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Environmental Exposure"},
    {"key": "heavy_rainfall_exposure", "label": "Heavy Rainfall Exposure?", "type": "select", "options": ["No", "Yes"], "default": "No", "section": "Environmental Exposure"},
    {"key": "seismic_requirement", "label": "Seismic Requirement", "type": "select", "options": ["Standard", "Enhanced"], "default": "Standard", "section": "Environmental Exposure"},
]

def get_questionnaire_schema(building_type: str) -> List[Dict[str, Any]]:
    """Return the appropriate field schema for a given building type."""
    base_schema = QUESTIONNAIRE_SCHEMAS.get(building_type, QUESTIONNAIRE_SCHEMAS["Residential"])
    return base_schema + OPERATIONAL_PROFILE_SCHEMA + ENVIRONMENTAL_EXPOSURE_SCHEMA


def generate_audit_trail(profile: UserProfile) -> Dict[str, Any]:
    """
    Maps questionnaire answers to their direct architectural/engineering impact.
    Adapts to building type.
    """
    bt = profile.building_type
    audit_trail = []

    # Universal entries
    audit_trail.append({
        "question": "Architectural Style",
        "answer": profile.style_pref,
        "impact": "Configures structural envelope shape, roof pitch, columns, verandah depth, and visual textures."
    })
    audit_trail.append({
        "question": "Sustainability Focus",
        "answer": profile.sustainability_pref,
        "impact": "Prioritizes low embodied-carbon materials (CSEB, bamboo) when High. Enables green roof scoring."
    })
    audit_trail.append({
        "question": "Maintenance Tolerance",
        "answer": profile.maintenance_pref,
        "impact": "Vetoes or penalizes short-life materials (< 25 yr) when Low. Boosts aluminium and RC specifications."
    })
    audit_trail.append({
        "question": "Budget Tier",
        "answer": profile.budget_tier,
        "impact": "Sets cost ceiling for doors, floors, and luxury finishes. Premium unlocks full aluminium glazing."
    })
    audit_trail.append({
        "question": "Climate Concerns",
        "answer": profile.climate_concerns,
        "impact": "Triggers corrosion-resistant specs, elevated plinth, and wider roof overhangs for coastal zones."
    })

    if bt == "Residential":
        audit_trail.append({"question": "Family Size",      "answer": str(profile.family_size),       "impact": "Scales bathroom count and habitable area per person."})
        audit_trail.append({"question": "Bedrooms",         "answer": str(profile.bedrooms_needed),   "impact": "Drives bedroom room count and total floor area."})
        if profile.num_bathrooms:
            audit_trail.append({"question": "Bathrooms",    "answer": str(profile.num_bathrooms),     "impact": "Sets bathroom count; one bathroom per 2–3 bedrooms is the threshold."})
        if profile.home_office:
            audit_trail.append({"question": "Home Office",  "answer": "Yes",                          "impact": "Adds dedicated office room to the building program."})
        if profile.elderly_occupants:
            audit_trail.append({"question": "Elderly Occupants", "answer": str(profile.elderly_occupants), "impact": "Adds wider corridors (1.2m), no-step thresholds, and ground-floor bedroom priority."})
        audit_trail.append({"question": "Parking Spaces",   "answer": str(profile.parking_spaces),    "impact": "Sizes garage footprint; covered type adds structural overhead."})

    elif bt == "Hotel":
        audit_trail.append({"question": "Hotel Category",   "answer": str(profile.hotel_category),    "impact": "Determines room sizes, finish quality, and required amenities."})
        audit_trail.append({"question": "Room Count",       "answer": str(profile.room_count),        "impact": "Sets guest room module count and corridor layout."})
        if profile.pool_required:
            audit_trail.append({"question": "Pool",         "answer": "Yes",                          "impact": "Adds wet zone engineering; pool area and plant room required."})
        if profile.conference_rooms:
            audit_trail.append({"question": "Conference Rooms", "answer": str(profile.conference_rooms), "impact": "Adds conference wing with AV infrastructure and divisible partitions."})

    elif bt == "Educational":
        audit_trail.append({"question": "Student Count",    "answer": str(profile.student_count),    "impact": "Scales classroom count, toilet provision, and canteen area."})
        audit_trail.append({"question": "Classroom Count",  "answer": str(profile.classroom_count),  "impact": "Sets primary room count and corridor length."})
        if profile.auditorium_required:
            audit_trail.append({"question": "Auditorium",   "answer": "Yes",                          "impact": "Adds multi-span auditorium block with stage and tiered seating."})

    elif bt == "Healthcare":
        audit_trail.append({"question": "Bed Count",        "answer": str(profile.bed_count),        "impact": "Scales ward blocks, nursing stations, and utility areas."})
        if profile.emergency_facilities:
            audit_trail.append({"question": "Emergency Dept", "answer": "Yes",                       "impact": "Adds A&E zone with 24h access, resuscitation bays, and trauma rooms."})
        if profile.operation_theatres:
            audit_trail.append({"question": "Operating Theatres", "answer": str(profile.operation_theatres), "impact": "Each theatre requires ~60m², laminar flow, and dedicated scrub area."})

    elif bt == "Commercial":
        audit_trail.append({"question": "Workstations",     "answer": str(profile.workstation_capacity), "impact": "Sizes open-plan floor plates at 6–8m² per workstation."})
        if profile.meeting_rooms:
            audit_trail.append({"question": "Meeting Rooms","answer": str(profile.meeting_rooms),    "impact": "Each meeting room adds ~20m² to the building program."})

    return {"audit_trail": audit_trail}
