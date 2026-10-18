import base64
import hashlib
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from io import BytesIO
from PIL import Image
from time import perf_counter
from pydantic import ValidationError
from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAIError
from ...config import Settings
from ..evidence.models import TextEvidence
from ...openai_diagnostics import build_openai_config, classify_openai_exception, make_openai_client, safe_openai_log_payload
from ...pdf_utils import RenderedPage
from .prompts import PLAN_READER_SYSTEM_PROMPT, page_prompt
from .schemas import DoorEvidence, EvidenceState, EvidenceValue, FastPlanExtraction, FireEquipmentEvidence, FloorAreaEvidence, OpenAIFloorLevelEvidence, PageEvidence, PlanExtraction, PlanOverviewExtraction, RegionFailureExtraction, RoomEvidence, ScheduleEntryEvidence, StairEvidence
from .validator import validate_plan_extraction

PLAN_READER_CACHE: dict[str, PlanExtraction] = {}
REGION_READER_CACHE: dict[str, object] = {}
logger = logging.getLogger("fireguard.openai")

@dataclass
class PreparedRequestImage:
    data: bytes
    media_type: str
    original_width: int
    original_height: int
    final_width: int
    final_height: int
    original_bytes: int
    final_bytes: int

class PlanReaderUnavailable(RuntimeError):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        retryable: bool = False,
        error_type: str = "PROVIDER_ERROR",
        stage: str = "UNKNOWN",
        code: str | None = None,
        provider_error_type: str | None = None,
        request_id: str | None = None,
        diagnostic: dict | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.retryable = retryable
        self.error_type = error_type
        self.stage = stage
        self.code = code
        self.provider_error_type = provider_error_type
        self.request_id = request_id
        self.diagnostic = diagnostic or {}

    def safe_dict(self) -> dict:
        return {
            "error_type": self.error_type,
            "stage": self.stage,
            "status_code": self.status_code,
            "code": self.code,
            "provider_error_type": self.provider_error_type,
            "request_id": self.request_id,
            "retryable": self.retryable,
            "message": str(self),
            **self.diagnostic,
        }

class StageExtractionError(RuntimeError):
    def __init__(self, message: str, diagnostic: dict):
        super().__init__(message)
        self.diagnostic = diagnostic

def _image_data_url(image: PreparedRequestImage) -> str:
    return f"data:{image.media_type};base64," + base64.b64encode(image.data).decode("ascii")

def _native_lines(items: list[TextEvidence]) -> list[str]:
    return [item.raw_evidence for item in items if item.raw_evidence][:120]

