"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';

const FEEDBACK_MODULES = [
  {
    id: 1,
    num: "01",
    title: "Building Plan Analyzer",
    shortTitle: "Plan Analyzer",
    category: "SPATIAL & REGULATORY AUDIT",
    description: "Floor plan interpretation, room dimensioning, setbacks, and UDA compliance verification.",
    accent: "var(--arch-forest, #1A382B)",
    accentLight: "rgba(20, 56, 37, 0.06)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?usp=header",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?embedded=true",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    )
  },
  {
    id: 2,
    num: "02",
    title: "Material Recommendations",
    shortTitle: "Materials",
    category: "MCDM & ML SELECTION",
    description: "Multi-criteria material scoring, climate zone adaptation, and structural package feasibility.",
    accent: "var(--arch-terracotta, #B8583B)",
    accentLight: "rgba(184, 88, 59, 0.08)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdDr5VrYMSK1rY-kMCD5LRCFD6NDlJXLA5nRAGruQrSihD5Rw/viewform?usp=publish-editor",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdDr5VrYMSK1rY-kMCD5LRCFD6NDlJXLA5nRAGruQrSihD5Rw/viewform?embedded=true",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    )
  },
  {
    id: 3,
    num: "03",
    title: "Green Building Pre-Assessment",
    shortTitle: "Green Assessment",
    category: "GREENSL & SUSTAINABILITY",
    description: "Sustainability benchmarking, carbon footprint analysis, and green rating pre-certification.",
    accent: "var(--arch-moss, #4D7C5D)",
    accentLight: "rgba(77, 124, 93, 0.08)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc7QqG-Z1sZGVqL9zpr1HvaUvfoKNi190mfSz2z5Dpchue0Xw/viewform?usp=header",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc7QqG-Z1sZGVqL9zpr1HvaUvfoKNi190mfSz2z5Dpchue0Xw/viewform?embedded=true",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2c2.5 3 4 6.5 4 10"/><path d="M12 2C9.5 5 8 8.5 8 12"/>
      </svg>
    )
  },
  {
    id: 4,
    num: "04",
    title: "Fire-Safety Compliance",
    shortTitle: "Fire Safety",
    category: "FIRE CODE VALIDATION",
    description: "Fire resistance rating, travel distance checks, egress sizing, and safety regulation validation.",
    accent: "#C25E2E",
    accentLight: "rgba(194, 94, 46, 0.08)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdqeQ-Ky_TN2jfipHPoT9Y19rU4DznfM4jEaUEyWnxyXNmXrA/viewform?usp=publish-editor",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdqeQ-Ky_TN2jfipHPoT9Y19rU4DznfM4jEaUEyWnxyXNmXrA/viewform?embedded=true",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )
  }
];

