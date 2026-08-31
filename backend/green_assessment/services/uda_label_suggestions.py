import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from typing import Optional

from sqlalchemy.orm import selectinload

from green_assessment import models


LABELLED_EXPORT_PATH = Path("dataset_exports") / "uda_labelled_training_data.csv"

STRONG_WEIGHT = 9
MEDIUM_WEIGHT = 4
WEAK_WEIGHT = 1
FOLDER_HINT_WEIGHT = 1
EXCLUSION_WEIGHT = -8
MINIMUM_SUGGESTION_SCORE = 4
HIGH_MARGIN = 8
MEDIUM_MARGIN = 4
AMBIGUOUS_MARGIN = 2

ENERGY_CONTEXT_PHRASES = [
    "energy savings",
    "annual energy consumption",
    "annual energy use",
    "energy consumption",
    "energy simulation",
    "simulated energy use",
    "economizer energy savings",
    "energy performance",
    "energy demand",
    "kwh",
    "mbtu",
    "plug loads",
    "internal loads",
    "efficient lighting",
]

LIGHTING_CONTEXT_PHRASES = [
    "electric lighting",
    "fluorescent lamp",
    "fluorescent lighting",
    "luminaire",
    "luminaires",
    "lighting fixtures",
    "lighting power",
    "lighting efficiency",
    "illumination",
    "lux",
    "lighting level",
]

WORKSTATION_GLARE_CONFLICTS = [
    "computer monitor",
    "workstation monitor",
    "screen glare",
    "monitor glare",
    "electric lighting",
    "luminaire",
    "fluorescent lighting",
]


