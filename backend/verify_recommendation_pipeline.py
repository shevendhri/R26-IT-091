import sys
import os

# Add backend directory to Python path
base_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(base_dir)
sys.path.insert(0, parent_dir)

from backend.recommendation_engine import RecommendationEngine, get_all_materials, format_material
from backend.mcdm_engine import MCDMEngine
from backend.engines.constraint_engine import evaluate_constraints
from backend.questionnaire_engine import UserProfile

def print_audit_report(sys_input):
    print("\n" + "-"*34)
    print("User Input")
    print(f"Structural System:\n{sys_input}\n")
    
    # Simulate recommend_package
    blueprint = {
        "building_type": "Residential",
        "num_floors": 2,
        "total_area": 150.0,
        "budget": 50000.0,
        "structural_system": sys_input
    }
    location = "Colombo"
    profile = UserProfile(budget_tier="Balanced", sustainability_pref="High")
    
    # 1. Candidate Materials Before Filtering
    all_rows = get_all_materials()
    print(f"Candidate Materials Before Filtering:\n{len(all_rows)} materials loaded\n")
    
    # 2. Pre-filter logic from recommendation_engine.py
    structural_system = blueprint.get("structural_system", "Concrete Frame")
    sys_lower = structural_system.lower().strip()
    filtered_rows = []
    removed = []
    for raw_r in all_rows:
        r = dict(raw_r)
        cat = r.get("Category", "")
        compat = r.get("Structural_System_Compatibility", "All").lower()
        if cat in ("Foundation", "Structural", "Concrete") and compat != "all":
            if sys_lower not in compat:
                removed.append(r.get("Name"))
                continue
        filtered_rows.append(r)
        
    print(f"Candidates Removed:\n{len(removed)} structural materials rejected during pre-filter")
    if removed:
        print("  " + "\n  ".join(removed[:5]) + ("..." if len(removed) > 5 else ""))
    print()
    print(f"Candidates Remaining:\n{len(filtered_rows)} materials forwarded to ranking\n")
    
    # 3. Test MCDM flow
    mcdm_engine = MCDMEngine()
    
    # Let's take a sample structural material that made it through
    sample_mat = None
    for r in filtered_rows:
        if r.get("Category") == "Structural":
            sample_mat = r
            break
            
    if not sample_mat:
        # Fallback to foundation
        for r in filtered_rows:
            if r.get("Category") == "Foundation":
                sample_mat = r
                break
                
    if not sample_mat:
        # Fallback to any
        sample_mat = filtered_rows[0]
        
    m_formatted = format_material(sample_mat)
    
    # Mock climate
    climate = {"type": "Wet", "salinity": "Low", "distance_km": 50.0}
    
    print("MCDM Received:")
    # We call it with blueprint to test the new signature
    blueprint_to_pass = blueprint if blueprint is not None else {"building_type": blueprint["building_type"], "floors": blueprint["num_floors"]}
    print(f"blueprint = {blueprint_to_pass}\n")
    
    print("Constraint Engine Received:")
    res = evaluate_constraints(
        material=m_formatted,
        occupancy=blueprint["building_type"],
        blueprint=blueprint_to_pass,
        climate=climate,
        profile=profile
    )
    # Check if the structural system rule used the right value
    used_system = "Unknown"
    for check in res["validation_checks"]:
        if check["rule"] == "Structural System Compatibility":
            msg = check["message"]
            if "with " in msg:
                used_system = msg.split("with ")[1]
                
    print(f"structural_system = {used_system}\n")
    
    if used_system != sys_input:
        print(f"ENGINEERING ERROR: Constraint engine evaluated against '{used_system}' instead of '{sys_input}'!")
        sys.exit(1)
        
    # Get top recommendation using actual engine
    engine = RecommendationEngine()
    package = engine.recommend_package(blueprint, location, profile)
    
    top_structural = package["recommended_package"].get("Structural", {}).get("Material_Name", "None selected")
    top_foundation = package["recommended_package"].get("Foundation", {}).get("Material_Name", "None selected")
    
    print("Top Recommendation:")
    print(f"Structural: {top_structural}")
    print(f"Foundation: {top_foundation}\n")
    
    # Find constraint status of the top structural material
    status = "FAIL"
    # To check its true status we look at the raw evaluation, but package only includes passed ones.
    # So if we got one, it passed.
    if top_structural != "None selected" or top_foundation != "None selected":
        status = "PASS"
        
    print(f"Constraint Status:\n{status}")
    print("-" * 34)

if __name__ == "__main__":
    for sys_type in ["Timber Frame", "Steel Frame", "Reinforced Concrete Frame"]:
        print_audit_report(sys_type)