export default function FeedbackPage() {
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [iframeLoading, setIframeLoading] = useState(true);

  const currentModule = FEEDBACK_MODULES.find(m => m.id === selectedModuleId) || FEEDBACK_MODULES[0];

  return (
    <div className="arch-page-canvas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{
        flex: 1,
        maxWidth: '1360px',
        margin: '0 auto',
        width: '100%',
        padding: '2.5rem 1.5rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        <ModuleHeroBanner
          track="05 / STAKEHOLDER & USER EVALUATION"
          kicker="RESEARCH EVALUATION BENCHMARK"
          title="RESEARCH FEEDBACK & ACADEMIC VALIDATION"
          subtitle="A structured peer and stakeholder evaluation interface. Review AI recommendation quality, engineering rule feasibility, climate adaptation accuracy, and explainable decision provenance across all 4 research tracks."
          imageSrc="/biophilic_building.jpg"
          imageAlt="Biophilic Architecture & Evaluation Benchmarks"
        />

        {/* Research Evaluation Inquiry Pillars */}
        <section className="arch-board-card" style={{ padding: '1.5rem 1.75rem', borderRadius: '4px', border: '1px solid #E2DCD0', background: '#FFFFFF', marginTop: '-1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '4px', border: '1px solid #E2DCD0' }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#143825', fontWeight: 700, marginBottom: '4px' }}>EVALUATION CRITERION 01</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#143825' }}>What worked?</div>
              <div style={{ fontSize: '0.76rem', color: '#143825', opacity: 0.65, marginTop: '4px', lineHeight: 1.4 }}>
                Precision of room geometry extraction, setback compliance checks, and climate mapping.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '4px', border: '1px solid #E2DCD0' }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#143825', fontWeight: 700, marginBottom: '4px' }}>EVALUATION CRITERION 02</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#143825' }}>What needs improvement?</div>
              <div style={{ fontSize: '0.76rem', color: '#143825', opacity: 0.65, marginTop: '4px', lineHeight: 1.4 }}>
                Uncertainty handling, rare structural boundary conditions, or edge-case constraints.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '4px', border: '1px solid #E2DCD0' }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#143825', fontWeight: 700, marginBottom: '4px' }}>EVALUATION CRITERION 03</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#143825' }}>Reasonable recommendations?</div>
              <div style={{ fontSize: '0.76rem', color: '#143825', opacity: 0.65, marginTop: '4px', lineHeight: 1.4 }}>
                Feasibility under Sri Lankan BSR pricing, local availability, and SLS standards.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '4px', border: '1px solid #E2DCD0' }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#143825', fontWeight: 700, marginBottom: '4px' }}>EVALUATION CRITERION 04</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#143825' }}>Understandable reasoning?</div>
              <div style={{ fontSize: '0.76rem', color: '#143825', opacity: 0.65, marginTop: '4px', lineHeight: 1.4 }}>
                Clarity of multi-criteria weights, rule justification, and decision trace pipeline.
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════ 4 MODULE SELECTOR CARDS ════ */}
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#143825', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SELECT EVALUATION TRACK
            </div>
            <div style={{ fontSize: '0.75rem', color: '#143825', opacity: 0.6 }}>
              04 Specialized Academic Research Modules
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {FEEDBACK_MODULES.map((mod) => {
              const isSelected = mod.id === selectedModuleId;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setIframeLoading(true);
                  }}
                  className="arch-board-card"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    background: isSelected ? '#FFFFFF' : '#FAF7F0',
                    borderColor: isSelected ? '#143825' : '#E2DCD0',
                    boxShadow: isSelected ? '0 8px 24px rgba(20, 56, 37, 0.06)' : '0 2px 8px rgba(0,0,0,0.03)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '210px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="arch-tag" style={{ background: isSelected ? 'rgba(20, 56, 37, 0.06)' : 'transparent' }}>
                        TRACK {mod.num}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isSelected ? 'var(--arch-forest)' : 'var(--arch-charcoal)',
                        opacity: isSelected ? 1 : 0.6,
                        letterSpacing: '0.04em'
                      }}>
                        {mod.category}
                      </span>
                    </div>

                    <h3 style={{
                      fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: '#143825',
                      margin: '0 0 0.5rem',
                      lineHeight: 1.25
                    }}>
                      {mod.title}
                    </h3>

                    <p style={{
                      fontSize: '0.82rem',
                      color: '#143825',
                      opacity: 0.72,
                      lineHeight: 1.5,
                      margin: 0
                    }}>
                      {mod.description}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #E2DCD0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--arch-forest)' : 'var(--arch-charcoal)',
                    letterSpacing: '0.06em'
                  }}>
                    <span>{isSelected ? '● ACTIVE WORKSHEET' : 'SELECT TRACK'}</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════════════════════════════════════ ACTIVE FORM CONTAINER ════ */}
        <section className="arch-board-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header Strip */}
          <div style={{
            padding: '1.4rem 2rem',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2DCD0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                <span className="arch-tag">TRACK {currentModule.num}</span>
                <span style={{ fontSize: '0.72rem', color: '#143825', opacity: 0.6, letterSpacing: '0.06em' }}>
                  {currentModule.category}
                </span>
              </div>

              <h2 style={{
                fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
                fontSize: '1.35rem',
                fontWeight: 600,
                color: '#143825',
                margin: 0
              }}>
                {currentModule.title} — Evaluation Worksheet
              </h2>
            </div>

            {/* External Form Link Button */}
            {currentModule.formUrl ? (
              <a
                href={currentModule.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="arch-action-btn"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Open Google Form In New Tab
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ) : null}
          </div>

          {/* Form Viewer Body */}
          {currentModule.embedUrl ? (
            <div style={{ position: 'relative', minHeight: '840px', background: '#FAF7F0' }}>
              {iframeLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FAF7F0',
                  zIndex: 5,
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(26, 56, 43, 0.15)',
                    borderTopColor: '#143825',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <div style={{ fontSize: '0.85rem', color: '#143825', fontWeight: 600 }}>
                    Loading {currentModule.title} Form…
                  </div>
                </div>
              )}

              <iframe
                src={currentModule.embedUrl}
                width="100%"
                height="920"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                style={{ display: 'block', border: 'none', background: '#FFFFFF' }}
                title={`${currentModule.title} User Feedback`}
                onLoad={() => setIframeLoading(false)}
              >
                Loading Evaluation Form…
              </iframe>
            </div>
          ) : (
            <div style={{
              padding: '5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                background: 'rgba(20, 56, 37, 0.06)',
                color: '#143825',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentModule.icon}
              </div>

              <div style={{ maxWidth: '460px' }}>
                <h3 style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 600, color: '#143825', marginBottom: '0.5rem' }}>
                  {currentModule.title} Worksheet Ready
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#143825', opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
                  The dedicated research evaluation form for Track {currentModule.num} is configured and ready for responses.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
