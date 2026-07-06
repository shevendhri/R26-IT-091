import json
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

# Minimal dummy data
blueprint = {
    "total_area": 200,
    "num_floors": 2,
    "building_type": "Residential",
    "components": []
}
profile = {
    "family_size": 4,
    "bedrooms_needed": 3,
    "maintenance_pref": "low",
    "sustainability_pref": "high",
    "style_pref": "modern",
    "climate_concerns": "coastal",
    "future_expansion": "no"
}
payload = {"blueprint": blueprint, "location": "Colombo", "profile": profile}
response = client.post("/recommend-materials", json=payload)
print(json.dumps(response.json(), indent=2))
