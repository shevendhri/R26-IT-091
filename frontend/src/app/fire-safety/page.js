"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FireSafetyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F3F5F1', color: '#18251F', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Module Header Card with Image Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(181, 101, 77, 0.3)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(24, 37, 31, 0.06), 0 18px 50px rgba(24, 37, 31, 0.08)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
            <img src="/fire_safety_architecture.jpg" alt="Fire Safety Structural Compliance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.3) 60%, transparent 100%)' }} />
            
            <div style={{ position: 'absolute', top: '1.5rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: 'rgba(199, 122, 61, 0.12)',
                color: '#C77A3D',
                border: '1px solid rgba(199, 122, 61, 0.3)',
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
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C77A3D', display: 'inline-block' }} />
                SAFETY INTELLIGENCE
              </span>
              <span style={{ fontSize: '0.75rem', color: '#526158', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                SYSTEM MODULE 04
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
              Fire-Safety Compliance Assessment
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#B5654D',
              fontWeight: 700,
              margin: '0 0 1.5rem',
              lineHeight: 1.6,
              maxWidth: '780px'
            }}>
              Preliminary structural fire-resistance rating, egress travel distance, and fire-safety compliance evaluation framework.
            </p>

            <p style={{
              fontSize: '0.94rem',
              color: '#526158',
              margin: 0,
              lineHeight: 1.75,
              maxWidth: '820px',
              fontWeight: 500
            }}>
              Perform preliminary evaluations of fire-safety considerations, structural fire-resistance requirements, egress travel distances, and compliance checks according to Sri Lankan building standards.
            </p>
          </div>
        </div>

        {/* Assessment Scope Section */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5654D', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.6rem', fontFamily: 'Space Grotesk' }}>
            System Architecture & Scope
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, color: '#18251F', margin: '0 0 1.8rem' }}>
            Fire Safety Assessment Dimensions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.4rem' }}>
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B5654D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'Fire Resistance Ratings',
                desc: 'Structural element fire-rating requirements based on building occupancy type and height.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B5654D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                ),
                title: 'Means of Egress',
                desc: 'Maximum travel distance, exit door width, and staircase capacity compliance checking.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B5654D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="12" y1="3" x2="12" y2="21" />
                  </svg>
                ),
                title: 'Compartmentation',
                desc: 'Fire barrier and smoke compartment division rules for multi-story structures.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B5654D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ),
                title: 'Fire Suppression & Detection',
                desc: 'Preliminary sprinkler, riser, and alarm coverage requirements for Sri Lankan regulations.'
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B5654D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
                title: 'National Building Code',
                desc: 'Alignment with Sri Lanka Fire Service Department guidelines and Urban Development Authority (UDA) regulations.'
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
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5654D', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem', fontFamily: 'Space Grotesk' }}>
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
