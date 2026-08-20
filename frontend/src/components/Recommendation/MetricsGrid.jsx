"use client";
import React from 'react';
import { scoreColor } from './MaterialCard';
import SectionTitle from './SectionTitle';

function confidenceColor(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return 'var(--text-secondary)';
  if (n >= 70) return 'var(--eco-glow)';
  if (n >= 50) return 'var(--warn-amber)';
  return 'var(--error-red)';
}

function MetricCard({ label, value, sub, accent, icon }) {
  const color = accent || scoreColor(value);
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem 1rem', marginBottom: 0 }}>
      {icon && <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{icon}</div>}
      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default function MetricsGrid({ metrics, confidence, displayConfidence }) {
  if (!metrics) return null;
  const confColor = confidenceColor(displayConfidence);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <SectionTitle>📊 Project Metrics Dashboard</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <MetricCard icon="🤖" label="AI Confidence Index" value={displayConfidence !== 'N/A' ? `Top ${(100 - parseFloat(displayConfidence || 0)).toFixed(0)}%` : 'N/A'} sub={displayConfidence !== 'N/A' ? `Raw: ${displayConfidence}` : null} accent={confColor} />
        <MetricCard icon="⚡" label="Hybrid Score"        value={metrics.project_hybrid_score}    accent={scoreColor(metrics.project_hybrid_score)} />
        <MetricCard icon="📐" label="Engineering Score"   value={metrics.project_eng_score}        accent={scoreColor(metrics.project_eng_score)} />
        <MetricCard icon="🧠" label="ML Score"            value={metrics.project_ml_score !== 'N/A' ? metrics.project_ml_score : 'N/A'} accent={scoreColor(metrics.project_ml_score)} />
        <MetricCard icon="🌿" label="Avg Sustainability"  value={metrics.average_sustainability}   accent={scoreColor(metrics.average_sustainability)} />
        <MetricCard icon="💨" label="Avg Carbon"          value={metrics.average_carbon != null ? metrics.average_carbon.toFixed(2) : null} sub="kgCO₂/kg" accent="var(--warn-amber)" />
      </div>
    </div>
  );
}
export { confidenceColor };
