import pytest
from validation_engine import validate_project

def test_validation_residential_success():
    inputs = {
        "building_type": "Residential",
        "total_area": 150,
        "bedrooms_needed": 3,
        "family_size": 4,
        "num_bathrooms": 2
    }
    result = validate_project(inputs)
    assert result["validation_score"] >= 80
    assert result["severity"] == "low"

def test_validation_residential_high_severity():
    inputs = {
        "building_type": "Residential",
        "total_area": 30, # Too small for 3 bedrooms
        "bedrooms_needed": 3,
        "family_size": 10, # Too high for 1 bathroom
        "num_bathrooms": 1
    }
    result = validate_project(inputs)
    assert result["severity"] == "high"
    assert any("too small" in w.lower() for w in result["warnings"])
