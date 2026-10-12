"use client";

import React from 'react';

export default function ArchitecturalHeroPortal() {
  const imgWidth = 820;
  const imgHeight = 540;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '820px',
      aspectRatio: '1.45 / 1',
      minHeight: '520px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* ── Layer 1: Ambient Backdrop Glow ── */}
      <div style={{
        position: 'absolute',
        inset: '-15px',
        background: 'radial-gradient(ellipse at 65% 55%, rgba(95, 140, 110, 0.22) 0%, rgba(245, 241, 232, 0) 72%)',
        filter: 'blur(24px)',
        pointerEvents: 'none',
      }} />

      {/* ── Layer 2: Master Outer CAD Contour (Enclosing Stepped Frame) ── */}
      <div style={{
        position: 'absolute',
        inset: '8px 12px 12px 10px',
        border: '1.2px solid rgba(60, 105, 78, 0.35)',
        borderRadius: '44px',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        {/* CAD Drafting Echo: Top-Right Concentric Arcs */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '78px',
          height: '78px',
          borderTop: '1.2px solid rgba(60, 105, 78, 0.30)',
          borderRight: '1.2px solid rgba(60, 105, 78, 0.30)',
          borderTopRightRadius: '36px',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '60px',
          height: '60px',
          borderTop: '1px dashed rgba(60, 105, 78, 0.22)',
          borderRight: '1px dashed rgba(60, 105, 78, 0.22)',
          borderTopRightRadius: '28px',
          pointerEvents: 'none',
        }} />

        {/* CAD Drafting Echo: Bottom-Left Arc */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          width: '68px',
          height: '68px',
          borderBottom: '1.2px solid rgba(60, 105, 78, 0.30)',
          borderLeft: '1.2px solid rgba(60, 105, 78, 0.30)',
          borderBottomLeftRadius: '36px',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Layer 3: Top-Left Stepped Accent Tab (Framing Upper Conservatory) ── */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '22px',
        width: '42%',
        height: '26%',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1.6px solid rgba(75, 120, 92, 0.52)',
        background: '#133322',
        boxShadow: '0 8px 24px rgba(21, 57, 40, 0.12)',
        zIndex: 3,
      }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src="/green_architecture.jpg"
            alt="Biophilic Architecture Observatory"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-22px',
              width: `${imgWidth}px`,
              height: `${imgHeight}px`,
              maxWidth: 'none',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'saturate(1.08) contrast(1.03)',
              display: 'block',
            }}
          />
          {/* Soft glass highlight over top tab */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* ── Layer 4: Main Focal Architectural Window ── */}
      <div style={{
        position: 'absolute',
        top: '44px',
        left: '42px',
        right: '20px',
        bottom: '20px',
        borderRadius: '38px',
        overflow: 'hidden',
        border: '1.8px solid rgba(70, 115, 88, 0.56)',
        boxShadow: '0 18px 44px rgba(21, 57, 40, 0.16), 0 4px 12px rgba(21, 57, 40, 0.08)',
        background: '#133322',
        zIndex: 2,
      }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src="/green_architecture.jpg"
            alt="Sri Lankan Sustainable Architecture - Tropical Timber & Glass"
            style={{
              position: 'absolute',
              top: '-44px',
              left: '-42px',
              width: `${imgWidth}px`,
              height: `${imgHeight}px`,
              maxWidth: 'none',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'saturate(1.08) contrast(1.03)',
              display: 'block',
            }}
          />

          {/* Inner subtle glass corner highlights */}
          <div style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.14)',
            pointerEvents: 'none',
          }} />

          {/* Subtle ambient glass reflection sheen across top half */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  );
}
