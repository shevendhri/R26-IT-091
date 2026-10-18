/**
 * LandscapeScene.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders outdoor landscape elements: grass/sand ground, ocean, trees, shrubs, 
 * pathways, driveway, garden beds. Driven by climate profiles and location.
 * ─────────────────────────────────────────────────────────────────────────────
 * */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getTexture } from './ProceduralTextures';
import { useMaterial } from '../context/MaterialContext';

// ══════════════════════════════════════════════════════════════════════════════
//  PROCEDURAL TREE GENERATORS
// ══════════════════════════════════════════════════════════════════════════════

function PalmTree({ position, scale = 1 }) {
  const s = scale;
  return (
    <group position={position}>
      {/* Trunk — curved organic look */}
      <mesh position={[0, 2.5 * s, 0]} castShadow>
        <cylinderGeometry args={[0.07 * s, 0.12 * s, 5 * s, 8]} />
        <meshStandardMaterial color="#5c4d3c" roughness={0.9} />
      </mesh>
      {/* Palm Leaves - procedurally arranged planes */}
      {Array.from({ length: 8 }).map((_, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        return (
          <mesh 
            key={idx} 
            position={[Math.cos(angle) * 0.8 * s, 4.8 * s, Math.sin(angle) * 0.8 * s]} 
            rotation={[0.3, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[1.8 * s, 0.02 * s, 0.3 * s]} />
            <meshStandardMaterial color="#2d4c2a" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function BroadleafTree({ position, scale = 1 }) {
  const s = scale;
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.8 * s, 0]} castShadow>
        <cylinderGeometry args={[0.08 * s, 0.14 * s, 3.6 * s, 8]} />
        <meshStandardMaterial color="#3a3028" roughness={0.95} />
      </mesh>
      {/* Canopy - Stylized smooth masses */}
      <mesh position={[0, 4.0 * s, 0]} castShadow>
        <sphereGeometry args={[1.6 * s, 12, 12]} />
        <meshStandardMaterial color="#3c522f" roughness={0.8} />
      </mesh>
      <mesh position={[0.5 * s, 3.3 * s, 0.4 * s]} castShadow>
        <sphereGeometry args={[1.2 * s, 10, 10]} />
        <meshStandardMaterial color="#425a34" roughness={0.8} />
      </mesh>
      <mesh position={[-0.5 * s, 3.5 * s, -0.4 * s]} castShadow>
        <sphereGeometry args={[1.3 * s, 10, 10]} />
        <meshStandardMaterial color="#344828" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PineTree({ position, scale = 1 }) {
  const s = scale;
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.2 * s, 0]} castShadow>
        <cylinderGeometry args={[0.08 * s, 0.12 * s, 2.4 * s, 6]} />
        <meshStandardMaterial color="#302620" roughness={0.95} />
      </mesh>
      {/* Canopy - cone levels */}
      <mesh position={[0, 3.2 * s, 0]} castShadow>
        <coneGeometry args={[1.2 * s, 3.0 * s, 8]} />
        <meshStandardMaterial color="#22361b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.5 * s, 0]} castShadow>
        <coneGeometry args={[0.9 * s, 2.2 * s, 8]} />
        <meshStandardMaterial color="#2a4022" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Shrub({ position, scale = 0.5 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3 * scale, 0]} castShadow>
        <sphereGeometry args={[0.4 * scale, 8, 8]} />
        <meshStandardMaterial color="#3c4c34" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale = 1 }) {
  const s = scale;
  return (
    <group position={position}>
      <mesh castShadow>
        <dodecahedronGeometry args={[2 * s, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} transparent opacity={0.8} />
      </mesh>
      <mesh position={[1.5 * s, -0.3 * s, 0.5 * s]} castShadow>
        <dodecahedronGeometry args={[1.5 * s, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-1.5 * s, -0.2 * s, -0.5 * s]} castShadow>
        <dodecahedronGeometry args={[1.6 * s, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  BOUNDARY WALL
// ══════════════════════════════════════════════════════════════════════════════
function BoundaryWall({ siteW, siteD, isCoastal, wallColor }) {
  const h = 1.4;
  const thick = 0.15;
  const pad = 5;
  const cx = siteW / 2, cz = siteD / 2;
  const halfW = siteW / 2 + pad, halfD = siteD / 2 + pad;
  const color = wallColor || (isCoastal ? '#e5e7eb' : '#d1d5db');

  return (
    <group>
      {/* Rear boundary wall */}
      <mesh position={[cx, h / 2, cz - halfD]} castShadow receiveShadow>
        <boxGeometry args={[halfW * 2 + thick, h, thick]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Left boundary wall */}
      <mesh position={[cx - halfW, h / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[thick, h, halfD * 2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Right boundary wall */}
      <mesh position={[cx + halfW, h / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[thick, h, halfD * 2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function LandscapeScene({ 
  landscapeData, siteW, siteD, presentationMode, location, salinity, rainfall, buildingType 
}) {
  const { buildingRequirements } = useMaterial() || {};
  const isGardenSelected = buildingRequirements?.garden === true;
  const isOutdoorLiving = buildingRequirements?.outdoor_living_pref === 'Moderate' || buildingRequirements?.outdoor_living_pref === 'Extensive';

  if (presentationMode === 'engineering') return null;

  const loc = (location || '').toLowerCase();
  const saline = (salinity || '').toLowerCase();
  const rain = parseInt(rainfall) || 0;

  // Determine Climate and Environment Profile
  const isCoastal = loc.includes('trinco') || loc.includes('colombo') || loc.includes('galle') || loc.includes('coastal') || saline === 'high' || saline === 'extreme';
  const isWet = rain > 2000 || loc.includes('kandy') || loc.includes('nuwara');
  const isDry = !isWet && (loc.includes('jaffna') || loc.includes('anuradhapura') || loc.includes('dry') || rain < 1200);

  // Ground Setup
  const groundColor = isWet ? '#3d522e' : isCoastal ? '#e8dfcc' : isDry ? '#dfcfb5' : '#52663e';
  const texType = isCoastal ? 'paving' : 'grass';
  const groundMaps = useMemo(() => getTexture(texType, groundColor), [texType, groundColor]);

  const cx = siteW / 2;
  const cz = siteD / 2;
  const padScale = Math.max(siteW, siteD) * 4;

  // Generate Climate Plantings
  const plantings = useMemo(() => {
    if (!isGardenSelected) return []; // Filter: only render plantings when garden is required
    const list = [];
    const seedRng = (s) => {
      let val = s;
      return () => { val = (val * 16807) % 2147483647; return val / 2147483647; };
    };
    const rng = seedRng(99);

    const count = isWet ? 14 : isDry ? 4 : 8;
    const treeType = isCoastal ? 'palm' : isWet ? 'pine' : 'broadleaf';

    // Place trees around the boundary of the lot
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rng() * 0.4;
      const dist = Math.max(siteW, siteD) * 1.2 + rng() * 6;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Don't block front pathway view
      if (z > siteD * 0.5 && Math.abs(x) < siteW * 0.8) {
        continue; 
      }

      list.push({
        type: treeType,
        x,
        z,
        scale: 0.85 + rng() * 0.4
      });
    }

    // Add extra undergrowth for wet zone
    if (isWet) {
      for (let i = 0; i < 12; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = Math.max(siteW, siteD) * 1.0 + rng() * 4;
        list.push({
          type: 'broadleaf',
          x: Math.cos(angle) * dist,
          z: Math.sin(angle) * dist,
          scale: 0.5 + rng() * 0.3
        });
      }
    }

    return list;
  }, [isCoastal, isWet, isDry, siteW, siteD, isGardenSelected]);

  return (
    <group>
      {/* ── GROUND TERRAIN ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.02, cz]} receiveShadow>
        <planeGeometry args={[padScale, padScale]} />
        <meshStandardMaterial
          {...(groundMaps || {})}
          color={groundColor}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* ── OCEAN BACKDROP (Trincomalee/Saline Coastal climates only) ── */}
      {isCoastal && (
        <group>
          {/* Water Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.35, -padScale * 0.45]} receiveShadow>
            <planeGeometry args={[padScale * 2, padScale * 0.8]} />
            <meshPhysicalMaterial 
              color="#0284c7" 
              roughness={0.15} 
              metalness={0.1} 
              transmission={0.6}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Sandy Shore Transition */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.15, -padScale * 0.1]} receiveShadow>
            <planeGeometry args={[padScale, 6]} />
            <meshStandardMaterial color="#e8dfcc" roughness={0.9} />
          </mesh>
          {/* Clouds */}
          <Cloud position={[cx - 20, 16, cz - 30]} scale={1.2} />
          <Cloud position={[cx + 18, 18, cz - 45]} scale={1.5} />
          <Cloud position={[cx - 35, 15, cz - 15]} scale={1.0} />
          <Cloud position={[cx + 32, 17, cz - 20]} scale={1.3} />
        </group>
      )}

      {/* ── VEGETATION ── */}
      {plantings.map((p, i) => {
        const pos = [cx + p.x, 0, cz + p.z];
        const scaleFactor = presentationMode === 'dollhouse' ? 0.6 : 1;
        const finalScale = p.scale * scaleFactor;

        if (p.type === 'palm') {
          return <PalmTree key={i} position={pos} scale={finalScale} />;
        }
        if (p.type === 'pine') {
          return <PineTree key={i} position={pos} scale={finalScale} />;
        }
        return <BroadleafTree key={i} position={pos} scale={finalScale} />;
      })}

      {/* ── OUTDOOR LIVING PATIO FURNITURE ── */}
      {isOutdoorLiving && (
        <group position={[cx + siteW * 0.65, 0.02, cz + siteD * 0.2]}>
          {/* Patio Table */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.04, 12]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Chairs */}
          {[[-0.55, 0], [0.55, 0]].map((posVal, idx) => (
            <group key={idx} position={[posVal[0], 0, posVal[1]]}>
              <mesh position={[0, 0.18, 0]} castShadow>
                <boxGeometry args={[0.3, 0.04, 0.3]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.7} />
              </mesh>
              <mesh position={[0.13 * (idx === 0 ? 1 : -1), 0.38, 0]} castShadow>
                <boxGeometry args={[0.04, 0.36, 0.3]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ── BOUNDARY WALL ── */}
      {presentationMode !== 'dollhouse' && (
        <BoundaryWall siteW={siteW} siteD={siteD} isCoastal={isCoastal} />
      )}

      {/* ── DRIVEWAY ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.015, siteD + 4]} receiveShadow>
        <planeGeometry args={[4.0, 10]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>
    </group>
  );
}
