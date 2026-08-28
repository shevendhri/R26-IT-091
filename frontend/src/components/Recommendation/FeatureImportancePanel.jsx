"use client";
import React, { useState, useEffect } from 'react';

/**
 * FeatureImportancePanel – XAI ML feature contribution weights with precise horizontal meters.
 * Updated for high-contrast warm sustainable architecture theme.
 */
export default function FeatureImportancePanel({ features }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!features || features.length === 0) return null;

  const max = features[0]?.importance || 1;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #C8D3CA',
      borderRadius: '16px',
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.04)'
    }}>
      <div style={{ borderBottom: '1px solid #C8D3CA', paddingBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem', fontFamily: 'Space Grotesk' }}>
          Explainable AI — Feature Contribution
        </div>
        <h3 style={{ fontSize: '1.2rem', color: '#18251F', fontFamily: 'Space Grotesk', margin: 0, fontWeight: 800 }}>
          ML Model Feature Importance
        </h3>
        <p style={{ color: '#526158', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
          Global Random Forest feature weights — read-only parameters derived from the trained model.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {features.map((f, i) => {
          const pct = Math.round((f.importance / max) * 100);
          const barColor = i === 0 ? '#245C43' : i === 1 ? '#3E6F8E' : '#526158';
          return (
            <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '180px', fontSize: '0.8rem', fontWeight: 700, color: '#18251F', flexShrink: 0, textTransform: 'capitalize' }}>
                {f.feature.replace(/_/g, ' ')}
              </div>
              <div style={{ flex: 1, height: '6px', background: '#E3E9E2', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ width: '52px', fontSize: '0.85rem', fontWeight: 800, color: barColor, textAlign: 'right', fontFamily: 'Space Grotesk', flexShrink: 0 }}>
                {(f.importance * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
