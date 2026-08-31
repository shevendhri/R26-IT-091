import json
from pathlib import Path

from .model_schema import ModelInferenceResult


def load_validated_replay(path: Path) -> ModelInferenceResult:
    payload = json.loads(path.read_text(encoding="utf-8"))
    payload["inference_mode"] = "VALIDATED_REPLAY"
    payload["weights_available"] = False
    return ModelInferenceResult.model_validate(payload)
