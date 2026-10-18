"""Build isolated, audited detection data from official CubiCasa splits."""
import argparse
import hashlib
import json
import random
import shutil
from collections import Counter
from pathlib import Path
from PIL import Image, ImageDraw
from convert_cubicasa_svg_to_coco import extract

BASE = Path(__file__).resolve().parents[1]
NAMES = ["Wall", "Door", "Window", "Room"]
COLORS = ["red", "blue", "orange", "green"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=BASE / "datasets/blueprints_clean_v2")
    parser.add_argument("--train-limit", type=int, default=800)
    parser.add_argument("--val-limit", type=int, default=200)
    args = parser.parse_args()
    root = BASE / "data/cubicasa5k"
    out = args.output.resolve()
    if out.exists():
        raise FileExistsError(f"Use a new output directory: {out}")
    split_paths = {}
    for split in ["train", "val", "test"]:
        paths = [root / line.strip().strip("/") for line in (root / f"{split}.txt").read_text().splitlines() if line.strip()]
        if len(paths) != len(set(paths)):
            raise ValueError(f"Duplicate official {split} paths")
        split_paths[split] = paths
    for a,b in [("train","val"),("train","test"),("val","test")]:
        if set(split_paths[a]) & set(split_paths[b]):
            raise ValueError(f"Split overlap: {a}/{b}")
    report = {"classes": NAMES, "outdoor_rooms": False, "coordinate_frame": "F1_scaled.png", "splits": {}}
    all_hashes = {}
    for split, limit in [("train",args.train_limit),("val",args.val_limit),("test",0)]:
        paths = split_paths[split][:]
        random.Random(42).shuffle(paths)
        if limit: paths = paths[:limit]
        counts = Counter(); records = []; small = Counter(); rejected = []
        for folder in paths:
            source = folder / "F1_scaled.png"
            with Image.open(source) as image:
                width,height = image.size
                try:
                    boxes = extract(folder / "model.svg", width, height)
                except (ValueError, OSError) as exc:
                    rejected.append({"source": str(folder), "reason": str(exc)})
                    continue
                if not boxes: raise ValueError(f"Empty labels: {folder}")
                key = folder.relative_to(root).as_posix().replace("/", "_")
                image_dir, label_dir = out / split / "images", out / split / "labels"
                image_dir.mkdir(parents=True,exist_ok=True); label_dir.mkdir(parents=True,exist_ok=True)
                digest = hashlib.sha256(source.read_bytes()).hexdigest()
                if digest in all_hashes and all_hashes[digest] != split:
                    raise ValueError(f"Identical image across splits: {folder}")
                all_hashes[digest] = split
                shutil.copy2(source, image_dir / f"{key}.png")
                lines = set()
                for name,(x,y,w,h) in boxes:
                    c = NAMES.index(name)
                    if not (w > 0 and h > 0 and x >= 0 and y >= 0 and x+w <= width+.01 and y+h <= height+.01):
                        raise ValueError(f"Invalid box: {folder}")
                    line = f"{c} {(x+w/2)/width:.8f} {(y+h/2)/height:.8f} {w/width:.8f} {h/height:.8f}"
                    if line in lines: continue
                    lines.add(line); counts[name] += 1
                    if min(w,h)*960/max(width,height) < 4: small[name] += 1
                (label_dir / f"{key}.txt").write_text("\n".join(sorted(lines))+"\n")
                if len(records) < 12 and split != "test":
                    # Four separate panels avoid hiding narrow objects under Room boxes.
                    thumb = image.convert("RGB"); thumb.thumbnail((800,800))
                    canvas = Image.new("RGB", (thumb.width*2, (thumb.height+25)*2), "white")
                    for c,name in enumerate(NAMES):
                        panel=thumb.copy(); draw=ImageDraw.Draw(panel)
                        for typ,(x,y,w,h) in boxes:
                            if typ == name:
                                draw.rectangle((x*thumb.width/width,y*thumb.height/height,(x+w)*thumb.width/width,(y+h)*thumb.height/height),outline=COLORS[c],width=2)
                        px=(c%2)*thumb.width; py=(c//2)*(thumb.height+25)
                        canvas.paste(panel,(px,py+25)); ImageDraw.Draw(canvas).text((px+4,py+4),name,fill="black")
                    preview=out / "previews"; preview.mkdir(exist_ok=True)
                    canvas.save(preview / f"{split}_{key}.jpg")
            records.append({"key":key,"source":str(source),"sha256":digest})
            if len(records)%100 == 0: print(split,len(records),flush=True)
        report["splits"][split]={"rejected": rejected, "images":len(records),"boxes":dict(counts),"short_side_under_4px_at_960":dict(small),"records":records}
    yaml = f"path: {out.as_posix()}\ntrain: train/images\nval: val/images\ntest: test/images\nnames: {json.dumps(NAMES)}\n"
    (out / "data.yaml").write_text(yaml)
    # Explicitly leaked subset ONLY for a learning diagnostic, never evaluation.
    sanity = [f"./train/images/{r['key']}.png" for r in report["splits"]["train"]["records"][:16]]
    (out / "sanity.txt").write_text("\n".join(sanity)+"\n")
    (out / "sanity.yaml").write_text(yaml.replace("train: train/images","train: sanity.txt").replace("val: val/images","val: sanity.txt"))
    (out / "audit.json").write_text(json.dumps(report,indent=2))
    for split, stats in report["splits"].items(): print(split,stats["images"],stats["boxes"])
    print(f"Ready: {out / 'data.yaml'}",flush=True)

if __name__ == "__main__": main()
