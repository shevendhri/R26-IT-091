"""
Room Engine — Furniture Placement
Computes normalised (0..1) positions for each furniture item inside
its parent room bounding box, so the frontend can scale them to the
actual 3D room dimensions.
"""

from room_furnishing_engine import layout_solver


# ── Placement strategies ─────────────────────────────────────────────────────
# Each placement hint maps to a function: (room_w, room_h, item_w, item_d, index) -> (px, pz, rotY)
# px/pz are *normalised* 0..1 within the room.

def _wall_n(rw, rh, iw, id_, idx):
    return (0.5, 0.15, 0)

def _wall_n_offset(rw, rh, iw, id_, idx):
    return (0.85, 0.12, 0)

def _wall_s(rw, rh, iw, id_, idx):
    return (0.5, 0.85, 0)

def _wall_s_offset(rw, rh, iw, id_, idx):
    return (0.2, 0.85, 0)

def _wall_s_upper(rw, rh, iw, id_, idx):
    # Cabinets above counter – same XZ as wall-S but will be raised in Y on the frontend
    return (0.5, 0.88, 0)

def _wall_e(rw, rh, iw, id_, idx):
    return (0.85, 0.5, 1.5708)  # π/2

def _wall_w(rw, rh, iw, id_, idx):
    return (0.15, 0.5, -1.5708)

def _center(rw, rh, iw, id_, idx):
    return (0.5, 0.5, 0)

def _center_n(rw, rh, iw, id_, idx):
    return (0.5, 0.32, 0)

def _center_s(rw, rh, iw, id_, idx):
    return (0.5, 0.68, 0)

def _center_e(rw, rh, iw, id_, idx):
    return (0.7, 0.5, 1.5708)

def _center_w(rw, rh, iw, id_, idx):
    return (0.3, 0.5, -1.5708)

def _corner_ne(rw, rh, iw, id_, idx):
    return (0.82, 0.18, 0)

def _corner_nw(rw, rh, iw, id_, idx):
    return (0.18, 0.18, 0)


PLACEMENT_MAP = {
    "wall-N":        _wall_n,
    "wall-N-offset": _wall_n_offset,
    "wall-S":        _wall_s,
    "wall-S-offset": _wall_s_offset,
    "wall-S-upper":  _wall_s_upper,
    "wall-E":        _wall_e,
    "wall-W":        _wall_w,
    "center":        _center,
    "center-N":      _center_n,
    "center-S":      _center_s,
    "center-E":      _center_e,
    "center-W":      _center_w,
    "corner-NE":     _corner_ne,
    "corner-NW":     _corner_nw,
}


def compute_furniture_placement(
    room_label: str,
    room_w: float,
    room_h: float,
    building_type: str = "Residential",
    style: str = "Modern",
):
    """Run the intelligent layout solver and return (items, layout_evaluation).

    Parameters
    ----------
    room_label    : str   – Human-readable room name (e.g. "Master Bedroom")
    room_w        : float – Room width in metres
    room_h        : float – Room depth in metres
    building_type : str   – Sector context (Residential / Healthcare / Commercial …)
    style         : str   – Design style (Modern / Minimalist / Luxury …)

    Returns
    -------
    (list[dict], dict)
        list[dict] – Each dict contains all geometry fields plus px, pz, rotY.
        dict       – layout_evaluation with research metrics and design score breakdown.
    """
    return layout_solver.solve_layout(room_label, room_w, room_h, style, building_type)




def generate_room_objects(blueprint: dict) -> dict:
    """Generate room objects using the furniture catalog.
    The blueprint contains `floors_data` with rooms that have a `label` (human readable name) and `type`.
    Returns a dict of the form {"rooms": {room_label: {"type": ..., "furniture": [...]}}}
    """
    rooms_output = {}
    for floor in blueprint.get('floors_data', []):
        for room in floor.get('rooms', []):
            label = room.get('label', 'Unnamed')
            rtype = room.get('type', '')
            rw = room.get('w', 5)
            rh = room.get('h', 5)
            furniture = compute_furniture_placement(label, rw, rh)
            rooms_output[label] = {
                'type': rtype,
                'furniture': furniture,
                'bbox': room.get('bbox', None)
            }
    return {'rooms': rooms_output}