class OpenAIPlanReader:
    def __init__(self, settings: Settings):
        if not settings.openai_api_key:
            raise PlanReaderUnavailable("OpenAI plan reader is not configured.", error_type="MISSING_API_KEY", stage="CONFIG")
        self.settings = settings
        self.config = build_openai_config(settings)
        self.client = make_openai_client(settings)
        self.model = self.config.model
        logger.info(
            "OpenAI plan reader initialized: provider=openai model=%s key_fingerprint=%s base_url_host=%s plan_reader=%s",
            self.config.model,
            self.config.key_fingerprint,
            self.config.base_url_host,
            self.config.plan_reader,
        )

    def cache_key(self, data: bytes, page: int, filename: str, file_hash: str | None = None) -> str:
        digest = hashlib.sha256()
        digest.update((file_hash or hashlib.sha256(data).hexdigest()).encode())
        digest.update(filename.encode())
        digest.update(self.settings.plan_pipeline_version.encode())
        digest.update(self.model.encode())
        digest.update(str(self.settings.plan_extraction_schema_version).encode())
        digest.update(str(page).encode())
        return digest.hexdigest()

    def region_cache_key(self, page_key: str, region_type: str, bbox: dict) -> str:
        digest = hashlib.sha256()
        digest.update(page_key.encode())
        digest.update(region_type.encode())
        digest.update(str(sorted(bbox.items())).encode())
        return digest.hexdigest()

    def extract_page(
        self,
        *,
        filename: str,
        page: RenderedPage,
        page_count: int,
        native_text: list[TextEvidence],
        file_hash: str | None = None,
    ) -> tuple[PlanExtraction, list[str], bool]:
        key = self.cache_key(page.png_bytes, page.page_number, filename, file_hash)
        cached = PLAN_READER_CACHE.get(key)
        if cached is not None:
            return cached, [], True

        page_started = perf_counter()
        source_image = Image.open(BytesIO(page.png_bytes))
        if self.settings.fireguard_fast_mode:
            parsed, warnings = self._extract_fast_page(
                filename=filename,
                page=page,
                page_count=page_count,
                native_text=native_text,
                source_image=source_image,
                page_started=page_started,
            )
            PLAN_READER_CACHE[key] = parsed
            return parsed, warnings, False

        overview_started = perf_counter()
        overview_image = _resize_for_edge(source_image, self.settings.openai_overview_max_edge)
        logger.info("[FireGuard] overview generation completed in %.2fs", perf_counter() - overview_started)
        compression_started = perf_counter()
        overview = _prepare_request_image(
            overview_image,
            original_bytes=len(page.png_bytes),
            max_bytes=self.settings.openai_image_max_bytes,
            jpeg_quality=self.settings.openai_jpeg_quality,
        )
        logger.info("[FireGuard] overview compression completed in %.2fs", perf_counter() - compression_started)

        overview_request_started = perf_counter()
        overview = self._request_extraction(
            filename=filename,
            page_number=page.page_number,
            image=overview,
            page_count=page_count,
            native_text=native_text,
            pass_label="overview",
            text_format=PlanOverviewExtraction,
        )
        overview_seconds = perf_counter() - overview_request_started
        parsed = _plan_from_overview(filename, page.page_number, overview)
        warnings: list[str] = []
        stage_results = [{"stage": "overview", "status": "SUCCESS", "schema": "PlanOverviewExtraction", "retry_count": 0}]
        region_count = 0
        tile_count = 0
        detail_started = perf_counter()
        from .semantic_regions import crop_region, merge_region_result, prompt_for_region, schema_for_region, select_semantic_regions

        regions, semantic_available = select_semantic_regions(parsed, source_image, native_text, self.settings)
        detail_skipped_due_to_budget = False
        if self.settings.fireguard_fast_mode and regions:
            remaining_seconds = self.settings.fireguard_fast_analysis_timeout_seconds - (perf_counter() - page_started)
            minimum_detail_budget = min(self.config.timeout_seconds, self.settings.fireguard_fast_analysis_timeout_seconds)
            if remaining_seconds < minimum_detail_budget:
                detail_skipped_due_to_budget = True
                warnings.append("OpenAI fast mode skipped optional detail extraction after overview consumed the remaining timeout budget.")
                regions = []
        if regions:
            concurrency = max(1, min(self.settings.openai_detail_concurrency, len(regions)))
            logger.info("[FireGuard] selected %s semantic detail region(s); concurrency=%s", len(regions), concurrency)
            with ThreadPoolExecutor(max_workers=concurrency) as executor:
                futures = {}
                for index, region in enumerate(regions, start=1):
                    request_image = crop_region(source_image, region, self.settings)
                    schema = schema_for_region(region.region_type)
                    region_key = self.region_cache_key(key, region.region_type.value, region.bbox)
                    cached_region = REGION_READER_CACHE.get(region_key)
                    if cached_region is not None:
                        merge_region_result(parsed, region, cached_region)
                        region_count += 1
                        continue
                    futures[executor.submit(
                        self._request_extraction,
                        filename=f"{filename} {region.region_type.value}",
                        page_number=page.page_number,
                        image=request_image,
                        page_count=page_count,
                        native_text=[],
                        pass_label=f"semantic_{index}_{region.region_type.value} bbox={region.bbox}",
                        text_format=schema,
                        prompt_override=prompt_for_region(region),
                    )] = (region_key, region)
                for future in as_completed(futures):
                    region_key, region = futures[future]
                    try:
                        detail_extraction = future.result()
                    except StageExtractionError as exc:
                        fallback_diag = dict(exc.diagnostic)
                        fallback_diag["stage"] = f"semantic_region:{region.region_type.value}"
                        fallback_diag["retry_count"] = 0 if self.settings.fireguard_fast_mode else 1
                        if self.settings.fireguard_fast_mode:
                            warnings.append(f"OpenAI fast mode semantic region {region.region_type.value} failed validation; region evidence set to UNKNOWN.")
                        else:
                            try:
                                self._request_extraction(
                                    filename=f"{filename} {region.region_type.value} retry",
                                    page_number=page.page_number,
                                    image=crop_region(source_image, region, self.settings),
                                    page_count=page_count,
                                    native_text=[],
                                    pass_label=f"semantic_retry_{region.region_type.value} bbox={region.bbox}",
                                    text_format=RegionFailureExtraction,
                                    prompt_override="Return whether any visible evidence exists in this region. Use null/empty lists for unknowns. Do not extract detailed rows.",
                                )
                                warnings.append(f"OpenAI semantic region {region.region_type.value} failed validation; retry used simple schema and region evidence remains UNKNOWN.")
                            except Exception:
                                warnings.append(f"OpenAI semantic region {region.region_type.value} failed validation; region evidence set to UNKNOWN.")
                        stage_results.append(fallback_diag)
                        continue
                    except PlanReaderUnavailable as exc:
                        warnings.append(f"OpenAI semantic region {region.region_type.value} failed: {exc.error_type}.")
                        stage_results.append({"stage": f"semantic_region:{region.region_type.value}", "status": exc.error_type, "schema": region.region_type.value, "retry_count": 0})
                        continue
                    REGION_READER_CACHE[region_key] = detail_extraction
                    merge_region_result(parsed, region, detail_extraction)
                    region_count += 1
                    stage_results.append({"stage": f"semantic_region:{region.region_type.value}", "status": "SUCCESS", "schema": schema.__name__, "retry_count": 0})
        elif self.settings.fireguard_fast_mode:
            warnings.append("OpenAI fast mode skipped generic tile fallback; review requires user confirmation for missing evidence.")
        elif not semantic_available:
            tile_generation_started = perf_counter()
            tiles = _detail_tiles(source_image, self.settings)
            logger.info("[FireGuard] generic tile fallback generation completed in %.2fs", perf_counter() - tile_generation_started)
            for tile_index, (tile_id, tile_image, bbox) in enumerate(tiles, start=1):
                logger.info("[FireGuard] fallback tile %s/%s started", tile_index, len(tiles))
                tile_request = _prepare_request_image(
                    tile_image,
                    original_bytes=len(page.png_bytes),
                    max_bytes=self.settings.openai_image_max_bytes,
                    jpeg_quality=self.settings.openai_jpeg_quality,
                )
                tile_started = perf_counter()
                tile_extraction = self._request_extraction(
                    filename=f"{filename} {tile_id}",
                    page_number=page.page_number,
                    image=tile_request,
                    page_count=page_count,
                    native_text=[],
                    pass_label=f"{tile_id} bbox={bbox}",
                )
                _merge_detail_extraction(parsed, tile_extraction)
                logger.info("[FireGuard] fallback tile %s/%s finished in %.2fs", tile_index, len(tiles), perf_counter() - tile_started)
                tile_count += 1
        detail_seconds = perf_counter() - detail_started
        logger.info("[FireGuard] OpenAI detail wall time completed in %.2fs", detail_seconds)

        validation_started = perf_counter()
        parsed, validation_warnings = validate_plan_extraction(parsed, page_count)
        logger.info("[FireGuard] structured-output parsing/validation completed in %.2fs", perf_counter() - validation_started)
        warnings.extend(validation_warnings)
        parsed.uncertainties.append("openai_stage_results=" + str(stage_results))
        if region_count:
            warnings.append(f"OpenAI detail extraction used {region_count} semantic region(s) with concurrency {max(1, self.settings.openai_detail_concurrency)}.")
        if regions:
            failed_regions = sum(1 for item in stage_results if str(item.get("status")) not in {"SUCCESS", "PARTIAL_RETRY"} and str(item.get("stage", "")).startswith("semantic_region:"))
            warnings.append(f"OpenAI semantic regions requested {len(regions)} successful {region_count} failed {failed_regions}.")
        if tile_count:
            warnings.append(f"OpenAI detail extraction used {tile_count} overlapping tile(s) as fallback.")
        logger.info(
            "[FireGuard] extraction timing preprocess_seconds=%.2f overview_seconds=%.2f detail_seconds=%.2f total_extraction_seconds=%.2f fast_mode=%s timeout_triggered=false detail_skipped_due_to_budget=%s",
            overview_started - page_started,
            overview_seconds,
            detail_seconds,
            perf_counter() - page_started,
            str(self.settings.fireguard_fast_mode).lower(),
            str(detail_skipped_due_to_budget).lower(),
        )
        PLAN_READER_CACHE[key] = parsed
        return parsed, warnings, False

    def _extract_fast_page(
        self,
        *,
        filename: str,
        page: RenderedPage,
        page_count: int,
        native_text: list[TextEvidence],
        source_image: Image.Image,
        page_started: float,
    ) -> tuple[PlanExtraction, list[str]]:
        preprocess_started = perf_counter()
        overview_image = _resize_for_edge(source_image, self.settings.openai_overview_max_edge)
        images = [
            ("OVERVIEW", _prepare_request_image(
                overview_image,
                original_bytes=len(page.png_bytes),
                max_bytes=self.settings.openai_image_max_bytes,
                jpeg_quality=self.settings.openai_jpeg_quality,
            )),
            ("SCHEDULE_CROP", _prepare_request_image(
                _fast_schedule_crop(source_image),
                original_bytes=len(page.png_bytes),
                max_bytes=self.settings.openai_image_max_bytes,
                jpeg_quality=self.settings.openai_jpeg_quality,
            )),
            ("SECTION_PLAN_CROP", _prepare_request_image(
                _fast_section_plan_crop(source_image),
                original_bytes=len(page.png_bytes),
                max_bytes=self.settings.openai_image_max_bytes,
                jpeg_quality=self.settings.openai_jpeg_quality,
            )),
        ]
        preprocess_seconds = perf_counter() - preprocess_started
        request_started = perf_counter()
        fast = self._request_extraction(
            filename=filename,
            page_number=page.page_number,
            image=images[0][1],
            page_count=page_count,
            native_text=native_text,
            pass_label="fast_multicrop",
            text_format=FastPlanExtraction,
            prompt_override=_fast_multicrop_prompt(filename, page.page_number, [label for label, _ in images]),
            additional_images=images[1:],
        )
        overview_seconds = perf_counter() - request_started
        parsed = _plan_from_fast_extraction(filename, page.page_number, fast)
        parsed, validation_warnings = validate_plan_extraction(parsed, page_count)
        parsed.uncertainties.append("openai_stage_results=" + str([{"stage": "fast_multicrop", "status": "SUCCESS", "schema": "FastPlanExtraction", "retry_count": 0, "images": len(images)}]))
        warnings = [
            f"OpenAI fast mode used one multimodal request with {len(images)} prepared image(s).",
            *validation_warnings,
        ]
        logger.info(
            "[FireGuard] extraction timing preprocess_seconds=%.2f overview_seconds=%.2f detail_seconds=%.2f total_extraction_seconds=%.2f fast_mode=true timeout_triggered=false detail_skipped_due_to_budget=false images_sent=%s",
            preprocess_seconds,
            overview_seconds,
            0.0,
            perf_counter() - page_started,
            len(images),
        )
        return parsed, warnings

    def _request_extraction(
        self,
        *,
        filename: str,
        page_number: int,
        image: PreparedRequestImage,
        page_count: int,
        native_text: list[TextEvidence],
        pass_label: str,
        text_format=PlanExtraction,
        prompt_override: str | None = None,
        additional_images: list[tuple[str, PreparedRequestImage]] | None = None,
    ):
        attempts = 0
        used_smaller_retry = False
        while True:
            attempts += 1
            try:
                request_started = perf_counter()
                if pass_label == "overview":
                    logger.info("[FireGuard] OpenAI overview request started")
                elif pass_label.startswith("tile_"):
                    logger.info("[FireGuard] OpenAI %s request started", pass_label.split()[0])
                logger.info(
                    "OpenAI image preparation: pass=%s original_dimensions=%sx%s final_dimensions=%sx%s original_bytes=%s final_bytes=%s media_type=%s",
                    pass_label,
                    image.original_width,
                    image.original_height,
                    image.final_width,
                    image.final_height,
                    image.original_bytes,
                    image.final_bytes,
                    image.media_type,
                )
                logger.info(
                    "OpenAI request diagnostic: stage=RESPONSES_REQUEST provider=openai model=%s key_fingerprint=%s base_url_host=%s page=%s",
                    self.config.model,
                    self.config.key_fingerprint,
                    self.config.base_url_host,
                    f"{page_number}:{pass_label}",
                )
                content = [
                    {"type": "input_text", "text": prompt_override or page_prompt(filename, page_number, _native_lines(native_text))},
                    {"type": "input_image", "image_url": _image_data_url(image), "detail": "high"},
                ]
                for label, extra_image in additional_images or []:
                    content.append({"type": "input_text", "text": f"Additional image: {label}"})
                    content.append({"type": "input_image", "image_url": _image_data_url(extra_image), "detail": "high"})
                response = self.client.responses.parse(
                    model=self.model,
                    timeout=self.config.timeout_seconds,
                    input=[
                        {"role": "system", "content": PLAN_READER_SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": content,
                        },
                    ],
                    text_format=text_format,
                )
                if pass_label == "overview":
                    logger.info("[FireGuard] OpenAI overview response received in %.2fs", perf_counter() - request_started)
                elif pass_label.startswith("tile_"):
                    logger.info("[FireGuard] OpenAI %s response received in %.2fs", pass_label.split()[0], perf_counter() - request_started)
            except APIStatusError as exc:
                classified = classify_openai_exception(exc, stage="RESPONSES_REQUEST")
                if classified.error_type == "UNSUPPORTED_INPUT" and not used_smaller_retry:
                    image = _smaller_request_image(image, self.settings)
                    used_smaller_retry = True
                    continue
                if classified.retryable and attempts <= 2 and not self.settings.fireguard_fast_mode:
                    time.sleep(0.4 * attempts)
                    continue
                _log_openai_failure(self.settings, classified)
                raise _reader_unavailable(classified) from exc
            except (APIConnectionError, APITimeoutError) as exc:
                classified = classify_openai_exception(exc, stage="RESPONSES_REQUEST")
                if attempts <= 2 and not self.settings.fireguard_fast_mode:
                    time.sleep(0.4 * attempts)
                    continue
                _log_openai_failure(self.settings, classified)
                raise _reader_unavailable(classified) from exc
            except ValidationError as exc:
                diagnostic = _validation_diagnostic(pass_label, text_format, exc)
                logger.warning("[FireGuard] OpenAI validation diagnostic: %s", diagnostic)
                if pass_label in {"overview", "fast_multicrop"}:
                    unavailable = PlanReaderUnavailable("OpenAI returned invalid structured extraction.", error_type="INVALID_RESPONSE", stage=pass_label, diagnostic=diagnostic)
                    logger.warning("OpenAI diagnostic: %s", safe_openai_log_payload(self.settings, _UnavailableForLog(unavailable)))
                    raise unavailable from exc
                raise StageExtractionError("OpenAI detail region returned invalid structured extraction.", diagnostic) from exc
            except OpenAIError as exc:
                classified = classify_openai_exception(exc, stage="RESPONSES_REQUEST")
                _log_openai_failure(self.settings, classified)
                raise _reader_unavailable(classified) from exc

            parsed = response.output_parsed
            if parsed is None:
                raise PlanReaderUnavailable("OpenAI returned no structured plan extraction.", error_type="INVALID_RESPONSE", stage="STRUCTURED_PARSE")
            if isinstance(parsed, PlanExtraction):
                parsed, _ = validate_plan_extraction(parsed, page_count)
            logger.info(
                "OpenAI request diagnostic: stage=RESPONSES_REQUEST provider=openai status=SUCCESS model=%s key_fingerprint=%s base_url_host=%s page=%s",
                self.config.model,
                self.config.key_fingerprint,
                self.config.base_url_host,
                f"{page_number}:{pass_label}",
            )
            return parsed

