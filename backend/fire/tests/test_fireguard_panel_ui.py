from pathlib import Path

ROOT = Path(__file__).parents[3]


def test_building_information_precedes_plan_and_has_no_equipment_questions():
    source = (ROOT / "frontend/src/app/fire-safety/submission/new/page.jsx").read_text(encoding="utf-8")
    assert source.index("building information") < source.index("Upload Fire-Safety Plan")
    for forbidden in ("How many extinguishers", "wet riser?", "manual_call_point_count"):
        assert forbidden not in source


def test_analyze_shows_processing_and_navigates_without_evidence_screen():
    source = (ROOT / "frontend/src/app/fire-safety/submission/new/page.jsx").read_text(encoding="utf-8")
    assert "Analyzing Fire-Safety Plan" in source
    assert "Normalizing fire-safety evidence" in source
    assert "Evaluating ICTAD requirements" in source
    assert source.index("analyzeFirePlan(files)") < source.index("await runFireGuardAssessment")
    assert "router.push(`/fire-safety/results/${submission.id}`)" in source
    assert "AI Model Evidence" not in source
    assert "class_counts" not in source


def test_results_only_render_violation_status_and_safe_empty_copy():
    source = (ROOT / "frontend/src/app/fire-safety/results/[id]/page.jsx").read_text(encoding="utf-8")
    assert "rule.status==='VIOLATION'" in source
    assert "No Confirmed Violations Found" in source
    assert "Fire Department Approved" not in source
    for hidden in ("Checks Passed", "Not Applicable", "Needs Engineer Verification", "Advanced Technical Details"):
        assert hidden not in source
