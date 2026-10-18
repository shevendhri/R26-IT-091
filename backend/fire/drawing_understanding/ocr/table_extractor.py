import re
from ...schemas import Door
from .dimension_parser import parse_pair_dimensions

DOOR_MARK = re.compile(r"\b(?:D\s*[-:]?\s*(?P<compact>\d+[A-Z]?|[A-Z]\d+)|DOOR\s*[-:]?\s*(?P<word>\d+[A-Z]?|[A-Z]\d+))\b", re.I)

def _plausible_door_size(width_m: float | None, height_m: float | None) -> bool:
    if width_m is None:
        return False
    if not 0.4 <= width_m <= 3.0:
        return False
    if height_m is not None and not 1.5 <= height_m <= 3.5:
        return False
    return True

def _fire_rating_minutes(line: str) -> int | None:
    match = re.search(r"\b(?P<value>\d+(?:\.\d+)?)\s*(?P<unit>MIN|MINUTE|HR|HOUR)\b", line, re.I)
    if not match:
        return None
    value = float(match.group("value"))
    return int(value * 60) if match.group("unit").upper().startswith(("HR", "HOUR")) else int(value)

def extract_door_schedule(lines: list[str], source_file: str, page: int) -> list[Door]:
    doors: list[Door] = []
    for line in lines:
        mark_match = DOOR_MARK.search(line)
        width, height = parse_pair_dimensions(line)
        if not mark_match or not _plausible_door_size(width, height):
            continue
        mark = mark_match.group("compact") or mark_match.group("word")
        if not mark.upper().startswith("D"):
            mark = f"D{mark}"
        door_type = None
        if "SINGLE" in line and "SWING" in line:
            door_type = "SINGLE_SWING"
        elif "DOUBLE" in line and "SWING" in line:
            door_type = "DOUBLE_SWING"
        doors.append(Door(
            mark=mark.upper(),
            width_m=width,
            height_mm=round(height * 1000, 1) if height else None,
            door_type=door_type,
            fire_rating_minutes=_fire_rating_minutes(line),
            swing_type=door_type,
            is_exit=True if "EXIT" in line and ("DOOR" in line or mark.upper().startswith("D")) else None,
            opens_in_exit_direction=None,
            source_file=source_file,
            source_page=page,
            evidence=line,
            confidence=0.78,
        ))
    return doors
