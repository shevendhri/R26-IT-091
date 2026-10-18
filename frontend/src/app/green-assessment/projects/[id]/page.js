"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { fetchFromApi } from "@/lib/green-assessment/api";

export default function ProjectDetailsPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        // Fetch project metadata
        const projectData = await fetchFromApi(`/projects/${id}`);
        setProject(projectData);

        // Fetch preliminary score snapshot (safe fallback if empty)
        try {
          const scoreData = await fetchFromApi(`/projects/${id}/uda-score`);
          setScore(scoreData);
        } catch (_) {
          // Score summary may not exist yet if unassessed
        }
      } catch (requestError) {
        setError(`Could not load project. ${requestError.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  const formattedGfa =
    project?.gross_floor_area != null
      ? Number(project.gross_floor_area).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " m²"
      : "Not specified";

  return (
    <main className="page-shell">
      {/* ── UNIFIED PROJECT WORKFLOW SUB-NAVIGATION ── */}
      <nav className="project-subnav-bar" aria-label="Project Sub Navigation">
        <Link className="project-subnav-link active" href={`/green-assessment/projects/${id}`}>
          01 / Overview ★
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
        <Link className="project-subnav-link" href={`/green-assessment/projects/${id}/recommendations`}>
          06 / Recommendations
        </Link>
      </nav>

      {/* ── ARCHITECTURAL HERO HEADER ── */}
      <header className="page-header hero-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <Link className="back-link" href="/green-assessment/projects" style={{ margin: 0 }}>
            ← All Projects
          </Link>
          <span className="eyebrow" style={{ margin: 0 }}>
            UDA GREEN CERTIFICATION PRE-ASSESSMENT
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
          <div>
            <h1>{project ? project.project_name : "Project Details"}</h1>
            <p className="lede" style={{ marginBottom: "1rem" }}>
              Comprehensive design-stage evaluation against Sri Lankan Urban Development Authority (UDA)
              green building certification criteria, planning evidence, and point optimization.
            </p>

            {project && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className="cat-score-pill">
                  <span className="cat-code">TYPE:</span> {project.building_type || "General"}
                </span>
                <span className="cat-score-pill">
                  <span className="cat-code">LOCATION:</span> {project.location || "Colombo"}
                </span>
                <span className="cat-score-pill">
                  <span className="cat-code">GFA:</span> {formattedGfa}
                </span>
                {project.owner_name && (
                  <span className="cat-score-pill">
                    <span className="cat-code">CLIENT:</span> {project.owner_name}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="actions" style={{ marginTop: "0.5rem" }}>
            <Link className="button" href="/green-assessment/criteria">
              View Criteria Catalog
            </Link>
            <Link className="button primary" href={`/green-assessment/projects/${id}/analysis`}>
              Run Evidence Analysis →
            </Link>
          </div>
        </div>
      </header>

      {/* ── LOADING & ERROR NOTICES ── */}
      {isLoading && (
        <div className="notice" role="status" style={{ textAlign: "center", padding: "2rem" }}>
          Loading project data and pre-assessment scorecard...
        </div>
      )}

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {!isLoading && !error && project && (
        <>
          {/* Executive Score Snapshot (If Available) */}
          {score && (
            <section className="score-snapshot-panel">
              <div className="score-snapshot-header">
                <div>
                  <span className="eyebrow" style={{ color: "var(--ga-forest)", margin: 0 }}>
                    CURRENT DESIGN-STAGE SCORE STATUS
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginTop: "0.25rem" }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.75rem", fontWeight: 900, color: "var(--ga-forest)" }}>
                      {score.total_awarded_marks} / {score.total_configured_max_marks} pts
                    </span>
                    <span className="status-pill active" style={{ fontSize: "0.72rem" }}>
                      {score.current_preassessment_level || "Below Certification Threshold"}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ga-text-muted)", display: "block" }}>
                    Target to Next Level ({score.next_preassessment_level || "Certified"}):
                  </span>
                  <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.2rem", color: "#065F46" }}>
                    +{score.marks_to_next_level} pts required
                  </strong>
                </div>
              </div>

              {/* UDA Category Breakdown Pills */}
              {score.category_breakdown && score.category_breakdown.length > 0 && (
                <div>
                  <span style={{ fontSize: "0.68rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: "uppercase", color: "var(--ga-text-muted)" }}>
                    UDA Categories Assessment Breakdown:
                  </span>
                  <div className="cat-pills-row">
                    {score.category_breakdown.map((cat) => (
                      <span className="cat-score-pill" key={cat.category_code} title={cat.category_name}>
                        <span className="cat-code">{cat.category_code}:</span>
                        <span>{cat.awarded_marks}/{cat.maximum_marks} pts</span>
                        <span style={{ fontSize: "0.62rem", color: "var(--ga-text-muted)" }}>
                          ({cat.assessed_count}/{cat.total_criteria} assessed)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Architectural Project Specification Matrix */}
          <section className="project-spec-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="eyebrow" style={{ color: "var(--ga-forest)" }}>
                ARCHITECTURAL SPECIFICATION MATRIX
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--ga-text-muted)" }}>
                System Reference: ID #{project.id}
              </span>
            </div>

            <div className="spec-matrix-grid">
              <div className="spec-matrix-box">
                <span className="spec-label">Building Typology</span>
                <span className="spec-value">{project.building_type || "Residential"}</span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Project Location</span>
                <span className="spec-value">{project.location || "Colombo"}</span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Gross Floor Area</span>
                <span className="spec-value">{formattedGfa}</span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Client / Proponent</span>
                <span className="spec-value">{project.owner_name || "Private Proponent"}</span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Assessment Stage</span>
                <span className="spec-value">Development Authority (DA)</span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Compliance Baseline</span>
                <span className="spec-value">UDA Blue-Green Guidelines</span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Registered On</span>
                <span className="spec-value" style={{ fontSize: "0.95rem" }}>
                  {project.created_at ? new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Active"}
                </span>
              </div>
              <div className="spec-matrix-box">
                <span className="spec-label">Last Evaluated</span>
                <span className="spec-value" style={{ fontSize: "0.95rem" }}>
                  {project.updated_at ? new Date(project.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Pending"}
                </span>
              </div>

              {project.description && (
                <div className="spec-matrix-box full-col">
                  <span className="spec-label">Project Narrative & Scope</span>
                  <p className="spec-desc">{project.description}</p>
                </div>
              )}
            </div>
          </section>

          {/* Interactive Workflow Pipeline */}
          <section style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
              <div>
                <h2 style={{ textTransform: "uppercase", fontSize: "1.15rem", margin: 0 }}>
                  Certification Assessment Workflow
                </h2>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "var(--ga-text-muted)" }}>
                  Follow the 5-step evaluation pipeline to compile evidence, assess criteria, and maximize UDA marks.
                </p>
              </div>
            </div>

            <div className="workflow-pipeline-grid">
              {/* Step 1 */}
              <article className="workflow-step-card active-step">
                <div>
                  <span className="step-kicker">STEP 01 / EVIDENCE</span>
                  <h3>Project Documents</h3>
                  <p>
                    Upload architectural plans, engineering schedules, specs, and energy simulation reports for UDA analysis.
                  </p>
                </div>
                <div className="workflow-step-actions">
                  <Link className="button primary" href={`/green-assessment/projects/${id}/documents`}>
                    Open Documents →
                  </Link>
                </div>
              </article>

              {/* Step 2 */}
              <article className="workflow-step-card active-step">
                <div>
                  <span className="step-kicker">STEP 02 / CLASSIFICATION</span>
                  <h3>UDA Evidence Analysis</h3>
                  <p>
                    Automated document parsing & AI heuristic evidence extraction mapped directly against 44 UDA criteria.
                  </p>
                </div>
                <div className="workflow-step-actions">
                  <Link className="button primary" href={`/green-assessment/projects/${id}/analysis`}>
                    Run Analysis →
                  </Link>
                </div>
              </article>

              {/* Step 3 */}
              <article className="workflow-step-card active-step">
                <div>
                  <span className="step-kicker">STEP 03 / EVALUATION</span>
                  <h3>Evidence Scoring & Review</h3>
                  <p>
                    Verify extracted values or enter manual technical assessments for land, energy, water, and indoor environmental quality.
                  </p>
                </div>
                <div className="workflow-step-actions">
                  <Link className="button" href={`/green-assessment/projects/${id}/analysis`}>
                    Evidence Scoring
                  </Link>
                  <Link className="button" href={`/green-assessment/projects/${id}/assessment`}>
                    Manual Inputs
                  </Link>
                </div>
              </article>

              {/* Step 4 */}
              <article className="workflow-step-card active-step">
                <div>
                  <span className="step-kicker">STEP 04 / SCORECARD</span>
                  <h3>Score Summary</h3>
                  <p>
                    Inspect detailed score breakdown across all 7 UDA categories, earned marks, points lost, and next certification tier gaps.
                  </p>
                </div>
                <div className="workflow-step-actions">
                  <Link className="button" href={`/green-assessment/projects/${id}/score`}>
                    View Scorecard →
                  </Link>
                </div>
              </article>

              {/* Step 5 */}
              <article className="workflow-step-card active-step">
                <div>
                  <span className="step-kicker">STEP 05 / OPTIMIZATION</span>
                  <h3>Design Recommendations</h3>
                  <p>
                    Explore deterministic scoring improvement paths: Low-Cost ROI, Maximum Marks, or Target Certification Band (Certified, Silver, Gold, Platinum).
                  </p>
                </div>
                <div className="workflow-step-actions">
                  <Link className="button primary" href={`/green-assessment/projects/${id}/recommendations`}>
                    View Recommendations ★
                  </Link>
                </div>
              </article>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
