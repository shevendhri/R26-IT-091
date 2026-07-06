"use client";
import React from 'react';

export default function XAIPanel({ componentName, material, onSelect, isSelected }) {
  if (!material) return null;
  
  const {
    id,
    name,
    hybrid_score,
    eng_score,
    ml_score,
    sustainability_rating,
    embodied_carbon,
    service_life_years,
    service_life,
    climate_compatible,
    engineering_reasoning,
    rationale
  } = material;

  // Use the best available fields from the payload
  const finalScore = hybrid_score ?? material.suitability_score ?? 0;
  const carbon = embodied_carbon ?? 'N/A';
  const sLife = service_life_years ?? service_life ?? 'N/A';
  const reasonText = rationale || (engineering_reasoning && engineering_reasoning[0]) || 'AI evaluation complete. Recommended based on structural and environmental constraints.';

  return (
    <div className="xai-panel" style={{
      background: 'rgba(10, 15, 25, 0.7)',
      border: `1px solid ${isSelected ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
      borderRadius: '16px',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Background glow for selected */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--eco-glow), transparent)'
        }}/>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {componentName} / CANDIDATE #{id}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Space Grotesk', color: '#fff', margin: 0, lineHeight: 1.2 }}>
            {name}
          </h2>
        </div>
        <button 
          onClick={onSelect}
          style={{
            background: isSelected ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isSelected ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
            color: isSelected ? 'var(--eco-glow)' : '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase'
          }}
        >
          {isSelected ? '✓ ACTIVE SPECIFICATION' : 'SELECT MATERIAL'}
        </button>
      </div>

      {/* Scores Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'HYBRID SCORE', value: finalScore, color: 'var(--eco-glow)' },
          { label: 'ENGINEERING', value: eng_score ?? 'N/A', color: 'var(--text-primary)' },
          { label: 'NEURAL ML', value: ml_score ?? 'N/A', color: 'var(--blueprint-blue)' }
        ].map((score, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '2px', marginBottom: '0.5rem' }}>
              {score.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: score.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
              {typeof score.value === 'number' ? score.value.toFixed(1) : score.value}
            </div>
          </div>
        ))}
      </div>

      {/* Engineering & Eco Metrics */}
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '2px', marginBottom: '1rem' }}>
          ENVIRONMENTAL & LIFECYCLE METRICS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Sustainability Rating', value: sustainability_rating ?? 'N/A' },
            { label: 'Embodied Carbon', value: carbon !== 'N/A' ? `${carbon} kgCO₂/kg` : 'N/A' },
            { label: 'Service Life', value: sLife !== 'N/A' ? `${sLife} yrs` : 'N/A' },
            { label: 'Climate Compatibility', value: climate_compatible ? 'Verified ✓' : 'N/A', highlight: climate_compatible }
          ].map((metric, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{metric.label}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: metric.highlight ? 'var(--eco-glow)' : '#fff' }}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Justification */}
      <div style={{
        background: 'rgba(0, 255, 157, 0.03)',
        border: '1px solid rgba(0, 255, 157, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--eco-glow)', borderRadius: '50%', boxShadow: '0 0 10px var(--eco-glow)' }}></span>
          AI JUSTIFICATION
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          {reasonText}
        </p>
      </div>

    </div>
  );
}
