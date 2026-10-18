"use client";

import React from 'react';

// ── Helpers shared across the card ──
export function scoreColor(v) {
  const n = parseFloat(v) || 0;
  if (n >= 70) return '#1A382B'; // Deep Forest Green
  if (n >= 50) return '#C88A32'; // Warm Amber
  return '#B8583B';            // Terracotta
}

function getSwatchClass(name = '', category = '') {
  const str = `${name} ${category}`.toLowerCase();
  if (str.includes('concrete') || str.includes('cement')) return 'swatch-concrete';
  if (str.includes('timber') || str.includes('wood') || str.includes('teak') || str.includes('bamboo')) return 'swatch-timber';
  if (str.includes('brick') || str.includes('clay') || str.includes('terracotta') || str.includes('tile')) return 'swatch-brick';
  if (str.includes('glass') || str.includes('glaz')) return 'swatch-glass';
  if (str.includes('earth') || str.includes('block') || str.includes('soil')) return 'swatch-earth';
  return 'swatch-stone';
}

function ScoreBar({ label, value, max = 100 }) {
  const pct = Math.min(100, Math.max(0, ((parseFloat(value) || 0) / max) * 100));
  const color = scoreColor(value);
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#555E59', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.80rem', fontWeight: 800, color, fontFamily: 'Space Grotesk' }}>
          {value != null ? parseFloat(value).toFixed(1) : 'N/A'}
        </span>
      </div>
      <div style={{ height: '4px', background: 'rgba(25, 30, 27, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function VetoBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'rgba(184, 88, 59, 0.10)', border: '1px solid rgba(184, 88, 59, 0.35)',
      borderRadius: '3px', padding: '2px 8px', fontSize: '0.62rem', fontWeight: 800,
      color: '#B8583B', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Space Grotesk'
    }}>
      ENGINEERING VETO
    </span>
  );
}

