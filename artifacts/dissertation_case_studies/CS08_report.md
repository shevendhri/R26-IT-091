# Dissertation Validation Evidence: Case Study CS08
**Case Title**: Regional Base Hospital (Anuradhapura Dry Zone)  
**Execution Timestamp**: 2026-07-23 12:03:27  
**Backend Pipeline Latency**: 9067.5 ms  

## 1. Executive Summary & Scoring Overview
| Metric | Value | Reference Standard / Notes |
|---|---|---|
| **Overall Hybrid Score** | `75.37` / 100 | Formula: (0.75 × Engineering Score) + (0.25 × ML Score) |
| **Engineering Score (MCDM)** | `83.03` / 100 | SLS Compliance, Structural Load & Microclimate Heuristics |
| **ML Score (Predictive)** | `52.40` / 100 | Random Forest Model Trained on Historical Project Data |
| **ML Alignment Confidence** | `52.4% Confidence` | Feature Alignment with Dataset Specifications |
| **Climate Adaptation Profile** | `Exposure Low (Low Salinity)` | Open-Meteo Microclimate Engine Snapshot |
| **Engineering Compliance** | `SLS 614 & BS 8110 Verified (100% Rule Pass)` | Structural Rules & Veto Check Verification |

---

## 2. Project Input & Microclimate Profile
### Input Questionnaire Parameters
- **Building Sector**: Hospital
- **Location**: Anuradhapura (Sri Lanka)
- **Floor Count**: 3 Floors | **Total Gross Area**: 1500.0 m²
- **Structural System**: Concrete Frame
- **Budget Tier**: Balanced | **Sustainability Priority**: High

### Microclimate Environmental Snapshot
- **Climate Zone**: Dry Zone Tropical Arid
- **Temperature Range**: 28°C - 36°C
- **Humidity**: 60%
- **Annual Rainfall**: 1100mm
- **Salinity Level**: Low
- **Exposure Score**: 24.2 (Low)

---

## 3. Recommended Material Specification Package
The table below details the top-ranked material selected by the hybrid MCDM-ML engine for each building element slot:

| Category / Slot | Selected Material | Hybrid Score | Eng Score | ML Score | Carbon (kg CO₂e/kg) | Service Life | Sustainability |
|---|---|---|---|---|---|---|---|
| **Walls** | Wire-Cut Clay Brick (Premium Grade) | `72.31` | `78.92` | `52.48` | 0.22 | 80 yrs | 85 |
| **Roofing** | Zinc-Aluminium Corrugated Sheet (55% Al-Zn) | `74.84` | `82.78` | `51.02` | 0.42 | 50 yrs | 60 |
| **Windows** | Casement Aluminium Window (Powder-Coated) | `73.69` | `81.44` | `50.46` | 0.45 | 40 yrs | 55 |
| **Doors** | Solid Teak Timber Door (Premium) | `77.48` | `84.44` | `56.60` | 0.22 | 80 yrs | 75 |
| **Flooring** | Polished Terrazzo Flooring (Marble Aggregate) | `78.39` | `85.60` | `56.76` | 0.22 | 65 yrs | 75 |
| **Ceiling** | Bamboo-Fibre Acoustic Ceiling Panel | `76.80` | `84.84` | `52.68` | 0.05 | 25 yrs | 95 |
| **Finishes** | Eco-Friendly Low VOC Emulsion | `75.07` | `84.56` | `46.61` | 0.12 | 15 yrs | 95 |
| **Waterproofing** | Bituminous Modified Membrane (Torch-Applied) | `74.36` | `81.62` | `52.56` | 0.45 | 20 yrs | 38 |

---

