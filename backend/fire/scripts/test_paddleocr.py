from pathlib import Path
from importlib import metadata
import os
import sys

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ..config import Settings
from ..drawing_understanding.ocr.ocr_engine import PaddleOCRProvider

def version(package: str) -> str:
    try:
        return metadata.version(package)
    except metadata.PackageNotFoundError:
        return "not installed"

def main() -> int:
    image_path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    settings = Settings(ocr_engine="paddle")
    provider = PaddleOCRProvider(settings)
    print(f"python={sys.version.split()[0]}")
    print(f"paddle={version('paddlepaddle')}")
    print(f"paddleocr={version('paddleocr')}")
    print(f"device={provider.device}")
    print(f"mkldnn={str(provider.enable_mkldnn).lower()}")
    print(f"FLAGS_use_mkldnn={os.environ.get('FLAGS_use_mkldnn', '')}")
    ok, reason = provider.available()
    print(f"initialization={'ok' if ok else 'failed'}")
    if reason:
        print(f"reason={reason}")
    if not ok:
        return 1
    if image_path:
        if not image_path.exists():
            print(f"image=missing: {image_path}")
            return 2
        result = provider.extract_page(image_path.read_bytes(), image_path.name, 1)
        print(f"prediction={result.status}")
        print(f"items={len(result.items)}")
        if result.reason:
            print(f"reason={result.reason}")
        return 0 if result.status == "SUCCESS" else 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
