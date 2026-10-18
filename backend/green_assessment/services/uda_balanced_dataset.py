import csv
import hashlib
import json
import os
import random
import re
from collections import defaultdict
from pathlib import Path

from sqlalchemy.orm import joinedload, selectinload

from green_assessment import models


TARGET_PER_CLASS = 40
RANDOM_SEED = 20260820
EXPORT_DIR = Path("dataset_exports")
BALANCED_DATASET_PATH = EXPORT_DIR / "uda_balanced_dataset.csv"
TRAIN_PATH = EXPORT_DIR / "uda_train.csv"
VALIDATION_PATH = EXPORT_DIR / "uda_validation.csv"
TEST_PATH = EXPORT_DIR / "uda_test.csv"
STATS_PATH = EXPORT_DIR / "uda_balanced_dataset_stats.json"
AUDIT_PATH = EXPORT_DIR / "uda_balanced_dataset_audit.csv"

FIELDNAMES = [
    "text",
    "label",
    "split",
    "source_type",
    "source_document",
    "source_folder",
    "page_number",
    "original_chunk_id",
    "is_synthetic",
    "label_source",
]

# Public-document examples are the preferred source. Guideline-derived examples
# are synthetic weak supervision used only to improve coverage for
# underrepresented UDA criteria; they are not independently validated real
# project evidence.

ARTIFICIAL_TEXT_PATTERNS = [
    "criterion-topic classification",
    "controlled example",
    "not real project evidence",
    "synthetic example",
    "guideline-derived example",
    "training example",
    "this criterion",
    "the assessment note states that",
    "is relevant even though",
]

STYLE_PREFIXES = [
    "Design report:",
    "Technical specification:",
    "Consultant review:",
    "Calculation summary:",
    "Equipment schedule:",
    "Material schedule:",
    "Tender requirement:",
    "Compliance statement:",
    "Design review comment:",
    "Non-compliance note:",
]

DETAIL_CLAUSES = [
    "The item is shown on the latest design drawings.",
    "The consultant requested supporting calculations.",
    "The specification requires manufacturer documentation.",
    "The schedule will be updated before tender issue.",
    "The drawing note remains subject to detailed coordination.",
    "The current submission includes partial supporting evidence.",
    "The contractor must provide product data before procurement.",
    "The project team recorded this as a design-stage action.",
    "The report identifies the measure as part of the building strategy.",
    "The review comment asks for confirmation during the next submission.",
    "The design team has not yet provided a final calculation.",
    "The technical narrative describes the proposed approach.",
    "The evidence package will be checked during design assessment.",
    "The measure is listed in the room data or equipment schedule.",
    "The current drawings show an allowance but no final specification.",
    "The cost plan includes a provisional line item for the measure.",
    "The design review notes a gap in the submitted evidence.",
    "The consultant recommends updating the specification section.",
    "The layout drawing reserves space for the proposed system.",
    "The preliminary schedule identifies the relevant supplier data.",
    "The submission does not yet include the required certificate.",
    "The design intent is described in the sustainability report.",
    "The project team will confirm the final selection after coordination.",
    "The tender package asks bidders to price the requirement.",
    "The calculation sheet records assumptions used for the estimate.",
    "The drawing register references the latest coordinated layout.",
    "The submitted narrative states that the approach is under review.",
    "The specification clause requires installation and verification records.",
    "The consultant noted that the current allowance may be insufficient.",
    "The design revision proposes a more robust technical solution.",
    "The evidence is expected to be available before design approval.",
    "The current package includes drawings but lacks supplier confirmation.",
    "The review meeting recorded a follow-up action for the design team.",
    "The performance value is based on preliminary design information.",
    "The detailed design submission will include revised documentation.",
    "The note is written as a typical project evidence extract.",
    "The design response explains why the item has been omitted for now.",
    "The assessor requested clearer documentation in the next issue.",
    "The report states that the final value will depend on procurement.",
    "The proposed measure is coordinated with architectural and services drawings.",
]

SEMANTIC_REQUIRED = {
    "EE1": ["switch", "lighting control", "occupancy sensor", "daylight sensor"],
    "EE2": ["submeter", "sub-meter", "meter", "energy monitoring"],
    "EE3": ["photovoltaic", "solar", "renewable", "kwp"],
    "EE4": ["energy consumption", "energy simulation", "bei", "kwh", "energy performance", "efficiency"],
    "EE5": ["lighting power", "luminaire", "led", "lamp", "fittings"],
    "EE6": ["power factor", "reactive power", "capacitor", "three-phase"],
    "EE7": ["commissioning", "operation manual", "operator training", "energy performance monitoring"],
    "EE8": ["maintenance", "practical completion", "facility staff"],
    "EQ1": ["co2", "carbon dioxide", "ppm"],
    "EQ2": ["voc", "formaldehyde", "low-emitting", "pollutant"],
    "EQ3": ["thermal comfort", "temperature", "thermostat", "humidity", "ashrae 55", "vav"],
    "EQ4": ["air change", "ventilation effectiveness", "supply and exhaust", "outdoor air", "air distribution"],
    "EQ5": ["daylight", "natural light", "daylight factor"],
    "EQ6": ["glare", "direct sunlight", "solar shading", "blinds"],
    "EQ7": ["lux", "illuminance", "lighting level", "electrical lighting"],
    "EQ8": ["views", "view corridors", "visual connection"],
    "EQ9": ["noise", "acoustic", "sound", "vibration"],
    "IN1": ["innovative", "novel", "pilot", "new green", "passive"],
    "MR1": ["reused", "salvaged", "refurbished", "reclaimed", "reuse"],
    "MR2": ["recycled content", "recycled material", "recycled aggregate", "post-consumer"],
    "MR3": ["existing building", "retained", "existing structure", "demolition avoided"],
    "MR4": ["locally sourced", "regional", "within 200 km", "local supplier"],
    "MR5": ["certified timber", "fsc", "sustainable timber", "certified wood"],
    "MR6": ["green building materials", "environmentally preferable", "green products", "low-impact"],
    "MR7": ["construction waste", "waste diversion", "site waste", "waste recycling"],
    "MR8": ["refrigerant", "clean agent", "gwp", "ozone"],
    "SC1": ["historic", "cultural", "heritage", "streetscape", "local architectural"],
    "SM1": ["site selection", "wetland", "wildlife", "disaster risk", "ecological"],
    "SM2": ["brownfield", "previously developed", "contaminated site", "abandoned site"],
    "SM3": ["development density", "community", "neighbourhood", "amenity"],
    "SM4": ["environmental management", "site environmental", "pollution prevention", "environmental monitoring"],
    "SM5": ["ground cover", "vegetated", "native planting", "landscape coverage"],
    "SM6": ["dust control", "silt fence", "sedimentation", "erosion", "construction runoff"],
    "SM7": ["quality assurance", "inspection", "quality checks", "workmanship"],
    "SM8": ["worker", "site sanitation", "rest areas", "drinking water", "changing rooms"],
    "SM9": ["public transport", "bus stop", "ev charging", "green vehicle", "pedestrian access"],
    "SM10": ["carpool", "vanpool", "parking capacity", "parking spaces"],
    "SM11": ["stormwater", "runoff", "drainage", "detention", "permeable paving"],
    "SM12": ["green roof", "roof garden", "vertical greenery", "living wall"],
    "SM13": ["user manual", "occupant guide", "tenant handbook", "building systems guide"],
    "WE1": ["rainwater", "roof runoff", "harvesting"],
    "WE2": ["wastewater", "greywater", "blackwater", "treated effluent", "recycled water"],
    "WE3": ["water meter", "submeters", "leak", "water monitoring"],
    "WE4": ["sensor-controlled", "low-flow", "water-efficient", "dual-flush", "sanitary fixtures"],
}

