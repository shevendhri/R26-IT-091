"""
compliance.py — floor-plan-derivable compliance checks.

Two per-room checks (ventilation, wall thickness) and two building-level
checks (toilet present, real-world scale established), computed from the
room/door/window/wall data `main.py`'s /predict route derives from YOLO
detections (room type via OCR, scale via dimension labels or an assumed
door width).
"""

# Room types where codes typically allow mechanical/no natural ventilation,
# so a door alone (no window) still passes.
_VENTILATION_EXEMPT_TYPES = {'bathroom', 'storage', 'laundry', 'hallway'}

# Minimum plausible wall short-side, in px, to count as "has a real thickness"
# rather than a degenerate zero-width line.
_MIN_WALL_THICKNESS_PX = 2.0


def check_room(room: dict, room_type: str) -> dict:
    """Per-room checks: ventilation (window/door) and wall thickness."""
    has_window = (room.get('windows') or 0) > 0
    has_door = (room.get('doors') or 0) > 0

    if room_type in _VENTILATION_EXEMPT_TYPES:
        ventilation = has_window or has_door
    else:
        ventilation = has_window

    thickness = room.get('wall_thickness_px')
    wall_thickness = thickness is not None and thickness > _MIN_WALL_THICKNESS_PX

    return {
        'ventilation': ventilation,
        'wall_thickness': wall_thickness,
    }


def check_building(rooms: list, scale_source: str) -> dict:
    """Building-level checks: at least one toilet/bathroom, real-world scale established."""
    has_toilet = any(r.get('type') == 'bathroom' for r in rooms)
    scale_established = scale_source != 'none'

    return {
        'has_toilet': has_toilet,
        'scale_established': scale_established,
    }
