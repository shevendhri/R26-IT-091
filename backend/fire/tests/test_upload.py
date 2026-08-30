from io import BytesIO
import asyncio
from PIL import Image
from fastapi.testclient import TestClient
import pymupdf
from backend.drawing_understanding.evidence.models import TextEvidence
from backend.drawing_understanding.ocr.ocr_engine import OCRResult
from backend.main import app
from backend.main import _fields_needing_verification
from backend.schemas import BuildingInfo, ProjectSchema
from backend.schemas import BBox

client=TestClient(app)

def test_fireguard_version_endpoint_is_safe():
 response=client.get("/api/fireguard/version")
 assert response.status_code==200
 data=response.json()
 assert data["service"]=="FireGuard"
 assert data["pipeline_version"]=="semantic-plan-v3"
 assert data["critical_evidence_validation"] is True
 assert data["adaptive_plan_reader"] is True
 assert "api_key" not in data
 assert "openai_api_key" not in data

def test_unknown_required_field_appears_for_review():
 project=ProjectSchema(building_info=BuildingInfo(building_use_text="office"))
 project.extraction={"metadata_evidence":{"highest_habitable_floor_level_m":{"validation_status":"UNKNOWN"}}}
 fields=_fields_needing_verification(project,[{"missing_evidence":["highest storey floor level"]}])
 assert fields==[{"field":"highest_habitable_floor_level_m","label":"highest habitable floor level m","status":"UNKNOWN"}]

def test_needs_verification_required_field_appears_for_review():
 project=ProjectSchema(building_info=BuildingInfo(building_use_text="office"))
 project.extraction={"metadata_evidence":{"sprinkler_system":{"validation_status":"NEEDS_VERIFICATION"}}}
 fields=_fields_needing_verification(project,[{"missing_evidence":["sprinkler condition"]}])
 assert fields[0]["field"]=="sprinkler_system"
 assert fields[0]["status"]=="NEEDS_VERIFICATION"

def test_irrelevant_unknown_field_does_not_appear_for_review():
 project=ProjectSchema(building_info=BuildingInfo(building_use_text="office"))
 project.extraction={"metadata_evidence":{"building_height_m":{"validation_status":"UNKNOWN"},"sprinkler_system":{"validation_status":"UNKNOWN"}}}
 fields=_fields_needing_verification(project,[{"missing_evidence":["sprinkler condition"]}])
 assert [item["field"] for item in fields]==["sprinkler_system"]

def test_unknown_schedule_status_is_not_reported_as_determined_zero():
 from backend.main import _extraction_summary
 project=ProjectSchema(building_info=BuildingInfo(building_use_text="office"))
 summary=_extraction_summary(project,[],[])
 assert summary["door_schedule_entries"] is None
 assert summary["door_schedule_status"]=="UNKNOWN"
 assert summary["window_schedule_entries"] is None
 assert summary["window_schedule_status"]=="UNKNOWN"

def test_user_confirmed_review_reruns_rules_without_openai(monkeypatch):
 def fail_openai(*args,**kwargs):
  raise AssertionError("OpenAI must not run during user review")
 monkeypatch.setattr("backend.drawing_understanding.plan_reader.OpenAIPlanReader",fail_openai)
 project=ProjectSchema(building_info=BuildingInfo(building_use_text="office"),hydrant_system=None)
 response=client.post("/api/fireguard/review",json={"project_schema":project.model_dump(mode="json"),"confirmations":{"highest_habitable_floor_level_m":20,"hydrant_system":"Yes"}})
 assert response.status_code==200
 body=response.json()
 schema=body["project_schema"]
 assert schema["extraction"]["user_confirmed_evidence"]["highest_habitable_floor_level_m"]["status"]=="USER_CONFIRMED"
 assert schema["building_info"]["highest_habitable_floor_level_m"]==20
 assert next(rule for rule in body["rules"] if rule["rule_id"]=="CH4-WET-RISING-MAIN")["status"]=="PASS"

