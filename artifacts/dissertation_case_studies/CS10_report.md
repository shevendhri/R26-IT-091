# Dissertation Validation Evidence: Case Study CS10
**Case Title**: Industrial Logistics Facility (Hambantota Southern Port)  
**Execution Timestamp**: 2026-07-23 12:03:37  
**Backend Pipeline Latency**: 4911.4 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `72.94` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `79.38` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `53.63` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `53.6% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Very High (High Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Warehouse
- **Location**: Hambantota (Sri Lanka)
- **Floor Count**: 1 Floors | **Total Gross Area**: 2500.0 m²
- **Structural System**: Steel Frame
- **Budget Tier**: Balanced | **Sustainability Priority**: Low

### Microclimate Environmental Snapshot
- **Climate Zone**: Dry Zone Tropical Arid
- **Temperature Range**: 30.4°C
- **Humidity**: 69%
- **Annual Rainfall**: 1000mm
- **Salinity Level**: High
- **Exposure Score**: 77.8 (Very High)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Foundation** | Eco-Concrete Foundation (30% Recycled Aggregate) | `69.58` | `75.92` | `50.58` | 0.3 | 50 yrs | 90 |
| **Concrete** | Eco-Concrete (Recycled Aggregate + Fly-Ash) | `69.75` | `76.25` | `50.25` | 0.28 | 50 yrs | 92 |
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `69.49` | `75.17` | `52.45` | 0.22 | 80 yrs | 85 |
| **Roofing** | Zinc-Aluminium Corrugated Sheet (55% Al-Zn) | `77.13` | `84.78` | `54.19` | 0.42 | 50 yrs | 60 |
| **Windows** | Casement Aluminium Window (Powder-Coated) | `75.53` | `83.44` | `51.79` | 0.45 | 40 yrs | 55 |
| **Doors** | Aluminium Profile Glass Door (Heavy-Duty) | `76.86` | `83.76` | `56.16` | 0.58 | 50 yrs | 52 |
| **Flooring** | Polished Terrazzo Flooring (Marble Aggregate) | `71.63` | `76.60` | `56.72` | 0.22 | 65 yrs | 75 |
| **Ceiling** | Suspended Metal Tile Ceiling (Aluminium) | `76.25` | `83.84` | `53.48` | 0.45 | 40 yrs | 58 |
| **Finishes** | Advanced Nano-Exterior Paint | `74.50` | `81.44` | `53.69` | 0.25 | 12 yrs | 65 |
| **Waterproofing** | Bituminous Modified Membrane (Torch-Applied) | `68.71` | `72.62` | `56.98` | 0.45 | 20 yrs | 38 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Foundation: Eco-Concrete Foundation (30% Recycled Aggregate)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (72.0/100) adequate for 1-storey low-to-medium rise occupancy
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
51%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Concrete: Eco-Concrete (Recycled Aggregate + Fly-Ash)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (75.0/100) adequate for 1-storey low-to-medium rise occupancy
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
50%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Walls: Wire-Cut Clay Brick (Premium Grade)
**Engineering Evaluation Criteria Passed**:
- ✓ Structural capacity (68.0/100) adequate for 1-storey low-to-medium rise occupancy
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
52%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) rated suitable for moderate coastal salinity at Hambantota
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
- ✓ Service life of 50 years meets the 50-year design life target
- ✓ Good sustainability rating (60.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.  
Machine Learning confidence:  
54%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Windows: Casement Aluminium Window (Powder-Coated)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) rated suitable for moderate coastal salinity at Hambantota
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
52%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: Aluminium Profile Glass Door (Heavy-Duty)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (95.0/100) rated suitable for moderate coastal salinity at Hambantota
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
- ✓ Service life of 50 years meets the 50-year design life target
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.  
Machine Learning confidence:  
56%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Flooring: Polished Terrazzo Flooring (Marble Aggregate)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (78.0/100) rated suitable for moderate coastal salinity at Hambantota
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
57%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Ceiling: Suspended Metal Tile Ceiling (Aluminium)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (92.0/100) rated suitable for moderate coastal salinity at Hambantota
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
53%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Finishes: Advanced Nano-Exterior Paint
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (90.0/100) rated suitable for moderate coastal salinity at Hambantota
- ✓ Moderate embodied carbon (0.25 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (65.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.  
Machine Learning confidence:  
54%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Waterproofing: Bituminous Modified Membrane (Torch-Applied)
**Engineering Evaluation Criteria Passed**:
- ✓ Corrosion resistance (82.0/100) rated suitable for moderate coastal salinity at Hambantota
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 1000mm annual rainfall.  
✓ High moisture resistance (92/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
57%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

---

## 5. Execution Trace & Audit Log (Filtered Excerpt)
Trace of candidate filtering, veto checks, and rule evaluations executed during pipeline run:

```json
[
  {
    "category": "Roofing",
    "item_name": "Zinc-Aluminium Corrugated Sheet (55% Al-Zn)",
    "dataset_source": "materials.db",
    "dataset_row": 143,
    "ml_score": 54.19,
    "engineering_score": 84.78,
    "hybrid_score": 77.13,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n54%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 143,
    "confidence": {
      "confidence_score": 54.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
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
    "ml_score": 56.16,
    "engineering_score": 83.76,
    "hybrid_score": 76.86,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 154,
    "confidence": {
      "confidence_score": 56.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 4,
    "hybrid_rank": 1,
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
    "category": "Ceiling",
    "item_name": "Suspended Metal Tile Ceiling (Aluminium)",
    "dataset_source": "materials.db",
    "dataset_row": 171,
    "ml_score": 53.48,
    "engineering_score": 83.84,
    "hybrid_score": 76.25,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n53%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 171,
    "confidence": {
      "confidence_score": 53.5,
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
    "category": "Windows",
    "item_name": "Casement Aluminium Window (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 148,
    "ml_score": 51.79,
    "engineering_score": 83.44,
    "hybrid_score": 75.53,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n52%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 148,
    "confidence": {
      "confidence_score": 51.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
    "hybrid_rank": 1,
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
    "category": "Windows",
    "item_name": "Fixed Aluminium Framed Glass Panel",
    "dataset_source": "materials.db",
    "dataset_row": 151,
    "ml_score": 51.46,
    "engineering_score": 83.22,
    "hybrid_score": 75.28,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 151,
    "confidence": {
      "confidence_score": 51.5,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
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
    "category": "Finishing",
    "item_name": "Advanced Nano-Exterior Paint",
    "dataset_source": "materials.db",
    "dataset_row": 178,
    "ml_score": 53.69,
    "engineering_score": 81.44,
    "hybrid_score": 74.5,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.\nMachine Learning confidence:\n54%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 178,
    "confidence": {
      "confidence_score": 53.7,
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
    "item_name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "dataset_source": "materials.db",
    "dataset_row": 160,
    "ml_score": 56.72,
    "engineering_score": 76.6,
    "hybrid_score": 71.63,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n57%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 160,
    "confidence": {
      "confidence_score": 56.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 2,
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
    "category": "Doors",
    "item_name": "Solid Teak Timber Door (Premium)",
    "dataset_source": "materials.db",
    "dataset_row": 153,
    "ml_score": 56.76,
    "engineering_score": 75.44,
    "hybrid_score": 70.77,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n57%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 153,
    "confidence": {
      "confidence_score": 56.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 2,
    "hybrid_rank": 2,
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
    "category": "Ceiling",
    "item_name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "dataset_source": "materials.db",
    "dataset_row": 167,
    "ml_score": 52.02,
    "engineering_score": 75.84,
    "hybrid_score": 69.89,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n52%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 167,
    "confidence": {
      "confidence_score": 52.0,
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Flooring",
    "item_name": "Porcelain GVT Slab (Full-Body Vitrified)",
    "dataset_source": "materials.db",
    "dataset_row": 161,
    "ml_score": 56.07,
    "engineering_score": 74.44,
    "hybrid_score": 69.85,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n56%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 161,
    "confidence": {
      "confidence_score": 56.1,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 4,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Acceptable",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Concrete",
    "item_name": "Eco-Concrete (Recycled Aggregate + Fly-Ash)",
    "dataset_source": "materials.db",
    "dataset_row": 126,
    "ml_score": 50.25,
    "engineering_score": 76.25,
    "hybrid_score": 69.75,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (88/100).\nMachine Learning confidence:\n50%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 126,
    "confidence": {
      "confidence_score": 50.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (88/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 20.0
  },
  {
    "category": "Flooring",
    "item_name": "Standard Ceramic Floor Tile",
    "dataset_source": "materials.db",
    "dataset_row": 162,
    "ml_score": 59.77,
    "engineering_score": 72.89,
    "hybrid_score": 69.61,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.\nMachine Learning confidence:\n60%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nHIGH",
    "material_id": 162,
    "confidence": {
      "confidence_score": 59.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 4,
    "ml_rank": 1,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Acceptable",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Foundation",
    "item_name": "Eco-Concrete Foundation (30% Recycled Aggregate)",
    "dataset_source": "materials.db",
    "dataset_row": 121,
    "ml_score": 50.58,
    "engineering_score": 75.92,
    "hybrid_score": 69.58,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Standard climate compatibility with enhanced resilience to moisture variability.\n\u2713 Meets target durability with high moisture resistance and structural stability under typical tropical loads.\n\u2713 Features low embodied carbon (0.3 kgCO2/kg) and high recyclability (85/100).\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 121,
    "confidence": {
      "confidence_score": 50.6,
      "confidence_level": "Low"
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
    "climate_confidence": 20.0
  },
  {
    "category": "Walling",
    "item_name": "Wire-Cut Clay Brick (Premium Grade)",
    "dataset_source": "materials.db",
    "dataset_row": 133,
    "ml_score": 52.45,
    "engineering_score": 75.17,
    "hybrid_score": 69.49,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Excellent thermal mass performance for regulating indoor temperatures in warm climates.\n\u2713 High structural integrity and fire resistance, lasting over 50 years with minimal maintenance.\n\u2713 Utilizes earth-based materials, offering high potential for thermal efficiency and long service life.\nMachine Learning confidence:\n52%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 133,
    "confidence": {
      "confidence_score": 52.5,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 1,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Excellent thermal mass performance for regulating indoor temperatures in warm climates.",
      "durability": "High structural integrity and fire resistance, lasting over 50 years with minimal maintenance.",
      "sustainability": "Utilizes earth-based materials, offering high potential for thermal efficiency and long service life.",
      "cost": "Offers long-term economic value through reduced energy demand and high durability."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Doors",
    "item_name": "Steel Security Door (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 157,
    "ml_score": 56.66,
    "engineering_score": 72.89,
    "hybrid_score": 68.83,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.\nMachine Learning confidence:\n57%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 157,
    "confidence": {
      "confidence_score": 56.7,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 3,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Acceptable",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*