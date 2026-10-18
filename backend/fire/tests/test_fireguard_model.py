from types import SimpleNamespace

from backend.fire.ml.fireguard_detector import FireGuardDetector
from backend.fire.ml.model_config import FireGuardModelConfig
from backend.fire.ml.model_schema import BoundingBox, DetectionEvidence, ModelInferenceResult
from backend.fire.ml.validated_replay import load_validated_replay
from backend.fire.model_evidence import build_fireguard_project_schema, normalize_model_evidence


class Scalar:
    def __init__(self, value): self.value = value
    def item(self): return self.value


class Coordinates:
    def __init__(self, values): self.values = values
    def __getitem__(self, _): return self
    def tolist(self): return self.values


def test_unavailable_weights_are_reported(tmp_path):
    detector = FireGuardDetector(FireGuardModelConfig(weights_path=tmp_path / "missing.pt"))
    assert detector.is_available() is False
    assert detector.get_model_info()["weights_available"] is False


def test_detector_normalizes_confidence_bbox_and_counts():
    box = SimpleNamespace(cls=Scalar(2), conf=Scalar(0.87), xyxy=Coordinates([1, 2, 30, 40]))
    detections = FireGuardDetector().normalize_results([SimpleNamespace(names={2: "fire_extinguisher"}, boxes=[box])])
    assert detections[0].confidence == 0.87
    assert detections[0].bbox == BoundingBox(x1=1, y1=2, x2=30, y2=40)
    assert FireGuardDetector.aggregate_counts(detections) == {"fire_extinguisher": 1}


def test_validated_replay_is_never_live():
    result = load_validated_replay(FireGuardModelConfig().replay_path)
    assert result.inference_mode == "VALIDATED_REPLAY"
    assert result.weights_available is False


def test_merge_preserves_unknown_and_stair_candidate_safety():
    result = ModelInferenceResult(model_name="FireGuard Vision Detector", architecture="YOLOv8", inference_mode="VALIDATED_REPLAY", weights_available=False, confidence_threshold=0.6, detections=[DetectionEvidence(class_id=7, class_name="staircase", confidence=0.82, bbox=None)], class_counts={"staircase": 1})
    user = {"project_name":"Test","building_use":"Office","purpose_group":"3","storey_count":2,"highest_habitable_floor_level_m":3,"building_height_m":6,"total_floor_area_m2":100,"independent_exit_count":None,"escape_arrangement":"TWO_WAY","travel_distance_m":None,"corridor_width_m":1.2,"staircase_count":None,"stair_width_m":1.1,"protected_stair":True}
    project = build_fireguard_project_schema(user, result)
    assert project.project["stair_candidate_count"] == 1
    assert project.project["confirmed_independent_exit_count"] is None
    assert project.project["travel_distance_m"] is None
    assert project.extraction["model_detected_evidence"]["stair_candidate_count"]["source"] == "MODEL_DETECTED"
    assert not any("status" in item for item in project.fire_features_detected if item.get("status") in {"PASS", "VIOLATION"})


def test_model_evidence_keeps_average_confidence():
    result = ModelInferenceResult(model_name="x", architecture="YOLOv8", inference_mode="VALIDATED_REPLAY", weights_available=False, confidence_threshold=0.6, detections=[DetectionEvidence(class_id=2,class_name="fire_extinguisher",confidence=0.8),DetectionEvidence(class_id=2,class_name="fire_extinguisher",confidence=0.9)], class_counts={"fire_extinguisher":2})
    assert normalize_model_evidence(result)["extinguisher_count"] == {"value":2,"source":"MODEL_DETECTED","confidence":0.85}
