import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * AlternativesComparison – placeholder for alternative material comparison.
 * Replace with detailed accordion or table as design evolves.
 */
export default function AlternativesComparison({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const alternatives = data?.alternatives ?? [];

  return (
    <GlassCard className="glass-card">
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Alternative Materials</h2>
      {alternatives.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>No alternatives provided.</p>
      ) : (
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-primary)' }}>
          {alternatives.map((alt, i) => (
            <li key={i}>{alt.name} – Score: {alt.score?.toFixed(1) ?? 'N/A'}</li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