def _plan_from_overview(filename: str, page_number: int, overview: PlanOverviewExtraction) -> PlanExtraction:
    if isinstance(overview, PlanExtraction):
        return overview
    classification = "FIRE" if overview.fire_plan_present is True else "COMBINED" if overview.fire_annotations_present is True else "ARCHITECTURAL" if overview.architectural_plan_present is not False else "UNKNOWN"
    extraction = PlanExtraction(
        pages=[PageEvidence(page=page_number, classification=classification)],
        semantic_regions=overview.semantic_regions,
        uncertainties=[*(overview.important_regions or [])],
    )
    extraction.document.filename = filename
    extraction.document.document_type = overview.plan_type
    extraction.building_info.project_name = EvidenceValue(value=overview.project_name, confidence=0.8 if overview.project_name else None, source_page=page_number, evidence_text=overview.project_name or overview.evidence_text, state=EvidenceState.CONFIRMED if overview.project_name else EvidenceState.UNKNOWN)
    extraction.building_info.building_use = EvidenceValue(value=overview.building_use_text, confidence=0.8 if overview.building_use_text else None, source_page=page_number, evidence_text=overview.building_use_text or overview.evidence_text, state=EvidenceState.CONFIRMED if overview.building_use_text else EvidenceState.UNKNOWN)
    extraction.building_info.explicit_storey_count = EvidenceValue(value=str(overview.storey_count) if overview.storey_count is not None else None, confidence=0.75 if overview.storey_count is not None else None, source_page=page_number, evidence_text=overview.evidence_text or "overview storey count", state=EvidenceState.CONFIRMED if overview.storey_count is not None else EvidenceState.UNKNOWN)
    extraction.building_info.designed_occupants = EvidenceValue(value=str(overview.designed_occupants) if overview.designed_occupants is not None else None, confidence=0.7 if overview.designed_occupants is not None else None, source_page=page_number, evidence_text=overview.evidence_text or "overview occupant evidence", evidence_type="designed_occupants", state=EvidenceState.CONFIRMED if overview.designed_occupants is not None else EvidenceState.UNKNOWN)
    extraction.building_info.floor_names_visible = overview.plans_visible
    for label in overview.schedules_visible:
        extraction.schedules.append(ScheduleEntryEvidence(schedule_type=label, row_text=label, page=page_number, confidence=0.6))
    return extraction

