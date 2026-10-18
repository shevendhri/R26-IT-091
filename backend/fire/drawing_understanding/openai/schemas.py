from enum import Enum
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

SCHEMA_VERSION = 2

class EvidenceState(str, Enum):
    CONFIRMED = "CONFIRMED"
    EXTRACTED = "EXTRACTED"
    USER_CONFIRMED = "USER_CONFIRMED"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"
    PARTIAL = "PARTIAL"
    UNKNOWN = "UNKNOWN"
    CONFLICTING = "CONFLICTING"

class Completeness(str, Enum):
    COMPLETE = "COMPLETE"
    PARTIAL = "PARTIAL"
    UNKNOWN = "UNKNOWN"

class SemanticRegionType(str, Enum):
    TITLE_BLOCK = "TITLE_BLOCK"
    DOOR_WINDOW_SCHEDULE = "DOOR_WINDOW_SCHEDULE"
    FLOOR_AREA_SCHEDULE = "FLOOR_AREA_SCHEDULE"
    SECTION_ELEVATION = "SECTION_ELEVATION"
    STAIR_ESCAPE_PLAN = "STAIR_ESCAPE_PLAN"
    FIRE_SAFETY_LEGEND = "FIRE_SAFETY_LEGEND"
    FIRE_SAFETY_REGION = "FIRE_SAFETY_REGION"
    FIRE_PLAN_REGION = "FIRE_PLAN_REGION"

class RegionBBox(BaseModel):
    model_config = ConfigDict(extra="forbid")
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    width: float = Field(ge=0, le=1)
    height: float = Field(ge=0, le=1)

class SemanticRegionEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    region_type: SemanticRegionType
    label: str | None = None
    page: int | None = Field(default=None, ge=1)
    bbox: RegionBBox | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    reason: str | None = None

class PlanOverviewExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plan_type: str | None = None
    project_name: str | None = None
    drawing_title: str | None = None
    building_use_text: str | None = None
    storey_count: int | None = None
    designed_occupants: int | None = None
    schedules_visible: list[str] = Field(default_factory=list)
    plans_visible: list[str] = Field(default_factory=list)
    sections_visible: list[str] = Field(default_factory=list)
    important_regions: list[str] = Field(default_factory=list)
    semantic_regions: list[SemanticRegionEvidence] = Field(default_factory=list)
    architectural_plan_present: bool | None = None
    fire_plan_present: bool | None = None
    fire_annotations_present: bool | None = None
    evidence_text: str | None = None

class RegionFailureExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    evidence_found: bool = False
    evidence_text: str | None = None
    uncertainties: list[str] = Field(default_factory=list)

class DoorRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    mark: str | None = None
    width_m: float | None = None
    height_m: float | None = None
    door_type: str | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class WindowRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    mark: str | None = None
    width_m: float | None = None
    height_m: float | None = None
    window_type: str | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class DoorScheduleExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schedule_found: bool = False
    door_rows: list[DoorRow] = Field(default_factory=list)
    window_rows: list[WindowRow] = Field(default_factory=list)
    evidence_text: str | None = None

class FloorAreaRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_name: str | None = None
    area_value: float | None = None
    area_unit: str | None = None
    area_m2: float | None = None
    normalized_area_m2: float | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class FloorAreaExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    rows: list[FloorAreaRow] = Field(default_factory=list)
    total_area_value: float | None = None
    total_area_unit: str | None = None
    total_area_m2: float | None = None
    evidence_text: str | None = None

class CombinedScheduleExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schedule_found: bool = False
    doors: list[DoorRow] = Field(default_factory=list)
    windows: list[WindowRow] = Field(default_factory=list)
    floor_areas: list[FloorAreaRow] = Field(default_factory=list)
    total_area_value: float | None = None
    total_area_unit: str | None = None
    total_floor_area_m2: float | None = None
    total_area_m2: float | None = None
    designed_occupants: int | None = None
    evidence_text: str | None = None

ScheduleDetailExtraction = CombinedScheduleExtraction

class FloorLevelEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_name: str | None = None
    level_m: float | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class HeightExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_levels: list[FloorLevelEvidence] = Field(default_factory=list)
    highest_habitable_floor_level_m: float | None = None
    building_height_m: float | None = None
    roof_level_m: float | None = None
    evidence_text: str | None = None

class WidthEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: str | None = None
    width_m: float | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class StairCoreEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: str | None = None
    floor_name: str | None = None
    protected_stair: bool | None = None
    clear_width_m: float | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class ExitLabelEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: str | None = None
    count: int | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class StairEscapeExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    visible_staircase_count: int | None = None
    confirmed_staircase_count: int | None = None
    stair_widths: list[WidthEvidence] = Field(default_factory=list)
    corridor_widths: list[WidthEvidence] = Field(default_factory=list)
    protected_stairs: list[StairCoreEvidence] = Field(default_factory=list)
    visible_exit_count: int | None = None
    confirmed_independent_exit_count: int | None = None
    exit_labels: list[ExitLabelEvidence] = Field(default_factory=list)
    escape_type: str | None = None
    route_topology_confirmed: bool | None = None
    travel_distance_m: float | None = None
    rooms_or_occupancies: list[str] = Field(default_factory=list)
    evidence_text: str | None = None

class FireFeatureRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    feature: str | None = None
    present: bool | None = None
    count: int | None = Field(default=None, ge=0)
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class FireFeatureExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sprinkler_present: bool | None = None
    wet_riser_present: bool | None = None
    hose_reel_count: int | None = Field(default=None, ge=0)
    fire_lift_present: bool | None = None
    fire_alarm_present: bool | None = None
    manual_call_point_count: int | None = Field(default=None, ge=0)
    smoke_detector_count: int | None = Field(default=None, ge=0)
    heat_detector_count: int | None = Field(default=None, ge=0)
    emergency_light_count: int | None = Field(default=None, ge=0)
    exit_sign_count: int | None = Field(default=None, ge=0)
    fire_extinguisher_count: int | None = Field(default=None, ge=0)
    hydrant_present: bool | None = None
    public_hydrant_distance_m: float | None = None
    fire_pump_present: bool | None = None
    features: list[FireFeatureRow] = Field(default_factory=list)
    evidence_text: str | None = None

class FastStoreyEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    storey_count: int | None = None
    floor_names: list[str] = Field(default_factory=list)
    evidence_text: str | None = None
    source_region: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class FastPlanExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    project_name: str | None = None
    building_use_text: str | None = None
    storeys: FastStoreyEvidence = Field(default_factory=FastStoreyEvidence)
    floor_areas: list[FloorAreaRow] = Field(default_factory=list)
    total_floor_area_m2: float | None = None
    doors: list[DoorRow] = Field(default_factory=list)
    windows: list[WindowRow] = Field(default_factory=list)
    highest_storey_floor_level_m: float | None = None
    building_height_m: float | None = None
    visible_stair_count: int | None = None
    room_labels: list[str] = Field(default_factory=list)
    visible_fire_features: list[FireFeatureRow] = Field(default_factory=list)
    architectural_plan_present: bool | None = None
    fire_plan_present: bool | None = None
    fire_annotations_present: bool | None = None
    evidence_text: str | None = None

