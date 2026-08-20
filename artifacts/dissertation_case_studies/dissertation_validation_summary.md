# GreenConstructAI — Dissertation Validation Master Evidence Summary
**Validation Run Date**: 2026-07-23 12:03:37  
**Total Case Studies**: 10 / 10 Completed Successfully  
**Backend Execution Mode**: Live Full-Stack API Pipeline (`/api/questionnaire` + `/api/recommendations/generate`)  

## 1. Cross-Case Study Validation Matrix
| Case ID | Sector / Name | Location | System | Eng Score | ML Score | Hybrid Score | Latency (ms) | Key Recommendations |
|---|---|---|---|---|---|---|---|---|
| **CS01** | Urban Residential Dwelling (Colombo Coastal) | Colombo | Concrete Frame | `92.90` | `57.92` | `84.16` | `9431.2` | Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn); Windows: uPVC Multi-Chamber Window System; Doors: FRP Fiberglass Reinforced Door |
| **CS02** | Tropical Coastal Bungalow (Galle Wet Coastal) | Galle | Concrete Frame | `92.90` | `60.76` | `84.87` | `4974.8` | Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn); Windows: uPVC Multi-Chamber Window System; Doors: FRP Fiberglass Reinforced Door |
| **CS03** | Heritage Hill-Country Residence (Kandy Highland/Intermediate) | Kandy | Load-Bearing Masonry | `80.02` | `61.12` | `75.29` | `4755.2` | Foundation: Gr. 25 Standard Concrete Foundation; Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Recycled Rubber Flat Roof Membrane; Windows: uPVC Multi-Chamber Window System |
| **CS04** | Dry Zone Housing Unit (Jaffna Northern Saline/Dry) | Jaffna | Load-Bearing Masonry | `91.29` | `59.00` | `83.21` | `5486.8` | Foundation: Gr. 25 Standard Concrete Foundation; Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Marine-Grade Aluminium Roofing (0.55mm); Windows: uPVC Multi-Chamber Window System |
| **CS05** | Commercial Retail Complex (Negombo Western Coastal) | Negombo | Steel Frame | `86.13` | `60.08` | `79.62` | `5276.9` | Foundation: Eco-Concrete Foundation (30% Recycled Aggregate); Concrete: Eco-Concrete (Recycled Aggregate + Fly-Ash); Walls: High-Density Cement Block; Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn) |
| **CS06** | Corporate Tech Office Tower (Colombo Business District) | Colombo | Concrete Frame | `81.52` | `43.52` | `72.02` | `4769.0` | Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn); Windows: uPVC Multi-Chamber Window System; Doors: FRP Fiberglass Reinforced Door |
| **CS07** | High-Altitude Eco Resort (Nuwara Eliya Cold Highland) | Nuwara Eliya | Concrete Frame | `89.48` | `43.57` | `78.00` | `4509.2` | Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Portuguese Clay Tile (Unglazed Terracotta); Windows: uPVC Multi-Chamber Window System; Doors: Solid Teak Timber Door (Premium) |
| **CS08** | Regional Base Hospital (Anuradhapura Dry Zone) | Anuradhapura | Concrete Frame | `83.03` | `52.40` | `75.37` | `9067.5` | Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn); Windows: Casement Aluminium Window (Powder-Coated); Doors: Solid Teak Timber Door (Premium) |
| **CS09** | Secondary School Complex (Batticaloa Eastern Coastal) | Batticaloa | Concrete Frame | `84.77` | `52.23` | `76.64` | `4723.2` | Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Marine-Grade Aluminium Roofing (0.55mm); Windows: Casement Aluminium Window (Powder-Coated); Doors: FRP Fiberglass Reinforced Door |
| **CS10** | Industrial Logistics Facility (Hambantota Southern Port) | Hambantota | Steel Frame | `79.38` | `53.63` | `72.94` | `4911.4` | Foundation: Eco-Concrete Foundation (30% Recycled Aggregate); Concrete: Eco-Concrete (Recycled Aggregate + Fly-Ash); Walls: Wire-Cut Clay Brick (Premium Grade); Roofing: Zinc-Aluminium Corrugated Sheet (55% Al-Zn) |

## 2. Statistical Metrics Summary
| Metric | Engineering Score | ML Score | Hybrid Score | Execution Latency |
|---|---|---|---|---|
| **Mean** | `86.14` | `54.42` | `78.21` | `5790.5 ms` |
| **Min** | `79.38` | `43.52` | `72.02` | `4509.2 ms` |
| **Max** | `92.90` | `61.12` | `84.87` | `9431.2 ms` |

## 3. Evidence Package Index
Individual detailed case study evidence files saved under `artifacts/dissertation_case_studies/`:

- **CS01**: [Urban Residential Dwelling (Colombo Coastal) JSON Output](CS01_full_output.json) | [CS01 Detailed Markdown Report](CS01_report.md)
- **CS02**: [Tropical Coastal Bungalow (Galle Wet Coastal) JSON Output](CS02_full_output.json) | [CS02 Detailed Markdown Report](CS02_report.md)
- **CS03**: [Heritage Hill-Country Residence (Kandy Highland/Intermediate) JSON Output](CS03_full_output.json) | [CS03 Detailed Markdown Report](CS03_report.md)
- **CS04**: [Dry Zone Housing Unit (Jaffna Northern Saline/Dry) JSON Output](CS04_full_output.json) | [CS04 Detailed Markdown Report](CS04_report.md)
- **CS05**: [Commercial Retail Complex (Negombo Western Coastal) JSON Output](CS05_full_output.json) | [CS05 Detailed Markdown Report](CS05_report.md)
- **CS06**: [Corporate Tech Office Tower (Colombo Business District) JSON Output](CS06_full_output.json) | [CS06 Detailed Markdown Report](CS06_report.md)
- **CS07**: [High-Altitude Eco Resort (Nuwara Eliya Cold Highland) JSON Output](CS07_full_output.json) | [CS07 Detailed Markdown Report](CS07_report.md)
- **CS08**: [Regional Base Hospital (Anuradhapura Dry Zone) JSON Output](CS08_full_output.json) | [CS08 Detailed Markdown Report](CS08_report.md)
- **CS09**: [Secondary School Complex (Batticaloa Eastern Coastal) JSON Output](CS09_full_output.json) | [CS09 Detailed Markdown Report](CS09_report.md)
- **CS10**: [Industrial Logistics Facility (Hambantota Southern Port) JSON Output](CS10_full_output.json) | [CS10 Detailed Markdown Report](CS10_report.md)