"use client";
import React from 'react';

/**
 * DecisionFactorsPanel – Climate and structural decision drivers.
 */
export default function DecisionFactorsPanel({ data }) {
  const climate = data?.climate_profile || {};
  const bp = data?.blueprint || {};

  const drivers = [];

  if (climate.type) {
    drivers.push({
      factor: 'Climate Zone',
      value: climate.type,
      type: 'positive',
      impact: 'Directed material selection toward climate-resilient specifications'
    });
  }

  if (climate.humidity) {
    const humidityNum = parseFloat(String(climate.humidity).replace('%', '')) || 0;
    const humidityHigh = humidityNum >= 75;
    drivers.push({
      factor: 'Humidity',
      value: climate.humidity,
      type: humidityHigh ? 'caution' : 'neutral',
      impact: humidityHigh
        ? 'Increased moisture-proofing priority for high humidity zone'
        : 'Standard humidity — no additional moisture adjustment required'
    });
  }

  if (climate.salinity) {
    const sal = climate.salinity.toLowerCase();
    const salHigh = sal === 'extreme' || sal === 'moderate';
    drivers.push({
      factor: 'Coastal Salinity',
      value: climate.salinity,
      type: salHigh ? 'caution' : 'neutral',
      impact: salHigh
        ? 'Prioritized marine-grade and corrosion-resistant specifications'
        : 'Standard salinity — no coastal override applied'
    });
  }

  if (bp.num_floors) {
    const floors = parseInt(bp.num_floors) || 1;
    drivers.push({
      factor: 'Floor Count',
      value: `${floors} ${floors === 1 ? 'Floor' : 'Floors'}`,
      type: floors >= 3 ? 'caution' : 'neutral',
      impact: floors >= 3
        ? 'Higher floor count increased structural load and concrete grade requirements'
        : 'Low-rise structure — standard load specifications applied'
    });
  }

  if (bp.building_type) {
    drivers.push({
      factor: 'Building Type',
      value: bp.building_type,
      type: 'positive',
      impact: `Optimized material portfolio for ${bp.building_type.toLowerCase()} occupancy requirements`
    });
  }

  if (bp.structural_system) {
    drivers.push({
      factor: 'Structural System',
      value: bp.structural_system,
      type: 'positive',
      impact: `Recommendations aligned with ${bp.structural_system} frame constraints`
    });
  }

  if (climate.rainfall) {
    const rainfallNum = parseFloat(String(climate.rainfall).replace('mm', '')) || 0;
    const highRain = rainfallNum > 2000;
    drivers.push({
      factor: 'Annual Rainfall',
      value: climate.rainfall,
      type: highRain ? 'caution' : 'neutral',
      impact: highRain
        ? 'Elevated waterproofing and drainage specifications selected'
        : 'Standard waterproofing specification applied'
    });
  }

  if (data?.recommended_package) {
    drivers.push({
      factor: 'Sustainability Weighting',
      value: 'Active',
      type: 'positive',
      impact: 'Eco-efficiency scores weighted into hybrid ranking calculations'
    });
  }

  const getTypeStyle = (type) => {
    if (type === 'positive') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' };
    if (type === 'caution') return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' };
    return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.12)' };
  };

  if (drivers.length === 0) return null;

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
          Climate & Structural Context
        </div>
        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontFamily: 'Space Grotesk', margin: 0, fontWeight: 600 }}>
          Decision Drivers
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', lineHeight: 1.4, margin: 0 }}>
          How each contextual input parameter influenced the final material selection.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {drivers.map((driver, i) => {
          const style = getTypeStyle(driver.type);
          return (
            <div key={i} style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              padding: '0.6rem 0.75rem',
              background: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '6px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
                    {driver.factor}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: style.color,
                    background: style.bg,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${style.border}`,
                    flexShrink: 0
                  }}>
                    {driver.value}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {driver.impact}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
