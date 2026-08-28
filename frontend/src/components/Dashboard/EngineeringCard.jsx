"use client";
import React, { useState } from 'react';

const METRIC_COLORS = {
  'Durability': '#245C43',
  'Thermal Performance': '#3E6F8E',
  'Fire Resistance': '#C77A3D',
  'Moisture Resistance': '#3E6F8E',
  'Corrosion Resistance': '#526158',
  'Maintenance': '#245C43',
  'Sustainability': '#245C43',
  'Lifecycle': '#3E6F8E',
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
    <div className="glass-card" style={{
      background: '#FFFFFF',
      border: '1px solid #C8D3CA',
      borderRadius: '16px',
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.06), 0 18px 50px rgba(24, 37, 31, 0.08)',
    }}>
      {/* Header & Primary Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#526158', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
              {label} Component
            </span>
            {material.classification && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: material.classification === 'ENGINEERING-LED RECOMMENDATION' ? 'rgba(62, 111, 142, 0.12)' : '#DDE8DE',
                border: material.classification === 'ENGINEERING-LED RECOMMENDATION' ? '1px solid rgba(62, 111, 142, 0.3)' : '1px solid rgba(36, 92, 67, 0.25)',
                color: material.classification === 'ENGINEERING-LED RECOMMENDATION' ? '#3E6F8E' : '#245C43',
                textTransform: 'uppercase'
              }}>
                {material.classification}
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, color: '#18251F', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3, fontFamily: 'Space Grotesk' }}>
            {name}
          </h3>
          {suitability_badge && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '0.45rem', padding: '3px 10px', borderRadius: '6px', background: '#DDE8DE', border: '1px solid rgba(36, 92, 67, 0.25)', color: '#245C43', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {suitability_badge}
            </div>
          )}
        </div>
        
        {/* Score Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: '#F7F9F6', padding: '0.6rem 0.95rem', borderRadius: '10px', border: '1px solid #C8D3CA' }}>
          <div style={{ fontSize: '0.64rem', color: '#526158', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem', letterSpacing: '0.05em' }}>Overall Score</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#245C43', lineHeight: 1, fontFamily: 'Space Grotesk' }}>
            {finalScore}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#F7F9F6', borderRadius: '12px', padding: '0.85rem', border: '1px solid #C8D3CA' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'uppercase', fontWeight: 700 }}>Eco Rating</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#18251F' }}>{sustainability_rating != null ? `${sustainability_rating}/100` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'uppercase', fontWeight: 700 }}>Service Life</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#18251F' }}>{service_life ? `${service_life} Yrs` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'uppercase', fontWeight: 700 }}>Embodied Carbon</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#18251F' }}>{embodied_carbon != null ? `${embodied_carbon}` : 'N/A'} <span style={{ fontSize: '0.65rem', color: '#748078' }}>kgCO₂/kg</span></span>
        </div>
      </div>

      {/* Material Quantity Takeoff & Calculation Basis */}
      {material.quantity != null && (
        <div style={{ background: '#F7F9F6', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #C8D3CA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#3E6F8E', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              Preliminary Quantity Takeoff
            </span>
            <span style={{ fontSize: '0.72rem', color: '#526158', fontWeight: 600 }}>
              {material.standard_reference || 'SLS-Referenced'}
            </span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk' }}>
            {material.unit_count_label || `${material.quantity} ${material.unit || 'm²'}`}
          </div>
          {material.calculation_basis && (
            <div style={{ fontSize: '0.74rem', color: '#526158', marginTop: '0.25rem', lineHeight: 1.4, fontWeight: 500 }}>
              {material.calculation_basis}
            </div>
          )}
        </div>
      )}

      {/* Eng Validation vs ML Confidence Telemetry */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', borderBottom: '1px solid #C8D3CA', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.1rem' }}>Eng Validation</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#245C43', fontFamily: 'Space Grotesk' }}>{engVal}</span>
          </div>
          <div style={{ width: '1px', background: '#C8D3CA' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.1rem' }}>ML Confidence</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18251F', fontFamily: 'Space Grotesk' }}>{mlVal}%</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Profile */}
      {performance_metrics && Object.keys(performance_metrics).length > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', color: '#526158', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Performance Metrics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {Object.entries(performance_metrics).map(([key, val]) => {
              const color = METRIC_COLORS[key] || '#245C43';
              const pct = Math.min(100, Math.max(0, val));
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                    <span style={{ color: '#18251F', fontWeight: 600 }}>{key}</span>
                    <span style={{ color: '#245C43', fontSize: '0.75rem', fontWeight: 700 }}>{pct}</span>
                  </div>
                  <div style={{ height: '5px', background: '#E3E9E2', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }}/>
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
              background: '#FFFFFF',
              border: '1px solid #C8D3CA',
              color: '#18251F',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            <span>{showBreakdown ? 'Hide Criteria' : 'Engineering Criteria'}</span>
            <span style={{ fontSize: '0.65rem' }}>{showBreakdown ? '▲' : '▼'}</span>
          </button>
        )}
        {hasXai && (
          <button
            onClick={() => setShowXai(!showXai)}
            style={{
              flex: 1,
              background: '#DDE8DE',
              border: '1px solid rgba(36, 92, 67, 0.3)',
              color: '#245C43',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            <span>{showXai ? 'Hide XAI Rationale' : 'XAI Rationale'}</span>
            <span style={{ fontSize: '0.65rem' }}>{showXai ? '▲' : '▼'}</span>
          </button>
        )}
      </div>

      {/* Expandable Engineering Criterion Breakdown Panel */}
      {showBreakdown && hasBreakdown && (
        <div style={{
          background: '#F7F9F6',
          border: '1px solid #C8D3CA',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          marginTop: '0.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#245C43', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Criteria Scoring Breakdown (Engineering Rule Engine)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
            {Object.entries(breakdown).map(([cKey, cVal]) => {
              let displayVal = 'N/A';
              if (typeof cVal === 'number') {
                displayVal = cVal.toFixed(1);
              } else if (typeof cVal === 'string') {
                displayVal = cVal;
              } else if (cVal && typeof cVal === 'object') {
                if (cVal.is_na) {
                  displayVal = 'N/A';
                } else if (cVal.score != null) {
                  displayVal = typeof cVal.score === 'number' ? cVal.score.toFixed(1) : String(cVal.score);
                } else if (cVal.value != null) {
                  displayVal = typeof cVal.value === 'number' ? cVal.value.toFixed(1) : String(cVal.value);
                }
              }

              return (
                <div key={cKey} style={{ background: '#FFFFFF', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #C8D3CA' }}>
                  <div style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'capitalize', fontWeight: 600 }}>{cKey.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#18251F' }}>
                    {displayVal}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable XAI Rationale Drawer */}
      {showXai && hasXai && (
        <div style={{
          background: '#F7F9F6',
          border: '1px solid #C8D3CA',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          marginTop: '0.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {why_this_material && why_this_material.length > 0 && (
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#245C43', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Why This Material
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#18251F', fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 500 }}>
                {why_this_material.map((item, idx) => (
                  <li key={idx}>{typeof item === 'object' ? (item.reason || item.text || item.description || JSON.stringify(item)) : String(item)}</li>
                ))}
              </ul>
            </div>
          )}

          {trade_offs && trade_offs.length > 0 && (
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#C77A3D', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Engineering Trade-offs
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#526158', fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 500 }}>
                {trade_offs.map((item, idx) => (
                  <li key={idx}>{typeof item === 'object' ? (item.reason || item.trade_off || item.description || JSON.stringify(item)) : String(item)}</li>
                ))}
              </ul>
            </div>
          )}

          {why_not_comparison && (
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3E6F8E', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Comparative Rationale
              </div>
              <p style={{ margin: 0, color: '#526158', fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 500 }}>
                {typeof why_not_comparison === 'object' ? (why_not_comparison.text || why_not_comparison.reason || JSON.stringify(why_not_comparison)) : String(why_not_comparison)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