PHRASE_RULES = {
    "EE1": {
        "strong": ["individual switch", "individual switches", "lighting control zone", "occupancy sensor", "daylight sensor", "automatic lighting control"],
        "medium": ["lighting control", "light fittings", "separate switches", "lighting zones", "motion sensor"],
        "weak": ["lighting schedule", "switch control"],
        "exclusions": ["co2", "power factor", "water meter"],
    },
    "EE2": {
        "strong": ["electricity sub-metering", "electricity submetering", "electrical sub-meter", "electrical submeter", "energy management system", "ems system"],
        "medium": ["sub-meter", "submeter", "tenant meter", "renter space", "metered electricity"],
        "weak": ["metering panel", "energy monitoring"],
        "exclusions": ["water meter", "rainwater"],
    },
    "EE3": {
        "strong": ["solar pv", "photovoltaic", "renewable energy", "renewable generation", "electricity contract demand", "solar panel", "kwp"],
        "medium": ["solar array", "renewable electricity", "on-site renewable", "renewable power"],
        "weak": ["solar", "pv system"],
        "require_strong_for_high": True,
        "exclusions": ["daylight", "solar control", "solar heat gain"],
    },
    "EE4": {
        "strong": [
            "energy consumption",
            "annual energy use",
            "annual energy consumption",
            "energy savings",
            "energy performance",
            "building energy index",
            "bei",
            "kwh/m2",
            "kwh/m2/year",
            "kwh/m²",
            "kwh/m²/year",
            "energy simulation",
            "simulated energy use",
            "reduce energy consumption",
            "annual energy demand",
            "energy efficiency improvement",
            "mbtu energy savings",
        ],
        "medium": [
            "high performance energy",
            "energy efficiency performance",
            "energy modelling",
            "energy modeling",
            "economizer energy savings",
            "hvac energy",
            "energy demand",
        ],
        "weak": ["energy efficient building", "energy efficient hvac"],
        "exclusions": ["power factor", "maintenance crew"],
    },
    "EE5": {
        "strong": [
            "lighting power density",
            "lpd",
            "luminaire efficacy",
            "lighting power",
            "lighting efficiency",
            "lighting fixtures",
            "fluorescent lamps",
            "fluorescent lighting",
            "luminaires",
            "lm/w",
            "lm / w",
        ],
        "medium": ["efficient illumination", "efficient lighting", "external light fittings", "internal illumination", "electric lighting"],
        "weak": ["lamp efficiency", "lighting"],
        "exclusions": ["daylight lux", "daylight glare", "sunlight glare"],
    },
    "EE6": {
        "strong": ["power factor", "power factor correction", "capacitor bank", "reactive power", "three phase", "three-phase", "60a", "0.98"],
        "medium": ["power correction", "pf correction"],
        "weak": [],
        "require_strong_for_high": True,
        "require_any": ["power factor", "capacitor bank", "reactive power", "pf correction", "three phase", "three-phase", "60a", "0.98"],
        "exclusions": ["fan power", "pump power", "hvac power", "lighting power density", "power consumption"],
    },
    "EE7": {
        "strong": ["commissioning", "energy system commissioning", "independent expert consultant", "system manual", "testing and commissioning"],
        "medium": ["energy system review", "operation manual", "tender documents", "contractor installation methodology"],
        "weak": ["system operator"],
        "exclusions": ["maintenance crew"],
    },
    "EE8": {
        "strong": ["maintenance crew", "maintenance team", "maintenance office", "maintenance equipment", "maintenance manual", "mobilize maintenance crew", "maintenance cost", "practical completion", "maintenance staff"],
        "medium": ["maintenance room", "building maintenance", "maintenance tools", "maintenance stocks"],
        "weak": [],
        "require_strong_for_high": True,
        "require_any": ["maintenance crew", "maintenance team", "maintenance office", "maintenance equipment", "maintenance manual", "maintenance cost", "practical completion", "maintenance staff"],
        "exclusions": ["energy efficiency", "hvac system", "vav", "thermal comfort"],
    },
    "SM1": {
        "strong": ["wildlife area", "wetland", "buffer zone", "red data list", "environmentally valuable site", "natural disaster risk"],
        "medium": ["site selection", "threatened species", "endemic species", "ecological system"],
        "weak": ["unsuitable site"],
    },
    "SM2": {
        "strong": ["brownfield", "brownfield redevelopment", "previously developed land", "redeveloped land"],
        "medium": ["abandoned site", "contaminated site", "land redevelopment"],
        "weak": ["site redevelopment"],
    },
    "SM3": {
        "strong": ["public transport", "bus stop", "railway station", "transit stop", "mass transit"],
        "medium": ["transport access", "walkable distance", "public bus"],
        "weak": ["transport facility"],
    },
    "SM4": {
        "strong": ["basic services", "community services", "public services", "healthcare facility", "banking facility"],
        "medium": ["nearby amenities", "service access", "retail facility"],
        "weak": ["amenities"],
    },
    "SM5": {
        "strong": ["bicycle parking", "cycle parking", "bicycle racks", "changing room", "shower facilities"],
        "medium": ["cyclist facilities", "cycle storage", "bicycle facility"],
        "weak": ["bicycle"],
    },
    "SM6": {
        "strong": ["heat island", "solar reflectance", "high albedo", "cool roof", "roof reflectance"],
        "medium": ["shaded paving", "reflective paving", "surface reflectance", "tree shading"],
        "weak": ["shading"],
        "exclusions": ["glare"],
    },
    "SM7": {
        "strong": ["stormwater", "storm water", "rainwater runoff", "surface runoff", "permeable paving"],
        "medium": ["runoff reduction", "detention pond", "infiltration trench", "swale"],
        "weak": ["runoff"],
        "exclusions": ["rainwater harvesting", "rainwater tank"],
    },
    "SM8": {
        "strong": ["native plants", "adapted plants", "landscape plan", "green area ratio", "vegetation cover"],
        "medium": ["landscaping", "planting plan", "green area", "tree planting"],
        "weak": ["vegetation", "landscape"],
    },
    "SM9": {
        "strong": ["light pollution", "uplight", "light trespass", "night sky", "external lighting cutoff"],
        "medium": ["external lighting", "outdoor lighting", "lighting spill"],
        "weak": ["site lighting"],
        "exclusions": ["lighting power density", "indoor lighting"],
    },
    "SM10": {
        "strong": ["carpool", "vanpool", "preferred parking", "parking spaces for carpools", "parking percentage"],
        "medium": ["shared vehicle parking", "priority parking", "parking capacity"],
        "weak": ["parking spaces"],
    },
    "SM11": {
        "strong": ["erosion control", "sedimentation control", "construction pollution", "dust control", "silt fence"],
        "medium": ["soil loss", "site protection", "sediment basin", "construction runoff"],
        "weak": ["erosion", "sedimentation"],
    },
    "SM12": {
        "strong": ["green roof", "roof garden", "vertical greenery", "living wall"],
        "medium": ["rooftop garden", "vegetated roof", "green wall"],
        "weak": ["roof vegetation"],
    },
    "SM13": {
        "strong": ["urban agriculture", "eco farming", "food cultivation", "edible landscape"],
        "medium": ["vegetable garden", "food garden", "agricultural area"],
        "weak": ["farming"],
    },
    "MR1": {
        "strong": ["reused material", "re-use of materials", "reuse of materials", "salvaged material", "refurbished material"],
        "medium": ["material reuse", "reclaimed material", "restoration cost"],
        "weak": ["reuse"],
        "exclusions": ["recycled content"],
    },
    "MR2": {
        "strong": ["recycled content", "recycled substance", "recycled material", "percentage recycled material", "recycled material cost"],
        "medium": ["post-consumer recycled", "pre-consumer recycled", "recycled aggregate"],
        "weak": ["recycling material"],
        "require_strong_for_high": True,
        "exclusions": ["construction waste recycling", "waste recycling"],
    },
    "MR3": {
        "strong": ["reuse of existing building", "existing building reuse", "retain existing building", "existing structure"],
        "medium": ["building reuse", "retained structure", "existing floor area"],
        "weak": ["existing building"],
    },
    "MR4": {
        "strong": ["regional materials", "regionally available materials", "locally sourced materials", "within 200 km"],
        "medium": ["local materials", "local sourcing", "regional material cost"],
        "weak": ["locally sourced"],
    },
    "MR5": {
        "strong": ["certified timber", "sustainable timber", "fsc", "forest stewardship council", "timber certification"],
        "medium": ["wood certification", "certified wood", "responsible timber"],
        "weak": ["timber"],
    },
    "MR6": {
        "strong": ["asbestos", "prohibited material", "hazardous material", "lead paint", "toxic material"],
        "medium": ["material restriction", "harmful material", "banned material"],
        "weak": ["hazardous"],
    },
    "MR7": {
        "strong": ["construction waste management", "construction waste", "non-hazardous construction waste", "waste salvage"],
        "medium": ["salvage waste", "recycle waste", "waste diversion"],
        "weak": ["waste management"],
        "exclusions": ["wastewater"],
    },
    "MR8": {
        "strong": ["refrigerant", "clean agent", "global warming potential", "gwp", "ozone depletion", "zero ozone"],
        "medium": ["natural refrigerant", "low-gwp", "ozone compound"],
        "weak": ["coolant"],
    },
    "EQ1": {
        "strong": ["co2", "carbon dioxide", "co2 sensor", "co2 monitor", "co2 gauge", "carbon dioxide sensor", "ppm", "1000 ppm", "co2 concentration"],
        "medium": ["demand controlled ventilation", "indoor air monitoring"],
        "weak": [],
        "require_strong_for_high": True,
        "require_any": ["co2", "carbon dioxide", "ppm"],
        "exclusions": ["vav", "thermal comfort", "temperature", "supply air", "exhaust air", "air change effectiveness"],
    },
    "EQ2": {
        "strong": ["voc", "volatile organic compounds", "formaldehyde", "low-voc", "low emitting materials", "indoor air pollutants"],
        "medium": ["adhesives sealants", "paint certificate", "pollutant source", "emission limit"],
        "weak": ["indoor pollutant"],
    },
    "EQ3": {
        "strong": [
            "thermal comfort",
            "temperature control",
            "indoor temperature",
            "comfort temperature",
            "thermostat",
            "temperature sensor",
            "temperature setpoint",
            "ashrae 55",
            "ashrae 55-2004",
            "humidity control",
            "zone temperature control",
            "vav temperature control",
        ],
        "medium": [
            "heating and cooling",
            "conditioned space",
            "space conditioning",
            "temperature",
            "humidity",
            "vav",
            "variable air volume",
            "comfort conditions",
            "comfort zone",
        ],
        "weak": ["temperature"],
        "exclusions": ["co2 concentration", "power factor", "energy savings", "annual energy consumption", "energy simulation", "economizer energy savings", "kwh", "mbtu", "energy performance"],
    },
    "EQ4": {
        "strong": [
            "air change effectiveness",
            "ace",
            "ashrae 129",
            "ventilation effectiveness",
            "supply air and exhaust air",
            "return air and supply air",
            "air distribution effectiveness",
        ],
        "medium": [
            "ventilation rate",
            "air change rate",
            "outdoor air rate",
            "supply air",
            "exhaust air",
            "return air",
            "air distribution",
            "fresh air rate",
        ],
        "weak": ["ventilation"],
        "require_medium_count_if_no_strong": 2,
        "exclusions": ["co2", "carbon dioxide", "thermal comfort", "energy savings", "plug loads", "efficient lighting", "internal loads", "energy consumption"],
    },
    "EQ5": {
        "strong": ["daylight", "day light", "daylighting", "daylight lux", "daylight factor"],
        "medium": ["natural light", "borrowed light", "illuminance from daylight"],
        "weak": ["lux"],
        "exclusions": ["electric lighting", "lighting power density"],
    },
    "EQ6": {
        "strong": [
            "daylight glare",
            "sunlight glare",
            "direct sunlight",
            "solar glare",
            "daylight control system",
            "glare control blinds",
            "external glazing glare",
            "sunlight control",
            "daylight glare control",
            "blinds or covers for sunlight",
            "solar shading",
        ],
        "medium": ["blinds", "shading", "daylight", "sun path", "direct solar radiation", "solar control", "shading device"],
        "weak": ["glare"],
        "require_strong_for_high": True,
        "exclusions": ["solar pv", "photovoltaic", "computer monitor", "workstation monitor", "screen glare", "monitor glare", "electric lighting", "luminaire", "fluorescent lighting"],
    },
    "EQ7": {
        "strong": ["electrical lighting level", "lighting level", "illumination level", "illuminance level"],
        "medium": ["lux level", "lighting standard", "interior lighting level", "electric lighting", "illumination", "lux"],
        "weak": ["electrical lighting", "lighting"],
        "exclusions": ["daylight"],
    },
    "EQ8": {
        "strong": ["external views", "internal views", "view path", "visual connection", "borrowed views"],
        "medium": ["direct view", "outside view", "visual access"],
        "weak": ["views"],
    },
    "EQ9": {
        "strong": ["internal noise level", "noise level", "acoustic", "noise and vibration", "sound level"],
        "medium": ["cibse guide b4", "noise control", "vibration control"],
        "weak": ["noise"],
    },
    "WE1": {
        "strong": ["rainwater harvesting", "rain water harvesting", "rainwater tank", "rainwater collection", "collected rainwater", "rainwater reuse"],
        "medium": ["rain water", "roof runoff collection", "rainwater storage"],
        "weak": ["rainwater"],
        "require_strong_for_high": True,
        "exclusions": ["stormwater runoff", "green roof"],
    },
    "WE2": {
        "strong": ["wastewater recycling", "waste water recycling", "greywater", "gray water", "black water", "treated wastewater", "recycled wastewater"],
        "medium": ["treatment plant", "toilet flushing reuse", "landscape watering reuse"],
        "weak": ["wastewater"],
        "exclusions": ["construction waste"],
    },
    "WE3": {
        "strong": ["water meter", "water metering", "sub-metering water", "water leak detection", "leak identification system"],
        "medium": ["water sub-meter", "water management system", "leak testing"],
        "weak": ["leak detection"],
        "exclusions": ["electricity sub-metering"],
    },
    "WE4": {
        "strong": ["low-flow fittings", "efficient sanitary fittings", "sensor-controlled tap", "sensor controlled tap", "water efficient equipment", "water-saving fixtures"],
        "medium": ["efficient water accessories", "sensor controlled accessories", "low flow", "water efficient fixtures"],
        "weak": ["water accessories"],
    },
    "IN1": {
        "strong": ["green innovation", "technical committee", "innovative technology", "new power generation source", "self-cleaning surface"],
        "medium": ["innovation", "innovative", "new building material", "endothermic technique"],
        "weak": ["new technology"],
    },
    "SC1": {
        "strong": ["socio-cultural", "cultural heritage", "archaeological", "historically significant", "architectural context"],
        "medium": ["cultural compatibility", "historic zone", "social context"],
        "weak": ["heritage"],
    },
}


