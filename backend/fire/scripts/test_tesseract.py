from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from PIL import Image

from ..config import Settings
from ..drawing_understanding.ocr.ocr_engine import TesseractOCRProvider

def main() -> int:
    image_path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    provider = TesseractOCRProvider(Settings())
    print(f"python={sys.version.split()[0]}")
    diagnostics = provider.diagnostics(initialize=True)
    print(f"executable={diagnostics.get('executable') or 'not found'}")
    print(f"version={diagnostics.get('version') or 'unknown'}")
    print(f"available={str(bool(diagnostics.get('available'))).lower()}")
    if diagnostics.get("reason"):
        print(f"reason={diagnostics['reason']}")
    if not diagnostics.get("available"):
        return 1
    if image_path:
        if not image_path.exists():
            print(f"image=missing: {image_path}")
            return 2
        import pytesseract
        text = pytesseract.image_to_string(Image.open(image_path))
        words = [word for word in text.split() if word.strip()]
        preview = " ".join(words[:20])
        print(f"text_count={len(words)}")
        print(f"preview={preview}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
