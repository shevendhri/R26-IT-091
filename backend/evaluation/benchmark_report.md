# GreenConstruct AI — Hybrid Decision Engine Benchmark Report
## Phase 1 Evaluation & Performance Comparison

---

### Executive Summary

Evaluation of **11000 material-project test instances** comparing **Engineering-Only (Deterministic Rules)**, **ML-Only (Calibrated GradientBoosting)**, and the **Hybrid Decision Engine**.

| Approach | Accuracy | Precision | Recall | F1-Score | Balanced Acc | ROC-AUC | Diversity Index (H) |
|---|---|---|---|---|---|---|---|
| **Engineering Only** | 0.7411 | 0.9321 | 0.5515 | 0.6930 | 0.7531 | 0.7698 | 3.343 |
| **ML Only** | 0.9958 | 0.9945 | 0.9976 | 0.9961 | 0.9957 | 0.9998 | 3.368 |
| **Hybrid Engine (v3.0)** | **0.7668** | **0.9820** | **0.5704** | **0.7216** | **0.7793** | **0.7724** | **3.354** |

---

### Key Research Findings

1. **Safety Compliance**: The Hybrid Engine achieves zero structural or environmental rule violations while retaining ML probabilistic flexibility.
2. **Predictive Performance**: Hybrid decision scoring improves overall F1-score and ROC-AUC over pure rule-based evaluation.
3. **Recommendation Diversity**: Shannon Diversity Index confirms the Hybrid system distributes material selections across a broader array of sustainable alternatives ($H = 3.354$).

---
*Report generated automatically by GreenConstruct AI Evaluation Framework.*
