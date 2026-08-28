"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const scrollToModules = (e) => {
    e.preventDefault();
    const target = document.getElementById('systems-grid');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', color: '#18251F', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        /* ── Hero Section ── */
        .hero-section {
          background: #F3F5F1;
          position: relative;
          overflow: hidden;
        }
        .hero-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 4.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        /* Hero subtle architectural decorations */
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(30, 84, 56, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30, 84, 56, 0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }
        .hero-radial-glow {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          background: radial-gradient(ellipse at center top, rgba(30, 84, 56, 0.09) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-geo-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
        }

        /* ── Module Cards Section ── */
        .modules-section {
          background: #E8EDE7;
          border-top: 1px solid #D5DED6;
          border-bottom: 1px solid #D5DED6;
          padding: 4rem 3rem 4.5rem;
        }
        .module-row-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.3rem;
          max-width: 1440px;
          margin: 0 auto;
        }
        @media (max-width: 1200px) {
          .module-row-grid { grid-template-columns: repeat(2, 1fr); }
          .modules-section { padding: 3rem 2rem 3.5rem; }
        }
        @media (max-width: 640px) {
          .module-row-grid { grid-template-columns: 1fr; }
          .modules-section { padding: 2.5rem 1.5rem 3rem; }
        }

        .mockup-module-card {
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 4px 12px rgba(24,37,31,0.05), 0 12px 32px rgba(24,37,31,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          min-height: 340px;
          border: 1px solid #D5DED6;
        }
        .card-plan-lp {
          background: linear-gradient(135deg, #FFFFFF 55%, #E7F0F7 100%);
          border-top: 4px solid #2F6FA3;
        }
        .card-mat-lp {
          background: linear-gradient(135deg, #FFFFFF 55%, #E7F0E9 100%);
          border-top: 4px solid #1E5438;
        }
        .card-green-lp {
          background: linear-gradient(135deg, #FFFFFF 55%, #EDF5EE 100%);
          border-top: 4px solid #4A7A5C;
        }
        .card-fire-lp {
          background: linear-gradient(135deg, #FFFFFF 55%, #F9EAE4 100%);
          border-top: 4px solid #C65D35;
        }
        .mockup-module-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(24,37,31,0.09), 0 20px 48px rgba(30,84,56,0.10);
        }

        /* ── How It Works Section ── */
        .hiw-section {
          background: #FFFFFF;
          border-bottom: 1px solid #D5DED6;
          padding: 4rem 3rem 4.5rem;
        }
        .hiw-container {
          max-width: 1440px;
          margin: 0 auto;
        }
        .hiw-flow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .hiw-flow { flex-direction: column; align-items: stretch; }
          .hiw-section { padding: 3rem 1.5rem 3.5rem; }
        }

        /* ── Platform Architecture Dark Section ── */
        .platform-arch-section {
          background: linear-gradient(135deg, #143C29 0%, #0F2B1E 60%, #091A10 100%);
          color: #FFFFFF;
          position: relative;
          overflow: hidden;
          padding: 5rem 3rem;
        }
        .platform-arch-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(143, 182, 156, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(143, 182, 156, 0.12) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
        .platform-arch-glow-left {
          position: absolute;
          left: -100px; top: 50%;
          transform: translateY(-50%);
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(30, 84, 56, 0.35) 0%, transparent 70%);
          pointer-events: none;
        }
        .platform-arch-glow-right {
          position: absolute;
          right: -80px; top: 50%;
          transform: translateY(-50%);
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(143, 182, 156, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .platform-arch-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
          text-align: center;
        }
        .platform-flow-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr;
          align-items: center;
          gap: 0;
          margin: 2.5rem auto 0;
          max-width: 1000px;
        }
        @media (max-width: 900px) {
          .platform-flow-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            max-width: 360px;
          }
          .platform-flow-arrow { display: none; }
        }

        /* ── Buttons ── */
        .btn-primary-dark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #1E5438;
          color: #FFFFFF;
          border: 1px solid #1E5438;
          border-radius: 10px;
          padding: 0.85rem 1.8rem;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          text-decoration: none;
          text-transform: uppercase;
          transition: all 0.22s ease;
          box-shadow: 0 4px 16px rgba(30, 84, 56, 0.28);
        }
        .btn-primary-dark:hover {
          background: #16422C;
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(30, 84, 56, 0.38);
        }

        .btn-secondary-white {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          color: #18251F;
          border: 1.5px solid #D5DED6;
          border-radius: 10px;
          padding: 0.85rem 1.8rem;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          text-decoration: none;
          text-transform: uppercase;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(24, 37, 31, 0.04);
        }
        .btn-secondary-white:hover {
          background: #F6F8F5;
          border-color: #1E5438;
          color: #1E5438;
          transform: translateY(-2px);
        }

        /* ── Section Header ── */
        .section-header-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          color: #1E5438;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════════════ HERO SECTION ════ */}
      <section className="hero-section">
        {/* Atmospheric decorations */}
        <div className="hero-grid" />
        <div className="hero-radial-glow" />
        {/* Subtle geometric SVG lines */}
        <svg className="hero-geo-lines" viewBox="0 0 1440 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
          <line x1="720" y1="0" x2="0" y2="500" stroke="#1E5438" strokeWidth="1"/>
          <line x1="720" y1="0" x2="1440" y2="500" stroke="#1E5438" strokeWidth="1"/>
          <line x1="360" y1="0" x2="0" y2="250" stroke="#1E5438" strokeWidth="0.5"/>
          <line x1="1080" y1="0" x2="1440" y2="250" stroke="#1E5438" strokeWidth="0.5"/>
          <rect x="610" y="120" width="220" height="260" rx="2" stroke="#1E5438" strokeWidth="0.75"/>
          <line x1="0" y1="200" x2="1440" y2="200" stroke="#1E5438" strokeWidth="0.4"/>
        </svg>

        <div className="hero-container">
          {/* Eyebrow badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#DDEBDF',
            border: '1px solid rgba(30, 84, 56, 0.28)',
            borderRadius: '100px',
            padding: '0.42rem 1.1rem',
            marginBottom: '1.8rem',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#1E5438',
            letterSpacing: '0.10em',
            textTransform: 'uppercase'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1E5438', flexShrink: 0 }} />
            Sri Lanka Integrated Construction Intelligence Platform
          </div>

          {/* Main Title */}
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#1E5438',
            margin: '0 0 0.8rem',
            textShadow: '0 2px 12px rgba(30, 84, 56, 0.08)'
          }}>
            GREENCONSTRUCT<span style={{ color: '#4A7A5C' }}>AI</span>
          </h1>

          {/* Accent bar */}
          <div style={{
            width: '72px',
            height: '4px',
            background: 'linear-gradient(90deg, #1E5438, #4A7A5C)',
            borderRadius: '2px',
            margin: '0 auto 1.6rem'
          }} />

          {/* Subtitle */}
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)',
            fontWeight: 700,
            color: '#18251F',
            lineHeight: 1.3,
            margin: '0 0 1.2rem',
            letterSpacing: '-0.015em'
          }}>
            Intelligent Decision Support for Sustainable Construction
          </h2>

          {/* Paragraph */}
          <p style={{
            fontSize: '0.95rem',
            color: '#536058',
            lineHeight: 1.75,
            fontWeight: 500,
            maxWidth: '720px',
            margin: '0 auto 2.4rem'
          }}>
            GreenConstructAI brings together intelligent building plan analysis, sustainable material recommendations,
            green building pre-assessment, and fire-safety compliance assessment into one integrated construction
            decision-support platform for Sri Lanka.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#systems-grid" onClick={scrollToModules} className="btn-primary-dark">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Explore Platform
            </a>
            <Link href="/plan-analyzer" className="btn-secondary-white">
              Analyze a Project
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ 4 MODULE CARDS ════ */}
      <section id="systems-grid" className="modules-section">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-header-label">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1E5438', display: 'inline-block' }} />
            Intelligent System Modules
          </div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            fontWeight: 800,
            color: '#18251F',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Four Integrated Intelligence Systems
          </h2>
        </div>

        <div className="module-row-grid">
          {/* Card 1: Building Plan Analyzer */}
          <div className="mockup-module-card card-plan-lp">
            <div style={{
              padding: '1.6rem 1.5rem',
              backgroundImage: 'url("/blueprint_desk.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'luminosity',
              opacity: 0.08,
              position: 'absolute',
              inset: 0,
              borderRadius: '18px'
            }} />
            <div style={{ position: 'relative', zIndex: 2, padding: '1.6rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#2F6FA3', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(47, 111, 163, 0.28)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2F6FA3', fontFamily: 'Space Grotesk' }}>01</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk', lineHeight: 1.2 }}>BUILDING PLAN ANALYZER</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#536058', lineHeight: 1.6, fontWeight: 500, margin: '0 0 1.5rem' }}>
                  Analyze building geometry, spaces, and project data with intelligent insights.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(47, 111, 163, 0.18)' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2F6FA3', background: '#D0E4F2', padding: '3px 10px', borderRadius: '20px' }}>
                  ● ACTIVE
                </span>
                <Link href="/plan-analyzer" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2F6FA3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Space Grotesk' }}>
                  OPEN ANALYZER →
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Material Recommendations */}
          <div className="mockup-module-card card-mat-lp">
            <div style={{ position: 'relative', zIndex: 2, padding: '1.6rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#1E5438', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(30, 84, 56, 0.28)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E5438', fontFamily: 'Space Grotesk' }}>02</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk', lineHeight: 1.2 }}>MATERIAL RECOMMENDATIONS</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#536058', lineHeight: 1.6, fontWeight: 500, margin: '0 0 1.5rem' }}>
                  Get AI-powered sustainable material recommendations based on performance, cost and availability.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(30, 84, 56, 0.18)' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1E5438', background: '#D4E8D8', padding: '3px 10px', borderRadius: '20px' }}>
                  ● ACTIVE
                </span>
                <Link href="/materials" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1E5438', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Space Grotesk' }}>
                  VIEW RECOMMENDATIONS →
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Green Building Pre-Assessment */}
          <div className="mockup-module-card card-green-lp">
            <div style={{ position: 'relative', zIndex: 2, padding: '1.6rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#4A7A5C', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(74, 122, 92, 0.28)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2c2.5 3 4 6.5 4 10"/><path d="M12 2C9.5 5 8 8.5 8 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4A7A5C', fontFamily: 'Space Grotesk' }}>03</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk', lineHeight: 1.2 }}>GREEN BUILDING PRE-ASSESSMENT</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#536058', lineHeight: 1.6, fontWeight: 500, margin: '0 0 1.5rem' }}>
                  Pre-assess your project for green building compliance and sustainability metrics.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(74, 122, 92, 0.18)' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#4A7A5C', background: '#D0E8D6', padding: '3px 10px', borderRadius: '20px' }}>
                  ● INTEGRATION READY
                </span>
                <Link href="/green-assessment" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4A7A5C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Space Grotesk' }}>
                  COMING SOON →
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Fire-Safety Compliance */}
          <div className="mockup-module-card card-fire-lp">
            <div style={{ position: 'relative', zIndex: 2, padding: '1.6rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#C65D35', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(198, 93, 53, 0.28)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C65D35', fontFamily: 'Space Grotesk' }}>04</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk', lineHeight: 1.2 }}>FIRE-SAFETY COMPLIANCE</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#536058', lineHeight: 1.6, fontWeight: 500, margin: '0 0 1.5rem' }}>
                  Ensure fire-safety compliance with intelligent checks and code-based validation.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(198, 93, 53, 0.18)' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#C65D35', background: '#F2D8CC', padding: '3px 10px', borderRadius: '20px' }}>
                  ● INTEGRATION READY
                </span>
                <Link href="/fire-safety" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#C65D35', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Space Grotesk' }}>
                  COMING SOON →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════ HOW IT WORKS ════ */}
      <section className="hiw-section">
        <div className="hiw-container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-header-label">
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1E5438', display: 'inline-block' }} />
              Workflow
            </div>
            <h2 style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              fontWeight: 800,
              color: '#18251F',
              letterSpacing: '-0.015em',
              textTransform: 'uppercase',
              fontFamily: 'Space Grotesk, sans-serif',
              margin: 0
            }}>
              How It Works
            </h2>
          </div>

          <div className="hiw-flow">
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px', background: '#F3F5F1', borderRadius: '12px', padding: '1rem 1.1rem', border: '1px solid #D5DED6' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#DDEBDF', color: '#1E5438', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(30,84,56,0.18)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#18251F', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>PROJECT INPUT</div>
                <div style={{ fontSize: '0.74rem', color: '#536058', fontWeight: 500, lineHeight: 1.4 }}>Upload plans and project information</div>
              </div>
            </div>

            <div style={{ color: '#B9C8BC', fontSize: '1.4rem', padding: '0 0.5rem', flexShrink: 0 }}>→</div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px', background: '#EAF0F5', borderRadius: '12px', padding: '1rem 1.1rem', border: '1px solid rgba(47,111,163,0.18)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#D0E4F2', color: '#2F6FA3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(47,111,163,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#18251F', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>PLAN ANALYSIS</div>
                <div style={{ fontSize: '0.74rem', color: '#536058', fontWeight: 500, lineHeight: 1.4 }}>AI analyzes building geometry and data</div>
              </div>
            </div>

            <div style={{ color: '#B9C8BC', fontSize: '1.4rem', padding: '0 0.5rem', flexShrink: 0 }}>→</div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px', background: '#EDF5EE', borderRadius: '12px', padding: '1rem 1.1rem', border: '1px solid rgba(74,122,92,0.18)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#D0E8D6', color: '#4A7A5C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(74,122,92,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2c2.5 3 4 6.5 4 10"/><path d="M12 2C9.5 5 8 8.5 8 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#18251F', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>INTELLIGENT ASSESSMENT</div>
                <div style={{ fontSize: '0.74rem', color: '#536058', fontWeight: 500, lineHeight: 1.4 }}>Multi-domain AI engines evaluate</div>
              </div>
            </div>

            <div style={{ color: '#B9C8BC', fontSize: '1.4rem', padding: '0 0.5rem', flexShrink: 0 }}>→</div>

            {/* Step 4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px', background: '#F3F5F1', borderRadius: '12px', padding: '1rem 1.1rem', border: '1px solid #D5DED6' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#DDEBDF', color: '#1E5438', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(30,84,56,0.18)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#18251F', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>INTEGRATED INSIGHTS</div>
                <div style={{ fontSize: '0.74rem', color: '#536058', fontWeight: 500, lineHeight: 1.4 }}>Actionable recommendations & compliance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PLATFORM ARCHITECTURE DARK SECTION ════ */}
      <section className="platform-arch-section">
        <div className="platform-arch-grid" />
        <div className="platform-arch-glow-left" />
        <div className="platform-arch-glow-right" />

        <div className="platform-arch-inner">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '0.68rem', fontWeight: 800, color: '#8FB69C',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '0.75rem', fontFamily: 'Space Grotesk, sans-serif'
          }}>
            BUILT FOR A SUSTAINABLE FUTURE
          </div>

          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
            fontWeight: 800,
            color: '#F4F7F3',
            margin: '0 0 0.8rem',
            letterSpacing: '-0.02em'
          }}>
            Integrated Decision Support Architecture
          </h2>

          <p style={{
            fontSize: '0.92rem', color: '#9AB8A3',
            maxWidth: '680px', margin: '0 auto 3rem',
            lineHeight: 1.65, fontWeight: 400
          }}>
            Four intelligent systems working in sequence to deliver accurate, sustainable,
            and code-compliant construction decisions across Sri Lanka&apos;s unique climate zones.
          </p>

          {/* Platform flow */}
          <div className="platform-flow-grid">
            {[
              { icon: '📐', label: 'PLAN INTELLIGENCE', sub: 'Geometry & Blueprint Analysis', color: '#2F6FA3', bg: 'rgba(47,111,163,0.15)' },
              null,
              { icon: '🧱', label: 'MATERIAL INTELLIGENCE', sub: 'Sustainable Material Selection', color: '#4A7A5C', bg: 'rgba(74,122,92,0.15)' },
              null,
              { icon: '🌿', label: 'SUSTAINABILITY ASSESSMENT', sub: 'Green Building Evaluation', color: '#8FB69C', bg: 'rgba(143,182,156,0.15)' },
              null,
              { icon: '🛡', label: 'FIRE-SAFETY ASSESSMENT', sub: 'Code Compliance Validation', color: '#C65D35', bg: 'rgba(198,93,53,0.18)' },
              null,
              { icon: '✦', label: 'INTEGRATED DECISION SUPPORT', sub: 'Unified Engineering Intelligence', color: '#F4F7F3', bg: 'rgba(255,255,255,0.10)', highlight: true }
            ].map((item, i) => {
              if (item === null) {
                return (
                  <div key={i} className="platform-flow-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(143,182,156,0.5)', fontSize: '1.2rem' }}>→</div>
                );
              }
              return (
                <div key={i} style={{
                  background: item.bg,
                  border: `1px solid ${item.highlight ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  padding: '1rem 0.9rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: item.color, letterSpacing: '0.06em', fontFamily: 'Space Grotesk', marginBottom: '0.2rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.63rem', color: 'rgba(164,196,176,0.8)', lineHeight: 1.4 }}>{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