CONFLICT_TERMS = {
    "SM9": ["carpool", "vanpool"],
    "SM10": ["bus stop", "public transport", "ev charging", "electric vehicle charging"],
    "EQ4": ["co2 sensor", "carbon dioxide sensor", "ppm"],
    "EQ6": ["computer monitor glare", "screen glare", "workstation glare"],
    "MR1": ["recycled content", "recycled material"],
    "MR2": ["salvaged", "refurbished", "reclaimed"],
    "WE1": ["wastewater", "greywater", "blackwater"],
    "WE2": ["rainwater harvesting", "roof runoff"],
}

TOPIC_BANK = {
    "EE1": ["individual switches", "lighting control zones", "occupancy sensors", "daylight sensors", "separate switch circuits", "local lighting controls"],
    "EE2": ["electricity submeters", "tenant energy meters", "main distribution board metering", "parking area submeters", "high-load equipment meters", "energy monitoring panels"],
    "EE3": ["rooftop photovoltaic panels", "solar PV array", "renewable generation", "electricity demand offset", "kWp solar capacity", "on-site renewable system"],
    "EE4": ["annual energy consumption", "building energy index", "energy simulation model", "high-efficiency HVAC", "reduced grid electricity demand", "energy performance improvement"],
    "EE5": ["efficient luminaires", "lighting power density", "LED lighting fixtures", "lamp efficacy", "lighting efficiency schedule", "low-wattage interior fittings"],
    "EE6": ["power factor correction", "capacitor banks", "reactive power compensation", "0.98 power factor", "three-phase correction panel", "electrical load correction"],
    "EE7": ["commissioning records", "energy system operation manual", "operator training", "testing and commissioning plan", "energy performance monitoring", "seasonal system tuning"],
    "EE8": ["maintenance crew mobilisation", "maintenance office", "maintenance equipment storage", "maintenance manuals", "pre-completion maintenance training", "facility maintenance staff"],
    "EQ1": ["carbon dioxide sensors", "CO2 monitoring points", "1000 ppm control limit", "indoor carbon dioxide concentration", "demand-controlled ventilation", "CO2 sensor calibration"],
    "EQ2": ["low-VOC paints", "formaldehyde limits", "volatile organic compound certificates", "low-emitting adhesives", "pollutant source control", "VOC compliance datasheets"],
    "EQ3": ["thermal comfort controls", "indoor temperature sensors", "thermostat zoning", "humidity control", "ASHRAE 55 comfort range", "VAV temperature control"],
    "EQ4": ["air change effectiveness", "ventilation effectiveness", "supply and exhaust air paths", "outdoor air rate", "air distribution testing", "ventilation rate calculations"],
    "EQ5": ["daylight factor", "natural daylight levels", "borrowed daylight", "window daylight analysis", "daylight lux measurements", "rooflight daylight contribution"],
    "EQ6": ["daylight glare control", "direct sunlight shading", "solar shading devices", "glare control blinds", "sunlight control strategy", "external glazing glare treatment"],
    "EQ7": ["interior lighting levels", "illuminance measurements", "lux readings", "task lighting levels", "electrical lighting layout", "lighting level compliance"],
    "EQ8": ["external views", "internal view corridors", "visual connection to outside", "borrowed views", "window view access", "occupied space view lines"],
    "EQ9": ["internal noise levels", "acoustic treatment", "sound insulation", "noise and vibration control", "mechanical plant noise", "reverberation control"],
    "IN1": ["innovative low-energy ventilation", "novel passive cooling measure", "new green construction material", "self-cleaning facade surface", "alternative renewable technology", "pilot sustainability feature"],
    "MR1": ["reused materials", "salvaged doors", "refurbished fittings", "reclaimed floor boards", "material reuse schedule", "restored construction products"],
    "MR2": ["recycled content", "recycled aggregate", "post-consumer recycled material", "recycled ceiling panels", "recycled material cost", "supplier recycled-content certificate"],
    "MR3": ["existing building structure", "retained floor slabs", "reuse of the existing frame", "existing facade retention", "retained building fabric", "demolition avoided"],
    "MR4": ["locally sourced materials", "regional material supply", "materials within 200 km", "local supplier documentation", "regional material cost", "nearby quarry products"],
    "MR5": ["certified timber", "FSC timber certificates", "responsibly sourced wood", "sustainable timber schedule", "certified plywood", "chain-of-custody timber evidence"],
    "MR6": ["green building materials", "high-value environmental products", "durable low-impact finishes", "environmentally preferable materials", "certified green products", "high-performance material specification"],
    "MR7": ["construction waste management plan", "waste diversion records", "salvaged construction waste", "site waste sorting", "non-hazardous waste recycling", "waste disposal tracking"],
    "MR8": ["low-GWP refrigerants", "clean fire suppression agents", "zero ozone depletion refrigerant", "refrigerant schedule", "natural refrigerant option", "cooling system refrigerant data"],
    "SC1": ["historic streetscape response", "cultural context", "local architectural character", "heritage-sensitive facade", "community cultural setting", "socially compatible building form"],
    "SM1": ["site selection study", "wetland buffer", "wildlife habitat protection", "disaster risk screening", "sensitive site avoidance", "ecological site constraints"],
    "SM2": ["brownfield redevelopment", "previously developed land", "contaminated site remediation", "abandoned site reuse", "land redevelopment report", "site rehabilitation plan"],
    "SM3": ["development density", "community coordination", "nearby public services", "neighbourhood facilities", "compact development", "community amenity access"],
    "SM4": ["environmental management plan", "site environmental controls", "construction environmental procedures", "pollution prevention method statement", "environmental monitoring plan", "contractor environmental responsibilities"],
    "SM5": ["green ground cover", "vegetated open area", "native planting", "landscape coverage", "grass pavers", "soft landscape improvement"],
    "SM6": ["construction dust control", "silt fence", "sedimentation basin", "erosion control measures", "construction runoff protection", "wheel washing bay"],
    "SM7": ["quality assurance plan", "construction inspection records", "material quality checks", "site quality procedures", "workmanship verification", "building construction QA log"],
    "SM8": ["worker welfare facilities", "site sanitation", "rest areas for workers", "drinking water provision", "changing rooms", "temporary worker facilities"],
    "SM9": ["public transport access", "reduced private vehicle use", "bus stop proximity", "carpool spaces", "pedestrian access", "transport demand management"],
    "SM10": ["parking capacity", "preferred carpool parking", "parking space reduction", "shared vehicle spaces", "vanpool parking", "parking allocation schedule"],
    "SM11": ["stormwater drainage plan", "rainwater runoff control", "detention tank", "water quality treatment", "permeable paving runoff", "drainage discharge calculation"],
    "SM12": ["green roof", "roof garden", "vertical greenery", "living wall", "vegetated roof area", "roof planting system"],
    "SM13": ["building user manual", "occupant guide", "green operation instructions", "tenant sustainability handbook", "user training document", "building systems guide"],
    "WE1": ["rainwater harvesting tank", "roof rainwater collection", "stored rainwater reuse", "toilet flushing rainwater supply", "landscape irrigation reuse", "rainwater contribution calculation"],
    "WE2": ["wastewater recycling", "greywater reuse", "treated wastewater", "recycled water for flushing", "on-site treatment plant", "reuse water balance"],
    "WE3": ["water submeters", "leak detection system", "water meter schedule", "leak alarm points", "water monitoring panel", "sub-metered water lines"],
    "WE4": ["sensor-controlled taps", "low-flow fittings", "water-efficient showerheads", "efficient sanitary fixtures", "dual-flush cisterns", "automatic water-saving accessories"],
}

