from pathlib import Path
from time import perf_counter

from .model_config import FIREGUARD_CLASSES, FireGuardModelConfig
from .model_schema import BoundingBox, DetectionEvidence, ModelInferenceResult

try:
    from ultralytics import YOLO
except ImportError:  # FireGuard remains usable in validated replay mode.
    YOLO = None


class FireGuardDetector:
    def __init__(self, config: FireGuardModelConfig | None = None):
        self.config = config or FireGuardModelConfig()
        self.model = None

    def load_model(self):
        if not self.config.weights_path.is_file():
            raise FileNotFoundError(f"FireGuard weights not found: {self.config.weights_path}")
        if YOLO is None:
            raise RuntimeError("Ultralytics is not installed for FireGuard")
        # Load FireGuard YOLOv8 weights
        self.model = YOLO(str(self.config.weights_path))
        return self.model

    def is_available(self) -> bool:
        return YOLO is not None and self.config.weights_path.is_file()

    def predict(self, image) -> ModelInferenceResult:
        if self.model is None:
            self.load_model()
        started = perf_counter()
        # Run fire-safety object detection
        results = self.model.predict(
            source=image,
            conf=self.config.confidence_threshold,
            iou=self.config.iou_threshold,
            verbose=False,
        )
        detections = self.normalize_results(results)
        return ModelInferenceResult(
            model_name=self.config.model_name,
            architecture=self.config.architecture,
            inference_mode="LIVE",
            weights_available=True,
            confidence_threshold=self.config.confidence_threshold,
            detections=detections,
            class_counts=self.aggregate_counts(detections),
            inference_seconds=round(perf_counter() - started, 4),
        )

    def normalize_results(self, results) -> list[DetectionEvidence]:
        # Normalize YOLO detections into FireGuard evidence
        normalized = []
        for result in results:
            names = result.names
            for box in result.boxes:
                class_id = int(box.cls.item())
                class_name = names.get(class_id, str(class_id)) if isinstance(names, dict) else names[class_id]
                if class_name not in FIREGUARD_CLASSES:
                    continue
                x1, y1, x2, y2 = (float(value) for value in box.xyxy[0].tolist())
                normalized.append(DetectionEvidence(
                    class_id=class_id,
                    class_name=class_name,
                    confidence=float(box.conf.item()),
                    bbox=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                ))
        return normalized

    @staticmethod
    def aggregate_counts(detections: list[DetectionEvidence]) -> dict[str, int]:
        counts = {}
        for detection in detections:
            counts[detection.class_name] = counts.get(detection.class_name, 0) + 1
        return counts

    def get_model_info(self) -> dict[str, object]:
        return {
            "model_name": self.config.model_name,
            "architecture": self.config.architecture,
            "classes": list(FIREGUARD_CLASSES),
            "confidence_threshold": self.config.confidence_threshold,
            "iou_threshold": self.config.iou_threshold,
            "weights_path": str(self.config.weights_path),
            "weights_available": self.config.weights_path.is_file(),
            "available": self.is_available(),
        }
