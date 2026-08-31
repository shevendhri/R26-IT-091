from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from green_assessment.database import Base


class Framework(Base):
    __tablename__ = "frameworks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    categories = relationship("Category", back_populates="framework")
    projects = relationship("Project", back_populates="framework")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id"), nullable=False)
    code = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    max_points = Column(Float, nullable=False, default=0)

    framework = relationship("Framework", back_populates="categories")
    criteria = relationship("Criterion", back_populates="category")


class Criterion(Base):
    __tablename__ = "criteria"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    code = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    max_points = Column(Float, nullable=False, default=0)
    intent = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)

    category = relationship("Category", back_populates="criteria")
    criterion_scores = relationship("CriterionScore", back_populates="criterion")
    recommendations = relationship("Recommendation", back_populates="criterion")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    building_type = Column(String, nullable=True)
    gross_floor_area = Column(Float, nullable=True)
    owner_name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    framework = relationship("Framework", back_populates="projects")
    criterion_scores = relationship("CriterionScore", back_populates="project")
    assessment_results = relationship("AssessmentResult", back_populates="project")
    recommendations = relationship("Recommendation", back_populates="project")
    uploaded_documents = relationship("UploadedDocument", back_populates="project")
    text_chunks = relationship("TextChunk", back_populates="project")
    uda_assessments = relationship("UdaProjectAssessment", back_populates="project")
    uda_chunk_evidence = relationship(
        "UdaProjectChunkEvidence",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    uda_evidence_summaries = relationship(
        "UdaProjectCriterionEvidenceSummary",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    document_category = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    upload_status = Column(String, nullable=False, default="uploaded")
    processing_status = Column(String, nullable=False, default="not_processed")
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    extraction_status = Column(String, nullable=False, default="not_processed")
    extraction_method = Column(String, nullable=True)
    extracted_text_path = Column(String, nullable=True)
    extracted_char_count = Column(Integer, nullable=False, default=0)
    extraction_error = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="uploaded_documents")
    text_chunks = relationship(
        "TextChunk",
        back_populates="document",
        cascade="all, delete-orphan",
    )
    uda_chunk_evidence = relationship(
        "UdaProjectChunkEvidence",
        back_populates="document",
        cascade="all, delete-orphan",
    )


class TextChunk(Base):
    __tablename__ = "text_chunks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    document_id = Column(
        Integer,
        ForeignKey("uploaded_documents.id"),
        nullable=False,
        index=True,
    )
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_text = Column(Text, nullable=False)
    char_count = Column(Integer, nullable=False, default=0)
    token_estimate = Column(Integer, nullable=False, default=0)
    human_label = Column(String, nullable=True)
    evidence_type = Column(String, nullable=True)
    is_relevant = Column(Boolean, nullable=True)
    annotation_status = Column(String, nullable=False, default="unlabelled")
    annotation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    project = relationship("Project", back_populates="text_chunks")
    document = relationship("UploadedDocument", back_populates="text_chunks")
    uda_evidence = relationship(
        "UdaProjectChunkEvidence",
        back_populates="chunk",
        uselist=False,
        cascade="all, delete-orphan",
    )


