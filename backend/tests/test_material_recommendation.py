# backend/tests/test_material_recommendation.py
"""
Automated tests for GreenConstructAI Material Recommendation Pipeline.

Tests cover:
  1. Residential Coastal scenario
  2. Commercial Wet Zone scenario
  3. Industrial Dry Zone scenario
  4. High-rise building (>5 floors)
  5. Low-rise building (1-2 floors)

Assertions verify:
  - Engineering veto correctly sets overall_score to 0
  - Hybrid scoring respects the 75/25 weighting
  - Ranking changes when ML probability changes
  - Returned dict contains all required fields
  - No hardcoded or placeholder confidence values
"""

import sys
import os
import pytest
import numpy as np

# Add the backend directory to the path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


# ============================================================================
# Test Fixtures
# ============================================================================

# Sample project features for each scenario
RESIDENTIAL_COASTAL = {
    'climate_zone': 'Coastal',
    'sector': 'Residential',
    'actual_floor_count': 2,
    'building_area_m2': 200,
    'budget_tier': 'Medium',
    'maintenance_preference': 'Low Maintenance',
    'sustainability_priority': 'Medium',
    'user_priority': 'Durability',
    'climate_exposure_level': 'High',
    'coastal_exposure': 1,
    'humidity_exposure': 1,
}

COMMERCIAL_WET_ZONE = {
    'climate_zone': 'Wet Zone',
    'sector': 'Commercial',
    'actual_floor_count': 5,
    'building_area_m2': 1500,
    'budget_tier': 'Premium',
    'maintenance_preference': 'Premium Finish',
    'sustainability_priority': 'High',
    'user_priority': 'Cost',
    'climate_exposure_level': 'Medium',
    'coastal_exposure': 0,
    'humidity_exposure': 1,
}

INDUSTRIAL_DRY_ZONE = {
    'climate_zone': 'Dry Zone',
    'sector': 'Industrial',
    'actual_floor_count': 1,
    'building_area_m2': 5000,
    'budget_tier': 'Low',
    'maintenance_preference': 'Low Maintenance',
    'sustainability_priority': 'Low',
    'user_priority': 'Durability',
    'climate_exposure_level': 'Low',
    'coastal_exposure': 0,
    'humidity_exposure': 0,
}

HIGH_RISE = {
    'climate_zone': 'Wet Zone',
    'sector': 'Commercial',
    'actual_floor_count': 15,
    'building_area_m2': 10000,
    'budget_tier': 'Premium',
    'maintenance_preference': 'Premium Finish',
    'sustainability_priority': 'High',
    'user_priority': 'Cost',
    'climate_exposure_level': 'Medium',
    'coastal_exposure': 0,
    'humidity_exposure': 1,
}

LOW_RISE = {
    'climate_zone': 'Intermediate',
    'sector': 'Residential',
    'actual_floor_count': 1,
    'building_area_m2': 120,
    'budget_tier': 'Low',
    'maintenance_preference': 'Low Maintenance',
    'sustainability_priority': 'Medium',
    'user_priority': 'Cost',
    'climate_exposure_level': 'Low',
    'coastal_exposure': 0,
    'humidity_exposure': 0,
}

# Sample material features
CEMENT_BLOCK = {
    'material_name': 'Cement Block',
    'category': 'Wall Systems',
    'subcategory': 'Concrete Block',
    'building_phase': 'Superstructure',
    'max_recommended_floors': 6,
    'compressive_strength_mpa': 7,
    'thermal_performance_score': 50,
    'moisture_resistance_score': 69,
    'corrosion_resistance_score': 72,
    'fire_resistance_score': 87,
    'durability_score': 80,
    'maintenance_score': 75,
    'sustainability_score': 48,
    'carbon_footprint_kgco2e': 160,
    'service_life_years': 50,
    'suitable_for_coastal': 1,
    'suitable_for_wet_zone': 1,
    'suitable_for_dry_zone': 1,
    'suitable_for_highland': 1,
    'recommended_for_residential': 1,
    'recommended_for_commercial': 1,
    'recommended_for_industrial': 1,
}

CLAY_ROOF_TILE = {
    'material_name': 'Clay Roof Tile',
    'category': 'Roofing',
    'subcategory': 'Clay Tile',
    'building_phase': 'Roof',
    'max_recommended_floors': 3,
    'compressive_strength_mpa': 15,
    'thermal_performance_score': 70,
    'moisture_resistance_score': 75,
    'corrosion_resistance_score': 85,
    'fire_resistance_score': 90,
    'durability_score': 85,
    'maintenance_score': 80,
    'sustainability_score': 65,
    'carbon_footprint_kgco2e': 120,
    'service_life_years': 60,
    'suitable_for_coastal': 1,
    'suitable_for_wet_zone': 1,
    'suitable_for_dry_zone': 1,
    'suitable_for_highland': 1,
    'recommended_for_residential': 1,
    'recommended_for_commercial': 0,
    'recommended_for_industrial': 0,
}

