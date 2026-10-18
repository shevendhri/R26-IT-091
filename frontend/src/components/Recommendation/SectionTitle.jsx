"use client";
import React from 'react';

export default function SectionTitle({ children, sub, style }) {
  return (
    <div style={{ marginBottom: '1.25rem', ...style }}>
      <h2 style={{ fontSize: '1rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#fff', margin: 0 }}>{children}</h2>
      {sub && <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}
