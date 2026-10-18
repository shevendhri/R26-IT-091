"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE = "http://localhost:5000";

const CANONICAL_ORDER = [
  { key: "foundation", label: "Foundation & Substructure", icon: "🏛️" },
  { key: "structural_frame", altKeys: ["structural_concrete", "concrete", "structural"], label: "Structural Frame & Superstructure", icon: "🏗️" },
  { key: "reinforcement", altKeys: ["structural_rebar"], label: "Reinforcement & Rebar", icon: "⛓️" },
  { key: "walling", altKeys: ["walls"], label: "Walling & Building Envelope", icon: "🧱" },
  { key: "roofing", label: "Roofing System", icon: "🏠" },
  { key: "windows", label: "Windows & Daylighting", icon: "🪟" },
  { key: "doors", label: "Doors & Access Systems", icon: "🚪" },
  { key: "flooring", label: "Flooring & Pavement", icon: "📐" },
  { key: "ceiling", label: "Ceiling & Acoustic Lining", icon: "🪵" },
  { key: "finishes", label: "Finishes & Protective Coatings", icon: "🎨" },
  { key: "waterproofing", label: "Waterproofing & Moisture Barrier", icon: "💧" }
];

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

function resolveMaterial(pkg, canonItem) {
  if (!pkg) return null;
  if (pkg[canonItem.key]) return pkg[canonItem.key];
  if (canonItem.altKeys) {
    for (const alt of canonItem.altKeys) {
      if (pkg[alt]) return pkg[alt];
    }
  }
  return null;
}

