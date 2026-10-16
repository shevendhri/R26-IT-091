import { useRef, useState, useEffect } from "react";

export default function FloorUploadCard({ floor, index, onLabelChange, onResult, onRemove }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.type === "application/pdf") {
      setPreview("pdf");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleAnalyze() {
    if (!file) {
      setError("Please select a floor plan image or PDF drawing.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
      form.append(isSvg ? "svg" : "png", file);
      const apiUrl = process.env.NEXT_PUBLIC_BLUEPRINT_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/analyze`, { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      onResult(index, data);
    } catch (err) {
      setError(err.message || "Analysis failed. Ensure Plan Analyzer gateway is active.");
    } finally {
      setLoading(false);
    }
  }

  const done = !!floor.result;

  return (
    <div className={`plan-level-card ${done ? "is-done" : ""} ${loading ? "is-loading" : ""}`}>
      {/* Level Header with Name & Remove Button */}
      <div className="plan-level-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
          <span style={{ fontSize: "0.70rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: "#143825" }}>
            L{index + 1}:
          </span>
          <input
            className="plan-level-input"
            value={floor.label}
            onChange={(e) => onLabelChange(index, e.target.value)}
            placeholder="Level name"
          />
        </div>
        {index > 0 && (
          <button
            onClick={() => onRemove(index)}
            className="plan-remove-btn"
            title="Remove level"
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {/* File Preview */}
      {preview && preview !== "pdf" && (
        <div style={{
          marginBottom: "0.75rem",
          borderRadius: "3px",
          overflow: "hidden",
          border: "1px solid #E2DCD0",
          background: "#FAF7F0",
          maxHeight: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <img src={preview} alt="preview" style={{ maxHeight: "140px", width: "100%", objectFit: "contain" }} />
        </div>
      )}

      {preview === "pdf" && (
        <div style={{
          marginBottom: "0.75rem",
          borderRadius: "3px",
          border: "1px solid #E2DCD0",
          background: "#FAF7F0",
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <span style={{ fontSize: "1.5rem" }}>📄</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#143825", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {file.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "#697068" }}>
              PDF Drawing (Page 1 analyzed)
            </p>
          </div>
        </div>
      )}

      {/* File Selection Dropzone */}
      <FileDropZone
        file={file}
        inputRef={inputRef}
        onChange={(f) => {
          setFile(f);
          setError("");
        }}
      />

      {/* Error Alert */}
      {error && (
        <div style={{
          marginTop: "0.75rem",
          padding: "0.5rem 0.75rem",
          background: "rgba(184, 92, 67, 0.08)",
          border: "1px solid rgba(184, 92, 67, 0.35)",
          borderRadius: "3px",
          color: "#B85C43",
          fontSize: "0.74rem",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="plan-action-btn"
        type="button"
      >
        {loading ? (
          <span>Analyzing CAD Plan...</span>
        ) : done ? (
          <span>✓ Re-Analyze Plan</span>
        ) : (
          <span>Analyze Drawing →</span>
        )}
      </button>
    </div>
  );
}

function FileDropZone({ file, inputRef, onChange }) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  }

  return (
    <div>
      <div
        className={`plan-dropzone ${dragging ? "is-dragging" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.svg"
          style={{ display: "none" }}
          onChange={(e) => onChange(e.target.files[0] || null)}
        />
        {file ? (
          <div className="plan-file-pill">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px" }}>
              ✓ {file.name}
            </span>
            <button
              style={{ background: "none", border: "none", color: "#B85C43", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              type="button"
            >
              ×
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "1.4rem", color: "#143825", marginBottom: "0.25rem" }}>📐</div>
            <p className="plan-dropzone-label">Click or Drag Blueprint Drawing</p>
            <p className="plan-dropzone-sub">Supports PNG, JPG, Vector SVG, or PDF</p>
          </div>
        )}
      </div>
    </div>
  );
}