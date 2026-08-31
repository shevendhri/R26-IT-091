import json

from .fireguard_detector import FireGuardDetector
from .model_config import FireGuardModelConfig
from .model_schema import ModelInferenceResult
from .validated_replay import load_validated_replay


class FireGuardModelService:
    def __init__(self, config: FireGuardModelConfig | None = None):
        self.config = config or FireGuardModelConfig()
        self.detector = FireGuardDetector(self.config)

    def analyze(self, source, *, allow_replay: bool = True) -> ModelInferenceResult:
        if self.detector.is_available():
            return self.detector.predict(source)
        if allow_replay and self.config.replay_path.is_file():
            return load_validated_replay(self.config.replay_path)
        return ModelInferenceResult(
            model_name=self.config.model_name,
            architecture=self.config.architecture,
            inference_mode="UNAVAILABLE",
            weights_available=False,
            confidence_threshold=self.config.confidence_threshold,
        )

    def metrics(self) -> dict[str, object]:
        if not self.config.metrics_path.is_file():
            return {"precision": None, "recall": None, "map50": None, "map50_95": None, "validation_samples": None}
        return json.loads(self.config.metrics_path.read_text(encoding="utf-8"))
