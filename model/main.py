from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import base64
from typing import List

from svg_parser import count_from_svg, draw_overlay
# from predictor import predict_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Plan Analyzer ML Service is running"}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):

    counts = {
        "room": 5,
        "wall": 12,
        "door": 4,
        "window": 6,
        "low_confidence": False
    }
    return counts


@app.post("/parse")
async def parse(png: UploadFile = File(...), svg: UploadFile = File(...)):
    png_content = await png.read()
    svg_content = await svg.read()

    try:
        counts, room_names = count_from_svg(svg_content)
        overlay_base64 = draw_overlay(svg_content, png_content)

        return {
            "counts": counts,
            "room_names": room_names,
            "overlay": f"data:image/jpeg;base64,{overlay_base64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
