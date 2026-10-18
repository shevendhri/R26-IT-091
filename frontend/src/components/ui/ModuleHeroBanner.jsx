"use client";

import React from 'react';

export default function ModuleHeroBanner({
  track = "01 / ARCHITECTURAL INTELLIGENCE",
  kicker = "INTAKE WORKSHEET",
  title = "MODULE TITLE",
  subtitle = "Module description and workflow overview across Sri Lankan construction standards.",
  imageSrc = "/blueprint_desk.png",
  imageAlt = "Architectural Module Banner",
  showContextStrip = true,
  customContextData = null,
  actions = null,
  style = {},
}) {
  return (
    <div style={{ marginBottom: '2rem', ...style }}>


      <div
        className="arch-board-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          border: '1px solid #E2DCD0',
          borderRadius: '4px',
          background: '#FFFFFF',
          boxShadow: '0 4px 18px rgba(20, 56, 37, 0.03)',
        }}
      >
        {/* Cover Image with gradient overlay and tags */}
        <div
          style={{
            position: 'relative',
            height: '180px',
            overflow: 'hidden',
            background: '#143825',
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.82,
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(20, 56, 37, 0.94) 0%, rgba(20, 56, 37, 0.40) 60%, rgba(20, 56, 37, 0.20) 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              zIndex: 2,
            }}
          >
            <span
              className="arch-tag arch-tag-forest"
              style={{
                background: 'rgba(20, 56, 37, 0.92)',
                color: '#FCFAF6',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontWeight: 800,
                fontSize: '0.66rem',
                letterSpacing: '0.10em',
                padding: '4px 10px',
                borderRadius: '3px',
              }}
            >
              {track}
            </span>
            {kicker && (
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#FAF7F0',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {kicker}
              </span>
            )}
          </div>
        </div>

        {/* Text Header Area */}
        <div style={{ padding: '1.75rem 2rem', background: '#FFFFFF' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div style={{ maxWidth: '880px' }}>
              <h1
                style={{
                  fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  fontWeight: 800,
                  color: '#143825',
                  margin: '0 0 0.5rem',
                  lineHeight: 1.15,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>

              {subtitle && (
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: '#526158',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