class EvidenceValue(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    source_page: int | None = Field(default=None, ge=1)
    evidence_text: str | None = None
    evidence_type: str | None = None
    provider: str = "openai"
    state: EvidenceState = EvidenceState.UNKNOWN

class DocumentEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    filename: str | None = None
    document_type: str | None = None

class BuildingInfoEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    project_name: EvidenceValue = Field(default_factory=EvidenceValue)
    building_use: EvidenceValue = Field(default_factory=EvidenceValue)
    explicit_storey_count: EvidenceValue = Field(default_factory=EvidenceValue)
    height_m: EvidenceValue = Field(default_factory=EvidenceValue)
    highest_habitable_floor_level_m: EvidenceValue = Field(default_factory=EvidenceValue)
    total_floor_area_m2: EvidenceValue = Field(default_factory=EvidenceValue)
    designed_occupants: EvidenceValue = Field(default_factory=EvidenceValue)
    floor_names_visible: list[str] = Field(default_factory=list)
    storey_count_confidence: float | None = Field(default=None, ge=0, le=1)
    storey_count_evidence: str | None = None

class OpenAIFloorLevelEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = None
    level_m: float | None = None
    page: int | None = Field(default=None, ge=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_text: str | None = None

class FloorAreaEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_name: str | None = None
    area_m2: float | None = None
    source_page: int | None = Field(default=None, ge=1)
    evidence_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class RoomEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: str | None = None
    page: int | None = Field(default=None, ge=1)
    approximate_region: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_text: str | None = None

class DoorEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    door_id: str | None = None
    page: int | None = Field(default=None, ge=1)
    width_mm: float | None = None
    height_mm: float | None = None
    physical_instance_confirmed: bool | None = None
    is_exit: bool | None = None
    opens_in_exit_direction: bool | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_text: str | None = None

class StairEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    page: int | None = Field(default=None, ge=1)
    label: str | None = None
    approximate_region: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    physical_stair_confirmed: bool | None = None
    evidence_text: str | None = None

class ExitEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    page: int | None = Field(default=None, ge=1)
    type: str | None = None
    door_reference: str | None = None
    approximate_region: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_text: str | None = None

class FireEquipmentEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: str | None = None
    page: int | None = Field(default=None, ge=1)
    label: str | None = None
    count: int | None = Field(default=None, ge=0)
    approximate_region: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_text: str | None = None
    presence: EvidenceState = EvidenceState.UNKNOWN

class DimensionEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: float | None = None
    unit: Literal["mm", "m", "sqm", "m2", "sq.m", "unknown"] | None = None
    dimension_type: str | None = None
    associated_object: str | None = None
    page: int | None = Field(default=None, ge=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence_text: str | None = None

class ScheduleEntryEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schedule_type: str | None = None
    row_text: str | None = None
    page: int | None = Field(default=None, ge=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    parsed_summary: str | None = None

class PageEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    page: int
    classification: Literal["ARCHITECTURAL", "FIRE", "COMBINED", "UNKNOWN"] = "UNKNOWN"
    floor_shown: str | None = None
    native_pdf_text_available: bool | None = None
    interpretation_status: EvidenceState = EvidenceState.PARTIAL
    warnings: list[str] = Field(default_factory=list)

class PlanExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int = SCHEMA_VERSION
    document: DocumentEvidence = Field(default_factory=DocumentEvidence)
    pages: list[PageEvidence] = Field(default_factory=list)
    building_info: BuildingInfoEvidence = Field(default_factory=BuildingInfoEvidence)
    semantic_regions: list[SemanticRegionEvidence] = Field(default_factory=list)
    fire_annotations_present: EvidenceValue = Field(default_factory=EvidenceValue)
    floor_levels: list[OpenAIFloorLevelEvidence] = Field(default_factory=list)
    floor_areas: list[FloorAreaEvidence] = Field(default_factory=list)
    rooms: list[RoomEvidence] = Field(default_factory=list)
    room_detection_completeness: Completeness = Completeness.PARTIAL
    doors: list[DoorEvidence] = Field(default_factory=list)
    stairs: list[StairEvidence] = Field(default_factory=list)
    exits: list[ExitEvidence] = Field(default_factory=list)
    fire_equipment: list[FireEquipmentEvidence] = Field(default_factory=list)
    dimensions: list[DimensionEvidence] = Field(default_factory=list)
    schedules: list[ScheduleEntryEvidence] = Field(default_factory=list)
    evidence: list[EvidenceValue] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)

    @field_validator("schema_version")
    @classmethod
    def supported_schema(cls, value: int) -> int:
        if value != SCHEMA_VERSION:
            raise ValueError("unsupported plan extraction schema version")
        return value
