"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

function Badge({ children, color = "#10b981" }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}40`,
      color, borderRadius: 6, padding: "2px 10px",
      fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em",
    }}>{children}</span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #4f6880)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: "0.82rem", color: "var(--text-primary, #f0f4f8)", fontWeight: 600 }}>{value ?? "—"}</span>
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
      background: "var(--eco-card, #0f1a2e)",
      border: "1px solid var(--eco-border, #1e2d48)",
      borderRadius: 10, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: "0.62rem", color: "var(--green, #10b981)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{component}</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f0f4f8", fontFamily: "Space Grotesk" }}>{name}</div>
        </div>
        {score !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.58rem", color: "var(--text-muted, #4f6880)", textTransform: "uppercase", marginBottom: 2 }}>Score</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--green, #10b981)", fontFamily: "Space Grotesk" }}>
              {Number(score).toFixed(1)}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {sustainability != null && <Badge color="#10b981">Sustainability: {sustainability}</Badge>}
        {serviceLife != null && <Badge color="#38bdf8">Life: {serviceLife}yr</Badge>}
        {embodiedCarbon != null && <Badge color="#f59e0b">Carbon: {typeof embodiedCarbon === "number" ? embodiedCarbon.toFixed(2) : embodiedCarbon}</Badge>}
        {durability && <Badge color="#8b5cf6">Durability: {durability}</Badge>}
        {unitRate != null && <Badge color="#64748b">Rate: LKR {Number(unitRate).toLocaleString()}</Badge>}
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
    <div style={{ minHeight: "100vh", background: "#070b13", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f6880" }}>
      Loading…
    </div>
  );

  if (error || !entry) return (
    <div style={{ minHeight: "100vh", background: "#070b13", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "#ef4444", fontSize: "0.9rem" }}>Failed to load: {error || "Not found"}</div>
      <Link href="/history" style={{ color: "#10b981", textDecoration: "none", fontSize: "0.8rem" }}>← Back to History</Link>
    </div>
  );

  const info = parse(entry.project_info);
  const rec = parse(entry.recommendation);
  const pkg = rec?.recommended_package || {};
  const metrics = rec?.metrics || {};
  const climate = rec?.climate_profile || {};
  const validation = rec?.validation || {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--eco-black, #070b13)", color: "#f0f4f8", fontFamily: "Inter, sans-serif", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: "36px 5% 24px", borderBottom: "1px solid #1e2d48", marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <Link href="/history" style={{ color: "#10b981", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              ← RECOMMENDATION HISTORY
            </Link>
            <h1 style={{ fontSize: "1.55rem", fontWeight: 800, fontFamily: "Space Grotesk", margin: "10px 0 4px" }}>
              {info?.location || "—"} — {info?.building_type || rec?.building_type || "—"}
            </h1>
            <div style={{ color: "#4f6880", fontSize: "0.8rem" }}>
              Generated {fmtDate(entry.created_at)} &nbsp;·&nbsp; Entry #{entry.id}
            </div>
          </div>
          <Badge color="#10b981">READ-ONLY</Badge>
        </div>
      </div>

      <div style={{ padding: "0 5%", display: "grid", gap: 28 }}>
        {/* Project Info */}
        <div style={{ background: "#0f1a2e", border: "1px solid #1e2d48", borderRadius: 12, padding: "22px 24px" }}>
          <div style={{ fontSize: "0.65rem", color: "#10b981", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Project Details</div>
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
          <div style={{ background: "#0f1a2e", border: "1px solid #1e2d48", borderRadius: 12, padding: "22px 24px" }}>
            <div style={{ fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Engineering Validation</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0 32px" }}>
              {Object.entries(validation).slice(0, 8).map(([k, v]) => (
                <InfoRow key={k} label={k.replace(/_/g, " ")} value={String(v)} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Package */}
        <div>
          <div style={{ fontSize: "0.65rem", color: "#f0f4f8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, opacity: 0.6 }}>
            Recommended Material Package ({Object.keys(pkg).length} components)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {Object.entries(pkg).map(([comp, mat]) => (
              <MaterialSlot key={comp} component={comp} material={mat} />
            ))}
          </div>
          {Object.keys(pkg).length === 0 && (
            <div style={{ color: "#4f6880", fontSize: "0.85rem", padding: "40px 0", textAlign: "center" }}>
              No material package data found in this record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
