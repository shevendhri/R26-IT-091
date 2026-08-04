import pytest
from blueprint_engine import blueprint_engine
from questionnaire_engine import UserProfile
from spatial_program_engine import generate_spatial_program
from building_program_engine import generate_building_program


def test_generate_blueprint():
    # Mock a building program
    building_program = {
        "rooms": [
            {"name": "Bedroom 1", "type": "BEDROOM", "zone": "private", "area": 15.0},
            {"name": "Living Room", "type": "LIVING_ROOM", "zone": "public", "area": 25.0},
            {"name": "Circulation", "type": "CIRCULATION", "zone": "circulation", "area": 10.0}
        ],
        "total_net_area": 50.0,
        "total_gross_area": 60.0
    }
    profile = UserProfile(building_type="Residential")

    result = blueprint_engine.generate_blueprint(
        building_program=building_program,
        profile=profile,
        building_type="Residential",
        num_floors=1
    )

    assert "floors_data" in result
    assert len(result["floors_data"]) == 1

    floor_0 = result["floors_data"][0]
    assert len(floor_0["rooms"]) >= 3

    # Check coords
    assert "x" in floor_0["rooms"][0]
    assert "y" in floor_0["rooms"][0]
    assert "w" in floor_0["rooms"][0]
    assert "h" in floor_0["rooms"][0]


def test_questionnaire_driven_spatial_program():
    q = {
        "building_type": "Residential",
        "bedrooms_needed": 3,
        "num_bathrooms": 2,
        "living_rooms": 1,
        "home_office": True,
        "gym_room": True,
        "solar_ready": True,
        "rainwater_harvesting": True,
        "accessibility_required": True,
        "total_area": 220.0
    }

    spatial = generate_spatial_program(q)
    room_labels = [r["label"] for r in spatial["rooms"]]

    assert "Master Bedroom" in room_labels
    assert "Bedroom 2" in room_labels
    assert "Master Ensuite" in room_labels
    assert "Common Bathroom" in room_labels
    assert "Home Office" in room_labels
    assert "Gym / Fitness Room" in room_labels
    assert "Solar Utility Hub" in room_labels
    assert "Rainwater Harvesting Storage" in room_labels

    prog = generate_building_program(spatial, q)
    assert prog["total_gross_area"] > 150.0

    profile = UserProfile(**q)
    bp = blueprint_engine.generate_blueprint(prog, profile, "Residential", num_floors=2)

    assert "floors_data" in bp
    assert len(bp["floors_data"]) == 2
    assert "disclaimer" in bp
    assert "walls" in bp
    assert "doors" in bp
    assert "windows" in bp


def test_no_upper_floor_room_duplication():
    q = {
        "building_type": "Residential",
        "bedrooms_needed": 2,
        "num_bathrooms": 2,
        "living_rooms": 1,
    }
    spatial = generate_spatial_program(q)
    prog = generate_building_program(spatial, q)
    profile = UserProfile(**q)

    bp = blueprint_engine.generate_blueprint(prog, profile, "Residential", num_floors=3)

    # Gather room labels across upper floors
    upper_room_labels = []
    for fl in bp["floors_data"][1:]:
        for r in fl["rooms"]:
            upper_room_labels.append(r["label"])

    # Ensure no generic "Main Living Room" was duplicated onto Level 2 or Level 3
    assert upper_room_labels.count("Main Living Room") == 0
