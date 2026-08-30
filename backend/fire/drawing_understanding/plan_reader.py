from dataclasses import dataclass
import hashlib
import logging
import re
from time import perf_counter
import pymupdf
from ..config import Settings
from ..pdf_utils import RenderedPage, normalize_image, render_pdf
from .analyzer import LocalDrawingAnalyzer
from .evidence.models import LocalAnalysisResult, TextEvidence
from .geometry.connectivity import build_unknown_connectivity_graph
from .geometry.travel_distance import calculate_travel_distance
from .input_inspector import InspectedUpload, inspect_upload
from .openai import OpenAIPlanReader, PlanReaderUnavailable
from .openai.fusion import page_extractions_from_openai
from .openai.provider import PLAN_READER_CACHE
from .pdf.vector_extractor import extract_pdf_vector_pages
from .segmentation.provider import get_segmentation_provider
from ..schemas import Document

logger = logging.getLogger("fireguard")

@dataclass
class PlanPage:
    filename: str
    source_type: str
    source_id: str
    page_number: int
    page_count: int
    rendered: RenderedPage
    native_text: list[TextEvidence]
    width_px: int | None = None
    height_px: int | None = None
    orientation_corrected: bool = False
    orientation_degrees: int = 0
    file_hash: str | None = None

class DrawingUnderstandingService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.local = LocalDrawingAnalyzer(settings)

    async def analyze_uploads(self, uploads: list) -> LocalAnalysisResult:
        started = perf_counter()
        inspected = [await inspect_upload(upload, self.settings) for upload in uploads]
        logger.info("[FireGuard] upload inspection completed in %.2fs", perf_counter() - started)
        mode = self.settings.effective_plan_reader
        if mode == "local":
            local_started = perf_counter()
            result = self.local.analyze_inspected_uploads(inspected)
            logger.info("[FireGuard] local drawing analysis completed in %.2fs", perf_counter() - local_started)
            _attach_plan_reader_metadata(result, provider="local", status="SUCCESS", pages_interpreted=0, diagnostics=["Local plan reader used."])
            return result

        if self.settings.fireguard_fast_mode:
            try:
                openai_started = perf_counter()
                openai_pages, diagnostics, cache_hits = self._read_with_openai(inspected)
                logger.info("[FireGuard] fast OpenAI overview/detail pass completed in %.2fs", perf_counter() - openai_started)
            except PlanReaderUnavailable as exc:
                diagnostic = f"OpenAI plan reader unavailable; manual review required. {exc}"
                result = LocalAnalysisResult(
                    pages=[],
                    documents=self._documents_from_inspected(inspected),
                    page_analysis=[],
                    evidence_warnings=[diagnostic],
                    geometry_analysis={
                        "status": "UNKNOWN",
                        "segmentation": get_segmentation_provider().analyze().model_dump(),
                        "travel_distance": calculate_travel_distance(),
                        "warnings": [diagnostic],
                    },
                    spatial_graph=build_unknown_connectivity_graph([], [], []),
                )
                _attach_plan_reader_metadata(
                    result,
                    provider="openai_fast",
                    status="FAILED",
                    openai_status=exc.error_type,
                    pages_interpreted=0,
                    diagnostics=[diagnostic],
                    error_details=exc.safe_dict(),
                )
                return result

            graph = build_unknown_connectivity_graph(
                [room for page in openai_pages for room in page.rooms],
                [door for page in openai_pages for door in page.doors],
                [stair for page in openai_pages for stair in page.stairs],
            )
            result = LocalAnalysisResult(
                pages=openai_pages,
                documents=self._documents_from_inspected(inspected),
                page_analysis=[],
                evidence_warnings=diagnostics,
                geometry_analysis={
                    "status": "PARTIAL",
                    "segmentation": get_segmentation_provider().analyze().model_dump(),
                    "travel_distance": calculate_travel_distance(),
                    "warnings": graph.get("warnings", []),
                },
                spatial_graph=graph,
            )
            _attach_plan_reader_metadata(
                result,
                provider="openai_fast",
                status="SUCCESS",
                openai_status="SUCCESS",
                pages_interpreted=len(openai_pages),
                diagnostics=diagnostics,
                cache_hits=cache_hits,
            )
            return result

        local_started = perf_counter()
        local_result = self.local.analyze_inspected_uploads(inspected)
        logger.info("[FireGuard] local fallback evidence pass completed in %.2fs", perf_counter() - local_started)
        try:
            openai_started = perf_counter()
            openai_pages, diagnostics, cache_hits = self._read_with_openai(inspected)
            logger.info("[FireGuard] OpenAI drawing understanding completed in %.2fs", perf_counter() - openai_started)
        except PlanReaderUnavailable as exc:
            diagnostic = f"OpenAI plan reader unavailable; local extraction fallback used. {exc}"
            local_result.evidence_warnings.append(diagnostic)
            error_details = exc.safe_dict()
            _attach_plan_reader_metadata(
                local_result,
                provider="local_fallback",
                status="FALLBACK",
                openai_status=exc.error_type,
                pages_interpreted=0,
                diagnostics=[diagnostic],
                error_details=error_details,
            )
            return local_result

        fused_pages = [*local_result.pages, *openai_pages]
        graph = build_unknown_connectivity_graph(
            [room for page in fused_pages for room in page.rooms],
            [door for page in fused_pages for door in page.doors],
            [stair for page in fused_pages for stair in page.stairs],
        )
        local_result.pages = fused_pages
        local_result.spatial_graph = graph
        local_result.geometry_analysis = {
            **(local_result.geometry_analysis or {}),
            "status": "PARTIAL",
            "segmentation": get_segmentation_provider().analyze().model_dump(),
            "travel_distance": calculate_travel_distance(),
            "warnings": graph.get("warnings", []),
        }
        local_result.evidence_warnings.extend(diagnostics)
        _attach_plan_reader_metadata(
            local_result,
            provider="openai" if mode == "openai" else "auto",
            status="SUCCESS",
            openai_status="SUCCESS",
            pages_interpreted=len(openai_pages),
            diagnostics=diagnostics,
            cache_hits=cache_hits,
        )
        return local_result

    def _read_with_openai(self, inspected: list[InspectedUpload]) -> tuple[list, list[str], int]:
        reader = OpenAIPlanReader(self.settings)
        if self.settings.fireguard_fast_mode:
            cached = self._read_cached_openai_pages(inspected, reader)
            if cached is not None:
                return cached
        prepare_started = perf_counter()
        prepared = self._prepare_openai_pages(inspected)
        logger.info("[FireGuard] OpenAI page preparation completed in %.2fs", perf_counter() - prepare_started)
        if not prepared:
            raise PlanReaderUnavailable("No supported pages were available for OpenAI plan reading.")
        pages = []
        diagnostics: list[str] = []
        cache_hits = 0
        for prepared_page in prepared[: self.settings.openai_plan_max_pages]:
            extraction, warnings, cached = reader.extract_page(
                filename=prepared_page.filename,
                page=prepared_page.rendered,
                page_count=prepared_page.page_count,
                native_text=prepared_page.native_text,
                file_hash=prepared_page.file_hash,
            )
            cache_hits += 1 if cached else 0
            diagnostics.extend(f"{prepared_page.source_id}: {warning}" for warning in warnings)
            merge_started = perf_counter()
            pages.extend(page_extractions_from_openai(prepared_page.filename, extraction))
            logger.info("[FireGuard] OpenAI tile/result merge completed in %.2fs", perf_counter() - merge_started)
        if len(prepared) > self.settings.openai_plan_max_pages:
            diagnostics.append(f"OpenAI plan reader limited to {self.settings.openai_plan_max_pages} page(s); remaining pages use local extraction.")
        return pages, diagnostics, cache_hits

    def _read_cached_openai_pages(self, inspected: list[InspectedUpload], reader: OpenAIPlanReader) -> tuple[list, list[str], int] | None:
        pages = []
        diagnostics: list[str] = []
        cache_hits = 0
        for file_index, upload in enumerate(inspected, start=1):
            file_hash = hashlib.sha256(upload.data).hexdigest()
            page_count = self._quick_page_count(upload)
            cached_for_upload = []
            for page_number in range(1, min(page_count, self.settings.openai_plan_max_pages) + 1):
                key = reader.cache_key(upload.data, page_number, upload.filename, file_hash)
                extraction = PLAN_READER_CACHE.get(key)
                if extraction is None:
                    return None
                cached_for_upload.append(extraction)
            for extraction in cached_for_upload:
                pages.extend(page_extractions_from_openai(upload.filename, extraction))
                cache_hits += 1
                diagnostics.append(f"file_{file_index}: OpenAI fast mode cache hit.")
            if page_count > self.settings.openai_plan_max_pages:
                diagnostics.append(f"OpenAI plan reader limited to {self.settings.openai_plan_max_pages} page(s); remaining pages require user review.")
        return pages, diagnostics, cache_hits

    def _quick_page_count(self, upload: InspectedUpload) -> int:
        if upload.suffix != ".pdf":
            return 1
        try:
            document = pymupdf.open(stream=upload.data, filetype="pdf")
            try:
                return max(1, document.page_count)
            finally:
                document.close()
        except Exception:
            return 1

    def _documents_from_inspected(self, inspected: list[InspectedUpload]) -> list[Document]:
        documents: list[Document] = []
        for upload in inspected:
            page_count = self._quick_page_count(upload)
            documents.append(Document(filename=upload.filename, media_type=upload.media_type, page_count=page_count))
        return documents

    def _prepare_openai_pages(self, inspected: list[InspectedUpload]) -> list[PlanPage]:
        pages: list[PlanPage] = []
        for file_index, upload in enumerate(inspected, start=1):
            file_hash = hashlib.sha256(upload.data).hexdigest()
            if upload.suffix == ".pdf":
                pdf_started = perf_counter()
                vector_pages, _, _ = extract_pdf_vector_pages(upload.data, upload.filename)
                logger.info("[FireGuard] PDF load/text inspection completed in %.2fs", perf_counter() - pdf_started)
                render_started = perf_counter()
                rendered = {page.page_number: page for page in render_pdf(upload.data, self.settings.plan_render_dpi)}
                logger.info("[FireGuard] PDF render completed in %.2fs", perf_counter() - render_started)
                for vector_page in vector_pages:
                    if vector_page.page_number in rendered:
                        normalize_started = perf_counter()
                        image = normalize_image(rendered[vector_page.page_number].png_bytes)
                        logger.info("[FireGuard] rendered page normalization completed in %.2fs", perf_counter() - normalize_started)
                        pages.append(PlanPage(
                            filename=upload.filename,
                            source_type="pdf",
                            source_id=f"file_{file_index}_page_{vector_page.page_number}",
                            page_number=vector_page.page_number,
                            page_count=len(vector_pages),
                            rendered=RenderedPage(vector_page.page_number, image.png_bytes),
                            native_text=vector_page.text_items,
                            width_px=image.width,
                            height_px=image.height,
                            file_hash=file_hash,
                        ))
            else:
                image = normalize_image(upload.data)
                pages.append(PlanPage(
                    filename=upload.filename,
                    source_type="image",
                    source_id=f"file_{file_index}_page_1",
                    page_number=1,
                    page_count=1,
                    rendered=RenderedPage(1, image.png_bytes),
                    native_text=[],
                    width_px=image.width,
                    height_px=image.height,
                    orientation_corrected=image.orientation_corrected,
                    orientation_degrees=image.orientation_degrees,
                    file_hash=file_hash,
                ))
        return pages

