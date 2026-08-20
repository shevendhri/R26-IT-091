import random
import json
import requests
import csv
import time
from datetime import datetime
from pathlib import Path


from .config import (
    RANDOM_SEED,
    SCENARIO_COUNTS,
    LOCATIONS,
    API_URL,
    CSV_RESULTS,
    TRACE_JSON,
    EVIDENCE_DIR,
    FIGURES_DIR,
    FIGURES,
)

random.seed(RANDOM_SEED)

def generate_payload(sector: str, location: str) -> dict:
    """Create a minimal payload compatible with the recommendation API.
    Includes a placeholder blueprint with an empty components dict to avoid empty blueprint issues.
    """
    profile = {"sector": sector, "location": location}
    # Minimal blueprint structure required by recommendation engine
    blueprint = {
        "components": {},
        "metadata": {},
        "audit": []
    }
    return {
        "blueprint": blueprint,
        "location": location,
        "profile": profile,
    }

def call_api(payload: dict) -> dict:
    start = time.time()
    response = requests.post(API_URL, json=payload, timeout=30)
    elapsed_ms = int((time.time() - start) * 1000)
    if response.status_code != 200:
        raise RuntimeError(f"API error {response.status_code}: {response.text}")
    data = response.json()
    data["_response_time_ms"] = elapsed_ms
    return data

def run():
    scenario_id = 0
    rows = []
    trace = []
    for sector, count in SCENARIO_COUNTS.items():
        for _ in range(count):
            scenario_id += 1
            location = random.choice(LOCATIONS)
            payload = generate_payload(sector, location)
            # Stability: repeat 5 times
            prev = None
            stable = True
            for repeat in range(5):
                result = call_api(payload)
                # Extract required fields from the recommendation response
                eng = result.get("engineering_score", 0)
                ml = result.get("ml_score", 0)
                hybrid = result.get("hybrid_score", 0)
                eng_conf = result.get("engineering_confidence", 0)
                pred_conf = result.get("prediction_confidence", 0)
                clim_conf = result.get("climate_confidence", 0)
                # Capture the detailed criterion breakdown for verification later
                criterion_breakdown = json.dumps(result.get("criterion_breakdown", {}))
                resp_time = result.get("_response_time_ms", 0)
                current = (eng, ml, hybrid, eng_conf, pred_conf, clim_conf)
                if prev is not None and current != prev:
                    stable = False
                prev = current
                constraints_passed = result.get('constraints_passed', False)
                selected_material = result.get('selected_material')
                rows.append([
                    scenario_id,
                    sector,
                    location,
                    eng,
                    ml,
                    hybrid,
                    eng_conf,
                    pred_conf,
                    clim_conf,
                    resp_time,
                    criterion_breakdown,
                    json.dumps(constraints_passed),
                    selected_material,
                ])
                trace.append({
                    "scenario_id": scenario_id,
                    "sector": sector,
                    "location": location,
                    "payload": payload,
                    "response": result,
                    "constraints_passed": constraints_passed,
                    "selected_material": selected_material,
                })
            if not stable:
                print(f"[validation_runner] Stability issue in scenario {scenario_id}")
    # Write CSV
    CSV_RESULTS.parent.mkdir(parents=True, exist_ok=True)
    with open(CSV_RESULTS, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        header = [
            "scenario_id",
            "sector",
            "location",
            "engineering_score",
            "ml_score",
            "hybrid_score",
            "engineering_confidence",
            "prediction_confidence",
            "climate_confidence",
            "response_time_ms",
            "criterion_breakdown",
            "constraints_passed",
            "selected_material",
        ]
        writer.writerow(header)
        writer.writerows(rows)
    # Write traceability JSON
    TRACE_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(TRACE_JSON, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2)
    print(f"[validation_runner] Completed {scenario_id} scenarios, CSV saved to {CSV_RESULTS}")
    # Trigger downstream modules
    try:
        import importlib
        importlib.import_module("backend.validation.statistics")
        importlib.import_module("backend.validation.figures")
        importlib.import_module("backend.validation.verification")
    except Exception as e:
        print(f"[validation_runner] downstream import error: {e}")

if __name__ == "__main__":
    run()
