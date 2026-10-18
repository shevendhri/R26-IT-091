from backend.recommendations import build_recommendations
from backend.rules.models import RuleResult,RuleStatus,Severity
def result(status,rule_id="CH4-WET-RISING-MAIN"): return RuleResult(rule_id=rule_id,chapter=4,description="Feature",regulation="R",severity=Severity.ERROR,status=status,applicable=True,decision_reason="reason",recommendation="correct it")
def test_violation_generates_correction_and_confirmed_noncompliance():
 f,r,m=build_recommendations([result(RuleStatus.VIOLATION)]); assert r[0]["corrective_recommendation"]=="correct it" and f[0]["presence_status"]=="UNKNOWN" and f[0]["current_status"]=="VIOLATION" and f[0]["minimum_quantity"] is None and not m
def test_manual_review_generates_verification_item():
 item=result(RuleStatus.MANUAL_REVIEW,"X"); item.missing_evidence=["drawing"]
 assert build_recommendations([item])[2][0]["missing_evidence"]==["drawing"]

def test_manual_review_chapter4_generates_unknown_feature_review():
 f,r,m=build_recommendations([result(RuleStatus.MANUAL_REVIEW)])
 assert f[0]["presence_status"]=="UNKNOWN" and f[0]["required"] is True and f[0]["applicability_status"]=="REQUIRED" and not r and m
