import re
from dataclasses import dataclass
from typing import Iterable, Optional


MIN_WORDS = 60
TARGET_WORDS = 180
MAX_WORDS = 250
PAGE_MARKER_PATTERN = re.compile(r"^--- PAGE (\d+) ---$", re.MULTILINE)
SENTENCE_PATTERN = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")
WORD_PATTERN = re.compile(r"\S+")


@dataclass
class ChunkCandidate:
    chunk_index: int
    page_number: Optional[int]
    chunk_text: str
    char_count: int
    token_estimate: int


def build_text_chunks(extracted_text: str) -> list[ChunkCandidate]:
    chunks = []
    chunk_index = 1

    for page_number, page_text in _iter_page_sections(extracted_text):
        for chunk_text in _chunk_section(page_text):
            token_estimate = estimate_tokens(chunk_text)
            chunks.append(
                ChunkCandidate(
                    chunk_index=chunk_index,
                    page_number=page_number,
                    chunk_text=chunk_text,
                    char_count=len(chunk_text),
                    token_estimate=token_estimate,
                )
            )
            chunk_index += 1

    return chunks


def estimate_tokens(text: str) -> int:
    return len(WORD_PATTERN.findall(text))


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


def _chunk_section(section_text: str) -> list[str]:
    paragraphs = [
        paragraph.strip()
        for paragraph in re.split(r"\n\s*\n", section_text)
        if paragraph.strip()
    ]

    units = []
    for paragraph in paragraphs:
        if estimate_tokens(paragraph) <= MAX_WORDS:
            units.append(paragraph)
        else:
            units.extend(_split_long_paragraph(paragraph))

    chunks = []
    current_parts = []
    current_words = 0

    for unit in units:
        unit_words = estimate_tokens(unit)
        if current_parts and current_words + unit_words > MAX_WORDS:
            chunks.append("\n\n".join(current_parts).strip())
            current_parts = [unit]
            current_words = unit_words
            continue

        current_parts.append(unit)
        current_words += unit_words

        if current_words >= TARGET_WORDS:
            chunks.append("\n\n".join(current_parts).strip())
            current_parts = []
            current_words = 0

    if current_parts:
        remaining = "\n\n".join(current_parts).strip()
        if chunks and estimate_tokens(remaining) < MIN_WORDS:
            chunks[-1] = f"{chunks[-1]}\n\n{remaining}".strip()
        else:
            chunks.append(remaining)

    return [chunk for chunk in chunks if chunk]


def _split_long_paragraph(paragraph: str) -> list[str]:
    sentences = SENTENCE_PATTERN.split(paragraph)
    chunks = []
    current_sentences = []
    current_words = 0

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        sentence_words = estimate_tokens(sentence)
        if current_sentences and current_words + sentence_words > MAX_WORDS:
            chunks.append(" ".join(current_sentences).strip())
            current_sentences = [sentence]
            current_words = sentence_words
        else:
            current_sentences.append(sentence)
            current_words += sentence_words

    if current_sentences:
        chunks.append(" ".join(current_sentences).strip())

    return chunks
