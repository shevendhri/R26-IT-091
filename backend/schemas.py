from pydantic import BaseModel
from typing import List, Dict, Any

class MaterialOption(BaseModel):
    id: str
    name: str
    image_url: str
    suitability_score: float
    durability_rating: str
    sustainability_rating: str
    maintenance_rating: str
    service_life_years: int
    carbon_impact_kg_co2: float
    climate_compatible: bool
    engineering_reasoning: List[str]

class Questionnaire(BaseModel):
    budget_tier: str  # "Budget", "Balanced", "Premium"
    priority: str     # "Cost", "Sustainability", "Durability", "Performance"
    maintenance_preference: str  # "Low", "Medium", "High"
    sustainability_priority: str  # "Low", "Medium", "High"

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    details: Dict[str, Any] = {}
