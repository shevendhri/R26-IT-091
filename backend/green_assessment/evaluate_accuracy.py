from pathlib import Path
import json

import pandas as pd
import torch
from sklearn.metrics import accuracy_score
from transformers import AutoModelForSequenceClassification, AutoTokenizer


MODEL_DIR = Path(__file__).resolve().parent / "models" / "uda_distilbert"
TEST_CSV = Path(r"C:\Users\SAVIDYA\Desktop\green-building-system\backend\dataset_exports\uda_test.csv")
MAX_LENGTH = 256
BATCH_SIZE = 8


def load_label_mapping(model_dir: Path, model):
    candidates = [
        model_dir / "label_mapping.json",
        model_dir / "label_mappings.json",
        model_dir / "labels.json",
    ]

    for path in candidates:
        if not path.exists():
            continue
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if "id_to_label" in data:
            return {int(k): v for k, v in data["id_to_label"].items()}
        if "id2label" in data:
            return {int(k): v for k, v in data["id2label"].items()}
        if "label_to_id" in data:
            return {int(v): k for k, v in data["label_to_id"].items()}
        if "label2id" in data:
            return {int(v): k for k, v in data["label2id"].items()}

    if getattr(model.config, "id2label", None):
        return {int(k): v for k, v in model.config.id2label.items()}

    raise FileNotFoundError("Saved model label mapping not found.")


def main():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    id_to_label = load_label_mapping(MODEL_DIR, model)

    df = pd.read_csv(TEST_CSV)
    texts = df["text"].fillna("").astype(str).tolist()
    true_labels = df["label"].astype(str).tolist()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    predictions = []
    with torch.inference_mode():
        for start in range(0, len(texts), BATCH_SIZE):
            batch_texts = texts[start:start + BATCH_SIZE]
            encoded = tokenizer(
                batch_texts,
                truncation=True,
                padding=True,
                max_length=MAX_LENGTH,
                return_tensors="pt",
            )
            encoded = {key: value.to(device) for key, value in encoded.items()}
            logits = model(**encoded).logits
            predicted_ids = torch.argmax(logits, dim=-1).detach().cpu().tolist()
            predictions.extend(id_to_label[int(label_id)] for label_id in predicted_ids)

    accuracy = accuracy_score(true_labels, predictions)
    correct = sum(pred == true for pred, true in zip(predictions, true_labels))

    print("Green Assessment DistilBERT V1 Evaluation")
    print(f"Test samples: {len(true_labels)}")
    print(f"Correct predictions: {correct}")
    print(f"Accuracy: {accuracy * 100:.2f}%")


if __name__ == "__main__":
    main()
