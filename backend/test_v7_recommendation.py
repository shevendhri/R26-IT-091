"""
V7 Full Recommendation + ML Path / Fallback Hit Counter
Tests end-to-end ML activation after joblib loader fix.
"""
import os, sys, json

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

# Patch _get_ml_score to count fallback hits before importing
import recommendation_engine as re_module

_original_get_ml_score = re_module.RecommendationEngine._get_ml_score
_fallback_hits  = {"count": 0, "ids": []}
_ml_path_count  = {"count": 0}        # NEW: counts "material_id in classes" hits

def _patched_get_ml_score(self, material_category, material_id, climate, b_type,
                           budget=0.0, floor_count=1, total_area=100.0,
                           structural_system="Concrete Frame",
                           sustainability_pref="Medium", mat=None):
    if not self.model:
        return None
    try:
        b_type_map   = {"residential": 0, "commercial": 1, "industrial": 2}
        c_zone_map   = {"extreme coastal": 0, "moderate coastal": 1, "highland": 2,
                        "dry zone": 3, "intermediate": 4}
        salinity_map = {"low": 0, "moderate": 1, "extreme": 2}
        struct_map   = {"concrete frame": 0, "steel frame": 1,
                        "load-bearing masonry": 2, "timber frame": 3}
        sus_map      = {"low": 0, "medium": 1, "high": 2}

        zone_code = 4
        city_climate = climate.get("type", "Intermediate")
        for key, val in c_zone_map.items():
            if key in city_climate.lower():
                zone_code = val
                break

        features = [[
            float(b_type_map.get(b_type.lower(), 0)),
            float(floor_count),
            float(total_area),
            float(zone_code),
            float(climate.get("humidity", 75)),
            float(climate.get("rainfall", 1500)),
            float(salinity_map.get(climate.get("salinity", "low").lower(), 0)),
            float(struct_map.get(structural_system.lower(), 0)),
            float(sus_map.get(sustainability_pref.lower(), 1))
        ]]

        if hasattr(self.model, "predict_proba"):
            target_idx = {
                "Foundation": 0, "Concrete": 0, "Structural": 0,
                "Walling": 1, "Finishing": 1,
                "Roofing": 2,
                "Windows": 3, "Doors": 3, "Openings": 3,
                "Flooring": 4, "Ceiling": 4, "Waterproofing": 4,
            }.get(material_category, 0)

            classes = self.model.classes_[target_idx]
            probs   = self.model.predict_proba(features)[target_idx][0]

            if material_id in classes:
                # ── ML PATH HIT ───────────────────────────────────────────
                _ml_path_count["count"] += 1
                idx = list(classes).index(material_id)
                return float(probs[idx] * 100)
            else:
                # ── FALLBACK HIT — count it ───────────────────────────────
                _fallback_hits["count"] += 1
                _fallback_hits["ids"].append(material_id)
                s_rating  = float(mat.get("Sustainability_Rating", 50)) if mat else 50.0
                carbon    = float(mat.get("Embodied_Carbon", 0.5)) if mat else 0.5
                heuristic = (s_rating * 0.6) + ((1.0 - min(1.0, carbon)) * 40.0)
                return max(30.0, min(100.0, heuristic))
        return 50.0
    except Exception as e:
        print(f"ML error: {e}")
        return 50.0

re_module.RecommendationEngine._get_ml_score = _patched_get_ml_score

from recommendation_engine import recommendation_engine
from questionnaire_engine import UserProfile

print("=" * 70)
print("FULL RECOMMENDATION TEST (Colombo — 3F Residential)")
print("=" * 70)

blueprint = {
    "building_type": "Residential",
    "num_floors": 3,
    "total_area": 250.0,
    "structural_system": "Concrete Frame",
    "budget": 0.0,
}
profile = UserProfile(
    sustainability_pref="High",
    budget_pref="Medium",
    location="Colombo",
)

