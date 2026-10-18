"use client";
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MaterialSubNav from '@/components/Materials/MaterialSubNav';
import Link from 'next/link';

export default function RoadmapPage() {
  const stages = [
    { num: '01', title: 'Spatial & Boundary Vision Analyzer', description: 'Plan Analyzer extracts architectural CAD layers, wall vectors, room boundaries, and opening ratios.' },
    { num: '02', title: 'Hybrid MCDM & Random Forest Specification', description: 'Material Specification Engine calculates construction quantities, SLS audits, and applies TOPSIS multi-criteria decision scoring.' },
    { num: '03', title: 'Detailed Bill of Quantities & Life-Cycle Monograph', description: 'Bill of Materials (BOM) is generated with component quantities, units, cost, embodied carbon, and 50-year service life.' },
    { num: '04', title: 'Real-Time 3D BIM Cutaway & Spatial Planner', description: 'Cutaway interactive 3D studio with live material swatches, SLS structural deflection audits, and spatial arrangement.' },
  ];

  return (
    <div className="arch-page-canvas" style={{ minHeight: '100vh', background: '#F5F1E8' }}>
      <Header />
      <MaterialSubNav />

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto 4rem' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #D8D1C5',
          borderTop: '4px solid #173A2B',
          borderRadius: '4px',
          padding: '2.5rem 3rem',
          boxShadow: '0 4px 20px rgba(23, 58, 43, 0.04)',
        }}>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: '#173A2B',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '0.5rem',
          }}>
            RESEARCH PLATFORM INTEGRATION
          </div>
          
          <h1 style={{
            fontFamily: 'Outfit, Space Grotesk, sans-serif',
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#173A2B',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            Platform Pipeline & Research Roadmap
          </h1>

          <p style={{ color: '#697068', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '720px' }}>
            The GreenConstructAI decision-support pipeline connects four core research pillars into an end-to-end architectural engineering methodology.
          </p>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
            {stages.map((s, i) => (
              <div key={i} style={{
                background: '#FBF9F4',
                border: '1px solid #D8D1C5',
                borderRadius: '4px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '3px',
                  background: '#173A2B',
                  color: '#FCFAF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  flexShrink: 0,
                }}>
                  {s.num}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#173A2B',
                    margin: '0 0 4px',
                  }}>
                    {s.title}
                  </h2>
                  <p style={{ margin: 0, color: '#697068', fontSize: '0.85rem', lineHeight: 1.55 }}>
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/materials/form"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#173A2B',
                color: '#FCFAF6',
                border: '1px solid #173A2B',
                padding: '0.85rem 1.75rem',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Start Project Brief Intake →
            </Link>
            <Link
              href="/materials/report"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#173A2B',
                border: '1px solid #D8D1C5',
                padding: '0.85rem 1.5rem',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              View Research Trace Monograph
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
