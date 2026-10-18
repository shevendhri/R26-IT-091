import argparse
import asyncio
from pathlib import Path
from io import BytesIO
import sys

from fastapi import UploadFile

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ..config import get_settings
from ..drawing_understanding.plan_reader import DrawingUnderstandingService

async def main() -> int:
    parser = argparse.ArgumentParser(description="Run an opt-in OpenAI plan-reader smoke test.")
    parser.add_argument("plan", help="Path to a PDF/PNG/JPG architectural plan")
    args = parser.parse_args()

    path = Path(args.plan)
    if not path.is_file():
        print(f"Status: FAILED\nReason: file not found: {path}")
        return 2

    settings = get_settings()
    settings.plan_reader = "openai"
    if not settings.openai_api_key:
        print("Provider: OpenAI\nStatus: SKIPPED\nReason: OPENAI_API_KEY is not configured.")
        return 0

    upload = UploadFile(file=BytesIO(path.read_bytes()), filename=path.name)
    result = await DrawingUnderstandingService(settings).analyze_uploads([upload])
    metadata = result.geometry_analysis.get("plan_reader", {})
    pages = result.pages
    building_use = next((page.building_info.building_use_text for page in pages if page.building_info.building_use_text), None)
    project_name = next((page.building_info.project_title for page in pages if page.building_info.project_title), None)
    explicit_storeys = next((page.building_info.storey_count for page in pages if page.building_info.storey_count is not None), None)

    print(f"Provider: OpenAI")
    print(f"Status: {metadata.get('status', 'UNKNOWN')}")
    print("")
    print(f"Project: {project_name or 'Unknown'}")
    print(f"Building use: {building_use or 'Unknown'}")
    print(f"Explicit storeys: {explicit_storeys if explicit_storeys is not None else 'Unknown'}")
    print(f"Pages interpreted: {metadata.get('pages_interpreted', 0)}")
    print(f"Room labels: {sum(len(page.rooms) for page in pages)}")
    print(f"Stairs: {sum(len(page.stairs) for page in pages)} partial")
    print(f"Doors: physical count unknown; evidence entries {sum(len(page.doors) for page in pages)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
