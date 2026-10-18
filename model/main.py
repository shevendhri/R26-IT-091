from pydantic import BaseModel
from typing import Optional, List
import json
import re
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import base64
import os

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))


# CubiCasa-style plans sometimes label a room with its size instead of a name,
# e.g. "8'11\" x 9'7\"" — these are typically unlabeled bedrooms in the source data.
_DIM_LABEL_RE = re.compile(r"^(\d+)'\s*(\d+)\"?\s*[xX]\s*(\d+)'\s*(\d+)\"?")

# Fallback assumption if no dimension labels are found: a typical interior
# door is ~2.83 ft (34 in) wide — used to calibrate pixels -> real-world sqft.
_ASSUMED_DOOR_WIDTH_FT = 2.83


def _is_dimension_label(name: str) -> bool:
    return bool(_DIM_LABEL_RE.match(name.strip())) if name else False


def _dim_label_to_sqft(text: str):
    """If a room's OCR'd label is a dimension string like 8'11" x 9'7", return its area in sqft."""
    m = _DIM_LABEL_RE.match(text.strip()) if text else None
    if not m:
        return None
    ft1, in1, ft2, in2 = (int(x) for x in m.groups())
    return (ft1 + in1 / 12.0) * (ft2 + in2 / 12.0)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── YOLO model (loaded once at startup) ──────────────────────────────────────

try:
    from .detector import detect, WEIGHTS, IMGSZ, CONF
except ImportError:
    from detector import detect, WEIGHTS, IMGSZ, CONF
_WEIGHTS = str(WEIGHTS)
_YOLO_IMGSZ = IMGSZ
_YOLO_CLASS_CONF = dict.fromkeys(['room','wall','door','window'], CONF)
_YOLO_MIN_CONF = CONF


def _crop_to_floorplan_region(img):
    """
    Find the main connected dark wall network and crop around it before YOLO.
    This keeps sheet text, dimension labels, and blank areas from becoming
    false detections, while output boxes stay in original image coordinates.
    """
    try:
        import cv2
        import numpy as np
    except Exception:
        return img, 0, 0

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    dark = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)[1]
    dark = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8), iterations=2)

    labels_count, _labels, stats, _centroids = cv2.connectedComponentsWithStats(dark, connectivity=8)
    if labels_count <= 1:
        return img, 0, 0

    image_area = h * w
    candidates = []
    for idx in range(1, labels_count):
        x = int(stats[idx, cv2.CC_STAT_LEFT])
        y = int(stats[idx, cv2.CC_STAT_TOP])
        bw = int(stats[idx, cv2.CC_STAT_WIDTH])
        bh = int(stats[idx, cv2.CC_STAT_HEIGHT])
        area = int(stats[idx, cv2.CC_STAT_AREA])
        if area < image_area * 0.002:
            continue
        if bw < w * 0.08 or bh < h * 0.08:
            continue
        candidates.append((area, x, y, bw, bh))

    if not candidates:
        return img, 0, 0

    _area, x, y, bw, bh = max(candidates, key=lambda item: item[0])
    pad = max(16, int(max(bw, bh) * 0.08))
    left = max(0, x - pad)
    top = max(0, y - pad)
    right = min(w, x + bw + pad)
    bottom = min(h, y + bh + pad)

    if (right - left) * (bottom - top) > image_area * 0.9:
        return img, 0, 0

    return img[top:bottom, left:right], left, top

_gemini_client = None

# ── Room type normalization ───────────────────────────────────────────────────

ROOM_TYPE_MAP = {
    'living': 'living', 'lounge': 'living', 'sitting': 'living',
    'bed': 'bedroom', 'bedroom': 'bedroom', 'master': 'bedroom',
    'bath': 'bathroom', 'toilet': 'bathroom',
    'kitchen': 'kitchen', 'dining': 'dining', 'garage': 'garage',
    'study': 'study', 'office': 'study',
    'laundry': 'laundry', 'utility': 'laundry',
    'store': 'storage', 'storage': 'storage',
    'hall': 'hallway', 'hallway': 'hallway', 'corridor': 'hallway', 'entry': 'hallway', 'foyer': 'hallway',
    'porch': 'porch', 'balcony': 'balcony',
}