VALUE_BANK = {
    "EE3": ["10%", "25%", "40%", "60%", "72 kWp"],
    "EE4": ["95 kWh/m2/year", "18% lower annual energy use", "BEI of 110 kWh/m2/year", "32% energy saving", "14% above baseline"],
    "EE5": ["7 W/m2", "65 lm/W", "40% LED fittings", "500 lux", "30% lower lighting power"],
    "EE6": ["0.92", "0.98", "60A capacitor bank", "0.85 lagging", "three-phase correction panel"],
    "EQ1": ["850 ppm", "1000 ppm", "one sensor per occupied zone", "CO2 alarms", "quarterly calibration"],
    "EQ3": ["24 C", "26 C", "55% relative humidity", "ASHRAE 55", "zone setpoints"],
    "EQ4": ["8 L/s per person", "6 air changes per hour", "outdoor air rate", "supply and return balancing", "ACE test"],
    "EQ5": ["2% daylight factor", "300 lux daylight", "daylit perimeter zones", "rooflight analysis", "window-to-wall study"],
    "EQ6": ["external blinds", "solar shading", "direct sun hours", "glare control film", "west facade shading"],
    "EQ7": ["300 lux", "500 lux", "corridor lighting levels", "task illuminance", "lux survey"],
    "MR1": ["5% reused material cost", "12% salvaged products", "refurbished doors", "reclaimed timber", "restored fittings"],
    "MR2": ["6% recycled material cost", "35% recycled content", "12% recycled aggregate", "no recycled products", "post-consumer content"],
    "MR3": ["20% existing floor area", "retained frame", "partial demolition", "existing slab retention", "facade reuse"],
    "MR4": ["8% local material cost", "10% within 200 km", "16% regional supply", "20% local sourcing", "30% nearby materials"],
    "MR7": ["35% waste diversion", "50% sorted waste", "70% recycling target", "waste transfer notes", "monthly waste report"],
    "WE1": ["3%", "5%", "8%", "10%", "14%", "20,000 litre tank"],
    "WE2": ["greywater reuse", "25% recycled water", "treated effluent", "toilet flushing reuse", "no wastewater reuse"],
    "WE3": ["main water meter", "leak alarm", "submeters on risers", "weekly water log", "flow monitoring"],
    "WE4": ["35% washroom fittings", "low-flow 6 L/min taps", "dual-flush 3/6 L cisterns", "no automatic fittings", "sensor-controlled accessories"],
}


