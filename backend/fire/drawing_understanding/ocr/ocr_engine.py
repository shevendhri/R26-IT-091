from dataclasses import dataclass
from functools import lru_cache
from importlib import metadata
from io import BytesIO
import logging
import os
from pathlib import Path
import shutil
import re
import sys
from time import perf_counter
from typing import Protocol
from PIL import Image
from ...config import Settings
from ...schemas import BBox
from ..evidence.models import TextEvidence
from .preprocess import preprocess_for_ocr
from .text_normalizer import normalize_text

logger=logging.getLogger("fireguard.ocr")

WINDOWS_TESSERACT_PATHS = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
)

@dataclass
class OCRResult:
    items: list[TextEvidence]
    warnings: list[str]
    provider: str
    status: str
    duration_ms: int | None = None
    reason: str | None = None
    orientation_detected_deg: int = 0
    orientation_confidence: float | None = None
    orientation_corrected: bool = False
    orientation_transform: dict | None = None

class OCRProvider(Protocol):
    name: str
    def available(self) -> tuple[bool, str | None]: ...
    def extract_page(self, image_bytes: bytes, source_file: str, page: int) -> OCRResult: ...
    def diagnostics(self, initialize: bool = False) -> dict: ...

def _image_size(image_bytes: bytes) -> tuple[int, int]:
    image=Image.open(BytesIO(image_bytes))
    return image.size

def _bbox_from_polygon(points, width: int, height: int) -> BBox | None:
    try:
        xs=[float(point[0]) for point in points]
        ys=[float(point[1]) for point in points]
        x0,x1=max(0,min(xs)),min(width,max(xs))
        y0,y1=max(0,min(ys)),min(height,max(ys))
        return BBox(x=x0/width,y=y0/height,width=max(0,(x1-x0)/width),height=max(0,(y1-y0)/height))
    except Exception:
        return None

def _short_error(exc: Exception) -> str:
    text = str(exc).strip()
    if not text:
        return exc.__class__.__name__
    not_found = re.search(r"NotFoundError:[^\n]+", text)
    if not_found:
        message=not_found.group(0)
        if "OneDnnContext" in message or "fused_conv2d" in text:
            return "PaddleOCR failed during CPU inference: OneDNN/MKLDNN fused convolution error."
        return message[:500]
    lines = [line.strip() for line in text.splitlines() if line.strip() and not line.strip().startswith("File ")]
    return (lines[-1] if lines else text)[:500]

def _data_value(data: dict, key: str, index: int, default=0):
    values=data.get(key)
    if values is None or index >= len(values):
        return default
    return values[index]

class NoneOCRProvider:
    name="none"
    def available(self) -> tuple[bool, str | None]:
        return True,None
    def extract_page(self, image_bytes: bytes, source_file: str, page: int) -> OCRResult:
        return OCRResult([],["OCR disabled by OCR_ENGINE=none."],self.name,"UNAVAILABLE",0,"OCR disabled by configuration.")
    def diagnostics(self, initialize: bool = False) -> dict:
        return {"provider":self.name,"available":False,"initialization":"disabled"}

