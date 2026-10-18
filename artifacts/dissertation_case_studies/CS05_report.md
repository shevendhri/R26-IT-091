# Dissertation Validation Evidence: Case Study CS05
**Case Title**: Commercial Retail Complex (Negombo Western Coastal)  
**Execution Timestamp**: 2026-07-23 12:03:09  
**Backend Pipeline Latency**: 5276.9 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `79.62` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `86.13` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `60.08` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `60.1% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Very High (Extreme Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Commercial
- **Location**: Negombo (Sri Lanka)
- **Floor Count**: 3 Floors | **Total Gross Area**: 500.0 m²
- **Structural System**: Steel Frame
- **Budget Tier**: Balanced | **Sustainability Priority**: Medium

### Microclimate Environmental Snapshot
- **Climate Zone**: Moderate Coastal Humid
- **Temperature Range**: 29.7°C
- **Humidity**: 72%
- **Annual Rainfall**: 2200mm
- **Salinity Level**: Extreme
- **Exposure Score**: 88.20000000000002 (Very High)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Foundation** | Eco-Concrete Foundation (30% Recycled Aggregate) | `74.00` | `79.67` | `56.97` | 0.3 | 50 yrs | 90 |
| **Concrete** | Eco-Concrete (Recycled Aggregate + Fly-Ash) | `74.16` | `80.00` | `56.64` | 0.28 | 50 yrs | 92 |
| **Walls** | High-Density Cement Block | `68.26` | `70.27` | `62.23` | 0.38 | 40 yrs | 46 |
| **Roofing** | Zinc-Aluminium Corrugated Sheet (55% Al-Zn) | `84.26` | `92.18` | `60.50` | 0.42 | 50 yrs | 60 |
| **Windows** | Fixed Aluminium Framed Glass Panel | `82.15` | `90.62` | `56.74` | 0.42 | 35 yrs | 50 |
| **Doors** | FRP Fiberglass Reinforced Door | `84.73` | `92.18` | `62.36` | 0.48 | 60 yrs | 65 |
| **Flooring** | Recycled Composite Decking (WPC) | `80.08` | `86.38` | `61.20` | 0.22 | 30 yrs | 90 |
| **Ceiling** | Suspended Metal Tile Ceiling (Aluminium) | `83.36` | `91.24` | `59.73` | 0.45 | 40 yrs | 58 |
| **Finishes** | Advanced Nano-Exterior Paint | `80.27` | `86.44` | `61.76` | 0.25 | 12 yrs | 65 |
| **Waterproofing** | Crystalline Slurry Waterproofing (Penetrating) | `84.89` | `92.31` | `62.63` | 0.05 | 60 yrs | 58 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Foundation: Eco-Concrete Foundation (30% Recycled Aggregate)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (72.0/100) adequate for 3-storey low-to-medium rise occupancy
- ✓ Fire resistance rating (95.0/100) exceeds the 60/100 minimum required for Foundation in occupied buildings
- ✓ Service life of 50 years meets the 50-year design life target
- ✓ Moderate embodied carbon (0.3 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (90.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Standard climate compatibility with enhanced resilience to moisture variability.  
✓ Meets target durability with high moisture resistance and structural stability under typical tropical loads.  
✓ Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).  
Machine Learning confidence:  
57%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Concrete: Eco-Concrete (Recycled Aggregate + Fly-Ash)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (75.0/100) adequate for 3-storey low-to-medium rise occupancy
- ✓ Fire resistance rating (95.0/100) exceeds the 60/100 minimum required for Concrete in occupied buildings
- ✓ Service life of 50 years meets the 50-year design life target
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (92.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Standard climate compatibility with enhanced resilience to moisture variability.  
✓ Meets target durability with high moisture resistance and structural stability under typical tropical loads.  
✓ Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (88/100).  
Machine Learning confidence:  
57%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Walls: High-Density Cement Block
**Engineering Evaluation Criteria Passed**:
- ✓ Fire resistance rating (85.0/100) exceeds the 60/100 minimum required for Walling in occupied buildings
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for thermal performance and humidity resistance.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.  
Machine Learning confidence:  
62%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
HIGH

### Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
- ✓ Service life of 50 years meets the 50-year design life target
- ✓ Good sustainability rating (60.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Moderate Coastal Humid climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.  
Machine Learning confidence:  
60%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Windows: Fixed Aluminium Framed Glass Panel
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (90.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.  
Machine Learning confidence:  
57%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: FRP Fiberglass Reinforced Door
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.  
Machine Learning confidence:  
62%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Flooring: Recycled Composite Decking (WPC)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (90.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Standard climate compatibility with enhanced resilience to moisture variability.  
✓ Meets target durability with high moisture resistance and structural stability under typical tropical loads.  
✓ Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).  
Machine Learning confidence:  
61%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Ceiling: Suspended Metal Tile Ceiling (Aluminium)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
60%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Finishes: Advanced Nano-Exterior Paint
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (90.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Moderate embodied carbon (0.25 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.  
Machine Learning confidence:  
62%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Waterproofing: Crystalline Slurry Waterproofing (Penetrating)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (95.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Negombo
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 2200mm annual rainfall.  
✓ High moisture resistance (100/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.  
Machine Learning confidence:  
63%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

---

## 5. Execution Trace & Audit Log (Filtered Excerpt)
Trace of candidate filtering, veto checks, and rule evaluations executed during pipeline run:

```json
[
  {
    "category": "Waterproofing",
    "item_name": "Crystalline Slurry Waterproofing (Penetrating)",
    "dataset_source": "materials.db",
    "dataset_row": 173,
    "ml_score": 62.63,
    "engineering_score": 92.31,
    "hybrid_score": 84.89,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 2200mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n63%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 173,
    "confidence": {
      "confidence_score": 62.6,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 2200mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "FRP Fiberglass Reinforced Door",
    "dataset_source": "materials.db",
    "dataset_row": 155,
    "ml_score": 62.36,
    "engineering_score": 92.18,
    "hybrid_score": 84.73,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 155,
    "confidence": {
      "confidence_score": 62.4,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Zinc-Aluminium Corrugated Sheet (55% Al-Zn)",
    "dataset_source": "materials.db",
    "dataset_row": 143,
    "ml_score": 60.5,
    "engineering_score": 92.18,
    "hybrid_score": 84.26,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Moderate Coastal Humid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n60%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 143,
    "confidence": {
      "confidence_score": 60.5,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Moderate Coastal Humid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Waterproofing",
    "item_name": "HDPE Sheet Waterproofing Barrier",
    "dataset_source": "materials.db",
    "dataset_row": 176,
    "ml_score": 59.56,
    "engineering_score": 92.18,
    "hybrid_score": 84.03,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 2200mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.\nMachine Learning confidence:\n60%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 176,
    "confidence": {
      "confidence_score": 59.6,
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
    "item_name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "dataset_source": "materials.db",
    "dataset_row": 154,
    "ml_score": 61.04,
    "engineering_score": 91.16,
    "hybrid_score": 83.63,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 154,
    "confidence": {
      "confidence_score": 61.0,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 3,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Marine-Grade Aluminium Roofing (0.55mm)",
    "dataset_source": "materials.db",
    "dataset_row": 139,
    "ml_score": 59.07,
    "engineering_score": 91.62,
    "hybrid_score": 83.48,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Moderate Coastal Humid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n59%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 139,
    "confidence": {
      "confidence_score": 59.1,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Moderate Coastal Humid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Suspended Metal Tile Ceiling (Aluminium)",
    "dataset_source": "materials.db",
    "dataset_row": 171,
    "ml_score": 59.73,
    "engineering_score": 91.24,
    "hybrid_score": 83.36,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n60%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 171,
    "confidence": {
      "confidence_score": 59.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Fixed Aluminium Framed Glass Panel",
    "dataset_source": "materials.db",
    "dataset_row": 151,
    "ml_score": 56.74,
    "engineering_score": 90.62,
    "hybrid_score": 82.15,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n57%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 151,
    "confidence": {
      "confidence_score": 56.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Sliding Aluminium Window (Impact-Resistant)",
    "dataset_source": "materials.db",
    "dataset_row": 152,
    "ml_score": 56.34,
    "engineering_score": 90.73,
    "hybrid_score": 82.13,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 152,
    "confidence": {
      "confidence_score": 56.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 2,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Casement Aluminium Window (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 148,
    "ml_score": 55.44,
    "engineering_score": 90.84,
    "hybrid_score": 81.99,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 148,
    "confidence": {
      "confidence_score": 55.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 4,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "uPVC Multi-Chamber Window System",
    "dataset_source": "materials.db",
    "dataset_row": 147,
    "ml_score": 55.87,
    "engineering_score": 89.09,
    "hybrid_score": 80.78,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 147,
    "confidence": {
      "confidence_score": 55.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 4,
    "ml_rank": 3,
    "hybrid_rank": 4,
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
    "ml_score": 55.98,
    "engineering_score": 88.82,
    "hybrid_score": 80.61,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 159,
    "confidence": {
      "confidence_score": 56.0,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 5,
    "hybrid_rank": 3,
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
    "ml_score": 61.76,
    "engineering_score": 86.44,
    "hybrid_score": 80.27,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 178,
    "confidence": {
      "confidence_score": 61.8,
      "confidence_level": "Medium"
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
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Flooring",
    "item_name": "Recycled Composite Decking (WPC)",
    "dataset_source": "materials.db",
    "dataset_row": 166,
    "ml_score": 61.2,
    "engineering_score": 86.38,
    "hybrid_score": 80.08,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 166,
    "confidence": {
      "confidence_score": 61.2,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 4,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Flooring",
    "item_name": "Porcelain GVT Slab (Full-Body Vitrified)",
    "dataset_source": "materials.db",
    "dataset_row": 161,
    "ml_score": 62.85,
    "engineering_score": 83.44,
    "hybrid_score": 78.29,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n63%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 161,
    "confidence": {
      "confidence_score": 62.9,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 3,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*