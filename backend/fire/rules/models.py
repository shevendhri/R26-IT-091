from enum import Enum
from typing import Any
from pydantic import BaseModel, Field

class RuleStatus(str,Enum):
    PASS="PASS"; VIOLATION="VIOLATION"; MANUAL_REVIEW="MANUAL_REVIEW"; NOT_APPLICABLE="NOT_APPLICABLE"
class Severity(str,Enum): ERROR="ERROR"; WARNING="WARNING"

class RuleDefinition(BaseModel):
    rule_id: str; chapter: int; description: str; regulation: str
    source_file: str; source_page: int|None=None; source_pages: list[int]=Field(default_factory=list)
    title: str|None=None; table: str|None=None; resolved: bool=False
    applicability_field: str|None=None; evidence_field: str|None=None; operator: str|None=None
    required: Any=None; exception_field: str|None=None; severity: Severity=Severity.ERROR
    recommendation: str|None=None; unresolved_reason: str|None=None
    required_inputs: list[str]=Field(default_factory=list); comparison_type: str|None=None
    threshold: Any=None; unit: str|None=None; exceptions: list[str]=Field(default_factory=list)
    feature: str|None=None; placement_zone: str|None=None; quantity_basis: str|None=None

class RuleResult(BaseModel):
    rule_id: str; chapter: int; description: str; regulation: str; severity: Severity
    title: str|None=None; source_pages: list[int]=Field(default_factory=list)
    status: RuleStatus; applicable: bool|None=None; actual: Any=None; required: Any=None
    location: str|None=None; missing_evidence: list[str]=Field(default_factory=list)
    source_evidence: list[dict]=Field(default_factory=list); recommendation: str|None=None
    decision_reason: str; evidence: list[dict]=Field(default_factory=list); reason: str|None=None
