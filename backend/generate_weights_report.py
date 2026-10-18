import json
import os

with open("weight_simulation_results.json", "r", encoding="utf-8") as f:
    results = json.load(f)

md = "# ML Recommendation Weighting Scheme Simulation\n\n"

md += "## Scenario Comparisons\n\n"

for res in results:
    md += f"### {res['scenario']}\n"
    
    # We will build a table comparing the materials for each weight
    weights = ["70/30 Baseline", "60/40", "50/50", "40/60"]
    categories = list(res['weights']["70/30 Baseline"]["package"].keys())
    
    md += "| Component | 70/30 Baseline (Current) | 60/40 | 50/50 | 40/60 |\n"
    md += "|---|---|---|---|---|\n"
    
    for cat in categories:
        row = [cat.capitalize()]
        for w in weights:
            item = res['weights'][w]["package"][cat]
            row.append(f"{item['name']}")
        md += "| " + " | ".join(row) + " |\n"
    
    md += "\n**Project Metrics Comparison:**\n"
    md += "| Metric | 70/30 Baseline | 60/40 | 50/50 | 40/60 |\n"
    md += "|---|---|---|---|---|\n"
    metrics = ["project_hybrid_score", "average_sustainability", "changes"]
    names = ["Hybrid Score", "Avg Sustainability", "Changes vs 70/30"]
    
    for i, metric in enumerate(metrics):
        row = [names[i]]
        for w in weights:
            val = res['weights'][w].get(metric, 0)
            row.append(f"{val:.2f}" if isinstance(val, float) else str(val))
        md += "| " + " | ".join(row) + " |\n"
    
    md += "\n---\n\n"

md += "## Sensitivity Analysis & Findings\n\n"

# Aggregate stats
total_changes_60 = sum(r['weights']['60/40']['changes'] for r in results)
total_changes_50 = sum(r['weights']['50/50']['changes'] for r in results)
total_changes_40 = sum(r['weights']['40/60']['changes'] for r in results)

md += f"- **Total Recommendation Changes**: 60/40 caused {total_changes_60} changes, 50/50 caused {total_changes_50} changes, and 40/60 caused {total_changes_40} changes across the 10 scenarios.\n"

# Component sensitivity
component_changes = {}
for r in results:
    base = r['weights']['70/30 Baseline']['package']
    alt = r['weights']['40/60']['package']
    for cat in base.keys():
        if base[cat]['name'] != alt[cat]['name']:
            component_changes[cat] = component_changes.get(cat, 0) + 1

md += "\n### Component Sensitivity\n"
md += "Which components are most sensitive to weight changes (comparing 70/30 to 40/60)?\n"
sorted_cats = sorted(component_changes.items(), key=lambda x: x[1], reverse=True)
for cat, cnt in sorted_cats:
    md += f"- **{cat.capitalize()}**: {cnt} changes\n"
if not sorted_cats:
    md += "- (No components changed)\n"

# Materials losing out
materials_lost = set()
materials_gained = set()
for r in results:
    base = r['weights']['70/30 Baseline']['package']
    alt = r['weights']['40/60']['package']
    for cat in base.keys():
        if base[cat]['name'] != alt[cat]['name']:
            materials_lost.add(base[cat]['name'])
            materials_gained.add(alt[cat]['name'])

md += "\n### Material Shifts\n"
md += "Which materials STOP winning when ML influence increases?\n"
for m in materials_lost:
    md += f"- {m}\n"

md += "\nWhich materials START winning when ML influence increases?\n"
for m in materials_gained:
    md += f"- {m}\n"

# Sustainability impact
avg_sust_70 = sum(r['weights']['70/30 Baseline']['average_sustainability'] for r in results) / 10
avg_sust_40 = sum(r['weights']['40/60']['average_sustainability'] for r in results) / 10

md += "\n### Sustainability & Diversity\n"
md += f"**Sustainability**: The average sustainability score shifted from {avg_sust_70:.2f} (70/30) to {avg_sust_40:.2f} (40/60). This indicates whether the ML model intrinsically prefers more or less sustainable materials compared to the rigid engineering heuristics.\n"

div_70 = len(set(item['name'] for r in results for item in r['weights']['70/30 Baseline']['package'].values()))
div_40 = len(set(item['name'] for r in results for item in r['weights']['40/60']['package'].values()))

md += f"**Diversity**: The total number of unique materials recommended across all 10 scenarios shifted from {div_70} (70/30) to {div_40} (40/60). An increase means the ML model injects more contextual nuance, while a decrease implies the ML model heavily collapses on universal favorites.\n\n"

md += "## Conclusion & Recommendation\n"
md += "> [!IMPORTANT]\n"
md += "> **Recommended Scheme**: `50/50`.\n>\n"
md += "> **Rationale**:\n"
md += "> - `70/30` almost entirely suppresses ML insights (acting purely as a tiebreaker for equal engineering scores).\n"
md += "> - `60/40` shows minor improvements but engineering still dominates extreme ML warnings.\n"
md += "> - `50/50` creates a balanced dynamic where an exceptionally poor ML prediction (<10) can successfully veto a generic engineering default (85), without allowing the ML to select structurally unsafe materials (since vetoed materials are zeroed out anyway).\n"
md += "> - `40/60` gives ML too much control, potentially overriding valid local engineering heuristics based on the synthetic training jitter.\n"

with open("C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\8f7dd95e-340a-458f-ae4e-f1dd0f86317b\\weight_analysis_report.md", "w", encoding="utf-8") as f:
    f.write(md)

print("Report generated.")
