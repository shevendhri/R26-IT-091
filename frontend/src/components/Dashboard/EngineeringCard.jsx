"use client";
import React, { useState } from 'react';

const METRIC_COLORS = {
  'Durability': '#10b981',
  'Thermal Performance': '#38bdf8',
  'Fire Resistance': '#f59e0b',
  'Moisture Resistance': '#38bdf8',
  'Corrosion Resistance': '#94a3b8',
  'Maintenance': '#10b981',
  'Sustainability': '#10b981',
  'Lifecycle': '#38bdf8',
};

export default function EngineeringCard({ label, material }) {
  const [showXai, setShowXai] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

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
    suitability_badge,
  } = material;

  const finalScore = score !== null && score !== undefined ? parseFloat(score).toFixed(1) : 'N/A';
  const engVal = eng_score !== null && eng_score !== undefined ? parseFloat(eng_score).toFixed(1) : 'N/A';
  const mlVal = ml_score !== null && ml_score !== undefined ? parseFloat(ml_score).toFixed(1) : 'N/A';

  const hasXai = (why_this_material && why_this_material.length > 0) ||
    (trade_offs && trade_offs.length > 0) ||
    why_not_comparison;

  const metadata = material.engineering_metadata || {};
  const breakdown = metadata.criterion_breakdown || {};
  const hasBreakdown = Object.keys(breakdown).length > 0;

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    }}>
      {/* Header & Primary Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label} Component
            </span>
            {material.classification && (
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: material.classification === 'ENGINEERING-LED RECOMMENDATION' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: material.classification === 'ENGINEERING-LED RECOMMENDATION' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                color: material.classification === 'ENGINEERING-LED RECOMMENDATION' ? '#38bdf8' : '#10b981',
                textTransform: 'uppercase'
              }}>
                {material.classification}
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.3, fontFamily: 'Space Grotesk' }}>
            {name}
          </h3>
          {suitability_badge && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '0.4rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {suitability_badge}
            </div>
          )}
        </div>
        
        {/* Score Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: '#090d16', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Overall Score</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', lineHeight: 1, fontFamily: 'Space Grotesk' }}>
            {finalScore}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#090d16', borderRadius: '6px', padding: '0.75rem', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Eco Rating</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{sustainability_rating != null ? `${sustainability_rating}/100` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Service Life</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{service_life ? `${service_life} Yrs` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Embodied Carbon</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{embodied_carbon != null ? `${embodied_carbon}` : 'N/A'} <span style={{ fontSize: '0.62rem', color: '#64748b' }}>kgCO₂/kg</span></span>
        </div>
      </div>

      {/* Material Quantity Takeoff & Calculation Basis */}
      {material.quantity != null && (
        <div style={{ background: '#090d16', borderRadius: '6px', padding: '0.65rem 0.85rem', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.62rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Preliminary Quantity Takeoff
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              {material.standard_reference || 'SLS-Referenced'}
            </span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
            {material.unit_count_label || `${material.quantity} ${material.unit || 'm²'}`}
          </div>
          {material.calculation_basis && (
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: 1.4 }}>
              {material.calculation_basis}
            </div>
          )}
        </div>
      )}

      {/* Eng Validation vs ML Confidence Telemetry */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.1rem' }}>Eng Validation</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#38bdf8' }}>{engVal}</span>
          </div>
          <div style={{ width: '1px', background: '#1e293b' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.1rem' }}>ML Confidence</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>{mlVal}%</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Profile */}
      {performance_metrics && Object.keys(performance_metrics).length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Performance Metrics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {Object.entries(performance_metrics).map(([key, val]) => {
              const color = METRIC_COLORS[key] || '#10b981';
              const pct = Math.min(100, Math.max(0, val));
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.15rem' }}>
                    <span style={{ color: '#cbd5e1' }}>{key}</span>
                    <span style={{ color: '#f8fafc', fontSize: '0.7rem', fontWeight: 600 }}>{pct}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Action Buttons: Engineering Criteria & XAI Rationale */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        {hasBreakdown && (
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            style={{
              flex: 1,
              background: '#090d16',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.45rem 0.75rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            {showBreakdown ? 'Hide Engineering Rules' : 'Engineering Rules'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}

        {hasXai && (
          <button
            onClick={() => setShowXai(!showXai)}
            style={{
              flex: 1,
              background: '#090d16',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.45rem 0.75rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            {showXai ? 'Hide Reasoning Stack' : 'Reasoning Stack'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showXai ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* Engineering Criteria Breakdown (Collapsible) */}
      {showBreakdown && hasBreakdown && (
        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            SLS Engineering Evaluation Criteria
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { key: 'structural_safety', label: 'Structural Safety' },
              { key: 'sls_compliance', label: 'SLS-Referenced Rule Check' },
              { key: 'climate_compatibility', label: 'Climate Compatibility' },
              { key: 'occupancy_requirements', label: 'Occupancy Suitability' },
              { key: 'structural_system_compatibility', label: 'System Compatibility' },
              { key: 'service_life', label: 'Service Life' },
              { key: 'maintenance', label: 'Maintenance' },
              { key: 'sustainability', label: 'Sustainability' },
            ].map(({ key, label }) => {
              const crit = breakdown[key] || {};
              const isNa = crit.is_na === true;
              const val = crit.score || 0;
              const color = isNa ? '#64748b' : val >= 70 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444';

              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.15rem' }}>
                    <span style={{ color: '#cbd5e1' }}>{label}</span>
                    <span style={{ color: isNa ? '#64748b' : '#f8fafc', fontSize: '0.68rem', fontWeight: 600 }}>
                      {isNa ? 'N/A' : `${val.toFixed(0)}/100`}
                    </span>
                  </div>
                  {!isNa && (
                    <div style={{ height: '3px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: color }}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* XAI Reasoning Stack (Collapsible) */}
      {showXai && hasXai && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          
          {why_this_material && why_this_material.length > 0 && (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #10b981', padding: '0.6rem 0.85rem', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>Primary Selection Drivers</div>
              <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {why_this_material.map((reason, i) => (
                  <li key={i}>{reason.replace(/^(✓|↳|•|✗)\s*/, '')}</li>
                ))}
              </ul>
            </div>
          )}

          {trade_offs && trade_offs.length > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b', padding: '0.6rem 0.85rem', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>Engineering Trade-Offs</div>
              <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {trade_offs.map((t, i) => (
                  <li key={i}>{t.replace(/^(✓|↳|•|✗)\s*/, '')}</li>
                ))}
              </ul>
            </div>
          )}

          {why_not_comparison && (
            <div style={{ background: 'rgba(56, 189, 248, 0.05)', borderLeft: '3px solid #38bdf8', padding: '0.6rem 0.85rem', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                Comparative Rationale vs. {(why_not_comparison.alternative_name || '').toUpperCase()}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {(why_not_comparison.reasons_not_selected || []).map((r, i) => (
                  <li key={i}>{r.replace(/^(✓|↳|•|✗)\s*/, '')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
