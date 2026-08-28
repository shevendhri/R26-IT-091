"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GreenAssessmentPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#EDF5EE', color: '#18251F', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
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
      </main>

      <Footer />
    </div>
  );
}