class PaddleOCRProvider:
    name="paddleocr"
    def __init__(self, settings: Settings):
        self.settings=settings
        self.device=(settings.paddle_device or "cpu").lower()
        self.enable_mkldnn=bool(settings.paddle_enable_mkldnn)
        self._engine=None
        self._unavailable_reason=None
        self._init_logged=False
        self._apply_runtime_flags()
    def _apply_runtime_flags(self) -> None:
        if not self.enable_mkldnn:
            os.environ.setdefault("FLAGS_use_mkldnn", "0")
        os.environ.setdefault("FLAGS_enable_pir_api", "0")
    def available(self) -> tuple[bool, str | None]:
        try:
            self._get_engine()
            return True,None
        except Exception as exc:
            self._unavailable_reason=_short_error(exc)
            return False,f"PaddleOCR unavailable: {self._unavailable_reason}"
    def _get_engine(self):
        if self._engine is not None:
            return self._engine
        if sys.version_info >= (3, 13):
            raise RuntimeError("PaddleOCR is disabled on Python 3.13 because the installed Paddle/Torch native stack is incompatible. Use Python 3.10-3.12 or set OCR_ENGINE=tesseract.")
        self._apply_runtime_flags()
        from paddleocr import PaddleOCR
        try:
            self._engine=PaddleOCR(**self._modern_args())
        except TypeError:
            try:
                self._engine=PaddleOCR(**self._legacy_args(include_mkldnn=True))
            except TypeError:
                self._engine=PaddleOCR(**self._legacy_args(include_mkldnn=False))
        self._log_init()
        return self._engine
    def _modern_args(self) -> dict:
        return {
            "lang":"en",
            "device":self.device,
            "enable_mkldnn":self.enable_mkldnn,
            "use_doc_orientation_classify":False,
            "use_doc_unwarping":False,
            "use_textline_orientation":False,
        }
    def _legacy_args(self, include_mkldnn: bool) -> dict:
        args={"lang":"en","use_gpu":self.device.startswith("gpu"),"use_angle_cls":False,"show_log":False}
        if include_mkldnn:
            args["enable_mkldnn"]=self.enable_mkldnn
        return args
    def _version(self, package: str) -> str | None:
        try:
            return metadata.version(package)
        except metadata.PackageNotFoundError:
            return None
    def _base_diagnostics(self) -> dict:
        return {
            "ocr_engine":self.settings.ocr_engine,
            "provider":self.name,
            "python_version":sys.version.split()[0],
            "paddle_version":self._version("paddlepaddle"),
            "paddleocr_version":self._version("paddleocr"),
            "device":self.device,
            "mkldnn":self.enable_mkldnn,
            "flags_use_mkldnn":os.environ.get("FLAGS_use_mkldnn"),
        }
    def _log_init(self) -> None:
        if self._init_logged:
            return
        self._init_logged=True
        diag=self._base_diagnostics()
        logger.info("PaddleOCR initialized device=%s paddle=%s paddleocr=%s mkldnn=%s",diag["device"],diag["paddle_version"],diag["paddleocr_version"],diag["mkldnn"])
    def diagnostics(self, initialize: bool = False) -> dict:
        diag=self._base_diagnostics()
        if initialize:
            ok,reason=self.available()
            diag["available"]=ok
            diag["initialization"]="ok" if ok else "failed"
            diag["reason"]=reason
        else:
            diag["available"]=None
            diag["initialization"]="not_checked"
        return diag
    def extract_page(self, image_bytes: bytes, source_file: str, page: int) -> OCRResult:
        started=perf_counter()
        try:
            engine=self._get_engine()
            prepared=preprocess_for_ocr(image_bytes)
            width,height=_image_size(prepared)
            image = Image.open(BytesIO(prepared)).convert("RGB")
            try:
                import numpy as np
                paddle_input = np.array(image)
            except Exception as exc:
                return OCRResult([], [f"PaddleOCR failed: numpy is required for image conversion: {exc}"], self.name, "FAILED", int((perf_counter()-started)*1000), str(exc))
            if hasattr(engine, "ocr"):
                try:
                    output=engine.ocr(paddle_input,cls=True)
                except TypeError:
                    output=engine.ocr(paddle_input)
            elif hasattr(engine, "predict"):
                try:
                    output=engine.predict(paddle_input)
                except TypeError:
                    output=engine.predict(input=paddle_input)
            else:
                raise RuntimeError("PaddleOCR engine exposes neither ocr() nor predict().")
            items=_items_from_paddle_output(output,width,height,source_file,page)
            return OCRResult(items,[],self.name,"SUCCESS",int((perf_counter()-started)*1000),None)
        except Exception as exc:
            reason=_short_error(exc)
            return OCRResult([], [f"PaddleOCR failed: {reason}"], self.name, "FAILED", int((perf_counter()-started)*1000), reason)

