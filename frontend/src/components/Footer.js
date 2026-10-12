"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 10,
      width: '100%',
      background: '#FAF7F0',
      borderTop: '1px solid #E2DCD0',
      color: '#252823',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Main Colophon & Module Directory ── */}
      <div style={{
        padding: '2.5rem 2rem 2rem',
        maxWidth: '1600px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', marginBottom: '2rem' }}>
          {/* Brand Colophon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
            }}>
              <span style={{
                fontFamily: 'Outfit, Space Grotesk',
                fontWeight: 900,
                fontSize: '1.15rem',
                color: '#173A2B',
                letterSpacing: '-0.02em',
              }}>GREENCONSTRUCT</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#B85C43',
                fontFamily: 'Space Grotesk',
                letterSpacing: '0.12em',
              }}>AI</span>
            </div>

            <p style={{
              fontSize: '0.78rem',
              color: '#687068',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '380px',
            }}>
              Decision-support prototype for research purposes. Synthesizes SLS-referenced engineering rules, Sri Lankan climate zone profiles, and hybrid MCDM + Random Forest intelligence for sustainable building material selection.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '0.25rem',
              fontSize: '0.68rem',
              fontFamily: 'Space Grotesk',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: '#173A2B',
              fontWeight: 700,
            }}>
              <span style={{ width: '6px', height: '6px', background: '#3F7656', borderRadius: '50%' }} />
              Undergraduate Dissertation · Viva Evaluation Ready
            </div>
          </div>

          {/* Research Pipeline */}
          <div>
            <div style={{
              fontSize: '0.68rem',
              fontFamily: 'Space Grotesk',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#9A7557',
              marginBottom: '0.85rem',
            }}>
              Core Research Pipeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                01 / Project Command &amp; Context Brief
              </Link>
              <Link href="/plan-analyzer" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                02 / Blueprint Geometry &amp; Spatial Extraction
              </Link>
              <Link href="/materials/form" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                03 / Materials Specification &amp; SLS Rule Checks
              </Link>
              <Link href="/fire-safety" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                04 / Fire Safety Compliance Pre-Assessment
              </Link>
              <Link href="/green-assessment" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                05 / GREENSL Sustainable Rating Pre-Assessment
              </Link>
              <Link href="/visualization" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                06 / Interactive 3D Cutaway BIM Visualization
              </Link>
              <Link href="/materials/report" style={{ color: '#252823', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                07 / Material Specification &amp; Decision Report
              </Link>
            </div>
          </div>

          {/* Scientific Framework & References */}
          <div>
            <div style={{
              fontSize: '0.68rem',
              fontFamily: 'Space Grotesk',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#9A7557',
              marginBottom: '0.85rem',
            }}>
              Engineering Codes &amp; Standards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.74rem', color: '#687068', lineHeight: 1.5 }}>
              <div>• <strong>SLS 107:</strong> Specification for Ordinary Portland Cement</div>
              <div>• <strong>SLS 614:</strong> Specification for Aggregates from Natural Sources</div>
              <div>• <strong>SLS 139 / BS 476:</strong> Fire Tests on Building Materials &amp; Structures</div>
              <div>• <strong>GREENSL:</strong> Green Building Council of Sri Lanka Rating System</div>
              <div>• <strong>UDA Planning &amp; Building Regulations:</strong> Western Province Gazette</div>
            </div>
          </div>

          {/* Disclaimer & Limitations */}
          <div>
            <div style={{
              fontSize: '0.68rem',
              fontFamily: 'Space Grotesk',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#9A7557',
              marginBottom: '0.85rem',
            }}>
              Academic Disclaimer
            </div>
            <p style={{ fontSize: '0.72rem', color: '#687068', lineHeight: 1.6, margin: 0 }}>
              This platform provides <em>preliminary engineering decision-support</em> for academic research and computational design exploration. Recommendations do not replace certified structural engineering calculations, licensed architectural sign-offs, or formal statutory authority approvals.
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div style={{
          borderTop: '1px solid #E2DCD0',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.70rem',
          color: '#687068',
        }}>
          <div>
            © 2026 GreenConstructAI Research Group · Department of Information Technology · Final Year Dissertation
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/feedback" style={{ color: '#173A2B', textDecoration: 'none', fontWeight: 600 }}>
              Submit Research Feedback →
            </Link>
            <Link href="/history" style={{ color: '#687068', textDecoration: 'none' }}>
              Project History
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
