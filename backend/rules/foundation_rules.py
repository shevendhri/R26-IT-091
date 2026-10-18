# backend/rules/foundation_rules.py
"""Foundation engineering rules for Sri Lankan construction practice.
Each rule evaluates a material dict and occupancy type, returning a dict with:
- engineering_score (0-100)
- validation_status ('Pass' or 'Fail')
- explanation (human readable reason)
- reason (short code identifier)
"""

def evaluate(material: dict, occupancy: str) -> dict:
    """Evaluate foundation material against deterministic rules.
    Args:
        material: dict containing material attributes.
        occupancy: one of the occupancy types (e.g., "Residential", "Healthcare").
    Returns:
        dict with engineering_score, validation_status, explanation, reason.
    """
    name = material.get('Name', '').lower()
    grade = int(material.get('Concrete_Grade', 0))  # assumed integer grade

    # Rule: RC Raft foundation requires Grade 30+ concrete
    if 'rc raft' in name:
        if grade >= 30:
            return {
                'engineering_score': 100,
                'validation_status': 'Pass',
                'explanation': f"RC Raft foundation compatible with Grade {grade} concrete.",
                'reason': 'RC_Raft_Grade_OK'
            }
        else:
            return {
                'engineering_score': 0,
                'validation_status': 'Fail',
                'explanation': f"RC Raft foundation requires Grade 30+ concrete, found Grade {grade}.",
                'reason': 'RC_Raft_Grade_Insufficient'
            }

    # Rule: Lime‑Pozzolan foundations only for Eco House or low‑rise residential
    if 'lime' in name or 'pozzolan' in name:
        occ = occupancy.lower()
        if occ in ['residential', 'eco house'] and material.get('Max_Story', 2) <= 2:
            return {
                'engineering_score': 85,
                'validation_status': 'Pass',
                'explanation': "Lime‑Pozzolan foundation approved for low‑rise residential projects.",
                'reason': 'Lime_Pozzolan_LowRise_OK'
            }
        else:
            return {
                'engineering_score': 0,
                'validation_status': 'Fail',
                'explanation': "Lime‑Pozzolan foundations are restricted to low‑rise residential or eco‑house projects.",
                'reason': 'Lime_Pozzolan_NotAllowed'
            }

    # Default pass with a moderate score for generic foundation materials
    return {
        'engineering_score': 70,
        'validation_status': 'Pass',
        'explanation': 'Standard foundation material meets basic criteria.',
        'reason': 'Foundation_Default'
    }
}
