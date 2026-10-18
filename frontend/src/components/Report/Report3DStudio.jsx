"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import so Three.js / WebGL only runs on the client
const Villa3DCanvas = dynamic(() => import("@/components/Visualization/Villa3DCanvas"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '520px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F1E8',
      color: '#687068',
      fontFamily: 'Space Grotesk, sans-serif',
      gap: '12px',
      borderRadius: '4px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '3px solid #D8D2C8',
        borderTopColor: '#173A2B',
        animation: 'spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
        Loading 3D Material Specification BIM Model…
      </div>
    </div>
  ),
});

export default function Report3DStudio({ data }) {
  const [styleMode, setStyleMode] = useState('cutaway');
  const [focusMode, setFocusMode] = useState('all');
  const [isExploded, setIsExploded] = useState(false);
  const [sunHour, setSunHour] = useState(12.0);

  const bp = data?.blueprint || {};
  const floors = data?.floors || bp.num_floors || 2;
  const buildingType = data?.building_type || bp.building_type || 'Residential';
  const structuralSystem = data?.structural_system || 'Concrete Frame (SLS 614)';

  const modes = [
    { id: 'cutaway', label: 'Cutaway Plan', badge: 'SPATIAL', desc: 'Room partitions, furniture & finishes' },
    { id: 'architectural', label: 'Architectural', badge: 'ENVELOPE', desc: 'Facade finishes, roof overhangs & glazing' },
    { id: 'engineering', label: 'Engineering BIM', badge: 'STRUCTURAL', desc: 'RC column bays & SLS 614 frame' },
    { id: 'full3d', label: 'Full 3D Massing', badge: 'MASSING', desc: 'Parametric building envelope' },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #D8D2C8',
      borderRadius: '4px',
      padding: '1.75rem 2rem',
      boxShadow: '0 4px 20px rgba(23, 58, 43, 0.03)',
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid #D8D2C8',
        paddingBottom: '1.25rem',
        marginBottom: '1.25rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span style={{
              background: '#173A2B',
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '2px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              3D MATERIAL VISUALIZATION
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', color: '#687068', fontWeight: 600 }}>
              DATA-DRIVEN BIM EMBEDDED VIEWER
            </span>
          </div>
          <h2 style={{
            fontFamily: 'Outfit, Space Grotesk, sans-serif',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#173A2B',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}>
            Interactive 3D Cutaway &amp; Material Finishes Studio
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.80rem', color: '#687068', lineHeight: 1.5 }}>
            Real-time WebGL rendering of the optimized material specification package applied to parametric spatial rooms.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsExploded(!isExploded)}
            style={{
              background: isExploded ? '#173A2B' : '#FBF9F4',
              color: isExploded ? '#FCFAF6' : '#252823',
              border: '1px solid #D8D2C8',
              borderRadius: '4px',
              padding: '7px 12px',
              fontFamily: 'Space Grotesk',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.15s ease',
            }}
          >
            {isExploded ? 'Collapse Floors' : 'Exploded View'}
          </button>

          <Link
            href="/visualization"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#173A2B',
              color: '#FCFAF6',
              padding: '7px 14px',
              borderRadius: '4px',
              fontFamily: 'Space Grotesk',
              fontSize: '0.72rem',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Full Studio ↗
          </Link>
        </div>
      </div>

      {/* Style Mode Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
      }}>
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setStyleMode(m.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '3px',
              border: styleMode === m.id ? '1.5px solid #173A2B' : '1px solid #D8D2C8',
              background: styleMode === m.id ? '#173A2B' : '#FBF9F4',
              color: styleMode === m.id ? '#FFFFFF' : '#252823',
              fontFamily: 'Space Grotesk',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{m.label}</span>
            <span style={{
              fontSize: '0.58rem',
              padding: '1px 5px',
              borderRadius: '2px',
              background: styleMode === m.id ? 'rgba(255,255,255,0.2)' : 'rgba(23,58,43,0.08)',
              color: styleMode === m.id ? '#FFFFFF' : '#173A2B',
            }}>
              {m.badge}
            </span>
          </button>
        ))}
      </div>

      {/* 3D Canvas Viewport Frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #D8D2C8',
        background: 'radial-gradient(ellipse at 50% 30%, #202723 0%, #111714 100%)',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
      }}>
        <Villa3DCanvas
          floorCount={floors}
          buildingType={buildingType}
          structuralSystem={structuralSystem}
          styleMode={styleMode}
          focusMode={focusMode}
          isExploded={isExploded}
          sunHour={sunHour}
          showFurniture={true}
          showHotspots={true}
          showDimensions={true}
        />

        {/* Floating Quick Controls Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          pointerEvents: 'none',
        }}>
          <div style={{
            pointerEvents: 'auto',
            background: 'rgba(23, 58, 43, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(216, 210, 200, 0.3)',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.68rem',
            color: '#FCFAF6',
            fontFamily: 'Space Grotesk',
          }}>
            <span>☀ Solar Lighting:</span>
            <input
              type="range"
              min="6"
              max="18"
              step="0.5"
              value={sunHour}
              onChange={(e) => setSunHour(parseFloat(e.target.value))}
              style={{ width: '80px', accentColor: '#3F7656', cursor: 'pointer' }}
            />
            <span>{Math.floor(sunHour)}:{sunHour % 1 ? '30' : '00'}</span>
          </div>

          <div style={{
            pointerEvents: 'auto',
            background: 'rgba(23, 58, 43, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(216, 210, 200, 0.3)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.68rem',
            color: '#D8D2C8',
            fontFamily: 'Space Grotesk',
          }}>
            Rotate: Left Click Drag · Pan: Right Click Drag · Zoom: Scroll
          </div>
        </div>
      </div>

      {/* Applied Finishes Swatches Strip */}
      <div style={{
        marginTop: '1rem',
        padding: '0.85rem 1rem',
        background: '#FBF9F4',
        border: '1px solid #D8D2C8',
        borderRadius: '3px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.74rem',
        fontFamily: 'Space Grotesk',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#173A2B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active Material Finishes:
          </span>
          <span style={{ color: '#252823' }}>• <strong>Masonry:</strong> Interlocking Stabilized Earth / Brick</span>
          <span style={{ color: '#252823' }}>• <strong>Structure:</strong> RC Frame (Grade 30 SLS 614)</span>
          <span style={{ color: '#252823' }}>• <strong>Glazing:</strong> Low-E Solar Double Glazed</span>
          <span style={{ color: '#252823' }}>• <strong>Roof:</strong> Micro-Concrete Tiles &amp; Treated Timber</span>
        </div>

        <div style={{ color: '#687068', fontSize: '0.68rem' }}>
          Indicative spatial representation · Synchronized with Recommendation Engine
        </div>
      </div>
    </div>
  );
}
