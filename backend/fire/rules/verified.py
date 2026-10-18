from math import ceil
from ..schemas import ProjectSchema
from .applicability import purpose_group_for_project, select_travel_distance_limit, travel_distance_category
from .engine import evaluate_rule
from .models import RuleDefinition, RuleResult, RuleStatus
from .rule_catalog import RULE_BY_ID

def _pages(rule: RuleDefinition) -> list[int]:
    return rule.source_pages or ([rule.source_page] if rule.source_page else [])

def _base(rule: RuleDefinition) -> dict:
    return dict(rule_id=rule.rule_id,chapter=rule.chapter,title=rule.title,description=rule.description,regulation=rule.regulation,severity=rule.severity,source_pages=_pages(rule),recommendation=rule.recommendation)

def _result(rule: RuleDefinition,status: RuleStatus,reason: str,**kwargs) -> RuleResult:
    return RuleResult(**_base(rule),status=status,decision_reason=reason,reason=reason,**kwargs)

def _text(project: ProjectSchema) -> str:
    info=project.building_info
    return " ".join(str(x or "") for x in [info.purpose_group,info.building_use_text,info.building_type]).lower()

def _is_purpose_group_1(project: ProjectSchema) -> bool | None:
    classification=purpose_group_for_project(project)
    code=classification.get("purpose_group")
    if code: return str(code).startswith("1")
    if classification.get("status")=="CONFIRMED": return False
    if classification.get("status")=="AMBIGUOUS":
        groups=classification.get("purpose_groups",[])
        if groups and all(str(group["code"]).startswith("1") for group in groups): return True
        if groups and all(not str(group["code"]).startswith("1") for group in groups): return False
    return None

def _is_purpose_group_2b(project: ProjectSchema) -> bool | None:
    classification=purpose_group_for_project(project)
    code=classification.get("purpose_group")
    if code: return code=="2(b)"
    if classification.get("status")=="CONFIRMED": return False
    return None

def _use_key(project: ProjectSchema) -> str | None:
    classification=purpose_group_for_project(project)
    code=classification.get("purpose_group")
    text=_text(project)
    if code=="3": return "office"
    if code=="4": return "shop"
    if code=="6": return "factory"
    if code=="7(a)": return "storage"
    if code=="2(a)":
        if "school" in text or "educational" in text: return "school"
        if "clinic" in text: return "clinic"
        if "hospital" in text or "aged" in text or "convalescent" in text: return "hospital"
    return None

def _height(project: ProjectSchema) -> float | None:
    return project.building_info.highest_habitable_floor_level_m or project.building_info.building_height_m

def _highest_storey_floor_level(project: ProjectSchema) -> float | None:
    return project.building_info.highest_habitable_floor_level_m

def _is_high_rise(project: ProjectSchema) -> bool | None:
    height=_height(project); storeys=project.building_info.storey_count
    if height is not None and height>30: return True
    if storeys is not None and storeys>10: return True
    if height is not None and storeys is not None: return False
    return None

def _bool_presence(project: ProjectSchema, field: str, equipment_type: str | None = None) -> bool | None:
    explicit=None
    if field:
        if field.startswith("project."):
            explicit=project.project.get(field.split(".",1)[1])
        else:
            explicit=getattr(project,field,None)
    if explicit is not None:
        return explicit
    if equipment_type and any(item.type==equipment_type for item in project.fire_equipment):
        return True
    return None

def _plan_indications(project: ProjectSchema, feature_type: str) -> list[dict]:
    """Candidate drawing observations: useful context, never confirmation."""
    return [
        item for item in project.fire_features_detected
        if item.get("feature_type") == feature_type
        and item.get("presence") == "INDICATED_ON_PLAN"
        # A key/legend describes a symbol; it is not an installation.
        and "legend" not in str(item.get("evidence_description") or item.get("raw_evidence") or "").lower()
    ]

def _indication_evidence(items: list[dict]) -> list[dict]:
    return [{
        "evidence_state": "INDICATED_ON_PLAN", "feature_type": item.get("feature_type"),
        "floor": _floor_key(item.get("floor")),
        "page": item.get("source_page") or item.get("page"),
        "source_file": item.get("source_file"), "description": item.get("evidence_description") or item.get("raw_evidence"),
        "count": item.get("count") or item.get("quantity"),
    } for item in items]

