# Dissertation Validation Evidence: Case Study CS03
**Case Title**: Heritage Hill-Country Residence (Kandy Highland/Intermediate)  
**Execution Timestamp**: 2026-07-23 12:02:58  
**Backend Pipeline Latency**: 4755.2 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `75.29` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `80.02` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `61.12` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `61.1% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Low (Low Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Residential
- **Location**: Kandy (Sri Lanka)
- **Floor Count**: 3 Floors | **Total Gross Area**: 300.0 m²
- **Structural System**: Load-Bearing Masonry
- **Budget Tier**: Premium | **Sustainability Priority**: High

### Microclimate Environmental Snapshot
- **Climate Zone**: Intermediate Tropical
- **Temperature Range**: 30.4°C
- **Humidity**: 50%
- **Annual Rainfall**: 1800mm
- **Salinity Level**: Low
- **Exposure Score**: 19.6 (Low)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Foundation** | Gr. 25 Standard Concrete Foundation | `72.93` | `78.92` | `54.97` | 0.45 | 50 yrs | 55 |
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `72.04` | `75.92` | `60.39` | 0.22 | 80 yrs | 85 |
| **Roofing** | Recycled Rubber Flat Roof Membrane | `76.44` | `80.89` | `63.10` | 0.3 | 35 yrs | 75 |
| **Windows** | uPVC Multi-Chamber Window System | `75.50` | `80.09` | `61.72` | 0.28 | 45 yrs | 82 |
| **Doors** | Solid Teak Timber Door (Premium) | `76.10` | `80.44` | `63.08` | 0.22 | 80 yrs | 75 |
| **Flooring** | Polished Terrazzo Flooring (Marble Aggregate) | `77.19` | `81.60` | `63.97` | 0.22 | 65 yrs | 75 |
| **Ceiling** | Bamboo-Fibre Acoustic Ceiling Panel | `76.53` | `80.84` | `63.61` | 0.05 | 25 yrs | 95 |
| **Finishes** | Eco-Friendly Low VOC Emulsion | `74.52` | `80.56` | `56.41` | 0.12 | 15 yrs | 95 |
| **Waterproofing** | Crystalline Slurry Waterproofing (Penetrating) | `76.39` | `80.91` | `62.84` | 0.05 | 60 yrs | 58 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Foundation: Gr. 25 Standard Concrete Foundation
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Structural capacity (75.0/100) adequate for 3-storey low-to-medium rise occupancy
- ✓ Fire resistance rating (95.0/100) exceeds the 60/100 minimum required for Foundation in occupied buildings
- ✓ Service life of 50 years meets the 50-year design life target
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Suitable for standard soil humidity and intermediate tropical rainfall ranges.  
✓ Offers stable foundation support with a service life of 50 years under moderate loads.  
✓ Standard concrete mix with standard carbon footprint (0.45 kgCO2/kg).  
Machine Learning confidence:  
55%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Walls: Wire-Cut Clay Brick (Premium Grade)
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Structural capacity (68.0/100) adequate for 3-storey low-to-medium rise occupancy
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

### Roofing: Recycled Rubber Flat Roof Membrane
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Moderate embodied carbon (0.3 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (75.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Standard climate compatibility with enhanced resilience to moisture variability.  
✓ Meets target durability with high moisture resistance and structural stability under typical tropical loads.  
✓ Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).  
Machine Learning confidence:  
63%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Windows: uPVC Multi-Chamber Window System
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (82.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
62%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Doors: Solid Teak Timber Door (Premium)
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Service life of 80 years exceeds the 50-year design life target for doors components
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (75.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.  
Machine Learning confidence:  
63%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Flooring: Polished Terrazzo Flooring (Marble Aggregate)
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
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
64%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Ceiling: Bamboo-Fibre Acoustic Ceiling Panel
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
- ✓ Sustainability rating (95.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.  
Machine Learning confidence:  
64%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Finishes: Eco-Friendly Low VOC Emulsion
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Low embodied carbon (0.12 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
- ✓ Sustainability rating (95.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.  
Machine Learning confidence:  
56%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Waterproofing: Crystalline Slurry Waterproofing (Penetrating)
**Engineering Evaluation Criteria Passed**:
- ✓ Climate compatibility verified for Kandy (Intermediate Tropical zone)
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 1800mm annual rainfall.  
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
    "category": "Flooring",
    "item_name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "dataset_source": "materials.db",
    "dataset_row": 160,
    "ml_score": 63.97,
    "engineering_score": 81.6,
    "hybrid_score": 77.19,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n64%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 160,
    "confidence": {
      "confidence_score": 64.0,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "dataset_source": "materials.db",
    "dataset_row": 167,
    "ml_score": 63.61,
    "engineering_score": 80.84,
    "hybrid_score": 76.53,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n64%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 167,
    "confidence": {
      "confidence_score": 63.6,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Roofing",
    "item_name": "Recycled Rubber Flat Roof Membrane",
    "dataset_source": "materials.db",
    "dataset_row": 146,
    "ml_score": 63.1,
    "engineering_score": 80.89,
    "hybrid_score": 76.44,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).\nMachine Learning confidence:\n63%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 146,
    "confidence": {
      "confidence_score": 63.1,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Waterproofing",
    "item_name": "Crystalline Slurry Waterproofing (Penetrating)",
    "dataset_source": "materials.db",
    "dataset_row": 173,
    "ml_score": 62.84,
    "engineering_score": 80.91,
    "hybrid_score": 76.39,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 1800mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n63%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 173,
    "confidence": {
      "confidence_score": 62.8,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 1800mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "Solid Teak Timber Door (Premium)",
    "dataset_source": "materials.db",
    "dataset_row": 153,
    "ml_score": 63.08,
    "engineering_score": 80.44,
    "hybrid_score": 76.1,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n63%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 153,
    "confidence": {
      "confidence_score": 63.1,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "FRP Fiberglass Reinforced Door",
    "dataset_source": "materials.db",
    "dataset_row": 155,
    "ml_score": 61.89,
    "engineering_score": 80.78,
    "hybrid_score": 76.06,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 155,
    "confidence": {
      "confidence_score": 61.9,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Zinc-Aluminium Corrugated Sheet (55% Al-Zn)",
    "dataset_source": "materials.db",
    "dataset_row": 143,
    "ml_score": 61.68,
    "engineering_score": 80.78,
    "hybrid_score": 76.0,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Intermediate Tropical climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 143,
    "confidence": {
      "confidence_score": 61.7,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 2,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Intermediate Tropical climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Marine-Grade Aluminium Roofing (0.55mm)",
    "dataset_source": "materials.db",
    "dataset_row": 139,
    "ml_score": 61.67,
    "engineering_score": 80.22,
    "hybrid_score": 75.58,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Intermediate Tropical climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 139,
    "confidence": {
      "confidence_score": 61.7,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 3,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Intermediate Tropical climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "uPVC Multi-Chamber Window System",
    "dataset_source": "materials.db",
    "dataset_row": 147,
    "ml_score": 61.72,
    "engineering_score": 80.09,
    "hybrid_score": 75.5,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 147,
    "confidence": {
      "confidence_score": 61.7,
      "confidence_level": "Medium"
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 80.0
  },
  {
    "category": "Doors",
    "item_name": "UPVC Sliding Door (Weather-Sealed)",
    "dataset_source": "materials.db",
    "dataset_row": 159,
    "ml_score": 61.81,
    "engineering_score": 79.82,
    "hybrid_score": 75.32,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.\nMachine Learning confidence:\n62%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 159,
    "confidence": {
      "confidence_score": 61.8,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 3,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 80.0
  },
  {
    "category": "Flooring",
    "item_name": "Porcelain GVT Slab (Full-Body Vitrified)",
    "dataset_source": "materials.db",
    "dataset_row": 161,
    "ml_score": 60.82,
    "engineering_score": 79.44,
    "hybrid_score": 74.78,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n61%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 161,
    "confidence": {
      "confidence_score": 60.8,
      "confidence_level": "Medium"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 6,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Calcium Silicate Board Ceiling",
    "dataset_source": "materials.db",
    "dataset_row": 170,
    "ml_score": 59.01,
    "engineering_score": 79.93,
    "hybrid_score": 74.7,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n59%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 170,
    "confidence": {
      "confidence_score": 59.0,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 80.0
  },
  {
    "category": "Doors",
    "item_name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "dataset_source": "materials.db",
    "dataset_row": 154,
    "ml_score": 59.21,
    "engineering_score": 79.76,
    "hybrid_score": 74.62,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n59%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 154,
    "confidence": {
      "confidence_score": 59.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 4,
    "ml_rank": 5,
    "hybrid_rank": 4,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Casement Aluminium Window (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 148,
    "ml_score": 60.13,
    "engineering_score": 79.44,
    "hybrid_score": 74.61,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n60%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 148,
    "confidence": {
      "confidence_score": 60.1,
      "confidence_level": "Medium"
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Finishing",
    "item_name": "Eco-Friendly Low VOC Emulsion",
    "dataset_source": "materials.db",
    "dataset_row": 179,
    "ml_score": 56.41,
    "engineering_score": 80.56,
    "hybrid_score": 74.52,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 179,
    "confidence": {
      "confidence_score": 56.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 20.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*