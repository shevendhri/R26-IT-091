# Dissertation Validation Evidence: Case Study CS09
**Case Title**: Secondary School Complex (Batticaloa Eastern Coastal)  
**Execution Timestamp**: 2026-07-23 12:03:32  
**Backend Pipeline Latency**: 4723.2 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `76.64` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `84.77` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `52.23` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `52.2% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Very High (Extreme Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: School
- **Location**: Batticaloa (Sri Lanka)
- **Floor Count**: 2 Floors | **Total Gross Area**: 900.0 m²
- **Structural System**: Concrete Frame
- **Budget Tier**: Budget | **Sustainability Priority**: Medium

### Microclimate Environmental Snapshot
- **Climate Zone**: Extreme Coastal Saline
- **Temperature Range**: 32.0°C
- **Humidity**: 64%
- **Annual Rainfall**: 1200mm
- **Salinity Level**: Extreme
- **Exposure Score**: 84.8 (Very High)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `70.05` | `76.67` | `50.17` | 0.22 | 80 yrs | 85 |
| **Roofing** | Marine-Grade Aluminium Roofing (0.55mm) | `72.52` | `79.62` | `51.20` | 0.48 | 45 yrs | 65 |
| **Windows** | Casement Aluminium Window (Powder-Coated) | `80.79` | `90.84` | `50.63` | 0.45 | 40 yrs | 55 |
| **Doors** | FRP Fiberglass Reinforced Door | `74.05` | `80.18` | `55.64` | 0.48 | 60 yrs | 65 |
| **Flooring** | Rubber Flooring (Recycled Automotive) | `79.09` | `88.16` | `51.87` | 0.28 | 30 yrs | 80 |
| **Ceiling** | Calcium Silicate Board Ceiling | `75.45` | `83.93` | `50.01` | 0.28 | 30 yrs | 62 |
| **Finishes** | Advanced Nano-Exterior Paint | `78.08` | `86.44` | `53.01` | 0.25 | 12 yrs | 65 |
| **Waterproofing** | Crystalline Slurry Waterproofing (Penetrating) | `83.07` | `92.31` | `55.34` | 0.05 | 60 yrs | 58 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
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
50%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Roofing: Marine-Grade Aluminium Roofing (0.55mm)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (98.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Batticaloa
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Extreme Coastal Saline climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.  
Machine Learning confidence:  
51%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Windows: Casement Aluminium Window (Powder-Coated)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Batticaloa
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
51%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: FRP Fiberglass Reinforced Door
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (100.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Batticaloa
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.  
Machine Learning confidence:  
56%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Flooring: Rubber Flooring (Recycled Automotive)
**Engineering Evaluation Criteria Passed**:
- ✓ Adequate corrosion resistance (88.0/100) for moderate coastal salinity conditions at Batticaloa
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Sustainability rating (80.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Standard climate compatibility with enhanced resilience to moisture variability.  
✓ Meets target durability with high moisture resistance and structural stability under typical tropical loads.  
✓ Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (92/100).  
Machine Learning confidence:  
52%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Ceiling: Calcium Silicate Board Ceiling
**Engineering Evaluation Criteria Passed**:
- ✓ Adequate corrosion resistance (85.0/100) for moderate coastal salinity conditions at Batticaloa
- ✓ Fire resistance rating (90.0/100) exceeds the 60/100 minimum required for Ceiling in occupied buildings
- ✓ Moderate embodied carbon (0.28 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (62.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.  
Machine Learning confidence:  
50%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Finishes: Advanced Nano-Exterior Paint
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (90.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Batticaloa
- ✓ Moderate embodied carbon (0.25 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.  
Machine Learning confidence:  
53%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Waterproofing: Crystalline Slurry Waterproofing (Penetrating)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (95.0/100) meets the minimum 90/100 threshold for extreme coastal saline exposure at Batticaloa
- ✓ Service life of 60 years meets the 50-year design life target
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 1200mm annual rainfall.  
✓ High moisture resistance (100/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.  
Machine Learning confidence:  
55%  
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
    "ml_score": 55.34,
    "engineering_score": 92.31,
    "hybrid_score": 83.07,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 1200mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 173,
    "confidence": {
      "confidence_score": 55.3,
      "confidence_level": "Low"
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
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Windows",
    "item_name": "Casement Aluminium Window (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 148,
    "ml_score": 50.63,
    "engineering_score": 90.84,
    "hybrid_score": 80.79,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 148,
    "confidence": {
      "confidence_score": 50.6,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
    "hybrid_rank": 1,
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
    "ml_score": 51.41,
    "engineering_score": 89.09,
    "hybrid_score": 79.67,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 147,
    "confidence": {
      "confidence_score": 51.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 1,
    "hybrid_rank": 2,
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
    "category": "Flooring",
    "item_name": "Rubber Flooring (Recycled Automotive)",
    "dataset_source": "materials.db",
    "dataset_row": 164,
    "ml_score": 51.87,
    "engineering_score": 88.16,
    "hybrid_score": 79.09,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (92/100).\nMachine Learning confidence:\n52%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 164,
    "confidence": {
      "confidence_score": 51.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 6,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (92/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Finishing",
    "item_name": "Advanced Nano-Exterior Paint",
    "dataset_source": "materials.db",
    "dataset_row": 178,
    "ml_score": 53.01,
    "engineering_score": 86.44,
    "hybrid_score": 78.08,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.\nMachine Learning confidence:\n53%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 178,
    "confidence": {
      "confidence_score": 53.0,
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
    "recommendation_quality": "Very Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 60.0
  },
  {
    "category": "Ceiling",
    "item_name": "Calcium Silicate Board Ceiling",
    "dataset_source": "materials.db",
    "dataset_row": 170,
    "ml_score": 50.01,
    "engineering_score": 83.93,
    "hybrid_score": 75.45,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.\nMachine Learning confidence:\n50%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 170,
    "confidence": {
      "confidence_score": 50.0,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 4,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 100.0,
    "climate_confidence": 80.0
  },
  {
    "category": "Doors",
    "item_name": "FRP Fiberglass Reinforced Door",
    "dataset_source": "materials.db",
    "dataset_row": 155,
    "ml_score": 55.64,
    "engineering_score": 80.18,
    "hybrid_score": 74.05,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 155,
    "confidence": {
      "confidence_score": 55.6,
      "confidence_level": "Low"
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Waterproofing",
    "item_name": "HDPE Sheet Waterproofing Barrier",
    "dataset_source": "materials.db",
    "dataset_row": 176,
    "ml_score": 53.71,
    "engineering_score": 80.18,
    "hybrid_score": 73.56,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 1200mm annual rainfall.\n\u2713 High moisture resistance (100/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.\nMachine Learning confidence:\n54%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 176,
    "confidence": {
      "confidence_score": 53.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 1200mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.",
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
    "ml_score": 54.77,
    "engineering_score": 79.38,
    "hybrid_score": 73.23,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.22 kgCO2/kg) and high recyclability (92/100).\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 166,
    "confidence": {
      "confidence_score": 54.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
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
    "category": "Doors",
    "item_name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "dataset_source": "materials.db",
    "dataset_row": 154,
    "ml_score": 54.6,
    "engineering_score": 79.16,
    "hybrid_score": 73.02,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 154,
    "confidence": {
      "confidence_score": 54.6,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
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
    "category": "Flooring",
    "item_name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "dataset_source": "materials.db",
    "dataset_row": 160,
    "ml_score": 54.73,
    "engineering_score": 78.6,
    "hybrid_score": 72.63,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 160,
    "confidence": {
      "confidence_score": 54.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 5,
    "hybrid_rank": 3,
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
    "category": "Flooring",
    "item_name": "Porcelain GVT Slab (Full-Body Vitrified)",
    "dataset_source": "materials.db",
    "dataset_row": 161,
    "ml_score": 54.93,
    "engineering_score": 78.44,
    "hybrid_score": 72.56,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 161,
    "confidence": {
      "confidence_score": 54.9,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 4,
    "ml_rank": 3,
    "hybrid_rank": 4,
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
    "category": "Roofing",
    "item_name": "Marine-Grade Aluminium Roofing (0.55mm)",
    "dataset_source": "materials.db",
    "dataset_row": 139,
    "ml_score": 51.2,
    "engineering_score": 79.62,
    "hybrid_score": 72.52,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Extreme Coastal Saline climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 139,
    "confidence": {
      "confidence_score": 51.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Extreme Coastal Saline climate.",
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
    "ml_score": 52.73,
    "engineering_score": 78.18,
    "hybrid_score": 71.82,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Extreme Coastal Saline climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n53%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 143,
    "confidence": {
      "confidence_score": 52.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 2,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Extreme Coastal Saline climate.",
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
    "ml_score": 50.82,
    "engineering_score": 78.73,
    "hybrid_score": 71.75,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 152,
    "confidence": {
      "confidence_score": 50.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 2,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.4 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*