## 4. Explainable AI (XAI) Justifications & Engineering Reasons
### Walls: Wire-Cut Clay Brick (Premium Grade)
**Engineering Evaluation Criteria Passed**:
- ✓ Thermal rating (88.0/100) optimized for Dry Zone high-temperature conditions (28–36°C ambient) at Anuradhapura
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
52%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn)
**Engineering Evaluation Criteria Passed**:
- ✓ Fire resistance (70.0/100) satisfies minimum requirements
- ✓ Service life of 50 years meets the 50-year design life target
- ✓ Good sustainability rating (60.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.  
Machine Learning confidence:  
51%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Windows: Casement Aluminium Window (Powder-Coated)
**Engineering Evaluation Criteria Passed**:
- ✓ Fire resistance (65.0/100) satisfies minimum requirements
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
50%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Doors: Solid Teak Timber Door (Premium)
**Engineering Evaluation Criteria Passed**:
- ✓ Service life of 80 years exceeds the 50-year design life target for doors components
- ✓ Moderate embodied carbon (0.22 kgCO₂/kg) within sustainability targets
- ✓ Good sustainability rating (75.0/100)
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.  
Machine Learning confidence:  
57%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
MEDIUM

### Flooring: Polished Terrazzo Flooring (Marble Aggregate)
**Engineering Evaluation Criteria Passed**:
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

### Ceiling: Bamboo-Fibre Acoustic Ceiling Panel
**Engineering Evaluation Criteria Passed**:
- ✓ Low embodied carbon (0.05 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
- ✓ Sustainability rating (95.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.  
Machine Learning confidence:  
53%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Finishes: Eco-Friendly Low VOC Emulsion
**Engineering Evaluation Criteria Passed**:
- ✓ Low embodied carbon (0.12 kgCO₂/kg) — qualifies for GREENSLÂ Tier-1 low-carbon specification
- ✓ Sustainability rating (95.0/100) qualifies for Green Building certification credit
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Selected for general compatibility with regional tropical environmental parameters.  
✓ Standard durability profile providing adequate resistance for typical residential application.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.  
Machine Learning confidence:  
47%  
Historical projects with similar characteristics frequently selected this specification.  
Agreement:  
LOW

### Waterproofing: Bituminous Modified Membrane (Torch-Applied)
**Engineering Evaluation Criteria Passed**:
- ✓ Selected by Hybrid AI based on engineering and ML evaluation against SLS structural and environmental standards
**XAI Specification Rationale**:
> Engineering selected this material because:  
✓ Designed to prevent moisture ingress under 1100mm annual rainfall.  
✓ High moisture resistance (92/100) ensuring structural protection.  
✓ Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.  
Machine Learning confidence:  
53%  
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
    "ml_score": 56.76,
    "engineering_score": 85.6,
    "hybrid_score": 78.39,
    "ranking": 1,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n57%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 160,
    "confidence": {
      "confidence_score": 56.8,
      "confidence_level": "Low"
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
    "recommendation_quality": "Very Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Doors",
    "item_name": "Solid Teak Timber Door (Premium)",
    "dataset_source": "materials.db",
    "dataset_row": 153,
    "ml_score": 56.6,
    "engineering_score": 84.44,
    "hybrid_score": 77.48,
    "ranking": 2,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.\nMachine Learning confidence:\n57%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 153,
    "confidence": {
      "confidence_score": 56.6,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
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
    "category": "Ceiling",
    "item_name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "dataset_source": "materials.db",
    "dataset_row": 167,
    "ml_score": 52.68,
    "engineering_score": 84.84,
    "hybrid_score": 76.8,
    "ranking": 3,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.\nMachine Learning confidence:\n53%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 167,
    "confidence": {
      "confidence_score": 52.7,
      "confidence_level": "Low"
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
    "category": "Flooring",
    "item_name": "Porcelain GVT Slab (Full-Body Vitrified)",
    "dataset_source": "materials.db",
    "dataset_row": 161,
    "ml_score": 52.78,
    "engineering_score": 83.44,
    "hybrid_score": 75.78,
    "ranking": 4,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n53%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 161,
    "confidence": {
      "confidence_score": 52.8,
      "confidence_level": "Low"
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
    "category": "Flooring",
    "item_name": "Standard Ceramic Floor Tile",
    "dataset_source": "materials.db",
    "dataset_row": 162,
    "ml_score": 55.04,
    "engineering_score": 81.89,
    "hybrid_score": 75.18,
    "ranking": 5,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.\nMachine Learning confidence:\n55%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 162,
    "confidence": {
      "confidence_score": 55.0,
      "confidence_level": "Low"
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Finishing",
    "item_name": "Eco-Friendly Low VOC Emulsion",
    "dataset_source": "materials.db",
    "dataset_row": 179,
    "ml_score": 46.61,
    "engineering_score": 84.56,
    "hybrid_score": 75.07,
    "ranking": 6,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.\nMachine Learning confidence:\n47%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 179,
    "confidence": {
      "confidence_score": 46.6,
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
  },
  {
    "category": "Doors",
    "item_name": "Steel Security Door (Powder-Coated)",
    "dataset_source": "materials.db",
    "dataset_row": 157,
    "ml_score": 53.84,
    "engineering_score": 81.89,
    "hybrid_score": 74.88,
    "ranking": 7,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.\nMachine Learning confidence:\n54%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 157,
    "confidence": {
      "confidence_score": 53.8,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 3,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Flooring",
    "item_name": "Micro-Cement Screed Flooring",
    "dataset_source": "materials.db",
    "dataset_row": 165,
    "ml_score": 54.18,
    "engineering_score": 81.78,
    "hybrid_score": 74.88,
    "ranking": 8,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.\nMachine Learning confidence:\n54%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 165,
    "confidence": {
      "confidence_score": 54.2,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 4,
    "ml_rank": 4,
    "hybrid_rank": 4,
    "selection_reason": {
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.35 kgCO2/kg.",
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
    "ml_score": 51.02,
    "engineering_score": 82.78,
    "hybrid_score": 74.84,
    "ranking": 9,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.42 kgCO2/kg.\nMachine Learning confidence:\n51%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 143,
    "confidence": {
      "confidence_score": 51.0,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 3,
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
    "category": "Waterproofing",
    "item_name": "Bituminous Modified Membrane (Torch-Applied)",
    "dataset_source": "materials.db",
    "dataset_row": 175,
    "ml_score": 52.56,
    "engineering_score": 81.62,
    "hybrid_score": 74.36,
    "ranking": 10,
    "explanation": "Engineering selected this material because:\n\u2713 Designed to prevent moisture ingress under 1100mm annual rainfall.\n\u2713 High moisture resistance (92/100) ensuring structural protection.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n53%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 175,
    "confidence": {
      "confidence_score": 52.6,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 1,
    "ml_rank": 4,
    "hybrid_rank": 1,
    "selection_reason": {
      "climate": "Designed to prevent moisture ingress under 1100mm annual rainfall.",
      "durability": "High moisture resistance (92/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 40.0
  },
  {
    "category": "Doors",
    "item_name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "dataset_source": "materials.db",
    "dataset_row": 154,
    "ml_score": 51.94,
    "engineering_score": 81.76,
    "hybrid_score": 74.31,
    "ranking": 11,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n52%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nMEDIUM",
    "material_id": 154,
    "confidence": {
      "confidence_score": 51.9,
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  },
  {
    "category": "Roofing",
    "item_name": "Insulated Sandwich Roof Panel (PU Core)",
    "dataset_source": "materials.db",
    "dataset_row": 141,
    "ml_score": 49.47,
    "engineering_score": 82.49,
    "hybrid_score": 74.23,
    "ranking": 12,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.\nMachine Learning confidence:\n49%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 141,
    "confidence": {
      "confidence_score": 49.5,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 7,
    "hybrid_rank": 2,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 80.0
  },
  {
    "category": "Ceiling",
    "item_name": "Suspended Metal Tile Ceiling (Aluminium)",
    "dataset_source": "materials.db",
    "dataset_row": 171,
    "ml_score": 50.42,
    "engineering_score": 81.84,
    "hybrid_score": 73.98,
    "ranking": 13,
    "explanation": "Engineering selected this material because:\n\u2713 Selected for general compatibility with regional tropical environmental parameters.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n50%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 171,
    "confidence": {
      "confidence_score": 50.4,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 2,
    "ml_rank": 2,
    "hybrid_rank": 2,
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
    "item_name": "Polycarbonate Translucent Roofing",
    "dataset_source": "materials.db",
    "dataset_row": 145,
    "ml_score": 48.28,
    "engineering_score": 82.33,
    "hybrid_score": 73.82,
    "ranking": 14,
    "explanation": "Engineering selected this material because:\n\u2713 Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.\nMachine Learning confidence:\n48%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 145,
    "confidence": {
      "confidence_score": 48.3,
      "confidence_level": "Low"
    },
    "prediction_source": "ML_MODEL",
    "engineering_rank": 3,
    "ml_rank": 8,
    "hybrid_rank": 3,
    "selection_reason": {
      "climate": "Provides weather protection and thermal comfort for Dry Zone Tropical Arid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
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
    "ml_score": 50.46,
    "engineering_score": 81.44,
    "hybrid_score": 73.69,
    "ranking": 15,
    "explanation": "Engineering selected this material because:\n\u2713 Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.\n\u2713 Standard durability profile providing adequate resistance for typical residential application.\n\u2713 Maintains balanced environmental footprint with an embodied carbon of 0.45 kgCO2/kg.\nMachine Learning confidence:\n50%\nHistorical projects with similar characteristics frequently selected this specification.\nAgreement:\nLOW",
    "material_id": 148,
    "confidence": {
      "confidence_score": 50.5,
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
    "recommendation_quality": "Good",
    "engineering_confidence": 87.5,
    "climate_confidence": 60.0
  }
]
```

---

*Report generated automatically by GreenConstructAI Dissertation Validation Pipeline. All score calculations and recommendations originate directly from actual backend APIs.*