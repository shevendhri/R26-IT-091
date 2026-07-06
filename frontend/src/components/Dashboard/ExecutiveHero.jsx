// ExecutiveHero.jsx – top-level engineering header
"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * ExecutiveHero – renders the top-level project metadata and overall performance KPIs.
 *
 * Data Traceability:
 *   Building Type          → data.blueprint.building_type
 *   Location               → data.climate_profile.city
 *   Climate Zone           → data.climate_profile.type
 *   Total Area             → data.blueprint.total_area
 *   Floor Count            → data.blueprint.num_floors
 *   AI Score               → data.metrics.overall_hybrid_score
 *   Average Sustainability → data.metrics.average_sustainability
 */
export default function ExecutiveHero({ data }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  if (!data?.blueprint || !data?.climate_profile) {
    return null;
  }

  const buildingType = data.blueprint.building_type ?? 'N/A';
  const location = data.climate_profile.city ?? 'N/A';
  const climateZone = data.climate_profile.type ?? 'N/A';
  const totalArea = data.blueprint.total_area ?? 'N/A';
  const floorCount = data.blueprint.num_floors ?? 'N/A';
  const aiScore = typeof data.metrics?.overall_hybrid_score === 'number'
    ? data.metrics.overall_hybrid_score.toFixed(1)
    : 'N/A';
  const sustainability = typeof data.metrics?.average_sustainability === 'number'
    ? data.metrics.average_sustainability.toFixed(1)
    : 'N/A';

  return (
    <section className="glass-card executive-hero" style={{
      padding: '2.5rem',
      background: 'rgba(6, 12, 16, 0.85)',
      border: '1px solid rgba(0, 255, 157, 0.15)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 255, 157, 0.02)',
      borderRadius: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Structural Accent Line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, var(--eco-glow), var(--blueprint-blue))'
      }}/>

      {/* Main Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left: Project Identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              color: 'var(--eco-glow)',
              background: 'rgba(0, 255, 157, 0.08)',
              border: '1px solid rgba(0, 255, 157, 0.2)',
              padding: '4px 10px',
              borderRadius: '6px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              PROJECT SPECIFICATION ACTIVE
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              color: 'var(--blueprint-blue)',
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              padding: '4px 10px',
              borderRadius: '6px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              SLS COMPLIANT
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#fff', margin: 0, lineHeight: 1.1 }}>
            {buildingType}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
            Location Profile: <strong style={{ color: '#fff' }}>{location}</strong> ({climateZone} Zone)
          </p>
        </div>

        {/* Right: Key Telemetry Grid */}
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* AI Aggregation */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              HYBRID PERFORMANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--eco-glow)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {aiScore}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 700 }}>/100</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.08)' }}/>

          {/* Eco Performance */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              ECO-EFFICIENCY
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--blueprint-blue)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {sustainability}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 700 }}>/100</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.08)' }}/>

          {/* Core Specs summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '6px' }}>Area:</span>
              <strong style={{ color: '#fff' }}>{totalArea} m²</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '6px' }}>Floors:</span>
              <strong style={{ color: '#fff' }}>{floorCount} Floors</strong>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
