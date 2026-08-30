from backend.drawing_understanding.geometry.travel_distance import calculate_travel_distance
from backend.drawing_understanding.analyzer import _best_title, _extract_building_use, _extract_floor_names, _extract_height, _extract_storey_count, _page_from_text_items
from backend.drawing_understanding.evidence.models import PageAnalysis, PageMode, TextEvidence
from backend.drawing_understanding.ocr.dimension_parser import parse_area_m2, parse_length_m, parse_pair_dimensions
from backend.drawing_understanding.ocr.table_extractor import extract_door_schedule
from backend.schemas import BBox

def evidence(value: str, x: float = 0.1, y: float = 0.1) -> TextEvidence:
 return TextEvidence(value=value,source_file="sheet.png",page=1,method="tesseract",raw_evidence=value,normalized_text=value.upper(),bbox=BBox(x=x,y=y,width=0.2,height=0.03),confidence=0.8)

def test_dimension_normalization_metric_and_imperial():
 assert parse_length_m("1200 mm")==1.2
 assert parse_length_m("250 cm")==2.5
 assert parse_length_m("2.1 m")==2.1
 assert parse_length_m("6' 6\"")==1.981

def test_area_normalization_and_malformed_ocr():
 assert parse_area_m2("TOTAL AREA 100 sqm")==100
 assert parse_area_m2("AREA 1000 sqft")==92.9
 assert parse_pair_dimensions("D1 ? x abc")== (None,None)

def test_building_use_extraction_from_title_block_labels():
 assert _extract_building_use(["PROPOSED USE : OFFICE BUILDING", "GROUND FLOOR PLAN"])=="Office Building"
 assert _extract_building_use(["TYPE OF BUILDING - STUDENT HOSTEL", "SHEET 01"])=="Student Hostel"

def test_building_use_extraction_preserves_common_use_keywords():
 assert _extract_building_use(["PROPOSED COMMERCIAL BUILDING"])=="Commercial"
 assert _extract_building_use(["BASEMENT CAR PARK PLAN"])=="Car Park"

def test_generic_project_name_is_rejected():
 assert _best_title(["PLAN","GROUND FLOOR PLAN"]) is None
 assert _best_title(["FIRE SAFETY PLAN","HOSTEL"]) is None
 assert _best_title(["FIRE SAFETY PLAN HOSTEL"]) is None

def test_valid_project_title_prefers_project_label():
 assert _best_title(["PROJECT: PROPOSED STUDENT HOSTEL AT KANDY","DRAWING TITLE: GROUND FLOOR PLAN"])=="Proposed Student Hostel At Kandy"

def test_bare_numeric_ocr_token_cannot_become_building_height():
 assert _extract_height(["0.73"]) is None
 assert _extract_height(["+ 0.73 M"]) is None
 assert _extract_height(["BUILDING HEIGHT 18.136 M"])==18.136

def test_single_ground_floor_plan_does_not_prove_one_storey():
 lines=["GROUND FLOOR PLAN"]
 assert _extract_storey_count(lines,_extract_floor_names(lines)) is None

def test_explicit_g_plus_storey_count():
 assert _extract_storey_count(["PROPOSED G+2 HOSTEL"],[])==3

def test_named_ground_first_second_floor_headings_support_three_storeys():
 lines=["GROUND FLOOR PLAN","FIRST FLOOR PLAN","SECOND FLOOR PLAN"]
 assert _extract_storey_count(lines,_extract_floor_names(lines))==3

def test_six_distinct_floor_headings_support_six_storeys():
 analysis=PageAnalysis(source_file="sheet.png",page=1,mode=PageMode.RASTER)
 page=_page_from_text_items("sheet.png",1,[evidence("GROUND FLOOR PLAN"),evidence("FIRST FLOOR PLAN"),evidence("SECOND FLOOR PLAN"),evidence("THIRD FLOOR PLAN"),evidence("FOURTH FLOOR PLAN"),evidence("FIFTH FLOOR PLAN")],analysis)
 assert page.building_info.storey_count==6
 assert len([region for region in analysis.sheet_regions if region["type"]=="FLOOR_PLAN"])==6

def test_duplicate_floor_headings_are_deduplicated():
 analysis=PageAnalysis(source_file="sheet.png",page=1,mode=PageMode.RASTER)
 page=_page_from_text_items("sheet.png",1,[evidence("GROUND FLOOR PLAN"),evidence("GROUND FLOOR PLAN",0.4,0.1),evidence("FIRST FLOOR PLAN")],analysis)
 assert page.building_info.storey_count==2

def test_room_label_evidence_extracted_without_complete_count_claim():
 analysis=PageAnalysis(source_file="sheet.png",page=1,mode=PageMode.RASTER)
 page=_page_from_text_items("sheet.png",1,[evidence("BED ROOM"),evidence("KITCHEN"),evidence("TOILET"),evidence("STAIR")],analysis)
 assert len(page.rooms)==3
 assert len(page.stairs)==1

def test_door_schedule_does_not_infer_exit_from_width():
 doors=extract_door_schedule(["D1 1.20 x 2.10 SINGLE SWING"],"plan.pdf",1)
 assert doors[0].width_m==1.2
 assert doors[0].height_mm==2100
 assert doors[0].is_exit is None

def test_door_schedule_supports_common_ocr_dimension_formats():
 doors=extract_door_schedule(["D2 900 x 2100 DOUBLE SWING 2 HR","D3 120 X 210 SINGLE SWING","D4 4'-0\" X 8'-0\""],"plan.pdf",1)
 assert [door.mark for door in doors]==["D2","D3","D4"]
 assert doors[0].width_m==0.9 and doors[0].height_mm==2100 and doors[0].fire_rating_minutes==120
 assert doors[1].width_m==1.2 and doors[1].height_mm==2100
 assert doors[2].width_m==1.219 and doors[2].height_mm==2438

def test_door_schedule_rejects_impossible_dimensions():
 assert extract_door_schedule(["D9 12000 x 21000 SINGLE SWING"],"plan.pdf",1)==[]

def test_travel_distance_unknown_without_confirmed_graph():
 result=calculate_travel_distance()
 assert result["travel_distance_m"] is None
 assert "straight-line" in result["reason"]
