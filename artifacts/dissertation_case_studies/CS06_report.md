# Dissertation Validation Evidence: Case Study CS06
**Case Title**: Corporate Tech Office Tower (Colombo Business District)  
**Execution Timestamp**: 2026-07-23 12:03:14  
**Backend Pipeline Latency**: 4769.0 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `72.02` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `81.52` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `43.52` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `43.5% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Very High (Extreme Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Office
- **Location**: Colombo (Sri Lanka)
- **Floor Count**: 5 Floors | **Total Gross Area**: 750.0 m²
- **Structural System**: Concrete Frame
- **Budget Tier**: Premium | **Sustainability Priority**: High

### Microclimate Environmental Snapshot
- **Climate Zone**: Moderate Coastal Humid
- **Temperature Range**: 30.4°C
- **Humidity**: 65%
- **Annual Rainfall**: 2400mm
- **Salinity Level**: Extreme
- **Exposure Score**: 87.60000000000001 (Very High)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `59.58` | `66.92` | `37.55` | 0.22 | 80 yrs | 85 |
| **Roofing** | Zinc-Aluminium Corrugated Sheet (55% Al-Zn) | `74.19` | `84.78` | `42.44` | 0.42 | 50 yrs | 60 |
| **Windows** | uPVC Multi-Chamber Window System | `73.32` | `84.09` | `41.00` | 0.28 | 45 yrs | 82 |
| **Doors** | FRP Fiberglass Reinforced Door | `74.92` | `84.78` | `45.32` | 0.48 | 60 yrs | 65 |
| **Flooring** | Recycled Composite Decking (WPC) | `72.47` | `81.38` | `45.75` | 0.22 | 30 yrs | 90 |
| **Ceiling** | Suspended Metal Tile Ceiling (Aluminium) | `73.62` | `83.84` | `42.95` | 0.45 | 40 yrs | 58 |
| **Finishes** | Advanced Nano-Exterior Paint | `72.51` | `81.44` | `45.72` | 0.25 | 12 yrs | 65 |
| **Waterproofing** | Crystalline Slurry Waterproofing (Penetrating) | `75.54` | `84.91` | `47.43` | 0.05 | 60 yrs | 58 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Walls: Wire-Cut Clay Brick (Premium Grade)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (68.0/100) adequate for 5-storey low-to-medium rise occupancy
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
38%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
- ✓ Service life of 50 years meets the 50-year design life target
- ✓ Good sustainability rating (60.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Moderate Coastal Humid climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.  
Machine Learning confidence:  
42%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Windows: uPVC Multi-Chamber Window System
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (82.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
41%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: FRP Fiberglass Reinforced Door
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.  
Machine Learning confidence:  
45%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Flooring: Recycled Composite Decking (WPC)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (90.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Standard climate compatibility with enhanced resilience to moisture variability.  
✓ Meets target durability with high moisture resistance and structural stability under typical tropical loads.  
✓ Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).  
Machine Learning confidence:  
46%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Ceiling: Suspended Metal Tile Ceiling (Aluminium)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
43%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Finishes: Advanced Nano-Exterior Paint
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (90.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
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

### Waterproofing: Crystalline Slurry Waterproofing (Penetrating)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (95.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Colombo
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 2400mm annual rainfall.  
✓ High moisture resistance (100/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.  
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
    "category": "Waterproofing",
    "item_name": "Crystalline Slurry Waterproofing (Penetrating)",
    "dataset_source": "materials.db",
    "dataset_row": 173,
    "ml_score": 47.43,
    "engineering_score": 84.91,
    "hybrid_score": 75.54,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 2400mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n47%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 173,
    "confidence": {
      "confidence_score": 47.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 2400mm annual rainfall.",
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
    "item_name": "FRP Fiberglass Reinforced Door",
    "dataset_source": "materials.db",
    "dataset_row": 155,
    "ml_score": 45.32,
    "engineering_score": 84.78,
    "hybrid_score": 74.92,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n45%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 155,
    "confidence": {
      "confidence_score": 45.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
    "hybrid_rank": 1,
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
    "category": "Waterproofing",
    "item_name": "HDPE Sheet Waterproofing Barrier",
    "dataset_source": "materials.db",
    "dataset_row": 176,
    "ml_score": 44.74,
    "engineering_score": 84.78,
    "hybrid_score": 74.77,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 2400mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.\nMachine Learning confidence:\n45%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 176,
    "confidence": {
      "confidence_score": 44.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 2400mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.",
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
    "ml_score": 42.44,
    "engineering_score": 84.78,
    "hybrid_score": 74.19,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Moderate Coastal Humid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n42%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 143,
    "confidence": {
      "confidence_score": 42.4,
      "confidence_level": "Low"
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Suspended Metal Tile Ceiling (Aluminium)",
    "dataset_source": "materials.db",
    "dataset_row": 171,
    "ml_score": 42.95,
    "engineering_score": 83.84,
    "hybrid_score": 73.62,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n43%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 171,
    "confidence": {
      "confidence_score": 43.0,
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Marine-Grade Aluminium Roofing (0.55mm)",
    "dataset_source": "materials.db",
    "dataset_row": 139,
    "ml_score": 41.34,
    "engineering_score": 84.22,
    "hybrid_score": 73.5,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Moderate Coastal Humid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n41%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 139,
    "confidence": {
      "confidence_score": 41.3,
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "dataset_source": "materials.db",
    "dataset_row": 154,
    "ml_score": 42.25,
    "engineering_score": 83.76,
    "hybrid_score": 73.38,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n42%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 154,
    "confidence": {
      "confidence_score": 42.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 4,
    "hybrid_rank": 2,
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
    "item_name": "uPVC Multi-Chamber Window System",
    "dataset_source": "materials.db",
    "dataset_row": 147,
    "ml_score": 41.0,
    "engineering_score": 84.09,
    "hybrid_score": 73.32,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n41%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 147,
    "confidence": {
      "confidence_score": 41.0,
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 80.0
  },
  {
    "category": "Doors",
    "item_name": "UPVC Sliding Door (Weather-Sealed)",
    "dataset_source": "materials.db",
    "dataset_row": 159,
    "ml_score": 41.71,
    "engineering_score": 83.82,
    "hybrid_score": 73.29,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.32 kgCO2/kg.\nMachine Learning confidence:\n42%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 159,
    "confidence": {
      "confidence_score": 41.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 5,
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
    "category": "Windows",
    "item_name": "Casement Aluminium Window (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 148,
    "ml_score": 41.15,
    "engineering_score": 83.44,
    "hybrid_score": 72.87,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n41%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 148,
    "confidence": {
      "confidence_score": 41.1,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 1,
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
    "item_name": "Advanced Nano-Exterior Paint",
    "dataset_source": "materials.db",
    "dataset_row": 178,
    "ml_score": 45.72,
    "engineering_score": 81.44,
    "hybrid_score": 72.51,
    "ranking": 11,
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
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Flooring",
    "item_name": "Recycled Composite Decking (WPC)",
    "dataset_source": "materials.db",
    "dataset_row": 166,
    "ml_score": 45.75,
    "engineering_score": 81.38,
    "hybrid_score": 72.47,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).\nMachine Learning confidence:\n46%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 166,
    "confidence": {
      "confidence_score": 45.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Fixed Aluminium Framed Glass Panel",
    "dataset_source": "materials.db",
    "dataset_row": 151,
    "ml_score": 39.98,
    "engineering_score": 83.22,
    "hybrid_score": 72.41,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n40%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 151,
    "confidence": {
      "confidence_score": 40.0,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 4,
    "ml_rank": 4,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Sliding Aluminium Window (Impact-Resistant)",
    "dataset_source": "materials.db",
    "dataset_row": 152,
    "ml_score": 39.4,
    "engineering_score": 83.33,
    "hybrid_score": 72.35,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.\nMachine Learning confidence:\n39%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 152,
    "confidence": {
      "confidence_score": 39.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 5,
    "hybrid_rank": 4,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Recycled Rubber Flat Roof Membrane",
    "dataset_source": "materials.db",
    "dataset_row": 146,
    "ml_score": 45.2,
    "engineering_score": 75.89,
    "hybrid_score": 68.22,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).\nMachine Learning confidence:\n45%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 146,
    "confidence": {
      "confidence_score": 45.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 1,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*