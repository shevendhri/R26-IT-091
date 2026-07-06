import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function ValidationSummary({ validation }) {
  if (!validation) return null;
  const { validation_score, severity, warnings = [], recommendations = [] } = validation;

  const severityColor = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  }[severity] || '#fff';

  return (
    <GlassCard className="glass-card">
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Engineering Validation</h2>
      <p style={{ margin: 0 }}><strong>Score:</strong> {validation_score}</p>
      <p style={{ margin: 0 }}>
        <strong>Severity:</strong>{' '}
        <span style={{ background: severityColor, color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{severity}</span>
      </p>
      {warnings.length > 0 && (
        <div>
          <h3 style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>Warnings</h3>
          <ul>
            {warnings.map((w, i) => (<li key={i}>{w}</li>))}
          </ul>
        </div>
      )}
      {recommendations.length > 0 && (
        <div>
          <h3 style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>Recommendations</h3>
          <ul>
            {recommendations.map((r, i) => (<li key={i}>{r}</li>))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