def _plan_from_fast_extraction(filename: str, page_number: int, fast: FastPlanExtraction) -> PlanExtraction:
    classification = "FIRE" if fast.fire_plan_present is True else "COMBINED" if fast.fire_annotations_present is True else "ARCHITECTURAL" if fast.architectural_plan_present is not False else "UNKNOWN"
    extraction = PlanExtraction(pages=[PageEvidence(page=page_number, classification=classification)])
    extraction.document.filename = filename
    project_name = _clean_text(fast.project_name)
    building_use = _clean_building_use(fast.building_use_text, project_name)
    extraction.building_info.project_name = EvidenceValue(value=project_name, confidence=0.8 if project_name else None, source_page=page_number, evidence_text=project_name or fast.evidence_text, state=EvidenceState.CONFIRMED if project_name else EvidenceState.UNKNOWN)
    extraction.building_info.building_use = EvidenceValue(value=building_use, confidence=0.8 if building_use else None, source_page=page_number, evidence_text=building_use or fast.evidence_text, state=EvidenceState.CONFIRMED if building_use else EvidenceState.UNKNOWN)
    if fast.storeys.storey_count is not None:
        extraction.building_info.explicit_storey_count = EvidenceValue(value=str(fast.storeys.storey_count), confidence=fast.storeys.confidence or 0.75, source_page=page_number, evidence_text=fast.storeys.evidence_text, evidence_type="storey_count", state=EvidenceState.CONFIRMED)
        extraction.building_info.storey_count_confidence = fast.storeys.confidence
        extraction.building_info.storey_count_evidence = fast.storeys.evidence_text
    extraction.building_info.floor_names_visible = fast.storeys.floor_names
    if fast.total_floor_area_m2 is not None:
        extraction.building_info.total_floor_area_m2 = EvidenceValue(value=str(fast.total_floor_area_m2), confidence=0.75, source_page=page_number, evidence_text=fast.evidence_text or str(fast.total_floor_area_m2), evidence_type="total_floor_area_m2", state=EvidenceState.CONFIRMED)
    if fast.building_height_m is not None and _height_contextual(fast.evidence_text):
        extraction.building_info.height_m = EvidenceValue(value=str(fast.building_height_m), confidence=0.7, source_page=page_number, evidence_text=fast.evidence_text, evidence_type="building_height_m", state=EvidenceState.CONFIRMED)
    if fast.highest_storey_floor_level_m is not None and _height_contextual(fast.evidence_text):
        extraction.building_info.highest_habitable_floor_level_m = EvidenceValue(value=str(fast.highest_storey_floor_level_m), confidence=0.7, source_page=page_number, evidence_text=fast.evidence_text, evidence_type="highest_habitable_floor_level_m", state=EvidenceState.CONFIRMED)
        extraction.floor_levels.append(OpenAIFloorLevelEvidence(name="highest storey floor level", level_m=fast.highest_storey_floor_level_m, page=page_number, confidence=0.7, evidence_text=fast.evidence_text))
    for row in fast.floor_areas:
        area_m2 = row.normalized_area_m2 if row.normalized_area_m2 is not None else row.area_m2
        if row.floor_name and area_m2 is not None:
            extraction.floor_areas.append(FloorAreaEvidence(floor_name=row.floor_name, area_m2=area_m2, source_page=page_number, evidence_text=row.raw_text, confidence=row.confidence))
    for row in fast.doors:
        extraction.doors.append(DoorEvidence(door_id=row.mark, page=page_number, width_mm=row.width_m * 1000 if row.width_m is not None else None, height_mm=row.height_m * 1000 if row.height_m is not None else None, physical_instance_confirmed=False, is_exit=None, confidence=row.confidence, evidence_text=row.raw_text))
        extraction.schedules.append(ScheduleEntryEvidence(schedule_type="door_window_schedule", row_text=row.raw_text, page=page_number, confidence=row.confidence, parsed_summary=row.mark))
    for row in fast.windows:
        extraction.schedules.append(ScheduleEntryEvidence(schedule_type="window_schedule", row_text=row.raw_text, page=page_number, confidence=row.confidence, parsed_summary=row.mark))
    if fast.visible_stair_count is not None:
        extraction.evidence.append(EvidenceValue(value=str(fast.visible_stair_count), confidence=0.65, source_page=page_number, evidence_text=fast.evidence_text, evidence_type="visible_staircase_count", state=EvidenceState.EXTRACTED))
        for index in range(fast.visible_stair_count):
            extraction.stairs.append(StairEvidence(page=page_number, label=f"Visible stair {index + 1}", confidence=0.65, physical_stair_confirmed=False, evidence_text=fast.evidence_text))
    for label in fast.room_labels:
        extraction.rooms.append(RoomEvidence(label=label, page=page_number, confidence=0.6, evidence_text=label))
    for feature in fast.visible_fire_features:
        if feature.feature:
            extraction.fire_equipment.append(FireEquipmentEvidence(type=feature.feature, page=page_number, label=feature.feature, count=feature.count, confidence=feature.confidence, evidence_text=feature.raw_text, presence=EvidenceState.CONFIRMED if feature.present is True or feature.count is not None else EvidenceState.UNKNOWN))
    extraction.uncertainties.extend(name for name in fast.storeys.floor_names if name)
    return extraction

