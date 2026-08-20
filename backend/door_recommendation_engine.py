from typing import Dict, Any, List
from backend.audit_engine import audit_engine

class DoorRecommendationEngine:
    def __init__(self):
        # Catalog of door styles with material traits, base dimensions, and weights
        self.catalog = [
            {
                "id": "grand_timber",
                "door_type": "Grand Timber Double Door",
                "material": "Teak Wood",
                "dimensions": "1800x2400mm",
                "finish": "Varnished Teak",
                "security_rating": "High",
                "cost_lkr": 220000,
                "style_affinity": ["traditional sri lankan", "colonial", "mediterranean"],
                "climate_suitability": 0.90, # Teak is naturally oily & water-resistant
                "category_compatibility": ["entrance"]
            },
            {
                "id": "glass_pivot",
                "door_type": "Glass Pivot Door",
                "material": "Tempered Glass & Steel",
                "dimensions": "1200x2400mm",
                "finish": "Clear Tempered Glass",
                "security_rating": "Medium",
                "cost_lkr": 185000,
                "style_affinity": ["luxury villa", "minimalist", "contemporary", "modern"],
                "climate_suitability": 0.95, # Steel/Glass resist rot & moisture
                "category_compatibility": ["entrance", "bedroom"]
            },
            {
                "id": "solid_timber",
                "door_type": "Solid Engineered Timber Door",
                "material": "Engineered Timber",
                "dimensions": "900x2100mm",
                "finish": "Natural Oak Veneer",
                "security_rating": "Medium",
                "cost_lkr": 75000,
                "style_affinity": ["modern", "scandinavian", "eco home", "modern tropical"],
                "climate_suitability": 0.80, # Treated timber resists moderate humidity
                "category_compatibility": ["bedroom", "entrance"]
            },
            {
                "id": "flush_mdf",
                "door_type": "Flush MDF Panel Door",
                "material": "Medium Density Fiberboard (MDF)",
                "dimensions": "900x2100mm",
                "finish": "Satin White Paint",
                "security_rating": "Low",
                "cost_lkr": 35000,
                "style_affinity": ["minimalist", "contemporary", "modern", "scandinavian"],
                "climate_suitability": 0.40, # MDF swells in high moisture/salinity
                "category_compatibility": ["bedroom", "utility"]
            },
            {
                "id": "upvc_waterproof",
                "door_type": "uPVC Moisture-Resistant Door",
                "material": "Unplasticized Polyvinyl Chloride",
                "dimensions": "800x2000mm",
                "finish": "White Matte",
                "security_rating": "Medium",
                "cost_lkr": 28000,
                "style_affinity": ["modern", "minimalist", "scandinavian", "contemporary", "traditional sri lankan", "modern tropical", "colonial", "luxury villa", "eco home", "industrial", "mediterranean"],
                "climate_suitability": 1.0, # uPVC is 100% moisture proof
                "category_compatibility": ["bathroom", "utility"]
            },
            {
                "id": "timber_louvre",
                "door_type": "Timber Louvred Door",
                "material": "Mahogany",
                "dimensions": "900x2100mm",
                "finish": "Stained Finish",
                "security_rating": "Low",
                "cost_lkr": 60000,
                "style_affinity": ["modern tropical", "colonial", "eco home"],
                "climate_suitability": 0.88, # Allows ventilation
                "category_compatibility": ["utility", "bedroom"]
            },
            {
                "id": "metal_roller",
                "door_type": "Secured Metal Roller Shutter",
                "material": "Galvanized Steel",
                "dimensions": "2400x2200mm",
                "finish": "Powder-Coated Charcoal",
                "security_rating": "High",
                "cost_lkr": 150000,
                "style_affinity": ["industrial", "modern", "contemporary"],
                "climate_suitability": 0.90, # Heavy steel with coating
                "category_compatibility": ["garage"]
            }
        ]

    def recommend_doors(self, style_profile: Dict[str, Any], climate: Dict[str, Any], budget_tier: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Calculates door rankings for Entrance, Bedroom, Bathroom, Utility, and Garage categories.
        """
        style = style_profile.get("style", "Modern").lower()
        climate_type = climate.get("type", "Intermediate").lower()
        humidity = float(climate.get("humidity", 70))
        budget = budget_tier.lower()

        categories = ["entrance", "bedroom", "bathroom", "utility", "garage"]
        recommendations = {}

        for category in categories:
            scored_doors = []
            for item in self.catalog:
                # Basic category filter
                if category not in item["category_compatibility"]:
                    continue

                # 1. Style score (40%)
                style_score = 50.0
                if style in item["style_affinity"]:
                    style_score = 95.0
                elif any(s in style for s in item["style_affinity"]):
                    style_score = 80.0

                # 2. Climate score (30%)
                climate_score = item["climate_suitability"] * 100.0
                # Penalty for MDF in very wet climates
                if category == "bathroom" or humidity > 78:
                    if item["id"] == "flush_mdf":
                        climate_score = 20.0

                # 3. Cost/Budget score (30%)
                cost = item["cost_lkr"]
                cost_score = 100.0
                if budget == "budget":
                    if cost > 150000:
                        cost_score = 20.0
                    elif cost > 70000:
                        cost_score = 60.0
                elif budget == "premium":
                    if cost < 50000:
                        cost_score = 70.0 # Small penalty for premium choosing cheap MDF
                else: # Balanced
                    if cost > 180000:
                        cost_score = 50.0

                # Hybrid Score
                hybrid_score = (0.4 * style_score) + (0.3 * climate_score) + (0.3 * cost_score)
                
                # Check for Vetoes (e.g. MDF in Bathroom is vetoed)
                if category == "bathroom" and item["id"] == "flush_mdf":
                    hybrid_score = 0.0

                explanation = f"Matches {style_profile['style']} style and fits {budget_tier} budget. "
                if category == "bathroom" and item["id"] == "upvc_waterproof":
                    explanation += "uPVC selected due to 100% moisture resistance."
                elif humidity > 78 and item["climate_suitability"] >= 0.88:
                    explanation += "High humidity parameters favor rot-resistant materials."

                scored_doors.append({
                    "door_type": item["door_type"],
                    "material": item["material"],
                    "dimensions": item["dimensions"],
                    "finish": item["finish"],
                    "security_rating": item["security_rating"],
                    "style_score": int(style_score),
                    "climate_score": int(climate_score),
                    "cost_lkr": cost,
                    "hybrid_score": hybrid_score,
                    "reason": explanation
                })

            # Sort and Rank
            scored_doors.sort(key=lambda x: x["hybrid_score"], reverse=True)
            top_doors = []
            for rank, sd in enumerate(scored_doors[:3], 1):
                sd["rank"] = rank
                top_doors.append(sd)
                
                # Log to recommendations audit engine
                audit_engine.log_audit(
                    category=f"Door - {category.capitalize()}",
                    item_name=sd["door_type"],
                    dataset_source="door_recommendation_engine.py",
                    dataset_row=sd["door_type"],
                    ml_score=50.0, # Doors use heuristics
                    engineering_score=sd["climate_score"],
                    climate_score=sd["climate_score"],
                    style_score=sd["style_score"],
                    sustainability_score=75.0, # Baseline sustainability
                    cost_score=(sd["cost_lkr"] / 220000.0) * 100.0,
                    hybrid_score=sd["hybrid_score"],
                    ranking=rank,
                    explanation=sd["reason"]
                )

            recommendations[category] = {
                "has_viable": len(top_doors) > 0,
                "options": top_doors
            }

        return recommendations

door_recommendation_engine = DoorRecommendationEngine()
