import math

# Normalization helpers (0-100 scale)
def normalize_distance(km: float, max_distance: float = 100.0) -> float:
    """Normalize coastal distance: closer to ocean => higher exposure.
    Returns 0-100 where 0 = far inland, 100 = at the coast."""
    # Clamp km to [0, max_distance]
    km = max(0.0, min(km, max_distance))
    # Invert distance: closer -> higher score
    return 100.0 * (1 - (km / max_distance))

def normalize_salinity(salinity: str) -> float:
    """Map salinity keywords to a numeric score.
    Expected values: 'low', 'moderate', 'high', 'extreme'."""
    mapping = {
        "low": 20.0,
        "moderate": 50.0,
        "high": 80.0,
        "extreme": 100.0,
    }
    return mapping.get(salinity.lower(), 20.0)

def normalize_humidity(humidity: float, max_humidity: float = 100.0) -> float:
    # Assuming humidity is a percentage 0-100
    humidity = max(0.0, min(humidity, max_humidity))
    return humidity

def normalize_rainfall(rainfall: float, max_rainfall: float = 5000.0) -> float:
    # Scale rainfall to 0-100 based on a max reference
    rainfall = max(0.0, min(rainfall, max_rainfall))
    return (rainfall / max_rainfall) * 100.0

def calculate_exposure_score(distance_km: float, salinity: str, humidity: float, rainfall: float) -> float:
    """Weighted exposure model.
    Returns a score 0‑100 where higher means more severe exposure.
    Weights: distance 40%, salinity 30%, humidity 20%, rainfall 10%.
    """
    distance_score = normalize_distance(distance_km)
    salinity_score = normalize_salinity(salinity)
    humidity_score = normalize_humidity(humidity)
    rainfall_score = normalize_rainfall(rainfall)
    # Weighted sum
    exposure = (
        0.40 * distance_score +
        0.30 * salinity_score +
        0.20 * humidity_score +
        0.10 * rainfall_score
    )
    return exposure

def exposure_level_from_score(score: float, salinity: str = "low", distance_km: float = 999.0) -> str:
    """Map exposure score to internal qualitative level.
    Very High only when score > 70 and (salinity is high or distance < 2km).
    """
    if score > 70 and (salinity.lower() == "high" or distance_km < 2.0):
        return "Very High"
    if score >= 40:
        return "Moderate"
    return "Low"
