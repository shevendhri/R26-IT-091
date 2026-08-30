from ...schemas import BuildingInfo, Door, FireEquipment, GenericItem, PageClassification, PageExtraction
from .schemas import EvidenceState, PlanExtraction

def _float(value) -> float | None:
    try:
        return None if value is None else float(value)
    except (TypeError, ValueError):
        return None

def _confidence(value: float | None, default: float = 0.75) -> float:
    return default if value is None else max(0, min(1, value))

def _page(value: int | None, default: int) -> int:
    return value or default

def page_extractions_from_openai(filename: str, extraction: PlanExtraction) -> list[PageExtraction]:
    page_numbers = sorted({page.page for page in extraction.pages} or {1})
    pages: list[PageExtraction] = []
    for page_number in page_numbers:
        page_info = next((item for item in extraction.pages if item.page == page_number), None)
        classification = PageClassification(page_info.classification if page_info else "UNKNOWN")
        info = BuildingInfo()
        if extraction.building_info.project_name.value is not None:
            info.project_title = str(extraction.building_info.project_name.value)
        if extraction.building_info.building_use.value is not None:
            info.building_use_text = str(extraction.building_info.building_use.value)
        storeys = _float(extraction.building_info.explicit_storey_count.value)
        height = _float(extraction.building_info.height_m.value)
        highest_level = _float(extraction.building_info.highest_habitable_floor_level_m.value)
        total_area = _float(extraction.building_info.total_floor_area_m2.value)
        occupants = _float(extraction.building_info.designed_occupants.value)
        if storeys is not None:
            info.storey_count = int(storeys)
        if height is not None:
            info.building_height_m = height
            info.critical_evidence["building_height_m"] = extraction.building_info.height_m.evidence_text or str(extraction.building_info.height_m.value)
        if highest_level is not None:
            info.highest_habitable_floor_level_m = highest_level
            info.critical_evidence["highest_habitable_floor_level_m"] = _critical_payload(extraction.building_info.highest_habitable_floor_level_m, highest_level)
        if total_area is not None:
            info.total_building_area_m2 = total_area
            info.critical_evidence["total_building_area_m2"] = _critical_payload(extraction.building_info.total_floor_area_m2, total_area)
        if occupants is not None:
            info.designed_occupants = int(occupants)
            info.critical_evidence["designed_occupants"] = _critical_payload(extraction.building_info.designed_occupants, int(occupants))
        if storeys is not None:
            info.critical_evidence["storey_count"] = _critical_payload(extraction.building_info.explicit_storey_count, int(storeys))
        info.floor_names = extraction.building_info.floor_names_visible
        info.floor_areas_m2 = {
            item.floor_name or f"Page {item.source_page or page_number}": item.area_m2
            for item in extraction.floor_areas
            if item.area_m2 is not None and (item.source_page is None or item.source_page == page_number)
        }
        if info.floor_areas_m2:
            info.max_floor_area_per_storey_m2 = max(info.floor_areas_m2.values())
            info.critical_evidence["max_floor_area_per_storey_m2"] = {"evidence": "floor area schedule", "validation_status": "CONFIRMED"}

        windows = [
            GenericItem(
                label=item.parsed_summary,
                source_file=filename,
                source_page=_page(item.page, page_number),
                evidence=item.row_text,
                confidence=_confidence(item.confidence),
                data={"provider": "openai", "schedule_type": item.schedule_type, "physical_instance_confirmed": False},
            )
            for item in extraction.schedules
            if item.page in {None, page_number} and item.schedule_type == "window_schedule"
        ]

        rooms = [
            GenericItem(
                label=item.label,
                source_file=filename,
                source_page=_page(item.page, page_number),
                evidence=item.evidence_text,
                confidence=_confidence(item.confidence),
                data={"provider": "openai", "approximate_region": item.approximate_region, "count_status": extraction.room_detection_completeness.value},
            )
            for item in extraction.rooms
            if item.page in {None, page_number}
        ]
        doors = [
            Door(
                mark=item.door_id,
                width_m=(item.width_mm / 1000) if item.width_mm is not None else None,
                height_mm=item.height_mm,
                source_file=filename,
                source_page=_page(item.page, page_number),
                evidence=item.evidence_text,
                confidence=_confidence(item.confidence),
                is_exit=item.is_exit if item.is_exit is True else None,
                opens_in_exit_direction=item.opens_in_exit_direction if item.is_exit is True else None,
            )
            for item in extraction.doors
            if item.page in {None, page_number}
        ]
        stairs = [
            GenericItem(
                label=item.label,
                source_file=filename,
                source_page=_page(item.page, page_number),
                evidence=item.evidence_text,
                confidence=_confidence(item.confidence),
                data={"provider": "openai", "approximate_region": item.approximate_region, "physical_stair_confirmed": item.physical_stair_confirmed},
            )
            for item in extraction.stairs
            if item.page in {None, page_number}
        ]
        escape_routes = [
            GenericItem(
                label=item.type,
                source_file=filename,
                source_page=_page(item.page, page_number),
                evidence=item.evidence_text,
                confidence=_confidence(item.confidence),
                data={"provider": "openai", "approximate_region": item.approximate_region, "door_reference": item.door_reference},
            )
            for item in extraction.exits
            if item.page in {None, page_number}
        ]
        fire_equipment = [
            FireEquipment(
                type=(item.type or "unknown").lower(),
                source_file=filename,
                source_page=_page(item.page, page_number),
                evidence=item.evidence_text or item.label,
                confidence=_confidence(item.confidence),
                count=item.count,
            )
            for item in extraction.fire_equipment
            if item.page in {None, page_number} and item.presence == EvidenceState.CONFIRMED
        ]
        warnings = list(extraction.uncertainties)
        if page_info:
            warnings.extend(page_info.warnings)
        pages.append(PageExtraction(
            source_file=filename,
            source_page=page_number,
            classification=classification,
            extraction_provider="openai",
            building_info=info,
            rooms=rooms,
            doors=doors,
            windows=windows,
            stairs=stairs,
            escape_routes=escape_routes,
            fire_equipment=fire_equipment,
            warnings=warnings,
        ))
    return pages

def _critical_payload(value, normalized_value) -> dict:
    status = "CONFIRMED" if value.state == EvidenceState.CONFIRMED else "EXTRACTED"
    return {
        "value": normalized_value,
        "source": value.provider or "openai",
        "confidence": value.confidence,
        "source_page": value.source_page,
        "evidence": value.evidence_text or str(value.value),
        "validation_status": status,
    }
