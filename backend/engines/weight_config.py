# backend/engines/weight_config.py
"""Engineering weighting configuration for the Decision Support System.
All weights sum to 100% and are expressed as fractions for the final score calculation.
"""

WEIGHTS = {
    "structural_safety": 0.25,
    "sls_compliance": 0.20,
    "climate_compatibility": 0.15,
    "occupancy_requirements": 0.15,
    "structural_system_compatibility": 0.10,
    "service_life": 0.05,
    "maintenance": 0.05,
    "sustainability": 0.05,
}

HYBRID_ENGINEERING_WEIGHT = 0.75
HYBRID_ML_WEIGHT = 0.25
