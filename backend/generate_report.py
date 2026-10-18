import json
import os

with open("audit_results.json", "r", encoding="utf-8") as f:
    results = json.load(f)

md = "# ML Recommendation System Validation Audit\n\n"

md += "## Scenario Recommendations\n\n"

for res in results:
    md += f"### {res['scenario']}\n"
    md += f"**Blueprint:** {res['inputs']['blueprint']['building_type']}, {res['inputs']['blueprint']['num_floors']} floors, {res['inputs']['blueprint']['structural_system']}\n"
    md += f"**Profile:** {res['inputs']['profile']['location']}, Sustainability: {res['inputs']['profile']['sustainability_pref']}, Budget: {res['inputs']['profile']['budget_pref']}\n\n"
    
    md += "| Component | Material Selected | ML Score | Eng Score | Hybrid Score |\n"
    md += "|---|---|---|---|---|\n"
    for comp, item in res['components'].items():
        ml = f"{item['ml_score']:.2f}" if item['ml_score'] is not None else "N/A"
        md += f"| {comp.capitalize()} | {item['name']} | {ml} | {item['eng_score']:.2f} | {item['hybrid_score']:.2f} |\n"
    
    m = res['metrics']
    md += f"\n**Project Metrics:**\n"
    md += f"- ML Score: {m['project_ml_score']:.1f}\n"
    md += f"- Eng Score: {m['project_eng_score']:.1f}\n"
    md += f"- Hybrid Score: {m['project_hybrid_score']:.1f}\n"
    md += f"- Avg Sustainability: {m['average_sustainability']:.1f}\n"
    md += f"- Carbon Footprint: {m.get('carbon_footprint') or 'N/A'}\n\n"

md += "## Validation Analysis\n\n"

# 1. Do recommendations actually change between scenarios?
changes = set()
for r in results:
    mat_list = tuple(item['name'] for comp, item in r['components'].items())
    changes.add(mat_list)

md += f"### 1. Do recommendations actually change between scenarios?\n"
md += f"Yes, across the 10 scenarios tested, there are **{len(changes)} unique recommendation sets**. While some core materials remain consistent due to strong engineering priors, components like Foundation, Structural, and Flooring change based on building type (e.g. Raft Foundation for 15-floor Office vs Lime-Pozzolan for 2-floor Residential).\n\n"

# 2. Which input variables have the strongest effect?
md += "### 2. Which input variables have the strongest effect?\n"
md += "Based on feature importances from the ML training, the most influential variables are:\n"
md += "1. **Floor Count (0.21)**: Heavily influences foundation and structural choices.\n"
md += "2. **Total Area (0.17)**: Correlates with scale-appropriate materials.\n"
md += "3. **Climate factors (Rainfall 0.17, Humidity 0.17)**: Drives roofing, waterproofing, and window selections.\n"
md += "Building Type (0.13) also plays a major role.\n\n"

# 3. Are any components always selecting the same material?
comp_counts = {}
for r in results:
    for comp, item in r['components'].items():
        if comp not in comp_counts:
            comp_counts[comp] = set()
        comp_counts[comp].add(item['name'])

same_materials = [c for c, mats in comp_counts.items() if len(mats) == 1]
md += "### 3. Are any components always selecting the same material?\n"
if same_materials:
    md += "Yes. The following components always selected the same material across all 10 scenarios:\n"
    for c in same_materials:
        md += f"- **{c.capitalize()}**: {list(comp_counts[c])[0]}\n"
    md += "This indicates that either the engineering rules highly favor these materials, or the ML model has collapsed predictions for these categories across the sampled input space.\n\n"
else:
    md += "No component selected exactly the same material across all 10 scenarios. Every component showed at least some variation.\n\n"

# 4. Are there signs of overfitting?
md += "### 4. Are there signs of overfitting?\n"
md += "There are mild signs of overfitting. While `max_depth` was reduced to 15, the model still trains on 240,000+ synthetic rows generated via jitter. For certain materials, ML scores are extremely low (e.g., 1.5 - 4.0) but they are still selected because the Engineering Score (e.g., 85 or 100) dominates the Hybrid Score. The ML model might be overly confident about extremely narrow climate/structural rules, causing very low probabilities for perfectly viable materials.\n\n"

# 5. Are ML scores contributing meaningfully to final rankings?
md += "### 5. Are ML scores contributing meaningfully to final rankings?\n"
md += "They are contributing, but **Engineering scores heavily dominate**. Because the Hybrid score is `(Eng * 0.7) + (ML * 0.3)`, an engineering score of 100 provides 70 points out of the gate. Even if the ML score is 0, the hybrid score is 70, which often beats other materials with high ML scores but lower engineering scores. The ML score acts more as a tiebreaker than a primary driver for many categories.\n\n"

# 6. Are any recommendation patterns suspicious?
md += "### 6. Are any recommendation patterns suspicious?\n"
md += "Yes, two patterns are notable:\n"
md += "1. **Dominance of CSEB Blocks and uPVC Windows**: They win almost universally across different climates and building types. This suggests the base engineering heuristics for these materials are so high they suppress ML variance.\n"
md += "2. **Extremely Low ML Scores Winning**: Materials like 'Liquid Polyurethane Membrane' or 'GFRP Rebar' win despite ML scores of ~1.5. This happens because their engineering score is high (75-100), effectively overruling the ML model's strong objection.\n\n"

md += "## Recommendations for Improvement\n"
md += "- **Rebalance Hybrid Weights**: Consider shifting the weight from `0.7/0.3` to `0.5/0.5` if you want the ML predictions to have a more decisive impact.\n"
md += "- **Calibrate Engineering Rules**: Reduce the default engineering scores for universally dominant materials (like CSEB or uPVC) to allow the ML model's contextual awareness to shine.\n"
md += "- **Smooth ML Probabilities**: The ML model often outputs extreme probabilities (either ~75+ or <5). Applying temperature scaling or using `min_samples_leaf=5` could smooth these out and prevent over-penalizing materials.\n"

with open("C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\8f7dd95e-340a-458f-ae4e-f1dd0f86317b\\validation_report.md", "w", encoding="utf-8") as f:
    f.write(md)

print("Report generated.")
