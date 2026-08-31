from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

MODULE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = MODULE_DIR / "green_assessment.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_sqlite_schema():
    if not DATABASE_URL.startswith("sqlite"):
        return

    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    columns_to_add = {
        "projects": {
            "description": "TEXT",
        },
        "criterion_scores": {
            "achieved_value": "FLOAT",
            "evidence_provided": "BOOLEAN DEFAULT 0",
        },
        "uploaded_documents": {
            "extraction_status": "VARCHAR DEFAULT 'not_processed'",
            "extraction_method": "VARCHAR",
            "extracted_text_path": "VARCHAR",
            "extracted_char_count": "INTEGER DEFAULT 0",
            "extraction_error": "TEXT",
            "processed_at": "DATETIME",
        },
        "uda_scoring_rules": {
            "operator": "VARCHAR",
            "threshold_value": "FLOAT",
            "threshold_unit": "VARCHAR",
            "machine_rule_json": "TEXT",
            "requires_manual_review": "BOOLEAN DEFAULT 1",
        },
        "uda_project_assessments": {
            "assessment_stage": "VARCHAR DEFAULT 'DA'",
            "assessment_status": "VARCHAR DEFAULT 'not_assessed'",
            "scoring_mode": "VARCHAR DEFAULT 'not_machine_assessable'",
            "awarded_marks": "FLOAT DEFAULT 0",
            "maximum_marks": "FLOAT DEFAULT 0",
            "evidence_value": "FLOAT",
            "evidence_unit": "VARCHAR",
            "evidence_boolean": "BOOLEAN",
            "selected_rule_id": "INTEGER",
            "evidence_summary_id": "INTEGER",
            "score_source": "VARCHAR DEFAULT 'manual'",
            "manual_marks": "FLOAT",
            "assessor_notes": "TEXT",
            "requires_manual_review": "BOOLEAN DEFAULT 0",
            "explanation": "TEXT",
            "created_at": "DATETIME",
            "updated_at": "DATETIME",
        },
        "uda_recommendation_knowledge": {
            "recommendation_text": "TEXT",
            "recommendation_type": "VARCHAR",
            "potential_marks_gain": "FLOAT DEFAULT 0",
            "cost_level": "VARCHAR DEFAULT 'unknown'",
            "implementation_difficulty": "VARCHAR DEFAULT 'unknown'",
            "required_documents": "TEXT",
            "source_basis": "TEXT",
            "requires_manual_review": "BOOLEAN DEFAULT 0",
            "notes": "TEXT",
        },
        "dataset_source_documents": {
            "source_path": "VARCHAR",
            "filename": "VARCHAR",
            "source_folder": "VARCHAR",
            "file_hash": "VARCHAR",
            "extraction_status": "VARCHAR DEFAULT 'not_processed'",
            "extraction_method": "VARCHAR",
            "extracted_text_path": "VARCHAR",
            "extracted_char_count": "INTEGER DEFAULT 0",
            "page_count": "INTEGER DEFAULT 0",
            "extraction_error": "TEXT",
            "processed_at": "DATETIME",
            "created_at": "DATETIME",
            "updated_at": "DATETIME",
        },
        "dataset_source_chunks": {
            "source_document_id": "INTEGER",
            "chunk_index": "INTEGER",
            "page_number": "INTEGER",
            "chunk_text": "TEXT",
            "word_count": "INTEGER DEFAULT 0",
            "token_estimate": "INTEGER DEFAULT 0",
            "source_folder": "VARCHAR",
            "suggested_label": "VARCHAR",
            "suggestion_confidence": "VARCHAR",
            "suggestion_reason": "TEXT",
            "suggestion_score": "FLOAT",
            "suggestion_candidates_json": "TEXT",
            "provisional_label": "VARCHAR",
            "provisional_confidence": "VARCHAR",
            "provisional_reason": "TEXT",
            "label_source": "VARCHAR",
            "verification_status": "VARCHAR",
            "specialist_review_reason": "TEXT",
            "human_label": "VARCHAR",
            "is_relevant": "BOOLEAN",
            "annotation_status": "VARCHAR DEFAULT 'unlabelled'",
            "annotation_notes": "TEXT",
            "reviewed_at": "DATETIME",
            "created_at": "DATETIME",
            "updated_at": "DATETIME",
        },
        "uda_project_chunk_evidence": {
            "project_id": "INTEGER",
            "document_id": "INTEGER",
            "chunk_id": "INTEGER",
            "criterion_code": "VARCHAR",
            "chunk_text": "TEXT",
            "source_page": "INTEGER",
            "model_version": "VARCHAR DEFAULT 'distilbert_v1'",
            "model_label": "VARCHAR",
            "model_confidence": "FLOAT",
            "model_second_label": "VARCHAR",
            "model_second_confidence": "FLOAT",
            "model_margin": "FLOAT",
            "rule_label": "VARCHAR",
            "rule_confidence": "VARCHAR",
            "rule_reason": "TEXT",
            "rule_runner_up": "VARCHAR",
            "rule_model_agreement": "BOOLEAN DEFAULT 0",
            "decision_status": "VARCHAR DEFAULT 'need_specialist_review'",
            "decision_reason": "TEXT",
            "reviewed_label": "VARCHAR",
            "reviewed_status": "VARCHAR DEFAULT 'unreviewed'",
            "created_at": "DATETIME",
            "updated_at": "DATETIME",
        },
        "uda_project_criterion_evidence_summaries": {
            "project_id": "INTEGER",
            "criterion_code": "VARCHAR",
            "proposed_input_metric": "VARCHAR",
            "proposed_input_value": "FLOAT",
            "input_unit": "VARCHAR",
            "extraction_method": "VARCHAR",
            "extraction_confidence": "VARCHAR",
            "source_evidence_id": "INTEGER",
            "evidence_count": "INTEGER DEFAULT 0",
            "source_document_id": "INTEGER",
            "source_page": "INTEGER",
            "matched_text": "TEXT",
            "proposed_score": "FLOAT",
            "proposed_rule_id": "INTEGER",
            "scoring_status": "VARCHAR DEFAULT 'need_specialist_review'",
            "scoring_explanation": "TEXT",
            "specialist_value": "FLOAT",
            "specialist_score": "FLOAT",
            "reviewed_status": "VARCHAR DEFAULT 'unreviewed'",
            "conflict_detected": "BOOLEAN DEFAULT 0",
            "conflict_notes": "TEXT",
            "created_at": "DATETIME",
            "updated_at": "DATETIME",
        },
    }

    with engine.begin() as connection:
        for table_name, columns in columns_to_add.items():
            if table_name not in table_names:
                continue

            existing_columns = {
                column["name"] for column in inspector.get_columns(table_name)
            }
            for column_name, column_definition in columns.items():
                if column_name not in existing_columns:
                    connection.execute(
                        text(
                            f"ALTER TABLE {table_name} "
                            f"ADD COLUMN {column_name} {column_definition}"
                        )
                    )
