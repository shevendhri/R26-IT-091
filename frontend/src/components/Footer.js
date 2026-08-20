"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer style={{ 
      padding: '2rem 2rem', 
      borderTop: '1px solid #1e293b', 
      background: '#090d16', 
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', fontFamily: 'Space Grotesk' }}>
            GREENCONSTRUCT<span style={{ color: '#10b981' }}>AI</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Engineering Decision Support & Material Intelligence System for Sri Lankan Construction Context
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>
          <span>SLS 134/139 Compliant</span>
          <span>•</span>
          <span>14 Sri Lankan Micro-Climate Zones</span>
          <span>•</span>
          <span>Hybrid Decision Architecture</span>
        </div>
      </div>
    </footer>
  );
}