# CubiCasa5k plans are real Finnish floor plans — many rooms are labeled with
# short Finnish abbreviations instead of English words. These are exact-match
# only (not substring) since codes like "ha" or "et" would false-positive
# inside unrelated English words if matched as substrings.
FINNISH_ROOM_CODES = {
    'et': 'hallway',      # eteinen — entryway
    'mh': 'bedroom',      # makuuhuone
    'kph': 'bathroom',    # kylpyhuone
    'khh': 'laundry',     # kodinhoitohuone — utility/laundry room
    'psh': 'bathroom',    # pesuhuone — washroom/shower room
    'wc': 'bathroom',
    'aula': 'hallway',    # hall/lobby
    'tupa': 'living',     # traditional Finnish living/common room
    'varasto': 'storage',
    'oh': 'living',       # olohuone
    'ruokailu': 'dining',
    'keittiö': 'kitchen',
    's': 'other',         # sauna — no dedicated icon/type yet, left as other
}


def _normalize_room_type(name: str) -> str:
    name_stripped = name.strip().lower()
    if name_stripped in FINNISH_ROOM_CODES:
        return FINNISH_ROOM_CODES[name_stripped]
    for keyword, rtype in ROOM_TYPE_MAP.items():
        if keyword in name_stripped:
            return rtype
    return 'other'


def _ocr_room_labels(png_bytes: bytes, rooms: list) -> list:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        return rooms
    try:
        img = Image.open(io.BytesIO(png_bytes)).convert('RGB')
        img_w, img_h = img.size
    except Exception:
        return rooms
    for room in rooms:
        if room.get('name'):
            continue
        bbox = room.get('_bbox')
        if not bbox:
            continue
        x1, y1, x2, y2 = bbox
        pad = 10
        x1 = max(0, int(x1) - pad)
        y1 = max(0, int(y1) - pad)
        x2 = min(img_w, int(x2) + pad)
        y2 = min(img_h, int(y2) + pad)
        if x2 - x1 < 20 or y2 - y1 < 20:
            continue
        crop = img.crop((x1, y1, x2, y2))
        try:
            text = pytesseract.image_to_string(crop, config='--psm 6').strip()
            for line in text.splitlines():
                line = line.strip()
                if len(line) > 2:
                    room['name'] = line
                    break
        except Exception:
            pass
    return rooms


# ── YOLO inference ────────────────────────────────────────────────────────────

def _yolo_predict(png_bytes: bytes, conf: float = CONF):
    return detect(png_bytes)


class _GeminiCounts(BaseModel):
    room: int
    wall: int
    door: int
    window: int


class _GeminiRoom(BaseModel):
    name: str
    type: str
    doors: int
    windows: int
    walls: int
    area_sqft: Optional[float] = None
    ventilation_ok: bool
    wall_thickness_ok: bool


class _GeminiAnalysis(BaseModel):
    counts: _GeminiCounts
    rooms: List[_GeminiRoom]
    has_toilet: bool
    scale_established: bool


_GEMINI_ANALYSIS_PROMPT = (
    "You are analyzing an architectural floor plan image (a raster PNG "
    "rendering of a real floor plan, not a photo). Walls are drawn as thick "
    "black or dark-gray lines/rectangles forming the room outlines. On these "
    "plans:\n"
    "- A DOOR is a break/gap in a wall line, almost always paired with a "
    "quarter-circle or arc line sweeping into the room (the door's swing "
    "path) and a short straight line across the gap (the door leaf/threshold). "
    "Look for these arcs specifically — they are the most reliable door "
    "signal, even where the wall break itself is subtle.\n"
    "- A WINDOW is a break/gap in a wall line WITHOUT a swing arc — usually "
    "shown as a thinner double or triple parallel line segment sitting flush "
    "within the wall's thickness, sometimes filled with a light blue/gray "
    "tint. Any wall opening that is not a door is a window.\n"
    "- A WALL is any straight (or L-shaped/segmented) thick line forming a "
    "room boundary or partition, including exterior walls and interior "
    "partition walls between rooms.\n\n"
    "Examine every wall segment of every room individually before answering "
    "— do not default a room to 0 doors or 0 windows without having checked "
    "each of its four (or more) sides for a break. Small, thin, or "
    "low-contrast openings still count; look closely rather than only at "
    "the most obvious large features. It is common and expected for nearly "
    "every room to have at least one door, and most rooms to have at least "
    "one window (exceptions: enclosed hallways, closets, and stairwells "
    "often have neither, or a door only).\n\n"
    "Once you've identified every room, doors, and windows, judge:\n"
    "- ventilation_ok: true if the room has a window (or, for a bathroom, "
    "storage, laundry, or hallway room, a window OR a door) providing "
    "ventilation.\n"
    "- wall_thickness_ok: true if the room's walls appear to be drawn with "
    "a real, non-degenerate thickness rather than a bare single line.\n\n"
    "Also estimate each room's area in square feet if the plan has any "
    "visible dimension labels or a scale reference; otherwise use null. "
    "room 'type' must be one of: living, bedroom, bathroom, kitchen, dining, "
    "garage, study, laundry, storage, hallway, porch, balcony, other.\n\n"
    "Set has_toilet true if any room is a bathroom/toilet. Set "
    "scale_established true only if you found a real dimension label or "
    "scale reference to base area_sqft estimates on.\n\n"
    "counts.room/wall/door/window are the totals across the whole plan, not "
    "just per room."
)


