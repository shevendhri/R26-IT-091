"""Compatibility adapter for the legacy blueprint API routes."""
from pathlib import Path
import sys
from starlette.concurrency import run_in_threadpool

async def process_blueprint(image_bytes, instruction="", building_type="Residential"):
    root = str(Path(__file__).resolve().parents[2])
    if root not in sys.path:
        sys.path.insert(0, root)
    from model.main import analyze_image
    result = await run_in_threadpool(analyze_image, image_bytes)
    result.update(detected_layout=[f"{name.title()}: {count}" for name, count in result["counts"].items()],
                  issues=[result["notice"]], improvements=[], interpretation="Floor-plan object detection")
    return result["overlay"].split(",", 1)[1], [result["notice"]], result