def _fast_multicrop_prompt(filename: str, page_number: int, image_labels: list[str]) -> str:
    return (
        f"File: {filename}, page {page_number}. You are extracting factual evidence from an architectural drawing. "
        f"Use all supplied images together: {', '.join(image_labels)}. The overview shows overall context. "
        "The schedule crop provides detailed table text for doors, windows, and floor areas. "
        "The section/floor crop provides level, stair, and room evidence. Return only values visibly supported by the drawing. "
        "Do not infer regulatory compliance. Do not return PASS or VIOLATION. Do not guess missing values; return null when uncertain. "
        "project_name is the formal title, often beginning with PROPOSED. building_use_text is only the actual occupancy/use and must not copy the entire project title. "
        "OpenAI must not determine purpose_group. If labels explicitly show GROUND FLOOR and FIRST TO SIXTH FLOOR, return the supported storey interpretation with evidence."
    )

def _fast_schedule_crop(image: Image.Image) -> Image.Image:
    box = _box(image, 0.58, 0.55, 0.42, 0.45)
    return image.crop(box).rotate(90, expand=True)

def _fast_section_plan_crop(image: Image.Image) -> Image.Image:
    box = _box(image, 0.05, 0.0, 0.75, 0.70)
    return image.crop(box)

def _box(image: Image.Image, x: float, y: float, width: float, height: float) -> tuple[int, int, int, int]:
    x1 = int(image.width * x)
    y1 = int(image.height * y)
    x2 = int(image.width * min(1.0, x + width))
    y2 = int(image.height * min(1.0, y + height))
    return x1, y1, max(x1 + 1, x2), max(y1 + 1, y2)