def _reliable_plan_quantity(project: ProjectSchema, feature_type: str) -> tuple[int | None, list[dict]]:
    """Return a count only when every distinct plan indication has a count.

    A complete-plan confirmation is intentionally handled by the caller; an
    AI observation alone cannot establish that omitted equipment is absent.
    """
    items=_plan_indications(project,feature_type)
    if not items or any(item.get("count",item.get("quantity")) is None for item in items):
        return None, items
    return sum(item.get("count",item.get("quantity")) for item in items), items

def _floor_key(value: str | None) -> str | None:
    if not value:
        return None
    text = " ".join(str(value).upper().replace("-", " ").split())
    aliases = {"GROUND FLOOR": "Floor 1", "GROUND": "Floor 1", "FIRST FLOOR": "Floor 1", "FLOOR 1": "Floor 1", "SECOND FLOOR": "Floor 2", "FLOOR 2": "Floor 2"}
    if text in aliases:
        return aliases[text]
    import re
    match = re.search(r"(?:FLOOR|LEVEL)\s*(\d+)", text)
    return f"Floor {match.group(1)}" if match else str(value).strip()

def _floor_quantity_results(project: ProjectSchema, rule: RuleDefinition) -> list[RuleResult] | None:
    """Evaluate a floor-tagged quantity without extrapolating it to other floors."""
    items = _plan_indications(project, "HOSE_REEL")
    floor_items = [item for item in items if _floor_key(item.get("floor"))]
    if not floor_items:
        return None  # Legacy whole-building evidence keeps its established path.
    floors = [_floor_key(name) for name in project.building_info.floor_names]
    floors = [floor for floor in floors if floor] or [f"Floor {number}" for number in range(1, (project.building_info.storey_count or 0) + 1)]
    complete = project.project.get("relevant_plan_set_complete") is True
    results = []
    for floor in floors:
        scoped = [item for item in floor_items if _floor_key(item.get("floor")) == floor]
        if not scoped:
            if complete:
                results.append(_result(rule, RuleStatus.VIOLATION,
                    "The submitted plan set is confirmed complete, but it shows no hose-reel evidence for this floor.",
                    applicable=True, location=floor, actual=0, required=1,
                    source_evidence=[], evidence=[]))
                continue
            results.append(_result(rule, RuleStatus.MANUAL_REVIEW,
                "No drawing evidence is available for this floor. Upload the second-floor fire plan to complete this check.",
                applicable=True, location=floor, required=1,
                missing_evidence=[f"{floor} fire plan"]))
            continue
        def high_confidence(item: dict) -> bool:
            value = item.get("confidence") or 0
            if isinstance(value, str):
                return value.lower() == "high"
            return float(value) >= 0.8
        reliable = all(
            (item.get("count", item.get("quantity")) is not None)
            and high_confidence(item)
            for item in scoped
        )
        evidence = _indication_evidence(scoped)
        if not reliable:
            results.append(_result(rule, RuleStatus.MANUAL_REVIEW,
                "Equipment is indicated for this floor, but its quantity is not reliable enough to decide the floor-specific requirement.",
                applicable=True, location=floor, required=1,
                missing_evidence=[f"reliable {floor} hose-reel quantity"], source_evidence=evidence, evidence=evidence))
            continue
        actual = sum(item.get("count", item.get("quantity")) for item in scoped)
        if actual >= 1:
            results.append(_result(rule, RuleStatus.PASS,
                "Reliable plan evidence satisfies the supported hose-reel quantity requirement for this floor.",
                applicable=True, location=floor, actual=actual, required=1, source_evidence=evidence, evidence=evidence))
        else:
            results.append(_result(rule, RuleStatus.VIOLATION,
                "Reliable complete floor-plan evidence establishes fewer hose reels than required for this floor.",
                applicable=True, location=floor, actual=actual, required=1, source_evidence=evidence, evidence=evidence))
    return results

def _confirmed_exit_doors(project: ProjectSchema):
    return [door for door in project.doors if door.is_exit is True]

def _actual_exit_candidates(project: ProjectSchema) -> int | None:
    if "confirmed_independent_exit_count" in project.project:
        return project.project["confirmed_independent_exit_count"]
    if "confirmed_exit_count" in project.project:
        return project.project["confirmed_exit_count"]
    confirmed_stairs=project.project.get("confirmed_stair_count")
    confirmed_exit_doors=project.project.get("confirmed_exit_door_count")
    if confirmed_stairs is not None or confirmed_exit_doors is not None:
        return (confirmed_stairs or 0)+(confirmed_exit_doors or 0)
    return None

