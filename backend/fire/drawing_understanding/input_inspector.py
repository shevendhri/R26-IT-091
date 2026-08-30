from dataclasses import dataclass
from pathlib import Path
from fastapi import HTTPException, UploadFile
from ..config import Settings

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}
ALLOWED_MEDIA_TYPES = {"application/pdf", "image/png", "image/jpeg", "application/octet-stream"}
EXTENSION_MEDIA_TYPES = {
    ".pdf": {"application/pdf", "application/octet-stream"},
    ".png": {"image/png", "application/octet-stream"},
    ".jpg": {"image/jpeg", "application/octet-stream"},
    ".jpeg": {"image/jpeg", "application/octet-stream"},
}

@dataclass
class InspectedUpload:
    filename: str
    suffix: str
    media_type: str
    data: bytes

async def inspect_upload(file: UploadFile, settings: Settings) -> InspectedUpload:
    suffix = Path(file.filename or "").suffix.lower()
    data = await file.read()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(415, f"Unsupported file type: {suffix or 'missing extension'}")
    media_type = file.content_type or "application/octet-stream"
    if media_type not in ALLOWED_MEDIA_TYPES or media_type not in EXTENSION_MEDIA_TYPES[suffix]:
        raise HTTPException(415, f"Unsupported media type for {file.filename}: {media_type}")
    if not data:
        raise HTTPException(400, f"{file.filename}: empty upload")
    if len(data) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(413, f"{file.filename}: exceeds {settings.max_file_size_mb} MB")
    return InspectedUpload(
        filename=file.filename or "upload",
        suffix=suffix,
        media_type=media_type,
        data=data,
    )
