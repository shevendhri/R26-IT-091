"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

const MODES = [
  {
    key: "low_cost",
    label: "Low-Cost Optimization",
    desc: "Prioritize low-investment interventions with the quickest score return.",
  },
  {
    key: "maximum_score",
    label: "Maximum Score Potential",
    desc: "Unlock the highest attainable certification points across all categories.",
  },
  {
    key: "target_score",
    label: "Target Certification Band",
    desc: "Calculate required point thresholds to achieve a specific UDA rating.",
  },
];

const TARGET_PRESETS = [
  { label: "Certified", value: "40", tier: "Bronze" },
  { label: "Silver", value: "50", tier: "Silver" },
  { label: "Gold", value: "60", tier: "Gold" },
  { label: "Platinum", value: "70", tier: "Platinum" },
];

export default function ProjectRecommendationsPage({ params }) {
  const { id } = use(params);
  const [recommendations, setRecommendations] = useState(null);
  const [mode, setMode] = useState("low_cost");
  const [targetScore, setTargetScore] = useState("70");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    async function loadRecommendations() {
      try {
        setIsLoading(true);
        setError("");

        const query = new URLSearchParams({ mode });
        if (mode === "target_score") {
          query.set("target", targetScore || "0");
        }
        const response = await fetch(
          `${API_BASE_URL}/projects/${id}/uda-recommendations?${query.toString()}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            `Recommendations request failed with status ${response.status}. ${JSON.stringify(data)}`,
          );
        }

        if (isMounted) {
          setRecommendations(data);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }
        console.error("uda recommendations load error", requestError);
        if (isMounted) {
          setError(`Could not load recommendations. ${requestError.message}`);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [id, mode, targetScore]);

  const items = recommendations?.recommendations || [];

  return (
    <main className="page-shell">
      {/* ── UNIFIED PROJECT SUB-NAVIGATION ── */}
      <nav className="project-subnav-bar" aria-label="Project Sub Navigation">
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}`}>
          01 / Overview
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/documents`}>
          02 / Documents
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/analysis`}>
          03 / Evidence Analysis
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/assessment`}>
          04 / Manual Assessment
        </Link>
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/score`}>
          05 / Score Summary
        </Link>
        <Link className="project-subnav-link active" href={`/green-assessment/projects/${id}/recommendations`}>
          06 / Recommendations ★
        </Link>
      </nav>

      {/* ── HEADER PANEL ── */}
      <header className="page-header hero-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <Link className="back-link" href={`/green-assessment/projects/${id}`} style={{ margin: 0 }}>
            ← Back to Project Details
          </Link>
          <span className="eyebrow" style={{ margin: 0 }}>
            UDA DESIGN RECOMMENDATION ENGINE
          </span>
        </div>

        <h1>
          {recommendations?.project_name ? `${recommendations.project_name} — Improvement Pathway` : "Design Recommendations"}
        </h1>
        <p className="lede">
          Deterministic scoring improvement strategies calculated against Urban Development Authority (UDA)
          rating thresholds, building evidence analysis, and DA submission compliance documents.
        </p>

        <div className="notice" style={{ marginTop: "1rem" }}>
          <strong>Notice:</strong> These recommendations reflect preliminary algorithmic assessments to guide design enhancement and do not constitute formal UDA certification.
        </div>
      </header>

      {/* ── STRATEGY MODE SELECTOR ── */}
      <section className="mode-selector-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
          <span className="eyebrow" style={{ color: "var(--ga-forest)" }}>
            OPTIMIZATION STRATEGY
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--ga-text-muted)" }}>
            Select an algorithmic path to reprioritize score opportunities
          </span>
        </div>

        <div className="mode-segmented-row">
          {MODES.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`mode-tab-btn ${mode === option.key ? "active" : ""}`}
              onClick={() => setMode(option.key)}
            >
              <span className="mode-tab-title">{option.label}</span>
              <span className="mode-tab-desc">{option.desc}</span>
            </button>
          ))}
        </div>

        {mode === "target_score" && (
          <div className="target-presets-container">
            <span style={{ fontSize: "0.74rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: "uppercase", color: "var(--ga-forest)" }}>
              Target Bands:
            </span>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {TARGET_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`target-preset-chip ${targetScore === p.value ? "active" : ""}`}
                  onClick={() => setTargetScore(p.value)}
                >
                  {p.label} ({p.value} pts)
                </button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <label htmlFor="custom-target-input" style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--ga-forest)", textTransform: "uppercase" }}>
                Custom Target:
              </label>
              <input
                id="custom-target-input"
                type="number"
                min="0"
                max="100"
                step="1"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                style={{
                  width: "80px",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "4px",
                  border: "1px solid var(--ga-border)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── LOADING & ERROR NOTICES ── */}
      {isLoading && (
        <div className="notice" role="status" style={{ textAlign: "center", padding: "2rem" }}>
          Analyzing project scoring bands & extracting recommended design improvements...
        </div>
      )}

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && !recommendations && (
        <div className="empty">No recommendations found for this project.</div>
      )}

      {/* ── MAIN CONTENT ── */}
      {!isLoading && !error && recommendations && (
        <>
          {/* Executive KPI Summary */}
          <section className="score-summary-grid">
            <div className="score-card highlight">
              <span>Current Proposed Score</span>
              <strong>
                {recommendations.current_proposed_score ?? recommendations.current_score}
                <span style={{ fontSize: "1rem", color: "var(--ga-text-muted)", fontWeight: 500 }}>
                  {" "}/ {recommendations.total_configured_max_marks}
                </span>
              </strong>
              <div className="subtext">
                Current Level: <strong>{recommendations.current_preassessment_level || "Unassessed"}</strong>
              </div>
            </div>

            <div className="score-card gain">
              <span>Potential Score</span>
              <strong style={{ color: "#065F46" }}>
                {recommendations.potential_score}
                <span style={{ fontSize: "1rem", color: "var(--ga-text-muted)", fontWeight: 500 }}>
                  {" "}/ {recommendations.total_configured_max_marks}
                </span>
              </strong>
              <div className="subtext">
                Attainable Level: <strong>{recommendations.potential_preassessment_level || "Same"}</strong>
              </div>
            </div>

            <div className="score-card gain">
              <span>Total Potential Gain</span>
              <strong style={{ color: "#065F46" }}>
                +{recommendations.total_potential_gain ?? 0}
                <span style={{ fontSize: "0.85rem", color: "var(--ga-text-muted)", fontWeight: 600 }}> pts</span>
              </strong>
              <div className="subtext">
                Across <strong>{recommendations.recommendations_count ?? items.length}</strong> identified opportunities
              </div>
            </div>

            <div className="score-card">
              <span>Specialist Review Required</span>
              <strong>{recommendations.need_specialist_review_count ?? 0}</strong>
              <div className="subtext">
                Confirmed Score: <strong>{recommendations.reviewed_confirmed_score ?? 0} pts</strong>
              </div>
            </div>
          </section>

          {/* Target Score Gap Callout */}
          {mode === "target_score" && (
            <div
              className={`notice ${recommendations.target_reachable ? "success" : "error"}`}
              style={{ marginTop: "0", marginBottom: "2rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <strong>Target Level: {recommendations.target_preassessment_level} ({recommendations.target_score} pts)</strong>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.80rem" }}>
                    Current {recommendations.current_proposed_score ?? recommendations.current_score} pts • Point Gap: +{recommendations.target_gap} pts • Total Potential Available: +{recommendations.total_potential_gain} pts
                  </p>
                </div>
                <span className="status-pill active">
                  {recommendations.target_reachable ? "Target Reachable" : "Additional Measures Needed"}
                </span>
              </div>
            </div>
          )}

          {/* Recommendations List */}
          {items.length === 0 ? (
            <div className="empty">No specific recommendations found for the current configuration.</div>
          ) : (
            <section style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ margin: 0, textTransform: "uppercase", fontSize: "1.1rem" }}>
                    {mode === "low_cost"
                      ? "Low-Cost Optimization Action List"
                      : mode === "maximum_score"
                      ? "Maximum Point Improvement Action List"
                      : "Target Score Feasibility Action List"}
                  </h2>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.80rem", color: "var(--ga-text-muted)" }}>
                    Ranked by score return and implementation feasibility under UDA criteria
                  </p>
                </div>
                <span className="eyebrow" style={{ margin: 0 }}>
                  Showing {items.length} Criteria
                </span>
              </div>

              <div className="gap-list">
                {items.map((item) => (
                  <article className="gap-card" key={item.criterion_code}>
                    {/* Header */}
                    <div className="gap-heading">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span className="criterion-code" style={{ margin: 0 }}>
                            {item.criterion_code}
                          </span>
                          <span style={{ color: "var(--ga-border)", fontWeight: 700 }}>•</span>
                          <span className="category-code" style={{ margin: 0 }}>
                            {item.category_code}
                          </span>
                          {item.recommendation_type && (
                            <span className="status-pill" style={{ textTransform: "uppercase" }}>
                              {item.recommendation_type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        <h3>{item.criterion_name}</h3>
                      </div>

                      <div className="potential-marks-badge">
                        <span>+{item.potential_marks_gain} MARKS GAIN</span>
                      </div>
                    </div>

                    {/* Facts / Metrics Strip */}
                    <div className="criterion-facts">
                      <div className="fact-chip">
                        <span className="chip-label">Current:</span>
                        <span className="chip-val">{item.current_marks} / {item.maximum_marks} pts</span>
                      </div>
                      <div className="fact-chip">
                        <span className="chip-label">Potential:</span>
                        <span className="chip-val" style={{ color: "#065F46" }}>{item.potential_marks} pts</span>
                      </div>
                      <div className="fact-chip">
                        <span className="chip-label">Max Gain:</span>
                        <span className="chip-val">+{item.maximum_gain ?? 0}</span>
                      </div>
                      {item.cost_level && (
                        <div className={`fact-chip ${getCostClass(item.cost_level)}`}>
                          <span className="chip-label">Cost:</span>
                          <span className="chip-val">{item.cost_level}</span>
                        </div>
                      )}
                      {item.implementation_difficulty && (
                        <div className="fact-chip">
                          <span className="chip-label">Difficulty:</span>
                          <span className="chip-val">{item.implementation_difficulty}</span>
                        </div>
                      )}
                      <div className="fact-chip">
                        <span className="chip-label">Status:</span>
                        <span className="chip-val">{formatStatus(item.current_status)}</span>
                      </div>
                    </div>

                    {/* Specialist Alert */}
                    {(item.specialist_review_required || item.requires_manual_review) && (
                      <div className="notice error" style={{ marginTop: 0, marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                          <span>
                            <strong>Specialist Review Required:</strong> Point claiming is deferred until verified by an accredited green professional.
                          </span>
                          <Link
                            className="button danger-button"
                            href={`/green-assessment/projects/${id}/analysis`}
                            style={{ minHeight: "32px", padding: "0.4rem 0.85rem", fontSize: "0.70rem" }}
                          >
                            Review Evidence
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Actionable Recommendation Callout */}
                    <div className="rec-callout-box">
                      <div className="rec-callout-header">
                        <span>Actionable Architectural Recommendation</span>
                      </div>
                      <p className="rec-callout-text">
                        {item.recommendation_text || item.recommendation || "Implement required green building measures as per UDA specifications."}
                      </p>
                    </div>

                    {/* Technical Reason & Threshold */}
                    {item.reason && (
                      <div className="rec-reason-box">
                        <span className="rec-reason-label">Scoring Rationale:</span>
                        {item.reason}
                        {item.matched_rule_text && (
                          <div style={{ marginTop: "0.4rem", paddingTop: "0.4rem", borderTop: "1px dashed var(--ga-border)", color: "var(--ga-text-muted)", fontSize: "0.76rem" }}>
                            <strong>Rule Threshold:</strong> {item.matched_rule_text}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence Snippet */}
                    {(item.evidence_summary || item.source_document) && (
                      <div style={{ marginBottom: "0.85rem" }}>
                        {item.source_document && (
                          <div className="evidence-source-tag">
                            <span>Source Doc: {item.source_document}</span>
                            {item.source_page && <span>(Page {item.source_page})</span>}
                          </div>
                        )}
                        {item.evidence_summary && (
                          <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", color: "var(--ga-text-secondary)", fontStyle: "italic" }}>
                            "{item.evidence_summary}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Required DA Documents */}
                    <div>
                      <h4 className="da-docs-title">Required Development Authority (DA) Evidence Documents:</h4>
                      {item.required_documents && item.required_documents.length > 0 ? (
                        <ul className="da-docs-grid">
                          {item.required_documents.map((doc, idx) => (
                            <li className="da-doc-item" key={`${item.criterion_code}-${idx}`}>
                              <span className="da-doc-bullet">✓</span>
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: "0.78rem", color: "var(--ga-text-muted)", margin: 0, fontStyle: "italic" }}>
                          No specific DA document mandate configured for this criterion.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function getCostClass(cost) {
  const c = String(cost).toLowerCase();
  if (c.includes("low")) return "badge-low-cost";
  if (c.includes("med")) return "badge-med-cost";
  if (c.includes("high")) return "badge-high-cost";
  return "";
}

function formatStatus(status) {
  const labels = {
    evidence_proposed: "Evidence Proposed",
    evidence_confirmed: "Evidence Confirmed",
    manual: "Manual",
    unassessed: "Unassessed",
    need_specialist_review: "Review Needed",
    insufficient_evidence: "Insufficient Evidence",
    manual_criterion: "Manual Assessment Required",
    not_assessed: "Not Assessed",
  };
  return labels[status] || status || "Not available";
}
