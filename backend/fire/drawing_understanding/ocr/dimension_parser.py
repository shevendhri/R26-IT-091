import re

_NUMBER = r"(?P<value>\d+(?:\.\d+)?)"

def parse_length_m(value: str) -> float | None:
    text = (value or "").strip().lower().replace(",", "")
    text = re.sub(r"(\d+(?:\.\d+)?)\s*(?:'|ft)\s*-\s*(\d+(?:\.\d+)?)", r"\1' \2", text)
    feet_inches = re.search(r"(?P<feet>\d+(?:\.\d+)?)\s*(?:'|ft)\s*(?P<inches>\d+(?:\.\d+)?)?\s*(?:\"|in)?", text)
    if feet_inches:
        feet = float(feet_inches.group("feet"))
        inches = float(feet_inches.group("inches") or 0)
        return round(feet * 0.3048 + inches * 0.0254, 3)
    match = re.search(_NUMBER + r"\s*(?P<unit>mm|cm|m)\b", text)
    if not match:
        bare = re.fullmatch(r"\d+(?:\.\d+)?", text)
        if not bare:
            return None
        number = float(text)
        return round(number / 1000, 3) if number > 20 else number
    number = float(match.group("value"))
    unit = match.group("unit")
    if unit == "mm":
        return round(number / 1000, 3)
    if unit == "cm":
        return round(number / 100, 3)
    return number

def parse_area_m2(value: str) -> float | None:
    text = (value or "").strip().lower().replace(",", "")
    match = re.search(r"(\d+(?:\.\d+)?)\s*(sq\.?\s*m|sqm|m2|m²)\b", text)
    if match:
        return float(match.group(1))
    sqft = re.search(r"(\d+(?:\.\d+)?)\s*(sq\.?\s*ft|sqft|ft2|ft²)\b", text)
    if sqft:
        return round(float(sqft.group(1)) * 0.092903, 2)
    return None

def parse_pair_dimensions(text: str) -> tuple[float | None, float | None]:
    cleaned = (text or "").replace("×", "x")
    parts = re.split(r"\s*[Xx]\s*", cleaned, maxsplit=1)
    if len(parts) != 2:
        return None, None
    first = _parse_dimension_part(parts[0], parts[1], use_last=True)
    second = _parse_dimension_part(parts[1], parts[0])
    if first is None or second is None:
        return None, None
    return first, second

def _parse_dimension_part(part: str, peer: str, use_last: bool = False) -> float | None:
    token_pattern = r"\d+(?:\.\d+)?\s*(?:'|ft)(?:\s*-?\s*\d+(?:\.\d+)?\s*(?:\"|in)?)?|\d+(?:\.\d+)?\s*(?:mm|cm|m|in|\")?"
    token_matches = list(re.finditer(token_pattern, part.lower()))
    if not token_matches:
        return None
    token = token_matches[-1 if use_last else 0].group(0).strip()
    if re.search(r"(mm|cm|m|ft|in|'|\")", token):
        return parse_length_m(token)
    value = float(token)
    peer_matches = list(re.finditer(r"\d+(?:\.\d+)?", peer))
    peer_value = float(peer_matches[-1].group(0)) if peer_matches else None
    if peer_value is not None and 50 <= value <= 400 and 50 <= peer_value <= 400:
        return round(value / 100, 3)
    return parse_length_m(token)
