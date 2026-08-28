"use client";
import React from 'react';

export default function LoadingOverlay({ step }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: 'rgba(240, 242, 238, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <style>{`
        @keyframes archPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes archSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Architectural Card Container */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #C4CFC6',
        borderRadius: '24px',
        padding: '3rem 3.5rem',
        boxShadow: '0 20px 50px rgba(24, 37, 31, 0.08), 0 4px 12px rgba(24, 37, 31, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Animated Architectural Core Indicator */}
        <div style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid #E6EBE4',
            borderTopColor: '#1E5438',
            animation: 'archSpin 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px dashed #C4CFC6',
            borderRightColor: '#4A7A5C',
            animation: 'archSpin 3s linear infinite reverse'
          }} />
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E5438, #132E1F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(30, 84, 56, 0.28)',
            animation: 'archPulse 2s ease-in-out infinite'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#65D28A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        <div>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#DCE9DC',
              border: '1px solid rgba(30, 84, 56, 0.25)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#1E5438',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1E5438' }} />
            MCDM Decision Matrix
          </div>

          {/* Current Step Title */}
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#18251F',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              marginBottom: '0.6rem'
            }}
          >
            {step}...
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: '0.78rem',
            color: '#4A5E52',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif'
          }}>
            Evaluating multi-objective geoclimatic criteria and ML hybrid rankings
          </div>
        </div>

        {/* Progress Bar Line */}
        <div style={{
          width: '100%',
          height: '5px',
          background: '#E6EBE4',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, #1E5438, #65D28A)',
            borderRadius: '10px',
            animation: 'archPulse 1.5s ease-in-out infinite'
          }} />
        </div>
      </div>
    </div>
  );
}
