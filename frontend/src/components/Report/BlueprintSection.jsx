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
      <div style={{ marginTop: '1.2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className="btn-primary"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFFFFF', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' }}
          onClick={() => { window.location.href = '/visualization'; }}
        >
          🏠 Launch 3D Studio (Cutaway · Architectural · Engineering BIM)
        </button>
        <button
          className="btn-secondary"
          style={{ padding: '0.65rem 1.1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => { window.location.href = '/materials/3d'; }}
        >
          Procedural 3D
        </button>
      </div>
    </GlassCard>
  );
}
