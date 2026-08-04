"use client";

import React, { useState, useEffect } from 'react';

/**
 * CompactSummaryStrip – Premium, high-precision telemetry strip for project identity and scores.
 */
export default function CompactSummaryStrip({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !data) return null;

  const bp = data?.blueprint || {};
  const climate = data?.climate_profile || {};
  const metrics = data?.metrics || {};

  const buildingType = bp.building_type ?? 'N/A';
  const location = climate.city ?? 'N/A';
  const climateZone = climate.type ?? 'N/A';
  const totalArea = bp.total_area ? `${bp.total_area} m²` : 'N/A';
  const numFloors = bp.num_floors ? `${bp.num_floors} Floors` : 'N/A';

  const hybridScore = typeof metrics.overall_hybrid_score === 'number'
    ? metrics.overall_hybrid_score.toFixed(1)
    : 'N/A';

  const engScore = typeof metrics.project_eng_score === 'number'
    ? metrics.project_eng_score.toFixed(1)
    : 'N/A';

  const mlScore = metrics.project_ml_score != null && metrics.project_ml_score !== 'N/A'
    ? parseFloat(metrics.project_ml_score).toFixed(1)
    : 'N/A';

  return (
    <section className="fade-up" style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {/* Left: Project Specification Identity & Parameters */}
        <div className="glass-panel" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Project Context
            </span>
            <span className="telemetry-badge telemetry-badge-success">
              SLS Compliant
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}>
            {buildingType}
          </h1>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>Location: <strong style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{location}</strong></span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>Climate: <strong style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{climateZone}</strong></span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>Area: <strong style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{totalArea}</strong></span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>Floors: <strong style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{numFloors}</strong></span>
          </div>
        </div>

        {/* Right: Premium Telemetry Score Cards */}
        <div style={{ display: 'flex', gap: '1rem', flex: '1 1 600px' }}>
          
          {/* Hybrid Score */}
          <div className="score-tel score-tel-green" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hybrid Score
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {hybridScore}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Primary Ranking Metric</div>
          </div>

          {/* Engineering Score */}
          <div className="score-tel score-tel-blue" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Eng Validation
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {engScore}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Deterministic Rules (75%)</div>
          </div>

          {/* ML Confidence */}
          <div className="score-tel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ML Confidence
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {mlScore}%
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Random Forest (25%)</div>
          </div>

        </div>
      </div>
    </section>
  );
}
