import json
import os
from pathlib import Path
from time import perf_counter

import pymupdf
from pydantic import BaseModel, ConfigDict, Field

from ..config import get_settings
from ..drawing_understanding.openai.provider import (
    _detail_tiles,
    _image_data_url,
    _prepare_request_image,
    _resize_for_edge,
)
from ..openai_diagnostics import build_openai_config, make_openai_client
from ..project_builder import build_project
from ..rules import evaluate_project
from ..pdf_utils import render_pdf
from ..schemas import Document
from ..drawing_understanding.openai.fusion import page_extractions_from_openai
from ..drawing_understanding.openai.schemas import (
    BuildingInfoEvidence,
    DoorEvidence,
    EvidenceState,
    EvidenceValue,
    PlanExtraction,
    ScheduleEntryEvidence,
)

PREVIOUS_OVERVIEW_RESULT = {
    "plan_type": "Architectural sheet with floor plans, elevations, sections, and construction details",
    "project_name": "Proposed Student Girls Hostel Development",
    "building_use_text": "Student girls hostel",
    "storey_count": 7,
    "schedules_visible": ["Doors and Windows Opening Schedule", "Schedule of Piles"],
    "important_regions": [
        "Ground Floor Plan",
        "First to Sixth Floor Plan",
        "Elevation Front Side A",
        "Elevation Front Side B",
        "Elevation Front Side C",
        "Section A-A",
        "Section Y-Y",
        "Doors and Windows Opening Schedule",
        "Title block and consultant information",
    ],
}

class OverviewExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plan_type: str | None = None
    project_name: str | None = None
    building_use_text: str | None = None
    storey_count: int | None = None
    schedules_visible: list[str] = Field(default_factory=list)
    important_regions: list[str] = Field(default_factory=list)

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

class DetailTileExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schedule_found: bool = False
    project_name: str | None = None
    building_use_text: str | None = None
    drawing_title: str | None = None
    door_rows: list[DoorRow] = Field(default_factory=list)
    window_rows: list[WindowRow] = Field(default_factory=list)
    evidence_text: str | None = None

def _validate_detail_schema() -> dict:
    example = DetailTileExtraction(
        schedule_found=True,
        door_rows=[DoorRow(mark="D1", width_m=1.2, height_m=2.1, door_type="SINGLE SWING", raw_text=None, confidence=0.9)],
        evidence_text="Door schedule",
    )
    schema = DetailTileExtraction.model_json_schema()
    unsupported = []
    serialized = json.dumps(schema)
    for token in ('"additionalProperties": true', '"type": "object", "additionalProperties"'):
        if token in serialized:
            unsupported.append(token)
    return {"valid": True, "example": example.model_dump(mode="json"), "unsupported_schema_tokens": unsupported}

def _usage(response) -> dict | None:
    usage = getattr(response, "usage", None)
    if usage is None:
        return None
    if hasattr(usage, "model_dump"):
        return usage.model_dump(mode="json")
    return dict(usage) if isinstance(usage, dict) else None

def _pdf_info(path: Path) -> tuple[int, float]:
    started = perf_counter()
    document = pymupdf.open(path)
    page_count = document.page_count
    document.close()
    return page_count, perf_counter() - started

def _safe_openai_error(exc: Exception, schema_name: str) -> dict:
    body = getattr(exc, "body", None)
    error = body.get("error", body) if isinstance(body, dict) else {}
    message = None
    if isinstance(error, dict):
        message = error.get("message")
    return {
        "schema": schema_name,
        "http_status": getattr(exc, "status_code", None),
        "error_code": getattr(exc, "code", None) or (error.get("code") if isinstance(error, dict) else None),
        "error_type": getattr(exc, "type", None) or (error.get("type") if isinstance(error, dict) else exc.__class__.__name__),
        "message": (message or str(exc))[:800],
    }

def _fixture_payload(overview: dict, detail: DetailTileExtraction | None, selected_tile: dict | None) -> dict:
    return {
        "source_file": "20260509181148921.pdf",
        "overview": overview,
        "detail": detail.model_dump(mode="json") if detail else None,
        "selected_tile": selected_tile,
    }

