"""
convert_dataset.py — CubicaSA 5k SVG → YOLO bounding-box format

Usage (run in Colab or locally):
    python convert_dataset.py \
        --src "/content/drive/MyDrive/cubicasa5k" \
        --dst "/content/drive/MyDrive/floorplan_v2/dataset" \
        --seed 42

Dataset structure expected:
    cubicasa5k/
        colorful/
            <plan_id>/
                model.svg
                F1_scaled.png
        high_quality/
            <plan_id>/
                model.svg
                F1_scaled.png

Output structure:
    dataset/
        images/
            train/ val/ test/
        labels/
            train/ val/ test/
"""

import os
import re
import sys
import argparse
import random
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path


# ── Class mapping ────────────────────────────────────────────────────────────
CLASS_MAP = {
    'room':   0,
    'wall':   1,
    'door':   2,
    'window': 3,
}

# Walls in particular are drawn as extremely thin, elongated rectangles (a
# straight wall segment can be 40-50x longer than it is thick). At IoU 0.5,
# boxes that thin are punishing: a couple pixels of regression error in the
# short dimension collapses IoU well below threshold, and random-scale
# augmentation (see train.py) can shrink the short side toward zero. Clamp
# each box's short dimension to a minimum fraction of the image so labels
# stay a detectable, learnable size instead of near-hairline.
MIN_BOX_DIM_FRAC = 0.015

# ── Reused from svg_parser.py ─────────────────────────────────────────────────

def _strip_ns(root):
    for elem in root.iter():
        if '}' in elem.tag:
            elem.tag = elem.tag.split('}', 1)[1]


def _parse_points(pts_str):
    pts = []
    for p in pts_str.strip().split():
        if ',' in p:
            try:
                x, y = p.split(',', 1)
                pts.append((float(x), float(y)))
            except ValueError:
                pass
    return pts


_PATH_TOKEN_RE = re.compile(r'[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?')


def _path_bbox_points(d: str):
    """
    Extract a set of points sufficient to bound an SVG <path> — used for
    door swing arcs (drawn as a 'q' quadratic curve, e.g. 'M x,y q dx1,dy1
    dx,dy') that a polygon-only parser silently drops. This does not
    render the exact curve; for Q/C bezier commands it uses the control
    points plus endpoint, and for A (elliptical arc) it pads by the arc's
    radii around both endpoints. Both are safe over-approximations for a
    bounding box, which only needs the shape's extent, not its exact path.
    """
    tokens = _PATH_TOKEN_RE.findall(d)
    points = []
    i = 0
    cmd = None
    cx = cy = 0.0
    start_x = start_y = 0.0

    def nums(n):
        nonlocal i
        vals = [float(t) for t in tokens[i:i + n]]
        i += n
        return vals

    while i < len(tokens):
        tok = tokens[i]
        if tok.isalpha():
            cmd = tok
            i += 1
        if cmd is None:
            break

        if cmd in 'Mm':
            x, y = nums(2)
            if cmd == 'm':
                x += cx
                y += cy
            cx, cy = x, y
            start_x, start_y = cx, cy
            points.append((cx, cy))
            cmd = 'L' if cmd == 'M' else 'l'  # subsequent bare pairs are implicit lineto
        elif cmd in 'Ll':
            x, y = nums(2)
            if cmd == 'l':
                x += cx
                y += cy
            cx, cy = x, y
            points.append((cx, cy))
        elif cmd in 'Hh':
            x, = nums(1)
            if cmd == 'h':
                x += cx
            cx = x
            points.append((cx, cy))
        elif cmd in 'Vv':
            y, = nums(1)
            if cmd == 'v':
                y += cy
            cy = y
            points.append((cx, cy))
        elif cmd in 'Cc':
            x1, y1, x2, y2, x, y = nums(6)
            if cmd == 'c':
                x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy
            points += [(x1, y1), (x2, y2), (x, y)]
            cx, cy = x, y
        elif cmd in 'Ss':
            x2, y2, x, y = nums(4)
            if cmd == 's':
                x2 += cx; y2 += cy; x += cx; y += cy
            points += [(x2, y2), (x, y)]
            cx, cy = x, y
        elif cmd in 'Qq':
            x1, y1, x, y = nums(4)
            if cmd == 'q':
                x1 += cx; y1 += cy; x += cx; y += cy
            points += [(x1, y1), (x, y)]
            cx, cy = x, y
        elif cmd in 'Tt':
            x, y = nums(2)
            if cmd == 't':
                x += cx; y += cy
            points.append((x, y))
            cx, cy = x, y
        elif cmd in 'Aa':
            rx, ry, _rot, _laf, _sf, x, y = nums(7)
            if cmd == 'a':
                x += cx; y += cy
            points += [(cx - rx, cy - ry), (cx + rx, cy + ry),
                       (x - rx, y - ry), (x + rx, y + ry), (x, y)]
            cx, cy = x, y
        elif cmd in 'Zz':
            cx, cy = start_x, start_y
            points.append((cx, cy))
        else:
            i += 1  # unknown token — skip defensively

    return points


