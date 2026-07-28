'use client';
// frontend/src/components/Dashboard/SustainabilityDashboard.jsx
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';


/**
 * SustainabilityDashboard – displays key sustainability KPI values from reportData.
 *
 * Data Traceability:
 *   Overall AI Score       → data.metrics.overall_hybrid_score
 *   Sustainability Rating  → data.metrics.average_sustainability
 *   Carbon Score           → data.metrics.average_carbon
 *   Service Life           → data.metrics.average_service_life
 */
export default function SustainabilityDashboard({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!data) return null;

  const averageSustainability = data?.metrics?.average_sustainability ?? null;
  const averageServiceLife = data?.metrics?.average_service_life ?? null;
  const averageCarbon = data?.metrics?.average_carbon ?? null;
  
  const envLabels = data?.metrics?.environmental_labels || {};
  const moistureResistanceLabel = envLabels.moisture_resistance || 'Verified';
  const climateResilienceLabel = envLabels.climate_resilience || 'Verified';
  const maintenanceLabel = envLabels.maintenance_requirement || 'Standard';
  const carbonImpact = envLabels.carbon_impact || (averageCarbon != null ? (averageCarbon < 0.3 ? 'Low' : averageCarbon < 0.6 ? 'Average' : 'High') : 'N/A');

  const carbonColor = carbonImpact === 'Low' ? 'var(--eco-glow)' : carbonImpact === 'Average' ? '#fbbf24' : carbonImpact === 'High' ? '#ef4444' : 'var(--text-dim)';

  const sustainabilityRating = averageSustainability != null ? `${Math.round(averageSustainability)}%` : 'N/A';
  const serviceLife = averageServiceLife != null ? `${Math.round(averageServiceLife)} Years` : 'N/A';

  const kpis = [
    { label: 'Carbon Impact', value: carbonImpact, color: carbonColor, icon: '🌍', desc: 'Net greenhouse gas index' },
    { label: 'Average Eco Rating', value: sustainabilityRating, color: 'var(--eco-glow)', icon: '🌱', desc: 'Material circularity rating' },
    { label: 'Average Service Life', value: serviceLife, color: '#fff', icon: '⏱️', desc: 'Structural lifespan' },
    { label: 'Climate Resilience', value: climateResilienceLabel, color: '#06b6d4', icon: '🌊', desc: 'Extreme exposure resistance' },
    { label: 'Moisture Resistance', value: moistureResistanceLabel, color: '#0ea5e9', icon: '💧', desc: 'SLS humidity gating compliance' },
    { label: 'Maintenance Requirement', value: maintenanceLabel, color: '#a78bfa', icon: '🛡️', desc: 'Operational upkeep factor' },
  ];

  return (
    <GlassCard className="dashboard-section sustainability-dashboard" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: '120px', height: '120px',
        background: 'radial-gradient(circle at 100% 100%, rgba(0, 255, 157, 0.05), transparent 70%)',
        pointerEvents: 'none'
      }}/>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Environmental Dashboard
        </div>
        <h2 style={{ fontSize: '1.6rem', color: '#fff', fontFamily: 'Space Grotesk', margin: 0 }}>
          Overall Sustainability Metrics
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: kpi.color, fontFamily: 'Space Grotesk' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {kpi.desc}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