def _clean_text(value: str | None) -> str | None:
    if not isinstance(value, str):
        return None
    stripped = value.strip()
    return stripped or None

def _clean_building_use(value: str | None, project_name: str | None) -> str | None:
    text = _clean_text(value)
    if not text:
        return None
    normalized = " ".join(text.lower().split())
    project_normalized = " ".join((project_name or "").lower().split())
    if project_normalized and normalized == project_normalized:
        return None
    if normalized.startswith("proposed ") and "development" in normalized:
        return None
    return text

def _height_contextual(evidence_text: str | None) -> bool:
    text = (evidence_text or "").upper()
    return any(token in text for token in ("SECTION", "ELEVATION", "FFL", "RL", "FLOOR", "ROOF", "TERRACE", "LEVEL", "HEIGHT"))

def _validation_diagnostic(stage: str, schema, exc: ValidationError) -> dict:
    errors = []
    for item in exc.errors(include_url=False):
        errors.append({
            "field": ".".join(str(part) for part in item.get("loc", ())),
            "type": item.get("type"),
            "message": item.get("msg"),
        })
    return {
        "stage": stage,
        "status": "INVALID_RESPONSE",
        "type": "PydanticValidationError",
        "schema": getattr(schema, "__name__", str(schema)),
        "message": "OpenAI structured output validation failed.",
        "validation_errors": errors[:12],
    }

