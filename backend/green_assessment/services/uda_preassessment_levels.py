LEVEL_BANDS = [
    {
        "level": "Below Certification Threshold",
        "threshold": 0,
        "next_level": "Certified",
        "next_threshold": 40,
    },
    {
        "level": "Certified",
        "threshold": 40,
        "next_level": "Silver",
        "next_threshold": 50,
    },
    {
        "level": "Silver",
        "threshold": 50,
        "next_level": "Gold",
        "next_threshold": 60,
    },
    {
        "level": "Gold",
        "threshold": 60,
        "next_level": "Platinum",
        "next_threshold": 70,
    },
    {
        "level": "Platinum",
        "threshold": 70,
        "next_level": None,
        "next_threshold": None,
    },
]


def get_preassessment_level(score: float) -> dict:
    current_score = float(score or 0)
    current_band = LEVEL_BANDS[0]
    for band in LEVEL_BANDS:
        if current_score >= band["threshold"]:
            current_band = band
        else:
            break

    next_threshold = current_band["next_threshold"]
    is_highest_level = next_threshold is None
    return {
        "level": current_band["level"],
        "current_score": current_score,
        "next_level": current_band["next_level"],
        "next_threshold": next_threshold,
        "marks_to_next_level": 0
        if is_highest_level
        else max(next_threshold - current_score, 0),
        "is_highest_level": is_highest_level,
    }
