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

  const overallScore = typeof data?.metrics?.overall_hybrid_score === 'number' ? data.metrics.overall_hybrid_score.toFixed(1) : 'N/A';
  const sustainabilityRating = typeof data?.metrics?.average_sustainability === 'number' ? data.metrics.average_sustainability.toFixed(1) : 'N/A';
  const carbonScore = typeof data?.metrics?.average_carbon === 'number' ? data.metrics.average_carbon.toFixed(1) : 'N/A';
  const serviceLife = typeof data?.metrics?.average_service_life === 'number' ? `${data.metrics.average_service_life.toFixed(0)} Years` : 'N/A';

  const kpis = [
    { label: 'Overall AI Score', value: overallScore, eco: true, icon: 'AI' },
    { label: 'Sustainability Rating', value: sustainabilityRating, eco: true, icon: 'SR' },
    { label: 'Carbon Score', value: carbonScore, eco: false, icon: 'CO₂' },
    { label: 'Service Life', value: serviceLife, eco: false, icon: 'SL' },
  ];

  return (
    <GlassCard className="dashboard-section sustainability-dashboard">
      <div className="section-header">
        <span className="section-dot eco"></span>
        <h2>Sustainability Dashboard</h2>
      </div>
      <div className="card-grid">
        {kpis.map(kpi => (
          <div key={kpi.label} className="kpi-card hoverable">
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 900,
              letterSpacing: '3px',
              color: kpi.eco ? 'var(--eco-glow)' : 'var(--blueprint-blue)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}>
              {kpi.icon}
            </div>
            <div className={`kpi-value${kpi.eco ? ' eco' : ''}`} style={{ fontSize: '3rem' }}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
