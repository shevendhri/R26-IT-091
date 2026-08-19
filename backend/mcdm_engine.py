# backend/mcdm_engine.py
"""Multi-Criteria Decision Making (MCDM) Engine.

Delegates core engineering evaluation to the robust 9-criteria Constraint Engine
to ensure mathematical consistency and eliminate duplicate scoring definitions.
"""

from typing import Dict, Any, Tuple, List

class MCDMEngine:
    """
    Multi-Criteria Decision Making (MCDM) Engine.
    Handles the 70% Engineering Validation phase.
    """
    
    def __init__(self):
        pass

    def evaluate_material(
        self,
        m: Dict[str, Any],
        climate: Dict[str, Any],
        b_type: str,
        floors: int,
        profile: Any,
        blueprint: Dict[str, Any] = None
    ) -> Tuple[float, List[str], bool, Dict[str, Any], float, float]:
        """
        Scores a material based on engineering criteria, environment and preferences.
        Returns (score: float, reasons: list of str, is_vetoed: bool, criterion_breakdown: dict, eng_conf: float, clim_conf: float)
        """
        from backend.engines.constraint_engine import evaluate_constraints
        from backend.utils import engineering_confidence, climate_confidence

        blueprint_to_pass = blueprint if blueprint is not None else {"building_type": b_type, "floors": floors}

        res = evaluate_constraints(
            material=m,
            occupancy=b_type,
            blueprint=blueprint_to_pass,
            climate=climate,
            profile=profile
        )

        eng_score = res["engineering_score"]
        is_vetoed = res["veto"]
        
        # Format rejection reasons or passing messages
        reasons = res["rejection_reasons"]
        if not reasons:
            reasons = ["All criteria meet expectations"]

        # Re-structure criterion_breakdown for compatibility if necessary
        # We can map breakdown back to structural format
        criterion_breakdown = res["constraint_breakdown"]

        # Extract confidence metrics
        total = len(res["validation_checks"])
        passed = sum(1 for c in res["validation_checks"] if c["status"])
        eng_conf = engineering_confidence(passed, total) if total > 0 else 100.0
        clim_conf = climate_confidence(m, climate)

        return eng_score, reasons, is_vetoed, criterion_breakdown, eng_conf, clim_conf

mcdm_engine = MCDMEngine()

# Convenience wrapper for legacy imports
def evaluate_material(m, climate, b_type, floors, profile, blueprint=None):
    """Legacy entry point used by older code.

    Creates a temporary MCDMEngine instance and forwards the call to
    ``MCDMEngine.evaluate_material``.
    """
    return MCDMEngine().evaluate_material(m, climate, b_type, floors, profile, blueprint)
