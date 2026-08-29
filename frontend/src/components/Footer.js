"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ position: 'relative', zIndex: 10, width: '100%' }}>
      {/* ═════════════════════ PLATFORM ARCHITECTURE BANNER ════ */}
      <section style={{
        background: 'linear-gradient(135deg, #091F14 0%, #0D2E1E 50%, #06190E 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        padding: '4.5rem 2.5rem 4rem',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Wireframe Grid and Constellation Background Overlays */}
        <div style={{
          position: 'absolute',
          left: '-50px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '380px',
          height: '240px',
          opacity: 0.18,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #65D28A 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />

        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '360px',
          height: '240px',
          opacity: 0.15,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #65D28A 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }} />

        <div style={{ maxWidth: '1440px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 5 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#65D28A',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            BUILT FOR A SUSTAINABLE FUTURE
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 0.8rem',
            letterSpacing: '-0.02em'
          }}>
            GreenConstructAI Platform Architecture
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: '0.92rem',
            color: '#B5D1BF',
            maxWidth: '720px',
            margin: '0 auto 3rem',
            lineHeight: 1.65,
            fontWeight: 400
          }}>
            Four intelligent systems working together to deliver accurate, sustainable,
            and code-compliant construction decision support.
          </p>

          {/* 4 Feature Badges in 1 Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.2rem',
            maxWidth: '1080px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '1.1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(101, 210, 138, 0.15)', color: '#65D28A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk' }}>AI POWERED</div>
                <div style={{ fontSize: '0.7rem', color: '#9AB8A3' }}>Advanced ML models</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '1.1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(101, 210, 138, 0.15)', color: '#65D28A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2c2.5 3 4 6.5 4 10"/><path d="M12 2C9.5 5 8 8.5 8 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk' }}>SUSTAINABLE</div>
                <div style={{ fontSize: '0.7rem', color: '#9AB8A3' }}>Green building focused</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '1.1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(101, 210, 138, 0.15)', color: '#65D28A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk' }}>CODE COMPLIANT</div>
                <div style={{ fontSize: '0.7rem', color: '#9AB8A3' }}>Sri Lanka Standards</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '1.1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(101, 210, 138, 0.15)', color: '#65D28A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk' }}>INTEGRATED</div>
                <div style={{ fontSize: '0.7rem', color: '#9AB8A3' }}>All-in-one platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════ FOOTER LINKS & DISCLAIMER ════ */}
      <div style={{
        padding: '3.5rem 2.5rem 2rem',
        borderTop: '1px solid #BDCEBF',
        background: '#C7D7CA'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2.5rem' }}>
            {/* Brand Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '420px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', fontFamily: 'Space Grotesk', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#1E5438' }}>GREEN</span>
                <span style={{ color: '#18251F' }}>CONSTRUCT</span>
                <span style={{ color: '#4A7A5C' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#18251F', fontWeight: 700, lineHeight: 1.5 }}>
                Intelligent Construction Decision Support for Sri Lanka
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4A5E52', marginTop: '0.2rem', lineHeight: 1.6 }}>
                Integrating plan analysis, sustainable materials, green building pre-assessment, and fire safety compliance into one integrated decision-support platform.
              </div>
            </div>

            {/* Navigation Links Column */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E5438', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk' }}>
                  System Modules
                </div>
                <Link href="/" style={{ color: '#4A5E52', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Home</Link>
                <Link href="/plan-analyzer" style={{ color: '#4A5E52', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Building Plan Analyzer</Link>
                <Link href="/materials" style={{ color: '#4A5E52', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Material Recommendations</Link>
                <Link href="/green-assessment" style={{ color: '#4A5E52', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Green Building Pre-Assessment</Link>
                <Link href="/fire-safety" style={{ color: '#4A5E52', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Fire-Safety Compliance</Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E5438', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk' }}>
                  Project Analytics
                </div>
                <Link href="/history" style={{ color: '#42554A', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Recommendation History</Link>
                <Link href="/plan-analyzer" style={{ color: '#42554A', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Plan Audit Tool</Link>
              </div>
            </div>
          </div>

          {/* Academic Disclaimer & Copyright */}
          <div style={{
            borderTop: '1px solid #C4CFC6',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: '#4A5E52'
          }}>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4A5E52' }}>
              <strong style={{ color: '#18251F' }}>Academic Disclaimer:</strong> GreenConstructAI is an academic decision-support platform intended for preliminary analysis and does not replace professional architectural, engineering, regulatory, quantity surveying, or safety certification.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ color: '#4A5E52', fontWeight: 600 }}>© 2026 GREENCONSTRUCTAI · Academic Research Project</span>
              <div style={{ display: 'flex', gap: '1rem', color: '#4A5E52', fontWeight: 600 }}>
                <span>SLS 134 / SLS 139 Framework</span>
                <span>•</span>
                <span>14 Sri Lankan Micro-Climate Zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