def evaluate_storey_exits(project: ProjectSchema) -> RuleResult:
    rule=RULE_BY_ID["CH2-EXITS-STOREY-COUNT"]
    pg1=_is_purpose_group_1(project)
    if pg1 is True:
        return _result(rule,RuleStatus.NOT_APPLICABLE,"Detached/Purpose Group 1 residential exception excludes this generic two-exit storey rule.",applicable=False,required=rule.threshold)
    if pg1 is None:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Building use/purpose group is unknown, so the detached residential exception cannot be evaluated.",applicable=None,missing_evidence=["building_info.purpose_group"],required=rule.threshold)
    # A partial multi-storey drawing can establish an observation for its own
    # floor, never a building-wide "each storey" conclusion.  This guard runs
    # before form values so an accidental UI value cannot convert Floor 1
    # staircase symbols (or a source-page number) into a whole-building PASS.
    stairs = [item for item in _plan_indications(project, "STAIRCASE") if _floor_key(item.get("floor"))]
    observed_floors = {_floor_key(item.get("floor")) for item in stairs}
    expected_floors = {_floor_key(name) for name in project.building_info.floor_names}
    if (project.building_info.storey_count or 0) > 1 and observed_floors and expected_floors - observed_floors:
        floor_one = [item for item in stairs if _floor_key(item.get("floor")) == "Floor 1"]
        scoped = floor_one or stairs
        count = sum(item.get("count", item.get("quantity")) or 1 for item in scoped)
        evidence = _indication_evidence(scoped)
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Two staircase locations are indicated on the first-floor plan. Upload the second-floor evacuation plan or provide verified exit information to confirm exits serving the other storey.",applicable=True,actual=f"{count} staircase locations indicated on Floor 1",location="Floor 1",missing_evidence=["Floor 2 evacuation plan or verified exit information"],required=rule.threshold,source_evidence=evidence,evidence=evidence)
    actual=_actual_exit_candidates(project)
    if actual is None:
        stairs = [item for item in stairs if _floor_key(item.get("floor")) == "Floor 1"]
        if stairs:
            count = sum(item.get("count", item.get("quantity")) or 1 for item in stairs)
            evidence = _indication_evidence(stairs)
            return _result(rule,RuleStatus.MANUAL_REVIEW,"Two staircase locations are indicated on the first-floor plan. Upload the second-floor evacuation plan or provide verified exit information to confirm exits serving the other storey.",applicable=True,actual=f"{count} staircase locations indicated on Floor 1",location="Floor 1",missing_evidence=["Floor 2 evacuation plan or verified exit information"],required=rule.threshold,source_evidence=evidence,evidence=evidence)
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Confirmed independent exits/staircases are unknown; missing evidence is not a violation.",applicable=True,missing_evidence=["confirmed exits or staircases"],required=rule.threshold)
    if actual>=rule.threshold:
        return _result(rule,RuleStatus.PASS,"Confirmed independent exit/stair count satisfies the verified minimum for each applicable storey.",applicable=True,actual=actual,required=rule.threshold)
    return _result(rule,RuleStatus.VIOLATION,"Confirmed exit/stair count is below the verified minimum for each applicable storey.",applicable=True,actual=actual,required=rule.threshold)

def evaluate_travel_distance(project: ProjectSchema) -> RuleResult:
    rule=RULE_BY_ID["CH2-TRAVEL-DISTANCE-TABLE5"]
    classification=purpose_group_for_project(project)
    escape_arrangement=project.project.get("escape_arrangement")
    actual=project.project.get("travel_distance_m")
    selected=select_travel_distance_limit(classification.get("purpose_group"),escape_arrangement,project.sprinkler_system,project.building_info.building_use_text)
    if selected["status"]=="NOT_APPLICABLE":
        return _result(rule,RuleStatus.NOT_APPLICABLE,selected["reason"],applicable=False,required=None,source_evidence=[selected],evidence=[selected])
    if selected["status"]!="RESOLVED":
        missing=[]
        if not classification.get("purpose_group"): missing.append("purpose group")
        if not escape_arrangement: missing.append("escape arrangement")
        if project.sprinkler_system is None: missing.append("sprinkler condition")
        return _result(rule,RuleStatus.MANUAL_REVIEW,selected["reason"],applicable=None,missing_evidence=missing or ["Table 5 applicability"],required=None,source_evidence=[selected],evidence=[selected])
    if actual is None:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Table 5 regulatory limit is resolved, but actual traversable travel distance is unknown.",applicable=True,missing_evidence=["validated route travel_distance_m"],required=selected["limit_m"],source_evidence=[selected],evidence=[selected])
    if actual<=selected["limit_m"]:
        return _result(rule,RuleStatus.PASS,"Actual validated travel distance does not exceed the selected Table 5 limit.",applicable=True,actual=actual,required=selected["limit_m"],source_evidence=[selected],evidence=[selected])
    return _result(rule,RuleStatus.VIOLATION,"Actual validated travel distance exceeds the selected Table 5 limit.",applicable=True,actual=actual,required=selected["limit_m"],source_evidence=[selected],evidence=[selected])

