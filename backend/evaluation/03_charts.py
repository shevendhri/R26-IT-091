"""
GreenConstructAI — Publication-Quality Charts
==============================================
Prompt 3: Matplotlib Figures for Chapter 4

Reads evaluation_results_latest.csv and produces:
  figures/fig01_hybrid_score_distribution.png / .svg
  figures/fig02_engineering_score_distribution.png / .svg
  figures/fig03_sustainability_distribution.png / .svg
  figures/fig04_response_time_histogram.png / .svg
  figures/fig05_recommendation_category_frequency.png / .svg
  figures/fig06_boxplot_eng_vs_hybrid.png / .svg
  figures/fig07_scores_by_building_type.png / .svg
  figures/fig08_scores_by_climate_zone.png / .svg
  figures/fig09_scores_by_structural_system.png / .svg
  figures/fig10_ml_confidence_distribution.png / .svg
  figures/fig11_correlation_heatmap.png / .svg

Run:
    cd "C:/Users/ASUS/Desktop/Material specification/backend"
    python evaluation/03_charts.py
"""

import sys
import csv
import statistics
from pathlib import Path
from collections import Counter, defaultdict

# ── Matplotlib setup ──────────────────────────────────────────────────────────
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# Publication-quality settings
plt.rcParams.update({
    "figure.dpi":         300,
    "savefig.dpi":        300,
    "font.family":        "serif",
    "font.serif":         ["Times New Roman", "DejaVu Serif"],
    "axes.titlesize":     13,
    "axes.labelsize":     11,
    "xtick.labelsize":    9,
    "ytick.labelsize":    9,
    "legend.fontsize":    9,
    "axes.grid":          True,
    "grid.alpha":         0.35,
    "axes.spines.top":    False,
    "axes.spines.right":  False,
    "figure.facecolor":   "white",
    "axes.facecolor":     "#FAFAFA",
})

PALETTE = {
    "hybrid":       "#1a73e8",
    "engineering":  "#34a853",
    "ml":           "#9c27b0",
    "sustainability":"#ff6d00",
    "runtime":      "#00838f",
    "neutral":      "#607d8b",
}

INPUT_CSV = Path(__file__).parent / "results" / "evaluation_results_latest.csv"
FIG_DIR   = Path(__file__).parent / "figures"
FIG_DIR.mkdir(exist_ok=True)


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_csv(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def floats(rows, col):
    out = []
    for r in rows:
        try:
            out.append(float(r[col]))
        except (ValueError, TypeError, KeyError):
            pass
    return out


def save(fig, name: str):
    for ext in ("png", "svg"):
        p = FIG_DIR / f"{name}.{ext}"
        fig.savefig(p, bbox_inches="tight")
    print(f"  [✓] {name}.png / .svg")
    plt.close(fig)


def add_mean_line(ax, vals, color="red"):
    m = statistics.mean(vals)
    ax.axvline(m, color=color, linestyle="--", linewidth=1.2, label=f"Mean = {m:.1f}")
    ax.legend()


def kde_smooth(vals, n_points=300):
    """Very simple Gaussian KDE for overlay without scipy."""
    mn, mx = min(vals), max(vals)
    xs = np.linspace(mn - 5, mx + 5, n_points)
    bw = 1.06 * statistics.stdev(vals) * len(vals) ** (-0.2)
    ys = np.zeros(n_points)
    for v in vals:
        ys += np.exp(-0.5 * ((xs - v) / bw) ** 2) / (bw * np.sqrt(2 * np.pi))
    ys /= len(vals)
    return xs, ys


# ── Figure Generators ─────────────────────────────────────────────────────────

def fig01_hybrid_distribution(ok_rows):
    vals = floats(ok_rows, "overall_hybrid_score")
    if not vals:
        return
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))
    # Histogram
    ax = axes[0]
    ax.hist(vals, bins=14, color=PALETTE["hybrid"], edgecolor="white", linewidth=0.7, alpha=0.85)
    xs, ys = kde_smooth(vals)
    ax2 = ax.twinx()
    ax2.plot(xs, ys, color="#0d47a1", linewidth=1.8)
    ax2.set_ylabel("Density", fontsize=9)
    ax2.spines["right"].set_visible(True)
    add_mean_line(ax, vals, "#0d47a1")
    ax.set_xlabel("Hybrid Score")
    ax.set_ylabel("Frequency")
    ax.set_title("Fig 1a — Hybrid Score Distribution")
    # Boxplot
    ax = axes[1]
    bp = ax.boxplot(vals, vert=True, patch_artist=True,
                    boxprops=dict(facecolor=PALETTE["hybrid"], alpha=0.7),
                    medianprops=dict(color="white", linewidth=2))
    ax.set_ylabel("Hybrid Score")
    ax.set_title("Fig 1b — Hybrid Score Boxplot")
    ax.set_xticks([])
    fig.suptitle("GreenConstructAI — Hybrid Recommendation Score Analysis (n=50)", fontsize=12, y=1.01)
    save(fig, "fig01_hybrid_score_distribution")


