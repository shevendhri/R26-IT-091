// ProjectOverview.jsx – project & climate details divided into Recommendation Drivers and Building Configuration
"use client";
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { useMaterial } from '@/context/MaterialContext';

/**
 * ProjectOverview – Displays structured overview of project specifications and climate profiles.
 * Explicitly separates inputs into "Recommendation Drivers" (which affect calculations) and
 * "Building Configuration" (which affect spatial layout & 3D visualizer rendering).
 */
export default function ProjectOverview({ data }) {
  const { preferences, buildingInfo, buildingRequirements } = useMaterial() || {};
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!data) return null;

  // Retrieve values from data (reportData) and fallback to Context
  const buildingType = data?.blueprint?.building_type       ?? buildingInfo?.building_type ?? 'N/A';
  const location     = data?.climate_profile?.city          ?? buildingInfo?.location ?? 'N/A';
  const totalArea    = data?.blueprint?.total_area          ?? buildingInfo?.total_area ?? 'N/A';
  const numFloors    = data?.blueprint?.num_floors          ?? buildingInfo?.floor_count ?? 'N/A';
  const climateZone  = data?.climate_profile?.type          ?? 'N/A';
  const temperature  = data?.climate_profile?.temperature   ?? 'N/A';
  const humidity     = data?.climate_profile?.humidity      ?? 'N/A';
  const rainfall     = data?.climate_profile?.rainfall      ?? 'N/A';
  const salinity     = data?.climate_profile?.salinity      ?? 'Low';
  const structSys    = data?.blueprint?.structural_system   ?? buildingInfo?.structural_system ?? 'N/A';

  const budgetTier   = preferences?.budget_tier             ?? 'Balanced';
  const susLevel     = preferences?.sustainability_level    ?? 'Medium';

  // Residential/Core building requirement defaults
  const bedrooms     = buildingRequirements?.bedrooms       ?? 3;
  const bathrooms    = buildingRequirements?.bathrooms      ?? 2;
  const solarReady   = buildingRequirements?.solar_ready    ? 'Active' : 'Inactive';
  const rainwater    = buildingRequirements?.rainwater_harvesting ? 'Active' : 'Inactive';
  const ventilation  = buildingRequirements?.cross_ventilation ?? 'Medium';
  const elderly      = (buildingRequirements?.elderly_occupants || 0) > 0 ? 'Active' : 'Inactive';
  const garden       = buildingRequirements?.garden         ? 'Active' : 'Inactive';
  const outdoor      = buildingRequirements?.outdoor_living_pref || (buildingRequirements?.garden ? 'Extensive' : 'Minimal');

  const recommendationDrivers = [
    { label: 'Building Sector', value: buildingType },
    { label: 'Location', value: location },
    { label: 'Climate Zone', value: climateZone },
    { label: 'Salinity Gating', value: salinity },
    { label: 'Annual Rainfall', value: rainfall },
    { label: 'Budget Tier', value: budgetTier },
    { label: 'Eco-Goal Priority', value: susLevel },
    { label: 'Structural System', value: structSys }
  ];

  const buildingConfig = [
    { label: 'Area Footprint', value: `${totalArea} m²` },
    { label: 'Floor Count', value: `${numFloors} Levels` },
    { label: 'Bedrooms Spec', value: bedrooms },
    { label: 'Bathrooms Spec', value: bathrooms },
    { label: 'Solar Ready Spec', value: solarReady },
    { label: 'Rainwater Tank', value: rainwater },
    { label: 'Cross Ventilation', value: ventilation },
    { label: 'Elderly Access Ramp', value: elderly },
    { label: 'Garden Foliage', value: garden },
    { label: 'Outdoor Living Deck', value: outdoor }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECTION 1: RECOMMENDATION DRIVERS */}
      <GlassCard className="dashboard-section project-overview-drivers">
        <div className="section-header">
          <span className="section-dot eco"></span>
          <h2>1. Recommendation Drivers</h2>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          Engineering parameters that directly influence constraint-engine filters, MCDM suitability scores, and neural ML model probability outcomes.
        </p>
        <div className="config-grid">
          {recommendationDrivers.map(({ label, value }) => (
            <div key={label} className="metric-box">
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* SECTION 2: BUILDING CONFIGURATION */}
      <GlassCard className="dashboard-section project-overview-config">
        <div className="section-header">
          <span className="section-dot blueprint"></span>
          <h2>2. Building Configuration</h2>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          Spatial program parameters used to generate the 2D layout blueprint and render physical mesh variations in the 3D visualizer context.
        </p>
        <div className="config-grid">
          {buildingConfig.map(({ label, value }) => (
            <div key={label} className="metric-box">
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}
