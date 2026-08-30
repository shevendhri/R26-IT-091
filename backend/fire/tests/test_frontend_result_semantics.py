from pathlib import Path


RESULTS_PAGE = Path(__file__).resolve().parents[2] / "app" / "results" / "[id]" / "page.jsx"
SUBMISSION_PAGE = Path(__file__).resolve().parents[2] / "app" / "submission" / "new" / "page.jsx"


def test_results_page_uses_friendly_assessment_summary():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "FireGuard Assessment" in source
    assert "Requires Revision" in source
    assert "Requires Review" in source
    assert "Confirmed Violations" in source
    assert "Need Verification" in source


def test_results_page_keeps_compact_building_summary():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "function BuildingSummary" in source
    assert "['Project', summary.project_name]" in source
    assert "['Building use', summary.building_use]" in source
    assert "['Purpose group', purposeLabel(summary)]" in source
    assert "['Highest habitable floor', formatNumber(summary.highest_habitable_floor_level_m, 'm')]" in source
    assert "['Building use', summary.project_name" not in source


def test_results_page_primary_sections_are_user_facing():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "Changes Required" in source
    assert "Required Fire-Safety Features" in source
    assert "Needs Engineer Verification" in source
    assert "Checks Passed" in source
    assert "Not Applicable" in source
    assert "Confirmed Violations\" rules" not in source
    assert "Manual Review" not in source


def test_results_page_merges_recommendations_and_collapses_details():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "findRecommendation(rule, recommendations)" in source
    assert "Additional Recommendations" in source
    assert "Show regulatory details" in source
    assert "Advanced Technical Details" in source
    assert "<details" in source
    assert "Applicability Trace" not in source
    assert "Plan reader" not in source


def test_results_page_deduplicates_required_features():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "function buildFeatureCards" in source
    assert "const map = new Map()" in source
    assert "map.set(key, existing)" in source
    assert "View regulatory details" in source


def test_results_page_has_bottom_actions_and_disclaimer():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "Print Report" in source
    assert "window.print()" in source
    assert "Start New Assessment" in source
    assert "FireGuard is a fire-safety pre-assessment and decision-support prototype." in source
    assert "Export Report" not in source


def test_panel_upload_screen_presents_three_modes_and_disclaimer():
    source = SUBMISSION_PAGE.read_text(encoding="utf-8")
    assert "Validated Demonstration" in source
    assert "Manual / Assisted Assessment" in source
    assert "Experimental AI Extraction" in source
    assert "Recommended for research demonstration." in source
    assert "Experimental feature. Analysis time and extraction completeness may vary." in source
    assert "FireGuard is a fire-safety pre-assessment and decision-support prototype." in source


def test_panel_review_form_uses_friendly_labels_and_assessment_button():
    source = RESULTS_PAGE.read_text(encoding="utf-8")
    assert "Run Fire-Safety Assessment" in source
    assert "Applying verification" not in source
    assert "({status})" not in source
    assert "reviewGroups" in source
