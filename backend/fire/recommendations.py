from .rules.models import RuleResult,RuleStatus
from .rules.rule_catalog import RULE_BY_ID

def _feature_record(result: RuleResult, required: bool|None, presence: str) -> dict:
    rule=RULE_BY_ID.get(result.rule_id)
    applicability_status = "REQUIRED" if result.applicable is True else "NOT_REQUIRED" if result.applicable is False else "APPLICABILITY_UNKNOWN"
    return {
        "rule_id":result.rule_id,
        "feature":rule.feature if rule and rule.feature else result.title or result.description,
        "required":required,
        "applicability_status":applicability_status,
        "regulation":result.regulation,
        "reason":result.decision_reason,
        "minimum_quantity":result.required if isinstance(result.required,(int,float)) and rule and rule.comparison_type in {"MINIMUM_PER_STOREY","CEIL_PER_AREA_PER_STOREY"} else None,
        "quantity_basis":rule.quantity_basis if rule else None,
        "calculation_inputs":{},
        "coverage_still_requires_verification": result.status==RuleStatus.MANUAL_REVIEW,
        "applicable_floors":[],
        "placement_type":"ZONE" if rule and rule.placement_zone else None,
        "placement_zone":rule.placement_zone if rule else None,
        "presence_status":presence,
        "current_status":result.status.value,
        "suggested_location_zone":rule.placement_zone if rule else None,
        "exact_coordinate_available":False,
        "placement_evidence":result.source_evidence,
    }

def build_recommendations(results: list[RuleResult]) -> tuple[list[dict],list[dict],list[dict]]:
    features=[]; recommendations=[]; manual=[]
    for result in results:
        rule=RULE_BY_ID.get(result.rule_id)
        if rule and rule.feature and result.status!=RuleStatus.NOT_APPLICABLE:
            required = True if result.applicable is True else None
            presence = "CONFIRMED_PRESENT" if result.status==RuleStatus.PASS else "CONFIRMED_NONCOMPLIANT" if result.status==RuleStatus.VIOLATION and result.actual is False else "UNKNOWN"
            features.append(_feature_record(result,required,presence))
        if result.status==RuleStatus.VIOLATION:
            recommendations.append({"rule_id":result.rule_id,"problem":result.description,"regulation":result.regulation,"actual":result.actual,"required":result.required,"location":result.location,"reason":result.decision_reason,"corrective_recommendation":result.recommendation})
        elif result.status==RuleStatus.MANUAL_REVIEW:
            manual.append({"rule_id":result.rule_id,"regulation":result.regulation,"missing_evidence":result.missing_evidence,"reason":result.decision_reason,"verify":_manual_instruction(result)})
    return features,recommendations,manual

def _manual_instruction(result: RuleResult) -> str:
    if "EXIT-DOOR" in result.rule_id:
        return "Confirm which scheduled doors are required exit doors and provide clear width, height, and swing-direction evidence."
    if result.rule_id=="CH2-TRAVEL-DISTANCE-TABLE5":
        return "Provide verified occupancy, sprinkler condition, escape arrangement, and traversable travel-distance measurement."
    if result.rule_id.startswith("CH4-"):
        return "Provide fire-service drawings or specifications showing whether the required feature is present, its count, and its coverage/placement."
    return "Provide legible drawing evidence and the cited authoritative clause/table; a qualified engineer must verify applicability."