def _gemini_analyze(png_bytes: bytes, room_count_hint: int | None = None):
    """
    Ask Gemini to read the floor plan directly instead of relying on the
    trained YOLO detector's box regression, which is not yet accurate enough
    to trust for door/window/wall counts (see doc/MODEL_TRAINING_GUIDE.md for
    the training history). Returns a dict shaped so the rest of predict() can
    treat it like YOLO-derived data, or None on any failure so the caller
    falls back to the YOLO path.

    room_count_hint, when given, is YOLO's own room count. It's passed only
    as an advisory cross-check, not a constraint — YOLO's room-class mAP50
    looked strong on the CubiCasa validation set but doesn't reliably
    generalize to other plans, so Gemini's own reading of the image is what's
    actually used; a hint that disagrees with what's visible should be
    ignored rather than forced.
    """
    if _gemini_client is None:
        return {"_error": "Gemini client is not configured. Check GEMINI_API_KEY / GOOGLE_API_KEY."}

    prompt = _GEMINI_ANALYSIS_PROMPT
    if room_count_hint:
        prompt += (
            f"\n\nFor reference, a separate (less reliable) detector estimated "
            f"roughly {room_count_hint} room(s) in this plan. Treat this only as "
            f"a rough cross-check — count what you actually see in the image, "
            f"and disregard this number if your own count differs."
        )

    try:
        response = _gemini_client.models.generate_content(
            model=_gemini_model_name,
            contents=[
                _genai_types.Part.from_bytes(
                    data=png_bytes, mime_type="image/png"),
                prompt,
            ],
            config=_genai_types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=_GeminiAnalysis,
            ),
        )
        result = response.parsed.model_dump(
        ) if response.parsed is not None else json.loads(response.text)
        print(
            f"[INFO] Gemini ({_gemini_model_name}) counts: {result.get('counts')}")
        return result
    except Exception as e:
        print(f"[WARN] Gemini analysis failed, falling back to YOLO: {e}")
        return {"_error": str(e)}


def _bboxes_overlap(a, b):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    return not (ax2 < bx1 or bx2 < ax1 or ay2 < by1 or by2 < ay1)


def _box_center(box: dict) -> tuple[float, float]:
    return ((box['x1'] + box['x2']) / 2, (box['y1'] + box['y2']) / 2)


def _feature_belongs_to_room(room_bbox: tuple, feature_box: dict, pad: int = 12) -> bool:
    rx1, ry1, rx2, ry2 = room_bbox
    padded = (rx1 - pad, ry1 - pad, rx2 + pad, ry2 + pad)
    feature_bbox = (feature_box['x1'], feature_box['y1'], feature_box['x2'], feature_box['y2'])
    cx, cy = _box_center(feature_box)

    return (
        _bboxes_overlap(padded, feature_bbox)
        or (rx1 - pad <= cx <= rx2 + pad and ry1 - pad <= cy <= ry2 + pad)
    )


