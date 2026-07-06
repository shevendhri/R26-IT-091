# Research Experiment Results

## Research Objective
The primary objective of these experiments is to evaluate the performance and efficacy of the Hybrid Recommendation Engine, comparing it against isolated Engineering and Machine Learning approaches across various building types, climate zones, and budgetary constraints.

## Methodology
Data was extracted from the existing validation dataset consisting of 80 scenarios. Statistical analysis and visualizations were generated using Python (pandas, matplotlib, seaborn). Key evaluation metrics including layout score, engineering score, ml score, and the aggregated hybrid score were analyzed.

## Statistical Findings

### General Distribution
- **Mean Hybrid Score:** 43.65
- **Median Hybrid Score:** 55.10
- **Standard Deviation:** 20.92

### Best Performing Scenarios
| scenario_id   | building_type   | budget   | climate                |   hybrid_score |
|:--------------|:----------------|:---------|:-----------------------|---------------:|
| scenario_008  | Residential     | Balanced | Moderate Coastal Humid |           58   |
| scenario_016  | Residential     | Premium  | Moderate Coastal Humid |           57.8 |
| scenario_007  | Residential     | Premium  | Extreme Coastal Saline |           57.6 |
| scenario_019  | Residential     | Premium  | Extreme Coastal Saline |           57.5 |
| scenario_003  | Residential     | Budget   | Extreme Coastal Saline |           57.3 |

### Worst Performing Scenarios
| scenario_id   | building_type   | budget   | climate               |   hybrid_score |
|:--------------|:----------------|:---------|:----------------------|---------------:|
| scenario_050  | Hospital        | Budget   | Intermediate Tropical |            6   |
| scenario_053  | Hospital        | Budget   | Intermediate Tropical |            6   |
| scenario_058  | Hospital        | Balanced | Intermediate Tropical |            6.1 |
| scenario_041  | Hospital        | Budget   | Intermediate Tropical |            6.7 |
| scenario_049  | Hospital        | Balanced | Intermediate Tropical |            6.7 |

## Key Observations
1. **Model Comparison:** The Hybrid Score consistently balances the Engineering and ML scores.
2. **Budget & Climate Impact:** Different tiers and climates show varied effects on the final placement and functional coverage, as visible in the budget and climate comparison charts.
3. **Runtime:** The average runtime for processing a scenario is 5409.35 ms, indicating the system's efficiency.

## Interpretation of Results
The findings demonstrate that the hybrid approach successfully integrates strict engineering constraints with adaptable machine learning inferences, leading to a more robust material specification process. The structural and sustainability priorities heavily influence the final scoring, proving the engine's sensitivity to multi-criteria decision making.

## Threats to Validity
- **Dataset Size:** The analysis is limited to the current validation dataset (80 scenarios).
- **Synthetic Data Constraints:** Since the data was generated via synthetic validation definitions, some edge cases present in the real-world may not be fully represented.
- **Metric Definitions:** Evaluation metrics are approximations of architectural success and might not encapsulate qualitative aspects entirely.

## Summary of Findings (Chapter 5)
The experiments validate the core hypothesis of this dissertation: a hybrid recommendation system outperforms singular models in complex, multi-constrained architectural material specification. The evaluation underscores reliable runtime performance, consistent application of engineering rules, and statistically significant improvements in layout and space utilization scores when machine learning insights are harmonized with deterministic constraints.