function CompareInner() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

  const [entries, setEntries] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState("all"); // "all" | "diff" | "same"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (ids.length !== 2) {
      setError("Two comparison IDs are required in the URL (e.g. ?ids=127,125).");
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map(id =>
      fetch(`${API_BASE}/api/history/${id}`)
        .then(r => r.ok ? r.json() : Promise.reject(`Error fetching entry #${id} (${r.status})`))
        .then(d => d.entry)
    ))
      .then(results => {
        setEntries(results);
        setLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
      });
  }, [idsParam]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E2DCD0", borderTopColor: "#143825", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.85rem", color: "#697068", fontFamily: "Space Grotesk" }}>Loading Side-by-Side Comparison Data…</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !entries[0] || !entries[1]) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ background: "#FDF0ED", border: "1px solid #F5D3C8", color: "#8E3B27", padding: "16px 24px", borderRadius: 8, fontSize: "0.88rem", fontWeight: 700 }}>
          {error || "Unable to load comparison entries."}
        </div>
        <Link href="/history" style={{ color: "#143825", fontWeight: 800, textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.06em" }}>
          ← RETURN TO RECOMMENDATION HISTORY
        </Link>
      </div>
    );
  }

  const [a, b] = entries;
  const infoA = parse(a.project_info), infoB = parse(b.project_info);
  const recA = parse(a.recommendation), recB = parse(b.recommendation);
  const pkgA = recA?.recommended_package || {}, pkgB = recB?.recommended_package || {};
  const metricsA = recA?.metrics || {}, metricsB = recB?.metrics || {};
  const climateA = recA?.climate_profile || {}, climateB = recB?.climate_profile || {};

  const scoreA = metricsA?.overall_hybrid_score ?? metricsA?.average_hybrid_score ?? null;
  const scoreB = metricsB?.overall_hybrid_score ?? metricsB?.average_hybrid_score ?? null;
  const scoreDiff = (scoreA != null && scoreB != null) ? (scoreA - scoreB).toFixed(1) : null;

  const sustA = metricsA?.average_sustainability ?? null;
  const sustB = metricsB?.average_sustainability ?? null;

  const carbonA = metricsA?.average_carbon ?? null;
  const carbonB = metricsB?.average_carbon ?? null;

  // Process rows
  const comparisonItems = CANONICAL_ORDER.map(canon => {
    const matA = resolveMaterial(pkgA, canon);
    const matB = resolveMaterial(pkgB, canon);
    const nameA = matA?.Name || matA?.name || "Not Specified";
    const nameB = matB?.Name || matB?.name || "Not Specified";
    const isDiff = nameA !== nameB;
    return {
      canon,
      matA,
      matB,
      nameA,
      nameB,
      isDiff
    };
  });

  const diffCount = comparisonItems.filter(i => i.isDiff).length;
  const matchCount = comparisonItems.length - diffCount;

  // Filter based on user toggle
  const filteredItems = comparisonItems.filter(item => {
    if (filterMode === "diff" && !item.isDiff) return false;
    if (filterMode === "same" && item.isDiff) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = item.canon.label.toLowerCase().includes(q);
      const matchNameA = item.nameA.toLowerCase().includes(q);
      const matchNameB = item.nameB.toLowerCase().includes(q);
      return matchLabel || matchNameA || matchNameB;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto" }}>
      {/* ── BREADCRUMB & PAGE HEADER ── */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Link
          href="/history"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#143825",
            fontSize: "0.72rem",
            fontWeight: 800,
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.85rem"
          }}
        >
          ← BACK TO RECOMMENDATION HISTORY
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.85rem", fontWeight: 800, color: "#143825", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
              Specification Differential Analysis
            </h1>
            <p style={{ margin: 0, fontSize: "0.84rem", color: "#697068", maxWidth: 720, lineHeight: 1.5 }}>
              Granular side-by-side comparative inspection between design iterations. Climate-driven adaptations, engineering variances, and material substitutions are highlighted below.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <Link
              href={`/history/view/${a.id}`}
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#143825",
                background: "#EBF3ED",
                border: "1px solid #D2E4D6",
                padding: "8px 14px",
                borderRadius: 4,
                textDecoration: "none"
              }}
            >
              View Entry #{a.id} Monograph →
            </Link>
            <Link
              href={`/history/view/${b.id}`}
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#7A5229",
                background: "#FDF8EE",
                border: "1px solid #EADEC9",
                padding: "8px 14px",
                borderRadius: 4,
                textDecoration: "none"
              }}
            >
              View Entry #{b.id} Monograph →
            </Link>
          </div>
        </div>
      </div>

      {/* ── TOP KPI DELTA CARD ── */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2DCD0",
        borderRadius: 8,
        padding: "1.25rem 1.5rem",
        marginBottom: "1.75rem",
        boxShadow: "0 2px 12px rgba(20,56,37,0.03)"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          alignItems: "center"
        }}>
          {/* Delta Pill 1: Variance */}
          <div style={{ borderRight: "1px solid #EFECE4", paddingRight: "1rem" }}>
            <span style={{ fontSize: "0.64rem", color: "#697068", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Specification Variance
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 900, color: diffCount > 0 ? "#7A5229" : "#143825", fontFamily: "Space Grotesk" }}>
                {diffCount} / {comparisonItems.length}
              </span>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: diffCount > 0 ? "#8D6A4F" : "#1E5438" }}>
                Components Differ
              </span>
            </div>
            <div style={{ fontSize: "0.70rem", color: "#697068", marginTop: 2 }}>
              {matchCount} identical baseline specifications
            </div>
          </div>

          {/* Delta Pill 2: Hybrid Score Delta */}
          <div style={{ borderRight: "1px solid #EFECE4", paddingRight: "1rem" }}>
            <span style={{ fontSize: "0.64rem", color: "#697068", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Hybrid Feasibility Score
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "#143825", fontFamily: "Space Grotesk" }}>
                {scoreA != null ? Number(scoreA).toFixed(1) : "—"}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#697068" }}>vs</span>
              <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "#7A5229", fontFamily: "Space Grotesk" }}>
                {scoreB != null ? Number(scoreB).toFixed(1) : "—"}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: Number(scoreDiff) >= 0 ? "#1E5438" : "#8E3B27", marginTop: 2 }}>
              {scoreDiff != null ? `${Number(scoreDiff) >= 0 ? "+" : ""}${scoreDiff} pts diff` : "—"}
            </div>
          </div>

          {/* Delta Pill 3: Sustainability */}
          <div style={{ borderRight: "1px solid #EFECE4", paddingRight: "1rem" }}>
            <span style={{ fontSize: "0.64rem", color: "#697068", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Average Sustainability Index
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#143825", fontFamily: "Space Grotesk" }}>
                {sustA != null ? `${Number(sustA).toFixed(1)}` : "—"}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#697068" }}>vs</span>
              <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#7A5229", fontFamily: "Space Grotesk" }}>
                {sustB != null ? `${Number(sustB).toFixed(1)}` : "—"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#697068" }}>/100</span>
            </div>
            <div style={{ fontSize: "0.70rem", color: "#697068", marginTop: 2 }}>
              Eco-rating across regional candidates
            </div>
          </div>

          {/* Delta Pill 4: Embodied Carbon */}
          <div>
            <span style={{ fontSize: "0.64rem", color: "#697068", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Embodied Carbon Index
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#143825", fontFamily: "Space Grotesk" }}>
                {carbonA != null ? `${Number(carbonA).toFixed(2)}` : "—"}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#697068" }}>vs</span>
              <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#7A5229", fontFamily: "Space Grotesk" }}>
                {carbonB != null ? `${Number(carbonB).toFixed(2)}` : "—"}
              </span>
              <span style={{ fontSize: "0.68rem", color: "#697068" }}>kgCO₂/kg</span>
            </div>
            <div style={{ fontSize: "0.70rem", color: "#697068", marginTop: 2 }}>
              {carbonA && carbonB && carbonA < carbonB ? `Entry #${a.id} has lower carbon footprint` : `Entry #${b.id} carbon profile comparison`}
            </div>
          </div>
        </div>
      </div>

      {/* ── PROJECT PROFILE SIDE-BY-SIDE MATRIX ── */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2DCD0",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: "2rem",
        boxShadow: "0 2px 10px rgba(20,56,37,0.02)"
      }}>
        {/* Comparison Column Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", background: "#FAF7F0", borderBottom: "1px solid #E2DCD0" }}>
          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#143825", letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: "Space Grotesk" }}>
              PROJECT CONTEXT & PARAMETERS
            </span>
          </div>

          {/* Column Header A */}
          <div style={{ padding: "14px 20px", background: "#EBF3ED", borderLeft: "1px solid #D2E4D6" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#143825", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ENTRY #{a.id} (PRIMARY)
              </span>
              <span style={{ fontSize: "0.62rem", color: "#526158" }}>{fmtDate(a.created_at)}</span>
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#143825", fontFamily: "Space Grotesk", marginTop: 2 }}>
              {infoA?.location || climateA?.city || "—"} · {infoA?.building_type || recA?.building_type || "Residential"}
            </div>
          </div>

          {/* Column Header B */}
          <div style={{ padding: "14px 20px", background: "#FDF8EE", borderLeft: "1px solid #EADEC9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#7A5229", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ENTRY #{b.id} (COMPARISON)
              </span>
              <span style={{ fontSize: "0.62rem", color: "#697068" }}>{fmtDate(b.created_at)}</span>
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#7A5229", fontFamily: "Space Grotesk", marginTop: 2 }}>
              {infoB?.location || climateB?.city || "—"} · {infoB?.building_type || recB?.building_type || "Residential"}
            </div>
          </div>
        </div>

        {/* Project Parameters Rows */}
        {[
          {
            label: "Geographic Location",
            vA: infoA?.location || climateA?.city,
            vB: infoB?.location || climateB?.city,
            note: "Determines regional climate rules & transport distances"
          },
          {
            label: "Agro-Climatic Zone",
            vA: climateA?.type || climateA?.zone || infoA?.climate_zone,
            vB: climateB?.type || climateB?.zone || infoB?.climate_zone,
            note: "Drives humidity, rainfall & thermal degradation factors"
          },
          {
            label: "Building Typology & Scale",
            vA: `${infoA?.floor_count ?? infoA?.floors ?? "—"} Floors (${infoA?.total_area ? `${infoA.total_area} m²` : "—"})`,
            vB: `${infoB?.floor_count ?? infoB?.floors ?? "—"} Floors (${infoB?.total_area ? `${infoB.total_area} m²` : "—"})`,
            note: "Structural loading tiers & occupancy category"
          },
          {
            label: "Structural System Specification",
            vA: infoA?.structural_system || "Concrete Frame (SLS 614)",
            vB: infoB?.structural_system || "Concrete Frame (SLS 614)",
            note: "Structural code framework applied for feasibility vetoes"
          },
          {
            label: "Salinity & Marine Exposure",
            vA: climateA?.salinity ? `${climateA.salinity} Exposure` : "Low",
            vB: climateB?.salinity ? `${climateB.salinity} Exposure` : "Low",
            note: "Corrosion resistance requirement for rebar & external coatings"
          },
          {
            label: "Budget & Value Orientation",
            vA: infoA?.budget || infoA?.budget_level || "Balanced Value",
            vB: infoB?.budget || infoB?.budget_level || "Balanced Value",
            note: "Cost penalty scaling applied in multi-criteria MCDM"
          }
        ].map((row, idx) => {
          const isRowDiff = String(row.vA ?? "") !== String(row.vB ?? "");
          return (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr",
                borderBottom: "1px solid #EFECE4",
                background: isRowDiff ? "rgba(245, 158, 11, 0.02)" : "transparent"
              }}
            >
              <div style={{ padding: "12px 20px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#143825", fontFamily: "Space Grotesk" }}>{row.label}</span>
                <span style={{ display: "block", fontSize: "0.65rem", color: "#697068", marginTop: 2 }}>{row.note}</span>
              </div>
              <div style={{ padding: "12px 20px", borderLeft: "1px solid #EFECE4", display: "flex", alignItems: "center" }}>
                <span style={{
                  fontSize: "0.84rem",
                  fontWeight: isRowDiff ? 800 : 600,
                  color: isRowDiff ? "#143825" : "#252823",
                  fontFamily: "Space Grotesk"
                }}>
                  {row.vA || "—"}
                </span>
              </div>
              <div style={{ padding: "12px 20px", borderLeft: "1px solid #EFECE4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: "0.84rem",
                  fontWeight: isRowDiff ? 800 : 600,
                  color: isRowDiff ? "#7A5229" : "#252823",
                  fontFamily: "Space Grotesk"
                }}>
                  {row.vB || "—"}
                </span>
                {isRowDiff && (
                  <span style={{
                    background: "#FDF8EE",
                    border: "1px solid #EADEC9",
                    color: "#7A5229",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 3,
                    letterSpacing: "0.06em"
                  }}>
                    DIFFERENT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MATERIAL COMPARISON CONTROLS BAR ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "1rem",
        padding: "0.75rem 1rem",
        background: "#FFFFFF",
        border: "1px solid #E2DCD0",
        borderRadius: 6
      }}>
        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.66rem", fontWeight: 800, color: "#697068", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>
            FILTER:
          </span>
          <button
            onClick={() => setFilterMode("all")}
            style={{
              background: filterMode === "all" ? "#143825" : "#FAF7F0",
              color: filterMode === "all" ? "#FFFFFF" : "#143825",
              border: `1px solid ${filterMode === "all" ? "#143825" : "#D8D2C8"}`,
              borderRadius: 4,
              padding: "4px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            All Components ({comparisonItems.length})
          </button>
          <button
            onClick={() => setFilterMode("diff")}
            style={{
              background: filterMode === "diff" ? "#7A5229" : "#FAF7F0",
              color: filterMode === "diff" ? "#FFFFFF" : "#7A5229",
              border: `1px solid ${filterMode === "diff" ? "#7A5229" : "#D8D2C8"}`,
              borderRadius: 4,
              padding: "4px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            ⚡ Differences Only ({diffCount})
          </button>
          <button
            onClick={() => setFilterMode("same")}
            style={{
              background: filterMode === "same" ? "#143825" : "#FAF7F0",
              color: filterMode === "same" ? "#FFFFFF" : "#143825",
              border: `1px solid ${filterMode === "same" ? "#143825" : "#D8D2C8"}`,
              borderRadius: 4,
              padding: "4px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            ✓ Identical ({matchCount})
          </button>
        </div>

        {/* Live Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="text"
            placeholder="Search material or component…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "5px 12px",
              fontSize: "0.76rem",
              border: "1px solid #D8D2C8",
              borderRadius: 4,
              width: 220,
              outline: "none",
              fontFamily: "inherit"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "transparent", border: "none", color: "#697068", cursor: "pointer", fontSize: "0.8rem" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── MATERIAL COMPARISON CARDS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#FFFFFF", border: "1px solid #E2DCD0", borderRadius: 8, color: "#697068" }}>
            No components match the selected filter criteria.
          </div>
        ) : (
          filteredItems.map(({ canon, matA, matB, nameA, nameB, isDiff }) => {
            const scoreAVal = matA?.hybrid_score ?? matA?.engineering_score ?? null;
            const scoreBVal = matB?.hybrid_score ?? matB?.engineering_score ?? null;
            const sustAVal = matA?.Sustainability_Rating ?? matA?.sustainability_rating ?? null;
            const sustBVal = matB?.Sustainability_Rating ?? matB?.sustainability_rating ?? null;
            const lifeAVal = matA?.Service_Life ?? matA?.service_life ?? null;
            const lifeBVal = matB?.Service_Life ?? matB?.service_life ?? null;
            const costAVal = matA?.Unit_Rate ?? matA?.unit_rate ?? null;
            const costBVal = matB?.Unit_Rate ?? matB?.unit_rate ?? null;

            return (
              <div
                key={canon.key}
                style={{
                  background: "#FFFFFF",
                  border: isDiff ? "1px solid #D2C4B0" : "1px solid #E2DCD0",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: isDiff ? "0 3px 14px rgba(122, 82, 41, 0.05)" : "0 2px 6px rgba(20, 56, 37, 0.02)"
                }}
              >
                {/* Component Bar */}
                <div style={{
                  padding: "10px 18px",
                  background: isDiff ? "#FDF8EE" : "#F8F6F0",
                  borderBottom: "1px solid #EAE5D8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1rem" }}>{canon.icon}</span>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#143825", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Space Grotesk" }}>
                      {canon.label}
                    </span>
                  </div>
                  {isDiff ? (
                    <span style={{
                      background: "#FCECD4",
                      border: "1px solid #E8CEAA",
                      color: "#7A5229",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      letterSpacing: "0.06em"
                    }}>
                      ⚡ SPECIFICATION VARIANCE
                    </span>
                  ) : (
                    <span style={{
                      background: "#EBF3ED",
                      border: "1px solid #D2E4D6",
                      color: "#1E5438",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 4,
                      letterSpacing: "0.06em"
                    }}>
                      ✓ IDENTICAL SPECIFICATION
                    </span>
                  )}
                </div>

                {/* Side-by-Side Content */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  {/* Option A */}
                  <div style={{
                    padding: "16px 20px",
                    background: isDiff ? "rgba(20, 56, 37, 0.015)" : "#FFFFFF",
                    borderRight: "1px solid #EFECE4"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: "0.60rem", fontWeight: 800, color: "#143825", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          ENTRY #{a.id} ({infoA?.location || "Primary"})
                        </span>
                        <div style={{ fontSize: "1.02rem", fontWeight: 800, color: "#143825", fontFamily: "Space Grotesk", marginTop: 2 }}>
                          {nameA}
                        </div>
                      </div>
                      {scoreAVal !== null && (
                        <div style={{
                          background: "#EBF3ED",
                          border: "1px solid #D2E4D6",
                          color: "#143825",
                          borderRadius: 4,
                          padding: "3px 8px",
                          textAlign: "center"
                        }}>
                          <span style={{ fontSize: "0.55rem", fontWeight: 700, display: "block", textTransform: "uppercase" }}>SCORE</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 900, fontFamily: "Space Grotesk" }}>{Number(scoreAVal).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Metric Pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {sustAVal != null && (
                        <span style={{ background: "#F5F3ED", border: "1px solid #E2DCD0", color: "#526158", borderRadius: 4, padding: "2px 7px", fontSize: "0.66rem", fontWeight: 600 }}>
                          Sust: <strong>{sustAVal}/100</strong>
                        </span>
                      )}
                      {lifeAVal != null && (
                        <span style={{ background: "#F5F3ED", border: "1px solid #E2DCD0", color: "#526158", borderRadius: 4, padding: "2px 7px", fontSize: "0.66rem", fontWeight: 600 }}>
                          Life: <strong>{lifeAVal} yrs</strong>
                        </span>
                      )}
                      {costAVal != null && (
                        <span style={{ background: "#F5F3ED", border: "1px solid #E2DCD0", color: "#526158", borderRadius: 4, padding: "2px 7px", fontSize: "0.66rem", fontWeight: 600 }}>
                          Cost: <strong>LKR {Number(costAVal).toLocaleString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Option B */}
                  <div style={{
                    padding: "16px 20px",
                    background: isDiff ? "rgba(122, 82, 41, 0.02)" : "#FFFFFF"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: "0.60rem", fontWeight: 800, color: "#7A5229", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          ENTRY #{b.id} ({infoB?.location || "Comparison"})
                        </span>
                        <div style={{ fontSize: "1.02rem", fontWeight: 800, color: isDiff ? "#7A5229" : "#143825", fontFamily: "Space Grotesk", marginTop: 2 }}>
                          {nameB}
                        </div>
                      </div>
                      {scoreBVal !== null && (
                        <div style={{
                          background: "#FDF8EE",
                          border: "1px solid #EADEC9",
                          color: "#7A5229",
                          borderRadius: 4,
                          padding: "3px 8px",
                          textAlign: "center"
                        }}>
                          <span style={{ fontSize: "0.55rem", fontWeight: 700, display: "block", textTransform: "uppercase" }}>SCORE</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 900, fontFamily: "Space Grotesk" }}>{Number(scoreBVal).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Metric Pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {sustBVal != null && (
                        <span style={{ background: "#F5F3ED", border: "1px solid #E2DCD0", color: "#526158", borderRadius: 4, padding: "2px 7px", fontSize: "0.66rem", fontWeight: 600 }}>
                          Sust: <strong>{sustBVal}/100</strong>
                        </span>
                      )}
                      {lifeBVal != null && (
                        <span style={{ background: "#F5F3ED", border: "1px solid #E2DCD0", color: "#526158", borderRadius: 4, padding: "2px 7px", fontSize: "0.66rem", fontWeight: 600 }}>
                          Life: <strong>{lifeBVal} yrs</strong>
                        </span>
                      )}
                      {costBVal != null && (
                        <span style={{ background: "#F5F3ED", border: "1px solid #E2DCD0", color: "#526158", borderRadius: 4, padding: "2px 7px", fontSize: "0.66rem", fontWeight: 600 }}>
                          Cost: <strong>LKR {Number(costBVal).toLocaleString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function CompareHistoryPage() {
  return (
    <div className="arch-page-canvas" style={{ background: "#FAF7F0", minHeight: "100vh", color: "#252823", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <main style={{ padding: "2rem 5% 5rem" }}>
        <Suspense fallback={
          <div style={{ padding: "60px 5%", textAlign: "center", color: "#697068", fontFamily: "Space Grotesk" }}>
            Loading comparison…
          </div>
        }>
          <CompareInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