class TesseractOCRProvider:
    name="tesseract"
    def __init__(self, settings: Settings):
        self.settings=settings
        self._diagnostics: dict | None = None
    def _discover_executable(self) -> tuple[str | None, str | None]:
        configured=(self.settings.tesseract_cmd or "").strip()
        if configured:
            if Path(configured).is_file():
                return configured,None
            return None,f"Tesseract executable was not found at configured TESSERACT_CMD: {configured}"
        path_value=shutil.which("tesseract")
        if path_value:
            return path_value,None
        if os.name=="nt":
            candidates=[*WINDOWS_TESSERACT_PATHS]
            local_appdata=os.environ.get("LOCALAPPDATA")
            if local_appdata:
                candidates.append(str(Path(local_appdata) / "Programs" / "Tesseract-OCR" / "tesseract.exe"))
            for candidate in candidates:
                if Path(candidate).is_file():
                    return candidate,None
        return None,"Tesseract executable was not found. Install Tesseract OCR or set TESSERACT_CMD."
    def _configure(self):
        import pytesseract
        executable,reason=self._discover_executable()
        if not executable:
            self._diagnostics={"available":False,"reason":reason,"executable":None,"version":None}
            return None,reason
        pytesseract.pytesseract.tesseract_cmd=executable
        return pytesseract,None
    def available(self) -> tuple[bool, str | None]:
        try:
            pytesseract,reason=self._configure()
            if pytesseract is None:
                return False,reason
            version=str(pytesseract.get_tesseract_version())
            self._diagnostics={"available":True,"reason":None,"executable":pytesseract.pytesseract.tesseract_cmd,"version":version}
            return True,None
        except Exception as exc:
            reason=_short_error(exc)
            self._diagnostics={"available":False,"reason":reason,"executable":None,"version":None}
            return False,f"Tesseract unavailable: {reason}"
    def extract_page(self, image_bytes: bytes, source_file: str, page: int) -> OCRResult:
        started=perf_counter()
        try:
            pytesseract,reason=self._configure()
            if pytesseract is None:
                return OCRResult([], [f"Tesseract unavailable: {reason}"], self.name, "FAILED", int((perf_counter()-started)*1000), reason)
            original = Image.open(BytesIO(preprocess_for_ocr(image_bytes)))
            selected_items: list[TextEvidence] = []
            selected_angle=0
            selected_score=-1.0
            selected_confidence=0.0
            for angle in (0,90,180,270):
                image = original.rotate(angle, expand=True) if angle else original
                data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
                items,avg_confidence = _items_from_tesseract_data(data,image.size,original.size,angle,source_file,page,self.name)
                score=len(items)+(avg_confidence/100)
                if score > selected_score:
                    selected_items=items
                    selected_angle=angle
                    selected_score=score
                    selected_confidence=avg_confidence
        except Exception as exc:
            reason=_short_error(exc)
            return OCRResult([], [f"Tesseract OCR failed: {reason}"], self.name, "FAILED", int((perf_counter()-started)*1000), reason)
        return OCRResult(selected_items, [], self.name, "SUCCESS", int((perf_counter()-started)*1000), None, selected_angle, round(min(1,selected_confidence/100),2), selected_angle != 0, {"rotation_applied_deg":selected_angle})
    def diagnostics(self, initialize: bool = False) -> dict:
        diag={"provider":self.name,"python_version":sys.version.split()[0],"configured_cmd":self.settings.tesseract_cmd}
        if initialize:
            ok,reason=self.available()
            cached=self._diagnostics or {}
            diag.update({"available":ok,"initialization":"ok" if ok else "failed","reason":reason or cached.get("reason"),"executable":cached.get("executable"),"version":cached.get("version")})
        else:
            cached=self._diagnostics or {}
            diag.update({"available":cached.get("available"),"initialization":"cached" if cached else "not_checked","reason":cached.get("reason"),"executable":cached.get("executable"),"version":cached.get("version")})
        return diag

