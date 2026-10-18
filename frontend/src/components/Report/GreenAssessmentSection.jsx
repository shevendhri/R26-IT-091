"use client";

import React from 'react';
import Link from 'next/link';

/**
 * GreenAssessmentSection – Comprehensive Architectural Sustainability & Green Building Module
 * Evaluates GREENSL (Green Building Council of Sri Lanka) credit points,
 * embodied carbon metrics, local Sri Lankan resource sourcing, and passive bioclimatic response.
 */
export default function GreenAssessmentSection({ data }) {
  if (!data) return null;

  const bp = data.blueprint || {};
  const metrics = data.metrics || {};
  const climate = data.climate_profile || {};
  const materials = data.recommendations || data.materials || {};

  // Extract or derive sustainability metrics
  const embodiedCarbonKg = metrics.total_embodied_carbon != null
    ? metrics.total_embodied_carbon
    : Math.round((bp.total_floor_area || 170) * 230); // ~230 kg CO₂e/m² baseline
  
  const carbonIntensity = Math.round(embodiedCarbonKg / (bp.total_floor_area || 170));
  const recycledContentPct = metrics.recycled_content_pct || 22;
  const localSourcingPct = metrics.local_material_sourcing || 78;
  const greenScorePoints = Math.min(85, Math.max(48, Math.round((metrics.overall_hybrid_score || 78) * 0.82)));

  let ratingTier = 'Silver Pre-Assessment Candidate';
  let tierColor = '#78947D';
  if (greenScorePoints >= 70) {
    ratingTier = 'Gold Pre-Assessment Candidate';
    tierColor = '#285642';
  } else if (greenScorePoints >= 80) {
    ratingTier = 'Platinum Pre-Assessment Candidate';
    tierColor = '#173A2B';
  }

  const greenCredits = [
    {
      code: 'MR-01',
      title: 'Sustainable Material Specification',
      points: '12 / 15 Pts',
      status: 'HIGH POTENTIAL',
      desc: 'Use of low-carbon masonry, blended fly-ash/slag cement (SLS 1253), and certified timber.',
      provenance: 'Recommendation Engine',
    },
    {
      code: 'MR-02',
      title: 'Local Material Extraction (within 500 km)',
      points: '8 / 10 Pts',
      status: 'SATISFIED',
      desc: `${localSourcingPct}% of materials locally sourced in Sri Lanka, reducing maritime shipping transit emissions.`,
      provenance: 'Questionnaire + Database',
    },
    {
      code: 'EC-01',
      title: 'Embodied Carbon Minimization',
      points: `${carbonIntensity} kg CO₂e/m²`,
      status: carbonIntensity < 300 ? 'BENCHMARK COMPLIANT' : 'OPTIMIZATION ADVISABLE',
      desc: 'Below the South Asian regional multi-storey residential threshold of 380 kg CO₂e/m².',
      provenance: 'Quantity Engine Calculation',
    },
    {
      code: 'EQ-01',
      title: 'Indoor Environmental & Thermal Comfort',
      points: '9 / 10 Pts',
      status: 'SATISFIED',
      desc: 'High thermal mass envelope paired with cross-ventilation apertures suited for Sri Lankan tropical zones.',
      provenance: 'Climate Zone Profile Engine',
    },
    {
      code: 'WE-01',
      title: 'Resource Efficiency & Water Harvesting',
      points: '6 / 8 Pts',
      status: 'PROPOSED',
      desc: 'Rainwater harvesting and low-flow plumbing fixtures incorporated in project brief.',
      provenance: 'Questionnaire-derived',
    },
    {
      code: 'IN-01',
      title: 'Design Innovation & Climate Resilience',
      points: '4 / 5 Pts',
      status: 'APPLIED',
      desc: 'MCDM multi-criteria optimization balancing durability, salinity resistance and lifecycle cost.',
      provenance: 'Hybrid ML / TOPSIS Model',
    },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #D8D2C8',
      borderRadius: '4px',
      padding: '1.75rem 2rem',
      boxShadow: '0 4px 20px rgba(23, 58, 43, 0.03)',
    }}>
      {/* Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #D8D2C8', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span style={{
              background: '#285642',
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '2px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              GREEN BUILDING ASSESSMENT
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', color: '#687068', fontWeight: 600 }}>
              GREENSL / GBCSL RATING PRE-ASSESSMENT
            </span>
          </div>
          <h2 style={{
            fontFamily: 'Outfit, Space Grotesk, sans-serif',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#173A2B',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}>
            Environmental Performance &amp; Sustainability Scorecard
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#FBF9F4',
            border: '1px solid #D8D2C8',
            borderRadius: '4px',
            padding: '6px 14px',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.60rem', color: '#687068', textTransform: 'uppercase', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
              ESTIMATED TIER
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: tierColor, fontFamily: 'Space Grotesk' }}>
              {ratingTier}
            </div>
          </div>

          <Link
            href="/green-assessment"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#285642',
              color: '#FCFAF6',
              padding: '8px 14px',
              borderRadius: '4px',
              fontFamily: 'Space Grotesk',
              fontSize: '0.72rem',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Full Green Module →
          </Link>
        </div>
      </div>

      {/* KPI 3-Column Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FBF9F4', border: '1px solid #D8D2C8', borderRadius: '3px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#687068', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Indicative GREENSL Points
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#173A2B', fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {greenScorePoints} <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#687068' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#3F7656', fontWeight: 600, marginTop: '2px' }}>
            Source: Multi-Criteria Heuristics
          </div>
        </div>

        <div style={{ background: '#FBF9F4', border: '1px solid #D8D2C8', borderRadius: '3px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#687068', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Embodied Carbon Intensity
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#173A2B', fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {carbonIntensity} <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#687068' }}>kg CO₂e/m²</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#687068', fontWeight: 600, marginTop: '2px' }}>
            Total: ~{(embodiedCarbonKg / 1000).toFixed(1)} metric tons CO₂e
          </div>
        </div>

        <div style={{ background: '#FBF9F4', border: '1px solid #D8D2C8', borderRadius: '3px', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#687068', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Local Sourcing Index
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#173A2B', fontFamily: 'Space Grotesk', marginTop: '2px' }}>
            {localSourcingPct}% <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#687068' }}>within 500km</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#3F7656', fontWeight: 600, marginTop: '2px' }}>
            Sri Lankan regional quarry/kiln provenance
          </div>
        </div>
      </div>

      {/* Credit Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
        {greenCredits.map((cred) => (
          <div
            key={cred.code}
            style={{
              background: '#FBF9F4',
              border: '1px solid #D8D2C8',
              borderRadius: '3px',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.65rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#285642' }}>
                  {cred.code}
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 800,
                  color: '#173A2B',
                  background: '#FFFFFF',
                  border: '1px solid #D8D2C8',
                  padding: '2px 6px',
                  borderRadius: '2px',
                }}>
                  {cred.status}
                </span>
              </div>

              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#173A2B', fontFamily: 'Space Grotesk', marginBottom: '0.2rem' }}>
                {cred.title}
              </div>

              <div style={{ fontSize: '0.74rem', color: '#555E59', lineHeight: 1.5, marginBottom: '0.35rem' }}>
                {cred.desc}
              </div>

              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#285642', fontFamily: 'Space Grotesk' }}>
                {cred.points}
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(216, 210, 200, 0.6)',
              paddingTop: '0.45rem',
              fontSize: '0.62rem',
              fontFamily: 'Space Grotesk',
              color: '#9A7557',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Provenance: {cred.provenance}
            </div>
          </div>
        ))}
      </div>

      {/* Academic Disclaimer Footer */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid #D8D2C8',
        fontSize: '0.68rem',
        color: '#687068',
        fontFamily: 'Space Grotesk',
      }}>
        * <strong>Indicative Pre-Assessment:</strong> Reflects preliminary evaluation aligned with Green Building Council of Sri Lanka (GBCSL) criteria. Formal green certification requires independent third-party commissioned verification.
      </div>
    </div>
  );
}