FOLDER_HINTS = {
    "energy": {"EE": FOLDER_HINT_WEIGHT},
    "water": {"WE": FOLDER_HINT_WEIGHT},
    "materials": {"MR": FOLDER_HINT_WEIGHT},
    "indoor_environment": {"EQ": FOLDER_HINT_WEIGHT},
    "site": {"SM": FOLDER_HINT_WEIGHT},
    "innovation": {"IN": FOLDER_HINT_WEIGHT},
    "social_culture": {"SC": FOLDER_HINT_WEIGHT},
}

DISAMBIGUATION_BOOSTS = [
    (["co2", "carbon dioxide", "ppm"], "EQ1", 5),
    (["thermal comfort", "temperature control", "indoor temperature", "ashrae 55"], "EQ3", 5),
    (["air change effectiveness", "ventilation effectiveness", "ashrae 129", "air distribution effectiveness"], "EQ4", 5),
    (ENERGY_CONTEXT_PHRASES, "EE4", 5),
    (LIGHTING_CONTEXT_PHRASES, "EE5", 3),
    (["lighting level", "illumination level", "illuminance level", "lux level"], "EQ7", 4),
    (["power factor", "capacitor bank", "reactive power"], "EE6", 6),
    (["maintenance crew", "maintenance office", "maintenance equipment"], "EE8", 6),
]