def fig02_engineering_distribution(ok_rows):
    vals = floats(ok_rows, "engineering_score")
    if not vals:
        return
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.hist(vals, bins=14, color=PALETTE["engineering"], edgecolor="white", linewidth=0.7, alpha=0.85)
    xs, ys = kde_smooth(vals)
    ax2 = ax.twinx()
    ax2.plot(xs, ys, color="#1b5e20", linewidth=1.8)
    ax2.set_ylabel("Density")
    ax2.spines["right"].set_visible(True)
    add_mean_line(ax, vals, "#1b5e20")
    ax.set_xlabel("Engineering Score")
    ax.set_ylabel("Frequency")
    ax.set_title("Fig 2 — Engineering Validation Score Distribution (n=50)")
    save(fig, "fig02_engineering_score_distribution")


def fig03_sustainability_distribution(ok_rows):
    vals = floats(ok_rows, "average_sustainability")
    if not vals:
        return
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.hist(vals, bins=12, color=PALETTE["sustainability"], edgecolor="white", linewidth=0.7, alpha=0.85)
    xs, ys = kde_smooth(vals)
    ax2 = ax.twinx()
    ax2.plot(xs, ys, color="#bf360c", linewidth=1.8)
    ax2.set_ylabel("Density")
    ax2.spines["right"].set_visible(True)
    add_mean_line(ax, vals, "#bf360c")
    ax.set_xlabel("Sustainability Score")
    ax.set_ylabel("Frequency")
    ax.set_title("Fig 3 — Sustainability Score Distribution (n=50)")
    save(fig, "fig03_sustainability_distribution")


def fig04_response_time(ok_rows):
    vals = floats(ok_rows, "runtime_ms")
    if not vals:
        return
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))
    ax = axes[0]
    ax.hist(vals, bins=14, color=PALETTE["runtime"], edgecolor="white", linewidth=0.7, alpha=0.85)
    add_mean_line(ax, vals, "#004d40")
    ax.set_xlabel("Response Time (ms)")
    ax.set_ylabel("Frequency")
    ax.set_title("Fig 4a — Response Time Histogram")
    ax = axes[1]
    # CDF
    s = sorted(vals)
    y = np.arange(1, len(s) + 1) / len(s)
    ax.plot(s, y, color=PALETTE["runtime"], linewidth=2)
    ax.axhline(0.90, color="red", linestyle="--", linewidth=1, label="P90")
    ax.axhline(0.50, color="gray", linestyle="--", linewidth=1, label="P50")
    ax.set_xlabel("Response Time (ms)")
    ax.set_ylabel("Cumulative Probability")
    ax.set_title("Fig 4b — Response Time CDF")
    ax.legend()
    fig.suptitle("GreenConstructAI — API Response Time Analysis (n=50)", fontsize=12, y=1.01)
    save(fig, "fig04_response_time_histogram")


def fig05_category_frequency(ok_rows):
    bt_counts = Counter(r.get("building_type", "Unknown") for r in ok_rows)
    if not bt_counts:
        return
    labels = list(bt_counts.keys())
    vals   = list(bt_counts.values())
    colors = plt.cm.Set2(np.linspace(0, 1, len(labels)))
    fig, ax = plt.subplots(figsize=(9, 4.5))
    bars = ax.bar(labels, vals, color=colors, edgecolor="white", linewidth=0.8)
    ax.bar_label(bars, padding=3, fontsize=10, fontweight="bold")
    ax.set_xlabel("Building Type")
    ax.set_ylabel("Number of Scenarios")
    ax.set_title("Fig 5 — Recommendation Category Frequency Distribution (n=50)")
    save(fig, "fig05_recommendation_category_frequency")


