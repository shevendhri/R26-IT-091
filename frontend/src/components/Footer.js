"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 10,
      width: '100%',
      background: 'linear-gradient(160deg, #0E2A1B 0%, #143825 60%, #1a4530 100%)',
      color: '#C8D9C8',
      fontFamily: 'Inter, sans-serif',
      borderTop: '3px solid #2D6A4A',
    }}>

      {/* Top accent line */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, #3F7656, #B85C43, #9A7557, #3F7656)',
        opacity: 0.7,
      }} />

      {/* ── Main Grid ── */}
      <div style={{
        padding: '3.5rem 2.5rem 2.5rem',
        maxWidth: '1600px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>

          {/* Brand Colophon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{
                fontFamily: 'Outfit, Space Grotesk, sans-serif',
                fontWeight: 900,
                fontSize: '1.3rem',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}>GREENCONSTRUCT</span>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                color: '#F4A27A',
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '0.12em',
                background: 'rgba(184,92,67,0.18)',
                padding: '1px 5px',
                borderRadius: '3px',
                border: '1px solid rgba(184,92,67,0.35)',
              }}>AI</span>
            </div>

            <p style={{
              fontSize: '0.78rem',
              color: '#8FB89F',
              lineHeight: 1.7,
              margin: 0,
              maxWidth: '340px',
            }}>
              Decision-support prototype for research purposes. Synthesizes SLS-referenced engineering rules, Sri Lankan climate zone profiles, and hybrid MCDM + Random Forest intelligence for sustainable building material selection.
            </p>

            {/* Status badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '0.25rem',
              fontSize: '0.67rem',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: '#A8D5B5',
              fontWeight: 700,
              background: 'rgba(63,118,86,0.15)',
              border: '1px solid rgba(63,118,86,0.3)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                background: '#4CAF72',
                borderRadius: '50%',
                boxShadow: '0 0 6px #4CAF72',
                flexShrink: 0,
              }} />
              Viva Evaluation Ready
            </div>

            {/* R26-IT-091 tag */}
            <div style={{
              fontSize: '0.65rem',
              fontFamily: 'Space Grotesk, monospace',
              color: '#5A8A6A',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}>
              R26-IT-091 · Dept. of Information Technology
            </div>
          </div>

          {/* Research Pipeline */}
          <div>
            <div style={{
              fontSize: '0.63rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C4965A',
              marginBottom: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ width: '16px', height: '1px', background: '#C4965A', display: 'inline-block' }} />
              Core Pipeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { href: '/', label: '01 / Project Command & Context' },
                { href: '/plan-analyzer', label: '02 / Blueprint & Spatial Extraction' },
                { href: '/materials/form', label: '03 / Materials Specification' },
                { href: '/fire-safety', label: '04 / Fire Safety Pre-Assessment' },
                { href: '/green-assessment', label: '05 / GREENSL Sustainability Rating' },
                { href: '/visualization', label: '06 / 3D Cutaway BIM Visualization' },
                { href: '/materials/report', label: '07 / Decision Report' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  color: '#A0C4AE',
                  fontSize: '0.76rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={e => e.currentTarget.style.color = '#A0C4AE'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Engineering Codes */}
          <div>
            <div style={{
              fontSize: '0.63rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C4965A',
              marginBottom: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ width: '16px', height: '1px', background: '#C4965A', display: 'inline-block' }} />
              Engineering Codes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.74rem', lineHeight: 1.5 }}>
              {[
                { code: 'SLS 107', desc: 'Ordinary Portland Cement' },
                { code: 'SLS 614', desc: 'Aggregates from Natural Sources' },
                { code: 'SLS 139 / BS 476', desc: 'Fire Tests on Building Materials' },
                { code: 'GREENSL', desc: 'Green Building Council Rating' },
                { code: 'UDA Regulations', desc: 'Western Province Gazette' },
              ].map(({ code, desc }) => (
                <div key={code} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ color: '#D4A76A', fontWeight: 700, fontSize: '0.71rem', fontFamily: 'Space Grotesk' }}>{code}</span>
                  <span style={{ color: '#7AAA8A', fontSize: '0.72rem' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Disclaimer */}
          <div>
            <div style={{
              fontSize: '0.63rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C4965A',
              marginBottom: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ width: '16px', height: '1px', background: '#C4965A', display: 'inline-block' }} />
              Disclaimer
            </div>
            <p style={{
              fontSize: '0.73rem',
              color: '#7AAA8A',
              lineHeight: 1.75,
              margin: '0 0 1rem',
            }}>
              This platform provides <em style={{ color: '#A8D5B5' }}>preliminary engineering decision-support</em> for academic research and computational design exploration. Recommendations do not replace certified structural engineering calculations, licensed architectural sign-offs, or formal statutory authority approvals.
            </p>

            {/* University tag */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.68rem',
              color: '#6A9A7A',
              lineHeight: 1.5,
            }}>
              <div style={{ color: '#A8C8B0', fontWeight: 700, marginBottom: '2px', fontFamily: 'Space Grotesk' }}>Final Year Dissertation</div>
              <div>Faculty of Computing · NSBM Green University</div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '0.70rem', color: '#4A7A5A', letterSpacing: '0.02em' }}>
            © 2026 GreenConstructAI Research Group · All rights reserved for academic evaluation purposes
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/feedback" style={{
              color: '#4CAF72',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.74rem',
              fontFamily: 'Space Grotesk',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.02em',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4CAF72'}
            >
              Submit Research Feedback →
            </Link>
            <Link href="/history" style={{
              color: '#4A7A5A',
              textDecoration: 'none',
              fontSize: '0.72rem',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#A0C4AE'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A7A5A'}
            >
              Project History
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
