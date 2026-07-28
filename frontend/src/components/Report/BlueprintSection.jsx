import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * BlueprintSection – shows a summary of the generated blueprint and a button
 * to view the full 3D model. This placeholder can be replaced with a proper
 * viewer component later.
 */
export default function BlueprintSection({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const blueprint = data?.blueprint;
  if (!blueprint) {
    return (
      <GlassCard className="glass-card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Blueprint</h2>
        <p style={{ color: 'var(--text-dim)' }}>No blueprint data available.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="glass-card">
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Blueprint Overview</h2>
      <p style={{ color: 'var(--text-primary)' }}><strong>Building Type:</strong> {blueprint.building_type || 'N/A'}</p>
      <p style={{ color: 'var(--text-primary)' }}><strong>Total Area:</strong> {blueprint.total_area ? `${blueprint.total_area} m²` : 'N/A'}</p>
      <p style={{ color: 'var(--text-primary)' }}><strong>Floors:</strong> {blueprint.num_floors ?? 'N/A'}</p>
      <button
        className="btn-premium"
        style={{ marginTop: '1rem' }}
        onClick={() => { window.location.href = '/visualization'; }}
      >
        View 3D Blueprint
      </button>
    </GlassCard>
  );
}
