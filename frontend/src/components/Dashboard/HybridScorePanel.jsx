"use client";
import React from 'react';

/**
 * HybridScorePanel – Transparent breakdown of the Hybrid Recommendation Score.
 */
export default function HybridScorePanel({ data }) {
  const metrics = data?.metrics || {};
  const breakdown = data?.score_breakdown || {};

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

  const confColor = confidenceLevel === 'High' ? '#10b981'
    : confidenceLevel === 'Medium' ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
          Explainable AI Methodology
        </div>
        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontFamily: 'Space Grotesk', margin: 0, fontWeight: 600 }}>
          Hybrid Score Aggregation
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', lineHeight: 1.4, margin: 0 }}>
          Weighted aggregation combining 75% SLS Structural Rules + 25% Machine Learning Model Predictions.
        </p>
      </div>

      {/* Score Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Overall Score', val: overallScore, color: '#10b981' },
          { label: 'Engineering Rules', val: engScore, color: '#38bdf8' },
          { label: 'ML Confidence', val: mlScore, color: '#f8fafc' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: kpi.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
              {kpi.val}
            </div>
          </div>
        ))}
      </div>

      {/* Contribution Weights */}
      <div style={{
        background: '#090d16',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '0.85rem'
      }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Contribution Weights
        </div>

        {[
          { label: 'Deterministic SLS Rule Engine Weight', weight: engWeight, color: '#38bdf8' },
          { label: 'Calibrated ML Model Weight', weight: mlWeight, color: '#10b981' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.35rem 0',
            borderBottom: i < 1 ? '1px solid #1e293b' : 'none'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{row.label}</span>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: row.color,
              fontFamily: 'Space Grotesk'
            }}>
              {row.weight}
            </span>
          </div>
        ))}

        {formula && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.68rem',
            color: '#94a3b8',
            fontFamily: 'monospace',
            background: '#080c14',
            padding: '0.4rem 0.6rem',
            borderRadius: '4px',
            border: '1px solid #1e293b'
          }}>
            {formula}
          </div>
        )}
      </div>

      {/* Confidence Level */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#090d16',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '0.75rem 1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Decision Confidence Rating
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: confColor, fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {confidenceLevel}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>CONFIDENCE SCORE</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: confColor, fontFamily: 'Space Grotesk' }}>
            {typeof confidenceScore === 'number' ? confidenceScore.toFixed(1) : confidenceScore}%
          </div>
        </div>
      </div>
    </div>
  );
}
