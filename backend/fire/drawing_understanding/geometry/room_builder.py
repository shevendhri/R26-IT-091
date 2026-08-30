def build_rooms_from_geometry(*_args, **_kwargs) -> dict:
    return {"rooms": [], "status": "UNAVAILABLE", "reason": "Room polygons were not inferred without reliable enclosed-space geometry."}
