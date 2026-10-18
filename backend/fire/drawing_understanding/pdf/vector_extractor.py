from dataclasses import dataclass
import pymupdf
from ...schemas import BBox
from ..evidence.models import PageAnalysis, PageMode, TextEvidence
from ..ocr.text_normalizer import normalize_text

@dataclass
class VectorPage:
    page_number: int
    width: float
    height: float
    text_items: list[TextEvidence]
    drawings: int
    images: int
    mode: PageMode

def _bbox(rect: tuple[float, float, float, float], width: float, height: float) -> BBox:
    x0, y0, x1, y1 = rect
    return BBox(
        x=max(0, min(1, x0 / width)),
        y=max(0, min(1, y0 / height)),
        width=max(0, min(1, (x1 - x0) / width)),
        height=max(0, min(1, (y1 - y0) / height)),
    )

def extract_pdf_vector_pages(data: bytes, source_file: str) -> tuple[list[VectorPage], list[PageAnalysis], list[str]]:
    warnings: list[str] = []
    try:
        document = pymupdf.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("PDF is corrupt or could not be opened") from exc
    if document.needs_pass or document.page_count < 1:
        document.close()
        raise ValueError("PDF is encrypted or empty")
    pages: list[VectorPage] = []
    analyses: list[PageAnalysis] = []
    for page_index, page in enumerate(document, start=1):
        rect = page.rect
        text_items: list[TextEvidence] = []
        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    raw = (span.get("text") or "").strip()
                    if not raw:
                        continue
                    text_items.append(TextEvidence(
                        value=raw,
                        confidence=1.0,
                        source_file=source_file,
                        page=page_index,
                        method="pdf_native_text",
                        bbox=_bbox(span.get("bbox", (0, 0, 0, 0)), rect.width, rect.height),
                        raw_evidence=raw,
                        normalized_text=normalize_text(raw),
                    ))
        drawings = len(page.get_drawings())
        images = len(page.get_images(full=True))
        has_vector = bool(text_items or drawings)
        has_raster = images > 0
        mode = PageMode.HYBRID if has_vector and has_raster else PageMode.VECTOR if has_vector else PageMode.RASTER
        pages.append(VectorPage(page_index, rect.width, rect.height, text_items, drawings, images, mode))
        analyses.append(PageAnalysis(
            source_file=source_file,
            page=page_index,
            mode=mode,
            width=rect.width,
            height=rect.height,
            native_text_items=len(text_items),
            vector_items=drawings,
            raster_images=images,
        ))
    document.close()
    return pages, analyses, warnings
