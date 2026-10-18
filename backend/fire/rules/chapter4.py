from ..schemas import ProjectSchema
from .engine import evaluate_rule
from .rule_catalog import RULE_BY_ID, RULE_CATALOG
from .verified import evaluate_alarm_table14, evaluate_boolean_feature, evaluate_hose_reel, evaluate_rising_main_quantity, trigger_above_height

def evaluate(project: ProjectSchema):
    results=[
        evaluate_boolean_feature(project,"CH4-WET-RISING-MAIN",trigger_above_height(project,18),"hydrant_system","wet_riser"),
        evaluate_rising_main_quantity(project),
        evaluate_hose_reel(project),
        evaluate_boolean_feature(project,"CH4-FIRE-LIFT",trigger_above_height(project,30),"fire_lift_system"),
        evaluate_boolean_feature(project,"CH4-FIREFIGHTING-SHAFT",_high_rise_trigger(project),"project.fire_fighting_shaft"),
        evaluate_alarm_table14(project),
        evaluate_boolean_feature(project,"CH4-MANUAL-CALL-POINTS",_manual_alarm_trigger(project),"project.manual_call_points","manual_call_point"),
        evaluate_boolean_feature(project,"CH4-SPRINKLER-HEIGHT",_sprinkler_height_trigger(project),"sprinkler_system","sprinkler"),
        evaluate_boolean_feature(project,"CH4-SPRINKLER-COMPARTMENTATION",_sprinkler_compartmentation_trigger(project),"sprinkler_system","sprinkler"),
        evaluate_boolean_feature(project,"CH4-SPRINKLER-HIGH-HAZARD-18M",_high_hazard_sprinkler_trigger(project),"sprinkler_system","sprinkler"),
    ]
    implemented={result.rule_id for result in results}
    for rule in RULE_CATALOG:
        if rule.chapter==4 and rule.rule_id not in implemented:
            results.append(evaluate_rule(project,rule))
    return results

def _high_rise_trigger(project: ProjectSchema) -> bool|None:
    height=project.building_info.building_height_m or project.building_info.highest_habitable_floor_level_m
    storeys=project.building_info.storey_count
    if height is not None and height>30: return True
    if storeys is not None and storeys>10: return True
    if height is not None and storeys is not None: return False
    return None

def _manual_alarm_trigger(project: ProjectSchema) -> bool|None:
    alarm_type=project.project.get("required_alarm_type")
    if alarm_type:
        return alarm_type=="manual"
    return None

def _sprinkler_height_trigger(project: ProjectSchema) -> bool|None:
    height=project.building_info.highest_habitable_floor_level_m
    if height is None:
        return None
    return height>30

def _sprinkler_compartmentation_trigger(project: ProjectSchema) -> bool|None:
    failure=project.project.get("chapter3_compartmentation_complies")
    if failure is True:
        return False
    if failure is False:
        if project.project.get("open_sided_carpark_sprinkler_exception") is True:
            return False
        return True
    return None

def _high_hazard_sprinkler_trigger(project: ProjectSchema) -> bool|None:
    high_hazard=project.project.get("high_hazard_occupancy")
    height=project.building_info.highest_habitable_floor_level_m or project.building_info.building_height_m
    if high_hazard is False:
        return False
    if high_hazard is None:
        return None
    if height is None:
        return None
    return height>18
