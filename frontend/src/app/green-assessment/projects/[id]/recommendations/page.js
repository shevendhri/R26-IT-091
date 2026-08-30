"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

const MODES = [
  { key: "low_cost", label: "Low-Cost Score Improvement" },
  { key: "maximum_score", label: "Maximum Score Improvement" },
  { key: "target_score", label: "Target Score" },
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
        console.log("uda recommendations response", data);

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
      <header className="page-header">
        <Link className="back-link" href={`/green-assessment/projects/${id}`}>
          Back to Project Details
        </Link>
        <p className="eyebrow">UDA Design Recommendations</p>
        <h1>
          {recommendations
            ? recommendations.project_name
            : "Project Recommendations"}
        </h1>
        <p className="lede">
          Compare deterministic improvement paths based on UDA scoring bands,
          project assessment marks, and DA evidence requirements.
        </p>
        <div className="notice">
          This is a preliminary recommendation and does not guarantee official
          UDA certification.
        </div>
        <div className="actions">
          <Link className="button" href={`/green-assessment/projects/${id}/analysis`}>
            UDA Document Analysis / Evidence Scoring
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/assessment`}>
            View Manual Assessment
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/score`}>
            View Score Summary
          </Link>
        </div>
      </header>

      <section className="score-section">
        <div className="actions compact-actions">
          {MODES.map((option) => (
            <button
              className={`button ${mode === option.key ? "primary" : ""}`}
              key={option.key}
              onClick={() => setMode(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        {mode === "target_score" ? (
          <>
            <div className="actions compact-actions">
              {[
                ["Certified", "40"],
                ["Silver", "50"],
                ["Gold", "60"],
                ["Platinum", "70"],
              ].map(([label, value]) => (
                <button
                  className="button"
                  key={label}
                  onClick={() => setTargetScore(value)}
                  type="button"
                >
                  {label} - {value}
                </button>
              ))}
            </div>
            <div className="assessment-controls">
            <label>
              Target UDA score
              <input
                min="0"
                step="0.01"
                type="number"
                value={targetScore}
                onChange={(event) => setTargetScore(event.target.value)}
              />
            </label>
            </div>
          </>
        ) : null}
      </section>

      {isLoading ? (
        <div className="notice" role="status">
          Loading recommendations...
        </div>
      ) : null}

      {error ? (
        <div className="notice error" role="alert">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && !recommendations ? (
        <div className="empty">No recommendations found.</div>
      ) : null}

      {!isLoading && !error && recommendations ? (
        <>
          <section className="score-summary-grid">
            <div className="score-card">
              <span>Current Proposed Score</span>
              <strong>
                {recommendations.current_proposed_score ??
                  recommendations.current_score}{" "}
                / {recommendations.total_configured_max_marks}
              </strong>
            </div>
            <div className="score-card">
              <span>Current Pre-Assessment Level</span>
              <strong>{recommendations.current_preassessment_level}</strong>
            </div>
            <div className="score-card">
              <span>Potential Score</span>
              <strong>
                {recommendations.potential_score} /{" "}
                {recommendations.total_configured_max_marks}
              </strong>
            </div>
            <div className="score-card">
              <span>Potential Pre-Assessment Level</span>
              <strong>{recommendations.potential_preassessment_level}</strong>
            </div>
            <div className="score-card">
              <span>Potential Gain</span>
              <strong>+{recommendations.total_potential_gain}</strong>
            </div>
            <div className="score-card">
              <span>Recommendations Count</span>
              <strong>
                {recommendations.recommendations_count ?? items.length}
              </strong>
            </div>
            <div className="score-card">
              <span>Need Review From Specialist</span>
              <strong>{recommendations.need_specialist_review_count ?? 0}</strong>
            </div>
            <div className="score-card">
              <span>Reviewed / Confirmed Score</span>
              <strong>{recommendations.reviewed_confirmed_score ?? 0}</strong>
            </div>
          </section>

          {mode === "target_score" ? (
            <div className="notice">
              Target Score: {recommendations.target_score}. Target
              Pre-Assessment Level:{" "}
              {recommendations.target_preassessment_level}. Current{" "}
              {recommendations.current_proposed_score ??
                recommendations.current_score}
              , required +{recommendations.target_gap}, listed potential +
              {recommendations.total_potential_gain}.{" "}
              {recommendations.target_reachable
                ? "Potential pathway to target identified."
                : "Available recommendations do not currently provide enough potential marks to reach the selected target."}
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="empty">No recommendations found.</div>
          ) : (
            <section className="score-section">
              <h2>
                {mode === "low_cost"
                  ? "Low-Cost Improvement Path"
                  : mode === "maximum_score"
                    ? "Maximum-Score Improvement Path"
                    : "Target-Score Improvement Path"}
              </h2>
              <div className="gap-list">
                {items.map((item) => (
                  <article className="gap-card" key={item.criterion_code}>
                    <div className="gap-heading">
                      <div>
                        <p className="criterion-code">
                          {item.criterion_code} | {item.category_code}
                        </p>
                        <h3>{item.criterion_name}</h3>
                      </div>
                      <span>+{item.potential_marks_gain} marks</span>
                    </div>
                    <div className="criterion-facts">
                      <span>
                        Current Proposed Score: {item.current_marks} /{" "}
                        {item.maximum_marks}
                      </span>
                      <span>Next Opportunity: {item.next_score ?? item.potential_marks}</span>
                      <span>Potential: {item.potential_marks}</span>
                      <span>Maximum Potential Gain: +{item.maximum_gain ?? 0}</span>
                      <span>Status: {formatStatus(item.current_status)}</span>
                      <span>Score Source: {formatStatus(item.score_source)}</span>
                      <span>Cost: {item.cost_level}</span>
                      <span>Difficulty: {item.implementation_difficulty}</span>
                      <span>Type: {item.recommendation_type}</span>
                    </div>
                    {item.specialist_review_required || item.requires_manual_review ? (
                      <div className="notice error">
                        Need Review From Specialist. No guaranteed marks gain is
                        claimed until the evidence or criterion is verified.
                        <div className="actions compact-actions">
                          <Link
                            className="button"
                            href={`/green-assessment/projects/${id}/analysis`}
                          >
                            Review Evidence Scoring
                          </Link>
                        </div>
                      </div>
                    ) : null}
                    {item.evidence_summary ? (
                      <p>Detected Evidence: {item.evidence_summary}</p>
                    ) : null}
                    {item.source_document ? (
                      <p>
                        Source: {item.source_document} — Page{" "}
                        {item.source_page ?? "not available"}
                      </p>
                    ) : null}
                    <p>{item.recommendation_text || item.recommendation}</p>
                    <p>Reason: {item.reason}</p>
                    {item.matched_rule_text ? (
                      <p>Scoring threshold: {item.matched_rule_text}</p>
                    ) : null}
                    <h3>Required DA Documents</h3>
                    {item.required_documents.length > 0 ? (
                      <ul className="requirement-list">
                        {item.required_documents.map((document, index) => (
                          <li key={`${item.criterion_code}-${index}`}>
                            {document}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No DA document list is configured for this criterion.</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}
    </main>
  );
}

function formatStatus(status) {
  const labels = {
    evidence_proposed: "Evidence Proposed",
    evidence_confirmed: "Evidence Confirmed",
    manual: "Manual",
    unassessed: "Unassessed",
    need_specialist_review: "Need Review From Specialist",
    insufficient_evidence: "Insufficient Evidence",
    manual_criterion: "Manual Assessment Required",
    not_assessed: "Not Assessed",
  };
  return labels[status] || status || "Not available";
}
