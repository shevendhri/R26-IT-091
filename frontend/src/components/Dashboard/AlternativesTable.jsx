"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { getTopCandidates } from '@/lib/reportHelpers';

/**
 * AlternativesTable – renders comparison table accordion for each category.
 * Enables multiple accordions to be expanded simultaneously ("open them in the same time")
 * and styles it as a high-density, spotlighted technical comparison zone.
 *
 * Data Traceability:
 *   Alternative Materials  → data.top3_candidates
 *   Material Info          → rank, material, hybrid_score, engineering_score, ml_score
 */
export default function AlternativesTable({ data }) {
  const candidates = data?.top3_candidates || getTopCandidates(data);
  const categories = Object.keys(candidates);

  // Initialize expanded state with the first category open, allowing multiple to be open concurrently
  const [expanded, setExpanded] = React.useState(() => 
    Object.fromEntries(categories.map((cat, i) => [cat, i === 0]))
  );

  const [expandedRow, setExpandedRow] = React.useState(null);

  const toggleExpand = (cat) => {
    setExpanded(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const getClimateMatch = (c) => {
    const score = c.engineering_breakdown?.climate_compatibility?.score;
    if (score == null) return '—';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Moderate';
    return 'Limited';
  };

  const getClimateColor = (label) => {
    if (label === 'Excellent') return 'var(--eco-glow)';
    if (label === 'Good') return '#34d399';
    if (label === 'Moderate') return '#fbbf24';
    if (label === 'Limited') return '#ef4444';
    return 'var(--text-dim)';
  };

  if (categories.length === 0) return null;

  return (
    <GlassCard className="dashboard-section alternatives-table" style={{ position: 'relative' }}>
      {/* Visual Accent Corner for spotlight styling */}
      

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Decision Support Matrix
        </div>
        <h2 style={{ fontSize: '1.6rem', color: '#fff', fontFamily: 'Space Grotesk', margin: 0 }}>
          Alternative Material Evaluations
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
          Comparison grids listing alternate material ranks computed by the Hybrid Decision Engine. Click any section header to expand or collapse. Click any candidate material row to toggle its detailed 8-criteria engineering breakdown.
        </p>
      </div>

      {categories.map((cat) => {
        const isExpanded = expanded[cat];
        const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
        return (
          <div key={cat} className="accordion-panel" style={{ 
            marginBottom: '0.75rem', 
            border: `1px solid ${isExpanded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
          borderRadius: '12px',
          background: isExpanded ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)',
            overflow: 'hidden',
            transition: 'border-color 0.2s, background-color 0.2s'
          }}>
            <div
              className="accordion-header"
              onClick={() => toggleExpand(cat)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.15rem 1.5rem',
                cursor: 'pointer',
                background: isExpanded ? 'rgba(0, 255, 157, 0.04)' : 'rgba(255,255,255,0.01)',
                transition: 'background-color 0.2s'
              }}
            >
              <strong style={{ 
                color: isExpanded ? 'var(--eco-glow)' : 'var(--text-primary)', 
                fontSize: '0.85rem', 
                letterSpacing: '0.5px',
                fontFamily: 'Space Grotesk'
              }}>
                {displayName} Alternatives
              </strong>
              <span style={{ 
                color: isExpanded ? 'var(--eco-glow)' : 'var(--text-dim)', 
                fontSize: '0.7rem',
                fontWeight: 900
              }}>
                {isExpanded ? '▲ COLLAPSE' : '▶ EXPAND'}
              </span>
            </div>
            {isExpanded && (
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Rank', 'Material Specification', 'Overall', 'Eng. Val', 'ML Conf', 'Eco', 'Carbon', 'Life', 'Maint.', 'Climate Match'].map((h, i) => (
                          <th key={i} style={{
                            textAlign: 'left',
                            padding: '12px 10px',
                            color: 'var(--text-dim)',
                            fontWeight: 800,
                            fontSize: '0.58rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            whiteSpace: 'nowrap'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {candidates[cat].map((c, i) => {
                        const isRowExpanded = expandedRow === `${cat}_${i}`;
                        const maintLabel = c.maintenance != null 
                          ? (c.maintenance <= 20 ? 'Low' : c.maintenance <= 40 ? 'L-M' : c.maintenance <= 60 ? 'Med' : c.maintenance <= 80 ? 'M-H' : 'High')
                          : '—';

                        const climMatch = getClimateMatch(c);

                        return (
                          <React.Fragment key={i}>
                            <tr 
                               onClick={() => setExpandedRow(prev => prev === `${cat}_${i}` ? null : `${cat}_${i}`)}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                background: i === 0 ? 'rgba(255,255,255,0.08)' : isRowExpanded ? 'rgba(255,255,255,0.04)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <td style={{ padding: '12px 10px', fontWeight: 900, color: i === 0 ? 'var(--eco-glow)' : 'var(--text-dim)', fontFamily: 'Space Grotesk' }}>
                                {i === 0 ? '⭐' : `#${c.rank || (i + 1)}`}
                              </td>
                              <td style={{ padding: '12px 10px', color: i === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: i === 0 ? 700 : 400 }}>
                                {c.material} {isRowExpanded ? '▼' : '▶'}
                              </td>
                              <td style={{ padding: '12px 10px', color: 'var(--eco-glow)', fontWeight: 900, fontFamily: 'Space Grotesk', fontSize: '0.85rem' }}>
                                {typeof c.hybrid_score === 'number' ? c.hybrid_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '12px 10px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                {typeof c.engineering_score === 'number' ? c.engineering_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '12px 10px', color: 'var(--blueprint-blue)', fontWeight: 500 }}>
                                {typeof c.ml_score === 'number' ? c.ml_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '12px 10px' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  color: (c.sustainability_rating >= 70) ? 'var(--eco-glow)' : (c.sustainability_rating >= 50) ? '#fbbf24' : 'var(--text-dim)',
                                  fontFamily: 'Space Grotesk'
                                }}>
                                  {c.sustainability_rating != null ? `${c.sustainability_rating}/100` : '—'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                                {c.embodied_carbon != null ? `${c.embodied_carbon.toFixed(2)} kg` : '—'}
                              </td>
                              <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                                {c.service_life ? `${c.service_life} yrs` : '—'}
                              </td>
                              <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                                {maintLabel}
                              </td>
                              <td style={{ padding: '12px 10px', color: getClimateColor(climMatch), fontWeight: 700 }}>
                                {climMatch}
                              </td>
                            </tr>
                            {isRowExpanded && (
                              <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <td colSpan={10} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                      Engineering Evaluation Criteria Breakdown
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
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
                                        const breakdown = c.engineering_breakdown || {};
                                        const crit = breakdown[key] || {};
                                        const isNa = crit.is_na === true;
                                        const score = crit.score || 0;
                                        const normalizedWeight = crit.normalized_weight || (weight / 100);
                                        const maxContrib = (normalizedWeight * 100).toFixed(1);
                                        const actualContrib = (score * normalizedWeight).toFixed(1);
                                        
                                        const color = isNa ? 'var(--text-dim)' : score >= 70 ? 'var(--eco-glow)' : score >= 50 ? 'var(--warn-amber)' : 'var(--error-red)';

                                        return (
                                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', background: 'rgba(255,255,255,0.02)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                            <span style={{ color: color, fontWeight: 700 }}>
                                              {isNa ? 'N/A' : `${score.toFixed(0)}/100 (${actualContrib}/${maxContrib})`}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </GlassCard>
  );
}
