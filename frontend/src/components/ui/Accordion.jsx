import React from 'react';

/**
 * Accordion – Restrained collapsible section for the engineering decision report.
 * Updated for high-contrast warm sustainable architecture theme.
 */
export default function Accordion({ title, children, defaultOpen = false, subtitle }) {
  return (
    <details
      open={defaultOpen}
      style={{
        border: '1px solid #C8D3CA',
        borderRadius: '14px',
        background: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(24, 37, 31, 0.04)',
      }}
    >
      <summary
        style={{
          padding: '0.85rem 1.2rem',
          cursor: 'pointer',
          fontWeight: 800,
          color: '#18251F',
          fontSize: '0.95rem',
          fontFamily: 'Space Grotesk, sans-serif',
          userSelect: 'none',
          outline: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F7F9F6',
          listStyle: 'none',
          borderBottom: '1px solid #C8D3CA'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span>{title}</span>
          {subtitle && (
            <span style={{ fontSize: '0.78rem', color: '#526158', fontWeight: 500 }}>
              — {subtitle}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#526158" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </details>
  );
}
