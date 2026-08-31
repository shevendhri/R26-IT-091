"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { fetchFromApi } from "@/lib/green-assessment/api";

export default function ProjectDetailsPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchFromApi(`/projects/${id}`);
        setProject(data);
      } catch (requestError) {
        setError(`Could not load project. ${requestError.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [id]);

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href="/green-assessment/projects">
          Back to Projects
        </Link>
        <h1>{project ? project.project_name : "Project Details"}</h1>
        <p className="lede">
          Review core project information before adding assessments and score
          review workflows.
        </p>
        <div className="actions">
          <Link className="button" href="/green-assessment/criteria">
            View UDA Criteria
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="notice" role="status">
          Loading project details...
        </div>
      ) : null}

      {error ? (
        <div className="notice error" role="alert">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && project ? (
        <>
          <section className="project-card details-card">
            <div className="project-card-header">
              <div>
                <p className="project-id">Project ID: {project.id}</p>
                <h2>{project.project_name}</h2>
              </div>
            </div>

            <dl className="project-meta details-meta">
              <div>
                <dt>Building type</dt>
                <dd>{project.building_type || "Not specified"}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{project.location || "Not specified"}</dd>
              </div>
              <div>
                <dt>Gross floor area</dt>
                <dd>
                  {project.gross_floor_area !== null &&
                  project.gross_floor_area !== undefined
                    ? project.gross_floor_area
                    : "Not specified"}
                </dd>
              </div>
              <div>
                <dt>Owner name</dt>
                <dd>{project.owner_name || "Not specified"}</dd>
              </div>
              <div className="full-width">
                <dt>Description</dt>
                <dd>{project.description || "Not specified"}</dd>
              </div>
            </dl>
          </section>

          <section className="placeholder-grid workflow-grid">
            <article className="placeholder-panel">
              <p className="criterion-code">Step 01</p>
              <h2>Documents</h2>
              <p>Collect project evidence files for UDA review.</p>
              <Link className="button" href={`/green-assessment/projects/${id}/documents`}>
                Open Document Upload
              </Link>
            </article>
            <article className="placeholder-panel">
              <p className="criterion-code">Step 02</p>
              <h2>UDA Document Analysis</h2>
              <p>Identify candidate UDA criterion evidence for specialist review.</p>
              <Link className="button" href={`/green-assessment/projects/${id}/analysis`}>
                Open UDA Analysis
              </Link>
            </article>
            <article className="placeholder-panel">
              <p className="criterion-code">Step 03</p>
              <h2>Evidence Scoring / Assessment</h2>
              <p>Review extracted scoring values or enter manual assessment inputs.</p>
              <Link className="button" href={`/green-assessment/projects/${id}/analysis`}>
                Open Evidence Scoring
              </Link>
              <Link className="button" href={`/green-assessment/projects/${id}/assessment`}>
                Open Manual Assessment
              </Link>
            </article>
            <article className="placeholder-panel">
              <p className="criterion-code">Step 04</p>
              <h2>Score Summary</h2>
              <p>Review score totals, category scores, and lost points.</p>
              <Link className="button" href={`/green-assessment/projects/${id}/score`}>
                View Score Summary
              </Link>
            </article>
            <article className="placeholder-panel">
              <p className="criterion-code">Step 05</p>
              <h2>Recommendations</h2>
              <p>Review priority actions and possible point gains.</p>
              <Link className="button" href={`/green-assessment/projects/${id}/recommendations`}>
                View Recommendations
              </Link>
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}
