import pytest
from backend.rules import evaluate_project
from backend.rules.engine import evaluate_rule
from backend.rules.models import RuleDefinition,RuleStatus
from backend.schemas import BuildingInfo,Door,FireEquipment,GenericItem,ProjectSchema

def project(**info):
 p=ProjectSchema()
 p.building_info=BuildingInfo(**info)
 return p

def by_id(results,rule_id):
 return [r for r in results if r.rule_id==rule_id]

def rule(**overrides):
 values=dict(rule_id="TEST",chapter=2,description="Synthetic engine behavior test",regulation="TEST ONLY",source_file="test",resolved=True,applicability_field="architectural_plan_present",evidence_field="building_info.storey_count",operator="gte",required=2,recommendation="Test recommendation")
 values.update(overrides); return RuleDefinition(**values)

@pytest.mark.parametrize("storeys,status",[(2,RuleStatus.PASS),(3,RuleStatus.PASS),(1,RuleStatus.VIOLATION),(None,RuleStatus.MANUAL_REVIEW)])
def test_generic_compliance_order_and_boundary(storeys,status):
 p=ProjectSchema(architectural_plan_present=True); p.building_info.storey_count=storeys
 assert evaluate_rule(p,rule()).status==status

def test_generic_not_applicable_and_unresolved():
 assert evaluate_rule(ProjectSchema(architectural_plan_present=False),rule()).status==RuleStatus.NOT_APPLICABLE
 assert evaluate_rule(ProjectSchema(),rule(resolved=False,unresolved_reason="missing clause")).status==RuleStatus.MANUAL_REVIEW

def test_exit_door_width_height_and_swing_pass():
 p=project(building_use_text="office",storey_count=2)
 p.doors=[Door(mark="E1",is_exit=True,width_m=1.0,height_mm=2000,opens_in_exit_direction=True,source_file="x",source_page=1,confidence=1)]
 results=evaluate_project(p)
 assert by_id(results,"CH2-EXIT-DOOR-WIDTH")[0].status==RuleStatus.PASS
 assert by_id(results,"CH2-EXIT-DOOR-HEIGHT")[0].status==RuleStatus.PASS
 assert by_id(results,"CH2-EXIT-DOOR-SWING")[0].status==RuleStatus.PASS

def test_confirmed_bad_exit_door_violates_boundaries():
 p=project(building_use_text="office",storey_count=2)
 p.doors=[Door(mark="E1",is_exit=True,width_m=.99,height_mm=1999,opens_in_exit_direction=False,source_file="x",source_page=1,confidence=1)]
 results=evaluate_project(p)
 assert by_id(results,"CH2-EXIT-DOOR-WIDTH")[0].status==RuleStatus.VIOLATION
 assert by_id(results,"CH2-EXIT-DOOR-HEIGHT")[0].status==RuleStatus.VIOLATION
 assert by_id(results,"CH2-EXIT-DOOR-SWING")[0].status==RuleStatus.VIOLATION

def test_unknown_exit_door_role_is_manual_review_not_violation():
 p=project(building_use_text="office",storey_count=2)
 p.doors=[Door(mark="D1",is_exit=None,width_m=.7,height_mm=1800,source_file="x",source_page=1,confidence=1)]
 results=evaluate_project(p)
 assert by_id(results,"CH2-EXIT-DOOR-WIDTH")[0].status==RuleStatus.MANUAL_REVIEW
 assert by_id(results,"CH2-EXIT-DOOR-HEIGHT")[0].status==RuleStatus.MANUAL_REVIEW

def test_visible_up_stair_candidate_does_not_confirm_independent_exit_count():
 p=project(building_use_text="Student girls hostel",storey_count=7)
 p.stairs=[GenericItem(label="UP",source_file="x",source_page=1,evidence="UP",confidence=.86,data={"visible_stair_candidate":True})]
 p.project["visible_stair_candidate_count"]=1
 p.project["confirmed_stair_count"]=None
 p.project["confirmed_independent_exit_count"]=None
 result=by_id(evaluate_project(p),"CH2-EXITS-STOREY-COUNT")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW
 assert result.actual is None

def test_unknown_confirmed_exit_count_keeps_storey_exit_rule_manual_review():
 p=project(building_use_text="office",storey_count=3)
 p.project["confirmed_independent_exit_count"]=None
 result=by_id(evaluate_project(p),"CH2-EXITS-STOREY-COUNT")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW
 assert result.missing_evidence==["confirmed exits or staircases"]

