# Dissertation Validation Evidence: Case Study CS07
**Case Title**: High-Altitude Eco Resort (Nuwara Eliya Cold Highland)  
**Execution Timestamp**: 2026-07-23 12:03:18  
**Backend Pipeline Latency**: 4509.2 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `78.00` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `89.48` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `43.57` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `43.6% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Low (Low Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Hotel
- **Location**: Nuwara Eliya (Sri Lanka)
- **Floor Count**: 4 Floors | **Total Gross Area**: 1200.0 m²
- **Structural System**: Concrete Frame
- **Budget Tier**: Premium | **Sustainability Priority**: High

### Microclimate Environmental Snapshot
- **Climate Zone**: Highland Montane
- **Temperature Range**: 21.8°C
- **Humidity**: 60%
- **Annual Rainfall**: 2200mm
- **Salinity Level**: Low
- **Exposure Score**: 22.4 (Low)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `74.30` | `85.67` | `40.19` | 0.22 | 80 yrs | 85 |
| **Roofing** | Portuguese Clay Tile (Unglazed Terracotta) | `76.65` | `89.04` | `39.47` | 0.18 | 65 yrs | 85 |
| **Windows** | uPVC Multi-Chamber Window System | `75.90` | `87.09` | `42.32` | 0.28 | 45 yrs | 82 |
| **Doors** | Solid Teak Timber Door (Premium) | `78.79` | `89.44` | `46.85` | 0.22 | 80 yrs | 75 |
| **Flooring** | Polished Terrazzo Flooring (Marble Aggregate) | `82.06` | `94.60` | `44.43` | 0.22 | 65 yrs | 75 |
| **Ceiling** | Calcium Silicate Board Ceiling | `80.33` | `92.93` | `42.53` | 0.28 | 30 yrs | 62 |
| **Finishes** | Advanced Nano-Exterior Paint | `74.77` | `84.44` | `45.74` | 0.25 | 12 yrs | 65 |
| **Waterproofing** | Bentonite Clay Waterproofing Panel | `81.23` | `92.62` | `47.06` | 0.08 | 40 yrs | 85 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Walls: Wire-Cut Clay Brick (Premium Grade)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (68.0/100) adequate for 4-storey low-to-medium rise occupancy
- ✓ Fire resistance rating (90.0/100) exceeds the 60/100 minimum required for Walling in occupied buildings
- ✓ Service life of 80 years exceeds the 50-year design life target for walling components
- ✓ Engineering durability rated High — composite of structural capacity, service life, and moisture resistance confirms long-term performance
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (85.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Excellent thermal mass performance for regulating indoor temperatures in warm climates.  
✓ High structural integrity and fire resistance, lasting over 50 years with minimal maintenance.  
✓ Utilizes earth-based materials, offering high potential for thermal efficiency and long service life.  
Machine Learning confidence:  
40%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Roofing: Portuguese Clay Tile (Unglazed Terracotta)
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (88.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Fire resistance (80.0/100) satisfies minimum requirements
- ✓ Service life of 65 years meets the 50-year design life target
- ✓ Moderate embodied carbon (0.18 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (85.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Highland Montane climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.  
Machine Learning confidence:  
39%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Windows: uPVC Multi-Chamber Window System
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (98.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (82.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
42%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: Solid Teak Timber Door (Premium)
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (82.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Service life of 80 years exceeds the 50-year design life target for doors components
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (75.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.  
Machine Learning confidence:  
47%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Flooring: Polished Terrazzo Flooring (Marble Aggregate)
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (92.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Fire resistance rating (90.0/100) exceeds the 60/100 minimum required for Flooring in occupied buildings
- ✓ Service life of 65 years meets the 50-year design life target
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (75.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.  
Machine Learning confidence:  
44%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Ceiling: Calcium Silicate Board Ceiling
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (92.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Fire resistance rating (90.0/100) exceeds the 60/100 minimum required for Ceiling in occupied buildings
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (62.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
43%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Finishes: Advanced Nano-Exterior Paint
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (95.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Moderate embodied carbon (0.25 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.  
Machine Learning confidence:  
46%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Waterproofing: Bentonite Clay Waterproofing Panel
**Engineering Evaluation Criteria Passed**:
- ✓ Moisture resistance (98.0/100) adequate for highland montane precipitation at Nuwara eliya
- ✓ Low embodied carbon (0.08 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
- ✓ Sustainability rating (85.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 2200mm annual rainfall.  
✓ High moisture resistance (98/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.  
Machine Learning confidence:  
47%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

---

## 5. Execution Trace & Audit Log (Filtered Excerpt)
Trace of candidate filtering, veto checks, and rule evaluations executed during pipeline run:

```json
[
  {
    "category": "Flooring",
    "item_name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "dataset_source": "materials.db",
    "dataset_row": 160,
    "ml_score": 44.43,
    "engineering_score": 94.6,
    "hybrid_score": 82.06,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n44%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 160,
    "confidence": {
      "confidence_score": 44.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 5,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Waterproofing",
    "item_name": "Bentonite Clay Waterproofing Panel",
    "dataset_source": "materials.db",
    "dataset_row": 177,
    "ml_score": 47.06,
    "engineering_score": 92.62,
    "hybrid_score": 81.23,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 2200mm annual rainfall.\n\u2713 High moisture resistance (98/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.\nMachine Learning confidence:\n47%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 177,
    "confidence": {
      "confidence_score": 47.1,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 4,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 2200mm annual rainfall.",
      "durability": "High moisture resistance (98/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Calcium Silicate Board Ceiling",
    "dataset_source": "materials.db",
    "dataset_row": 170,
    "ml_score": 42.53,
    "engineering_score": 92.93,
    "hybrid_score": 80.33,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n43%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 170,
    "confidence": {
      "confidence_score": 42.5,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 5,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Waterproofing",
    "item_name": "HDPE Sheet Waterproofing Barrier",
    "dataset_source": "materials.db",
    "dataset_row": 176,
    "ml_score": 46.3,
    "engineering_score": 90.18,
    "hybrid_score": 79.21,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 2200mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.\nMachine Learning confidence:\n46%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 176,
    "confidence": {
      "confidence_score": 46.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 5,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 2200mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "Solid Teak Timber Door (Premium)",
    "dataset_source": "materials.db",
    "dataset_row": 153,
    "ml_score": 46.85,
    "engineering_score": 89.44,
    "hybrid_score": 78.79,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n47%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 153,
    "confidence": {
      "confidence_score": 46.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "dataset_source": "materials.db",
    "dataset_row": 167,
    "ml_score": 43.89,
    "engineering_score": 89.84,
    "hybrid_score": 78.35,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n44%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 167,
    "confidence": {
      "confidence_score": 43.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 3,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 40.0
  },
  {
    "category": "Roofing",
    "item_name": "Portuguese Clay Tile (Unglazed Terracotta)",
    "dataset_source": "materials.db",
    "dataset_row": 140,
    "ml_score": 39.47,
    "engineering_score": 89.04,
    "hybrid_score": 76.65,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Highland Montane climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.\nMachine Learning confidence:\n39%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 140,
    "confidence": {
      "confidence_score": 39.5,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 7,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Highland Montane climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Windows",
    "item_name": "uPVC Multi-Chamber Window System",
    "dataset_source": "materials.db",
    "dataset_row": 147,
    "ml_score": 42.32,
    "engineering_score": 87.09,
    "hybrid_score": 75.9,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n42%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 147,
    "confidence": {
      "confidence_score": 42.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Doors",
    "item_name": "UPVC Sliding Door (Weather-Sealed)",
    "dataset_source": "materials.db",
    "dataset_row": 159,
    "ml_score": 42.91,
    "engineering_score": 86.82,
    "hybrid_score": 75.84,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.\nMachine Learning confidence:\n43%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 159,
    "confidence": {
      "confidence_score": 42.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 6,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Finishing",
    "item_name": "Advanced Nano-Exterior Paint",
    "dataset_source": "materials.db",
    "dataset_row": 178,
    "ml_score": 45.74,
    "engineering_score": 84.44,
    "hybrid_score": 74.77,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.\nMachine Learning confidence:\n46%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 178,
    "confidence": {
      "confidence_score": 45.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Walling",
    "item_name": "Wire-Cut Clay Brick (Premium Grade)",
    "dataset_source": "materials.db",
    "dataset_row": 133,
    "ml_score": 40.19,
    "engineering_score": 85.67,
    "hybrid_score": 74.3,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Excellent thermal mass performance for regulating indoor temperatures in warm climates.\n\u2713 High structural integrity and fire resistance, lasting over 50 years with minimal maintenance.\n\u2713 Utilizes earth-based materials, offering high potential for thermal efficiency and long service life.\nMachine Learning confidence:\n40%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 133,
    "confidence": {
      "confidence_score": 40.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Excellent thermal mass performance for regulating indoor temperatures in warm climates.",
      "durability": "High structural integrity and fire resistance, lasting over 50 years with minimal maintenance.",
      "sustainability": "Utilizes earth-based materials, offering high potential for thermal efficiency and long service life.",
      "cost": "Offers long-term economic value through reduced energy demand and high durability."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 40.0
  },
  {
    "category": "Doors",
    "item_name": "Timber Louvre Door (Ventilated Hardwood)",
    "dataset_source": "materials.db",
    "dataset_row": 158,
    "ml_score": 37.81,
    "engineering_score": 84.78,
    "hybrid_score": 73.04,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.2 kgCO2/kg.\nMachine Learning confidence:\n38%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 158,
    "confidence": {
      "confidence_score": 37.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 7,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.2 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Walling",
    "item_name": "Hollow Clay Block (Perforated)",
    "dataset_source": "materials.db",
    "dataset_row": 137,
    "ml_score": 37.92,
    "engineering_score": 84.72,
    "hybrid_score": 73.02,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Traditional thermal mass properties suitable for dry and intermediate climates.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Made from local natural clay, though requiring high firing energy.\nMachine Learning confidence:\n38%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 137,
    "confidence": {
      "confidence_score": 37.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 3,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Traditional thermal mass properties suitable for dry and intermediate climates.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Made from local natural clay, though requiring high firing energy.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 40.0
  },
  {
    "category": "Windows",
    "item_name": "Timber Louvre Window (Treated Hardwood)",
    "dataset_source": "materials.db",
    "dataset_row": 149,
    "ml_score": 38.91,
    "engineering_score": 83.89,
    "hybrid_score": 72.65,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.\nMachine Learning confidence:\n39%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 149,
    "confidence": {
      "confidence_score": 38.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 6,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Flooring",
    "item_name": "Timber Strip Flooring (Treated Hardwood)",
    "dataset_source": "materials.db",
    "dataset_row": 163,
    "ml_score": 40.68,
    "engineering_score": 80.78,
    "hybrid_score": 70.75,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n41%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 163,
    "confidence": {
      "confidence_score": 40.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 7,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*