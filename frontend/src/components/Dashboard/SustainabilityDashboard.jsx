'use client';
import React, { useState, useEffect } from 'react';

/**
 * SustainabilityDashboard – Compact professional environmental metrics panel.
 * Updated for high-contrast warm sustainable architecture theme.
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

  const carbonColor = carbonImpact === 'Low' ? '#245C43' : carbonImpact === 'Average' ? '#C77A3D' : carbonImpact === 'High' ? '#B94A48' : '#526158';
  const sustainabilityRating = averageSustainability != null ? `${Math.round(averageSustainability)}%` : 'N/A';
  const serviceLife = averageServiceLife != null ? `${Math.round(averageServiceLife)} Years` : 'N/A';

  const kpis = [
    { label: 'Carbon Impact', value: carbonImpact, color: carbonColor, desc: 'Net greenhouse gas index' },
    { label: 'Avg Eco Rating', value: sustainabilityRating, color: '#245C43', desc: 'Material circularity rating' },
    { label: 'Avg Service Life', value: serviceLife, color: '#18251F', desc: 'Structural lifespan estimate' },
    { label: 'Climate Resilience', value: climateResilienceLabel, color: '#3E6F8E', desc: 'Extreme exposure resistance' },
    { label: 'Moisture Resistance', value: moistureResistanceLabel, color: '#3E6F8E', desc: 'SLS humidity gating compliance' },
    { label: 'Maintenance Profile', value: maintenanceLabel, color: '#526158', desc: 'Operational upkeep factor' },
  ];

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
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18251F', margin: 0, fontFamily: 'Space Grotesk' }}>
          Environmental & Sustainability Metrics
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#526158', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
          Aggregate sustainability indicators derived from the recommended material package evaluation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            background: '#F7F9F6',
            border: '1px solid #C8D3CA',
            borderRadius: '12px',
            padding: '0.85rem',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: kpi.color, fontFamily: 'Space Grotesk' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#748078', marginTop: '0.2rem', fontWeight: 500 }}>
              {kpi.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
