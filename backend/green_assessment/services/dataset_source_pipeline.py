import csv
import hashlib
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from statistics import mean
from typing import Iterable, Optional

from green_assessment import models
from green_assessment.services.document_extraction import (
    DocumentExtractionError,
    _extract_pdf_text,
    clean_extracted_text,
)
from green_assessment.services.text_chunking import PAGE_MARKER_PATTERN, estimate_tokens


MODULE_DIR = Path(__file__).resolve().parents[1]
DATASET_SOURCE_DIR = MODULE_DIR / "dataset_source_docs"
DATASET_TEXT_ROOT = MODULE_DIR / "dataset_extracted_text"
DATASET_EXPORT_ROOT = MODULE_DIR / "dataset_exports"
CSV_EXPORT_PATH = DATASET_EXPORT_ROOT / "uda_source_chunks.csv"

MIN_WORDS = 30
TARGET_WORDS = 130
MAX_WORDS = 180
SKIP_WORDS = 8
SENTENCE_PATTERN = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")


@dataclass
class DatasetPreparationSummary:
    documents_found: int = 0
    documents_processed: int = 0
    documents_skipped: int = 0
    documents_failed: int = 0
    total_chunks_generated: int = 0
    extraction_methods: dict[str, int] = field(default_factory=dict)
    problematic_pdfs: list[str] = field(default_factory=list)
    stats: dict = field(default_factory=dict)
    csv_export_path: str = ""


@dataclass
class DatasetChunkCandidate:
    chunk_index: int
    page_number: Optional[int]
    chunk_text: str
    word_count: int
    token_estimate: int
    annotation_status: str
    annotation_notes: Optional[str]


def prepare_dataset_sources(db, dataset_root: Optional[Path] = None, force: bool = False):
    dataset_root = dataset_root or DATASET_SOURCE_DIR
    pdf_paths = sorted(dataset_root.rglob("*.pdf"))
    summary = DatasetPreparationSummary(documents_found=len(pdf_paths))

    for index, pdf_path in enumerate(pdf_paths, start=1):
        relative_path = pdf_path.relative_to(dataset_root)
        source_folder = relative_path.parts[0] if len(relative_path.parts) > 1 else "root"
        print(f"[{index}/{len(pdf_paths)}] Processing {relative_path}")

        try:
            file_hash = _hash_file(pdf_path)
            document = _get_or_create_source_document(
                db,
                pdf_path,
                relative_path,
                source_folder,
                file_hash,
            )

            existing_chunk_count = (
                db.query(models.DatasetSourceChunk)
                .filter(models.DatasetSourceChunk.source_document_id == document.id)
                .count()
            )
            if (
                not force
                and
                document.file_hash == file_hash
                and document.extraction_status == "extracted"
                and existing_chunk_count > 0
            ):
                summary.documents_skipped += 1
                summary.total_chunks_generated += existing_chunk_count
                _count_method(summary, document.extraction_method or "unknown")
                print(f"Skipped unchanged file. Chunks: {existing_chunk_count}")
                continue

            _clear_existing_chunks(db, document.id)
            document.extraction_status = "processing"
            document.extraction_error = None
            document.updated_at = datetime.utcnow()
            db.commit()

            text, method = _extract_pdf_text(pdf_path)
            cleaned_text = clean_extracted_text(text)
            text_path = _write_dataset_text(document.id, source_folder, cleaned_text)
            chunks = build_dataset_source_chunks(cleaned_text)

            for chunk in chunks:
                db.add(
                    models.DatasetSourceChunk(
                        source_document_id=document.id,
                        chunk_index=chunk.chunk_index,
                        page_number=chunk.page_number,
                        chunk_text=chunk.chunk_text,
                        word_count=chunk.word_count,
                        token_estimate=chunk.token_estimate,
                        source_folder=source_folder,
                        annotation_status=chunk.annotation_status,
                        annotation_notes=chunk.annotation_notes,
                    )
                )

            document.file_hash = file_hash
            document.extraction_status = "extracted"
            document.extraction_method = method
            document.extracted_text_path = str(text_path)
            document.extracted_char_count = len(cleaned_text)
            document.page_count = _count_pdf_pages(pdf_path)
            document.extraction_error = None
            document.processed_at = datetime.utcnow()
            document.updated_at = datetime.utcnow()
            db.commit()

            summary.documents_processed += 1
            summary.total_chunks_generated += len(chunks)
            _count_method(summary, method)
            print(f"Extraction: {method}")
            print(f"Pages: {document.page_count}")
            print(f"Chunks: {len(chunks)}")
            print("Status: complete")
        except Exception as exc:
            db.rollback()
            summary.documents_failed += 1
            summary.problematic_pdfs.append(str(relative_path))
            _mark_failed_document(
                db,
                pdf_path,
                relative_path,
                source_folder,
                exc,
            )
            print(f"Status: failed - {exc}")

    export_dataset_source_chunks(db)
    summary.csv_export_path = str(CSV_EXPORT_PATH)
    summary.stats = dataset_source_statistics(db)
    return summary


