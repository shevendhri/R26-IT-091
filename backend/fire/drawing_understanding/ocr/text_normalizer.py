import re

def normalize_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    return cleaned.upper()

def lines_from_text_items(items: list) -> list[str]:
    return [item.normalized_text for item in items if getattr(item, "normalized_text", "")]