def build_balanced_dataset(db, target_per_class: int = TARGET_PER_CLASS):
    rng = random.Random(RANDOM_SEED)
    criteria = _criteria(db)
    labels = [criterion.criterion_code for criterion in criteria] + ["OTHER"]
    criteria_by_label = {criterion.criterion_code: criterion for criterion in criteria}

    public_by_label = _public_candidates_by_label(db, labels)
    selected_by_label = {}
    duplicate_removals = 0
    leakage_before_cleanup = 0
    synthetic_near_duplicate_removals = 0
    semantic_rejections = 0
    conflict_rejections = 0
    zero_public_classes = []

    for label in labels:
        candidates = _dedupe_records(public_by_label[label])
        duplicate_removals += len(public_by_label[label]) - len(candidates)
        if not candidates:
            zero_public_classes.append(label)
        selected_public = _diverse_downsample(candidates, target_per_class, rng)
        gap = max(target_per_class - len(selected_public), 0)
        synthetic = _synthetic_examples_for_label(
            label,
            criteria_by_label.get(label),
            gap,
        )
        leakage_before_cleanup += sum(
            1 for row in synthetic if _synthetic_leakage_violations(row, label)
        )
        synthetic, cleanup = _clean_synthetic_rows(synthetic, label, gap)
        removed = cleanup["near_duplicate"] + cleanup["semantic"] + cleanup["conflict"] + cleanup["leakage"]
        synthetic_near_duplicate_removals += removed
        semantic_rejections += cleanup["semantic"]
        conflict_rejections += cleanup["conflict"]
        selected_by_label[label] = selected_public + synthetic

    rows = []
    for label in labels:
        rows.extend(selected_by_label[label])

    rows, cross_label_duplicates = _remove_cross_label_duplicates(rows)
    duplicate_removals += cross_label_duplicates
    _assign_splits(rows)
    _ensure_label_test_coverage(rows, labels)
    rows = _remove_train_test_exact_duplicates(rows)

    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    _write_csv(BALANCED_DATASET_PATH, rows)
    _write_csv(TRAIN_PATH, [row for row in rows if row["split"] == "train"])
    _write_csv(
        VALIDATION_PATH, [row for row in rows if row["split"] == "validation"]
    )
    _write_csv(TEST_PATH, [row for row in rows if row["split"] == "test"])
    _write_audit(rows, labels)

    stats = _stats(
        rows,
        labels,
        zero_public_classes,
        duplicate_removals,
        leakage_before_cleanup,
        synthetic_near_duplicate_removals,
        semantic_rejections,
        conflict_rejections,
    )
    STATS_PATH.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    return stats


def _criteria(db):
    return (
        db.query(models.UdaCriterion)
        .options(
            selectinload(models.UdaCriterion.scoring_rules),
            selectinload(models.UdaCriterion.required_documents),
        )
        .filter(models.UdaCriterion.framework == "UDA_BLUE_GREEN")
        .order_by(models.UdaCriterion.criterion_code)
        .all()
    )


def _public_candidates_by_label(db, labels):
    by_label = {label: [] for label in labels}
    chunks = (
        db.query(models.DatasetSourceChunk)
        .options(joinedload(models.DatasetSourceChunk.source_document))
        .order_by(models.DatasetSourceChunk.id)
        .all()
    )
    for chunk in chunks:
        label = None
        label_source = None
        if chunk.human_label in by_label and chunk.verification_status == "verified":
            label = chunk.human_label
            label_source = "verified"
        elif (
            chunk.provisional_label in by_label
            and chunk.verification_status == "provisional"
            and chunk.provisional_confidence == "high"
            and not _looks_like_ocr_garbage(chunk.chunk_text)
        ):
            label = chunk.provisional_label
            label_source = (
                "generic_other"
                if chunk.provisional_label == "OTHER"
                else "rule_assisted_public"
            )
        if not label:
            continue
        by_label[label].append(
            {
                "text": chunk.chunk_text.strip(),
                "label": label,
                "split": "",
                "source_type": "public_document",
                "source_document": chunk.source_document.filename,
                "source_folder": chunk.source_folder,
                "page_number": chunk.page_number,
                "original_chunk_id": chunk.id,
                "is_synthetic": False,
                "label_source": label_source,
                "_group": f"public:{chunk.source_document_id}",
                "_norm": _normalize(chunk.chunk_text),
            }
        )
    return by_label


def _diverse_downsample(records, target, rng):
    if len(records) <= target:
        return records
    shuffled = records[:]
    rng.shuffle(shuffled)
    selected = []
    for record in shuffled:
        if _is_diverse_enough(record, selected):
            selected.append(record)
        if len(selected) >= target:
            return selected
    for record in shuffled:
        if record not in selected:
            selected.append(record)
        if len(selected) >= target:
            break
    return selected


def _is_diverse_enough(record, selected):
    tokens = _token_set(record["_norm"])
    for item in selected:
        if _jaccard(tokens, _token_set(item["_norm"])) > 0.82:
            return False
    return True