def _resize_for_edge(image: Image.Image, max_edge: int) -> Image.Image:
    if max(image.width, image.height) <= max_edge:
        return image.copy()
    scale = max_edge / max(image.width, image.height)
    return image.resize((max(1, int(image.width * scale)), max(1, int(image.height * scale))))

def _prepare_request_image(image: Image.Image, *, original_bytes: int, max_bytes: int, jpeg_quality: int) -> PreparedRequestImage:
    original_width, original_height = image.width, image.height
    candidate = image.convert("RGB")
    quality = max(35, min(95, jpeg_quality))
    while True:
        out = BytesIO()
        candidate.save(out, "JPEG", quality=quality, optimize=True)
        data = out.getvalue()
        if len(data) <= max_bytes:
            return PreparedRequestImage(data, "image/jpeg", original_width, original_height, candidate.width, candidate.height, original_bytes, len(data))
        if quality > 45:
            quality -= 10
            continue
        scale = max(0.5, (max_bytes / len(data)) ** 0.5 * 0.92)
        next_size = (max(1, int(candidate.width * scale)), max(1, int(candidate.height * scale)))
        if next_size == candidate.size:
            raise PlanReaderUnavailable("Rendered page could not be compressed within OpenAI plan-reader image limit.", error_type="UNSUPPORTED_INPUT", stage="FILE_PREP")
        candidate = candidate.resize(next_size)
        quality = max(35, min(85, jpeg_quality))

