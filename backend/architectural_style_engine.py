import os
import csv
import json
from typing import Dict, Any

class ArchitecturalStyleEngine:
    def __init__(self):
        self.csv_path = os.path.join(os.path.dirname(__file__), 'ArchitecturalStyles.csv')
        self.styles = []
        self._load_dataset()

    def _load_dataset(self):
        if not os.path.exists(self.csv_path):
            print(f"ArchitecturalStyles.csv not found at {self.csv_path}")
            return
        try:
            with open(self.csv_path, newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Clean up booleans and floats
                    row['Roof_Pitch'] = float(row['Roof_Pitch']) if row.get('Roof_Pitch') else 0.0
                    row['Overhang_Depth'] = float(row['Overhang_Depth']) if row.get('Overhang_Depth') else 0.0
                    row['Has_Verandah'] = row.get('Has_Verandah', '').strip().lower() in ('true', 'yes')
                    row['Has_Balcony'] = row.get('Has_Balcony', '').strip().lower() in ('true', 'yes')
                    row['Sustainability_Rating'] = int(row['Sustainability_Rating']) if row.get('Sustainability_Rating') else 70
                    
                    # Parse palette JSON
                    try:
                        row['Color_Palette'] = json.loads(row.get('Color_Palette_JSON', '{}'))
                    except Exception:
                        row['Color_Palette'] = {}
                    
                    self.styles.append(row)
            print(f"Successfully loaded {len(self.styles)} architectural styles.")
        except Exception as e:
            print(f"Error loading ArchitecturalStyles.csv: {e}")

    def select_style(self, profile: Any, climate: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determines the optimal architectural style based on user preference, climate factors,
        budget limits, and sustainability preferences.
        """
        if not self.styles:
            # Fallback if dataset failed to load
            return {
                "style": "Modern",
                "roof_type": "Flat Parapet",
                "roof_pitch": 0.0,
                "roof_overhang": 0.3,
                "window_family": "Large Glazing",
                "door_family": "flush_panel",
                "facade_theme": "Modern Minimalist Plaster",
                "balcony_type": "glass_rail",
                "has_verandah": False,
                "has_balcony": True,
                "landscape_theme": "minimalist_zen",
                "column_style": "square",
                "color_palette": {"wall": "#f2f5f8", "roof": "#1a1e24", "accent": "#0ea5e9"},
                "furniture_style": "modernist",
                "confidence": 0.8,
                "reasoning": "Fallback to Modern style due to missing style dataset.",
                "audit_trail": []
            }

        style_pref = getattr(profile, 'style_pref', 'Modern')
        sustainability_pref = getattr(profile, 'sustainability_pref', 'Medium')
        budget_tier = getattr(profile, 'budget_tier', 'Balanced')
        
        # Climate extraction
        climate_type = climate.get("type", "Intermediate")
        humidity = float(climate.get("humidity", 70))
        salinity = climate.get("salinity", "Low").lower()
        
        best_style = None
        best_score = -9999.0
        scores_explanation = []
        audit_trail = []

        for row in self.styles:
            score = 0.0
            reasons = []

            # 1. Primary Preference Match (Weight: 50 points)
            if row['Style'].lower() == style_pref.lower():
                score += 50.0
                reasons.append(f"Primary match with user preferred style '{style_pref}' (+50)")
            elif style_pref.lower() in row['Style'].lower() or row['Style'].lower() in style_pref.lower():
                score += 30.0
                reasons.append(f"Partial match with user preferred style '{style_pref}' (+30)")
            else:
                score += 5.0

            # 2. Climate Alignment (Weight: 20 points)
            # High humidity/rainfall favors hipped roofs and large overhangs
            if humidity > 75:
                if row['Overhang_Depth'] >= 1.5:
                    score += 15.0
                    reasons.append(f"Deep overhangs ({row['Overhang_Depth']}m) protect against high humidity/rainfall (+15)")
                elif row['Overhang_Depth'] < 0.5:
                    score -= 10.0
                    reasons.append(f"Insufficient overhang ({row['Overhang_Depth']}m) for high humidity region (-10)")
            
            # High salinity (coastal) favors plaster walls and concrete/slate roofs
            if salinity == "high":
                if row['Roof_Geometry'] in ('flat_parapet', 'flat') or row['Roof_Types'] == 'Slate Hipped':
                    score += 10.0
                    reasons.append(f"Salinity-resistant roof style ({row['Roof_Geometry']}) (+10)")
                if row['Window_Families'] == 'Large Sliding Louvred':
                    score += 5.0
                    reasons.append("Coastal sliding louvres accommodate high wind and ventilation (+5)")

            # 3. Budget Alignment (Weight: 15 points)
            budget_str = row['Budget_Range'].lower()
            if budget_tier.lower() == "premium":
                if "premium" in budget_str:
                    score += 15.0
                    reasons.append("High budget aligns with premium architectural details (+15)")
            elif budget_tier.lower() == "budget":
                if "budget" in budget_str:
                    score += 15.0
                    reasons.append("Economical style conforms to budget-friendly profile (+15)")
                elif "premium" in budget_str:
                    score -= 15.0
                    reasons.append("Premium details violate entry-level budget parameters (-15)")
            else: # Balanced
                if "balanced" in budget_str:
                    score += 15.0
                    reasons.append("Balanced design elements suit middle-tier budget (+15)")

            # 4. Sustainability Preference (Weight: 15 points)
            if sustainability_pref.lower() == "high":
                if row['Sustainability_Rating'] >= 90:
                    score += 20.0
                    reasons.append(f"High sustainability rating ({row['Sustainability_Rating']}) matches user focus (+20)")
                elif row['Sustainability_Rating'] < 75:
                    score -= 5.0
                    reasons.append(f"Lower style sustainability rating ({row['Sustainability_Rating']}) is penalized (-5)")

            # Normalize scores
            if score > best_score:
                best_score = score
                best_style = row
                scores_explanation = reasons

        # Compute confidence ratio
        max_possible = 100.0
        confidence = min(1.0, max(0.2, (best_score / max_possible)))

        # Build dynamic explanation text
        reasoning_text = "Resolved style through multi-criteria alignment. " + " ".join(scores_explanation)

        # Audit trail JSON
        for exp in scores_explanation:
            audit_trail.append({
                "factor": "System Selection Match",
                "impact": exp
            })

        return {
            "style": best_style['Style'],
            "roof_type": best_style['Roof_Types'],
            "roof_pitch": best_style['Roof_Pitch'],
            "roof_overhang": best_style['Overhang_Depth'],
            "window_family": best_style['Window_Families'],
            "door_family": best_style['Door_Families'],
            "facade_theme": f"{best_style['Style']} Articulated Facade",
            "balcony_type": best_style['Balcony_Geometry'],
            "has_verandah": best_style['Has_Verandah'],
            "has_balcony": best_style['Has_Balcony'],
            "landscape_theme": best_style['Landscape_Geometry'],
            "column_style": best_style['Column_Geometry'],
            "color_palette": best_style['Color_Palette'],
            "furniture_style": best_style['Furniture_Style'],
            "confidence": round(confidence, 2),
            "reasoning": reasoning_text,
            "audit_trail": audit_trail,
            "raw_dataset_row": best_style  # Pass raw details for audit logging
        }

style_engine = ArchitecturalStyleEngine()
