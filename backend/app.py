import os
import sqlite3
import numpy as np
import joblib
import asyncio
import math
import logging
import traceback
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Core Logic Imports
from database import get_all_materials, format_material
from mcdm_engine import calculate_mcdm
import vision_analysis
from brain import run_ai_audit
from feasibility_validator import validate_feasibility
from spatial_ai import spatial_engine

app = FastAPI(title="GreenConstructAI Engineering Intelligence v17.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── LOAD CORE ML LOGIC ──
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "ecobuild_model.pkl")
try:
    ecobuild_model = joblib.load(MODEL_PATH)
except:
    ecobuild_model = None

class ProgramRequest(BaseModel):
    max_budget: float
    city: str
    building_type: str
    num_floors: int = 1
    sustainability_pref: Optional[str] = "Medium"
    specs: Optional[str] = ""

class RecommendationRequest(BaseModel):
    max_budget: float
    city: str
    building_type: str
    num_floors: int = 1
    sustainability_pref: Optional[str] = "Medium"
    specs: Optional[str] = ""
    rooms: Optional[dict] = None
    total_area: Optional[float] = None

def estimate_quantities_v18(program, total_area, floors, b_type):
    """
    REALISTIC QUANTITY DERIVATION v18.0 - AUDITOR GRADE
    """
    safe_floors = max(1, floors)
    footprint = total_area / safe_floors
    
    # 1. Structural Logic (m3 and kg)
    f_factor = 1.0 + (floors * 0.15)
    if b_type == "Industrial": f_factor *= 1.5
    foundation_vol = footprint * 0.65 * f_factor
    
    s_factor = 0.14 * (1.0 + (floors * 0.12))
    if b_type == "Commercial": s_factor *= 1.3
    structural_vol = total_area * s_factor
    
    rebar_kg = structural_vol * 115 # Average 115kg per m3 of concrete
    
    # 2. Enclosure & Finish Logic (m2)
    perimeter = 4 * math.sqrt(footprint)
    wall_height = {"Residential": 3.1, "Commercial": 3.8, "Industrial": 7.5}.get(b_type, 3.2)
    gross_wall_area = perimeter * wall_height * floors
    
    o_ratio = {"Residential": 0.22, "Commercial": 0.45, "Industrial": 0.10}.get(b_type, 0.20)
    opening_area = total_area * o_ratio
    wall_area = max(gross_wall_area * 0.7, gross_wall_area - opening_area)
    
    # 3. Units Assignment Logic
    return {
        "Foundation": f"{round(foundation_vol, 1)} m³",
        "Structural": f"{round(structural_vol, 1)} m³ / {round(rebar_kg, 0)} kg",
        "Walling": f"{round(wall_area, 1)} m²",
        "Roofing": f"{round(footprint * 1.4, 1)} m²",
        "Flooring": f"{round(total_area, 1)} m²",
        "Ceiling": f"{round(total_area * 0.95, 1)} m²",
        "Openings": f"{int(total_area / 25)} Units",
        "Waterproofing": f"{round((footprint + (total_area * 0.1)), 1)} m²",
        "Finishing": f"{round(wall_area * 2.2, 1)} Liters",
        "solar_allocation": f"{round(footprint * 0.6, 1)} m²",
        "footprint": round(footprint, 2),
        "total_area": round(total_area, 2)
    }

@app.post("/api/generate-program")
def generate_program(data: ProgramRequest):
    print(f"DEBUG: Received program request for {data.building_type}...")
    try:
        rates = {"Residential": 145000, "Commercial": 210000, "Industrial": 165000}
        overhead_mod = 1.25 
        mep_mod = 1.18      
        sus_mod = 1.12 if data.sustainability_pref == "High" else 1.0
        spec_mod = 1.05 if any(k in (data.specs or "").lower() for k in ["solar", "hvac", "smart"]) else 1.0
        
        effective_rate = rates.get(data.building_type, 145000) * (1.0 + (data.num_floors * 0.085))
        reserved_budget = data.max_budget / (overhead_mod * mep_mod * sus_mod * spec_mod)
        base_area = max(50, round(reserved_budget / effective_rate))
        
        # ── ARCHITECTURAL PROGRAM SCALING ──
        if data.building_type == "Residential":
            if data.max_budget < 12_000_000:
                program = {"Bedrooms": 2, "Bathrooms": 1, "Living": 1, "Kitchen": 1}
            elif data.max_budget < 25_000_000:
                program = {"Bedrooms": 3, "Bathrooms": 2, "Living": 1, "Dining": 1, "Kitchen": 1, "Verandah": 1}
            elif data.max_budget < 50_000_000:
                program = {"Bedrooms": 5, "Bathrooms": 4, "Living": 1, "Dining": 1, "Pantry": 1, "Study": 1, "Laundry": 1, "Verandah": 2}
            else: # Luxury Tier
                program = {"Bedrooms": 6, "Bathrooms": 6, "Master_Suite": 1, "Living": 2, "Dining": 1, "Modern_Kitchen": 1, "Maid_Room": 1, "Library": 1, "Laundry": 1, "Home_Office": 1}
            zones = ["Private", "Public", "Service", "Semi-Private"]
            
        elif data.building_type == "Commercial":
            units = max(1, int(base_area / 60))
            program = {
                "Lobby_Reception": 1,
                "Office_Suites": units,
                "Meeting_Rooms": max(1, int(units / 3)),
                "MEP_Central_Core": 1,
                "Service_Washrooms": max(2, int(units / 4)),
                "Vertical_Circulation": 1 if data.num_floors > 1 else 0
            }
            zones = ["Active-Retail", "Professional-Suite", "Core-Service"]
            
        else: # Industrial
            program = {
                "Production_Hall": 1,
                "Storage_Bay": max(1, int(base_area / 500)),
                "Loading_Docks": max(2, int(base_area / 1000)),
                "Admin_Block": 1,
                "Machinery_Zone": 1,
                "Safety_Exits": 4
            }
            zones = ["Heavy-Loading", "Production-Matrix", "Management"]

        return {
            "status": "success",
            "total_area": base_area,
            "program": program,
            "zones": zones,
            "floor_distribution": {f"Level {i+1}": "Zoned" for i in range(data.num_floors)}
        }
    except Exception as e:
        print(f"ERROR in generate_program: {traceback.format_exc()}")
        return {"status": "error", "message": str(e)}

