import json, requests, sys

url = "http://localhost:5000/api/material-specification/generate"

def run(building_type):
    payload = {
        "building_info": {
            "building_type": building_type,
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
        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        resp.raise_for_status()
        data = resp.json()
        print(f"=== {building_type} Report ===")
        # Print a summary of ML scores for each component
        for pkg, pkg_data in data.get("packages", {}).items():
            print(f"Package: {pkg}")
            for mat in pkg_data.get("materials", []):
                comp = mat.get("component")
                ml_score = mat.get("ml_confidence")
                hybrid = mat.get("hybrid_score")
                print(f"  {comp}: ML={ml_score}, Hybrid={hybrid}")
        print("---")
    except Exception as e:
        if hasattr(e, 'response') and e.response is not None:
            try:
                err = e.response.json()
            except Exception:
                err = e.response.text
            print(f"Error response for {building_type}: {err}", file=sys.stderr)
        else:
            print(f"Error for {building_type}: {e}", file=sys.stderr)

for btype in ["Residential", "Commercial", "Industrial"]:
    run(btype)
