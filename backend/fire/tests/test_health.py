from fastapi.testclient import TestClient
from backend.main import app
def test_health():
 body=TestClient(app).get("/health").json()
 assert body["status"]=="ok"
 assert body["app"]=="FireGuard"
 assert body["build"]

def test_ocr_health(monkeypatch):
 monkeypatch.setattr("backend.main.OCREngine.diagnostics",lambda self, initialize=True: {"ocr_engine":"auto","available":True,"provider":"paddleocr","device":"cpu","mkldnn":False,"initialization":"ok"})
 body=TestClient(app).get("/api/fireguard/ocr-health").json()
 assert body["provider"]=="paddleocr"
 assert body["mkldnn"] is False
