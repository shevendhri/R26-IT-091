"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

/**
 * Procedural Architectural Room Furniture
 * High-detail Three.js furniture primitives tailored to specific room functions:
 */
function RoomFurnitureMesh({ type, w, d, materials, isFurnitureFocus = false, isRoomSelected = false }) {
  const halfW = w / 2;
  const halfD = d / 2;
  const s = Math.min(1.0, Math.min(w / 4.2, d / 4.0));

  const emissiveColor = isFurnitureFocus || isRoomSelected ? "#10B981" : "#000000";
  const emissiveIntensity = isFurnitureFocus ? 0.25 : 0.0;

  if (type === "living") {
    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <mesh position={[0, 0.015, 0.2]} receiveShadow>
          <boxGeometry args={[Math.min(w * 0.72, 3.4), 0.02, Math.min(d * 0.68, 2.6)]} />
          <meshStandardMaterial color="#8A8175" roughness={0.94} />
        </mesh>
        <group position={[-0.3, 0.24, 0.6]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.36, 0.85]} />
            <meshStandardMaterial color="#1E293B" roughness={0.72} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh position={[0, 0.3, 0.33]} castShadow>
            <boxGeometry args={[2.4, 0.38, 0.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.75} />
          </mesh>
          <mesh position={[0.9, 0, -0.65]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.36, 0.9]} />
            <meshStandardMaterial color="#1E293B" roughness={0.72} />
          </mesh>
          {[-0.7, 0, 0.7].map((cx, i) => (
            <mesh key={`cushion-${i}`} position={[cx, 0.24, 0.22]} rotation={[0.2, 0, (i - 1) * 0.1]} castShadow>
              <boxGeometry args={[0.38, 0.28, 0.12]} />
              <meshStandardMaterial color={["#D97706", "#0284C7", "#059669"][i]} roughness={0.65} />
            </mesh>
          ))}
        </group>
        <group position={[-0.3, 0.18, -0.15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.06, 0.65]} />
            <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.08} />
          </mesh>
          {[-0.52, 0.52].map((tx, i) =>
            [-0.26, 0.26].map((tz, j) => (
              <mesh key={`tbl-leg-${i}-${j}`} position={[tx, -0.09, tz]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
                <meshStandardMaterial color="#1E293B" metalness={0.6} />
              </mesh>
            ))
          )}
          <mesh position={[-0.25, 0.05, 0]}>
            <boxGeometry args={[0.28, 0.04, 0.2]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          <mesh position={[0.3, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.16, 12]} />
            <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.4} />
          </mesh>
        </group>
        <group position={[-0.3, 0.24, -halfD + 0.38]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.44, 0.42]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.22]}>
            <boxGeometry args={[2.14, 0.38, 0.02]} />
            <meshStandardMaterial color="#9A3412" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[1.6, 0.85, 0.04]} />
            <meshStandardMaterial color="#020617" roughness={0.15} metalness={0.85} />
          </mesh>
        </group>
        <group position={[halfW - 0.45, 0, 0.6]}>
          <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.18, 0.2, 0.08, 16]} /><meshStandardMaterial color="#1E293B" metalness={0.7} /></mesh>
          <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.02, 0.02, 1.7, 8]} /><meshStandardMaterial color="#1E293B" metalness={0.8} /></mesh>
          <mesh position={[-0.2, 1.75, 0]} rotation={[0, 0, -0.4]}><cylinderGeometry args={[0.14, 0.18, 0.22, 16]} /><meshStandardMaterial color="#F8FAFC" emissive="#FFD59E" emissiveIntensity={0.6} /></mesh>
        </group>
      </group>
    );
  }

  if (type === "master_bed" || type === "bedroom" || type === "hotel_suite") {
    const isMaster = type === "master_bed" || type === "hotel_suite";
    const bedW = isMaster ? 1.9 : 1.45;
    const bedD = 2.1;

    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <mesh position={[0, 0.015, 0.1]} receiveShadow>
          <boxGeometry args={[bedW + 1.2, 0.02, bedD + 0.8]} />
          <meshStandardMaterial color="#6B5A4A" roughness={0.95} />
        </mesh>
        <group position={[0, 0.24, -0.15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[bedW + 0.14, 0.28, bedD + 0.14]} />
            <meshStandardMaterial color="#3E2723" roughness={0.45} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[bedW, 0.24, bedD]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.58, -bedD / 2 + 0.06]} castShadow>
            <boxGeometry args={[bedW + 0.25, 0.92, 0.14]} />
            <meshStandardMaterial color="#27272A" roughness={0.65} />
          </mesh>
          <mesh position={[-bedW / 3.8, 0.38, -bedD / 2 + 0.38]} castShadow>
            <boxGeometry args={[bedW * 0.42, 0.14, 0.42]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
          </mesh>
          <mesh position={[bedW / 3.8, 0.38, -bedD / 2 + 0.38]} castShadow>
            <boxGeometry args={[bedW * 0.42, 0.14, 0.42]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.34, 0.28]} castShadow>
            <boxGeometry args={[bedW * 0.98, 0.09, bedD * 0.68]} />
            <meshStandardMaterial color={isMaster ? "#94A3B8" : "#C4B5A0"} roughness={0.75} />
          </mesh>
        </group>
        {[-bedW / 2 - 0.34, bedW / 2 + 0.34].map((nx, i) => (
          <group key={`nightstand-${i}`} position={[nx, 0.26, -bedD / 2 + 0.15]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.48, 0.48, 0.48]} />
              <meshStandardMaterial color="#3E2723" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.14, 12]} />
              <meshStandardMaterial color="#D97706" metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.44, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 0.18, 16]} />
              <meshStandardMaterial color="#FEF3C7" emissive="#FFD59E" emissiveIntensity={0.7} />
            </mesh>
          </group>
        ))}
        <group position={[halfW - 0.38, 0.85, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 1.6, Math.min(d * 0.65, 2.2)]} />
            <meshStandardMaterial color="#1E293B" roughness={0.35} />
          </mesh>
          <mesh position={[-0.31, 0, 0]}>
            <boxGeometry args={[0.02, 1.5, 0.04]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === "kitchen_dining" || type === "dining" || type === "kitchen") {
    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <group position={[-halfW + 0.6, 0.48, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.78, 0.9, Math.min(d * 0.72, 2.6)]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.86, 0.06, Math.min(d * 0.72, 2.6) + 0.08]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.12} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.51, -0.45]}>
            <boxGeometry args={[0.48, 0.02, 0.6]} />
            <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.62, 0.45]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
          </mesh>
          {[-0.4, 0.4].map((bz, i) => (
            <group key={`bstool-${i}`} position={[0.55, -0.15, bz]}>
              <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.18, 0.18, 0.04, 12]} /><meshStandardMaterial color="#78350F" roughness={0.4} /></mesh>
              <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.02, 0.02, 0.35, 8]} /><meshStandardMaterial color="#0F172A" metalness={0.8} /></mesh>
            </group>
          ))}
        </group>
        <group position={[0.75, 0.42, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.07, 0.95]} />
            <meshStandardMaterial color="#78350F" roughness={0.35} metalness={0.05} />
          </mesh>
          {[-0.7, 0.7].map((lx, i) =>
            [-0.38, 0.38].map((lz, j) => (
              <mesh key={`dleg-${i}-${j}`} position={[lx, -0.22, lz]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
                <meshStandardMaterial color="#1C1917" metalness={0.7} />
              </mesh>
            ))
          )}
          {[-0.78, 0.78].map((cx, i) =>
            [-0.58, 0.58].map((cz, j) => (
              <group key={`dchair-${i}-${j}`} position={[cx, -0.06, cz]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.38, 0.05, 0.38]} />
                  <meshStandardMaterial color="#475569" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.24, j === 0 ? -0.17 : 0.17]} castShadow>
                  <boxGeometry args={[0.38, 0.42, 0.04]} />
                  <meshStandardMaterial color="#475569" roughness={0.7} />
                </mesh>
              </group>
            ))
          )}
        </group>
      </group>
    );
  }

  if (type === "bathroom") {
    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <group position={[-halfW + 0.42, 0.44, -halfD + 0.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.58, 0.8, 0.85]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.62, 0.06, 0.88]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.08} />
          </mesh>
          <mesh position={[0, 0.9, -0.42]}>
            <boxGeometry args={[0.55, 0.7, 0.02]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.05} metalness={0.95} />
          </mesh>
        </group>
        <group position={[halfW - 0.48, 0.28, -halfD + 0.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.44, 0.58]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.12} />
          </mesh>
          <mesh position={[0, 0.3, -0.2]} castShadow>
            <boxGeometry args={[0.4, 0.48, 0.22]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.12} />
          </mesh>
        </group>
        <group position={[0, 0.65, halfD - 0.6]}>
          <mesh castShadow>
            <boxGeometry args={[Math.min(w * 0.72, 1.5), 1.3, 0.04]} />
            <meshPhysicalMaterial color="#BAE6FD" transparent opacity={0.38} roughness={0.05} transmission={0.92} ior={1.5} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === "office" || type === "study" || type === "boardroom") {
    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <group position={[0, 0.4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.65, 0.06, 0.85]} />
            <meshStandardMaterial color="#78350F" roughness={0.4} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh position={[-0.72, -0.19, 0]} castShadow><boxGeometry args={[0.08, 0.42, 0.75]} /><meshStandardMaterial color="#0F172A" /></mesh>
          <mesh position={[0.72, -0.19, 0]} castShadow><boxGeometry args={[0.08, 0.42, 0.75]} /><meshStandardMaterial color="#0F172A" /></mesh>
          <mesh position={[0, 0.16, -0.15]}><boxGeometry args={[0.45, 0.28, 0.02]} /><meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} /></mesh>
        </group>
        <group position={[0, 0.38, 0.65]}>
          <mesh castShadow><boxGeometry args={[0.48, 0.06, 0.48]} /><meshStandardMaterial color="#334155" roughness={0.75} /></mesh>
          <mesh position={[0, 0.3, 0.22]} castShadow><boxGeometry args={[0.45, 0.54, 0.06]} /><meshStandardMaterial color="#334155" roughness={0.75} /></mesh>
        </group>
        <group position={[0, 0.85, -halfD + 0.32]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[Math.min(w * 0.78, 2.4), 1.6, 0.35]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === "production" || type === "warehouse" || type === "loading") {
    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <group position={[0, 0.75, 0]}>
          {[-0.9, 0.9].map((rx, i) =>
            [-0.35, 0.35].map((rz, j) => (
              <mesh key={`rack-leg-${i}-${j}`} position={[rx, 0, rz]} castShadow>
                <boxGeometry args={[0.08, 1.45, 0.08]} />
                <meshStandardMaterial color="#4A5058" metalness={0.65} roughness={0.35} />
              </mesh>
            ))
          )}
          {[-0.3, 0.3].map((sy, i) => (
            <mesh key={`shelf-${i}`} position={[0, sy, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.06, 0.7]} />
              <meshStandardMaterial color="#5C6068" metalness={0.45} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[-0.4, 0.05, 0]} castShadow>
            <boxGeometry args={[0.6, 0.45, 0.55]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === "hospital_bed" || type === "clinic" || type === "triage") {
    return (
      <group scale={[s, s, s]} position={[0, 0.05, 0]}>
        <group position={[-0.3, 0.35, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.0, 0.25, 2.0]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.92, 0.16, 1.9]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
        </group>
        <group position={[0.6, 0.8, -0.7]}>
          <mesh><cylinderGeometry args={[0.02, 0.02, 1.5, 8]} /><meshStandardMaterial color="#E2E8F0" metalness={0.9} /></mesh>
        </group>
      </group>
    );
  }

  return (
    <group scale={[s, s, s]} position={[0, 0.05, 0]}>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[Math.min(w * 0.7, 3.0), 0.02, Math.min(d * 0.7, 2.4)]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * CutawayFloorPlan — 100% Geometrically & Structurally Coherent Architectural Cross-Section
 * 
 * Aligned precisely with ArchitecturalVilla and EngineeringBIMView:
 * - Foundation plinth, terrace datum, and floor heights (3.1m per level) match 1:1
 * - Column grid coordinates (C1-C9 / C1-C12) align directly with BIM engineering grid
 * - Front façade is cleanly sliced open in dollhouse cross-section while retaining exterior walls, slabs, and roof profiles
 */
export default function CutawayFloorPlan({
  floorsData = [],
  floorCount = 2,
  buildingType = "Residential",
  isEvening = false,
  specMode = "eco",
  showGhostEnvelope = false,
  isXray = false,
  showHotspots = true,
  showFurniture = true,
  showDimensions = true,
  isolatedFloor = "all",
  isExploded = false,
  focusMode = "all",
  viewPreset = "iso",
  selectedRoomId = null,
  selectedComponentId = null,
  highlightedComponent = null,
  activeMaterials,
  onSelectRoom,
  onSelectComponent,
}) {
  const [hoveredRoomId, setHoveredRoomId] = useState(null);

  const floors = Math.max(1, parseInt(floorCount, 10) || 2);
  const isRoomsFocus = focusMode === "rooms";
  const isFurnitureFocus = focusMode === "furniture";
  const isComponentsFocus = focusMode === "components";
  const isStructureFocus = focusMode === "structure";
  const isMaterialsFocus = focusMode === "materials";
  const isBaseline = specMode === "baseline";

  // Component highlights bound to dashboard/drawer interaction
  const isWallHighlighted = highlightedComponent === "walls" || selectedComponentId === "walls" || isMaterialsFocus;
  const isFloorHighlighted = highlightedComponent === "flooring" || selectedComponentId === "flooring";
  const isColHighlighted = highlightedComponent === "columns" || selectedComponentId === "columns" || isStructureFocus;
  const isRoofHighlighted = highlightedComponent === "roofing" || selectedComponentId === "roofing";

  const bType = (buildingType || "").toLowerCase();
  const isHotel = bType.includes("hotel") || bType.includes("resort") || bType.includes("hospitality");
  const isCommercial = bType.includes("commercial") || bType.includes("office") || bType.includes("retail") || bType.includes("mixed");
  const isIndustrial = bType.includes("industrial") || bType.includes("warehouse") || bType.includes("factory") || bType.includes("logistics");
  const isHealthcare = bType.includes("health") || bType.includes("hospital") || bType.includes("clinic") || bType.includes("medical");

  // Footprint dimensions matching ArchitecturalVilla & EngineeringBIMView
  const buildingWidth = isIndustrial ? 18.0 : isHotel ? 16.4 : isCommercial ? 15.0 : isHealthcare ? 16.5 : 14.8;
  const buildingDepth = isIndustrial ? 12.0 : isHotel ? 13.2 : isCommercial ? 12.0 : isHealthcare ? 12.5 : 11.2;
  const plinthWidth = buildingWidth + 2.0;
  const plinthDepth = buildingDepth + 2.6;
  const floorHeight = 3.1;
  const wallThick = 0.22;

  // Structural Column Grid Coordinates (matching EngineeringBIMView)
  const columnPositions = useMemo(() => {
    if (isIndustrial) {
      return [
        [-7.5, 5.5], [0.0, 5.5], [7.5, 5.5],
        [-7.5, -5.5], [0.0, -5.5], [7.5, -5.5]
      ];
    }
    if (isCommercial) {
      return [
        [-6.5, 5.0], [-2.2, 5.0], [2.2, 5.0], [6.5, 5.0],
        [-6.5, 0.0], [-2.2, 0.0], [2.2, 0.0], [6.5, 0.0],
        [-6.5, -5.0], [-2.2, -5.0], [2.2, -5.0], [6.5, -5.0]
      ];
    }
    if (isHealthcare) {
      return [
        [-7.0, 5.0], [0.0, 5.0], [7.0, 5.0],
        [-3.5, 0.0], [3.5, 0.0],
        [-7.0, -5.0], [0.0, -5.0], [7.0, -5.0]
      ];
    }
    // Residential 9-column grid (matching EngineeringBIMView & ArchitecturalVilla)
    return [
      [-6.2, 4.8], [0.0, 4.8], [6.5, 4.8],
      [-6.2, -1.5], [0.0, -1.5], [6.5, -1.5],
      [-6.2, -6.0], [0.0, -6.0], [6.5, -6.0]
    ];
  }, [isIndustrial, isCommercial, isHealthcare]);

  // Dynamic PBR Materials bound to active recommendation engine & spec mode
  const materials = useMemo(() => {
    const wallOpacity = isXray ? 0.35 : 1.0;
    const wallTransparent = isXray;

    // Spec Mode dynamic colors (Baseline vs AI Eco-Spec)
    const wallColor = isBaseline ? "#A84832" : (activeMaterials?.wall?.color || "#E8E4DC");
    const wallRoughness = isBaseline ? 0.92 : (activeMaterials?.wall?.roughness ?? 0.8);
    const wallMetalness = isBaseline ? 0.01 : (activeMaterials?.wall?.metalness ?? 0.04);

    const floorColor = isBaseline ? "#7A818C" : (activeMaterials?.floor?.color || "#C4BEB4");
    const floorRoughness = isBaseline ? 0.85 : (activeMaterials?.floor?.roughness ?? 0.72);
    const floorMetalness = isBaseline ? 0.02 : (activeMaterials?.floor?.metalness ?? 0.08);

    const roofColor = isBaseline ? "#7C3222" : (activeMaterials?.roof?.color || "#27272A");
    const colColor = isBaseline ? "#545A63" : (activeMaterials?.columns?.color || "#3A3F47");
    const pergolaColor = isBaseline ? "#3B4149" : "#4A3728";

    return {
      wallExterior: new THREE.MeshStandardMaterial({
        color: new THREE.Color(wallColor),
        roughness: wallRoughness,
        metalness: wallMetalness,
        transparent: wallTransparent,
        opacity: wallOpacity,
        emissive: isWallHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isWallHighlighted ? 0.35 : 0.0,
      }),
      wallInterior: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#D2CCC0" : "#ECE7DF"),
        roughness: 0.88,
        metalness: 0.02,
        transparent: wallTransparent,
        opacity: wallOpacity,
        emissive: isWallHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isWallHighlighted ? 0.25 : 0.0,
      }),
      floorSlab: new THREE.MeshStandardMaterial({
        color: new THREE.Color(floorColor),
        roughness: floorRoughness,
        metalness: floorMetalness,
        emissive: isFloorHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isFloorHighlighted ? 0.35 : 0.0,
      }),
      foundationPlinth: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#525861" : "#1F2937"),
        roughness: 0.9,
        metalness: 0.1,
      }),
      slateTerrace: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#4B525C" : "#374151"),
        roughness: 0.85,
        metalness: 0.08,
      }),
      gardenGrass: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2E5A36"),
        roughness: 0.95,
      }),
      roofTiles: new THREE.MeshStandardMaterial({
        color: new THREE.Color(roofColor),
        roughness: 0.6,
        metalness: 0.15,
        emissive: isRoofHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isRoofHighlighted ? 0.35 : 0.0,
      }),
      roofTrussWood: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#3B4149" : "#78350F"),
        roughness: 0.55,
      }),
      timberPergola: new THREE.MeshStandardMaterial({
        color: new THREE.Color(pergolaColor),
        roughness: 0.55,
      }),
      structureBeam: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isColHighlighted ? "#38BDF8" : colColor),
        roughness: 0.5,
        metalness: isColHighlighted ? 0.4 : 0.2,
        emissive: isColHighlighted ? new THREE.Color("#38BDF8") : new THREE.Color("#000000"),
        emissiveIntensity: isColHighlighted ? 0.45 : 0.0,
      }),
      glazing: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(isBaseline ? "#90B5C6" : "#EAF2F8"),
        roughness: 0.05,
        metalness: 0.05,
        transparent: true,
        opacity: isBaseline ? 0.45 : 0.28,
        transmission: isBaseline ? 0.82 : 0.94,
        ior: 1.5,
      }),
      dimensionLine: new THREE.MeshBasicMaterial({
        color: new THREE.Color("#10B981"),
      }),
      ghostEnvelope: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#38BDF8"),
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.14,
        transmission: 0.75,
        wireframe: false,
        depthWrite: false,
      }),
      ghostWireframe: new THREE.MeshBasicMaterial({
        color: new THREE.Color("#38BDF8"),
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      }),
    };
  }, [activeMaterials, isXray, isStructureFocus, isBaseline, isWallHighlighted, isFloorHighlighted, isColHighlighted, isRoofHighlighted]);

  // Clean up Three.js material resources on change and unmount to prevent GPU leaks
  const materialsRef = useRef(null);
  useEffect(() => {
    const prev = materialsRef.current;
    materialsRef.current = materials;
    if (prev && prev !== materials) {
      Object.values(prev).forEach((mat) => {
        if (mat && typeof mat.dispose === "function") {
          mat.dispose();
        }
      });
    }
  }, [materials]);

  useEffect(() => {
    return () => {
      if (materialsRef.current) {
        Object.values(materialsRef.current).forEach((mat) => {
          if (mat && typeof mat.dispose === "function") {
            mat.dispose();
          }
        });
      }
    };
  }, []);

  // Roof visibility & isolation logic:
  // - When looking straight down (top view), hide the solid roof so rooms/floorplan are clearly visible
  // - In floor isolation mode, only render roof if the topmost floor is isolated (avoid floating roof in mid-air)
  const isTopFloorIsolated = isolatedFloor === "all" || parseInt(isolatedFloor, 10) === floors;
  const showRoof = isTopFloorIsolated && viewPreset !== "top";

  // Dynamic Floors Data fallback matching ArchitecturalVilla
  const activeFloors = useMemo(() => {
    if (floorsData && floorsData.length > 0) return floorsData;
    return [
      {
        level: 1,
        name: "Floor 1",
        floorArea: 86,
        dimensions: { w: buildingWidth, d: buildingDepth, h: 3.1 },
        rooms: [
          { id: "f1_living", name: "Living Room", floor: 1, area: 24, dimensions: { w: 5.6, d: 4.4, h: 2.9 }, position: { x: -3.1, y: 0, z: 1.8 }, furnitureType: "living", category: "PUBLIC", openings: { windows: 2, doors: 1, openingArea: 4.8 } },
          { id: "f1_dining", name: "Dining Area", floor: 1, area: 16, dimensions: { w: 4.6, d: 4.4, h: 2.9 }, position: { x: 3.2, y: 0, z: 1.8 }, furnitureType: "kitchen_dining", category: "SEMI-PUBLIC", openings: { windows: 1, doors: 1, openingArea: 3.2 } },
          { id: "f1_kitchen", name: "Kitchen", floor: 1, area: 14, dimensions: { w: 4.6, d: 4.2, h: 2.9 }, position: { x: 3.2, y: 0, z: -3.8 }, furnitureType: "kitchen", category: "SERVICE", openings: { windows: 1, doors: 1, openingArea: 2.4 } },
          { id: "f1_bed1", name: "Bedroom 1", floor: 1, area: 14, dimensions: { w: 4.2, d: 4.2, h: 2.9 }, position: { x: -4.0, y: 0, z: -3.8 }, furnitureType: "bedroom", category: "PRIVATE", openings: { windows: 1, doors: 1, openingArea: 2.8 } },
          { id: "f1_bath", name: "Bathroom", floor: 1, area: 6, dimensions: { w: 2.2, d: 4.2, h: 2.9 }, position: { x: -0.4, y: 0, z: -3.8 }, furnitureType: "bathroom", category: "SERVICE", openings: { windows: 1, doors: 1, openingArea: 1.2 } },
        ]
      },
      {
        level: 2,
        name: "Floor 2",
        floorArea: 84,
        dimensions: { w: buildingWidth, d: buildingDepth, h: 3.1 },
        rooms: [
          { id: "f2_master", name: "Master Bedroom", floor: 2, area: 28, dimensions: { w: 5.8, d: 4.4, h: 2.9 }, position: { x: -3.1, y: 0, z: 1.8 }, furnitureType: "master_bed", category: "PRIVATE", openings: { windows: 2, doors: 1, openingArea: 6.8 } },
          { id: "f2_bath", name: "Bathroom", floor: 2, area: 8, dimensions: { w: 2.4, d: 4.4, h: 2.9 }, position: { x: 1.2, y: 0, z: 1.8 }, furnitureType: "bathroom", category: "SERVICE", openings: { windows: 1, doors: 1, openingArea: 1.8 } },
          { id: "f2_study", name: "Study / Home Office", floor: 2, area: 10, dimensions: { w: 3.4, d: 4.4, h: 2.9 }, position: { x: 4.4, y: 0, z: 1.8 }, furnitureType: "office", category: "WORK", openings: { windows: 1, doors: 1, openingArea: 2.8 } },
          { id: "f2_bed2", name: "Bedroom 2", floor: 2, area: 16, dimensions: { w: 4.8, d: 4.2, h: 2.9 }, position: { x: 3.2, y: 0, z: -3.8 }, furnitureType: "bedroom", category: "PRIVATE", openings: { windows: 1, doors: 1, openingArea: 3.2 } },
          { id: "f2_balcony", name: "Balcony", floor: 2, area: 8, dimensions: { w: 5.6, d: 2.2, h: 2.9 }, position: { x: -3.1, y: 0, z: 4.6 }, furnitureType: "balcony", category: "OUTDOOR", openings: { windows: 0, doors: 1, openingArea: 3.6 } },
        ]
      }
    ];
  }, [floorsData, buildingWidth, buildingDepth]);

  return (
    <group position={[0, 0, 0]}>
      {/* ── 1. REALISTIC LANDSCAPED PLINTH & SLATE TERRACE (Exact match to ArchitecturalVilla) ── */}
      <group position={[0, 0, -0.5]}>
        {/* Foundation Plinth */}
        <mesh position={[0, -0.25, 0]} material={materials.foundationPlinth} receiveShadow>
          <boxGeometry args={[plinthWidth, 0.5, plinthDepth]} />
        </mesh>

        {/* Permeable Slate Paver Terrace */}
        <mesh position={[0, 0.02, 0]} material={materials.slateTerrace} receiveShadow>
          <boxGeometry args={[plinthWidth - 0.6, 0.08, plinthDepth - 0.7]} />
        </mesh>

        {/* Garden Grass Lawn Surround */}
        <mesh position={[0, -0.06, 0]} material={materials.gardenGrass} receiveShadow>
          <boxGeometry args={[plinthWidth + 6.0, 0.05, plinthDepth + 6.0]} />
        </mesh>

        {/* Garden Planters with Lush Shrubs */}
        {[-plinthWidth / 2 + 1.2, plinthWidth / 2 - 1.2].map((gx, i) => (
          <group key={`garden-shrub-${i}`} position={[gx, 0.25, plinthDepth / 2 - 1.0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.42, 12, 12]} />
              <meshStandardMaterial color="#166534" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 2. MULTI-STORY DOLLHOUSE FLOORS ───────────────────────────────── */}
      {activeFloors.map((floor) => {
        const isFloorVisible = isolatedFloor === "all" || isolatedFloor === floor.level;
        if (!isFloorVisible) return null;

        const baseFloorY = (floor.level - 1) * floorHeight;
        const explodedY = isExploded ? (floor.level - 1) * 3.8 : 0;
        const currentFloorY = baseFloorY + explodedY;

        return (
          <group key={`dollhouse-floor-${floor.level}`} position={[0, currentFloorY, -0.5]}>
            {/* Structural Floor Slab with Exposed Front Cut Section */}
            <mesh
              position={[0, 0.1, 0]}
              material={materials.floorSlab}
              receiveShadow
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("flooring");
              }}
            >
              <boxGeometry args={[buildingWidth, 0.24, buildingDepth]} />
            </mesh>

            {/* Structural RC Columns aligned to Engineering BIM Grid */}
            {columnPositions.map(([cx, cz], cIdx) => (
              <mesh
                key={`col-${floor.level}-${cIdx}`}
                position={[cx, floorHeight / 2 + 0.1, cz]}
                material={materials.structureBeam}
                castShadow
                receiveShadow
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectComponent) onSelectComponent("columns");
                }}
              >
                <boxGeometry args={[0.35, floorHeight - 0.2, 0.35]} />
              </mesh>
            ))}

            {/* Perimeter Structural RC Beams (Back & Sides) */}
            <mesh
              position={[0, floorHeight - 0.15, -buildingDepth / 2 + 0.15]}
              material={materials.structureBeam}
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("columns");
              }}
            >
              <boxGeometry args={[buildingWidth, 0.32, 0.32]} />
            </mesh>
            <mesh
              position={[-buildingWidth / 2 + 0.15, floorHeight - 0.15, 0]}
              material={materials.structureBeam}
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("columns");
              }}
            >
              <boxGeometry args={[0.32, 0.32, buildingDepth]} />
            </mesh>
            <mesh
              position={[buildingWidth / 2 - 0.15, floorHeight - 0.15, 0]}
              material={materials.structureBeam}
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("columns");
              }}
            >
              <boxGeometry args={[0.32, 0.32, buildingDepth]} />
            </mesh>

            {/* Solid Rear Exterior Wall (-Z) */}
            <mesh
              position={[0, floorHeight / 2 + 0.1, -buildingDepth / 2 + wallThick / 2]}
              material={materials.wallExterior}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("walls");
              }}
            >
              <boxGeometry args={[buildingWidth, floorHeight - 0.2, wallThick]} />
            </mesh>

            {/* Left Exterior Wall (-X) */}
            <mesh
              position={[-buildingWidth / 2 + wallThick / 2, floorHeight / 2 + 0.1, 0]}
              material={materials.wallExterior}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("walls");
              }}
            >
              <boxGeometry args={[wallThick, floorHeight - 0.2, buildingDepth]} />
            </mesh>

            {/* Right Exterior Wall (+X) */}
            <mesh
              position={[buildingWidth / 2 - wallThick / 2, floorHeight / 2 + 0.1, 0]}
              material={materials.wallExterior}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("walls");
              }}
            >
              <boxGeometry args={[wallThick, floorHeight - 0.2, buildingDepth]} />
            </mesh>

            {/* ── ROOMS IN THIS FLOOR ──────────────────────────────────────── */}
            {(floor.rooms || []).map((room, roomIdx) => {
              const rw = room.dimensions?.w || 4.5;
              const rd = room.dimensions?.d || 4.0;
              const rx = room.position?.x || 0;
              const rz = room.position?.z || 0;

              const explodedPosX = isExploded ? rx * 1.25 : rx;
              const explodedPosZ = isExploded ? rz * 1.2 : rz;

              const isRoomSelected = selectedRoomId === room.id;
              const isRoomHovered = hoveredRoomId === room.id;
              const isOtherRoomSelected = isRoomsFocus && selectedRoomId && selectedRoomId !== room.id;

              // Hide redundant floating tags for utility circulation & staircases unless hovered/selected
              const isSecondarySpace = !room.furnitureType || 
                (room.name || "").toLowerCase().includes("corridor") || 
                (room.name || "").toLowerCase().includes("circulation") || 
                (room.name || "").toLowerCase().includes("staircase") ||
                (room.name || "").toLowerCase().includes("landing");

              const shouldShowTag = showHotspots && (!isSecondarySpace || isRoomSelected || isRoomHovered);

              return (
                <group
                  key={`dollhouse-room-f${floor.level}-i${roomIdx}`}
                  position={[explodedPosX, 0.2, explodedPosZ]}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRoom) {
                      onSelectRoom(room, [explodedPosX, currentFloorY + 4.5, explodedPosZ + 5.5], [explodedPosX, currentFloorY + 1.2, explodedPosZ]);
                    }
                  }}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredRoomId(room.id);
                  }}
                  onPointerOut={() => setHoveredRoomId(null)}
                >
                  {/* Warm Interior Room Ambient Point Light */}
                  <pointLight
                    position={[0, 2.2, 0]}
                    intensity={isEvening ? 1.4 : 0.65}
                    color="#FFE4B5"
                    distance={6.5}
                    decay={2}
                  />

                  {/* Room Interior Partition Walls */}
                  <mesh position={[0, 1.35, -rd / 2 + 0.06]} material={materials.wallInterior} castShadow receiveShadow>
                    <boxGeometry args={[rw, 2.7, 0.12]} />
                  </mesh>
                  <mesh position={[rw / 2 - 0.06, 1.35, 0]} material={materials.wallInterior} castShadow receiveShadow>
                    <boxGeometry args={[0.12, 2.7, rd - 0.12]} />
                  </mesh>

                  {/* 3D Glowing Room Boundary Bounding Box */}
                  {(isRoomSelected || isRoomHovered) && (
                    <group position={[0, 1.35, 0]}>
                      <mesh>
                        <boxGeometry args={[rw + 0.08, 2.75, rd + 0.08]} />
                        <meshBasicMaterial
                          color={isRoomSelected ? "#10B981" : "#38BDF8"}
                          wireframe
                          transparent
                          opacity={isRoomSelected ? 0.95 : 0.55}
                        />
                      </mesh>
                      <mesh position={[0, -1.36, 0]}>
                        <boxGeometry args={[rw + 0.04, 0.02, rd + 0.04]} />
                        <meshBasicMaterial color={isRoomSelected ? "#10B981" : "#38BDF8"} />
                      </mesh>
                    </group>
                  )}

                  {/* Procedural Room Furniture */}
                  {showFurniture && (
                    <RoomFurnitureMesh
                      type={room.furnitureType}
                      w={rw}
                      d={rd}
                      materials={materials}
                      isFurnitureFocus={isFurnitureFocus}
                      isRoomSelected={isRoomSelected}
                    />
                  )}

                  {/* Floating 3D Room Name Tag */}
                  {shouldShowTag && (
                    <Html position={[0, 2.85, 0.4]} center distanceFactor={17} zIndexRange={[100, 0]}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectRoom) {
                            onSelectRoom(room, [explodedPosX, currentFloorY + 4.5, explodedPosZ + 5.5], [explodedPosX, currentFloorY + 1.2, explodedPosZ]);
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: isRoomSelected
                            ? "rgba(16, 185, 129, 0.95)"
                            : isRoomHovered
                            ? "rgba(56, 189, 248, 0.95)"
                            : "rgba(10, 15, 26, 0.92)",
                          border: `1px solid ${
                            isRoomSelected ? "#10B981" : isRoomHovered ? "#38BDF8" : "rgba(255, 255, 255, 0.2)"
                          }`,
                          boxShadow: isRoomSelected
                            ? "0 0 24px rgba(16, 185, 129, 0.65)"
                            : "0 4px 16px rgba(0, 0, 0, 0.6)",
                          borderRadius: "8px",
                          padding: "4px 10px",
                          cursor: "pointer",
                          transform: isRoomHovered || isRoomSelected ? "scale(1.08)" : "scale(1)",
                          transition: "all 0.15s ease",
                          userSelect: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: isRoomSelected || isRoomHovered ? "#FFFFFF" : "#F8FAFC",
                          letterSpacing: "0.02em",
                        }}>
                          {room.name}
                        </span>
                        <span style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "5px",
                          background: isRoomSelected
                            ? "rgba(0, 0, 0, 0.3)"
                            : "rgba(255, 255, 255, 0.12)",
                          color: isRoomSelected ? "#ECFDF5" : "#94A3B8",
                          fontFamily: "monospace",
                          fontWeight: 700,
                        }}>
                          {room.area} m²
                        </span>
                      </div>
                    </Html>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* ── 3. ROOF / CANTILEVER STRUCTURE (Matching ArchitecturalVilla) ────── */}
      {showRoof && (
        <group position={[0, floors * floorHeight + (isExploded ? floors * 3.8 : 0), -0.5]}>
          {/* Top Roof Slab */}
          <mesh
            position={[0, 0.15, 0]}
            material={materials.floorSlab}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectComponent) onSelectComponent("roofing");
            }}
          >
            <boxGeometry args={[buildingWidth + 0.8, 0.28, buildingDepth + 0.8]} />
          </mesh>

          {/* Sloped Pitched Tiles on Rear Section */}
          <mesh
            position={[0, 1.2, -buildingDepth / 4]}
            rotation={[0.42, 0, 0]}
            material={materials.roofTiles}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectComponent) onSelectComponent("roofing");
            }}
          >
            <boxGeometry args={[buildingWidth + 0.6, 0.24, buildingDepth / 1.7]} />
          </mesh>

          {/* Front Timber Pergola Slats (Exact match to ArchitecturalVilla) */}
          {[-5.0, -3.0, -1.0, 1.0, 3.0, 5.0].map((px, i) => (
            <mesh
              key={`cutaway-pergola-${i}`}
              position={[px, 0.45, buildingDepth / 4]}
              material={materials.timberPergola}
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent("roofing");
              }}
            >
              <boxGeometry args={[0.12, 0.25, buildingDepth / 2.2]} />
            </mesh>
          ))}
        </group>
      )}

      {/* ── 4. GHOST ENVELOPE (Translucent Holographic Architectural Shell) ── */}
      {showGhostEnvelope && !isExploded && isolatedFloor === "all" && (
        <group position={[0, 0, -0.5]}>
          {/* Translucent Front Facade Glass */}
          <mesh position={[0, (floors * floorHeight) / 2, buildingDepth / 2]} material={materials.ghostEnvelope}>
            <boxGeometry args={[buildingWidth, floors * floorHeight, 0.08]} />
          </mesh>
          <mesh position={[0, (floors * floorHeight) / 2, buildingDepth / 2]} material={materials.ghostWireframe}>
            <boxGeometry args={[buildingWidth + 0.02, floors * floorHeight + 0.02, 0.1]} />
          </mesh>
          {/* Exterior Side Wings */}
          {[-buildingWidth / 2, buildingWidth / 2].map((wx, i) => (
            <mesh key={`ghost-wing-${i}`} position={[wx, (floors * floorHeight) / 2, 0]} material={materials.ghostEnvelope}>
              <boxGeometry args={[0.1, floors * floorHeight, buildingDepth]} />
            </mesh>
          ))}
        </group>
      )}

      {/* ── 5. ARCHITECTURAL CAD DIMENSION LINES ───────────────────────── */}
      {showDimensions && !isExploded && isolatedFloor === "all" && (
        <group position={[0, -0.05, -0.5]}>
          {/* Front Width Dimension Line */}
          <group position={[0, 0.08, plinthDepth / 2 + 0.6]}>
            <mesh material={materials.dimensionLine}>
              <boxGeometry args={[buildingWidth, 0.02, 0.02]} />
            </mesh>
            <mesh position={[-buildingWidth / 2, 0, 0]} material={materials.dimensionLine}>
              <boxGeometry args={[0.02, 0.02, 0.4]} />
            </mesh>
            <mesh position={[buildingWidth / 2, 0, 0]} material={materials.dimensionLine}>
              <boxGeometry args={[0.02, 0.02, 0.4]} />
            </mesh>
            <Html position={[0, 0.2, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
              <div style={{
                color: "#10B981",
                fontSize: "11px",
                fontWeight: 800,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                background: "rgba(6, 14, 26, 0.92)",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid #10B981",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}>
                ← {buildingWidth.toFixed(2)} m (WIDTH) →
              </div>
            </Html>
          </group>

          {/* Side Depth Dimension Line */}
          <group position={[plinthWidth / 2 + 0.6, 0.08, 0]}>
            <mesh material={materials.dimensionLine}>
              <boxGeometry args={[0.02, 0.02, buildingDepth]} />
            </mesh>
            <mesh position={[0, 0, -buildingDepth / 2]} material={materials.dimensionLine}>
              <boxGeometry args={[0.4, 0.02, 0.02]} />
            </mesh>
            <mesh position={[0, 0, buildingDepth / 2]} material={materials.dimensionLine}>
              <boxGeometry args={[0.4, 0.02, 0.02]} />
            </mesh>
            <Html position={[0.2, 0.2, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
              <div style={{
                color: "#10B981",
                fontSize: "11px",
                fontWeight: 800,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
                background: "rgba(6, 14, 26, 0.92)",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid #10B981",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}>
                ← {buildingDepth.toFixed(2)} m (DEPTH) →
              </div>
            </Html>
          </group>
        </group>
      )}
    </group>
  );
}