class UdaProjectChunkEvidence(Base):
    __tablename__ = "uda_project_chunk_evidence"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    document_id = Column(
        Integer,
        ForeignKey("uploaded_documents.id"),
        nullable=False,
        index=True,
    )
    chunk_id = Column(
        Integer,
        ForeignKey("text_chunks.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    criterion_code = Column(String, nullable=True, index=True)
    chunk_text = Column(Text, nullable=False)
    source_page = Column(Integer, nullable=True)
    model_version = Column(String, nullable=False, default="distilbert_v1")
    model_label = Column(String, nullable=True, index=True)
    model_confidence = Column(Float, nullable=True)
    model_second_label = Column(String, nullable=True)
    model_second_confidence = Column(Float, nullable=True)
    model_margin = Column(Float, nullable=True)
    rule_label = Column(String, nullable=True, index=True)
    rule_confidence = Column(String, nullable=True)
    rule_reason = Column(Text, nullable=True)
    rule_runner_up = Column(String, nullable=True)
    rule_model_agreement = Column(Boolean, nullable=False, default=False)
    decision_status = Column(
        String,
        nullable=False,
        default="need_specialist_review",
        index=True,
    )
    decision_reason = Column(Text, nullable=True)
    reviewed_label = Column(String, nullable=True)
    reviewed_status = Column(String, nullable=False, default="unreviewed")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    project = relationship("Project", back_populates="uda_chunk_evidence")
    document = relationship("UploadedDocument", back_populates="uda_chunk_evidence")
    chunk = relationship("TextChunk", back_populates="uda_evidence")


class UdaProjectCriterionEvidenceSummary(Base):
    __tablename__ = "uda_project_criterion_evidence_summaries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    criterion_code = Column(String, nullable=False, index=True)
    proposed_input_metric = Column(String, nullable=True)
    proposed_input_value = Column(Float, nullable=True)
    input_unit = Column(String, nullable=True)
    extraction_method = Column(String, nullable=True)
    extraction_confidence = Column(String, nullable=True)
    source_evidence_id = Column(
        Integer,
        ForeignKey("uda_project_chunk_evidence.id"),
        nullable=True,
    )
    evidence_count = Column(Integer, nullable=False, default=0)
    source_document_id = Column(
        Integer,
        ForeignKey("uploaded_documents.id"),
        nullable=True,
    )
    source_page = Column(Integer, nullable=True)
    matched_text = Column(Text, nullable=True)
    proposed_score = Column(Float, nullable=True)
    proposed_rule_id = Column(Integer, ForeignKey("uda_scoring_rules.id"), nullable=True)
    scoring_status = Column(String, nullable=False, default="need_specialist_review")
    scoring_explanation = Column(Text, nullable=True)
    specialist_value = Column(Float, nullable=True)
    specialist_score = Column(Float, nullable=True)
    reviewed_status = Column(String, nullable=False, default="unreviewed")
    conflict_detected = Column(Boolean, nullable=False, default=False)
    conflict_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    project = relationship("Project", back_populates="uda_evidence_summaries")
    source_evidence = relationship("UdaProjectChunkEvidence")
    source_document = relationship("UploadedDocument")
    proposed_rule = relationship("UdaScoringRule")


class UdaCriterion(Base):
    __tablename__ = "uda_criteria"

    id = Column(Integer, primary_key=True, index=True)
    framework = Column(String, nullable=False, default="UDA_BLUE_GREEN", index=True)
    category_code = Column(String, nullable=False, index=True)
    category_name = Column(String, nullable=False)
    criterion_code = Column(String, nullable=False, unique=True, index=True)
    criterion_name = Column(String, nullable=False)
    objective = Column(Text, nullable=True)
    methodology = Column(Text, nullable=True)
    maximum_marks = Column(Float, nullable=False, default=0)
    source_page = Column(Integer, nullable=True)
    scoring_status = Column(String, nullable=False, default="requires_review")
    automation_type = Column(String, nullable=False, default="manual_review")
    notes = Column(Text, nullable=True)

    scoring_rules = relationship(
        "UdaScoringRule",
        back_populates="criterion",
        cascade="all, delete-orphan",
    )
    required_documents = relationship(
        "UdaRequiredDocument",
        back_populates="criterion",
        cascade="all, delete-orphan",
    )
    project_assessments = relationship(
        "UdaProjectAssessment",
        back_populates="criterion",
    )
    recommendation_rules = relationship(
        "UdaRecommendationKnowledge",
        back_populates="criterion",
        cascade="all, delete-orphan",
    )


class UdaScoringRule(Base):
    __tablename__ = "uda_scoring_rules"

    id = Column(Integer, primary_key=True, index=True)
    criterion_id = Column(Integer, ForeignKey("uda_criteria.id"), nullable=False)
    rule_order = Column(Integer, nullable=False)
    condition_text = Column(Text, nullable=False)
    marks = Column(Float, nullable=True)
    operator = Column(String, nullable=True)
    threshold_value = Column(Float, nullable=True)
    threshold_unit = Column(String, nullable=True)
    machine_rule_json = Column(Text, nullable=True)
    requires_manual_review = Column(Boolean, nullable=False, default=True)

    criterion = relationship("UdaCriterion", back_populates="scoring_rules")
    project_assessments = relationship(
        "UdaProjectAssessment",
        back_populates="selected_rule",
    )


class UdaRequiredDocument(Base):
    __tablename__ = "uda_required_documents"

    id = Column(Integer, primary_key=True, index=True)
    criterion_id = Column(Integer, ForeignKey("uda_criteria.id"), nullable=False)
    assessment_stage = Column(String, nullable=False)
    requirement_order = Column(Integer, nullable=False)
    requirement_text = Column(Text, nullable=False)

    criterion = relationship("UdaCriterion", back_populates="required_documents")


class UdaProjectAssessment(Base):
    __tablename__ = "uda_project_assessments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    criterion_id = Column(Integer, ForeignKey("uda_criteria.id"), nullable=False)
    assessment_stage = Column(String, nullable=False, default="DA")
    assessment_status = Column(String, nullable=False, default="not_assessed")
    scoring_mode = Column(String, nullable=False, default="not_machine_assessable")
    awarded_marks = Column(Float, nullable=False, default=0)
    maximum_marks = Column(Float, nullable=False, default=0)
    evidence_value = Column(Float, nullable=True)
    evidence_unit = Column(String, nullable=True)
    evidence_boolean = Column(Boolean, nullable=True)
    selected_rule_id = Column(Integer, ForeignKey("uda_scoring_rules.id"), nullable=True)
    evidence_summary_id = Column(
        Integer,
        ForeignKey("uda_project_criterion_evidence_summaries.id"),
        nullable=True,
    )
    score_source = Column(String, nullable=False, default="manual")
    manual_marks = Column(Float, nullable=True)
    assessor_notes = Column(Text, nullable=True)
    requires_manual_review = Column(Boolean, nullable=False, default=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    project = relationship("Project", back_populates="uda_assessments")
    criterion = relationship("UdaCriterion", back_populates="project_assessments")
    selected_rule = relationship("UdaScoringRule", back_populates="project_assessments")
    evidence_summary = relationship("UdaProjectCriterionEvidenceSummary")


class UdaRecommendationKnowledge(Base):
    __tablename__ = "uda_recommendation_knowledge"

    id = Column(Integer, primary_key=True, index=True)
    criterion_id = Column(Integer, ForeignKey("uda_criteria.id"), nullable=False)
    recommendation_text = Column(Text, nullable=False)
    recommendation_type = Column(String, nullable=False)
    potential_marks_gain = Column(Float, nullable=False, default=0)
    cost_level = Column(String, nullable=False, default="unknown")
    implementation_difficulty = Column(String, nullable=False, default="unknown")
    required_documents = Column(Text, nullable=True)
    source_basis = Column(Text, nullable=True)
    requires_manual_review = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)

    criterion = relationship("UdaCriterion", back_populates="recommendation_rules")


class DatasetSourceDocument(Base):
    __tablename__ = "dataset_source_documents"

    id = Column(Integer, primary_key=True, index=True)
    source_path = Column(String, nullable=False, unique=True, index=True)
    filename = Column(String, nullable=False)
    source_folder = Column(String, nullable=False, index=True)
    file_hash = Column(String, nullable=False, index=True)
    extraction_status = Column(String, nullable=False, default="not_processed")
    extraction_method = Column(String, nullable=True)
    extracted_text_path = Column(String, nullable=True)
    extracted_char_count = Column(Integer, nullable=False, default=0)
    page_count = Column(Integer, nullable=False, default=0)
    extraction_error = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    chunks = relationship(
        "DatasetSourceChunk",
        back_populates="source_document",
        cascade="all, delete-orphan",
    )


class DatasetSourceChunk(Base):
    __tablename__ = "dataset_source_chunks"

    id = Column(Integer, primary_key=True, index=True)
    source_document_id = Column(
        Integer,
        ForeignKey("dataset_source_documents.id"),
        nullable=False,
        index=True,
    )
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_text = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False, default=0)
    token_estimate = Column(Integer, nullable=False, default=0)
    source_folder = Column(String, nullable=False, index=True)
    suggested_label = Column(String, nullable=True, index=True)
    suggestion_confidence = Column(String, nullable=True)
    suggestion_reason = Column(Text, nullable=True)
    suggestion_score = Column(Float, nullable=True)
    suggestion_candidates_json = Column(Text, nullable=True)
    provisional_label = Column(String, nullable=True, index=True)
    provisional_confidence = Column(String, nullable=True)
    provisional_reason = Column(Text, nullable=True)
    label_source = Column(String, nullable=True)
    verification_status = Column(String, nullable=True, index=True)
    specialist_review_reason = Column(Text, nullable=True)
    human_label = Column(String, nullable=True)
    is_relevant = Column(Boolean, nullable=True)
    annotation_status = Column(String, nullable=False, default="unlabelled")
    annotation_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    source_document = relationship("DatasetSourceDocument", back_populates="chunks")


class CriterionScore(Base):
    __tablename__ = "criterion_scores"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    criterion_id = Column(Integer, ForeignKey("criteria.id"), nullable=False)
    attempted_points = Column(Float, nullable=False, default=0)
    awarded_points = Column(Float, nullable=False, default=0)
    achieved_value = Column(Float, nullable=True)
    evidence_provided = Column(Boolean, nullable=False, default=False)
    status = Column(String, nullable=False, default="not_assessed")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    project = relationship("Project", back_populates="criterion_scores")
    criterion = relationship("Criterion", back_populates="criterion_scores")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    total_possible_points = Column(Float, nullable=False, default=0)
    total_attempted_points = Column(Float, nullable=False, default=0)
    total_awarded_points = Column(Float, nullable=False, default=0)
    certification_level = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    assessed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="assessment_results")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    criterion_id = Column(Integer, ForeignKey("criteria.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False, default="medium")
    estimated_points_gain = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="recommendations")
    criterion = relationship("Criterion", back_populates="recommendations")