def _synthetic_examples_for_label(label, criterion, count):
    if count <= 0:
        return []
    if label == "OTHER":
        return _synthetic_other_examples(max(count * 3, 60))
    if criterion is None:
        return []

    topics = TOPIC_BANK.get(label, _fallback_topics(criterion))
    values = VALUE_BANK.get(label, _generic_values(criterion))
    evidence_terms = _document_terms(criterion)
    contexts = _contexts_for_category(criterion.category_code)
    patterns = _evidence_patterns()
    rows = []
    target_candidates = max(count * 8, 220)
    for family_index in range(target_candidates):
        term = topics[family_index % len(topics)]
        secondary = topics[(family_index + 2) % len(topics)]
        value = values[family_index % len(values)]
        evidence = evidence_terms[family_index % len(evidence_terms)]
        context = contexts[family_index % len(contexts)]
        pattern = patterns[family_index % len(patterns)]
        detail = _detail_clause(family_index, term, secondary, value, context)
        text = pattern.format(
            term=term,
            secondary=secondary,
            value=value,
            evidence=evidence,
            context=context,
        )
        text = f"{text} {detail}"
        rows.append(
            {
                "text": text.strip(),
                "label": label,
                "split": "",
                "source_type": "guideline_derived",
                "source_document": "Blue Green Sri Lanka - Green Building Guidelines for Sri Lanka",
                "source_folder": criterion.category_code,
                "page_number": criterion.source_page,
                "original_chunk_id": "",
                "is_synthetic": True,
                "label_source": "guideline_derived",
            "_group": f"synthetic:{label}:{family_index % len(patterns)}",
                "_norm": "",
            }
        )
        rows[-1]["_norm"] = _normalize(rows[-1]["text"])
    return rows


def _synthetic_other_examples(count):
    templates = [
        "The meeting minutes record attendance, apologies, and the next coordination date.",
        "The cover page lists the report title, document revision, author, and publication date.",
        "The contract administration section describes payment certificates and submission deadlines.",
        "The drawing register records sheet numbers, issue status, and consultant discipline.",
        "The project introduction summarises the client background without environmental performance data.",
        "The bibliography lists publications, URLs, and reference numbers for further reading.",
        "The appendix index identifies forms, checklists, and administrative attachments.",
        "The general notes require contractors to coordinate dimensions before fabrication.",
        "The structural note states that reinforcement shop drawings shall be submitted before casting.",
        "The architect's instruction confirms the revised door numbering sequence for the ground floor.",
        "The programme update records procurement dates, inspection windows, and pending approvals.",
        "The quantity schedule lists preliminaries, contingencies, and provisional administrative items.",
    ]
    rows = []
    for index in range(count):
        text = templates[index % len(templates)]
        if index >= len(templates):
            text = f"{text} Revision reference {index + 1} is recorded for document control."
        rows.append(
            {
                "text": text,
                "label": "OTHER",
                "split": "",
                "source_type": "generic_other",
                "source_document": "Generated generic non-UDA control text",
                "source_folder": "generic_other",
                "page_number": "",
                "original_chunk_id": "",
                "is_synthetic": True,
                "label_source": "generic_other",
                "_group": f"synthetic:OTHER:{index % len(templates)}",
                "_norm": _normalize(text),
            }
        )
    return rows


def _evidence_patterns():
    return [
        "{term} will be incorporated into the {context}, and the current estimate records {value}.",
        "No allowance for {term} is visible in the current {context}; the next submission should clarify the omission.",
        "The {context} includes {term}, but {secondary} remains unresolved at this design stage.",
        "A revised schedule will quantify {term} using {value} and supporting {evidence}.",
        "{secondary} is proposed as a later upgrade because the present design only includes limited {term}.",
        "The consultant requested {evidence} to confirm how {term} will perform in the completed building.",
        "During design review, {term} was identified as a required improvement for the {context}.",
        "The specification asks suppliers to provide {evidence} for {term} before procurement.",
        "{term} is described in the sustainability narrative, although the submitted drawings do not yet show the final arrangement.",
        "The project team reported {value} for {term} based on the preliminary {context}.",
        "A shortfall in {term} was noted during the review, and {secondary} was suggested as a corrective measure.",
        "The tender package requires bidders to price {term} and include {evidence}.",
        "The current design provides {term} for only part of the {context}.",
        "{term} has been omitted from the baseline scheme, so the report recommends adding {secondary}.",
        "The calculation sheet links {value} to {term} and records the assumptions used by the design team.",
        "A supplier submission is required because {term} cannot be verified from the drawings alone.",
        "The architectural and services drawings have been coordinated to reserve space for {term}.",
        "The design response states that {term} will be confirmed after the next round of technical coordination.",
        "Only preliminary information is available for {term}; final {evidence} is still pending.",
        "{secondary} is mentioned in the report as an alternative if {term} cannot be achieved.",
        "The detailed design package should include {term}, the relevant {evidence}, and a clear location on the drawings.",
        "A non-compliance comment was raised because {term} is absent from the submitted {context}.",
        "The construction specification includes {term} as a performance requirement for the contractor.",
        "The project narrative describes how {term} will be maintained or verified during operation.",
        "{value} was used as the design assumption for {term} in the latest calculation summary.",
        "The drawings show partial provision for {term}, while the remaining areas depend on {secondary}.",
        "The design team proposed {term} after comparing the baseline scheme with a higher-performance option.",
        "The submitted {context} records {term} but does not include enough {evidence}.",
        "The review meeting assigned an action to update the {context} for {term}.",
        "{term} is expected to be documented through {evidence} before the design package is finalised.",
        "The current scheme achieves some provision for {term}, but the consultant recommended increasing it.",
        "A future revision will add {secondary} to strengthen the current approach to {term}.",
        "The performance note explains that {term} may fall below the intended level without further design work.",
        "The equipment or material schedule lists {term} with a preliminary value of {value}.",
        "The applicant stated that {term} will be addressed in the next coordinated drawing issue.",
        "The report compares a no-action option with a design option that includes {term}.",
        "{term} is included as a provisional item and will be supported by {evidence} during detailed design.",
        "The assessor asked for a clearer explanation of {term} in relation to the {context}.",
        "The project team noted that {secondary} could improve the submitted design where {term} is currently weak.",
        "The final specification should describe installation, testing, and verification of {term}.",
    ]


def _fallback_topics(criterion):
    words = [
        word
        for word in re.split(r"[^A-Za-z0-9%]+", criterion.criterion_name.lower())
        if len(word) > 3 and word not in {"building", "green", "criteria"}
    ]
    if not words:
        return ["project sustainability measure"]
    return [" ".join(words[:3]), " ".join(words[-3:]), f"{words[0]} design measure"]


