import csv, json, time
from pathlib import Path
import sys, os
project_root = r"C:/Users/ASUS/Desktop/Material specification"
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from recommendation_engine import RecommendationEngine
from blueprint_engine import BlueprintEngine
from questionnaire_engine import process_questionnaire, UserProfile
from constraint_engine import REJECTED_MATERIALS

SCENARIOS = [
    {"scenario_id":"S001","building_type":"Residential","floors":1,"total_area":80.0,"climate":"coastal","budget":50000,"profile_flags":{"solar_ready":True,"rainwater_harvesting":False,"home_office":False,"sustainability_preference":"high"}},
    {"scenario_id":"S002","building_type":"Residential","floors":2,"total_area":130.0,"climate":"dry","budget":75000,"profile_flags":{"solar_ready":False,"rainwater_harvesting":True,"home_office":False,"sustainability_preference":"medium"}},
    {"scenario_id":"S003","building_type":"Residential","floors":4,"total_area":250.0,"climate":"moderate","budget":150000,"profile_flags":{"solar_ready":True,"rainwater_harvesting":True,"home_office":True,"sustainability_preference":"high"}},
    {"scenario_id":"S004","building_type":"Apartment","floors":5,"total_area":350.0,"climate":"dry","budget":200000,"profile_flags":{"solar_ready":True,"rainwater_harvesting":True,"home_office":True,"sustainability_preference":"high"}},
    {"scenario_id":"S005","building_type":"Commercial","floors":3,"total_area":500.0,"climate":"coastal","budget":300000,"profile_flags":{"solar_ready":False,"rainwater_harvesting":False,"home_office":True,"sustainability_preference":"low"}},
    {"scenario_id":"S006","building_type":"Office","floors":4,"total_area":600.0,"climate":"coastal","budget":350000,"profile_flags":{"solar_ready":True,"rainwater_harvesting":False,"home_office":True,"sustainability_preference":"medium"}},
    {"scenario_id":"S007","building_type":"Hotel","floors":6,"total_area":1200.0,"climate":"highland","budget":800000,"profile_flags":{"solar_ready":False,"rainwater_harvesting":True,"home_office":False,"sustainability_preference":"medium"}},
    {"scenario_id":"S008","building_type":"Hospital","floors":6,"total_area":800.0,"climate":"highland","budget":1200000,"profile_flags":{"solar_ready":False,"rainwater_harvesting":False,"home_office":False,"sustainability_preference":"low"}},
    {"scenario_id":"S009","building_type":"School","floors":3,"total_area":500.0,"climate":"moderate","budget":400000,"profile_flags":{"solar_ready":False,"rainwater_harvesting":True,"home_office":False,"sustainability_preference":"medium"}},
    {"scenario_id":"S010","building_type":"Industrial","floors":2,"total_area":1000.0,"climate":"dry","budget":600000,"profile_flags":{"solar_ready":False,"rainwater_harvesting":False,"home_office":False,"sustainability_preference":"low"}},
]
while len(SCENARIOS)<28:
    base=SCENARIOS[-1]
    new=base.copy()
    new["scenario_id"]=f"S{len(SCENARIOS)+1:03d}"
    delta=1 if len(SCENARIOS)%2==0 else -1
    new["floors"]=max(1,base["floors"]+delta)
    new["total_area"]=round(base["total_area"]* (1.05 if len(SCENARIOS)%3==0 else 0.95),2)
    flags=new["profile_flags"].copy()
    flags["solar_ready"]=not flags["solar_ready"]
    new["profile_flags"]=flags
    new["budget"]=int(base["budget"]*(1.10 if len(SCENARIOS)%4==0 else 0.90))
    SCENARIOS.append(new)

def build_user_profile(building_type,flags):
    dp={"building_type":building_type,"solar_ready":flags.get("solar_ready"),"rainwater_harvesting":flags.get("rainwater_harvesting"),"cross_ventilation":flags.get("cross_ventilation"),"home_office":flags.get("home_office"),"sustainability_preference":flags.get("sustainability_preference")}
    return process_questionnaire(dp)

