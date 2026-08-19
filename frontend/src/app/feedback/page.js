"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const EVALUATION_MODULES = [
  {
    id: 1,
    title: "Material Recommendation & Blueprint Generation",
    description: "Hybrid AI and SLS-compliant multi-criteria specification of structural and finishing materials.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    accent: "#10b981",
  },
  {
    id: 2,
    title: "GREENSL Certification Pre-Assessment",
    description: "Sustainability benchmarking, embodied carbon scoring, and green building standard compatibility.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    accent: "#34d399",
  },
  {
    id: 3,
    title: "Fire-Safety Compliance Assessment",
    description: "Automated verification against Sri Lankan building fire regulations and material combustibility standards.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    accent: "#f59e0b",
  },
  {
    id: 4,
    title: "Floor-Plan Regulatory Compliance Checking",
    description: "Computer vision spatial auditing for setbacks, room ventilation, UDA regulations, and gazette rules.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    accent: "#38bdf8",
  },
];

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc-Zv2dc--1lVOG33Y0KDSEVycfLpYHllZbgzNfH0Wf27j8NQ/viewform?embedded=true";
const GOOGLE_FORM_DIRECT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc-Zv2dc--1lVOG33Y0KDSEVycfLpYHllZbgzNfH0Wf27j8NQ/viewform?usp=publish-editor";

export default function FeedbackPage() {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black, #070b13)', color: '#f0f4f8', position: 'relative' }}>
      {/* Visual background layers */}
      <div className="premium-bg">
        <div className="gradient-mesh" />
        <div className="blueprint-grid" />
      </div>

      <Header />

      <main style={{
        padding: '2.5rem 1.5rem 4rem',
        maxWidth: '980px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        {/* Page Header Card */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(15, 26, 46, 0.95), rgba(12, 20, 32, 0.95))',
          border: '1px solid #1e2d48',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle accent glow top border */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #10b981, #38bdf8, transparent)'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="telemetry-badge telemetry-badge-info" style={{ letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                  ACADEMIC RESEARCH & SYSTEM EVALUATION
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                User <span style={{ color: '#10b981' }}>Feedback</span>
              </h1>

              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '0.85rem'
              }}>
                Help us evaluate and improve GreenConstructAI.
              </div>

              <p style={{
                color: '#8fa3bc',
                fontSize: '0.86rem',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: '780px'
              }}>
                Your feedback helps us evaluate the usability and effectiveness of GreenConstructAI&apos;s building decision-support functions. This questionnaire is intended for academic research and system evaluation.
              </p>
            </div>

            <a
              href={GOOGLE_FORM_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #2a3d5c',
                background: '#0c1420',
                color: '#94a3b8',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Open Google Form in a new tab if required"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open in New Window
            </a>
          </div>
        </section>

        {/* Academic Scope: 4 Major Decision-Support Functions */}
        <section style={{
          background: 'rgba(15, 26, 46, 0.5)',
          border: '1px solid #1e2d48',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#38bdf8',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
            Platform Scope Evaluated in this Questionnaire
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.85rem'
          }}>
            {EVALUATION_MODULES.map((mod) => (
              <div
                key={mod.id}
                style={{
                  background: '#090d16',
                  border: '1px solid #1a2540',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ color: mod.accent, flexShrink: 0 }}>
                    {mod.icon}
                  </div>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#f0f4f8',
                    lineHeight: 1.3
                  }}>
                    {mod.title}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: '#64748b',
                  lineHeight: 1.45
                }}>
                  {mod.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Embedded Google Form Card */}
        <section style={{
          background: '#0b111e',
          border: '1px solid #1e2d48',
          borderRadius: '12px',
          padding: '0.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '920px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Iframe Loading Placeholder */}
          {!iframeLoaded && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              background: '#0b111e',
              zIndex: 5,
              padding: '2rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #1e293b',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f4f8', fontFamily: 'Space Grotesk' }}>
                  Loading System Evaluation Questionnaire...
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Connecting securely to Google Form service
                </div>
              </div>
            </div>
          )}

          <iframe
            src={GOOGLE_FORM_URL}
            title="GreenConstructAI User Evaluation Form"
            width="100%"
            height="1250"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            onLoad={() => setIframeLoaded(true)}
            style={{
              width: '100%',
              minHeight: '920px',
              border: 'none',
              borderRadius: '8px',
              background: '#ffffff',
              display: 'block'
            }}
          >
            Loading form...
          </iframe>
        </section>

        {/* Evaluation Footer Note */}
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          fontSize: '0.82rem',
          color: '#8fa3bc',
          borderTop: '1px solid #172034'
        }}>
          Thank you for participating in the GreenConstructAI system evaluation.
        </div>
      </main>

      <Footer />
    </div>
  );
}
