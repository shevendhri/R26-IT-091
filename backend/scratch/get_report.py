import json, requests, sys

url = 'http://localhost:5000/api/material-specification/generate'
payload = {
    "building_info": {
        "building_type": "Residential",
        "floor_count": 2,
        "total_floor_area": 120,
        "wall_area": 150,
        "roof_area": 80,
        "window_area": 20,
        "door_count": 4,
        "structural_system": "Concrete Frame",
        "location": "Colombo"
    },
    "preferences": {
        "sustainability_level": "Medium",
        "maintenance_preference": "Medium",
        "architectural_style": "Modern",
        "material_priority": "Durability"
    }
}

try:
    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    data = resp.json()
    # Write pretty JSON to file for inspection
    with open('report.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