def evaluate_exit_door_numeric(project: ProjectSchema, rule_id: str, attr: str) -> list[RuleResult]:
    rule=RULE_BY_ID[rule_id]; doors=_confirmed_exit_doors(project)
    unknown_roles=[door for door in project.doors if door.is_exit is None]
    if not doors:
        missing=["confirmed exit doors"]
        if unknown_roles: missing.append("exit role for scheduled doors")
        return [_result(rule,RuleStatus.MANUAL_REVIEW,"No confirmed exit doors are available for this exit-door rule.",applicable=True,missing_evidence=missing,required=rule.threshold)]
    results=[]
    for door in doors:
        actual=getattr(door,attr)
        evidence=[{"source_file":door.source_file,"source_page":door.source_page,"evidence":door.evidence,"confidence":door.confidence}]
        if actual is None:
            results.append(_result(rule,RuleStatus.MANUAL_REVIEW,"Confirmed exit door is missing the required measured evidence.",applicable=True,location=door.mark,missing_evidence=[attr],required=rule.threshold,source_evidence=evidence,evidence=evidence))
        elif actual>=rule.threshold:
            results.append(_result(rule,RuleStatus.PASS,"Confirmed exit door satisfies the verified minimum.",applicable=True,location=door.mark,actual=actual,required=rule.threshold,source_evidence=evidence,evidence=evidence))
        else:
            results.append(_result(rule,RuleStatus.VIOLATION,"Confirmed exit door does not satisfy the verified minimum.",applicable=True,location=door.mark,actual=actual,required=rule.threshold,source_evidence=evidence,evidence=evidence))
    return results

def evaluate_exit_door_swing(project: ProjectSchema) -> list[RuleResult]:
    rule=RULE_BY_ID["CH2-EXIT-DOOR-SWING"]; doors=_confirmed_exit_doors(project)
    if not doors:
        return [_result(rule,RuleStatus.MANUAL_REVIEW,"No confirmed exit doors are available for swing-direction evaluation.",applicable=True,missing_evidence=["confirmed exit doors","opens_in_exit_direction"],required=True)]
    results=[]
    for door in doors:
        actual=door.opens_in_exit_direction
        evidence=[{"source_file":door.source_file,"source_page":door.source_page,"evidence":door.evidence,"confidence":door.confidence}]
        if actual is None:
            results.append(_result(rule,RuleStatus.MANUAL_REVIEW,"Exit-door opening direction is unknown.",applicable=True,location=door.mark,missing_evidence=["opens_in_exit_direction"],required=True,source_evidence=evidence,evidence=evidence))
        elif actual is True:
            results.append(_result(rule,RuleStatus.PASS,"Confirmed exit door opens in the direction of exit travel.",applicable=True,location=door.mark,actual=True,required=True,source_evidence=evidence,evidence=evidence))
        else:
            results.append(_result(rule,RuleStatus.VIOLATION,"Confirmed exit door does not open in the direction of exit travel.",applicable=True,location=door.mark,actual=False,required=True,source_evidence=evidence,evidence=evidence))
    return results

