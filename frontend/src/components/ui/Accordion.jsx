import React from 'react';

/**
 * Accordion – Restrained collapsible section for the engineering decision report.
 * Uses native <details> for zero-JS toggle with accessible keyboard behavior.
 */
export default function Accordion({ title, children, defaultOpen = false, subtitle }) {
  return (
    <details
      open={defaultOpen}
      style={{
        border: '1px solid #1e293b',
        borderRadius: '6px',
        background: '#0f172a',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          padding: '0.7rem 1rem',
          cursor: 'pointer',
          fontWeight: 600,
          color: '#f8fafc',
          fontSize: '0.9rem',
          fontFamily: 'Space Grotesk, sans-serif',
          userSelect: 'none',
          outline: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0b0f19',
          listStyle: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>{title}</span>
          {subtitle && (
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>
              — {subtitle}
            </span>
          )}
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div style={{ padding: '1rem' }}>{children}</div>
    </details>
  );
}
