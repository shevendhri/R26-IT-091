"use client";
import React, { useMemo, Suspense, useEffect, useState, Component } from 'react';

// ── Error boundary to catch R3F / Three.js render errors ────────────────────
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('[Building3DModel] WebGL render error caught by boundary:', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Sky, ContactShadows, Float } from '@react-three/drei';
import SafeEnvironment from './ui/SafeEnvironment';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { getTexture, getWallMaterial, getRoofMaterial, getFloorMaterial, getDoorMaterial, getWindowFrameMaterial } from './ProceduralTextures';
import LandscapeScene from './LandscapeScene';
import RoomFurniture from './RoomFurniture';
import { useMaterial } from '../context/MaterialContext';

// ══════════════════════════════════════════════════════════════════════════════
//  SPEC COLOR CONSTANTS (Planner5D target palette)
// ══════════════════════════════════════════════════════════════════════════════
const ARCH_WHITE  = '#FAFAFA';   // Pure architectural white walls
const OAK_FLOOR   = '#DCC5A1';   // Light oak timber floor
const SCENE_BG    = '#F2EFE9';   // Warm white studio background

// ══════════════════════════════════════════════════════════════════════════════
//  ARCHITECTURAL CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
const FLOOR_H = 3.0;
const SLAB_T = 0.20;
const EXT_T = 0.20;
const INT_T = 0.08;
const WALL_H = FLOOR_H - SLAB_T;
const WIN_W = 1.20;
const WIN_H = 1.40;
const WIN_SILL = 0.90;
const WIN_SPACE = 2.80;
const DOOR_W = 1.00;
const DOOR_H = 2.10;
const PLINTH_H = 0.25;
const CORNICE_H = 0.12;
const SILL_H = 0.06;

// Fallbacks
const WALL_HEX = { '7': '#c87941', '8': '#d4d4d4', '9': '#9ca3af', '10': '#6b7280', '24': '#b5763f' };
const ROOF_HEX = { '1': '#8b4513', '2': '#4a5568', '3': '#2d3748', '4': '#1a202c', '5': '#718096', '6': '#553c2e' };
const DOOR_HEX = { '17': '#8b6914', '18': '#4a5568', '19': '#2d3748', '20': '#8b7355' };
const FRAME_HEX = { '21': '#f5f5f5', '22': '#4a5568', '23': '#8b6914' };

