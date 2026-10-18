def status_from_confidence(confidence: float | None) -> str:
    if confidence is None:
        return "NEEDS_REVIEW"
    return "CONFIRMED" if confidence >= 0.75 else "NEEDS_REVIEW"
