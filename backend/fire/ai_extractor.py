import base64
from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAIError
from pydantic import BaseModel, Field
from .config import Settings
from .openai_diagnostics import build_openai_config, make_async_openai_client
from .schemas import BBox, BuildingInfo, Door, FireEquipment, GenericItem, PageClassification, PageExtraction

SYSTEM_PROMPT="""You extract visible evidence from architectural/fire drawings. Never decide compliance or infer missing values. Use null for unknowns. A room label does not classify the building. HOSTEL is not HOTEL. Door swing type does not prove egress direction. A schedule row is not a physical instance without a plan link. is_exit is true only with strong escape-system evidence; opens_in_exit_direction requires both directions. Preserve visible labels and normalized bboxes. Classify the page ARCHITECTURAL, FIRE, COMBINED, or UNKNOWN."""

class ExtractionUnavailable(RuntimeError):
    def __init__(self,message: str,status_code: int=503):
        super().__init__(message)
        self.status_code=status_code

class ExtractedFloorArea(BaseModel):
    floor: str
    area_m2: float

class ExtractedBuildingInfo(BaseModel):
    project_title: str|None=None; building_use_text: str|None=None; building_type: str|None=None
    purpose_group: str|None=None; storey_count: int|None=None; floor_names: list[str]=Field(default_factory=list)
    building_height_m: float|None=None; highest_habitable_floor_level_m: float|None=None
    floor_areas: list[ExtractedFloorArea]=Field(default_factory=list)
    total_building_area_m2: float|None=None; max_floor_area_per_storey_m2: float|None=None

class ExtractedGenericItem(BaseModel):
    source_file: str; source_page: int; evidence: str|None=None
    confidence: float=Field(ge=0,le=1); bbox: BBox|None=None
    id: str|None=None; label: str|None=None; floor: str|None=None
    count: int|None=None; width_m: float|None=None

class ExtractedSystems(BaseModel):
    alarm_system: bool|None=None; sprinkler_system: bool|None=None; hydrant_system: bool|None=None
    fire_pump_system: bool|None=None; escape_route_lighting: bool|None=None
    exit_signage: bool|None=None; fire_lift_system: bool|None=None

class ExtractedPageExtraction(BaseModel):
    source_file: str; source_page: int; classification: PageClassification=PageClassification.UNKNOWN
    building_info: ExtractedBuildingInfo=Field(default_factory=ExtractedBuildingInfo)
    rooms: list[ExtractedGenericItem]=Field(default_factory=list); doors: list[Door]=Field(default_factory=list)
    windows: list[ExtractedGenericItem]=Field(default_factory=list); stairs: list[ExtractedGenericItem]=Field(default_factory=list)
    escape_routes: list[ExtractedGenericItem]=Field(default_factory=list); fire_equipment: list[FireEquipment]=Field(default_factory=list)
    special_risk_rooms: list[ExtractedGenericItem]=Field(default_factory=list); warnings: list[str]=Field(default_factory=list)
    systems: ExtractedSystems=Field(default_factory=ExtractedSystems)

    def to_page_extraction(self) -> PageExtraction:
        info=self.building_info
        floor_areas={item.floor:item.area_m2 for item in info.floor_areas}
        building_info=BuildingInfo(**info.model_dump(exclude={"floor_areas"}),floor_areas_m2=floor_areas)
        systems={key:value for key,value in self.systems.model_dump().items() if value is not None}
        return PageExtraction(
            source_file=self.source_file,
            source_page=self.source_page,
            classification=self.classification,
            extraction_provider="openai",
            building_info=building_info,
            rooms=[GenericItem.model_validate(item.model_dump()) for item in self.rooms],
            doors=self.doors,
            windows=[GenericItem.model_validate(item.model_dump()) for item in self.windows],
            stairs=[GenericItem.model_validate(item.model_dump()) for item in self.stairs],
            escape_routes=[GenericItem.model_validate(item.model_dump()) for item in self.escape_routes],
            fire_equipment=self.fire_equipment,
            special_risk_rooms=[GenericItem.model_validate(item.model_dump()) for item in self.special_risk_rooms],
            warnings=self.warnings,
            systems=systems,
        )

class OpenAIExtractor:
    def __init__(self,settings: Settings):
        if not settings.openai_api_key: raise ExtractionUnavailable("OPENAI_API_KEY is not configured")
        self.client=make_async_openai_client(settings); self.model=build_openai_config(settings).model

    async def extract_page(self,image: bytes,filename: str,page: int) -> PageExtraction:
        encoded=base64.b64encode(image).decode()
        try:
            response=await self.client.responses.parse(model=self.model,input=[{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":[{"type":"input_text","text":f"Extract {filename}, page {page}. Set source_file/page on every item. Return floor areas as floor/area_m2 rows and systems as explicit boolean/null fields."},{"type":"input_image","image_url":f"data:image/png;base64,{encoded}","detail":"high"}]}],text_format=ExtractedPageExtraction)
        except APIStatusError as exc:
            detail=getattr(exc,"message",None) or str(exc)
            raise ExtractionUnavailable(f"OpenAI extraction failed ({exc.status_code}): {detail}",exc.status_code) from exc
        except (APIConnectionError, APITimeoutError) as exc:
            raise ExtractionUnavailable("OpenAI extraction failed: could not reach the OpenAI API") from exc
        except OpenAIError as exc:
            raise ExtractionUnavailable(f"OpenAI extraction failed: {exc}") from exc
        if response.output_parsed is None: raise ExtractionUnavailable("Model returned no structured extraction")
        return response.output_parsed.to_page_extraction()
