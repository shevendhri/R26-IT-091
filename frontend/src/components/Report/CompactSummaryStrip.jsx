"use client";

import React, { useState, useEffect } from 'react';

/**
 * CompactSummaryStrip – High-precision telemetry strip for project identity and scores.
 * Architectural editorial design with high contrast, crisp typography, and modern cards.
 */
export default function CompactSummaryStrip({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !data) return null;

  const bp = data?.blueprint || {};
  const climate = data?.climate_profile || {};
  const metrics = data?.metrics || {};

  const buildingType = bp.building_type ?? data?.building_type ?? 'N/A';
  const location = climate.city ?? data?.location ?? 'N/A';
  const climateZone = climate.type ?? climate.zone ?? 'N/A';
  const totalArea = bp.total_area ? `${bp.total_area} m²` : bp.total_floor_area ? `${bp.total_floor_area} m²` : 'N/A';
  const numFloors = bp.num_floors ? `${bp.num_floors} Floors` : data?.floors ? `${data.floors} Floors` : 'N/A';

  const hybridScore = typeof metrics.overall_hybrid_score === 'number'
    ? metrics.overall_hybrid_score.toFixed(1)
    : 'N/A';

  const engScore = typeof metrics.project_eng_score === 'number'
    ? metrics.project_eng_score.toFixed(1)
    : 'N/A';

  const mlScore = metrics.project_ml_score != null && metrics.project_ml_score !== 'N/A'
    ? parseFloat(metrics.project_ml_score).toFixed(1)
    : 'N/A';

  const scoreNum = parseFloat(hybridScore);
  const scoreColor = !isNaN(scoreNum) && scoreNum >= 75 ? '#143825' : !isNaN(scoreNum) && scoreNum >= 55 ? '#7A5229' : '#8E3B27';
  const scoreBg = !isNaN(scoreNum) && scoreNum >= 75 ? '#EBF3ED' : !isNaN(scoreNum) && scoreNum >= 55 ? '#FDF8EE' : '#FDF0ED';
  const scoreBorder = !isNaN(scoreNum) && scoreNum >= 75 ? '#D2E4D6' : !isNaN(scoreNum) && scoreNum >= 55 ? '#EADEC9' : '#F5D3C8';

  const statCell = (label, value, emphasis = false) => (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2DCD0',
      borderRadius: '6px',
      padding: '0.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      boxShadow: '0 1px 3px rgba(20, 56, 37, 0.03)',
    }}>
      <span style={{
        fontSize: '0.66rem',
        color: '#697068',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>{label}</span>
      <span style={{
        fontSize: '0.96rem',
        fontWeight: 800,
        color: emphasis ? '#143825' : '#1A2E22',
        fontFamily: 'Space Grotesk, sans-serif',
        lineHeight: 1.25,
      }}>{value}</span>
    </div>
  );

  const scoreBlock = (label, value, color, bg, border, sublabel) => (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '6px',
      padding: '0.90rem 1.15rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: '1 1 140px',
      boxShadow: '0 1px 3px rgba(20, 56, 37, 0.03)',
    }}>
      <span style={{
        fontSize: '0.68rem',
        color: '#4A5E52',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          fontSize: '2.1rem',
          fontWeight: 900,
          color,
          fontFamily: 'Space Grotesk, sans-serif',
          lineHeight: 1,
        }}>{value}</span>
        <span style={{ fontSize: '0.80rem', color: '#697068', fontWeight: 700 }}>/100</span>
      </div>
      {sublabel && (
        <span style={{ fontSize: '0.68rem', color: '#697068', marginTop: '2px', fontWeight: 500 }}>{sublabel}</span>
      )}
    </div>
  );

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top identity row */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2DCD0',
        borderLeft: '5px solid #143825',
        borderRadius: '8px',
        padding: '1.25rem 1.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 10px rgba(20, 56, 37, 0.04)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#143825',
              background: '#EBF3ED',
              border: '1px solid #D2E4D6',
              padding: '3px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              Project Context
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '4px',
              background: '#F5F1E8',
              border: '1px solid #E2DCD0',
              color: '#4A5E52',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'Space Grotesk, sans-serif',
            }}>
              SLS-Referenced Rule Check
            </span>
          </div>
          <div style={{
            fontSize: '1.55rem',
            fontWeight: 800,
            color: '#143825',
            fontFamily: 'Outfit, Space Grotesk, sans-serif',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '0.45rem',
          }}>
            {buildingType}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.84rem', color: '#526158', flexWrap: 'wrap', fontWeight: 500 }}>
            <span>Location: <strong style={{ color: '#143825', fontWeight: 700 }}>{location}</strong></span>
            <span>Climate: <strong style={{ color: '#143825', fontWeight: 700 }}>{climateZone}</strong></span>
            <span>Area: <strong style={{ color: '#143825', fontWeight: 700 }}>{totalArea}</strong></span>
            <span>Floors: <strong style={{ color: '#143825', fontWeight: 700 }}>{numFloors}</strong></span>
          </div>
        </div>

        {/* Hybrid score large badge */}
        <div style={{
          background: scoreBg,
          border: `1px solid ${scoreBorder}`,
          borderRadius: '8px',
          padding: '0.9rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(20, 56, 37, 0.04)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
            Hybrid Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: scoreColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
              {hybridScore}
            </span>
            <span style={{ fontSize: '0.85rem', color: scoreColor, fontWeight: 700, opacity: 0.8 }}>/100</span>
          </div>
          <span style={{ fontSize: '0.66rem', color: '#697068', fontFamily: 'Space Grotesk, sans-serif', textAlign: 'center', fontWeight: 600 }}>
            MCDM + RF Primary Rank
          </span>
        </div>
      </div>

      {/* Score triplet row */}
      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
        {scoreBlock('Hybrid Score', hybridScore, '#143825', '#EBF3ED', '#D2E4D6', 'Primary Decision Ranking')}
        {scoreBlock('Eng Validation', engScore, '#2A4D3A', '#F5F7F5', '#DDE5DF', 'Deterministic Rules (75%)')}
        {scoreBlock('ML Confidence', mlScore !== 'N/A' ? `${mlScore}%` : 'N/A', '#5E836E', '#F3F6F4', '#DAE4DC', 'ML Pattern Inference (25%)')}
      </div>

      {/* Parameter grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem' }}>
        {statCell('Building Type', buildingType, true)}
        {statCell('Location', location)}
        {statCell('Climate Zone', climateZone)}
        {statCell('Total Area', totalArea)}
        {statCell('Floors', numFloors)}
      </div>
    </section>
  );
}
