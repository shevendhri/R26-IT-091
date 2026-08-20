"use client";
import React, { useState, useEffect } from 'react';

/**
 * FeatureImportancePanel – XAI ML feature contribution weights with precise horizontal meters.
 */
export default function FeatureImportancePanel({ features }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!features || features.length === 0) return null;

  const max = features[0]?.importance || 1;

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
          Explainable AI — Feature Contribution
        </div>
        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontFamily: 'Space Grotesk', margin: 0, fontWeight: 600 }}>
          ML Model Feature Importance
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', lineHeight: 1.4, margin: 0 }}>
          Global Random Forest feature weights — read-only parameters derived from the trained model.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {features.map((f, i) => {
          const pct = Math.round((f.importance / max) * 100);
          const barColor = i === 0 ? '#10b981' : i === 1 ? '#38bdf8' : '#64748b';
          return (
            <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '170px', fontSize: '0.72rem', fontWeight: 600, color: '#cbd5e1', flexShrink: 0, textTransform: 'capitalize' }}>
                {f.feature.replace(/_/g, ' ')}
              </div>
              <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ width: '48px', fontSize: '0.78rem', fontWeight: 700, color: barColor, textAlign: 'right', fontFamily: 'Space Grotesk', flexShrink: 0 }}>
                {(f.importance * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
