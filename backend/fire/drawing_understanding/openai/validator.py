from math import isfinite
from .schemas import PlanExtraction

def _number(value):
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value.strip())
        except ValueError:
            return None
    return None

def validate_plan_extraction(extraction: PlanExtraction, page_count: int) -> tuple[PlanExtraction, list[str]]:
    warnings: list[str] = []

    def valid_page(page: int | None, context: str) -> bool:
        if page is None:
            return True
        if page < 1 or page > page_count:
            warnings.append(f"{context}: invalid page reference {page}; evidence ignored.")
            return False
        return True

    info = extraction.building_info
    storeys = _number(info.explicit_storey_count.value)
    if storeys is not None:
        value = int(storeys)
        if value < 1 or value > 200:
            warnings.append("OpenAI returned impossible explicit storey count; value ignored.")
            info.explicit_storey_count.value = None
            info.explicit_storey_count.state = "UNKNOWN"
        else:
            info.explicit_storey_count.value = str(value)
    height = _number(info.height_m.value)
    if height is not None:
        value = float(height)
        if not isfinite(value) or value <= 0 or value > 1000:
            warnings.append("OpenAI returned invalid building height; value ignored.")
            info.height_m.value = None
            info.height_m.state = "UNKNOWN"
        else:
            info.height_m.value = str(value)
    total_area = _number(info.total_floor_area_m2.value)
    if total_area is not None:
        value = float(total_area)
        if not isfinite(value) or value <= 0:
            warnings.append("OpenAI returned invalid total floor area; value ignored.")
            info.total_floor_area_m2.value = None
            info.total_floor_area_m2.state = "UNKNOWN"
        else:
            info.total_floor_area_m2.value = str(value)

    extraction.floor_areas = [
        item for item in extraction.floor_areas
        if valid_page(item.source_page, "floor_area") and item.area_m2 is not None and isfinite(item.area_m2) and item.area_m2 > 0
    ]
    extraction.floor_levels = [
        item for item in extraction.floor_levels
        if valid_page(item.page, "floor_level") and (item.level_m is None or isfinite(item.level_m))
    ]
    extraction.rooms = [item for item in extraction.rooms if valid_page(item.page, "room")]
    extraction.doors = [
        item for item in extraction.doors
        if valid_page(item.page, "door")
        and (item.width_mm is None or item.width_mm > 0)
        and (item.height_mm is None or item.height_mm > 0)
    ]
    extraction.stairs = [item for item in extraction.stairs if valid_page(item.page, "stair")]
    extraction.exits = [item for item in extraction.exits if valid_page(item.page, "exit")]
    extraction.fire_equipment = [item for item in extraction.fire_equipment if valid_page(item.page, "fire_equipment")]
    extraction.dimensions = [
        item for item in extraction.dimensions
        if valid_page(item.page, "dimension") and (item.value is None or item.value > 0)
    ]
    extraction.schedules = [item for item in extraction.schedules if valid_page(item.page, "schedule")]
    return extraction, warnings
