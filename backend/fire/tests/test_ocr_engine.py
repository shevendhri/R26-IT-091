import sys
from io import BytesIO
from types import SimpleNamespace
import pytest

from PIL import Image

from backend.config import Settings
from backend.drawing_understanding.analyzer import _merge_text_evidence
from backend.drawing_understanding.evidence.models import TextEvidence
from backend.drawing_understanding.ocr.ocr_engine import OCRResult, OCREngine, TesseractOCRProvider, _items_from_paddle_output, _short_error

def text(value: str, method: str, confidence: float = 0.8) -> TextEvidence:
    normalized=value.upper()
    return TextEvidence(value=value,confidence=confidence,source_file="plan.pdf",page=1,method=method,raw_evidence=value,normalized_text=normalized)

class FakeProvider:
    def __init__(self, name: str, available: bool, result: OCRResult | None = None):
        self.name=name
        self._available=available
        self._result=result or OCRResult([],[],name,"SUCCESS",1,None)
    def available(self):
        return self._available, None if self._available else f"{self.name} unavailable"
    def extract_page(self, image_bytes: bytes, source_file: str, page: int):
        return self._result

def test_auto_ocr_prefers_paddle(monkeypatch):
    providers={
        "paddle":FakeProvider("paddleocr",True,OCRResult([text("D1 120 x 210","paddleocr")],[], "paddleocr","SUCCESS",2,None)),
        "tesseract":FakeProvider("tesseract",True),
    }
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine._provider", lambda kind, *args: providers[kind])
    result=OCREngine(Settings(ocr_engine="auto")).extract(b"image","plan.png",1)
    assert result.provider=="paddleocr"
    assert result.items[0].normalized_text=="D1 120 X 210"

def test_auto_ocr_falls_back_to_tesseract(monkeypatch):
    providers={
        "paddle":FakeProvider("paddleocr",False),
        "tesseract":FakeProvider("tesseract",True,OCRResult([text("GROUND FLOOR PLAN","tesseract")],[], "tesseract","SUCCESS",3,None)),
    }
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine._provider", lambda kind, *args: providers[kind])
    result=OCREngine(Settings(ocr_engine="auto")).extract(b"image","plan.png",1)
    assert result.provider=="tesseract"
    assert "paddleocr unavailable" in result.warnings

def test_auto_ocr_falls_back_when_paddle_inference_fails(monkeypatch):
    providers={
        "paddle":FakeProvider("paddleocr",True,OCRResult([],["PaddleOCR failed: native error"], "paddleocr","FAILED",5,"native error")),
        "tesseract":FakeProvider("tesseract",True,OCRResult([text("GROUND FLOOR PLAN","tesseract")],[], "tesseract","SUCCESS",3,None)),
    }
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine._provider", lambda kind, *args: providers[kind])
    result=OCREngine(Settings(ocr_engine="auto")).extract(b"image","plan.png",1)
    assert result.provider=="tesseract"
    assert result.status=="SUCCESS"
    assert "PaddleOCR failed: native error" in result.warnings

def test_auto_ocr_returns_unavailable_when_all_providers_unavailable(monkeypatch):
    providers={
        "paddle":FakeProvider("paddleocr",False),
        "tesseract":FakeProvider("tesseract",False),
    }
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine._provider", lambda kind, *args: providers[kind])
    result=OCREngine(Settings(ocr_engine="auto")).extract(b"image","plan.png",1)
    assert result.provider=="none"
    assert result.status=="UNAVAILABLE"
    assert "paddleocr unavailable" in result.reason
    assert "tesseract unavailable" in result.reason

def test_ocr_error_reason_is_shortened():
    exc=RuntimeError('File "x", line 1\nNotFoundError: OneDnnContext does not have the input Filter.\nextra detail')
    assert _short_error(exc)=="PaddleOCR failed during CPU inference: OneDNN/MKLDNN fused convolution error."
    assert "File " not in _short_error(exc)

def test_paddle_mkldnn_false_sets_flag_without_overwriting(monkeypatch):
    from backend.drawing_understanding.ocr.ocr_engine import PaddleOCRProvider
    monkeypatch.delenv("FLAGS_use_mkldnn", raising=False)
    provider=PaddleOCRProvider(Settings(paddle_enable_mkldnn=False))
    assert provider.enable_mkldnn is False
    assert provider.device=="cpu"
    assert provider.diagnostics()["flags_use_mkldnn"]=="0"
    monkeypatch.setenv("FLAGS_use_mkldnn","1")
    provider=PaddleOCRProvider(Settings(paddle_enable_mkldnn=False))
    assert provider.diagnostics()["flags_use_mkldnn"]=="1"

def test_paddle_mkldnn_true_preserves_user_flag(monkeypatch):
    from backend.drawing_understanding.ocr.ocr_engine import PaddleOCRProvider
    monkeypatch.delenv("FLAGS_use_mkldnn", raising=False)
    provider=PaddleOCRProvider(Settings(paddle_enable_mkldnn=True))
    assert provider.enable_mkldnn is True
    assert provider.diagnostics()["flags_use_mkldnn"] is None

def fake_pytesseract(version: str = "5.3.0", data: dict | None = None):
    return SimpleNamespace(
        pytesseract=SimpleNamespace(tesseract_cmd=""),
        get_tesseract_version=lambda: version,
        Output=SimpleNamespace(DICT="dict"),
        image_to_data=lambda image, output_type=None: data or {},
    )

