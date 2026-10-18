"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_BASE = "http://localhost:5000";

function parse(raw) {
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return {}; }
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso + "Z").toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

// ── Side-by-side project info row ──────────────────────────────────────────
function CompareRow({ label, valueA, valueB }) {
  const isDiff = String(valueA ?? "") !== String(valueB ?? "");
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      {[valueA, valueB].map((val, i) => (
        <div key={i} style={{
          padding: "9px 16px",
          background: isDiff ? (i === 0 ? "rgba(56,189,248,0.05)" : "rgba(16,185,129,0.05)") : "transparent",
          borderLeft: i === 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
        }}>
          {i === 0 && (
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted, #4f6880)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
          )}
          <div style={{ fontSize: "0.82rem", color: isDiff ? (i === 0 ? "#38bdf8" : "#10b981") : "#f0f4f8", fontWeight: isDiff ? 700 : 400 }}>
            {val ?? "—"}
          </div>
          {i === 1 && (
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted, #4f6880)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Material comparison cell ────────────────────────────────────────────────
function MaterialCell({ material, highlight }) {
  if (!material || typeof material !== "object") {
    return <div style={{ padding: "14px 16px", color: "#4f6880", fontSize: "0.8rem" }}>—</div>;
  }
  const name = material.Name || material.name || "Unknown";
  const score = material.hybrid_score ?? material.engineering_score ?? null;
  const sustainability = material.Sustainability_Rating ?? material.sustainability_rating;
  const serviceLife = material.Service_Life ?? material.service_life;
  const unitRate = material.Unit_Rate ?? material.unit_rate;

  return (
    <div style={{
      padding: "14px 16px",
      background: highlight ? "rgba(16,185,129,0.06)" : "transparent",
      borderLeft: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: highlight ? "#10b981" : "#f0f4f8", marginBottom: 6, fontFamily: "Space Grotesk" }}>
        {name}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {score !== null && (
          <span style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", borderRadius: 5, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700 }}>
            Score: {Number(score).toFixed(1)}
          </span>
        )}
        {sustainability != null && (
          <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d48", color: "#8fa3bc", borderRadius: 5, padding: "2px 8px", fontSize: "0.65rem" }}>
            Sust: {sustainability}
          </span>
        )}
        {serviceLife != null && (
          <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d48", color: "#8fa3bc", borderRadius: 5, padding: "2px 8px", fontSize: "0.65rem" }}>
            Life: {serviceLife}yr
          </span>
        )}
        {unitRate != null && (
          <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d48", color: "#8fa3bc", borderRadius: 5, padding: "2px 8px", fontSize: "0.65rem" }}>
            LKR {Number(unitRate).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Section header spanning both columns ────────────────────────────────────
function SectionHeader({ children, color = "#10b981" }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      padding: "14px 16px 10px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color,
    }}>{children}</div>
  );
}

// ── Inner compare component (uses useSearchParams) ──────────────────────────
function CompareInner() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

  const [entries, setEntries] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length !== 2) { setError("Two IDs required."); setLoading(false); return; }
    setLoading(true);
    Promise.all(ids.map(id =>
      fetch(`${API_BASE}/api/history/${id}`)
        .then(r => r.ok ? r.json() : Promise.reject(`${r.status}`))
        .then(d => d.entry)
    ))
      .then(results => { setEntries(results); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, [idsParam]);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f6880" }}>Loading…</div>
  );

  if (error) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ color: "#ef4444" }}>{error}</div>
      <Link href="/history" style={{ color: "#10b981", textDecoration: "none", fontSize: "0.8rem" }}>← Back to History</Link>
    </div>
  );

  const [a, b] = entries;
  if (!a || !b) return null;

  const infoA = parse(a.project_info), infoB = parse(b.project_info);
  const recA = parse(a.recommendation), recB = parse(b.recommendation);
  const pkgA = recA?.recommended_package || {}, pkgB = recB?.recommended_package || {};
  const metricsA = recA?.metrics || {}, metricsB = recB?.metrics || {};
  const climateA = recA?.climate_profile || {}, climateB = recB?.climate_profile || {};

  // All component slots across both
  const allComponents = Array.from(new Set([...Object.keys(pkgA), ...Object.keys(pkgB)])).sort();

  // Determine which materials differ
  const getDiffSlots = () => allComponents.filter(c => {
    const nameA = (pkgA[c]?.Name || pkgA[c]?.name || "");
    const nameB = (pkgB[c]?.Name || pkgB[c]?.name || "");
    return nameA !== nameB;
  });
  const diffSlots = new Set(getDiffSlots());

  const ColHeader = ({ entry, info, rec, color }) => (
    <div style={{ padding: "18px 16px", background: `${color}08`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: "0.62rem", color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        Entry #{entry.id}
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f0f4f8", fontFamily: "Space Grotesk", marginBottom: 4 }}>
        {info?.location || "—"} — {info?.building_type || rec?.building_type || "—"}
      </div>
      <div style={{ fontSize: "0.72rem", color: "#4f6880" }}>{fmtDate(entry.created_at)}</div>
    </div>
  );

  return (
    <div style={{ padding: "0 5%", paddingBottom: 60 }}>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ background: "#0f1a2e", border: "1px solid #1e2d48", borderRadius: 8, padding: "10px 18px", fontSize: "0.75rem", color: "#8fa3bc" }}>
          <span style={{ color: "#4f6880", marginRight: 8 }}>Components compared:</span>
          <span style={{ color: "#f0f4f8", fontWeight: 700 }}>{allComponents.length}</span>
        </div>
        <div style={{ background: "#0f1a2e", border: "1px solid #1e2d48", borderRadius: 8, padding: "10px 18px", fontSize: "0.75rem", color: "#8fa3bc" }}>
          <span style={{ color: "#4f6880", marginRight: 8 }}>Differences:</span>
          <span style={{ color: diffSlots.size > 0 ? "#f59e0b" : "#10b981", fontWeight: 700 }}>
            {diffSlots.size} slot{diffSlots.size !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ background: "#0f1a2e", border: "1px solid #1e2d48", borderRadius: 14, overflow: "hidden" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid #1e2d48" }}>
          <ColHeader entry={a} info={infoA} rec={recA} color="#38bdf8" />
          <ColHeader entry={b} info={infoB} rec={recB} color="#10b981" />
        </div>

        {/* Project info section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <SectionHeader color="#8fa3bc">Project Information</SectionHeader>

          {[
            { label: "Location", vA: infoA?.location, vB: infoB?.location },
            { label: "Building Type", vA: infoA?.building_type || recA?.building_type, vB: infoB?.building_type || recB?.building_type },
            { label: "Floor Count", vA: infoA?.floor_count ?? infoA?.floors, vB: infoB?.floor_count ?? infoB?.floors },
            { label: "Total Area", vA: infoA?.total_area ? `${infoA.total_area} m²` : null, vB: infoB?.total_area ? `${infoB.total_area} m²` : null },
            { label: "Climate Zone", vA: climateA?.zone || climateA?.climate_zone, vB: climateB?.zone || climateB?.climate_zone },
            { label: "Avg Hybrid Score", vA: metricsA?.average_hybrid_score != null ? Number(metricsA.average_hybrid_score).toFixed(2) : null, vB: metricsB?.average_hybrid_score != null ? Number(metricsB.average_hybrid_score).toFixed(2) : null },
            { label: "ML Confidence", vA: metricsA?.ml_confidence != null ? `${(metricsA.ml_confidence * 100).toFixed(1)}%` : null, vB: metricsB?.ml_confidence != null ? `${(metricsB.ml_confidence * 100).toFixed(1)}%` : null },
          ].map(({ label, vA, vB }) => (
            <CompareRow key={label} label={label} valueA={vA} valueB={vB} />
          ))}

          {/* Material components section header */}
          <SectionHeader color="#10b981">
            Material Package — {diffSlots.size > 0 ? `${diffSlots.size} difference${diffSlots.size !== 1 ? "s" : ""} highlighted` : "Identical"}
          </SectionHeader>

          {/* Material rows */}
          {allComponents.map(comp => {
            const matA = pkgA[comp], matB = pkgB[comp];
            const nameA = matA?.Name || matA?.name || "";
            const nameB = matB?.Name || matB?.name || "";
            const isDiff = nameA !== nameB;
            return (
              <React.Fragment key={comp}>
                {/* Component label row */}
                <div style={{
                  gridColumn: "1 / -1",
                  padding: "8px 16px 4px",
                  fontSize: "0.6rem", color: isDiff ? "#f59e0b" : "#4f6880",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  background: isDiff ? "rgba(245,158,11,0.03)" : "transparent",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  {comp}
                  {isDiff && <span style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "#f59e0b", borderRadius: 4, padding: "1px 6px", fontSize: "0.58rem" }}>DIFFERENT</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridColumn: "1 / -1" }}>
                  <MaterialCell material={matA} highlight={false} />
                  <MaterialCell material={matB} highlight={isDiff} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────────────────────────
export default function CompareHistoryPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--eco-black, #070b13)", color: "#f0f4f8", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "36px 5% 24px", borderBottom: "1px solid #1e2d48", marginBottom: 32 }}>
        <Link href="/history" style={{ color: "#10b981", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          ← RECOMMENDATION HISTORY
        </Link>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, fontFamily: "Space Grotesk", margin: "10px 0 4px" }}>
          Side-by-Side Comparison
        </h1>
        <p style={{ color: "#4f6880", fontSize: "0.8rem", margin: 0 }}>
          Differences in project details and material selections are highlighted.
        </p>
      </div>

      <Suspense fallback={<div style={{ padding: "60px 5%", color: "#4f6880" }}>Loading comparison…</div>}>
        <CompareInner />
      </Suspense>
    </div>
  );
}