def evaluate_boolean_feature(project: ProjectSchema, rule_id: str, trigger: bool | None, presence_field: str, equipment_type: str | None = None) -> RuleResult:
    rule=RULE_BY_ID[rule_id]
    if trigger is False:
        return _result(rule,RuleStatus.NOT_APPLICABLE,"Verified applicability trigger is not met.",applicable=False,required=True)
    if trigger is None:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Applicability evidence for this feature is unknown.",applicable=None,missing_evidence=rule.required_inputs,required=True)
    presence=_bool_presence(project,presence_field,equipment_type)
    if presence is True:
        return _result(rule,RuleStatus.PASS,"Feature evidence is present for the verified applicable requirement.",applicable=True,actual=True,required=True)
    if presence is False:
        return _result(rule,RuleStatus.VIOLATION,"Feature is explicitly recorded as absent despite the verified applicable requirement.",applicable=True,actual=False,required=True)
    feature_type = {"exit_signage": "EXIT_SIGN", "manual_call_point": "MANUAL_CALL_POINT"}.get(equipment_type or "")
    indications = _plan_indications(project, feature_type) if feature_type else []
    if indications:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Feature is indicated on the uploaded plan, but installation, placement, count, and regulatory coverage are not confirmed.",applicable=True,missing_evidence=["authoritative installation/coverage confirmation"],required=True,source_evidence=_indication_evidence(indications),evidence=_indication_evidence(indications))
    return _result(rule,RuleStatus.MANUAL_REVIEW,"Feature is required, but presence is unknown from the available architectural-plan evidence.",applicable=True,missing_evidence=[presence_field or equipment_type or "feature presence"],required=True)

def trigger_above_height(project: ProjectSchema, metres: float) -> bool | None:
    height=_highest_storey_floor_level(project)
    if height is None: return None
    return height>metres

def evaluate_hose_reel(project: ProjectSchema) -> RuleResult | list[RuleResult]:
    rule=RULE_BY_ID["CH4-HOSE-REEL"]; storeys=project.building_info.storey_count; height=_height(project)
    total_area=project.building_info.total_building_area_m2
    if total_area is not None and total_area < 27.871:
        return _result(rule,RuleStatus.NOT_APPLICABLE,"Building area is below the verified 300 square feet exception.",applicable=False,required=1)
    pg1=_is_purpose_group_1(project)
    if pg1 is True and storeys is not None and height is not None and storeys<=4 and height<=18:
        return _result(rule,RuleStatus.NOT_APPLICABLE,"Purpose Group 1 building does not exceed four storeys or 18 m, so the listed exception applies.",applicable=False,required=1)
    if pg1 is True and (storeys is None or height is None):
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Purpose Group 1 exception may apply, but storey count or height is unknown.",applicable=None,missing_evidence=["building_info.storey_count","building_info.building_height_m"],required=1)
    floor_results = _floor_quantity_results(project, rule)
    if floor_results is not None:
        return floor_results
    required_quantity=storeys if storeys is not None else None
    observed=sum((item.count or 1) for item in project.fire_equipment if item.type=="hose_reel") or None
    if observed is not None and required_quantity is not None and observed>=required_quantity:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Minimum visible hose-reel count is met, but nozzle reach and placement coverage remain unverified.",applicable=True,actual=observed,required=required_quantity,missing_evidence=["hose reel 6 m reach coverage"])
    if observed is not None and required_quantity is not None and observed<required_quantity:
        return _result(rule,RuleStatus.VIOLATION,"Confirmed hose-reel count is below the verified minimum per storey.",applicable=True,actual=observed,required=required_quantity)
    indications=_plan_indications(project,"HOSE_REEL")
    plan_quantity, quantity_items=_reliable_plan_quantity(project,"HOSE_REEL")
    complete=project.project.get("relevant_plan_set_complete")
    if plan_quantity is not None and required_quantity is not None and complete is True:
        evidence=_indication_evidence(quantity_items)
        if plan_quantity >= required_quantity:
            return _result(rule,RuleStatus.PASS,"The complete submitted plan set indicates a count meeting the codified minimum per storey. Reach, placement, and physical installation still require separate verification.",applicable=True,actual=plan_quantity,required=required_quantity,source_evidence=evidence,evidence=evidence)
        return _result(rule,RuleStatus.VIOLATION,"The complete submitted plan set indicates fewer hose reels than the codified minimum per storey.",applicable=True,actual=plan_quantity,required=required_quantity,source_evidence=evidence,evidence=evidence)
    if indications:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Hose reel(s) are indicated on the uploaded plan, but installation, count per storey, nozzle reach, and placement coverage are not confirmed.",applicable=True,missing_evidence=["authoritative hose-reel count per storey","hose reel 6 m reach coverage"],required=required_quantity or "at least one per storey",source_evidence=_indication_evidence(indications),evidence=_indication_evidence(indications))
    return _result(rule,RuleStatus.MANUAL_REVIEW,"Hose reels are required unless a listed exception applies, but presence/count is unknown.",applicable=True,missing_evidence=["hose reel evidence"],required=required_quantity or "at least one per storey")

