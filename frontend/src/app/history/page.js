"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModuleHeroBanner from "@/components/ui/ModuleHeroBanner";

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
    <div className="arch-board-card" style={{
      background: selected ? "rgba(20, 56, 37, 0.05)" : "#FFFFFF",
      borderColor: selected ? "#143825" : "#E2DCD0",
      borderRadius: 4,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      boxShadow: selected
        ? "0 4px 20px rgba(20, 56, 37, 0.08)"
        : "0 2px 8px rgba(20, 56, 37, 0.03)",
      cursor: "default",
      position: "relative",
    }}>
      {/* Selected badge */}
      {selected && (
        <div style={{
          position: "absolute", top: 12, right: 14,
          background: "#143825", color: "#FFFFFF",
          fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em",
          padding: "3px 9px", borderRadius: 4, fontFamily: "Space Grotesk"
        }}>SELECTED</div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.68rem", color: "#526158", letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            {fmtDate(entry.created_at)}
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#143825", fontFamily: "Space Grotesk, sans-serif" }}>
            {location} &mdash; {buildingType}
          </div>
        </div>
        {hybridScore !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.6rem", color: "#526158", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, fontWeight: 600 }}>Hybrid Score</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#143825", fontFamily: "Space Grotesk" }}>
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
            background: "#FAF7F0", border: "1px solid #E2DCD0",
            borderRadius: 4, padding: "3px 10px", fontSize: "0.72rem",
            color: "#143825", fontWeight: 500
          }}>
            <span style={{ color: "#526158", marginRight: 4 }}>{label}:</span>{value}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        <button
          onClick={() => onView(entry.id)}
          style={{
            flex: 1, minWidth: 80,
            background: "#EBF3ED", border: "1px solid #D2E4D6",
            color: "#143825", borderRadius: 4, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#D2E4D6"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#EBF3ED"; }}
        >VIEW</button>
        <button
          onClick={() => onSelect(entry.id)}
          style={{
            flex: 1, minWidth: 95,
            background: selected ? "#143825" : "#FAF7F0",
            border: `1px solid ${selected ? "#143825" : "#E2DCD0"}`,
            color: selected ? "#FFFFFF" : "#526158", borderRadius: 4, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#DCE9DC"; e.currentTarget.style.color = "#1E5438"; }}
          onMouseLeave={e => { e.currentTarget.style.background = selected ? "#DCE9DC" : "#F5F7F3"; e.currentTarget.style.color = selected ? "#1E5438" : "#4A5E52"; }}
        >{selected ? "DESELECT" : "SELECT"}</button>
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            background: "#FDF0ED", border: "1px solid #F5D3C8",
            color: "#B85C43", borderRadius: 4, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F5D3C8"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FDF0ED"; }}
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
        background: "#FFFFFF", border: "1px solid #E2DCD0",
        borderRadius: 8, padding: "32px 36px", maxWidth: 420, width: "90%",
        boxShadow: "0 16px 48px rgba(24, 37, 31, 0.18)",
      }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#143825", marginBottom: 10, fontFamily: "Space Grotesk" }}>
          Delete Recommendation?
        </div>
        <div style={{ color: "#526158", fontSize: "0.85rem", marginBottom: 26, lineHeight: 1.6 }}>
          This recommendation audit entry will be permanently removed. This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onConfirm} style={{
            flex: 1, background: "#B85C43", border: "none",
            color: "#FFFFFF", borderRadius: 8, padding: "10px 0",
            fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", cursor: "pointer",
            fontFamily: "Space Grotesk"
          }}>CONFIRM DELETE</button>
          <button onClick={onCancel} style={{
            flex: 1, background: "#FAF7F0", border: "1px solid #E2DCD0",
            color: "#526158", borderRadius: 8, padding: "10px 0",
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
    <div className="arch-page-canvas" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />

      {/* Page header */}
      <main style={{ flex: 1, padding: "2.5rem 5% 4rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <ModuleHeroBanner
          track="DECISION ARCHIVE & BENCHMARK AUDIT"
          kicker="MCDM MULTI-PROJECT TRACE"
          title="RECOMMENDATION HISTORY & COMPARISON"
          subtitle="Review previous material recommendation packages, compare multi-criteria TOPSIS metrics side-by-side, and audit SLS compliance."
          imageSrc="/conservatory_portal.jpg"
          imageAlt="Decision Archive and Architectural Benchmarks"
          actions={
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {selected.length === 2 && (
                <button
                  onClick={handleCompare}
                  className="arch-action-btn"
                  style={{
                    background: "#143825",
                    color: "#FFFFFF",
                    padding: "10px 22px",
                    fontSize: "0.82rem",
                    letterSpacing: "0.06em",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 4
                  }}
                >⚖ COMPARE SELECTED (2/2)</button>
              )}
              {selected.length === 1 && (
                <div className="arch-tag" style={{ background: "rgba(20, 56, 37, 0.08)", color: "#143825" }}>
                  Select 1 more project to compare
                </div>
              )}
              <Link href="/materials/form" className="arch-tag" style={{
                background: "#FFFFFF",
                color: "#143825",
                padding: "10px 18px",
                fontSize: "0.8rem",
                textDecoration: "none",
                borderRadius: 4,
                border: "1px solid #E2DCD0"
              }}>+ NEW RECOMMENDATION</Link>
            </div>
          }
        />

        {/* Content */}
        <div>
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#526158" }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid #DCE9DC',
                borderTopColor: '#143825',
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
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2DCD0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🗂</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#143825", marginBottom: 8, fontFamily: "Space Grotesk" }}>
                No Recommendation Records Found
              </div>
              <div style={{ color: "#526158", fontSize: "0.88rem", marginBottom: 24, maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.6 }}>
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
              <div style={{ fontSize: "0.78rem", color: "#526158", marginBottom: 18, fontWeight: 600 }}>
                {entries.length} record{entries.length !== 1 ? "s" : ""} recorded — showing newest first
                {selected.length > 0 && (
                  <span style={{ marginLeft: 16, color: "#143825", fontWeight: 700 }}>
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
