from backend.main import _extraction_summary, _public_rule_dump
from backend.rules.models import RuleResult, RuleStatus, Severity
from backend.schemas import Door, FireEquipment, GenericItem, PageClassification, PageExtraction, ProjectSchema

def project_with_label_evidence() -> ProjectSchema:
    return ProjectSchema(
        rooms=[GenericItem(label="Kitchen",source_file="a.png",source_page=1,confidence=0.7)],
        doors=[Door(mark="D1",source_file="a.png",source_page=1,confidence=0.7)],
        stairs=[GenericItem(label="Stair",source_file="a.png",source_page=1,confidence=0.7)],
        fire_equipment=[FireEquipment(type="hose_reel",source_file="a.png",source_page=1,confidence=0.7)],
        architectural_plan_present=True,
        fire_plan_present=False,
        geometry_analysis={"segmentation":{"available":False}},
        page_analysis=[{"ocr_status":"SUCCESS","ocr_text_items":20,"architectural_plan_status":"CONFIRMED_ARCHITECTURAL"}],
    )

def test_raster_ocr_success_does_not_imply_zero_or_complete_object_counts():
    summary=_extraction_summary(project_with_label_evidence(),[PageExtraction(source_file="a.png",source_page=1,classification=PageClassification.ARCHITECTURAL)], [{"ocr_status":"SUCCESS","ocr_text_items":20,"architectural_plan_status":"CONFIRMED_ARCHITECTURAL"}])
    assert summary["object_counts_status"]=="PARTIAL"
    assert summary["doors"] is None
    assert summary["stairs"] is None
    assert summary["rooms"] is None
    assert summary["fire_equipment_items"] is None
    assert summary["object_count_details"]["doors"]["labels_detected"]==1
    assert summary["object_count_details"]["fire_equipment"]["status"]=="UNKNOWN"

def test_unavailable_object_extractors_keep_unknown_counts():
    project=ProjectSchema(architectural_plan_present=True,geometry_analysis={"segmentation":{"available":False}})
    summary=_extraction_summary(project,[],[{"ocr_status":"SUCCESS","ocr_text_items":20}])
    assert summary["object_counts_status"]=="UNKNOWN"
    assert summary["object_count_details"]["doors"]["status"]=="UNKNOWN"
    assert summary["object_count_details"]["fire_equipment"]["count"] is None

def test_not_applicable_rule_public_output_has_no_corrective_recommendation():
    result=RuleResult(rule_id="TEST",chapter=2,description="Rule",regulation="R",severity=Severity.ERROR,status=RuleStatus.NOT_APPLICABLE,applicable=False,decision_reason="not applicable",recommendation="do work")
    dumped=_public_rule_dump(result)
    assert dumped["recommendation"] is None
    assert dumped["severity"]=="NONE"
    assert dumped["is_error"] is False

def test_pass_rule_public_output_has_no_error_or_corrective_recommendation():
    result=RuleResult(rule_id="TEST",chapter=2,description="Rule",regulation="R",severity=Severity.ERROR,status=RuleStatus.PASS,applicable=True,actual=True,required=True,decision_reason="passes",recommendation="do work")
    dumped=_public_rule_dump(result)
    assert dumped["recommendation"] is None
    assert dumped["severity"]=="NONE"
    assert dumped["is_error"] is False

def test_manual_review_public_output_uses_review_presentation():
    result=RuleResult(rule_id="TEST",chapter=2,description="Rule",regulation="R",severity=Severity.ERROR,status=RuleStatus.MANUAL_REVIEW,applicable=None,decision_reason="review",recommendation="verify")
    dumped=_public_rule_dump(result)
    assert dumped["severity"]=="REVIEW"
    assert dumped["presentation"]["tone"]=="warning"
    assert dumped["is_error"] is False

def test_violation_public_output_keeps_error_recommendation():
    result=RuleResult(rule_id="TEST",chapter=2,description="Rule",regulation="R",severity=Severity.ERROR,status=RuleStatus.VIOLATION,applicable=True,actual=False,required=True,decision_reason="fails",recommendation="fix it")
    dumped=_public_rule_dump(result)
    assert dumped["recommendation"]=="fix it"
    assert dumped["severity"]=="ERROR"
    assert dumped["is_error"] is True
