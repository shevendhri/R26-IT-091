"use client";
import React, { useState, useEffect } from 'react';
import SectionTitle from './SectionTitle';

/**
 * FeatureImportancePanel – renders a progress-bar chart of the ML model's feature weights.
 *
 * Data Traceability:
 *   Feature weights  → features (from reportData.feature_importance)
 */
export default function FeatureImportancePanel({ features }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!features || features.length === 0) return null;
  const max = features[0]?.importance || 1;
  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <SectionTitle sub="Global Random Forest feature weights — read-only parameters from ML model">
        Explainable AI: Feature Importance
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem', marginTop: '1.25rem' }}>
        {features.map((f, i) => {
          const pct = Math.round((f.importance / max) * 100);
          const barColor = i === 0 ? 'var(--eco-glow)' : i === 1 ? 'var(--blueprint-blue)' : 'rgba(255,255,255,0.4)';
          return (
            <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '150px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {f.feature.replace(/_/g, ' ')}
              </div>
              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ width: '50px', fontSize: '0.8rem', fontWeight: 900, color: barColor, textAlign: 'right', fontFamily: 'Space Grotesk' }}>
                {(f.importance * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
