"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GreenAssessmentPage() {
  const [showFeedbackIframe, setShowFeedbackIframe] = useState(false);

  const GREEN_ASSESSMENT_FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc7QqG-Z1sZGVqL9zpr1HvaUvfoKNi190mfSz2z5Dpchue0Xw/viewform?usp=header";
  const GREEN_ASSESSMENT_EMBED_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc7QqG-Z1sZGVqL9zpr1HvaUvfoKNi190mfSz2z5Dpchue0Xw/viewform?embedded=true";

  return (
    <div style={{ minHeight: '100vh', background: '#D9E6DC', color: '#14221B', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Module Header Card with Image Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(36, 92, 67, 0.16)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(24, 37, 31, 0.06), 0 18px 50px rgba(24, 37, 31, 0.08)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
            <img src="/green_architecture.jpg" alt="Green Building Architecture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.3) 60%, transparent 100%)' }} />
            
            <div style={{ position: 'absolute', top: '1.5rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: '#DDE8DE',
                color: '#245C43',
                border: '1px solid rgba(36, 92, 67, 0.28)',
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Space Grotesk'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#245C43', display: 'inline-block' }} />
                SUSTAINABILITY INTELLIGENCE
              </span>
              <span style={{ fontSize: '0.75rem', color: '#526158', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                SYSTEM MODULE 03
              </span>
            </div>
          </div>

          <div style={{ padding: '0.5rem 2.5rem 2.5rem' }}>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 2.7rem)',
              fontWeight: 800,
              color: '#18251F',
              margin: '0 0 1rem',
              lineHeight: 1.15
            }}>
              Green Building Pre-Assessment Module
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#245C43',
              fontWeight: 700,
              margin: '0 0 1.5rem',
              lineHeight: 1.6,
              maxWidth: '780px'
            }}>
              Comprehensive pre-assessment framework for evaluating tropical climate building sustainability, embodied carbon, and environmental resilience.
            </p>

            <p style={{
              fontSize: '0.94rem',
              color: '#526158',
              margin: 0,
              lineHeight: 1.75,
              maxWidth: '820px',
              fontWeight: 500
            }}>
              Evaluate preliminary sustainability factors, passive solar cooling, daylight factor, embodied carbon metrics, and green building certification potential tailored to Sri Lanka&apos;s tropical climate context.
            </p>
          </div>
        </div>

        {/* Assessment Scope Section */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#245C43', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.6rem', fontFamily: 'Space Grotesk' }}>
            System Architecture & Scope
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, color: '#18251F', margin: '0 0 1.8rem' }}>
            Sustainability Assessment Dimensions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.4rem' }}>
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#245C43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                title: 'Energy Performance',
                desc: 'Passive cooling potential, solar orientation evaluation, and thermal envelope efficiency for Sri Lankan climate zones.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#245C43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10" />
                    <path d="M12 2c2.5 3 4 6.5 4 10" />
                    <path d="M12 2C9.5 5 8 8.5 8 12" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                ),
                title: 'Carbon Considerations',
                desc: 'Embodied carbon benchmarking for Sri Lankan building materials and structural assemblies.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#245C43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ),
                title: 'Daylight Potential',
                desc: 'Window-to-wall ratio analysis and natural daylight factor calculations to minimize operational lighting energy.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#245C43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                ),
                title: 'Water Efficiency',
                desc: 'Rainwater harvesting capacity and greywater recycling suitability based on local rainfall patterns.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#245C43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                ),
                title: 'GREENSL / SLS Alignment',
                desc: 'Preliminary rating alignment with Green Building Council Sri Lanka (GBCSL) standards.'
              }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: '#FFFFFF',
                border: '1px solid #C8D3CA',
                borderRadius: '16px',
                padding: '1.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                boxShadow: '0 4px 16px rgba(24, 37, 31, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.05rem', fontWeight: 700, color: '#18251F', margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#526158', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation Card */}
        <div style={{
          background: '#E3E9E2',
          border: '1px solid #C8D3CA',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#245C43', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', fontFamily: 'Space Grotesk' }}>
              GreenConstructAI Platform Navigation
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', fontWeight: 700, color: '#18251F' }}>
              Explore connected building plan intelligence and material recommendation systems.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/plan-analyzer" style={{
              background: '#245C43',
              color: '#ffffff',
              padding: '0.75rem 1.6rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textDecoration: 'none',
              fontFamily: 'Space Grotesk'
            }}>
              OPEN PLAN ANALYZER →
            </Link>
            <Link href="/materials" style={{
              background: '#FFFFFF',
              color: '#245C43',
              border: '1px solid #C8D3CA',
              padding: '0.75rem 1.6rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textDecoration: 'none',
              fontFamily: 'Space Grotesk'
            }}>
              VIEW MATERIALS →
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MODULE 03: DEDICATED USER EVALUATION & FEEDBACK SECTION
        ══════════════════════════════════════════════════════════════ */}
        <div style={{
          marginTop: '2.5rem',
          background: 'linear-gradient(135deg, #FFFFFF 50%, #DCF2E2 100%)',
          borderTop: '4px solid #3E7452',
          borderRight: '1px solid #BDCEBF',
          borderBottom: '1px solid #BDCEBF',
          borderLeft: '1px solid #BDCEBF',
          borderRadius: '20px',
          padding: '2rem 2.2rem',
          boxShadow: '0 4px 18px rgba(62, 116, 82, 0.08), 0 1px 3px rgba(20, 34, 27, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <span style={{
                  background: '#C6E5CF',
                  color: '#3E7452',
                  border: '1px solid rgba(62, 116, 82, 0.3)',
                  borderRadius: '20px',
                  padding: '3px 12px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  fontFamily: 'Space Grotesk'
                }}>
                  ● MODULE 03 EVALUATION
                </span>
                <span style={{ fontSize: '0.72rem', color: '#42554A', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  USER FEEDBACK
                </span>
              </div>

              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#14221B',
                margin: '0 0 0.5rem',
                lineHeight: 1.2
              }}>
                Green Building Pre-Assessment — User Feedback & Evaluation
              </h2>

              <p style={{
                fontSize: '0.86rem',
                color: '#42554A',
                lineHeight: 1.6,
                margin: 0,
                fontWeight: 500
              }}>
                Help us evaluate the Green Building Pre-Assessment module. Please share your insights on sustainability benchmarking, embodied carbon calculations, and GREENSL certification alignment.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowFeedbackIframe(prev => !prev)}
                style={{
                  background: '#FFFFFF',
                  color: '#3E7452',
                  border: '1.5px solid rgba(62, 116, 82, 0.35)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                {showFeedbackIframe ? 'Hide Embedded Form' : 'Fill Form on Page'}
              </button>

              <a
                href={GREEN_ASSESSMENT_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#3E7452',
                  color: '#FFFFFF',
                  border: '1px solid #3E7452',
                  borderRadius: '10px',
                  padding: '0.75rem 1.4rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(62, 116, 82, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                Open Google Form
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>

          {/* Embedded Google Form Iframe View */}
          {showFeedbackIframe && (
            <div style={{
              marginTop: '1.75rem',
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid rgba(62, 116, 82, 0.22)',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(20, 34, 27, 0.06)'
            }}>
              <div style={{
                padding: '0.75rem 1.25rem',
                background: '#DCF2E2',
                borderBottom: '1px solid rgba(62, 116, 82, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3E7452', fontFamily: 'Space Grotesk' }}>
                  Google Forms Live Evaluation Window
                </span>
                <button
                  type="button"
                  onClick={() => setShowFeedbackIframe(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#42554A',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  ✕ Close
                </button>
              </div>
              <iframe
                src={GREEN_ASSESSMENT_EMBED_URL}
                width="100%"
                height="800"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                style={{ display: 'block', border: 'none' }}
                title="Green Building Pre-Assessment Feedback Form"
              >
                Loading Feedback Form…
              </iframe>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
