from typing import Literal

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionEvidence(BaseModel):
    class_id: int
    class_name: str
    confidence: float = Field(ge=0, le=1)
    bbox: BoundingBox | None = None
    source: str = "MODEL_DETECTED"
    status: str = "DETECTED"


class ValidatedExitDoorEvidence(BaseModel):
    mark: str
    width_m: float
    height_mm: float
    opens_in_exit_direction: bool


class ValidatedPlanEvidence(BaseModel):
    sprinkler_system: bool | None = None
    alarm_system: bool | None = None
    escape_route_lighting: bool | None = None
    exit_signage: bool | None = None
    manual_call_points: bool | None = None
    manual_call_point_status: Literal["CONFIRMED"] | None = None
    manual_call_point_count: int | None = Field(default=None, ge=0)
    manual_call_point_max_travel_m: float | None = Field(default=None, ge=0)
    manual_call_point_mounting_height_m: float | None = Field(default=None, ge=0)
    extinguisher_count: int | None = Field(default=None, ge=0)
    extinguisher_status: Literal["CONFIRMED"] | None = None
    extinguisher_rating: str | None = None
    extinguisher_max_travel_m: float | None = Field(default=None, ge=0)
    extinguisher_mounting_height_m: float | None = Field(default=None, ge=0)
    hose_reel_count: int | None = Field(default=None, ge=0)
    hose_reel_status: Literal["CONFIRMED"] | None = None
    hose_reel_coverage_verified: bool | None = None
    directional_exit_signage: bool | None = None
    exit_signage_status: Literal["CONFIRMED"] | None = None
    public_hydrant_distance_m: float | None = Field(default=None, ge=0)
    exit_doors: list[ValidatedExitDoorEvidence] = Field(default_factory=list)


class ModelInferenceResult(BaseModel):
    model_name: str
    architecture: str
    inference_mode: Literal["LIVE", "VALIDATED_REPLAY", "UNAVAILABLE"]
    weights_available: bool
    confidence_threshold: float
    detections: list[DetectionEvidence] = Field(default_factory=list)
    class_counts: dict[str, int] = Field(default_factory=dict)
    inference_seconds: float | None = None
    validated_plan_evidence: ValidatedPlanEvidence | None = None
