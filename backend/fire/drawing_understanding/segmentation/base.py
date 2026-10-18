from pydantic import BaseModel, Field

class SegmentationResult(BaseModel):
    available: bool = False
    regions: list[dict] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

class SegmentationProvider:
    def analyze(self, *_args, **_kwargs) -> SegmentationResult:
        return SegmentationResult(available=False, warnings=["No trained segmentation provider is configured."])
