from backend.project_builder import build_project
from backend.rules import evaluate_project
from backend.rules.models import RuleStatus
from backend.schemas import BuildingInfo,Door,FireEquipment,PageClassification,PageExtraction

def door(confidence=.9,width=1.2): return Door(mark="D1",floor="Ground",width_m=width,source_file="a.png",source_page=1,confidence=confidence)
def test_merge_deduplicates_items_and_preserves_null():
 p=PageExtraction(source_file="a.png",source_page=1,classification=PageClassification.ARCHITECTURAL,doors=[door(),door()],fire_equipment=[FireEquipment(type="hose_reel",floor="Ground",count=None,source_file="a.png",source_page=1,confidence=.8)])
 result=build_project([p],[])
 assert len(result.doors)==1 and result.fire_equipment[0].count is None and result.architectural_plan_present
def test_conflicting_building_values_are_audited():
 a=PageExtraction(source_file="a.png",source_page=1,building_info=BuildingInfo(storey_count=2),doors=[door(.9)])
 b=PageExtraction(source_file="b.png",source_page=1,building_info=BuildingInfo(storey_count=3),doors=[Door(mark="D2",source_file="b.png",source_page=1,confidence=.8)])
 result=build_project([a,b],[])
 assert result.building_info.storey_count==2 and result.conflicts[0].field=="building_info.storey_count"

def test_build_project_adds_table2_purpose_group_classification():
 p=PageExtraction(source_file="a.png",source_page=1,building_info=BuildingInfo(building_use_text="Student Girls Hostel"))
 result=build_project([p],[])
 assert result.building_info.purpose_group=="2(b)"
 assert result.building_info.purpose_group_classification["status"]=="CONFIRMED"

def test_openai_metadata_outranks_fallback_ocr_for_critical_fields():
 fallback=PageExtraction(source_file="scan.pdf",source_page=1,building_info=BuildingInfo(building_height_m=0.73))
 openai=PageExtraction(source_file="scan.pdf",source_page=1,extraction_provider="openai",building_info=BuildingInfo(building_height_m=18.136,building_use_text="Hostel"))
 result=build_project([fallback,openai],[])
 assert result.building_info.building_height_m==18.136
 assert result.extraction["metadata_evidence"]["building_height_m"]["source"]=="openai"
 assert result.extraction["metadata_evidence"]["building_height_m"]["validation_status"]=="CONFIRMED"

def test_project_title_cannot_replace_missing_building_use():
 page=PageExtraction(source_file="plan.pdf",source_page=1,extraction_provider="openai",building_info=BuildingInfo(project_title="Proposed Student Girls Hostel Development",building_use_text=None))
 result=build_project([page],[])
 assert result.building_info.project_title=="Proposed Student Girls Hostel Development"
 assert result.building_info.building_use_text is None

def test_contextless_ocr_height_is_not_consumed_by_height_rules():
 page=PageExtraction(source_file="scan.pdf",source_page=1,building_info=BuildingInfo(building_height_m=0.73,building_use_text="Office"))
 result=build_project([page],[])
 assert result.building_info.building_height_m is None
 assert result.extraction["metadata_evidence"]["building_height_m"]["value"]==0.73
 assert result.extraction["metadata_evidence"]["building_height_m"]["validation_status"]=="UNKNOWN"
 wet_riser=next(rule for rule in evaluate_project(result) if rule.rule_id=="CH4-WET-RISING-MAIN")
 assert wet_riser.status==RuleStatus.MANUAL_REVIEW

def test_combined_architectural_annotations_do_not_create_fire_plan():
 page=PageExtraction(source_file="annotated.pdf",source_page=1,classification=PageClassification.COMBINED)
 result=build_project([page],[])
 assert result.architectural_plan_present is True
 assert result.fire_annotations_present is True
 assert result.fire_plan_present is False