@dataclass
class Candidate:
    label: str
    score: int
    strong: list[str]
    medium: list[str]
    weak: list[str]
    conflicts: list[str]


@dataclass
class Suggestion:
    label: Optional[str]
    confidence: Optional[str]
    reason: Optional[str]
    score: Optional[int]
    candidates: list[Candidate]


def suggest_label_for_chunk(chunk, criteria: list[models.UdaCriterion]) -> Suggestion:
    text = _normalize(chunk.chunk_text)
    if not text:
        return Suggestion(None, None, "No readable text available.", None, [])

    candidates = []
    for criterion in criteria:
        candidate = _score_criterion(text, chunk.source_folder, criterion)
        if candidate.score >= MINIMUM_SUGGESTION_SCORE:
            candidates.append(candidate)

    candidates.sort(key=lambda item: (-item.score, item.label))
    if not candidates:
        return Suggestion(None, None, "No reliable criterion-specific evidence found.", None, [])

    top = candidates[0]
    runner_up_score = candidates[1].score if len(candidates) > 1 else 0
    confidence = _confidence(top, runner_up_score)
    if confidence is None:
        return Suggestion(
            None,
            None,
            "No suggestion: only weak or ambiguous evidence was found.",
            top.score,
            candidates[:3],
        )

    return Suggestion(
        top.label,
        confidence,
        _reason(top, runner_up_score),
        top.score,
        candidates[:3],
    )


