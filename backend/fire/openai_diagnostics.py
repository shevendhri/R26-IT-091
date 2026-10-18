import hashlib
import os
import platform
import time
from dataclasses import dataclass
from importlib import metadata
from types import SimpleNamespace
from urllib.parse import urlparse

from openai import APIConnectionError, APIStatusError, APITimeoutError, AsyncOpenAI, OpenAI, OpenAIError

from .config import Settings

DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"
_PREFLIGHT_CACHE: dict[str, tuple[float, dict]] = {}

@dataclass(frozen=True)
class OpenAIConfig:
    api_key: str | None
    model: str
    base_url: str | None
    organization: str | None
    project: str | None
    timeout_seconds: int
    plan_reader: str

    @property
    def resolved_base_url(self) -> str:
        return self.base_url or DEFAULT_OPENAI_BASE_URL

    @property
    def base_url_host(self) -> str:
        return _host(self.resolved_base_url)

    @property
    def key_fingerprint(self) -> str | None:
        return _fingerprint(self.api_key)

def build_openai_config(settings: Settings) -> OpenAIConfig:
    timeout_seconds = settings.openai_request_timeout_seconds
    if timeout_seconds is None:
        timeout_seconds = 25 if settings.fireguard_fast_mode else settings.openai_plan_timeout_seconds
    return OpenAIConfig(
        api_key=_clean_key(settings.openai_api_key),
        model=(settings.openai_plan_model or settings.openai_model).strip(),
        base_url=_clean_optional(settings.openai_base_url),
        organization=_clean_optional(settings.openai_organization),
        project=_clean_optional(settings.openai_project),
        timeout_seconds=timeout_seconds,
        plan_reader=settings.effective_plan_reader,
    )

def _clean_key(value: str | None) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None

def _clean_optional(value: str | None) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None

def _fingerprint(value: str | None) -> str | None:
    if not value:
        return None
    return hashlib.sha256(value.encode()).hexdigest()[:8]

def _host(value: str) -> str:
    parsed = urlparse(value)
    return parsed.hostname or value.split("/")[0]

def _sdk_version() -> str:
    try:
        return metadata.version("openai")
    except metadata.PackageNotFoundError:
        return "unknown"

def get_openai_config_diagnostics(settings: Settings) -> dict:
    config = build_openai_config(settings)
    key = config.api_key
    raw_key = settings.openai_api_key or ""
    quote_warning = bool(raw_key and raw_key.strip()[:1] in {"'", '"'} and raw_key.strip()[-1:] == raw_key.strip()[:1])
    process_key = os.getenv("OPENAI_API_KEY")
    return {
        "api_key_present": bool(key),
        "api_key_length": len(key or ""),
        "api_key_fingerprint": config.key_fingerprint,
        "api_key_from_process_env": bool(process_key),
        "api_key_process_fingerprint": _fingerprint(process_key.strip()) if process_key else None,
        "api_key_surrounding_quote_warning": quote_warning,
        "model": config.model,
        "plan_reader": config.plan_reader,
        "base_url": config.resolved_base_url,
        "base_url_host": config.base_url_host,
        "organization_configured": bool(config.organization),
        "project_configured": bool(config.project),
        "sdk_version": _sdk_version(),
        "python_version": platform.python_version(),
        "backend_env_file": str(Settings.model_config.get("env_file")),
        "backend_env_file_exists": bool(Settings.model_config.get("env_file") and Settings.model_config.get("env_file").exists()),
        "root_env_file_exists": os.path.exists(".env"),
    }

def make_openai_client(settings: Settings) -> OpenAI:
    return build_openai_client(build_openai_config(settings))

def make_async_openai_client(settings: Settings) -> AsyncOpenAI:
    return build_async_openai_client(build_openai_config(settings))

def build_openai_client(config: OpenAIConfig) -> OpenAI:
    kwargs = _client_kwargs(config)
    return OpenAI(**kwargs)

def build_async_openai_client(config: OpenAIConfig) -> AsyncOpenAI:
    kwargs = _client_kwargs(config)
    return AsyncOpenAI(**kwargs)

