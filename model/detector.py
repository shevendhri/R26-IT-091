"""Shared, serialized inference for the verified four-class checkpoint."""
import os
from pathlib import Path
from threading import Lock

WEIGHTS = Path(os.environ.get("BLUEPRINT_MODEL_PATH", str(Path(__file__).resolve().parents[1] / "backend/runs/blueprint_clean_gpu/weights/best.pt")))
IMGSZ = 960
CONF = 0.25
NAMES = {"wall", "door", "window", "room"}
_model = None
_lock = Lock()


def detect(image_bytes):
    import cv2
    import numpy as np
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Upload a valid PNG or JPEG image.")
    global _model
    with _lock:
        if _model is None:
            if not WEIGHTS.is_file():
                raise RuntimeError("Blueprint checkpoint is missing. Configure BLUEPRINT_MODEL_PATH.")
            from ultralytics import YOLO
            candidate = YOLO(str(WEIGHTS))
            if {str(n).lower() for n in candidate.names.values()} != NAMES:
                raise RuntimeError("Checkpoint must contain Wall, Door, Window and Room classes.")
            _model = candidate
        result = _model.predict(image, imgsz=IMGSZ, conf=CONF, iou=0.7, max_det=600, verbose=False)[0]
        boxes = []
        counts = dict.fromkeys(sorted(NAMES), 0)
        for box in result.boxes:
            name = str(result.names[int(box.cls.item())]).lower()
            x1,y1,x2,y2 = box.xyxy[0].tolist()
            boxes.append(dict(cls=name, conf=round(float(box.conf.item()),4), x1=x1,y1=y1,x2=x2,y2=y2))
            counts[name] += 1
    return counts, boxes
