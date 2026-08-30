"use client";

import { useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "@/lib/green-assessment/api";

export default function DatasetAnnotationPage() {
  const [chunks, setChunks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [filters, setFilters] = useState({
    source_folder: "",
    annotation_status: "",
    suggested_label: "",
    human_label: "",
    provisional_label: "",
    label_source: "",
    verification_status: "",
    criterion: "",
    filename: "",
    only_unlabelled: true,
  });
  const [selectedLabel, setSelectedLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadChunks(0);
  }, [filters]);

  useEffect(() => {
    const chunk = chunks[currentIndex];
    if (chunk) {
      loadChunkDetail(chunk.id);
    } else {
      setCurrentDetail(null);
    }
  }, [chunks, currentIndex]);

  useEffect(() => {
    function handleShortcut(event) {
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "c") {
        confirmSuggestion();
      }
      if (key === "o") {
        markOther();
      }
      if (key === "r") {
        markReviewRequired();
      }
      if (key === "s") {
        goNext();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const labels = useMemo(
    () => [...criteria.map((criterion) => criterion.criterion_code), "OTHER"],
    [criteria],
  );

  async function loadInitialData() {
    await Promise.all([loadStatistics(), loadCriteria(), loadChunks(0)]);
  }

  async function loadCriteria() {
    try {
      const response = await fetch(`${API_BASE_URL}/uda/criteria`);
      const data = await response.json();
      setCriteria(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: "error", text: `Could not load UDA labels. ${error.message}` });
    }
  }

  async function loadStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/dataset/statistics`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      setMessage({ type: "error", text: `Could not load statistics. ${error.message}` });
    }
  }

  async function loadChunks(offset = 0) {
    const query = new URLSearchParams({
      limit: "50",
      offset: String(offset),
      only_unlabelled: String(filters.only_unlabelled),
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== "only_unlabelled" && value) {
        query.set(key, value);
      }
    });

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/dataset/chunks?${query.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      setChunks(data.chunks || []);
      setCurrentIndex(0);
    } catch (error) {
      setMessage({ type: "error", text: `Could not load chunks. ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadChunkDetail(chunkId) {
    try {
      const response = await fetch(`${API_BASE_URL}/dataset/chunks/${chunkId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      setCurrentDetail(data);
      setSelectedLabel(data.suggested_label || "");
      setNotes(data.annotation_notes || "");
    } catch (error) {
      setMessage({ type: "error", text: `Could not load chunk detail. ${error.message}` });
    }
  }

  async function saveAnnotation(payload, successText) {
    if (!currentDetail) {
      return;
    }
    try {
      setIsSaving(true);
      const response = await fetch(
        `${API_BASE_URL}/dataset/chunks/${currentDetail.id}/annotation`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      setMessage({ type: "success", text: successText });
      await loadStatistics();
      goNext();
    } catch (error) {
      setMessage({ type: "error", text: `Could not save annotation. ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  function confirmSuggestion() {
    if (!currentDetail?.suggested_label) {
      setMessage({ type: "error", text: "No suggested label is available for this chunk." });
      return;
    }
    saveAnnotation(
      {
        human_label: currentDetail.suggested_label,
        is_relevant: true,
        annotation_status: "labelled",
        annotation_notes: notes || null,
      },
      "Suggestion confirmed and saved.",
    );
  }

  function saveDifferentCriterion() {
    if (!selectedLabel) {
      setMessage({ type: "error", text: "Choose a UDA criterion or OTHER first." });
      return;
    }
    saveAnnotation(
      {
        human_label: selectedLabel,
        is_relevant: selectedLabel !== "OTHER",
        annotation_status: "labelled",
        annotation_notes: notes || null,
      },
      "Final verified label saved.",
    );
  }

  function markOther() {
    setSelectedLabel("OTHER");
    saveAnnotation(
      {
        human_label: "OTHER",
        is_relevant: false,
        annotation_status: "labelled",
        annotation_notes: notes || "Marked as OTHER.",
      },
      "Chunk marked as OTHER.",
    );
  }

  function markReviewRequired() {
    saveAnnotation(
      {
        human_label: null,
        is_relevant: null,
        annotation_status: "review_required",
        annotation_notes: notes || "Need review from specialist for primary UDA label.",
      },
      "Chunk marked for specialist review.",
    );
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, Math.max(chunks.length - 1, 0)));
  }

  function goPrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  async function generateSuggestions() {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/dataset/suggestions/generate`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      setMessage({
        type: "success",
        text: `Generated ${data.suggestions_generated} suggestions. No suggestion: ${data.no_suggestion_count}.`,
      });
      await Promise.all([loadStatistics(), loadChunks(0)]);
    } catch (error) {
      setMessage({ type: "error", text: `Could not generate suggestions. ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  async function generateProvisionalLabels() {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/dataset/provisional-labels/generate`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      setMessage({
        type: "success",
        text: `Created ${data.provisional_uda_labels} provisional UDA labels and ${data.provisional_other} provisional OTHER labels. Need review from specialist: ${data.need_specialist_review}.`,
      });
      await Promise.all([loadStatistics(), loadChunks(0)]);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Could not create provisional labels. ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const reference = currentDetail?.suggested_criterion;

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Research Dataset Annotation</p>
        <h1>UDA Dataset Annotation Assistant</h1>
        <p className="lede">
          Suggested labels are deterministic keyword hints only. Provisional labels
          are rule-assisted training candidates, while final verified labels require
          specialist or researcher confirmation.
        </p>
        <div className="actions">
          <button className="button primary" onClick={generateSuggestions} type="button">
            Generate Suggestions
          </button>
          <button className="button" onClick={generateProvisionalLabels} type="button">
            Create Provisional Labels
          </button>
          <a className="button" href={`${API_BASE_URL}/dataset/export/training-candidates`}>
            Export Training Candidates
          </a>
          <a className="button" href={`${API_BASE_URL}/dataset/export/provisional-audit`}>
            Export Audit Sample
          </a>
          <a className="button" href={`${API_BASE_URL}/dataset/export/labelled`}>
            Export Labelled CSV
          </a>
          <a className="button" href={`${API_BASE_URL}/dataset/export`}>
            Export Full CSV
          </a>
        </div>
      </header>

      {statistics ? (
        <>
          <section className="score-summary-grid">
            <StatCard label="Total chunks" value={statistics.total_chunks} />
            <StatCard label="Training Candidates" value={statistics.training_candidates} />
            <StatCard label="Verified" value={statistics.verified} />
            <StatCard label="Provisional" value={statistics.provisional} />
            <StatCard
              label="Need Review From Specialist"
              value={statistics.need_specialist_review}
            />
            <StatCard label="OTHER" value={statistics.other_count} />
            <StatCard label="Progress" value={`${statistics.progress_percentage}%`} />
          </section>
          <div className="notice">{statistics.note}</div>
        </>
      ) : null}

      {message ? <div className={`notice ${message.type}`}>{message.text}</div> : null}

      <section className="form-panel">
        <label>
          Source folder
          <select
            value={filters.source_folder}
            onChange={(event) => setFilters({ ...filters, source_folder: event.target.value })}
          >
            <option value="">All folders</option>
            {statistics?.source_folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </label>
        <label>
          Annotation status
          <select
            value={filters.annotation_status}
            onChange={(event) => setFilters({ ...filters, annotation_status: event.target.value })}
          >
            <option value="">Default working set</option>
            <option value="unlabelled">unlabelled</option>
            <option value="suggested">suggested</option>
            <option value="labelled">labelled</option>
            <option value="review_required">Need review from specialist</option>
          </select>
        </label>
        <label>
          Verification status
          <select
            value={filters.verification_status}
            onChange={(event) => setFilters({ ...filters, verification_status: event.target.value })}
          >
            <option value="">All verification statuses</option>
            <option value="provisional">Provisional</option>
            <option value="verified">Verified</option>
            <option value="need_specialist_review">Need review from specialist</option>
            <option value="excluded">Excluded</option>
          </select>
        </label>
        <label>
          Label source
          <select
            value={filters.label_source}
            onChange={(event) => setFilters({ ...filters, label_source: event.target.value })}
          >
            <option value="">All label sources</option>
            {statistics?.label_sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <label>
          Criterion
          <select
            value={filters.criterion}
            onChange={(event) => setFilters({ ...filters, criterion: event.target.value })}
          >
            <option value="">All criteria</option>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Suggested criterion
          <select
            value={filters.suggested_label}
            onChange={(event) => setFilters({ ...filters, suggested_label: event.target.value })}
          >
            <option value="">All suggestions</option>
            {statistics?.suggested_labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Provisional label
          <select
            value={filters.provisional_label}
            onChange={(event) => setFilters({ ...filters, provisional_label: event.target.value })}
          >
            <option value="">All provisional labels</option>
            {statistics?.provisional_labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Final verified label
          <select
            value={filters.human_label}
            onChange={(event) => setFilters({ ...filters, human_label: event.target.value })}
          >
            <option value="">All final verified labels</option>
            {statistics?.human_labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Filename contains
          <input
            value={filters.filename}
            onChange={(event) => setFilters({ ...filters, filename: event.target.value })}
          />
        </label>
        <label className="checkbox-label">
          <input
            checked={filters.only_unlabelled}
            type="checkbox"
            onChange={(event) =>
              setFilters({ ...filters, only_unlabelled: event.target.checked })
            }
          />
          Only Unlabelled
        </label>
      </section>

      <section className="score-section">
        <h2>Current Chunk</h2>
        {isLoading ? <div className="notice">Loading dataset chunks...</div> : null}
        {!isLoading && !currentDetail ? (
          <div className="empty">No chunks found for the current filters.</div>
        ) : null}
        {currentDetail ? (
          <article className="gap-card">
            <div className="gap-heading">
              <div>
                <p className="criterion-code">
                  Chunk {currentDetail.id} | {currentDetail.source_folder}
                </p>
                <h3>{currentDetail.filename}</h3>
              </div>
              <span>Page {currentDetail.page_number || "N/A"}</span>
            </div>
            <div className="criterion-facts">
              <span>Words: {currentDetail.word_count}</span>
              <span>Status: {formatStatus(currentDetail.annotation_status)}</span>
              <span>Suggested: {currentDetail.suggested_label || "None"}</span>
              <span>Provisional: {currentDetail.provisional_label || "None"}</span>
              <span>Final Verified Label: {currentDetail.human_label || "None"}</span>
              <span>Label Source: {currentDetail.label_source || "None"}</span>
              <span>Verification: {formatStatus(currentDetail.verification_status)}</span>
              <span>Strength: {currentDetail.suggestion_confidence || "N/A"}</span>
              <span>Score: {currentDetail.suggestion_score ?? "N/A"}</span>
            </div>
            <p className="chunk-text">{currentDetail.chunk_text}</p>
            <p>Suggestion reason: {currentDetail.suggestion_reason || "No suggestion reason."}</p>
            {currentDetail.provisional_reason ? (
              <p>Provisional reason: {currentDetail.provisional_reason}</p>
            ) : null}
            {currentDetail.specialist_review_reason ? (
              <p>Specialist review reason: {currentDetail.specialist_review_reason}</p>
            ) : null}
            {currentDetail.suggestion_candidates_json ? (
              <p>
                Top candidates:{" "}
                {formatCandidates(currentDetail.suggestion_candidates_json)}
              </p>
            ) : null}

            <div className="assessment-controls">
              <label>
                Different criterion / final label
                <select
                  value={selectedLabel}
                  onChange={(event) => setSelectedLabel(event.target.value)}
                >
                  <option value="">Choose label</option>
                  {labels.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-width">
                Annotation notes
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </div>
            <div className="actions">
              <button className="button primary" disabled={isSaving} onClick={confirmSuggestion} type="button">
                Confirm Suggestion
              </button>
              <button className="button" disabled={isSaving} onClick={saveDifferentCriterion} type="button">
                Save Different Criterion
              </button>
              <button className="button" disabled={isSaving} onClick={markOther} type="button">
                Mark OTHER
              </button>
              <button className="button" disabled={isSaving} onClick={markReviewRequired} type="button">
                Need Review From Specialist
              </button>
              <button className="button" onClick={goPrevious} type="button">
                Previous
              </button>
              <button className="button" onClick={goNext} type="button">
                Skip / Next
              </button>
            </div>
            <p className="section-note">
              Shortcuts: C confirm, O OTHER, R specialist review, S skip.
            </p>
          </article>
        ) : null}
      </section>

      {reference ? (
        <section className="score-section">
          <h2>Suggested Criterion Reference</h2>
          <article className="category-card">
            <p className="criterion-code">{reference.criterion_code}</p>
            <h3>{reference.criterion_name}</h3>
            <div className="criterion-facts">
              <span>Maximum marks: {reference.maximum_marks}</span>
            </div>
            <h3>Objective</h3>
            <p>{reference.objective}</p>
            <h3>Methodology</h3>
            <p>{reference.methodology}</p>
            <h3>DA Required Documents</h3>
            <ul className="requirement-list">
              {reference.da_required_documents.map((document, index) => (
                <li key={index}>{document}</li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      {statistics ? (
        <section className="score-section">
          <h2>Label Distribution</h2>
          <div className="category-score-grid">
            {statistics.label_distribution.map((item) => (
              <div className="category-score-card" key={item.label}>
                <p className="criterion-code">{item.label}</p>
                <h3>{item.count}</h3>
                <p>{item.balance_status}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="score-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatCandidates(candidateJson) {
  try {
    const candidates = JSON.parse(candidateJson);
    return candidates
      .map((candidate) => `${candidate.label} (${candidate.score})`)
      .join(", ");
  } catch {
    return "Unavailable";
  }
}

function formatStatus(status) {
  if (!status) {
    return "None";
  }
  if (status === "review_required" || status === "need_specialist_review") {
    return "Need review from specialist";
  }
  return status.replaceAll("_", " ");
}
