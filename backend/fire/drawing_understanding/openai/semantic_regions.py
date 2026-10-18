from __future__ import annotations

import re
from dataclasses import dataclass
from io import BytesIO

from PIL import Image

from ...config import Settings
from ..evidence.models import TextEvidence

from .provider import PreparedRequestImage, _prepare_request_image
from .schemas import (
    DoorEvidence,
    DoorScheduleExtraction,
    EvidenceState,
    EvidenceValue,
    CombinedScheduleExtraction,
    DimensionEvidence,
    FireEquipmentEvidence,
    FireFeatureExtraction,
    FloorAreaExtraction,
    FloorAreaEvidence,
    HeightExtraction,
    OpenAIFloorLevelEvidence,
    PlanExtraction,
    ScheduleEntryEvidence,
    SemanticRegionEvidence,
    SemanticRegionType,
    StairEvidence,
    RoomEvidence,
    StairEscapeExtraction,
)

SQFT_TO_M2 = 0.092903

DETAIL_PRIORITY = {
    SemanticRegionType.DOOR_WINDOW_SCHEDULE: 10,
    SemanticRegionType.FLOOR_AREA_SCHEDULE: 9,
    SemanticRegionType.SECTION_ELEVATION: 8,
    SemanticRegionType.STAIR_ESCAPE_PLAN: 8,
    SemanticRegionType.FIRE_PLAN_REGION: 5,
    SemanticRegionType.FIRE_SAFETY_LEGEND: 4,
    SemanticRegionType.FIRE_SAFETY_REGION: 4,
    SemanticRegionType.TITLE_BLOCK: 1,
}

REGION_KEYWORDS = {
    SemanticRegionType.DOOR_WINDOW_SCHEDULE: ("door", "window", "opening schedule", "schedule"),
    SemanticRegionType.FLOOR_AREA_SCHEDULE: ("floor area", "area schedule", "area details", "sqft", "sqm", "sq.m"),
    SemanticRegionType.SECTION_ELEVATION: ("section", "elevation", "ffl", "rl", "level"),
    SemanticRegionType.STAIR_ESCAPE_PLAN: ("stair", "exit", "escape", "corridor", "ground floor", "upper floor"),
    SemanticRegionType.FIRE_SAFETY_LEGEND: ("fire", "legend", "extinguisher", "hose reel", "alarm", "sprinkler"),
    SemanticRegionType.FIRE_SAFETY_REGION: ("fire", "extinguisher", "hose reel", "alarm", "sprinkler", "hydrant", "riser"),
    SemanticRegionType.FIRE_PLAN_REGION: ("fire plan", "fire service", "fire protection"),
    SemanticRegionType.TITLE_BLOCK: ("title", "project", "client", "drawing"),
}

REGION_PROMPTS = {
    SemanticRegionType.DOOR_WINDOW_SCHEDULE: "Extract visible schedule information in this crop: door rows, window rows, floor-area rows, total floor area, and designed occupants if clearly visible. Use null for unreadable values. Scheduled doors are not exit doors.",
    SemanticRegionType.FLOOR_AREA_SCHEDULE: "Extract visible schedule information in this crop: floor-area rows, total floor area, door rows, window rows, and designed occupants if clearly visible. Each floor-area row must have a contextual floor label and numeric area with unit in the same visible row. Preserve source value/unit.",
    SemanticRegionType.SECTION_ELEVATION: "Extract contextual section/elevation floor level and height evidence only. A bare number must never become building height. Use null unless tied to visible floor/roof/terrace/FFL/RL/section/elevation labels.",
    SemanticRegionType.STAIR_ESCAPE_PLAN: "Extract only visible stair, exit, corridor, room, and route evidence. Visible stair candidates are not confirmed independent exits. Use null for unknown counts.",
    SemanticRegionType.FIRE_SAFETY_LEGEND: "Extract visible fire-safety legend or symbol evidence only. Do not infer complete fire-equipment coverage from annotations.",
    SemanticRegionType.FIRE_SAFETY_REGION: "Extract visible fire-protection feature evidence only. Do not infer complete system coverage from an isolated annotation. Use null for unknown presence.",
    SemanticRegionType.FIRE_PLAN_REGION: "Extract evidence that this page is a fire-service/fire-protection plan only when supported by page title/classification, not by an isolated handwritten annotation.",
    SemanticRegionType.TITLE_BLOCK: "Extract title-block metadata only.",
}