def suggest_uda_label_for_text(
    text: str,
    criteria: list[models.UdaCriterion],
    source_folder: str = "",
) -> Suggestion:
    chunk = SimpleNamespace(chunk_text=text, source_folder=source_folder or "")
    return suggest_label_for_chunk(chunk, criteria)


def generate_suggestions(db, force: bool = False):
    criteria = _criteria(db)
    query = db.query(models.DatasetSourceChunk).filter(
        models.DatasetSourceChunk.human_label.is_(None)
    )
    if not force:
        query = query.filter(models.DatasetSourceChunk.suggested_label.is_(None))

    chunks = query.order_by(models.DatasetSourceChunk.id).all()
    distribution = {}
    confidence_distribution = {}
    generated = 0
    no_suggestion = 0
    low_confidence = 0

    for chunk in chunks:
        suggestion = suggest_label_for_chunk(chunk, criteria)
        chunk.suggested_label = suggestion.label
        chunk.suggestion_confidence = suggestion.confidence
        chunk.suggestion_reason = suggestion.reason
        chunk.suggestion_score = suggestion.score
        chunk.suggestion_candidates_json = _candidate_json(suggestion.candidates)
        if suggestion.label:
            generated += 1
            distribution[suggestion.label] = distribution.get(suggestion.label, 0) + 1
            confidence_distribution[suggestion.confidence] = (
                confidence_distribution.get(suggestion.confidence, 0) + 1
            )
            if suggestion.confidence == "low":
                low_confidence += 1
            if chunk.annotation_status == "unlabelled":
                chunk.annotation_status = "suggested"
        else:
            no_suggestion += 1
            if chunk.annotation_status == "suggested":
                chunk.annotation_status = "unlabelled"
        chunk.updated_at = datetime.utcnow()

    db.commit()
    return {
        "chunks_scanned": len(chunks),
        "suggestions_generated": generated,
        "no_suggestion_count": no_suggestion,
        "low_confidence_count": low_confidence,
        "confidence_distribution": dict(sorted(confidence_distribution.items())),
        "suggested_label_distribution": dict(sorted(distribution.items())),
    }


