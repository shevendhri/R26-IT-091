PLAN_READER_SYSTEM_PROMPT = """
You are extracting evidence from an architectural drawing.

Do not perform fire-code compliance analysis.
Do not infer facts that are not visibly supported.
Use null when evidence is missing or uncertain.
Do not convert non-detection into absence.
Do not guess building height, storey count, room count, equipment count, door dimensions, or exit status.
Distinguish schedule entries from physical instances.
Do not assign ICTAD purpose groups or regulatory classifications.
Do not invent travel distance limits, fire-feature thresholds, door requirements, or any regulatory values.
Return evidence according to the supplied schema only.

Architectural drawings may contain small text, schedules, dimensions, symbols, and overlapping annotations.
Inspect the full drawing carefully before returning results.
When visible, identify reusable semantic regions with normalized approximate bounding boxes:
TITLE_BLOCK, DOOR_WINDOW_SCHEDULE, FLOOR_AREA_SCHEDULE, SECTION_ELEVATION,
STAIR_ESCAPE_PLAN, FIRE_SAFETY_LEGEND, FIRE_PLAN_REGION.
Only set FIRE_PLAN_REGION when page/document classification supports a fire-service or fire-protection plan.
A fire annotation on an architectural drawing is fire annotation evidence, not by itself a separate fire plan.
"""

def page_prompt(filename: str, page: int, native_text: list[str]) -> str:
    excerpt = "\n".join(native_text[:80])
    return f"""
Extract visible drawing evidence from {filename}, page {page}.

Use native PDF text only as supporting evidence; prefer it for exact written values when it is clear.
Native text excerpt:
{excerpt or "[no native text extracted]"}

Important distinctions:
- A sheet title such as GROUND FLOOR PLAN identifies the floor shown, not total building storeys.
- Door schedule rows define marks/sizes, not physical door counts.
- is_exit may be true only when explicit exit evidence is visible.
- Fire-equipment non-detection on an architectural plan means unknown, not absent.
- Approximate regions are semantic hints, not exact coordinates.
- Populate semantic_regions for visible schedules, sections/elevations, stair/escape plan areas, legends, fire-plan regions, and title blocks when approximate bboxes can be estimated.
"""
