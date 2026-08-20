import sys, os, json
sys.path.append(r'c:/Users/ASUS/Desktop/Material specification/backend')
sys.path.append(r'c:/Users/ASUS/Desktop/Material specification')
from backend.material_specification_engine import MaterialSpecificationEngine

engine = MaterialSpecificationEngine()

building_info = {
    "building_type": "Residential",
    "floor_count": 2,
    "total_floor_area": 200.0,
    "wall_area": 250.0,
    "roof_area": 120.0,
    "window_area": 30.0,
    "door_count": 6,
    "structural_system": "Concrete Frame",
    "location": "Colombo",
    "family_size": 4,
    "bedrooms_needed": 3,
    "climate_concerns": "",
    "future_expansion": "None",
    "budget_tier": "Balanced"
}

preferences = {
    "sustainability_level": "Medium",
    "maintenance_preference": "Medium",
    "interior_finish": "Modern",
    "exterior_finish": "Modern",
    "material_priority": "Durability",
    "architectural_style": "Modern"
}

report = engine.generate_report(building_info, preferences)
print(json.dumps(report, indent=2))
