from backend.rules.applicability import classify_purpose_groups, select_travel_distance_limit
from backend.rules.regulatory_data import PURPOSE_GROUP_CATALOG, TRAVEL_DISTANCE_LIMITS

def test_table2_clear_hostel_mapping():
 result=classify_purpose_groups("Student Girls Hostel")
 assert result["status"]=="CONFIRMED"
 assert result["purpose_group"]=="2(b)"
 assert result["source_pages"]==[17]

def test_table2_clear_office_mapping_case_and_formatting():
 result=classify_purpose_groups("  corporate   OFFICE building ")
 assert result["status"]=="CONFIRMED"
 assert result["purpose_group"]=="3"

def test_table2_ambiguous_mixed_use_not_fabricated():
 result=classify_purpose_groups("Mixed Development with shops and apartments")
 assert result["status"]=="AMBIGUOUS"
 assert result["purpose_group"] is None
 assert {item["code"] for item in result["purpose_groups"]}>={"1(a)","4"}

def test_table2_unknown_not_fabricated():
 result=classify_purpose_groups("Innovation hub")
 assert result["status"]=="UNKNOWN"
 assert result["purpose_group"] is None

def test_table2_catalog_preserves_ictad_terms():
 assert PURPOSE_GROUP_CATALOG["2(b)"].title=="Residential (Other)"
 assert "hostel" in PURPOSE_GROUP_CATALOG["2(b)"].included_uses

def test_table5_unknown_inputs_unresolved():
 assert select_travel_distance_limit(None,"two_way",False)["status"]=="UNRESOLVED"
 assert select_travel_distance_limit("3",None,False)["reason"]=="Escape arrangement is unknown."
 assert select_travel_distance_limit("3","two_way",None)["reason"]=="Sprinkler condition is unknown."

def test_table5_one_way_note_for_non_group_1():
 assert select_travel_distance_limit("3","one_way",False)["limit_m"]==13
 assert select_travel_distance_limit("3","one_way",True)["limit_m"]==19

def test_table5_one_way_note_excludes_group_1():
 result=select_travel_distance_limit("1(a)","one_way",False)
 assert result["status"]=="NOT_APPLICABLE"

def test_table5_all_supported_two_way_rows_have_sprinkler_branches():
 for key,row in TRAVEL_DISTANCE_LIMITS.items():
  if key in {"detached_residential","high_hazard"}:
   continue
  result_unsprinklered=select_travel_distance_limit(row.purpose_groups[0],"two_way",False,row.occupancy)
  result_sprinklered=select_travel_distance_limit(row.purpose_groups[0],"two_way",True,row.occupancy)
  assert result_unsprinklered["limit_m"]==row.two_way_unsprinklered_m
  assert result_sprinklered["limit_m"]==row.two_way_sprinklered_m

def test_table5_high_hazard_requires_explicit_use_evidence():
 result=select_travel_distance_limit("6","two_way",False,"high hazard factory")
 assert result["category"]=="high_hazard"
 assert result["limit_m"]==20