def _generic_values(criterion):
    if criterion.category_code == "EE":
        return ["design-stage estimate", "scheduled performance", "measured operating value", "equipment datasheet value", "commissioning result"]
    if criterion.category_code == "WE":
        return ["water balance estimate", "fixture schedule value", "metered design flow", "calculated reduction", "tank capacity"]
    if criterion.category_code == "MR":
        return ["material cost percentage", "supplier certificate", "BOQ allowance", "procurement schedule value", "product datasheet value"]
    if criterion.category_code == "EQ":
        return ["occupied space measurement", "design setpoint", "comfort target", "manufacturer certificate", "inspection record"]
    if criterion.category_code == "SM":
        return ["site plan allowance", "method statement requirement", "construction-stage record", "landscape schedule value", "access plan note"]
    return ["design narrative evidence", "technical report note", "supporting schedule value", "review comment", "submitted document reference"]


def _document_terms(criterion):
    return {
        "EE": ["energy calculation", "equipment datasheet", "electrical schedule", "commissioning plan", "services drawing"],
        "WE": ["water balance calculation", "fixture schedule", "plumbing layout", "tank sizing note", "metering diagram"],
        "MR": ["supplier certificate", "material schedule", "BOQ extract", "product datasheet", "procurement record"],
        "EQ": ["room data sheet", "manufacturer datasheet", "measurement report", "mechanical layout", "interior specification"],
        "SM": ["site plan", "method statement", "landscape schedule", "transport study", "construction procedure"],
        "IN": ["technical proposal", "pilot study note", "performance report", "concept narrative", "specialist review"],
        "SC": ["architectural statement", "context study", "heritage note", "facade report", "community consultation record"],
    }.get(
        criterion.category_code,
        ["design report", "technical calculation", "specification schedule", "drawing note", "supplier datasheet"],
    )


def _clean_document_term(value):
    value = re.sub(r"\b[A-Z]{2}\d+\b", "", value or "")
    value = re.sub(r"^\s*\d+[\.\)]\s*", "", value)
    value = re.sub(r"\s+", " ", value).strip(" .,:;")
    value = re.sub(r"(?i)\buda\b|\bcriterion\b", "", value)
    if not value:
        return ""
    return value[:120].rstrip(" ,;:")


def _contexts_for_category(category_code):
    return {
        "EE": ["main building services", "electrical design", "plant room layout", "energy model", "tenant area"],
        "WE": ["plumbing design", "washroom schedule", "water balance", "landscape irrigation layout", "service riser"],
        "MR": ["material procurement package", "BOQ summary", "finishes schedule", "supplier submission", "construction specification"],
        "EQ": ["occupied spaces", "mechanical design", "interior layout", "facade zone", "room data sheets"],
        "SM": ["site layout", "construction method statement", "landscape plan", "access strategy", "external works"],
        "IN": ["concept design", "sustainability narrative", "pilot installation", "technical proposal", "research demonstration"],
        "SC": ["architectural design statement", "urban context study", "facade strategy", "community interface", "heritage setting"],
    }.get(category_code, ["design submission", "technical report", "project specification"])


def _detail_clause(index, term, secondary, value, context):
    templates = [
        "This affects the {context} rather than general administration.",
        "The note should be read with the latest {context} submission.",
        "The design team still needs to confirm the final arrangement for {term}.",
        "The value of {value} is included to show the design intent.",
        "The reviewer asked whether {secondary} should also be included.",
        "This entry describes a design condition, not a final award of marks.",
        "The item remains subject to coordination with architectural and services drawings.",
        "Procurement records will need to match the stated design intent.",
        "The next design issue should clarify responsibility for implementation.",
        "The submitted evidence is sufficient for topic identification but not final verification.",
        "The current package treats {term} as a preliminary design measure.",
        "A follow-up calculation will confirm whether {value} is still valid.",
        "The relevant drawing note is expected in the next coordinated issue.",
        "The consultant recorded this as a design-stage observation.",
        "The measure is linked to the building performance narrative.",
        "The specification will be revised once suppliers confirm the product data.",
        "The team noted that the baseline option did not include {term}.",
        "The report uses {value} as an indicative design assumption.",
        "The design action is assigned to the relevant consultant discipline.",
        "The evidence will be checked again before approval of the final design.",
    ]
    return templates[index % len(templates)].format(
        term=term,
        secondary=secondary,
        value=value,
        context=context,
    )


def _clean_synthetic_rows(rows, label, target):
    cleaned = []
    cleanup = {"leakage": 0, "near_duplicate": 0, "semantic": 0, "conflict": 0}
    for row in rows:
        if _synthetic_leakage_violations(row, label):
            cleanup["leakage"] += 1
            continue
        if not _passes_semantic_validation(row, label):
            cleanup["semantic"] += 1
            continue
        if _has_cross_criterion_conflict(row, label):
            cleanup["conflict"] += 1
            continue
        if _is_near_duplicate(row, cleaned, threshold=0.88):
            cleanup["near_duplicate"] += 1
            continue
        cleaned.append(row)
        if len(cleaned) >= target:
            break
    return cleaned, cleanup


def _is_near_duplicate(row, selected, threshold):
    tokens = _token_set(row["_norm"])
    for item in selected:
        if _jaccard(tokens, _token_set(item["_norm"])) > threshold:
            return True
    return False


def _synthetic_leakage_violations(row, label):
    text = row["text"]
    normalized = _normalize(text)
    code_pattern = rf"(?<![a-z0-9]){re.escape(label.lower())}(?![a-z0-9])"
    if label != "OTHER" and re.search(code_pattern, normalized):
        return True
    if any(pattern in normalized for pattern in ARTIFICIAL_TEXT_PATTERNS):
        return True
    if re.search(r"\bcriterion\s+[a-z]{2}\d+\b", normalized):
        return True
    if re.search(r"\b[a-z]{2}\d+\s+criterion\b", normalized):
        return True
    return False