def _classify(raw_class: str):
    """Return the YOLO class name a raw (class+id) string belongs to, or None."""
    if raw_class.startswith('space ') and 'outdoor' not in raw_class:
        return 'room'
    elif raw_class.startswith('wall'):
        return 'wall'
    elif raw_class.startswith('door'):
        return 'door'
    elif raw_class.startswith('window'):
        return 'window'
    return None


def _group_bbox(g):
    """
    Return the union bbox of every polygon/rect shape that belongs to this
    group, WITHOUT descending into nested sub-groups that are themselves a
    classified element (space/wall/door/window).

    CubiCasa SVGs nest Window/Door groups inside their parent Wall group
    (a window is an opening in a wall), each with their own Glass/Panel/
    Threshold sub-shapes. A naive full-subtree walk (elem.iter()) makes a
    Wall's bbox swallow whatever nested Window/Door shape happens to come
    first, mislabeling window/door pixels as wall. Stopping at nested
    classified groups keeps each group's bbox to only its own geometry,
    while still unioning its own non-classified sub-parts (e.g. a Window's
    Glass + Panel) into one accurate box.
    """
    xs, ys = [], []

    def walk(elem, is_root):
        if not is_root and elem.tag == 'g':
            raw = (elem.get('class', '') + ' ' + elem.get('id', '')).lower().strip()
            if _classify(raw) is not None:
                return  # nested classified group — it gets its own annotation

        if elem.tag in ('polygon', 'polyline'):
            for x, y in _parse_points(elem.get('points', '')):
                xs.append(x)
                ys.append(y)
        elif elem.tag == 'rect':
            try:
                x = float(elem.get('x', 0))
                y = float(elem.get('y', 0))
                w = float(elem.get('width', 0))
                h = float(elem.get('height', 0))
                if w > 0 and h > 0:
                    xs.extend([x, x + w])
                    ys.extend([y, y + h])
            except ValueError:
                pass
        elif elem.tag == 'path':
            for x, y in _path_bbox_points(elem.get('d', '')):
                xs.append(x)
                ys.append(y)

        for child in elem:
            walk(child, False)

    walk(g, True)
    if not xs or not ys:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def _svg_dimensions(root):
    """Extract (width, height) from SVG root — try viewBox, then width/height attrs."""
    viewbox = root.get('viewBox', '')
    if viewbox:
        parts = viewbox.replace(',', ' ').split()
        if len(parts) == 4:
            try:
                return float(parts[2]), float(parts[3])
            except ValueError:
                pass
    try:
        w = float(root.get('width', 0))
        h = float(root.get('height', 0))
        if w > 0 and h > 0:
            return w, h
    except ValueError:
        pass
    return None, None


# ── Core conversion ───────────────────────────────────────────────────────────

def svg_to_yolo_lines(svg_path: Path):
    """
    Parse one model.svg and return a list of YOLO label strings.
    Returns (lines, svg_w, svg_h) — lines may be empty if parse fails.
    """
    try:
        root = ET.parse(svg_path).getroot()
    except ET.ParseError as e:
        print(f"  [SKIP] XML parse error in {svg_path}: {e}")
        return [], 0, 0

    _strip_ns(root)
    svg_w, svg_h = _svg_dimensions(root)

    if not svg_w or not svg_h:
        print(f"  [SKIP] Cannot determine SVG dimensions: {svg_path}")
        return [], 0, 0

    lines = []

    for g in root.iter('g'):
        raw_class = (g.get('class', '') + ' ' + g.get('id', '')).lower().strip()

        cls_name = _classify(raw_class)
        if cls_name is None:
            continue
        cls_id = CLASS_MAP[cls_name]

        bbox = _group_bbox(g)
        if bbox is None:
            continue

        x1, y1, x2, y2 = bbox
        # Clamp to SVG bounds
        x1 = max(0.0, min(x1, svg_w))
        y1 = max(0.0, min(y1, svg_h))
        x2 = max(0.0, min(x2, svg_w))
        y2 = max(0.0, min(y2, svg_h))

        bw = x2 - x1
        bh = y2 - y1
        if bw <= 0 or bh <= 0:
            continue

        # Normalize to [0, 1]
        cx = (x1 + bw / 2) / svg_w
        cy = (y1 + bh / 2) / svg_h
        nw = bw / svg_w
        nh = bh / svg_h

        # Enforce a minimum box dimension (see MIN_BOX_DIM_FRAC) so thin
        # wall segments don't shrink to a near-invisible sliver; re-clamp
        # the center so the padded box still fits inside the image.
        nw = max(nw, MIN_BOX_DIM_FRAC)
        nh = max(nh, MIN_BOX_DIM_FRAC)
        cx = min(max(cx, nw / 2), 1.0 - nw / 2)
        cy = min(max(cy, nh / 2), 1.0 - nh / 2)

        lines.append(f"{cls_id} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")

    return lines, svg_w, svg_h