def build_dataset_source_chunks(extracted_text: str) -> list[DatasetChunkCandidate]:
    chunks = []
    chunk_index = 1
    for page_number, page_text in _iter_page_sections(extracted_text):
        for chunk_text in _chunk_page_text(page_text):
            quality_status, quality_note = _quality_status(chunk_text)
            if quality_status == "skip":
                continue
            word_count = _word_count(chunk_text)
            chunks.append(
                DatasetChunkCandidate(
                    chunk_index=chunk_index,
                    page_number=page_number,
                    chunk_text=chunk_text,
                    word_count=word_count,
                    token_estimate=estimate_tokens(chunk_text),
                    annotation_status=quality_status,
                    annotation_notes=quality_note,
                )
            )
            chunk_index += 1
    return chunks


def export_dataset_source_chunks(db, export_path: Path = CSV_EXPORT_PATH) -> Path:
    export_path.parent.mkdir(parents=True, exist_ok=True)
    rows = (
        db.query(models.DatasetSourceChunk, models.DatasetSourceDocument)
        .join(
            models.DatasetSourceDocument,
            models.DatasetSourceChunk.source_document_id
            == models.DatasetSourceDocument.id,
        )
        .order_by(
            models.DatasetSourceDocument.source_folder,
            models.DatasetSourceDocument.filename,
            models.DatasetSourceChunk.chunk_index,
        )
        .all()
    )

    with export_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "chunk_id",
                "source_document_id",
                "filename",
                "source_folder",
                "page_number",
                "chunk_text",
                "word_count",
                "token_estimate",
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
                    "source_document_id": document.id,
                    "filename": document.filename,
                    "source_folder": chunk.source_folder,
                    "page_number": chunk.page_number,
                    "chunk_text": chunk.chunk_text,
                    "word_count": chunk.word_count,
                    "token_estimate": chunk.token_estimate,
                    "human_label": chunk.human_label,
                    "is_relevant": chunk.is_relevant,
                    "annotation_status": chunk.annotation_status,
                    "annotation_notes": chunk.annotation_notes,
                }
            )
    return export_path


def dataset_source_statistics(db) -> dict:
    documents = db.query(models.DatasetSourceDocument).all()
    chunks = db.query(models.DatasetSourceChunk).all()
    word_counts = [chunk.word_count for chunk in chunks]
    return {
        "total_documents": len(documents),
        "documents_by_source_folder": _count_by(documents, "source_folder"),
        "total_chunks": len(chunks),
        "chunks_by_source_folder": _count_by(chunks, "source_folder"),
        "average_words_per_chunk": round(mean(word_counts), 2) if word_counts else 0,
        "minimum_chunk_words": min(word_counts) if word_counts else 0,
        "maximum_chunk_words": max(word_counts) if word_counts else 0,
        "failed_extraction_count": sum(
            1 for document in documents if document.extraction_status == "failed"
        ),
        "unlabelled_count": sum(
            1 for chunk in chunks if chunk.annotation_status == "unlabelled"
        ),
        "labelled_count": sum(
            1 for chunk in chunks if chunk.annotation_status == "labelled"
        ),
        "review_required_count": sum(
            1 for chunk in chunks if chunk.annotation_status == "review_required"
        ),
    }


def _get_or_create_source_document(
    db,
    pdf_path: Path,
    relative_path: Path,
    source_folder: str,
    file_hash: str,
):
    source_path = str(relative_path).replace("\\", "/")
    document = (
        db.query(models.DatasetSourceDocument)
        .filter(models.DatasetSourceDocument.source_path == source_path)
        .first()
    )
    if document is None:
        document = models.DatasetSourceDocument(
            source_path=source_path,
            filename=pdf_path.name,
            source_folder=source_folder,
            file_hash=file_hash,
        )
        db.add(document)
        db.flush()
    else:
        document.filename = pdf_path.name
        document.source_folder = source_folder
    return document


def _mark_failed_document(db, pdf_path, relative_path, source_folder, exc):
    try:
        file_hash = _hash_file(pdf_path)
    except OSError:
        file_hash = "unavailable"
    document = _get_or_create_source_document(
        db,
        pdf_path,
        relative_path,
        source_folder,
        file_hash,
    )
    document.file_hash = file_hash
    document.extraction_status = "failed"
    document.extraction_error = str(exc)
    document.processed_at = datetime.utcnow()
    document.updated_at = datetime.utcnow()
    db.commit()


def _clear_existing_chunks(db, document_id: int) -> None:
    db.query(models.DatasetSourceChunk).filter(
        models.DatasetSourceChunk.source_document_id == document_id
    ).delete()


