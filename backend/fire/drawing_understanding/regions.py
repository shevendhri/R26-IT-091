import re
from ..schemas import BBox
from .evidence.models import TextEvidence

REGION_TYPES = {
    "DOOR SCHEDULE":"DOOR_SCHEDULE",
    "WINDOW SCHEDULE":"WINDOW_SCHEDULE",
    "FLOOR PLAN":"FLOOR_PLAN",
    "GROUND FLOOR":"FLOOR_PLAN",
    "FIRST FLOOR":"FLOOR_PLAN",
    "SECOND FLOOR":"FLOOR_PLAN",
    "THIRD FLOOR":"FLOOR_PLAN",
    "FOURTH FLOOR":"FLOOR_PLAN",
    "FIFTH FLOOR":"FLOOR_PLAN",
    "ELEVATION":"ELEVATION",
    "SECTION":"SECTION",
    "NOTES":"NOTES",
}

def detect_sheet_regions(items: list[TextEvidence]) -> list[dict]:
    regions: list[dict] = []
    for item in items:
        text=item.normalized_text
        region_type=None
        for marker,candidate in REGION_TYPES.items():
            if marker in text:
                region_type=candidate
                break
        if region_type is None and re.search(r"\b(PROJECT|PROJECT TITLE|CLIENT|LOCATION|DRAWING TITLE)\b", text):
            region_type="TITLE_BLOCK"
        if region_type is None:
            continue
        regions.append({
            "type":region_type,
            "bbox":item.bbox.model_dump(mode="json") if item.bbox else None,
            "title":item.value,
            "confidence":round(item.confidence,2),
            "source_file":item.source_file,
            "page":item.page,
        })
    return _dedupe_regions(regions)

def _dedupe_regions(regions: list[dict]) -> list[dict]:
    seen=set()
    result=[]
    for region in regions:
        key=(region["type"],re.sub(r"\s+"," ",region["title"].upper()).strip())
        if key in seen:
            continue
        seen.add(key)
        result.append(region)
    return result

def floor_regions(regions: list[dict]) -> list[dict]:
    return [region for region in regions if region.get("type")=="FLOOR_PLAN"]

def floor_names_from_regions(regions: list[dict]) -> list[dict]:
    floors=[]
    for region in floor_regions(regions):
        title=(region.get("title") or "").upper()
        match=re.search(r"\b(GROUND|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH)\s+FLOOR\b", title)
        if not match:
            continue
        name=f"{match.group(1).title()} Floor"
        if not any(item["name"]==name for item in floors):
            floors.append({"name":name,"source_region":region,"confidence":region.get("confidence",0.6)})
    return floors