def _attach_plan_reader_metadata(
    result: LocalAnalysisResult,
    *,
    provider: str,
    status: str,
    pages_interpreted: int,
    diagnostics: list[str],
    openai_status: str | None = None,
    cache_hits: int = 0,
    error_details: dict | None = None,
) -> None:
    tiles_analyzed = sum(int(match.group(1)) for item in diagnostics for match in [re.search(r"used (\d+) overlapping tile", item)] if match)
    regions_analyzed = sum(int(match.group(1)) for item in diagnostics for match in [re.search(r"used (\d+) semantic region", item)] if match)
    region_counts = next((match for item in diagnostics for match in [re.search(r"semantic regions requested (\d+) successful (\d+) failed (\d+)", item)] if match), None)
    images_sent_match = next((match for item in diagnostics for match in [re.search(r"one multimodal request with (\d+) prepared image", item)] if match), None)
    regions_requested = int(region_counts.group(1)) if region_counts else regions_analyzed
    regions_successful = int(region_counts.group(2)) if region_counts else regions_analyzed
    regions_failed = int(region_counts.group(3)) if region_counts else 0
    supplementary_ocr_used = any(page.ocr_status == "SUCCESS" for page in result.page_analysis)
    effective_status = "PARTIAL_SUCCESS" if status == "SUCCESS" and regions_failed else status
    effective_openai_status = "PARTIAL_SUCCESS" if openai_status == "SUCCESS" and regions_failed else openai_status or ("NOT_REQUIRED" if provider == "local" else effective_status)
    metadata = {
        "provider": provider,
        "status": effective_status,
        "openai_status": effective_openai_status,
        "pages_interpreted": pages_interpreted,
        "overview_status": "SUCCESS" if pages_interpreted else ("NOT_RUN" if provider == "local" else effective_openai_status),
        "overview_pages": pages_interpreted if openai_status == "SUCCESS" else 0,
        "tiles_analyzed": tiles_analyzed,
        "semantic_regions_analyzed": regions_analyzed,
        "semantic_regions_requested": regions_requested,
        "semantic_regions_successful": regions_successful,
        "semantic_regions_failed": regions_failed,
        "primary_reader": "openai" if provider in {"openai", "auto", "openai_fast"} and status == "SUCCESS" else provider,
        "primary_status": effective_openai_status,
        "supplementary_ocr_used": supplementary_ocr_used,
        "fallback_activated": status == "FALLBACK",
        "fallback_used": status == "FALLBACK",
        "native_pdf_text": "available" if any(page.native_text_items for page in result.page_analysis) else "not_available",
        "local_ocr_fallback": supplementary_ocr_used,
        "diagnostics": diagnostics[:8],
        "cache_hits": cache_hits,
        "fast_mode": provider == "openai_fast",
        "max_openai_calls": 1 if provider == "openai_fast" else None,
        "images_sent": int(images_sent_match.group(1)) if images_sent_match else None,
        "error": error_details,
    }
    result.geometry_analysis = {**(result.geometry_analysis or {}), "plan_reader": metadata}
    for page in result.page_analysis:
        page.warnings.extend(diagnostics[:2])