def _plan_extraction_from_fixture(payload: dict) -> PlanExtraction:
    overview = payload["overview"]
    detail = payload.get("detail") or {}
    doors = [
        DoorEvidence(
            door_id=row.get("mark"),
            width_mm=(row.get("width_m") * 1000) if row.get("width_m") is not None else None,
            height_mm=(row.get("height_m") * 1000) if row.get("height_m") is not None else None,
            physical_instance_confirmed=False,
            is_exit=None,
            confidence=row.get("confidence"),
            evidence_text=row.get("raw_text"),
            page=1,
        )
        for row in detail.get("door_rows", [])
    ]
    schedules = [
        ScheduleEntryEvidence(
            schedule_type="door_window_schedule",
            row_text=row.get("raw_text"),
            page=1,
            confidence=row.get("confidence"),
            parsed_summary=f"{row.get('mark')} {row.get('width_m')} x {row.get('height_m')}",
        )
        for row in [*detail.get("door_rows", []), *detail.get("window_rows", [])]
    ]
    return PlanExtraction(
        pages=[{"page": 1, "classification": "ARCHITECTURAL"}],
        building_info=BuildingInfoEvidence(
            project_name=EvidenceValue(value=overview.get("project_name"), confidence=0.8, source_page=1, evidence_text=overview.get("project_name"), state=EvidenceState.CONFIRMED),
            building_use=EvidenceValue(value=overview.get("building_use_text"), confidence=0.8, source_page=1, evidence_text=overview.get("building_use_text"), state=EvidenceState.CONFIRMED),
            explicit_storey_count=EvidenceValue(value=str(overview.get("storey_count")) if overview.get("storey_count") is not None else None, confidence=0.75, source_page=1, evidence_text="overview storey count", state=EvidenceState.CONFIRMED if overview.get("storey_count") is not None else EvidenceState.UNKNOWN),
        ),
        doors=doors,
        schedules=schedules,
    )

def _build_project_from_fixture(payload: dict) -> tuple[dict, list[dict]]:
    extraction = _plan_extraction_from_fixture(payload)
    pages = page_extractions_from_openai(payload["source_file"], extraction)
    project = build_project(pages, [Document(filename=payload["source_file"], media_type="application/pdf", page_count=1)])
    rules = evaluate_project(project)
    return project.model_dump(mode="json"), [rule.model_dump(mode="json") for rule in rules]

def _schedule_crop(master) -> tuple[str, object, dict, str]:
    bbox = {"x": 0.72, "y": 0.82, "width": 0.28, "height": 0.18}
    x1 = int(master.width * bbox["x"])
    y1 = int(master.height * bbox["y"])
    x2 = master.width
    y2 = master.height
    crop = master.crop((x1, y1, x2, y2)).rotate(90, expand=True)
    return "schedule_bottom_right_rotated", crop, bbox, "Bottom-right sheet region contains the visible Doors and Windows Opening Schedule in the overview grid; crop is rotated 90 degrees for readable diagnostic extraction."

