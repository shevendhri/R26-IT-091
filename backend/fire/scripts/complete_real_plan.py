import json
import os
from pathlib import Path
from time import perf_counter

from pydantic import BaseModel, ConfigDict, Field

from ..config import get_settings
from ..drawing_understanding.openai.provider import _image_data_url, _prepare_request_image
from ..openai_diagnostics import build_openai_config, make_openai_client
from ..project_builder import build_project
from ..rules import evaluate_project
from ..pdf_utils import render_pdf
from ..schemas import BuildingInfo, Document, Door, GenericItem, PageClassification, PageExtraction

LIVE_FIXTURE = Path("backend/tests/fixtures/20260509181148921_live_extraction.json")
COMPLETE_FIXTURE = Path("backend/tests/fixtures/20260509181148921_complete_extraction.json")
SECTION_ELEVATION_BBOX = (0.20, 0.0, 0.53, 0.37)
FLOOR_AREA_SCHEDULE_BBOX = (0.72, 0.82, 0.28, 0.18)
STAIR_ESCAPE_REGION_BBOX = (0.72, 0.18, 0.28, 0.62)

class FloorLevelRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_name: str | None = None
    level_m: float | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class HeightExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_levels: list[FloorLevelRow] = Field(default_factory=list)
    highest_habitable_floor_level_m: float | None = None
    building_height_m: float | None = None
    roof_level_m: float | None = None
    evidence_text: str | None = None

class FloorAreaRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    floor_name: str | None = None
    area_value: float | None = None
    area_unit: str | None = None
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class FloorAreaExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    rows: list[FloorAreaRow] = Field(default_factory=list)
    total_area_value: float | None = None
    total_area_unit: str | None = None
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

class FireFeatureEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    feature: str | None = None
    presence: str = "UNKNOWN"
    raw_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

class StairEscapeExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    staircase_count: int | None = None
    stair_widths: list[WidthEvidence] = Field(default_factory=list)
    corridor_widths: list[WidthEvidence] = Field(default_factory=list)
    protected_stairs: list[StairCoreEvidence] = Field(default_factory=list)
    visible_exit_count: int | None = None
    exit_labels: list[ExitLabelEvidence] = Field(default_factory=list)
    route_topology_confirmed: bool = False
    travel_distance_m: float | None = None
    rooms_or_occupancies: list[str] = Field(default_factory=list)
    fire_features: list[FireFeatureEvidence] = Field(default_factory=list)
    evidence_text: str | None = None

def _schema_validation() -> dict:
    HeightExtraction(floor_levels=[FloorLevelRow(floor_name="First", level_m=3.0, raw_text="FIRST +3.0m", confidence=0.8)])
    FloorAreaExtraction(rows=[FloorAreaRow(floor_name="Ground", area_value=2743, area_unit="sqft", raw_text="GROUND FLOOR 2743 sqft", confidence=0.9)])
    StairEscapeExtraction(staircase_count=1, route_topology_confirmed=False, travel_distance_m=None)
    text = json.dumps({
        "height": HeightExtraction.model_json_schema(),
        "floor_area": FloorAreaExtraction.model_json_schema(),
        "stair_escape": StairEscapeExtraction.model_json_schema(),
    })
    return {"valid": True, "has_unconstrained_objects": '"additionalProperties": true' in text}

def _sqft_to_m2(value: float | None) -> float | None:
    return round(value * 0.092903, 2) if value is not None else None

