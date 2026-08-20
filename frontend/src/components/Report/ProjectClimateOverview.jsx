import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * Project & Climate Overview – displays high‑level project metadata and climate
 * information in a premium glass‑card layout.
 */
export default function ProjectClimateOverview({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const projectName = data?.project?.name ?? 'Untitled Project';
  const buildingType = data?.blueprint?.building_type ?? 'N/A';
  const location = data?.climate_profile?.city ?? 'N/A';
  const climateZone = data?.climate_profile?.type ?? 'N/A';
  const totalArea = data?.blueprint?.total_area ?? 'N/A';
  const floors = data?.blueprint?.num_floors ?? 'N/A';

  return (
    <GlassCard className="glass-card">
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Project & Climate Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div><strong>Project:</strong> {projectName}</div>
        <div><strong>Building Type:</strong> {buildingType}</div>
        <div><strong>Location:</strong> {location}</div>
        <div><strong>Climate Zone:</strong> {climateZone}</div>
        <div><strong>Total Area:</strong> {totalArea} m²</div>
        <div><strong>Floors:</strong> {floors}</div>
      </div>
    </GlassCard>
  );
}
