# backend/room_data_models.py
"""Typed data models for the furniture generation pipeline.
These models help keep the data flow explicit and type‑checked.
"""

from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class Door:
    """Simple door geometry.
    Coordinates are relative to the room origin (0,0) in metres.
    """
    x: float  # centre X coordinate
    z: float  # centre Z coordinate
    w: float  # width (along X)
    d: float  # depth (along Z) – usually thin


@dataclass
class Window:
    """Simple window geometry, same convention as Door."""
    x: float
    z: float
    w: float
    d: float


@dataclass
class FurnitureItem:
    """Definition of a piece of furniture before placement.
    The geometry matches the entries from ``furniture_catalog``.
    """
    name: str
    w: float
    h: float
    d: float
    color: str
    shape: str
    placement: str  # hint for the constraint solver (e.g., "wall-N")
    parts: List[Dict[str, Any]] | None = None


@dataclass
class Room:
    """Semantic representation of a room used by the constraint solver.
    ``type`` is the semantic room type (Living Room, Kitchen, ...).
    ``size_category`` is "small", "medium" or "large".
    """
    label: str
    type: str
    size_category: str
    w: float
    h: float
    doors: List[Door]
    windows: List[Window]
    furniture_defs: List[FurnitureItem] | None = None
