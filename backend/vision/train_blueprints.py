"""Train a fresh YOLO baseline on verified CubiCasa annotations."""
import argparse
from pathlib import Path
import torch
from ultralytics import YOLO

BASE = Path(__file__).resolve().parents[1]


def train_blueprint_model(data_yaml_path=None, epochs=80, sanity=False, imgsz=960, batch=1):
    data = Path(data_yaml_path) if data_yaml_path else BASE / "datasets/blueprints_clean_v2" / ("sanity.yaml" if sanity else "data.yaml")
    if not data.is_file():
        raise FileNotFoundError(f"Prepare the clean dataset first: {data}")
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA unavailable. Use backend/.venv-training/Scripts/python.exe")
    print(f"GPU: {torch.cuda.get_device_name(0)}; dataset: {data}", flush=True)
    # Fresh pretrained weights, not the checkpoint trained on incorrect labels.
    model = YOLO(str(BASE / "vision/yolov8n.pt"))
    model.train(
        data=str(data), epochs=epochs, imgsz=imgsz, batch=batch,
        device=0, workers=0, cache=False, amp=True,
        project=str(BASE / "runs"),
        name="blueprint_clean_sanity" if sanity else "blueprint_clean_gpu",
        exist_ok=False, seed=42, deterministic=True,
        patience=epochs if sanity else 25, cos_lr=True,
        mosaic=0.0, mixup=0.0, degrees=0.0,
        translate=0.0 if sanity else 0.05,
        scale=0.0 if sanity else 0.15,
        fliplr=0.0 if sanity else 0.5, flipud=0.0,
        hsv_h=0.0, hsv_s=0.0, hsv_v=0.0 if sanity else 0.1,
        plots=True, max_det=600,
    )
    print(f"Best weights: {model.trainer.best}", flush=True)
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path)
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--sanity", action="store_true")
    parser.add_argument("--imgsz", type=int, default=960)
    parser.add_argument("--batch", type=int, default=1)
    args = parser.parse_args()
    train_blueprint_model(args.data, args.epochs, args.sanity, args.imgsz, args.batch)
