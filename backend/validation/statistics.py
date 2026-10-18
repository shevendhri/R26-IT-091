import csv
import json
from pathlib import Path
from .config import CSV_RESULTS, EVIDENCE_DIR

def compute_statistics():
    """Read the CSV results and generate descriptive statistics.
    Writes a JSON file `statistics.json` in the evidence directory.
    """
    total = 0
    eng_scores = []
    ml_scores = []
    hybrid_scores = []
    eng_confs = []
    pred_confs = []
    clim_confs = []
    response_times = []
    with open(CSV_RESULTS, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            try:
                eng_scores.append(float(row.get("engineering_score", 0)))
                ml_scores.append(float(row.get("ml_score", 0)))
                hybrid_scores.append(float(row.get("hybrid_score", 0)))
                eng_confs.append(float(row.get("engineering_confidence", 0)))
                pred_confs.append(float(row.get("prediction_confidence", 0)))
                clim_confs.append(float(row.get("climate_confidence", 0)))
                response_times.append(float(row.get("response_time_ms", 0)))
            except ValueError:
                continue
    def summarize(values):
        if not values:
            return {"min": None, "max": None, "mean": None, "median": None}
        sorted_vals = sorted(values)
        n = len(values)
        mean = sum(values) / n
        median = (sorted_vals[n // 2] if n % 2 == 1 else (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0)
        return {"min": min(values), "max": max(values), "mean": mean, "median": median}
    stats = {
        "total_scenarios": total,
        "engineering_score": summarize(eng_scores),
        "ml_score": summarize(ml_scores),
        "hybrid_score": summarize(hybrid_scores),
        "engineering_confidence": summarize(eng_confs),
        "prediction_confidence": summarize(pred_confs),
        "climate_confidence": summarize(clim_confs),
        "response_time_ms": summarize(response_times),
    }
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    out_path = EVIDENCE_DIR / "statistics.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"[statistics] Wrote summary to {out_path}")

if __name__ == "__main__":
    compute_statistics()