/** Renders the top-3 candidates table for a category */
function AlternativesTable({ candidates }) {
  if (!candidates || candidates.length === 0) return null;
  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(25, 30, 27, 0.10)' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1A382B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem', fontFamily: 'Space Grotesk' }}>
        RANKED CANDIDATES EVALUATION
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'Space Grotesk' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(25, 30, 27, 0.12)' }}>
              {['#', 'Material Candidate', 'Hybrid', 'ML', 'Eng'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: '#7C8681', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(25, 30, 27, 0.05)', background: i === 0 ? 'rgba(26, 56, 43, 0.04)' : 'transparent' }}>
                <td style={{ padding: '6px 8px', color: i === 0 ? '#1A382B' : '#7C8681', fontWeight: 800 }}>#{c.rank}</td>
                <td style={{ padding: '6px 8px', color: i === 0 ? '#181B1A' : '#555E59', fontWeight: i === 0 ? 700 : 500 }}>{c.material}</td>
                <td style={{ padding: '6px 8px', color: scoreColor(c.hybrid_score), fontWeight: 700 }}>{c.hybrid_score?.toFixed(1)}</td>
                <td style={{ padding: '6px 8px', color: '#555E59' }}>{c.ml_score != null ? c.ml_score.toFixed(1) : '—'}</td>
                <td style={{ padding: '6px 8px', color: '#555E59' }}>{c.engineering_score?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * MaterialCard — renders an architectural material board.
 */
export default function MaterialCard({ categoryKey, displayName, item, candidates }) {
  if (!item || !item.name) return null;

  const isVetoed = item.selection_reason?.vetoed === true;
  const hybridScore = item.score;
  const engScore = item.eng_score;
  const mlScore = item.ml_score;
  const swatchClass = getSwatchClass(item.name, displayName);

  return (
    <div className="arch-board-card" style={{ padding: '1.75rem', position: 'relative' }}>
      {/* Top Architectural Board Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="arch-tag arch-tag-forest">
            MATERIAL / {displayName.toUpperCase()}
          </span>
          <span className="arch-provenance-tag">
            HYBRID MCDM
          </span>
        </div>

        {/* Standard reference if available */}
        {item.standards_reference && (
          <span style={{ fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: '#7C8681' }}>
            {item.standards_reference}
          </span>
        )}
      </div>

      {/* Tactile Material Swatch Bar */}
      <div
        className={swatchClass}
        style={{
          height: '64px',
          width: '100%',
          borderRadius: '3px',
          marginBottom: '1.25rem',
          border: '1px solid rgba(25, 30, 27, 0.12)',
        }}
      />

      {/* Title & Score Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
        <div>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#181B1A',
            fontFamily: 'Space Grotesk',
            margin: '0 0 0.35rem',
            lineHeight: 1.25,
            textTransform: 'uppercase',
          }}>
            {item.name}
          </h3>

          {item.suitability_badge && (
            <span style={{
              display: 'inline-block',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: '#1A382B',
              background: 'rgba(26, 56, 43, 0.08)',
              border: '1px solid rgba(26, 56, 43, 0.20)',
              padding: '2px 8px',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'Space Grotesk',
            }}>
              {item.suitability_badge}
            </span>
          )}

          {isVetoed && <div style={{ marginTop: '6px' }}><VetoBadge /></div>}
        </div>

        {/* Big Architectural Score */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: '1.85rem',
            fontWeight: 900,
            color: scoreColor(hybridScore),
            fontFamily: 'Space Grotesk',
            lineHeight: 1,
          }}>
            {hybridScore != null ? parseFloat(hybridScore).toFixed(1) : '—'}
          </div>
          <div style={{
            fontSize: '0.58rem',
            fontWeight: 700,
            color: '#7C8681',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'Space Grotesk',
            marginTop: '3px',
          }}>
            OVERALL SCORE
          </div>
        </div>
      </div>

      {/* Core Technical Metric Bars */}
      <div style={{
        background: '#FBF9F5',
        border: '1px solid rgba(25, 30, 27, 0.08)',
        borderRadius: '3px',
        padding: '1rem',
        marginBottom: '1.25rem',
      }}>
        <ScoreBar label="Engineering Validation" value={engScore} />
        <ScoreBar label="Machine Learning Confidence" value={mlScore} />
        <ScoreBar label="Sustainability Index" value={item.sustainability_rating} />
      </div>

      {/* Physical Properties Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(25, 30, 27, 0.10)', padding: '0.55rem 0.75rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.58rem', fontFamily: 'Space Grotesk', color: '#7C8681', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SERVICE LIFE</div>
          <div style={{ fontSize: '0.82rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#181B1A', marginTop: '2px' }}>
            {item.service_life != null ? `${item.service_life} Years` : '50+ Years'}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(25, 30, 27, 0.10)', padding: '0.55rem 0.75rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.58rem', fontFamily: 'Space Grotesk', color: '#7C8681', textTransform: 'uppercase', letterSpacing: '0.08em' }}>EMBODIED CARBON</div>
          <div style={{ fontSize: '0.82rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#1A382B', marginTop: '2px' }}>
            {item.embodied_carbon != null ? `${item.embodied_carbon.toFixed(2)} kgCO₂/kg` : 'Low Footprint'}
          </div>
        </div>
      </div>

      {/* Detailed Criterion Breakdown (Collapsible) */}
      {(() => {
        const metadata = item.engineering_metadata || {};
        const breakdown = metadata.criterion_breakdown || {};
        if (breakdown && Object.keys(breakdown).length > 0) {
          return (
            <details style={{
              marginBottom: '1.25rem',
              border: '1px solid rgba(25, 30, 27, 0.12)',
              borderRadius: '3px',
              background: '#FFFFFF',
              overflow: 'hidden',
            }}>
              <summary style={{
                padding: '0.6rem 0.85rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#1A382B',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#FBF9F5',
              }}>
                ▶ View SLS Engineering Weight Breakdown
              </summary>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px solid rgba(25, 30, 27, 0.10)' }}>
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
                  const normalizedWeight = crit.normalized_weight || (weight / 100);
                  const maxContrib = (normalizedWeight * 100).toFixed(1);
                  const actualContrib = (val * normalizedWeight).toFixed(1);
                  const color = isNa ? '#7C8681' : scoreColor(val);

                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'Space Grotesk', marginBottom: '2px' }}>
                        <span style={{ color: '#555E59' }}>{label}</span>
                        <span style={{ color, fontWeight: 700 }}>
                          {isNa ? 'N/A' : `${val.toFixed(0)}/100 (${actualContrib}/${maxContrib} pts)`}
                        </span>
                      </div>
                      {!isNa && (
                        <div style={{ height: '3px', background: 'rgba(25, 30, 27, 0.08)', borderRadius: '1.5px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${val}%`, background: color }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          );
        }
        return null;
      })()}

      {/* Structured XAI Justification */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Engineering Rationale */}
        {item.rationale && (
          <div style={{
            background: '#FBF9F5',
            border: '1px solid rgba(25, 30, 27, 0.12)',
            borderRadius: '3px',
            padding: '0.85rem',
          }}>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#1A382B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
              fontFamily: 'Space Grotesk',
            }}>
              WHY THIS MATERIAL? (DECISION BASIS)
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#555E59', lineHeight: 1.55 }}>
              {item.rationale}
            </p>
          </div>
        )}

        {/* Performance Benefits */}
        {item.why_this_material && item.why_this_material.length > 0 && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(26, 56, 43, 0.20)',
            borderRadius: '3px',
            padding: '0.85rem',
          }}>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#1A382B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
              fontFamily: 'Space Grotesk',
            }}>
              PERFORMANCE ADVANTAGES
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#555E59', lineHeight: 1.5 }}>
              {item.why_this_material.map((bullet, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>{bullet.replace(/^✓\s*/, '')}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Engineering Trade-offs */}
        {item.trade_offs && item.trade_offs.length > 0 && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(184, 88, 59, 0.20)',
            borderRadius: '3px',
            padding: '0.85rem',
          }}>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#B8583B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
              fontFamily: 'Space Grotesk',
            }}>
              ENGINEERING TRADE-OFFS &amp; MITIGATION
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.76rem', color: '#555E59', lineHeight: 1.5 }}>
              {item.trade_offs.map((bullet, idx) => {
                const cleaned = bullet.replace(/^(↳|•|✗|✓)\s*/, '');
                return <li key={idx} style={{ marginBottom: '2px' }}>{cleaned}</li>;
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Top Candidates Table */}
      <AlternativesTable candidates={candidates} />
    </div>
  );
}
