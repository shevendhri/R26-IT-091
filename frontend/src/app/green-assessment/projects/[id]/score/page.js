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
      <header className="page-header">
        <Link className="back-link" href={`/green-assessment/projects/${id}`}>
          Back to Project Details
        </Link>
        <p className="eyebrow">UDA Design Pre-Assessment</p>
        <h1>{score ? score.project_name : "Project Score"}</h1>
        <p className="lede">
          Review preliminary UDA design-stage marks calculated from saved
          project-specific assessment inputs.
        </p>
        <div className="notice">
          This is a preliminary assessment and is not an official UDA
          certification.
        </div>
        <div className="actions">
          <Link className="button" href={`/green-assessment/projects/${id}/assessment`}>
            View Manual Assessment
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/recommendations`}>
            View Recommendations
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
          <section className="score-summary-grid">
            <div className="score-card">
              <span>Project ID</span>
              <strong>{score.project_id}</strong>
            </div>
            <div className="score-card">
              <span>Current Proposed Score</span>
              <strong>
                {score.total_awarded_marks} / {score.total_configured_max_marks}
              </strong>
            </div>
            <div className="score-card">
              <span>Current Pre-Assessment Level</span>
              <strong>{score.current_preassessment_level}</strong>
            </div>
            <div className="score-card">
              <span>Next Level</span>
              <strong>
                {score.highest_level_reached
                  ? "Highest Level Reached"
                  : score.next_preassessment_level}
              </strong>
            </div>
            <div className="score-card">
              <span>Marks to Next Level</span>
              <strong>+{score.marks_to_next_level}</strong>
            </div>
            <div className="score-card">
              <span>Automatic marks</span>
              <strong>{score.automatically_assessed_marks}</strong>
            </div>
            <div className="score-card">
              <span>Manual marks</span>
              <strong>{score.manually_assessed_marks}</strong>
            </div>
            <div className="score-card">
              <span>Assessed criteria</span>
              <strong>{score.number_assessed}</strong>
            </div>
            <div className="score-card">
              <span>Pending criteria</span>
              <strong>{score.number_not_assessed}</strong>
            </div>
            <div className="score-card">
              <span>Manual review count</span>
              <strong>{score.number_manual_review_required}</strong>
            </div>
          </section>

          <section className="score-section">
            <h2>Pre-Assessment Level Progress</h2>
            <div className="criterion-facts">
              {[
                "Below Certification Threshold",
                "Certified",
                "Silver",
                "Gold",
                "Platinum",
              ].map((level) => (
                <span
                  className={
                    level === score.current_preassessment_level
                      ? "status-pill active"
                      : "status-pill"
                  }
                  key={level}
                >
                  {level}
                </span>
              ))}
            </div>
            <p className="section-note">
              {score.highest_level_reached
                ? "The project currently reaches the highest configured pre-assessment level."
                : `${score.marks_to_next_level} additional marks are required to reach the ${score.next_preassessment_level} pre-assessment level.`}
            </p>
          </section>

          <section className="score-section">
            <h2>Category Breakdown</h2>
            <div className="category-score-grid">
              {score.category_breakdown.map((categoryScore) => (
                <div
                  className="category-score-card"
                  key={categoryScore.category_code}
                >
                  <p className="criterion-code">{categoryScore.category_code}</p>
                  <h3>{categoryScore.category_name}</h3>
                  <p>
                    {categoryScore.awarded_marks} / {categoryScore.maximum_marks}
                  </p>
                  <p>
                    Assessed: {categoryScore.assessed_count} /{" "}
                    {categoryScore.total_criteria}
                  </p>
                  <p>
                    Manual review:{" "}
                    {categoryScore.manual_review_required_count}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
