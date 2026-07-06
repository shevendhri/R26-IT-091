import pytest
from spatial_program_engine import generate_spatial_program

def test_generate_spatial_program_residential():
    inputs = {
        "building_type": "Residential",
        "bedrooms_needed": 3,
        "num_bathrooms": 2,
        "living_rooms": 1,
        "kitchen_type": "Open Plan",
        "home_office": "Yes"
    }
    result = generate_spatial_program(inputs)
    rooms = result.get("rooms", [])
    room_types = [r["type"] for r in rooms]
    assert room_types.count("BEDROOM") == 3
    assert room_types.count("BATHROOM") == 2
    assert room_types.count("OFFICE") == 1
    assert "CIRCULATION" in room_types

def test_generate_spatial_program_commercial():
    inputs = {
        "building_type": "Commercial",
        "office_count": 5,
        "meeting_rooms": 2,
        "reception_required": "Yes"
    }
    result = generate_spatial_program(inputs)
    rooms = result.get("rooms", [])
    room_types = [r["type"] for r in rooms]
    assert room_types.count("OFFICE") == 5
    assert room_types.count("MEETING_ROOM") == 2
    assert room_types.count("RECEPTION") == 1
