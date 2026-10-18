from enum import Enum
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

class PageClassification(str, Enum):
    ARCHITECTURAL="ARCHITECTURAL"; FIRE="FIRE"; COMBINED="COMBINED"; UNKNOWN="UNKNOWN"

class BBox(BaseModel):
    x: float=Field(ge=0,le=1); y: float=Field(ge=0,le=1)
    width: float=Field(ge=0,le=1); height: float=Field(ge=0,le=1)

class Evidence(BaseModel):
    source_file: str; source_page: int=Field(ge=1); evidence: str|None=None
    confidence: float=Field(ge=0,le=1); bbox: BBox|None=None

class Door(Evidence):
    id: str|None=None; mark: str|None=None; floor: str|None=None
    width_m: float|None=None; height_mm: float|None=None; door_type: str|None=None
    fire_rating_minutes: int|None=None; swing_type: str|None=None
    is_exit: bool|None=None; opens_in_exit_direction: bool|None=None

class FireEquipment(Evidence):
    type: str; floor: str|None=None; count: int|None=Field(default=None,ge=0)

class GenericItem(Evidence):
    id: str|None=None; label: str|None=None; floor: str|None=None
    count: int|None=None; width_m: float|None=None; data: dict[str,Any]=Field(default_factory=dict)

class BuildingInfo(BaseModel):
    project_title: str|None=None; building_use_text: str|None=None; building_type: str|None=None
    purpose_group: str|None=None; storey_count: int|None=None; floor_names: list[str]=Field(default_factory=list)
    building_height_m: float|None=None; highest_habitable_floor_level_m: float|None=None
    designed_occupants: int|None=None
    floor_areas_m2: dict[str,float]=Field(default_factory=dict); total_building_area_m2: float|None=None
    max_floor_area_per_storey_m2: float|None=None
    critical_evidence: dict[str,Any]=Field(default_factory=dict)
    building_purpose_groups: list[str]=Field(default_factory=list)
    purpose_group_classification: dict[str,Any]=Field(default_factory=dict)
    floor_purpose_groups: dict[str,str]=Field(default_factory=dict)

class PageExtraction(BaseModel):
    source_file: str; source_page: int; classification: PageClassification=PageClassification.UNKNOWN
    extraction_provider: str|None=None
    building_info: BuildingInfo=Field(default_factory=BuildingInfo)
    rooms: list[GenericItem]=Field(default_factory=list); doors: list[Door]=Field(default_factory=list)
    windows: list[GenericItem]=Field(default_factory=list); stairs: list[GenericItem]=Field(default_factory=list)
    escape_routes: list[GenericItem]=Field(default_factory=list); fire_equipment: list[FireEquipment]=Field(default_factory=list)
    special_risk_rooms: list[GenericItem]=Field(default_factory=list); warnings: list[str]=Field(default_factory=list)
    systems: dict[str,bool|None]=Field(default_factory=dict)

class Conflict(BaseModel):
    field: str; values: list[Any]; sources: list[str]; message: str

class Document(BaseModel):
    filename: str; media_type: str; page_count: int

class ProjectSchema(BaseModel):
    model_config=ConfigDict(extra="forbid")
    project: dict[str,Any]=Field(default_factory=dict); building_info: BuildingInfo=Field(default_factory=BuildingInfo)
    documents: list[Document]=Field(default_factory=list); storeys: list[GenericItem]=Field(default_factory=list)
    rooms: list[GenericItem]=Field(default_factory=list); doors: list[Door]=Field(default_factory=list)
    windows: list[GenericItem]=Field(default_factory=list); stairs: list[GenericItem]=Field(default_factory=list)
    escape_routes: list[GenericItem]=Field(default_factory=list); fire_equipment: list[FireEquipment]=Field(default_factory=list)
    alarm_system: bool|None=None; sprinkler_system: bool|None=None; hydrant_system: bool|None=None
    fire_pump_system: bool|None=None; escape_route_lighting: bool|None=None; exit_signage: bool|None=None
    fire_lift_system: bool|None=None; special_risk_rooms: list[GenericItem]=Field(default_factory=list)
    extraction: dict[str,Any]=Field(default_factory=dict); conflicts: list[Conflict]=Field(default_factory=list)
    warnings: list[str]=Field(default_factory=list); manual_review_evidence: list[str]=Field(default_factory=list)
    architectural_plan_present: bool=False; fire_plan_present: bool=False; fire_annotations_present: bool|None=None
    page_analysis: list[dict[str,Any]]=Field(default_factory=list)
    geometry_analysis: dict[str,Any]=Field(default_factory=dict)
    spatial_graph: dict[str,Any]=Field(default_factory=dict)
    evidence_warnings: list[str]=Field(default_factory=list)
    fire_features_detected: list[dict[str,Any]]=Field(default_factory=list)
