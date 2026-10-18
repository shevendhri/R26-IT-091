import re
from dataclasses import dataclass
from typing import Optional


PERCENT_PATTERN = re.compile(
    r"(?P<value>\d+(?:\.\d+)?)\s*(?:%|percent|percentage)",
    re.IGNORECASE,
)
WORD_PERCENT_PATTERN = re.compile(
    r"\b(?P<word>one|two|three|four|five|six|seven|eight|nine|ten)\s+percent\b",
    re.IGNORECASE,
)
DECIMAL_OF_TOTAL_PATTERN = re.compile(
    r"(?P<value>0\.\d+)\s+of\s+(?:the\s+)?(?:total\s+)?(?P<context>[a-z\s]{0,60})",
    re.IGNORECASE,
)
KWP_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s*kWp\b", re.IGNORECASE)
KW_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s*kW\b", re.IGNORECASE)
DISTANCE_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s*(?:m|km)\b", re.IGNORECASE)
FLOW_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s*(?:L/min|LPM|litres/min)\b", re.IGNORECASE)
PPM_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s*ppm\b", re.IGNORECASE)
POWER_FACTOR_PATTERN = re.compile(
    r"\b(?:power[-\s]?factor|pf|power factor correction(?:\s+target)?)"
    r"[^0-9]{0,80}(?P<value>0\.\d+|1(?:\.0+)?)\b",
    re.IGNORECASE,
)
POWER_FACTOR_REVERSE_PATTERN = re.compile(
    r"\b(?P<value>0\.\d+|1(?:\.0+)?)\b[^.]{0,80}\b(?:power[-\s]?factor|pf)\b",
    re.IGNORECASE,
)


@dataclass
class ExtractedScoringValue:
    metric: Optional[str]
    value: Optional[float]
    unit: Optional[str]
    matched_text: Optional[str]
    confidence: str
    reason: str
    extraction_method: str = "deterministic_context_regex"
    negative_evidence: bool = False


