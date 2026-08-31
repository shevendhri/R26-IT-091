import os
from dataclasses import dataclass
from pathlib import Path

FIREGUARD_CLASSES = (
    "fire_exit", "emergency_exit_sign", "fire_extinguisher", "smoke_detector",
    "sprinkler", "fire_alarm", "fire_door", "staircase", "hydrant",
    "hose_reel", "assembly_point", "emergency_telephone",
)


@dataclass(frozen=True)
class FireGuardModelConfig:
    model_name: str = "FireGuard Vision Detector"
    architecture: str = "YOLOv8"
    confidence_threshold: float = float(os.getenv("FIREGUARD_YOLO_CONFIDENCE", "0.60"))
    iou_threshold: float = float(os.getenv("FIREGUARD_YOLO_IOU", "0.45"))
    weights_path: Path = Path(os.getenv("FIREGUARD_YOLO_WEIGHTS", Path(__file__).parent / "weights" / "best.pt"))
    replay_path: Path = Path(__file__).parents[1] / "fixtures" / "validated_compliant_plan.json"
    metrics_path: Path = Path(__file__).parents[1] / "model_metrics" / "fireguard_metrics.json"
