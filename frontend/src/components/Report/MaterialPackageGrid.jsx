import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import ValidationSummary from '@/components/Report/ValidationSummary';

/**
 * MaterialPackageGrid – displays the recommended material cards in a responsive grid.
 * Uses the reportData.recommendations array (if present) to render each material.
 */
export default function MaterialPackageGrid({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const materials = data?.recommendations?.materials ?? [];

  return (
    <GlassCard className="glass-card">
      <ValidationSummary validation={data?.validation} />
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Recommended Material Package</h2>
      {materials.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>No material recommendations available.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {materials.map((m, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{m.name}</h3>
              <p style={{ margin: '0.5rem 0', color: 'var(--text-dim)' }}>{m.description}</p>
              <p style={{ color: 'var(--text-primary)' }}>Score: {m.score?.toFixed(1) ?? 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
