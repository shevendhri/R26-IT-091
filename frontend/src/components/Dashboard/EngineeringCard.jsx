// frontend/src/components/Dashboard/EngineeringCard.jsx
"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * EngineeringCard – displays detailed metrics for a material category.
 *
 * Data Traceability:
 *   Material Name         → material.name
 *   Hybrid Score          → material.score
 *   Engineering Score     → material.eng_score
 *   ML Score              → material.ml_score
 *   Sustainability Rating → material.sustainability_rating
 *   Service Life          → material.service_life
 *   Embodied Carbon       → material.embodied_carbon
 *   Cost Guidance         → material.cost_guidance
 */
export default function EngineeringCard({ label, material }) {
  if (!material) return null;
  const {
    name,
    score,
    eng_score,
    ml_score,
    service_life,
    embodied_carbon,
    cost_guidance,
    sustainability_rating
  } = material;

  const getScoreColor = (v) => {
    const n = parseFloat(v) || 0;
    if (n >= 70) return 'var(--eco-glow)';
    if (n >= 50) return 'var(--warn-amber)';
    return 'var(--error-red)';
  };

  const finalScore = score !== null && score !== undefined ? parseFloat(score).toFixed(1) : 'N/A';
  const engVal = eng_score !== null && eng_score !== undefined ? parseFloat(eng_score).toFixed(1) : 'N/A';
  const mlVal = ml_score !== null && ml_score !== undefined ? parseFloat(ml_score).toFixed(1) : 'N/A';
  
  return (
    <div className="engineering-card">
      {/* Structural accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
        background: 'linear-gradient(180deg, var(--eco-glow), transparent)'
      }}/>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <span style={{
            fontSize: '0.55rem',
            color: 'var(--text-dim)',
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {label}
          </span>
          <h3 style={{
            margin: '0.25rem 0 0 0',
            color: '#fff',
            fontSize: '1rem',
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            lineHeight: 1.3
          }}>
            {name}
          </h3>
        </div>
        
        {/* Hybrid score badge */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${getScoreColor(score)}`,
          borderRadius: '8px',
          padding: '0.4rem 0.6rem',
          textAlign: 'center',
          minWidth: '60px',
          boxShadow: `0 0 10px rgba(0, 255, 157, 0.02)`
        }}>
          <div style={{ fontSize: '0.45rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px' }}>HYBRID</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: getScoreColor(score), fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {finalScore}
          </div>
        </div>
      </div>

      {/* Technical Score Breakdown */}
      <div className="metric-box" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.65rem' }}>
        <div>
          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px' }}>ENGINEERING SUITABILITY</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '2px', fontFamily: 'Space Grotesk' }}>{engVal}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', paddingLeft: '0.75rem' }}>
          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px' }}>NEURAL MODEL ML</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--blueprint-blue)', marginTop: '2px', fontFamily: 'Space Grotesk' }}>{mlVal}</div>
        </div>
      </div>

      {/* Metadata Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
        {[
          { label: 'Eco Rating', value: sustainability_rating != null ? `${sustainability_rating}/100` : 'N/A', highlight: true },
          { label: 'Service Life', value: service_life ? `${service_life} Years` : 'N/A' },
          { label: 'Embodied Carbon', value: embodied_carbon != null ? `${embodied_carbon} kgCO₂/kg` : 'N/A' },
          { label: 'Cost Guidance', value: cost_guidance ?? 'N/A' }
        ].map((m, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: idx < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            paddingBottom: idx < 3 ? '0.4rem' : 0
          }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{m.label}</span>
            <span style={{ fontWeight: 700, color: m.highlight ? 'var(--eco-glow)' : 'var(--text-primary)' }}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