CRITERION_CONTEXTS = {
    "EE3": {
        "metrics": {
            "electricity_contract_demand_met_by_solar_percentage": [
                "electricity demand",
                "contract demand",
                "annual electricity demand",
                "building electricity demand",
                "grid electricity",
                "renewable energy",
                "renewable generation",
                "pv",
                "photovoltaic",
                "solar",
            ],
            "solar_panel_plot_coverage_percentage": [
                "plot coverage",
                "building plot",
                "roof coverage",
                "site coverage",
                "solar panel coverage",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:renewable energy system|on-site renewable|onsite renewable|solar pv|photovoltaic|pv system)\b",
            r"\b(?:renewable energy system|on-site renewable|onsite renewable|solar pv|photovoltaic|pv system)\b.{0,35}\b(?:not proposed|not included|not provided|not installed|absent)\b",
            r"\bdoes not include\b.{0,35}\b(?:renewable|solar|photovoltaic|pv)\b",
        ],
    },
    "EE4": {
        "metrics": {
            "building_energy_index": [
                "building energy index",
                "bei",
                "kwh/m2",
                "kwh/m²",
                "kwh/m2/year",
                "energy index",
            ],
        },
        "number_patterns": [
            re.compile(r"(?P<value>\d+(?:\.\d+)?)\s*kwh\s*/?\s*m(?:2|²)(?:\s*/?\s*year)?", re.IGNORECASE),
        ],
    },
    "EE6": {
        "metrics": {
            "power_factor_correction_accuracy": [
                "power factor",
                "power-factor",
                "power factor correction",
                "pf correction",
                "capacitor bank",
                "reactive power",
                "three phase",
                "three-phase",
            ],
        },
        "negative": [
            r"\bno\b.{0,45}\b(?:power factor correction|power-factor correction|capacitor bank|reactive power correction)\b",
            r"\b(?:power factor correction|power-factor correction|capacitor bank|reactive power correction)\b.{0,45}\b(?:not proposed|not included|not provided|absent)\b",
        ],
    },
    "EQ1": {
        "metrics": {
            "co2_concentration_ppm": [
                "co2",
                "carbon dioxide",
                "co2 sensor",
                "co2 sensors",
                "co2 gauge",
                "co2 monitoring",
                "co2 monitor",
                "indoor co2",
                "ppm",
            ],
        },
    },
    "SM2": {
        "metrics": {
            "redeveloped_brownfield_land_percentage": [
                "brownfield",
                "previously developed",
                "redeveloped land",
                "abandoned site",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:brownfield|previously developed land)\b",
            r"\bnot\s+a\s+brownfield\b",
            r"\bgreenfield site\b",
        ],
    },
    "SM10": {
        "metrics": {
            "carpool_vanpool_parking_percentage": [
                "carpool",
                "vanpool",
                "preferred parking",
                "parking capacity",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:carpool|vanpool|preferred parking)\b",
            r"\b(?:carpool|vanpool|preferred parking)\b.{0,35}\b(?:not proposed|not included|not provided|absent)\b",
        ],
    },
    "MR1": {
        "metrics": {
            "reused_material_value_percentage": [
                "reused material",
                "reuse of materials",
                "salvaged material",
                "refurbished material",
                "reclaimed material",
                "material reuse",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:reused material|salvaged material|reclaimed material|material reuse)\b",
            r"\b(?:reused material|salvaged material|reclaimed material|material reuse)\b.{0,35}\b(?:not proposed|not included|not specified|absent)\b",
        ],
    },
    "MR2": {
        "metrics": {
            "recycled_material_value_percentage": [
                "recycled content",
                "recycled material",
                "recycled substance",
                "post-consumer",
                "pre-consumer",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:recycled content|recycled-content|recycled material)\b",
            r"\b(?:recycled content|recycled-content|recycled material)\b.{0,35}\b(?:not proposed|not included|not specified|absent)\b",
        ],
    },
    "MR3": {
        "metrics": {
            "existing_building_reuse_area_percentage": [
                "existing building",
                "building reuse",
                "retained structure",
                "existing floor area",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:existing building|building reuse|retained structure)\b",
            r"\b(?:existing building|building reuse|retained structure)\b.{0,35}\b(?:not proposed|not included|not retained|absent)\b",
            r"\bnew construction only\b",
        ],
    },
    "MR4": {
        "metrics": {
            "regional_material_cost_percentage": [
                "regional materials",
                "locally sourced",
                "within 200 km",
                "local materials",
                "regional material cost",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:regional materials|locally sourced materials|local materials)\b",
            r"\b(?:regional materials|locally sourced materials|local materials)\b.{0,35}\b(?:not proposed|not included|not specified|absent)\b",
        ],
    },
    "MR7": {
        "metrics": {
            "nonhazardous_construction_waste_recycled_percentage": [
                "construction waste",
                "waste recycled",
                "waste diversion",
                "salvage waste",
                "non-hazardous construction waste",
            ],
        },
        "negative": [
            r"\bno\b.{0,45}\b(?:construction waste recycling|waste diversion|waste recycling|waste salvage|waste recovery)\b",
            r"\b(?:construction waste recycling|waste diversion|waste recycling|waste salvage|waste recovery)\b.{0,45}\b(?:not proposed|not included|not required|absent)\b",
        ],
    },
    "WE1": {
        "metrics": {
            "rainwater_use_percentage": [
                "rainwater",
                "rain water",
                "roof runoff",
                "rainwater harvesting",
                "collected rainwater",
                "water requirement",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:rainwater harvesting|rainwater system|rain water harvesting|rain water system)\b",
            r"\b(?:rainwater harvesting|rainwater system|rain water harvesting|rain water system)\b.{0,35}\b(?:not proposed|not included|not provided|absent)\b",
            r"\bdoes not provide\b.{0,35}\b(?:rainwater|rain water)\b",
        ],
    },
    "WE2": {
        "metrics": {
            "wastewater_recycled_percentage": [
                "wastewater recycling",
                "waste water recycling",
                "greywater",
                "gray water",
                "treated wastewater",
                "recycled wastewater",
            ],
            "wastewater_refined_and_disposed_percentage": [
                "refined wastewater",
                "disposed",
                "treated and disposed",
                "wastewater treatment",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:wastewater recycling|waste water recycling|greywater|gray water|wastewater treatment)\b",
            r"\b(?:wastewater recycling|waste water recycling|greywater|gray water|wastewater treatment)\b.{0,35}\b(?:not proposed|not included|not provided|absent)\b",
        ],
    },
    "WE4": {
        "metrics": {
            "water_efficient_accessories_percentage": [
                "water efficient",
                "low-flow",
                "low flow",
                "sensor-controlled",
                "sensor controlled",
                "sanitary fittings",
                "water-saving fixtures",
            ],
        },
        "negative": [
            r"\bno\b.{0,35}\b(?:low-flow|low flow|water efficient|sensor-controlled|sensor controlled|efficient sanitary fittings)\b",
            r"\b(?:low-flow|low flow|water efficient|sensor-controlled|sensor controlled|efficient sanitary fittings)\b.{0,35}\b(?:not proposed|not included|not specified|absent)\b",
        ],
    },
}

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
}


