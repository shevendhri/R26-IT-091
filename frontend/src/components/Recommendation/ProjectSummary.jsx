"use client";
import React from 'react';
import { useMaterial } from '@/context/MaterialContext';

// Utility to render a badge with consistent styling
const Badge = ({ label, value }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
  }}>
    <span style={{ fontWeight: 700 }}>{label}:</span> {value}
  </div>
);

export default function ProjectSummary() {
  const { projectPreferences } = useMaterial();

  if (!projectPreferences) return null;

  const {
    building_usage,
    primary_goal,
    architectural_style,
    material_preferences,
    thermal_comfort_priority,
    energy_priority,
    acoustic_priority,
    fire_resistance_priority,
    local_material_preference,
    certification_goal,
    design_lifespan,
    maintenance_tolerance,
    aesthetic_importance,
  } = projectPreferences;

  // Helper to join array values
  const matPref = (Array.isArray(material_preferences) && material_preferences.length)
    ? material_preferences.join(', ')
    : material_preferences || 'None';

  return (
    <section className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--eco-glow)', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>
        Project Requirements Summary
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        <Badge label="Usage" value={building_usage} />
        <Badge label="Goal" value={primary_goal} />
        <Badge label="Style" value={architectural_style} />
        <Badge label="Materials" value={matPref} />
        <Badge label="Thermal" value={thermal_comfort_priority} />
        <Badge label="Energy" value={energy_priority} />
        <Badge label="Acoustic" value={acoustic_priority} />
        <Badge label="Fire" value={fire_resistance_priority} />
        <Badge label="Local Mat" value={local_material_preference} />
        <Badge label="Cert" value={certification_goal} />
        <Badge label="Lifespan" value={design_lifespan} />
        <Badge label="Maintenance" value={maintenance_tolerance} />
        <Badge label="Aesthetic" value={aesthetic_importance} />
      </div>
    </section>
  );
}
