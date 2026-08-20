'use client';
import React, { useState, useEffect } from 'react';

/**
 * SustainabilityDashboard – Compact professional environmental metrics panel.
 */
export default function SustainabilityDashboard({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !data) return null;

  const averageSustainability = data?.metrics?.average_sustainability ?? null;
  const averageServiceLife = data?.metrics?.average_service_life ?? null;
  const averageCarbon = data?.metrics?.average_carbon ?? null;
  
  const envLabels = data?.metrics?.environmental_labels || {};
  const moistureResistanceLabel = envLabels.moisture_resistance || 'Verified';
  const climateResilienceLabel = envLabels.climate_resilience || 'Verified';
  const maintenanceLabel = envLabels.maintenance_requirement || 'Standard';
  const carbonImpact = envLabels.carbon_impact || (averageCarbon != null ? (averageCarbon < 0.3 ? 'Low' : averageCarbon < 0.6 ? 'Average' : 'High') : 'N/A');

  const carbonColor = carbonImpact === 'Low' ? '#10b981' : carbonImpact === 'Average' ? '#f59e0b' : carbonImpact === 'High' ? '#ef4444' : '#64748b';
  const sustainabilityRating = averageSustainability != null ? `${Math.round(averageSustainability)}%` : 'N/A';
  const serviceLife = averageServiceLife != null ? `${Math.round(averageServiceLife)} Years` : 'N/A';

  const kpis = [
    { label: 'Carbon Impact', value: carbonImpact, color: carbonColor, desc: 'Net greenhouse gas index' },
    { label: 'Avg Eco Rating', value: sustainabilityRating, color: '#10b981', desc: 'Material circularity rating' },
    { label: 'Avg Service Life', value: serviceLife, color: '#f8fafc', desc: 'Structural lifespan estimate' },
    { label: 'Climate Resilience', value: climateResilienceLabel, color: '#38bdf8', desc: 'Extreme exposure resistance' },
    { label: 'Moisture Resistance', value: moistureResistanceLabel, color: '#38bdf8', desc: 'SLS humidity gating compliance' },
    { label: 'Maintenance Profile', value: maintenanceLabel, color: '#94a3b8', desc: 'Operational upkeep factor' },
  ];

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
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk' }}>
          Environmental & Sustainability Metrics
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
          Aggregate sustainability indicators derived from the recommended material package evaluation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem',
          }}>
            <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: kpi.color, fontFamily: 'Space Grotesk' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              {kpi.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
