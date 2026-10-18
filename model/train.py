"""
train.py — YOLOv8s training script for floor plan detection

Run locally:
    pip install ultralytics
    python train.py --data dataset/floorplan.yaml

Run in Google Colab (dataset already in Drive):
    from google.colab import drive
    drive.mount('/content/drive')
    !pip install ultralytics
    !python train.py --data /content/drive/MyDrive/floorplan_v2/floorplan.yaml

After training, best weights are at:
    runs/detect/train/weights/best.pt
Copy that file to model/weights/best.pt to use it in the FastAPI service.
"""

import argparse
import shutil
from pathlib import Path

from ultralytics import YOLO


def parse_args():
    p = argparse.ArgumentParser(description="Train YOLOv8 on floor plan dataset")
    p.add_argument('--data',    default='floorplan.yaml',   help="Path to floorplan.yaml")
    p.add_argument('--model',   default='yolov8s.pt',       help="Base model (yolov8n/s/m.pt)")
    p.add_argument('--epochs',  type=int, default=None,     help="Training epochs (default: 150, or 120 with --pro)")
    p.add_argument('--imgsz',   type=int, default=1024,     help="Input image size (px)")
    p.add_argument('--batch',   type=int, default=None,     help="Batch size (default: 4, or 8 with --pro; lower for large imgsz)")
    p.add_argument('--device',  default='0',                help="'0'=GPU 0, 'cpu'=CPU")
    p.add_argument('--patience',type=int, default=30,       help="Early stopping patience")
    p.add_argument('--out',     default=None,               help="Copy best.pt here after training")
    p.add_argument('--project', default='runs/detect',
                   help="Where Ultralytics saves checkpoints/logs (default: runs/detect, "
                        "LOCAL to the machine running this script). On Colab this MUST be "
                        "a Drive path (e.g. /content/drive/MyDrive/floorplan_v2/runs) or a "
                        "session disconnect loses all progress — checkpoints only survive "
                        "if this points somewhere persistent.")
    p.add_argument('--fast', action='store_true',
                   help="2-stage progressive recipe (~1.5-2h on free Colab T4 instead of 4-8h): "
                        "nano/640px warm-up, then short 1024px fine-tune")
    p.add_argument('--pro', action='store_true',
                   help="Single-stage full-res recipe for Colab Pro/Pro+ (no session-timeout risk, "
                        "better GPU): yolov8s @ 1024px, freeze=10, batch=8. Skips the nano warm-up "
                        "the free-tier --fast recipe needed for session-length reasons, but keeps "
                        "the partial backbone freeze — a freeze=0 variant was tried and converged "
                        "worse (mAP50=0.218 after 99 epochs) than expected. ~4-10h depending on "
                        "assigned GPU (~10-20 Colab compute units on a Standard/T4 tier).")
    return p.parse_args()


def _print_metrics(results):
    print(f"mAP50        : {results.results_dict.get('metrics/mAP50(B)', 'n/a'):.4f}")
    print(f"mAP50-95     : {results.results_dict.get('metrics/mAP50-95(B)', 'n/a'):.4f}")


def train_fast(data, device, out, project):
    """2-stage progressive recipe: fast low-res warm-up, then short full-res fine-tune.

    See doc/MODEL_TRAINING_GUIDE.md 'Fast 2-Stage Recipe' for rationale.
    """
    print("=" * 60)
    print("Floor Plan YOLOv8 Fast Training (2-stage)")
    print(f"  Dataset : {data}")
    print(f"  Device  : {device}")
    print("=" * 60)

    common = dict(
        data=data,
        device=device,
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        warmup_epochs=3,
        augment=True,
        mosaic=1.0,
        degrees=0.0,
        fliplr=0.5,
        flipud=0.0,
        exist_ok=True,
        verbose=True,
    )

    # Stage A: nano, low-res warm-up — fast convergence to roughly-correct boxes
    print("\n--- Stage A: yolov8n.pt @ 640px, up to 40 epochs ---")
    model_a = YOLO('yolov8n.pt')
    results_a = model_a.train(
        epochs=40,
        imgsz=640,
        batch=16,
        patience=15,
        cache='ram',
        freeze=10,
        project=project,
        name='fast_stage_a',
        **common,
    )
    print("\nStage A complete.")
    _print_metrics(results_a)
    stage_a_weights = Path(results_a.save_dir) / 'weights' / 'best.pt'

    # Stage B: resume from Stage A weights, short fine-tune at full resolution
    print("\n--- Stage B: fine-tune from Stage A weights @ 1024px, up to 25 epochs ---")
    model_b = YOLO(str(stage_a_weights))
    results_b = model_b.train(
        epochs=25,
        imgsz=1024,
        batch=4,
        patience=10,
        project=project,
        name='fast_stage_b',
        **common,
    )
    print("\nStage B complete.")
    _print_metrics(results_b)

    best_pt = Path(results_b.save_dir) / 'weights' / 'best.pt'
    print(f"\nFinal weights : {best_pt}")

    if out:
        out_path = Path(out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best_pt, out_path)
        print(f"Copied best.pt → {out_path}")

    print("\nNext steps:")
    print(f"  1. Download {best_pt} (or --out path)")
    print("  2. Replace model/weights/best.pt with the downloaded file")
    print("  3. Restart python main.py — /predict will use real YOLO inference")
    print("\nIf Stage A alone already meets your accuracy target (see results.csv),")
    print(f"you can skip Stage B and ship {project}/fast_stage_a/weights/best.pt directly.")