@pytest.mark.parametrize("count,status",[(2,RuleStatus.PASS),(1,RuleStatus.VIOLATION)])
def test_confirmed_independent_exit_count_evaluates_storey_exit_rule(count,status):
 p=project(building_use_text="office",storey_count=3)
 p.project["confirmed_independent_exit_count"]=count
 result=by_id(evaluate_project(p),"CH2-EXITS-STOREY-COUNT")[0]
 assert result.status==status
 assert result.actual==count

@pytest.mark.parametrize("height,status",[(17.999,RuleStatus.NOT_APPLICABLE),(18.0,RuleStatus.NOT_APPLICABLE),(18.001,RuleStatus.MANUAL_REVIEW),(None,RuleStatus.MANUAL_REVIEW)])
def test_wet_riser_height_trigger_boundaries(height,status):
 p=project(building_use_text="office",highest_habitable_floor_level_m=height)
 assert by_id(evaluate_project(p),"CH4-WET-RISING-MAIN")[0].status==status

def test_wet_riser_does_not_use_building_height_as_highest_floor_level():
 p=project(building_use_text="office",building_height_m=20,highest_habitable_floor_level_m=None)
 result=by_id(evaluate_project(p),"CH4-WET-RISING-MAIN")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW
 assert result.actual is None

def test_wet_riser_unknown_is_not_false_violation():
 p=project(building_use_text="office",highest_habitable_floor_level_m=20)
 p.hydrant_system=None
 assert by_id(evaluate_project(p),"CH4-WET-RISING-MAIN")[0].status==RuleStatus.MANUAL_REVIEW

def test_wet_riser_explicit_absence_violates():
 p=project(building_use_text="office",highest_habitable_floor_level_m=20)
 p.hydrant_system=False
 assert by_id(evaluate_project(p),"CH4-WET-RISING-MAIN")[0].status==RuleStatus.VIOLATION

def test_rising_main_quantity_calculates_only_with_applicable_floor_areas():
 p=project(building_use_text="office",highest_habitable_floor_level_m=25,floor_areas_m2={"Level 7":901,"Level 8":900})
 p.project["floors_above_18m"]=["Level 7","Level 8"]
 result=by_id(evaluate_project(p),"CH4-RISING-MAIN-QUANTITY")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW and result.required==3

@pytest.mark.parametrize("height,status",[(30,RuleStatus.NOT_APPLICABLE),(30.001,RuleStatus.MANUAL_REVIEW),(None,RuleStatus.MANUAL_REVIEW)])
def test_fire_lift_threshold(height,status):
 p=project(building_use_text="office",highest_habitable_floor_level_m=height)
 assert by_id(evaluate_project(p),"CH4-FIRE-LIFT")[0].status==status

def test_sprinkler_uses_highest_habitable_level():
 p=project(building_use_text="office",highest_habitable_floor_level_m=31)
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-HEIGHT")[0].status==RuleStatus.MANUAL_REVIEW
 p.sprinkler_system=True
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-HEIGHT")[0].status==RuleStatus.PASS

def test_unknown_height_remains_manual_review():
 p=project(building_use_text="office",building_height_m=None,highest_habitable_floor_level_m=None)
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-HEIGHT")[0].status==RuleStatus.MANUAL_REVIEW

def test_hose_reel_pg1_exception_and_required_quantity():
 detached=project(building_use_text="detached dwelling house",storey_count=4,building_height_m=18)
 assert by_id(evaluate_project(detached),"CH4-HOSE-REEL")[0].status==RuleStatus.NOT_APPLICABLE
 office=project(building_use_text="office",storey_count=4,building_height_m=12)
 result=by_id(evaluate_project(office),"CH4-HOSE-REEL")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW and result.required==4

def test_fire_alarm_table14_area_boundary():
 p=project(building_use_text="office",storey_count=3,max_floor_area_per_storey_m2=185)
 assert by_id(evaluate_project(p),"CH4-FIRE-ALARM-TABLE14")[0].status==RuleStatus.NOT_APPLICABLE
 p.building_info.max_floor_area_per_storey_m2=185.01
 assert by_id(evaluate_project(p),"CH4-FIRE-ALARM-TABLE14")[0].status==RuleStatus.MANUAL_REVIEW
 p.alarm_system=True
 assert by_id(evaluate_project(p),"CH4-FIRE-ALARM-TABLE14")[0].status==RuleStatus.PASS

