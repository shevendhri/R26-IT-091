import json, requests, sys
url = 'http://localhost:5000/api/material-specification/generate'
payload = {
    "building_info": {
        "building_type": "Residential",
        "floor_count": 1,
        "total_floor_area": 100.0,
        "wall_area": 150.0,
        "roof_area": 80.0,
        "window_area": 20.0,
        "door_count": 4,
        "structural_system": "Concrete Frame",
        "location": "Colombo",
        "family_size": 4,
        "bedrooms_needed": 2,
        "climate_concerns": "",
        "future_expansion": "None",
        "budget_tier": "Balanced"
    },
    "preferences": {
        "sustainability_level": "Medium",
        "maintenance_preference": "Medium",
        "interior_finish": "Modern",
        "exterior_finish": "Modern",
        "material_priority": "Durability",
        "architectural_style": "Modern"
    }
}
resp = requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Response snippet:', resp.text[:500])