@dataclass(frozen=True)
class SemanticRegion:
    region_type: SemanticRegionType
    label: str
    bbox: dict[str, float]
    confidence: float
    reason: str
    rotate_degrees: int = 0


def select_semantic_regions(
    overview: PlanExtraction,
    image: Image.Image,
    native_text: list[TextEvidence],
    settings: Settings,
) -> tuple[list[SemanticRegion], bool]:
    candidates: list[SemanticRegion] = []
    candidates.extend(_regions_from_overview(overview))
    candidates.extend(_regions_from_text(native_text))
    if not candidates and max(image.width, image.height) > settings.openai_overview_max_edge:
        candidates.extend(_layout_heuristic_regions(image))
    deduped = _dedupe_regions(candidates)
    selected = sorted(deduped, key=lambda item: (DETAIL_PRIORITY[item.region_type], item.confidence), reverse=True)
    cap = 1 if settings.fireguard_fast_mode else max(0, settings.openai_max_detail_regions)
    return selected[:cap], bool(deduped)


def crop_region(image: Image.Image, region: SemanticRegion, settings: Settings) -> PreparedRequestImage:
    bbox = _clamp_bbox(region.bbox)
    x1 = int(image.width * bbox["x"])
    y1 = int(image.height * bbox["y"])
    x2 = int(image.width * (bbox["x"] + bbox["width"]))
    y2 = int(image.height * (bbox["y"] + bbox["height"]))
    crop = image.crop((x1, y1, max(x1 + 1, x2), max(y1 + 1, y2)))
    if region.rotate_degrees:
        crop = crop.rotate(region.rotate_degrees, expand=True)
    return _prepare_request_image(
        crop,
        original_bytes=len(_image_bytes(image)),
        max_bytes=settings.openai_image_max_bytes,
        jpeg_quality=settings.openai_jpeg_quality,
    )


def prompt_for_region(region: SemanticRegion) -> str:
    return f"Semantic region type: {region.region_type.value}\n{REGION_PROMPTS[region.region_type]}\nRegion label: {region.label}\nReason selected: {region.reason}"


def schema_for_region(region_type: SemanticRegionType):
    if region_type == SemanticRegionType.DOOR_WINDOW_SCHEDULE:
        return CombinedScheduleExtraction
    if region_type == SemanticRegionType.FLOOR_AREA_SCHEDULE:
        return FloorAreaExtraction
    if region_type == SemanticRegionType.SECTION_ELEVATION:
        return HeightExtraction
    if region_type == SemanticRegionType.STAIR_ESCAPE_PLAN:
        return StairEscapeExtraction
    if region_type in {SemanticRegionType.FIRE_SAFETY_REGION, SemanticRegionType.FIRE_SAFETY_LEGEND, SemanticRegionType.FIRE_PLAN_REGION}:
        return FireFeatureExtraction
    return PlanExtraction


def merge_region_result(target: PlanExtraction, region: SemanticRegion, parsed) -> None:
    target.semantic_regions.append(
        SemanticRegionEvidence(
            region_type=region.region_type,
            label=region.label,
            page=target.pages[0].page if target.pages else 1,
            bbox=region.bbox,
            confidence=region.confidence,
            reason=region.reason,
        )
    )
    if isinstance(parsed, CombinedScheduleExtraction):
        _merge_schedule_detail(target, parsed, region)
    elif isinstance(parsed, DoorScheduleExtraction):
        _merge_door_schedule(target, parsed, region)
    elif isinstance(parsed, FloorAreaExtraction):
        _merge_floor_area(target, parsed, region)
    elif isinstance(parsed, HeightExtraction):
        _merge_height(target, parsed, region)
    elif isinstance(parsed, StairEscapeExtraction):
        _merge_stair_escape(target, parsed, region)
    elif isinstance(parsed, FireFeatureExtraction):
        _merge_fire_features(target, parsed, region)
    elif isinstance(parsed, PlanExtraction):
        _merge_plan(target, parsed)


