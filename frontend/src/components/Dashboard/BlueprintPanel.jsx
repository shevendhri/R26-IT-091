"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';

/**
 * BlueprintPanel – Displays the generated blueprint data summary,
 * offers a button to launch the interactive 3D model visualizer,
 * and renders a dynamic, live 2D SVG floorplan representation based
 * on actual backend floors/rooms coordinates.
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
      <GlassCard className="dashboard-section blueprint-panel">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Blueprint & 3D Visualization</h3>
        <p style={{ color: 'var(--text-dim)' }}>No blueprint data available. Please generate the blueprint first.</p>
        <Link href="/materials/form" className="btn-premium" style={{ marginTop: '1rem', display: 'inline-block' }}>Go to Form</Link>
      </GlassCard>
    );
  }

  const bp = data.blueprint;
  const buildingType = bp.building_type || 'N/A';
  const numFloors = bp.num_floors || 'N/A';
  const totalArea = bp.total_area || 'N/A';
  const footprint = bp.footprint ? `${bp.footprint.w}m × ${bp.footprint.h}m` : 'N/A';

  // Prefer blueprint_analysis from backend if available, else compute fallback
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
    { label: 'Total Wall Area', val: `${grossWall} m²`, color: '#00ff9d' },
    { label: 'Roof Area', val: `${roofArea} m²`, color: '#0ea5e9' },
    { label: 'Floor Area', val: `${totalArea} m²`, color: '#a78bfa' },
    { label: 'Est. Window Area', val: `${winArea} m²`, color: '#06b6d4' },
    { label: 'Est. Door Area', val: `${doorArea} m²`, color: '#fbbf24' },
    { label: 'Foundation Volume', val: `${foundVol} m³`, color: '#f97316' },
    { label: 'Concrete Volume', val: `${concVol} m³`, color: '#34d399' },
    { label: 'Structural Frame Area', val: `${frameArea} m²`, color: '#ec4899' },
    { label: 'Building Height', val: `${buildHeight} m`, color: '#94a3b8' },
    { label: 'Ext. Envelope Area', val: `${envelopeArea} m²`, color: '#4ade80' },
    { label: 'Opening Ratio', val: `${openRatio}%`, color: '#fb923c' },
  ];

  const floors = bp.floors_data || [];
  const currentFloor = floors[activeFloor];
  const rooms = currentFloor?.rooms || [];

  // Determine bounds of the room layout to compute the SVG viewBox dynamically
  let minX = 0, minY = 0, maxX = 10, maxY = 10;
  if (rooms.length > 0) {
    minX = Math.min(...rooms.map(r => r.x || 0));
    minY = Math.min(...rooms.map(r => r.y || 0));
    maxX = Math.max(...rooms.map(r => (r.x || 0) + (r.w || 4)));
    maxY = Math.max(...rooms.map(r => (r.y || 0) + (r.h || 4)));
  }
  
  // Add a padding border to the view
  const width = (maxX - minX) || 10;
  const height = (maxY - minY) || 10;
  const padding = 1;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <GlassCard className="dashboard-section blueprint-panel">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', minHeight: '500px' }}>
        
        {/* Dynamic 2D SVG Schematic Floorplan */}
        <div style={{
          background: '#040d0d',
          border: '1px solid rgba(0, 255, 157, 0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative'
        }}>
          {/* Schematic Header & Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Automated Floor Plan Layout
            </span>
            {floors.length > 1 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {floors.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFloor(idx)}
                    style={{
                      background: activeFloor === idx ? 'var(--eco-glow)' : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: activeFloor === idx ? '#000' : '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Level {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SVG Floorplan View */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
            {rooms.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No rooms defined for this floor level.</div>
            ) : (
              <svg 
                viewBox={viewBox} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  maxHeight: '360px',
                  stroke: 'var(--eco-glow)', 
                  strokeWidth: 0.08,
                  fill: 'none'
                }}
              >
                {/* Architectural Blueprint Grid Pattern */}
                <defs>
                  <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(0, 255, 157, 0.04)" strokeWidth="0.05" />
                  </pattern>
                </defs>
                <rect x={minX - padding} y={minY - padding} width={width + padding * 2} height={height + padding * 2} fill="url(#grid)" stroke="none" />

                {/* Rooms Render */}
                {rooms.map((room, idx) => {
                  const rx = room.x || 0;
                  const ry = room.y || 0;
                  const rw = room.w || 4;
                  const rh = room.h || 4;
                  const label = room.label || room.type || 'Room';
                  const area = (rw * rh).toFixed(1);

                  return (
                    <g key={idx}>
                      {/* Room boundaries */}
                      <rect 
                        x={rx} 
                        y={ry} 
                        width={rw} 
                        height={rh} 
                        fill="rgba(0, 255, 157, 0.02)" 
                        stroke="var(--eco-glow)" 
                        strokeWidth="0.08"
                        style={{ transition: 'all 0.3s ease' }}
                      />
                      {/* Sub-hatching lines for structural feel */}
                      <line x1={rx} y1={ry} x2={rx + 0.5} y2={ry + 0.5} stroke="rgba(0, 255, 157, 0.2)" strokeWidth="0.05" />
                      <line x1={rx + rw} y1={ry + rh} x2={rx + rw - 0.5} y2={ry + rh - 0.5} stroke="rgba(0, 255, 157, 0.2)" strokeWidth="0.05" />
                      
                      {/* Labels */}
                      <text 
                        x={rx + rw / 2} 
                        y={ry + rh / 2} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#fff" 
                        fontSize="0.32" 
                        fontWeight="700"
                        stroke="none"
                        style={{ fontFamily: 'Space Grotesk' }}
                      >
                        {label}
                      </text>
                      <text 
                        x={rx + rw / 2} 
                        y={ry + rh / 2 + 0.4} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="var(--text-dim)" 
                        fontSize="0.24" 
                        fontWeight="500"
                        stroke="none"
                        style={{ fontFamily: 'Inter' }}
                      >
                        {area} m²
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Right content info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Section */}
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Blueprint Analysis</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Generated layout topology and 2D floorplans mapped from parameters. Launch the visualizer to explore inside the 3D model.
            </p>
          </div>

          <Link
            href="/materials/3d"
            className="btn-premium"
            style={{
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
              padding: '1.1rem'
            }}
          >
            LAUNCH INTERACTIVE 3D VIEWER
          </Link>

          {/* Building Geometry Analysis Grid */}
          <div style={{
            background: 'var(--bg-light)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Building Geometry Analysis
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.6rem'
            }}>
              {geometryMetrics.map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.color}20`,
                  borderRadius: '8px',
                  padding: '0.5rem 0.65rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: '2px',
                    background: item.color, borderRadius: '8px 0 0 8px'
                  }}/>
                  <div style={{ paddingLeft: '0.35rem' }}>
                    <div style={{ fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: item.color, fontFamily: 'Space Grotesk' }}>
                      {item.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Blueprint JSON Data Toggle */}
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button
              onClick={() => setShowRaw(!showRaw)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-eco)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {showRaw ? '▼ Hide Technical Blueprint Payload' : '▶ Show Technical Blueprint Payload'}
            </button>

            {showRaw && (
              <pre style={{
                color: 'var(--text-dim)',
                fontSize: '0.8rem',
                background: 'var(--bg-light)',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                marginTop: '1rem',
                maxHeight: '200px',
                border: '1px solid var(--card-border)'
              }}>
                {JSON.stringify(bp, null, 2)}
              </pre>
            )}
          </div>
        </div>

      </div>
    </GlassCard>
  );
}
