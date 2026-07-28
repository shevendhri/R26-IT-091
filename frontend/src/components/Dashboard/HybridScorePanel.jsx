"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * HybridScorePanel – Transparent breakdown of the Hybrid Recommendation Score.
 *
 * Data Traceability:
 *   Overall Hybrid Score     → data.metrics.overall_hybrid_score
 *   Engineering Score        → data.metrics.project_eng_score
 *   ML Confidence            → data.metrics.project_ml_score
 *   Score Breakdown          → data.score_breakdown
 *   ML Diagnostics           → data.ml_diagnostics
 */
export default function HybridScorePanel({ data }) {
  const metrics = data?.metrics || {};
  const breakdown = data?.score_breakdown || {};
  const ml = data?.ml_diagnostics || {};

  const overallScore = typeof metrics.overall_hybrid_score === 'number' ? metrics.overall_hybrid_score.toFixed(1) : 'N/A';
  const engScore = typeof metrics.project_eng_score === 'number' ? metrics.project_eng_score.toFixed(1) : 'N/A';
  const mlScore = metrics.project_ml_score !== 'N/A' && metrics.project_ml_score != null
    ? parseFloat(metrics.project_ml_score).toFixed(1)
    : 'N/A';

  const engWeight = breakdown.engineering_rules_weight || '75%';
  const mlWeight = breakdown.ml_prediction_weight || '25%';
  const formula = breakdown.formula || '';

  const confidence = data?.confidence || {};
  const confidenceScore = confidence.confidence_score || 0;
  const confidenceLevel = confidence.confidence_level || 'Medium';

  const confColor = confidenceLevel === 'High' ? '#00ff9d'
    : confidenceLevel === 'Medium' ? '#fbbf24'
    : '#f87171';

  const getBar = (val) => {
    const n = parseFloat(val) || 0;
    const color = n >= 70 ? '#00ff9d' : n >= 50 ? '#fbbf24' : '#f87171';
    return { pct: Math.min(100, Math.max(0, n)), color };
  };

  return (
    <GlassCard className="dashboard-section" style={{ position: 'relative' }}>
      {/* Accent corner */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '80px', height: '80px',
        background: 'radial-gradient(circle at 0% 0%, rgba(0, 255, 157, 0.12), transparent 70%)',
        pointerEvents: 'none'
      }}/>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Explainable AI — Score Transparency
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'Space Grotesk', margin: 0 }}>
          Hybrid Recommendation Score
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          The overall score is derived from a strict weighted combination of Engineering Rules and Machine Learning Confidence.
        </p>
      </div>

      {/* Three KPI Score Circles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Overall Recommendation', val: overallScore, sub: '/100', color: '#00ff9d', glow: 'rgba(0,255,157,0.15)' },
          { label: 'Engineering Validation', val: engScore, sub: '/100', color: '#0ea5e9', glow: 'rgba(14,165,233,0.15)' },
          { label: 'ML Prediction Confidence', val: mlScore, sub: '/100', color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: `radial-gradient(circle at 50% 0%, ${kpi.glow}, transparent 70%), rgba(255,255,255,0.02)`,
            border: `1px solid ${kpi.color}30`,
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              {kpi.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: kpi.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {kpi.val}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>{kpi.sub}</span>
            </div>
            {/* Mini score bar */}
            {(() => { const b = getBar(kpi.val); return (
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: '2px', transition: 'width 1s ease' }}/>
              </div>
            ); })()}
          </div>
        ))}
      </div>

      {/* Score Breakdown Table */}
      <div style={{
        background: 'rgba(0, 255, 157, 0.03)',
        border: '1px solid rgba(0, 255, 157, 0.1)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', marginBottom: '0.75rem' }}>
          SCORE CALCULATION BREAKDOWN
        </div>

        {[
          { label: 'Engineering Contribution', weight: engWeight, color: '#0ea5e9', type: 'weight' },
          { label: 'ML Contribution', weight: mlWeight, color: '#a78bfa', type: 'weight' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.label}</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 900,
              color: row.color,
              fontFamily: 'Space Grotesk',
              background: `${row.color}15`,
              padding: '3px 10px',
              borderRadius: '6px',
              border: `1px solid ${row.color}30`
            }}>
              {row.weight}
            </span>
          </div>
        ))}

        {formula && (
          <div style={{
            marginTop: '0.75rem',
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.2)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            lineHeight: 1.6
          }}>
            {formula}
          </div>
        )}
      </div>

      {/* ML Model Metrics removed for user-facing simplicity */}

      {/* Decision Confidence Level */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: `${confColor}0d`,
        border: `1px solid ${confColor}30`,
        borderRadius: '10px',
        padding: '0.75rem 1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Decision Confidence Level
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: confColor, fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {confidenceLevel}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px' }}>CONFIDENCE SCORE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: confColor, fontFamily: 'Space Grotesk' }}>
            {typeof confidenceScore === 'number' ? confidenceScore.toFixed(1) : confidenceScore}%
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