def extract_scoring_value(criterion_code: str, text: str) -> ExtractedScoringValue:
    normalized = _normalize(text)
    config = CRITERION_CONTEXTS.get(criterion_code)
    if not config:
        return ExtractedScoringValue(
            metric=None,
            value=None,
            unit=None,
            matched_text=None,
            confidence="low",
            reason="Criterion is not configured for deterministic value extraction.",
        )

    if _has_negative_evidence(normalized, config.get("negative", [])):
        return ExtractedScoringValue(
            metric=_default_metric(config),
            value=0,
            unit="%",
            matched_text=_negative_matched_text(text, config.get("negative", [])),
            confidence="medium",
            reason="Obvious non-achievement language was detected.",
            negative_evidence=True,
        )

    if criterion_code == "EE4":
        bei = _extract_energy_index(text, config)
        if bei:
            return bei
    if criterion_code == "EE6":
        power_factor = _extract_power_factor(text, config)
        if power_factor:
            return power_factor
    if criterion_code == "EQ1":
        co2_ppm = _extract_co2_ppm(text, config)
        if co2_ppm:
            return co2_ppm

    percentages = _contextual_percentages(text, config["metrics"])
    if percentages:
        percentages.sort(
            key=lambda item: (
                _confidence_rank(item.confidence),
                item.value if item.value is not None else -1,
            ),
            reverse=True,
        )
        return percentages[0]

    supporting = _supporting_value_hint(criterion_code, text)
    if supporting:
        return supporting

    return ExtractedScoringValue(
        metric=None,
        value=None,
        unit=None,
        matched_text=None,
        confidence="low",
        reason="No criterion-specific scoring value was found near relevant context.",
    )


def _contextual_percentages(
    text: str,
    metric_contexts: dict[str, list[str]],
) -> list[ExtractedScoringValue]:
    results = []
    for match in PERCENT_PATTERN.finditer(text):
        value = float(match.group("value"))
        extracted = _value_from_percent_match(text, match, value, metric_contexts)
        if extracted:
            results.append(extracted)

    for match in WORD_PERCENT_PATTERN.finditer(text):
        value = float(NUMBER_WORDS[match.group("word").lower()])
        extracted = _value_from_percent_match(text, match, value, metric_contexts)
        if extracted:
            results.append(extracted)

    for match in DECIMAL_OF_TOTAL_PATTERN.finditer(text):
        value = round(float(match.group("value")) * 100, 4)
        window = _window(text, match.start(), match.end(), radius=95)
        metric, context_hits = _best_metric_for_window(window, metric_contexts)
        if not metric:
            continue
        results.append(
            ExtractedScoringValue(
                metric=metric,
                value=value,
                unit="%",
                matched_text=_expand_original_window(text, match.start(), match.end()),
                confidence="medium",
                reason=f"Converted decimal share to {value}% near context: {', '.join(context_hits)}.",
            )
        )
    return results


def _value_from_percent_match(
    text: str,
    match,
    value: float,
    metric_contexts: dict[str, list[str]],
) -> Optional[ExtractedScoringValue]:
    metric, context_hits, context_radius = _best_metric_for_match(text, match, metric_contexts)
    if not metric:
        return None
    confidence = "high" if len(context_hits) >= 2 and context_radius <= 70 else "medium"
    return ExtractedScoringValue(
        metric=metric,
        value=value,
        unit="%",
        matched_text=_expand_original_window(text, match.start(), match.end()),
        confidence=confidence,
        reason=(
            f"Selected {value}% because nearby context matched within "
            f"{context_radius} characters: {', '.join(context_hits)}."
        ),
    )


def _extract_energy_index(text: str, config: dict) -> Optional[ExtractedScoringValue]:
    for pattern in config.get("number_patterns", []):
        for match in pattern.finditer(text):
            window = _window(text, match.start(), match.end(), radius=80)
            metric, context_hits = _best_metric_for_window(window, config["metrics"])
            if not metric:
                continue
            value = float(match.group("value"))
            return ExtractedScoringValue(
                metric=metric,
                value=value,
                unit="kWh/m2/year",
                matched_text=_expand_original_window(text, match.start(), match.end()),
                confidence="high" if context_hits else "medium",
                reason=f"Selected BEI value {value} kWh/m2/year near energy-index context.",
            )
    return None


def _extract_power_factor(text: str, config: dict) -> Optional[ExtractedScoringValue]:
    for pattern in (POWER_FACTOR_PATTERN, POWER_FACTOR_REVERSE_PATTERN):
        for match in pattern.finditer(text):
            window = _window(text, match.start(), match.end(), radius=100)
            metric, context_hits = _best_metric_for_window(window, config["metrics"])
            if not metric:
                continue
            value = float(match.group("value"))
            if not 0 < value <= 1:
                continue
            return ExtractedScoringValue(
                metric=metric,
                value=value,
                unit="power factor",
                matched_text=_expand_original_window(text, match.start(), match.end()),
                confidence="high",
                reason=(
                    f"Selected power-factor value {value} near context: "
                    f"{', '.join(context_hits)}."
                ),
            )
    return None


