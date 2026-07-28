// frontend/src/components/Dashboard/EngineeringCard.jsx
"use client";
import React, { useState } from 'react';

const METRIC_COLORS = {
  'Durability': '#34d399', // softer emerald
  'Thermal Performance': '#38bdf8', // sky
  'Fire Resistance': '#fb923c', // orange
  'Moisture Resistance': '#22d3ee', // cyan
  'Corrosion Resistance': '#a78bfa', // purple
  'Maintenance': '#4ade80', // green
  'Sustainability': '#a3e635', // lime
  'Lifecycle': '#facc15', // yellow
};

export default function EngineeringCard({ label, material }) {
  const [showXai, setShowXai] = useState(false);
  if (!material) return null;

  const {
    name,
    score,
    eng_score,
    ml_score,
    service_life,
    embodied_carbon,
    sustainability_rating,
    performance_metrics,
    why_this_material,
    trade_offs,
    why_not_comparison,
    disagreement_explanation,
    engine_ml_agreement,
    suitability_badge,
    suitability_color
  } = material;

  const getScoreColor = (v) => {
    const n = parseFloat(v) || 0;
    if (n >= 70) return '#10b981';
    if (n >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const finalScore = score !== null && score !== undefined ? parseFloat(score).toFixed(1) : 'N/A';
  const engVal = eng_score !== null && eng_score !== undefined ? parseFloat(eng_score).toFixed(1) : 'N/A';
  const mlVal = ml_score !== null && ml_score !== undefined ? parseFloat(ml_score).toFixed(1) : 'N/A';

  const hasXai = (why_this_material && why_this_material.length > 0) ||
    (trade_offs && trade_offs.length > 0) ||
    why_not_comparison;

  const badgeColor = suitability_color || '#3b82f6';
  const badge = suitability_badge ? { text: suitability_badge, color: badgeColor } : null;

  return (
    <div style={{
      background: 'rgba(20,20,25,0.6)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top subtle accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${getScoreColor(score)} 0%, transparent 100%)`, opacity: 0.8 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <h3 style={{ margin: 0, color: '#f3f4f6', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>
            {name}
          </h3>
          {badge && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${badge.color}15`, border: `1px solid ${badge.color}30`, color: badge.color, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {badge.text}
            </div>
          )}
        </div>
        
        {/* Overall Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
           <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Overall Score</div>
           <div style={{ fontSize: '1.75rem', fontWeight: 700, color: getScoreColor(score), lineHeight: 1 }}>
             {finalScore}
           </div>
        </div>
      </div>

      {/* Key Metrics Grid (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Eco Rating</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>{sustainability_rating != null ? `${sustainability_rating}/100` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Service Life</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>{service_life ? `${service_life} Yrs` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Embodied Carbon</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>{embodied_carbon != null ? `${embodied_carbon}` : 'N/A'} <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>kgCO₂/kg</span></span>
        </div>
      </div>

      {/* Eng vs ML Score Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Eng. Validation</span>
             <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6' }}>{engVal}</span>
           </div>
           <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.1rem' }}>ML Confidence</span>
             <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#60a5fa' }}>{mlVal}%</span>
           </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Agreement</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: (engine_ml_agreement || '').toLowerCase() === 'high' ? '#10b981' : (engine_ml_agreement || '').toLowerCase() === 'medium' ? '#f59e0b' : '#ef4444' }}>
            {engine_ml_agreement || 'Low'}
          </span>
        </div>
      </div>

      {/* ML Disagreement Warning */}
      {disagreement_explanation && (
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b', borderRadius: '0 4px 4px 0', padding: '0.75rem', fontSize: '0.75rem', color: '#d1d5db', lineHeight: 1.4 }}>
          <strong style={{ color: '#fcd34d', display: 'block', marginBottom: '0.2rem', fontSize: '0.7rem', textTransform: 'uppercase' }}>Score Divergence Detected</strong>
          {disagreement_explanation}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        
        {/* Engineering Breakdown */}
        {(() => {
          const metadata = material.engineering_metadata || {};
          const breakdown = metadata.criterion_breakdown || {};
          if (breakdown && Object.keys(breakdown).length > 0) {
            return (
              <div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
                  Engineering Evaluation Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { key: 'structural_safety', label: 'Structural Safety', weight: 25 },
                    { key: 'sls_compliance', label: 'SLS Compliance', weight: 20 },
                    { key: 'climate_compatibility', label: 'Climate Compatibility', weight: 15 },
                    { key: 'occupancy_requirements', label: 'Occupancy Suitability', weight: 15 },
                    { key: 'structural_system_compatibility', label: 'System Compatibility', weight: 10 },
                    { key: 'service_life', label: 'Service Life', weight: 5 },
                    { key: 'maintenance', label: 'Maintenance', weight: 5 },
                    { key: 'sustainability', label: 'Sustainability', weight: 5 },
                  ].map(({ key, label, weight }) => {
                    const crit = breakdown[key] || {};
                    const isNa = crit.is_na === true;
                    const val = crit.score || 0;

                    const color = isNa ? '#6b7280' : val >= 70 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444';
                    const pct = isNa ? 0 : val;

                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.2rem', alignItems: 'center' }}>
                          <span style={{ color: '#d1d5db' }}>{label}</span>
                          <span style={{ color: isNa ? '#9ca3af' : '#f3f4f6', fontSize: '0.65rem' }}>
                            {isNa ? 'N/A' : <>{val.toFixed(0)} <span style={{ color: '#6b7280' }}>/100</span></>}
                          </span>
                        </div>
                        {!isNa && (
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }}/>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Performance Metrics Profile */}
        {performance_metrics && Object.keys(performance_metrics).length > 0 && (
          <div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
              Material Performance Profile
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(performance_metrics).map(([key, val]) => {
                const color = METRIC_COLORS[key] || '#10b981';
                const pct = Math.min(100, Math.max(0, val));
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#d1d5db' }}>{key}</span>
                      <span style={{ color: '#f3f4f6', fontSize: '0.65rem' }}>{pct}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* XAI Details Toggle */}
      {hasXai && (
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <button
            onClick={() => setShowXai(!showXai)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#d1d5db',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            {showXai ? 'Hide AI Reasoning' : 'Show AI Reasoning'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showXai ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* XAI: Expandable content */}
          {showXai && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              
              {why_this_material && why_this_material.length > 0 && (
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderLeft: '2px solid #10b981', padding: '0.75rem 1rem', borderRadius: '0 6px 6px 0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Advantages</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#d1d5db', fontSize: '0.75rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {why_this_material.map((reason, i) => (
                      <li key={i}>{reason.replace(/^(✓|↳|•|✗)\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {trade_offs && trade_offs.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '2px solid #f59e0b', padding: '0.75rem 1rem', borderRadius: '0 6px 6px 0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Considerations</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#d1d5db', fontSize: '0.75rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {trade_offs.map((t, i) => (
                      <li key={i}>{t.replace(/^(✓|↳|•|✗)\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {why_not_comparison && (
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderLeft: '2px solid #3b82f6', padding: '0.75rem 1rem', borderRadius: '0 6px 6px 0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Alternative: {(why_not_comparison.alternative_name || '').toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Why Recommended Over Alternative:</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#d1d5db', fontSize: '0.75rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {(why_not_comparison.reasons_not_selected || []).map((r, i) => (
                      <li key={i}>{r.replace(/^(✓|↳|•|✗)\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