def _items_from_tesseract_data(data: dict, image_size: tuple[int,int], original_size: tuple[int,int], angle: int, source_file: str, page: int, method: str) -> tuple[list[TextEvidence], float]:
        width, height = image_size
        items: list[TextEvidence] = []
        line_groups: dict[tuple[int, int, int], list[dict]] = {}
        for index, text in enumerate(data.get("text", [])):
            raw = (text or "").strip()
            if not raw:
                continue
            try:
                confidence = max(0.0, min(1.0, float(data["conf"][index]) / 100))
            except Exception:
                confidence = 0.5
            if confidence < 0.35:
                continue
            key=(int(_data_value(data,"block_num",index)),int(_data_value(data,"par_num",index)),int(_data_value(data,"line_num",index,index)))
            line_groups.setdefault(key,[]).append({
                "text":raw,
                "confidence":confidence,
                "left":max(0,int(_data_value(data,"left",index))),
                "top":max(0,int(_data_value(data,"top",index))),
                "right":max(0,int(_data_value(data,"left",index))+int(_data_value(data,"width",index))),
                "bottom":max(0,int(_data_value(data,"top",index))+int(_data_value(data,"height",index))),
                "word_num":int(_data_value(data,"word_num",index,index)),
            })
        for words in line_groups.values():
            ordered=sorted(words,key=lambda item:(item["word_num"],item["left"]))
            raw=" ".join(word["text"] for word in ordered).strip()
            if not raw:
                continue
            left=min(word["left"] for word in ordered)
            top=min(word["top"] for word in ordered)
            right=max(word["right"] for word in ordered)
            bottom=max(word["bottom"] for word in ordered)
            confidence=sum(word["confidence"] for word in ordered)/len(ordered)
            bbox = _unrotate_bbox(left,top,right,bottom,width,height,original_size[0],original_size[1],angle)
            items.append(TextEvidence(value=raw,confidence=max(0,min(1,confidence)),source_file=source_file,page=page,method=method,bbox=bbox,raw_evidence=raw,normalized_text=normalize_text(raw)))
        avg_confidence=(sum(item.confidence for item in items)/len(items))*100 if items else 0
        return items,avg_confidence

def _unrotate_bbox(left: int, top: int, right: int, bottom: int, rotated_width: int, rotated_height: int, original_width: int, original_height: int, angle: int) -> BBox:
    points=[_unrotate_point(x,y,rotated_width,rotated_height,original_width,original_height,angle) for x,y in ((left,top),(right,top),(right,bottom),(left,bottom))]
    xs=[max(0,min(original_width,x)) for x,y in points]
    ys=[max(0,min(original_height,y)) for x,y in points]
    x0,x1=min(xs),max(xs)
    y0,y1=min(ys),max(ys)
    return BBox(x=x0/original_width,y=y0/original_height,width=max(0,(x1-x0)/original_width),height=max(0,(y1-y0)/original_height))

def _unrotate_point(x: float, y: float, rotated_width: int, rotated_height: int, original_width: int, original_height: int, angle: int) -> tuple[float,float]:
    if angle==90:
        return original_width-y,x
    if angle==180:
        return original_width-x,original_height-y
    if angle==270:
        return y,original_height-x
    return x,y

def get_tesseract_diagnostics(settings: Settings) -> dict:
    return TesseractOCRProvider(settings).diagnostics(initialize=True)

def _items_from_paddle_output(output, width: int, height: int, source_file: str, page: int) -> list[TextEvidence]:
    items: list[TextEvidence] = []
    for entry in _flatten_paddle_entries(output):
        parsed=_parse_paddle_entry(entry)
        if parsed is None:
            continue
        polygon, raw, confidence = parsed
        if not raw.strip() or confidence < 0.35:
            continue
        items.append(TextEvidence(value=raw.strip(),confidence=max(0,min(1,float(confidence))),source_file=source_file,page=page,method="paddleocr",bbox=_bbox_from_polygon(polygon,width,height),raw_evidence=raw.strip(),normalized_text=normalize_text(raw)))
    return items

