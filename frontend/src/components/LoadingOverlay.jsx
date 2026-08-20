"use client";
import React from 'react';

export default function LoadingOverlay({ step }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: 'rgba(4, 13, 10, 0.98)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
      }}
    >
      <div className="neural-core-v2" style={{ width: '130px', height: '130px' }}>
        <div className="core-ring core-ring-1"></div>
        <div className="core-ring core-ring-2"></div>
        <div className="core-ring core-ring-3"></div>
        <div style={{ fontSize: '3.5rem' }}>🧪</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 900,
            color: 'var(--eco-glow)',
            letterSpacing: '10px',
            textTransform: 'uppercase',
            marginBottom: '15px',
          }}
        >
          MCDM Decision Matrix
        </div>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'Space Grotesk',
          }}
        >
          {step}...
        </div>
      </div>
    </div>
  );
}
