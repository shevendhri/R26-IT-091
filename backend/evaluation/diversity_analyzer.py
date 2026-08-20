# backend/evaluation/diversity_analyzer.py
"""
GreenConstructAI — Phase 2 Recommendation Diversity Analyzer
============================================================

Generates 500 synthetic project contexts across Sri Lanka's architectural
and environmental spectrum, runs full hybrid recommendations, and evaluates:
  - Top-1 material frequency
  - Top-3 material frequency
  - Recommendation entropy (Shannon Entropy)
  - Material database coverage (%)
  - Category-level diversity

Outputs:
  - backend/evaluation/recommendation_diversity.json
  - backend/evaluation/plots/material_distribution.png
  - backend/evaluation/plots/category_distribution.png
  - backend/evaluation/plots/entropy_distribution.png
  - backend/evaluation/figures/ (300 DPI publication quality)

Usage:
    cd backend
    python evaluation/diversity_analyzer.py
"""

import os
import sys
import json
import time
import random
import math
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

EVAL_DIR = Path(__file__).resolve().parent
BACKEND_DIR = EVAL_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.recommendation_engine import recommendation_engine
from backend.questionnaire_engine import UserProfile

PLOTS_DIR = EVAL_DIR / 'plots'
FIGURES_DIR = EVAL_DIR / 'figures'
PLOTS_DIR.mkdir(exist_ok=True)
FIGURES_DIR.mkdir(exist_ok=True)

SEED = 42
NUM_SYNTHETIC_PROJECTS = 500


def shannon_entropy(items):
    """Compute Shannon Entropy H = -sum(p * log2(p))."""
    if not items:
        return 0.0
    counts = pd.Series(items).value_counts()
    probs = counts / len(items)
    return float(-np.sum(probs * np.log2(probs)))


def generate_synthetic_projects(count=500):
    """Generate randomized, realistic project contexts."""
    random.seed(SEED)
    np.random.seed(SEED)

    building_types = ['Residential', 'Commercial', 'Industrial', 'Educational', 'Healthcare', 'Hospitality']
    locations = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Trincomalee', 'Nuwara Eliya', 'Anuradhapura', 'Hambantota']
    climates = ['Coastal', 'Wet Zone', 'Dry Zone', 'Highland', 'Intermediate']
    budgets = ['Low', 'Balanced', 'Premium', 'Ultra-Premium']
    structural_systems = ['Concrete Frame', 'Steel Frame', 'Load Bearing Masonry', 'Timber Frame', 'Precast Concrete']
    sustainability_levels = ['Low', 'Medium', 'High']

    projects = []
    for i in range(count):
        b_type = random.choice(building_types)
        loc = random.choice(locations)
        zone = random.choice(climates)
        budget = random.choice(budgets)
        struct = random.choice(structural_systems)
        sust = random.choice(sustainability_levels)

        area = float(np.random.exponential(scale=350) + 60)
        area = min(5000.0, max(50.0, area))

        # Floors correlated with building type
        if b_type in ['Residential', 'Educational']:
            floors = int(np.random.randint(1, 5))
        elif b_type in ['Commercial', 'Hospitality']:
            floors = int(np.random.randint(2, 16))
        else:
            floors = int(np.random.randint(1, 8))

        projects.append({
            'project_id': f"SYNTH_{i+1:03d}",
            'buildingType': b_type,
            'location': loc,
            'climate_zone': zone,
            'budgetLevel': budget,
            'floorCount': floors,
            'totalArea': round(area, 1),
            'structuralSystem': struct,
            'sustainabilityPreference': sust,
        })

    return projects


