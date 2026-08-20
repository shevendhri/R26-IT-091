"use client";
import React, { useState } from 'react';
import { getTopCandidates } from '@/lib/reportHelpers';

/**
 * AlternativesTable – Candidate material matrix with rank #1 spotlighting and expandable criteria.
 */
export default function AlternativesTable({ data }) {
  const candidates = data?.top3_candidates || getTopCandidates(data);
  const categories = Object.keys(candidates);

  const [expanded, setExpanded] = useState(() => 
    Object.fromEntries(categories.map((cat, i) => [cat, i === 0]))
  );

  const [expandedRow, setExpandedRow] = useState(null);

  const toggleExpand = (cat) => {
    setExpanded(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const getClimateMatch = (c) => {
    const score = c.engineering_breakdown?.climate_compatibility?.score;
    if (score == null) return '—';
    if (score >= 90) return 'Optimal';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Moderate';
    return 'Limited';
  };

  const getClimateColor = (label) => {
    if (label === 'Optimal') return '#10b981';
    if (label === 'Good') return '#38bdf8';
    if (label === 'Moderate') return '#f59e0b';
    if (label === 'Limited') return '#ef4444';
    return '#64748b';
  };

  if (categories.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontFamily: 'Space Grotesk', margin: '0 0 0.2rem 0', fontWeight: 600 }}>
          Candidate Material Evaluation Matrix
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
          Full candidate matrix ranked by Hybrid Score. Select any row to inspect individual engineering criteria scores.
        </p>
      </div>

      {categories.map((cat) => {
        const isExpanded = expanded[cat];
        const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
        return (
          <div key={cat} style={{ 
            border: '1px solid #1e293b',
            borderRadius: '6px',
            background: '#0f172a',
            overflow: 'hidden',
          }}>
            <div
              onClick={() => toggleExpand(cat)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                background: '#0b0f19',
                borderBottom: isExpanded ? '1px solid #1e293b' : 'none',
              }}
            >
              <strong style={{ 
                color: '#f8fafc', 
                fontSize: '0.82rem', 
                fontFamily: 'Space Grotesk',
                fontWeight: 600
              }}>
                {displayName} Category Options
              </strong>
              <span style={{ 
                color: '#64748b', 
                fontSize: '0.68rem',
                fontWeight: 600
              }}>
                {isExpanded ? 'Collapse ▲' : 'Expand ▶'}
              </span>
            </div>
            {isExpanded && (
              <div style={{ padding: '0.5rem', background: '#090d16' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b' }}>
                        {['Rank', 'Material Specification', 'Hybrid Score', 'Eng. Val', 'ML Conf', 'Eco', 'Carbon', 'Service Life', 'Climate Match'].map((h, i) => (
                          <th key={i} style={{
                            textAlign: 'left',
                            padding: '6px 8px',
                            color: '#64748b',
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
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
                        const climMatch = getClimateMatch(c);
                        const isTop = i === 0;

                        return (
                          <React.Fragment key={i}>
                            <tr 
                              onClick={() => setExpandedRow(prev => prev === `${cat}_${i}` ? null : `${cat}_${i}`)}
                              style={{
                                borderBottom: '1px solid #1e293b',
                                background: isTop ? 'rgba(16, 185, 129, 0.04)' : isRowExpanded ? '#0f172a' : 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              <td style={{ padding: '6px 8px', fontWeight: 700, color: isTop ? '#10b981' : '#64748b', fontFamily: 'Space Grotesk' }}>
                                {isTop ? 'Rank #1' : `#${c.rank || (i + 1)}`}
                              </td>
                              <td style={{ padding: '6px 8px', color: isTop ? '#ffffff' : '#cbd5e1', fontWeight: isTop ? 600 : 400 }}>
                                {c.material} {isRowExpanded ? '▼' : '▶'}
                              </td>
                              <td style={{ padding: '6px 8px', color: isTop ? '#10b981' : '#f8fafc', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                                {typeof c.hybrid_score === 'number' ? c.hybrid_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '6px 8px', color: '#38bdf8', fontWeight: 500 }}>
                                {typeof c.engineering_score === 'number' ? c.engineering_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '6px 8px', color: '#cbd5e1', fontWeight: 500 }}>
                                {typeof c.ml_score === 'number' ? c.ml_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: (c.sustainability_rating >= 70) ? '#10b981' : (c.sustainability_rating >= 50) ? '#f59e0b' : '#64748b',
                                  fontFamily: 'Space Grotesk'
                                }}>
                                  {c.sustainability_rating != null ? `${c.sustainability_rating}/100` : '—'}
                                </span>
                              </td>
                              <td style={{ padding: '6px 8px', color: '#94a3b8' }}>
                                {c.embodied_carbon != null ? `${c.embodied_carbon.toFixed(2)} kg` : '—'}
                              </td>
                              <td style={{ padding: '6px 8px', color: '#94a3b8' }}>
                                {c.service_life ? `${c.service_life} yrs` : '—'}
                              </td>
                              <td style={{ padding: '6px 8px', color: getClimateColor(climMatch), fontWeight: 600 }}>
                                {climMatch}
                              </td>
                            </tr>
                            {isRowExpanded && (
                              <tr style={{ background: '#0f172a' }}>
                                <td colSpan={9} style={{ padding: '0.75rem', borderBottom: '1px solid #1e293b' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                      Engineering Evaluation Criteria Breakdown
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem' }}>
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
                                        
                                        const color = isNa ? '#64748b' : score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

                                        return (
                                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', background: '#090d16', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                                            <span style={{ color: '#94a3b8' }}>{label}</span>
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
    </div>
  );
}