def test_low_rise_integration_not_applicable_for_height_features():
 p=project(building_use_text="office",storey_count=2,building_height_m=10,highest_habitable_floor_level_m=10,max_floor_area_per_storey_m2=100)
 results=evaluate_project(p)
 assert by_id(results,"CH4-WET-RISING-MAIN")[0].status==RuleStatus.NOT_APPLICABLE
 assert by_id(results,"CH4-FIRE-LIFT")[0].status==RuleStatus.NOT_APPLICABLE
 assert by_id(results,"CH4-SPRINKLER-HEIGHT")[0].status==RuleStatus.NOT_APPLICABLE

def test_medium_rise_integration_requires_features_without_false_absence():
 p=project(building_use_text="office",storey_count=8,building_height_m=24,highest_habitable_floor_level_m=24,max_floor_area_per_storey_m2=500)
 results=evaluate_project(p)
 assert by_id(results,"CH4-WET-RISING-MAIN")[0].status==RuleStatus.MANUAL_REVIEW
 assert by_id(results,"CH4-FIRE-LIFT")[0].status==RuleStatus.NOT_APPLICABLE
 assert by_id(results,"CH4-FIRE-ALARM-TABLE14")[0].status==RuleStatus.MANUAL_REVIEW

def test_travel_distance_known_and_unknown():
 unknown=project(building_use_text="office")
 assert by_id(evaluate_project(unknown),"CH2-TRAVEL-DISTANCE-TABLE5")[0].status==RuleStatus.MANUAL_REVIEW
 known=project(building_use_text="office")
 known.project["travel_distance_m"]=44
 known.project["escape_arrangement"]="two_way"
 known.sprinkler_system=False
 assert by_id(evaluate_project(known),"CH2-TRAVEL-DISTANCE-TABLE5")[0].status==RuleStatus.PASS
 known.project["travel_distance_m"]=45
 assert by_id(evaluate_project(known),"CH2-TRAVEL-DISTANCE-TABLE5")[0].status==RuleStatus.PASS
 known.project["travel_distance_m"]=45.01
 assert by_id(evaluate_project(known),"CH2-TRAVEL-DISTANCE-TABLE5")[0].status==RuleStatus.VIOLATION

def test_travel_distance_limit_known_but_actual_unknown_manual():
 p=project(building_use_text="office")
 p.project["escape_arrangement"]="two_way"
 p.sprinkler_system=False
 result=by_id(evaluate_project(p),"CH2-TRAVEL-DISTANCE-TABLE5")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW and result.required==45

def test_chapter3_compartmentation_dependency_trigger_boundaries():
 p=project(building_use_text="office")
 p.project["chapter3_compartmentation_complies"]=True
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-COMPARTMENTATION")[0].status==RuleStatus.NOT_APPLICABLE
 p.project["chapter3_compartmentation_complies"]=False
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-COMPARTMENTATION")[0].status==RuleStatus.MANUAL_REVIEW
 p.sprinkler_system=False
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-COMPARTMENTATION")[0].status==RuleStatus.VIOLATION

def test_chapter3_open_sided_carpark_exception():
 p=project(building_use_text="car park")
 p.project["chapter3_compartmentation_complies"]=False
 p.project["open_sided_carpark_sprinkler_exception"]=True
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-COMPARTMENTATION")[0].status==RuleStatus.NOT_APPLICABLE

def test_high_hazard_sprinkler_18m_boundary():
 p=project(building_use_text="factory",highest_habitable_floor_level_m=18)
 p.project["high_hazard_occupancy"]=True
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-HIGH-HAZARD-18M")[0].status==RuleStatus.NOT_APPLICABLE
 p.building_info.highest_habitable_floor_level_m=18.01
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-HIGH-HAZARD-18M")[0].status==RuleStatus.MANUAL_REVIEW
 p.sprinkler_system=True
 assert by_id(evaluate_project(p),"CH4-SPRINKLER-HIGH-HAZARD-18M")[0].status==RuleStatus.PASS

def test_mixed_ambiguous_use_keeps_purpose_dependent_rules_manual():
 p=project(building_use_text="Mixed Development with shops and apartments")
 result=by_id(evaluate_project(p),"CH2-TRAVEL-DISTANCE-TABLE5")[0]
 assert result.status==RuleStatus.MANUAL_REVIEW

def test_feature_observed_can_pass_presence_rule():
 p=project(building_use_text="office",highest_habitable_floor_level_m=20)
 p.fire_equipment=[FireEquipment(type="wet_riser",source_file="x",source_page=1,confidence=1)]
 assert by_id(evaluate_project(p),"CH4-WET-RISING-MAIN")[0].status==RuleStatus.PASS
