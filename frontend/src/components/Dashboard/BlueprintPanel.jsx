"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * BlueprintPanel – Technical documentation style presentation of geometry parameters, floorplan schematic, and payload viewer.
 * Updated for high-contrast warm sustainable architecture theme.
 */
export default function BlueprintPanel({ data }) {
  const [mounted, setMounted] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [activeFloor, setActiveFloor] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!data?.blueprint) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #C8D3CA',
        borderRadius: '16px',
        padding: '1.4rem',
        color: '#526158'
      }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#18251F', fontFamily: 'Space Grotesk', fontWeight: 800 }}>Blueprint & Geometry Analysis</h3>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>No blueprint data available. Please run the plan analyzer first.</p>
        <Link href="/plan-analyzer" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>Launch Plan Analyzer</Link>
      </div>
    );
  }

  const bp = data.blueprint;
  const numFloors = bp.num_floors || 1;
  const totalArea = bp.total_area || 100;

  const bpa = data.blueprint_analysis || {};
  const footprintArea = totalArea / Math.max(numFloors, 1);
  const perim = 4 * Math.sqrt(footprintArea);
  const wallH = 3.2;
  const grossWall = bpa.total_wall_area ?? Math.round(perim * wallH * numFloors * 10) / 10;
  const roofArea = bpa.roof_area ?? Math.round(footprintArea * 1.3 * 10) / 10;
  const winArea = bpa.estimated_window_area ?? Math.round(grossWall * 0.15 * 10) / 10;
  const doorArea = bpa.estimated_door_area ?? Math.round(grossWall * 0.04 * 10) / 10;
  const foundVol = bpa.estimated_foundation_volume ?? Math.round(footprintArea * 0.4 * 10) / 10;
  const concVol = bpa.estimated_concrete_volume ?? Math.round(totalArea * 0.12 * 10) / 10;
  const frameArea = bpa.estimated_structural_frame_area ?? Math.round(totalArea * 0.08 * 10) / 10;
  const buildHeight = bpa.building_height ?? Math.round(wallH * numFloors * 10) / 10;
  const envelopeArea = bpa.external_envelope_area ?? Math.round((grossWall + roofArea) * 10) / 10;
  const openRatio = bpa.opening_ratio ?? Math.round((winArea + doorArea) / grossWall * 100 * 10) / 10;

  const geometryMetrics = [
    { label: 'Total Wall Area', val: `${grossWall} m²` },
    { label: 'Roof Area', val: `${roofArea} m²` },
    { label: 'Floor Area', val: `${totalArea} m²` },
    { label: 'Est. Window Area', val: `${winArea} m²` },
    { label: 'Est. Door Area', val: `${doorArea} m²` },
    { label: 'Foundation Volume', val: `${foundVol} m³` },
    { label: 'Concrete Volume', val: `${concVol} m³` },
    { label: 'Structural Frame Area', val: `${frameArea} m²` },
    { label: 'Building Height', val: `${buildHeight} m` },
    { label: 'Ext. Envelope Area', val: `${envelopeArea} m²` },
    { label: 'Opening Ratio', val: `${openRatio}%` },
  ];

  const floors = bp.floors_data || [];
  const currentFloor = floors[activeFloor];
  const rooms = currentFloor?.rooms || [];

  let minX = 0, minY = 0, maxX = 10, maxY = 10;
  if (rooms.length > 0) {
    minX = Math.min(...rooms.map(r => r.x || 0));
    minY = Math.min(...rooms.map(r => r.y || 0));
    maxX = Math.max(...rooms.map(r => (r.x || 0) + (r.w || 4)));
    maxY = Math.max(...rooms.map(r => (r.y || 0) + (r.h || 4)));
  }
  
  const width = (maxX - minX) || 10;
  const height = (maxY - minY) || 10;
  const padding = 1;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #C8D3CA',
      borderRadius: '16px',
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #C8D3CA', paddingBottom: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18251F', margin: 0, fontFamily: 'Space Grotesk' }}>
            Blueprint Geometry & Floorplan Parameters
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#526158', margin: '0.25rem 0 0 0', fontWeight: 500 }}>
            11 Extracted structural dimensions and schematic spatial geometry layout.
          </p>
        </div>

        <Link href="/materials/3d" className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          Launch Interactive 3D Model
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* 2D Floorplan Schematic */}
        <div style={{
          background: '#F7F9F6',
          border: '1px solid #C8D3CA',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#245C43', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
              Floor Plan Schematic
            </span>
            {floors.length > 1 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {floors.map((fl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFloor(idx)}
                    style={{
                      background: activeFloor === idx ? '#245C43' : '#FFFFFF',
                      color: activeFloor === idx ? '#FFFFFF' : '#526158',
                      border: '1px solid #C8D3CA',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    L{idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: '280px', background: '#EEF1EC', borderRadius: '10px', border: '1px solid #C8D3CA', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox={viewBox} style={{ width: '100%', height: '100%' }}>
              <defs>
                <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                  <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(36, 92, 67, 0.08)" strokeWidth="0.05" />
                </pattern>
              </defs>
              <rect x={minX - padding} y={minY - padding} width={width + padding * 2} height={height + padding * 2} fill="url(#grid)" />

              {rooms.map((room, idx) => {
                const rx = room.x || 0;
                const ry = room.y || 0;
                const rw = room.w || 4;
                const rh = room.h || 4;
                const label = room.label || room.name || `Room ${idx + 1}`;
                const zone = (room.zone || room.type || '').toLowerCase();

                let strokeColor = '#3E6F8E';
                let fillColor = 'rgba(62, 111, 142, 0.1)';

                if (zone.includes('private') || zone.includes('bedroom')) {
                  strokeColor = '#245C43';
                  fillColor = 'rgba(36, 92, 67, 0.12)';
                } else if (zone.includes('service') || zone.includes('wet') || zone.includes('bath')) {
                  strokeColor = '#C77A3D';
                  fillColor = 'rgba(199, 122, 61, 0.12)';
                } else if (zone.includes('utility')) {
                  strokeColor = '#3F7D5C';
                  fillColor = 'rgba(63, 125, 92, 0.12)';
                }

                return (
                  <g key={idx}>
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="0.14"
                      rx="0.1"
                    />
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2}
                      fill="#18251F"
                      fontSize="0.38"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Doors Overlay */}
              {(bp.doors || []).map((door, idx) => (
                <circle key={`door-${idx}`} cx={door.x} cy={door.y} r="0.25" fill="#C77A3D" stroke="#18251F" strokeWidth="0.05" />
              ))}

              {/* Windows Overlay */}
              {(bp.windows || []).map((win, idx) => (
                <rect key={`win-${idx}`} x={win.x - (win.w || 1)/2} y={win.y - 0.1} width={win.w || 1} height="0.2" fill="#3E6F8E" stroke="#18251F" strokeWidth="0.05" />
              ))}
            </svg>
          </div>

          {/* Zone Legend */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#526158', paddingTop: '0.25rem', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3E6F8E' }} /> Public
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#245C43' }} /> Private
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#C77A3D' }} /> Service
            </span>
          </div>
        </div>

        {/* 11 Geometric Parameters Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#526158', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            Extracted Geometry Parameters
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
            {geometryMetrics.map((gm, i) => (
              <div key={i} style={{
                background: '#F7F9F6',
                border: '1px solid #C8D3CA',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#526158', textTransform: 'uppercase', marginBottom: '0.15rem', fontWeight: 700 }}>
                  {gm.label}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk' }}>
                  {gm.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conceptual Disclaimer Banner */}
      <div style={{ background: '#F7F9F6', border: '1px solid #C8D3CA', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#526158', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
        <span style={{ color: '#245C43', fontSize: '0.95rem', fontWeight: 800 }}>ℹ</span>
        <span>{bp.disclaimer || "GreenConstructAI Conceptual Planning Engine — Provides preliminary architectural spatial zoning, room program sizing, and environmental layout analysis."}</span>
      </div>

      {/* Collapsible Raw Blueprint Payload Viewer */}
      <div style={{ borderTop: '1px solid #C8D3CA', paddingTop: '0.85rem' }}>
        <button
          onClick={() => setShowRaw(!showRaw)}
          style={{
            background: '#FFFFFF',
            border: '1px solid #C8D3CA',
            color: '#18251F',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.5rem 0.85rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'background 0.2s'
          }}
        >
          {showRaw ? 'Hide Raw Blueprint Payload' : 'View Technical Blueprint Payload JSON'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showRaw ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {showRaw && (
          <div style={{ marginTop: '0.5rem', background: '#F7F9F6', border: '1px solid #C8D3CA', borderRadius: '8px', padding: '0.85rem', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '0.75rem', color: '#245C43', fontFamily: 'monospace' }}>
              {JSON.stringify(bp, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