def _flatten_paddle_entries(output):
    if output is None:
        return []
    if isinstance(output, list):
        if output and isinstance(output[0], list) and output[0] and _parse_paddle_entry(output[0]) is None:
            flattened=[]
            for value in output:
                flattened.extend(_flatten_paddle_entries(value))
            return flattened
        return output
    return []

def _parse_paddle_entry(entry):
    try:
        if isinstance(entry, dict):
            texts=entry.get("rec_texts")
            scores=entry.get("rec_scores")
            polygons=entry.get("rec_polys") or entry.get("dt_polys")
            if texts and polygons:
                first_text = texts[0]
                first_score = scores[0] if scores else 0.5
                return polygons[0], first_text, float(first_score)
            text=entry.get("text") or entry.get("rec_text")
            confidence=entry.get("confidence") or entry.get("score") or entry.get("rec_score")
            polygon=entry.get("bbox") or entry.get("box") or entry.get("points") or entry.get("dt_poly") or entry.get("poly")
            if text is not None and polygon is not None:
                return polygon,text,float(confidence if confidence is not None else 0.5)
        if isinstance(entry, (list,tuple)) and len(entry)>=2:
            polygon=entry[0]
            payload=entry[1]
            if isinstance(payload,(list,tuple)) and len(payload)>=2:
                return polygon,str(payload[0]),float(payload[1])
    except Exception:
        return None
    return None

@lru_cache(maxsize=8)
def _provider(kind: str, paddle_device: str = "cpu", paddle_enable_mkldnn: bool = False, tesseract_cmd: str | None = None):
    if kind in {"paddle","paddleocr"}:
        return PaddleOCRProvider(Settings(paddle_device=paddle_device,paddle_enable_mkldnn=paddle_enable_mkldnn))
    if kind=="tesseract":
        return TesseractOCRProvider(Settings(tesseract_cmd=tesseract_cmd))
    if kind=="none":
        return NoneOCRProvider()
    return None

class OCREngine:
    def __init__(self, settings: Settings):
        self.settings=settings

    def extract(self, image_bytes: bytes, source_file: str, page: int) -> OCRResult:
        requested=(self.settings.ocr_engine or "auto").lower()
        if requested=="auto":
            warnings=[]
            for kind in ("paddle","tesseract"):
                provider=self._provider(kind)
                ok,reason=provider.available()
                if ok:
                    result=provider.extract_page(image_bytes,source_file,page)
                    result.warnings=warnings+result.warnings
                    if result.status!="FAILED":
                        return result
                    warnings=result.warnings
                    continue
                warnings.append(reason or f"{kind} unavailable")
            reason="No OCR provider is available."
            if warnings:
                reason=f"{reason} {'; '.join(warnings[-2:])}"
            return OCRResult([],warnings,"none","UNAVAILABLE",0,reason[:500])
        provider=self._provider(requested)
        if provider is None:
            return OCRResult([],[f"Unsupported OCR_ENGINE={self.settings.ocr_engine}"],"none","UNAVAILABLE",0,"Unsupported OCR engine.")
        ok,reason=provider.available()
        if not ok:
            return OCRResult([],[reason or f"{requested} unavailable"],provider.name,"UNAVAILABLE",0,reason)
        return provider.extract_page(image_bytes,source_file,page)
    def _provider(self, kind: str):
        return _provider(kind,self.settings.paddle_device,bool(self.settings.paddle_enable_mkldnn),self.settings.tesseract_cmd)
    def diagnostics(self, initialize: bool = True) -> dict:
        requested=(self.settings.ocr_engine or "auto").lower()
        if requested=="auto":
            providers=[self._provider("paddle"),self._provider("tesseract")]
            checks=[provider.diagnostics(initialize=initialize) for provider in providers]
            selected=next((check for check in checks if check.get("available") is True),checks[0] if checks else {})
            return {"ocr_engine":requested,"available":selected.get("available"),"provider":selected.get("provider"),"providers":checks}
        provider=self._provider(requested)
        if provider is None:
            return {"ocr_engine":requested,"available":False,"provider":"none","initialization":"unsupported","reason":"Unsupported OCR engine."}
        return provider.diagnostics(initialize=initialize)
