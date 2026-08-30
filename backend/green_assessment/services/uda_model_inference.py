from functools import lru_cache
from pathlib import Path
from typing import Iterable


MODEL_VERSION = "distilbert_v1"
MAX_LENGTH = 256
DEFAULT_BATCH_SIZE = 16


class UdaModelInferenceError(RuntimeError):
    pass


def model_directory() -> Path:
    return Path(__file__).resolve().parents[1] / "models" / "uda_distilbert"


def _load_ml_dependencies():
    try:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
    except ImportError as exc:
        raise UdaModelInferenceError(
            "Green Assessment ML dependencies are not installed. Install torch and transformers, "
            "then place the DistilBERT V1 model at "
            f"{model_directory()}"
        ) from exc
    return torch, AutoModelForSequenceClassification, AutoTokenizer


@lru_cache(maxsize=1)
def _load_model():
    model_path = model_directory()
    if not model_path.exists():
        raise UdaModelInferenceError(
            f"Green Assessment DistilBERT model not found. Expected location: {model_path}"
        )

    torch, AutoModelForSequenceClassification, AutoTokenizer = _load_ml_dependencies()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(
            model_path,
            local_files_only=True,
        )
    except Exception as exc:
        raise UdaModelInferenceError(f"Could not load UDA DistilBERT V1 model: {exc}") from exc

    model.to(device)
    model.eval()
    return tokenizer, model, device, torch


def model_metadata() -> dict:
    _, _, device, torch = _load_model()
    return {
        "model_version": MODEL_VERSION,
        "model_path": str(model_directory()),
        "device": str(device),
        "cuda_available": torch.cuda.is_available(),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
    }


def predict_uda_criterion(text: str) -> dict:
    predictions = predict_uda_criteria([text], batch_size=1)
    return predictions[0]


def predict_uda_criteria(
    texts: Iterable[str],
    batch_size: int = DEFAULT_BATCH_SIZE,
    top_k: int = 3,
) -> list[dict]:
    tokenizer, model, device, torch = _load_model()
    rows = list(texts)
    if not rows:
        return []

    predictions = []
    id2label = model.config.id2label
    with torch.inference_mode():
        for start in range(0, len(rows), batch_size):
            batch_texts = rows[start : start + batch_size]
            encoded = tokenizer(
                batch_texts,
                truncation=True,
                max_length=MAX_LENGTH,
                padding=True,
                return_tensors="pt",
            )
            encoded = {key: value.to(device) for key, value in encoded.items()}
            logits = model(**encoded).logits
            probabilities = torch.softmax(logits, dim=-1).detach().cpu()

            for row_probs in probabilities:
                values, indexes = torch.topk(
                    row_probs,
                    k=min(top_k, row_probs.shape[-1]),
                )
                top_predictions = [
                    {
                        "label": id2label[int(index)],
                        "confidence": round(float(value), 6),
                    }
                    for value, index in zip(values, indexes)
                ]
                top = top_predictions[0]
                second = (
                    top_predictions[1]
                    if len(top_predictions) > 1
                    else {"label": None, "confidence": 0.0}
                )
                predictions.append(
                    {
                        "predicted_label": top["label"],
                        "confidence": top["confidence"],
                        "second_label": second["label"],
                        "second_confidence": second["confidence"],
                        "margin": round(top["confidence"] - second["confidence"], 6),
                        "top_predictions": top_predictions,
                    }
                )

    return predictions