def _smaller_request_image(image: PreparedRequestImage, settings: Settings) -> PreparedRequestImage:
    source = Image.open(BytesIO(image.data)).convert("RGB")
    smaller = _resize_for_edge(source, max(512, int(max(source.width, source.height) * 0.75)))
    return _prepare_request_image(
        smaller,
        original_bytes=image.original_bytes,
        max_bytes=max(512_000, int(settings.openai_image_max_bytes * 0.7)),
        jpeg_quality=max(45, settings.openai_jpeg_quality - 15),
    )

def _detail_tiles(image: Image.Image, settings: Settings) -> list[tuple[str, Image.Image, dict]]:
    if max(image.width, image.height) <= settings.openai_overview_max_edge:
        return []
    tile_size = settings.openai_tile_max_edge
    step = max(1, int(tile_size * (1 - settings.openai_tile_overlap)))
    positions: list[tuple[int, int]] = []
    y = 0
    while y < image.height and len(positions) < settings.openai_max_detail_tiles:
        x = 0
        while x < image.width and len(positions) < settings.openai_max_detail_tiles:
            positions.append((min(x, max(0, image.width - tile_size)), min(y, max(0, image.height - tile_size))))
            if x + tile_size >= image.width:
                break
            x += step
        if y + tile_size >= image.height:
            break
        y += step
    tiles: list[tuple[str, Image.Image, dict]] = []
    for index, (x, y) in enumerate(dict.fromkeys(positions), start=1):
        x2 = min(image.width, x + tile_size)
        y2 = min(image.height, y + tile_size)
        crop = image.crop((x, y, x2, y2))
        bbox = {"x": x / image.width, "y": y / image.height, "width": (x2 - x) / image.width, "height": (y2 - y) / image.height}
        tiles.append((f"tile_{index}", crop, bbox))
    return tiles

def _merge_detail_extraction(target: PlanExtraction, detail: PlanExtraction) -> None:
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
    existing_pages = {page.page for page in target.pages}
    target.pages.extend(page for page in detail.pages if page.page not in existing_pages)

def _reader_unavailable(classified) -> PlanReaderUnavailable:
    return PlanReaderUnavailable(
        classified.user_message,
        classified.status_code,
        classified.retryable,
        classified.error_type,
        classified.stage,
        classified.code,
        classified.provider_error_type,
        classified.request_id,
    )

def _log_openai_failure(settings: Settings, classified) -> None:
    logger.warning("OpenAI diagnostic: %s", safe_openai_log_payload(settings, classified))

class _UnavailableForLog:
    def __init__(self, unavailable: PlanReaderUnavailable):
        self.unavailable = unavailable

    def safe_dict(self):
        return self.unavailable.safe_dict()
