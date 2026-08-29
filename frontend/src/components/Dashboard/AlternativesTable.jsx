"use client";
import React, { useState } from 'react';
import { getTopCandidates } from '@/lib/reportHelpers';

/**
 * AlternativesTable – Candidate material matrix with rank #1 spotlighting and expandable criteria.
 * Updated for high-contrast warm sustainable architecture theme.
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
    if (label === 'Optimal') return '#245C43';
    if (label === 'Good') return '#3E6F8E';
    if (label === 'Moderate') return '#C77A3D';
    if (label === 'Limited') return '#B94A48';
    return '#526158';
  };

  if (categories.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#18251F', fontFamily: 'Space Grotesk', margin: '0 0 0.25rem 0', fontWeight: 800 }}>
          Candidate Material Evaluation Matrix
        </h3>
        <p style={{ color: '#526158', fontSize: '0.85rem', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
          Full candidate matrix ranked by Hybrid Score. Select any row to inspect individual engineering criteria scores.
        </p>
      </div>

      {categories.map((cat) => {
        const isExpanded = expanded[cat];
        const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
        return (
          <div key={cat} style={{ 
            border: '1px solid #C8D3CA',
            borderRadius: '12px',
            background: '#FFFFFF',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(24, 37, 31, 0.04)'
          }}>
            <div
              onClick={() => toggleExpand(cat)}
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: '#F7F9F6',
                borderBottom: isExpanded ? '1px solid #C8D3CA' : 'none',
              }}
            >
              <strong style={{ 
                color: '#18251F', 
                fontSize: '0.9rem', 
                fontFamily: 'Space Grotesk',
                fontWeight: 800
              }}>
                {displayName} Category Options
              </strong>
              <span style={{ 
                color: '#526158', 
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {isExpanded ? 'Collapse ▲' : 'Expand ▶'}
              </span>
            </div>
            {isExpanded && (
              <div style={{ padding: '0.75rem', background: '#FFFFFF' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #C8D3CA' }}>
                        {['Rank', 'Material Specification', 'Hybrid Score', 'Eng. Val', 'ML Conf', 'Eco', 'Carbon', 'Service Life', 'Climate Match'].map((h, i) => (
                          <th key={i} style={{
                            textAlign: 'left',
                            padding: '8px 10px',
                            color: '#526158',
                            fontWeight: 800,
                            fontSize: '0.68rem',
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
                                borderBottom: '1px solid #C8D3CA',
                                background: isTop ? '#DDE8DE' : isRowExpanded ? '#F7F9F6' : '#FFFFFF',
                                cursor: 'pointer',
                              }}
                            >
                              <td style={{ padding: '8px 10px', fontWeight: 800, color: isTop ? '#245C43' : '#526158', fontFamily: 'Space Grotesk' }}>
                                {isTop ? 'Rank #1' : `#${c.rank || (i + 1)}`}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#18251F', fontWeight: isTop ? 700 : 600 }}>
                                {c.material} {isRowExpanded ? '▼' : '▶'}
                              </td>
                              <td style={{ padding: '8px 10px', color: isTop ? '#245C43' : '#18251F', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                                {typeof c.hybrid_score === 'number' ? c.hybrid_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#3E6F8E', fontWeight: 700 }}>
                                {typeof c.engineering_score === 'number' ? c.engineering_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#18251F', fontWeight: 600 }}>
                                {typeof c.ml_score === 'number' ? c.ml_score.toFixed(1) : '—'}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: (c.sustainability_rating >= 70) ? '#245C43' : (c.sustainability_rating >= 50) ? '#C77A3D' : '#526158',
                                }}>
                                  {c.sustainability_rating != null ? `${c.sustainability_rating}/100` : '—'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', color: '#526158', fontWeight: 500 }}>
                                {c.embodied_carbon != null ? `${c.embodied_carbon}` : '—'}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#526158', fontWeight: 500 }}>
                                {c.service_life ? `${c.service_life}y` : '—'}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: getClimateColor(climMatch),
                                  background: '#FFFFFF',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #C8D3CA'
                                }}>
                                  {climMatch}
                                </span>
                              </td>
                            </tr>

                            {/* Collapsible Row Details */}
                            {isRowExpanded && (
                              <tr style={{ background: '#F7F9F6' }}>
                                <td colSpan={9} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #C8D3CA' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      Engineering Criteria Scores ({c.material})
                                    </div>
                                    {c.engineering_breakdown ? (
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                                        {Object.entries(c.engineering_breakdown).map(([k, v]) => (
                                          <div key={k} style={{ background: '#FFFFFF', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #C8D3CA' }}>
                                            <div style={{ fontSize: '0.68rem', color: '#526158', textTransform: 'capitalize', fontWeight: 600 }}>{k.replace(/_/g, ' ')}</div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#18251F' }}>
                                              {typeof v?.score === 'number' ? v.score.toFixed(1) : typeof v === 'number' ? v.toFixed(1) : 'N/A'}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '0.75rem', color: '#526158' }}>No detailed criterion breakdown available.</div>
                                    )}
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
