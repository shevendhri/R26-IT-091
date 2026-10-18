"""Trace engineering score flow for a sample scenario to identify why scores are 0.0"""
import sys, os
sys.path.insert(0, r"C:\Users\ASUS\Desktop\Material specification\backend")
os.chdir(r"C:\Users\ASUS\Desktop\Material specification")

from backend.database import get_all_materials, format_material
from backend.weather_engine import get_climate_profile
from backend.mcdm_engine import mcdm_engine
from backend.questionnaire_engine import UserProfile

# 1. Setup scenario: Colombo residential
profile = UserProfile(
    family_size=4, bedrooms_needed=3, maintenance_pref="Medium",
    sustainability_pref="Medium", style_pref="Modern",
    climate_concerns="", future_expansion="None",
    budget_tier="Balanced", building_type="Residential"
)

climate = get_climate_profile("Colombo")
print(f"Climate: {climate.get('type')}, salinity={climate.get('salinity')}, distance_km={climate.get('distance_km')}")

all_rows = get_all_materials()
materials = [format_material(r) for r in all_rows]
print(f"\nTotal materials: {len(materials)}")

print("\n" + "="*80)
print("ENGINEERING SCORE TRACE:")
print("="*80)

for m in materials[:15]:
    eng_score, reasons, is_vetoed, criterion_breakdown, eng_conf, clim_conf = mcdm_engine.evaluate_material(
        m, climate, "Residential", 2, profile
    )
    print(f"\n[{m['Category']}] {m['Name']}")
    print(f"  eng_score={eng_score:.2f}, vetoed={is_vetoed}")
    print(f"  criterion_breakdown={criterion_breakdown}")
    print(f"  eng_conf={eng_conf}, clim_conf={clim_conf}")
    print(f"  reasons={reasons}")
    print(f"  RAW: Structural_Capacity={m.get('Structural_Capacity')}, Service_Life={m.get('Service_Life')}")
    print(f"       Fire_Rating={m.get('Fire_Rating', 'MISSING')}, Thermal_Rating={m.get('Thermal_Rating')}")
    print(f"       Maintenance_Level={m.get('Maintenance_Level')}, Sustainability_Rating={m.get('Sustainability_Rating')}")
