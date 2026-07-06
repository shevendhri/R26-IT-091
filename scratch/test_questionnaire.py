import requests, json
payload = {
    "building_type": "Residential",
    "family_size": 4,
    "bedrooms_needed": 3,
    "num_bathrooms": 2,
    "maintenance_pref": "Medium",
    "sustainability_pref": "Medium",
    "style_pref": "Modern",
    "climate_concerns": "None",
    "future_expansion": "None",
    "budget_tier": "Balanced",
    "elderly_occupants": 0,
    "children_count": 0,
    "parking_spaces": 1,
    "outdoor_living_pref": "Moderate",
    "material_priority": "Durability",
    "architecture_style_pref": "Modern"
}
resp = requests.post('http://127.0.0.1:5000/api/questionnaire', json=payload)
print('Status:', resp.status_code)
print('Response:', resp.text)