def _regions_from_overview(overview: PlanExtraction) -> list[SemanticRegion]:
    regions: list[SemanticRegion] = []
    for item in overview.semantic_regions:
        if not item.bbox or (item.confidence is not None and item.confidence < 0.45):
            continue
        regions.append(SemanticRegion(item.region_type, item.label or item.region_type.value, item.bbox.model_dump(), item.confidence or 0.55, item.reason or "overview bbox"))
    labels = [*(overview.building_info.floor_names_visible or [])]
    labels.extend(entry.row_text or entry.schedule_type or "" for entry in overview.schedules)
    labels.extend(overview.uncertainties)
    for region_type, keywords in REGION_KEYWORDS.items():
        if any(any(keyword in label.lower() for keyword in keywords) for label in labels if label):
            regions.append(_default_region_for(region_type, f"{region_type.value} mentioned in overview", 0.5))
    return regions


def _regions_from_text(items: list[TextEvidence]) -> list[SemanticRegion]:
    regions: list[SemanticRegion] = []
    for region_type, keywords in REGION_KEYWORDS.items():
        matched = [item for item in items if any(keyword in item.normalized_text.lower() for keyword in keywords)]
        boxes = [item.bbox.model_dump(mode="json") for item in matched if item.bbox]
        if boxes:
            regions.append(SemanticRegion(region_type, region_type.value, _union_bbox(boxes), 0.72, "native/OCR text labels matched semantic region"))
    return regions


def _layout_heuristic_regions(image: Image.Image) -> list[SemanticRegion]:
    wide_sheet = image.width >= image.height
    if not wide_sheet:
        return [
            SemanticRegion(SemanticRegionType.FLOOR_AREA_SCHEDULE, "lower sheet schedule band", {"x": 0.62, "y": 0.76, "width": 0.38, "height": 0.24}, 0.40, "layout heuristic for portrait/rotated schedule band", 90),
            SemanticRegion(SemanticRegionType.DOOR_WINDOW_SCHEDULE, "right lower schedule band", {"x": 0.66, "y": 0.58, "width": 0.34, "height": 0.42}, 0.40, "layout heuristic for portrait/rotated right-side schedules", 90),
            SemanticRegion(SemanticRegionType.SECTION_ELEVATION, "upper sheet section/elevation band", {"x": 0.08, "y": 0.00, "width": 0.78, "height": 0.40}, 0.38, "layout heuristic for portrait/rotated sections and elevations"),
        ]
    return [
        SemanticRegion(SemanticRegionType.FLOOR_AREA_SCHEDULE, "bottom schedule band", {"x": 0.62, "y": 0.74, "width": 0.38, "height": 0.26}, 0.42, "layout heuristic for schedule band", 90),
        SemanticRegion(SemanticRegionType.DOOR_WINDOW_SCHEDULE, "right schedule band", {"x": 0.70, "y": 0.60, "width": 0.30, "height": 0.40}, 0.42, "layout heuristic for right-side schedules", 90),
        SemanticRegion(SemanticRegionType.SECTION_ELEVATION, "upper drawing band", {"x": 0.12, "y": 0.00, "width": 0.66, "height": 0.40}, 0.40, "layout heuristic for sections/elevations"),
    ]


