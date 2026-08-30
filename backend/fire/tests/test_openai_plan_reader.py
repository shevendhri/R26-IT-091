from io import BytesIO
import asyncio
import base64
from pathlib import Path

from PIL import Image
from fastapi import UploadFile
from fastapi.testclient import TestClient
import pymupdf

from backend.config import Settings
from backend.drawing_understanding.openai.fusion import page_extractions_from_openai
from backend.drawing_understanding.openai.provider import PLAN_READER_CACHE, REGION_READER_CACHE, OpenAIPlanReader
from backend.drawing_understanding.openai.schemas import (
    BuildingInfoEvidence,
    DoorEvidence,
    DoorScheduleExtraction,
    EvidenceValue,
    FastPlanExtraction,
    FloorAreaExtraction,
    CombinedScheduleExtraction,
    FireFeatureExtraction,
    HeightExtraction,
    PlanExtraction,
    PlanOverviewExtraction,
    RegionFailureExtraction,
    RoomEvidence,
    ScheduleDetailExtraction,
    SemanticRegionEvidence,
    SemanticRegionType,
    StairEscapeExtraction,
)
from backend.drawing_understanding.openai.semantic_regions import schema_for_region
from backend.pdf_utils import RenderedPage
from backend.pdf_utils import render_pdf
from backend.drawing_understanding.openai.validator import validate_plan_extraction
from backend.drawing_understanding.plan_reader import DrawingUnderstandingService
from backend.project_builder import build_project
from backend.schemas import BuildingInfo, Document, PageClassification, PageExtraction

def png_bytes():
    out = BytesIO()
    Image.new("RGB", (4, 4), "white").save(out, "PNG")
    return out.getvalue()

def image_bytes(fmt: str, size=(120, 80)):
    out = BytesIO()
    Image.new("RGB", size, "white").save(out, fmt)
    return out.getvalue()

def vector_pdf():
    document = pymupdf.open()
    page = document.new_page(width=300, height=200)
    page.insert_text((20, 20), "PROPOSED HOSTEL")
    data = document.tobytes()
    document.close()
    return data

def test_valid_openai_extraction_normalizes_hostel_without_storey_guess():
    extraction = PlanExtraction(
        building_info=BuildingInfoEvidence(
            building_use=EvidenceValue(value="Hostel", confidence=.95, source_page=1, evidence_text="PROPOSED STUDENT HOSTEL", state="CONFIRMED"),
            explicit_storey_count=EvidenceValue(value=None, state="UNKNOWN"),
        ),
        rooms=[RoomEvidence(label="Bedroom", page=1, confidence=.9, evidence_text="BED ROOM")],
    )
    pages = page_extractions_from_openai("plan.png", extraction)
    project = build_project(pages, [Document(filename="plan.png", media_type="image/png", page_count=1)])
    assert project.building_info.building_use_text == "Hostel"
    assert project.building_info.storey_count is None
    assert project.building_info.purpose_group_classification["status"] in {"CONFIRMED", "AMBIGUOUS", "UNKNOWN"}
    assert len(project.rooms) == 1

def test_production_overview_schema_accepts_null_heavy_payload():
    parsed = PlanOverviewExtraction(
        plan_type=None,
        project_name=None,
        building_use_text=None,
        storey_count=None,
        schedules_visible=[],
        plans_visible=[],
        sections_visible=[],
        semantic_regions=[],
    )
    assert parsed.storey_count is None

def test_detail_schemas_accept_partial_unknown_evidence():
    door = DoorScheduleExtraction(schedule_found=True, door_rows=[{"mark": "D1", "width_m": None, "height_m": 2.1, "door_type": None, "raw_text": None, "confidence": None}], window_rows=[])
    area = FloorAreaExtraction(rows=[{"floor_name": "GROUND", "area_value": 1000, "area_unit": "sqft", "area_m2": None, "raw_text": "GROUND 1000 sqft", "confidence": .8}])
    height = HeightExtraction(floor_levels=[{"floor_name": "GROUND", "level_m": None, "raw_text": None, "confidence": None}], building_height_m=None)
    fallback = RegionFailureExtraction()
    assert door.door_rows[0].width_m is None
    assert area.rows[0].area_unit == "sqft"
    assert height.building_height_m is None
    assert fallback.uncertainties == []