def test_fast_analyze_timeout_returns_review_payload(monkeypatch):
 from backend.main import settings
 original_fast=settings.fireguard_fast_mode
 original_timeout=settings.fireguard_fast_analysis_timeout_seconds
 async def slow_analysis(files):
  await asyncio.sleep(2)
 settings.fireguard_fast_mode=True
 settings.fireguard_fast_analysis_timeout_seconds=1
 monkeypatch.setattr("backend.main._analyze_drawings",slow_analysis)
 try:
  response=client.post("/api/fireguard/analyze",files=[("files",("plan.png",png(),"image/png"))])
 finally:
  settings.fireguard_fast_mode=original_fast
  settings.fireguard_fast_analysis_timeout_seconds=original_timeout
 assert response.status_code==200
 body=response.json()
 assert body["extraction_quality"]["openai_status"]=="TIMEOUT"
 assert body["fields_needing_verification"]
 assert body["project_schema"]["documents"][0]["filename"]=="plan.png"

def test_panel_validated_demo_uses_fixture_without_openai(monkeypatch):
 def fail_openai(*args,**kwargs):
  raise AssertionError("OpenAI must not run for validated panel demo")
 monkeypatch.setattr("backend.drawing_understanding.plan_reader.OpenAIPlanReader",fail_openai)
 response=client.post("/api/fireguard/panel/validated-demo")
 assert response.status_code==200
 body=response.json()
 assert body["panel_mode"] is True
 assert body["overall_status"]=="AWAITING_USER_INPUT"
 assert body["analysis_mode"]["dataset"]=="Validated Demonstration Dataset"
 assert body["extraction_summary"]["openai_called"] is False
 assert body["project_summary"]["project_name"]=="Proposed Student Girls Hostel Development"
 assert body["project_summary"]["building_use"]=="Student girls hostel"
 assert body["project_summary"]["purpose_group"]=="2(b)"
 assert body["project_schema"]["building_info"]["project_title"]!=body["project_schema"]["building_info"]["building_use_text"]

def test_panel_manual_returns_review_payload_without_openai(monkeypatch):
 def fail_openai(*args,**kwargs):
  raise AssertionError("OpenAI must not run for manual panel assessment")
 monkeypatch.setattr("backend.drawing_understanding.plan_reader.OpenAIPlanReader",fail_openai)
 response=client.post("/api/fireguard/panel/manual",files=[("files",("any.pdf",scanned_like_pdf(),"application/pdf"))])
 assert response.status_code==200
 body=response.json()
 assert body["panel_mode"] is True
 assert body["source"]=="manual_assessment"
 assert body["overall_status"]=="AWAITING_USER_INPUT"
 assert body["extraction_summary"]["openai_called"] is False
 labels=[field["label"] for group in body["panel_review_groups"] for field in group["fields"]]
 assert "Independent exits" in labels
 assert "Highest habitable floor level" in labels

def test_panel_mode_analyze_defaults_to_manual_payload_without_openai(monkeypatch):
 from backend.main import settings
 original_panel=settings.fireguard_panel_mode
 original_reader=settings.plan_reader
 def fail_openai(*args,**kwargs):
  raise AssertionError("OpenAI must not run when panel mode analyze is not experimental")
 monkeypatch.setattr("backend.drawing_understanding.plan_reader.OpenAIPlanReader",fail_openai)
 settings.fireguard_panel_mode=True
 settings.plan_reader="openai"
 try:
  response=client.post("/api/fireguard/analyze",files=[("files",("panel.pdf",scanned_like_pdf(),"application/pdf"))])
 finally:
  settings.fireguard_panel_mode=original_panel
  settings.plan_reader=original_reader
 assert response.status_code==200
 body=response.json()
 assert body["panel_mode"] is True
 assert body["source"]=="manual_assessment"
 assert body["extraction_summary"]["openai_called"] is False