def fig06_boxplot_eng_vs_hybrid(ok_rows):
    eng  = floats(ok_rows, "engineering_score")
    hyb  = floats(ok_rows, "overall_hybrid_score")
    ml   = floats(ok_rows, "ml_confidence")
    sust = floats(ok_rows, "average_sustainability")
    data = [d for d in [eng, hyb, ml, sust] if d]
    labels = []
    if eng:  labels.append("Engineering\nScore")
    if hyb:  labels.append("Hybrid\nScore")
    if ml:   labels.append("ML\nConfidence")
    if sust: labels.append("Sustainability\nScore")
    if not data:
        return
    colors = [PALETTE["engineering"], PALETTE["hybrid"], PALETTE["ml"], PALETTE["sustainability"]]
    fig, ax = plt.subplots(figsize=(10, 5))
    bp = ax.boxplot(data, vert=True, patch_artist=True,
                    notch=False, widths=0.5,
                    medianprops=dict(color="white", linewidth=2.5))
    for patch, color in zip(bp["boxes"], colors[:len(data)]):
        patch.set_facecolor(color)
        patch.set_alpha(0.75)
    ax.set_xticklabels(labels)
    ax.set_ylabel("Score (0–100)")
    ax.set_title("Fig 6 — Boxplot Comparison: Engineering, Hybrid, ML, Sustainability Scores (n=50)")
    save(fig, "fig06_boxplot_eng_vs_hybrid")


def fig07_by_building_type(ok_rows):
    groups = defaultdict(list)
    for r in ok_rows:
        groups[r.get("building_type", "Unknown")].append(r)
    if not groups:
        return
    btypes = sorted(groups.keys())
    x = np.arange(len(btypes))
    w = 0.22
    eng  = [statistics.mean(floats(groups[bt], "engineering_score"))      if floats(groups[bt], "engineering_score")   else 0 for bt in btypes]
    hyb  = [statistics.mean(floats(groups[bt], "overall_hybrid_score"))   if floats(groups[bt], "overall_hybrid_score") else 0 for bt in btypes]
    ml   = [statistics.mean(floats(groups[bt], "ml_confidence"))          if floats(groups[bt], "ml_confidence")        else 0 for bt in btypes]
    sust = [statistics.mean(floats(groups[bt], "average_sustainability"))  if floats(groups[bt], "average_sustainability") else 0 for bt in btypes]
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.bar(x - 1.5*w, eng,  w, label="Engineering", color=PALETTE["engineering"], alpha=0.85)
    ax.bar(x - 0.5*w, hyb,  w, label="Hybrid",      color=PALETTE["hybrid"],      alpha=0.85)
    ax.bar(x + 0.5*w, ml,   w, label="ML Confidence",color=PALETTE["ml"],         alpha=0.85)
    ax.bar(x + 1.5*w, sust, w, label="Sustainability",color=PALETTE["sustainability"], alpha=0.85)
    ax.set_xticks(x)
    ax.set_xticklabels(btypes, rotation=15, ha="right")
    ax.set_ylabel("Mean Score")
    ax.set_title("Fig 7 — Mean Scores by Building Type")
    ax.legend()
    save(fig, "fig07_scores_by_building_type")


def fig08_by_climate_zone(ok_rows):
    groups = defaultdict(list)
    for r in ok_rows:
        cz = r.get("climate_zone", "Unknown") or "Unknown"
        groups[cz].append(r)
    if not groups:
        return
    czones = sorted(groups.keys())
    hyb = [floats(groups[cz], "overall_hybrid_score") for cz in czones]
    hyb = [v for v in hyb if v]
    czones = [cz for cz, v in zip(czones, [floats(groups[c], "overall_hybrid_score") for c in czones]) if v]
    if not hyb:
        return
    fig, ax = plt.subplots(figsize=(11, 5))
    colors = plt.cm.tab10(np.linspace(0, 1, len(czones)))
    bp = ax.boxplot(hyb, vert=True, patch_artist=True,
                    medianprops=dict(color="white", linewidth=2))
    for patch, color in zip(bp["boxes"], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.8)
    ax.set_xticklabels([c.replace(" ", "\n") for c in czones], fontsize=8)
    ax.set_ylabel("Hybrid Score")
    ax.set_title("Fig 8 — Hybrid Score Distribution by Climate Zone")
    save(fig, "fig08_scores_by_climate_zone")