def _assign_rooms_from_boxes(boxes: list) -> list:
    """
    Given YOLO boxes, assign door/window/wall detections to each room using
    center-point containment (doors/windows) and bbox overlap (walls — they
    sit ON the room boundary, so a small padding tolerance is used, same as
    the SVG ground-truth path used to do). Returns per-room dicts with doors,
    windows, wall count/thickness, and pixel area, plus an internal '_bbox'
    used for OCR-based room naming — callers must pop it before returning.
    """
    room_boxes = [b for b in boxes if b['cls'] == 'room']
    door_boxes = [b for b in boxes if b['cls'] == 'door']
    win_boxes = [b for b in boxes if b['cls'] == 'window']
    wall_boxes = [b for b in boxes if b['cls'] == 'wall']

    rooms = []
    for rb in room_boxes:
        rx1, ry1, rx2, ry2 = rb['x1'], rb['y1'], rb['x2'], rb['y2']
        area_px2 = round((rx2 - rx1) * (ry2 - ry1))

        # Door/window ids (indices into the respective box lists) so callers
        # can deduplicate shared features across multiple rooms.
        room_bbox = (rx1, ry1, rx2, ry2)
        door_ids = [i for i, d in enumerate(door_boxes)
                    if _feature_belongs_to_room(room_bbox, d)]
        win_ids = [i for i, w in enumerate(win_boxes)
                   if _feature_belongs_to_room(room_bbox, w)]

        pad = 6  # px tolerance — walls sit exactly on the room boundary
        padded = (rx1 - pad, ry1 - pad, rx2 + pad, ry2 + pad)
        touching_walls = [(i, w) for i, w in enumerate(wall_boxes)
                          if _bboxes_overlap(padded, (w['x1'], w['y1'], w['x2'], w['y2']))]
        wall_thickness_px = None
        for _idx, w in touching_walls:
            thickness = min(w['x2'] - w['x1'], w['y2'] - w['y1'])
            if wall_thickness_px is None or thickness < wall_thickness_px:
                wall_thickness_px = thickness

        rooms.append({
            'name': '',
            'type': 'other',
            'area_px2': area_px2,
            'doors': len(door_ids),
            'windows': len(win_ids),
            'walls': len(touching_walls),
            'door_ids': door_ids,
            'window_ids': win_ids,
            'wall_ids': [i for i, _ in touching_walls],
            'wall_thickness_px': wall_thickness_px,
            '_bbox': (rx1, ry1, rx2, ry2),
        })
    return rooms


def _estimate_scale(rooms: list, door_boxes: list):
    """
    Estimate px-per-sqft from OCR'd dimension-style room labels (e.g.
    "8'11\" x 9'7\""), falling back to an assumed standard door width when no
    such label is found. Mirrors the SVG ground-truth path's calibration —
    same idea, just working from detected (not vector) geometry.

    Returns (px2_per_sqft or None, scale_source).
    """
    scale_samples = []
    for r in rooms:
        label = r.get('dimension_label') or r.get('name')
        sqft = _dim_label_to_sqft(label) if label else None
        if sqft and sqft > 0 and r.get('area_px2', 0) > 0:
            scale_samples.append(r['area_px2'] / sqft)

    if scale_samples:
        return sum(scale_samples) / len(scale_samples), 'dimension_label'

    if door_boxes:
        door_widths_px = [min(d['x2'] - d['x1'], d['y2'] - d['y1'])
                          for d in door_boxes]
        if door_widths_px:
            avg_door_px = sum(door_widths_px) / len(door_widths_px)
            px_per_ft = avg_door_px / _ASSUMED_DOOR_WIDTH_FT
            return px_per_ft ** 2, 'door_width_estimate'

    return None, 'none'


def _draw_yolo_overlay(png_bytes: bytes, boxes: list) -> str | None:
    """Draw YOLO bounding boxes on the PNG; return base64 JPEG string."""
    try:
        import cv2
        import numpy as np
        from PIL import Image as PILImage
    except ImportError:
        return None

    arr = np.frombuffer(png_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return None

    # Color map: BGR for OpenCV
    COLOR = {
        'room':   (0, 200, 255),   # yellow
        'wall':   (0, 30, 220),    # red
        'door':   (30, 200, 30),   # green
        'window': (255, 100, 30),  # blue
    }
    LABEL_COLOR = {
        'room':   (0, 140, 180),
        'wall':   (0, 0, 160),
        'door':   (0, 140, 0),
        'window': (200, 60, 0),
    }

    overlay = img.copy()
    for b in boxes:
        x1, y1, x2, y2 = int(b['x1']), int(b['y1']), int(b['x2']), int(b['y2'])
        cls = b['cls']
        color = COLOR.get(cls, (180, 180, 180))
        label_color = LABEL_COLOR.get(cls, (100, 100, 100))

        # Semi-transparent fill
        roi = overlay[y1:y2, x1:x2]
        filled = roi.copy()
        filled[:] = color
        overlay[y1:y2, x1:x2] = cv2.addWeighted(roi, 0.6, filled, 0.4, 0)

        # Solid border
        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2)

        # Label
        label = f"{cls} {b['conf']:.2f}"
        cv2.putText(overlay, label, (x1 + 3, y1 + 14),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, label_color, 1, cv2.LINE_AA)

    rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
    pil_img = PILImage.fromarray(rgb)
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode('utf-8')


