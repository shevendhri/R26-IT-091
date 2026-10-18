"""Convert CubiCasa5K SVG polygons to COCO bounding-box annotations.

Requires: pip install Pillow
Run: python backend/ml/convert_cubicasa_svg_to_coco.py

This is a four-class object-detection conversion (Wall/Door/Window/Room), not
pixel segmentation. Inspect annotation previews before training.
"""
from __future__ import annotations
import argparse
import json
import math
import random
import re
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from PIL import Image

CATEGORIES = [
    {"id": 1, "name": "Wall", "supercategory": "structure"},
    {"id": 2, "name": "Door", "supercategory": "opening"},
    {"id": 3, "name": "Window", "supercategory": "opening"},
    {"id": 4, "name": "Room", "supercategory": "space"},
]
NUMBER = r"[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?"


def nums(s):
    return [float(x) for x in re.findall(NUMBER, s or "")]


def tag(el):
    return el.tag.rsplit("}", 1)[-1].lower()


def mul(a, b):
    # Affine [a,b,c,d,e,f] corresponding to matrix(a b c d e f), a @ b
    return (a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1],
            a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3],
            a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5])


def transforms(s):
    result = (1., 0., 0., 1., 0., 0.)
    for kind, args in re.findall(r"([A-Za-z]+)\s*\(([^)]*)\)", s or ""):
        v = nums(args)
        if kind == "matrix" and len(v) == 6:
            m = tuple(v)
        elif kind == "translate" and v:
            m = (1., 0., 0., 1., v[0], v[1] if len(v) > 1 else 0.)
        elif kind == "scale" and v:
            m = (v[0], 0., 0., v[1] if len(v) > 1 else v[0], 0., 0.)
        elif kind == "rotate" and v:
            a = math.radians(v[0])
            c, ss = math.cos(a), math.sin(a)
            m = (c, ss, -ss, c, 0., 0.)
            if len(v) >= 3:
                m = mul(mul((1., 0., 0., 1., v[1], v[2]), m),
                        (1., 0., 0., 1., -v[1], -v[2]))
        else:
            raise ValueError(f"Unsupported SVG transform {kind}: {args}")
        result = mul(result, m)
    return result


def label(el, inherited):
    # Nearest typed <g> is used. Keep structural classes above generic spaces.
    cls = set((el.get("class") or "").replace("-", " ").split())
    ident = el.get("id") or ""
    if "Wall" in cls or ident == "Wall":
        return "Wall"
    if "Door" in cls or ident == "Door":
        return "Door"
    if "Window" in cls or ident == "Window":
        return "Window"
    if "Space" in cls or ident == "Space":
        return "Room"
    return inherited


def points_for(el):
    kind = tag(el)
    if kind in ("polygon", "polyline"):
        arr = nums(el.get("points"))
        return list(zip(arr[::2], arr[1::2])) if len(arr) >= 6 and len(arr) % 2 == 0 else []
    if kind == "rect":
        x, y = float(el.get("x", 0)), float(el.get("y", 0))
        w, h = float(el.get("width", 0)), float(el.get("height", 0))
        return [(x, y), (x+w, y), (x+w, y+h), (x, y+h)] if w > 0 and h > 0 else []
    return []


def extract(svg, width, height, include_outdoor=False):
    """Read direct semantic boundaries in CubiCasa's F1_scaled pixel frame.

    SVG viewport dimensions are not the annotation coordinate frame. Match the
    official loader: coordinates refer to F1_scaled.png, then scale to original.
    Never inherit object classes into dimension marks, panels or glass details.
    """
    svg = Path(svg)
    root = ET.parse(svg).getroot()
    with Image.open(svg.parent / "F1_scaled.png") as reference:
        rw, rh = reference.size
    sx, sy = width / rw, height / rh
    boxes, seen = [], set()

    def walk(el, parent_transform):
        transform = mul(parent_transform, transforms(el.get("transform")))
        typ = label(el, None) if tag(el) == "g" else None
        outdoor = "Outdoor" in (el.get("class") or "").split()
        if typ and not (typ == "Room" and outdoor and not include_outdoor):
            boundaries = [ch for ch in el if tag(ch) == "polygon"]
            if len(boundaries) != 1:
                raise ValueError(f"Expected one direct boundary for {typ}, got {len(boundaries)}")
            boundary = boundaries[0]
            raw = points_for(boundary)
            if not raw:
                raise ValueError(f"Invalid {typ} boundary")
            matrix = mul(transform, transforms(boundary.get("transform")))
            xy = [((matrix[0]*x+matrix[2]*y+matrix[4])*sx,
                   (matrix[1]*x+matrix[3]*y+matrix[5])*sy) for x, y in raw]
            if not all(math.isfinite(v) for pt in xy for v in pt):
                raise ValueError("Nonfinite boundary")
            x1, x2 = max(0., min(x for x,y in xy)), min(float(width), max(x for x,y in xy))
            y1, y2 = max(0., min(y for x,y in xy)), min(float(height), max(y for x,y in xy))
            if x2 > x1 and y2 > y1:
                bbox = [round(x1, 3), round(y1, 3), round(x2-x1, 3), round(y2-y1, 3)]
                key = (typ, *bbox)
                if key not in seen:
                    seen.add(key)
                    boxes.append((typ, bbox))
            else:
                raise ValueError(f"{typ} boundary outside image")
        for ch in el:
            walk(ch, transform)
    walk(root, (1., 0., 0., 1., 0., 0.))
    return boxes


