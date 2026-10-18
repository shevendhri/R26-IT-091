"use client";
import React from 'react';

export default function LoadingOverlay({ step }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: 'rgba(245, 241, 232, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <style>{`
        @keyframes archSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmerBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Architectural Card Container */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #D8D1C5',
        borderTop: '4px solid #173A2B',
        borderRadius: '16px',
        padding: '3rem 3.5rem',
        boxShadow: '0 20px 60px rgba(23, 58, 43, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Architectural Core Indicator */}
        <div style={{
          position: 'relative',
          width: '88px',
          height: '88px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid #EFECE4',
            borderTopColor: '#173A2B',
            animation: 'archSpin 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
          }} />
          {/* Inner dashed ring */}
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px dashed #D8D1C5',
            borderRightColor: '#9A7557',
            animation: 'archSpin 3s linear infinite reverse'
          }} />
          {/* Center icon badge */}
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: '#FBF9F4',
            border: '1px solid #D8D1C5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#173A2B',
            boxShadow: '0 2px 8px rgba(23, 58, 43, 0.06)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#173A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <div>
          {/* Monograph Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '0.70rem',
              fontWeight: 800,
              color: '#065F46',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
            MCDM Decision Matrix Engine
          </div>

          {/* Current Step Title */}
          <div
            style={{
              fontSize: '1.40rem',
              fontWeight: 800,
              color: '#0F172A',
              fontFamily: 'Outfit, Space Grotesk, sans-serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              marginBottom: '0.5rem'
            }}
          >
            {step}…
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: '0.84rem',
            color: '#64748B',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
          }}>
            Synthesizing Sri Lankan geoclimatic constraints, SLS engineering rules, and Random Forest rankings.
          </div>
        </div>

        {/* Architectural Progress Bar Line */}
        <div style={{
          width: '100%',
          height: '6px',
          background: '#E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '50%',
            background: 'linear-gradient(90deg, transparent, #173A2B, #9A7557, transparent)',
            borderRadius: '10px',
            animation: 'shimmerBar 1.8s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