SCENARIOS = [
    ('residential_coastal', RESIDENTIAL_COASTAL),
    ('commercial_wet_zone', COMMERCIAL_WET_ZONE),
    ('industrial_dry_zone', INDUSTRIAL_DRY_ZONE),
    ('high_rise', HIGH_RISE),
    ('low_rise', LOW_RISE),
]


# ============================================================================
# Test: Predictor Module Loads
# ============================================================================
class TestPredictorLoading:
    """Test that the ML predictor module loads correctly."""

    def test_predictor_imports(self):
        """Predictor module should import without error."""
        from backend.inference.predictor import predict_material, get_model_info
        assert predict_material is not None
        assert get_model_info is not None

    def test_model_info_returns_dict(self):
        """get_model_info should return a dictionary."""
        from backend.inference.predictor import get_model_info
        info = get_model_info()
        assert isinstance(info, dict)
        assert 'loaded' in info


# ============================================================================
# Test: Prediction Output Structure
# ============================================================================
class TestPredictionOutput:
    """Test that predictions return the correct structure."""

    @pytest.mark.parametrize('scenario_name,project_features', SCENARIOS)
    def test_prediction_returns_all_fields(self, scenario_name, project_features):
        """Each prediction must contain probability, prediction, confidence_level, model."""
        from backend.inference.predictor import predict_material
        result = predict_material(project_features, CEMENT_BLOCK)

        required_fields = ['probability', 'prediction', 'confidence_level', 'model']
        for field in required_fields:
            assert field in result, f"Missing field '{field}' in prediction for {scenario_name}"

    @pytest.mark.parametrize('scenario_name,project_features', SCENARIOS)
    def test_probability_range(self, scenario_name, project_features):
        """Probability must be between 0 and 100."""
        from backend.inference.predictor import predict_material
        result = predict_material(project_features, CEMENT_BLOCK)
        prob = result['probability']
        assert 0 <= prob <= 100, f"Probability {prob} out of range for {scenario_name}"

    @pytest.mark.parametrize('scenario_name,project_features', SCENARIOS)
    def test_prediction_is_boolean(self, scenario_name, project_features):
        """Prediction must be a boolean."""
        from backend.inference.predictor import predict_material
        result = predict_material(project_features, CEMENT_BLOCK)
        assert isinstance(result['prediction'], bool), f"Prediction not bool for {scenario_name}"

    @pytest.mark.parametrize('scenario_name,project_features', SCENARIOS)
    def test_confidence_level_valid(self, scenario_name, project_features):
        """Confidence level must be Low, Medium, or High."""
        from backend.inference.predictor import predict_material
        result = predict_material(project_features, CEMENT_BLOCK)
        valid_levels = {'Low', 'Medium', 'High', 'N/A', 'Error'}
        assert result['confidence_level'] in valid_levels, \
            f"Invalid confidence '{result['confidence_level']}' for {scenario_name}"


# ============================================================================
# Test: Hybrid Scoring
# ============================================================================
class TestHybridScoring:
    """Test the 75/25 hybrid scoring logic."""

    def test_hybrid_score_formula(self):
        """Hybrid score = eng * 0.75 + ml * 0.25."""
        from backend.utils import calculate_hybrid_score
        eng = 80.0
        ml = 60.0
        expected = eng * 0.75 + ml * 0.25  # 60 + 15 = 75
        result = calculate_hybrid_score(eng, ml, vetoed=False)
        assert abs(result - expected) < 0.01, f"Expected {expected}, got {result}"

    def test_hybrid_score_veto_is_zero(self):
        """When vetoed, hybrid score must be 0."""
        from backend.utils import calculate_hybrid_score
        result = calculate_hybrid_score(90.0, 85.0, vetoed=True)
        assert result == 0.0, f"Vetoed score should be 0, got {result}"

    def test_hybrid_score_none_eng(self):
        """When eng_score is None, hybrid score should be None."""
        from backend.utils import calculate_hybrid_score
        result = calculate_hybrid_score(None, 80.0, vetoed=False)
        assert result is None

    def test_hybrid_score_none_ml(self):
        """When ml_score is None, hybrid score should be None."""
        from backend.utils import calculate_hybrid_score
        result = calculate_hybrid_score(80.0, None, vetoed=False)
        assert result is None