def test_combined_schedule_schema_can_return_doors_windows_and_floor_areas():
    parsed = CombinedScheduleExtraction(
        schedule_found=True,
        doors=[{"mark": "D1", "width_m": 1.0, "height_m": 2.1, "door_type": "timber", "confidence": .9}],
        windows=[{"mark": "W1", "width_m": 1.2, "height_m": 1.0, "window_type": "casement", "confidence": .8}],
        floor_areas=[{"floor_name": "Ground", "area_value": 1000, "area_unit": "sqft", "normalized_area_m2": 92.9, "confidence": .9}],
        total_floor_area_m2=92.9,
    )
    assert parsed.doors[0].mark == "D1"
    assert parsed.windows[0].mark == "W1"
    assert parsed.floor_areas[0].normalized_area_m2 == 92.9
    assert parsed.total_floor_area_m2 == 92.9

def test_semantic_region_schema_routing_is_explicit():
    assert schema_for_region(SemanticRegionType.DOOR_WINDOW_SCHEDULE) is CombinedScheduleExtraction
    assert schema_for_region(SemanticRegionType.DOOR_WINDOW_SCHEDULE) is not HeightExtraction
    assert schema_for_region(SemanticRegionType.FLOOR_AREA_SCHEDULE) is FloorAreaExtraction
    assert schema_for_region(SemanticRegionType.SECTION_ELEVATION) is HeightExtraction
    assert schema_for_region(SemanticRegionType.STAIR_ESCAPE_PLAN) is StairEscapeExtraction
    assert schema_for_region(SemanticRegionType.FIRE_SAFETY_REGION) is FireFeatureExtraction

def test_strict_openai_schemas_do_not_allow_arbitrary_objects():
    import json

    for schema_model in (PlanOverviewExtraction, PlanExtraction, DoorScheduleExtraction, ScheduleDetailExtraction, CombinedScheduleExtraction, FloorAreaExtraction, HeightExtraction, StairEscapeExtraction, FireFeatureExtraction, RegionFailureExtraction):
        schema = json.dumps(schema_model.model_json_schema())
        assert '"additionalProperties": true' not in schema

def test_openai_provider_uses_mocked_structured_response(monkeypatch):
    PLAN_READER_CACHE.clear()
    parsed = PlanExtraction(
        building_info=BuildingInfoEvidence(
            building_use=EvidenceValue(value="Hostel", confidence=.95, source_page=1, evidence_text="PROPOSED STUDENT HOSTEL", state="CONFIRMED")
        )
    )

    class FakeResponses:
        def parse(self, **kwargs):
            assert kwargs["model"] == "test-vision-model"
            assert kwargs["text_format"] is PlanOverviewExtraction
            assert kwargs["input"][1]["content"][1]["type"] == "input_image"
            return type("Response", (), {"output_parsed": parsed})()

    class FakeOpenAI:
        def __init__(self):
            self.responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    reader = OpenAIPlanReader(settings)
    result, warnings, cached = reader.extract_page(filename="plan.png", page=RenderedPage(1, png_bytes()), page_count=1, native_text=[])
    assert result.building_info.building_use.value == "Hostel"
    assert warnings == []
    assert cached is False

def test_openai_provider_accepts_jpeg_bytes_after_normalization(monkeypatch):
    PLAN_READER_CACHE.clear()
    calls = []
    parsed = PlanExtraction(
        building_info=BuildingInfoEvidence(
            building_use=EvidenceValue(value="Hostel", confidence=.95, source_page=1, evidence_text="HOSTEL", state="CONFIRMED")
        )
    )

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs)
            image_url = kwargs["input"][1]["content"][1]["image_url"]
            assert image_url.startswith("data:image/jpeg;base64,")
            return type("Response", (), {"output_parsed": parsed})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    upload = UploadFile(file=BytesIO(image_bytes("JPEG")), filename="architectural_plan.jpg", headers={"content-type": "image/jpeg"})
    result = asyncio.run(DrawingUnderstandingService(settings).analyze_uploads([upload]))
    assert calls
    assert result.geometry_analysis["plan_reader"]["provider"] == "openai"
    assert result.documents[0].filename == "architectural_plan.jpg"

