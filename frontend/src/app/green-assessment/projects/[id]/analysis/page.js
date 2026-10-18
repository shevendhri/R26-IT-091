"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

const statusLabels = {
  candidate_evidence: "Candidate Evidence",
  need_specialist_review: "Need Review From Specialist",
  other: "Other",
};

const noDocumentsMessage =
  "Please upload at least one project document before running UDA analysis.";

function friendlyWorkflowMessage(message) {
  if (!message) {
    return "Could not complete UDA analysis. Please try again.";
  }
  if (message.includes("Upload at least one project document")) {
    return noDocumentsMessage;
  }
  if (message.includes("No project chunks found")) {
    return "Documents are not ready for UDA analysis yet. Please return to Documents and try again.";
  }
  if (message.includes("No UDA evidence analysis records found")) {
    return "UDA analysis is not ready yet. Please run UDA document analysis first.";
  }
  return message;
}

async function fetchWorkflowResult(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return { ok: true, data };
    }
    return {
      ok: false,
      status: response.status,
      message: friendlyWorkflowMessage(data.detail || `Request failed with status ${response.status}`),
      data,
    };
  } catch (requestError) {
    console.error("uda workflow network error", requestError);
    return {
      ok: false,
      status: 0,
      message:
        "Could not connect to the backend service. Please check that the API is running and try again.",
      data: null,
    };
  }
}

export default function ProjectUdaAnalysisPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [evidenceScoring, setEvidenceScoring] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [corrections, setCorrections] = useState({});
  const [valueDrafts, setValueDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [savingEvidenceId, setSavingEvidenceId] = useState(null);
  const [savingCriterionCode, setSavingCriterionCode] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [projectResult, analysisResult, scoringResult, criteriaResult] =
        await Promise.all([
          fetchWorkflowResult(`/projects/${id}`),
          fetchWorkflowResult(`/projects/${id}/uda-analysis`),
          fetchWorkflowResult(`/projects/${id}/uda-scoring-from-evidence`),
          fetchWorkflowResult("/uda/criteria"),
        ]);

      if (!projectResult.ok) {
        setError(projectResult.message);
        return;
      }
      if (!criteriaResult.ok) {
        setError(criteriaResult.message);
        return;
      }

      setProject(projectResult.data);
      setCriteria(criteriaResult.data);

      if (analysisResult.ok) {
        console.log("uda analysis response", analysisResult.data);
        setAnalysis(analysisResult.data);
      } else {
        setAnalysis(null);
        setError(analysisResult.message);
      }

      if (scoringResult.ok) {
        console.log("uda evidence scoring response", scoringResult.data);
        setEvidenceScoring(scoringResult.data);
        setValueDrafts(
          Object.fromEntries(
            (scoringResult.data.criteria || []).map((item) => [
              item.criterion_code,
              item.specialist_value ?? item.proposed_input_value ?? "",
            ]),
          ),
        );
      } else {
        setEvidenceScoring(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  async function handleRunAnalysis() {
    setIsRunning(true);
    setError("");
    setSuccessMessage("");

    const result = await fetchWorkflowResult(`/projects/${id}/prepare-uda-analysis`, {
      method: "POST",
    });

    if (!result.ok) {
      setError(result.message);
      setIsRunning(false);
      return;
    }

    console.log("uda analysis refresh", result.data);
    await loadAnalysis();
    setSuccessMessage(
      result.data.scoring_warning ||
        "UDA document analysis and proposed scoring were refreshed.",
    );
    setIsRunning(false);
  }

  async function handleScoringReview(item, reviewedStatus) {
    try {
      setSavingCriterionCode(item.criterion_code);
      setError("");
      setSuccessMessage("");

      const rawValue = valueDrafts[item.criterion_code];
      const payload = {
        reviewed_status: reviewedStatus,
        specialist_value:
          rawValue === "" || rawValue === null || rawValue === undefined
            ? null
            : Number(rawValue),
        input_unit: item.input_unit || "%",
      };

      const response = await fetch(
        `${API_BASE_URL}/projects/${id}/uda-scoring-from-evidence/${item.criterion_code}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      console.log("uda scoring value review", data);

      if (!response.ok) {
        setError(friendlyWorkflowMessage(data.detail || "Could not save scoring value review."));
        return;
      }

      setEvidenceScoring(data);
      setSuccessMessage("Scoring value review saved.");
    } catch (reviewError) {
      console.error("uda scoring value review error", reviewError);
      setError(reviewError.message || "Could not save scoring value review.");
    } finally {
      setSavingCriterionCode(null);
    }
  }

  function handleValueDraftChange(criterionCode, value) {
    setValueDrafts((current) => ({ ...current, [criterionCode]: value }));
  }

  function handleCorrectionChange(evidenceId, value) {
    setCorrections((current) => ({ ...current, [evidenceId]: value }));
  }

  async function handleReview(evidence, reviewedStatus, reviewedLabel = null) {
    try {
      setSavingEvidenceId(evidence.id);
      setError("");
      setSuccessMessage("");

      const payload = {
        reviewed_status: reviewedStatus,
        reviewed_label: reviewedLabel,
      };
      const response = await fetch(
        `${API_BASE_URL}/projects/${id}/uda-analysis/evidence/${evidence.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      console.log("uda evidence review", data);

      if (!response.ok) {
        setError(friendlyWorkflowMessage(data.detail || "Could not save evidence review."));
        return;
      }

      setSuccessMessage("Evidence review saved.");
      await loadAnalysis();
    } catch (reviewError) {
      console.error("uda evidence review error", reviewError);
      setError(reviewError.message || "Could not save evidence review.");
    } finally {
      setSavingEvidenceId(null);
    }
  }

  function suggestedLabel(evidence) {
    return evidence.criterion_code || evidence.rule_label || evidence.model_label;
  }

  const groups = analysis?.grouped_by_criterion || [];
  const criteriaOptions = criteria.map((criterion) => ({
    code: criterion.criterion_code,
    name: criterion.criterion_name,
  }));
  const showDocumentsAction =
    error === noDocumentsMessage || error.includes("Documents are not ready");

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href={`/green-assessment/projects/${id}`}>
          Back to Project Details
        </Link>
        <p className="eyebrow">UDA Evidence Identification</p>
        <h1>UDA Document Analysis</h1>
        <p className="lede">
          AI-assisted identification of UDA criterion evidence from uploaded
          project documents.
        </p>
        <div className="notice">
          AI-assisted evidence classification is intended for design-stage
          pre-assessment. Results should be reviewed where specialist
          verification is indicated.
        </div>
        <div className="actions">
          <button
            className="button"
            disabled={isRunning}
            onClick={handleRunAnalysis}
            type="button"
          >
            {isRunning ? "Refreshing Analysis..." : "Refresh UDA Analysis"}
          </button>
          <Link className="button" href={`/green-assessment/projects/${id}/documents`}>
            View Documents
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/assessment`}>
            View Manual Assessment
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/score`}>
            View Score Summary
          </Link>
        </div>
      </header>

      {isLoading ? <div className="notice">Loading UDA analysis...</div> : null}
      {error ? (
        <div className="notice error">
          <p>{error}</p>
          {showDocumentsAction ? (
            <Link className="button" href={`/green-assessment/projects/${id}/documents`}>
              Go to Documents
            </Link>
          ) : null}
        </div>
      ) : null}
      {successMessage ? <div className="notice success">{successMessage}</div> : null}

      {!isLoading && project ? (
        <section className="project-card details-card">
          <p className="project-id">Project ID: {project.id}</p>
          <h2>{project.project_name}</h2>
        </section>
      ) : null}

      {!isLoading && analysis ? (
        <>
          <section className="score-summary-grid">
            <div className="score-card">
              <span>Documents Analysed</span>
              <strong>{analysis.documents_analyzed}</strong>
            </div>
            <div className="score-card">
              <span>Chunks Analysed</span>
              <strong>{analysis.analyzed_chunks}</strong>
            </div>
            <div className="score-card">
              <span>Candidate Evidence</span>
              <strong>{analysis.candidate_evidence}</strong>
            </div>
            <div className="score-card">
              <span>Need Review From Specialist</span>
              <strong>{analysis.need_specialist_review}</strong>
            </div>
            <div className="score-card">
              <span>Other</span>
              <strong>{analysis.other}</strong>
            </div>
            <div className="score-card">
              <span>Criteria Detected</span>
              <strong>{analysis.criteria_detected}</strong>
            </div>
            <div className="score-card">
              <span>Model Version</span>
              <strong>{analysis.model_version}</strong>
            </div>
            <div className="score-card">
              <span>Inference Device</span>
              <strong>{analysis.gpu || analysis.device}</strong>
            </div>
          </section>

          <section className="score-section">
            <h2>Detected Evidence by UDA Criterion</h2>
            {groups.length === 0 ? (
              <div className="empty">
                No UDA evidence records found yet. Upload project documents,
                then use View UDA Document Analysis from the Documents page.
              </div>
            ) : (
              <div className="category-list">
                {groups.map((group) => (
                  <details className="category-card" key={group.criterion_code}>
                    <summary className="category-heading">
                      <div>
                        <p className="criterion-code">
                          {group.category_code} | {group.criterion_code}
                        </p>
                        <h2>
                          {group.criterion_code} — {group.criterion_name}
                        </h2>
                      </div>
                      <span>{group.evidence_count} chunks</span>
                    </summary>
                    <div className="criterion-facts">
                      <span>Candidate Evidence: {group.candidate_evidence}</span>
                      <span>
                        Need Review From Specialist: {group.need_specialist_review}
                      </span>
                      <span>Other: {group.other}</span>
                    </div>
                    <div className="chunk-list">
                      {group.evidence.map((evidence) => (
                        <article className="chunk-card" key={evidence.id}>
                          <div className="chunk-meta">
                            <span>{statusLabels[evidence.decision_status]}</span>
                            <span>Document: {evidence.document_name || "Unavailable"}</span>
                            <span>Page: {evidence.source_page ?? "Not available"}</span>
                            <span>Chunk ID: {evidence.chunk_id}</span>
                            <span>Review: {evidence.reviewed_status}</span>
                          </div>
                          <p className="chunk-text">{evidence.chunk_text}</p>
                          <p className="section-note">{evidence.decision_reason}</p>

                          <details className="criterion-detail">
                            <summary>
                              <div>
                                <p className="criterion-code">Analysis Details</p>
                                <h3>Model and deterministic rule signals</h3>
                              </div>
                              <span>
                                {evidence.rule_model_agreement
                                  ? "Agreement"
                                  : "Review signal"}
                              </span>
                            </summary>
                            <div className="criterion-detail-body">
                              <dl className="detail-facts">
                                <div>
                                  <dt>DistilBERT Prediction</dt>
                                  <dd>
                                    {evidence.model_label || "None"} (
                                    {formatConfidence(evidence.model_confidence)})
                                  </dd>
                                </div>
                                <div>
                                  <dt>Second Prediction</dt>
                                  <dd>
                                    {evidence.model_second_label || "None"} (
                                    {formatConfidence(evidence.model_second_confidence)})
                                  </dd>
                                </div>
                                <div>
                                  <dt>Model Margin</dt>
                                  <dd>{formatConfidence(evidence.model_margin)}</dd>
                                </div>
                                <div>
                                  <dt>Rule Prediction</dt>
                                  <dd>{evidence.rule_label || "None"}</dd>
                                </div>
                                <div>
                                  <dt>Rule Strength</dt>
                                  <dd>{evidence.rule_confidence || "No suggestion"}</dd>
                                </div>
                                <div>
                                  <dt>Rule Runner-Up</dt>
                                  <dd>{evidence.rule_runner_up || "None"}</dd>
                                </div>
                              </dl>
                              <p>{evidence.rule_reason || "No rule reason available."}</p>
                            </div>
                          </details>

                          <div className="annotation-controls">
                            <label>
                              Choose Different Criterion
                              <select
                                onChange={(event) =>
                                  handleCorrectionChange(
                                    evidence.id,
                                    event.target.value,
                                  )
                                }
                                value={corrections[evidence.id] || ""}
                              >
                                <option value="">Select criterion</option>
                                {criteriaOptions.map((criterion) => (
                                  <option key={criterion.code} value={criterion.code}>
                                    {criterion.code} — {criterion.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="form-actions">
                              <button
                                className="button"
                                disabled={
                                  savingEvidenceId === evidence.id ||
                                  !suggestedLabel(evidence)
                                }
                                onClick={() =>
                                  handleReview(
                                    evidence,
                                    "confirmed",
                                    suggestedLabel(evidence),
                                  )
                                }
                                type="button"
                              >
                                Confirm Suggested Criterion
                              </button>
                              <button
                                className="button"
                                disabled={
                                  savingEvidenceId === evidence.id ||
                                  !corrections[evidence.id]
                                }
                                onClick={() =>
                                  handleReview(
                                    evidence,
                                    "corrected",
                                    corrections[evidence.id],
                                  )
                                }
                                type="button"
                              >
                                Save Different Criterion
                              </button>
                              <button
                                className="button"
                                disabled={savingEvidenceId === evidence.id}
                                onClick={() => handleReview(evidence, "excluded", "OTHER")}
                                type="button"
                              >
                                Mark as OTHER
                              </button>
                              <button
                                className="button"
                                disabled={savingEvidenceId === evidence.id}
                                onClick={() => handleReview(evidence, "excluded", null)}
                                type="button"
                              >
                                Exclude Evidence
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section className="score-section">
            <div className="project-card-header">
              <div>
                <p className="criterion-code">Evidence → Scoring Input</p>
                <h2>UDA Evidence Scoring</h2>
              </div>
            </div>
            <p className="section-note">
              Document evidence may propose scoring inputs, but DistilBERT does
              not award marks. The deterministic UDA scoring rules remain the
              authority for proposed marks. Evidence Classification Status and
              Evidence Scoring Status are separate review stages.
            </p>

            {!evidenceScoring || evidenceScoring.criteria.length === 0 ? (
              <div className="empty">
                No evidence-derived scoring inputs found yet.
              </div>
            ) : (
              <div className="gap-list">
                {evidenceScoring.criteria.map((item) => (
                  <article className="gap-card" key={item.criterion_code}>
                    <div className="gap-heading">
                      <div>
                        <p className="criterion-code">
                          {item.category_code} | {item.criterion_code}
                        </p>
                        <h3>
                          {item.criterion_code} — {item.criterion_name}
                        </h3>
                      </div>
                      <span>{formatScoringStatus(item.scoring_status)}</span>
                    </div>
                    <div className="criterion-facts">
                      <span>Evidence Chunks: {item.evidence_count}</span>
                      <span>
                        Detected Input:{" "}
                        {item.proposed_input_value !== null &&
                        item.proposed_input_value !== undefined
                          ? `${item.proposed_input_value}${item.input_unit || ""}`
                          : "Not available"}
                      </span>
                      <span>
                        Proposed Score:{" "}
                        {item.proposed_score !== null &&
                        item.proposed_score !== undefined
                          ? `${item.proposed_score} / ${item.maximum_marks}`
                          : "Not available"}
                      </span>
                      <span>Review: {formatReviewStatus(item.reviewed_status)}</span>
                    </div>
                    {item.source_document_name ? (
                      <p>
                        Source: {item.source_document_name}, page{" "}
                        {item.source_page ?? "not available"}
                      </p>
                    ) : null}
                    {item.matched_text ? <p>Matched text: {item.matched_text}</p> : null}
                    {item.proposed_rule_text ? (
                      <p>Applicable scoring band: {item.proposed_rule_text}</p>
                    ) : null}
                    {item.conflict_detected ? (
                      <div className="notice error">
                        Need Review From Specialist: {item.conflict_notes}
                      </div>
                    ) : null}
                    {item.specialist_review_recommended &&
                    item.scoring_status === "scored" ? (
                      <div className="notice">
                        Specialist review recommended. This proposed score comes
                        from deterministic document evidence and is not a
                        confirmed assessment.
                      </div>
                    ) : null}
                    <p>{item.scoring_explanation}</p>

                    <div className="annotation-controls">
                      <label>
                        Specialist Value
                        <input
                          onChange={(event) =>
                            handleValueDraftChange(
                              item.criterion_code,
                              event.target.value,
                            )
                          }
                          type="number"
                          value={valueDrafts[item.criterion_code] ?? ""}
                        />
                      </label>
                      <div className="form-actions">
                        <button
                          className="button"
                          disabled={savingCriterionCode === item.criterion_code}
                          onClick={() => handleScoringReview(item, "confirmed")}
                          type="button"
                        >
                          Confirm Value
                        </button>
                        <button
                          className="button"
                          disabled={savingCriterionCode === item.criterion_code}
                          onClick={() => handleScoringReview(item, "corrected")}
                          type="button"
                        >
                          Save Corrected Value
                        </button>
                        <button
                          className="button"
                          disabled={savingCriterionCode === item.criterion_code}
                          onClick={() =>
                            handleScoringReview(item, "insufficient_evidence")
                          }
                          type="button"
                        >
                          Insufficient Evidence
                        </button>
                        <button
                          className="button"
                          disabled={savingCriterionCode === item.criterion_code}
                          onClick={() =>
                            handleScoringReview(item, "manual_assessment_required")
                          }
                          type="button"
                        >
                          Need Review From Specialist
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}

function formatConfidence(value) {
  if (value === null || value === undefined) {
    return "n/a";
  }
  return Number(value).toFixed(3);
}

function formatScoringStatus(status) {
  const labels = {
    ready_for_scoring: "Ready For Scoring",
    need_specialist_review: "Need Review From Specialist",
    insufficient_evidence: "Insufficient Evidence",
    manual_criterion: "Manual Assessment Required",
    scored: "Proposed from deterministic document evidence",
  };
  return labels[status] || status;
}

function formatReviewStatus(status) {
  const labels = {
    unreviewed: "Unreviewed",
    confirmed: "Confirmed",
    corrected: "Corrected",
    insufficient_evidence: "Insufficient Evidence",
    manual_assessment_required: "Need Review From Specialist",
  };
  return labels[status] || status;
}
