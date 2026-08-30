from dataclasses import dataclass
from io import BytesIO
from PIL import Image, ImageOps

class DocumentError(ValueError): pass

@dataclass
class RenderedPage:
    page_number: int; png_bytes: bytes

@dataclass
class NormalizedImage:
    png_bytes: bytes
    width: int
    height: int
    orientation_corrected: bool
    orientation_degrees: int

def _exif_orientation_degrees(image: Image.Image) -> int:
    try:
        orientation = image.getexif().get(274)
    except Exception:
        return 0
    return {3: 180, 6: 90, 8: 270}.get(orientation, 0)

def normalize_image(data: bytes) -> NormalizedImage:
    try:
        image = Image.open(BytesIO(data))
        degrees = _exif_orientation_degrees(image)
        normalized = ImageOps.exif_transpose(image)
        if normalized.mode not in {"RGB", "L"}:
            background = Image.new("RGB", normalized.size, "white")
            if normalized.mode in {"RGBA", "LA"}:
                background.paste(normalized.convert("RGBA"), mask=normalized.convert("RGBA").getchannel("A"))
                normalized = background
            else:
                normalized = normalized.convert("RGB")
        elif normalized.mode == "L":
            normalized = normalized.convert("RGB")
        out = BytesIO()
        normalized.save(out, "PNG")
        return NormalizedImage(
            png_bytes=out.getvalue(),
            width=normalized.width,
            height=normalized.height,
            orientation_corrected=degrees != 0,
            orientation_degrees=degrees,
        )
    except Exception as exc:
        raise DocumentError("Image is corrupt or unsupported") from exc

def validate_image(data: bytes) -> None:
    try:
        image=Image.open(BytesIO(data)); image.verify()
    except Exception as exc: raise DocumentError("Image is corrupt or unsupported") from exc

def render_pdf(data: bytes, dpi: int=200) -> list[RenderedPage]:
    try:
        import pymupdf
        document=pymupdf.open(stream=data,filetype="pdf")
        if document.needs_pass or document.page_count < 1: raise DocumentError("PDF is encrypted or empty")
        scale=dpi/72
        pages=[RenderedPage(i+1,p.get_pixmap(matrix=pymupdf.Matrix(scale,scale),alpha=False).tobytes("png")) for i,p in enumerate(document)]
        document.close(); return pages
    except DocumentError: raise
    except Exception as exc: raise DocumentError("PDF is corrupt or could not be rendered") from exc
