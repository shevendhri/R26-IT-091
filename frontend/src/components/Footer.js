"use client";

import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      padding: '4rem 3rem', 
      borderTop: '1px solid var(--glass-border)', 
      background: 'rgba(4, 13, 10, 0.5)', 
      textAlign: 'center',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1rem' }}>SYSTEM_STATUS</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--eco-glow)' }}>► NEURAL_CORE: ACTIVE</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--blueprint-blue)' }}>► VISION_ENGINE: ONLINE</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>► UPTIME: 99.98%</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1rem' }}>RESOURCES</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ENGINEERING CODES</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>SLS STANDARDS</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>API DOCUMENTATION</div>
          </div>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '8px', textTransform: 'uppercase', marginTop: '2rem' }}>
          GreenConstructAI // Intelligent Sustainable Engineering // © 2026
        </div>
      </div>
    </footer>
  );
};

export default Footer;
