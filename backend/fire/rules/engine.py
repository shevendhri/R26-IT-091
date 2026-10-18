from typing import Any
import logging
from time import perf_counter
from ..schemas import ProjectSchema
from .applicability import get_path,is_applicable
from .input_validation import validate_rule_inputs
from .models import RuleDefinition,RuleResult,RuleStatus
from .rule_catalog import RULE_CATALOG

logger=logging.getLogger("fireguard")

def evaluate_rule(project: ProjectSchema,rule: RuleDefinition) -> RuleResult:
    pages=rule.source_pages or ([rule.source_page] if rule.source_page else [])
    base=dict(rule_id=rule.rule_id,chapter=rule.chapter,title=rule.title,description=rule.description,regulation=rule.regulation,severity=rule.severity,required=rule.required,recommendation=rule.recommendation,source_pages=pages)
    if not rule.resolved:
        reason="No compliance decision is permitted until the source rule is resolved."
        return RuleResult(**base,status=RuleStatus.MANUAL_REVIEW,applicable=None,missing_evidence=[rule.unresolved_reason or "Verified regulatory source detail"],decision_reason=reason,reason=reason)
    applicable=is_applicable(project,rule.applicability_field)
    if applicable is False or (rule.exception_field and get_path(project,rule.exception_field) is True):
        reason="Applicability condition or verified exception excludes the rule."
        return RuleResult(**base,status=RuleStatus.NOT_APPLICABLE,applicable=False,decision_reason=reason,reason=reason)
    if applicable is None:
        reason="Applicability evidence is unknown."
        return RuleResult(**base,status=RuleStatus.MANUAL_REVIEW,applicable=None,missing_evidence=[rule.applicability_field or "applicability"],decision_reason=reason,reason=reason)
    actual=get_path(project,rule.evidence_field)
    if actual is None:
        reason="Required evidence is unknown; missing is not a violation."
        return RuleResult(**base,status=RuleStatus.MANUAL_REVIEW,applicable=True,missing_evidence=[rule.evidence_field or "required evidence"],decision_reason=reason,reason=reason)
    comparisons={"eq":lambda a,b:a==b,"gte":lambda a,b:a>=b,"lte":lambda a,b:a<=b,"true":lambda a,b:a is True}
    passed=comparisons[rule.operator or "eq"](actual,rule.required)
    reason="Confirmed evidence satisfies the verified requirement." if passed else "Confirmed evidence does not satisfy the verified requirement."
    return RuleResult(**base,status=RuleStatus.PASS if passed else RuleStatus.VIOLATION,applicable=True,actual=actual,decision_reason=reason,reason=reason)

def evaluate_project(project: ProjectSchema) -> list[RuleResult]:
    from .chapter2 import evaluate as chapter2
    from .chapter4 import evaluate as chapter4
    validated=validate_rule_inputs(project)
    chapter2_started=perf_counter()
    chapter2_results=chapter2(validated)
    logger.info("[FireGuard] Chapter 2 rule execution completed in %.2fs", perf_counter() - chapter2_started)
    chapter4_started=perf_counter()
    chapter4_results=chapter4(validated)
    logger.info("[FireGuard] Chapter 4 rule execution completed in %.2fs", perf_counter() - chapter4_started)
    return chapter2_results+chapter4_results
