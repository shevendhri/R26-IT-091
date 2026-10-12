import { useRef, useState, useEffect } from "react";

export default function FloorUploadCard({ floor, index, onLabelChange, onResult, onRemove }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    if (file.type === "application/pdf") {
      setPreview("pdf");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleAnalyze() {
    if (!file) { setError("Please select a floor plan image or PDF."); return; }
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
      form.append(isSvg ? "svg" : "png", file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/analyze`, { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      onResult(index, data);
    } catch (err) {
      setError(err.message || "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const done = !!floor.result;

  return (
    <div className={`bg-eco-card backdrop-blur rounded-card shadow-card p-5 border transition-all duration-300
      ${done    ? "border-brand-green shadow-glow" :
        loading ? "border-brand-blue shadow-lg shadow-brand-blue/20 animate-pulse-border" :
                  "border-eco-border hover:border-eco-border-strong"}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <input
          className="input-premium font-heading text-base font-semibold px-3 py-1.5 w-44 placeholder-ink-muted"
          value={floor.label}
          onChange={e => onLabelChange(index, e.target.value)}
          placeholder="Floor name"
        />
        {index > 0 && (
          <button onClick={() => onRemove(index)} className="text-ink-muted hover:text-brand-red text-lg leading-none transition-colors">&times;</button>
        )}
      </div>

      {/* File preview */}
      {preview && preview !== "pdf" && (
        <div className="mb-3 rounded-inner overflow-hidden border border-eco-border bg-eco-black/40 max-h-40 flex items-center justify-center">
          <img src={preview} alt="preview" className="max-h-40 object-contain" />
        </div>
      )}
      {preview === "pdf" && (
        <div className="mb-3 rounded-inner border border-eco-border bg-eco-mid/30 flex items-center gap-3 px-4 py-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted flex-shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <div>
            <p className="text-sm font-medium text-ink-secondary truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-ink-muted">PDF &mdash; page 1 will be analysed</p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <FileDropZone
        file={file}
        inputRef={inputRef}
        onChange={f => { setFile(f); setError(""); }}
      />

      {error && (
        <p className="font-heading text-brand-red text-xs mt-3 bg-brand-red-dim border border-brand-red-border rounded-inner px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className={`btn-premium mt-4 w-full ${loading ? "is-loading" : ""}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analyzing&hellip;
          </span>
        ) : done ? "&#10003; Re-analyze" : "Analyze Floor Plan"}
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
      <p className="text-xs font-heading font-medium text-ink-secondary mb-1 uppercase tracking-wide">Floor Plan Image (PNG, JPG, PDF or SVG)</p>
      <div
        className={`border border-dashed rounded-inner p-4 text-center cursor-pointer transition-all
          ${dragging ? "border-brand-green bg-brand-green-dim" : "border-eco-border bg-eco-mid/20 hover:border-eco-border-strong"}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.svg"
          className="hidden"
          onChange={e => onChange(e.target.files[0] || null)}
        />
        {file ? (
          <span className="flex items-center justify-center gap-2 text-sm text-ink-secondary">
            <span className="text-brand-green">&#10003;</span>
            <span className="truncate max-w-xs">{file.name}</span>
            <button
              className="text-ink-muted hover:text-brand-red text-xs ml-1"
              onClick={e => { e.stopPropagation(); onChange(null); }}
            >&times;</button>
          </span>
        ) : (
          <div>
            <svg className="mx-auto text-ink-muted mb-2" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="text-sm text-ink-secondary">Click or drag PNG / JPG / PDF / SVG here</p>
          </div>
        )}
      </div>
    </div>
  );
}