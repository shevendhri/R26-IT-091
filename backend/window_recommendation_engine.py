from typing import Dict, Any, List
from backend.audit_engine import audit_engine

class WindowRecommendationEngine:
    def __init__(self):
        pass

    def recommend_windows(self, style_profile: Dict[str, Any], climate: Dict[str, Any], rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Recommends window strategies, glazing specifications, sizes,
        and energy performance indices (U-value/SHGC) based on style, climate, and room functions.
        """
        style = style_profile.get("style", "Modern").lower()
        climate_type = climate.get("type", "Intermediate").lower()
        humidity = float(climate.get("humidity", 70))
        
        results = {}

        for room in rooms:
            label = room.get("label", "Living Room")
            r_type = room.get("type", "HABITABLE")
            
            strategy = "Cross Ventilation Optimized"
            placement = "Opposing walls to direct breeze"
            size = "1800x1200mm"
            u_value = 2.8
            shgc = 0.35
            
            # 1. Resolve strategy based on room function + climate
            if "bath" in label.lower() or "toilet" in label.lower():
                strategy = "Privacy Optimized"
                placement = "High wall positioning (above 1.8m)"
                size = "600x600mm"
                u_value = 5.2
                shgc = 0.60
            elif "office" in label.lower() or "study" in label.lower():
                strategy = "Solar Gain Controlled"
                placement = "North-facing walls to avoid harsh glares"
                size = "1200x1000mm"
                u_value = 2.2 # Good insulation
                shgc = 0.28
            elif "living" in label.lower() and ("villa" in style or "contemporary" in style):
                strategy = "View Maximized"
                placement = "South/East wall overlooking landscape"
                size = "2400x1800mm"
                u_value = 3.0
                shgc = 0.45
            else:
                strategy = "Cross Ventilation Optimized"
                placement = "Opposing walls for passive airflow"
                size = "1800x1200mm"
                u_value = 2.8
                shgc = 0.35

            # 2. Frame & Glass Type matching style and climate
            frame_type = "Aluminium Powder-Coated"
            glass_type = "Clear Tempered 6mm"
            
            if "traditional" in style or "colonial" in style:
                frame_type = "Treated Teak Wood Frame"
                glass_type = "Clear Plate Glass 6mm"
            elif "eco" in style:
                frame_type = "Sustainable Bamboo Laminate Frame"
                glass_type = "Double Glazed Low-E 6mm"
                u_value = 1.8
                shgc = 0.30

            if strategy == "Privacy Optimized":
                glass_type = "Frosted Translucent 6mm"
            elif strategy == "Solar Gain Controlled" and humidity < 60:
                glass_type = "Tinted Solar-Reflective 6mm"

            # 3. Create Top 3 Options
            top3 = [
                {
                    "rank": 1,
                    "frame": frame_type,
                    "glass": glass_type,
                    "cost_lkr": 45000 if "Timber" in frame_type else 28000,
                    "efficiency_rating": "High" if u_value < 2.5 else "Medium"
                },
                {
                    "rank": 2,
                    "frame": "uPVC Steel-Reinforced" if "Aluminium" in frame_type else "Aluminium Thermal Break",
                    "glass": "Double Glazed Clear 6mm",
                    "cost_lkr": 35000,
                    "efficiency_rating": "High"
                },
                {
                    "rank": 3,
                    "frame": "Steel Profile Crittall" if "industrial" in style else "Treated Mahogany Frame",
                    "glass": "Laminated Acoustic 6.38mm",
                    "cost_lkr": 55000,
                    "efficiency_rating": "Medium"
                }
            ]

            results[label] = {
    "has_viable": len(top3) > 0,
    "options": top3,
    "strategy": strategy,
    "window_family": style_profile.get("window_family", "Large Glazing"),
    "frame_type": frame_type,
    "glass_type": glass_type,
    "size": size,
    "placement": placement,
    "u_value": u_value,
    "shgc": shgc,
    "top3": top3
}


            # Log to recommendations audit engine
            audit_engine.log_audit(
                category=f"Window - {label}",
                item_name=f"{strategy} Spec",
                dataset_source="window_recommendation_engine.py",
                dataset_row=label,
                ml_score=50.0,
                engineering_score=85.0 if u_value < 3.5 else 60.0,
                climate_score=90.0 if (strategy == "Cross Ventilation Optimized" and humidity > 75) else 70.0,
                style_score=95.0,
                sustainability_score=80.0,
                cost_score=80.0,
                hybrid_score=85.0,
                ranking=1,
                explanation=f"Optimized for {strategy} with {glass_type} inside {frame_type} frames."
            )

        return results

window_recommendation_engine = WindowRecommendationEngine()
