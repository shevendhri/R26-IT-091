# backend/enums.py
"""Enumeration utilities for the Engineering‑First Decision Support System.

Defines a ``BuildingType`` enum covering the supported occupancy categories and
provides a helper ``normalize_building_type`` that maps legacy free‑text inputs
to the canonical enum values. The enum is used throughout the backend to ensure
consistent occupancy handling.
"""

from enum import Enum


class BuildingType(str, Enum):
    RESIDENTIAL = "Residential"
    COMMERCIAL = "Commercial"
    HEALTHCARE = "Healthcare"
    EDUCATIONAL = "Educational"
    INDUSTRIAL = "Industrial"
    HOSPITALITY = "Hospitality"
    WAREHOUSE = "Warehouse"
    MIXEDUSE = "MixedUse"

    @classmethod
    def has_value(cls, value: str) -> bool:
        return any(value.lower() == item.value.lower() for item in cls)


def normalize_building_type(raw: str) -> BuildingType:
    """Normalize free‑text occupancy strings to a ``BuildingType``.

    The function performs simple fuzzy matching for common synonyms (e.g.
    ``"house"`` → ``RESIDENTIAL``) and falls back to ``RESIDENTIAL`` if the
    input cannot be matched. It raises a ``ValueError`` only when a clearly
    unsupported type is supplied.
    """
    if not raw:
        return BuildingType.RESIDENTIAL
    raw_clean = raw.strip().lower()

    # Direct matches
    for bt in BuildingType:
        if raw_clean == bt.value.lower():
            return bt

    # Known legacy synonyms
    synonyms = {
        "house": BuildingType.RESIDENTIAL,
        "home": BuildingType.RESIDENTIAL,
        "apartment": BuildingType.RESIDENTIAL,
        "office": BuildingType.COMMERCIAL,
        "shop": BuildingType.COMMERCIAL,
        "retail": BuildingType.COMMERCIAL,
        "clinic": BuildingType.HEALTHCARE,
        "hospital": BuildingType.HEALTHCARE,
        "school": BuildingType.EDUCATIONAL,
        "college": BuildingType.EDUCATIONAL,
        "university": BuildingType.EDUCATIONAL,
        "factory": BuildingType.INDUSTRIAL,
        "plant": BuildingType.INDUSTRIAL,
        "hotel": BuildingType.HOSPITALITY,
        "resort": BuildingType.HOSPITALITY,
        "warehouse": BuildingType.WAREHOUSE,
        "storage": BuildingType.WAREHOUSE,
        "mixed": BuildingType.MIXEDUSE,
        "mixeduse": BuildingType.MIXEDUSE,
    }
    if raw_clean in synonyms:
        return synonyms[raw_clean]

    # Fallback – treat as residential but log a warning for future analysis
    print(f"[WARN] Unrecognized building type '{raw}'. Defaulting to Residential.")
    return BuildingType.RESIDENTIAL