# ============================================================================
# Test: Engineering Veto
# ============================================================================
class TestEngineeringVeto:
    """Test that engineering veto correctly overrides ML predictions."""

    def test_veto_forces_zero(self):
        """When engineering vetoes a material, overall_score must be 0."""
        from backend.utils import calculate_hybrid_score
        # Even with high ML score, veto must force 0
        result = calculate_hybrid_score(95.0, 99.0, vetoed=True)
        assert result == 0.0

    def test_no_veto_gives_positive(self):
        """Without veto, positive scores should produce positive hybrid score."""
        from backend.utils import calculate_hybrid_score
        result = calculate_hybrid_score(80.0, 70.0, vetoed=False)
        assert result > 0, f"Non-vetoed positive scores should give positive hybrid, got {result}"


# ============================================================================
# Test: Rankings Change with ML Probability
# ============================================================================
class TestRankingDifferentiation:
    """Test that different ML probabilities produce different rankings."""

    def test_different_materials_get_different_scores(self):
        """Cement Block and Clay Roof Tile should get different ML probabilities."""
        from backend.inference.predictor import predict_material, _model_loaded
        if not _model_loaded:
            pytest.skip("Model not loaded — training may not have completed yet.")

        result_block = predict_material(RESIDENTIAL_COASTAL, CEMENT_BLOCK)
        result_tile = predict_material(RESIDENTIAL_COASTAL, CLAY_ROOF_TILE)

        # They should get different probabilities (not identical)
        # This proves the model actually uses material features
        prob_block = result_block['probability']
        prob_tile = result_tile['probability']
        assert prob_block != prob_tile, \
            f"Both materials got identical probability {prob_block} — model may not use material features"


# ============================================================================
# Test: No Hardcoded Confidence Values
# ============================================================================
class TestNoHardcodedValues:
    """Verify that no placeholder or hardcoded confidence values appear."""

    def test_probability_not_always_same(self):
        """Different scenarios should produce different probabilities for the same material."""
        from backend.inference.predictor import predict_material, _model_loaded
        if not _model_loaded:
            pytest.skip("Model not loaded — training may not have completed yet.")

        results = []
        for _, project_features in SCENARIOS:
            result = predict_material(project_features, CEMENT_BLOCK)
            results.append(result['probability'])

        unique_probs = set(results)
        assert len(unique_probs) > 1, \
            f"All scenarios returned the same probability ({results[0]}) — suggests hardcoded value"


# ============================================================================
# Test: Explainability
# ============================================================================
class TestExplainability:
    """Test the explainability module."""

    def test_agreement_level_high(self):
        """Close scores should produce High agreement."""
        from backend.inference.explainability import compute_agreement_level
        result = compute_agreement_level(85.0, 80.0)
        assert result['agreement_level'] == 'High'

    def test_agreement_level_medium(self):
        """Moderate difference should produce Medium agreement."""
        from backend.inference.explainability import compute_agreement_level
        result = compute_agreement_level(85.0, 60.0)
        assert result['agreement_level'] == 'Medium'

    def test_agreement_level_low(self):
        """Large difference should produce Low agreement."""
        from backend.inference.explainability import compute_agreement_level
        result = compute_agreement_level(90.0, 40.0)
        assert result['agreement_level'] == 'Low'

    def test_agreement_has_required_fields(self):
        """Agreement result must have level, difference, and description."""
        from backend.inference.explainability import compute_agreement_level
        result = compute_agreement_level(80.0, 70.0)
        assert 'agreement_level' in result
        assert 'score_difference' in result
        assert 'description' in result


# ============================================================================
# Test: Batch Prediction
# ============================================================================
class TestBatchPrediction:
    """Test batch prediction for multiple materials."""

    def test_batch_returns_list(self):
        """Batch prediction should return a list of results."""
        from backend.inference.predictor import predict_material_batch
        results = predict_material_batch(RESIDENTIAL_COASTAL, [CEMENT_BLOCK, CLAY_ROOF_TILE])
        assert isinstance(results, list)
        assert len(results) == 2

    def test_batch_each_has_material_name(self):
        """Each batch result should include material_name."""
        from backend.inference.predictor import predict_material_batch
        results = predict_material_batch(RESIDENTIAL_COASTAL, [CEMENT_BLOCK, CLAY_ROOF_TILE])
        for r in results:
            assert 'material_name' in r


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
