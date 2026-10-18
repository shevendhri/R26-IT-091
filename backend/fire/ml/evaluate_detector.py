import argparse
import json
from pathlib import Path


def evaluate(weights: Path, data: Path, output: Path) -> dict:
    from ultralytics import YOLO

    metrics = YOLO(str(weights)).val(data=str(data), verbose=False)
    result = {
        "precision": float(metrics.box.mp),
        "recall": float(metrics.box.mr),
        "map50": float(metrics.box.map50),
        "map50_95": float(metrics.box.map),
        "validation_samples": int(sum(metrics.box.nc)) if getattr(metrics.box, "nc", None) is not None else None,
        "per_class": {
            str(name): {"map50_95": float(value)}
            for name, value in zip(metrics.names.values(), metrics.box.maps)
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate trained FireGuard YOLOv8 weights")
    parser.add_argument("--weights", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(evaluate(args.weights, args.data, args.output), indent=2))
