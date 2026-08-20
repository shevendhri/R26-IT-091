"""
GreenConstructAI — Statistical Analysis Script
===============================================
Prompt 2: Descriptive Statistics & Publication-Quality CSV Tables

Reads evaluation_results_latest.csv (produced by 01_run_evaluation.py)
and computes full descriptive statistics for Chapter 4.

Outputs:
  results/stats_summary.csv              — main descriptive stats table
  results/stats_by_building_type.csv     — grouped by building type
  results/stats_by_structural_system.csv — grouped by structural system
  results/stats_by_climate_zone.csv      — grouped by climate zone
  results/stats_by_budget_level.csv      — grouped by budget level
  results/score_distributions.csv        — all score columns side-by-side
  results/response_time_stats.csv        — runtime analysis

Run:
    cd "C:/Users/ASUS/Desktop/Material specification/backend"
    python evaluation/02_statistics.py
"""

import sys
import csv
import statistics
from pathlib import Path
from collections import defaultdict

INPUT_CSV = Path(__file__).parent / "results" / "evaluation_results_latest.csv"
OUT_DIR   = Path(__file__).parent / "results"
OUT_DIR.mkdir(exist_ok=True)


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_csv(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def to_float_list(rows: list[dict], col: str) -> list[float]:
    vals = []
    for r in rows:
        v = r.get(col, "")
        try:
            vals.append(float(v))
        except (ValueError, TypeError):
            pass
    return vals


def describe(values: list[float], label: str = "") -> dict:
    if not values:
        return {"metric": label, "n": 0, "mean": "N/A", "median": "N/A",
                "min": "N/A", "max": "N/A", "std_dev": "N/A",
                "p25": "N/A", "p75": "N/A", "range": "N/A"}
    n = len(values)
    s = sorted(values)
    mean   = statistics.mean(values)
    med    = statistics.median(values)
    mn     = min(values)
    mx     = max(values)
    std    = statistics.stdev(values) if n > 1 else 0.0
    p25    = s[int(0.25 * n)]
    p75    = s[int(0.75 * n)]
    return {
        "metric":  label,
        "n":       n,
        "mean":    round(mean, 3),
        "median":  round(med, 3),
        "min":     round(mn, 3),
        "max":     round(mx, 3),
        "std_dev": round(std, 3),
        "p25":     round(p25, 3),
        "p75":     round(p75, 3),
        "range":   round(mx - mn, 3),
    }


def write_csv(path: Path, rows: list[dict], fieldnames: list[str] = None):
    if not rows:
        return
    fn = fieldnames or list(rows[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fn, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"  [OK] {path.name}")


def grouped_stats(rows: list[dict], group_col: str, score_cols: list[str]) -> list[dict]:
    groups = defaultdict(list)
    for r in rows:
        groups[r.get(group_col, "Unknown")].append(r)
    out = []
    for group_val, group_rows in sorted(groups.items()):
        entry = {"group": group_val, "n": len(group_rows)}
        for col in score_cols:
            vals = to_float_list(group_rows, col)
            if vals:
                entry[f"{col}_mean"]   = round(statistics.mean(vals), 2)
                entry[f"{col}_median"] = round(statistics.median(vals), 2)
                entry[f"{col}_std"]    = round(statistics.stdev(vals), 2) if len(vals) > 1 else 0.0
                entry[f"{col}_min"]    = round(min(vals), 2)
                entry[f"{col}_max"]    = round(max(vals), 2)
            else:
                entry[f"{col}_mean"]   = "N/A"
                entry[f"{col}_median"] = "N/A"
                entry[f"{col}_std"]    = "N/A"
                entry[f"{col}_min"]    = "N/A"
                entry[f"{col}_max"]    = "N/A"
        out.append(entry)
    return out


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print(" GreenConstructAI — Statistical Analysis")
    print(f" Input: {INPUT_CSV}")
    print("=" * 70)

    if not INPUT_CSV.exists():
        print(f"[✗] Input file not found: {INPUT_CSV}")
        print("    Run 01_run_evaluation.py first.")
        sys.exit(1)

    rows = load_csv(INPUT_CSV)
    ok_rows = [r for r in rows if r.get("api_status") == "OK"]
    print(f"\n  Total scenarios loaded : {len(rows)}")
    print(f"  Successful API calls   : {len(ok_rows)}")
    print(f"  Failed / skipped       : {len(rows) - len(ok_rows)}\n")

    SCORE_COLS = [
        "overall_hybrid_score",
        "engineering_score",
        "ml_confidence",
        "average_sustainability",
        "decision_confidence_score",
        "eco_rating",
    ]

    # ── 1. Overall Descriptive Statistics ─────────────────────────────────────
    print("[1] Computing overall descriptive statistics...")
    summary_rows = []
    col_labels = {
        "overall_hybrid_score":      "Hybrid Score (Overall)",
        "engineering_score":         "Engineering Score",
        "ml_confidence":             "ML Confidence",
        "average_sustainability":    "Sustainability Score",
        "decision_confidence_score": "Decision Confidence (%)",
        "eco_rating":                "Eco Rating",
        "runtime_ms":                "Response Time (ms)",
    }
    for col, label in col_labels.items():
        vals = to_float_list(ok_rows, col)
        summary_rows.append(describe(vals, label))

    fieldnames = ["metric", "n", "mean", "median", "min", "max", "std_dev", "p25", "p75", "range"]
    write_csv(OUT_DIR / "stats_summary.csv", summary_rows, fieldnames)

    # ── 2. By Building Type ────────────────────────────────────────────────────
    print("[2] Computing stats by building type...")
    bt_rows = grouped_stats(ok_rows, "building_type", SCORE_COLS)
    write_csv(OUT_DIR / "stats_by_building_type.csv", bt_rows)

    # ── 3. By Structural System ────────────────────────────────────────────────
    print("[3] Computing stats by structural system...")
    ss_rows = grouped_stats(ok_rows, "structural_system", SCORE_COLS)
    write_csv(OUT_DIR / "stats_by_structural_system.csv", ss_rows)

    # ── 4. By Climate Zone ─────────────────────────────────────────────────────
    print("[4] Computing stats by climate zone...")
    cz_rows = grouped_stats(ok_rows, "climate_zone", SCORE_COLS)
    write_csv(OUT_DIR / "stats_by_climate_zone.csv", cz_rows)

    # ── 5. By Budget Level ─────────────────────────────────────────────────────
    print("[5] Computing stats by budget level...")
    bl_rows = grouped_stats(ok_rows, "budget_level", SCORE_COLS)
    write_csv(OUT_DIR / "stats_by_budget_level.csv", bl_rows)

    # ── 6. Score Distributions side-by-side ───────────────────────────────────
    print("[6] Exporting score distributions...")
    dist_rows = []
    for i, r in enumerate(ok_rows):
        dist_rows.append({
            "index": i + 1,
            "scenario_id":           r.get("scenario_id"),
            "building_type":         r.get("building_type"),
            "location":              r.get("location"),
            "structural_system":     r.get("structural_system"),
            "climate_zone":          r.get("climate_zone"),
            "budget_level":          r.get("budget_level"),
            "overall_hybrid_score":  r.get("overall_hybrid_score"),
            "engineering_score":     r.get("engineering_score"),
            "ml_confidence":         r.get("ml_confidence"),
            "average_sustainability":r.get("average_sustainability"),
            "decision_confidence_score": r.get("decision_confidence_score"),
            "runtime_ms":            r.get("runtime_ms"),
        })
    write_csv(OUT_DIR / "score_distributions.csv", dist_rows)

    # ── 7. Response Time Analysis ──────────────────────────────────────────────
    print("[7] Analysing response times...")
    rt_vals = to_float_list(ok_rows, "runtime_ms")
    if rt_vals:
        s = sorted(rt_vals)
        n = len(s)
        rt_stats = {
            "n":           n,
            "mean_ms":     round(statistics.mean(rt_vals), 1),
            "median_ms":   round(statistics.median(rt_vals), 1),
            "min_ms":      round(min(rt_vals), 1),
            "max_ms":      round(max(rt_vals), 1),
            "std_dev_ms":  round(statistics.stdev(rt_vals), 1) if n > 1 else 0.0,
            "p50_ms":      round(s[int(0.50 * n)], 1),
            "p90_ms":      round(s[int(0.90 * n)], 1),
            "p95_ms":      round(s[min(int(0.95 * n), n-1)], 1),
            "under_5s_pct":round(sum(1 for v in rt_vals if v <= 5000) / n * 100, 1),
            "under_10s_pct":round(sum(1 for v in rt_vals if v <= 10000) / n * 100, 1),
        }
        write_csv(OUT_DIR / "response_time_stats.csv", [rt_stats])

    # ── 8. Constraint Compliance Summary ──────────────────────────────────────
    print("[8] Computing constraint compliance rates...")
    total = len(ok_rows)
    s_pass = sum(1 for r in ok_rows if r.get("structural_compatibility") == "PASS")
    c_pass = sum(1 for r in ok_rows if r.get("climate_compatibility") == "PASS")
    l_pass = sum(1 for r in ok_rows if r.get("sls_compliance") == "PASS")
    compliance = [
        {"constraint": "Structural Compatibility", "pass": s_pass, "fail": total - s_pass,
         "pass_rate_pct": round(s_pass / total * 100, 1) if total else 0},
        {"constraint": "Climate Compatibility",    "pass": c_pass, "fail": total - c_pass,
         "pass_rate_pct": round(c_pass / total * 100, 1) if total else 0},
        {"constraint": "SLS Compliance",           "pass": l_pass, "fail": total - l_pass,
         "pass_rate_pct": round(l_pass / total * 100, 1) if total else 0},
    ]
    write_csv(OUT_DIR / "constraint_compliance.csv", compliance)

    # ── Console summary ────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print(" STATISTICAL SUMMARY (Chapter 4 — Key Figures)")
    print("=" * 70)
    for row in summary_rows:
        print(f"  {row['metric']:<35s}  mean={row['mean']}  σ={row['std_dev']}  [{row['min']} – {row['max']}]")
    print()
    print(f"  Structural Compatibility : {s_pass}/{total} PASS ({round(s_pass/total*100,1) if total else 0}%)")
    print(f"  Climate Compatibility    : {c_pass}/{total} PASS ({round(c_pass/total*100,1) if total else 0}%)")
    print(f"  SLS Compliance           : {l_pass}/{total} PASS ({round(l_pass/total*100,1) if total else 0}%)")
    print("\n  All tables written to:", OUT_DIR)
    print("=" * 70)


if __name__ == "__main__":
    main()