def dataset_statistics(db):
    from green_assessment.services.uda_provisional_labelling import class_distribution

    chunks = db.query(models.DatasetSourceChunk).all()
    criteria_codes = [criterion.criterion_code for criterion in _criteria(db)]
    labels = criteria_codes + ["OTHER"]
    distribution = []
    for label in labels:
        count = sum(1 for chunk in chunks if chunk.human_label == label)
        distribution.append(
            {
                "label": label,
                "count": count,
                "balance_status": _balance_status(count),
            }
        )

    labelled = sum(1 for chunk in chunks if chunk.annotation_status == "labelled")
    total = len(chunks)
    provisional_stats = class_distribution(db)
    return {
        "total_chunks": total,
        "labelled": labelled,
        "unlabelled": sum(1 for chunk in chunks if chunk.annotation_status == "unlabelled"),
        "suggested": sum(1 for chunk in chunks if chunk.annotation_status == "suggested"),
        "review_required": sum(
            1 for chunk in chunks if chunk.annotation_status == "review_required"
        ),
        "other_count": sum(1 for chunk in chunks if chunk.human_label == "OTHER"),
        "training_candidates": provisional_stats["total_training_candidates"],
        "provisional": sum(
            1 for chunk in chunks if chunk.verification_status == "provisional"
        ),
        "verified": sum(1 for chunk in chunks if chunk.verification_status == "verified"),
        "need_specialist_review": provisional_stats["need_specialist_review_count"],
        "excluded": provisional_stats["excluded_count"],
        "progress_percentage": round((labelled / total) * 100, 2) if total else 0,
        "source_folders": sorted({chunk.source_folder for chunk in chunks}),
        "filenames": sorted(
            {
                document.filename
                for document in db.query(models.DatasetSourceDocument).all()
            }
        ),
        "suggested_labels": sorted(
            {chunk.suggested_label for chunk in chunks if chunk.suggested_label}
        ),
        "human_labels": sorted({chunk.human_label for chunk in chunks if chunk.human_label}),
        "provisional_labels": sorted(
            {chunk.provisional_label for chunk in chunks if chunk.provisional_label}
        ),
        "label_sources": sorted({chunk.label_source for chunk in chunks if chunk.label_source}),
        "verification_statuses": sorted(
            {chunk.verification_status for chunk in chunks if chunk.verification_status}
        ),
        "label_distribution": distribution,
        "provisional_distribution": provisional_stats["classes"],
        "note": (
            "Class-balance statuses are prototype workflow indicators only: "
            "0 no samples, 1-9 very low, 10-29 low, 30+ sufficient for initial experimentation."
        ),
    }


