"use client";
import React from 'react';

/**
 * DecisionFactorsPanel – Climate and structural decision drivers.
 * Updated for high-contrast warm sustainable architecture theme.
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
    if (type === 'positive') return { color: '#245C43', bg: '#DDE8DE', border: 'rgba(36, 92, 67, 0.25)' };
    if (type === 'caution') return { color: '#C77A3D', bg: 'rgba(199, 122, 61, 0.12)', border: 'rgba(199, 122, 61, 0.25)' };
    return { color: '#526158', bg: '#FFFFFF', border: '#C8D3CA' };
  };

  if (drivers.length === 0) return null;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #C8D3CA',
      borderRadius: '16px',
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.04)',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem', fontFamily: 'Space Grotesk' }}>
          Climate & Structural Context
        </div>
        <h3 style={{ fontSize: '1.2rem', color: '#18251F', fontFamily: 'Space Grotesk', margin: 0, fontWeight: 800 }}>
          Decision Drivers
        </h3>
        <p style={{ color: '#526158', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
          How each contextual input parameter influenced the final material selection.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {drivers.map((driver, i) => {
          const style = getTypeStyle(driver.type);
          return (
            <div key={i} style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              padding: '0.7rem 0.85rem',
              background: '#F7F9F6',
              border: '1px solid #C8D3CA',
              borderRadius: '10px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#18251F', fontFamily: 'Space Grotesk' }}>
                    {driver.factor}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: style.color,
                    background: style.bg,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${style.border}`,
                    flexShrink: 0
                  }}>
                    {driver.value}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#526158', lineHeight: 1.5, fontWeight: 500 }}>
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