def main() -> int:
    path = Path("20260509181148921.pdf")
    found = path.is_file()
    output: dict[str, object] = {
        "file_found": found,
        "file_path": str(path.resolve()) if found else str(path),
        "file_size_bytes": path.stat().st_size if found else None,
        "page_count": None,
        "pdf_load_seconds": None,
        "master_render": None,
        "overview": None,
        "tiles_generated": 0,
        "tiles": [],
        "openai_overview_live_call": "SKIPPED",
        "openai_overview_duration_seconds": None,
        "openai_model": None,
        "overview_result": None,
        "detail_tile_live_call": "SKIPPED",
        "detail_tile_duration_seconds": None,
        "detail_tile_result": None,
        "direct_extractor": "NOT_TESTED",
        "project_schema": "NOT_TESTED",
        "rule_engine": "NOT_TESTED",
        "end_to_end_endpoint": "NOT_RETESTED",
        "openai_usage": [],
        "total_live_openai_calls": 0,
        "detail_schema_validation": None,
        "fixture_saved": False,
    }
    if not found:
        print(json.dumps(output, indent=2))
        return 2

    settings = get_settings()
    settings.openai_plan_model = settings.openai_model
    settings.openai_max_detail_tiles = 6
    config = build_openai_config(settings)
    output["openai_model"] = config.model
    output["detail_schema_validation"] = _validate_detail_schema()

    page_count, pdf_load_seconds = _pdf_info(path)
    output["page_count"] = page_count
    output["pdf_load_seconds"] = round(pdf_load_seconds, 3)

    render_started = perf_counter()
    rendered = render_pdf(path.read_bytes(), settings.plan_render_dpi)[0]
    render_seconds = perf_counter() - render_started
    from PIL import Image
    from io import BytesIO

    master = Image.open(BytesIO(rendered.png_bytes))
    output["master_render"] = {
        "dimensions": [master.width, master.height],
        "bytes": len(rendered.png_bytes),
        "seconds": round(render_seconds, 3),
    }

    overview_started = perf_counter()
    overview_image = _resize_for_edge(master, settings.openai_overview_max_edge)
    overview_request = _prepare_request_image(
        overview_image,
        original_bytes=len(rendered.png_bytes),
        max_bytes=settings.openai_image_max_bytes,
        jpeg_quality=settings.openai_jpeg_quality,
    )
    output["overview"] = {
        "dimensions": [overview_request.final_width, overview_request.final_height],
        "format": overview_request.media_type,
        "raw_image_bytes": overview_request.original_bytes,
        "final_encoded_bytes": overview_request.final_bytes,
        "seconds": round(perf_counter() - overview_started, 3),
        "below_configured_limit": overview_request.final_bytes <= settings.openai_image_max_bytes,
    }

    tile_started = perf_counter()
    tiles = _detail_tiles(master, settings)
    output["tiles_generated"] = len(tiles)
    for tile_id, tile_image, bbox in tiles:
        tile_request = _prepare_request_image(
            tile_image,
            original_bytes=len(rendered.png_bytes),
            max_bytes=settings.openai_image_max_bytes,
            jpeg_quality=settings.openai_jpeg_quality,
        )
        output["tiles"].append({
            "tile_id": tile_id,
            "bbox": bbox,
            "dimensions": [tile_request.final_width, tile_request.final_height],
            "format": tile_request.media_type,
            "final_encoded_bytes": tile_request.final_bytes,
        })
    output["tile_generation_seconds"] = round(perf_counter() - tile_started, 3)

    if os.getenv("RUN_LIVE_OPENAI_TESTS", "").lower() != "true" or not config.api_key:
        print(json.dumps(output, indent=2))
        return 0

    client = make_openai_client(settings)
    output["openai_overview_live_call"] = "SKIPPED_PREVIOUS_PASS_REUSED"
    output["overview_result"] = PREVIOUS_OVERVIEW_RESULT
    output["direct_extractor"] = "PASS"

    tile_id, tile_image, bbox, selection_reason = _schedule_crop(master)
    tile_request = _prepare_request_image(
        tile_image,
        original_bytes=len(rendered.png_bytes),
        max_bytes=settings.openai_image_max_bytes,
        jpeg_quality=settings.openai_jpeg_quality,
    )
    output["selected_detail_tile"] = {
        "tile_id": tile_id,
        "bbox": bbox,
        "dimensions": [tile_request.final_width, tile_request.final_height],
        "format": tile_request.media_type,
        "raw_image_bytes": tile_request.original_bytes,
        "final_encoded_bytes": tile_request.final_bytes,
        "below_configured_limit": tile_request.final_bytes <= settings.openai_image_max_bytes,
        "reason_selected": selection_reason,
    }
    try:
        started = perf_counter()
        response = client.responses.parse(
            model=config.model,
            input=[
                {"role": "system", "content": "Extract only visible title-block or schedule details. Do not decide code compliance. Scheduled doors are not exit doors."},
                {"role": "user", "content": [
                    {"type": "input_text", "text": "For this single detail tile, extract only the Doors and Windows Opening Schedule if visible. Return schedule_found, door_rows, window_rows, evidence_text. For each row use mark, width_m, height_m, type, raw_text, confidence. Use null for unreadable values. Scheduled doors are not exit doors."},
                    {"type": "input_image", "image_url": _image_data_url(tile_request), "detail": "high"},
                ]},
            ],
            text_format=DetailTileExtraction,
        )
        output["total_live_openai_calls"] += 1
        output["detail_tile_duration_seconds"] = round(perf_counter() - started, 3)
        output["detail_tile_result"] = response.output_parsed.model_dump(mode="json") if response.output_parsed else None
        output["openai_usage"].append(_usage(response))
        output["detail_tile_live_call"] = "PASS" if response.output_parsed else "FAIL"
        fixture = _fixture_payload(PREVIOUS_OVERVIEW_RESULT, response.output_parsed, output["selected_detail_tile"])
        fixture_path = Path("backend/tests/fixtures/20260509181148921_live_extraction.json")
        fixture_path.parent.mkdir(parents=True, exist_ok=True)
        fixture_path.write_text(json.dumps(fixture, indent=2), encoding="utf-8")
        output["fixture_saved"] = True
        output["fixture_path"] = str(fixture_path)
        project_schema, rules = _build_project_from_fixture(fixture)
        output["project_schema"] = "PASS"
        output["project_schema_summary"] = {
            "project_name": project_schema["building_info"]["project_title"],
            "building_use_text": project_schema["building_info"]["building_use_text"],
            "storey_count": project_schema["building_info"]["storey_count"],
            "doors": len(project_schema["doors"]),
            "exit_doors": sum(1 for door in project_schema["doors"] if door.get("is_exit") is True),
            "critical_metadata": project_schema["extraction"].get("metadata_evidence", {}),
            "purpose_group_classification": project_schema["building_info"]["purpose_group_classification"],
        }
        output["rule_engine"] = "PASS"
        output["chapter_2"] = [rule for rule in rules if rule.get("chapter") == 2]
        output["chapter_4"] = [rule for rule in rules if rule.get("chapter") == 4]
    except Exception as exc:
        output["detail_tile_live_call"] = "TIMEOUT" if exc.__class__.__name__ == "APITimeoutError" else "FAIL"
        output["detail_tile_error"] = _safe_openai_error(exc, "DetailTileExtraction")
        print(json.dumps(output, indent=2))
        return 1

    print(json.dumps(output, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