def _extract_co2_ppm(text: str, config: dict) -> Optional[ExtractedScoringValue]:
    normalized = _normalize(text)
    if not _has_co2_monitoring_context(normalized):
        return None
    for match in PPM_PATTERN.finditer(text):
        window = _window(text, match.start(), match.end(), radius=100)
        metric, context_hits = _best_metric_for_window(window, config["metrics"])
        if not metric:
            continue
        numeric_match = re.search(r"\d+(?:\.\d+)?", match.group(0))
        if not numeric_match:
            continue
        value = float(numeric_match.group(0))
        return ExtractedScoringValue(
            metric=metric,
            value=value,
            unit="ppm",
            matched_text=_expand_original_window(text, match.start(), match.end()),
            confidence="high" if len(context_hits) >= 2 else "medium",
            reason=(
                f"Selected CO2 concentration target {value} ppm because CO2 "
                f"monitoring/control context was present: {', '.join(context_hits)}."
            ),
        )
    return None


def _supporting_value_hint(criterion_code: str, text: str) -> Optional[ExtractedScoringValue]:
    if criterion_code == "EE3":
        for pattern in (KWP_PATTERN, KW_PATTERN):
            match = pattern.search(text)
            if match:
                return ExtractedScoringValue(
                    metric=None,
                    value=None,
                    unit=None,
                    matched_text=_expand_original_window(text, match.start(), match.end()),
                    confidence="low",
                    reason=(
                        "Renewable-energy capacity was found, but the configured "
                        "UDA scoring rule requires a percentage input."
                    ),
                )
    return None


def _best_metric_for_window(
    window: str,
    metric_contexts: dict[str, list[str]],
) -> tuple[Optional[str], list[str]]:
    best_metric = None
    best_hits = []
    for metric, phrases in metric_contexts.items():
        hits = [phrase for phrase in phrases if phrase in window]
        if len(hits) > len(best_hits):
            best_metric = metric
            best_hits = hits
    return best_metric, best_hits


def _best_metric_for_match(
    text: str,
    match,
    metric_contexts: dict[str, list[str]],
) -> tuple[Optional[str], list[str], int]:
    clause = _clause_window(text, match.start(), match.end())
    metric, hits = _best_metric_for_window(clause, metric_contexts)
    if metric and hits:
        return metric, hits, 0
    return None, [], 0


def _clause_window(text: str, start: int, end: int) -> str:
    separators = [",", ";", "."]
    left = max(text.rfind(separator, 0, start) for separator in separators) + 1
    lower_text = text.lower()
    and_left = lower_text.rfind(" and ", 0, start)
    if and_left >= 0:
        left = max(left, and_left + len(" and "))
    right_candidates = [
        position
        for separator in separators
        for position in [text.find(separator, end)]
        if position >= 0
    ]
    and_right = lower_text.find(" and ", end)
    if and_right >= 0:
        right_candidates.append(and_right)
    right = min(right_candidates) if right_candidates else len(text)
    return _normalize(text[left:right])


def _has_co2_monitoring_context(text: str) -> bool:
    monitoring_terms = [
        "co2 sensor",
        "co2 sensors",
        "carbon dioxide sensor",
        "carbon dioxide sensors",
        "co2 gauge",
        "co2 gauges",
        "co2 monitoring",
        "co2 monitor",
        "co2 control",
        "carbon dioxide monitoring",
        "carbon dioxide control",
    ]
    return any(term in text for term in monitoring_terms)


def _has_negative_evidence(text: str, criterion_negative_patterns: list[str]) -> bool:
    if any(re.search(pattern, text) for pattern in criterion_negative_patterns):
        return True
    return False


def _default_metric(config: dict) -> Optional[str]:
    metrics = list(config["metrics"].keys())
    return metrics[0] if metrics else None


def _negative_matched_text(text: str, phrases: list[str]) -> Optional[str]:
    normalized = _normalize(text)
    for pattern in phrases:
        match = re.search(pattern, normalized)
        if match:
            return match.group(0)
    return None


def _confidence_rank(confidence: str) -> int:
    return {"high": 3, "medium": 2, "low": 1}.get(confidence, 0)


def _window(text: str, start: int, end: int, radius: int) -> str:
    return _normalize(text[max(0, start - radius) : min(len(text), end + radius)])


def _expand_original_window(text: str, start: int, end: int, radius: int = 70) -> str:
    return " ".join(text[max(0, start - radius) : min(len(text), end + radius)].split())


def _normalize(text: str) -> str:
    return " ".join(
        (text or "")
        .lower()
        .replace("m²", "m2")
        .replace("mÂ²", "m2")
        .replace("–", "-")
        .replace("—", "-")
        .split()
    )