def _hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_obj:
        for block in iter(lambda: file_obj.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _write_dataset_text(document_id: int, source_folder: str, text: str) -> Path:
    output_dir = DATASET_TEXT_ROOT / source_folder
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"source_document_{document_id}.txt"
    output_path.write_text(text, encoding="utf-8")
    return output_path


def _count_pdf_pages(path: Path) -> int:
    try:
        import pymupdf as fitz
    except ImportError as exc:
        raise DocumentExtractionError("PyMuPDF is not installed.") from exc
    with fitz.open(path) as pdf:
        return pdf.page_count


def _iter_page_sections(text: str) -> Iterable[tuple[Optional[int], str]]:
    matches = list(PAGE_MARKER_PATTERN.finditer(text))
    if not matches:
        yield None, text.strip()
        return

    for index, match in enumerate(matches):
        page_number = int(match.group(1))
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        yield page_number, text[start:end].strip()


def _chunk_page_text(page_text: str) -> list[str]:
    paragraphs = [
        _normalize_chunk_text(paragraph)
        for paragraph in re.split(r"\n\s*\n", page_text)
        if _normalize_chunk_text(paragraph)
    ]

    units = []
    for paragraph in paragraphs:
        if _word_count(paragraph) <= MAX_WORDS:
            units.append(paragraph)
        else:
            units.extend(_split_long_paragraph(paragraph))

    chunks = []
    current = []
    current_words = 0
    for unit in units:
        unit_words = _word_count(unit)
        if current and current_words + unit_words > MAX_WORDS:
            chunks.append("\n\n".join(current).strip())
            current = [unit]
            current_words = unit_words
            continue

        current.append(unit)
        current_words += unit_words
        if current_words >= TARGET_WORDS:
            chunks.append("\n\n".join(current).strip())
            current = []
            current_words = 0

    if current:
        remaining = "\n\n".join(current).strip()
        if chunks and _word_count(remaining) < MIN_WORDS:
            chunks[-1] = f"{chunks[-1]}\n\n{remaining}".strip()
        else:
            chunks.append(remaining)
    return chunks


def _split_long_paragraph(paragraph: str) -> list[str]:
    sentences = SENTENCE_PATTERN.split(paragraph)
    chunks = []
    current = []
    current_words = 0
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if _word_count(sentence) > MAX_WORDS:
            if current:
                chunks.append(" ".join(current).strip())
                current = []
                current_words = 0
            chunks.extend(_split_by_words(sentence))
            continue
        sentence_words = _word_count(sentence)
        if current and current_words + sentence_words > MAX_WORDS:
            chunks.append(" ".join(current).strip())
            current = [sentence]
            current_words = sentence_words
            continue
        current.append(sentence)
        current_words += sentence_words
    if current:
        chunks.append(" ".join(current).strip())
    return chunks


def _split_by_words(text: str) -> list[str]:
    words = re.findall(r"\S+", text)
    chunks = []
    for start in range(0, len(words), MAX_WORDS):
        chunks.append(" ".join(words[start : start + MAX_WORDS]).strip())
    return chunks


def _quality_status(text: str) -> tuple[str, Optional[str]]:
    word_count = _word_count(text)
    if word_count < SKIP_WORDS:
        return "skip", "Excluded because the chunk is extremely short."
    if _mostly_page_numbers(text):
        return "skip", "Excluded because the chunk is mostly page numbers."
    if word_count < MIN_WORDS:
        return "review_required", "Short chunk retained for manual review."
    if _looks_like_table_of_contents(text):
        return "review_required", "Possible table-of-contents fragment."
    if _looks_like_ocr_garbage(text):
        return "review_required", "Possible OCR noise; retained for inspection."
    return "unlabelled", None


def _normalize_chunk_text(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


def _mostly_page_numbers(text: str) -> bool:
    compact = re.sub(r"\s+", "", text)
    return bool(compact) and len(re.sub(r"\d", "", compact)) <= max(2, len(compact) // 5)


def _looks_like_table_of_contents(text: str) -> bool:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    dotted_lines = sum(1 for line in lines if re.search(r"\.{3,}\s*\d+$", line))
    return len(lines) >= 3 and dotted_lines / len(lines) > 0.5


def _looks_like_ocr_garbage(text: str) -> bool:
    if not text:
        return True
    alnum = sum(1 for char in text if char.isalnum())
    visible = sum(1 for char in text if not char.isspace())
    return visible > 0 and alnum / visible < 0.45


def _count_method(summary: DatasetPreparationSummary, method: str) -> None:
    summary.extraction_methods[method] = summary.extraction_methods.get(method, 0) + 1


def _count_by(items, attribute: str) -> dict:
    counts = {}
    for item in items:
        key = getattr(item, attribute)
        counts[key] = counts.get(key, 0) + 1
    return dict(sorted(counts.items()))
