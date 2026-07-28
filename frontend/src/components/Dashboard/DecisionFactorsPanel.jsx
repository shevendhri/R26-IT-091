"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * DecisionFactorsPanel – Renders a list of decision drivers showing
 * how each input parameter affected the material recommendation.
 *
 * Data Traceability:
 *   Climate Profile     → data.climate_profile
 *   Blueprint Data      → data.blueprint
 *   Confidence Data     → data.confidence
 */
export default function DecisionFactorsPanel({ data }) {
  const climate = data?.climate_profile || {};
  const bp = data?.blueprint || {};
  const profile = data?.project_profile || {};

  // Build decision drivers from available data
  const drivers = [];

  // Climate zone
  if (climate.type) {
    drivers.push({
      factor: 'Climate Zone',
      value: climate.type,
      direction: 'up',
      impact: 'Directed material selection toward climate-resilient specifications'
    });
  }

  // Humidity
  if (climate.humidity) {
    const humidityNum = parseFloat(String(climate.humidity).replace('%', '')) || 0;
    const humidityHigh = humidityNum >= 75;
    drivers.push({
      factor: 'Humidity',
      value: climate.humidity,
      direction: humidityHigh ? 'up' : 'neutral',
      impact: humidityHigh
        ? 'Increased moisture-proofing priority for high humidity zone'
        : 'Standard humidity — no additional moisture adjustment required'
    });
  }

  // Salinity
  if (climate.salinity) {
    const sal = climate.salinity.toLowerCase();
    const salHigh = sal === 'extreme' || sal === 'moderate';
    drivers.push({
      factor: 'Coastal Salinity',
      value: climate.salinity,
      direction: salHigh ? 'up' : 'neutral',
      impact: salHigh
        ? 'Prioritized marine-grade and corrosion-resistant specifications'
        : 'Standard salinity — no coastal override applied'
    });
  }

  // Floor count
  if (bp.num_floors) {
    const floors = parseInt(bp.num_floors) || 1;
    drivers.push({
      factor: 'Floor Count',
      value: `${floors} ${floors === 1 ? 'Floor' : 'Floors'}`,
      direction: floors >= 3 ? 'up' : 'neutral',
      impact: floors >= 3
        ? 'Higher floor count increased concrete grade and foundation load requirements'
        : 'Low-rise structure — standard load specifications applied'
    });
  }

  // Building type
  if (bp.building_type) {
    drivers.push({
      factor: 'Building Type',
      value: bp.building_type,
      direction: 'up',
      impact: `Optimized material portfolio for ${bp.building_type.toLowerCase()} occupancy requirements`
    });
  }

  // Structural system
  if (bp.structural_system) {
    drivers.push({
      factor: 'Structural System',
      value: bp.structural_system,
      direction: 'up',
      impact: `Recommendations aligned with ${bp.structural_system} frame constraints`
    });
  }

  // Rainfall
  if (climate.rainfall) {
    const rainfallNum = parseFloat(String(climate.rainfall).replace('mm', '')) || 0;
    const highRain = rainfallNum > 2000;
    drivers.push({
      factor: 'Annual Rainfall',
      value: climate.rainfall,
      direction: highRain ? 'up' : 'neutral',
      impact: highRain
        ? 'Elevated waterproofing and drainage specifications selected'
        : 'Standard waterproofing specification applied'
    });
  }

  // Sustainability preference
  if (data?.recommended_package) {
    drivers.push({
      factor: 'Sustainability Priority',
      value: 'Active',
      direction: 'up',
      impact: 'Eco-efficiency scores weighted into hybrid ranking calculations'
    });
  }

  const getDirectionIcon = (dir) => {
    if (dir === 'up') return { icon: '⬆', color: '#00ff9d', label: 'Increased Suitability' };
    if (dir === 'down') return { icon: '⬇', color: '#f87171', label: 'Reduced Suitability' };
    return { icon: '→', color: '#fbbf24', label: 'Neutral Effect' };
  };

  if (drivers.length === 0) return null;

  return (
    <GlassCard className="dashboard-section" style={{ position: 'relative' }}>
      {/* Accent corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '60px', height: '60px',
        background: 'radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.12), transparent 70%)',
        pointerEvents: 'none'
      }}/>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Explainable AI — Reasoning Trace
        </div>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'Space Grotesk', margin: 0 }}>
          Decision Drivers
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          How each input parameter influenced the material recommendations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {drivers.map((driver, i) => {
          const dir = getDirectionIcon(driver.direction);
          return (
            <div key={i} style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              transition: 'border-color 0.2s'
            }}>
              {/* Direction indicator */}
              <div style={{
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${dir.color}15`,
                border: `1px solid ${dir.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                {dir.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', fontFamily: 'Space Grotesk' }}>
                    {driver.factor}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: dir.color,
                    background: `${dir.color}12`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${dir.color}28`,
                    flexShrink: 0
                  }}>
                    {driver.value}
                  </span>
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '3px', lineHeight: 1.4 }}>
                  {dir.label} — {driver.impact}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
