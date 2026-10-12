import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

try:
    from backend.app import app
except ImportError:
    from app import app

client = TestClient(app)

def test_api_questionnaire_schema():
    response = client.get("/api/questionnaire-schema?building_type=Residential")
    assert response.status_code == 200
    data = response.json()
    assert "schema" in data
    # Check if universal fields are present
    assert any(field["key"] == "expected_occupancy" for field in data["schema"])

def test_api_dashboard_validation():
    response = client.get("/api/dashboard/validation")
    assert response.status_code == 200
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)

def test_api_building_program():
    payload = {
        "profile": {
            "building_type": "Residential",
            "bedrooms_needed": 3,
            "num_bathrooms": 2,
            "family_size": 4
        },
        "building_type": "Residential",
        "num_floors": 1
    }
    response = client.post("/api/building-program", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "building_program" in data
    assert "total_area" in data