def tesseract_data(words: list[str], confidence: str = "90") -> dict:
    return {
        "text":words,
        "conf":[confidence for _ in words],
        "left":[10 + (index * 35) for index,_ in enumerate(words)],
        "top":[10 for _ in words],
        "width":[30 for _ in words],
        "height":[12 for _ in words],
        "block_num":[1 for _ in words],
        "par_num":[1 for _ in words],
        "line_num":[1 for _ in words],
        "word_num":[index + 1 for index,_ in enumerate(words)],
    }

def test_tesseract_path_discovery_uses_path(monkeypatch):
    fake=fake_pytesseract()
    monkeypatch.setitem(sys.modules,"pytesseract",fake)
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.shutil.which",lambda name: r"C:\Tools\tesseract.exe")
    provider=TesseractOCRProvider(Settings(tesseract_cmd=""))
    ok,reason=provider.available()
    assert ok and reason is None
    assert fake.pytesseract.tesseract_cmd==r"C:\Tools\tesseract.exe"
    assert provider.diagnostics()["version"]=="5.3.0"

def test_tesseract_explicit_env_path(monkeypatch):
    fake=fake_pytesseract()
    monkeypatch.setitem(sys.modules,"pytesseract",fake)
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.Path.is_file",lambda self: str(self)==r"C:\custom\tesseract.exe")
    provider=TesseractOCRProvider(Settings(tesseract_cmd=r"C:\custom\tesseract.exe"))
    ok,reason=provider.available()
    assert ok and reason is None
    assert fake.pytesseract.tesseract_cmd==r"C:\custom\tesseract.exe"

def test_tesseract_invalid_env_path_is_unavailable(monkeypatch):
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.Path.is_file",lambda self: False)
    provider=TesseractOCRProvider(Settings(tesseract_cmd=r"C:\missing\tesseract.exe"))
    ok,reason=provider.available()
    assert not ok
    assert "configured TESSERACT_CMD" in reason

def test_tesseract_windows_default_path(monkeypatch):
    fake=fake_pytesseract()
    default_path=r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    monkeypatch.setitem(sys.modules,"pytesseract",fake)
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.os.name","nt")
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.shutil.which",lambda name: None)
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.Path.is_file",lambda self: str(self)==default_path)
    provider=TesseractOCRProvider(Settings(tesseract_cmd=""))
    ok,reason=provider.available()
    assert ok and reason is None
    assert fake.pytesseract.tesseract_cmd==default_path

def test_tesseract_groups_words_into_lines(monkeypatch):
    fake=fake_pytesseract(data={
        "text":["DOOR","SCHEDULE","D1","900","x","2100"],
        "conf":["90","90","90","90","90","90"],
        "left":[10,50,120,150,190,210],
        "top":[10,10,10,10,10,10],
        "width":[35,65,25,35,10,45],
        "height":[12,12,12,12,12,12],
        "block_num":[1,1,1,1,1,1],
        "par_num":[1,1,1,1,1,1],
        "line_num":[1,1,1,1,1,1],
        "word_num":[1,2,3,4,5,6],
    })
    monkeypatch.setitem(sys.modules,"pytesseract",fake)
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.shutil.which",lambda name: r"C:\Tools\tesseract.exe")
    output=BytesIO()
    Image.new("RGB",(320,80),"white").save(output,"PNG")
    result=TesseractOCRProvider(Settings(tesseract_cmd="")).extract_page(output.getvalue(),"plan.png",1)
    assert result.status=="SUCCESS"
    assert len(result.items)==1
    assert result.items[0].normalized_text=="DOOR SCHEDULE D1 900 X 2100"

@pytest.mark.parametrize("best_angle", [0,90,180,270])
def test_tesseract_records_best_orientation(monkeypatch,best_angle):
    calls=[]
    def image_to_data(image, output_type=None):
        angle=(0,90,180,270)[len(calls)]
        calls.append(angle)
        if angle==best_angle:
            return tesseract_data(["GROUND","FLOOR","PLAN"],"95")
        return tesseract_data([],"0")
    fake=SimpleNamespace(
        pytesseract=SimpleNamespace(tesseract_cmd=""),
        get_tesseract_version=lambda: "5.3.0",
        Output=SimpleNamespace(DICT="dict"),
        image_to_data=image_to_data,
    )
    monkeypatch.setitem(sys.modules,"pytesseract",fake)
    monkeypatch.setattr("backend.drawing_understanding.ocr.ocr_engine.shutil.which",lambda name: r"C:\Tools\tesseract.exe")
    output=BytesIO()
    Image.new("RGB",(320,80),"white").save(output,"PNG")
    result=TesseractOCRProvider(Settings(tesseract_cmd="")).extract_page(output.getvalue(),"plan.png",1)
    assert result.orientation_detected_deg==best_angle
    assert result.orientation_corrected is (best_angle != 0)
    assert result.orientation_transform=={"rotation_applied_deg":best_angle}

def test_paddle_output_is_normalized_to_text_evidence():
    output=[[[[0,0],[100,0],[100,20],[0,20]],("DOOR SCHEDULE D1 120 x 210",0.92)]]
    items=_items_from_paddle_output(output,200,100,"plan.png",1)
    assert len(items)==1
    assert items[0].method=="paddleocr"
    assert items[0].normalized_text=="DOOR SCHEDULE D1 120 X 210"
    assert items[0].bbox.width==0.5

def test_native_and_ocr_text_fusion_dedupes_and_warns_on_dimension_conflict():
    merged,warnings=_merge_text_evidence(
        [text("D1 120 x 210","pdf_native_text",0.6)],
        [text("D1 120 x 210","paddleocr",0.9), text("D1 90 x 210","paddleocr",0.9)],
    )
    assert len(merged)==2
    assert merged[0].method=="pdf_native_text"
    assert warnings==["Native PDF and OCR dimension-like text disagree; schedule dimensions need manual review."]
