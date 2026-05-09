"""
app_blueprint.py — Spatial Intelligence Service v2.0
===================================================
Handles AI-powered blueprint analysis and annotation on Port 5001.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import traceback

app = FastAPI(title="GreenConstructAI - Spatial Intelligence Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-blueprint")
async def analyze_blueprint(
    image: UploadFile = File(...),
    userQuery: str = Form("Perform a full architectural audit.")
):
    """
    Architectural Vision Entry Point v2.0
    Executes the Spatial Intelligence Pipeline: Image -> OpenCV -> Gemini -> Annotation
    """
    try:
        image_bytes = await image.read()
        
        # Execute the new Spatial Intelligence Pipeline
        from vision.vision_analysis import process_blueprint
        annotated_image_b64, feedback, results = await process_blueprint(image_bytes, userQuery)
        
        if not annotated_image_b64:
            # Fallback if vision analysis failed
            return {"status": "error", "message": "AI Spatial Core failed to respond."}

        return {
            "status": "success",
            "spatial": results.get("issues", []),
            "suggestions": [
                {"label": "IMPROVEMENT", "desc": imp} for imp in results.get("improvements", [])
            ],
            "detected_layout": results.get("detected_layout", []),
            "engineering": " | ".join(feedback),
            "annotated_image": f"data:image/jpeg;base64,{annotated_image_b64}",
            "system_note": "Spatial Intelligence Review Complete."
        }
    except Exception as e:
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5001)
