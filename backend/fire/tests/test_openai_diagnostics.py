from backend.config import Settings
from backend.openai_diagnostics import build_openai_config, classify_openai_exception, get_openai_config_diagnostics, make_fake_status_error

def assert_type(status, expected, code=None, provider_type=None):
    classified = classify_openai_exception(make_fake_status_error(status, code=code, provider_type=provider_type), stage="RESPONSES_REQUEST")
    assert classified.error_type == expected
    return classified

def test_safe_config_diagnostics_never_include_key():
    settings = Settings(openai_api_key=" sk-test-secret ", openai_plan_model="gpt-test", plan_reader="openai")
    diag = get_openai_config_diagnostics(settings)
    assert diag["api_key_present"] is True
    assert diag["api_key_length"] == len("sk-test-secret")
    assert diag["api_key_fingerprint"]
    assert "sk-test-secret" not in str(diag)

def test_401_authentication_failed():
    assert_type(401, "AUTHENTICATION_FAILED")

def test_403_permission_denied_not_authentication():
    assert_type(403, "PERMISSION_DENIED")

def test_404_model_unavailable():
    assert_type(404, "MODEL_UNAVAILABLE")

def test_429_quota_exhausted():
    assert_type(429, "QUOTA_EXHAUSTED", code="insufficient_quota")

def test_429_rate_limited():
    classified = assert_type(429, "RATE_LIMITED", code="rate_limit_exceeded")
    assert classified.retryable is True

def test_bad_request():
    assert_type(400, "BAD_REQUEST")

def test_invalid_json_schema_is_not_authentication():
    assert_type(400, "INVALID_SCHEMA", code="invalid_json_schema")

def test_unsupported_input():
    assert_type(400, "UNSUPPORTED_INPUT", code="unsupported_image")

def test_timeout_classification():
    APITimeoutError = type("APITimeoutError", (Exception,), {})
    classified = classify_openai_exception(APITimeoutError("timeout"), stage="RESPONSES_REQUEST")
    assert classified.error_type == "TIMEOUT"

def test_network_failure_classification():
    APIConnectionError = type("APIConnectionError", (Exception,), {})
    classified = classify_openai_exception(APIConnectionError("network"), stage="RESPONSES_REQUEST")
    assert classified.error_type == "CONNECTION_FAILED"

def test_openai_health_does_not_return_api_key(monkeypatch):
    from fastapi.testclient import TestClient
    from backend.main import app

    monkeypatch.setenv("OPENAI_API_KEY", "sk-health-secret")
    monkeypatch.setattr("backend.main.run_openai_preflight", lambda settings: {"api_access":"PASS","model_access":"PASS","responses_api":"PASS","error":None,"cached":False})
    response = TestClient(app).get("/api/fireguard/openai-health")
    assert response.status_code == 200
    body_text = response.text
    assert "sk-health-secret" not in body_text
    assert "key_fingerprint" in body_text

def test_shared_openai_config_contains_all_client_fields():
    settings = Settings(
        openai_api_key=" shared-key ",
        openai_plan_model="gpt-shared",
        openai_base_url="https://api.openai.com/v1",
        openai_organization="org_123",
        openai_project="proj_123",
        openai_plan_timeout_seconds=12,
        plan_reader="openai",
    )
    config = build_openai_config(settings)
    assert config.api_key == "shared-key"
    assert config.model == "gpt-shared"
    assert config.base_url == "https://api.openai.com/v1"
    assert config.organization == "org_123"
    assert config.project == "proj_123"
    assert config.timeout_seconds == 12
    assert config.plan_reader == "openai"

def test_openai_model_used_when_plan_model_not_explicitly_configured():
    settings = Settings(openai_api_key="shared-key", openai_model="gpt-5.6-luna", openai_plan_model=None, plan_reader="openai")
    config = build_openai_config(settings)
    assert config.model == "gpt-5.6-luna"

def test_process_env_overrides_backend_env_file(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text("PLAN_READER=local\nOPENAI_API_KEY=old-key\nOPENAI_PLAN_MODEL=old-model\n", encoding="utf-8")
    monkeypatch.setenv("PLAN_READER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "process-key")
    monkeypatch.setenv("OPENAI_PLAN_MODEL", "process-model")
    settings = Settings(_env_file=env_file)
    config = build_openai_config(settings)
    assert settings.effective_plan_reader == "openai"
    assert config.api_key == "process-key"
    assert config.model == "process-model"
    assert "process-key" not in str(get_openai_config_diagnostics(settings))