def export_labelled_training_data(db, export_path: Path = LABELLED_EXPORT_PATH) -> Path:
    export_path.parent.mkdir(parents=True, exist_ok=True)
    rows = (
        db.query(models.DatasetSourceChunk, models.DatasetSourceDocument)
        .join(
            models.DatasetSourceDocument,
            models.DatasetSourceChunk.source_document_id
            == models.DatasetSourceDocument.id,
        )
        .order_by(models.DatasetSourceChunk.id)
        .all()
    )
    with export_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "chunk_id",
                "filename",
                "source_folder",
                "page_number",
                "chunk_text",
                "suggested_label",
                "suggestion_confidence",
                "human_label",
                "is_relevant",
                "annotation_status",
                "annotation_notes",
            ],
        )
        writer.writeheader()
        for chunk, document in rows:
            writer.writerow(
                {
                    "chunk_id": chunk.id,
                    "filename": document.filename,
                    "source_folder": chunk.source_folder,
                    "page_number": chunk.page_number,
                    "chunk_text": chunk.chunk_text,
                    "suggested_label": chunk.suggested_label,
                    "suggestion_confidence": chunk.suggestion_confidence,
                    "human_label": chunk.human_label,
                    "is_relevant": chunk.is_relevant,
                    "annotation_status": chunk.annotation_status,
                    "annotation_notes": chunk.annotation_notes,
                }
            )
    return export_path


def valid_labels(db) -> set[str]:
    return {criterion.criterion_code for criterion in _criteria(db)} | {"OTHER"}


def criterion_reference(db, criterion_code: Optional[str]):
    if not criterion_code or criterion_code == "OTHER":
        return None
    criterion = (
        db.query(models.UdaCriterion)
        .options(selectinload(models.UdaCriterion.required_documents))
        .filter(models.UdaCriterion.criterion_code == criterion_code)
        .first()
    )
    if not criterion:
        return None
    return {
        "criterion_code": criterion.criterion_code,
        "criterion_name": criterion.criterion_name,
        "objective": criterion.objective,
        "methodology": criterion.methodology,
        "maximum_marks": criterion.maximum_marks,
        "da_required_documents": [
            document.requirement_text
            for document in sorted(
                criterion.required_documents,
                key=lambda item: item.requirement_order,
            )
            if document.assessment_stage == "DA"
        ],
    }


def _criteria(db):
    return (
        db.query(models.UdaCriterion)
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.criterion_code)
        .all()
    )


