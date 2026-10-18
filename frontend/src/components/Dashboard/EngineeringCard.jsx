"use client";
import React, { useState } from 'react';

const METRIC_ARCH_COLORS = {
  'Durability': '#059669',
  'Thermal Performance': '#2563EB',
  'Fire Resistance': '#DC2626',
  'Moisture Resistance': '#0284C7',
  'Corrosion Resistance': '#0D9488',
  'Maintenance': '#16A34A',
  'Sustainability': '#059669',
  'Lifecycle': '#D97706',
};

export default function EngineeringCard({ label, material }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics');

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

  const hasMetrics = performance_metrics && Object.keys(performance_metrics).length > 0;
  const hasXai = (why_this_material && why_this_material.length > 0) ||
    (trade_offs && trade_offs.length > 0) ||
    Boolean(why_not_comparison);

  const metadata = material.engineering_metadata || {};
  const breakdown = metadata.criterion_breakdown || {};
  const hasBreakdown = Object.keys(breakdown).length > 0;
  const hasQuantityBasis = material.calculation_basis || material.standard_reference;

  // Score styling logic
  const scoreNum = parseFloat(finalScore);
  const isHigh = scoreNum >= 75;
  const isMid = scoreNum >= 55 && scoreNum < 75;

  const scoreTheme = isHigh
    ? {
        pillBg: '#EBF3ED',
        pillText: '#143825',
        pillBorder: '#D2E4D6',
        badgeBg: 'linear-gradient(135deg, #143825, #235338)',
        badgeShadow: '0 4px 12px rgba(20, 56, 37, 0.20)',
        accentLine: '#143825'
      }
    : isMid
    ? {
        pillBg: '#FDF8EE',
        pillText: '#7A5229',
        pillBorder: '#EADEC9',
        badgeBg: 'linear-gradient(135deg, #7A5229, #9B6C3B)',
        badgeShadow: '0 4px 12px rgba(122, 82, 41, 0.20)',
        accentLine: '#7A5229'
      }
    : {
        pillBg: '#FDF0ED',
        pillText: '#8E3B27',
        pillBorder: '#F5D3C8',
        badgeBg: 'linear-gradient(135deg, #8E3B27, #B85C43)',
        badgeShadow: '0 4px 12px rgba(142, 59, 39, 0.20)',
        accentLine: '#B85C43'
      };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2DCD0',
      borderTop: `4px solid ${scoreTheme.accentLine}`,
      borderRadius: '8px',
      padding: '1.35rem 1.45rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      boxShadow: '0 3px 14px rgba(20, 56, 37, 0.04)',
      transition: 'all 0.2s ease',
    }}>
      {/* ── 1. Top Badges & Score ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Component Category Tag */}
            <span style={{
              fontSize: '0.70rem',
              color: '#143825',
              background: '#EBF3ED',
              border: '1px solid #D2E4D6',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'Space Grotesk, sans-serif',
              padding: '3px 8px',
              borderRadius: '4px',
            }}>
              {label} Component
            </span>

            {/* Suitability Badge */}
            {suitability_badge && (
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: scoreTheme.pillText,
                background: scoreTheme.pillBg,
                border: `1px solid ${scoreTheme.pillBorder}`,
                padding: '3px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                ✓ {suitability_badge}
              </span>
            )}
          </div>

          {/* Material Name */}
          <h3 style={{
            margin: '0.35rem 0 0.2rem',
            color: '#143825',
            fontSize: '1.20rem',
            fontWeight: 800,
            lineHeight: 1.35,
            fontFamily: 'Outfit, Space Grotesk, sans-serif',
            letterSpacing: '-0.01em',
          }}>
            {name}
          </h3>

          {/* Classification Provenance Pill */}
          {material.classification && (
            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                background: material.classification === 'ENGINEERING-LED RECOMMENDATION'
                  ? '#F5F7F5'
                  : '#EBF3ED',
                border: material.classification === 'ENGINEERING-LED RECOMMENDATION'
                  ? '1px solid #D2E4D6'
                  : '1px solid #D2E4D6',
                color: '#143825',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                <span>✦</span> {material.classification}
              </span>
            </div>
          )}
        </div>

        {/* Prominent Score Card */}
        <div style={{
          background: scoreTheme.badgeBg,
          color: '#FFFFFF',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: scoreTheme.badgeShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '72px',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '-0.02em',
          }}>
            {finalScore}
          </span>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            opacity: 0.9,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginTop: '3px',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            Score / 100
          </span>
        </div>
      </div>

      {/* ── 2. Vitals Stat Cards (3 Column High-Contrast Grid) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.65rem',
      }}>
        {/* Eco Rating */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#EBF3ED',
          border: '1px solid #D2E4D6',
          borderRadius: '6px',
          padding: '0.65rem 0.85rem',
        }}>
          <span style={{
            fontSize: '0.66rem',
            color: '#143825',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.08em',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Eco Rating
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '3px' }}>
            <span style={{ fontSize: '1.10rem', fontWeight: 900, color: '#143825', fontFamily: 'Space Grotesk, sans-serif' }}>
              {sustainability_rating != null ? sustainability_rating : 'N/A'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#5E836E', fontWeight: 700 }}>/100</span>
          </div>
        </div>

        {/* Service Life */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#F5F3EF',
          border: '1px solid #E2DCD0',
          borderRadius: '6px',
          padding: '0.65rem 0.85rem',
        }}>
          <span style={{
            fontSize: '0.66rem',
            color: '#4A5E52',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.08em',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Service Life
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '3px' }}>
            <span style={{ fontSize: '1.10rem', fontWeight: 900, color: '#1A2E22', fontFamily: 'Space Grotesk, sans-serif' }}>
              {service_life ? service_life : 'N/A'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#697068', fontWeight: 700 }}>Yrs</span>
          </div>
        </div>

        {/* Embodied Carbon */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#FDF8EE',
          border: '1px solid #EADEC9',
          borderRadius: '6px',
          padding: '0.65rem 0.85rem',
        }}>
          <span style={{
            fontSize: '0.66rem',
            color: '#7A5229',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.08em',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Embodied Carbon
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.10rem', fontWeight: 900, color: '#7A5229', fontFamily: 'Space Grotesk, sans-serif' }}>
              {embodied_carbon != null ? embodied_carbon : 'N/A'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#8D6A4F', fontWeight: 700 }}>kgCO₂</span>
          </div>
        </div>
      </div>

      {/* ── 3. Takeoff & Engine Weighting Row ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.65rem 0.95rem',
        background: '#FAF7F0',
        borderRadius: '6px',
        border: '1px solid #E2DCD0',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{
            color: '#697068',
            fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            textTransform: 'uppercase',
            fontSize: '0.68rem',
            letterSpacing: '0.06em'
          }}>
            Takeoff:
          </span>
          <span style={{ color: '#1A2E22', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.84rem' }}>
            {material.unit_count_label || (material.quantity != null ? `${material.quantity} ${material.unit || 'm²'}` : 'Estimated for structure')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#EBF3ED',
            color: '#143825',
            border: '1px solid #D2E4D6',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            Eng: <strong>{engVal}</strong>
          </span>
          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#F5F3EF',
            color: '#4A5E52',
            border: '1px solid #E2DCD0',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            ML: <strong>{mlVal}%</strong>
          </span>
        </div>
      </div>

      {/* ── 4. Expand Toggle Button ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          background: isExpanded ? '#143825' : '#F5F1E8',
          border: `1px solid ${isExpanded ? '#143825' : '#E2DCD0'}`,
          color: isExpanded ? '#FAF7F0' : '#143825',
          borderRadius: '6px',
          padding: '0.70rem 1rem',
          fontSize: '0.76rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.15s ease',
          fontFamily: 'Space Grotesk, sans-serif',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          boxShadow: isExpanded ? '0 2px 8px rgba(20, 56, 37, 0.20)' : 'none',
        }}
      >
        <span>
          {isExpanded ? 'Hide Technical Telemetry' : 'View Performance Metrics & SLS Details'}
        </span>
        <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>
          {isExpanded ? '▲ LESS' : '▼ MORE'}
        </span>
      </button>

      {/* ── 5. Expandable Drawer ── */}
      {isExpanded && (
        <div style={{
          background: '#FAF7F0',
          border: '1px solid #E2DCD0',
          borderRadius: '6px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'inset 0 1px 3px rgba(20, 56, 37, 0.03)',
        }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2DCD0', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
            {hasMetrics && (
              <button
                type="button"
                onClick={() => setActiveTab('metrics')}
                style={{
                  background: activeTab === 'metrics' ? '#143825' : '#FFFFFF',
                  border: `1px solid ${activeTab === 'metrics' ? '#143825' : '#E2DCD0'}`,
                  color: activeTab === 'metrics' ? '#FAF7F0' : '#4A5E52',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Performance Bars
              </button>
            )}
            {hasQuantityBasis && (
              <button
                type="button"
                onClick={() => setActiveTab('sls')}
                style={{
                  background: activeTab === 'sls' ? '#143825' : '#FFFFFF',
                  border: `1px solid ${activeTab === 'sls' ? '#143825' : '#E2DCD0'}`,
                  color: activeTab === 'sls' ? '#FAF7F0' : '#4A5E52',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                SLS & Takeoff Basis
              </button>
            )}
            {hasXai && (
              <button
                type="button"
                onClick={() => setActiveTab('xai')}
                style={{
                  background: activeTab === 'xai' ? '#143825' : '#FFFFFF',
                  border: `1px solid ${activeTab === 'xai' ? '#143825' : '#E2DCD0'}`,
                  color: activeTab === 'xai' ? '#FAF7F0' : '#4A5E52',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                AI Rationale
              </button>
            )}
          </div>

          {/* TAB 1: Performance Bars */}
          {activeTab === 'metrics' && hasMetrics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk' }}>
                Multi-Criteria Engineering Scores
              </div>
              {Object.entries(performance_metrics).map(([key, val]) => {
                const color = METRIC_ARCH_COLORS[key] || '#059669';
                const pct = Math.min(100, Math.max(0, val));
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#1E293B', fontWeight: 600 }}>{key}</span>
                      <span style={{ color: color, fontSize: '0.82rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SLS & Quantity */}
          {activeTab === 'sls' && hasQuantityBasis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                <span style={{ color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.70rem', letterSpacing: '0.06em', fontFamily: 'Space Grotesk' }}>
                  Standard Reference:
                </span>{' '}
                <strong style={{ color: '#1E3A8A' }}>{material.standard_reference || 'SLS 614 / SLS 375 Compliance'}</strong>
              </div>

              {material.calculation_basis && (
                <div style={{ background: '#F8FAFC', padding: '0.75rem 0.95rem', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#1E293B', lineHeight: 1.6 }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem', fontFamily: 'Space Grotesk', letterSpacing: '0.06em' }}>
                    Formula & Takeoff Computation:
                  </div>
                  {material.calculation_basis}
                </div>
              )}

              {hasBreakdown && (
                <div>
                  <div style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.45rem', fontFamily: 'Space Grotesk', letterSpacing: '0.06em' }}>
                    Engineering Criteria Scores:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                    {Object.entries(breakdown).slice(0, 6).map(([cKey, cVal]) => {
                      const displayVal = typeof cVal === 'number' ? cVal.toFixed(1) : (cVal?.score ?? cVal?.value ?? 'N/A');
                      return (
                        <div key={cKey} style={{ background: '#F8FAFC', padding: '0.50rem 0.65rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'capitalize', fontFamily: 'Space Grotesk' }}>{cKey.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#064E3B', fontFamily: 'Space Grotesk' }}>{String(displayVal)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: XAI Rationale */}
          {activeTab === 'xai' && hasXai && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
              {why_this_material && why_this_material.length > 0 && (
                <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '6px', padding: '0.75rem 0.95rem' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'Space Grotesk', letterSpacing: '0.06em' }}>
                    ✓ Why Selected:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#14532D', lineHeight: 1.6 }}>
                    {why_this_material.map((item, idx) => (
                      <li key={idx}>{typeof item === 'object' ? (item.reason || item.text || item.description || JSON.stringify(item)) : String(item)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {trade_offs && trade_offs.length > 0 && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '0.75rem 0.95rem' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'Space Grotesk', letterSpacing: '0.06em' }}>
                    ⚠️ Trade-offs to Consider:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#7F1D1D', lineHeight: 1.6 }}>
                    {trade_offs.map((item, idx) => (
                      <li key={idx}>{typeof item === 'object' ? (item.reason || item.trade_off || item.description || JSON.stringify(item)) : String(item)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {why_not_comparison && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '6px', padding: '0.75rem 0.95rem' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', marginBottom: '0.35rem', fontFamily: 'Space Grotesk', letterSpacing: '0.06em' }}>
                    ✦ Comparative Regional Verdict:
                  </div>
                  <p style={{ margin: 0, color: '#78350F', lineHeight: 1.6 }}>
                    {typeof why_not_comparison === 'object' ? (why_not_comparison.text || why_not_comparison.reason || JSON.stringify(why_not_comparison)) : String(why_not_comparison)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
