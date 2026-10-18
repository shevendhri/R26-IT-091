"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/green-assessment/api";

const initialFormData = {
  project_name: "",
  building_type: "",
  location: "",
  gross_floor_area: "",
  owner_name: "",
  description: "",
};

export default function CreateProjectPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [createdProject, setCreatedProject] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    project_name,
    building_type,
    location,
    gross_floor_area,
    owner_name,
    description,
  } = formData;

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleCreateProject() {
    setCreatedProject(null);
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        project_name,
        building_type,
        location,
        gross_floor_area: Number(gross_floor_area),
        owner_name,
        description,
      };

      console.log("payload", payload);

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("created project", data);

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}. ${JSON.stringify(data)}`
        );
      }

      setCreatedProject(data);
    } catch (requestError) {
      console.error("Create project error:", requestError);
      setError(`Project could not be created. ${requestError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href="/green-assessment">
          Back
        </Link>
        <h1>Create Project</h1>
        <p className="lede">
          Add a building project for UDA Blue Green Sri Lanka Green Building Guidelines pre-assessment.
        </p>
      </header>

      {createdProject ? (
        <div className="notice success" role="status">
          Project created successfully. Project ID:{" "}
          <strong>{createdProject.id}</strong>
        </div>
      ) : null}

      {error ? (
        <div className="notice error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="form-panel">
        <label>
          Project name
          <input
            name="project_name"
            onChange={updateField}
            required
            type="text"
            value={formData.project_name}
          />
        </label>

        <label>
          Building type
          <input
            name="building_type"
            onChange={updateField}
            type="text"
            value={formData.building_type}
          />
        </label>

        <label>
          Location
          <input
            name="location"
            onChange={updateField}
            type="text"
            value={formData.location}
          />
        </label>

        <label>
          Gross floor area
          <input
            min="0"
            name="gross_floor_area"
            onChange={updateField}
            step="0.01"
            type="number"
            value={formData.gross_floor_area}
          />
        </label>

        <label>
          Owner name
          <input
            name="owner_name"
            onChange={updateField}
            type="text"
            value={formData.owner_name}
          />
        </label>

        <label className="full-width">
          Description
          <textarea
            name="description"
            onChange={updateField}
            rows="5"
            value={formData.description}
          />
        </label>

        <div className="form-actions">
          <button
            className="button primary"
            disabled={isSubmitting}
            onClick={handleCreateProject}
            type="button"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </main>
  );
}