def _score_criterion(text: str, source_folder: str, criterion) -> Candidate:
    rules = PHRASE_RULES.get(criterion.criterion_code, {})
    strong = _matched_phrases(text, rules.get("strong", []))
    medium = _matched_phrases(text, rules.get("medium", []))
    weak = _matched_phrases(text, rules.get("weak", []))
    conflicts = _matched_phrases(text, rules.get("exclusions", []))

    score = (
        len(strong) * STRONG_WEIGHT
        + len(medium) * MEDIUM_WEIGHT
        + len(weak) * WEAK_WEIGHT
        + len(conflicts) * EXCLUSION_WEIGHT
    )

    if (strong or medium) and criterion.category_code in FOLDER_HINTS.get(source_folder, {}):
        score += FOLDER_HINTS[source_folder][criterion.category_code]

    for phrases, target_label, boost in DISAMBIGUATION_BOOSTS:
        if criterion.criterion_code == target_label and _matched_phrases(text, phrases):
            score += boost

    if rules.get("require_any") and not _matched_phrases(text, rules["require_any"]):
        score = min(score, 0)

    if rules.get("require_medium_count_if_no_strong") and not strong:
        required_medium_count = rules["require_medium_count_if_no_strong"]
        if len(medium) < required_medium_count:
            score = min(score, 0)

    if criterion.criterion_code == "EQ4":
        energy_context = _matched_phrases(text, ENERGY_CONTEXT_PHRASES)
        if energy_context and not strong:
            score -= 10

    if criterion.criterion_code == "EQ6":
        workstation_conflicts = _matched_phrases(text, WORKSTATION_GLARE_CONFLICTS)
        if workstation_conflicts and not strong:
            conflicts = sorted(set(conflicts + workstation_conflicts))
            score = min(score, 0)
        if not strong and not medium:
            score = min(score, 0)

    if criterion.criterion_code == "EQ3":
        energy_context = _matched_phrases(text, ENERGY_CONTEXT_PHRASES)
        if energy_context and not strong:
            score -= 8

    if criterion.criterion_code == "EE4" and _matched_phrases(text, ENERGY_CONTEXT_PHRASES):
        score += 4

    return Candidate(
        label=criterion.criterion_code,
        score=max(score, 0),
        strong=strong,
        medium=medium,
        weak=weak,
        conflicts=conflicts,
    )


def _confidence(top: Candidate, runner_up_score: int) -> Optional[str]:
    margin = top.score - runner_up_score
    strong_count = len(top.strong)
    medium_count = len(top.medium)

    if top.score < MINIMUM_SUGGESTION_SCORE:
        return None
    if margin < AMBIGUOUS_MARGIN and top.score < 20:
        return None
    if strong_count == 0 and medium_count < 2:
        return "low" if top.score >= 5 else None
    if top.score >= 16 and strong_count >= 1 and margin >= HIGH_MARGIN:
        return "high"
    if top.score >= 8 and (strong_count >= 1 or medium_count >= 2) and margin >= MEDIUM_MARGIN:
        return "medium"
    if top.score >= 5:
        return "low"
    return None


def _reason(candidate: Candidate, runner_up_score: int) -> str:
    parts = []
    if candidate.strong:
        parts.append(f"Matched strong phrases: {', '.join(candidate.strong)}")
    if candidate.medium:
        parts.append(f"Matched medium phrases: {', '.join(candidate.medium)}")
    if candidate.weak:
        parts.append(f"Matched weak phrases: {', '.join(candidate.weak)}")
    if candidate.conflicts:
        parts.append(f"Conflict/exclusion phrases: {', '.join(candidate.conflicts)}")
    parts.append(f"Score: {candidate.score}; runner-up score: {runner_up_score}")
    return ". ".join(parts)


def _candidate_json(candidates: list[Candidate]) -> str:
    return json.dumps(
        [
            {
                "label": candidate.label,
                "score": candidate.score,
                "strong": candidate.strong,
                "medium": candidate.medium,
                "weak": candidate.weak,
                "conflicts": candidate.conflicts,
            }
            for candidate in candidates
        ]
    )


def _matched_phrases(text: str, phrases: list[str]) -> list[str]:
    matches = []
    for phrase in phrases:
        if _contains_phrase(text, phrase):
            matches.append(phrase)
    return matches


def _contains_phrase(text: str, phrase: str) -> bool:
    normalized = _normalize(phrase)
    if re.search(r"^[a-z0-9\-]+$", normalized):
        return re.search(rf"(?<![a-z0-9\-]){re.escape(normalized)}(?![a-z0-9\-])", text) is not None
    return normalized in text


def _balance_status(count: int) -> str:
    if count == 0:
        return "No samples"
    if count <= 9:
        return "Very low samples"
    if count <= 29:
        return "Low samples"
    return "Sufficient samples"


def _normalize(text: str) -> str:
    text = text.lower().replace("–", "-").replace("—", "-")
    text = text.replace("co₂", "co2").replace("m²", "m2")
    return " ".join(text.split())
