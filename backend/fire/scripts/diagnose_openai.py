import base64
from io import BytesIO
import sys
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ..config import get_settings
from ..openai_diagnostics import classify_openai_exception, get_openai_config_diagnostics, make_openai_client

def _print_config(diag: dict) -> None:
    print("CONFIG: PASS")
    print(f"Python: {diag['python_version']}")
    print(f"OpenAI SDK: {diag['sdk_version']}")
    print(f"API key present: {diag['api_key_present']}")
    print(f"API key length: {diag['api_key_length']}")
    print(f"API key fingerprint: {diag['api_key_fingerprint'] or 'none'}")
    print(f"PLAN_READER: {diag['plan_reader']}")
    print(f"OPENAI_PLAN_MODEL: {diag['model']}")
    print(f"OpenAI base URL host: {diag['base_url_host']}")
    print(f"Organization configured: {diag['organization_configured']}")
    print(f"Project configured: {diag['project_configured']}")
    if diag["api_key_surrounding_quote_warning"]:
        print("CONFIG_WARNING: API key appears to include surrounding quote characters.")

def _report_failure(label: str, exc: Exception, stage: str) -> None:
    classified = classify_openai_exception(exc, stage=stage)
    print(
        f"{label}: FAIL "
        f"error_type={classified.error_type} "
        f"status={classified.status_code or 'none'} "
        f"code={classified.code or 'none'} "
        f"provider_type={classified.provider_error_type or 'none'} "
        f"request_id={classified.request_id or 'none'}"
    )
    print(f"Reason: {classified.user_message}")

def _tiny_image_data_url() -> str:
    out = BytesIO()
    Image.new("RGB", (4, 4), "white").save(out, "PNG")
    return "data:image/png;base64," + base64.b64encode(out.getvalue()).decode("ascii")

def main() -> int:
    settings = get_settings()
    diag = get_openai_config_diagnostics(settings)
    _print_config(diag)
    if not diag["api_key_present"]:
        print("CLIENT_CREATION: SKIPPED")
        print("AUTHENTICATION: SKIPPED")
        print("MODEL_ACCESS: SKIPPED")
        print("RESPONSES_API: SKIPPED")
        print("VISION_REQUEST: SKIPPED")
        return 0

    try:
        client = make_openai_client(settings)
        print("CLIENT_CREATION: PASS")
    except Exception as exc:
        _report_failure("CLIENT_CREATION", exc, "CLIENT_INIT")
        return 1

    try:
        models = client.models.list()
        print("API_CONNECTION: PASS")
        model_ids = {item.id for item in getattr(models, "data", [])}
    except Exception as exc:
        _report_failure("API_CONNECTION", exc, "AUTH_CHECK")
        return 1

    model = diag["model"]
    if model in model_ids:
        print("MODEL_ACCESS: PASS")
    else:
        try:
            client.models.retrieve(model)
            print("MODEL_ACCESS: PASS")
        except Exception as exc:
            _report_failure("MODEL_ACCESS", exc, "MODEL_CHECK")
            return 1

    try:
        response = client.responses.create(model=model, input="Return the word OK.", max_output_tokens=16)
        text = (response.output_text or "").strip()
        print("RESPONSES_API: PASS" if text else "RESPONSES_API: PASS_EMPTY_OUTPUT")
    except Exception as exc:
        _report_failure("RESPONSES_API", exc, "RESPONSES_REQUEST")
        return 1

    try:
        response = client.responses.create(
            model=model,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": "Reply with OK if you can inspect this image."},
                        {"type": "input_image", "image_url": _tiny_image_data_url(), "detail": "low"},
                    ],
                }
            ],
            max_output_tokens=16,
        )
        text = (response.output_text or "").strip()
        print("VISION_REQUEST: PASS" if text else "VISION_REQUEST: PASS_EMPTY_OUTPUT")
    except Exception as exc:
        _report_failure("VISION_REQUEST", exc, "RESPONSES_REQUEST")
        return 1

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
