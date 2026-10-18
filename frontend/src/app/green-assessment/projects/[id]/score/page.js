"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

export default function ProjectScorePage({ params }) {
  const { id } = use(params);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    async function loadScore() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/projects/${id}/uda-score`,
          { signal: controller.signal },
        );
        const scoreData = await response.json();
        console.log("uda score response", scoreData);

        if (!response.ok) {
          throw new Error(
            `UDA score request failed with status ${response.status}. ${JSON.stringify(scoreData)}`,
          );
        }

        if (isMounted) {
          setScore(scoreData);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }
        console.error("uda score load error", requestError);
        if (isMounted) {
          setError(`Could not load UDA score summary. ${requestError.message}`);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadScore();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [id]);

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
        <Link className="project-subnav-link active" href={`/green-assessment/projects/${id}/score`}>
          05 / Score Summary ★
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
            UDA DESIGN PRE-ASSESSMENT SCORING SUMMARY
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1>{score ? `${score.project_name} — Score Summary` : "Project Score Summary"}</h1>
            <p className="lede" style={{ marginBottom: "0.75rem" }}>
              Preliminary UDA design-stage green building rating marks compiled from deterministic
              document evidence and specialist assessments.
            </p>
          </div>

          {score && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span className="status-pill active" style={{ fontSize: "0.78rem", padding: "0.45rem 0.95rem" }}>
                LEVEL: {score.current_preassessment_level || "Below Threshold"}
              </span>
            </div>
          )}
        </div>

        <div className="notice" style={{ marginTop: "0.75rem" }}>
          <strong>Certification Notice:</strong> This preliminary evaluation is calculated against Sri Lankan
          Urban Development Authority (UDA) rating guidelines and serves as an advisory pre-assessment prior to formal DA submission.
        </div>

        <div className="actions" style={{ marginTop: "1.25rem" }}>
          <Link className="button primary" href={`/green-assessment/projects/${id}/recommendations`}>
            ★ View Optimization Recommendations
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/analysis`}>
            View Evidence Analysis
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/assessment`}>
            View Manual Assessment
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/documents`}>
            Project Documents
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="notice" role="status">
          Loading score summary...
        </div>
      ) : null}

      {error ? (
        <div className="notice error" role="alert">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && !score ? (
        <div className="empty">No score data found.</div>
      ) : null}

      {!isLoading && !error && score ? (
        <>
          {/* ── KPI METRICS GRID ── */}
          <section className="score-summary-grid">
            <div className="score-card highlight">
              <span>Current Proposed Score</span>
              <strong style={{ color: "#065F46" }}>
                {score.total_awarded_marks}
                <small style={{ fontSize: "1rem", color: "var(--ga-text-muted)", fontWeight: 600 }}>
                  {" "}/ {score.total_configured_max_marks} pts
                </small>
              </strong>
              <div className="subtext">
                Attainment:{" "}
                <strong>
                  {Math.round((score.total_awarded_marks / (score.total_configured_max_marks || 1)) * 100)}%
                </strong>{" "}
                of configured points
              </div>
            </div>

            <div className="score-card">
              <span>Current Rating Tier</span>
              <strong style={{ fontSize: "1.25rem" }}>
                {score.current_preassessment_level}
              </strong>
              <div className="subtext">
                {score.total_awarded_marks >= 40
                  ? "Meets minimum UDA certification"
                  : "Below 40 pt baseline threshold"}
              </div>
            </div>

            <div className="score-card gain">
              <span>Next Level Target</span>
              <strong style={{ color: "#065F46", fontSize: "1.25rem" }}>
                {score.highest_level_reached ? "Highest Tier Reached" : score.next_preassessment_level}
              </strong>
              <div className="subtext">
                {score.highest_level_reached
                  ? "Maximum band achieved"
                  : `+${score.marks_to_next_level} pts needed for ${score.next_preassessment_level}`}
              </div>
            </div>

            <div className="score-card">
              <span>Automatic Evidence Marks</span>
              <strong>{score.automatically_assessed_marks} pts</strong>
              <div className="subtext">From verified document evidence</div>
            </div>

            <div className="score-card">
              <span>Manual Specialist Marks</span>
              <strong>{score.manually_assessed_marks} pts</strong>
              <div className="subtext">From manual assessment forms</div>
            </div>

            <div className="score-card">
              <span>Criteria Assessed</span>
              <strong>
                {score.number_assessed}{" "}
                <small style={{ fontSize: "0.85rem", color: "var(--ga-text-muted)" }}>
                  / {score.number_assessed + score.number_not_assessed}
                </small>
              </strong>
              <div className="subtext">
                {score.number_not_assessed} pending criteria
              </div>
            </div>

            <div className="score-card">
              <span>Specialist Review Pending</span>
              <strong style={{ color: score.number_manual_review_required > 0 ? "#D97706" : "inherit" }}>
                {score.number_manual_review_required}
              </strong>
              <div className="subtext">Criteria requiring verification</div>
            </div>

            <div className="score-card">
              <span>Assessment Stage</span>
              <strong style={{ fontSize: "1.2rem" }}>
                {score.assessment_stage || "Design (DA)"}
              </strong>
              <div className="subtext">Pre-construction evaluation</div>
            </div>
          </section>

          {/* ── PRE-ASSESSMENT LEVEL PROGRESS TRACKER ── */}
          <section className="level-tracker-panel">
            <div className="level-tracker-header">
              <div>
                <span className="criterion-code" style={{ margin: 0 }}>
                  UDA CERTIFICATION TIERS & THRESHOLDS
                </span>
                <h2 style={{ margin: "0.25rem 0 0" }}>Certification Level Progress</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="fact-chip" style={{ fontSize: "0.78rem" }}>
                  <span className="chip-label">Current:</span>
                  <span className="chip-val" style={{ color: "#065F46" }}>
                    {score.total_awarded_marks} / 100 Marks
                  </span>
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="level-progress-bar-wrap" title={`Current Score: ${score.total_awarded_marks} pts`}>
              <div
                className="level-progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(4, (score.total_awarded_marks / 100) * 100))}%`,
                }}
              />
            </div>

            {/* Milestone Steps */}
            <div className="level-milestones-row">
              {[
                { name: "Uncertified", pts: 0, label: "Baseline (<40)" },
                { name: "Certified", pts: 40, label: "40 – 49 Pts" },
                { name: "Silver", pts: 50, label: "50 – 59 Pts" },
                { name: "Gold", pts: 60, label: "60 – 69 Pts" },
                { name: "Platinum", pts: 70, label: "70+ Pts" },
              ].map((tier) => {
                const isCurrent =
                  (tier.name === "Uncertified" && score.current_preassessment_level === "Below Certification Threshold") ||
                  score.current_preassessment_level === tier.name;
                const isReached = score.total_awarded_marks >= tier.pts;

                return (
                  <div
                    className={`level-milestone-step ${isCurrent ? "current" : ""} ${isReached ? "reached" : ""}`}
                    key={tier.name}
                  >
                    <span className="milestone-pts">{tier.pts} PTS</span>
                    <span className="milestone-name">{tier.name}</span>
                    <span className="milestone-tag">{tier.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="notice" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
              {score.highest_level_reached ? (
                <span>
                  <strong>Outstanding Achievement:</strong> The project currently qualifies for the highest UDA certification tier (Platinum).
                </span>
              ) : (
                <span>
                  <strong>Pathway to Next Tier:</strong> Currently at{" "}
                  <strong>{score.total_awarded_marks} pts</strong> ({score.current_preassessment_level}). Exactly{" "}
                  <strong style={{ color: "var(--ga-forest)" }}>+{score.marks_to_next_level} additional marks</strong> are
                  required to achieve the <strong>{score.next_preassessment_level}</strong> rating threshold ({score.next_level_threshold || 40} pts).
                </span>
              )}
            </div>
          </section>

          {/* ── CATEGORY BREAKDOWN ── */}
          <section className="score-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
              <div>
                <span className="criterion-code" style={{ margin: 0 }}>
                  PERFORMANCE ACROSS UDA DOMAINS
                </span>
                <h2 style={{ margin: "0.25rem 0 0" }}>Category Breakdown</h2>
              </div>
              <span className="eyebrow" style={{ margin: 0 }}>
                {score.category_breakdown?.length || 0} Categories
              </span>
            </div>

            <p className="section-note" style={{ marginBottom: "1.5rem" }}>
              Detailed marks distribution and assessment status across all environmental domains under the UDA framework.
            </p>

            <div className="category-score-grid">
              {score.category_breakdown.map((cat) => {
                const pct = Math.round((cat.awarded_marks / (cat.maximum_marks || 1)) * 100);

                return (
                  <div className="category-score-card" key={cat.category_code}>
                    <div className="category-card-header">
                      <div>
                        <span className="criterion-code" style={{ margin: 0 }}>
                          {cat.category_code}
                        </span>
                        <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.05rem" }}>
                          {cat.category_name}
                        </h3>
                      </div>
                      <span className="status-pill active" style={{ fontSize: "0.68rem" }}>
                        {pct}%
                      </span>
                    </div>

                    <div className="category-score-display">
                      {cat.awarded_marks}
                      <small> / {cat.maximum_marks} pts</small>
                    </div>

                    <div className="category-progress-mini">
                      <div
                        className="category-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct > 50 ? "#10B981" : pct > 0 ? "var(--ga-forest)" : "var(--ga-border)",
                        }}
                      />
                    </div>

                    <div className="category-chips-row">
                      <span className="cat-chip">
                        Assessed: <strong>{cat.assessed_count} / {cat.total_criteria}</strong>
                      </span>
                      {cat.manual_review_required_count > 0 && (
                        <span className="cat-chip" style={{ color: "#92400E", borderColor: "rgba(245, 158, 11, 0.4)" }}>
                          Review: <strong>{cat.manual_review_required_count}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