def test_large_image_uses_semantic_regions_before_generic_tiles(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs)
            text = kwargs["input"][1]["content"][0]["text"]
            if "DOOR_WINDOW_SCHEDULE" in text:
                parsed = DoorScheduleExtraction(schedule_found=True, door_rows=[{"mark": "D1", "width_m": 1.0, "height_m": 2.1, "raw_text": "D1 1.0 x 2.1", "confidence": .8}])
            else:
                parsed = PlanExtraction(
                    building_info=BuildingInfoEvidence(
                        building_use=EvidenceValue(value="Hostel", confidence=.9, source_page=1, evidence_text="HOSTEL", state="CONFIRMED")
                    ),
                    semantic_regions=[SemanticRegionEvidence(region_type="DOOR_WINDOW_SCHEDULE", label="Opening schedule", page=1, bbox={"x": .7, "y": .7, "width": .25, "height": .25}, confidence=.9)],
                )
            return type("Response", (), {"output_parsed": parsed})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    reader = OpenAIPlanReader(settings)
    extraction, warnings, cached = reader.extract_page(filename="huge.png", page=RenderedPage(1, image_bytes("PNG", (2600, 2400))), page_count=1, native_text=[])
    assert cached is False
    assert len(calls) == 2
    assert extraction.building_info.building_use.value == "Hostel"
    assert extraction.doors[0].door_id == "D1"
    assert any("semantic region" in warning for warning in warnings)
    assert not any("overlapping tile" in warning for warning in warnings)

def test_bad_detail_region_does_not_destroy_successful_overview(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs["text_format"])
            if kwargs["text_format"] is PlanOverviewExtraction:
                return type("Response", (), {"output_parsed": PlanOverviewExtraction(
                    project_name="Project A",
                    building_use_text="Student hostel",
                    storey_count=7,
                    semantic_regions=[{"region_type": "DOOR_WINDOW_SCHEDULE", "bbox": {"x": .7, "y": .7, "width": .25, "height": .25}, "confidence": .9}],
                )})()
            if kwargs["text_format"] is CombinedScheduleExtraction:
                CombinedScheduleExtraction.model_validate({"schedule_found": True, "doors": [{"mark": "D1", "confidence": 2}]})
            return type("Response", (), {"output_parsed": RegionFailureExtraction(evidence_found=False)})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    extraction, warnings, cached = OpenAIPlanReader(settings).extract_page(filename="huge.png", page=RenderedPage(1, image_bytes("PNG", (2600, 2400))), page_count=1, native_text=[])
    assert cached is False
    assert extraction.building_info.project_name.value == "Project A"
    assert extraction.building_info.explicit_storey_count.value == "7"
    assert extraction.doors == []
    assert any("failed validation" in warning for warning in warnings)
    assert any("requested 1 successful 0 failed 1" in warning for warning in warnings)
    assert calls == [PlanOverviewExtraction, CombinedScheduleExtraction, RegionFailureExtraction]

