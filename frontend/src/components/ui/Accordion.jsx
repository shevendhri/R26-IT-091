import React from 'react';

/**
 * Simple Accordion component using native HTML <details>.
 * Props:
 *   title: string – header displayed on the summary line.
 *   children: ReactNode – content shown when expanded.
 *   defaultOpen?: boolean – if true, the accordion starts expanded.
 */
export default function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} style={{
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      marginBottom: '1rem',
      background: 'rgba(0,0,0,0.1)',
    }}>
      <summary style={{
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        userSelect: 'none',
        outline: 'none',
      }}>{title}</summary>
      <div style={{ padding: '1rem' }}>{children}</div>
    </details>
  );
}