def main():
    out=Path("validation_results.csv")
    # Original fields retained for backward compatibility
    fields=["scenario_id","building_type","floors","climate_type","budget","profile_flags","material_id","material_name","eng_score","ml_score","hybrid_score","response_ms","recommendation_rank","rejected_materials","constraint_reasons","explanations_json"]
    # New layout evaluation fields (flattened metrics)
    new_fields=[
        "avg_placement_success",
        "avg_space_utilization",
        "avg_circulation_score",
        "avg_functional_coverage",
        "avg_constraint_compliance",
        "avg_sustainability",
        "total_items_placed",
        "avg_design_score",
        "evaluation_version",
        "layout_explanation_json"
    ]
    fields.extend(new_fields)
    with out.open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=fields)
        w.writeheader()
        rec=RecommendationEngine()
        blueprint_engine = BlueprintEngine()
        for s in SCENARIOS:
            # Generate minimal blueprint to obtain layout evaluation metrics
            building_program = {
                "rooms": [],
                "total_gross_area": s["total_area"],
                "total_net_area": s["total_area"] * 0.9  # approximate net area
            }
            # Build user profile before generating blueprint
            prof = build_user_profile(s["building_type"], s.get("profile_flags", {}))
            blueprint_result = blueprint_engine.generate_blueprint(building_program, profile=prof, building_type=s["building_type"], num_floors=s["floors"]) if hasattr(blueprint_engine, "generate_blueprint") else {}
            layout_metrics = blueprint_result.get("layout_metrics", {})
            layout_explanation = json.dumps(blueprint_result.get("layout_metrics", {}))
            loc=s["climate"]
            # Construct climate profile dict expected by constraint engine
            climate_profile={"type": loc, "salinity": "low", "distance_km": 0.0, "humidity": 75, "rainfall": 1500}
            prof=build_user_profile(s["building_type"],s.get("profile_flags",{}))
            start=time.time()
            try:
                res=rec.recommend_package(blueprint=blueprint_result,location=loc,profile=prof,validation_severity="low")
            except Exception as e:
                print(f"Scenario {s['scenario_id']} failed: {e}")
                continue
            dur=(time.time()-start)*1000
            mats=res.get('materials',[])
            for i,entry in enumerate(mats):
                mat=entry.get('material',{})
                w.writerow({
                    "scenario_id": s["scenario_id"],
                    "building_type": s["building_type"],
                    "floors": s["floors"],
                    "climate_type": s["climate"],
                    "budget": s["budget"],
                    "profile_flags": json.dumps(s.get('profile_flags', {})),
                    "material_id": mat.get('Material_ID'),
                    "material_name": mat.get('Name'),
                    "eng_score": entry.get('eng_score'),
                    "ml_score": entry.get('ml_score'),
                    "hybrid_score": entry.get('score'),
                    "response_ms": f"{dur:.2f}",
                    "recommendation_rank": i+1,
                    "rejected_materials": json.dumps(entry.get('rejected_materials', [])),
                    "constraint_reasons": json.dumps(entry.get('constraint_reasons', [])),
                    "explanations_json": json.dumps(entry.get('recommendation_explanation', [])),
                    # New layout fields (fallback to empty if not available)
                    "avg_placement_success": layout_metrics.get("avg_placement_success", ""),
                    "avg_space_utilization": layout_metrics.get("avg_space_utilization", ""),
                    "avg_circulation_score": layout_metrics.get("avg_circulation_score", ""),
                    "avg_functional_coverage": layout_metrics.get("avg_functional_coverage", ""),
                    "avg_constraint_compliance": layout_metrics.get("avg_constraint_compliance", ""),
                    "avg_sustainability": layout_metrics.get("avg_sustainability", ""),
                    "total_items_placed": layout_metrics.get("total_items_placed", ""),
                    "avg_design_score": layout_metrics.get("avg_design_score", ""),
                    "evaluation_version": layout_metrics.get("evaluation_version", "v1.0"),
                    "layout_explanation_json": layout_explanation
                })
    # write diagnostic report for rejected materials collected by constraint engine
    diagnostics_path = Path("rejected_materials_report.json")
    with diagnostics_path.open('w',encoding='utf-8') as d:
        json.dump(REJECTED_MATERIALS, d, indent=2)
    print('Dataset written to',out.resolve())
    print('Diagnostics written to', diagnostics_path.resolve())

if __name__=='__main__':
    main()
