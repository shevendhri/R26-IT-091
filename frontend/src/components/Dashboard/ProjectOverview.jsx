// ProjectOverview.jsx – project & climate details
"use client";
import React, { useState, useEffect } from 'react';
import { useMaterial } from '@/context/MaterialContext';

/**
 * ProjectOverview – Structured overview of project specifications and climate profiles.
 * Separates inputs into Recommendation Drivers and Building Configuration.
 */
export default function ProjectOverview({ data }) {
  const { preferences, buildingInfo, buildingRequirements } = useMaterial() || {};
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !data) return null;

  const buildingType = data?.blueprint?.building_type ?? buildingInfo?.building_type ?? 'N/A';
  const location     = data?.climate_profile?.city          ?? buildingInfo?.location ?? 'N/A';
  const totalArea    = data?.blueprint?.total_area          ?? buildingInfo?.total_area ?? 'N/A';
  const numFloors    = data?.blueprint?.num_floors          ?? buildingInfo?.floor_count ?? 'N/A';
  const climateZone  = data?.climate_profile?.type          ?? 'N/A';
  const humidity     = data?.climate_profile?.humidity      ?? 'N/A';
  const rainfall     = data?.climate_profile?.rainfall      ?? 'N/A';
  const salinity     = data?.climate_profile?.salinity      ?? 'Low';
  const structSys    = data?.blueprint?.structural_system   ?? buildingInfo?.structural_system ?? 'N/A';
  const budgetTier   = preferences?.budget_tier             ?? 'Balanced';
  const susLevel     = preferences?.sustainability_level    ?? 'Medium';

  const bedrooms     = buildingRequirements?.bedrooms       ?? 3;
  const bathrooms    = buildingRequirements?.bathrooms      ?? 2;
  const solarReady   = buildingRequirements?.solar_ready    ? 'Active' : 'Inactive';
  const rainwater    = buildingRequirements?.rainwater_harvesting ? 'Active' : 'Inactive';
  const ventilation  = buildingRequirements?.cross_ventilation ?? 'Medium';
  const elderly      = (buildingRequirements?.elderly_occupants || 0) > 0 ? 'Active' : 'Inactive';

  const recommendationDrivers = [
    { label: 'Building Sector', value: buildingType },
    { label: 'Location', value: location },
    { label: 'Climate Zone', value: climateZone },
    { label: 'Salinity Gating', value: salinity },
    { label: 'Humidity Level', value: humidity },
    { label: 'Annual Rainfall', value: rainfall },
    { label: 'Budget Tier', value: budgetTier },
    { label: 'Eco-Goal Priority', value: susLevel },
    { label: 'Structural System', value: structSys }
  ];

  const buildingConfig = [
    { label: 'Total Floor Area', value: `${totalArea} m²` },
    { label: 'Floor Count', value: `${numFloors} Levels` },
    { label: 'Bedrooms', value: bedrooms },
    { label: 'Bathrooms', value: bathrooms },
    { label: 'Solar Ready', value: solarReady },
    { label: 'Rainwater System', value: rainwater },
    { label: 'Cross Ventilation', value: ventilation },
    { label: 'Elderly Access', value: elderly },
  ];

  const MetricGrid = ({ items }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
      {items.map(({ label, value }) => (
        <div key={label} style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          padding: '0.55rem 0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{label}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>{value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.6rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk' }}>
            Recommendation Drivers
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.15rem', lineHeight: 1.4, margin: 0 }}>
            Parameters that directly influence constraint-engine filters, MCDM suitability scores, and ML model predictions.
          </p>
        </div>
        <MetricGrid items={recommendationDrivers} />
      </div>

      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.6rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk' }}>
            Building Configuration
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.15rem', lineHeight: 1.4, margin: 0 }}>
            Spatial program parameters used to generate the 2D layout blueprint and 3D visualization.
          </p>
        </div>
        <MetricGrid items={buildingConfig} />
      </div>
    </div>
  );
}