@app.post("/api/recommend")
async def recommend_materials(data: RecommendationRequest):
    print(f"DEBUG: Recommendation request received for {data.city}...")
    try:
        # Resolve Program & Area dynamically
        rates = {"Residential": 145000, "Commercial": 210000, "Industrial": 165000}
        eff_rate = rates.get(data.building_type, 145000) * (1.0 + (data.num_floors * 0.08))
        base_area = max(50, round(data.max_budget / (eff_rate * 1.4)))
        
        program = {}
        if data.building_type == "Residential":
            program = {"Bedrooms": 3, "Bathrooms": 2, "Living": 1, "Kitchen": 1} if data.max_budget < 25_000_000 else {"Bedrooms": 5, "Bathrooms": 4, "Living": 2}
        elif data.building_type == "Commercial":
            program = {"Office_Suites": 4, "Lobby": 1, "MEP_Core": 1}
        else:
            program = {"Production_Hall": 1, "Admin": 1, "Storage": 1}

        total_area = data.total_area if (data.total_area or 0) > 0 else base_area
        
        # 0. QUANTITY ESTIMATION
        quantities = estimate_quantities_v18({}, total_area, data.num_floors, data.building_type)
        all_rows = get_all_materials()
        all_mats = [format_material(r) for r in all_rows]
        
        # 1. VALIDATE FEASIBILITY v18.0
        print("DEBUG: Running feasibility audit...")
        feasibility = validate_feasibility(
            budget=data.max_budget,
            b_type=data.building_type,
            floors=data.num_floors,
            city=data.city,
            sustainability_pref=data.sustainability_pref,
            total_area=total_area
        )
        
        # 2. SPATIAL LAYOUT
        spatial_layout = spatial_engine.generate_layout(
            rooms=program,
            total_area=total_area,
            floors=data.num_floors,
            b_type=data.building_type,
            query=data.specs or ""
        )

        # 3. CALCULATE MCDM
        workflow_results_raw, rejections, impact_note, climate_profile = calculate_mcdm(
            all_mats, data.city, data.building_type, data.num_floors, 
            data.max_budget, quantities, data.sustainability_pref, data.specs
        )

        ranking_package = {
            "workflow_results": workflow_results_raw,
            "rejections": rejections,
            "ai_strategy": impact_note,
            "climate_profile": climate_profile,
            "spatial_layout": spatial_layout,
            "feasibility_review": feasibility,
            "total_area": total_area,
            "budget_analysis": {
                "status": feasibility["status_label"],
                "total_cost": feasibility["total_estimated"],
                "budget_ceiling": data.max_budget
            }
        }

        return {
            "status": "success",
            "ranking": ranking_package
        }
    except Exception as e:
        print(f"ERROR in recommend_materials: {traceback.format_exc()}")
        return {"status": "error", "message": str(e)}

@app.post("/api/analyze-blueprint")
async def analyze_blueprint(
    image: UploadFile = File(...),
    instruction: str = Form(default=""),
    building_type: str = Form(default="Residential"),
):
    try:
        image_bytes = await image.read()
        processed_img_b64, feedback, recommendations = vision_analysis.process_blueprint(image_bytes, instruction, building_type)
        return {
            "status": "success",
            "annotated_image": f"data:image/jpeg;base64,{processed_img_b64}",
            "feedback": feedback,
            "recommendations": recommendations,
        }
    except Exception as e:
        print(f"ERROR in analyze_blueprint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
