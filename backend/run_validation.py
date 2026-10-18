import json, warnings, pathlib, sys
from fastapi.testclient import TestClient

# Add backend to PYTHONPATH for imports
sys.path.insert(0, str(pathlib.Path('backend').resolve()))
from app import app

client = TestClient(app)

scenario_dir = pathlib.Path('backend/validation_dataset')
results_root = pathlib.Path('backend/validation_dataset/dissertation_results')
results_root.mkdir(parents=True, exist_ok=True)


def build_questionnaire(data: dict) -> dict:
    """Construct a QuestionnaireRequest payload from the scenario JSON.
    Uses only values already present in the scenario. If a field is missing,
    the FastAPI model's default value is relied upon (no invention).
    """
    sd = data.get('scenario_definition', {}) or {}
    bc = data.get('building_context', {}) or {}
    # Helper to pick first non‑None value
    def first(*candidates):
        for v in candidates:
            if v is not None:
                return v
        return None

    questionnaire: dict = {}
    # Core fields (direct mapping or rename)
    questionnaire['building_type'] = first(sd.get('building_type'), bc.get('building_type'))
    questionnaire['family_size'] = first(sd.get('family_size'), bc.get('family_size'))
    questionnaire['bedrooms_needed'] = first(sd.get('bedrooms_needed'), bc.get('bedrooms_needed'))
    questionnaire['maintenance_pref'] = first(bc.get('maintenance_pref'))
    questionnaire['material_priority'] = first(bc.get('material_priority'))
    questionnaire['sustainability_pref'] = first(bc.get('sustainability_pref'), sd.get('sustainability_priority'))
    questionnaire['style_pref'] = first(bc.get('style_pref'))
    questionnaire['climate_concerns'] = first(bc.get('climate_concerns'), sd.get('climate_zone'))
    questionnaire['future_expansion'] = first(bc.get('future_expansion'))
    questionnaire['budget_tier'] = first(bc.get('budget_tier'), sd.get('budget'))
    # Residential extras – only set if source provides a value
    if sd.get('num_bathrooms') is not None:
        questionnaire['num_bathrooms'] = sd['num_bathrooms']
    if bc.get('elderly_occupants') is not None:
        questionnaire['elderly_occupants'] = bc['elderly_occupants']
    if bc.get('children_count') is not None:
        questionnaire['children_count'] = bc['children_count']
    if bc.get('parking_spaces') is not None:
        questionnaire['parking_spaces'] = bc['parking_spaces']
    if bc.get('outdoor_living_pref') is not None:
        questionnaire['outdoor_living_pref'] = bc['outdoor_living_pref']
    if bc.get('architectural_style_pref') is not None:
        questionnaire['architectural_style_pref'] = bc['architectural_style_pref']
    # Spatial program fields – map where data exists
    if sd.get('bedrooms') is not None:
        questionnaire['bedrooms'] = sd['bedrooms']
    if sd.get('num_bathrooms') is not None:
        questionnaire['bathrooms'] = sd['num_bathrooms']
    if sd.get('living_rooms') is not None:
        questionnaire['living_rooms'] = sd['living_rooms']
    if sd.get('area') is not None:
        questionnaire['kitchen_size'] = sd['area']
    # Return the constructed dict; any omitted keys will be filled by defaults
    return questionnaire

for i in range(1, 11):
    scenario_path = scenario_dir / f'scenario_{i:03d}.json'
    if not scenario_path.is_file():
        warnings.warn(f'Scenario file missing: {scenario_path}')
        continue
    with open(scenario_path) as f:
        data = json.load(f)
    # Prefer an explicit questionnaire, otherwise build one from scenario fields
    questionnaire = data.get('questionnaire')
    if questionnaire is None:
        questionnaire = build_questionnaire(data)
    # Submit questionnaire
    q_resp = client.post('/api/questionnaire', json=questionnaire)
    if q_resp.status_code != 200:
        warnings.warn(f'Questionnaire failed for scenario {i}: {q_resp.status_code}')
        continue
    proj_id = q_resp.json().get('project_id')
    if not proj_id:
        warnings.warn(f'No project_id returned for scenario {i}')
        continue
    # Get recommendation (pipeline runs after questionnaire)
    rec_resp = client.get(f'/api/recommendations/{proj_id}')
    if rec_resp.status_code != 200:
        warnings.warn(f'Recommendation failed for scenario {i}: {rec_resp.status_code}')
        continue
    rec_json = rec_resp.json()
    # Save results
    out_dir = results_root / f'scenario_{i:03d}'
    out_dir.mkdir(parents=True, exist_ok=True)
    # JSON output
    with open(out_dir / 'result.json', 'w', encoding='utf-8') as jf:
        json.dump(rec_json, jf, indent=2, ensure_ascii=False)
    # Markdown report (use field if present)
    md_content = rec_json.get('markdown_report')
    if not md_content:
        md_content = f"# Scenario {i}\n\n**Engineering Score:** {rec_json.get('engineering_verdict', {}).get('score', 'N/A')}\n\n**ML Confidence:** {rec_json.get('confidence', 'N/A')}\n\n**Hybrid Score:** {rec_json.get('hybrid_score', 'N/A')}\n\n**Recommended Package:**\n\n```json\n{json.dumps(rec_json.get('recommended_package', {}), indent=2)}\n```\n"
    with open(out_dir / 'report.md', 'w', encoding='utf-8') as mf:
        mf.write(md_content)
    print(f'Scenario {i} completed, results saved to {out_dir}')