def _passes_semantic_validation(row, label):
    if label == "OTHER":
        return True
    normalized = _normalize(row["text"])
    required = SEMANTIC_REQUIRED.get(label, [])
    return any(_normalize(term) in normalized for term in required)


def _has_cross_criterion_conflict(row, label):
    normalized = _normalize(row["text"])
    return any(_normalize(term) in normalized for term in CONFLICT_TERMS.get(label, []))


def _assign_splits(rows):
    public_groups = sorted(
        {row["_group"] for row in rows if row["source_type"] == "public_document"}
    )
    public_split_by_group = _split_groups(public_groups)
    synthetic_by_label = defaultdict(list)
    for row in rows:
        if row["source_type"] == "public_document":
            row["split"] = public_split_by_group.get(row["_group"], "train")
        else:
            synthetic_by_label[row["label"]].append(row)

    for label, label_rows in synthetic_by_label.items():
        label_rows.sort(key=lambda row: row["_group"])
        counts = _desired_split_counts(len(label_rows))
        for index, row in enumerate(label_rows):
            if index < counts["train"]:
                row["split"] = "train"
            elif index < counts["train"] + counts["validation"]:
                row["split"] = "validation"
            else:
                row["split"] = "test"


def _ensure_label_test_coverage(rows, labels):
    global_group_sizes = defaultdict(int)
    for row in rows:
        global_group_sizes[row["_group"]] += 1

    for label in labels:
        label_rows = [row for row in rows if row["label"] == label]
        if len(label_rows) < 3 or any(row["split"] == "test" for row in label_rows):
            continue
        grouped = defaultdict(list)
        for row in label_rows:
            grouped[row["_group"]].append(row)
        candidate_groups = [
            (group, group_rows)
            for group, group_rows in grouped.items()
            if group_rows[0]["source_type"] == "public_document"
            and group_rows[0]["split"] == "train"
        ]
        if not candidate_groups:
            candidate_groups = [
                (group, group_rows)
                for group, group_rows in grouped.items()
                if group_rows[0]["split"] == "train"
            ]
        if not candidate_groups:
            continue
        group_to_move = min(
            candidate_groups,
            key=lambda item: (global_group_sizes[item[0]], len(item[1])),
        )[0]
        for row in rows:
            if row["_group"] == group_to_move:
                row["split"] = "test"


def _split_groups(groups):
    rng = random.Random(RANDOM_SEED)
    shuffled = groups[:]
    rng.shuffle(shuffled)
    counts = _desired_split_counts(len(shuffled))
    result = {}
    for index, group in enumerate(shuffled):
        if index < counts["train"]:
            result[group] = "train"
        elif index < counts["train"] + counts["validation"]:
            result[group] = "validation"
        else:
            result[group] = "test"
    return result


def _desired_split_counts(total):
    if total <= 0:
        return {"train": 0, "validation": 0, "test": 0}
    train = round(total * 0.70)
    validation = round(total * 0.15)
    test = total - train - validation
    if total >= 3:
        if validation == 0:
            validation = 1
            train -= 1
        if test == 0:
            test = 1
            train -= 1
    return {"train": max(train, 0), "validation": validation, "test": test}


def _remove_train_test_exact_duplicates(rows):
    seen_by_text = {}
    result = []
    for row in rows:
        normalized = _normalize(row["text"])
        previous_split = seen_by_text.get(normalized)
        if previous_split and previous_split != row["split"]:
            continue
        seen_by_text[normalized] = row["split"]
        result.append(row)
    return result


def _remove_cross_label_duplicates(rows):
    seen = {}
    result = []
    removed = 0
    for row in rows:
        normalized = _normalize(row["text"])
        existing_label = seen.get(normalized)
        if existing_label and existing_label != row["label"]:
            removed += 1
            continue
        seen[normalized] = row["label"]
        result.append(row)
    return result, removed


def _dedupe_records(records):
    seen = set()
    result = []
    for record in records:
        digest = hashlib.sha256(record["_norm"].encode("utf-8")).hexdigest()
        if digest in seen:
            continue
        seen.add(digest)
        result.append(record)
    return result


def _write_csv(path, rows):
    with path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=FIELDNAMES)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row[field] for field in FIELDNAMES})


def _write_audit(rows, labels):
    rng = random.Random(RANDOM_SEED)
    audit_rows = []
    for label in labels:
        label_rows = [row for row in rows if row["label"] == label]
        audit_rows.extend(
            rng.sample(label_rows, min(3, len(label_rows))) if label_rows else []
        )
    temp_path = AUDIT_PATH.with_suffix(".csv.tmp")
    with temp_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "label",
                "text",
                "source_type",
                "is_synthetic",
                "source_document",
                "page_number",
            ],
        )
        writer.writeheader()
        for row in audit_rows:
            writer.writerow(
                {
                    "label": row["label"],
                    "text": row["text"],
                    "source_type": row["source_type"],
                    "is_synthetic": row["is_synthetic"],
                    "source_document": row["source_document"],
                    "page_number": row["page_number"],
                }
            )
    os.replace(temp_path, AUDIT_PATH)


