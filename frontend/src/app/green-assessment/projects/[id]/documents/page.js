"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

import { API_BASE_URL, fetchFromApi } from "@/lib/green-assessment/api";

const documentCategories = [
  "BOQ / Cost Documents",
  "Material Specifications",
  "Energy Reports",
  "Water Reports",
  "Indoor Environmental Quality Reports",
  "Sustainable Site and Environmental Management Reports",
  "Green Innovation Documents",
  "Socio-Cultural Compatibility Documents",
  "Certificates",
  "Other",
];

const supportedFileTypes = ".pdf,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg";

export default function ProjectDocumentsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState("Energy Reports");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreparingAnalysis, setIsPreparingAnalysis] = useState(false);
  const [preparationMessage, setPreparationMessage] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [extractingDocumentId, setExtractingDocumentId] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewText, setPreviewText] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [chunkDocument, setChunkDocument] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [chunkDrafts, setChunkDrafts] = useState({});
  const [chunkLoadingDocumentId, setChunkLoadingDocumentId] = useState(null);
  const [chunkGeneratingDocumentId, setChunkGeneratingDocumentId] = useState(null);
  const [savingChunkId, setSavingChunkId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProjectDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [projectData, documentData] = await Promise.all([
        fetchFromApi(`/projects/${id}`),
        fetchFromApi(`/projects/${id}/documents`),
      ]);
      setProject(projectData);
      setDocuments(documentData);
    } catch (requestError) {
      console.error("documents load error", requestError);
      setError(`Could not load project documents. ${requestError.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectDocuments();
  }, [loadProjectDocuments]);

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] || null);
    setSuccessMessage("");
    setError("");
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setSelectedFile(droppedFile);
      setSuccessMessage("");
      setError("");
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a document before uploading.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("document_category", documentCategory);

      const response = await fetch(`${API_BASE_URL}/projects/${id}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("uploaded document", data);

      if (!response.ok) {
        throw new Error(data.detail || `Upload failed with status ${response.status}`);
      }

      setSelectedFile(null);
      setSuccessMessage("Document uploaded successfully.");
      await loadProjectDocuments();
    } catch (uploadError) {
      console.error("document upload error", uploadError);
      setError(uploadError.message || "Could not upload document.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(documentId) {
    try {
      setDeletingDocumentId(documentId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/projects/${id}/documents/${documentId}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      console.log("deleted document", data);

      if (!response.ok) {
        throw new Error(data.detail || `Delete failed with status ${response.status}`);
      }

      setSuccessMessage("Document deleted successfully.");
      if (chunkDocument?.id === documentId) {
        setChunkDocument(null);
        setChunks([]);
        setChunkDrafts({});
      }
      await loadProjectDocuments();
    } catch (deleteError) {
      console.error("document delete error", deleteError);
      setError(deleteError.message || "Could not delete document.");
    } finally {
      setDeletingDocumentId(null);
    }
  }

  async function handleViewUdaAnalysis() {
    try {
      setIsPreparingAnalysis(true);
      setPreparationMessage("Preparing documents for UDA analysis...");
      setError("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/projects/${id}/prepare-uda-analysis`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("prepared uda analysis", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "One or more documents could not be processed. Please check the uploaded file and try again.",
        );
      }

      setPreparationMessage("UDA analysis is ready.");
      router.push(`/green-assessment/projects/${id}/analysis`);
    } catch (prepareError) {
      console.error("prepare uda analysis error", prepareError);
      setError(
        prepareError.message ||
          "One or more documents could not be processed. Please check the uploaded file and try again.",
      );
    } finally {
      setIsPreparingAnalysis(false);
    }
  }

  async function handleGenerateChunks(document) {
    try {
      setChunkGeneratingDocumentId(document.id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/projects/${id}/documents/${document.id}/chunks`,
        { method: "POST" },
      );
      const data = await response.json();
      console.log("chunk generation", data);

      if (!response.ok) {
        throw new Error(data.detail || `Chunk generation failed with status ${response.status}`);
      }

      setSuccessMessage(
        data.already_exists
          ? `Chunks already exist for ${document.original_filename}.`
          : `Generated ${data.created_count} chunks for ${document.original_filename}.`,
      );
      await handleViewChunks(document);
    } catch (chunkError) {
      console.error("chunk generation error", chunkError);
      setError(chunkError.message || "Could not generate chunks.");
    } finally {
      setChunkGeneratingDocumentId(null);
    }
  }

  async function handleViewChunks(document) {
    try {
      setChunkLoadingDocumentId(document.id);
      setError("");
      setChunkDocument(document);

      const data = await fetchFromApi(`/projects/${id}/documents/${document.id}/chunks`);
      console.log("document chunks", data);
      setChunks(data);
      setChunkDrafts(
        Object.fromEntries(
          data.map((chunk) => [
            chunk.id,
            {
              human_label: chunk.human_label || "",
              evidence_type: chunk.evidence_type || "",
              is_relevant:
                chunk.is_relevant === null || chunk.is_relevant === undefined
                  ? ""
                  : String(chunk.is_relevant),
              annotation_status: chunk.annotation_status || "unlabelled",
              annotation_notes: chunk.annotation_notes || "",
            },
          ]),
        ),
      );
    } catch (chunkError) {
      console.error("chunk load error", chunkError);
      setError(chunkError.message || "Could not load chunks.");
    } finally {
      setChunkLoadingDocumentId(null);
    }
  }

  function handleChunkDraftChange(chunkId, fieldName, fieldValue) {
    setChunkDrafts((currentDrafts) => ({
      ...currentDrafts,
      [chunkId]: {
        ...currentDrafts[chunkId],
        [fieldName]: fieldValue,
      },
    }));
  }

  async function handleSaveChunk(chunkId) {
    const draft = chunkDrafts[chunkId];
    if (!draft) {
      return;
    }

    try {
      setSavingChunkId(chunkId);
      setError("");
      setSuccessMessage("");

      const payload = {
        human_label: draft.human_label || null,
        evidence_type: draft.evidence_type || null,
        is_relevant: draft.is_relevant === "" ? null : draft.is_relevant === "true",
        annotation_status: draft.annotation_status,
        annotation_notes: draft.annotation_notes || null,
      };

      const response = await fetch(`${API_BASE_URL}/projects/${id}/chunks/${chunkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("saved chunk annotation", data);

      if (!response.ok) {
        throw new Error(data.detail || `Save failed with status ${response.status}`);
      }

      setChunks((currentChunks) =>
        currentChunks.map((chunk) => (chunk.id === chunkId ? data : chunk)),
      );
      setSuccessMessage("Chunk annotation saved.");
    } catch (saveError) {
      console.error("chunk annotation save error", saveError);
      setError(saveError.message || "Could not save chunk annotation.");
    } finally {
      setSavingChunkId(null);
    }
  }

  async function handleExtract(documentId) {
    try {
      setExtractingDocumentId(documentId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/projects/${id}/documents/${documentId}/extract`,
        { method: "POST" },
      );
      const data = await response.json();
      console.log("document extraction", data);

      if (!response.ok) {
        throw new Error(data.detail || `Extraction failed with status ${response.status}`);
      }

      if (data.extraction_status === "failed") {
        setError(data.extraction_error || "Text extraction failed.");
      } else {
        setSuccessMessage("Text extracted successfully.");
      }

      await loadProjectDocuments();
    } catch (extractError) {
      console.error("document extraction error", extractError);
      setError(extractError.message || "Could not extract document text.");
    } finally {
      setExtractingDocumentId(null);
    }
  }

  async function handleViewText(document) {
    try {
      setPreviewDocument(document);
      setPreviewText("");
      setIsPreviewLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/projects/${id}/documents/${document.id}/text`,
      );
      const data = await response.json();
      console.log("document text", data);

      if (!response.ok) {
        throw new Error(data.detail || `Could not load text with status ${response.status}`);
      }

      setPreviewText(data.extracted_text);
    } catch (previewError) {
      console.error("document text preview error", previewError);
      setError(previewError.message || "Could not load extracted text.");
      setPreviewDocument(null);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  function formatExtractionStatus(status) {
    const labels = {
      not_processed: "Not Processed",
      processing: "Processing",
      extracted: "Extracted",
      failed: "Failed",
    };
    return labels[status] || "Not Processed";
  }

  function formatAnalysisReadiness(document) {
    if (document.extraction_status === "failed") {
      return "Processing Failed";
    }
    if (
      document.extraction_status === "extracted" &&
      (document.extracted_char_count || 0) > 0
    ) {
      return "Ready for Analysis";
    }
    if (document.extraction_status === "processing") {
      return "Processing";
    }
    return "Uploaded";
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href={`/green-assessment/projects/${id}`}>
          Back to Project Details
        </Link>
        <p className="eyebrow">Evidence Intake</p>
        <h1>Document Upload & Evidence Management</h1>
        <p className="lede">
          Upload project evidence files for this project. The system prepares
          document text and sections automatically when you view the UDA
          document analysis.
        </p>
        <div className="actions">
          <button
            className="button primary"
            disabled={isPreparingAnalysis || documents.length === 0}
            onClick={handleViewUdaAnalysis}
            type="button"
          >
            {isPreparingAnalysis
              ? "Preparing documents for UDA analysis..."
              : "View UDA Document Analysis"}
          </button>
        </div>
      </header>

      {isLoading ? <div className="notice">Loading project documents...</div> : null}
      {error ? <div className="notice error">{error}</div> : null}
      {successMessage ? (
        <div className="notice success">{successMessage}</div>
      ) : null}
      {preparationMessage ? (
        <div className="notice">{preparationMessage}</div>
      ) : null}

      {!isLoading && project ? (
        <>
          <section className="project-card details-card">
            <p className="project-id">Project ID: {project.id}</p>
            <h2>{project.project_name}</h2>
          </section>

          <section
            className={`upload-panel ${isDragging ? "upload-panel-active" : ""}`}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p className="eyebrow">Upload Evidence Document</p>
            <h2>Drop a file here or choose a document from your computer</h2>
            <p>
              Supported files: PDF, DOCX, XLSX, XLS, CSV, PNG, JPG, and JPEG.
              Documents are stored only under this selected project.
            </p>

            <div className="upload-controls">
              <label>
                Document Category
                <select
                  value={documentCategory}
                  onChange={(event) => setDocumentCategory(event.target.value)}
                >
                  {documentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select File
                <input
                  accept={supportedFileTypes}
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
            </div>

            {selectedFile ? (
              <p>
                Selected file: <strong>{selectedFile.name}</strong>
              </p>
            ) : null}

            <button
              className="button primary"
              disabled={isUploading}
              onClick={handleUpload}
              type="button"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
          </section>

          <section className="score-section">
            <h2>Allowed Document Categories</h2>
            <div className="prototype-grid">
              {documentCategories.map((category) => (
                <article className="prototype-card" key={category}>
                  <p className="criterion-code">Evidence Class</p>
                  <h3>{category}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="score-section">
            <h2>Uploaded Documents</h2>
            {documents.length === 0 ? (
              <div className="empty">No documents uploaded for this project.</div>
            ) : (
              <div className="prototype-table documents-table">
                <div className="prototype-table-row prototype-table-head">
                  <span>Document Name</span>
                  <span>Category</span>
                  <span>File Type</span>
                  <span>Upload Status</span>
                  <span>Processing Status</span>
                  <span>Analysis Readiness</span>
                  <span>Uploaded Date</span>
                  <span>Actions</span>
                </div>
                {documents.map((document) => (
                  <div className="prototype-table-row" key={document.id}>
                    <span>{document.original_filename}</span>
                    <span>{document.document_category}</span>
                    <span>{document.file_type}</span>
                    <span>{document.upload_status}</span>
                    <span>{document.processing_status}</span>
                    <span>{formatAnalysisReadiness(document)}</span>
                    <span>
                      {new Date(document.uploaded_at).toLocaleString()}
                    </span>
                    <span className="document-actions">
                      <button
                        className="button"
                        disabled={deletingDocumentId === document.id}
                        onClick={() => handleDelete(document.id)}
                        type="button"
                      >
                        {deletingDocumentId === document.id ? "Deleting..." : "Delete"}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </>
      ) : null}
    </main>
  );
}
