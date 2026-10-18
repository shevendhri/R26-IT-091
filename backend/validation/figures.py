import json
import csv
import matplotlib.pyplot as plt
from pathlib import Path

from .config import CSV_RESULTS, FIGURES, EVIDENCE_DIR


def _load_data():
    """Load CSV rows into a list of dicts."""
    rows = []
    with open(CSV_RESULTS, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def _save_figure(fig, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=300, bbox_inches='tight')
    plt.close(fig)


def engineering_score_distribution(rows):
    scores = [float(r.get('engineering_score', 0)) for r in rows]
    fig, ax = plt.subplots()
    ax.hist(scores, bins=20, color='#4a90e2', edgecolor='white')
    ax.set_title('Engineering Score Distribution')
    ax.set_xlabel('Score')
    ax.set_ylabel('Count')
    _save_figure(fig, FIGURES['engineering_score'])


def ml_score_distribution(rows):
    scores = [float(r.get('ml_score', 0)) for r in rows]
    fig, ax = plt.subplots()
    ax.hist(scores, bins=20, color='#7ed321', edgecolor='white')
    ax.set_title('ML Score Distribution')
    ax.set_xlabel('Score')
    ax.set_ylabel('Count')
    _save_figure(fig, FIGURES['ml_score'])


def hybrid_score_distribution(rows):
    scores = [float(r.get('hybrid_score', 0)) for r in rows]
    fig, ax = plt.subplots()
    ax.hist(scores, bins=20, color='#d0021b', edgecolor='white')
    ax.set_title('Hybrid Score Distribution')
    ax.set_xlabel('Score')
    ax.set_ylabel('Count')
    _save_figure(fig, FIGURES['hybrid_score'])


def confidence_distribution(rows, key, title, filename_key):
    values = [float(r.get(key, 0)) for r in rows]
    fig, ax = plt.subplots()
    ax.hist(values, bins=20, color='#9013fe', edgecolor='white')
    ax.set_title(title)
    ax.set_xlabel('Confidence')
    ax.set_ylabel('Count')
    _save_figure(fig, FIGURES[filename_key])


def material_selection_frequency(trace_path):
    # The trace JSON contains the full response per scenario; extract selected material if present
    with open(trace_path, 'r', encoding='utf-8') as f:
        trace = json.load(f)
    selections = []
    for entry in trace:
        response = entry.get('response', {})
        # Assume the API returns a field 'selected_material' (string) or picks the top alternative
        selected = response.get('selected_material')
        if not selected:
            # fallback: pick first key from 'alternatives' dict if exists
            alts = response.get('alternatives', {})
            if isinstance(alts, dict) and alts:
                first_cat = next(iter(alts))
                first_opt = alts[first_cat][0] if alts[first_cat] else None
                selected = first_opt.get('material') if first_opt else None
        if selected:
            selections.append(selected)
    # Count frequencies
    from collections import Counter
    counter = Counter(selections)
    if not counter:
        return
    labels, counts = zip(*counter.most_common())
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.bar(labels, counts, color='#f5a623')
    ax.set_title('Material Selection Frequency')
    ax.set_xlabel('Material')
    ax.set_ylabel('Selections')
    ax.tick_params(axis='x', rotation=45, labelsize=8)
    _save_figure(fig, FIGURES['material_selection'])


def constraint_pass_rate(trace_path):
    # Assume each response includes a boolean 'constraints_passed' field
    with open(trace_path, 'r', encoding='utf-8') as f:
        trace = json.load(f)
    passed = 0
    total = len(trace)
    for entry in trace:
        if entry.get('response', {}).get('constraints_passed'):
            passed += 1
    rate = (passed / total) * 100 if total else 0
    fig, ax = plt.subplots()
    ax.bar(['Pass Rate'], [rate], color='#50e3c2')
    ax.set_ylim(0, 100)
    ax.set_title('Constraint Pass Rate')
    ax.set_ylabel('Percentage')
    _save_figure(fig, FIGURES['constraint_pass_rate'])


def response_time_distribution(rows):
    times = [float(r.get('response_time_ms', 0)) for r in rows]
    fig, ax = plt.subplots()
    ax.hist(times, bins=20, color='#b8e986', edgecolor='white')
    ax.set_title('Response Time Distribution')
    ax.set_xlabel('Milliseconds')
    ax.set_ylabel('Count')
    _save_figure(fig, FIGURES['response_time'])


def generate_all_figures():
    rows = _load_data()
    engineering_score_distribution(rows)
    ml_score_distribution(rows)
    hybrid_score_distribution(rows)
    confidence_distribution(rows, 'engineering_confidence', 'Engineering Confidence Distribution', 'engineering_confidence')
    confidence_distribution(rows, 'prediction_confidence', 'Prediction Confidence Distribution', 'prediction_confidence')
    confidence_distribution(rows, 'climate_confidence', 'Climate Confidence Distribution', 'climate_confidence')
    response_time_distribution(rows)
    material_selection_frequency(str(TRACE_JSON))
    # constraint_pass_rate may not be available; guard against missing field
    try:
        constraint_pass_rate(str(TRACE_JSON))
    except Exception:
        pass

if __name__ == '__main__':
    generate_all_figures()
