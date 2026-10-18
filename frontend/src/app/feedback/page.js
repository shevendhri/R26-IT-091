"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const FEEDBACK_MODULES = [
  {
    id: 1,
    num: "01",
    title: "Building Plan Analyzer",
    shortTitle: "Plan Analyzer",
    category: "SPATIAL & REGULATORY AUDIT",
    description: "Floor plan interpretation, room dimensioning, setbacks, and UDA compliance verification.",
    accent: "#245D8C",
    accentLight: "#C8DDF0",
    accentBg: "linear-gradient(135deg, #FFFFFF 45%, #E2EEF8 100%)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?usp=header",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?embedded=true",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    accent: "#1E5438",
    accentLight: "#C6E2CD",
    accentBg: "linear-gradient(135deg, #FFFFFF 45%, #DEEFE2 100%)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdDr5VrYMSK1rY-kMCD5LRCFD6NDlJXLA5nRAGruQrSihD5Rw/viewform?usp=publish-editor",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdDr5VrYMSK1rY-kMCD5LRCFD6NDlJXLA5nRAGruQrSihD5Rw/viewform?embedded=true",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    accent: "#3E7452",
    accentLight: "#C6E5CF",
    accentBg: "linear-gradient(135deg, #FFFFFF 45%, #DCF2E2 100%)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc7QqG-Z1sZGVqL9zpr1HvaUvfoKNi190mfSz2z5Dpchue0Xw/viewform?usp=header",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc7QqG-Z1sZGVqL9zpr1HvaUvfoKNi190mfSz2z5Dpchue0Xw/viewform?embedded=true",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    accent: "#C0542C",
    accentLight: "#F2D4C7",
    accentBg: "linear-gradient(135deg, #FFFFFF 45%, #F9E7E0 100%)",
    status: "ACTIVE",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdqeQ-Ky_TN2jfipHPoT9Y19rU4DznfM4jEaUEyWnxyXNmXrA/viewform?usp=publish-editor",
    embedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdqeQ-Ky_TN2jfipHPoT9Y19rU4DznfM4jEaUEyWnxyXNmXrA/viewform?embedded=true",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <div style={{ minHeight: '100vh', background: '#E1E9E2', color: '#14221B', fontFamily: 'Inter, sans-serif' }}>
      <Header />

      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '3.5rem 1.5rem 5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        {/* ═════════════════════════════════════ HERO BANNER ════ */}
        <section style={{
          background: 'linear-gradient(135deg, #FFFFFF 60%, #E8F1E9 100%)',
          border: '1px solid #BDCEBF',
          borderTop: '4px solid #1E5438',
          borderRadius: '20px',
          padding: '2.2rem 2.5rem',
          boxShadow: '0 4px 18px rgba(20, 34, 27, 0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(101, 210, 138, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#CDE2D2', border: '1px solid rgba(30, 84, 56, 0.25)', borderRadius: '20px', padding: '4px 14px', marginBottom: '1rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1E5438' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E5438', letterSpacing: '0.08em', fontFamily: 'Space Grotesk' }}>
              STAKEHOLDER & USER EVALUATION
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
            fontWeight: 800,
            color: '#14221B',
            margin: '0 0 0.6rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            GreenConstructAI User Feedback Hub
          </h1>

          <p style={{
            fontSize: '0.92rem',
            color: '#42554A',
            maxWidth: '780px',
            margin: 0,
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            Select a system module below to provide targeted evaluation feedback. Each feedback form is tailored to assess AI accuracy, code compliance, decision usability, and engineering reliability.
          </p>
        </section>

        {/* ═════════════════════════════════════ 4 MODULE SELECTOR CARDS ════ */}
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.2rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E5438', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
              Select System Module to Evaluate
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D8174', fontWeight: 600 }}>
              Showing 4 Specialized Evaluation Tracks
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
                  style={{
                    background: mod.accentBg,
                    borderTop: `4px solid ${mod.accent}`,
                    borderRight: isSelected ? `2px solid ${mod.accent}` : '1px solid #BDCEBF',
                    borderBottom: isSelected ? `2px solid ${mod.accent}` : '1px solid #BDCEBF',
                    borderLeft: isSelected ? `2px solid ${mod.accent}` : '1px solid #BDCEBF',
                    borderRadius: '16px',
                    padding: '1.4rem',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: isSelected
                      ? `0 8px 24px rgba(20, 34, 27, 0.12), 0 0 0 3px ${mod.accentLight}`
                      : '0 3px 12px rgba(20, 34, 27, 0.05)',
                    transform: isSelected ? 'translateY(-3px)' : 'none',
                    transition: 'all 0.22s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px'
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: mod.accent,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 3px 10px rgba(0,0,0,0.15)`
                      }}>
                        {mod.icon}
                      </div>

                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: mod.status === 'ACTIVE' ? mod.accentLight : '#E8F1E9',
                        color: mod.status === 'ACTIVE' ? mod.accent : '#6D8174',
                        border: `1px solid ${mod.status === 'ACTIVE' ? mod.accent : '#BDCEBF'}`,
                        fontFamily: 'Space Grotesk'
                      }}>
                        ● {mod.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: mod.accent, letterSpacing: '0.08em', fontFamily: 'Space Grotesk', marginBottom: '0.2rem' }}>
                      MODULE {mod.num}
                    </div>

                    <h3 style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#14221B',
                      margin: '0 0 0.5rem',
                      lineHeight: 1.25
                    }}>
                      {mod.title}
                    </h3>

                    <p style={{
                      fontSize: '0.78rem',
                      color: '#42554A',
                      lineHeight: 1.5,
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {mod.description}
                    </p>
                  </div>

                  {/* Select Indicator */}
                  <div style={{
                    marginTop: '1.2rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: mod.accent,
                    fontFamily: 'Space Grotesk'
                  }}>
                    <span>{isSelected ? '✓ SELECTED MODULE' : 'CLICK TO EVALUATE'}</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════════════════════════════════════ ACTIVE FORM CONTAINER ════ */}
        <section style={{
          background: '#FFFFFF',
          border: `1px solid #BDCEBF`,
          borderTop: `4px solid ${currentModule.accent}`,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 6px 24px rgba(20, 34, 27, 0.07)'
        }}>
          {/* Header Strip */}
          <div style={{
            padding: '1.6rem 2rem',
            background: 'linear-gradient(180deg, #F8FAF9 0%, #EEF4F0 100%)',
            borderBottom: '1px solid #BDCEBF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                <span style={{
                  background: currentModule.accentLight,
                  color: currentModule.accent,
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk'
                }}>
                  MODULE {currentModule.num}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#6D8174', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
                  {currentModule.category}
                </span>
              </div>

              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#14221B',
                margin: 0
              }}>
                {currentModule.title} — Evaluation Form
              </h2>
            </div>

            {/* External Form Link Button */}
            {currentModule.formUrl ? (
              <a
                href={currentModule.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: currentModule.accent,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem 1.4rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease'
                }}
              >
                Open in Google Forms
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ) : null}
          </div>

          {/* Form Viewer Body */}
          {currentModule.embedUrl ? (
            <div style={{ position: 'relative', minHeight: '820px', background: '#FFFFFF' }}>
              {iframeLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  zIndex: 5,
                  gap: '1rem'
                }}>
                  <div className="spinner" style={{ borderTopColor: currentModule.accent }} />
                  <div style={{ fontSize: '0.88rem', color: '#42554A', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                    Loading {currentModule.title} Feedback Form…
                  </div>
                </div>
              )}

              <iframe
                src={currentModule.embedUrl}
                width="100%"
                height="900"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                style={{ display: 'block', border: 'none' }}
                title={`${currentModule.title} User Feedback`}
                onLoad={() => setIframeLoading(false)}
              >
                Loading Evaluation Form…
              </iframe>
            </div>
          ) : (
            /* Coming Soon Placeholder for modules 2, 3, 4 */
            <div style={{
              padding: '5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1.2rem',
              background: '#FFFFFF'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: currentModule.accentLight,
                color: currentModule.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentModule.icon}
              </div>

              <div style={{ maxWidth: '460px' }}>
                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 800, color: '#14221B', marginBottom: '0.5rem' }}>
                  {currentModule.title} Form Integration Ready
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#42554A', lineHeight: 1.6, margin: 0 }}>
                  The dedicated evaluation form for <strong>Module {currentModule.num}</strong> is ready to be linked. Provide the Google Form URL and it will appear here automatically.
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