function resolveWindowFrameColor(selection) {
  return getWindowFrameMaterial(selection).color;
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOF GEOMETRY HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function createHippedRoof(w, d, pitchDeg, ov) {
  const pr = ((pitchDeg || 15) * Math.PI) / 180;
  const W = w + 2 * ov, D = d + 2 * ov;
  const wider = W >= D;
  const short = wider ? D : W;
  const ri = short / 2;
  const rH = Math.max(0.5, ri * Math.tan(pr));
  let v4x, v4z, v5x, v5z;
  if (wider) {
    v4x = ri - ov; v4z = d / 2;
    v5x = w - ri + ov; v5z = d / 2;
    if (v5x <= v4x) { v5x = v4x = w / 2; }
  } else {
    v4x = w / 2; v4z = ri - ov;
    v5x = w / 2; v5z = d - ri + ov;
    if (v5z <= v4z) { v5z = v4z = d / 2; }
  }
  const pos = new Float32Array([
    -ov, 0, -ov, w + ov, 0, -ov,
    w + ov, 0, d + ov, -ov, 0, d + ov,
    v4x, rH, v4z, v5x, rH, v5z,
  ]);
  const idx = wider
    ? [0, 4, 1, 1, 4, 5, 3, 5, 4, 2, 5, 3, 0, 3, 4, 1, 5, 2]
    : [0, 4, 3, 3, 4, 5, 1, 5, 4, 2, 5, 1, 0, 1, 4, 3, 5, 2];
  const uvs = new Float32Array((pos.length / 3) * 2);
  for (let i = 0; i < pos.length; i += 3) {
    uvs[(i / 3) * 2] = pos[i];
    uvs[(i / 3) * 2 + 1] = pos[i + 2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function createGableRoof(w, d, pitchDeg, ov) {
  const pr = ((pitchDeg || 15) * Math.PI) / 180;
  const rH = Math.max(0.5, (d / 2 + ov) * Math.tan(pr));
  const pos = new Float32Array([
    -ov, 0, -ov, w + ov, 0, -ov,
    w + ov, 0, d + ov, -ov, 0, d + ov,
    -ov, rH, d / 2, w + ov, rH, d / 2,
  ]);
  const idx = [0, 4, 5, 0, 5, 1, 2, 5, 4, 2, 4, 3, 0, 3, 4, 1, 5, 2];
  const uvs = new Float32Array((pos.length / 3) * 2);
  for (let i = 0; i < pos.length; i += 3) {
    uvs[(i / 3) * 2] = pos[i];
    uvs[(i / 3) * 2 + 1] = pos[i + 2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXPOSED STRUCTURAL SYSTEM VISUALIZER
// ══════════════════════════════════════════════════════════════════════════════
function ProceduralExposedStructure({ w, d, numFloors, structuralSystem, activeFloor, presentationMode }) {
  const sys = (structuralSystem || '').toLowerCase();
  const isSteel = sys.includes('steel') || sys.includes('composite');
  const isConcrete = sys.includes('concrete') || sys.includes('frame');
  const isTimber = sys.includes('timber') || sys.includes('wood');

  const timberTex = useMemo(() => getTexture('timber'), []);
  const concreteTex = useMemo(() => getTexture('concrete_roof'), []);

  if (!isSteel && !isConcrete && !isTimber) return null;

  const size = isSteel ? 0.16 : isTimber ? 0.22 : 0.35;
  let matProps = { roughness: 0.8, metalness: 0.1 };
  if (presentationMode === 'material') {
    matProps = { color: '#475569', transparent: true, opacity: 0.2, roughness: 0.8 };
  } else if (isSteel) {
    matProps = { color: '#1e293b', roughness: 0.35, metalness: 0.85 };
  } else if (isTimber) {
    matProps = { ...timberTex, color: '#8b5a2b', roughness: 0.8, metalness: 0.02 };
  } else {
    matProps = { ...concreteTex, color: '#909090', roughness: 0.85, metalness: 0.02 };
  }

  // Vertical columns placement coordinates
  const pts = [[0, 0], [w, 0], [w, d], [0, d]];
  if (w > 8) { pts.push([w / 2, 0]); pts.push([w / 2, d]); }
  if (d > 8) { pts.push([0, d / 2]); pts.push([w, d / 2]); }

  // Draw columns and beams floor by floor so they cut away cleanly
  const floorsToDraw = activeFloor === -1 
    ? Array.from({ length: numFloors })
    : Array.from({ length: activeFloor + 1 });

  return (
    <group>
      {floorsToDraw.map((_, fIdx) => {
        const yColBase = fIdx * FLOOR_H + SLAB_T;
        const yBeam = fIdx * FLOOR_H + SLAB_T + WALL_H;
        return (
          <group key={fIdx}>
            {/* Columns */}
            {pts.map(([x, z], i) => (
              <mesh key={`col-${fIdx}-${i}`} position={[x, yColBase + WALL_H / 2, z]} castShadow>
                <boxGeometry args={[size, WALL_H, size]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
            ))}
            {/* Edge Beams */}
            <mesh position={[w / 2, yBeam, 0]} castShadow>
              <boxGeometry args={[w + size, size, size]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[w / 2, yBeam, d]} castShadow>
              <boxGeometry args={[w + size, size, size]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[0, yBeam, d / 2]} castShadow>
              <boxGeometry args={[size, size, d + size]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[w, yBeam, d / 2]} castShadow>
              <boxGeometry args={[size, size, d + size]} />
              <meshStandardMaterial {...matProps} />
            </mesh>

            {/* Steel Truss Cross Bracing (Steel Frame only) */}
            {isSteel && (
              <group>
                <mesh position={[0, yColBase + WALL_H / 2, d / 2]} rotation={[Math.atan(d / WALL_H), 0, 0]} castShadow>
                  <boxGeometry args={[0.06, Math.sqrt(d*d + WALL_H*WALL_H), 0.06]} />
                  <meshStandardMaterial {...matProps} />
                </mesh>
                <mesh position={[0, yColBase + WALL_H / 2, d / 2]} rotation={[-Math.atan(d / WALL_H), 0, 0]} castShadow>
                  <boxGeometry args={[0.06, Math.sqrt(d*d + WALL_H*WALL_H), 0.06]} />
                  <meshStandardMaterial {...matProps} />
                </mesh>
                <mesh position={[w, yColBase + WALL_H / 2, d / 2]} rotation={[Math.atan(d / WALL_H), 0, 0]} castShadow>
                  <boxGeometry args={[0.06, Math.sqrt(d*d + WALL_H*WALL_H), 0.06]} />
                  <meshStandardMaterial {...matProps} />
                </mesh>
                <mesh position={[w, yColBase + WALL_H / 2, d / 2]} rotation={[-Math.atan(d / WALL_H), 0, 0]} castShadow>
                  <boxGeometry args={[0.06, Math.sqrt(d*d + WALL_H*WALL_H), 0.06]} />
                  <meshStandardMaterial {...matProps} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  FLOOR SLABS
// ══════════════════════════════════════════════════════════════════════════════
function FloorSlab({ w, d, floorIdx, selections, presentationMode, buildingType }) {
  const y = floorIdx * FLOOR_H + SLAB_T / 2;

  const floorMatInfo = useMemo(() => {
    if (presentationMode === 'engineering') return null;
    const fm = getFloorMaterial(selections?.Flooring, presentationMode);
    return getTexture(fm.texType, fm.color);
  }, [selections?.Flooring, presentationMode]);

  const fm = getFloorMaterial(selections?.Flooring, presentationMode);
  let floorColor = fm.color;

  const isMixedUse = buildingType === 'Mixed Use';
  // Adjust slab size if upper floors step back (Mixed Use)
  const isUpperMixed = isMixedUse && floorIdx > 0;
  const currentW = isUpperMixed ? w * 0.75 : w;
  const currentX = isUpperMixed ? w * 0.125 + currentW / 2 : w / 2;

  return (
    <mesh position={[currentX, y, d / 2]} receiveShadow castShadow>
      <boxGeometry args={[currentW + 0.02, SLAB_T, d + 0.02]} />
      {presentationMode === 'engineering' ? (
        <meshStandardMaterial color="#4f5b66" roughness={0.85} metalness={0.05} />
      ) : presentationMode === 'material' ? (
        <meshStandardMaterial
          {...(floorMatInfo || {})}
          color={floorColor}
          roughness={0.5}
          metalness={0.0}
          emissive="#f59e0b"
          emissiveIntensity={0.45}
        />
      ) : (
        <meshStandardMaterial
          {...(floorMatInfo || {})}
          color={floorColor}
          roughness={0.65}
          metalness={0.0}
        />
      )}
      {presentationMode === 'material' && floorIdx === 0 && (
        <Html position={[0, SLAB_T + 0.1, 0]} center>
          <div style={{ background: '#f59e0b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #fef3c7', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
            Flooring: {selections?.Flooring || 'Rubber Flooring'}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  WALL SEGMENTS
// ══════════════════════════════════════════════════════════════════════════════
function WallSegments({ length, wallH, position, rotation, matProps, windowSpacing, hasDoor, doorOffset, restrictWindows }) {
  const segments = useMemo(() => {
    const segs = [];
    const openings = [];

    if (hasDoor) {
      openings.push({
        center: doorOffset || length / 2,
        width: DOOR_W + 0.1,
        sillY: 0,
        height: DOOR_H,
        type: 'door',
      });
    }

    // Windows spacing adjusted if load bearing structure limits openings
    const spacing = restrictWindows ? windowSpacing * 1.5 : windowSpacing;
    const nWin = Math.max(0, Math.floor(length / spacing));

    if (nWin > 0) {
      const step = length / (nWin + 1);
      for (let i = 1; i <= nWin; i++) {
        const cx = i * step;
        const tooClose = openings.some(o => Math.abs(o.center - cx) < (DOOR_W + WIN_W) / 2 + 0.3);
        if (!tooClose) {
          openings.push({
            center: cx,
            width: restrictWindows ? WIN_W * 0.75 : WIN_W, // load-bearing windows are smaller
            sillY: WIN_SILL,
            height: restrictWindows ? WIN_H * 0.75 : WIN_H,
            type: 'window',
          });
        }
      }
    }

    openings.sort((a, b) => a.center - b.center);

    let cursor = 0;
    for (const op of openings) {
      const left = op.center - op.width / 2;
      const right = op.center + op.width / 2;

      if (left > cursor + 0.05) {
        segs.push({ x: cursor, w: left - cursor, y: 0, h: wallH });
      }
      if (op.sillY > 0.05) {
        segs.push({ x: left, w: op.width, y: 0, h: op.sillY });
      }
      const topOfOpening = op.sillY + op.height;
      if (topOfOpening < wallH - 0.05) {
        segs.push({ x: left, w: op.width, y: topOfOpening, h: wallH - topOfOpening });
      }
      cursor = right;
    }

    if (cursor < length - 0.05) {
      segs.push({ x: cursor, w: length - cursor, y: 0, h: wallH });
    }
    if (openings.length === 0) {
      segs.push({ x: 0, w: length, y: 0, h: wallH });
    }

    return { segs };
  }, [length, wallH, windowSpacing, hasDoor, doorOffset, restrictWindows]);

  return (
    <group position={position} rotation={rotation}>
      {segments.segs.map((seg, i) => (
        <mesh key={i} position={[seg.x + seg.w / 2, seg.y + seg.h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[seg.w, seg.h, EXT_T]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMMERCIAL GLASS CURTAIN WALL
// ══════════════════════════════════════════════════════════════════════════════
function CommercialGlassFacade({ w, d, floorIdx, frameColor }) {
  const yBase = floorIdx * FLOOR_H + SLAB_T;
  const frameMat = { color: frameColor, roughness: 0.3, metalness: 0.7 };
  
  const drawFacade = (length, pos, rot) => {
    const panels = Math.ceil(length / 1.5);
    const pW = length / panels;
    return (
      <group position={pos} rotation={rot}>
        {Array.from({ length: panels }).map((_, i) => {
          const cx = i * pW + pW / 2;
          return (
            <group key={i} position={[cx, WALL_H / 2, 0]}>
              {/* Glass pane */}
              <mesh>
                <planeGeometry args={[pW - 0.02, WALL_H - 0.02]} />
                <meshPhysicalMaterial 
                  color="#d4eaf7" 
                  transparent 
                  opacity={0.3} 
                  roughness={0.02} 
                  metalness={0.1}
                  transmission={0.9}
                  ior={1.52}
                  thickness={0.15}
                  side={THREE.DoubleSide} 
                />
              </mesh>
              {/* Metal frame profiles */}
              <mesh position={[pW / 2, 0, 0]}>
                <boxGeometry args={[0.05, WALL_H, 0.05]} />
                <meshStandardMaterial {...frameMat} />
              </mesh>
              <mesh position={[0, WALL_H / 2, 0]}>
                <boxGeometry args={[pW, 0.05, 0.05]} />
                <meshStandardMaterial {...frameMat} />
              </mesh>
              <mesh position={[0, -WALL_H / 2, 0]}>
                <boxGeometry args={[pW, 0.05, 0.05]} />
                <meshStandardMaterial {...frameMat} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  };

  return (
    <group position={[0, yBase, 0]}>
      {drawFacade(w, [0, 0, EXT_T / 2], [0, 0, 0])}
      {drawFacade(w, [0, 0, d - EXT_T / 2], [0, 0, 0])}
      {drawFacade(d - 2 * EXT_T, [EXT_T / 2, 0, EXT_T], [0, Math.PI / 2, 0])}
      {drawFacade(d - 2 * EXT_T, [w - EXT_T / 2, 0, EXT_T], [0, Math.PI / 2, 0])}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ARCHITECTURAL EXTERIOR WALLS
// ══════════════════════════════════════════════════════════════════════════════
function GlassCurtainSegment({ length, height, position, rotation, frameColor }) {
  const frameMat = { color: frameColor, roughness: 0.35, metalness: 0.7 };
  const panels = Math.ceil(length / 1.5);
  const pW = length / panels;
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: panels }).map((_, i) => {
        const cx = i * pW + pW / 2;
        return (
          <group key={i} position={[cx, height / 2, 0]}>
            {/* Glass pane */}
            <mesh>
              <planeGeometry args={[pW - 0.02, height - 0.02]} />
              <meshPhysicalMaterial 
                color="#d4eaf7" 
                transparent 
                opacity={0.3} 
                roughness={0.02} 
                metalness={0.1}
                transmission={0.9}
                ior={1.52}
                thickness={0.15}
                side={THREE.DoubleSide} 
              />
            </mesh>
            {/* Metal frame profiles */}
            <mesh position={[pW / 2, 0, 0]}>
              <boxGeometry args={[0.05, height, 0.05]} />
              <meshStandardMaterial {...frameMat} />
            </mesh>
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[pW, 0.05, 0.05]} />
              <meshStandardMaterial {...frameMat} />
            </mesh>
            <mesh position={[0, -height / 2, 0]}>
              <boxGeometry args={[pW, 0.05, 0.05]} />
              <meshStandardMaterial {...frameMat} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ArchitecturalWalls({ w, d, floorIdx, selections, palette, threeDMode, presentationMode, buildingType, structuralSystem, salinity }) {
  const yBase = floorIdx * FLOOR_H + SLAB_T;
  const isGround = floorIdx === 0;

  const wallMatInfo = useMemo(() => {
    if (presentationMode === 'engineering') {
      const col = WALL_HEX[String(selections?.Walls || '8')] || palette?.wall || '#d4d4d4';
      return { color: col, roughness: 0.75, metalness: 0.05 };
    }
    // Industrial defaults to metal panel texture
    const wallSel = buildingType === 'Industrial' ? '10' : selections?.Walls;
    const wm = getWallMaterial(wallSel, palette, presentationMode);
    
    // Corrosion-resistant coating color override in high salinity coastal climates
    let wallColor = wm.color;
    if (salinity === 'High' && (buildingType === 'Residential' || buildingType === 'Hospitality')) {
      wallColor = '#f5f4f0'; // Clean reflective anti-corrosive white/cream
    }

    const texMaps = getTexture(wm.texType, wallColor);
    return { ...texMaps, color: wallColor, roughness: wm.roughness, metalness: wm.metalness };
  }, [selections?.Walls, palette, presentationMode, buildingType, salinity]);

  const isDollhouse = presentationMode === 'dollhouse';
  const op = presentationMode === 'engineering' 
    ? 0.15 
    : (isDollhouse ? 1.0 : (threeDMode === 'interior' ? 0.25 : 0.95));
  
  const sd = (threeDMode === 'interior' || presentationMode === 'engineering') ? THREE.DoubleSide : THREE.FrontSide;
  
  let matProps = presentationMode === 'material' ? {
    ...wallMatInfo,
    emissive: '#f97316',
    emissiveIntensity: 0.45,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide
  } : {
    ...wallMatInfo,
    transparent: op < 1.0,
    opacity: op,
    side: sd,
  };

  const isLoadBearing = structuralSystem === 'Load Bearing';
  const showDetail = presentationMode === 'architectural' && buildingType !== 'Industrial' && buildingType !== 'Commercial';
  const isMixedUse = buildingType === 'Mixed Use';
  const isUpperMixed = isMixedUse && floorIdx > 0;
  const currentW = isUpperMixed ? w * 0.75 : w;
  const startX = isUpperMixed ? w * 0.125 : 0;
  const frameCol = FRAME_HEX[String(selections?.Windows || '22')] || '#4a5568';

  const isCommercialGlazedFront = buildingType === 'Commercial' || (isMixedUse && floorIdx === 0);

  return (
    <group position={[startX, yBase, 0]}>
      {/* Front wall (Hidden in interior cutaway view to expose building interiors) */}
      {threeDMode !== 'dollhouse' && threeDMode !== 'interior' && (
        isCommercialGlazedFront ? (
          <group>
            {/* Left solid pier */}
            <WallSegments
              length={currentW * 0.2}
              wallH={WALL_H}
              position={[0, 0, EXT_T / 2]}
              rotation={[0, 0, 0]}
              matProps={matProps}
              windowSpacing={WIN_SPACE}
              hasDoor={isGround}
              doorOffset={currentW * 0.1}
              restrictWindows={isLoadBearing}
            />
            {/* Center glass curtain segment */}
            <GlassCurtainSegment
              length={currentW * 0.6}
              height={WALL_H}
              position={[currentW * 0.2, 0, EXT_T / 2]}
              rotation={[0, 0, 0]}
              frameColor={frameCol}
            />
            {/* Right solid pier */}
            <WallSegments
              length={currentW * 0.2}
              wallH={WALL_H}
              position={[currentW * 0.8, 0, EXT_T / 2]}
              rotation={[0, 0, 0]}
              matProps={matProps}
              windowSpacing={WIN_SPACE}
              hasDoor={false}
              restrictWindows={isLoadBearing}
            />
          </group>
        ) : (
          <WallSegments
            length={currentW}
            wallH={WALL_H}
            position={[0, 0, EXT_T / 2]}
            rotation={[0, 0, 0]}
            matProps={matProps}
            windowSpacing={WIN_SPACE}
            hasDoor={isGround}
            doorOffset={currentW / 2}
            restrictWindows={isLoadBearing}
          />
        )
      )}

      {/* Back wall (stays solid for commercial) */}
      <WallSegments
        length={currentW}
        wallH={WALL_H}
        position={[0, 0, d - EXT_T / 2]}
        rotation={[0, 0, 0]}
        matProps={matProps}
        windowSpacing={WIN_SPACE}
        hasDoor={false}
        restrictWindows={isLoadBearing}
      />

      {/* Left wall (stays solid for commercial) */}
      <WallSegments
        length={d - 2 * EXT_T}
        wallH={WALL_H}
        position={[EXT_T / 2, 0, EXT_T]}
        rotation={[0, Math.PI / 2, 0]}
        matProps={matProps}
        windowSpacing={WIN_SPACE}
        hasDoor={false}
        restrictWindows={isLoadBearing}
      />

      {/* Right wall (stays solid for commercial) */}
      <WallSegments
        length={d - 2 * EXT_T}
        wallH={WALL_H}
        position={[currentW - EXT_T / 2, 0, EXT_T]}
        rotation={[0, Math.PI / 2, 0]}
        matProps={matProps}
        windowSpacing={WIN_SPACE}
        hasDoor={false}
        restrictWindows={isLoadBearing}
      />

      {/* Detail moldings for premium visual aesthetics */}
      {showDetail && (
        <group>
          {/* Plinth */}
          <mesh position={[currentW / 2, PLINTH_H / 2, 0]} castShadow>
            <boxGeometry args={[currentW + EXT_T + 0.06, PLINTH_H, EXT_T + 0.06]} />
            <meshStandardMaterial color="#828282" roughness={0.8} />
          </mesh>
          {/* Cornice */}
          <mesh position={[currentW / 2, WALL_H + CORNICE_H / 2, 0]}>
            <boxGeometry args={[currentW + EXT_T + 0.1, CORNICE_H, EXT_T + 0.06]} />
            <meshStandardMaterial color={palette?.trim || '#c8c8c8'} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Material view floating label overlay */}
      {presentationMode === 'material' && floorIdx === 0 && (
        <Html position={[currentW / 2, WALL_H / 2, EXT_T + 0.2]} center>
          <div style={{ background: '#f97316', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #ffedd5', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>
            Walling: {selections?.Walls || 'CSEB Wall'}
          </div>
        </Html>
      )}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERIOR PARTITIONS
// ══════════════════════════════════════════════════════════════════════════════
function InteriorPartitions({ rooms, w, d, floorIdx, selections, palette, threeDMode, presentationMode }) {
  const yMid = floorIdx * FLOOR_H + SLAB_T + WALL_H / 2;
  const tol = 0.5;
  const t = INT_T;

  const isDollhouse = presentationMode === 'dollhouse';
  const op = isDollhouse ? 1.0 : (threeDMode === 'interior' ? 0.35 : 0.9);
  const color = isDollhouse ? '#ffffff' : (WALL_HEX[String(selections?.Walls || '8')] || palette?.wall || '#d4d4d4');
  const mat = { color, transparent: op < 1.0, opacity: op, roughness: 0.75, side: THREE.DoubleSide };

  const segments = useMemo(() => {
    const wallSegments = [];
    const seen = new Set();

    rooms.forEach(r => {
      const rx = Math.round(r.x * 100) / 100;
      const ry = Math.round(r.y * 100) / 100;
      const rw = Math.round(r.w * 100) / 100;
      const rh = Math.round(r.h * 100) / 100;

      const edges = [
        { x1: rx, z1: ry, x2: rx + rw, z2: ry, isVert: false },
        { x1: rx, z1: ry + rh, x2: rx + rw, z2: ry + rh, isVert: false },
        { x1: rx, z1: ry, x2: rx, z2: ry + rh, isVert: true },
        { x1: rx + rw, z1: ry, x2: rx + rw, z2: ry + rh, isVert: true },
      ];

      edges.forEach(e => {
        // Exclude exterior perimeter walls (handled by ArchitecturalWalls)
        if (e.isVert) {
          if (e.x1 <= tol || e.x1 >= w - tol) return;
        } else {
          if (e.z1 <= tol || e.z1 >= d - tol) return;
        }

        const key = e.isVert
          ? `V_${Math.round(e.x1 * 10) / 10}_${Math.round(e.z1 * 10) / 10}_${Math.round(e.z2 * 10) / 10}`
          : `H_${Math.round(e.z1 * 10) / 10}_${Math.round(e.x1 * 10) / 10}_${Math.round(e.x2 * 10) / 10}`;

        if (!seen.has(key)) {
          seen.add(key);
          wallSegments.push(e);
        }
      });
    });

    return wallSegments;
  }, [rooms, w, d]);

  if (threeDMode === 'exterior' && presentationMode !== 'dollhouse') return null;

  return (
    <group>
      {segments.map((seg, i) => {
        if (seg.isVert) {
          const len = seg.z2 - seg.z1;
          const cz = seg.z1 + len / 2;
          return (
            <mesh key={`v${i}`} position={[seg.x1, yMid, cz]} castShadow>
              <boxGeometry args={[t, WALL_H, len]} />
              <meshStandardMaterial {...mat} />
            </mesh>
          );
        } else {
          const len = seg.x2 - seg.x1;
          const cx = seg.x1 + len / 2;
          return (
            <mesh key={`h${i}`} position={[cx, yMid, seg.z1]} castShadow>
              <boxGeometry args={[len, WALL_H, t]} />
              <meshStandardMaterial {...mat} />
            </mesh>
          );
        }
      })}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOF STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════
function RoofStructure({ w, d, numFloors, roofProfile, selections, palette, threeDMode, presentationMode, buildingType, rainfall, location }) {
  const { buildingRequirements } = useMaterial() || {};
  const isSolarReady = buildingRequirements?.solar_ready === true;

  const baseY = numFloors * FLOOR_H;
  let type = (roofProfile?.type || 'flat').toLowerCase();
  const pitch = roofProfile?.pitch || 15;
  
  // High rainfall areas (Colombo, Galle, Kandy) extend roof overhangs for shelter
  const hasRainfall = parseInt(rainfall) > 2000 || ['colombo', 'galle', 'kandy'].some(c => (location || '').toLowerCase().includes(c));
  const ov = hasRainfall ? 1.0 : (roofProfile?.overhang || 0.3);

  // Commercial & Mixed Use default to flat roof; Industrial defaults to steel gable
  if (buildingType === 'Commercial' || buildingType === 'Mixed Use') {
    type = 'flat';
  } else if (buildingType === 'Industrial') {
    type = 'gable';
  } else if (['kandy', 'nuwara'].some(c => (location || '').toLowerCase().includes(c))) {
    type = 'gable'; // pitched in hill region
  }

  const roofMatInfo = useMemo(() => {
    if (presentationMode === 'engineering') {
      return { color: ROOF_HEX[String(selections?.Roof || '')] || palette?.roof || '#4a5568' };
    }
    const rm = getRoofMaterial(selections?.Roof, palette, presentationMode);
    const texMaps = getTexture(rm.texType, rm.color);
    return { ...texMaps, color: rm.color, roughness: rm.roughness, metalness: rm.metalness };
  }, [selections?.Roof, palette, presentationMode]);

  const geometry = useMemo(() => {
    if (type === 'flat') return null;
    if (type.includes('hip')) return createHippedRoof(w, d, pitch, ov);
    if (type.includes('gable')) return createGableRoof(w, d, pitch, ov);
    return createGableRoof(w, d, pitch * 0.6, ov);
  }, [type, w, d, pitch, ov]);

  if (presentationMode === 'dollhouse') return null;
  if (threeDMode !== 'exterior') return null;

  const isMaterialHighlight = presentationMode === 'material';
  const rH = Math.max(0.5, (d / 2 + ov) * Math.tan((pitch * Math.PI) / 180));
  const labelY = geometry ? rH + 0.6 : 0.6;

  let matProps = isMaterialHighlight ? {
    ...roofMatInfo,
    emissive: '#10b981',
    emissiveIntensity: 0.45,
    side: THREE.DoubleSide
  } : {
    ...roofMatInfo,
    side: THREE.DoubleSide
  };

  // ── Flat / Parapet Roof ──
  if (!geometry) {
    const parapetH = 0.5;
    const parapetT = 0.12;
    const padXZ = 0.15;
    
    const isGreen = String(selections?.Roof || '').toLowerCase().includes('green') || 
                    String(selections?.Roof || '').toLowerCase().includes('vegetation') || 
                    String(selections?.Roof || '').toLowerCase().includes('eco');

    const structureMat = isMaterialHighlight ? matProps : {
      color: '#8b8e93', // Clean light concrete grey for edge details
      roughness: 0.8,
      metalness: 0.1
    };

    return (
      <group position={[0, baseY, 0]}>
        {/* Main Slab */}
        <mesh position={[w / 2, SLAB_T / 2, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w + padXZ * 2, SLAB_T * 1.5, d + padXZ * 2]} />
          <meshStandardMaterial {...structureMat} />
        </mesh>

        {/* Green Vegetation Layer (rendered only inside the parapet walls for Green Roofs) */}
        {isGreen && !isMaterialHighlight && (
          <mesh position={[w / 2, SLAB_T * 1.25 + 0.005, d / 2]} castShadow receiveShadow>
            <boxGeometry args={[w + padXZ * 2 - parapetT * 2, 0.02, d + padXZ * 2 - parapetT * 2]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        )}

        {/* If not a green roof, cover the top deck with the selected roof material */}
        {!isGreen && !isMaterialHighlight && (
          <mesh position={[w / 2, SLAB_T * 1.25 + 0.005, d / 2]} castShadow receiveShadow>
            <boxGeometry args={[w + padXZ * 2 - 0.02, 0.01, d + padXZ * 2 - 0.02]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        )}

        {/* Parapets */}
        {[
          [w / 2, SLAB_T * 1.25 + parapetH / 2, -padXZ, w + padXZ * 2 + parapetT, parapetH, parapetT],
          [w / 2, SLAB_T * 1.25 + parapetH / 2, d + padXZ, w + padXZ * 2 + parapetT, parapetH, parapetT],
          [-padXZ, SLAB_T * 1.25 + parapetH / 2, d / 2, parapetT, parapetH, d + padXZ * 2],
          [w + padXZ, SLAB_T * 1.25 + parapetH / 2, d / 2, parapetT, parapetH, d + padXZ * 2],
        ].map(([x, y, z, bw, bh, bd], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <boxGeometry args={[bw, bh, bd]} />
            <meshStandardMaterial {...structureMat} />
          </mesh>
        ))}

        {/* Dynamic Solar Panels Grid for Flat Roof */}
        {isSolarReady && !isMaterialHighlight && (
          <group position={[w / 2, SLAB_T * 1.35, d / 2]}>
            {[[ -w / 4, -d / 4 ], [ w / 4, -d / 4 ], [ -w / 4, d / 4 ], [ w / 4, d / 4 ]].map((pos, i) => (
              <group key={i} position={[pos[0], 0.1, pos[1]]} rotation={[0.22, 0, 0]}>
                {/* Silicon panel */}
                <mesh castShadow>
                  <boxGeometry args={[1.5, 0.03, 0.95]} />
                  <meshStandardMaterial color="#0c1b33" roughness={0.1} metalness={0.9} />
                </mesh>
                {/* Aluminum frame */}
                <mesh>
                  <boxGeometry args={[1.52, 0.04, 0.97]} wireframe />
                  <meshStandardMaterial color="#d1d5db" metalness={0.8} />
                </mesh>
                {/* Support mount legs */}
                <mesh position={[0, -0.15, -0.4]} rotation={[0.3, 0, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.35]} />
                  <meshStandardMaterial color="#9ca3af" metalness={0.8} />
                </mesh>
              </group>
            ))}
          </group>
        )}

        {isMaterialHighlight && (
          <Html position={[w / 2, labelY, d / 2]} center>
            <div style={{ background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #d1fae5', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
              Roofing: {selections?.Roof || 'Green Roof'}
            </div>
          </Html>
        )}
      </group>
    );
  }

  // ── Pitched / Industrial Gable Roof with Skylights ──
  const isIndustrial = buildingType === 'Industrial';

  return (
    <group position={[0, baseY, 0]}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Dynamic Solar Panels Grid for Pitched Roof (flat against the south slope) */}
      {isSolarReady && !isMaterialHighlight && (
        <group position={[w / 2, rH / 2 + 0.12, d * 0.72]} rotation={[- (pitch * Math.PI) / 180, 0, 0]}>
          {[-w / 3.5, 0, w / 3.5].map((xPos, i) => (
            <group key={i} position={[xPos, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.4, 0.02, 0.95]} />
                <meshStandardMaterial color="#0c1b33" roughness={0.12} metalness={0.95} />
              </mesh>
              <mesh>
                <boxGeometry args={[1.42, 0.03, 0.97]} wireframe />
                <meshStandardMaterial color="#d1d5db" metalness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Industrial Skylights */}
      {isIndustrial && !isMaterialHighlight && (
        <mesh position={[w / 2, rH + 0.05, d / 2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[w - 3, 0.1, 1.5]} />
          <meshPhysicalMaterial color="#cceeff" transparent opacity={0.65} roughness={0.05} metalness={0.2} />
        </mesh>
      )}
      {/* Heavy rainfall adaptation: Gutters and drainage pipes */}
      {hasRainfall && (
        <group>
          {/* Gutters along eaves */}
          <mesh position={[w / 2, -0.05, -ov - 0.04]} castShadow>
            <boxGeometry args={[w + 2 * ov + 0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#52525b" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[w / 2, -0.05, d + ov + 0.04]} castShadow>
            <boxGeometry args={[w + 2 * ov + 0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#52525b" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Vertical downspout cylinders */}
          {[-ov, w + ov].map((x, i) => (
            <mesh key={i} position={[x, -baseY / 2, -ov - 0.04]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, baseY, 8]} />
              <meshStandardMaterial color="#52525b" roughness={0.4} metalness={0.7} />
            </mesh>
          ))}
        </group>
      )}
      {isMaterialHighlight && (
        <Html position={[w / 2, labelY, d / 2]} center>
          <div style={{ background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #d1fae5', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
            Roofing: {selections?.Roof || 'Green Roof'}
          </div>
        </Html>
      )}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VERANDAH
// ══════════════════════════════════════════════════════════════════════════════
function Verandah({ w, d, archStyle, palette, presentationMode, buildingType }) {
  if (presentationMode !== 'architectural') return null;
  // Industrial and Commercial don't get porches
  if (buildingType === 'Commercial' || buildingType === 'Industrial') return null;
  if (!archStyle?.has_verandah) return null;
  
  const depth = 2.5;
  const colStyle = archStyle.column_style || 'round';
  return (
    <group position={[0, 0, -depth]}>
      <mesh position={[w / 2, SLAB_T / 2, depth / 2]} receiveShadow castShadow>
        <boxGeometry args={[w, SLAB_T, depth]} />
        <meshStandardMaterial color={palette?.floor || '#c0b0a0'} roughness={0.7} />
      </mesh>
      {[0.4, w - 0.4].map((x, i) => (
        <mesh key={i} position={[x, WALL_H / 2 + SLAB_T, 0.2]} castShadow>
          {colStyle === 'round' ? (
            <cylinderGeometry args={[0.12, 0.14, WALL_H, 12]} />
          ) : (
            <boxGeometry args={[0.2, WALL_H, 0.2]} />
          )}
          <meshStandardMaterial color={palette?.trim || '#f0ece8'} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[w / 2, WALL_H + SLAB_T + 0.06, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.3, 0.12, depth + 0.3]} />
        <meshStandardMaterial color={palette?.roof || '#6b5040'} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  BALCONY & TERRACES
// ══════════════════════════════════════════════════════════════════════════════
function Balcony({ w, floorIdx, archStyle, palette, presentationMode, buildingType }) {
  if (presentationMode === 'engineering') return null;
  if (buildingType === 'Industrial' || buildingType === 'Commercial') return null;

  // Hospitality guarantees balconies
  const hasBalcony = archStyle?.has_balcony || buildingType === 'Hospitality';
  if (!hasBalcony || floorIdx === 0) return null;

  const depth = 1.5;
  const yBase = floorIdx * FLOOR_H + SLAB_T;
  const balconyType = archStyle?.balcony_type || 'glass_rail';

  return (
    <group position={[0, yBase, -depth]}>
      <mesh position={[w / 2, -SLAB_T / 2, depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.6, SLAB_T, depth]} />
        <meshStandardMaterial color="#808080" roughness={0.7} />
      </mesh>
      {/* Railings */}
      {balconyType.includes('glass') || buildingType === 'Hospitality' ? (
        <mesh position={[w / 2, 0.5, 0.02]} castShadow>
          <boxGeometry args={[w * 0.6, 1.0, 0.02]} />
          <meshPhysicalMaterial color="#aee5ff" transparent opacity={0.35} roughness={0.05} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
      ) : (
        <group>
          <mesh position={[w / 2, 1.0, 0.03]}>
            <boxGeometry args={[w * 0.6 + 0.05, 0.05, 0.05]} />
            <meshStandardMaterial color={palette?.trim || '#8b7860'} roughness={0.6} />
          </mesh>
          {Array.from({ length: 6 }).map((_, i) => {
            const px = w * 0.2 + (i / 5) * w * 0.6;
            return (
              <mesh key={i} position={[px, 0.5, 0.03]}>
                <boxGeometry args={[0.03, 1.0, 0.03]} />
                <meshStandardMaterial color={palette?.trim || '#8b7860'} roughness={0.6} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXTERIOR WINDOWS
// ══════════════════════════════════════════════════════════════════════════════
function ExteriorWindows({ w, d, floorIdx, frameColor, threeDMode, presentationMode, buildingType, location, selections }) {
  const { buildingRequirements } = useMaterial() || {};
  const isHighVentilation = buildingRequirements?.cross_ventilation === 'High';

  const winW = isHighVentilation ? WIN_W * 1.55 : WIN_W;
  const winH = isHighVentilation ? WIN_H * 1.25 : WIN_H;

  const isArch = presentationMode === 'architectural' || presentationMode === 'dollhouse';

  const positions = useMemo(() => {
    const result = [];
    const addWall = (len, makePosn) => {
      const n = Math.max(1, Math.floor(len / WIN_SPACE));
      const step = len / (n + 1);
      for (let i = 1; i <= n; i++) result.push(makePosn(i * step));
    };
    addWall(w, x => ({ x, z: -0.02, ry: 0, isFront: true }));
    addWall(w, x => ({ x, z: d + 0.02, ry: 0, isFront: false }));
    addWall(d, z => ({ x: -0.02, z, ry: Math.PI / 2, isFront: false }));
    addWall(d, z => ({ x: w + 0.02, z, ry: Math.PI / 2, isFront: false }));
    return result;
  }, [w, d]);

  if (threeDMode === 'dollhouse') return null;

  const yCenter = floorIdx * FLOOR_H + SLAB_T + WIN_SILL + winH / 2;
  const glassOp = threeDMode === 'interior' ? 0.15 : 0.4;
  const isJaffna = (location || '').toLowerCase().includes('jaffna');
  const isMaterialHighlight = presentationMode === 'material';

  const isCommercial = buildingType === 'Commercial';

  return (
    <group>
      {positions.map((p, i) => {
        // Skip front windows for Commercial since it uses the center glass curtain segment
        if (isCommercial && p.isFront) return null;

        return (
          <group key={i} position={[p.x, yCenter, p.z]} rotation={[0, p.ry, 0]}>
            {/* Glass Pane */}
            {!isMaterialHighlight && (
              <mesh>
                <planeGeometry args={[winW, winH]} />
                <meshPhysicalMaterial
                  color={isArch ? "#d5effd" : "#88ccff"}
                  transparent
                  opacity={0.3}
                  roughness={0.02}
                  metalness={0.1}
                  transmission={0.9}
                  ior={1.52}
                  thickness={0.15}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Outer Frame */}
            {[
              [0, winH / 2, 0, winW + 0.08, 0.05, 0.05],
              [0, -winH / 2, 0, winW + 0.08, 0.05, 0.05],
              [-winW / 2, 0, 0, 0.05, winH + 0.08, 0.05],
              [winW / 2, 0, 0, 0.05, winH + 0.08, 0.05],
            ].map(([fx, fy, fz, fw, fh, fd], j) => (
              <mesh key={j} position={[fx, fy, fz]}>
                <boxGeometry args={[fw, fh, fd]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  roughness={0.4} 
                  metalness={0.3} 
                  emissive={isMaterialHighlight ? "#06b6d4" : undefined}
                  emissiveIntensity={isMaterialHighlight ? 0.45 : undefined}
                />
              </mesh>
            ))}
            {/* Hot/Dry Jaffna climate adaptation: window shading pergola louvers */}
            {isJaffna && isArch && !isMaterialHighlight && (
              <mesh position={[0, winH / 2 + 0.12, 0.2]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[winW + 0.3, 0.04, 0.35]} />
                <meshStandardMaterial color="#8c6239" roughness={0.7} />
              </mesh>
            )}

            {/* Material Highlight Badge */}
            {isMaterialHighlight && floorIdx === 0 && i === 0 && (
              <Html position={[0, winH / 2 + 0.2, 0.2]} center>
                <div style={{ background: '#06b6d4', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #ecfeff', boxShadow: '0 4px 12px rgba(6,182,212,0.35)' }}>
                  Windows: {selections?.Windows || 'uPVC Windows'}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENTRANCE DOOR
// ══════════════════════════════════════════════════════════════════════════════
function EntranceDoor({ w, selections, threeDMode, presentationMode, buildingType }) {
  if (threeDMode === 'interior') return null;
  const y = SLAB_T + DOOR_H / 2;
  const isArch = presentationMode === 'architectural' || presentationMode === 'dollhouse';
  const isMaterialHighlight = presentationMode === 'material';

  const doorMatProps = useMemo(() => {
    if (!isArch && !isMaterialHighlight) {
      return { color: DOOR_HEX[String(selections?.Doors || '17')] || '#8b6914', roughness: 0.5, metalness: 0.1 };
    }
    const dm = getDoorMaterial(selections?.Doors);
    const texMaps = getTexture(dm.texType, dm.color);
    return { ...texMaps, color: dm.color, roughness: dm.roughness, metalness: dm.metalness };
  }, [selections?.Doors, isArch, isMaterialHighlight]);

  let activeMatProps = isMaterialHighlight ? {
    ...doorMatProps,
    emissive: '#06b6d4',
    emissiveIntensity: 0.45
  } : doorMatProps;

  // Industrial uses rolling shutter doors
  if (buildingType === 'Industrial') {
    const doorW = 3.2, doorH = 2.8;
    return (
      <group position={[w / 2, doorH / 2 + SLAB_T, 0.02]}>
        <mesh castShadow>
          <boxGeometry args={[doorW, doorH, 0.05]} />
          <meshStandardMaterial 
            color="#8d99ae" 
            roughness={0.5} 
            metalness={0.7} 
            emissive={isMaterialHighlight ? "#06b6d4" : undefined}
            emissiveIntensity={isMaterialHighlight ? 0.45 : undefined}
          />
        </mesh>
        {!isMaterialHighlight && (
          <mesh position={[0, doorH / 2 + 0.04, 0]}>
            <boxGeometry args={[doorW + 0.12, 0.08, 0.08]} />
            <meshStandardMaterial color="#2d3748" roughness={0.4} />
          </mesh>
        )}
        {isMaterialHighlight && (
          <Html position={[0, doorH / 2 + 0.3, 0.1]} center>
            <div style={{ background: '#06b6d4', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #ecfeff', boxShadow: '0 4px 12px rgba(6,182,212,0.35)' }}>
              Doors: {selections?.Doors || 'Solid Teak Wood Door'}
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Commercial uses automatic glass doors
  if (buildingType === 'Commercial') {
    return (
      <group position={[w / 2, y, 0.02]}>
        <mesh>
          <boxGeometry args={[DOOR_W * 1.5, DOOR_H, 0.04]} />
          <meshPhysicalMaterial 
            color="#cceeff" 
            transparent 
            opacity={isMaterialHighlight ? 0.6 : 0.3} 
            transmission={0.9} 
            roughness={0.05} 
            metalness={0.1}
            emissive={isMaterialHighlight ? "#06b6d4" : undefined}
            emissiveIntensity={isMaterialHighlight ? 0.45 : undefined}
          />
        </mesh>
        {!isMaterialHighlight && (
          <mesh position={[0, DOOR_H / 2 + 0.04, 0]}>
            <boxGeometry args={[DOOR_W * 1.5 + 0.1, 0.08, 0.08]} />
            <meshStandardMaterial color="#4a5568" roughness={0.3} metalness={0.7} />
          </mesh>
        )}
        {isMaterialHighlight && (
          <Html position={[0, DOOR_H / 2 + 0.3, 0.1]} center>
            <div style={{ background: '#06b6d4', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #ecfeff', boxShadow: '0 4px 12px rgba(6,182,212,0.35)' }}>
              Doors: {selections?.Doors || 'Solid Teak Wood Door'}
            </div>
          </Html>
        )}
      </group>
    );
  }

  return (
    <group position={[w / 2, y, -0.02]}>
      <mesh castShadow>
        <boxGeometry args={[DOOR_W, DOOR_H, 0.06]} />
        <meshStandardMaterial 
          {...activeMatProps} 
          color={presentationMode === 'dollhouse' ? '#ffff00' : activeMatProps.color} 
          wireframe={presentationMode === 'dollhouse'} 
        />
      </mesh>
      {/* Handle */}
      {!isMaterialHighlight && (
        <mesh position={[DOOR_W / 2 - 0.12, -0.1, 0.04]}>
          <boxGeometry args={[0.03, 0.12, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
        </mesh>
      )}
      {isMaterialHighlight && (
        <Html position={[0, DOOR_H / 2 + 0.3, 0.1]} center>
          <div style={{ background: '#06b6d4', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #ecfeff', boxShadow: '0 4px 12px rgba(6,182,212,0.35)' }}>
            Doors: {selections?.Doors || 'Solid Teak Wood Door'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Note: RoomFurniture is now imported from external RoomFurniture.jsx component file

function RoomClickArea({ room, floorIdx, isSelected, onSelect, threeDMode, presentationMode, onHover }) {
  if (threeDMode === 'exterior' || presentationMode === 'architectural') return null;
  const y = floorIdx * FLOOR_H + SLAB_T + 0.02;
  const typeColor = room.type === 'WET' ? '#1e40af' : room.type === 'SERVICE' ? '#374151' : '#065f46';
  return (
    <mesh
      position={[room.x + room.w / 2, y, room.y + room.h / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect({ ...room, floorIdx });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (onHover) onHover(room.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (onHover) onHover(null);
      }}
      receiveShadow
    >
      <planeGeometry args={[room.w - 0.04, room.h - 0.04]} />
      <meshStandardMaterial
        color={isSelected ? '#00ff9d' : typeColor}
        transparent
        opacity={isSelected ? 0.45 : 0.12}
        roughness={0.9}
      />
    </mesh>
  );
}

function RoomLighting({ room, floorIdx, presentationMode, threeDMode }) {
  if (presentationMode !== 'architectural' || threeDMode === 'exterior') return null;
  const cx = room.x + room.w / 2;
  const cz = room.y + room.h / 2;
  const y = floorIdx * FLOOR_H + SLAB_T + WALL_H - 0.1;
  return (
    <group position={[cx, y, cz]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff0dd" emissiveIntensity={2.5} />
      </mesh>
      <pointLight color="#ffebd6" intensity={1.5} distance={7} decay={2} castShadow={false} />
    </group>
  );
}

function RoomLabel({ room, floorIdx, isSelected, presentationMode }) {
  if (presentationMode === 'architectural') return null;
  const y = floorIdx * FLOOR_H + SLAB_T + WALL_H * 0.5;
  return (
    <Html center position={[room.x + room.w / 2, y, room.y + room.h / 2]} style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        color: isSelected ? '#00ff9d' : '#fff',
        fontSize: '9px',
        fontWeight: 800,
        padding: '3px 7px',
        borderRadius: '4px',
        letterSpacing: '1.2px',
        whiteSpace: 'nowrap',
        border: isSelected ? '1px solid #00ff9d' : '1px solid rgba(255,255,255,0.1)'
      }}>
        {room.label.toUpperCase()}
      </div>
    </Html>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SCENE CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════
function Scene({
  blueprint, threeDMode, selections, showLabels, showFurniture,
  selectedRoom, onSelectRoom, activeFloor,
  presentationMode, landscapeData, styleAnalysis, buildingType, structuralSystem, location, rainfall, salinity
}) {
  const [hoveredRoomId, setHoveredRoomId] = React.useState(null);
  const { buildingRequirements } = useMaterial() || {};
  const fp = blueprint.footprint || { w: 10, h: 8 };
  const bForm = blueprint.building_form || {};
  const archStyle = blueprint.architectural_style || {};
  const roofProf = bForm.roof_profile || {};
  const palette = archStyle.color_palette || {};
  const numFloors = blueprint.floors_data.length;

  const frameCol = resolveWindowFrameColor(selections?.Windows);
  const floorsToRender = activeFloor === -1 ? blueprint.floors_data : [blueprint.floors_data[activeFloor]].filter(Boolean);

  const cx = fp.w / 2;
  const cz = fp.h / 2;
  const effectiveThreeDMode = presentationMode === 'dollhouse' ? 'dollhouse' : threeDMode;

  const loc = (location || '').toLowerCase();
  const saline = (salinity || '').toLowerCase();
  const rain = parseInt(rainfall) || 0;
  const isCoastal = loc.includes('trinco') || loc.includes('colombo') || loc.includes('galle') || saline === 'high' || saline === 'extreme';
  const isWet = rain > 2000 || loc.includes('kandy') || loc.includes('nuwara');

  // Background and fog colors tailored to presentation modes
  const bgColor = presentationMode === 'engineering' 
    ? '#12131c' 
    : (isCoastal ? '#f0f9ff' : (isWet ? '#f0f4f1' : '#fcfcfc')); // Sunny sky-blue backdrop for coastal

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 50, 180]} />

      <ambientLight intensity={presentationMode === 'dollhouse' ? 1.3 : (presentationMode === 'architectural' ? 0.85 : 0.4)} />
      <hemisphereLight
        args={[
          presentationMode === 'dollhouse' ? '#ffffff' : (presentationMode === 'architectural' ? '#ffffff' : '#87ceeb'),
          presentationMode === 'dollhouse' ? '#cfe0c3' : '#5c5240',
          presentationMode === 'dollhouse' ? 1.0 : (presentationMode === 'architectural' ? 0.65 : 0.25),
        ]}
      />
      <directionalLight
        position={presentationMode === 'dollhouse' ? [cx + 12, 45, cz + 15] : [fp.w + 20, 30, fp.h + 25]}
        intensity={presentationMode === 'dollhouse' ? 2.2 : (presentationMode === 'architectural' ? 4.2 : 1.1)}
        color={presentationMode === 'architectural' ? '#fefcf0' : '#ffffff'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />

      {(presentationMode === 'architectural' || presentationMode === 'engineering' || presentationMode === 'material') && (
        <Sky sunPosition={[fp.w + 20, 20, fp.h + 25]} turbidity={1.2} rayleigh={0.4} />
      )}
      {(presentationMode === 'architectural' || presentationMode === 'material') && (
        <SafeEnvironment preset="city" background={false} environmentIntensity={0.8} />
      )}
      {presentationMode === 'dollhouse' && (
        <SafeEnvironment preset="studio" background={false} environmentIntensity={0.5} />
      )}

      {(presentationMode === 'architectural' || presentationMode === 'material') && (
        <ContactShadows position={[cx, 0.005, cz]} opacity={0.75} scale={Math.max(fp.w, fp.h) * 2.8} blur={1.4} far={8} color="#18181b" />
      )}

      {/* Concrete Plinth Foundation base */}
      {presentationMode !== 'engineering' && (
        <mesh position={[cx, -0.25, cz]} receiveShadow castShadow>
          <boxGeometry args={[fp.w + 0.5, 0.5, fp.h + 0.5]} />
          <meshStandardMaterial color="#b8b8b8" roughness={0.9} metalness={0.1} />
        </mesh>
      )}

      {/* Rainwater Harvesting Tank (rendered next to front-left downspout on ground level) */}
      {buildingRequirements?.rainwater_harvesting && presentationMode !== 'engineering' && (
        <group position={[-0.7, 0.6, -0.5]}>
          {/* Main Tank Cylinder */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 1.2, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
          {/* Tank Top Lid */}
          <mesh position={[0, 0.61, 0]} castShadow>
            <cylinderGeometry args={[0.37, 0.37, 0.04, 16]} />
            <meshStandardMaterial color="#064e3b" roughness={0.8} />
          </mesh>
          {/* Inlet Pipe connecting to gutter downspout */}
          <mesh position={[0.2, 0.8, 0.2]} rotation={[0, 0, -0.5]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.6]} />
            <meshStandardMaterial color="#4b5563" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Accessibility Ramp for Elderly Occupants (at the front entrance door) */}
      {buildingRequirements?.elderly_access_required && presentationMode !== 'engineering' && (
        <group position={[fp.w / 2, 0, -1.25]}>
          {/* Ramp concrete slab */}
          <mesh position={[0, PLINTH_H / 4, 0]} rotation={[0.08, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[1.2, 0.06, 2.5]} />
            <meshStandardMaterial color="#4b5563" roughness={0.8} />
          </mesh>
          {/* Safety metal handrails */}
          {[-0.6, 0.6].map((xOffset, i) => (
            <group key={i} position={[xOffset, 0.4, 0]} rotation={[0.08, 0, 0]}>
              {/* Horizontal top rail */}
              <mesh castShadow>
                <boxGeometry args={[0.03, 0.03, 2.5]} />
                <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Vertical posts */}
              {[-1.0, 0, 1.0].map((zOffset, j) => (
                <mesh key={j} position={[0, -0.3, zOffset]} rotation={[-0.08, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.015, 0.015, 0.6]} />
                  <meshStandardMaterial color="#9ca3af" metalness={0.9} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* Landscape surroundings */}
      <LandscapeScene 
        landscapeData={landscapeData} 
        siteW={fp.w} 
        siteD={fp.h} 
        presentationMode={presentationMode}
        location={location}
        salinity={salinity}
        rainfall={rainfall}
        buildingType={buildingType}
      />

      {/* Structural Framing System (level-by-level columns/beams) */}
      <ProceduralExposedStructure 
        w={fp.w} 
        d={fp.h} 
        numFloors={numFloors} 
        structuralSystem={structuralSystem} 
        activeFloor={activeFloor}
        presentationMode={presentationMode}
      />

      {/* Floor by floor details */}
      {floorsToRender.map((floor, fIdx) => {
        const realIdx = activeFloor === -1 ? fIdx : activeFloor;
        return (
          <group key={realIdx}>
            <FloorSlab
              w={fp.w} d={fp.h} floorIdx={realIdx}
              selections={selections} presentationMode={presentationMode}
              buildingType={buildingType}
            />

            <ArchitecturalWalls
              w={fp.w} d={fp.h} floorIdx={realIdx}
              selections={selections} palette={palette}
              threeDMode={effectiveThreeDMode} presentationMode={presentationMode}
              buildingType={buildingType} structuralSystem={structuralSystem}
              salinity={salinity}
            />

            <InteriorPartitions
              rooms={floor.rooms} w={fp.w} d={fp.h}
              floorIdx={realIdx} selections={selections} palette={palette}
              threeDMode={effectiveThreeDMode} presentationMode={presentationMode}
            />

            <ExteriorWindows
              w={fp.w} d={fp.h} floorIdx={realIdx}
              frameColor={frameCol} threeDMode={effectiveThreeDMode}
              presentationMode={presentationMode} buildingType={buildingType}
              location={location} selections={selections}
            />

            {realIdx === 0 && (
              <EntranceDoor
                w={fp.w} selections={selections}
                threeDMode={effectiveThreeDMode} presentationMode={presentationMode}
                buildingType={buildingType}
              />
            )}

            <Balcony
              w={fp.w} floorIdx={realIdx}
              archStyle={archStyle} palette={palette}
              presentationMode={presentationMode} buildingType={buildingType}
            />

            {floor.rooms.map((room, rIdx) => {
              const isRoomSelected = selectedRoom?.id === room.id && selectedRoom?.floorIdx === realIdx;
              return (
                <group key={rIdx}>
                  <RoomClickArea
                    room={room} floorIdx={realIdx}
                    isSelected={isRoomSelected} onSelect={onSelectRoom}
                    threeDMode={effectiveThreeDMode} presentationMode={presentationMode}
                    onHover={setHoveredRoomId}
                  />
                  {showLabels && effectiveThreeDMode !== 'exterior' && (hoveredRoomId === room.id || isRoomSelected) && (
                    <RoomLabel room={room} floorIdx={realIdx} isSelected={isRoomSelected} presentationMode={presentationMode} />
                  )}
                  {showFurniture && effectiveThreeDMode !== 'exterior' && (
                    <RoomFurniture room={room} floorIdx={realIdx} presentationMode={presentationMode} />
                  )}
                  <RoomLighting room={room} floorIdx={realIdx} presentationMode={presentationMode} threeDMode={effectiveThreeDMode} />
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Roof structure */}
      <RoofStructure
        w={fp.w} d={fp.h} numFloors={numFloors}
        roofProfile={roofProf} selections={selections} palette={palette}
        threeDMode={effectiveThreeDMode} presentationMode={presentationMode}
        buildingType={buildingType} rainfall={rainfall} location={location}
      />

      {/* Porch / Verandah */}
      <Verandah
        w={fp.w} d={fp.h}
        archStyle={archStyle} palette={palette}
        presentationMode={presentationMode} buildingType={buildingType}
      />

      {/* Canopy */}
      <EntranceCanopy
        w={fp.w} entranceHierarchy={bForm.entrance_hierarchy}
        palette={palette} presentationMode={presentationMode}
      />

      <OrbitControls
        makeDefault
        enableZoom
        enablePan
        enableRotate
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={120}
        maxPolarAngle={effectiveThreeDMode === 'dollhouse' ? Math.PI / 2.6 : Math.PI / 2 - 0.05}
        target={[cx, (numFloors * FLOOR_H) / 3, cz]}
      />
    </>
  );
}

// Entrance canopy placeholder fallback
function EntranceCanopy({ w, entranceHierarchy, palette, presentationMode }) {
  if (presentationMode !== 'architectural' || !entranceHierarchy) return null;
  const canW = entranceHierarchy.canopy_width || 2.4;
  const canD = entranceHierarchy.canopy_depth || 1.4;
  const cx = w / 2;
  return (
    <mesh position={[cx, DOOR_H + SLAB_T + 0.12, -canD / 2]} castShadow receiveShadow>
      <boxGeometry args={[canW, 0.1, canD]} />
      <meshStandardMaterial color={palette?.trim || '#64748b'} roughness={0.5} />
    </mesh>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
function Building3DModel({
  blueprint,
  threeDMode = 'exterior',
  selections = {},
  showLabels = true,
  showFurniture = true,
  selectedRoom = null,
  onSelectRoom,
  activeFloor = -1,
  onChangeActiveFloor,
  presentationMode = 'architectural',
  landscapeData = null,
  styleAnalysis = null,
}) {
  const context = useMaterial() || {};
  const buildingInfo = context.buildingInfo || {};
  const reportData = context.reportData || {};

  if (!blueprint || !blueprint.floors_data || blueprint.floors_data.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700
      }}>
        No blueprint geometry available. Please construct Blueprint first.
      </div>
    );
  }

  const fpW = blueprint.footprint?.w || 10;
  const fpH = blueprint.footprint?.h || 8;
  const numFloors = blueprint.floors_data.length;
  const totalH = numFloors * FLOOR_H;

  const buildingType = buildingInfo?.building_type || 'Residential';
  const structuralSystem = buildingInfo?.structural_system || 'Concrete Frame';
  const location = buildingInfo?.location || 'Colombo';
  const rainfall = reportData?.climate_profile?.rainfall || '2400 mm';
  const salinity = reportData?.climate_profile?.salinity || 'High';

  // Map selections from reportData if selections prop is empty
  const pkg = reportData?.recommended_package || {};
  const resolvedSelections = useMemo(() => {
    return {
      Walls: selections?.Walls || pkg?.walls?.id || pkg?.walls?.name || '8',
      Roof: selections?.Roof || pkg?.roofing?.id || pkg?.roofing?.name || '3',
      Flooring: selections?.Flooring || pkg?.flooring?.id || pkg?.flooring?.name || '15',
      Doors: selections?.Doors || pkg?.doors?.id || pkg?.doors?.name || '17',
      Windows: selections?.Windows || pkg?.windows?.id || pkg?.windows?.name || '22',
    };
  }, [selections, pkg]);

  // Generate climate-adaptive landscaping on-the-fly if not provided
  const resolvedLandscapeData = useMemo(() => {
    if (landscapeData) return landscapeData;
    const loc = (location || '').toLowerCase();
    const isCoastal = loc.includes('colombo') || loc.includes('galle') || loc.includes('trincomalee');
    const isHighland = loc.includes('kandy') || loc.includes('nuwara');
    const isDry = loc.includes('jaffna') || loc.includes('anuradhapura');
    
    const plantings = [];
    const treeType = isCoastal ? 'palm' : isHighland ? 'pine' : isDry ? 'palm' : 'broadleaf';
    
    plantings.push({ type: treeType, x: -fpW * 0.9, z: -fpH * 0.8, scale: 1.1 });
    plantings.push({ type: treeType, x: -fpW * 1.1, z: fpH * 0.5, scale: 0.9 });
    plantings.push({ type: treeType, x: fpW * 1.2, z: -fpH * 0.9, scale: 1.2 });
    plantings.push({ type: treeType, x: fpW * 1.0, z: fpH * 0.6, scale: 0.8 });
    plantings.push({ type: isHighland ? 'pine' : 'broadleaf', x: -fpW * 0.2, z: -fpH * 1.2, scale: 1.3 });
    plantings.push({ type: isHighland ? 'pine' : 'broadleaf', x: fpW * 0.3, z: -fpH * 1.3, scale: 1.2 });

    const groundColor = isDry ? '#dcd0bc' : isCoastal ? '#cadbb7' : '#6f8a55';
    
    return {
      ground_color: groundColor,
      plantings,
      driveway: { x_offset: 0, z_offset: 3, w: 4.5, l: 12 },
      pathways: { w: 1.5, l: 5 },
      gardens: {
        beds: [
          { x: -fpW * 0.5, z: fpH * 0.7, w: 2.5, d: 1 },
          { x: fpW * 0.5, z: fpH * 0.7, w: 2.5, d: 1 }
        ]
      }
    };
  }, [landscapeData, location, fpW, fpH]);

  // Adjust camera to fit the building dimensions and number of floors dynamically
  const camDist = Math.max(fpW, fpH) * 1.5 + 8 + numFloors * 2.5;
  
  let resolvedCamPos = [18, 12, 18];
  let resolvedFov = 45;

  if (presentationMode === 'dollhouse' || threeDMode === 'dollhouse') {
    resolvedCamPos = [fpW / 2, totalH * 2.2 + 8, fpH / 2 + camDist * 0.35];
    resolvedFov = 40;
  } else if (threeDMode === 'interior') {
    resolvedCamPos = [25, 20, 25];
    resolvedFov = 35;
  }

  // ── WebGL pre-check (client-only, SSR-safe) ────────────────────────────────
  // Start in 'checking' so neither Canvas nor fallback render during SSR/hydration.
  // useEffect runs after hydration; the test is synchronous and near-instant.
  const [webglState, setWebglState] = useState('checking');

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (gl) {
        // Release the test context immediately
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        setWebglState('ok');
      } else {
        setWebglState('failed');
      }
    } catch (e) {
      setWebglState('failed');
    }
  }, []);

  // ── Shared fallback UI ─────────────────────────────────────────────────────
  const NoWebGLFallback = (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1520 0%, #172032 100%)',
      color: '#a0b4c8', fontFamily: 'Inter, sans-serif',
      padding: '2rem', boxSizing: 'border-box', gap: '1.5rem',
    }}>
      {/* SVG blueprint schematic */}
      <svg viewBox={`0 0 ${fpW * 10 + 40} ${fpH * 10 + 60}`}
        width="min(460px, 88%)" height="min(280px, 55%)"
        style={{ filter: 'drop-shadow(0 0 14px #00d4ff33)' }}>
        <rect width={fpW * 10 + 40} height={fpH * 10 + 60} fill="#0a1828" rx="8"/>
        {/* Building perimeter */}
        <rect x="20" y="20" width={fpW * 10} height={fpH * 10}
          fill="#132236" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4 2"/>
        {/* Room grid from floor 0 */}
        {(blueprint.floors_data[0]?.rooms || []).slice(0, 10).map((room, i) => {
          const rx = 20 + (room.x || 0) * 10;
          const ry = 20 + (room.y || 0) * 10;
          const rw = Math.max((room.w || 3) * 10, 8);
          const rh = Math.max((room.h || 3) * 10, 8);
          return (
            <g key={i}>
              <rect x={rx} y={ry} width={rw} height={rh}
                fill="#1c3650" stroke="#3a7bbf" strokeWidth="0.8" opacity="0.85"/>
              <text x={rx + rw / 2} y={ry + rh / 2 + 3}
                textAnchor="middle" fill="#7ab4e8" fontSize="7" fontFamily="monospace">
                {(room.name || room.type || 'Rm').slice(0, 6)}
              </text>
            </g>
          );
        })}
        {/* Info bar */}
        <text x={fpW * 5 + 20} y={fpH * 10 + 38}
          textAnchor="middle" fill="#00d4ff99" fontSize="9" fontFamily="monospace">
          {numFloors} FL · {fpW}×{fpH}m · BLUEPRINT VIEW
        </text>
        {/* North arrow */}
        <text x={fpW * 10 + 14} y="30" textAnchor="middle" fill="#00d4ff" fontSize="10" fontWeight="bold">N</text>
        <line x1={fpW * 10 + 14} y1="34" x2={fpW * 10 + 14} y2="46" stroke="#00d4ff" strokeWidth="1.5"/>
        <polygon points={`${fpW * 10 + 14},34 ${fpW * 10 + 11},40 ${fpW * 10 + 17},40`} fill="#00d4ff"/>
      </svg>

      {/* Warning badge */}
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.6)',
          borderRadius: '8px', padding: '0.5rem 1rem',
          fontSize: '0.75rem', color: '#ffb347', fontWeight: 700,
          marginBottom: '0.75rem', letterSpacing: '0.05em',
        }}>
          ⚠ 3D Viewer Unavailable — WebGL Disabled
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.73rem', color: '#6a8ca8', lineHeight: 1.7 }}>
          Hardware acceleration is disabled in your browser. The blueprint above
          shows your building layout. To restore the 3D view:
        </p>
        <div style={{ fontSize: '0.7rem', color: '#4a7a9b', lineHeight: 1.9, textAlign: 'left',
          background: '#0a1828', border: '1px solid #1e3a5a', borderRadius: '6px',
          padding: '0.6rem 1rem', display: 'inline-block' }}>
          <strong style={{ color: '#00d4ff', display: 'block', marginBottom: '0.3rem' }}>Fix in Chrome:</strong>
          1. Open <code style={{ color: '#7ab4e8' }}>chrome://settings</code><br/>
          2. Search <em>Hardware acceleration</em><br/>
          3. Enable <strong style={{ color: '#a0c8e8' }}>"Use graphics acceleration when available"</strong><br/>
          4. Relaunch Chrome
        </div>
      </div>
    </div>
  );

  // During SSR / hydration check — render nothing to avoid flicker
  if (webglState === 'checking') return null;

  // WebGL unavailable — show blueprint fallback, never mount Canvas
  if (webglState === 'failed') return NoWebGLFallback;

  // WebGL available — mount the 3D canvas
  return (
    <WebGLErrorBoundary fallback={NoWebGLFallback}>
      <Canvas
        key={`${presentationMode}_${threeDMode}`}
        shadows="soft"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{ position: resolvedCamPos, fov: resolvedFov, near: 0.1, far: 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={
          <Html center>
            <div style={{ color: '#1E5438', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'Space Grotesk' }}>LOADING 3D ARCHITECTURAL MODEL…</div>
          </Html>
        }>
          <Scene
            blueprint={blueprint}
            threeDMode={threeDMode}
            selections={resolvedSelections}
            showLabels={showLabels}
            showFurniture={showFurniture}
            selectedRoom={selectedRoom}
            onSelectRoom={onSelectRoom}
            activeFloor={activeFloor}
            presentationMode={presentationMode}
            landscapeData={resolvedLandscapeData}
            styleAnalysis={styleAnalysis}
            buildingType={buildingType}
            structuralSystem={structuralSystem}
            location={location}
            rainfall={rainfall}
            salinity={salinity}
          />
        </Suspense>
        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom luminanceThreshold={1.5} intensity={0.08} radius={0.5} />
        </EffectComposer>
      </Canvas>
    </WebGLErrorBoundary>
  );
}

export default Building3DModel;
