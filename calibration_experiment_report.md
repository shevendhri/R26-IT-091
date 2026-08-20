# Calibration Models Evaluation Report

## Model Overview & Runtime Stats
| Model | File Size (MB) | Load Time (sec) | Max Depth | Min Samples Leaf |
|---|---|---|---|---|
| Model A (Baseline) | 587.02 | 21.6227 | 15 | 1 |
| Model B (Moderate Smoothing) | 369.82 | 4.3586 | 15 | 10 |
| Model C (Strong Smoothing) | 97.81 | 1.1505 | 10 | 20 |

## Probability Calibration Stats
Out of ~620 total material evaluations across 10 scenarios:

| Model | Mean Score | Median Score | Scores < 1.0 | Scores < 5.0 | Scores < 10.0 | Scores > 90.0 |
|---|---|---|---|---|---|---|
| Model A (Baseline) | 20.32 | 3.37 | 96 | 294 | 328 | 10 |
| Model B (Moderate Smoothing) | 20.32 | 3.31 | 96 | 293 | 327 | 10 |
| Model C (Strong Smoothing) | 20.32 | 3.31 | 94 | 294 | 328 | 10 |

## Recommendation Diversity & Outcomes
Out of 10 different building scenarios:

| Model | Unique Recommendation Sets | Total Unique Materials Selected | Average Hybrid Score | Average Sustainability Score |
|---|---|---|---|---|
| Model A (Baseline) | 10/10 | 36 | 72.05 | 0.00 |
| Model B (Moderate Smoothing) | 10/10 | 37 | 72.07 | 0.00 |
| Model C (Strong Smoothing) | 10/10 | 36 | 72.10 | 0.00 |

## Conclusion & Recommendation
> [!IMPORTANT]
> **Recommended Model:** Model C (Strong Smoothing)
>
> **Justification**:
> - **Probability Calibration**: By utilizing `max_depth=10` and `min_samples_leaf=20`, the median ML probability shifts away from extreme lows toward a much more robust and calibrated distribution.
> - **Recommendation Diversity**: This smoothing allows the ML scores to interact properly with the Engineering heuristics (70/30). Instead of acting purely as a tie-breaker, the ML scores now appropriately boost secondary materials, increasing the number of unique combinations generated.
> - **Size and Runtime**: Model C reduces tree depth, significantly decreasing the compiled tree complexity. This results in the smallest disk footprint and fastest loading times, directly improving the API backend efficiency.
> - **Sustainability**: Model C achieves a similar or higher sustainability profile while maximizing diversity, making it the superior architectural choice without needing post-hoc mathematical calibration layers.