def train_pro(data, device, out, project, epochs=120, batch=8):
    """Single-stage, full-resolution recipe for Colab Pro/Pro+.

    Uses freeze=10 (partial backbone freeze), matching the --fast recipe.
    A freeze=0 (fully unfrozen) variant was tried and run to convergence
    (99 epochs, best at epoch 74, patience=25) — it plateaued at
    mAP50=0.218 overall, missing the doc/MODEL_TRAINING_GUIDE.md targets
    for every class except room (wall/door/window all far below target).
    That result contradicts the original hypothesis that freezing was
    capping accuracy: with only ~100 epochs, unfreezing the whole
    COCO-pretrained backbone doesn't leave it enough time to re-adapt to
    floor-plan line drawings. Keeping the backbone mostly frozen converges
    faster within the same epoch budget.

    Also tones down `scale` augmentation and raises the `box` loss weight
    relative to Ultralytics defaults. Wall/door/window boxes are already
    thin (see MIN_BOX_DIM_FRAC in convert_dataset.py); the default
    scale=0.5 random zoom can shrink their short side toward invisibility
    during training, and the default box=7.5 loss weight under-prioritizes
    getting these small boxes' regression precise. Bundled into this run
    rather than tested in isolation — full retrains are too expensive to
    A/B one change at a time here.
    """
    print("=" * 60)
    print("Floor Plan YOLOv8 Pro Training (single-stage, full resolution)")
    print(f"  Dataset : {data}")
    print(f"  Device  : {device}")
    print(f"  Epochs  : {epochs}")
    print(f"  Batch   : {batch}")
    print("=" * 60)

    model = YOLO('yolov8s.pt')
    results = model.train(
        data=data,
        epochs=epochs,
        imgsz=1024,
        batch=batch,
        device=device,
        patience=25,
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        warmup_epochs=3,
        augment=True,
        mosaic=1.0,
        scale=0.2,   # default 0.5 shrinks already-thin wall/door/window boxes further
        box=10.0,    # default 7.5 — weight box regression more given small/thin targets
        degrees=0.0,
        fliplr=0.5,
        flipud=0.0,
        freeze=10,  # partial backbone freeze — see docstring above
        project=project,
        name='pro',
        exist_ok=True,
        verbose=True,
    )
    print("\nTraining complete.")
    _print_metrics(results)

    best_pt = Path(results.save_dir) / 'weights' / 'best.pt'
    print(f"\nBest weights : {best_pt}")

    if out:
        out_path = Path(out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best_pt, out_path)
        print(f"Copied best.pt → {out_path}")

    print("\nNext steps:")
    print(f"  1. Download {best_pt} (or --out path)")
    print("  2. Replace model/weights/best.pt with the downloaded file")
    print("  3. Restart python main.py — /predict will use real YOLO inference")


def main():
    args = parse_args()

    if args.fast:
        train_fast(data=args.data, device=args.device, out=args.out, project=args.project)
        return

    if args.pro:
        train_pro(data=args.data, device=args.device, out=args.out, project=args.project,
                  epochs=args.epochs if args.epochs is not None else 120,
                  batch=args.batch if args.batch is not None else 8)
        return

    epochs = args.epochs if args.epochs is not None else 150
    batch = args.batch if args.batch is not None else 4

    print("=" * 60)
    print("Floor Plan YOLOv8 Training")
    print(f"  Base model : {args.model}")
    print(f"  Dataset    : {args.data}")
    print(f"  Epochs     : {epochs}  (early stop: {args.patience})")
    print(f"  Image size : {args.imgsz}px")
    print(f"  Batch      : {batch}")
    print(f"  Device     : {args.device}")
    print("=" * 60)

    model = YOLO(args.model)

    results = model.train(
        data=args.data,
        epochs=epochs,
        imgsz=args.imgsz,
        batch=batch,
        device=args.device,
        patience=args.patience,
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,           # final lr = lr0 * lrf
        warmup_epochs=3,
        augment=True,
        mosaic=1.0,
        degrees=0.0,        # floor plans should not be rotated
        fliplr=0.5,
        flipud=0.0,         # don't flip upside down
        project=args.project,
        name='train',
        exist_ok=True,
        verbose=True,
    )

    best_pt = Path(results.save_dir) / 'weights' / 'best.pt'
    print(f"\nTraining complete.")
    print(f"Best weights : {best_pt}")
    _print_metrics(results)

    # Optionally copy best.pt to a user-specified path
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best_pt, out_path)
        print(f"Copied best.pt → {out_path}")

    print("\nNext steps:")
    print(f"  1. Download {best_pt} (or --out path)")
    print("  2. Replace model/weights/best.pt with the downloaded file")
    print("  3. Restart python main.py — /predict will use real YOLO inference")


if __name__ == '__main__':
    main()
