import re
import logging
from dataclasses import dataclass
from ..config import Settings
from ..pdf_utils import DocumentError, RenderedPage, normalize_image, render_pdf
from ..schemas import BuildingInfo, Document, FireEquipment, GenericItem, PageClassification, PageExtraction
from .evidence.models import LocalAnalysisResult, PageAnalysis, PageMode, TextEvidence
from .evidence.validator import validate_dimensions
from .geometry.connectivity import build_unknown_connectivity_graph
from .geometry.travel_distance import calculate_travel_distance
from .input_inspector import InspectedUpload, inspect_upload
from .ocr.dimension_parser import parse_area_m2, parse_length_m
from .ocr.ocr_engine import OCREngine, OCRResult
from .ocr.table_extractor import extract_door_schedule
from .ocr.text_normalizer import lines_from_text_items, normalize_text
from .pdf.vector_extractor import extract_pdf_vector_pages
from .regions import detect_sheet_regions, floor_names_from_regions
from .segmentation.provider import get_segmentation_provider

logger=logging.getLogger("fireguard")

FLOOR_WORDS = ("GROUND", "BASEMENT", "MEZZANINE", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH", "ROOF")
SPECIAL_RISK = ("GENERATOR", "TRANSFORMER", "BOILER", "FUEL", "ELECTRICAL ROOM", "SWITCH ROOM")
FIRE_EQUIPMENT = {
    "HOSE REEL": "hose_reel",
    "WET RISER": "wet_riser",
    "SPRINKLER": "sprinkler",
    "DETECTOR": "detector",
    "FIRE EXTINGUISHER": "portable_fire_extinguisher",
    "MANUAL CALL": "manual_call_point",
    "FIRE ALARM": "alarm_system",
    "EXIT SIGN": "exit_signage",
    "EMERGENCY LIGHT": "escape_route_lighting",
}
SYSTEM_LABELS = {
    "FIRE ALARM": "alarm_system",
    "SPRINKLER": "sprinkler_system",
    "HYDRANT": "hydrant_system",
    "WET RISER": "hydrant_system",
    "FIRE PUMP": "fire_pump_system",
    "EMERGENCY LIGHT": "escape_route_lighting",
    "EXIT SIGN": "exit_signage",
    "FIRE LIFT": "fire_lift_system",
}
GENERIC_TITLE_LABELS = {
    "PLAN",
    "FLOOR PLAN",
    "GROUND FLOOR PLAN",
    "FIRST FLOOR PLAN",
    "SECOND FLOOR PLAN",
    "THIRD FLOOR PLAN",
    "FOURTH FLOOR PLAN",
    "FIFTH FLOOR PLAN",
    "FIRE PLAN",
    "FIRE SAFETY PLAN",
    "ARCHITECTURAL PLAN",
    "DRAWING",
    "PROPOSED PLAN",
    "SITE PLAN",
    "DETAIL",
    "SECTION",
    "ELEVATION",
    "SCHEDULE",
    "TITLE",
    "SHEET",
}
BUILDING_USE_LABELS = (
    "BUILDING USE",
    "OCCUPANCY",
    "PROPOSED USE",
    "EXISTING USE",
    "TYPE OF BUILDING",
    "BUILDING TYPE",
    "DESCRIPTION OF DEVELOPMENT",
    "NATURE OF DEVELOPMENT",
)
BUILDING_USE_KEYWORDS = (
    "APARTMENT",
    "FLAT",
    "MAISONETTE",
    "DWELLING HOUSE",
    "TERRACE HOUSE",
    "RESIDENTIAL",
    "OFFICE",
    "ADMINISTRATION",
    "BANK",
    "SHOP",
    "RETAIL",
    "COMMERCIAL",
    "HOTEL",
    "HOSTEL",
    "BOARDING HOUSE",
    "SCHOOL",
    "HOSPITAL",
    "NURSING HOME",
    "WAREHOUSE",
    "GODOWN",
    "STORAGE",
    "FACTORY",
    "INDUSTRIAL",
    "WORKSHOP",
    "ASSEMBLY",
    "AUDITORIUM",
    "THEATRE",
    "CAR PARK",
    "PARKING GARAGE",
)

@dataclass
class PreparedPage:
    page_number: int
    png_bytes: bytes | None
    text_items: list[TextEvidence]
    analysis: PageAnalysis

def _best_title(lines: list[str]) -> str | None:
    for line in lines:
        match = re.search(r"\b(PROJECT TITLE|PROJECT NAME|PROJECT|DEVELOPMENT)\b\s*[:\-]?\s*(?P<value>[A-Z0-9 /&.,()-]{6,100})", line)
        if match:
            value = _clean_title(match.group("value"))
            if value:
                return value
    for line in lines:
        value = _clean_title(line)
        if value and any(word in line for word in ("PROPOSED", "BUILDING", "HOSTEL", "HOTEL", "APARTMENT", "OFFICE", "SCHOOL", "HOSPITAL")):
            return value
    return None

def _clean_title(value: str) -> str | None:
    cleaned = re.sub(r"\s+", " ", value or "").strip(" :-,.;")
    cleaned = re.split(r"\b(?:DRAWING TITLE|DRAWING|SHEET|SCALE|DATE|CLIENT|OWNER)\b", cleaned, maxsplit=1)[0].strip(" :-,.;")
    normalized = cleaned.upper()
    if not normalized or normalized in GENERIC_TITLE_LABELS:
        return None
    if any(normalized.startswith(f"{label} ") for label in GENERIC_TITLE_LABELS):
        return None
    if normalized in BUILDING_USE_KEYWORDS:
        return None
    if normalized.endswith(" PLAN") and normalized.replace(" PLAN","") in {"GROUND FLOOR","FIRST FLOOR","SECOND FLOOR","THIRD FLOOR","SITE","FLOOR"}:
        return None
    if len(normalized) < 6:
        return None
    return cleaned.title()

def _extract_floor_names(lines: list[str]) -> list[str]:
    names: list[str] = []
    for line in lines:
        if any(word in line for word in FLOOR_WORDS) and ("FLOOR" in line or "LEVEL" in line or line in FLOOR_WORDS):
            if line not in names and len(line) < 80:
                names.append(line.title())
    return names

def _extract_storey_count(lines: list[str], floor_names: list[str], region_floors: list[dict] | None = None) -> int | None:
    joined = " ".join(lines)
    explicit = re.search(r"\b(NO\.?\s*OF\s*FLOORS?|NUMBER\s+OF\s+STOREYS?|STOREYS?|FLOORS?)\s*[:\-]?\s*(?P<count>\d+)\b", joined)
    if explicit:
        return int(explicit.group("count"))
    g_plus = re.search(r"\bG\s*\+\s*(?P<upper>\d+)\b", joined)
    if g_plus:
        return int(g_plus.group("upper")) + 1
    explicit_after = re.search(r"\b(?P<count>\d+)\s*(STOREY|STOREYS|STORIED)\b", joined)
    if explicit_after:
        return int(explicit_after.group("count"))
    if region_floors and len(region_floors) > 1:
        return len(region_floors)
    named = {name.upper().replace(" PLAN","") for name in floor_names}
    if len(named) > 1 and any("GROUND" in name for name in named):
        return len(named)
    return None

def _extract_building_use(lines: list[str]) -> str | None:
    joined = " ".join(lines)
    for line in lines:
        for label in BUILDING_USE_LABELS:
            match = re.search(rf"\b{re.escape(label)}\b\s*[:\-]?\s*(?P<value>[A-Z0-9 /&.,()-]{{3,80}})", line)
            if match:
                value = _clean_building_use_value(match.group("value"))
                if value:
                    return value
    for keyword in BUILDING_USE_KEYWORDS:
        if re.search(rf"\b{re.escape(keyword)}S?\b", joined):
            return keyword.title()
    return None

def _clean_building_use_value(value: str) -> str | None:
    cleaned = re.sub(r"\s+", " ", value or "").strip(" :-,.;")
    cleaned = re.split(r"\b(?:DRAWING|SHEET|SCALE|DATE|CLIENT|OWNER|PROJECT|PLAN)\b", cleaned, maxsplit=1)[0].strip(" :-,.;")
    return cleaned.title() if len(cleaned) >= 3 else None

def _extract_height_with_evidence(lines: list[str]) -> tuple[float | None, str | None]:
    contextual_patterns = (
        r"\b(BUILDING HEIGHT|TOTAL HEIGHT|OVERALL HEIGHT|HEIGHT OF BUILDING)\b\s*[:\-]?\s*(?P<value>\d+(?:\.\d+)?\s*(?:M|MM|CM|FT|'))",
        r"\b(ROOF|PARAPET|HIGHEST HABITABLE|TOPMOST FLOOR|SECTION|ELEVATION)\b[ A-Z0-9+./:-]{0,80}\b(?P<value>\d+(?:\.\d+)?\s*M)\b",
    )
    for line in lines:
        for pattern in contextual_patterns:
            match = re.search(pattern, line)
            if match:
                return parse_length_m(match.group("value")), line
    return None, None

def _extract_height(lines: list[str]) -> float | None:
    return _extract_height_with_evidence(lines)[0]

def _extract_highest_habitable_level_with_evidence(lines: list[str]) -> tuple[float | None, str | None]:
    for line in lines:
        match = re.search(r"\b(HIGHEST HABITABLE|FFL|FLOOR LEVEL|FINISHED FLOOR LEVEL|RL)\b[ A-Z0-9+./:-]{0,80}\+?\s*(?P<value>\d+(?:\.\d+)?\s*M?)\b", line)
        if match:
            return parse_length_m(match.group("value")), line
    return None, None

def _extract_highest_habitable_level(lines: list[str]) -> float | None:
    return _extract_highest_habitable_level_with_evidence(lines)[0]

def _extract_areas(lines: list[str]) -> tuple[dict[str, float], float | None]:
    floor_areas: dict[str, float] = {}
    total = None
    for line in lines:
        area = parse_area_m2(line)
        if area is None:
            continue
        if "TOTAL" in line:
            total = area
            continue
        for floor_word in FLOOR_WORDS:
            if floor_word in line:
                floor_areas[line.title()] = area
                break
    return floor_areas, total

def _classify_page(lines: list[str]) -> PageClassification:
    joined = " ".join(lines)
    has_arch = any(word in joined for word in ("ARCHITECTURAL", "FLOOR PLAN", "ROOM", "DOOR SCHEDULE", "STAIR"))
    has_fire = any(word in joined for word in ("FIRE", "HOSE REEL", "SPRINKLER", "EXIT SIGN", "HYDRANT"))
    if has_arch and has_fire:
        return PageClassification.COMBINED
    if has_fire:
        return PageClassification.FIRE
    if has_arch or lines:
        return PageClassification.ARCHITECTURAL
    return PageClassification.UNKNOWN

def _generic_items(lines: list[str], source_file: str, page: int, keywords: tuple[str, ...], kind: str) -> list[GenericItem]:
    items: list[GenericItem] = []
    for line in lines:
        if any(keyword in line for keyword in keywords):
            items.append(GenericItem(label=line.title(), source_file=source_file, source_page=page, evidence=line, confidence=0.65, data={"kind": kind}))
    return items

def _fire_equipment(lines: list[str], source_file: str, page: int) -> list[FireEquipment]:
    items: list[FireEquipment] = []
    for line in lines:
        for label, equipment_type in FIRE_EQUIPMENT.items():
            if label in line:
                items.append(FireEquipment(type=equipment_type, source_file=source_file, source_page=page, evidence=line, confidence=0.7))
    return items

def _systems(lines: list[str]) -> dict[str, bool | None]:
    joined = " ".join(lines)
    result: dict[str, bool | None] = {}
    for label, field in SYSTEM_LABELS.items():
        if label in joined:
            result[field] = True
    return result

def _merge_text_evidence(native: list[TextEvidence], ocr: list[TextEvidence]) -> tuple[list[TextEvidence], list[str]]:
    merged: list[TextEvidence] = []
    warnings: list[str] = []
    seen: dict[str, TextEvidence] = {}
    for item in sorted([*native, *ocr], key=lambda value: 0 if value.method == "pdf_native_text" else 1):
        key = item.normalized_text
        if not key:
            continue
        existing = seen.get(key)
        if existing is None:
            seen[key] = item
            merged.append(item)
        elif item.confidence > existing.confidence and existing.method != "pdf_native_text":
            merged[merged.index(existing)] = item
            seen[key] = item
    native_dimensions = _dimension_signatures(native)
    ocr_dimensions = _dimension_signatures(ocr)
    common_marks = set(native_dimensions) & set(ocr_dimensions)
    if any(native_dimensions[mark] != ocr_dimensions[mark] for mark in common_marks):
        warnings.append("Native PDF and OCR dimension-like text disagree; schedule dimensions need manual review.")
    return merged, warnings

def _dimension_signatures(items: list[TextEvidence]) -> dict[str, str]:
    signatures: dict[str, str] = {}
    for item in items:
        if " X " not in item.normalized_text:
            continue
        mark = re.search(r"\bD\s*[-:]?\s*(\d+[A-Z]?|[A-Z]\d+)\b", item.normalized_text)
        key = f"D{mark.group(1)}" if mark else item.normalized_text
        signatures[key.replace("DD","D")] = item.normalized_text
    return signatures

def _apply_ocr_analysis(analysis: PageAnalysis, ocr: OCRResult) -> None:
    analysis.ocr_provider = ocr.provider
    analysis.ocr_status = ocr.status
    analysis.ocr_duration_ms = ocr.duration_ms
    analysis.ocr_reason = ocr.reason
    analysis.ocr_text_items = len(ocr.items) if ocr.status == "SUCCESS" else None
    if ocr.orientation_detected_deg or ocr.orientation_corrected:
        analysis.orientation_detected_deg = ocr.orientation_detected_deg
        analysis.orientation_confidence = ocr.orientation_confidence
        analysis.orientation_corrected = ocr.orientation_corrected
        analysis.orientation_transform = ocr.orientation_transform or {}
    analysis.warnings.extend(ocr.warnings)

def _page_from_text_items(source_file: str, page: int, text_items: list[TextEvidence], analysis: PageAnalysis) -> PageExtraction:
    lines = lines_from_text_items(text_items)
    regions=detect_sheet_regions(text_items)
    analysis.sheet_regions=regions
    region_floors=floor_names_from_regions(regions)
    classification = _classify_page(lines)
    analysis.plan_classification = classification.value
    analysis.architectural_plan_status = "CONFIRMED_ARCHITECTURAL" if classification in (PageClassification.ARCHITECTURAL, PageClassification.COMBINED) else "UNKNOWN"
    analysis.fire_plan_status = "CONFIRMED_FIRE_PLAN" if classification in (PageClassification.FIRE, PageClassification.COMBINED) else "UNKNOWN"
    floor_names = _extract_floor_names(lines)
    floor_areas, total_area = _extract_areas(lines)
    project_title=_best_title(lines)
    storey_count=_extract_storey_count(lines, floor_names, region_floors)
    logger.debug(
        "fireguard_trace function=_page_from_text_items source_file=%s field=project_name extracted_value=%r evidence=%r status=%s",
        source_file,
        project_title,
        lines[:8],
        "DETERMINED" if project_title is not None else "UNKNOWN",
    )
    logger.debug(
        "fireguard_trace function=_page_from_text_items source_file=%s field=storey_count extracted_value=%r evidence=%r status=%s",
        source_file,
        storey_count,
        {"floor_names":floor_names,"sheet_floor_regions":region_floors},
        "DETERMINED" if storey_count is not None else "UNKNOWN",
    )
    building_info = BuildingInfo(
        project_title=project_title,
        building_use_text=_extract_building_use(lines),
        floor_names=floor_names,
        storey_count=storey_count,
        floor_areas_m2=floor_areas,
        total_building_area_m2=total_area,
        max_floor_area_per_storey_m2=max(floor_areas.values()) if floor_areas else None,
    )
    height, height_evidence = _extract_height_with_evidence(lines)
    highest_level, highest_level_evidence = _extract_highest_habitable_level_with_evidence(lines)
    building_info.building_height_m = height
    building_info.highest_habitable_floor_level_m = highest_level
    if height_evidence:
        building_info.critical_evidence["building_height_m"] = height_evidence
    if highest_level_evidence:
        building_info.critical_evidence["highest_habitable_floor_level_m"] = highest_level_evidence
    rooms = _generic_items(lines, source_file, page, (" ROOM", "BED ROOM", "BEDROOM", "KITCHEN", "PANTRY", "DINING", "LIVING", "LOUNGE", "TOILET", " WC", "BATH", "OFFICE", "STORE", "LOBBY", "CORRIDOR", "RECEPTION", "WARD", "CLASSROOM"), "room_label")
    stairs = _generic_items(lines, source_file, page, ("STAIR", "STAIRCASE", "UP/DN", "UP DN"), "stair_label")
    escape_routes = _generic_items(lines, source_file, page, ("EXIT", "ESCAPE", "EGRESS"), "escape_route_label")
    special_risk = _generic_items(lines, source_file, page, SPECIAL_RISK, "special_risk_label")
    doors = extract_door_schedule(lines, source_file, page)
    warnings = validate_dimensions(doors)
    if not lines:
        warnings.append("No readable text evidence was extracted from this page.")
    return PageExtraction(
        source_file=source_file,
        source_page=page,
        classification=classification,
        building_info=building_info,
        rooms=rooms,
        doors=doors,
        stairs=stairs,
        escape_routes=escape_routes,
        fire_equipment=_fire_equipment(lines, source_file, page),
        special_risk_rooms=special_risk,
        warnings=warnings,
        systems=_systems(lines),
    )

class LocalDrawingAnalyzer:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.ocr = OCREngine(settings)
        self.segmentation = get_segmentation_provider()

    async def analyze_uploads(self, uploads: list) -> LocalAnalysisResult:
        inspected = [await inspect_upload(upload, self.settings) for upload in uploads]
        return self.analyze_inspected_uploads(inspected)

    def analyze_inspected_uploads(self, inspected: list[InspectedUpload]) -> LocalAnalysisResult:
        pages: list[PageExtraction] = []
        documents: list[Document] = []
        page_analysis: list[PageAnalysis] = []
        warnings: list[str] = []
        for upload in inspected:
            extracted_pages, document, analyses, page_warnings = self._analyze_upload(upload)
            pages.extend(extracted_pages)
            documents.append(document)
            page_analysis.extend(analyses)
            warnings.extend(page_warnings)
        graph = build_unknown_connectivity_graph(
            [room for page in pages for room in page.rooms],
            [door for page in pages for door in page.doors],
            [stair for page in pages for stair in page.stairs],
        )
        geometry = {
            "status": "PARTIAL",
            "segmentation": self.segmentation.analyze().model_dump(),
            "travel_distance": calculate_travel_distance(),
            "warnings": graph.get("warnings", []),
        }
        return LocalAnalysisResult(pages=pages, documents=documents, page_analysis=page_analysis, evidence_warnings=warnings, geometry_analysis=geometry, spatial_graph=graph)

    def _analyze_upload(self, upload: InspectedUpload) -> tuple[list[PageExtraction], Document, list[PageAnalysis], list[str]]:
        if upload.suffix == ".pdf":
            return self._analyze_pdf(upload)
        return self._analyze_image(upload)

    def _analyze_pdf(self, upload: InspectedUpload) -> tuple[list[PageExtraction], Document, list[PageAnalysis], list[str]]:
        try:
            vector_pages, analyses, warnings = extract_pdf_vector_pages(upload.data, upload.filename)
        except ValueError as exc:
            raise DocumentError(f"{upload.filename}: {exc}") from exc
        rendered_by_page: dict[int, RenderedPage] = {}
        needs_raster = [page for page in vector_pages if page.mode == PageMode.RASTER or not page.text_items]
        if needs_raster:
            rendered_by_page = {page.page_number: page for page in render_pdf(upload.data, self.settings.pdf_dpi)}
        extracted: list[PageExtraction] = []
        for vector_page in vector_pages:
            text_items = list(vector_page.text_items)
            analysis = analyses[vector_page.page_number - 1]
            if vector_page.page_number in rendered_by_page:
                ocr = self.ocr.extract(rendered_by_page[vector_page.page_number].png_bytes, upload.filename, vector_page.page_number)
                _apply_ocr_analysis(analysis, ocr)
                text_items, merge_warnings = _merge_text_evidence(text_items, ocr.items)
                analysis.warnings.extend(merge_warnings)
                warnings.extend(f"{upload.filename}:p{vector_page.page_number}: {warning}" for warning in merge_warnings)
                warnings.extend(f"{upload.filename}:p{vector_page.page_number}: {warning}" for warning in ocr.warnings)
            extracted.append(_page_from_text_items(upload.filename, vector_page.page_number, text_items, analysis))
        return extracted, Document(filename=upload.filename, media_type=upload.media_type, page_count=len(vector_pages)), analyses, warnings

    def _analyze_image(self, upload: InspectedUpload) -> tuple[list[PageExtraction], Document, list[PageAnalysis], list[str]]:
        try:
            normalized = normalize_image(upload.data)
        except DocumentError:
            raise
        except Exception as exc:
            raise DocumentError(f"{upload.filename}: Image is corrupt or unsupported") from exc
        analysis = PageAnalysis(
            source_file=upload.filename,
            page=1,
            mode=PageMode.RASTER,
            width=normalized.width,
            height=normalized.height,
            raster_images=1,
            orientation_detected_deg=normalized.orientation_degrees,
            orientation_corrected=normalized.orientation_corrected,
            orientation_transform={"source": "image_exif"} if normalized.orientation_corrected else {},
        )
        ocr = self.ocr.extract(normalized.png_bytes, upload.filename, 1)
        _apply_ocr_analysis(analysis, ocr)
        page = _page_from_text_items(upload.filename, 1, ocr.items, analysis)
        warnings = [f"{upload.filename}:p1: {warning}" for warning in ocr.warnings]
        return [page], Document(filename=upload.filename, media_type=upload.media_type, page_count=1), [analysis], warnings