result = recommendation_engine.recommend_package(blueprint, "Colombo", profile)

# ─── SECTION 8: Metrics ───────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("SECTION 8 — PROJECT METRICS")
print("=" * 70)
metrics = result.get("metrics", {})
print(f"  project_ml_score     : {metrics.get('project_ml_score')}")
print(f"  project_eng_score    : {metrics.get('project_eng_score')}")
print(f"  project_hybrid_score : {metrics.get('project_hybrid_score')}")
print(f"  overall_hybrid_score : {metrics.get('overall_hybrid_score')}")
print(f"  avg_sustainability   : {metrics.get('average_sustainability')}")
print(f"  avg_service_life     : {metrics.get('average_service_life')}")

# ─── SECTION 4: ML Diagnostics ───────────────────────────────────────────────
print("\n" + "=" * 70)
print("SECTION 4 — ML DIAGNOSTICS")
print("=" * 70)
ml_diag = result.get("ml_diagnostics", {})
print(f"  ml_available         : {ml_diag.get('ml_available')}")
print(f"  confidence           : {result.get('confidence')}")
print(f"  display_confidence   : {result.get('display_confidence')}")

# ─── ML Path vs Fallback counters ────────────────────────────────────────────
print("\n" + "=" * 70)
print("ML PATH vs FALLBACK COUNTER (patched scorer)")
print("=" * 70)

audit = result.get("audit_log", [])
audit_ml_hits  = sum(1 for e in audit if e.get("ml_score") is not None)
audit_eng_only = sum(1 for e in audit if e.get("ml_score") is None)

print(f"  Total materials evaluated          : {_ml_path_count['count'] + _fallback_hits['count']}")
print(f"  'material_id in classes' path hits : {_ml_path_count['count']}  ← real ML probability used")
print(f"  Heuristic fallback hits            : {_fallback_hits['count']}")
print(f"  Audit log — ML score present       : {audit_ml_hits}")
print(f"  Audit log — engineering only       : {audit_eng_only}")
if _fallback_hits["ids"]:
    print(f"  Fallback IDs                       : {sorted(set(_fallback_hits['ids']))}")
else:
    print("  Fallback IDs                       : NONE — 100% ML path used for all scored materials")

# ─── SECTION 12: Recommended Package ─────────────────────────────────────────
print("\n" + "=" * 70)
print("SECTION 12 — RECOMMENDED PACKAGE")
print("=" * 70)
pkg = result.get("recommended_package", {})
for slot, item in pkg.items():
    if item:
        ml_val = item.get('ml_score')
        ml_str = f"{ml_val:.2f}" if isinstance(ml_val, float) else str(ml_val)
        hybrid_val = item.get('score')
        hybrid_str = f"{hybrid_val:.2f}" if isinstance(hybrid_val, float) else str(hybrid_val)
        print(f"  {slot:<15}: {item.get('name','—')}")
        print(f"               eng={item.get('eng_score','?')}  ml={ml_str}  hybrid={hybrid_str}")
    else:
        print(f"  {slot:<15}: —")

# ─── Audit log ML score range (sanity check) ─────────────────────────────────
if audit:
    ml_scores = [e["ml_score"] for e in audit if e.get("ml_score") is not None]
    if ml_scores:
        print(f"\n  Audit ML score range : {min(ml_scores):.2f} – {max(ml_scores):.2f}")
        print(f"  Audit ML score mean  : {sum(ml_scores)/len(ml_scores):.2f}")
    else:
        print("\n  ⚠  No ML scores in audit log — ML is NOT active in production path")

# ─── Climate Profile ──────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("CLIMATE PROFILE")
print("=" * 70)
cp = result.get("climate_profile", {})
print(f"  city={cp.get('city')}  type={cp.get('type')}")
print(f"  salinity={cp.get('salinity')}  humidity={cp.get('humidity')}")
print(f"  exposure_level={cp.get('exposure_level')}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
