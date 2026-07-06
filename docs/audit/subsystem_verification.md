# Subsystem Independent Verification Report

**Generated**: 2026-07-01 15:07:42  
**Location**: Colombo | **Building**: Residential, 3 floors, 125.3m²  
**Hybrid Formula**: `calculate_hybrid_score()` from `backend/utils.py` (default: 0.75×Eng + 0.25×ML)  

## 1. Score Traceability Verification

Independently recalculates Engineering (MCDM), ML (Random Forest), and Hybrid scores and compares to API response:

| Slot | Material | ID | Rep. Eng | Exp. Eng | Eng? | Rep. ML | Exp. ML | ML? | Rep. Hybrid | Exp. Hybrid | Hybrid? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Foundation | Lime-Pozzolan Natural Foundation | 123 | 85.35 | 85.35 | ✓ | 59.44 | 59.44 | ✓ | 78.87 | 78.87 | ✓ |
| Structural | GFRP Rebar (Glass Fibre Reinforced Polymer) | 132 | 83.25 | 83.25 | ✓ | 5.55 | 5.55 | ✓ | 63.83 | 63.83 | ✓ |

**Score Traceability Result**: **ALL PASS ✓**

### Database Metadata Passthrough

| Slot | Material | API Sustainability | DB Sustainability | Match? | API Carbon | DB Carbon | Match? | API Life | DB Life | Match? |
|---|---|---|---|---|---|---|---|---|---|---|
| Foundation | Lime-Pozzolan Natural Foundation | 92 | 92 | ✓ | 0.120 | 0.120 | ✓ | 80 | 80 | ✓ |
| Structural | GFRP Rebar (Glass Fibre Reinforced Polymer) | 80 | 80 | ✓ | 0.550 | 0.550 | ✓ | 100 | 100 | ✓ |

**Metadata Passthrough Result**: **ALL PASS ✓**

## 2. Hybrid Ranking & Selection Verification

### Foundation Category — Full Scoring Matrix

| Rank | Material | ID | Eng Score | ML Score | Hybrid Score | Vetoed |
|---|---|---|---|---|---|---|
| #1 | Lime-Pozzolan Natural Foundation | 123 | 85.35 | 59.44 | 78.87 | No |
| #2 | Gr. 30 Marine-Grade Concrete Foundation | 120 | 85.25 | 2.67 | 64.61 | No |
| #3 | Eco-Concrete Foundation (30% Recycled Aggregate) | 121 | 83.72 | 1.05 | 63.06 | No |
| #4 | Gr. 25 Standard Concrete Foundation | 119 | 82.00 | 0.92 | 61.73 | No |
| #5 | Raft Foundation Assembly (RC Heavy) | 122 | 0.00 | 2.46 | 0.62 | No |

- **Expected Rank 1**: `Lime-Pozzolan Natural Foundation` (Score: `78.87`)
- **API Displayed**: `Lime-Pozzolan Natural Foundation`
- **Selection Logic Correct**: **YES ✓**

## 3. Climate Sensitivity Verification

Tests whether recommendations change across Sri Lanka's climate zones:

| Category | Colombo (Coastal Humid) | Batticaloa (Extreme Coastal) | Nuwara Eliya (Highland) | Changes? |
|---|---|---|---|---|
| Foundation | Lime-Pozzolan Natural Foundation | Lime-Pozzolan Natural Foundation | Lime-Pozzolan Natural Foundation | NO |
| Structural | GFRP Rebar (Glass Fibre Reinforced Polymer) | GFRP Rebar (Glass Fibre Reinforced Polymer) | GFRP Rebar (Glass Fibre Reinforced Polymer) | NO |
| Walling | None | None | None | NO |
| Roofing | Portuguese Clay Tile (Unglazed Terracotta) | Portuguese Clay Tile (Unglazed Terracotta) | Portuguese Clay Tile (Unglazed Terracotta) | NO |
| Flooring | Polished Terrazzo Flooring (Marble Aggregate) | Polished Terrazzo Flooring (Marble Aggregate) | Polished Terrazzo Flooring (Marble Aggregate) | NO |
| Ceiling | Bamboo-Fibre Acoustic Ceiling Panel | Bamboo-Fibre Acoustic Ceiling Panel | Bamboo-Fibre Acoustic Ceiling Panel | NO |
| Waterproofing | Crystalline Slurry Waterproofing (Penetrating) | Crystalline Slurry Waterproofing (Penetrating) | Crystalline Slurry Waterproofing (Penetrating) | NO |
| Finishing | None | None | None | NO |

- **Climate-Adaptive Behavior Detected**: **NO ✗** — All zones produce identical packages

> **Note**: The recommendation engine does produce different *scores* for different climates, but the *ranking order* doesn't change for this specific building type/preference combination. This means the top-ranked material is robust across all Sri Lankan climate zones.

## 4. Recommendation Determinism

10 consecutive runs with identical inputs:

| Run | SHA-256 Hash |
|---|---|
| 1 | `a378f48c5f37a2c7...` |
| 2 | `ea117a99ad48a889...` |
| 3 | `ea117a99ad48a889...` |
| 4 | `ea117a99ad48a889...` |
| 5 | `ea117a99ad48a889...` |
| 6 | `ea117a99ad48a889...` |
| 7 | `ea117a99ad48a889...` |
| 8 | `ea117a99ad48a889...` |
| 9 | `ea117a99ad48a889...` |
| 10 | `ea117a99ad48a889...` |

- **Unique Outputs**: 2/10
- **Deterministic**: **NO ✗**

> **Root Cause**: `get_climate_profile()` in `weather_engine.py` calls the live Open-Meteo API, which returns real-time humidity values that fluctuate between calls. The ML model and MCDM engine themselves are deterministic for identical feature inputs.

---

## Summary

| Verification | Result |
|---|---|
| Score Traceability (Eng + ML + Hybrid) | ✓ PASS |
| Database Metadata Passthrough | ✓ PASS |
| Ranking Selection Logic | ✓ PASS |
| Climate Sensitivity | ✗ FAIL (see note) |
| Engine Determinism | ✗ FAIL (see note) |
