import requests
import json

def test_recommend():
    url = "http://localhost:5000/api/recommend"
    payload = {
        "max_budget": 5000000,
        "city": "Colombo",
        "building_type": "Residential",
        "num_floors": 1,
        "total_area": 100,
        "rooms": {"bedrooms": 3, "bathrooms": 2, "living": 1, "kitchen": 1}
    }
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        print("Status:", data.get("status"))
        if data.get("status") == "success":
            results = data.get("workflow_results", {})
            print("Phases returned:", list(results.keys()))
            for phase, mats in results.items():
                print(f"Phase {phase}: {len(mats)} materials")
        else:
            print("Error:", data.get("message"))
    except Exception as e:
        print("Failed to connect:", e)

if __name__ == "__main__":
    test_recommend()
