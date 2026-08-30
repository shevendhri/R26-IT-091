"""
approval_checklist.py — approver-facing plan-approval checklist.

Runs the fixed set of checklist items this component is responsible for
(a subset of a larger regulatory checklist; the rest are out of scope) and,
for each, either computes a real pass/fail from the detected floor plan or
honestly reports that it can't be verified from a floor plan alone (most
items here need a foundation/elevation/site plan, which this system never
receives).
"""

_FIRE_SAFETY_SQFT_THRESHOLD = 4000


def _not_verifiable(reason: str):
    return 'not_verifiable', reason


def _room_details_status(rooms: list):
    if not rooms:
        return 'not_verifiable', "No rooms were extracted from this plan."
    missing = [r.get('name') or f"Room {i + 1}" for i, r in enumerate(rooms)
               if not (r.get('doors') or r.get('windows'))]
    if missing:
        shown = ', '.join(missing[:5]) + ('...' if len(missing) > 5 else '')
        return 'fail', f"{len(missing)} room(s) have no doors or windows recorded: {shown}."
    return 'pass', f"All {len(rooms)} rooms have at least one door or window recorded."


def _ground_plan_status(rooms: list, cluster_gap_px=None):
    if not rooms:
        return 'fail', "No room geometry could be parsed — the ground plan may be missing or malformed."
    note = ""
    if cluster_gap_px:
        note = (
            f" Note: rooms span two widely separated clusters (~{cluster_gap_px}px gap) — "
            "confirm this plan doesn't combine two unrelated structures before approving."
        )
    return 'pass', f"A ground (floor) plan with room geometry was successfully parsed from the submitted SVG.{note}"


def _fire_safety_status(rooms: list, scale_source: str):
    if scale_source == 'none':
        return 'not_verifiable', (
            "Total building area could not be determined from this plan — verify manually "
            "whether the 4,000 sqft fire-safety threshold applies."
        )
    total_sqft = sum(r['area_sqft'] for r in rooms if r.get('area_sqft'))
    if total_sqft > _FIRE_SAFETY_SQFT_THRESHOLD:
        return 'not_verifiable', (
            f"Total building area is ~{total_sqft:,.0f} sqft, exceeding the 4,000 sqft threshold — "
            "a fire safety certificate is required; confirm one has been submitted."
        )
    return 'pass', f"Total building area is ~{total_sqft:,.0f} sqft, below the 4,000 sqft threshold — no fire safety certificate required."


def build_checklist(rooms: list, scale_source: str, cluster_gap_px=None) -> list:
    """Return the fixed 13-item checklist as a list of
    {item_no, question, status, insight} dicts."""
    items = [
        (11, "Are the details of rooms and doors & windows specified?",
         lambda: _room_details_status(rooms)),
        (12, "Are the foundation details specified?",
         lambda: _not_verifiable("Requires a foundation drawing, which is not part of the submitted floor plan.")),
        (14, "Is the ground plan drawn?",
         lambda: _ground_plan_status(rooms, cluster_gap_px)),
        (15, "Is the side elevation drawn?",
         lambda: _not_verifiable("Requires a side elevation drawing, which is not part of the submitted floor plan.")),
        (16, "Is the front elevation drawn?",
         lambda: _not_verifiable("Requires a front elevation drawing, which is not part of the submitted floor plan.")),
        (17, "Is the location plan (site plan) drawn?",
         lambda: _not_verifiable("Requires a separate site/location plan, which is not part of the submitted floor plan.")),
        (18, "Is the cross-section plan drawn?",
         lambda: _not_verifiable("Requires a cross-section drawing, which is not part of the submitted floor plan.")),
        (19, "Is the location for constructing the well shown?",
         lambda: _not_verifiable("Requires a site plan showing utility locations, which is not part of the submitted floor plan.")),
        (20, "Is the location for constructing the toilet pit shown?",
         lambda: _not_verifiable("Requires a site plan showing utility locations, which is not part of the submitted floor plan.")),
        (21, "Is the wastewater disposal location (Waste Water Pit) shown?",
         lambda: _not_verifiable("Requires a site plan showing utility locations, which is not part of the submitted floor plan.")),
        (22, "Are the septic tank and soakage pit tank shown on the plan?",
         lambda: _not_verifiable("Requires a site plan showing utility locations, which is not part of the submitted floor plan.")),
        (23, "Is there a minimum 60ft distance between wastewater disposal and the well/cesspit?",
         lambda: _not_verifiable("Requires a site plan with real-world utility coordinates, which is not part of the submitted floor plan.")),
        (24, "Is there a minimum 60ft distance between the toilet pit and the well?",
         lambda: _not_verifiable("Requires a site plan with real-world utility coordinates, which is not part of the submitted floor plan.")),
        (26, "Is the distance from the boundary to the building 7.5ft (single story) or 10ft (two-story)?",
         lambda: _not_verifiable("Requires a boundary survey, which is not part of the submitted floor plan.")),
        (27, "Is there a distance of 20ft from the center of the road and the road width specified?",
         lambda: _not_verifiable("Requires a site plan showing road access, which is not part of the submitted floor plan.")),
        (32, "If construction exceeds 4,000 sqft, has a fire safety certificate been obtained and submitted?",
         lambda: _fire_safety_status(rooms, scale_source)),
    ]

    checklist = []
    for item_no, question, fn in items:
        status, insight = fn()
        checklist.append({
            'item_no': item_no,
            'question': question,
            'status': status,
            'insight': insight,
        })
    return checklist