def test_review_accepts_panel_user_confirmed_building_use_without_openai(monkeypatch):
 def fail_openai(*args,**kwargs):
  raise AssertionError("OpenAI must not run during panel review")
 monkeypatch.setattr("backend.drawing_understanding.plan_reader.OpenAIPlanReader",fail_openai)
 project=ProjectSchema()
 response=client.post("/api/fireguard/review",json={"project_schema":project.model_dump(mode="json"),"confirmations":{"project_title":"Manual Project","building_use_text":"Student Girls Hostel","storey_count":7,"highest_habitable_floor_level_m":21,"building_height_m":24,"confirmed_independent_exit_count":2,"escape_arrangement":"two_way","travel_distance_m":20,"sprinkler_system":"No","hose_reel_count":7,"alarm_system":"Yes"}})
 assert response.status_code==200
 body=response.json()
 schema=body["project_schema"]
 assert schema["building_info"]["building_use_text"]=="Student Girls Hostel"
 assert schema["building_info"]["purpose_group"]=="2(b)"
 assert body["project_summary"]["building_use"]=="Student Girls Hostel"
 assert body["project_summary"]["purpose_group"]=="2(b)"
 assert schema["extraction"]["user_confirmed_evidence"]["building_use_text"]["validation_status"]=="USER_CONFIRMED"
 assert body["required_fire_features"]
 assert body["rules"]

def png():
 out=BytesIO(); Image.new("RGB",(100,60),"white").save(out,"PNG"); return out.getvalue()

def image_bytes(fmt: str, size=(100, 60), exif=None):
 out=BytesIO()
 kwargs={"exif": exif} if exif is not None else {}
 Image.new("RGB",size,"white").save(out,fmt,**kwargs)
 return out.getvalue()

def rotated_jpeg():
 exif=Image.Exif(); exif[274]=6
 return image_bytes("JPEG",(60,100),exif=exif)

def ocr_evidence(value: str) -> TextEvidence:
 return TextEvidence(value=value,source_file="plan.png",page=1,method="tesseract",raw_evidence=value,normalized_text=value.upper(),bbox=BBox(x=0.1,y=0.1,width=0.2,height=0.03),confidence=0.85)

def vector_pdf():
 document=pymupdf.open(); page=document.new_page(width=300,height=200)
 page.insert_text((20,20),"PROPOSED OFFICE BUILDING")
 page.insert_text((20,40),"GROUND FLOOR PLAN")
 page.insert_text((20,60),"DOOR SCHEDULE D1 1.20 x 2.10 SINGLE SWING")
 data=document.tobytes(); document.close(); return data

def scanned_like_pdf():
 image=Image.new("RGB",(120,80),"white"); image_bytes=BytesIO(); image.save(image_bytes,"PNG")
 document=pymupdf.open(); page=document.new_page(width=120,height=80)
 page.insert_image(page.rect,stream=image_bytes.getvalue())
 data=document.tobytes(); document.close(); return data

def test_invalid_and_empty_upload_rejected():
 assert client.post("/api/fireguard/analyze",files=[("files",("x.txt",b"x","text/plain"))]).status_code==415
 assert client.post("/api/fireguard/analyze",files=[("files",("x.png",png(),"text/plain"))]).status_code==415
 assert client.post("/api/fireguard/analyze",files=[("files",("x.png",b"","image/png"))]).status_code==400

def test_corrupt_image_rejected():
 assert client.post("/api/fireguard/analyze",files=[("files",("x.png",b"bad","image/png"))]).status_code==422

def test_image_analyze_does_not_require_openai():
 response=client.post("/api/fireguard/analyze",files=[("files",("plan.png",png(),"image/png"))])
 assert response.status_code==200
 body=response.json()
 assert body["overall_status"]=="REQUIRES_REVIEW"
 assert body["page_analysis"][0]["mode"]=="RASTER"
 assert body["extraction_summary"]["object_counts_status"] in {"DETERMINED","UNKNOWN"}
 if body["extraction_summary"]["object_counts_status"]=="UNKNOWN":
  assert body["extraction_summary"]["doors"] is None
 assert body["manual_review_items"]

