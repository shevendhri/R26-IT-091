"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE = "http://localhost:5000";

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseProjectInfo(raw) {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function parseRecommendation(raw) {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso + "Z").toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── HistoryCard component ─────────────────────────────────────────────────────
function HistoryCard({ entry, selected, onSelect, onDelete, onView }) {
  const info = parseProjectInfo(entry.project_info);
  const rec = parseRecommendation(entry.recommendation);
  const metrics = rec?.metrics || {};
  const hybridScore = metrics?.average_hybrid_score ?? metrics?.hybrid_score ?? null;
  const climate = rec?.climate_profile?.zone || rec?.climate_profile?.climate_zone || info?.climate_zone || "—";
  const location = info?.location || "—";
  const buildingType = info?.building_type || rec?.building_type || "—";
  const floors = info?.floor_count ?? info?.floors ?? "—";
  const area = info?.total_area ? `${info.total_area} m²` : "—";

  return (
    <div style={{
      background: selected ? "#EDF5EE" : "#FFFFFF",
      border: selected ? "1.5px solid #1E5438" : "1px solid #C4CFC6",
      borderTop: selected ? "3px solid #1E5438" : "3px solid #4A7A5C",
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      boxShadow: selected
        ? "0 4px 20px rgba(30,84,56,0.15)"
        : "0 2px 12px rgba(24,37,31,0.06)",
      cursor: "default",
      position: "relative",
    }}>
      {/* Selected badge */}
      {selected && (
        <div style={{
          position: "absolute", top: 12, right: 14,
          background: "#1E5438", color: "#FFFFFF",
          fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em",
          padding: "3px 9px", borderRadius: 20, fontFamily: "Space Grotesk"
        }}>SELECTED</div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.68rem", color: "#4A5E52", letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            {fmtDate(entry.created_at)}
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#18251F", fontFamily: "Space Grotesk, sans-serif" }}>
            {location} &mdash; {buildingType}
          </div>
        </div>
        {hybridScore !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.6rem", color: "#4A5E52", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, fontWeight: 600 }}>Hybrid Score</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1E5438", fontFamily: "Space Grotesk" }}>
              {Number(hybridScore).toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Info chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[
          { label: "Climate", value: climate },
          { label: "Floors", value: floors },
          { label: "Area", value: area },
          { label: "ID", value: `#${entry.id}` },
        ].map(({ label, value }) => (
          <span key={label} style={{
            background: "#F5F7F3", border: "1px solid #C4CFC6",
            borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem",
            color: "#18251F", fontWeight: 500
          }}>
            <span style={{ color: "#4A5E52", marginRight: 4 }}>{label}:</span>{value}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        <button
          onClick={() => onView(entry.id)}
          style={{
            flex: 1, minWidth: 80,
            background: "#EEF4FB", border: "1px solid #DBE8F4",
            color: "#2B5C8A", borderRadius: 8, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#DBE8F4"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#EEF4FB"; }}
        >VIEW</button>
        <button
          onClick={() => onSelect(entry.id)}
          style={{
            flex: 1, minWidth: 95,
            background: selected ? "#DCE9DC" : "#F5F7F3",
            border: `1px solid ${selected ? "#1E5438" : "#C4CFC6"}`,
            color: selected ? "#1E5438" : "#4A5E52", borderRadius: 8, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#DCE9DC"; e.currentTarget.style.color = "#1E5438"; }}
          onMouseLeave={e => { e.currentTarget.style.background = selected ? "#DCE9DC" : "#F5F7F3"; e.currentTarget.style.color = selected ? "#1E5438" : "#4A5E52"; }}
        >{selected ? "DESELECT" : "SELECT"}</button>
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            background: "#FDF2EE", border: "1px solid #F2DDD5",
            color: "#A8492E", borderRadius: 8, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F2DDD5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FDF2EE"; }}
        >DELETE</button>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(18, 28, 22, 0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#FFFFFF", border: "1px solid #C4CFC6",
        borderRadius: 16, padding: "32px 36px", maxWidth: 420, width: "90%",
        boxShadow: "0 16px 48px rgba(24, 37, 31, 0.18)",
      }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#18251F", marginBottom: 10, fontFamily: "Space Grotesk" }}>
          Delete Recommendation?
        </div>
        <div style={{ color: "#4A5E52", fontSize: "0.85rem", marginBottom: 26, lineHeight: 1.6 }}>
          This recommendation audit entry will be permanently removed. This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onConfirm} style={{
            flex: 1, background: "#A8492E", border: "none",
            color: "#FFFFFF", borderRadius: 8, padding: "10px 0",
            fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk"
          }}>CONFIRM DELETE</button>
          <button onClick={onCancel} style={{
            flex: 1, background: "#F5F7F3", border: "1px solid #C4CFC6",
            color: "#4A5E52", borderRadius: 8, padding: "10px 0",
            fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk"
          }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]); // max 2 ids
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setEntries(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [...prev.slice(1), id]; // replace oldest
      return [...prev, id];
    });
  };

  const handleDelete = (id) => setPendingDelete(id);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await fetch(`${API_BASE}/api/history/${pendingDelete}`, { method: "DELETE" });
      setSelected(prev => prev.filter(x => x !== pendingDelete));
      setEntries(prev => prev.filter(e => e.id !== pendingDelete));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setPendingDelete(null);
    }
  };

  const handleCompare = () => {
    if (selected.length !== 2) return;
    router.push(`/history/compare?ids=${selected[0]},${selected[1]}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F0F2EE",
      fontFamily: "Inter, sans-serif",
      color: "#18251F",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />

      {/* Page header */}
      <main style={{ flex: 1, padding: "2.5rem 5% 4rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #C4CFC6",
          borderTop: "3px solid #1E5438",
          borderRadius: 16,
          padding: "1.8rem 2.2rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 16px rgba(24, 37, 31, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#1E5438", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 700, fontFamily: "Space Grotesk" }}>
              GreenConstructAI — Decision Archive
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "Space Grotesk, sans-serif", margin: 0, color: "#18251F", letterSpacing: "-0.02em" }}>
              Recommendation History & Comparison
            </h1>
            <p style={{ color: "#4A5E52", fontSize: "0.88rem", margin: "6px 0 0", lineHeight: 1.6 }}>
              Review previous material recommendation packages, compare metrics side-by-side, and audit decisions.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {selected.length === 2 && (
              <button
                onClick={handleCompare}
                style={{
                  background: "#1E5438",
                  border: "none", color: "#FFFFFF", borderRadius: 10, padding: "10px 22px",
                  fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.04em", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(30, 84, 56, 0.25)",
                  fontFamily: "Space Grotesk", transition: "all 0.2s",
                }}
              >⚖ COMPARE SELECTED (2/2)</button>
            )}
            {selected.length === 1 && (
              <div style={{ fontSize: "0.78rem", color: "#1E5438", padding: "8px 16px", border: "1.5px solid #1E5438", borderRadius: 10, fontWeight: 600, background: "#EDF5EE" }}>
                Select 1 more project to compare
              </div>
            )}
            <Link href="/materials/form" style={{
              background: "#FFFFFF", border: "1.5px solid #C4CFC6",
              color: "#18251F", borderRadius: 10, padding: "9px 18px",
              fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none",
              fontFamily: "Space Grotesk", transition: "all 0.2s"
            }}>+ NEW RECOMMENDATION</Link>
          </div>
        </div>

        {/* Content */}
        <div>
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#4A5E52" }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid #DCE9DC',
                borderTopColor: '#1E5438',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, fontFamily: "Space Grotesk" }}>Loading history records…</div>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(176, 64, 64, 0.06)", border: "1px solid rgba(176, 64, 64, 0.25)",
              borderLeft: "4px solid #B04040",
              borderRadius: 10, padding: "16px 20px", color: "#B04040", fontSize: "0.85rem",
            }}>
              Failed to load history: {error}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#FFFFFF", borderRadius: 16, border: "1px solid #C4CFC6" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🗂</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#18251F", marginBottom: 8, fontFamily: "Space Grotesk" }}>
                No Recommendation Records Found
              </div>
              <div style={{ color: "#4A5E52", fontSize: "0.88rem", marginBottom: 24, maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.6 }}>
                Generate your first material recommendation package to start auditing decisions and comparing options.
              </div>
              <Link href="/materials/form" className="btn-premium" style={{
                padding: "10px 24px",
                fontSize: "0.82rem", letterSpacing: "0.04em", textDecoration: "none",
                display: "inline-block",
              }}>GENERATE FIRST RECOMMENDATION</Link>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <>
              <div style={{ fontSize: "0.78rem", color: "#4A5E52", marginBottom: 18, fontWeight: 600 }}>
                {entries.length} record{entries.length !== 1 ? "s" : ""} recorded — showing newest first
                {selected.length > 0 && (
                  <span style={{ marginLeft: 16, color: "#1E5438", fontWeight: 700 }}>
                    ({selected.length}/2 selected for side-by-side comparison)
                  </span>
                )}
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 20,
              }}>
                {entries.map(entry => (
                  <HistoryCard
                    key={entry.id}
                    entry={entry}
                    selected={selected.includes(entry.id)}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    onView={id => router.push(`/history/view/${id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {pendingDelete && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}
