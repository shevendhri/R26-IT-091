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
              Dynamic 2D Floor Plan
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

          {/* Blueprint Spec Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            background: 'var(--bg-light)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            {[
              { label: 'Building Type', val: buildingType },
              { label: 'Floors Count', val: `${numFloors} Levels` },
              { label: 'Total Blueprint Area', val: `${totalArea} m²` },
              { label: 'Footprint Dimensions', val: footprint }
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'Space Grotesk' }}>{item.val}</div>
              </div>
            ))}
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
