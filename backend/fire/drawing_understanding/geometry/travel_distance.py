def calculate_travel_distance(*_args, **_kwargs) -> dict:
    return {
        "travel_distance_m": None,
        "status": "UNKNOWN",
        "reason": "Travel distance requires a confirmed traversable graph; straight-line measurement through walls is not used.",
    }