def find_dataset(root):
    if not root.exists():
        raise FileNotFoundError(root)
    items = sorted(root.rglob("model.svg"))
    if not items:
        raise RuntimeError(f"No model.svg files found beneath {root}")
    return items


def split_samples(root, samples, seed):
    # Honor split membership regardless of how many nested cubicasa5k folders exist.
    paths = list(root.rglob("train.txt"))
    for trainfile in paths:
        parent = trainfile.parent
        valfile = parent/"val.txt"
        if not valfile.is_file():
            continue

        def read(f):
            return [re.sub(r"/(?:F1_original\.png|F1_scaled\.png|model\.svg)$", "", s.strip().replace("\\", "/").removeprefix("./").strip("/")) for s in f.read_text(encoding="utf-8-sig").splitlines() if s.strip()]

        def match(split_list):
            result = []
            for svg in samples:
                sample_path = svg.parent.as_posix().strip("/")
                rel = svg.parent.relative_to(root).as_posix()
                if any(rel == v or rel.endswith("/"+v) or sample_path.endswith("/"+v) for v in split_list):
                    result.append(svg)
            return result
        train, val = match(read(trainfile)), match(read(valfile))
        if train and val:
            if set(train) & set(val):
                raise ValueError("Overlapping train/validation samples")
            print(f"Using official splits: {trainfile}, {valfile}")
            return train, val
    print("WARNING: Official train.txt and val.txt not found/matched; making deterministic 80/20 split")
    shuffled = samples[:]
    random.Random(seed).shuffle(shuffled)
    n = max(1, int(len(shuffled)*0.2))
    return shuffled[n:], shuffled[:n]


def make_coco(samples, dataset_root, ids_start=1):
    images, annotations, counts = [], [], Counter()
    failures = []
    image_id, annotation_id = ids_start, 1
    for svg in samples:
        folder = svg.parent
        image_path = next((folder/name for name in ("F1_original.png",
                          "F1_scaled.png") if (folder/name).is_file()), None)
        if image_path is None:
            failures.append(f"Image missing: {folder}")
            continue
        try:
            with Image.open(image_path) as im:
                w, h = im.size
            boxes = extract(svg, w, h)
        except (OSError, ET.ParseError, ValueError) as e:
            failures.append(f"{svg}: {e}")
            continue
        if not boxes:
            failures.append(f"No supported polygon/rect annotation: {svg}")
            continue
        # The user's YOLO script searches after 'cubicasa5k/' in file_name;
        # this absolute resolved path is handled by the updated preparer included alongside.
        images.append({"id": image_id, "file_name": image_path.relative_to(dataset_root).as_posix(),
                       "width": w, "height": h})
        for name, bbox in boxes:
            cid = next(c["id"] for c in CATEGORIES if c["name"] == name)
            annotations.append({"id": annotation_id, "image_id": image_id, "category_id": cid,
                                "bbox": bbox, "area": round(bbox[2]*bbox[3], 3), "iscrowd": 0})
            annotation_id += 1
            counts[name] += 1
        image_id += 1
    return {"images": images, "annotations": annotations, "categories": CATEGORIES}, counts, failures


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--images-root", type=Path,
                   default=Path(__file__).resolve().parents[1]/"data"/"cubicasa5k")
    p.add_argument("--output-dir", type=Path,
                   default=Path(__file__).resolve().parents[1]/"data"/"cubicasa5k_coco_clean")
    p.add_argument("--seed", type=int, default=42)
    args = p.parse_args()
    root = args.images_root.resolve()
    samples = find_dataset(root)
    train, val = split_samples(root, samples, args.seed)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, subset in (("train", train), ("val", val)):
        data, counts, issues = make_coco(subset, root)
        if not data["images"] or not data["annotations"]:
            raise RuntimeError(
                f"{name}: no valid images/annotations; first problems: {issues[:5]}")
        out = args.output_dir/f"{name}_coco_pt.json"
        with out.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(
            f"{name}: {len(data['images'])} images, {len(data['annotations'])} boxes, counts={dict(counts)} -> {out}")
        print(
            f"{name}: {len(issues)} skipped/problem samples; examples: {issues[:3]}")
    print("Review annotations visually before using them to train a model. SVG curved paths are not included.")


if __name__ == "__main__":
    main()
