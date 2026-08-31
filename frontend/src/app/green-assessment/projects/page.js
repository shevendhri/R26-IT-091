"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectPendingDelete, setProjectPendingDelete] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    async function loadProjects() {
      try {
        if (isMounted) {
          setIsLoading(true);
          setError("");
        }

        const response = await fetch(`${API_BASE_URL}/projects`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("projects response", data);
        if (isMounted) {
          setProjects(data);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("projects load error", error);
        if (isMounted) {
          setError(error.message || "Could not load projects.");
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  async function handleDeleteProject() {
    if (!projectPendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/projects/${projectPendingDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.detail || "Project could not be deleted. Please try again.");
        return;
      }

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectPendingDelete.id),
      );
      setProjectPendingDelete(null);
      setSuccessMessage("Project deleted successfully.");
    } catch (deleteError) {
      console.error("project delete error", deleteError);
      setError("Project could not be deleted. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href="/green-assessment">
          Back
        </Link>
        <h1>Projects</h1>
        <p className="lede">
          View created projects and open project records for future assessment
          work.
        </p>
        <div className="actions">
          <Link className="button primary" href="/green-assessment/projects/create">
            Create New Project
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="notice" role="status">
          Loading projects...
        </div>
      ) : null}

      {error ? (
        <div className="notice error" role="alert">
          {error}
        </div>
      ) : null}
      {successMessage ? (
        <div className="notice success" role="status">
          {successMessage}
        </div>
      ) : null}

      {!isLoading && !error && projects.length === 0 ? (
        <div className="empty">No projects found.</div>
      ) : null}

      {!isLoading && !error && projects.length > 0 ? (
        <section className="project-list">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-header">
                <div>
                  <p className="project-id">Project ID: {project.id}</p>
                  <h2>{project.project_name}</h2>
                </div>
                <div className="actions compact-actions">
                  <Link className="button" href={`/green-assessment/projects/${project.id}`}>
                    View Details
                  </Link>
                  <button
                    className="button danger-button"
                    onClick={() => {
                      setProjectPendingDelete(project);
                      setError("");
                      setSuccessMessage("");
                    }}
                    type="button"
                  >
                    Delete Project
                  </button>
                </div>
              </div>

              <dl className="project-meta">
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
              </dl>
            </article>
          ))}
        </section>
      ) : null}

      {projectPendingDelete ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="delete-project-title"
            aria-modal="true"
            className="confirmation-dialog"
            role="dialog"
          >
            <p className="eyebrow">Delete Project</p>
            <h2 id="delete-project-title">
              Delete {projectPendingDelete.project_name}?
            </h2>
            <p>
              Are you sure you want to delete this project? This will remove the
              project and its uploaded documents, analysis results, assessment
              data, and recommendations. This action cannot be undone.
            </p>
            <div className="form-actions">
              <button
                className="button"
                disabled={isDeleting}
                onClick={() => setProjectPendingDelete(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="button danger-button"
                disabled={isDeleting}
                onClick={handleDeleteProject}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
