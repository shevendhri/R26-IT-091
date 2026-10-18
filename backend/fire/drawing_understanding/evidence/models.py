from enum import Enum
from pydantic import BaseModel, Field
from ...schemas import BBox

class EvidenceStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    CONFLICTING = "CONFLICTING"
    NOT_FOUND = "NOT_FOUND"

class PageMode(str, Enum):
    VECTOR = "VECTOR"
    RASTER = "RASTER"
    HYBRID = "HYBRID"

class TextEvidence(BaseModel):
    value: str
    status: EvidenceStatus = EvidenceStatus.CONFIRMED
    confidence: float = Field(default=1.0, ge=0, le=1)
    source_file: str
    page: int = Field(ge=1)
    method: str
    bbox: BBox | None = None
    raw_evidence: str
    normalized_text: str

class PageAnalysis(BaseModel):
    source_file: str
    page: int = Field(ge=1)
    mode: PageMode
    width: float | None = None
    height: float | None = None
    native_text_items: int = 0
    ocr_text_items: int | None = None
    vector_items: int = 0
    raster_images: int = 0
    document_received: bool = True
    plan_classification: str = "UNKNOWN"
    architectural_plan_status: str = "UNKNOWN"
    fire_plan_status: str = "UNKNOWN"
    ocr_provider: str | None = None
    ocr_status: str = "NOT_RUN"
    ocr_duration_ms: int | None = None
    ocr_reason: str | None = None
    orientation_detected_deg: int = 0
    orientation_confidence: float | None = None
    orientation_corrected: bool = False
    orientation_transform: dict = Field(default_factory=dict)
    sheet_regions: list[dict] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

class LocalAnalysisResult(BaseModel):
    pages: list
    documents: list
    page_analysis: list[PageAnalysis] = Field(default_factory=list)
    evidence_warnings: list[str] = Field(default_factory=list)
    geometry_analysis: dict = Field(default_factory=dict)
    spatial_graph: dict = Field(default_factory=dict)