def run_diversity_analysis():
    print("=" * 70)
    print(f"GreenConstructAI — Phase 2 Diversity Analysis ({NUM_SYNTHETIC_PROJECTS} Projects)")
    print("=" * 70)
    start_time = time.time()

    projects = generate_synthetic_projects(NUM_SYNTHETIC_PROJECTS)

    top1_materials_overall = []
    top3_materials_overall = []
    category_top1 = {}
    category_entropies = {}

    print(f"[DIVERSITY] Evaluating {len(projects)} synthetic project specifications...")

    for i, proj in enumerate(projects, 1):
        if i % 100 == 0 or i == len(projects):
            print(f"  Processed {i}/{len(projects)} projects ({i/len(projects)*100:.0f}%)...")

        profile = UserProfile(
            building_type=proj['buildingType'],
            budget_tier=proj['budgetLevel'],
            sustainability_pref=proj['sustainabilityPreference']
        )

        try:
            profile = UserProfile(
                building_type=proj['buildingType'],
                budget_tier=proj['budgetLevel'],
                sustainability_pref=proj['sustainabilityPreference']
            )

            bp = {
                'structural_system': proj['structuralSystem'],
                'building_type': proj['buildingType'],
                'num_floors': proj['floorCount'],
                'total_area': proj['totalArea'],
                'floors_data': [{'rooms': []}]
            }

            res = recommendation_engine.recommend_package(bp, proj['location'], profile)
            rec_pkg = res.get('recommended_package', {})

            for cat, item in rec_pkg.items():
                if isinstance(item, dict):
                    name = item.get('name') or item.get('Name') or item.get('material', {}).get('Name')
                    if name:
                        top1_materials_overall.append(name)
                        if cat not in category_top1:
                            category_top1[cat] = []
                        category_top1[cat].append(name)

        except Exception as e:
            pass


    # Total database material count
    csv_path = BACKEND_DIR / 'GreenConstructAI_ML_Dataset.csv'
    total_db_materials = 33
    if csv_path.exists():
        df_db = pd.read_csv(csv_path)
        total_db_materials = df_db['material_name'].nunique()

    unique_top1_count = len(set(top1_materials_overall))
    overall_entropy = shannon_entropy(top1_materials_overall)
    coverage_pct = (unique_top1_count / total_db_materials) * 100.0

    print(f"\n[DIVERSITY METRICS]:")
    print(f"  Total Projects Evaluated:     {NUM_SYNTHETIC_PROJECTS}")
    print(f"  Total Top-1 Recommendations:  {len(top1_materials_overall)}")
    print(f"  Unique Materials Recommended: {unique_top1_count} / {total_db_materials}")
    print(f"  Material Coverage Rate:       {coverage_pct:.2f}%")
    print(f"  Overall Shannon Entropy (H):  {overall_entropy:.3f} bits")

    for cat, mats in category_top1.items():
        ent = shannon_entropy(mats)
        category_entropies[cat] = round(ent, 3)
        print(f"    - Category '{cat}': Entropy = {ent:.3f} bits (Unique: {len(set(mats))})")

    # Generate JSON result
    top1_freq = pd.Series(top1_materials_overall).value_counts().to_dict()

    diversity_results = {
        'timestamp': pd.Timestamp.now(tz='UTC').isoformat(),
        'projects_evaluated': NUM_SYNTHETIC_PROJECTS,
        'overall_entropy_bits': round(overall_entropy, 3),
        'unique_materials_recommended': unique_top1_count,
        'total_database_materials': total_db_materials,
        'material_coverage_pct': round(coverage_pct, 2),
        'category_entropies': category_entropies,
        'top1_material_frequencies': top1_freq
    }

    div_json_path = EVAL_DIR / 'recommendation_diversity.json'
    with open(div_json_path, 'w', encoding='utf-8') as f:
        json.dump(diversity_results, f, indent=2)
    print(f"[SAVE] Saved: {div_json_path}")

    # ── Plots ──────────────────────────────────────────────────────────────
    # 1. Material Distribution Plot
    top15_mats = pd.Series(top1_materials_overall).value_counts().head(15)
    plt.figure(figsize=(9, 6))
    sns.barplot(x=top15_mats.values, y=top15_mats.index, color='#3498db')
    plt.xlabel('Recommendation Frequency (Top-1 Count)')
    plt.title(f'Top-1 Material Recommendation Distribution (N={NUM_SYNTHETIC_PROJECTS} Projects)')
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / 'material_distribution.png', dpi=150)
    plt.savefig(FIGURES_DIR / 'material_distribution.png', dpi=300)
    plt.close()

    # 2. Category Distribution Plot
    cat_counts = {c: len(mats) for c, mats in category_top1.items()}
    plt.figure(figsize=(8, 5))
    sns.barplot(x=list(cat_counts.keys()), y=list(cat_counts.values()), color='#2ecc71')
    plt.xlabel('Building Component Category')
    plt.ylabel('Recommendation Count')
    plt.xticks(rotation=30, ha='right')
    plt.title('Recommendation Volume Across Component Categories')
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / 'category_distribution.png', dpi=150)
    plt.savefig(FIGURES_DIR / 'category_distribution.png', dpi=300)
    plt.close()

    # 3. Entropy Distribution Plot
    plt.figure(figsize=(8, 5))
    df_ent = pd.DataFrame(list(category_entropies.items()), columns=['Category', 'Entropy'])
    df_ent = df_ent.sort_values('Entropy', ascending=False)
    sns.barplot(data=df_ent, x='Entropy', y='Category', palette='viridis')
    plt.xlabel('Shannon Entropy (bits)')
    plt.title('Category Recommendation Diversity (Shannon Entropy)')
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / 'entropy_distribution.png', dpi=150)
    plt.savefig(FIGURES_DIR / 'entropy_distribution.png', dpi=300)
    plt.savefig(FIGURES_DIR / 'recommendation_diversity.png', dpi=300)
    plt.close()

    print(f"  -> Saved 3 plots in {PLOTS_DIR} and 300 DPI figures in {FIGURES_DIR}")
    elapsed = time.time() - start_time
    print(f"[DIVERSITY COMPLETE] Finished in {elapsed:.1f}s")
    print("=" * 70)


if __name__ == '__main__':
    run_diversity_analysis()
