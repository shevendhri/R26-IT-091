import json

with open("calibration_analysis.json", "r") as f:
    data = json.load(f)

md = "# ML Probability Calibration Analysis\n\n"

md += "## Probability Distribution Metrics\n"
md += f"- **Minimum ML Score**: {data['stats']['min']:.2f}\n"
md += f"- **Maximum ML Score**: {data['stats']['max']:.2f}\n"
md += f"- **Mean ML Score**: {data['stats']['mean']:.2f}\n"
md += f"- **Median ML Score**: {data['stats']['median']:.2f}\n"
md += f"- **Standard Deviation**: {data['stats']['std_dev']:.2f}\n\n"

md += "## Extremity Counts (Out of 620 total material evaluations)\n"
md += f"- **ML Scores < 1.0**: {data['counts']['below_1']}\n"
md += f"- **ML Scores < 5.0**: {data['counts']['below_5']}\n"
md += f"- **ML Scores < 10.0**: {data['counts']['below_10']}\n"
md += f"- **ML Scores > 90.0**: {data['counts']['above_90']}\n\n"

md += "## Predicted Probability Histogram\n"
md += "```\n"
for k, v in data['histogram'].items():
    bar = "█" * int(v / 5)  # Scale for display
    md += f"{k:>6}: {v:>3} | {bar}\n"
md += "```\n\n"

md += "## Materials Winning Despite Low ML Scores (< 10)\n"
md += "| Scenario | Category | Material | ML Score | Eng Score | Hybrid Score | Why it Won |\n"
md += "|---|---|---|---|---|---|---|\n"
for w in data['low_ml_winners']:
    # Explain why it won
    why = f"Eng Score ({w['eng_score']:.1f}) contributes {w['eng_score']*0.7:.1f} to Hybrid. ML contributes {w['ml_score']*0.3:.1f}."
    md += f"| {w['scenario']} | {w['category']} | {w['material']} | {w['ml_score']:.2f} | {w['eng_score']:.2f} | {w['hybrid_score']:.2f} | {why} |\n"
if not data['low_ml_winners']:
    md += "| None | | | | | | |\n"

md += "\n## Probability Calibration Diagnostics\n\n"
md += "### 1. Probability Collapse\n"
md += "While true collapse (where all scores are exactly identical) hasn't occurred, there is an extreme **bimodal tendency**. The vast majority of materials are squashed under 10% probability, leaving only a few materials with high probability. This indicates the model is extremely decisive but potentially poorly calibrated.\n\n"

md += "### 2. Class Imbalance Effects\n"
md += "The synthetic generation heavily relies on generating rows across all materials. If some materials have broader acceptable ranges (e.g., standard concrete) versus niche materials (e.g., GFRP rebar), the Random Forest will naturally output higher basal probabilities for the broader classes, punishing specialized materials with scores < 5% even when they are appropriate.\n\n"

md += "### 3. Synthetic-Data Overconfidence\n"
md += "The use of random jitter during synthetic data generation created 240,000+ distinct rows. A Random Forest interprets this vast amount of tiny variance as strict categorical boundaries. It becomes overconfident that specific micro-variations strictly rule out certain materials, leading to extreme low scores (approaching 0%) for perfectly valid engineering options.\n\n"

md += "### 4. Excessive Certainty Caused by `max_depth=15`\n"
md += "Although reducing `max_depth` to 15 prevented memory crashes, 15 is still quite deep. Deep trees produce \"purer\" leaf nodes. When averaging pure leaf nodes across 300 estimators, the model outputs extreme probabilities rather than smooth, calibrated likelihoods.\n\n"

md += "## Evaluation of Calibration Approaches\n\n"
md += "- **CalibratedClassifierCV**: Wrapping the Random Forest in scikit-learn's `CalibratedClassifierCV` (using Isotonic or Sigmoid) would directly map these raw Random Forest confidence scores to true empirical probabilities. However, since the dataset is 100% synthetic, it would calibrate to the *synthetic distribution*, which might not reflect real-world material selection distributions.\n"
md += "- **Isotonic Calibration**: Powerful for non-parametric calibration but requires a substantial hold-out validation set. On purely synthetic data, isotonic regression tends to overfit the synthetic artifacts.\n"
md += "- **Platt Scaling (Sigmoid)**: Better for smaller datasets or when parametric shape (S-curve) is assumed. Good for pushing probabilities away from extreme 0/100, but Random Forests typically don't suffer from sigmoid-shaped distortion (they usually suffer from pushing probabilities toward the center, though deep trees do the opposite).\n"
md += "- **`min_samples_leaf` Tuning**: By requiring e.g., `min_samples_leaf=20` or `50`, the leaf nodes are forced to remain impure. This naturally smooths the probabilities output by the forest without requiring a post-hoc calibration step. This is often the most robust architectural fix for Random Forest overconfidence.\n"
md += "- **Probability Clipping/Flooring**: Artificially capping probabilities (e.g., forcing a minimum ML score of 15%) is a crude heuristic that masks the underlying overconfidence but fixes the immediate issue of the engineering score completely overriding the ML.\n\n"

md += "## Final Recommendation\n\n"
md += "> [!IMPORTANT]\n"
md += "> **Recommendation: C. Retrain with different RF hyperparameters**\n>\n"
md += "> **Rationale**: Because the training data is completely synthetic, post-hoc calibration (`CalibratedClassifierCV`) will simply calibrate the model to be \"perfectly accurate\" relative to the synthetic jitter, rather than true physical reality. \n>\n"
md += "> The true root cause is **tree over-purity** caused by synthetic noise memorization. \n>\n"
md += "> By retraining the model with **`min_samples_leaf=20`** (and potentially a lower `max_depth=10`), the trees will be forced to average multiple material classes in their terminal nodes. This naturally produces smoother, better-calibrated probabilities (e.g., 40%, 30%, 20% splits instead of 95%, 2%, 1%), allowing the Hybrid scoring formula to work gracefully without extreme weighting hacks.\n"

with open("C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\8f7dd95e-340a-458f-ae4e-f1dd0f86317b\\ml_calibration_report.md", "w", encoding="utf-8") as f:
    f.write(md)

print("Report generated.")
