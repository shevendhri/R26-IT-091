import pytest
from blueprint_engine import blueprint_engine
from questionnaire_engine import UserProfile
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
    assert len(floor_0["rooms"]) == 3
    
    # Check coords
    assert "x" in floor_0["rooms"][0]
    assert "y" in floor_0["rooms"][0]
    assert "w" in floor_0["rooms"][0]
    assert "h" in floor_0["rooms"][0]