def _to_m2(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    normalized=(unit or "").lower().replace(".", "").replace("^", "")
    if normalized in {"sqft","sq ft","ft2","ft 2","sft"}:
        return _sqft_to_m2(value)
    if normalized in {"sqm","sq m","m2","m 2"}:
        return round(value, 2)
    return None

def _area_rows(area: dict) -> list[dict]:
    return area.get("rows") or area.get("floor_areas") or []

def _area_unit(row: dict) -> str | None:
    return row.get("area_unit") or row.get("source_unit")

def _height_validation_status(height: dict | None) -> str:
    if not height:
        return "UNKNOWN"
    text=(height.get("evidence_text") or "").upper()
    contextual=any(token in text for token in ("SECTION","ELEVATION","FFL","RL","FLOOR","ROOF","TERRACE","LEVEL"))
    numeric=any(height.get(field) is not None for field in ("highest_habitable_floor_level_m","building_height_m","roof_level_m"))
    return "CONFIRMED" if contextual and numeric else "UNKNOWN"

def _floor_area_validation_status(area: dict | None) -> str:
    if not area:
        return "UNKNOWN"
    has_contextual_row=any(row.get("floor_name") and row.get("area_value") is not None and _area_unit(row) for row in _area_rows(area))
    has_total=area.get("total_area_value") is not None and area.get("total_area_unit")
    return "CONFIRMED" if has_contextual_row or has_total else "UNKNOWN"

def _prepare_master():
    from io import BytesIO
    from PIL import Image
    settings = get_settings()
    rendered = render_pdf(Path("20260509181148921.pdf").read_bytes(), settings.plan_render_dpi)[0]
    return Image.open(BytesIO(rendered.png_bytes)), len(rendered.png_bytes)

def _crop(master, spec: tuple[float, float, float, float], rotate: bool = False):
    x, y, w, h = spec
    image = master.crop((int(master.width * x), int(master.height * y), int(master.width * (x + w)), int(master.height * (y + h))))
    if rotate:
        image = image.rotate(90, expand=True)
    return image, {"x": x, "y": y, "width": w, "height": h}

def _regions(master, master_bytes: int):
    settings = get_settings()
    specs = [
        ("section_elevation", SECTION_ELEVATION_BBOX, False, "Section A-A/elevations show floor levels and height dimensions."),
        ("floor_area_schedule", FLOOR_AREA_SCHEDULE_BBOX, True, "Bottom-right floor-area schedule shows per-floor and total floor areas."),
        ("stair_escape_region", STAIR_ESCAPE_REGION_BBOX, True, "Right-side floor plans show stair core, corridor, rooms, and visible fire/exit annotations."),
    ]
    result = []
    for region_id, spec, rotate, reason in specs:
        image, bbox = _crop(master, spec, rotate)
        request = _prepare_request_image(image, original_bytes=master_bytes, max_bytes=settings.openai_image_max_bytes, jpeg_quality=settings.openai_jpeg_quality)
        result.append((region_id, image, request, bbox, reason))
    return result

def _request(client, model: str, region_id: str, request_image, schema, prompt: str):
    started = perf_counter()
    response = client.responses.parse(
        model=model,
        input=[
            {"role": "system", "content": "Extract only visible architectural evidence. Do not decide compliance. Use null for unknown values. Do not infer absence."},
            {"role": "user", "content": [
                {"type": "input_text", "text": prompt},
                {"type": "input_image", "image_url": _image_data_url(request_image), "detail": "high"},
            ]},
        ],
        text_format=schema,
    )
    return response.output_parsed, round(perf_counter() - started, 3), getattr(response, "usage", None)

def _usage_dump(usage):
    if usage is None:
        return None
    data = usage.model_dump(mode="json") if hasattr(usage, "model_dump") else {}
    input_details = data.get("input_tokens_details") or {}
    return {
        "input_tokens": data.get("input_tokens"),
        "cached_input_tokens": input_details.get("cached_tokens"),
        "output_tokens": data.get("output_tokens"),
        "total_tokens": data.get("total_tokens"),
    }

def _base_complete_payload(base: dict, existing: dict | None, regions: list[dict]) -> dict:
    existing = existing or {}
    return {
        "source_file": base["source_file"],
        "overview": base["overview"],
        "door_window_schedule": base["detail"],
        "selected_tile": base["selected_tile"],
        "targeted_regions": regions,
        "section_elevation": existing.get("section_elevation"),
        "section_elevation_validation_status": existing.get("section_elevation_validation_status") or _height_validation_status(existing.get("section_elevation")),
        "floor_area_schedule": existing.get("floor_area_schedule"),
        "floor_area_validation_status": existing.get("floor_area_validation_status") or _floor_area_validation_status(existing.get("floor_area_schedule")),
        "stair_escape": existing.get("stair_escape"),
        "openai_usage": existing.get("openai_usage"),
    }

def _build_complete_payload(base: dict, height: HeightExtraction | None, area: FloorAreaExtraction | None, stair: StairEscapeExtraction | None, regions: list[dict]) -> dict:
    height_payload=height.model_dump(mode="json") if height else None
    area_payload=area.model_dump(mode="json") if area else None
    return {
        "source_file": base["source_file"],
        "overview": base["overview"],
        "door_window_schedule": base["detail"],
        "selected_tile": base["selected_tile"],
        "targeted_regions": regions,
        "section_elevation": height_payload,
        "section_elevation_validation_status": _height_validation_status(height_payload),
        "floor_area_schedule": area_payload,
        "floor_area_validation_status": _floor_area_validation_status(area_payload),
        "stair_escape": stair.model_dump(mode="json") if stair else None,
    }

def build_project_from_complete_fixture(payload: dict) -> tuple[dict, list[dict], list[dict]]:
    overview = payload["overview"]
    height = payload.get("section_elevation") or {}
    area = payload.get("floor_area_schedule") or {}
    stair = payload.get("stair_escape") or {}
    info = BuildingInfo(
        project_title=overview.get("project_name"),
        building_use_text=overview.get("building_use_text"),
        storey_count=overview.get("storey_count"),
    )
    info.critical_evidence["storey_count"] = "overview storey count"
    if (payload.get("section_elevation_validation_status") or height.get("validation_status")) == "CONFIRMED":
        info.highest_habitable_floor_level_m = height.get("highest_habitable_floor_level_m")
        info.building_height_m = height.get("building_height_m")
        if info.highest_habitable_floor_level_m is not None:
            info.critical_evidence["highest_habitable_floor_level_m"] = height.get("evidence_text") or "section/elevation levels"
        if info.building_height_m is not None:
            info.critical_evidence["building_height_m"] = height.get("evidence_text") or "section/elevation height"
    floor_areas = {}
    for row in _area_rows(area):
        name = row.get("floor_name")
        if not name:
            continue
        value = row.get("area_m2")
        if value is None:
            value = _to_m2(row.get("area_value"), _area_unit(row))
        if value is not None:
            floor_areas[name] = value
    info.floor_areas_m2 = floor_areas
    if floor_areas:
        info.max_floor_area_per_storey_m2 = max(floor_areas.values())
        info.critical_evidence["max_floor_area_per_storey_m2"] = area.get("evidence_text") or "floor area schedule"
    info.total_building_area_m2 = area.get("total_floor_area_m2")
    if info.total_building_area_m2 is None:
        info.total_building_area_m2 = _to_m2(area.get("total_area_value"), area.get("total_area_unit"))
    if info.total_building_area_m2 is None:
        total_row = next((row for row in _area_rows(area) if str(row.get("floor_name") or "").upper().startswith("TOTAL")), None)
        if total_row:
            info.total_building_area_m2 = total_row.get("area_m2") or _to_m2(total_row.get("area_value"), _area_unit(total_row))
    if info.total_building_area_m2 is not None:
        info.critical_evidence["total_building_area_m2"] = area.get("evidence_text") or "floor area schedule"
    source = payload["source_file"]
    doors = [
        Door(
            mark=row.get("mark"),
            width_m=row.get("width_m"),
            height_mm=round(row.get("height_m") * 1000) if row.get("height_m") is not None else None,
            door_type=row.get("door_type"),
            source_file=source,
            source_page=1,
            evidence=row.get("raw_text"),
            confidence=row.get("confidence") or 0.75,
            is_exit=None,
        )
        for row in (payload.get("door_window_schedule") or {}).get("door_rows", [])
    ]
    stairs = [
        GenericItem(label=item.get("label") or "Stair", source_file=source, source_page=1, evidence=item.get("raw_text"), confidence=item.get("confidence") or 0.7, width_m=item.get("clear_width_m"), data={"provider": "openai", "protected_stair": item.get("protected_stair")})
        for item in stair.get("protected_stairs", [])
    ]
    escape_routes = [
        GenericItem(label=item.get("label") or "Exit/circulation evidence", source_file=source, source_page=1, evidence=item.get("raw_text"), confidence=item.get("confidence") or 0.7, data={"provider": "openai"})
        for item in stair.get("exit_labels", [])
    ]
    rooms = [
        GenericItem(label=label, source_file=source, source_page=1, evidence=label, confidence=0.75, data={"provider": "openai"})
        for label in stair.get("rooms_or_occupancies", [])
    ]
    page = PageExtraction(
        source_file=source,
        source_page=1,
        classification=PageClassification.ARCHITECTURAL,
        extraction_provider="openai",
        building_info=info,
        doors=doors,
        stairs=stairs,
        rooms=rooms,
        escape_routes=escape_routes,
    )
    project = build_project([page], [Document(filename=source, media_type="application/pdf", page_count=1)])
    if stair.get("staircase_count") is not None:
        project.project["visible_stair_candidate_count"] = stair.get("staircase_count")
    project.project["confirmed_stair_count"] = None
    project.project["confirmed_independent_exit_count"] = None
    project.project["confirmed_exit_door_count"] = None
    if stair.get("route_topology_confirmed") is True and stair.get("travel_distance_m") is not None:
        project.project["travel_distance_m"] = stair["travel_distance_m"]
    rules = evaluate_project(project)
    required = [rule.model_dump(mode="json") for rule in rules if rule.status.value in {"MANUAL_REVIEW", "VIOLATION"}]
    return project.model_dump(mode="json"), [rule.model_dump(mode="json") for rule in rules], required

def main() -> int:
    base = json.loads(LIVE_FIXTURE.read_text(encoding="utf-8"))
    existing = json.loads(COMPLETE_FIXTURE.read_text(encoding="utf-8")) if COMPLETE_FIXTURE.exists() else None
    settings = get_settings()
    settings.openai_plan_model = settings.openai_model
    config = build_openai_config(settings)
    master, master_bytes = _prepare_master()
    regions = _regions(master, master_bytes)
    region_report = [
        {
            "region_id": region_id,
            "bbox": bbox,
            "dimensions": [request.final_width, request.final_height],
            "bytes": request.final_bytes,
            "reason": reason,
        }
        for region_id, _, request, bbox, reason in regions
    ]
    complete = _base_complete_payload(base, existing, region_report)
    output = {
        "model": config.model,
        "schema_validation": _schema_validation(),
        "regions": region_report,
        "live_calls": 0,
        "section_elevation": complete.get("section_elevation"),
        "section_elevation_validation_status": complete.get("section_elevation_validation_status"),
        "floor_area_schedule": complete.get("floor_area_schedule"),
        "floor_area_validation_status": complete.get("floor_area_validation_status"),
        "stair_escape": complete.get("stair_escape"),
        "durations": {},
        "usage": [],
        "fixture_saved": False,
        "project_schema": "NOT_TESTED",
        "rule_engine": "NOT_TESTED",
    }
    if os.getenv("RUN_LIVE_OPENAI_TESTS", "").lower() == "true" and config.api_key:
        client = make_openai_client(settings)
        for region_id, _, request, _, _ in regions:
            if region_id == "section_elevation":
                prompt = "Extract contextual section/elevation floor levels and height evidence. Return floor_levels, highest_habitable_floor_level_m, building_height_m, roof_level_m, evidence_text. Use null unless the value is tied to a visible floor/roof/terrace/FFL/RL/section/elevation label. A bare number must never become a height."
                parsed, duration, usage = _request(client, config.model, region_id, request, HeightExtraction, prompt)
                output["section_elevation"] = parsed.model_dump(mode="json")
                output["section_elevation_validation_status"] = _height_validation_status(output["section_elevation"])
            elif region_id == "floor_area_schedule":
                prompt = "Extract the Floor Area Details table only. Return only rows whose floor label and numeric area value with unit are visible in the same row. Preserve original unit/value in area_unit and area_value. Do not convert units. Include total_area_value and total_area_unit if visible."
                parsed, duration, usage = _request(client, config.model, region_id, request, FloorAreaExtraction, prompt)
                output["floor_area_schedule"] = parsed.model_dump(mode="json")
                output["floor_area_validation_status"] = _floor_area_validation_status(output["floor_area_schedule"])
            else:
                continue
            output["durations"][region_id] = duration
            output["usage"].append({"region_id": region_id, "usage": _usage_dump(usage)})
            output["live_calls"] += 1
    complete.update({
        "section_elevation": output["section_elevation"],
        "section_elevation_validation_status": output["section_elevation_validation_status"],
        "floor_area_schedule": output["floor_area_schedule"],
        "floor_area_validation_status": output["floor_area_validation_status"],
        "stair_escape": output["stair_escape"],
        "openai_usage": output["usage"] or complete.get("openai_usage"),
    })
    COMPLETE_FIXTURE.write_text(json.dumps(complete, indent=2), encoding="utf-8")
    output["fixture_saved"] = True
    project, rules, required = build_project_from_complete_fixture(complete)
    output["project_schema"] = "PASS"
    output["rule_engine"] = "PASS"
    output["project_summary"] = {
        "project_name": project["building_info"]["project_title"],
        "building_use_text": project["building_info"]["building_use_text"],
        "purpose_group": project["building_info"]["purpose_group"],
        "storey_count": project["building_info"]["storey_count"],
        "highest_habitable_floor_level_m": project["building_info"]["highest_habitable_floor_level_m"],
        "building_height_m": project["building_info"]["building_height_m"],
        "floor_areas_m2": project["building_info"]["floor_areas_m2"],
        "total_building_area_m2": project["building_info"]["total_building_area_m2"],
        "stairs": len(project["stairs"]),
        "stair_widths": [item.get("width_m") for item in project["stairs"]],
        "visible_stair_candidate_count": project["project"].get("visible_stair_candidate_count"),
        "confirmed_stair_count": project["project"].get("confirmed_stair_count"),
        "confirmed_independent_exit_count": project["project"].get("confirmed_independent_exit_count"),
        "confirmed_exit_door_count": project["project"].get("confirmed_exit_door_count"),
        "doors": len(project["doors"]),
        "exit_doors": sum(1 for door in project["doors"] if door.get("is_exit") is True),
        "critical_metadata": project["extraction"].get("metadata_evidence", {}),
    }
    output["rules"] = rules
    output["required_fire_features"] = required
    print(json.dumps(output, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
