# Chapter 4: System Implementation

## 4.1 Backend Framework
The backend is developed using Python, leveraging FastAPI for high-performance API endpoints.

## 4.2 Procedural Generation Modules
The `BlueprintEngine` and `RoomEngine` manage geometric construction and collision detection.

## 4.3 Data Structures
GeoJSON and custom dictionary structures are used to maintain coordinates for rooms and furniture, allowing for seamless integration with frontend rendering libraries like Three.js.

## 4.4 Data Pipeline
The validation script iterates through the evaluation matrix, utilizing seed `12345` for deterministic reproducibility, and exports the structural JSONs and 2D Matplotlib plots.