def _client_kwargs(config: OpenAIConfig) -> dict:
    kwargs = {"api_key": config.api_key, "timeout": config.timeout_seconds}
    if config.base_url:
        kwargs["base_url"] = config.base_url
    if config.organization:
        kwargs["organization"] = config.organization
    if config.project:
        kwargs["project"] = config.project
    return kwargs

class ClassifiedOpenAIError(Exception):
    def __init__(
        self,
        *,
        error_type: str,
        user_message: str,
        stage: str,
        status_code: int | None = None,
        code: str | None = None,
        provider_error_type: str | None = None,
        request_id: str | None = None,
        retryable: bool = False,
    ):
        super().__init__(user_message)
        self.error_type = error_type
        self.user_message = user_message
        self.stage = stage
        self.status_code = status_code
        self.code = code
        self.provider_error_type = provider_error_type
        self.request_id = request_id
        self.retryable = retryable

    def safe_dict(self) -> dict:
        return {
            "error_type": self.error_type,
            "message": self.user_message,
            "stage": self.stage,
            "status_code": self.status_code,
            "code": self.code,
            "provider_error_type": self.provider_error_type,
            "request_id": self.request_id,
            "retryable": self.retryable,
        }

def classify_openai_exception(exc: Exception, *, stage: str) -> ClassifiedOpenAIError:
    class_name = exc.__class__.__name__
    if isinstance(exc, APITimeoutError) or class_name == "APITimeoutError":
        return ClassifiedOpenAIError(error_type="TIMEOUT", user_message="OpenAI request timed out; local extraction fallback used.", stage=stage, retryable=True)
    if isinstance(exc, APIConnectionError) or class_name == "APIConnectionError":
        return ClassifiedOpenAIError(error_type="CONNECTION_FAILED", user_message="OpenAI connection failed; local extraction fallback used.", stage=stage, retryable=True)

    status = getattr(exc, "status_code", None)
    code, provider_type, request_id = _provider_error_details(exc)
    if isinstance(exc, APIStatusError) or status:
        error_type, message, retryable = _classify_status(status, code, provider_type)
        return ClassifiedOpenAIError(
            error_type=error_type,
            user_message=message,
            stage=stage,
            status_code=status,
            code=code,
            provider_error_type=provider_type,
            request_id=request_id,
            retryable=retryable,
        )
    if isinstance(exc, OpenAIError):
        return ClassifiedOpenAIError(error_type="PROVIDER_ERROR", user_message=f"OpenAI provider error: {exc.__class__.__name__}.", stage=stage)
    return ClassifiedOpenAIError(error_type="PROVIDER_ERROR", user_message=f"OpenAI plan reader failed safely: {exc.__class__.__name__}.", stage=stage)

def _provider_error_details(exc: Exception) -> tuple[str | None, str | None, str | None]:
    code = getattr(exc, "code", None)
    provider_type = getattr(exc, "type", None)
    request_id = getattr(exc, "request_id", None)
    response = getattr(exc, "response", None)
    if response is not None:
        request_id = request_id or response.headers.get("x-request-id")
        try:
            body = response.json()
            error = body.get("error", {}) if isinstance(body, dict) else {}
            code = code or error.get("code")
            provider_type = provider_type or error.get("type")
        except Exception:
            pass
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        error = body.get("error", body)
        if isinstance(error, dict):
            code = code or error.get("code")
            provider_type = provider_type or error.get("type")
    return code, provider_type, request_id

