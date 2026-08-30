from io import BytesIO
from PIL import Image, ImageOps, ImageFilter

def preprocess_for_ocr(image_bytes: bytes) -> bytes:
    try:
        import cv2
        import numpy as np
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        array = cv2.fastNlMeansDenoising(array, None, 7, 7, 21)
        array = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(array)
        _, encoded = cv2.imencode(".png", array)
        return encoded.tobytes()
    except Exception:
        image = Image.open(BytesIO(image_bytes)).convert("L")
        image = ImageOps.autocontrast(image).filter(ImageFilter.SHARPEN)
        out = BytesIO()
        image.save(out, format="PNG")
        return out.getvalue()
