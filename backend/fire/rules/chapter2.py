from ..schemas import ProjectSchema
from .engine import evaluate_rule
from .rule_catalog import RULE_BY_ID, RULE_CATALOG
from .verified import evaluate_exit_door_numeric, evaluate_exit_door_swing, evaluate_storey_exits, evaluate_boolean_feature, evaluate_travel_distance

def evaluate(project: ProjectSchema):
    results=[]
    results.append(evaluate_storey_exits(project))
    results.append(evaluate_rule(project,RULE_BY_ID["CH2-ROOM-EXIT-COUNT-TABLE4"]))
    results.append(evaluate_travel_distance(project))
    results.append(evaluate_boolean_feature(project,"CH2-SMOKE-FREE-STAIR-APPROACH",_smoke_free_trigger(project),"project.smoke_free_stair_approach"))
    results.append(evaluate_boolean_feature(project,"CH2-STAIR-PRESSURIZATION-HIGHRISE",_high_rise_trigger(project),"project.stair_pressurization"))
    results.extend(evaluate_exit_door_swing(project))
    results.extend(evaluate_exit_door_numeric(project,"CH2-EXIT-DOOR-WIDTH","width_m"))
    results.extend(evaluate_exit_door_numeric(project,"CH2-EXIT-DOOR-HEIGHT","height_mm"))
    results.append(evaluate_boolean_feature(project,"CH2-EXIT-LIGHTING",_exit_lighting_trigger(project),"escape_route_lighting"))
    results.append(evaluate_boolean_feature(project,"CH2-EXIT-SIGNAGE",_exit_signage_trigger(project),"exit_signage","exit_signage"))
    for rule in RULE_CATALOG:
        if rule.chapter==2 and rule.rule_id not in {r.rule_id for r in results}:
            results.append(evaluate_rule(project,rule))
    return results

def _text(project: ProjectSchema) -> str:
    info=project.building_info
    return " ".join(str(x or "") for x in [info.purpose_group,info.building_use_text,info.building_type]).lower()

def _high_rise_trigger(project: ProjectSchema) -> bool|None:
    height=project.building_info.building_height_m or project.building_info.highest_habitable_floor_level_m
    storeys=project.building_info.storey_count
    if height is not None and height>30: return True
    if storeys is not None and storeys>10: return True
    if height is not None and storeys is not None: return False
    return None

def _smoke_free_trigger(project: ProjectSchema) -> bool|None:
    text=_text(project)
    if "purpose group 1" in text or "detached" in text or "dwelling house" in text:
        return False
    height=project.building_info.building_height_m or project.building_info.highest_habitable_floor_level_m
    if height is None:
        return None
    return height>18

def _exit_lighting_trigger(project: ProjectSchema) -> bool|None:
    text=_text(project)
    if "detached" in text or "semi-detached" in text or "terrace" in text:
        return False
    return True

def _exit_signage_trigger(project: ProjectSchema) -> bool|None:
    text=_text(project)
    if "purpose group 1" in text or "2(b)" in text or "purpose group 2b" in text:
        return False
    if not text.strip():
        return None
    return True