def test_jpg_and_jpeg_uploads_are_accepted():
 for filename in ("architectural_plan.jpg","architectural_plan.jpeg"):
  response=client.post("/api/fireguard/analyze",files=[("files",(filename,image_bytes("JPEG"),"image/jpeg"))])
  assert response.status_code==200
  body=response.json()
  assert body["project_schema"]["documents"][0]["filename"]==filename
  assert body["page_analysis"][0]["mode"]=="RASTER"

def test_rotated_image_is_normalized_before_processing(monkeypatch):
 seen={}
 def fake_extract(self, image_bytes_arg, source_file, page):
  image=Image.open(BytesIO(image_bytes_arg))
  seen["size"]=image.size
  return OCRResult(items=[],warnings=[],provider="none",status="NOT_RUN")
 monkeypatch.setattr("backend.drawing_understanding.analyzer.OCREngine.extract",fake_extract)
 response=client.post("/api/fireguard/analyze",files=[("files",("rotated.jpg",rotated_jpeg(),"image/jpeg"))])
 assert response.status_code==200
 body=response.json()
 assert seen["size"]==(100,60)
 assert body["page_analysis"][0]["orientation_corrected"] is True
 assert body["page_analysis"][0]["orientation_detected_deg"]==90

def test_fireguard_analyze_raster_runtime_path_keeps_unknowns_and_feature_evidence(monkeypatch):
 def fake_extract(self, image_bytes, source_file, page):
  return OCRResult(
   items=[ocr_evidence("FIRE SAFETY PLAN"),ocr_evidence("HOSTEL"),ocr_evidence("EMERGENCY LIGHT"),ocr_evidence("GROUND FLOOR PLAN")],
   warnings=[],
   provider="tesseract",
   status="SUCCESS",
  )
 monkeypatch.setattr("backend.drawing_understanding.analyzer.OCREngine.extract",fake_extract)
 response=client.post("/api/fireguard/analyze",files=[("files",("plan.png",png(),"image/png"))])
 assert response.status_code==200
 body=response.json()
 assert body["build"]
 assert body["project_summary"]["project_name"] is None
 assert body["project_summary"]["building_use"]=="Hostel"
 assert body["project_summary"]["storeys"] is None
 assert body["project_summary"]["storey_count_status"]=="UNKNOWN"
 assert body["extraction_summary"]["fire_plan_status"]=="CONFIRMED_FIRE_PLAN"
 assert body["normalized_project_schema"]["escape_route_lighting"] is True
 assert any(item["feature_type"]=="EMERGENCY_LIGHT" and item["presence"]=="CONFIRMED_PRESENT" for item in body["normalized_project_schema"]["fire_features_detected"])
 assert body["extraction_summary"]["doors"] is None
 assert body["extraction_summary"]["stairs"] is None
 assert body["extraction_summary"]["fire_equipment_items"] is None
 assert body["extraction_summary"]["door_count_status"]=="UNKNOWN"
 assert body["extraction_summary"]["fire_equipment_count_status"]=="PARTIAL"

def test_vector_pdf_uses_native_text_and_extracts_door_schedule():
 response=client.post("/api/fireguard/analyze",files=[("files",("plan.pdf",vector_pdf(),"application/pdf"))])
 assert response.status_code==200
 body=response.json()
 assert body["page_analysis"][0]["mode"]=="VECTOR"
 assert body["page_analysis"][0]["native_text_items"]>0
 assert body["normalized_project_schema"]["doors"][0]["mark"]=="D1"
 assert body["normalized_project_schema"]["doors"][0]["is_exit"] is None

def test_scanned_pdf_returns_manual_review_when_ocr_unavailable_or_empty():
 response=client.post("/api/fireguard/analyze",files=[("files",("scan.pdf",scanned_like_pdf(),"application/pdf"))])
 assert response.status_code==200
 body=response.json()
 assert body["page_analysis"][0]["mode"] in {"RASTER","HYBRID"}
 assert body["overall_status"]=="REQUIRES_REVIEW"
 if body["extraction_summary"]["object_counts_status"]=="UNKNOWN":
  assert body["extraction_summary"]["rooms"] is None
