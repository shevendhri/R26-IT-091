"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

export default function ProjectAssessmentPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [drafts, setDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessages, setSaveMessages] = useState({});
  const [savingCode, setSavingCode] = useState("");

  useEffect(() => {
    async function loadAssessmentData() {
      try {
        setIsLoading(true);
        setError("");

        const [projectResponse, criteriaResponse, assessmentResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/projects/${id}`),
            fetch(`${API_BASE_URL}/uda/criteria/grouped`),
            fetch(`${API_BASE_URL}/projects/${id}/uda-assessment`),
          ]);

        const projectData = await projectResponse.json();
        const criteriaData = await criteriaResponse.json();
        const assessmentData = await assessmentResponse.json();
        console.log("uda project response", projectData);
        console.log("uda criteria response", criteriaData);
        console.log("uda assessment response", assessmentData);

        if (!projectResponse.ok) {
          throw new Error(JSON.stringify(projectData));
        }
        if (!criteriaResponse.ok) {
          throw new Error(JSON.stringify(criteriaData));
        }
        if (!assessmentResponse.ok) {
          throw new Error(JSON.stringify(assessmentData));
        }

        const assessmentMap = Object.fromEntries(
          assessmentData.map((assessment) => [
            assessment.criterion_code,
            assessment,
          ]),
        );
        setProject(projectData);
        setCategories(Array.isArray(criteriaData) ? criteriaData : []);
        setAssessments(assessmentMap);
        setDrafts(
          Object.fromEntries(
            assessmentData.map((assessment) => [
              assessment.criterion_code,
              {
                metric: defaultMetricFor(assessment.criterion_code),
                value: assessment.evidence_value ?? "",
                unit: assessment.evidence_unit || "%",
                manual_marks: assessment.manual_marks ?? "",
                assessor_notes: assessment.assessor_notes || "",
                assessment_status:
                  assessment.assessment_status === "not_assessed"
                    ? "manual_review_required"
                    : assessment.assessment_status,
              },
            ]),
          ),
        );
      } catch (requestError) {
        console.error("uda assessment load error", requestError);
        setError(`Could not load UDA assessment data. ${requestError.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessmentData();
  }, [id]);

  function updateDraft(code, field, value) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [code]: {
        ...currentDrafts[code],
        [field]: value,
      },
    }));
  }

  async function evaluateCriterion(code) {
    const draft = drafts[code] || {};
    const payload = {
      metric: draft.metric || defaultMetricFor(code),
      value: draft.value === "" ? null : Number(draft.value),
      unit: draft.unit || "%",
      assessor_notes: draft.assessor_notes || null,
    };

    await submitAssessmentRequest(
      code,
      `${API_BASE_URL}/projects/${id}/uda-assessment/${code}/evaluate`,
      "POST",
      payload,
      `Automatic evaluation saved for ${code}.`,
    );
  }

  async function saveManualAssessment(code) {
    const draft = drafts[code] || {};
    const payload = {
      manual_marks: draft.manual_marks === "" ? null : Number(draft.manual_marks),
      evidence_value: draft.value === "" ? null : Number(draft.value),
      evidence_unit: draft.unit || null,
      assessment_status: draft.assessment_status || "manual_review_required",
      assessor_notes: draft.assessor_notes || null,
    };

    await submitAssessmentRequest(
      code,
      `${API_BASE_URL}/projects/${id}/uda-assessment/${code}`,
      "PATCH",
      payload,
      `Manual assessment saved for ${code}.`,
    );
  }

  async function submitAssessmentRequest(code, url, method, payload, successText) {
    setSavingCode(code);
    setSaveMessages((currentMessages) => ({ ...currentMessages, [code]: null }));

    try {
      console.log("uda assessment payload", code, payload);
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("uda assessment saved", data);

      if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data));
      }

      const assessment = data.assessment || data;
      setAssessments((currentAssessments) => ({
        ...currentAssessments,
        [code]: assessment,
      }));
      setSaveMessages((currentMessages) => ({
        ...currentMessages,
        [code]: { type: "success", text: successText },
      }));
    } catch (requestError) {
      setSaveMessages((currentMessages) => ({
        ...currentMessages,
        [code]: {
          type: "error",
          text: `Could not save ${code}. ${requestError.message}`,
        },
      }));
    } finally {
      setSavingCode("");
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href={`/green-assessment/projects/${id}`}>
          Back to Project Details
        </Link>
        <p className="eyebrow">UDA Design Pre-Assessment</p>
        <h1>{project ? project.project_name : "Project Assessment"}</h1>
        <p className="lede">
          Enter structured evidence values for machine-assessable UDA criteria
          or manual marks where the guideline requires assessor review.
        </p>
        <div className="notice">
          This is a preliminary assessment and is not an official UDA
          certification.
        </div>
        <div className="actions">
          <Link className="button" href={`/green-assessment/projects/${id}/score`}>
            View Score Summary
          </Link>
          <Link className="button" href={`/green-assessment/projects/${id}/recommendations`}>
            View Recommendations
          </Link>
        </div>
      </header>

      {isLoading ? <div className="notice">Loading UDA criteria...</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {!isLoading && !error && categories.length > 0 ? (
        <section className="category-list">
          {categories.map((category) => (
            <article className="category-card" key={category.category_code}>
              <div className="category-heading">
                <div>
                  <p className="category-code">{category.category_code}</p>
                  <h2>{category.category_name}</h2>
                </div>
                <span>{category.criteria.length} criteria</span>
              </div>

              <div className="assessment-list">
                {category.criteria.map((criterion) => {
                  const assessment = assessments[criterion.criterion_code] || {};
                  const draft = drafts[criterion.criterion_code] || {};
                  const machineAssessable =
                    criterion.scoring_status === "defined" &&
                    criterion.automation_type === "numeric_threshold";
                  const message = saveMessages[criterion.criterion_code];

                  return (
                    <div className="assessment-card" key={criterion.id}>
                      <div className="assessment-criterion">
                        <div>
                          <p className="criterion-code">
                            {criterion.criterion_code}
                          </p>
                          <h3>{criterion.criterion_name}</h3>
                          <div className="criterion-facts">
                            <span>Maximum marks: {criterion.maximum_marks}</span>
                            <span>Status: {assessment.assessment_status || "not_assessed"}</span>
                            <span>Mode: {assessment.scoring_mode || "not_machine_assessable"}</span>
                            <span>Scoring: {criterion.scoring_status}</span>
                          </div>
                          {assessment.explanation ? (
                            <p>{assessment.explanation}</p>
                          ) : null}
                          {!machineAssessable ? (
                            <div className="notice error">
                              Manual review required. Automatic scoring is not
                              enabled for this criterion.
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {message ? (
                        <div className={`notice ${message.type}`}>
                          {message.text}
                        </div>
                      ) : null}

                      <div className="assessment-controls">
                        {machineAssessable ? (
                          <>
                            <label>
                              Evidence metric
                              <input
                                value={draft.metric || defaultMetricFor(criterion.criterion_code)}
                                onChange={(event) =>
                                  updateDraft(
                                    criterion.criterion_code,
                                    "metric",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Evidence value
                              <input
                                type="number"
                                step="0.01"
                                value={draft.value ?? ""}
                                onChange={(event) =>
                                  updateDraft(
                                    criterion.criterion_code,
                                    "value",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Unit
                              <input
                                value={draft.unit || "%"}
                                onChange={(event) =>
                                  updateDraft(
                                    criterion.criterion_code,
                                    "unit",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          </>
                        ) : (
                          <>
                            <label>
                              Manual marks
                              <input
                                max={criterion.maximum_marks}
                                min="0"
                                step="0.01"
                                type="number"
                                value={draft.manual_marks ?? ""}
                                onChange={(event) =>
                                  updateDraft(
                                    criterion.criterion_code,
                                    "manual_marks",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              Assessment status
                              <select
                                value={draft.assessment_status || "manual_review_required"}
                                onChange={(event) =>
                                  updateDraft(
                                    criterion.criterion_code,
                                    "assessment_status",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="manual_review_required">
                                  manual_review_required
                                </option>
                                <option value="achieved">achieved</option>
                                <option value="partially_achieved">
                                  partially_achieved
                                </option>
                                <option value="not_achieved">not_achieved</option>
                                <option value="insufficient_evidence">
                                  insufficient_evidence
                                </option>
                              </select>
                            </label>
                          </>
                        )}

                        <label className="full-width">
                          Assessor notes
                          <textarea
                            rows="3"
                            value={draft.assessor_notes || ""}
                            onChange={(event) =>
                              updateDraft(
                                criterion.criterion_code,
                                "assessor_notes",
                                event.target.value,
                              )
                            }
                          />
                        </label>

                        <div className="form-actions">
                          <button
                            className="button primary"
                            disabled={savingCode === criterion.criterion_code}
                            onClick={() =>
                              machineAssessable
                                ? evaluateCriterion(criterion.criterion_code)
                                : saveManualAssessment(criterion.criterion_code)
                            }
                            type="button"
                          >
                            {savingCode === criterion.criterion_code
                              ? "Saving..."
                              : machineAssessable
                                ? "Evaluate"
                                : "Save Manual Marks"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function defaultMetricFor(code) {
  const metrics = {
    EE3: "renewable_energy_percentage",
    EE4: "building_energy_index",
    SM2: "redeveloped_brownfield_land_percentage",
    SM10: "carpool_vanpool_parking_percentage",
    MR1: "reused_material_value_percentage",
    MR2: "recycled_material_value_percentage",
    MR3: "existing_building_reuse_area_percentage",
    MR4: "regional_material_cost_percentage",
    MR7: "nonhazardous_construction_waste_recycled_percentage",
    WE1: "rainwater_use_percentage",
    WE2: "wastewater_recycled_percentage",
    WE4: "water_efficient_accessories_percentage",
  };
  return metrics[code] || "manual_review";
}
