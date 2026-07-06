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

  const toggleExpand = (cat) => {
    setExpanded(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  if (categories.length === 0) return null;

  return (
    <GlassCard className="dashboard-section alternatives-table" style={{ position: 'relative' }}>
      {/* Visual Accent Corner for spotlight styling */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
        background: 'radial-gradient(circle at 100% 0%, rgba(0, 255, 157, 0.15), transparent 70%)',
        pointerEvents: 'none'
      }}/>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Decision Support Matrix
        </div>
        <h2 style={{ fontSize: '1.6rem', color: '#fff', fontFamily: 'Space Grotesk', margin: 0 }}>
          Alternative Material Evaluations
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
          Comparison grids listing alternate material ranks computed by the Hybrid Decision Engine. Click any section header to expand or collapse. Multiple sections can be open simultaneously.
        </p>
      </div>

      {categories.map((cat) => {
        const isExpanded = expanded[cat];
        const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
        return (
          <div key={cat} className="accordion-panel" style={{ 
            marginBottom: '0.75rem', 
            border: `1px solid ${isExpanded ? 'rgba(0, 255, 157, 0.18)' : 'rgba(255,255,255,0.04)'}`, 
            borderRadius: '12px',
            background: isExpanded ? 'rgba(4, 12, 10, 0.4)' : 'rgba(0,0,0,0.1)',
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
                        {['Rank', 'Material Specification Option', 'Hybrid Aggregate', 'Engineering Suitability', 'Neural ML Probability'].map((h, i) => (
                          <th key={i} style={{
                            textAlign: 'left',
                            padding: '12px 10px',
                            color: 'var(--text-dim)',
                            fontWeight: 800,
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {candidates[cat].map((c, i) => (
                        <tr key={i} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: i === 0 ? 'rgba(0,255,157,0.03)' : 'transparent'
                        }}>
                          <td style={{ padding: '12px 10px', fontWeight: 900, color: i === 0 ? 'var(--eco-glow)' : 'var(--text-dim)', fontFamily: 'Space Grotesk' }}>
                            #{c.rank || (i + 1)}
                          </td>
                          <td style={{ padding: '12px 10px', color: i === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: i === 0 ? 700 : 400 }}>
                            {c.material}
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
                        </tr>
                      ))}
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