def _stats(
    rows,
    labels,
    zero_public_classes,
    duplicate_removals,
    leakage_before_cleanup,
    synthetic_near_duplicate_removals,
    semantic_rejections,
    conflict_rejections,
):
    total = len(rows)
    public = sum(1 for row in rows if not row["is_synthetic"])
    synthetic = total - public
    by_class = []
    for label in labels:
        label_rows = [row for row in rows if row["label"] == label]
        by_class.append(
            {
                "label": label,
                "total": len(label_rows),
                "public": sum(1 for row in label_rows if not row["is_synthetic"]),
                "guideline_derived": sum(
                    1
                    for row in label_rows
                    if row["source_type"] in {"guideline_derived", "generic_other"}
                ),
                "train": sum(1 for row in label_rows if row["split"] == "train"),
                "validation": sum(
                    1 for row in label_rows if row["split"] == "validation"
                ),
                "test": sum(1 for row in label_rows if row["split"] == "test"),
            }
        )
    test_rows = [row for row in rows if row["split"] == "test"]
    synthetic_total = sum(1 for row in rows if row["is_synthetic"])
    common_prefixes = _common_synthetic_edges(rows, "prefix")
    common_suffixes = _common_synthetic_edges(rows, "suffix")
    return {
        "target_per_class": TARGET_PER_CLASS,
        "total_dataset_size": total,
        "number_of_classes": len(labels),
        "public_count": public,
        "synthetic_count": synthetic,
        "public_percentage": round((public / total) * 100, 2) if total else 0,
        "synthetic_percentage": round((synthetic / total) * 100, 2) if total else 0,
        "split_sizes": {
            "train": sum(1 for row in rows if row["split"] == "train"),
            "validation": sum(1 for row in rows if row["split"] == "validation"),
            "test": len(test_rows),
        },
        "real_test_samples": sum(
            1 for row in test_rows if row["source_type"] == "public_document"
        ),
        "synthetic_test_samples": sum(1 for row in test_rows if row["is_synthetic"]),
        "classes_with_zero_public_examples": zero_public_classes,
        "average_text_length": round(
            sum(len(row["text"]) for row in rows) / total, 2
        )
        if total
        else 0,
        "duplicate_removals": duplicate_removals,
        "synthetic_near_duplicate_removals": synthetic_near_duplicate_removals,
        "semantic_validation_rejections": semantic_rejections,
        "cross_criterion_conflict_rejections": conflict_rejections,
        "label_code_leakage_violations_before_cleanup": leakage_before_cleanup,
        "label_code_leakage_violations_after_cleanup": _synthetic_leakage_count(rows),
        "artificial_disclaimer_phrase_count_after_cleanup": _artificial_phrase_count(rows),
        "common_synthetic_prefixes": common_prefixes,
        "common_synthetic_suffixes": common_suffixes,
        "max_repeated_prefix_percentage": round(
            (common_prefixes[0]["count"] / synthetic_total) * 100, 2
        )
        if synthetic_total and common_prefixes
        else 0,
        "max_repeated_suffix_percentage": round(
            (common_suffixes[0]["count"] / synthetic_total) * 100, 2
        )
        if synthetic_total and common_suffixes
        else 0,
        "class_distribution": by_class,
        "outputs": {
            "balanced_dataset": str(BALANCED_DATASET_PATH),
            "train": str(TRAIN_PATH),
            "validation": str(VALIDATION_PATH),
            "test": str(TEST_PATH),
            "stats": str(STATS_PATH),
            "audit": str(AUDIT_PATH),
        },
        "validation": _validate(rows, labels),
    }


def _validate(rows, labels):
    normalized_by_label = defaultdict(set)
    text_labels = defaultdict(set)
    for row in rows:
        normalized = _normalize(row["text"])
        normalized_by_label[row["label"]].add(normalized)
        text_labels[normalized].add(row["label"])
    train_texts = {_normalize(row["text"]) for row in rows if row["split"] == "train"}
    test_texts = {_normalize(row["text"]) for row in rows if row["split"] == "test"}
    return {
        "expected_label_count": len(labels),
        "actual_label_count": len({row["label"] for row in rows}),
        "missing_labels": sorted(set(labels) - {row["label"] for row in rows}),
        "empty_text_count": sum(1 for row in rows if not row["text"].strip()),
        "missing_label_count": sum(1 for row in rows if not row["label"]),
        "cross_label_duplicate_text_count": sum(
            1 for labels_for_text in text_labels.values() if len(labels_for_text) > 1
        ),
        "train_test_exact_duplicate_count": len(train_texts & test_texts),
        "missing_metadata_count": sum(
            1
            for row in rows
            if not row["source_type"] or not row["label_source"]
        ),
        "synthetic_flag_errors": sum(
            1
            for row in rows
            if (row["source_type"] == "public_document" and row["is_synthetic"])
            or (row["source_type"] != "public_document" and not row["is_synthetic"])
        ),
        "synthetic_label_code_leakage_count": _synthetic_leakage_count(rows),
        "artificial_disclaimer_phrase_count": _artificial_phrase_count(rows),
    }


def _synthetic_leakage_count(rows):
    return sum(
        1
        for row in rows
        if row["is_synthetic"] and _synthetic_leakage_violations(row, row["label"])
    )


def _artificial_phrase_count(rows):
    return sum(
        1
        for row in rows
        if row["is_synthetic"]
        and any(pattern in _normalize(row["text"]) for pattern in ARTIFICIAL_TEXT_PATTERNS)
    )


def _common_synthetic_edges(rows, edge):
    counts = defaultdict(int)
    for row in rows:
        if not row["is_synthetic"]:
            continue
        words = row["text"].split()
        if len(words) < 6:
            continue
        key = " ".join(words[:5] if edge == "prefix" else words[-5:])
        counts[key] += 1
    return [
        {"text": text, "count": count}
        for text, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:10]
    ]


def _short_text(value, fallback):
    value = " ".join((value or fallback or "").split())
    if not value:
        return fallback
    sentences = re.split(r"(?<=[.!?])\s+", value)
    return sentences[0][:220].rstrip(" ,;:")


def _normalize(text):
    return re.sub(r"[^a-z0-9%]+", " ", text.lower()).strip()


def _token_set(text):
    return {token for token in text.split() if len(token) > 2}


def _jaccard(left, right):
    if not left or not right:
        return 0
    return len(left & right) / len(left | right)


def _looks_like_ocr_garbage(text):
    stripped = "".join(text.split())
    if len(stripped) < 30:
        return True
    alpha_count = sum(1 for char in stripped if char.isalpha())
    return alpha_count / max(len(stripped), 1) < 0.35
