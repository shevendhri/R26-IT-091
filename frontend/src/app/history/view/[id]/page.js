"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

function Badge({ children, color = "#1E5438" }) {
  return (
    <span style={{
      background: `${color}14`, border: `1px solid ${color}35`,
      color, borderRadius: 6, padding: "3px 10px",
      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em",
      fontFamily: "Space Grotesk"
    }}>{children}</span>
  );
}

function InfoRow({ label, value }) {
  let displayVal = "—";
  if (value != null) {
    if (typeof value === "object") {
      displayVal = JSON.stringify(value);
    } else {
      displayVal = String(value);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #E6EBE4" }}>
      <span style={{ fontSize: "0.75rem", color: "#4A5E52", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.85rem", color: "#18251F", fontWeight: 700, fontFamily: "Space Grotesk" }}>{displayVal}</span>
    </div>
  );
}

function MaterialSlot({ component, material }) {
  if (!material || typeof material !== "object") return null;
  const name = material.Name || material.name || "Unknown";
  const score = material.hybrid_score ?? material.engineering_score ?? null;
  const sustainability = material.Sustainability_Rating ?? material.sustainability_rating;
  const serviceLife = material.Service_Life ?? material.service_life;
  const embodiedCarbon = material.Embodied_Carbon ?? material.embodied_carbon;
  const durability = material.Durability_Rating ?? material.durability_rating;
  const unitRate = material.Unit_Rate ?? material.unit_rate;

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #C4CFC6",
      borderTop: "3px solid #1E5438",
      borderRadius: 12, padding: "18px 20px",
      boxShadow: "0 2px 10px rgba(24,37,31,0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "#1E5438", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 700, fontFamily: "Space Grotesk" }}>{component.replace(/_/g, " ")}</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#18251F", fontFamily: "Space Grotesk" }}>{name}</div>
        </div>
        {score !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.6rem", color: "#4A5E52", textTransform: "uppercase", marginBottom: 2, fontWeight: 600 }}>Score</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1E5438", fontFamily: "Space Grotesk" }}>
              {Number(score).toFixed(1)}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {sustainability != null && <Badge color="#1E5438">Eco Rating: {sustainability}</Badge>}
        {serviceLife != null && <Badge color="#2B5C8A">Life: {serviceLife}yr</Badge>}
        {embodiedCarbon != null && <Badge color="#A8492E">Carbon: {typeof embodiedCarbon === "number" ? embodiedCarbon.toFixed(2) : embodiedCarbon}</Badge>}
        {durability && <Badge color="#4A7A5C">Durability: {durability}</Badge>}
        {unitRate != null && <Badge color="#4A5E52">Rate: LKR {Number(unitRate).toLocaleString()}</Badge>}
      </div>
    </div>
  );
}

export default function HistoryViewPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/history/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(`Status ${r.status}`))
      .then(d => { setEntry(d.entry); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F0F2EE", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#4A5E52", fontWeight: 600 }}>
        Loading recommendation record #{id}…
      </div>
      <Footer />
    </div>
  );

  if (error || !entry) return (
    <div style={{ minHeight: "100vh", background: "#F0F2EE", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ color: "#B04040", fontSize: "0.95rem", fontWeight: 600 }}>Failed to load: {error || "Record not found"}</div>
        <Link href="/history" className="btn-secondary" style={{ textDecoration: "none" }}>← Back to History</Link>
      </div>
      <Footer />
    </div>
  );

  const info = parse(entry.project_info);
  const rec = parse(entry.recommendation);
  const pkg = rec?.recommended_package || {};
  const metrics = rec?.metrics || {};
  const climate = rec?.climate_profile || {};
  const validation = rec?.validation || {};

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2EE", color: "#18251F", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, padding: "2.5rem 5% 4rem", maxWidth: "1400px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.8rem" }}>
        {/* Header card */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #C4CFC6",
          borderTop: "3px solid #1E5438",
          borderRadius: 16,
          padding: "1.8rem 2.2rem",
          boxShadow: "0 4px 16px rgba(24, 37, 31, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 14
        }}>
          <div>
            <Link href="/history" style={{ color: "#1E5438", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, fontFamily: "Space Grotesk" }}>
              ← BACK TO RECOMMENDATION HISTORY
            </Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "Space Grotesk", margin: "8px 0 4px", color: "#18251F", letterSpacing: "-0.02em" }}>
              {info?.location || "—"} — {info?.building_type || rec?.building_type || "—"}
            </h1>
            <div style={{ color: "#4A5E52", fontSize: "0.82rem", fontWeight: 500 }}>
              Generated {fmtDate(entry.created_at)} &nbsp;·&nbsp; Entry ID #{entry.id}
            </div>
          </div>
          <Badge color="#1E5438">ARCHIVED RECORD</Badge>
        </div>

        {/* Project Info Card */}
        <div style={{ background: "#FFFFFF", border: "1px solid #C4CFC6", borderRadius: 14, padding: "1.6rem 2rem", boxShadow: "0 2px 10px rgba(24,37,31,0.04)" }}>
          <div style={{ fontSize: "0.68rem", color: "#1E5438", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontWeight: 700, fontFamily: "Space Grotesk" }}>
            Project & Geoclimatic Parameters
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0 32px" }}>
            <InfoRow label="Location" value={info?.location} />
            <InfoRow label="Building Type" value={info?.building_type || rec?.building_type} />
            <InfoRow label="Floor Count" value={info?.floor_count ?? info?.floors} />
            <InfoRow label="Total Area" value={info?.total_area ? `${info.total_area} m²` : null} />
            <InfoRow label="Climate Zone" value={climate?.zone || climate?.climate_zone} />
            <InfoRow label="Avg. Hybrid Score" value={metrics?.average_hybrid_score != null ? Number(metrics.average_hybrid_score).toFixed(2) : null} />
            <InfoRow label="ML Confidence" value={metrics?.ml_confidence != null ? `${(Number(metrics.ml_confidence) * 100).toFixed(1)}%` : null} />
          </div>
        </div>

        {/* Engineering Validation */}
        {validation && Object.keys(validation).length > 0 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #C4CFC6", borderRadius: 14, padding: "1.6rem 2rem", boxShadow: "0 2px 10px rgba(24,37,31,0.04)" }}>
            <div style={{ fontSize: "0.68rem", color: "#2B5C8A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontWeight: 700, fontFamily: "Space Grotesk" }}>
              Engineering Validation & SLS Checks
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0 32px" }}>
              {Object.entries(validation).slice(0, 8).map(([k, v]) => (
                <InfoRow key={k} label={k.replace(/_/g, " ")} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Package */}
        <div>
          <div style={{ fontSize: "0.72rem", color: "#18251F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontWeight: 800, fontFamily: "Space Grotesk" }}>
            Recommended Material Package ({Object.keys(pkg).length} components)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {Object.entries(pkg).map(([comp, mat]) => (
              <MaterialSlot key={comp} component={comp} material={mat} />
            ))}
          </div>
          {Object.keys(pkg).length === 0 && (
            <div style={{ color: "#4A5E52", fontSize: "0.85rem", padding: "40px 0", textAlign: "center", background: "#FFFFFF", borderRadius: 12, border: "1px solid #C4CFC6" }}>
              No material package data found in this record.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
