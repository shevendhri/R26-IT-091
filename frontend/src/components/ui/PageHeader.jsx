"use client";

import React from 'react';
import Link from 'next/link';

export default function PageHeader({
  kicker,
  provenance,
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`arch-page-header-unified ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2DCD0',
        borderRadius: '8px',
        padding: '1.75rem 2.25rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(20, 56, 37, 0.03)',
        ...style,
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.68rem',
            color: '#697068',
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {b.href ? (
                <Link href={b.href} style={{ color: '#143825', textDecoration: 'none', fontWeight: 600 }}>
                  {b.label}
                </Link>
              ) : (
                <span style={{ fontWeight: 700, color: '#2B3B30' }}>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div style={{ maxWidth: '840px' }}>
          {(kicker || provenance) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              {kicker && (
                <span style={{
                  background: '#143825',
                  color: '#FCFAF6',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {kicker}
                </span>
              )}
              {provenance && (
                <span style={{
                  fontSize: '0.68rem',
                  color: '#657B6C',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {provenance}
                </span>
              )}
            </div>
          )}

          <h1 style={{
            fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.75rem, 2.8vw, 2.4rem)',
            fontWeight: 800,
            color: '#143825',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            lineHeight: 1.15,
          }}>
            {title}
          </h1>

          {subtitle && (
            <p style={{
              margin: 0,
              fontSize: '0.90rem',
              color: '#55655B',
              lineHeight: 1.6,
              fontFamily: "'Inter', sans-serif",
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
