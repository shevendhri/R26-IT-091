import React from 'react';

/**
 * Accordion – Collapsible section in the architectural editorial design language.
 * Warm cream, forest green, sharp borders — consistent with the Research Specification Monograph.
 */
export default function Accordion({ title, children, defaultOpen = false, subtitle }) {
  return (
    <details
      open={defaultOpen}
      style={{
        border: '1px solid #D8D2C8',
        borderRadius: '4px',
        background: '#FFFFFF',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      <summary
        style={{
          padding: '1rem 1.35rem',
          cursor: 'pointer',
          fontWeight: 800,
          color: '#173A2B',
          fontSize: '0.82rem',
          fontFamily: 'Space Grotesk, sans-serif',
          userSelect: 'none',
          outline: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FBF9F4',
          listStyle: 'none',
          borderBottom: '1px solid #D8D2C8',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          transition: 'background 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ letterSpacing: '-0.01em' }}>{title}</span>
          {subtitle && (
            <span style={{ fontSize: '0.72rem', color: '#687068', fontWeight: 500, textTransform: 'none', letterSpacing: '0' }}>
              — {subtitle}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#173A2B" strokeWidth="2.5" style={{ flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div style={{ padding: '1.4rem', background: '#FFFFFF' }}>{children}</div>
    </details>
  );
}
