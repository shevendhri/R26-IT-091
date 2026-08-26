"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      background: selected ? "rgba(16,185,129,0.08)" : "var(--eco-card, #0f1a2e)",
      border: selected ? "1px solid rgba(16,185,129,0.45)" : "1px solid var(--eco-border, #1e2d48)",
      borderRadius: 12,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      boxShadow: selected
        ? "0 0 0 1px rgba(16,185,129,0.25), 0 4px 24px rgba(0,0,0,0.4)"
        : "0 2px 12px rgba(0,0,0,0.35)",
      cursor: "default",
      position: "relative",
    }}>
      {/* Selected badge */}
      {selected && (
        <div style={{
          position: "absolute", top: 12, right: 14,
          background: "var(--green, #10b981)", color: "#fff",
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em",
          padding: "3px 8px", borderRadius: 20,
        }}>SELECTED</div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted, #4f6880)", letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>
            {fmtDate(entry.created_at)}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary, #f0f4f8)", fontFamily: "Space Grotesk, sans-serif" }}>
            {location} &mdash; {buildingType}
          </div>
        </div>
        {hybridScore !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted, #4f6880)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Hybrid Score</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--green, #10b981)", fontFamily: "Space Grotesk" }}>
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
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--eco-border, #1e2d48)",
            borderRadius: 6, padding: "3px 10px", fontSize: "0.7rem",
            color: "var(--text-secondary, #8fa3bc)",
          }}>
            <span style={{ color: "var(--text-muted, #4f6880)", marginRight: 4 }}>{label}:</span>{value}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        <button
          onClick={() => onView(entry.id)}
          style={{
            flex: 1, minWidth: 90,
            background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)",
            color: "var(--blue, #38bdf8)", borderRadius: 8, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(56,189,248,0.1)"}
        >VIEW</button>
        <button
          onClick={() => onSelect(entry.id)}
          style={{
            flex: 1, minWidth: 110,
            background: selected ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.06)",
            border: `1px solid ${selected ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.2)"}`,
            color: "var(--green, #10b981)", borderRadius: 8, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = selected ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.06)"}
        >{selected ? "DESELECT" : "SELECT"}</button>
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--red, #ef4444)", borderRadius: 8, padding: "7px 14px",
            fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
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
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#0f1a2e", border: "1px solid #1e2d48",
        borderRadius: 14, padding: "32px 36px", maxWidth: 400, width: "90%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f0f4f8", marginBottom: 10, fontFamily: "Space Grotesk" }}>
          Delete Recommendation?
        </div>
        <div style={{ color: "#8fa3bc", fontSize: "0.85rem", marginBottom: 26 }}>
          This history entry will be permanently removed. This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onConfirm} style={{
            flex: 1, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)",
            color: "#ef4444", borderRadius: 8, padding: "10px 0",
            fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", cursor: "pointer",
          }}>CONFIRM DELETE</button>
          <button onClick={onCancel} style={{
            flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d48",
            color: "#8fa3bc", borderRadius: 8, padding: "10px 0",
            fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em", cursor: "pointer",
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
      background: "var(--eco-black, #070b13)",
      fontFamily: "Inter, sans-serif",
      color: "var(--text-primary, #f0f4f8)",
      paddingBottom: 60,
    }}>
      {/* Page header */}
      <div style={{
        padding: "40px 5% 0",
        borderBottom: "1px solid var(--eco-border, #1e2d48)",
        marginBottom: 36,
        paddingBottom: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: "var(--green, #10b981)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              GreenConstructAI — Decision Archive
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Space Grotesk, sans-serif", margin: 0, color: "#f0f4f8" }}>
              Recommendation History
            </h1>
            <p style={{ color: "var(--text-muted, #4f6880)", fontSize: "0.85rem", margin: "8px 0 0" }}>
              View, compare and manage previously generated material recommendation packages.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {selected.length === 2 && (
              <button
                onClick={handleCompare}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  border: "none", color: "#fff", borderRadius: 8, padding: "10px 22px",
                  fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.06em", cursor: "pointer",
                  boxShadow: "0 0 20px rgba(16,185,129,0.35)",
                  transition: "opacity 0.15s",
                }}
              >⚖ COMPARE SELECTED ({selected.length}/2)</button>
            )}
            {selected.length === 1 && (
              <div style={{ fontSize: "0.75rem", color: "var(--green, #10b981)", padding: "10px 16px", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 8 }}>
                Select 1 more to compare
              </div>
            )}
            <Link href="/materials/form" style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d48",
              color: "#8fa3bc", borderRadius: 8, padding: "10px 18px",
              fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textDecoration: "none",
            }}>+ NEW RECOMMENDATION</Link>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 5%" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted, #4f6880)" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: "0.85rem" }}>Loading history…</div>
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10, padding: "20px 24px", color: "#ef4444", fontSize: "0.85rem",
          }}>
            Failed to load history: {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 18, opacity: 0.4 }}>🗂</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f0f4f8", marginBottom: 10, fontFamily: "Space Grotesk" }}>
              No recommendation history yet
            </div>
            <div style={{ color: "var(--text-muted, #4f6880)", fontSize: "0.88rem", marginBottom: 28 }}>
              Generate a material recommendation to start comparing projects.
            </div>
            <Link href="/materials/form" style={{
              background: "var(--green, #10b981)", color: "#fff",
              borderRadius: 8, padding: "12px 28px",
              fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", textDecoration: "none",
              display: "inline-block",
            }}>GENERATE RECOMMENDATION</Link>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted, #4f6880)", marginBottom: 20 }}>
              {entries.length} record{entries.length !== 1 ? "s" : ""} — newest first
              {selected.length > 0 && (
                <span style={{ marginLeft: 16, color: "var(--green, #10b981)" }}>
                  {selected.length}/2 selected for comparison
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

      {pendingDelete && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
      )}
    </div>
  );
}