def test_service_reports_partial_success_for_failed_detail_region(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()

    class FakeResponses:
        def parse(self, **kwargs):
            if kwargs["text_format"] is PlanOverviewExtraction:
                return type("Response", (), {"output_parsed": PlanOverviewExtraction(
                    project_name="Project A",
                    building_use_text="Student hostel",
                    storey_count=7,
                    semantic_regions=[{"region_type": "DOOR_WINDOW_SCHEDULE", "bbox": {"x": .7, "y": .7, "width": .25, "height": .25}, "confidence": .9}],
                )})()
            if kwargs["text_format"] is CombinedScheduleExtraction:
                CombinedScheduleExtraction.model_validate({"schedule_found": True, "doors": [{"mark": "D1", "confidence": 2}]})
            return type("Response", (), {"output_parsed": RegionFailureExtraction()})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", openai_overview_max_edge=40, ocr_engine="none")
    upload = UploadFile(file=BytesIO(image_bytes("PNG", (260, 240))), filename="normal_architectural_plan.png", headers={"content-type": "image/png"})
    result = asyncio.run(DrawingUnderstandingService(settings).analyze_uploads([upload]))
    metadata = result.geometry_analysis["plan_reader"]
    assert metadata["status"] == "PARTIAL_SUCCESS"
    assert metadata["openai_status"] == "PARTIAL_SUCCESS"
    assert metadata["overview_pages"] == 1
    assert metadata["semantic_regions_requested"] == 1
    assert metadata["semantic_regions_successful"] == 0
    assert metadata["semantic_regions_failed"] == 1

def test_semantic_region_cap_limits_detail_calls(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs)
            text_format = kwargs["text_format"]
            if text_format is PlanOverviewExtraction:
                return type("Response", (), {"output_parsed": PlanOverviewExtraction(semantic_regions=[
                    {"region_type": "FLOOR_AREA_SCHEDULE", "bbox": {"x": .1, "y": .1, "width": .2, "height": .2}, "confidence": .9},
                    {"region_type": "SECTION_ELEVATION", "bbox": {"x": .3, "y": .1, "width": .2, "height": .2}, "confidence": .9},
                    {"region_type": "DOOR_WINDOW_SCHEDULE", "bbox": {"x": .5, "y": .1, "width": .2, "height": .2}, "confidence": .9},
                ])})()
            return type("Response", (), {"output_parsed": text_format()})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", openai_max_detail_regions=2)
    OpenAIPlanReader(settings).extract_page(filename="huge.png", page=RenderedPage(1, image_bytes("PNG", (2600, 2400))), page_count=1, native_text=[])
    assert len(calls) == 3

def test_fast_mode_uses_one_openai_request_with_three_images(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            content = kwargs["input"][1]["content"]
            calls.append({"schema": kwargs["text_format"], "image_count": sum(1 for item in content if item["type"] == "input_image")})
            assert kwargs["text_format"] is FastPlanExtraction
            return type("Response", (), {"output_parsed": FastPlanExtraction(
                project_name="Proposed Student Girls Hostel Development",
                building_use_text="Student Girls Hostel",
                storeys={"storey_count": 7, "floor_names": ["Ground Floor", "First to Sixth Floor"], "evidence_text": "GROUND FLOOR / FIRST TO SIXTH FLOOR", "confidence": .8},
                doors=[{"mark": "D1", "width_m": 1.0, "height_m": 2.1, "confidence": .8}],
                windows=[{"mark": "W1", "width_m": 1.2, "height_m": 1.0, "confidence": .8}],
                floor_areas=[{"floor_name": "Ground", "area_value": 100, "area_unit": "m2", "normalized_area_m2": 100, "confidence": .8}],
                total_floor_area_m2=100,
            )})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", fireguard_fast_mode=True, openai_max_detail_regions=3)
    extraction, warnings, cached = OpenAIPlanReader(settings).extract_page(filename="huge.png", page=RenderedPage(1, image_bytes("PNG", (2600, 2400))), page_count=1, native_text=[])
    assert cached is False
    assert calls == [{"schema": FastPlanExtraction, "image_count": 3}]
    assert extraction.building_info.project_name.value == "Proposed Student Girls Hostel Development"
    assert extraction.building_info.building_use.value == "Student Girls Hostel"
    assert extraction.building_info.explicit_storey_count.value == "7"
    assert extraction.doors[0].door_id == "D1"
    assert extraction.schedules[1].schedule_type == "window_schedule"
    assert extraction.building_info.total_floor_area_m2.value == "100.0"
    assert any("one multimodal request with 3 prepared image" in warning for warning in warnings)

def test_real_plan_fast_mode_prepares_targeted_images_in_one_request(monkeypatch):
    PLAN_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            content = kwargs["input"][1]["content"]
            images = [item for item in content if item["type"] == "input_image"]
            decoded_sizes = []
            for item in images:
                payload = item["image_url"].split(",", 1)[1]
                decoded_sizes.append(Image.open(BytesIO(base64.b64decode(payload))).size)
            calls.append({
                "schema": kwargs["text_format"],
                "image_count": len(images),
                "sizes": decoded_sizes,
                "prompt": content[0]["text"],
            })
            return type("Response", (), {"output_parsed": FastPlanExtraction(
                project_name="Proposed Student Girls Hostel Development",
                building_use_text="Student Girls Hostel",
                storeys={"storey_count": 7, "floor_names": ["GROUND FLOOR", "FIRST TO SIXTH FLOOR"], "evidence_text": "GROUND FLOOR and FIRST TO SIXTH FLOOR", "source_region": "SECTION_PLAN_CROP", "confidence": .8},
            )})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    pdf_path = Path(__file__).resolve().parents[2] / "20260509181148921.pdf"
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", fireguard_fast_mode=True, openai_overview_max_edge=2200)
    rendered = render_pdf(pdf_path.read_bytes(), dpi=200)[0]
    extraction, warnings, cached = OpenAIPlanReader(settings).extract_page(
        filename="20260509181148921.pdf",
        page=rendered,
        page_count=1,
        native_text=[],
    )
    assert cached is False
    assert len(calls) == 1
    assert calls[0]["schema"] is FastPlanExtraction
    assert calls[0]["image_count"] == 3
    assert "OVERVIEW, SCHEDULE_CROP, SECTION_PLAN_CROP" in calls[0]["prompt"]
    assert calls[0]["sizes"][0][0] <= 2200 and calls[0]["sizes"][0][1] <= 2200
    assert all(max(size) >= 1000 for size in calls[0]["sizes"][1:])
    assert extraction.building_info.project_name.value == "Proposed Student Girls Hostel Development"
    assert extraction.building_info.building_use.value == "Student Girls Hostel"
    assert any("one multimodal request with 3 prepared image" in warning for warning in warnings)

def test_fast_mode_does_not_copy_project_title_into_building_use(monkeypatch):
    PLAN_READER_CACHE.clear()

    class FakeResponses:
        def parse(self, **kwargs):
            return type("Response", (), {"output_parsed": FastPlanExtraction(
                project_name="Proposed Student Girls Hostel Development",
                building_use_text="Proposed Student Girls Hostel Development",
            )})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", fireguard_fast_mode=True)
    extraction, _, _ = OpenAIPlanReader(settings).extract_page(filename="plan.png", page=RenderedPage(1, image_bytes("PNG", (2600, 2400))), page_count=1, native_text=[])
    assert extraction.building_info.project_name.value == "Proposed Student Girls Hostel Development"
    assert extraction.building_info.building_use.value is None

def test_fast_mode_skips_local_ocr_when_openai_succeeds(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()

    class FakeResponses:
        def parse(self, **kwargs):
            return type("Response", (), {"output_parsed": FastPlanExtraction(
                project_name="Fast Project",
                building_use_text="Hostel",
                storeys={"storey_count": 3, "floor_names": ["Ground Floor"], "evidence_text": "GROUND FLOOR", "confidence": .8},
            )})()

    class FakeOpenAI:
        responses = FakeResponses()

    def fail_local(*args, **kwargs):
        raise AssertionError("local OCR/fallback analysis should not run in fast mode after OpenAI succeeds")

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    monkeypatch.setattr("backend.drawing_understanding.analyzer.LocalDrawingAnalyzer.analyze_inspected_uploads", fail_local)
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", plan_reader="openai", fireguard_fast_mode=True)
    upload = UploadFile(file=BytesIO(image_bytes("PNG")), filename="fast_plan.png", headers={"content-type": "image/png"})
    result = asyncio.run(DrawingUnderstandingService(settings).analyze_uploads([upload]))
    metadata = result.geometry_analysis["plan_reader"]
    assert metadata["provider"] == "openai_fast"
    assert metadata["fast_mode"] is True
    assert metadata["max_openai_calls"] == 1
    assert metadata["images_sent"] == 3
    assert metadata["supplementary_ocr_used"] is False
    assert result.pages[-1].building_info.building_use_text == "Hostel"

def test_cache_hit_skips_openai_calls(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs)
            return type("Response", (), {"output_parsed": PlanExtraction()})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    reader = OpenAIPlanReader(settings)
    page = RenderedPage(1, image_bytes("PNG", (120, 80)))
    reader.extract_page(filename="same.png", page=page, page_count=1, native_text=[], file_hash="abc")
    _, _, cached = reader.extract_page(filename="same.png", page=page, page_count=1, native_text=[], file_hash="abc")
    assert cached is True
    assert len(calls) == 1

def test_cache_invalidation_by_schema_version(monkeypatch):
    PLAN_READER_CACHE.clear()
    REGION_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs)
            return type("Response", (), {"output_parsed": PlanExtraction()})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    page = RenderedPage(1, image_bytes("PNG", (120, 80)))
    OpenAIPlanReader(Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", plan_extraction_schema_version=2)).extract_page(filename="same.png", page=page, page_count=1, native_text=[], file_hash="abc")
    OpenAIPlanReader(Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", plan_extraction_schema_version=3)).extract_page(filename="same.png", page=page, page_count=1, native_text=[], file_hash="abc")
    assert len(calls) == 2

def test_real_golden_pdf_large_page_gets_prepared_as_overview_and_tiles(monkeypatch):
    PLAN_READER_CACHE.clear()
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            calls.append(kwargs)
            return type("Response", (), {"output_parsed": PlanExtraction(pages=[{"page": 1, "classification": "ARCHITECTURAL"}])})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    pdf_path = Path(__file__).resolve().parents[2] / "20260509181148921.pdf"
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model", openai_overview_max_edge=700)
    rendered = render_pdf(pdf_path.read_bytes(), dpi=80)[0]
    extraction, warnings, cached = OpenAIPlanReader(settings).extract_page(
        filename="20260509181148921.pdf",
        page=rendered,
        page_count=1,
        native_text=[],
    )
    assert cached is False
    assert extraction.pages[0].classification == "ARCHITECTURAL"
    assert any("semantic region" in warning for warning in warnings)
    assert len(calls) >= 2

def test_small_crop_schedule_is_classified_by_openai(monkeypatch):
    PLAN_READER_CACHE.clear()
    parsed = PlanExtraction(
        pages=[{"page": 1, "classification": "ARCHITECTURAL"}],
        doors=[DoorEvidence(door_id="D1", page=1, width_mm=1000, height_mm=2100, confidence=.8, evidence_text="D1 1000 x 2100")],
        schedules=[{"schedule_type": "door_schedule", "row_text": "D1 1000 x 2100", "page": 1, "confidence": .8}],
    )

    class FakeResponses:
        def parse(self, **kwargs):
            return type("Response", (), {"output_parsed": parsed})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    upload = UploadFile(file=BytesIO(png_bytes()), filename="door_schedule.png", headers={"content-type": "image/png"})
    result = asyncio.run(DrawingUnderstandingService(settings).analyze_uploads([upload]))
    assert result.pages[-1].classification == PageClassification.ARCHITECTURAL
    assert result.pages[-1].doors[0].mark == "D1"

def test_multiple_and_mixed_uploads_merge_openai_evidence(monkeypatch):
    PLAN_READER_CACHE.clear()

    class FakeResponses:
        def parse(self, **kwargs):
            text = kwargs["input"][1]["content"][0]["text"]
            if "architectural.pdf" in text:
                parsed = PlanExtraction(
                    building_info=BuildingInfoEvidence(
                        building_use=EvidenceValue(value="Hostel", confidence=.9, source_page=1, evidence_text="HOSTEL", state="CONFIRMED")
                    )
                )
            elif "section.jpg" in text:
                parsed = PlanExtraction(stairs=[{"label": "STAIR 1", "page": 1, "confidence": .8, "evidence_text": "STAIR 1"}])
            else:
                parsed = PlanExtraction(rooms=[RoomEvidence(label="Bedroom", page=1, confidence=.8, evidence_text="BED ROOM")])
            return type("Response", (), {"output_parsed": parsed})()

    class FakeOpenAI:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda settings: FakeOpenAI())
    settings = Settings(openai_api_key="test-key", openai_plan_model="test-vision-model")
    uploads = [
        UploadFile(file=BytesIO(image_bytes("PNG")), filename="ground.png", headers={"content-type": "image/png"}),
        UploadFile(file=BytesIO(image_bytes("JPEG")), filename="section.jpg", headers={"content-type": "image/jpeg"}),
        UploadFile(file=BytesIO(vector_pdf()), filename="architectural.pdf", headers={"content-type": "application/pdf"}),
    ]
    result = asyncio.run(DrawingUnderstandingService(settings).analyze_uploads(uploads))
    project = build_project(
        result.pages,
        result.documents,
        [page.model_dump(mode="json") for page in result.page_analysis],
        result.evidence_warnings,
        result.geometry_analysis,
        result.spatial_graph,
    )
    assert project.building_info.building_use_text == "Hostel"
    assert any(room.label == "Bedroom" for room in project.rooms)
    assert any(stair.label == "STAIR 1" for stair in project.stairs)
    assert {document.filename for document in project.documents} == {"ground.png", "section.jpg", "architectural.pdf"}

def test_model_non_detection_does_not_create_zero_stairs_or_doors():
    pages = page_extractions_from_openai("plan.png", PlanExtraction())
    project = build_project(pages, [Document(filename="plan.png", media_type="image/png", page_count=1)])
    assert len(project.stairs) == 0
    assert len(project.doors) == 0
    assert project.building_info.storey_count is None

def test_invalid_negative_height_is_rejected_to_unknown():
    extraction = PlanExtraction(building_info=BuildingInfoEvidence(height_m=EvidenceValue(value="-10", state="CONFIRMED")))
    validated, warnings = validate_plan_extraction(extraction, page_count=1)
    assert validated.building_info.height_m.value is None
    assert warnings

def test_schedule_door_does_not_fabricate_exit_status():
    extraction = PlanExtraction(doors=[DoorEvidence(door_id="D1", page=1, width_mm=1000, height_mm=2100, physical_instance_confirmed=False)])
    pages = page_extractions_from_openai("plan.png", extraction)
    assert pages[0].doors[0].is_exit is None
    assert pages[0].doors[0].opens_in_exit_direction is None

def test_conflicting_native_and_openai_building_use_is_audited():
    native = PageExtraction(
        source_file="plan.pdf",
        source_page=1,
        classification=PageClassification.ARCHITECTURAL,
        building_info=BuildingInfo(building_use_text="Office"),
    )
    openai = page_extractions_from_openai(
        "plan.pdf",
        PlanExtraction(building_info=BuildingInfoEvidence(building_use=EvidenceValue(value="Hostel", confidence=.9, source_page=1, state="CONFIRMED"))),
    )[0]
    project = build_project([native, openai], [Document(filename="plan.pdf", media_type="application/pdf", page_count=1)])
    assert any(conflict.field == "building_info.building_use_text" for conflict in project.conflicts)

def test_openai_failure_uses_local_fallback(monkeypatch):
    from backend.drawing_understanding.openai import PlanReaderUnavailable

    class SafeFailingReader:
        def __init__(self, settings):
            raise PlanReaderUnavailable("timeout", error_type="TIMEOUT", stage="RESPONSES_REQUEST", retryable=True)

    monkeypatch.setattr("backend.drawing_understanding.plan_reader.OpenAIPlanReader", SafeFailingReader)
    settings = Settings(plan_reader="auto", openai_api_key="test-key", ocr_engine="none")
    upload = UploadFile(file=BytesIO(png_bytes()), filename="plan.png")
    result = asyncio.run(DrawingUnderstandingService(settings).analyze_uploads([upload]))
    assert result.geometry_analysis["plan_reader"]["status"] == "FALLBACK"
    assert result.geometry_analysis["plan_reader"]["openai_status"] == "TIMEOUT"
    assert result.geometry_analysis["plan_reader"]["error"]["stage"] == "RESPONSES_REQUEST"

def test_analyze_endpoint_uses_production_openai_path(monkeypatch):
    from backend.main import app, settings

    original = {
        "plan_reader": settings.plan_reader,
        "openai_api_key": settings.openai_api_key,
        "openai_plan_model": settings.openai_plan_model,
        "ocr_engine": settings.ocr_engine,
    }
    settings.plan_reader = "openai"
    settings.openai_api_key = "test-key"
    settings.openai_plan_model = "endpoint-model"
    settings.ocr_engine = "none"

    parsed = PlanExtraction(
        building_info=BuildingInfoEvidence(
            building_use=EvidenceValue(value="Hostel", confidence=.95, source_page=1, evidence_text="PROPOSED STUDENT HOSTEL", state="CONFIRMED")
        ),
        rooms=[RoomEvidence(label="Bedroom", page=1, confidence=.9, evidence_text="BED ROOM")],
    )

    class FakeResponses:
        def parse(self, **kwargs):
            assert kwargs["model"] == "endpoint-model"
            assert kwargs["input"][1]["content"][1]["type"] == "input_image"
            return type("Response", (), {"output_parsed": parsed})()

    class FakeClient:
        responses = FakeResponses()

    monkeypatch.setattr("backend.drawing_understanding.openai.provider.make_openai_client", lambda active_settings: FakeClient())
    try:
        response = TestClient(app).post("/api/fireguard/analyze", files=[("files", ("plan.png", png_bytes(), "image/png"))])
    finally:
        settings.plan_reader = original["plan_reader"]
        settings.openai_api_key = original["openai_api_key"]
        settings.openai_plan_model = original["openai_plan_model"]
        settings.ocr_engine = original["ocr_engine"]

    assert response.status_code == 200
    body = response.json()
    assert body["extraction_summary"]["plan_reader_provider"] == "openai"
    assert body["extraction_summary"]["plan_reader_status"] == "SUCCESS"
    assert body["extraction_summary"]["openai_status"] == "SUCCESS"
    assert body["extraction_summary"]["pages_interpreted"] >= 1
    assert body["project_schema"]["building_info"]["building_use_text"] == "Hostel"
