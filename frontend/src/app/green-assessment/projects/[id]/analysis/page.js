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
      {/* ── UNIFIED PROJECT WORKFLOW SUB-NAVIGATION ── */}
      <nav className="project-subnav-bar" aria-label="Project Sub Navigation">
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}`}>
          01 / Overview
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/documents`}>
          02 / Documents
        </Link>
        <Link className="project-subnav-link active" href={`/green-assessment/projects/${id}/analysis`}>
          03 / Evidence Analysis ★
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/assessment`}>
          04 / Manual Assessment
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/score`}>
          05 / Score Summary
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/recommendations`}>
          06 / Recommendations
        </Link>
      </nav>

      {/* ── ARCHITECTURAL HERO HEADER ── */}
      <header className="page-header hero-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <Link className="back-link" href={`/green-assessment/projects/${id}`} style={{ margin: 0 }}>
            ← Back to Project Details
          </Link>
          <span className="eyebrow" style={{ margin: 0 }}>
            UDA EVIDENCE IDENTIFICATION & SCORING PIPELINE
          </span>
        </div>

        <h1>
          {project ? `${project.project_name} — UDA Document Analysis` : "UDA Document Analysis"}
        </h1>
        <p className="lede">
          AI-assisted identification of UDA criterion evidence from uploaded
          project documents coupled with deterministic rule validation.
        </p>

        <div className="notice" style={{ marginTop: "1rem" }}>
          <strong>Notice:</strong> AI-assisted evidence classification is intended for design-stage
          pre-assessment. Results should be reviewed where specialist verification is indicated.
        </div>

        <div className="actions" style={{ marginTop: "1.25rem" }}>
          <button
            className="button primary"
            disabled={isRunning}
            onClick={handleRunAnalysis}
            type="button"
          >
            {isRunning ? "Refreshing Analysis..." : "⚡ Refresh UDA Analysis"}
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
          <Link className="button" href={`/green-assessment/projects/${id}/recommendations`}>
            View Recommendations
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

      {!isLoading && analysis ? (
        <>
          {/* ── KPI METRICS GRID ── */}
          <section className="score-summary-grid">
            <div className="score-card highlight">
              <span>Documents Analysed</span>
              <strong>{analysis.documents_analyzed}</strong>
              <div className="subtext">Uploaded PDF documentation</div>
            </div>
            <div className="score-card">
              <span>Chunks Analysed</span>
              <strong>{analysis.analyzed_chunks}</strong>
              <div className="subtext">Parsed text passages</div>
            </div>
            <div className="score-card gain">
              <span>Candidate Evidence</span>
              <strong style={{ color: "#065F46" }}>{analysis.candidate_evidence}</strong>
              <div className="subtext">High confidence matches</div>
            </div>
            <div className="score-card">
              <span>Need Review From Specialist</span>
              <strong style={{ color: analysis.need_specialist_review > 0 ? "#D97706" : "inherit" }}>
                {analysis.need_specialist_review}
              </strong>
              <div className="subtext">Ambiguous / conflict chunks</div>
            </div>
            <div className="score-card">
              <span>Criteria Detected</span>
              <strong>{analysis.criteria_detected}</strong>
              <div className="subtext">Active UDA categories</div>
            </div>
            <div className="score-card">
              <span>Model Version</span>
              <strong style={{ fontSize: "1.1rem" }}>{analysis.model_version || "DistilBERT UDA"}</strong>
              <div className="subtext">Transformer fine-tuned</div>
            </div>
            <div className="score-card">
              <span>Inference Device</span>
              <strong style={{ fontSize: "1.1rem" }}>{analysis.gpu || analysis.device || "CPU"}</strong>
              <div className="subtext">Accelerated processing</div>
            </div>
            <div className="score-card">
              <span>Other / Non-UDA</span>
              <strong>{analysis.other}</strong>
              <div className="subtext">General background text</div>
            </div>
          </section>

          {/* ── SECTION 1: DETECTED EVIDENCE BY UDA CRITERION ── */}
          <section className="score-section" style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
              <h2>Detected Evidence by UDA Criterion</h2>
              <span className="eyebrow" style={{ margin: 0 }}>
                {groups.length} Criteria Identified
              </span>
            </div>
            <p className="section-note" style={{ marginBottom: "1.25rem" }}>
              Text chunks extracted from project documents and classified via DistilBERT & deterministic rules.
            </p>

            {groups.length === 0 ? (
              <div className="empty">
                No UDA evidence records found yet. Upload project documents,
                then use View UDA Document Analysis from the Documents page.
              </div>
            ) : (
              <div className="category-list">
                {groups.map((group) => (
                  <details className="category-card" key={group.criterion_code}>
                    <summary className="category-heading" style={{ cursor: "pointer" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                          <span className="criterion-code" style={{ margin: 0 }}>
                            {group.category_code} | {group.criterion_code}
                          </span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>
                          {group.criterion_code} — {group.criterion_name}
                        </h2>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span className="status-pill active">{group.evidence_count} Chunks</span>
                      </div>
                    </summary>

                    <div className="criterion-facts" style={{ marginTop: "0.75rem" }}>
                      <div className="fact-chip">
                        <span className="chip-label">Candidate Evidence:</span>
                        <span className="chip-val" style={{ color: "#065F46" }}>{group.candidate_evidence}</span>
                      </div>
                      <div className="fact-chip">
                        <span className="chip-label">Specialist Review:</span>
                        <span className="chip-val" style={{ color: group.need_specialist_review > 0 ? "#D97706" : "inherit" }}>
                          {group.need_specialist_review}
                        </span>
                      </div>
                      <div className="fact-chip">
                        <span className="chip-label">Other:</span>
                        <span className="chip-val">{group.other}</span>
                      </div>
                    </div>

                    <div className="chunk-list" style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
                      {group.evidence.map((evidence) => (
                        <article className="chunk-card" key={evidence.id} style={{ background: "var(--ga-surface)", border: "1px solid var(--ga-border)", borderRadius: "4px", padding: "1.25rem 1.5rem" }}>
                          <div className="evidence-source-bar" style={{ marginBottom: "0.75rem" }}>
                            <span className={`status-pill ${evidence.decision_status === "candidate_evidence" ? "active" : ""}`} style={{ textTransform: "uppercase" }}>
                              {statusLabels[evidence.decision_status] || evidence.decision_status}
                            </span>
                            <span className="doc-badge">
                              📄 {evidence.document_name || "Document Unavailable"}
                            </span>
                            <span className="doc-badge">
                              Page: {evidence.source_page ?? "N/A"}
                            </span>
                            <span className="doc-badge">
                              Chunk #{evidence.chunk_id}
                            </span>
                            <span className="doc-badge">
                              Review: <strong>{evidence.reviewed_status}</strong>
                            </span>
                          </div>

                          <div className="evidence-quote-box">
                            <p className="quote-text">"{evidence.chunk_text}"</p>
                          </div>

                          <p className="section-note" style={{ margin: "0 0 0.85rem" }}>
                            <strong>Decision Rationale:</strong> {evidence.decision_reason}
                          </p>

                          <details className="criterion-detail" style={{ marginBottom: "1rem" }}>
                            <summary style={{ fontSize: "0.78rem" }}>
                              <div>
                                <span className="criterion-code" style={{ margin: 0 }}>NLP & Rule Diagnostics</span>
                              </div>
                              <span style={{ fontSize: "0.68rem" }}>
                                {evidence.rule_model_agreement ? "✓ High Agreement" : "⚠ Review Discrepancy"}
                              </span>
                            </summary>
                            <div className="criterion-detail-body">
                              <dl className="detail-facts">
                                <div>
                                  <dt>DistilBERT Prediction</dt>
                                  <dd>
                                    {evidence.model_label || "None"} ({formatConfidence(evidence.model_confidence)})
                                  </dd>
                                </div>
                                <div>
                                  <dt>Second Prediction</dt>
                                  <dd>
                                    {evidence.model_second_label || "None"} ({formatConfidence(evidence.model_second_confidence)})
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
                              <p style={{ marginTop: "0.75rem", fontSize: "0.82rem" }}>
                                <strong>Rule Context:</strong> {evidence.rule_reason || "No rule reason available."}
                              </p>
                            </div>
                          </details>

                          <div className="annotation-controls" style={{ background: "#FFFFFF", padding: "1rem", border: "1px solid var(--ga-border)", borderRadius: "3px" }}>
                            <label>
                              Reassign to Different UDA Criterion
                              <select
                                onChange={(event) =>
                                  handleCorrectionChange(evidence.id, event.target.value)
                                }
                                value={corrections[evidence.id] || ""}
                              >
                                <option value="">Select criterion...</option>
                                {criteriaOptions.map((criterion) => (
                                  <option key={criterion.code} value={criterion.code}>
                                    {criterion.code} — {criterion.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="form-actions" style={{ marginTop: "0.5rem" }}>
                              <button
                                className="button primary"
                                disabled={savingEvidenceId === evidence.id || !suggestedLabel(evidence)}
                                onClick={() => handleReview(evidence, "confirmed", suggestedLabel(evidence))}
                                type="button"
                              >
                                ✓ Confirm Suggested Criterion
                              </button>
                              <button
                                className="button"
                                disabled={savingEvidenceId === evidence.id || !corrections[evidence.id]}
                                onClick={() => handleReview(evidence, "corrected", corrections[evidence.id])}
                                type="button"
                              >
                                ✎ Save Different Criterion
                              </button>
                              <button
                                className="button subtle-btn"
                                disabled={savingEvidenceId === evidence.id}
                                onClick={() => handleReview(evidence, "excluded", "OTHER")}
                                type="button"
                              >
                                Mark as OTHER
                              </button>
                              <button
                                className="button subtle-btn"
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

          {/* ── SECTION 2: UDA EVIDENCE SCORING (ELEVATED UI) ── */}
          <section className="score-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
              <div>
                <span className="criterion-code" style={{ margin: 0 }}>
                  EVIDENCE → SCORING INPUT PIPELINE
                </span>
                <h2 style={{ margin: "0.25rem 0 0" }}>UDA Evidence Scoring</h2>
              </div>
              <span className="eyebrow" style={{ margin: 0 }}>
                {evidenceScoring?.criteria?.length || 0} Criteria Evaluated
              </span>
            </div>

            <p className="section-note" style={{ marginBottom: "1.5rem" }}>
              Document evidence extracts numerical metrics and specifications. Deterministic UDA rating
              rules calculate proposed marks based on certified thresholds.
            </p>

            {!evidenceScoring || evidenceScoring.criteria.length === 0 ? (
              <div className="empty">
                No evidence-derived scoring inputs found yet.
              </div>
            ) : (
              <div className="gap-list">
                {evidenceScoring.criteria.map((item) => (
                  <article
                    className={`evidence-scoring-card ${
                      item.conflict_detected || item.specialist_review_recommended
                        ? "review-needed"
                        : ""
                    }`}
                    key={item.criterion_code}
                  >
                    {/* Header */}
                    <div className="gap-heading">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                          <span className="criterion-code" style={{ margin: 0 }}>
                            {item.criterion_code}
                          </span>
                          <span style={{ color: "var(--ga-border)", fontWeight: 700 }}>•</span>
                          <span className="category-code" style={{ margin: 0 }}>
                            {item.category_code}
                          </span>
                          <span className="status-pill" style={{ textTransform: "uppercase" }}>
                            {item.category_name || "Energy Efficiency"}
                          </span>
                        </div>
                        <h3>
                          {item.criterion_code} — {item.criterion_name}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span className={`evidence-status-badge ${getScoringBadgeClass(item.scoring_status)}`}>
                          {formatScoringStatus(item.scoring_status)}
                        </span>
                      </div>
                    </div>

                    {/* Highlight Metrics Strip */}
                    <div className="evidence-metrics-strip">
                      <div className="evidence-metric-box score-highlight">
                        <span className="metric-label">Proposed Score</span>
                        <span className="metric-value">
                          {item.proposed_score !== null && item.proposed_score !== undefined
                            ? `${item.proposed_score} `
                            : "— "}
                          <small style={{ fontSize: "0.85rem", color: "var(--ga-text-muted)", fontWeight: 600 }}>
                            / {item.maximum_marks} pts
                          </small>
                        </span>
                        <div className="metric-sub">Deterministic rule output</div>
                      </div>

                      <div className="evidence-metric-box">
                        <span className="metric-label">Detected Input Value</span>
                        <span className="metric-value">
                          {item.proposed_input_value !== null && item.proposed_input_value !== undefined
                            ? `${item.proposed_input_value} ${item.input_unit || ""}`
                            : "Not available"}
                        </span>
                        <div className="metric-sub">Metric: {formatMetricName(item.proposed_input_metric)}</div>
                      </div>

                      <div className="evidence-metric-box">
                        <span className="metric-label">Evidence Chunks</span>
                        <span className="metric-value">{item.evidence_count}</span>
                        <div className="metric-sub">Method: {item.extraction_method || "Regex / NLP"}</div>
                      </div>

                      <div className="evidence-metric-box">
                        <span className="metric-label">Review Status</span>
                        <span className="metric-value" style={{ fontSize: "1rem" }}>
                          <span className="status-pill" style={{ textTransform: "uppercase" }}>
                            {formatReviewStatus(item.reviewed_status)}
                          </span>
                        </span>
                        <div className="metric-sub">
                          Confidence: <strong style={{ color: "var(--ga-forest)" }}>{item.extraction_confidence || "medium"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Document Source Strip */}
                    {item.source_document_name && (
                      <div className="evidence-source-bar">
                        <span>📄 Source Document:</span>
                        <span className="doc-badge">
                          <strong>{item.source_document_name}</strong>
                        </span>
                        {item.source_page && (
                          <span className="doc-badge">
                            Page: <strong>{item.source_page}</strong>
                          </span>
                        )}
                        {item.source_evidence_id && (
                          <span className="doc-badge">
                            Evidence ID: #{item.source_evidence_id}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Matched Document Evidence Excerpt */}
                    {item.matched_text && (
                      <div className="evidence-quote-box">
                        <div className="quote-label">
                          <span>🔍 Matched Document Evidence Excerpt:</span>
                        </div>
                        <p className="quote-text">"{item.matched_text}"</p>
                      </div>
                    )}

                    {/* Applicable UDA Scoring Rule */}
                    {item.proposed_rule_text && (
                      <div className="rule-band-box">
                        <span className="rule-band-label">Applicable UDA Scoring Threshold:</span>
                        <code className="rule-band-code">{item.proposed_rule_text}</code>
                      </div>
                    )}

                    {/* Conflict Warning */}
                    {item.conflict_detected && (
                      <div className="notice error" style={{ marginTop: 0, marginBottom: "1rem" }}>
                        <strong>⚠️ Conflict Detected / Specialist Review Required:</strong> {item.conflict_notes}
                      </div>
                    )}

                    {/* Specialist Review Notice */}
                    {item.specialist_review_recommended && item.scoring_status === "scored" && (
                      <div className="notice" style={{ marginTop: 0, marginBottom: "1rem" }}>
                        <strong>Specialist Review Recommended:</strong> This proposed score comes from deterministic document evidence and is not a confirmed assessment.
                      </div>
                    )}

                    {/* Scoring Explanation */}
                    {item.scoring_explanation && (
                      <div className="scoring-explanation-box">
                        <span className="explanation-label">Scoring Rationale:</span>
                        <span>{item.scoring_explanation}</span>
                      </div>
                    )}

                    {/* Specialist Audit & Verification Panel */}
                    <div className="specialist-action-panel">
                      <div className="specialist-action-header">
                        <span>Specialist Audit & Verification</span>
                      </div>
                      <div className="specialist-action-row">
                        <div className="specialist-input-group">
                          <label htmlFor={`spec-val-${item.criterion_code}`}>
                            Specialist Value ({item.input_unit || "value"}):
                          </label>
                          <input
                            id={`spec-val-${item.criterion_code}`}
                            onChange={(event) =>
                              handleValueDraftChange(item.criterion_code, event.target.value)
                            }
                            placeholder={`e.g. ${item.proposed_input_value ?? "0"}`}
                            type="number"
                            value={valueDrafts[item.criterion_code] ?? ""}
                          />
                        </div>

                        <div className="specialist-btn-group">
                          <button
                            className="button primary"
                            disabled={savingCriterionCode === item.criterion_code}
                            onClick={() => handleScoringReview(item, "confirmed")}
                            type="button"
                          >
                            {savingCriterionCode === item.criterion_code ? "Saving..." : "✓ Confirm Proposed Value"}
                          </button>
                          <button
                            className="button"
                            disabled={savingCriterionCode === item.criterion_code}
                            onClick={() => handleScoringReview(item, "corrected")}
                            type="button"
                          >
                            ✎ Save Corrected Value
                          </button>
                          <button
                            className="button subtle-btn"
                            disabled={savingCriterionCode === item.criterion_code}
                            onClick={() => handleScoringReview(item, "insufficient_evidence")}
                            type="button"
                          >
                            Insufficient Evidence
                          </button>
                          <button
                            className="button subtle-btn"
                            disabled={savingCriterionCode === item.criterion_code}
                            onClick={() => handleScoringReview(item, "manual_assessment_required")}
                            type="button"
                          >
                            Need Specialist Review
                          </button>
                        </div>
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

function formatMetricName(metric) {
  if (!metric) return "Standard Metric";
  return metric
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getScoringBadgeClass(status) {
  if (status === "scored") return "scored";
  if (status === "need_specialist_review") return "review";
  if (status === "insufficient_evidence") return "insufficient";
  return "manual";
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