def fig09_by_structural_system(ok_rows):
    groups = defaultdict(list)
    for r in ok_rows:
        groups[r.get("structural_system", "Unknown")].append(r)
    if not groups:
        return
    systems = sorted(groups.keys())
    eng = [floats(groups[s], "engineering_score") for s in systems]
    eng = [v if v else [0] for v in eng]
    fig, ax = plt.subplots(figsize=(11, 5))
    colors = [PALETTE["engineering"], PALETTE["hybrid"], PALETTE["ml"], PALETTE["sustainability"]]
    bp = ax.boxplot(eng, vert=True, patch_artist=True,
                    medianprops=dict(color="white", linewidth=2))
    for patch, color in zip(bp["boxes"], colors[:len(systems)]):
        patch.set_facecolor(color)
        patch.set_alpha(0.8)
    ax.set_xticklabels([s.replace(" ", "\n") for s in systems], fontsize=8)
    ax.set_ylabel("Engineering Score")
    ax.set_title("Fig 9 — Engineering Score by Structural System")
    save(fig, "fig09_scores_by_structural_system")


def fig10_ml_confidence(ok_rows):
    vals = floats(ok_rows, "ml_confidence")
    if not vals:
        return
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.hist(vals, bins=12, color=PALETTE["ml"], edgecolor="white", linewidth=0.7, alpha=0.85)
    xs, ys = kde_smooth(vals)
    ax2 = ax.twinx()
    ax2.plot(xs, ys, color="#4a148c", linewidth=1.8)
    ax2.set_ylabel("Density")
    ax2.spines["right"].set_visible(True)
    add_mean_line(ax, vals, "#4a148c")
    ax.set_xlabel("ML Confidence Score")
    ax.set_ylabel("Frequency")
    ax.set_title("Fig 10 — ML Confidence Score Distribution (n=50)")
    save(fig, "fig10_ml_confidence_distribution")


def fig11_correlation_heatmap(ok_rows):
    cols = ["overall_hybrid_score", "engineering_score", "ml_confidence",
            "average_sustainability", "decision_confidence_score", "runtime_ms"]
    labels = ["Hybrid", "Engineering", "ML Conf.", "Sustainability", "Dec. Conf.", "Runtime"]
    matrix_data = [floats(ok_rows, c) for c in cols]
    n = min(len(d) for d in matrix_data)
    if n < 2:
        return
    matrix_data = [d[:n] for d in matrix_data]
    k = len(cols)
    corr = np.zeros((k, k))
    for i in range(k):
        for j in range(k):
            xi, xj = matrix_data[i], matrix_data[j]
            xi_arr, xj_arr = np.array(xi), np.array(xj)
            if xi_arr.std() == 0 or xj_arr.std() == 0:
                corr[i, j] = 0.0
            else:
                corr[i, j] = float(np.corrcoef(xi_arr, xj_arr)[0, 1])
    fig, ax = plt.subplots(figsize=(8, 6))
    cmap = plt.cm.RdBu_r
    im = ax.imshow(corr, cmap=cmap, vmin=-1, vmax=1, aspect="auto")
    plt.colorbar(im, ax=ax, label="Pearson r")
    ax.set_xticks(range(k))
    ax.set_yticks(range(k))
    ax.set_xticklabels(labels, rotation=40, ha="right")
    ax.set_yticklabels(labels)
    for i in range(k):
        for j in range(k):
            ax.text(j, i, f"{corr[i, j]:.2f}", ha="center", va="center",
                    fontsize=8, color="black" if abs(corr[i, j]) < 0.6 else "white")
    ax.set_title("Fig 11 — Correlation Heatmap of Evaluation Metrics")
    save(fig, "fig11_correlation_heatmap")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print(" GreenConstructAI — Chart Generator")
    print(f" Input : {INPUT_CSV}")
    print(f" Output: {FIG_DIR}")
    print("=" * 70)
    if not INPUT_CSV.exists():
        print("[✗] Input file not found. Run 01_run_evaluation.py first.")
        sys.exit(1)
    rows = load_csv(INPUT_CSV)
    ok_rows = [r for r in rows if r.get("api_status") == "OK"]
    print(f"\n  Loaded {len(ok_rows)} successful scenarios\n")
    generators = [
        fig01_hybrid_distribution,
        fig02_engineering_distribution,
        fig03_sustainability_distribution,
        fig04_response_time,
        fig05_category_frequency,
        fig06_boxplot_eng_vs_hybrid,
        fig07_by_building_type,
        fig08_by_climate_zone,
        fig09_by_structural_system,
        fig10_ml_confidence,
        fig11_correlation_heatmap,
    ]
    for i, fn in enumerate(generators, 1):
        try:
            fn(ok_rows)
        except Exception as exc:
            print(f"  [!] {fn.__name__} failed: {exc}")
    print(f"\n  All figures saved to: {FIG_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    main()
