from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class FrameworkBase(BaseModel):
    name: str
    version: str
    description: Optional[str] = None


class FrameworkCreate(FrameworkBase):
    pass


class Framework(FrameworkBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    framework_id: int
    code: str
    name: str
    description: Optional[str] = None
    max_points: float = 0


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class CriterionBase(BaseModel):
    category_id: int
    code: str
    title: str
    description: Optional[str] = None
    max_points: float = 0
    intent: Optional[str] = None
    requirements: Optional[str] = None


class CriterionCreate(CriterionBase):
    pass


class Criterion(CriterionBase):
    id: int

    class Config:
        from_attributes = True


class CategoryWithCriteria(Category):
    criteria: List[Criterion] = Field(default_factory=list)


class CategoryScore(BaseModel):
    category: str
    achieved_points: float
    max_points: float


class ScoreGap(BaseModel):
    criterion_code: str
    criterion_name: str
    status: str
    lost_points: float
    recommendation_template: Optional[str] = None


class MissingEvidenceItem(BaseModel):
    criterion_code: str
    criterion_name: str
    status: str


class ProjectScore(BaseModel):
    project_id: int
    project_name: str
    total_score: float
    max_possible_score: float
    certification_level: str
    next_level: Optional[str] = None
    points_needed: float
    prerequisite_status: str
    category_scores: List[CategoryScore]
    gaps: List[ScoreGap]
    missing_evidence: List[MissingEvidenceItem]


class CriticalRecommendation(BaseModel):
    criterion_code: str
    criterion_name: str
    reason: str
    recommendation: Optional[str] = None


class ScoreImprovementRecommendation(BaseModel):
    criterion_code: str
    criterion_name: str
    current_points: float
    max_points: float
    possible_points_gain: float
    recommendation: Optional[str] = None


class ProjectRecommendations(BaseModel):
    project_id: int
    project_name: str
    current_score: float
    certification_level: str
    next_level: Optional[str] = None
    points_needed: float
    critical_recommendations: List[CriticalRecommendation]
    score_improvement_recommendations: List[ScoreImprovementRecommendation]


class ProjectBase(BaseModel):
    project_name: str
    building_type: Optional[str] = None
    location: Optional[str] = None
    gross_floor_area: Optional[float] = None
    owner_name: Optional[str] = None
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    framework_id: int
    created_at: datetime
    updated_at: datetime


class UploadedDocument(BaseModel):
    id: int
    project_id: int
    original_filename: str
    stored_filename: str
    document_category: str
    file_type: str
    storage_path: str
    upload_status: str
    processing_status: str
    uploaded_at: datetime
    extraction_status: str = "not_processed"
    extraction_method: Optional[str] = None
    extracted_text_path: Optional[str] = None
    extracted_char_count: int = 0
    extraction_error: Optional[str] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentExtractionSummary(BaseModel):
    document: UploadedDocument
    extraction_status: str
    extraction_method: Optional[str] = None
    extracted_char_count: int = 0
    processed_at: Optional[datetime] = None
    text_preview: Optional[str] = None
    extraction_error: Optional[str] = None


class DocumentTextResponse(BaseModel):
    document_id: int
    project_id: int
    extracted_text: str


class TextChunk(BaseModel):
    id: int
    project_id: int
    document_id: int
    document_name: Optional[str] = None
    document_category: Optional[str] = None
    chunk_index: int
    page_number: Optional[int] = None
    chunk_text: str
    char_count: int
    token_estimate: int
    human_label: Optional[str] = None
    evidence_type: Optional[str] = None
    is_relevant: Optional[bool] = None
    annotation_status: str
    annotation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TextChunkUpdate(BaseModel):
    human_label: Optional[str] = None
    evidence_type: Optional[str] = None
    is_relevant: Optional[bool] = None
    annotation_status: Optional[Literal[
        "unlabelled",
        "labelled",
        "review_required",
    ]] = None
    annotation_notes: Optional[str] = None


class TextChunkGenerationSummary(BaseModel):
    project_id: int
    document_id: int
    document_name: str
    chunk_count: int
    created_count: int
    already_exists: bool


class DocumentPreparationItem(BaseModel):
    document_id: int
    document_name: str
    extraction_status: str
    extraction_method: Optional[str] = None
    extracted_char_count: int = 0
    chunk_count: int = 0
    created_chunks: int = 0
    already_had_chunks: bool = False
    error: Optional[str] = None


class UdaScoringRule(BaseModel):
    id: int
    criterion_id: int
    rule_order: int
    condition_text: str
    marks: Optional[float] = None
    operator: Optional[str] = None
    threshold_value: Optional[float] = None
    threshold_unit: Optional[str] = None
    machine_rule_json: Optional[str] = None
    requires_manual_review: bool

    class Config:
        from_attributes = True


class UdaRequiredDocument(BaseModel):
    id: int
    criterion_id: int
    assessment_stage: Literal["DA", "CVA"]
    requirement_order: int
    requirement_text: str

    class Config:
        from_attributes = True


class UdaCriterionBase(BaseModel):
    id: int
    framework: str
    category_code: str
    category_name: str
    criterion_code: str
    criterion_name: str
    objective: Optional[str] = None
    methodology: Optional[str] = None
    maximum_marks: float
    source_page: Optional[int] = None
    scoring_status: Literal["defined", "partially_defined", "requires_review"]
    automation_type: Literal[
        "numeric_threshold",
        "boolean",
        "checklist",
        "mixed",
        "manual_review",
    ]
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class UdaCriterionSummary(UdaCriterionBase):
    pass


class UdaCriterionDetail(UdaCriterionBase):
    scoring_rules: List[UdaScoringRule] = Field(default_factory=list)
    da_required_documents: List[UdaRequiredDocument] = Field(default_factory=list)
    cva_required_documents: List[UdaRequiredDocument] = Field(default_factory=list)


class UdaCategoryWithCriteria(BaseModel):
    category_code: str
    category_name: str
    criteria: List[UdaCriterionSummary] = Field(default_factory=list)


class UdaEvidenceInput(BaseModel):
    metric: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    values: Optional[Dict[str, float]] = None
    evidence_boolean: Optional[bool] = None
    assessor_notes: Optional[str] = None


class UdaAssessmentUpdate(BaseModel):
    assessment_status: Optional[Literal[
        "not_assessed",
        "achieved",
        "partially_achieved",
        "not_achieved",
        "insufficient_evidence",
        "manual_review_required",
    ]] = None
    manual_marks: Optional[float] = None
    evidence_value: Optional[float] = None
    evidence_unit: Optional[str] = None
    evidence_boolean: Optional[bool] = None
    assessor_notes: Optional[str] = None


class UdaProjectAssessment(BaseModel):
    id: Optional[int] = None
    project_id: int
    criterion_id: int
    criterion_code: str
    criterion_name: str
    category_code: str
    category_name: str
    assessment_stage: str = "DA"
    assessment_status: str
    scoring_mode: str
    awarded_marks: float
    maximum_marks: float
    evidence_value: Optional[float] = None
    evidence_unit: Optional[str] = None
    evidence_boolean: Optional[bool] = None
    selected_rule_id: Optional[int] = None
    selected_rule_text: Optional[str] = None
    evidence_summary_id: Optional[int] = None
    score_source: str = "manual"
    manual_marks: Optional[float] = None
    assessor_notes: Optional[str] = None
    requires_manual_review: bool
    explanation: Optional[str] = None
    scoring_status: str
    automation_type: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UdaEvaluationResult(BaseModel):
    criterion_code: str
    awarded_marks: float
    maximum_marks: float
    matched_rule: Optional[UdaScoringRule] = None
    scoring_mode: str
    assessment_status: str
    requires_manual_review: bool
    explanation: str
    assessment: UdaProjectAssessment


class UdaCategoryScore(BaseModel):
    category_code: str
    category_name: str
    awarded_marks: float
    maximum_marks: float
    assessed_count: int
    total_criteria: int
    manual_review_required_count: int


class UdaProjectScoreSummary(BaseModel):
    project_id: int
    project_name: str
    assessment_stage: str
    label: str
    official_certification_notice: str
    total_awarded_marks: float
    total_configured_max_marks: float
    automatically_assessed_marks: float
    manually_assessed_marks: float
    number_assessed: int
    number_not_assessed: int
    number_manual_review_required: int
    current_preassessment_level: str
    next_preassessment_level: Optional[str] = None
    next_level_threshold: Optional[float] = None
    marks_to_next_level: float
    highest_level_reached: bool
    category_breakdown: List[UdaCategoryScore]


class UdaRecommendationItem(BaseModel):
    criterion_id: int
    criterion_code: str
    criterion_name: str
    category_code: str
    category_name: str
    current_marks: float
    current_score: Optional[float] = None
    potential_marks: float
    maximum_marks: float
    potential_marks_gain: float
    max_score: Optional[float] = None
    next_score: Optional[float] = None
    maximum_gain: Optional[float] = None
    current_status: Optional[str] = None
    score_source: Optional[str] = None
    recommendation: str
    recommendation_text: Optional[str] = None
    recommendation_type: str
    cost_level: Literal[
        "very_low",
        "low",
        "medium",
        "high",
        "very_high",
        "unknown",
    ]
    implementation_difficulty: Literal[
        "easy",
        "moderate",
        "difficult",
        "unknown",
    ]
    required_documents: List[str] = Field(default_factory=list)
    reason: str
    source_basis: Optional[str] = None
    matched_rule_id: Optional[int] = None
    matched_rule_text: Optional[str] = None
    requires_manual_review: bool
    specialist_review_required: Optional[bool] = None
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    evidence_summary: Optional[str] = None
    notes: Optional[str] = None


class UdaRecommendationsResponse(BaseModel):
    project_id: int
    project_name: str
    current_score: float
    current_proposed_score: Optional[float] = None
    reviewed_confirmed_score: Optional[float] = None
    current_preassessment_level: Optional[str] = None
    next_preassessment_level: Optional[str] = None
    next_level_threshold: Optional[float] = None
    marks_to_next_level: Optional[float] = None
    highest_level_reached: Optional[bool] = None
    mode: Literal["low_cost", "maximum_score", "target_score"]
    target_score: Optional[float] = None
    target_preassessment_level: Optional[str] = None
    target_gap: Optional[float] = None
    target_reachable: Optional[bool] = None
    potential_score: float
    potential_preassessment_level: Optional[str] = None
    potential_next_preassessment_level: Optional[str] = None
    potential_marks_to_next_level: Optional[float] = None
    total_potential_gain: float
    total_configured_max_marks: float
    recommendations_count: Optional[int] = None
    need_specialist_review_count: Optional[int] = None
    official_certification_notice: str
    recommendations: List[UdaRecommendationItem]


class UdaProjectEvidenceItem(BaseModel):
    id: int
    project_id: int
    document_id: int
    document_name: Optional[str] = None
    chunk_id: int
    criterion_code: Optional[str] = None
    chunk_text: str
    source_page: Optional[int] = None
    model_version: str
    model_label: Optional[str] = None
    model_confidence: Optional[float] = None
    model_second_label: Optional[str] = None
    model_second_confidence: Optional[float] = None
    model_margin: Optional[float] = None
    rule_label: Optional[str] = None
    rule_confidence: Optional[str] = None
    rule_reason: Optional[str] = None
    rule_runner_up: Optional[str] = None
    rule_model_agreement: bool
    decision_status: Literal[
        "candidate_evidence",
        "need_specialist_review",
        "other",
    ]
    decision_reason: Optional[str] = None
    reviewed_label: Optional[str] = None
    reviewed_status: Literal[
        "unreviewed",
        "confirmed",
        "corrected",
        "excluded",
    ]
    created_at: datetime
    updated_at: datetime


class UdaCriterionEvidenceGroup(BaseModel):
    criterion_code: str
    criterion_name: str
    category_code: Optional[str] = None
    category_name: Optional[str] = None
    evidence_count: int
    candidate_evidence: int
    need_specialist_review: int
    other: int
    evidence: List[UdaProjectEvidenceItem] = Field(default_factory=list)


class UdaProjectAnalysisSummary(BaseModel):
    project_id: int
    project_name: str
    total_chunks: int
    analyzed_chunks: int
    skipped_chunks: int
    candidate_evidence: int
    need_specialist_review: int
    other: int
    criteria_detected: int
    documents_analyzed: int
    model_version: str
    device: str
    cuda_available: bool
    gpu: Optional[str] = None
    note: str
    grouped_by_criterion: List[UdaCriterionEvidenceGroup] = Field(default_factory=list)


class UdaCriterionEvidenceResponse(UdaCriterionEvidenceGroup):
    project_id: int


class ProjectUdaAnalysisPreparationSummary(BaseModel):
    project_id: int
    project_name: str
    documents_found: int
    documents_processed: int
    documents_failed: int
    chunks_created: int
    total_chunks: int
    document_results: List[DocumentPreparationItem]
    analysis: UdaProjectAnalysisSummary
    evidence_scoring: Optional["UdaEvidenceScoringSummary"] = None
    scoring_warning: Optional[str] = None


class UdaEvidenceReviewUpdate(BaseModel):
    reviewed_status: Literal[
        "unreviewed",
        "confirmed",
        "corrected",
        "excluded",
    ]
    reviewed_label: Optional[str] = None


class UdaEvidenceScoringItem(BaseModel):
    id: int
    project_id: int
    criterion_code: str
    criterion_name: str
    category_code: Optional[str] = None
    category_name: Optional[str] = None
    maximum_marks: Optional[float] = None
    evidence_count: int
    proposed_input_metric: Optional[str] = None
    proposed_input_value: Optional[float] = None
    input_unit: Optional[str] = None
    extraction_method: Optional[str] = None
    extraction_confidence: Optional[str] = None
    source_evidence_id: Optional[int] = None
    source_document_id: Optional[int] = None
    source_document_name: Optional[str] = None
    source_page: Optional[int] = None
    matched_text: Optional[str] = None
    proposed_score: Optional[float] = None
    proposed_rule_id: Optional[int] = None
    proposed_rule_text: Optional[str] = None
    scoring_status: Literal[
        "ready_for_scoring",
        "need_specialist_review",
        "insufficient_evidence",
        "manual_criterion",
        "scored",
    ]
    scoring_explanation: Optional[str] = None
    specialist_value: Optional[float] = None
    specialist_score: Optional[float] = None
    reviewed_status: str
    conflict_detected: bool
    conflict_notes: Optional[str] = None
    specialist_review_recommended: bool = False
    created_at: datetime
    updated_at: datetime


class UdaEvidenceScoringSummary(BaseModel):
    project_id: int
    project_name: str
    summary_count: int
    scored_count: int
    need_specialist_review_count: int
    insufficient_evidence_count: int
    manual_criterion_count: int
    official_certification_notice: str
    criteria: List[UdaEvidenceScoringItem] = Field(default_factory=list)


class UdaEvidenceScoringReviewUpdate(BaseModel):
    reviewed_status: Literal[
        "unreviewed",
        "confirmed",
        "corrected",
        "insufficient_evidence",
        "manual_assessment_required",
    ]
    specialist_value: Optional[float] = None
    input_unit: Optional[str] = None


class DatasetSourceChunkItem(BaseModel):
    id: int
    source_document_id: int
    filename: str
    source_path: str
    source_folder: str
    chunk_index: int
    page_number: Optional[int] = None
    chunk_text: str
    word_count: int
    token_estimate: int
    suggested_label: Optional[str] = None
    suggestion_confidence: Optional[str] = None
    suggestion_reason: Optional[str] = None
    suggestion_score: Optional[float] = None
    suggestion_candidates_json: Optional[str] = None
    provisional_label: Optional[str] = None
    provisional_confidence: Optional[str] = None
    provisional_reason: Optional[str] = None
    label_source: Optional[str] = None
    verification_status: Optional[str] = None
    specialist_review_reason: Optional[str] = None
    human_label: Optional[str] = None
    is_relevant: Optional[bool] = None
    annotation_status: Literal[
        "unlabelled",
        "suggested",
        "labelled",
        "review_required",
    ]
    annotation_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DatasetChunkListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    chunks: List[DatasetSourceChunkItem]


class DatasetCriterionReference(BaseModel):
    criterion_code: str
    criterion_name: str
    objective: Optional[str] = None
    methodology: Optional[str] = None
    maximum_marks: float
    da_required_documents: List[str] = Field(default_factory=list)


class DatasetChunkDetail(DatasetSourceChunkItem):
    suggested_criterion: Optional[DatasetCriterionReference] = None


class DatasetAnnotationUpdate(BaseModel):
    human_label: Optional[str] = None
    is_relevant: Optional[bool] = None
    annotation_status: Literal[
        "unlabelled",
        "suggested",
        "labelled",
        "review_required",
    ]
    annotation_notes: Optional[str] = None


class DatasetSuggestionResult(BaseModel):
    chunk_id: int
    suggested_label: Optional[str] = None
    suggestion_confidence: Optional[str] = None
    suggestion_reason: Optional[str] = None
    suggestion_score: Optional[float] = None
    suggestion_candidates_json: Optional[str] = None
    annotation_status: str


class DatasetBulkSuggestionSummary(BaseModel):
    chunks_scanned: int
    suggestions_generated: int
    no_suggestion_count: int
    low_confidence_count: int
    confidence_distribution: Dict[str, int]
    suggested_label_distribution: Dict[str, int]


class DatasetProvisionalClassDistributionItem(BaseModel):
    label: str
    provisional_count: int
    verified_count: int
    training_candidate_count: int


class DatasetProvisionalSummary(BaseModel):
    chunks_scanned: int
    provisional_uda_labels: int
    provisional_other: int
    verified: int
    need_specialist_review: int
    excluded: int
    preserved_human_labels: int
    training_candidates: int
    other_count: int
    audit_csv_path: str
    training_candidates_csv_path: str
    class_distribution: List[DatasetProvisionalClassDistributionItem]


class DatasetLabelDistributionItem(BaseModel):
    label: str
    count: int
    balance_status: str


class DatasetStatistics(BaseModel):
    total_chunks: int
    labelled: int
    unlabelled: int
    suggested: int
    review_required: int
    other_count: int
    training_candidates: int = 0
    provisional: int = 0
    verified: int = 0
    need_specialist_review: int = 0
    excluded: int = 0
    progress_percentage: float
    source_folders: List[str]
    filenames: List[str]
    suggested_labels: List[str]
    human_labels: List[str]
    provisional_labels: List[str] = Field(default_factory=list)
    label_sources: List[str] = Field(default_factory=list)
    verification_statuses: List[str] = Field(default_factory=list)
    label_distribution: List[DatasetLabelDistributionItem]
    provisional_distribution: List[DatasetProvisionalClassDistributionItem] = Field(
        default_factory=list
    )
    note: str


class CriterionAssessmentCreate(BaseModel):
    status: Literal[
        "achieved",
        "partially_achieved",
        "not_achieved",
        "missing_evidence",
    ]
    achieved_value: Optional[float] = None
    achieved_points: Optional[float] = None
    evidence_provided: bool = False
    notes: Optional[str] = None


class CriterionAssessment(BaseModel):
    id: int
    project_id: int
    criterion_id: int
    criterion_code: str
    criterion_name: str
    status: str
    achieved_value: Optional[float] = None
    achieved_points: Optional[float] = None
    evidence_provided: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CriterionScoreBase(BaseModel):
    project_id: int
    criterion_id: int
    attempted_points: float = 0
    awarded_points: float = 0
    status: str = "not_assessed"
    notes: Optional[str] = None


class CriterionScoreCreate(CriterionScoreBase):
    pass


class CriterionScore(CriterionScoreBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssessmentResultBase(BaseModel):
    project_id: int
    total_possible_points: float = 0
    total_attempted_points: float = 0
    total_awarded_points: float = 0
    certification_level: Optional[str] = None
    summary: Optional[str] = None


class AssessmentResultCreate(AssessmentResultBase):
    pass


class AssessmentResult(AssessmentResultBase):
    id: int
    assessed_at: datetime

    class Config:
        from_attributes = True


class RecommendationBase(BaseModel):
    project_id: int
    criterion_id: Optional[int] = None
    title: str
    description: str
    priority: str = "medium"
    estimated_points_gain: Optional[float] = None


class RecommendationCreate(RecommendationBase):
    pass


class Recommendation(RecommendationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
