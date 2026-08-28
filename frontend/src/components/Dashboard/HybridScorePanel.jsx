"use client";
import React from 'react';

/**
 * HybridScorePanel – Transparent breakdown of the Hybrid Recommendation Score.
 * Updated for high-contrast warm sustainable architecture theme.
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

  const confColor = confidenceLevel === 'High' ? '#245C43'
    : confidenceLevel === 'Medium' ? '#C77A3D'
    : '#B94A48';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #C8D3CA',
      borderRadius: '16px',
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.04)',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem', fontFamily: 'Space Grotesk' }}>
          Explainable AI Methodology
        </div>
        <h3 style={{ fontSize: '1.2rem', color: '#18251F', fontFamily: 'Space Grotesk', margin: 0, fontWeight: 800 }}>
          Hybrid Score Aggregation
        </h3>
        <p style={{ color: '#526158', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
          Weighted aggregation combining 75% SLS Structural Rules + 25% Machine Learning Model Predictions.
        </p>
      </div>

      {/* Score Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Overall Score', val: overallScore, color: '#245C43' },
          { label: 'Engineering Rules', val: engScore, color: '#3E6F8E' },
          { label: 'ML Confidence', val: mlScore, color: '#18251F' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#F7F9F6',
            border: '1px solid #C8D3CA',
            borderRadius: '10px',
            padding: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: kpi.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
              {kpi.val}
            </div>
          </div>
        ))}
      </div>

      {/* Contribution Weights */}
      <div style={{
        background: '#F7F9F6',
        border: '1px solid #C8D3CA',
        borderRadius: '10px',
        padding: '0.95rem'
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3E6F8E', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Contribution Weights
        </div>

        {[
          { label: 'Deterministic SLS Rule Engine Weight', weight: engWeight, color: '#3E6F8E' },
          { label: 'Calibrated ML Model Weight', weight: mlWeight, color: '#245C43' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '0.45rem 0',
            borderBottom: i < 1 ? '1px solid #C8D3CA' : 'none'
          }}>
            <span style={{ fontSize: '0.78rem', color: '#18251F', fontWeight: 600 }}>{row.label}</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: row.color,
              fontFamily: 'Space Grotesk'
            }}>
              {row.weight}
            </span>
          </div>
        ))}

        {formula && (
          <div style={{
            marginTop: '0.6rem',
            fontSize: '0.72rem',
            color: '#245C43',
            fontFamily: 'monospace',
            background: '#FFFFFF',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #C8D3CA',
            fontWeight: 600
          }}>
            {formula}
          </div>
        )}
      </div>

      {/* Confidence Level */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        background: '#F7F9F6',
        border: '1px solid #C8D3CA',
        borderRadius: '10px',
        padding: '0.85rem 1.1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 800, textTransform: 'uppercase' }}>
            Decision Confidence Rating
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: confColor, fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {confidenceLevel}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 800 }}>CONFIDENCE SCORE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: confColor, fontFamily: 'Space Grotesk' }}>
            {typeof confidenceScore === 'number' ? confidenceScore.toFixed(1) : confidenceScore}%
          </div>
        </div>
      </div>
    </div>
  );
}