def _classify_status(status: int | None, code: str | None, provider_type: str | None) -> tuple[str, str, bool]:
    code_text = (code or "").lower()
    type_text = (provider_type or "").lower()
    if status == 401:
        return "AUTHENTICATION_FAILED", "OpenAI API authentication failed.", False
    if status == 403:
        if "model" in code_text:
            return "MODEL_UNAVAILABLE", "OpenAI API key is valid, but the configured model is not available.", False
        return "PERMISSION_DENIED", "OpenAI API permission was denied for this key/project.", False
    if status == 404:
        return "MODEL_UNAVAILABLE", "OpenAI API key is valid, but the configured model or resource is not available.", False
    if status == 429:
        if "quota" in code_text or "billing" in code_text or "insufficient" in code_text or "insufficient" in type_text:
            return "QUOTA_EXHAUSTED", "OpenAI API quota or billing is unavailable.", False
        return "RATE_LIMITED", "OpenAI API rate limit was reached; local extraction fallback used.", True
    if status == 400:
        if "invalid_json_schema" in code_text:
            return "INVALID_SCHEMA", "OpenAI rejected the structured output schema.", False
        if "image" in code_text or "file" in code_text or "unsupported" in code_text:
            return "UNSUPPORTED_INPUT", "OpenAI request was rejected because the input format is unsupported.", False
        return "BAD_REQUEST", "OpenAI request was rejected as invalid.", False
    if status == 408:
        return "TIMEOUT", "OpenAI request timed out; local extraction fallback used.", True
    if status and 500 <= status <= 599:
        return "PROVIDER_ERROR", "OpenAI provider error; local extraction fallback used.", True
    return "PROVIDER_ERROR", "OpenAI provider error; local extraction fallback used.", False

def safe_openai_log_payload(settings: Settings, classified: ClassifiedOpenAIError | None = None) -> dict:
    config = get_openai_config_diagnostics(settings)
    payload = {
        "model": config["model"],
        "plan_reader": config["plan_reader"],
        "base_url_host": config["base_url_host"],
        "api_key_present": config["api_key_present"],
        "api_key_length": config["api_key_length"],
        "api_key_fingerprint": config["api_key_fingerprint"],
        "sdk_version": config["sdk_version"],
    }
    if classified:
        payload.update(classified.safe_dict())
    return payload

def make_fake_status_error(status_code: int, *, code: str | None = None, provider_type: str | None = None, request_id: str | None = None):
    return SimpleNamespace(status_code=status_code, body={"error": {"code": code, "type": provider_type}}, request_id=request_id)

def run_openai_preflight(settings: Settings, *, cache_seconds: int = 60) -> dict:
    config = build_openai_config(settings)
    cache_key = f"{config.key_fingerprint}:{config.model}:{config.base_url}:{config.organization}:{config.project}"
    cached = _PREFLIGHT_CACHE.get(cache_key)
    now = time.time()
    if cached and now - cached[0] < cache_seconds:
        return {**cached[1], "cached": True}

    result = {
        "api_access": "NOT_RUN",
        "model_access": "NOT_RUN",
        "responses_api": "NOT_RUN",
        "error": None,
        "cached": False,
    }
    if not config.api_key:
        result["error"] = {"error_type": "MISSING_API_KEY", "stage": "CONFIG", "message": "OPENAI_API_KEY is not configured."}
        _PREFLIGHT_CACHE[cache_key] = (now, result)
        return result

    try:
        client = build_openai_client(config)
    except Exception as exc:
        classified = classify_openai_exception(exc, stage="CLIENT_INIT")
        result["error"] = classified.safe_dict()
        _PREFLIGHT_CACHE[cache_key] = (now, result)
        return result

    try:
        models = client.models.list()
        result["api_access"] = "PASS"
        model_ids = {item.id for item in getattr(models, "data", [])}
    except Exception as exc:
        classified = classify_openai_exception(exc, stage="AUTH_CHECK")
        result["api_access"] = "FAIL"
        result["error"] = classified.safe_dict()
        _PREFLIGHT_CACHE[cache_key] = (now, result)
        return result

    if config.model in model_ids:
        result["model_access"] = "PASS"
    else:
        try:
            client.models.retrieve(config.model)
            result["model_access"] = "PASS"
        except Exception as exc:
            classified = classify_openai_exception(exc, stage="MODEL_CHECK")
            result["model_access"] = "FAIL"
            result["error"] = classified.safe_dict()
            _PREFLIGHT_CACHE[cache_key] = (now, result)
            return result

    try:
        client.responses.create(model=config.model, input="Return the word OK.", max_output_tokens=16)
        result["responses_api"] = "PASS"
    except Exception as exc:
        classified = classify_openai_exception(exc, stage="RESPONSES_REQUEST")
        result["responses_api"] = "FAIL"
        result["error"] = classified.safe_dict()
    _PREFLIGHT_CACHE[cache_key] = (now, result)
    return result