def _default_region_for(region_type: SemanticRegionType, reason: str, confidence: float) -> SemanticRegion:
    if region_type in {SemanticRegionType.DOOR_WINDOW_SCHEDULE, SemanticRegionType.FLOOR_AREA_SCHEDULE}:
        return SemanticRegion(region_type, region_type.value, {"x": 0.62, "y": 0.70, "width": 0.38, "height": 0.30}, confidence, reason, 90)
    if region_type == SemanticRegionType.SECTION_ELEVATION:
        return SemanticRegion(region_type, region_type.value, {"x": 0.12, "y": 0.00, "width": 0.66, "height": 0.40}, confidence, reason)
    if region_type == SemanticRegionType.STAIR_ESCAPE_PLAN:
        return SemanticRegion(region_type, region_type.value, {"x": 0.58, "y": 0.14, "width": 0.42, "height": 0.62}, confidence, reason, 90)
    return SemanticRegion(region_type, region_type.value, {"x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0}, confidence, reason)


def _dedupe_regions(regions: list[SemanticRegion]) -> list[SemanticRegion]:
    best: dict[SemanticRegionType, SemanticRegion] = {}
    for region in regions:
        current = best.get(region.region_type)
        if current is None or region.confidence > current.confidence:
            best[region.region_type] = region
    return list(best.values())


def _union_bbox(boxes: list[dict[str, float]]) -> dict[str, float]:
    x1 = min(box["x"] for box in boxes)
    y1 = min(box["y"] for box in boxes)
    x2 = max(box["x"] + box["width"] for box in boxes)
    y2 = max(box["y"] + box["height"] for box in boxes)
    pad = 0.05
    return _clamp_bbox({"x": x1 - pad, "y": y1 - pad, "width": x2 - x1 + 2 * pad, "height": y2 - y1 + 2 * pad})


def _clamp_bbox(bbox: dict[str, float]) -> dict[str, float]:
    x = max(0.0, min(1.0, bbox["x"]))
    y = max(0.0, min(1.0, bbox["y"]))
    width = max(0.01, min(1.0 - x, bbox["width"]))
    height = max(0.01, min(1.0 - y, bbox["height"]))
    return {"x": x, "y": y, "width": width, "height": height}


def _image_bytes(image: Image.Image) -> bytes:
    out = BytesIO()
    image.convert("RGB").save(out, "JPEG", quality=80)
    return out.getvalue()


def _to_m2(value: float | None, unit: str | None) -> float | None:
    if value is None:
        return None
    normalized = re.sub(r"[\s.^]", "", (unit or "").lower())
    if normalized in {"sqft", "ft2", "sft"}:
        return round(value * SQFT_TO_M2, 2)
    if normalized in {"sqm", "m2", "sqmeter", "sqmeters"}:
        return round(value, 2)
    return None


def _merge_door_schedule(target: PlanExtraction, parsed: DoorScheduleExtraction, region: SemanticRegion) -> None:
    if not parsed.schedule_found:
        return
    for row in parsed.door_rows:
        target.doors.append(
            DoorEvidence(
                door_id=row.mark,
                width_mm=row.width_m * 1000 if row.width_m is not None else None,
                height_mm=row.height_m * 1000 if row.height_m is not None else None,
                physical_instance_confirmed=False,
                is_exit=None,
                confidence=row.confidence,
                evidence_text=row.raw_text,
                page=1,
            )
        )
        target.schedules.append(ScheduleEntryEvidence(schedule_type="door_window_schedule", row_text=row.raw_text, page=1, confidence=row.confidence, parsed_summary=row.mark))
    for row in parsed.window_rows:
        target.schedules.append(ScheduleEntryEvidence(schedule_type="window_schedule", row_text=row.raw_text, page=1, confidence=row.confidence, parsed_summary=row.mark))
    if parsed.evidence_text:
        target.evidence.append(EvidenceValue(value=parsed.evidence_text, confidence=region.confidence, source_page=1, evidence_text=parsed.evidence_text, evidence_type=region.region_type.value, state=EvidenceState.CONFIRMED))


def _merge_schedule_detail(target: PlanExtraction, parsed: CombinedScheduleExtraction, region: SemanticRegion) -> None:
    _merge_door_schedule(
        target,
        DoorScheduleExtraction(schedule_found=parsed.schedule_found, door_rows=parsed.doors, window_rows=parsed.windows, evidence_text=parsed.evidence_text),
        region,
    )
    _merge_floor_area(
        target,
        FloorAreaExtraction(rows=parsed.floor_areas, total_area_value=parsed.total_area_value, total_area_unit=parsed.total_area_unit, total_area_m2=parsed.total_floor_area_m2 or parsed.total_area_m2, evidence_text=parsed.evidence_text),
        region,
    )
    if parsed.designed_occupants is not None:
        target.evidence.append(EvidenceValue(value=str(parsed.designed_occupants), confidence=region.confidence, source_page=1, evidence_text=parsed.evidence_text or str(parsed.designed_occupants), evidence_type="designed_occupants", state=EvidenceState.CONFIRMED))


def _merge_floor_area(target: PlanExtraction, parsed: FloorAreaExtraction, region: SemanticRegion) -> None:
    for row in parsed.rows:
        if not row.floor_name:
            continue
        area_m2 = row.normalized_area_m2 if row.normalized_area_m2 is not None else row.area_m2 if row.area_m2 is not None else _to_m2(row.area_value, row.area_unit)
        if area_m2 is None:
            continue
        target.floor_areas.append(FloorAreaEvidence(floor_name=row.floor_name, area_m2=area_m2, source_page=1, evidence_text=row.raw_text, confidence=row.confidence))
    total_m2 = parsed.total_area_m2 if parsed.total_area_m2 is not None else _to_m2(parsed.total_area_value, parsed.total_area_unit)
    if total_m2 is not None:
        target.building_info.total_floor_area_m2.value = str(total_m2)
        target.building_info.total_floor_area_m2.confidence = region.confidence
        target.building_info.total_floor_area_m2.source_page = 1
        target.building_info.total_floor_area_m2.evidence_text = parsed.evidence_text or str(total_m2)
        target.building_info.total_floor_area_m2.evidence_type = region.region_type.value
        target.building_info.total_floor_area_m2.state = EvidenceState.CONFIRMED


def _merge_height(target: PlanExtraction, parsed: HeightExtraction, region: SemanticRegion) -> None:
    for row in parsed.floor_levels:
        target.floor_levels.append(OpenAIFloorLevelEvidence(name=row.floor_name, level_m=row.level_m, page=1, confidence=row.confidence, evidence_text=row.raw_text))
    evidence = (parsed.evidence_text or "").upper()
    contextual = any(token in evidence for token in ("SECTION", "ELEVATION", "FFL", "RL", "FLOOR", "ROOF", "TERRACE", "LEVEL"))
    if contextual and parsed.building_height_m is not None:
        target.building_info.height_m.value = str(parsed.building_height_m)
        target.building_info.height_m.confidence = region.confidence
        target.building_info.height_m.source_page = 1
        target.building_info.height_m.evidence_text = parsed.evidence_text
        target.building_info.height_m.evidence_type = region.region_type.value
        target.building_info.height_m.state = EvidenceState.CONFIRMED
    if contextual and parsed.highest_habitable_floor_level_m is not None:
        target.building_info.highest_habitable_floor_level_m.value = str(parsed.highest_habitable_floor_level_m)
        target.building_info.highest_habitable_floor_level_m.confidence = region.confidence
        target.building_info.highest_habitable_floor_level_m.source_page = 1
        target.building_info.highest_habitable_floor_level_m.evidence_text = parsed.evidence_text
        target.building_info.highest_habitable_floor_level_m.evidence_type = region.region_type.value
        target.building_info.highest_habitable_floor_level_m.state = EvidenceState.CONFIRMED


def _merge_stair_escape(target: PlanExtraction, parsed: StairEscapeExtraction, region: SemanticRegion) -> None:
    if parsed.visible_staircase_count is not None:
        target.evidence.append(EvidenceValue(value=str(parsed.visible_staircase_count), confidence=region.confidence, source_page=1, evidence_text=parsed.evidence_text, evidence_type="visible_staircase_count", state=EvidenceState.EXTRACTED))
    for item in parsed.protected_stairs:
        target.stairs.append(StairEvidence(label=item.label or "Stair", page=1, confidence=item.confidence, physical_stair_confirmed=parsed.confirmed_staircase_count is not None, evidence_text=item.raw_text, approximate_region=region.label))
    for width in parsed.stair_widths:
        target.dimensions.append(DimensionEvidence(value=width.width_m, unit="m", dimension_type="stair_clear_width_m", associated_object=width.label, page=1, confidence=width.confidence, evidence_text=width.raw_text))
    for width in parsed.corridor_widths:
        target.dimensions.append(DimensionEvidence(value=width.width_m, unit="m", dimension_type="corridor_width_m", associated_object=width.label, page=1, confidence=width.confidence, evidence_text=width.raw_text))
    for label in parsed.rooms_or_occupancies:
        target.rooms.append(RoomEvidence(label=label, page=1, approximate_region=region.label, confidence=region.confidence, evidence_text=label))
    if parsed.travel_distance_m is not None and parsed.route_topology_confirmed is True:
        target.dimensions.append(DimensionEvidence(value=parsed.travel_distance_m, unit="m", dimension_type="travel_distance_m", associated_object=parsed.escape_type, page=1, confidence=region.confidence, evidence_text=parsed.evidence_text))


def _merge_fire_features(target: PlanExtraction, parsed: FireFeatureExtraction, region: SemanticRegion) -> None:
    feature_values = {
        "sprinkler": parsed.sprinkler_present,
        "wet_riser": parsed.wet_riser_present,
        "fire_lift": parsed.fire_lift_present,
        "fire_alarm": parsed.fire_alarm_present,
        "hydrant": parsed.hydrant_present,
        "fire_pump": parsed.fire_pump_present,
    }
    for feature, present in feature_values.items():
        if present is not None:
            target.fire_equipment.append(FireEquipmentEvidence(type=feature, page=1, label=feature, confidence=region.confidence, evidence_text=parsed.evidence_text, presence=EvidenceState.CONFIRMED if present else EvidenceState.UNKNOWN))
    counts = {
        "hose_reel": parsed.hose_reel_count,
        "manual_call_point": parsed.manual_call_point_count,
        "smoke_detector": parsed.smoke_detector_count,
        "heat_detector": parsed.heat_detector_count,
        "emergency_light": parsed.emergency_light_count,
        "exit_sign": parsed.exit_sign_count,
        "fire_extinguisher": parsed.fire_extinguisher_count,
    }
    for feature, count in counts.items():
        if count is not None:
            target.fire_equipment.append(FireEquipmentEvidence(type=feature, page=1, label=feature, count=count, confidence=region.confidence, evidence_text=parsed.evidence_text, presence=EvidenceState.CONFIRMED))
    if parsed.public_hydrant_distance_m is not None:
        target.dimensions.append(DimensionEvidence(value=parsed.public_hydrant_distance_m, unit="m", dimension_type="public_hydrant_distance_m", associated_object="public_hydrant", page=1, confidence=region.confidence, evidence_text=parsed.evidence_text))


def _merge_plan(target: PlanExtraction, detail: PlanExtraction) -> None:
    target.floor_levels.extend(detail.floor_levels)
    target.floor_areas.extend(detail.floor_areas)
    target.rooms.extend(detail.rooms)
    target.doors.extend(detail.doors)
    target.stairs.extend(detail.stairs)
    target.exits.extend(detail.exits)
    target.fire_equipment.extend(detail.fire_equipment)
    target.dimensions.extend(detail.dimensions)
    target.schedules.extend(detail.schedules)
    target.evidence.extend(detail.evidence)
    target.uncertainties.extend(detail.uncertainties)
