import json, sys, os
project_root = r"C:/Users/ASUS/Desktop/Material specification"
if project_root not in sys.path:
    sys.path.insert(0, project_root)
from backend.questionnaire_engine import UserProfile
from backend.recommendation_engine import recommendation_engine

payload = {
    "buildingType": "Residential",
    "location": "Colombo",
    "floorCount": 2,
    "totalArea": 170.0,
    "structuralSystem": "Concrete Frame",
    "budgetLevel": "Balanced",
    "sustainabilityPreference": "Medium",
    "climateProfile": {},
    "buildingRequirements": {}
}

profile = UserProfile(**payload)
blueprint = {}
import traceback
try:
    result = recommendation_engine.recommend_package(blueprint, payload["location"], profile)
    print(json.dumps(result, indent=2))
except Exception as e:
    print('Error during recommendation_engine call:', e)
    traceback.print_exc()