def collect_plans(src_root: Path):
    """
    Walk src_root looking for folders that contain both model.svg and F1_scaled.png.
    Returns list of (svg_path, png_path) tuples.
    """
    plans = []
    for svg_path in sorted(src_root.rglob('model.svg')):
        folder = svg_path.parent
        # CubicaSA uses F1_scaled.png (some plans may have F2_scaled.png etc.)
        png_candidates = list(folder.glob('F1_scaled.png'))
        if not png_candidates:
            png_candidates = list(folder.glob('*.png'))
        if png_candidates:
            plans.append((svg_path, png_candidates[0]))
    return plans


def split_plans(plans, seed=42):
    """Split plans into train/val/test (84% / 8% / 8% matching 4200/400/400)."""
    rng = random.Random(seed)
    shuffled = plans[:]
    rng.shuffle(shuffled)
    n = len(shuffled)
    n_val  = max(1, round(n * 0.08))
    n_test = max(1, round(n * 0.08))
    n_train = n - n_val - n_test
    return (
        shuffled[:n_train],
        shuffled[n_train:n_train + n_val],
        shuffled[n_train + n_val:],
    )


def write_split(split_plans, split_name: str, dst_root: Path, stats: dict):
    img_dir = dst_root / 'images' / split_name
    lbl_dir = dst_root / 'labels' / split_name
    img_dir.mkdir(parents=True, exist_ok=True)
    lbl_dir.mkdir(parents=True, exist_ok=True)

    skipped = 0
    for svg_path, png_path in split_plans:
        stem = f"{svg_path.parent.parent.name}_{svg_path.parent.name}"

        lines, _, _ = svg_to_yolo_lines(svg_path)
        if not lines:
            skipped += 1
            continue

        # Copy PNG
        dst_png = img_dir / f"{stem}.png"
        shutil.copy2(png_path, dst_png)

        # Write label file
        dst_lbl = lbl_dir / f"{stem}.txt"
        dst_lbl.write_text('\n'.join(lines) + '\n', encoding='utf-8')

        for line in lines:
            cls_id = int(line.split()[0])
            cls_name = [k for k, v in CLASS_MAP.items() if v == cls_id][0]
            stats[cls_name] = stats.get(cls_name, 0) + 1

    written = len(split_plans) - skipped
    print(f"  {split_name:6s}: {written:4d} plans written, {skipped} skipped")
    return written


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Convert CubicaSA SVGs to YOLO format")
    parser.add_argument('--src',  required=True, help="Path to cubicasa5k root folder")
    parser.add_argument('--dst',  required=True, help="Output dataset folder")
    parser.add_argument('--seed', type=int, default=42, help="Random seed for split")
    args = parser.parse_args()

    src = Path(args.src)
    dst = Path(args.dst)

    if not src.exists():
        print(f"ERROR: Source folder not found: {src}")
        sys.exit(1)

    print(f"Scanning {src} for floor plans...")
    plans = collect_plans(src)
    print(f"Found {len(plans)} floor plans with SVG + PNG pairs.\n")

    if not plans:
        print("No plans found. Check that your --src folder contains subfolders with model.svg and *.png files.")
        sys.exit(1)

    train_plans, val_plans, test_plans = split_plans(plans, seed=args.seed)
    print(f"Split: {len(train_plans)} train / {len(val_plans)} val / {len(test_plans)} test\n")

    stats = {}
    print(f"Writing dataset to {dst} ...")
    write_split(train_plans, 'train', dst, stats)
    write_split(val_plans,   'val',   dst, stats)
    write_split(test_plans,  'test',  dst, stats)

    print("\nAnnotation counts:")
    for cls_name, count in sorted(stats.items(), key=lambda x: CLASS_MAP[x[0]]):
        print(f"  {cls_name:8s}: {count:,}")

    # Write floorplan.yaml next to the dataset
    yaml_path = dst.parent / 'floorplan.yaml'
    yaml_path.write_text(
        f"path: {dst.as_posix()}\n"
        f"train: images/train\n"
        f"val:   images/val\n"
        f"test:  images/test\n\n"
        f"nc: 4\n"
        f"names: [room, wall, door, window]\n",
        encoding='utf-8',
    )
    print(f"\nDataset YAML written to: {yaml_path}")
    print("\nDone. Next step: run train.py --data <path/to/floorplan.yaml>")


if __name__ == '__main__':
    main()
