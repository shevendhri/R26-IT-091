# Dissertation Validation Evidence: Case Study CS04
**Case Title**: Dry Zone Housing Unit (Jaffna Northern Saline/Dry)  
**Execution Timestamp**: 2026-07-23 12:03:03  
**Backend Pipeline Latency**: 5486.8 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `83.21` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `91.29` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `59.00` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `59.0% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Very High (Extreme Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Residential
- **Location**: Jaffna (Sri Lanka)
- **Floor Count**: 2 Floors | **Total Gross Area**: 200.0 m²
- **Structural System**: Load-Bearing Masonry
- **Budget Tier**: Balanced | **Sustainability Priority**: Medium

### Microclimate Environmental Snapshot
- **Climate Zone**: Extreme Coastal Saline
- **Temperature Range**: 30.2°C
- **Humidity**: 74%
- **Annual Rainfall**: 1200mm
- **Salinity Level**: Extreme
- **Exposure Score**: 86.8 (Very High)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Foundation** | Gr. 25 Standard Concrete Foundation | `71.96` | `78.92` | `51.09` | 0.45 | 50 yrs | 55 |
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `74.09` | `78.92` | `59.62` | 0.22 | 80 yrs | 85 |
| **Roofing** | Marine-Grade Aluminium Roofing (0.55mm) | `86.95` | `96.22` | `59.14` | 0.48 | 45 yrs | 65 |
| **Windows** | uPVC Multi-Chamber Window System | `86.64` | `96.09` | `58.30` | 0.28 | 45 yrs | 82 |
| **Doors** | FRP Fiberglass Reinforced Door | `87.72` | `96.78` | `60.54` | 0.48 | 60 yrs | 65 |
| **Flooring** | Recycled Composite Decking (WPC) | `88.21` | `97.38` | `60.70` | 0.22 | 30 yrs | 90 |
| **Ceiling** | Calcium Silicate Board Ceiling | `80.03` | `86.93` | `59.34` | 0.28 | 30 yrs | 62 |
| **Finishes** | Advanced Nano-Exterior Paint | `85.34` | `93.44` | `61.03` | 0.25 | 12 yrs | 65 |
| **Waterproofing** | Crystalline Slurry Waterproofing (Penetrating) | `87.99` | `96.91` | `61.22` | 0.05 | 60 yrs | 58 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Foundation: Gr. 25 Standard Concrete Foundation
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (75.0/100) adequate for 2-storey low-to-medium rise occupancy
- ✓ Fire resistance rating (95.0/100) exceeds the 60/100 minimum required for Foundation in occupied buildings
- ✓ Service life of 50 years meets the 50-year design life target
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Suitable for standard soil humidity and intermediate tropical rainfall ranges.  
✓ Offers stable foundation support with a service life of 50 years under moderate loads.  
✓ Standard concrete mix with standard carbon footprint (0.45 kgCO2/kg).  
Machine Learning confidence:  
51%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Walls: Wire-Cut Clay Brick (Premium Grade)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (68.0/100) adequate for 2-storey low-to-medium rise occupancy
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
60%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Roofing: Marine-Grade Aluminium Roofing (0.55mm)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (98.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Jaffna
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Extreme Coastal Saline climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.  
Machine Learning confidence:  
59%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Windows: uPVC Multi-Chamber Window System
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Jaffna
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (82.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
58%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: FRP Fiberglass Reinforced Door
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Jaffna
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.  
Machine Learning confidence:  
61%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Flooring: Recycled Composite Decking (WPC)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Jaffna
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
LOW

### Ceiling: Calcium Silicate Board Ceiling
**Engineering Evaluation Criteria Passed**:
- ✓ Adequate corrosion resistance (85.0/100) for moderate coastal salinity conditions at Jaffna
- ✓ Fire resistance rating (90.0/100) exceeds the 60/100 minimum required for Ceiling in occupied buildings
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (62.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
59%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Finishes: Advanced Nano-Exterior Paint
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (90.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Jaffna
- ✓ Moderate embodied carbon (0.25 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.  
Machine Learning confidence:  
61%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Waterproofing: Crystalline Slurry Waterproofing (Penetrating)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (95.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Jaffna
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 1200mm annual rainfall.  
✓ High moisture resistance (100/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.  
Machine Learning confidence:  
61%  
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
    "item_name": "Recycled Composite Decking (WPC)",
    "dataset_source": "materials.db",
    "dataset_row": 166,
    "ml_score": 60.7,
    "engineering_score": 97.38,
    "hybrid_score": 88.21,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 166,
    "confidence": {
      "confidence_score": 60.7,
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
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Waterproofing",
    "item_name": "Crystalline Slurry Waterproofing (Penetrating)",
    "dataset_source": "materials.db",
    "dataset_row": 173,
    "ml_score": 61.22,
    "engineering_score": 96.91,
    "hybrid_score": 87.99,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 1200mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 173,
    "confidence": {
      "confidence_score": 61.2,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 1200mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "FRP Fiberglass Reinforced Door",
    "dataset_source": "materials.db",
    "dataset_row": 155,
    "ml_score": 60.54,
    "engineering_score": 96.78,
    "hybrid_score": 87.72,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 155,
    "confidence": {
      "confidence_score": 60.5,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Marine-Grade Aluminium Roofing (0.55mm)",
    "dataset_source": "materials.db",
    "dataset_row": 139,
    "ml_score": 59.14,
    "engineering_score": 96.22,
    "hybrid_score": 86.95,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Extreme Coastal Saline climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n59%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 139,
    "confidence": {
      "confidence_score": 59.1,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 6,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Extreme Coastal Saline climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "uPVC Multi-Chamber Window System",
    "dataset_source": "materials.db",
    "dataset_row": 147,
    "ml_score": 58.3,
    "engineering_score": 96.09,
    "hybrid_score": 86.64,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n58%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 147,
    "confidence": {
      "confidence_score": 58.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Roofing",
    "item_name": "Recycled Rubber Flat Roof Membrane",
    "dataset_source": "materials.db",
    "dataset_row": 146,
    "ml_score": 61.26,
    "engineering_score": 94.89,
    "hybrid_score": 86.48,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 146,
    "confidence": {
      "confidence_score": 61.3,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 1,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "UPVC Sliding Door (Weather-Sealed)",
    "dataset_source": "materials.db",
    "dataset_row": 159,
    "ml_score": 58.36,
    "engineering_score": 95.82,
    "hybrid_score": 86.45,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.\nMachine Learning confidence:\n58%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 159,
    "confidence": {
      "confidence_score": 58.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Doors",
    "item_name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "dataset_source": "materials.db",
    "dataset_row": 154,
    "ml_score": 58.29,
    "engineering_score": 95.76,
    "hybrid_score": 86.39,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n58%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 154,
    "confidence": {
      "confidence_score": 58.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 5,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Zinc-Aluminium Corrugated Sheet (55% Al-Zn)",
    "dataset_source": "materials.db",
    "dataset_row": 143,
    "ml_score": 60.64,
    "engineering_score": 94.78,
    "hybrid_score": 86.25,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Extreme Coastal Saline climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 143,
    "confidence": {
      "confidence_score": 60.6,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 3,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Extreme Coastal Saline climate.",
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
    "item_name": "Casement Aluminium Window (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 148,
    "ml_score": 58.12,
    "engineering_score": 95.44,
    "hybrid_score": 86.11,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n58%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 148,
    "confidence": {
      "confidence_score": 58.1,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 2,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Sliding Aluminium Window (Impact-Resistant)",
    "dataset_source": "materials.db",
    "dataset_row": 152,
    "ml_score": 57.85,
    "engineering_score": 95.33,
    "hybrid_score": 85.96,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.\nMachine Learning confidence:\n58%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 152,
    "confidence": {
      "confidence_score": 57.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 3,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Excellent",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Finishing",
    "item_name": "Advanced Nano-Exterior Paint",
    "dataset_source": "materials.db",
    "dataset_row": 178,
    "ml_score": 61.03,
    "engineering_score": 93.44,
    "hybrid_score": 85.34,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 178,
    "confidence": {
      "confidence_score": 61.0,
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
    "item_name": "Porcelain GVT Slab (Full-Body Vitrified)",
    "dataset_source": "materials.db",
    "dataset_row": 161,
    "ml_score": 60.67,
    "engineering_score": 93.44,
    "hybrid_score": 85.25,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 161,
    "confidence": {
      "confidence_score": 60.7,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 5,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Flooring",
    "item_name": "Micro-Cement Screed Flooring",
    "dataset_source": "materials.db",
    "dataset_row": 165,
    "ml_score": 62.25,
    "engineering_score": 91.78,
    "hybrid_score": 84.4,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 165,
    "confidence": {
      "confidence_score": 62.2,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 2,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Waterproofing",
    "item_name": "Bituminous Modified Membrane (Torch-Applied)",
    "dataset_source": "materials.db",
    "dataset_row": 175,
    "ml_score": 62.26,
    "engineering_score": 91.62,
    "hybrid_score": 84.28,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 1200mm annual rainfall.\n\u2713 High moisture resistance (92/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 175,
    "confidence": {
      "confidence_score": 62.3,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 1,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 1200mm annual rainfall.",
      "durability": "High moisture resistance (92/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 40.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*