def evaluate_rising_main_quantity(project: ProjectSchema) -> RuleResult:
    rule=RULE_BY_ID["CH4-RISING-MAIN-QUANTITY"]
    if trigger_above_height(project,18) is False:
        return _result(rule,RuleStatus.NOT_APPLICABLE,"Highest storey floor level is not above 18 m.",applicable=False)
    if trigger_above_height(project,18) is None:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Storeys above 18 m cannot be identified because height evidence is unknown.",applicable=None,missing_evidence=["highest storey floor level"])
    floors=project.project.get("floors_above_18m")
    if not floors:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Rising-main quantity requires the floor area of each storey higher than 18 m.",applicable=True,missing_evidence=["floors above 18 m","floor area per applicable storey"])
    missing=[floor for floor in floors if floor not in project.building_info.floor_areas_m2]
    if missing:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Some storeys above 18 m are missing floor-area evidence.",applicable=True,missing_evidence=[f"floor area: {x}" for x in missing])
    required=sum(ceil(project.building_info.floor_areas_m2[floor]/rule.threshold) for floor in floors)
    observed=sum((item.count or 1) for item in project.fire_equipment if item.type in {"wet_riser","rising_main"}) or None
    if observed is None:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Calculated rising-main minimum is available, but observed count is unknown.",applicable=True,required=required,missing_evidence=["rising main count"])
    if observed>=required:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Minimum count is visible, but 60 m landing-valve coverage remains unverified.",applicable=True,actual=observed,required=required,missing_evidence=["60 m coverage"])
    return _result(rule,RuleStatus.VIOLATION,"Observed rising-main count is below the verified calculated minimum.",applicable=True,actual=observed,required=required)

def evaluate_alarm_table14(project: ProjectSchema) -> RuleResult:
    rule=RULE_BY_ID["CH4-FIRE-ALARM-TABLE14"]; use=_use_key(project); storeys=project.building_info.storey_count; area=project.building_info.max_floor_area_per_storey_m2
    table=rule.threshold
    if use not in table:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Building use is not mapped to a currently codified Table 14 row.",applicable=None,missing_evidence=["purpose group/building use"])
    if storeys is None:
        return _result(rule,RuleStatus.MANUAL_REVIEW,"Storey count is required for Table 14 fire alarm applicability.",applicable=None,missing_evidence=["building_info.storey_count"])
    row=table[use]
    if storeys==1:
        return _result(rule,RuleStatus.NOT_APPLICABLE,"The codified Table 14 row does not require an alarm for this single-storey case.",applicable=False)
    if 2<=storeys<=4:
        key="2_to_4_storeys_area_m2"
        if key in row:
            if area is None:
                return _result(rule,RuleStatus.MANUAL_REVIEW,"Floor area per storey is required for the Table 14 two-to-four-storey area trigger.",applicable=None,missing_evidence=["building_info.max_floor_area_per_storey_m2"])
            if area<=row[key]:
                return _result(rule,RuleStatus.NOT_APPLICABLE,"Maximum floor area per storey does not exceed the codified Table 14 trigger.",applicable=False,actual=area,required=f">{row[key]} m2")
            required_type="manual"
        else:
            required_type=row.get("2_to_4_storeys")
    else:
        required_type=row.get("more_than_4_storeys")
    presence=_bool_presence(project,"alarm_system","alarm_system")
    if presence is True:
        return _result(rule,RuleStatus.PASS,"Fire alarm evidence is present for the Table 14 applicable requirement.",applicable=True,actual=True,required=required_type)
    if presence is False:
        return _result(rule,RuleStatus.VIOLATION,"Fire alarm system is explicitly recorded as absent despite Table 14 applicability.",applicable=True,actual=False,required=required_type)
    indications=_plan_indications(project,"FIRE_ALARM_PANEL")
    if indications:
        evidence=_indication_evidence(indications)
        return _result(rule,RuleStatus.MANUAL_REVIEW,"A fire alarm control-panel symbol is indicated on the uploaded plan, but the alarm system type, installation, audibility, and Table 14 coverage are not confirmed.",applicable=True,missing_evidence=["authoritative alarm-system type and coverage confirmation"],required=required_type,source_evidence=evidence,evidence=evidence)
    return _result(rule,RuleStatus.MANUAL_REVIEW,"Table 14 indicates a fire alarm requirement, but alarm-system presence/type is unknown.",applicable=True,missing_evidence=["alarm_system","alarm type"],required=required_type)
