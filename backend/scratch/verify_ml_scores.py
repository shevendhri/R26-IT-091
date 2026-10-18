import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from recommendation_engine import recommendation_engine
from questionnaire_engine import UserProfile

blueprint = {
    "building_type": "Residential",
    "num_floors": 2,
    "total_area": 120.0,
    "structural_system": "Concrete Frame"
}

profile = UserProfile(
    family_size=4,
    bedrooms_needed=3,
    maintenance_pref="Medium",
    sustainability_pref="Medium",
    style_pref="Modern",
    climate_concerns="",
    future_expansion="None",
    budget_tier="Balanced"
)

location = "Colombo"

print("Running recommend_package...")
result = recommendation_engine.recommend_package(blueprint, location, profile)

print(f"\nStatus: {result['status']}")
print(f"\n{'='*70}")
print("PROJECT METRICS")
print(f"{'='*70}")
metrics = result.get("metrics", {})
print(f"  project_eng_score:    {metrics.get('project_eng_score')}")
print(f"  project_ml_score:     {metrics.get('project_ml_score')}")
print(f"  project_hybrid_score: {metrics.get('project_hybrid_score')}")
print(f"  overall_hybrid_score: {metrics.get('overall_hybrid_score')}")
print(f"  confidence:           {result.get('confidence')}")

print(f"\n{'='*70}")
print("SECTION 4 — RECOMMENDED PACKAGE: ml_score per component")
print(f"{'='*70}")
recs = result.get("recommended_package", {})
print(f"{'Component':<20} {'Material':<45} {'eng':>5} {'ml':>5} {'hybrid':>7}")
print("-" * 85)
for key, item in recs.items():
    if item and isinstance(item, dict):
        name = item.get("name", "N/A")[:42]
        eng  = item.get("eng_score")
        ml   = item.get("ml_score")
        hyb  = item.get("score")
        print(f"{key:<20} {name:<45} {str(eng):>5} {str(ml):>5} {str(hyb):>7}")
    else:
        print(f"{key:<20} {'(no data)':<45}")

print(f"\n{'='*70}")
print("SECTION 12 — AUDIT LOG: first 20 rows")
print(f"{'='*70}")
audit = result.get("audit_log", [])
print(f"Total audit entries: {len(audit)}")
print(f"\n{'Category':<18} {'Item':<40} {'ML':>6} {'Eng':>6} {'Hybrid':>8} {'Rank':>5}")
print("-" * 88)
for log in audit[:20]:
    cat  = str(log.get("category", ""))[:17]
    name = str(log.get("item_name", ""))[:38]
    ml   = log.get("ml_score")
    eng  = log.get("engineering_score")
    hyb  = log.get("hybrid_score")
    rank = log.get("ranking")
    print(f"{cat:<18} {name:<40} {str(ml):>6} {str(eng):>6} {str(hyb):>8} {str(rank):>5}")

# Check for any remaining 45s
print(f"\n{'='*70}")
print("CONSTANT-45 AUDIT")
print(f"{'='*70}")
ml_vals = [log.get("ml_score") for log in audit if log.get("ml_score") is not None]
count_45 = sum(1 for v in ml_vals if v == 45 or v == 45.0)
unique_vals = sorted(set(round(v, 1) for v in ml_vals))
print(f"  Total audit ML scores:   {len(ml_vals)}")
print(f"  Entries with ml=45:      {count_45}")
print(f"  Unique ML score values:  {unique_vals}")
if count_45 == 0:
    print("\n  ✅ CONFIRMED: No constant 45 values. Bug is fixed.")
else:
    print(f"\n  ❌ Still {count_45} entries with ml=45. Bug not fully fixed.")