# ── OpenCV fallback (used only when YOLO model is unavailable) ────────────────

def _opencv_analyze(png_bytes: bytes) -> dict:
    try:
        import cv2
        import numpy as np
    except ImportError:
        return {'room': 0, 'wall': 0, 'door': 0, 'window': 0}

    arr = np.frombuffer(png_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return {'room': 0, 'wall': 0, 'door': 0, 'window': 0}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    _, thresh = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)
    kernel = np.ones((3, 3), np.uint8)
    walls_mask = cv2.morphologyEx(
        thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

    wall_contours, _ = cv2.findContours(
        walls_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    wall_count = sum(
        1 for c in wall_contours if cv2.contourArea(c) > (h * w) * 0.0003)

    inv = cv2.bitwise_not(walls_mask)
    inv_eroded = cv2.erode(inv, np.ones((5, 5), np.uint8), iterations=1)
    num_labels, _, stats, _ = cv2.connectedComponentsWithStats(
        inv_eroded, connectivity=8)
    min_area = (h * w) * 0.008
    max_area = (h * w) * 0.80
    room_count = sum(1 for i in range(1, num_labels)
                     if min_area < stats[i, cv2.CC_STAT_AREA] < max_area)

    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    circles = cv2.HoughCircles(
        blur, cv2.HOUGH_GRADIENT, 1, 20, param1=60, param2=18, minRadius=8, maxRadius=50)
    door_count = int(len(circles[0])) if circles is not None else 0

    edges = cv2.Canny(gray, 40, 120)
    lines = cv2.HoughLinesP(edges, 1, 3.14159 / 180,
                            threshold=25, minLineLength=12, maxLineGap=4)
    line_count = len(lines) if lines is not None else 0
    window_count = max(0, (line_count - wall_count * 4) // 7)

    return {
        'room': max(0, room_count),
        'wall': max(0, wall_count),
        'door': max(0, door_count),
        'window': max(0, window_count),
    }


# ── FastAPI routes ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Plan Analyzer ML Service", "model": WEIGHTS.name,
            "checkpoint_available": WEIGHTS.is_file(), "image_size": IMGSZ}


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    from fastapi import HTTPException
    from starlette.concurrency import run_in_threadpool
    png_bytes = await image.read()
    try:
        return await run_in_threadpool(analyze_image, png_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        import logging
        logging.exception("Blueprint inference failed")
        raise HTTPException(status_code=503, detail="Blueprint model unavailable or inference failed. Check the model service log.") from exc


def analyze_image(png_bytes):
    counts, boxes = _yolo_predict(png_bytes)
    rooms = _assign_rooms_from_boxes(boxes)
    for i, room in enumerate(rooms):
        room.update(name=f"Room {i+1}", type="other", area_sqft=None,
                    confidence=[b for b in boxes if b['cls']=='room'][i]['conf'])
        room.pop('_bbox', None)
        room.pop('wall_thickness_px', None)
    return {
        "counts": counts, "rooms": rooms, "room_names": [r['name'] for r in rooms],
        "detections": boxes, "low_confidence": not bool(boxes),
        "overlay": "data:image/jpeg;base64," + _draw_yolo_overlay(png_bytes, boxes),
        "compliance": None, "approval_checklist": [], "analysis_source": "yolo",
        "model_confidence_thresholds": _YOLO_CLASS_CONF, "model_image_size": IMGSZ,
        "model_name": "blueprint_clean_gpu", "gemini_error": None,
        "notice": "Detected objects need review. Room associations are approximate. Dimensions and regulatory compliance are not established by object detection.",
    }


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 8010))
    uvicorn.run(app, host="0.0.0.0", port=port)
