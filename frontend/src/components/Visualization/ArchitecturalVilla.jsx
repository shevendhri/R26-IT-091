"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

// Procedural sharp canvas text texture utility for architectural signage and CAD annotations
function createTextTexture(text, width = 512, height = 128, fontSize = 48, textColor = "#334155", bgColor = "transparent") {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Procedural rounded rectangle 2D spline shape helper for curvilinear architectural balconies and plinths
function createRoundedRectShape(width, depth, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const z = -depth / 2;
  const w = width;
  const d = depth;
  const r = Math.min(radius, w / 2, d / 2);

  shape.moveTo(x + r, z);
  shape.lineTo(x + w - r, z);
  shape.quadraticCurveTo(x + w, z, x + w, z + r);
  shape.lineTo(x + w, z + d - r);
  shape.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
  shape.lineTo(x + r, z + d);
  shape.quadraticCurveTo(x, z + d, x, z + d - r);
  shape.lineTo(x, z + r);
  shape.quadraticCurveTo(x, z, x + r, z);

  return shape;
}

// Parametric Curvilinear Floor Slab with rounded corners
function CurvedSlab({ width, depth, height, radius, material, ...props }) {
  const shape = useMemo(() => createRoundedRectShape(width, depth, radius), [width, depth, radius]);
  const extrudeSettings = useMemo(() => ({ depth: height, bevelEnabled: false, curveSegments: 20 }), [height]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material} castShadow receiveShadow {...props}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
    </mesh>
  );
}

// Parametric Curvilinear Balustrade / Parapet Ribbon with continuous curved corners
function CurvedBand({ width, depth, height, radius, thickness = 0.24, material, ...props }) {
  const shape = useMemo(() => {
    const outer = createRoundedRectShape(width, depth, radius);
    const innerW = width - thickness * 2;
    const innerD = depth - thickness * 2;
    const innerR = Math.max(0.1, radius - thickness);
    const innerHole = createRoundedRectShape(innerW, innerD, innerR);
    outer.holes = [innerHole];
    return outer;
  }, [width, depth, radius, thickness]);

  const extrudeSettings = useMemo(() => ({ depth: height, bevelEnabled: false, curveSegments: 20 }), [height]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material} castShadow receiveShadow {...props}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
    </mesh>
  );
}

/**
 * ArchitecturalVilla Component
 * Parametric 3D Architectural Visualization Engine:
 * - Dynamically renders parametric 3D geometries based on project typology:
 *   1. Hotel: Multi-story luxury resort layout with grand lobby, porte-cochère, guest room balcony stacks, rooftop sky lounge.
 *   2. Commercial: High-rise office tower with double-height glass atrium, structural curtain wall grid, rooftop HVAC penthouse.
 *   3. Industrial: High-bay cutaway industrial complex with steel I-beams, precast office wing, glass stair tower & mezzanine.
 *   4. Residential: Contemporary luxury cantilevered villa with slate terrace, soffit downlights, bamboo landscaping.
 * - Dynamically updates materials (walls, glazing, columns, slate floors) when material selections change.
 * - Interactive 3D component inspection with SLS standard and eco scores on click.
 */

export default function ArchitecturalVilla({
  floorCount = 2,
  buildingType = "Residential",
  isEvening = true,
  isXray = false,
  specMode = "eco",
  isolatedFloor = "all",
  selectedComponentId = null,
  highlightedComponent = null,
  activeMaterials,
  onSelectComponent,
}) {
  const floors = Math.max(1, parseInt(floorCount, 10) || 2);
  const roofY = floors === 1 ? 3.25 : (floors * 3.1) + 0.15;
  const isBaseline = specMode === "baseline";

  const isWallHighlighted = highlightedComponent === "walls" || selectedComponentId === "walls";
  const isFloorHighlighted = highlightedComponent === "flooring" || selectedComponentId === "flooring";
  const isGlazeHighlighted = highlightedComponent === "glazing" || selectedComponentId === "glazing";
  const isColHighlighted = highlightedComponent === "columns" || selectedComponentId === "columns";
  const isRoofHighlighted = highlightedComponent === "roofing" || selectedComponentId === "roofing";

  // PBR Materials dynamically bound to the selected material specifications & specMode
  const materials = useMemo(() => {
    const wallOpacity = isXray ? 0.35 : 1.0;
    const wallTransparent = isXray;

    const wallColor = isBaseline ? "#9E4832" : (activeMaterials?.wall?.color || "#EAE6DF");
    const wallRoughness = isBaseline ? 0.92 : (activeMaterials?.wall?.roughness ?? 0.82);
    const wallMetalness = isBaseline ? 0.01 : (activeMaterials?.wall?.metalness ?? 0.04);

    const floorColor = isBaseline ? "#7C828C" : (activeMaterials?.floor?.color || "#C4BEB4");
    const floorRoughness = isBaseline ? 0.85 : (activeMaterials?.floor?.roughness ?? 0.72);
    const floorMetalness = isBaseline ? 0.02 : (activeMaterials?.floor?.metalness ?? 0.08);

    const colColor = isBaseline ? "#505660" : (activeMaterials?.columns?.color || "#3A3F47");
    const colRoughness = isBaseline ? 0.75 : (activeMaterials?.columns?.roughness ?? 0.55);
    const colMetalness = isBaseline ? 0.05 : (activeMaterials?.columns?.metalness ?? 0.25);

    return {
      whiteStucco: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#A8A49D" : "#F5F4EE"),
        roughness: 0.76,
        metalness: 0.02,
        transparent: wallTransparent,
        opacity: wallOpacity,
        emissive: isWallHighlighted ? new THREE.Color("#E0C58A") : new THREE.Color("#000000"),
        emissiveIntensity: isWallHighlighted ? 0.18 : 0.0,
      }),
      taupeWall: new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          isBaseline
            ? "#8A402E"
            : activeMaterials?.wall?.id === "timber_siding"
            ? "#8E623E"
            : activeMaterials?.wall?.id === "exposed_concrete"
            ? "#7C828A"
            : "#7E756B"
        ),
        roughness: 0.82,
        metalness: 0.03,
        transparent: wallTransparent,
        opacity: wallOpacity,
        emissive: isWallHighlighted ? new THREE.Color("#E0C58A") : new THREE.Color("#000000"),
        emissiveIntensity: isWallHighlighted ? 0.18 : 0.0,
      }),
      timberSlat: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#484E56" : "#B5895D"),
        roughness: 0.60,
        metalness: isBaseline ? 0.6 : 0.03,
      }),
      timberPergola: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#3B4149" : "#4A3728"),
        roughness: 0.55,
        metalness: isBaseline ? 0.6 : 0.04,
      }),
      stoneAccent: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#6E5B4F" : "#8D6A52"),
        roughness: 0.88,
        metalness: 0.02,
      }),
      whiteFascia: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#9A9E9F" : "#F0EEE9"),
        roughness: 0.55,
        metalness: 0.05,
        emissive: isRoofHighlighted ? new THREE.Color("#E0C58A") : new THREE.Color("#000000"),
        emissiveIntensity: isRoofHighlighted ? 0.2 : 0.0,
      }),
      accentRender: new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          isBaseline
            ? "#8A402E"
            : activeMaterials?.wall?.id === "timber_siding"
            ? "#8E623E"
            : activeMaterials?.wall?.id === "exposed_concrete"
            ? "#787D85"
            : activeMaterials?.wall?.id === "terracotta_mineral"
            ? "#9C7256"
            : "#7E756B"
        ),
        roughness: 0.80,
        metalness: 0.03,
        transparent: wallTransparent,
        opacity: wallOpacity,
        emissive: isWallHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isWallHighlighted ? 0.35 : 0.0,
      }),
      charcoalFascia: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#3F434A" : "#2A2D33"),
        roughness: 0.5,
        metalness: 0.2,
        emissive: isRoofHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isRoofHighlighted ? 0.4 : 0.0,
      }),
      slateTerrace: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#4E545E" : "#D0CAC0"),
        roughness: 0.70,
        metalness: 0.06,
      }),
      foundationPlinth: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isBaseline ? "#50555E" : "#7D776F"),
        roughness: 0.85,
        metalness: 0.04,
      }),
      blackFrame: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#24262A"),
        roughness: 0.35,
        metalness: 0.8,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(isBaseline ? "#98B9C8" : "#FFFFFF"),
        transparent: true,
        opacity: isBaseline ? 0.45 : 0.30,
        roughness: 0.06,
        metalness: 0.0,
        transmission: isBaseline ? 0.80 : 0.85,
        ior: 1.45,
        reflectivity: 0.4,
      }),
      balconyGlass: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(isBaseline ? "#98B9C8" : "#FFFFFF"),
        transparent: true,
        opacity: isBaseline ? 0.40 : 0.25,
        roughness: 0.05,
        metalness: 0.0,
        transmission: 0.90,
        ior: 1.45,
        reflectivity: 0.4,
      }),
      downlightLens: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#FFF8E7"),
        emissive: new THREE.Color("#FFBA42"),
        emissiveIntensity: isEvening ? 5.0 : 1.0,
        roughness: 0.1,
      }),
      bambooStalk: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#7A4A28"),
        roughness: 0.65,
        metalness: 0.05,
      }),
      bambooLeaves: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#4C5946"),
        roughness: 0.85,
        metalness: 0.02,
      }),
      columnWhite: new THREE.MeshStandardMaterial({
        color: new THREE.Color(colColor),
        roughness: colRoughness,
        metalness: colMetalness,
      }),
      signEmissive: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#FFF8E7"),
        emissive: new THREE.Color("#D4AF37"),
        emissiveIntensity: isEvening ? 2.5 : 0.6,
        roughness: 0.2,
      }),
      hospitalRed: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#EF4444"),
        emissive: new THREE.Color("#DC2626"),
        emissiveIntensity: isEvening ? 3.5 : 1.5,
        roughness: 0.2,
      }),
      helipadMarking: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#E2E8F0"),
        emissive: new THREE.Color("#94A3B8"),
        emissiveIntensity: isEvening ? 1.5 : 0.4,
        roughness: 0.4,
      }),
      academicCrest: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9E8055"),
        emissive: new THREE.Color("#4A3B24"),
        emissiveIntensity: isEvening ? 2.0 : 0.8,
        roughness: 0.3,
        metalness: 0.7,
      }),
      academicBrick: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#8C7A6A"),
        roughness: 0.88,
        metalness: 0.04,
      }),
      industrialRoof: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3A3F47"),
        roughness: 0.55,
        metalness: 0.65,
      }),
      hvacMetal: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#71717A"),
        roughness: 0.35,
        metalness: 0.8,
      }),
      hvacFan: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#18181B"),
        roughness: 0.6,
        metalness: 0.6,
      }),
      gravelRoof: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#27272A"),
        roughness: 0.95,
        metalness: 0.1,
      }),
      streetLampPole: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1E293B"),
        roughness: 0.4,
        metalness: 0.8,
      }),
      streetLampLight: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#FEF08A"),
        emissive: new THREE.Color("#FBBF24"),
        emissiveIntensity: isEvening ? 4.0 : 1.2,
        roughness: 0.1,
      }),
      copperCanopy: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#7A4A28"),
        roughness: 0.55,
        metalness: 0.15,
      }),
      concreteGroove: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#8C8F94"),
        roughness: 0.92,
        metalness: 0.06,
      }),
      treeBark: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#5C3D22"),
        roughness: 0.9,
        metalness: 0.04,
      }),
      treeFoliage: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#4A5A48"),
        roughness: 0.85,
        metalness: 0.04,
      }),
      asphaltRoad: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#3A3D42"),
        roughness: 0.92,
        metalness: 0.08,
      }),
      roadMarking: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#F8FAFC"),
        roughness: 0.5,
        metalness: 0.1,
      }),
      precastConcrete: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#B8BDC4"),
        roughness: 0.84,
        metalness: 0.04,
        transparent: wallTransparent,
        opacity: wallOpacity,
        emissive: isWallHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isWallHighlighted ? 0.35 : 0.0,
      }),
      corrugatedMetal: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#989EA7"),
        roughness: 0.45,
        metalness: 0.58,
        transparent: wallTransparent,
        opacity: wallOpacity,
      }),
      steelIBeam: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1E2127"),
        roughness: 0.32,
        metalness: 0.85,
        emissive: isColHighlighted ? new THREE.Color("#38BDF8") : new THREE.Color("#000000"),
        emissiveIntensity: isColHighlighted ? 0.4 : 0.0,
      }),
      polishedConcreteFloor: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#CAD0D8"),
        roughness: 0.38,
        metalness: 0.12,
        emissive: isFloorHighlighted ? new THREE.Color("#10B981") : new THREE.Color("#000000"),
        emissiveIntensity: isFloorHighlighted ? 0.25 : 0.0,
      }),
      safetyBollard: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#FBBF24"),
        roughness: 0.32,
        metalness: 0.20,
      }),
      hvacSpiralDuct: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#B4B8BF"),
        roughness: 0.28,
        metalness: 0.78,
      }),
      industrialShutter: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#4A505C"),
        roughness: 0.45,
        metalness: 0.62,
      }),
      safetyRailing: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#25282F"),
        roughness: 0.40,
        metalness: 0.75,
      }),
      partitionWall: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#F3F4F6"),
        roughness: 0.86,
        metalness: 0.02,
        transparent: wallTransparent,
        opacity: wallOpacity,
      }),
      cadDimension: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#64748B"),
        roughness: 0.50,
        metalness: 0.10,
      }),
      lushHedge: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2E5424"),
        roughness: 0.88,
        metalness: 0.02,
      }),
      furnitureDesk: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#E2E8F0"),
        roughness: 0.65,
        metalness: 0.05,
      }),
      furnitureWood: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C8A785"),
        roughness: 0.60,
        metalness: 0.04,
      }),
      furnitureDark: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2D3748"),
        roughness: 0.50,
        metalness: 0.30,
      }),
    };
  }, [isEvening, isXray, activeMaterials]);

  // Downlight Positions under main roof eaves
  const roofDownlights = useMemo(() => [
    [-6.2, roofY - 0.02, 5.8],
    [-4.5, roofY - 0.02, 5.8],
    [-2.8, roofY - 0.02, 5.8],
    [-1.0, roofY - 0.02, 5.8],
    [0.8,  roofY - 0.02, 5.8],
    [2.6,  roofY - 0.02, 5.8],
    [4.4,  roofY - 0.02, 5.8],
    [6.0,  roofY - 0.02, 5.8],
    [6.6,  roofY - 0.02, 4.0],
    [6.6,  roofY - 0.02, 1.8],
    [6.6,  roofY - 0.02, -0.5],
    [6.6,  roofY - 0.02, -2.8],
    [6.6,  roofY - 0.02, -5.0],
  ], [roofY]);

  const porchDownlights = useMemo(() => [
    [-5.5, 3.18, 4.6],
    [-3.5, 3.18, 4.6],
    [-1.5, 3.18, 4.6],
    [-5.5, 3.18, 2.5],
    [-3.5, 3.18, 2.5],
    [-1.5, 3.18, 2.5],
  ], []);

  const bambooStalks = useMemo(() => {
    const list = [];
    for (let z = -5.8; z <= 4.2; z += 0.45) {
      list.push([7.2 + (Math.sin(z * 3) * 0.15), z, 3.6 + (Math.cos(z * 2) * 0.4)]);
    }
    for (let x = 2.0; x <= 6.8; x += 0.5) {
      list.push([x, -6.1 + (Math.sin(x * 2) * 0.15), 3.8 + (Math.cos(x * 3) * 0.3)]);
    }
    return list;
  }, []);

  const handleComponentClick = (e, comp) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent(comp);
    }
  };

  // Procedural signage and CAD measurement annotation textures
  const industrialSignage = useMemo(() => {
    return {
      meetingRoom: createTextTexture("MEETING ROOM", 512, 128, 48, "#475569"),
      inspectionRoom: createTextTexture("INSPECTION ROOM", 512, 128, 44, "#475569"),
      dim2400: createTextTexture("2400", 256, 64, 30, "#64748B"),
      dim3600: createTextTexture("3600", 256, 64, 30, "#64748B"),
      dim7200: createTextTexture("7200", 256, 64, 30, "#64748B"),
      dim14400: createTextTexture("14400", 256, 64, 30, "#64748B"),
    };
  }, []);

  const bType = (buildingType || "").toLowerCase();
  const isHotel = bType.includes("hotel") || bType.includes("resort") || bType.includes("hospitality");
  const isCommercial = bType.includes("commercial") || bType.includes("office") || bType.includes("retail") || bType.includes("mixed");
  const isIndustrial = bType.includes("industrial") || bType.includes("warehouse") || bType.includes("factory") || bType.includes("logistics");
  const isHealthcare = bType.includes("health") || bType.includes("hospital") || bType.includes("clinic") || bType.includes("medical");
  const isEducational = bType.includes("education") || bType.includes("school") || bType.includes("college") || bType.includes("university") || bType.includes("academic");

  // ══════════════════════════════════════════════════════════════════
  // TYPOLOGY 1: LUXURY CURVILINEAR BOUTIQUE RESORT HOTEL (Matching Reference Image)
  // ══════════════════════════════════════════════════════════════════
  if (isHotel) {
    // Dynamic questionnaire floorCount: handles user requirement seamlessly (default to 4 tiers if <= 2 to match luxury proportions)
    const hotelFloors = Math.max(3, floors);
    const floorHeight = 3.0;
    const totalTowerHeight = hotelFloors * floorHeight + 0.4;
    const roofY = totalTowerHeight + 0.1;

    // Dimensions matching reference photo
    const plinthW = 18.2;
    const plinthD = 14.8;
    const plinthR = 2.2;

    const slabW = 16.4;
    const slabD = 13.2;
    const slabR = 1.8;
    const slabThickness = 0.35;
    const parapetHeight = 0.78;
    const glassRailHeight = 0.35;

    const coreW = 12.8;
    const coreD = 9.8;

    return (
      <group position={[0, 0, 0]}>
        {/* 1. GROUND PODIUM TERRACE & PLINTH */}
        <group position={[0, 0, 0]}>
          {/* Sub-Foundation */}
          <mesh position={[0, -0.25, 0]} material={materials.foundationPlinth} receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Hotel Seismic Raft Slab Foundation",
            category: "Foundation",
            specs: "High-grade low-carbon concrete raft foundation, SLS 614 Grade 40",
            ecoScore: 94
          })}>
            <boxGeometry args={[plinthW + 1.2, 0.5, plinthD + 1.2]} />
          </mesh>

          {/* Curved Podium Terrace Plinth */}
          <CurvedSlab
            position={[0, 0, 0]}
            width={plinthW}
            depth={plinthD}
            height={0.42}
            radius={plinthR}
            material={materials.whiteStucco}
            onClick={(e) => handleComponentClick(e, {
              name: "Curved Architectural Podium Terrace",
              category: "Hard Landscaping",
              specs: "Smooth precast architectural white concrete podium with non-slip finish, SLS 1181",
              ecoScore: 92
            })}
          />

          {/* Entrance Access Ramp & Steps on Right Corner */}
          <group position={[plinthW / 2 - 0.2, 0, plinthD / 2 - 2.5]}>
            <mesh position={[1.4, 0.18, 0]} rotation={[0, 0, -0.15]} material={materials.slateTerrace}>
              <boxGeometry args={[2.8, 0.18, 2.2]} />
            </mesh>
            <mesh position={[1.4, 0.1, 1.2]} material={materials.whiteStucco}>
              <boxGeometry args={[2.8, 0.2, 0.2]} />
            </mesh>
          </group>

          {/* Ground-Level Outdoor Lounge Sunbeds & Planters */}
          {/* Sun loungers on ground terrace front-left */}
          {[-4.5, -2.5].map((lx, lIdx) => (
            <group key={`ground-lounger-${lIdx}`} position={[lx, 0.42, plinthD / 2 - 2.0]}>
              {/* Teak Lounger Base */}
              <mesh position={[0, 0.1, 0]} material={materials.furnitureWood}>
                <boxGeometry args={[0.9, 0.14, 2.0]} />
              </mesh>
              {/* Cream Cushion */}
              <mesh position={[0, 0.22, 0.1]} material={materials.furnitureDesk}>
                <boxGeometry args={[0.82, 0.12, 1.7]} />
              </mesh>
              {/* Reclined Headrest */}
              <mesh position={[0, 0.35, -0.75]} rotation={[-0.45, 0, 0]} material={materials.furnitureDesk}>
                <boxGeometry args={[0.82, 0.12, 0.6]} />
              </mesh>
            </group>
          ))}

          {/* Ground Terrace Planters with Dense Greenery */}
          <mesh position={[-5.8, 0.65, plinthD / 2 - 1.2]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[3.2, 0.45, 0.65]} />
          </mesh>
          <mesh position={[-5.8, 0.95, plinthD / 2 - 1.2]} material={materials.lushHedge} castShadow>
            <boxGeometry args={[3.1, 0.35, 0.55]} />
          </mesh>
        </group>

        {/* 2. REPEATING CURVILINEAR BALCONY SUITE TIERS (DYNAMIC ACCORDING TO questionnaire floorCount) */}
        {Array.from({ length: hotelFloors }).map((_, idx) => {
          const baseY = idx * floorHeight + 0.42;

          return (
            <group key={`hotel-suite-tier-${idx}`} position={[0, baseY, 0]}>
              {/* Continuous Curved Cantilevered Balcony Slab */}
              <CurvedSlab
                position={[0, 0, 0]}
                width={slabW}
                depth={slabD}
                height={slabThickness}
                radius={slabR}
                material={materials.whiteStucco}
                onClick={(e) => handleComponentClick(e, {
                  name: `Level ${idx + 1} Curved Cantilevered Balcony Slab`,
                  category: "Structural Frame",
                  specs: "Post-tensioned low-carbon reinforced concrete cantilever slab, SLS 375 Grade 40",
                  ecoScore: 94
                })}
              />

              {/* Continuous Smooth White Ribbon Parapet Balustrade Band */}
              <CurvedBand
                position={[0, slabThickness, 0]}
                width={slabW}
                depth={slabD}
                height={parapetHeight}
                radius={slabR}
                thickness={0.26}
                material={materials.whiteStucco}
                onClick={(e) => handleComponentClick(e, {
                  name: `Level ${idx + 1} Sculptural Balustrade Ribbon`,
                  category: "Facade Envelope",
                  specs: "Curvilinear aerodynamic precast insulated parapet fascia band with anti-staining hydrophobic coating",
                  ecoScore: 93
                })}
              />

              {/* Sleek Low Glass Balustrade Extension atop White Ribbon */}
              <CurvedBand
                position={[0, slabThickness + parapetHeight, 0]}
                width={slabW - 0.08}
                depth={slabD - 0.08}
                height={glassRailHeight}
                radius={slabR - 0.04}
                thickness={0.06}
                material={materials.balconyGlass}
                onClick={(e) => handleComponentClick(e, {
                  name: `Level ${idx + 1} Frameless Laminated Glass Railing`,
                  category: "Safety & Railings",
                  specs: "12mm Toughened laminated Low-Iron safety glass with minimalist embedded base shoe",
                  ecoScore: 96
                })}
              />

              {/* Recessed Panoramic Glass Suite Enclosure */}
              <mesh position={[0, floorHeight / 2, -0.2]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
                name: `Level ${idx + 1} Panoramic Sliding Glass Enclosure`,
                category: "Glazing & Fenestration",
                specs: "Floor-to-ceiling thermal-break aluminum double glazing, Low-E solar control, SHGC=0.28, U=1.3 W/m²K",
                ecoScore: 95
              })}>
                <boxGeometry args={[coreW, floorHeight - slabThickness - 0.05, coreD]} />
              </mesh>

              {/* Slim Dark Bronze/Charcoal Mullion Grid along the front & side glass */}
              {[-4.2, -1.8, 0.8, 3.2, 5.2].map((mx, mIdx) => (
                <mesh key={`mullion-f-${idx}-${mIdx}`} position={[mx, floorHeight / 2, coreD / 2 - 0.18]} material={materials.blackFrame}>
                  <boxGeometry args={[0.08, floorHeight - slabThickness, 0.1]} />
                </mesh>
              ))}
              {[-3.0, 0, 3.0].map((mz, mIdx) => (
                <mesh key={`mullion-s-${idx}-${mIdx}`} position={[coreW / 2 - 0.18, floorHeight / 2, mz]} material={materials.blackFrame}>
                  <boxGeometry args={[0.1, floorHeight - slabThickness, 0.08]} />
                </mesh>
              ))}

              {/* Architectural Cylindrical Pilotis / Columns supporting the cantilevers */}
              {[
                [-5.4, 4.2], [1.2, 4.4], [5.6, 2.2],
                [-5.4, -4.0], [5.6, -3.8]
              ].map(([cx, cz], cIdx) => (
                <mesh key={`hotel-col-${idx}-${cIdx}`} position={[cx, floorHeight / 2, cz]} material={materials.columnWhite} castShadow onClick={(e) => handleComponentClick(e, {
                  name: `Architectural Circular RC Column`,
                  category: "Structural Columns",
                  specs: "450mm High-strength reinforced concrete circular column, SLS 614 Grade 45",
                  ecoScore: 93
                })}>
                  <cylinderGeometry args={[0.22, 0.22, floorHeight - slabThickness, 24]} />
                </mesh>
              ))}

              {/* Terrace Overflowing Planter Boxes & Trailing Greenery */}
              {/* Front Right Planter Box */}
              <group position={[3.2, slabThickness, slabD / 2 - 0.7]}>
                <mesh position={[0, 0.22, 0]} material={materials.whiteStucco} castShadow>
                  <boxGeometry args={[3.6, 0.45, 0.55]} />
                </mesh>
                {/* Lush Plant Spheres */}
                {[-1.2, -0.6, 0, 0.6, 1.2].map((px, pIdx) => (
                  <mesh key={`planter-bush-${idx}-${pIdx}`} position={[px, 0.48, 0]} material={materials.bambooLeaves} castShadow>
                    <sphereGeometry args={[0.24 + (pIdx % 2) * 0.06, 8, 8]} />
                  </mesh>
                ))}
                {/* Trailing Vines Draping over the Balcony Parapet */}
                {[-1.0, 0.2, 0.8].map((vx, vIdx) => (
                  <mesh key={`vine-${idx}-${vIdx}`} position={[vx, -0.15, 0.32]} material={materials.bambooLeaves} castShadow>
                    <boxGeometry args={[0.3, 0.55 + (vIdx % 2) * 0.2, 0.08]} />
                  </mesh>
                ))}
              </group>

              {/* Potted Tropical Palms on the Terrace */}
              <group position={[-slabW / 2 + 1.8, slabThickness, slabD / 2 - 1.6]}>
                {/* White Ceramic Pot */}
                <mesh position={[0, 0.3, 0]} material={materials.whiteStucco} castShadow>
                  <cylinderGeometry args={[0.26, 0.2, 0.6, 16]} />
                </mesh>
                {/* Palm Stalk & Fronds */}
                <mesh position={[0, 0.85, 0]} material={materials.treeBark}>
                  <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
                </mesh>
                <mesh position={[0, 1.2, 0]} material={materials.lushHedge} castShadow>
                  <sphereGeometry args={[0.55, 8, 8]} />
                </mesh>
              </group>

              {/* Luxury Chaise Loungers & Outdoor Cocktail Table */}
              <group position={[-1.6, slabThickness, slabD / 2 - 1.8]}>
                {/* Chaise Lounger */}
                <mesh position={[0, 0.12, 0]} material={materials.furnitureWood}>
                  <boxGeometry args={[0.75, 0.12, 1.8]} />
                </mesh>
                <mesh position={[0, 0.22, 0.1]} material={materials.furnitureDesk}>
                  <boxGeometry args={[0.68, 0.1, 1.5]} />
                </mesh>
                <mesh position={[0, 0.34, -0.65]} rotation={[-0.45, 0, 0]} material={materials.furnitureDesk}>
                  <boxGeometry args={[0.68, 0.1, 0.5]} />
                </mesh>
                {/* Side Drink Table */}
                <mesh position={[0.7, 0.22, 0]} material={materials.furnitureWood}>
                  <cylinderGeometry args={[0.2, 0.2, 0.44, 16]} />
                </mesh>
              </group>

              {/* Warm Golden Interior Ambient Glow (~2700K Warm Light) */}
              <pointLight
                color="#FDBA74"
                intensity={isEvening ? 2.6 : 1.2}
                distance={10.0}
                decay={1.8}
                position={[0, floorHeight / 2, 0]}
              />
            </group>
          );
        })}

        {/* 3. ROOFTOP SKY PENTHOUSE SUITE & GARDEN TERRACE */}
        <group position={[0, roofY, 0]}>
          {/* Rooftop Cantilevered Garden Slab */}
          <CurvedSlab
            position={[0, 0, 0]}
            width={slabW}
            depth={slabD}
            height={0.4}
            radius={slabR}
            material={materials.whiteStucco}
            onClick={(e) => handleComponentClick(e, {
              name: "Rooftop Sky Terrace & Penthouse Deck",
              category: "Roofing & Terraces",
              specs: "Extensive green roof deck with 100% reflective cool-roof membrane and rooftop garden, SLS 1265",
              ecoScore: 97
            })}
          />

          {/* Rooftop Glass Perimeter Balustrade */}
          <CurvedBand
            position={[0, 0.4, 0]}
            width={slabW - 0.2}
            depth={slabD - 0.2}
            height={0.95}
            radius={slabR - 0.1}
            thickness={0.06}
            material={materials.balconyGlass}
          />

          {/* Recessed Sky Penthouse Suite (Floor-to-Ceiling Glass) */}
          <group position={[0, 0.4, 0]}>
            <mesh position={[0, 1.4, -0.4]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
              name: "Presidential Sky Penthouse Suite",
              category: "Penthouse",
              specs: "Triple-glazed panoramic sky suite with motorized architectural louvers",
              ecoScore: 98
            })}>
              <boxGeometry args={[coreW - 1.2, 2.7, coreD - 1.5]} />
            </mesh>
            {/* Penthouse Overhang Roof Slab with Rounded Corners */}
            <CurvedSlab
              position={[0, 2.75, -0.4]}
              width={coreW + 0.8}
              depth={coreD + 0.6}
              height={0.3}
              radius={1.4}
              material={materials.whiteStucco}
            />

            {/* Rooftop Terrace Planter Box with Palms */}
            <mesh position={[-2.4, 0.22, 2.8]} material={materials.whiteStucco} castShadow>
              <boxGeometry args={[3.8, 0.45, 0.7]} />
            </mesh>
            <mesh position={[-2.4, 0.55, 2.8]} material={materials.lushHedge} castShadow>
              <boxGeometry args={[3.6, 0.35, 0.6]} />
            </mesh>

            {/* Central Fluted Elevator Bulkhead / Penthouse Plant Room */}
            <group position={[0, 2.9, -1.8]}>
              <mesh material={materials.whiteStucco} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Elevator Traction Penthouse & Plant Enclosure",
                category: "Building Services",
                specs: "Acoustic concrete penthouse housing MRL gearless elevator machinery and ventilation shafts",
                ecoScore: 95
              })}>
                <boxGeometry args={[4.2, 1.6, 3.4]} />
              </mesh>
              {/* Vertical Fluted Architectural Ribs */}
              {[-1.6, -1.0, -0.4, 0.2, 0.8, 1.4].map((rx, rIdx) => (
                <mesh key={`flute-${rIdx}`} position={[rx, 0, 1.72]} material={materials.precastConcrete}>
                  <boxGeometry args={[0.12, 1.55, 0.06]} />
                </mesh>
              ))}
            </group>

            {/* Penthouse Warm Light */}
            <pointLight
              color="#FDBA74"
              intensity={isEvening ? 3.0 : 1.4}
              distance={12.0}
              decay={1.8}
              position={[0, 1.5, 0]}
            />
          </group>
        </group>

        {/* 4. THE TWO FLANKING ARCHITECTURAL TREES (MATCHING REFERENCE IMAGE) */}
        {/* Left Tree: Slender Deciduous Tree with Curving Wood Trunk */}
        <group position={[-11.5, 0, 1.5]}>
          {/* Curved Organic Trunk */}
          <mesh position={[0, 1.4, 0]} rotation={[0, 0, -0.1]} material={materials.treeBark} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 2.8, 10]} />
          </mesh>
          <mesh position={[-0.2, 3.2, 0.1]} rotation={[0.08, 0, 0.15]} material={materials.treeBark} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 1.8, 8]} />
          </mesh>
          {/* Tiered Canopy Foliage Clusters */}
          <mesh position={[-0.3, 4.4, 0.2]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[1.2, 10, 10]} />
          </mesh>
          <mesh position={[0.4, 4.1, -0.2]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[1.0, 10, 10]} />
          </mesh>
          <mesh position={[-0.2, 5.3, 0.1]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[0.9, 10, 10]} />
          </mesh>
        </group>

        {/* Right Tree: Taller Lush Architectural Shade Tree */}
        <group position={[11.5, 0, -1.0]}>
          {/* Strong Branching Trunk */}
          <mesh position={[0, 1.8, 0]} material={materials.treeBark} castShadow>
            <cylinderGeometry args={[0.18, 0.25, 3.6, 10]} />
          </mesh>
          <mesh position={[0.3, 3.8, 0.2]} rotation={[0.1, 0, -0.18]} material={materials.treeBark}>
            <cylinderGeometry args={[0.1, 0.16, 2.0, 8]} />
          </mesh>
          <mesh position={[-0.3, 4.0, -0.2]} rotation={[-0.1, 0, 0.2]} material={materials.treeBark}>
            <cylinderGeometry args={[0.09, 0.14, 2.0, 8]} />
          </mesh>
          {/* Dense Lush Leaf Canopies */}
          <mesh position={[0, 5.0, 0]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[1.6, 10, 10]} />
          </mesh>
          <mesh position={[0.6, 4.4, 0.6]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[1.2, 10, 10]} />
          </mesh>
          <mesh position={[-0.6, 4.6, -0.5]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[1.25, 10, 10]} />
          </mesh>
          <mesh position={[0, 6.2, 0.1]} material={materials.treeFoliage} castShadow>
            <sphereGeometry args={[1.1, 10, 10]} />
          </mesh>
        </group>

        {/* 5. SOFT AMBIENT STUDIO LIGHTING */}
        {isEvening ? (
          <>
            <pointLight color="#FED7AA" intensity={2.2} distance={16.0} decay={1.8} position={[0, 5.0, 9.5]} />
            <pointLight color="#FFE4E6" intensity={1.8} distance={14.0} decay={1.8} position={[8.0, 4.0, 0]} />
          </>
        ) : (
          <pointLight color="#FFF8E7" intensity={0.9} distance={16.0} decay={1.8} position={[0, 6.0, 8.0]} />
        )}
      </group>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TYPOLOGY 2: REALISTIC COMMERCIAL OFFICE TOWER (Reference Image 2)
  // ══════════════════════════════════════════════════════════════════
  if (isCommercial) {
    const effectiveFloors = Math.max(10, floors);
    const totalTowerHeight = effectiveFloors * 3.2 + 0.8;
    const roofY = totalTowerHeight + 0.1;

    return (
      <group position={[0, 0, 0]}>
        {/* Concrete Foundation Plinth */}
        <mesh position={[0, -0.25, 0]} material={materials.foundationPlinth} receiveShadow onClick={(e) => handleComponentClick(e, {
          name: "Commercial Heavy Mat Foundation", category: "Foundation", specs: "Mass concrete raft foundation, SLS 614 Grade 45", ecoScore: 92
        })}>
          <boxGeometry args={[18.5, 0.5, 15.5]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={materials.slateTerrace} receiveShadow>
          <boxGeometry args={[18.0, 0.08, 15.0]} />
        </mesh>

        {/* 4 Massive Architectural Precast Corner Columns (Chamfered Tower Corners from Image 2) */}
        {[
          [-6.8, -5.2],
          [6.8, -5.2],
          [-6.8, 5.2],
          [6.8, 5.2],
        ].map(([cx, cz], cIdx) => (
          <group key={`corner-col-${cIdx}`} position={[cx, totalTowerHeight / 2, cz]}>
            <mesh material={materials.whiteStucco} castShadow receiveShadow>
              <boxGeometry args={[1.8, totalTowerHeight, 1.8]} />
            </mesh>
            {/* 45-degree Beveled Chamfer Face */}
            <mesh
              position={[cx > 0 ? 0.65 : -0.65, 0, cz > 0 ? 0.65 : -0.65]}
              rotation={[0, Math.PI / 4, 0]}
              material={materials.accentRender}
            >
              <boxGeometry args={[0.55, totalTowerHeight, 0.55]} />
            </mesh>
          </group>
        ))}

        {/* Central Vertical Protruding Bay (Front Facade Accent Column) */}
        <mesh position={[0, totalTowerHeight / 2, 5.6]} material={materials.whiteStucco} castShadow receiveShadow>
          <boxGeometry args={[4.2, totalTowerHeight, 1.1]} />
        </mesh>
        <mesh position={[0, totalTowerHeight / 2, 6.18]} material={materials.glass}>
          <boxGeometry args={[3.6, totalTowerHeight - 0.4, 0.08]} />
        </mesh>

        {/* Ground Floor Entrance Vestibule & Canopy */}
        <group position={[0, 0, 6.3]}>
          {/* Slanted Glass/Copper Entrance Canopy (matching Image 2) */}
          <mesh position={[0, 3.4, 1.4]} rotation={[0.2, 0, 0]} material={materials.copperCanopy} castShadow onClick={(e) => handleComponentClick(e, {
            name: "Slanted Copper Entrance Canopy", category: "Entrance Canopy", specs: "Weathered copper standing-seam canopy with structural steel supports", ecoScore: 94
          })}>
            <boxGeometry args={[5.2, 0.2, 2.6]} />
          </mesh>
          {/* Canopy Steel Struts */}
          <mesh position={[-2.2, 2.3, 2.4]} material={materials.blackFrame}><cylinderGeometry args={[0.06, 0.06, 2.2, 8]} /></mesh>
          <mesh position={[2.2, 2.3, 2.4]} material={materials.blackFrame}><cylinderGeometry args={[0.06, 0.06, 2.2, 8]} /></mesh>
          {/* Glass Revolving Entrance Doors */}
          <mesh position={[0, 1.5, -0.4]} material={materials.glass}>
            <boxGeometry args={[3.8, 2.8, 0.08]} />
          </mesh>
          <mesh position={[0, 1.5, -0.38]} material={materials.blackFrame}>
            <boxGeometry args={[3.9, 0.08, 0.12]} />
          </mesh>
          {/* Company Sign Bar */}
          <mesh position={[0, 3.8, -0.3]} material={materials.signEmissive}>
            <boxGeometry args={[4.4, 0.55, 0.12]} />
          </mesh>
        </group>

        {/* Multi-Story Curtain Wall Glazed Grid Stack */}
        {Array.from({ length: effectiveFloors }).map((_, idx) => {
          const baseY = idx * 3.2 + 0.2;
          return (
            <group key={`comm-floor-${idx}`}>
              {/* Internal Post-Tensioned Concrete Floor Slab */}
              <mesh position={[0, baseY + 3.1, 0]} material={materials.columnWhite} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
                name: `Office Floor ${idx + 1} Structural Slab`, category: "Structural Frame", specs: "Post-tensioned flat slab, SLS 375 High-Yield steel", ecoScore: 94
              })}>
                <boxGeometry args={[14.8, 0.28, 11.8]} />
              </mesh>

              {/* Curtain Wall Glazing Units - Front & Back */}
              <mesh position={[0, baseY + 1.6, 5.22]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
                name: `Level ${idx + 1} Double-Glazed Curtain Wall`, category: "Facade", specs: "Structural silicone double glazing, SHGC = 0.28, U=1.3 W/m²K", ecoScore: 96
              })}>
                <boxGeometry args={[14.6, 2.8, 0.08]} />
              </mesh>
              <mesh position={[0, baseY + 1.6, -5.22]} material={materials.glass}>
                <boxGeometry args={[14.6, 2.8, 0.08]} />
              </mesh>
              {/* Side Glazing Units - Left & Right */}
              <mesh position={[-6.82, baseY + 1.6, 0]} material={materials.glass}>
                <boxGeometry args={[0.08, 2.8, 11.2]} />
              </mesh>
              <mesh position={[6.82, baseY + 1.6, 0]} material={materials.glass}>
                <boxGeometry args={[0.08, 2.8, 11.2]} />
              </mesh>

              {/* Horizontal Floor Spandrel Bands (White/Aluminum Spandrels from Image 2) */}
              <mesh position={[0, baseY + 3.05, 5.26]} material={materials.whiteStucco} castShadow>
                <boxGeometry args={[15.0, 0.45, 0.14]} />
              </mesh>
              <mesh position={[0, baseY + 3.05, -5.26]} material={materials.whiteStucco} castShadow>
                <boxGeometry args={[15.0, 0.45, 0.14]} />
              </mesh>
              <mesh position={[-6.86, baseY + 3.05, 0]} material={materials.whiteStucco} castShadow>
                <boxGeometry args={[0.14, 0.45, 11.6]} />
              </mesh>
              <mesh position={[6.86, baseY + 3.05, 0]} material={materials.whiteStucco} castShadow>
                <boxGeometry args={[0.14, 0.45, 11.6]} />
              </mesh>

              {/* Vertical Mullion Grids across Front Facade */}
              {[-5.0, -3.2, -1.6, 1.6, 3.2, 5.0].map((mx, mIdx) => (
                <mesh key={`mullion-f-${idx}-${mIdx}`} position={[mx, baseY + 1.6, 5.25]} material={materials.blackFrame}>
                  <boxGeometry args={[0.1, 2.9, 0.12]} />
                </mesh>
              ))}

              {/* Cool Commercial Interior Lighting */}
              {isEvening && (
                <pointLight color="#E0F2FE" intensity={1.6} distance={8.5} decay={1.8} position={[0, baseY + 1.6, 0]} />
              )}
            </group>
          );
        })}

        {/* ══════════════════════════════════════════════════════════════
            REALISTIC DETAILED ROOFTOP (Matching Reference Image 2)
        ══════════════════════════════════════════════════════════════ */}
        <group position={[0, roofY, 0]}>
          {/* Dark Gravel / Bitumen Roof Deck */}
          <mesh position={[0, 0.05, 0]} material={materials.gravelRoof} receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Commercial Gravel Membrane Roof Deck", category: "Roofing & Insulation", specs: "High-performance multi-ply SBS modified bitumen with gravel ballast", ecoScore: 92
          })}>
            <boxGeometry args={[15.0, 0.1, 12.0]} />
          </mesh>

          {/* Perimeter Parapet Walls with Stone Coping Capping */}
          {/* Front & Back Parapets */}
          <mesh position={[0, 0.55, 5.9]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[15.4, 0.9, 0.35]} />
          </mesh>
          <mesh position={[0, 0.55, -5.9]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[15.4, 0.9, 0.35]} />
          </mesh>
          {/* Left & Right Parapets */}
          <mesh position={[-7.4, 0.55, 0]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[0.35, 0.9, 12.15]} />
          </mesh>
          <mesh position={[7.4, 0.55, 0]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[0.35, 0.9, 12.15]} />
          </mesh>
          {/* Parapet Coping Capping Stone */}
          <mesh position={[0, 1.02, 5.9]} material={materials.charcoalFascia}><boxGeometry args={[15.6, 0.08, 0.42]} /></mesh>
          <mesh position={[0, 1.02, -5.9]} material={materials.charcoalFascia}><boxGeometry args={[15.6, 0.08, 0.42]} /></mesh>
          <mesh position={[-7.4, 1.02, 0]} material={materials.charcoalFascia}><boxGeometry args={[0.42, 0.08, 12.2]} /></mesh>
          <mesh position={[7.4, 1.02, 0]} material={materials.charcoalFascia}><boxGeometry args={[0.42, 0.08, 12.2]} /></mesh>

          {/* Central Elevator Machine Room & Stair Bulkhead Penthouse */}
          <group position={[0, 1.2, -1.8]}>
            <mesh material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
              name: "Elevator Penthouse & Stair Bulkhead", category: "Vertical Transport & Plant", specs: "Concrete blockhouse housing gearless elevator traction machines", ecoScore: 94
            })}>
              <boxGeometry args={[5.6, 2.2, 4.4]} />
            </mesh>
            {/* Penthouse Roof Slab */}
            <mesh position={[0, 1.15, 0]} material={materials.charcoalFascia}>
              <boxGeometry args={[6.0, 0.15, 4.8]} />
            </mesh>
            {/* Penthouse Metal Louvers */}
            <mesh position={[0, 0.4, 2.22]} material={materials.blackFrame}>
              <boxGeometry args={[2.4, 1.1, 0.06]} />
            </mesh>
            {/* Maintenance Access Door */}
            <mesh position={[-1.8, -0.3, 2.22]} material={materials.charcoalFascia}>
              <boxGeometry args={[0.9, 1.5, 0.06]} />
            </mesh>
          </group>

          {/* Array of 6 Realistic Commercial HVAC Condenser Chiller Units (from Image 2) */}
          {[
            [-4.8, 3.2],
            [-2.4, 3.2],
            [2.4, 3.2],
            [4.8, 3.2],
            [-4.8, -3.4],
            [4.8, -3.4],
          ].map(([hx, hz], hIdx) => (
            <group key={`hvac-unit-${hIdx}`} position={[hx, 0.6, hz]}>
              {/* Equipment Mounting Concrete Curb */}
              <mesh position={[0, -0.45, 0]} material={materials.columnWhite}>
                <boxGeometry args={[1.8, 0.2, 1.4]} />
              </mesh>
              {/* HVAC Chiller Metal Housing */}
              <mesh material={materials.hvacMetal} castShadow onClick={(e) => handleComponentClick(e, {
                name: `Rooftop HVAC Chiller Unit ${hIdx + 1}`, category: "Mechanical HVAC", specs: "High-efficiency variable-refrigerant chiller condenser with EC fans", ecoScore: 96
              })}>
                <boxGeometry args={[1.6, 0.8, 1.2]} />
              </mesh>
              {/* Top Fan Cowl & Grill */}
              <mesh position={[0, 0.42, 0]} material={materials.hvacFan}>
                <cylinderGeometry args={[0.42, 0.42, 0.06, 16]} />
              </mesh>
              {/* Protective Side Louver Grids */}
              <mesh position={[0, 0, 0.61]} material={materials.blackFrame}>
                <boxGeometry args={[1.4, 0.6, 0.02]} />
              </mesh>
            </group>
          ))}

          {/* Rooftop Ventilation Duct Runs & Exhaust Cowls */}
          <mesh position={[-1.2, 0.45, 0.8]} material={materials.hvacMetal}>
            <boxGeometry args={[0.4, 0.4, 2.6]} />
          </mesh>
          <mesh position={[1.2, 0.45, 0.8]} material={materials.hvacMetal}>
            <boxGeometry args={[0.4, 0.4, 2.6]} />
          </mesh>
        </group>

        {isEvening && (
          <pointLight color="#FFE8D6" intensity={1.8} distance={15.0} decay={1.8} position={[0, roofY + 2.0, 0]} />
        )}
      </group>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TYPOLOGY 3: INDUSTRIAL WAREHOUSE / FACTORY
  // ══════════════════════════════════════════════════════════════════
  if (isIndustrial) {
    const totalHeight = 9.2;
    const mezzY = 3.1;
    const topFloorY = 6.0;

    return (
      <group position={[0, 0, 0]}>
        {/* ══════════════════════════════════════════════════════════════════
            1. CIVIL SITE CONTEXT: FOUNDATION, APRON, ROADWAY & CAD MARKERS
        ══════════════════════════════════════════════════════════════════ */}
        {/* Heavy-Duty Sub-Plinth Foundation */}
        <mesh
          position={[0, -0.25, 0]}
          material={materials.foundationPlinth}
          receiveShadow
          onClick={(e) => handleComponentClick(e, {
            name: "Industrial Heavy Raft Slab Foundation",
            category: "Foundation",
            specs: "400mm Fiber-reinforced industrial mass concrete raft slab, SLS 614 Grade 45",
            ecoScore: 92
          })}
        >
          <boxGeometry args={[28.5, 0.5, 28.5]} />
        </mesh>

        {/* Concrete Staging Apron with Expansion Joints */}
        <mesh position={[0, 0.02, 0]} material={materials.slateTerrace} receiveShadow>
          <boxGeometry args={[27.0, 0.08, 27.0]} />
        </mesh>
        {/* Subtle expansion joint grooves on concrete apron */}
        {[-8.0, -2.0, 4.0, 10.0].map((gx, gIdx) => (
          <mesh key={`apron-gx-${gIdx}`} position={[gx, 0.065, 0]} material={materials.concreteGroove}>
            <boxGeometry args={[0.04, 0.01, 26.8]} />
          </mesh>
        ))}
        {[-8.0, -2.0, 4.0, 10.0].map((gz, gIdx) => (
          <mesh key={`apron-gz-${gIdx}`} position={[0, 0.065, gz]} material={materials.concreteGroove}>
            <boxGeometry args={[26.8, 0.01, 0.04]} />
          </mesh>
        ))}

        {/* Diagonal Asphalt Roadway (Front-Right matching reference photo) */}
        <group position={[10.5, 0.04, 9.8]} rotation={[0, -0.58, 0]}>
          <mesh material={materials.asphaltRoad} receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Industrial Perimeter Access Road",
            category: "Civil & Infrastructure",
            specs: "Heavy vehicle asphalt roadway with bitumen wearing course and sub-base drainage",
            ecoScore: 90
          })}>
            <boxGeometry args={[8.5, 0.04, 28.0]} />
          </mesh>
          {/* White Outer Edge Lines */}
          <mesh position={[-3.8, 0.03, 0]} material={materials.roadMarking}><boxGeometry args={[0.16, 0.01, 27.8]} /></mesh>
          <mesh position={[3.8, 0.03, 0]} material={materials.roadMarking}><boxGeometry args={[0.16, 0.01, 27.8]} /></mesh>
          {/* Dashed Center Lane Line */}
          {[-10, -6.5, -3, 0.5, 4, 7.5, 11].map((dashZ, dIdx) => (
            <mesh key={`road-dash-${dIdx}`} position={[0, 0.03, dashZ]} material={materials.roadMarking}>
              <boxGeometry args={[0.16, 0.01, 1.8]} />
            </mesh>
          ))}
          {/* Concrete Sidewalk Curb */}
          <mesh position={[-4.5, 0.07, 0]} material={materials.precastConcrete}>
            <boxGeometry args={[1.2, 0.1, 27.8]} />
          </mesh>
          <mesh position={[-4.0, 0.14, 0]} material={materials.concreteGroove}>
            <boxGeometry args={[0.18, 0.04, 27.8]} />
          </mesh>
        </group>

        {/* Perimeter Dense Green Landscaping Hedges (Matching Reference Image) */}
        {/* Rear Boundary Hedge */}
        <mesh position={[0, 0.45, -13.0]} material={materials.lushHedge} castShadow>
          <boxGeometry args={[26.5, 0.8, 0.9]} />
        </mesh>
        {/* Left Boundary Hedge */}
        <mesh position={[-13.0, 0.45, -1.0]} material={materials.lushHedge} castShadow>
          <boxGeometry args={[0.9, 0.8, 23.5]} />
        </mesh>
        {/* Front-Left Boundary Hedge */}
        <mesh position={[-8.5, 0.45, 13.0]} material={materials.lushHedge} castShadow>
          <boxGeometry args={[9.5, 0.8, 0.9]} />
        </mesh>
        {/* Spherical shrub accents */}
        {[
          [-12.2, 11.8], [-11.0, 12.2], [-9.5, 12.2], [-8.0, 12.2],
          [-12.2, -11.5], [-12.2, -7.0], [-12.2, -2.5],
          [2.0, -12.4], [6.5, -12.4], [10.5, -12.4]
        ].map(([sx, sz], sIdx) => (
          <mesh key={`hedge-shrub-${sIdx}`} position={[sx, 0.4, sz]} material={materials.lushHedge} castShadow>
            <sphereGeometry args={[0.42 + (sIdx % 3) * 0.06, 8, 8]} />
          </mesh>
        ))}

        {/* Architectural CAD Dimension Lines on Ground Plane (Matching Reference CAD overlay) */}
        <group position={[0, 0.06, 0]}>
          {/* Rear CAD Dimension Line */}
          <mesh position={[0.5, 0, -10.2]} material={materials.cadDimension}>
            <boxGeometry args={[23.0, 0.005, 0.02]} />
          </mesh>
          {[-10.5, -5.8, -0.6, 5.8, 11.5].map((tx, tIdx) => (
            <group key={`cad-rear-tick-${tIdx}`} position={[tx, 0, -10.2]}>
              <mesh rotation={[0, Math.PI / 4, 0]} material={materials.cadDimension}><boxGeometry args={[0.3, 0.005, 0.02]} /></mesh>
              <mesh position={[0, 0, 1.2]} material={materials.cadDimension}><boxGeometry args={[0.02, 0.005, 2.2]} /></mesh>
            </group>
          ))}
          {/* Rear Dimension Text Callouts */}
          {industrialSignage.dim7200 && (
            <>
              <mesh position={[-3.2, 0.005, -10.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 0.4]} />
                <meshBasicMaterial map={industrialSignage.dim7200} transparent opacity={0.7} />
              </mesh>
              <mesh position={[3.0, 0.005, -10.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 0.4]} />
                <meshBasicMaterial map={industrialSignage.dim7200} transparent opacity={0.7} />
              </mesh>
            </>
          )}

          {/* Left CAD Dimension Line */}
          <mesh position={[-11.5, 0, 0.8]} material={materials.cadDimension}>
            <boxGeometry args={[0.02, 0.005, 12.5]} />
          </mesh>
          {[-4.2, 0.8, 6.2].map((tz, tIdx) => (
            <group key={`cad-left-tick-${tIdx}`} position={[-11.5, 0, tz]}>
              <mesh rotation={[0, Math.PI / 4, 0]} material={materials.cadDimension}><boxGeometry args={[0.3, 0.005, 0.02]} /></mesh>
              <mesh position={[0.6, 0, 0]} material={materials.cadDimension}><boxGeometry args={[1.2, 0.005, 0.02]} /></mesh>
            </group>
          ))}
          {industrialSignage.dim3600 && (
            <mesh position={[-11.8, 0.005, 1.0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
              <planeGeometry args={[1.6, 0.4]} />
              <meshBasicMaterial map={industrialSignage.dim3600} transparent opacity={0.7} />
            </mesh>
          )}

          {/* Front CAD Dimension Line */}
          <mesh position={[-5.8, 0, 8.2]} material={materials.cadDimension}>
            <boxGeometry args={[9.5, 0.005, 0.02]} />
          </mesh>
          {[-10.5, -5.8, -1.2].map((tx, tIdx) => (
            <group key={`cad-front-tick-${tIdx}`} position={[tx, 0, 8.2]}>
              <mesh rotation={[0, Math.PI / 4, 0]} material={materials.cadDimension}><boxGeometry args={[0.3, 0.005, 0.02]} /></mesh>
              <mesh position={[0, 0, -1.0]} material={materials.cadDimension}><boxGeometry args={[0.02, 0.005, 1.8]} /></mesh>
            </group>
          ))}
          {industrialSignage.dim2400 && (
            <mesh position={[-5.8, 0.005, 8.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.4, 0.35]} />
              <meshBasicMaterial map={industrialSignage.dim2400} transparent opacity={0.7} />
            </mesh>
          )}
        </group>

        {/* High-Visibility OSHA Yellow Safety Bollards */}
        {[
          [-3.6, 6.7], [-0.8, 6.7],   // Front drive-in vehicle bay
          [2.2, 6.7], [5.8, 6.7],     // Front warehouse roll-up door
          [12.1, -3.2], [12.1, 0.8],  // Side warehouse roll-up door
          [-8.8, 6.7], [7.2, 6.7]     // Pedestrian doors
        ].map(([bx, bz], bIdx) => (
          <group key={`bollard-${bIdx}`} position={[bx, 0.04, bz]}>
            <mesh position={[0, 0.42, 0]} material={materials.safetyBollard} castShadow onClick={(e) => handleComponentClick(e, {
              name: "High-Impact Safety Bollard",
              category: "Safety & Site Protection",
              specs: "150mm Schedule 40 concrete-filled steel pipe bollard with OSHA yellow epoxy powder coating",
              ecoScore: 98
            })}>
              <cylinderGeometry args={[0.11, 0.11, 0.85, 16]} />
            </mesh>
            {/* Dark Base Collar Plate */}
            <mesh position={[0, 0.04, 0]} material={materials.blackFrame}>
              <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
            </mesh>
          </group>
        ))}

        {/* ══════════════════════════════════════════════════════════════════
            2. OFFICE & INSPECTION WING (3 LEVELS — CUTAWAY TOP FLOOR)
        ══════════════════════════════════════════════════════════════════ */}
        <group position={[-5.8, 0, 1.0]}>
          {/* Ground Floor Slab */}
          <mesh position={[0, 0.1, 0]} material={materials.polishedConcreteFloor} receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Office Ground Floor Slab",
            category: "Floor Slab",
            specs: "200mm Reinforced concrete ground slab with acoustic dampening membrane",
            ecoScore: 92
          })}>
            <boxGeometry args={[9.4, 0.2, 10.4]} />
          </mesh>

          {/* Level 1 Intermediate Slab */}
          <mesh position={[0, mezzY, 0]} material={materials.precastConcrete} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Level 1 Suspended Structural Slab",
            category: "Structural Frame",
            specs: "Post-tensioned 250mm precast hollow-core slab with screed topping, SLS 375",
            ecoScore: 94
          })}>
            <boxGeometry args={[9.4, 0.25, 10.4]} />
          </mesh>

          {/* Level 2 Cutaway Floor Slab */}
          <mesh position={[0, topFloorY, 0]} material={materials.precastConcrete} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Level 2 Testing & Meeting Floor Slab",
            category: "Structural Frame",
            specs: "Heavy-duty anti-static vibration-damped concrete floor slab",
            ecoScore: 93
          })}>
            <boxGeometry args={[9.4, 0.25, 10.4]} />
          </mesh>

          {/* Exterior Left Precast Facade Wall (Full 3 Levels with Ribbon Windows) */}
          <group position={[-4.7, 0, 0]}>
            {/* Ground Level Wall Solid Portions */}
            <mesh position={[0, 1.5, 0]} material={materials.precastConcrete} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
              name: "Precast Insulated Concrete Facade Panel",
              category: "Building Envelope",
              specs: "200mm Architectural precast sandwich panels with rigid PIR core, U=0.20 W/m²K, STC 52dB",
              ecoScore: 93
            })}>
              <boxGeometry args={[0.3, 2.8, 10.4]} />
            </mesh>
            {/* Ground Level Horizontal Shadow Reveal Groove */}
            <mesh position={[0.14, 2.95, 0]} material={materials.blackFrame}><boxGeometry args={[0.04, 0.08, 10.4]} /></mesh>

            {/* Level 1 Precast Wall with Multi-Pane Industrial Ribbon Windows */}
            <mesh position={[0, 3.75, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[0.3, 1.25, 10.4]} />
            </mesh>
            {/* Level 1 Industrial Grid Windows (Front & Rear Pairs) */}
            {[-2.4, 2.4].map((wz, wIdx) => (
              <group key={`l1-left-win-${wIdx}`} position={[0, 4.8, wz]}>
                <mesh material={materials.glass} onClick={(e) => handleComponentClick(e, {
                  name: "Industrial Ribbon Grid Window Unit",
                  category: "Fenestration",
                  specs: "Thermally broken structural aluminum double-glazed windows, SHGC=0.30",
                  ecoScore: 95
                })}>
                  <boxGeometry args={[0.08, 1.6, 4.2]} />
                </mesh>
                {/* Dark Steel Window Mullion Grid */}
                <mesh material={materials.blackFrame}><boxGeometry args={[0.12, 1.65, 0.08]} /></mesh>
                <mesh position={[0, 0, -1.3]} material={materials.blackFrame}><boxGeometry args={[0.12, 1.65, 0.06]} /></mesh>
                <mesh position={[0, 0, 1.3]} material={materials.blackFrame}><boxGeometry args={[0.12, 1.65, 0.06]} /></mesh>
                <mesh position={[0, 0, 0]} material={materials.blackFrame}><boxGeometry args={[0.12, 0.08, 4.2]} /></mesh>
              </group>
            ))}
            <mesh position={[0, 5.85, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[0.3, 0.5, 10.4]} />
            </mesh>
            {/* Level 2 Horizontal Shadow Reveal Groove */}
            <mesh position={[0.14, 5.95, 0]} material={materials.blackFrame}><boxGeometry args={[0.04, 0.08, 10.4]} /></mesh>

            {/* Level 2 (Cutaway Floor) Outer Wall with Sliced Windows */}
            <mesh position={[0, 6.8, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[0.3, 1.4, 10.4]} />
            </mesh>
            {[-2.4, 2.4].map((wz, wIdx) => (
              <group key={`l2-left-win-${wIdx}`} position={[0, 7.8, wz]}>
                <mesh material={materials.glass}><boxGeometry args={[0.08, 1.1, 4.2]} /></mesh>
                <mesh material={materials.blackFrame}><boxGeometry args={[0.12, 1.15, 0.08]} /></mesh>
                <mesh position={[0, 0, -1.3]} material={materials.blackFrame}><boxGeometry args={[0.12, 1.15, 0.06]} /></mesh>
                <mesh position={[0, 0, 1.3]} material={materials.blackFrame}><boxGeometry args={[0.12, 1.15, 0.06]} /></mesh>
              </group>
            ))}
            {/* Wall Top Sliced Edge Coping (Clean Architectural Cut) */}
            <mesh position={[0, 8.45, 0]} material={materials.charcoalFascia} castShadow>
              <boxGeometry args={[0.36, 0.1, 10.5]} />
            </mesh>
          </group>

          {/* Exterior Front Precast Facade Wall (Z: 5.2) */}
          <group position={[0, 0, 5.2]}>
            {/* Ground Level: Drive-In Bay Opening & Pedestrian Entrance */}
            {/* Wall around drive-in bay */}
            <mesh position={[-3.2, 1.5, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[2.8, 2.8, 0.3]} />
            </mesh>
            {/* Pedestrian Entrance Door */}
            <mesh position={[-2.8, 1.1, 0.05]} material={materials.blackFrame}>
              <boxGeometry args={[1.1, 2.2, 0.1]} />
            </mesh>
            <mesh position={[-2.8, 1.1, 0.06]} material={materials.glass}>
              <boxGeometry args={[0.9, 2.0, 0.04]} />
            </mesh>
            {/* Vehicle Drive-In Bay Opening (High Headroom with recessed dark interior) */}
            <mesh position={[1.5, 2.7, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[3.8, 0.6, 0.3]} />
            </mesh>
            <mesh position={[3.5, 1.5, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[0.4, 2.8, 0.3]} />
            </mesh>

            {/* Level 1 Precast Wall & Ribbon Window */}
            <mesh position={[0, 3.75, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[9.4, 1.25, 0.3]} />
            </mesh>
            {/* Level 1 Front 4-Bay Industrial Grid Window */}
            <group position={[0, 4.8, 0]}>
              <mesh material={materials.glass} onClick={(e) => handleComponentClick(e, {
                name: "Precast Facade Front Grid Glazing",
                category: "Fenestration",
                specs: "High-performance acoustic double glazing with integrated solar control coating",
                ecoScore: 96
              })}>
                <boxGeometry args={[8.6, 1.6, 0.08]} />
              </mesh>
              {/* Window Grid Mullions */}
              {[-3.0, -1.0, 1.0, 3.0].map((mx, mIdx) => (
                <mesh key={`fwin-m-${mIdx}`} position={[mx, 0, 0]} material={materials.blackFrame}>
                  <boxGeometry args={[0.08, 1.65, 0.12]} />
                </mesh>
              ))}
              <mesh material={materials.blackFrame}><boxGeometry args={[8.7, 0.08, 0.12]} /></mesh>
            </group>
            <mesh position={[0, 5.85, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[9.4, 0.5, 0.3]} />
            </mesh>

            {/* Level 2 Cutaway Front Wall with Sliced Windows */}
            <mesh position={[0, 6.8, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[9.4, 1.4, 0.3]} />
            </mesh>
            <group position={[0, 7.8, 0]}>
              <mesh material={materials.glass}><boxGeometry args={[8.6, 1.1, 0.08]} /></mesh>
              {[-3.0, -1.0, 1.0, 3.0].map((mx, mIdx) => (
                <mesh key={`l2-fwin-m-${mIdx}`} position={[mx, 0, 0]} material={materials.blackFrame}>
                  <boxGeometry args={[0.08, 1.15, 0.12]} />
                </mesh>
              ))}
            </group>
            {/* Front Wall Top Coping Capping */}
            <mesh position={[0, 8.45, 0]} material={materials.charcoalFascia} castShadow>
              <boxGeometry args={[9.5, 0.1, 0.36]} />
            </mesh>
          </group>

          {/* Rear Wall of Office Wing (Z: -5.2) */}
          <group position={[0, 0, -5.2]}>
            <mesh position={[0, 4.2, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[9.4, 8.2, 0.3]} />
            </mesh>
            <mesh position={[0, 8.45, 0]} material={materials.charcoalFascia} castShadow>
              <boxGeometry args={[9.5, 0.1, 0.36]} />
            </mesh>
          </group>

          {/* ══════════════════════════════════════════════════════════════
              LEVEL 2 CUTAWAY INTERIOR ROOMS: "MEETING ROOM" & "INSPECTION ROOM"
          ══════════════════════════════════════════════════════════════ */}
          <group position={[0, topFloorY + 0.1, 0]}>
            {/* Central Transverse Partition Wall (Dividing Meeting Room & Inspection Room) */}
            <mesh position={[-0.4, 1.1, 0.2]} material={materials.partitionWall} castShadow onClick={(e) => handleComponentClick(e, {
              name: "Acoustic Partition Wall Assembly",
              category: "Interior Partitions",
              specs: "100mm Steel-stud dry partition with mineral wool insulation and double gypsum board, STC 50dB",
              ecoScore: 94
            })}>
              <boxGeometry args={[0.14, 2.2, 9.6]} />
            </mesh>

            {/* Longitudinal Dividing Partition Wall with Door Openings */}
            <mesh position={[-2.6, 1.1, 0.2]} material={materials.partitionWall} castShadow>
              <boxGeometry args={[4.2, 2.2, 0.14]} />
            </mesh>

            {/* Wall Signage Text: "MEETING ROOM" on front partition */}
            {industrialSignage.meetingRoom && (
              <mesh position={[2.0, 1.6, 0.28]} rotation={[0, 0, 0]}>
                <planeGeometry args={[2.2, 0.55]} />
                <meshBasicMaterial map={industrialSignage.meetingRoom} transparent opacity={0.88} />
              </mesh>
            )}

            {/* Wall Signage Text: "INSPECTION ROOM" on left partition */}
            {industrialSignage.inspectionRoom && (
              <mesh position={[-2.4, 1.6, 0.28]} rotation={[0, 0, 0]}>
                <planeGeometry args={[2.5, 0.55]} />
                <meshBasicMaterial map={industrialSignage.inspectionRoom} transparent opacity={0.88} />
              </mesh>
            )}

            {/* ── MEETING ROOM INTERIOR FURNITURE & APPOINTMENTS ── */}
            <group position={[2.0, 0, 2.6]}>
              {/* Executive Conference Table */}
              <mesh position={[0, 0.45, 0]} material={materials.furnitureWood} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Conference Room Executive Suite",
                category: "FF&E Furniture",
                specs: "FSC-certified solid oak conference table with concealed cable management and power ports",
                ecoScore: 96
              })}>
                <boxGeometry args={[2.6, 0.08, 1.2]} />
              </mesh>
              {/* Conference Table Steel Pedestal Legs */}
              <mesh position={[-0.9, 0.22, 0]} material={materials.steelIBeam}><boxGeometry args={[0.1, 0.44, 0.8]} /></mesh>
              <mesh position={[0.9, 0.22, 0]} material={materials.steelIBeam}><boxGeometry args={[0.1, 0.44, 0.8]} /></mesh>

              {/* 6 Executive Conference Chairs */}
              {[-0.8, 0, 0.8].map((cx, cIdx) => (
                <React.Fragment key={`conf-chair-${cIdx}`}>
                  {/* Top Row */}
                  <mesh position={[cx, 0.42, 0.85]} material={materials.furnitureDark} castShadow>
                    <boxGeometry args={[0.42, 0.48, 0.4]} />
                  </mesh>
                  {/* Bottom Row */}
                  <mesh position={[cx, 0.42, -0.85]} material={materials.furnitureDark} castShadow>
                    <boxGeometry args={[0.42, 0.48, 0.4]} />
                  </mesh>
                </React.Fragment>
              ))}

              {/* Presentation Wall Screen / Display Monitor */}
              <mesh position={[0, 1.2, -2.25]} material={materials.blackFrame}>
                <boxGeometry args={[1.8, 0.9, 0.04]} />
              </mesh>
              <mesh position={[0, 1.2, -2.22]} material={materials.signEmissive}>
                <boxGeometry args={[1.7, 0.82, 0.02]} />
              </mesh>
            </group>

            {/* ── INSPECTION ROOM INTERIOR TESTING EQUIPMENT & WORKSTATIONS ── */}
            <group position={[-2.4, 0, 2.6]}>
              {/* Quality Control / Testing Metrology Benches */}
              <mesh position={[0, 0.5, 0]} material={materials.furnitureDesk} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Precision QA Inspection & Metrology Station",
                category: "Laboratory & Testing",
                specs: "Heavy-duty anti-static metrology testing bench with cleanroom grade stainless steel frame",
                ecoScore: 95
              })}>
                <boxGeometry args={[2.8, 0.1, 1.1]} />
              </mesh>
              <mesh position={[-1.2, 0.24, 0]} material={materials.steelIBeam}><boxGeometry args={[0.08, 0.48, 0.9]} /></mesh>
              <mesh position={[1.2, 0.24, 0]} material={materials.steelIBeam}><boxGeometry args={[0.08, 0.48, 0.9]} /></mesh>

              {/* Diagnostic QA Hardware Blocks / Spectrometer / Calibration Units */}
              <mesh position={[-0.8, 0.72, -0.1]} material={materials.hvacMetal} castShadow>
                <boxGeometry args={[0.65, 0.35, 0.45]} />
              </mesh>
              <mesh position={[0.4, 0.75, 0.1]} material={materials.blackFrame} castShadow>
                <boxGeometry args={[0.5, 0.4, 0.35]} />
              </mesh>
              <mesh position={[1.0, 0.7, -0.1]} material={materials.signEmissive}>
                <boxGeometry args={[0.4, 0.28, 0.04]} />
              </mesh>

              {/* QA Technician Ergonomic Stools */}
              {[-0.6, 0.6].map((sx, sIdx) => (
                <mesh key={`qa-stool-${sIdx}`} position={[sx, 0.38, 0.8]} material={materials.furnitureDark} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 0.45, 12]} />
                </mesh>
              ))}
            </group>

            {/* ── EXECUTIVE OFFICE / WORKSTATION BACK ROW ── */}
            <group position={[0, 0, -2.6]}>
              {/* Office Desks */}
              {[-2.0, 1.8].map((dx, dIdx) => (
                <group key={`back-desk-${dIdx}`} position={[dx, 0, 0]}>
                  <mesh position={[0, 0.42, 0]} material={materials.furnitureDesk} castShadow>
                    <boxGeometry args={[1.8, 0.06, 0.9]} />
                  </mesh>
                  <mesh position={[-0.8, 0.2, 0]} material={materials.steelIBeam}><boxGeometry args={[0.06, 0.4, 0.8]} /></mesh>
                  <mesh position={[0.8, 0.2, 0]} material={materials.steelIBeam}><boxGeometry args={[0.06, 0.4, 0.8]} /></mesh>
                  {/* Flat Screen Monitor */}
                  <mesh position={[0, 0.68, -0.2]} material={materials.blackFrame}><boxGeometry args={[0.65, 0.38, 0.03]} /></mesh>
                  <mesh position={[0, 0.48, -0.2]} material={materials.blackFrame}><cylinderGeometry args={[0.03, 0.03, 0.12, 8]} /></mesh>
                  {/* Task Chair */}
                  <mesh position={[0, 0.42, 0.55]} material={materials.furnitureDark} castShadow>
                    <boxGeometry args={[0.44, 0.5, 0.4]} />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Soft Warm Room Illumination */}
            {isEvening ? (
              <>
                <pointLight color="#FFE0B2" intensity={1.8} distance={7.0} decay={1.8} position={[2.0, 1.8, 2.0]} />
                <pointLight color="#E0F2FE" intensity={1.8} distance={7.0} decay={1.8} position={[-2.4, 1.8, 2.0]} />
              </>
            ) : (
              <pointLight color="#FFF8E7" intensity={0.6} distance={6.0} decay={1.8} position={[0, 1.8, 0]} />
            )}
          </group>
        </group>

        {/* ══════════════════════════════════════════════════════════════════
            3. CENTRAL GLASS STAIRCASE / ATRIUM TOWER (Connecting Wings)
        ══════════════════════════════════════════════════════════════════ */}
        <group position={[0.8, 0, 4.0]}>
          {/* Glass Curtain Wall Enclosure (Transparent 3-Story Box) */}
          {/* Front Glazing Face */}
          <mesh position={[0, 4.6, 1.7]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
            name: "Atrium Structural Glass Curtain Wall",
            category: "Envelope & Glazing",
            specs: "Double-laminated 12mm Low-E tempered glass curtain wall with point-fixed structural spiders",
            ecoScore: 96
          })}>
            <boxGeometry args={[3.0, 9.0, 0.08]} />
          </mesh>
          {/* Left Glazing Face */}
          <mesh position={[-1.5, 4.6, 0]} material={materials.glass}>
            <boxGeometry args={[0.08, 9.0, 3.4]} />
          </mesh>
          {/* Right Glazing Face */}
          <mesh position={[1.5, 4.6, 0]} material={materials.glass}>
            <boxGeometry args={[0.08, 9.0, 3.4]} />
          </mesh>

          {/* Dark Aluminum Mullion Grid Skeleton */}
          {/* Corner Vertical Structural Mullions */}
          {[
            [-1.5, -1.7], [1.5, -1.7],
            [-1.5, 1.7], [1.5, 1.7],
          ].map(([mx, mz], mIdx) => (
            <mesh key={`stair-col-${mIdx}`} position={[mx, 4.6, mz]} material={materials.blackFrame} castShadow>
              <boxGeometry args={[0.14, 9.2, 0.14]} />
            </mesh>
          ))}
          {/* Horizontal Transom Bars at Each Floor Level */}
          {[mezzY, topFloorY, 8.8].map((ty, tIdx) => (
            <group key={`stair-transom-${tIdx}`} position={[0, ty, 0]}>
              <mesh position={[0, 0, 1.7]} material={materials.blackFrame}><boxGeometry args={[3.0, 0.12, 0.14]} /></mesh>
              <mesh position={[-1.5, 0, 0]} material={materials.blackFrame}><boxGeometry args={[0.14, 0.12, 3.4]} /></mesh>
              <mesh position={[1.5, 0, 0]} material={materials.blackFrame}><boxGeometry args={[0.14, 0.12, 3.4]} /></mesh>
            </group>
          ))}

          {/* Stair Tower Roof Cap / Fascia */}
          <mesh position={[0, 9.15, 0]} material={materials.charcoalFascia} castShadow>
            <boxGeometry args={[3.2, 0.25, 3.6]} />
          </mesh>
          <mesh position={[0, 9.3, 0]} material={materials.glass}>
            <boxGeometry args={[2.8, 0.06, 3.2]} />
          </mesh>

          {/* ── INTERNAL MULTI-FLIGHT STRUCTURAL STEEL STAIRCASE ── */}
          {/* Flight 1: Ground to Level 1 (Y: 0.1 to 3.1) */}
          <group position={[0, 0, 0]}>
            {/* Intermediate Landing 1 */}
            <mesh position={[0, 1.55, -0.9]} material={materials.steelIBeam} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
              name: "Internal Steel Escape & Access Staircase",
              category: "Vertical Transport",
              specs: "Heavy structural steel stringers with non-slip galvanized open grating treads, SLS 614",
              ecoScore: 94
            })}>
              <boxGeometry args={[2.6, 0.12, 1.2]} />
            </mesh>
            {/* Inclined Stair Stringers Flight 1A */}
            <mesh position={[-0.8, 0.8, 0.3]} rotation={[-0.75, 0, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.08, 0.16, 2.2]} />
            </mesh>
            <mesh position={[0.8, 0.8, 0.3]} rotation={[-0.75, 0, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.08, 0.16, 2.2]} />
            </mesh>
            {/* Steps / Treads Flight 1A */}
            {[0.25, 0.55, 0.85, 1.15, 1.45].map((stepY, sIdx) => (
              <mesh key={`stair-step-1-${sIdx}`} position={[0, stepY, 1.2 - sIdx * 0.38]} material={materials.steelIBeam}>
                <boxGeometry args={[1.5, 0.04, 0.28]} />
              </mesh>
            ))}
            {/* Handrail Flight 1 */}
            <mesh position={[0.78, 1.6, 0.3]} rotation={[-0.75, 0, 0]} material={materials.blackFrame}>
              <cylinderGeometry args={[0.025, 0.025, 2.3, 8]} />
            </mesh>
          </group>

          {/* Flight 2: Level 1 to Level 2 (Y: 3.1 to 6.0) */}
          <group position={[0, 3.0, 0]}>
            <mesh position={[0, 1.55, -0.9]} material={materials.steelIBeam} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.12, 1.2]} />
            </mesh>
            <mesh position={[-0.8, 0.8, 0.3]} rotation={[-0.75, 0, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.08, 0.16, 2.2]} />
            </mesh>
            <mesh position={[0.8, 0.8, 0.3]} rotation={[-0.75, 0, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.08, 0.16, 2.2]} />
            </mesh>
            {[0.25, 0.55, 0.85, 1.15, 1.45].map((stepY, sIdx) => (
              <mesh key={`stair-step-2-${sIdx}`} position={[0, stepY, 1.2 - sIdx * 0.38]} material={materials.steelIBeam}>
                <boxGeometry args={[1.5, 0.04, 0.28]} />
              </mesh>
            ))}
            <mesh position={[0.78, 1.6, 0.3]} rotation={[-0.75, 0, 0]} material={materials.blackFrame}>
              <cylinderGeometry args={[0.025, 0.025, 2.3, 8]} />
            </mesh>
          </group>

          {/* Flight 3: Level 2 to Roof Access (Y: 6.0 to 8.8) */}
          <group position={[0, 6.0, 0]}>
            <mesh position={[0, 1.55, -0.9]} material={materials.steelIBeam} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.12, 1.2]} />
            </mesh>
            <mesh position={[-0.8, 0.8, 0.3]} rotation={[-0.75, 0, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.08, 0.16, 2.2]} />
            </mesh>
            <mesh position={[0.8, 0.8, 0.3]} rotation={[-0.75, 0, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.08, 0.16, 2.2]} />
            </mesh>
            {[0.25, 0.55, 0.85, 1.15, 1.45].map((stepY, sIdx) => (
              <mesh key={`stair-step-3-${sIdx}`} position={[0, stepY, 1.2 - sIdx * 0.38]} material={materials.steelIBeam}>
                <boxGeometry args={[1.5, 0.04, 0.28]} />
              </mesh>
            ))}
            <mesh position={[0.78, 1.6, 0.3]} rotation={[-0.75, 0, 0]} material={materials.blackFrame}>
              <cylinderGeometry args={[0.025, 0.025, 2.3, 8]} />
            </mesh>
          </group>

          {/* Tower Internal Ambient Light */}
          <pointLight color="#93C5FD" intensity={isEvening ? 1.5 : 0.5} distance={8.0} decay={1.8} position={[0, 5.0, 0]} />
        </group>

        {/* ══════════════════════════════════════════════════════════════════
            4. HIGH-BAY WAREHOUSE & MEZZANINE HALL (RIGHT & REAR WING)
        ══════════════════════════════════════════════════════════════════ */}
        <group position={[6.0, 0, -1.0]}>
          {/* Polished Industrial Concrete Ground Floor Slab */}
          <mesh position={[0, 0.1, 0]} material={materials.polishedConcreteFloor} receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "High-Bay Industrial Polished Floor Slab",
            category: "Industrial Floor",
            specs: "250mm Laser-screeded fiber-reinforced concrete with dry-shake non-metallic surface hardener",
            ecoScore: 91
          })}>
            <boxGeometry args={[12.2, 0.2, 13.6]} />
          </mesh>

          {/* ── EXTERIOR WAREHOUSE WALLS (CORRUGATED SIDING & ROLL-UP DOORS) ── */}
          {/* Right Exterior Facade Wall (X: 6.1) */}
          <group position={[6.1, 0, 0]}>
            {/* Corrugated Metal Siding Surface */}
            <mesh position={[0, 4.4, 0]} material={materials.corrugatedMetal} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
              name: "Corrugated Metal Siding Envelope",
              category: "Building Envelope",
              specs: "Single-skin profiled corrugated steel cladding panels with PVDF coating, 0.75mm gauge",
              ecoScore: 92
            })}>
              <boxGeometry args={[0.25, 8.8, 13.6]} />
            </mesh>

            {/* High-Bay Clerestory Industrial Ribbon Windows (Upper Daylighting) */}
            <mesh position={[0.14, 7.2, 0]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
              name: "High-Bay Daylighting Ribbon Windows",
              category: "Fenestration",
              specs: "Polycarbonate insulated daylighting system with integrated UV filtering, 62% VLT",
              ecoScore: 96
            })}>
              <boxGeometry args={[0.08, 1.4, 11.8]} />
            </mesh>
            {/* Window Mullions */}
            {[-4.5, -1.5, 1.5, 4.5].map((wz, wIdx) => (
              <mesh key={`cler-m-${wIdx}`} position={[0.16, 7.2, wz]} material={materials.blackFrame}>
                <boxGeometry args={[0.1, 1.45, 0.08]} />
              </mesh>
            ))}

            {/* Side Loading Dock Roll-Up Sectional Door */}
            <group position={[0.14, 2.1, -1.2]}>
              <mesh material={materials.industrialShutter} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Motorized Sectional Overhead Shutter Door",
                category: "Doors & Access",
                specs: "Heavy-duty insulated polyurethane foam-filled sectional steel shutter with optical safety edge",
                ecoScore: 94
              })}>
                <boxGeometry args={[0.1, 4.0, 3.8]} />
              </mesh>
              {/* Shutter Horizontal Slats Visual Texture */}
              {[-1.6, -1.0, -0.4, 0.2, 0.8, 1.4].map((sy, sIdx) => (
                <mesh key={`side-slat-${sIdx}`} position={[0.06, sy, 0]} material={materials.steelIBeam}>
                  <boxGeometry args={[0.04, 0.06, 3.8]} />
                </mesh>
              ))}
              {/* Frame & Header Barrel Hood */}
              <mesh position={[0, 2.1, 0]} material={materials.blackFrame}><boxGeometry args={[0.22, 0.35, 4.1]} /></mesh>
            </group>
          </group>

          {/* Rear Exterior Wall (Z: -6.8) */}
          <group position={[0, 0, -6.8]}>
            <mesh position={[0, 4.4, 0]} material={materials.corrugatedMetal} castShadow receiveShadow>
              <boxGeometry args={[12.2, 8.8, 0.25]} />
            </mesh>
            {/* Upper Clerestory Ribbon */}
            <mesh position={[0, 7.2, -0.14]} material={materials.glass}>
              <boxGeometry args={[10.5, 1.4, 0.08]} />
            </mesh>
          </group>

          {/* Front Exterior Warehouse Wall (Z: 6.8) */}
          <group position={[0, 0, 6.8]}>
            {/* Wall solid portion around front loading bay */}
            <mesh position={[-3.8, 4.4, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[4.6, 8.8, 0.25]} />
            </mesh>
            <mesh position={[3.8, 4.4, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[4.6, 8.8, 0.25]} />
            </mesh>
            <mesh position={[0, 6.6, 0]} material={materials.precastConcrete} castShadow>
              <boxGeometry args={[3.8, 4.4, 0.25]} />
            </mesh>

            {/* Front Main Loading Bay Sectional Roll-Up Shutter Door */}
            <group position={[0, 2.1, 0.14]}>
              <mesh material={materials.industrialShutter} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Main Loading Bay Sectional Shutter Door",
                category: "Doors & Access",
                specs: "Heavy-duty motorized overhead sectional door with high-cycle spring assembly and dock shelter",
                ecoScore: 94
              })}>
                <boxGeometry args={[3.6, 4.0, 0.1]} />
              </mesh>
              {/* Horizontal Ribbed Slats */}
              {[-1.6, -1.0, -0.4, 0.2, 0.8, 1.4].map((sy, sIdx) => (
                <mesh key={`front-slat-${sIdx}`} position={[0, sy, 0.06]} material={materials.steelIBeam}>
                  <boxGeometry args={[3.6, 0.06, 0.04]} />
                </mesh>
              ))}
              {/* Black Frame Surround */}
              <mesh position={[0, 2.1, 0]} material={materials.blackFrame}><boxGeometry args={[3.9, 0.35, 0.22]} /></mesh>
            </group>

            {/* Pedestrian Exit Door next to loading shutter */}
            <group position={[2.6, 1.1, 0.14]}>
              <mesh material={materials.blackFrame}><boxGeometry args={[1.0, 2.2, 0.08]} /></mesh>
              <mesh position={[0, 0, 0.02]} material={materials.precastConcrete}><boxGeometry args={[0.85, 2.05, 0.06]} /></mesh>
              <mesh position={[0.3, 0, 0.06]} material={materials.blackFrame}><boxGeometry args={[0.05, 0.2, 0.04]} /></mesh>
            </group>
          </group>

          {/* ── EXPOSED STRUCTURAL STEEL SUPERSTRUCTURE (HEAVY DARK I-BEAMS) ── */}
          {/* Vertical Steel I-Beam Columns (Flange + Web Profile) */}
          {[
            [-5.5, -6.4], [0.0, -6.4], [5.5, -6.4],
            [-5.5, -0.2], [0.0, -0.2], [5.5, -0.2],
            [-5.5, 6.2],  [0.0, 6.2],  [5.5, 6.2]
          ].map(([cx, cz], cIdx) => (
            <group key={`col-ibeam-${cIdx}`} position={[cx, 4.4, cz]}>
              {/* Central Web */}
              <mesh material={materials.steelIBeam} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Structural Steel I-Beam Column (HEB 300)",
                category: "Structural Frame",
                specs: "High-strength hot-rolled structural steel column, Grade S355 / ASTM A992, SLS 614 compliance",
                ecoScore: 95
              })}>
                <boxGeometry args={[0.08, 8.8, 0.28]} />
              </mesh>
              {/* Outer Flanges */}
              <mesh position={[0, 0, -0.14]} material={materials.steelIBeam} castShadow>
                <boxGeometry args={[0.26, 8.8, 0.06]} />
              </mesh>
              <mesh position={[0, 0, 0.14]} material={materials.steelIBeam} castShadow>
                <boxGeometry args={[0.26, 8.8, 0.06]} />
              </mesh>
            </group>
          ))}

          {/* Horizontal Roof Girder I-Beams (Spanning Full Width across ceiling) */}
          {[-6.4, -0.2, 6.2].map((gz, gIdx) => (
            <group key={`girder-ibeam-${gIdx}`} position={[0, 8.55, gz]}>
              {/* Central Web */}
              <mesh material={materials.steelIBeam} castShadow onClick={(e) => handleComponentClick(e, {
                name: "Primary Structural Roof Girder I-Beam (IPE 450)",
                category: "Structural Frame",
                specs: "Long-span primary structural steel roof girder, SLS 614 deflection limit L/360",
                ecoScore: 95
              })}>
                <boxGeometry args={[11.8, 0.45, 0.08]} />
              </mesh>
              {/* Top Flange */}
              <mesh position={[0, 0.22, 0]} material={materials.steelIBeam} castShadow>
                <boxGeometry args={[11.8, 0.06, 0.28]} />
              </mesh>
              {/* Bottom Flange */}
              <mesh position={[0, -0.22, 0]} material={materials.steelIBeam} castShadow>
                <boxGeometry args={[11.8, 0.06, 0.28]} />
              </mesh>
            </group>
          ))}

          {/* Longitudinal Steel Purlins */}
          {[-3.5, 0.0, 3.5].map((px, pIdx) => (
            <mesh key={`purlin-${pIdx}`} position={[px, 8.78, 0]} material={materials.steelIBeam}>
              <boxGeometry args={[0.12, 0.16, 12.8]} />
            </mesh>
          ))}

          {/* ── SUSPENDED SPIRAL HVAC VENTILATION DUCTWORK ── */}
          <group position={[0, 7.6, -2.8]}>
            {/* Main Horizontal Galvanized Spiral Duct Cylinder */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={materials.hvacSpiralDuct} castShadow onClick={(e) => handleComponentClick(e, {
              name: "Suspended Spiral HVAC Ventilation Ducting",
              category: "Mechanical HVAC",
              specs: "Galvanized sheet steel spiral round ducting with acoustic lining and high-efficiency VAV diffusers",
              ecoScore: 95
            })}>
              <cylinderGeometry args={[0.22, 0.22, 11.2, 24]} />
            </mesh>
            {/* Spiral Joint Rings */}
            {[-4.0, -2.0, 0.0, 2.0, 4.0].map((rx, rIdx) => (
              <mesh key={`duct-ring-${rIdx}`} position={[rx, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.blackFrame}>
                <cylinderGeometry args={[0.23, 0.23, 0.04, 24]} />
              </mesh>
            ))}
            {/* Vertical Duct Hangers to Ceiling Girders */}
            {[-4.5, -1.5, 1.5, 4.5].map((hx, hIdx) => (
              <mesh key={`duct-hanger-${hIdx}`} position={[hx, 0.55, 0]} material={materials.blackFrame}>
                <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
              </mesh>
            ))}
            {/* Drop Branch Diffusers & Air Supply Nozzles */}
            {[-3.0, 0.0, 3.0].map((dx, dIdx) => (
              <group key={`diffuser-${dIdx}`} position={[dx, -0.32, 0]}>
                <mesh material={materials.hvacSpiralDuct}><cylinderGeometry args={[0.08, 0.08, 0.35, 16]} /></mesh>
                <mesh position={[0, -0.18, 0]} material={materials.blackFrame}><cylinderGeometry args={[0.18, 0.18, 0.05, 16]} /></mesh>
              </group>
            ))}
          </group>

          {/* ── LEVEL 1 MEZZANINE DECK & INDUSTRIAL SAFETY RAILINGS ── */}
          <group position={[0, mezzY, -3.4]}>
            {/* Concrete Mezzanine Structural Floor Slab */}
            <mesh position={[0, 0, 0]} material={materials.polishedConcreteFloor} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
              name: "Mezzanine Composite Steel-Concrete Deck",
              category: "Structural Mezzanine",
              specs: "Profiled steel decking with 150mm reinforced concrete slab, rated for 5.0 kN/m² storage & office load",
              ecoScore: 94
            })}>
              <boxGeometry args={[11.8, 0.22, 6.6]} />
            </mesh>

            {/* Steel Channel Edge Support Beam along Mezzanine Front */}
            <mesh position={[0, -0.05, 3.32]} material={materials.steelIBeam} castShadow>
              <boxGeometry args={[11.8, 0.28, 0.12]} />
            </mesh>

            {/* Industrial Safety Guardrails (Along Entire Open Mezzanine Front Edge) */}
            <group position={[0, 0.11, 3.3]}>
              {/* Vertical Stanchion Posts */}
              {[-5.4, -4.0, -2.6, -1.2, 0.2, 1.6, 3.0, 4.4, 5.4].map((px, pIdx) => (
                <mesh key={`mezz-post-${pIdx}`} position={[px, 0.52, 0]} material={materials.safetyRailing} castShadow onClick={(e) => handleComponentClick(e, {
                  name: "Industrial Safety Guardrail System",
                  category: "Safety & Railings",
                  specs: "OSHA & SLS-referenced 1100mm heavy-duty dual-rail steel barrier with 100mm kickplate toeboard",
                  ecoScore: 96
                })}>
                  <boxGeometry args={[0.06, 1.05, 0.06]} />
                </mesh>
              ))}
              {/* Top Handrail Bar (1.05m height) */}
              <mesh position={[0, 1.05, 0]} material={materials.safetyRailing}>
                <boxGeometry args={[11.8, 0.05, 0.06]} />
              </mesh>
              {/* Mid-Height Safety Rail (0.55m height) */}
              <mesh position={[0, 0.55, 0]} material={materials.safetyRailing}>
                <boxGeometry args={[11.8, 0.04, 0.04]} />
              </mesh>
              {/* Base Kickplate / Toeboard (0.1m height) */}
              <mesh position={[0, 0.06, 0]} material={materials.blackFrame}>
                <boxGeometry args={[11.8, 0.1, 0.02]} />
              </mesh>
            </group>

            {/* ── MEZZANINE OFFICE WORKSTATIONS OVERLOOKING WAREHOUSE ── */}
            {[-2.8, 2.4].map((mx, mIdx) => (
              <group key={`mezz-workstation-${mIdx}`} position={[mx, 0.11, 1.2]}>
                {/* Modern Workstation Desk */}
                <mesh position={[0, 0.38, 0]} material={materials.furnitureDesk} castShadow onClick={(e) => handleComponentClick(e, {
                  name: "Mezzanine Operations Workstation",
                  category: "FF&E Furniture",
                  specs: "Modular industrial supervisor workstation with integrated data channels and acoustic privacy screen",
                  ecoScore: 95
                })}>
                  <boxGeometry args={[2.0, 0.06, 1.0]} />
                </mesh>
                <mesh position={[-0.9, 0.18, 0]} material={materials.steelIBeam}><boxGeometry args={[0.06, 0.36, 0.9]} /></mesh>
                <mesh position={[0.9, 0.18, 0]} material={materials.steelIBeam}><boxGeometry args={[0.06, 0.36, 0.9]} /></mesh>
                {/* Dual Monitors on Desk Mount */}
                <mesh position={[-0.35, 0.65, -0.2]} material={materials.blackFrame}><boxGeometry args={[0.6, 0.36, 0.02]} /></mesh>
                <mesh position={[0.35, 0.65, -0.2]} material={materials.blackFrame}><boxGeometry args={[0.6, 0.36, 0.02]} /></mesh>
                <mesh position={[0, 0.44, -0.2]} material={materials.blackFrame}><cylinderGeometry args={[0.03, 0.03, 0.12, 8]} /></mesh>
                {/* Ergonomic Mesh Task Chair */}
                <mesh position={[0, 0.42, 0.65]} material={materials.furnitureDark} castShadow>
                  <boxGeometry args={[0.45, 0.52, 0.42]} />
                </mesh>
              </group>
            ))}
          </group>

          {/* ── GROUND FLOOR ENCLOSED TESTING / UTILITY ROOM ── */}
          <group position={[2.6, 0, 3.2]}>
            {/* White Partition Walls with Door Cutout & Viewing Window */}
            <mesh position={[-2.4, 1.4, 0]} material={materials.partitionWall} castShadow onClick={(e) => handleComponentClick(e, {
              name: "Ground-Level QA Testing & Calibration Pod",
              category: "Testing Facilities",
              specs: "Insulated acoustic testing laboratory enclosure with observation glazing and negative pressure HVAC",
              ecoScore: 95
            })}>
              <boxGeometry args={[0.14, 2.6, 4.4]} />
            </mesh>
            <mesh position={[0, 1.4, -2.1]} material={materials.partitionWall} castShadow>
              <boxGeometry args={[4.8, 2.6, 0.14]} />
            </mesh>
            {/* Observation Viewing Window */}
            <mesh position={[-2.4, 1.6, 0.8]} material={materials.glass}>
              <boxGeometry args={[0.16, 1.1, 1.8]} />
            </mesh>
            <mesh position={[-2.4, 1.6, 0.8]} material={materials.blackFrame}>
              <boxGeometry args={[0.18, 1.15, 0.06]} />
            </mesh>
          </group>
        </group>

        {/* ══════════════════════════════════════════════════════════════════
            5. INDUSTRIAL LIGHTING & EVENING AMBIENCE
        ══════════════════════════════════════════════════════════════════ */}
        {isEvening ? (
          <>
            {/* Warehouse High-Bay Downlights */}
            <pointLight color="#FFE8D6" intensity={2.8} distance={15.0} decay={1.8} position={[6.0, 7.5, -1.0]} />
            <pointLight color="#FFE0B2" intensity={2.2} distance={12.0} decay={1.8} position={[6.0, 7.5, 3.5]} />
            {/* Exterior Loading Bay Floodlights */}
            <pointLight color="#FEF08A" intensity={3.0} distance={10.0} decay={1.8} position={[6.0, 5.2, 8.5]} />
            <pointLight color="#FEF08A" intensity={2.8} distance={10.0} decay={1.8} position={[13.5, 5.2, -1.2]} />
            <pointLight color="#FFE0B2" intensity={2.5} distance={9.0} decay={1.8} position={[-2.8, 4.8, 8.2]} />
          </>
        ) : (
          <>
            <pointLight color="#FFF8E7" intensity={0.8} distance={14.0} decay={1.8} position={[6.0, 7.5, 0]} />
          </>
        )}
      </group>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TYPOLOGY 4: MONUMENTAL REALISTIC HOSPITAL (Reference Image 1)
  // ══════════════════════════════════════════════════════════════════
  if (isHealthcare) {
    const hospHeight = Math.max(2, floors) * 3.2 + 0.4;
    const roofY = hospHeight + 0.2;

    return (
      <group position={[0, 0, 0]}>
        {/* 1. SITE FOUNDATION APRON & ENTRANCE PLAZA (matching Image 1) */}
        <mesh position={[0, -0.25, 0]} material={materials.foundationPlinth} receiveShadow onClick={(e) => handleComponentClick(e, {
          name: "Hospital Anti-Vibration Raft Foundation", category: "Foundation", specs: "High-strength seismic raft slab with vibration damping, SLS 614 Grade 45", ecoScore: 94
        })}>
          <boxGeometry args={[30.0, 0.5, 24.0]} />
        </mesh>
        <mesh position={[0, 0.02, 1.5]} material={materials.slateTerrace} receiveShadow>
          <boxGeometry args={[29.0, 0.08, 22.0]} />
        </mesh>

        {/* 2. BROAD MONUMENTAL CEREMONIAL STAIRS (4 Tiers leading to Central Entrance) */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.15, 8.8]} material={materials.whiteStucco} receiveShadow>
            <boxGeometry args={[14.0, 0.3, 2.0]} />
          </mesh>
          <mesh position={[0, 0.45, 7.8]} material={materials.whiteStucco} receiveShadow>
            <boxGeometry args={[12.0, 0.3, 1.8]} />
          </mesh>
          <mesh position={[0, 0.75, 6.9]} material={materials.whiteStucco} receiveShadow>
            <boxGeometry args={[10.0, 0.3, 1.6]} />
          </mesh>
          <mesh position={[0, 1.05, 5.9]} material={materials.whiteStucco} receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Hospital Grand Entrance Portico Terrace", category: "Public Access", specs: "Non-slip flame-textured granite terrace with wheelchair ramp integration", ecoScore: 95
          })}>
            <boxGeometry args={[8.4, 0.3, 1.6]} />
          </mesh>

          {/* Plaza Low Balustrade Retaining Walls */}
          <mesh position={[-7.8, 0.6, 7.5]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[0.4, 0.9, 4.5]} />
          </mesh>
          <mesh position={[7.8, 0.6, 7.5]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[0.4, 0.9, 4.5]} />
          </mesh>
          {/* Wall Coping Capping */}
          <mesh position={[-7.8, 1.08, 7.5]} material={materials.charcoalFascia}><boxGeometry args={[0.5, 0.06, 4.6]} /></mesh>
          <mesh position={[7.8, 1.08, 7.5]} material={materials.charcoalFascia}><boxGeometry args={[0.5, 0.06, 4.6]} /></mesh>

          {/* Symmetrical Square Landscape Planters */}
          {[-8.8, 8.8].map((px, pIdx) => (
            <group key={`hosp-planter-${pIdx}`} position={[px, 0.4, 8.8]}>
              <mesh material={materials.whiteStucco} castShadow><boxGeometry args={[1.6, 0.8, 1.6]} /></mesh>
              <mesh position={[0, 0.42, 0]} material={materials.charcoalFascia}><boxGeometry args={[1.7, 0.06, 1.7]} /></mesh>
              <mesh position={[0, 0.8, 0]} material={materials.bambooLeaves} castShadow><sphereGeometry args={[0.65, 8, 8]} /></mesh>
            </group>
          ))}

          {/* Plaza Lampposts (from Image 1) */}
          {[-6.5, -3.2, 3.2, 6.5].map((lx, lIdx) => (
            <group key={`hosp-lamp-${lIdx}`} position={[lx, 0.0, 9.6]}>
              <mesh position={[0, 1.4, 0]} material={materials.streetLampPole}>
                <cylinderGeometry args={[0.05, 0.07, 2.8, 8]} />
              </mesh>
              <mesh position={[0, 2.85, 0]} material={materials.streetLampLight}>
                <sphereGeometry args={[0.18, 16, 16]} />
              </mesh>
              {isEvening && (
                <pointLight color="#FEF08A" intensity={1.8} distance={6.0} decay={2} position={[0, 2.85, 0]} />
              )}
            </group>
          ))}

          {/* 3D Realistic Architectural Conifer & Deciduous Trees (from Image 1) */}
          {[
            [12.5, 9.2, 1.05],
            [-12.5, 9.2, 0.95],
            [13.8, 4.2, 0.8],
            [-13.8, 4.2, 0.8],
          ].map(([tx, tz, tScale], tIdx) => (
            <group key={`hosp-tree-${tIdx}`} position={[tx, 0.02, tz]} scale={[tScale, tScale, tScale]}>
              {/* Mulch Ring Base */}
              <mesh position={[0, 0.02, 0]} material={materials.foundationPlinth}>
                <cylinderGeometry args={[1.2, 1.2, 0.05, 16]} />
              </mesh>
              {/* Tree Trunk */}
              <mesh position={[0, 1.6, 0]} material={materials.treeBark} castShadow>
                <cylinderGeometry args={[0.22, 0.38, 3.2, 10]} />
              </mesh>
              {/* Tier 1 Crown Foliage (Lower broad canopy) */}
              <mesh position={[0, 3.2, 0]} material={materials.treeFoliage} castShadow>
                <coneGeometry args={[1.9, 2.2, 12]} />
              </mesh>
              {/* Tier 2 Crown Foliage (Mid canopy) */}
              <mesh position={[0, 4.4, 0]} material={materials.treeFoliage} castShadow>
                <coneGeometry args={[1.5, 2.0, 12]} />
              </mesh>
              {/* Tier 3 Crown Foliage (Top spire canopy) */}
              <mesh position={[0, 5.5, 0]} material={materials.treeFoliage} castShadow>
                <coneGeometry args={[0.95, 1.8, 12]} />
              </mesh>
            </group>
          ))}

          {/* Approach Asphalt Roadway & Curbs (matching Reference Image 1) */}
          <mesh position={[0, -0.28, 15.5]} material={materials.asphaltRoad} receiveShadow>
            <boxGeometry args={[36.0, 0.45, 6.0]} />
          </mesh>
          {/* White Perimeter Curb Stones */}
          <mesh position={[0, 0.04, 12.5]} material={materials.columnWhite}>
            <boxGeometry args={[30.0, 0.12, 0.25]} />
          </mesh>
          {/* Road Lane Markings */}
          {[-12, -6, 0, 6, 12].map((mx, mi) => (
            <mesh key={`rd-mark-${mi}`} position={[mx, -0.04, 15.5]} material={materials.roadMarking}>
              <boxGeometry args={[3.0, 0.02, 0.2]} />
            </mesh>
          ))}
        </group>

        {/* 3. SYMMETRICAL LEFT PROJECTING PAVILION TOWER WING (matching Image 1) */}
        <group position={[-9.2, hospHeight / 2, 1.5]}>
          {/* Main Solid Precast Mass */}
          <mesh material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "West Clinical Pavilion Wing", category: "Hospital Ward Wing", specs: "250mm Insulated precast concrete wall assembly, acoustic rating STC 56dB", ecoScore: 93
          })}>
            <boxGeometry args={[7.6, hospHeight, 10.5]} />
          </mesh>

          {/* Horizontal Reveal Groove Lines (Scored lines from Image 1) */}
          {[-2.0, 0, 2.0].map((gy, gIdx) => (
            <mesh key={`west-groove-${gIdx}`} position={[0, gy, 5.28]} material={materials.concreteGroove}>
              <boxGeometry args={[7.65, 0.08, 0.05]} />
            </mesh>
          ))}

          {/* Deep Punched Window Recesses with Dark Glass & Balconies (from Image 1) */}
          {[-1.5, 1.5].map((wy, wIdx) => (
            <group key={`west-win-${wIdx}`} position={[0, wy, 5.0]}>
              {/* Window Cavity Recess */}
              <mesh position={[0, 0, 0.1]} material={materials.blackFrame}><boxGeometry args={[3.6, 1.6, 0.4]} /></mesh>
              <mesh position={[0, 0, 0.25]} material={materials.glass}><boxGeometry args={[3.4, 1.4, 0.08]} /></mesh>
              {/* Balcony Cantilever Shelf & Safety Railing (Image 1) */}
              <mesh position={[0, -0.85, 0.6]} material={materials.whiteStucco}><boxGeometry args={[3.8, 0.2, 0.8]} /></mesh>
              <mesh position={[0, -0.45, 0.95]} material={materials.blackFrame}><boxGeometry args={[3.8, 0.6, 0.05]} /></mesh>
            </group>
          ))}
        </group>

        {/* 4. SYMMETRICAL RIGHT PROJECTING PAVILION TOWER WING (matching Image 1) */}
        <group position={[9.2, hospHeight / 2, 1.5]}>
          <mesh material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "East Diagnostic & Surgical Wing", category: "Hospital Surgical Wing", specs: "Vibration-damped surgical theater wing with radiation-shielded envelope", ecoScore: 94
          })}>
            <boxGeometry args={[7.6, hospHeight, 10.5]} />
          </mesh>

          {/* Horizontal Reveal Groove Lines */}
          {[-2.0, 0, 2.0].map((gy, gIdx) => (
            <mesh key={`east-groove-${gIdx}`} position={[0, gy, 5.28]} material={materials.concreteGroove}>
              <boxGeometry args={[7.65, 0.08, 0.05]} />
            </mesh>
          ))}

          {/* Deep Punched Window Recesses with Balconies */}
          {[-1.5, 1.5].map((wy, wIdx) => (
            <group key={`east-win-${wIdx}`} position={[0, wy, 5.0]}>
              <mesh position={[0, 0, 0.1]} material={materials.blackFrame}><boxGeometry args={[3.6, 1.6, 0.4]} /></mesh>
              <mesh position={[0, 0, 0.25]} material={materials.glass}><boxGeometry args={[3.4, 1.4, 0.08]} /></mesh>
              <mesh position={[0, -0.85, 0.6]} material={materials.whiteStucco}><boxGeometry args={[3.8, 0.2, 0.8]} /></mesh>
              <mesh position={[0, -0.45, 0.95]} material={materials.blackFrame}><boxGeometry args={[3.8, 0.6, 0.05]} /></mesh>
            </group>
          ))}
        </group>

        {/* 5. RECESSED CENTRAL ATRIUM & MULTI-BAY CURTAIN WALL (between Wings) */}
        <group position={[0, hospHeight / 2, -1.0]}>
          {/* Main Central Block */}
          <mesh material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Central Clinical Atrium & Reception", category: "Main Entrance", specs: "High daylight factor glass atrium with passive thermal ventilation chimneys", ecoScore: 96
          })}>
            <boxGeometry args={[14.2, hospHeight, 10.0]} />
          </mesh>

          {/* Front Glass Curtain Wall Section */}
          <mesh position={[0, 0, 5.02]} material={materials.glass}>
            <boxGeometry args={[13.6, hospHeight - 0.6, 0.08]} />
          </mesh>

          {/* Prominent Vertical Structural Concrete Fins / Brise-Soleil (from Image 1) */}
          {[-5.0, -3.0, -1.0, 1.0, 3.0, 5.0].map((fx, fIdx) => (
            <mesh key={`central-fin-${fIdx}`} position={[fx, 0, 5.3]} material={materials.whiteStucco} castShadow>
              <boxGeometry args={[0.35, hospHeight, 0.6]} />
            </mesh>
          ))}

          {/* Central Entrance Double Doors on Elevated Deck */}
          <group position={[0, -hospHeight / 2 + 1.6, 5.35]}>
            <mesh position={[0, 0, 0]} material={materials.blackFrame}><boxGeometry args={[3.2, 2.6, 0.3]} /></mesh>
            <mesh position={[0, 0, 0.16]} material={materials.glass}><boxGeometry args={[2.8, 2.3, 0.05]} /></mesh>
            <mesh position={[0, 1.45, 0.4]} material={materials.charcoalFascia}><boxGeometry args={[4.2, 0.25, 1.4]} /></mesh>
          </group>
        </group>

        {/* 6. GRAND CENTRAL PEDIMENT TOWER WITH "HOSPITAL" & 3D MEDICAL CROSS (matching Image 1) */}
        <group position={[0, roofY, 3.2]}>
          {/* Stepped Pediment Tower Block */}
          <mesh position={[0, 1.8, 0]} material={materials.whiteStucco} castShadow onClick={(e) => handleComponentClick(e, {
            name: "Hospital Emblem Tower & Central Pediment", category: "Architectural Feature", specs: "Monolithic pediment tower housing emergency signage and architectural medical crest", ecoScore: 97
          })}>
            <boxGeometry args={[5.8, 3.6, 4.0]} />
          </mesh>
          {/* Triangular / Arched Crown Cornice */}
          <mesh position={[0, 3.7, 0]} material={materials.charcoalFascia} castShadow>
            <boxGeometry args={[6.2, 0.3, 4.2]} />
          </mesh>

          {/* Dimensional "HOSPITAL" Sign Bar (matching Image 1) */}
          <mesh position={[0, 3.2, 2.05]} material={materials.charcoalFascia}>
            <boxGeometry args={[4.4, 0.65, 0.12]} />
          </mesh>
          <mesh position={[0, 3.2, 2.12]} material={materials.whiteStucco}>
            <boxGeometry args={[4.2, 0.5, 0.05]} />
          </mesh>
          <mesh position={[0, 3.2, 2.16]} material={materials.blackFrame}>
            <boxGeometry args={[3.8, 0.32, 0.02]} />
          </mesh>

          {/* Arched/Square Niche with 3D Glowing Red Medical Cross (+) */}
          <group position={[0, 1.7, 2.05]}>
            {/* Recessed Niche Background */}
            <mesh material={materials.charcoalFascia}>
              <boxGeometry args={[2.8, 2.2, 0.15]} />
            </mesh>
            {/* 3D Medical Cross in relief */}
            <mesh position={[0, 0, 0.1]} material={materials.hospitalRed} castShadow>
              <boxGeometry args={[1.8, 0.55, 0.18]} />
            </mesh>
            <mesh position={[0, 0, 0.1]} material={materials.hospitalRed} castShadow>
              <boxGeometry args={[0.55, 1.8, 0.18]} />
            </mesh>
          </group>

          {/* Pediment Illumination */}
          {isEvening && (
            <pointLight color="#EF4444" intensity={3.5} distance={10.0} decay={1.8} position={[0, 2.2, 3.0]} />
          )}
        </group>

        {/* 7. REALISTIC ROOFTOP: PARAPET, HVAC CHILLERS & EMERGENCY HELIPAD */}
        <group position={[0, roofY, 0]}>
          {/* Gravel Roof Surface */}
          <mesh position={[0, 0.05, -1.0]} material={materials.gravelRoof} receiveShadow>
            <boxGeometry args={[27.0, 0.1, 14.5]} />
          </mesh>

          {/* Parapet Perimeter Walls & Coping */}
          <mesh position={[0, 0.55, 6.2]} material={materials.whiteStucco}><boxGeometry args={[27.4, 0.9, 0.35]} /></mesh>
          <mesh position={[0, 0.55, -8.2]} material={materials.whiteStucco}><boxGeometry args={[27.4, 0.9, 0.35]} /></mesh>
          <mesh position={[-13.5, 0.55, -1.0]} material={materials.whiteStucco}><boxGeometry args={[0.35, 0.9, 14.8]} /></mesh>
          <mesh position={[13.5, 0.55, -1.0]} material={materials.whiteStucco}><boxGeometry args={[0.35, 0.9, 14.8]} /></mesh>

          {/* Rooftop HVAC Air Handler / Chiller Units */}
          {[-7.5, -4.5, 4.5, 7.5].map((hx, hIdx) => (
            <group key={`hosp-hvac-${hIdx}`} position={[hx, 0.65, -5.5]}>
              <mesh material={materials.hvacMetal} castShadow><boxGeometry args={[2.0, 1.0, 1.5]} /></mesh>
              <mesh position={[0, 0.52, 0]} material={materials.hvacFan}><cylinderGeometry args={[0.5, 0.5, 0.08, 16]} /></mesh>
            </group>
          ))}

          {/* Rear Rooftop Emergency Helipad with Yellow Ring & "H" */}
          <group position={[0, 0.15, -2.5]}>
            <mesh material={materials.charcoalFascia} receiveShadow onClick={(e) => handleComponentClick(e, {
              name: "Rooftop Trauma Helipad Deck", category: "Emergency Logistics", specs: "18-ton structural helipad platform with FAA/ICAO-referenced perimeter lighting", ecoScore: 98
            })}>
              <boxGeometry args={[11.5, 0.15, 8.5]} />
            </mesh>
            {/* Yellow Circle Ring */}
            <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.helipadMarking}>
              <ringGeometry args={[3.2, 3.6, 32]} />
            </mesh>
            {/* 3D Yellow "H" Insignia */}
            <group position={[0, 0.1, 0]}>
              <mesh position={[-1.2, 0, 0]} material={materials.helipadMarking}><boxGeometry args={[0.45, 0.02, 2.8]} /></mesh>
              <mesh position={[1.2, 0, 0]} material={materials.helipadMarking}><boxGeometry args={[0.45, 0.02, 2.8]} /></mesh>
              <mesh position={[0, 0, 0]} material={materials.helipadMarking}><boxGeometry args={[2.4, 0.02, 0.45]} /></mesh>
            </group>
            {/* Helipad Corner Beacons */}
            {[
              [-5.2, -3.8],
              [5.2, -3.8],
              [-5.2, 3.8],
              [5.2, 3.8],
            ].map(([bx, bz], bIdx) => (
              <mesh key={`heli-beacon-${bIdx}`} position={[bx, 0.15, bz]} material={materials.hospitalRed}>
                <cylinderGeometry args={[0.1, 0.1, 0.25, 8]} />
              </mesh>
            ))}
          </group>
        </group>

        {isEvening && (
          <>
            <pointLight color="#FFF8ED" intensity={2.0} distance={16.0} decay={1.8} position={[0, 2.5, 8.0]} />
            <pointLight color="#FFE8D6" intensity={1.8} distance={18.0} decay={1.8} position={[0, roofY + 1.5, 0]} />
          </>
        )}
      </group>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TYPOLOGY 5: EDUCATIONAL CAMPUS & ACADEMIC FACILITY (U-Shaped Courtyard Hall)
  // ══════════════════════════════════════════════════════════════════
  if (isEducational) {
    const effectiveFloors = Math.max(3, floors);
    const storyH = 3.0;
    const buildingH = effectiveFloors * storyH;
    const roofY = buildingH;

    // Window horizontal columns for main rear hall
    const mainHallWindowXs = [-6.4, -4.8, -3.2, 3.2, 4.8, 6.4];
    // Window columns for side wings along Z
    const wingWindowZs = [-1.5, 0.5, 2.5, 4.5];

    return (
      <group position={[0, 0, 0]}>
        {/* 1. CAMPUS SITE PLATFORM & COURTYARD PLAZA */}
        <mesh position={[0, -0.25, 0.5]} material={materials.foundationPlinth} receiveShadow onClick={(e) => handleComponentClick(e, {
          name: "Academic Heavy Reinforced Raft Foundation", category: "Foundation", specs: "High-grade reinforced concrete, SLS 614 Grade 35", ecoScore: 93
        })}>
          <boxGeometry args={[25.0, 0.5, 21.0]} />
        </mesh>
        <mesh position={[0, 0.02, 0.5]} material={materials.slateTerrace} receiveShadow>
          <boxGeometry args={[24.4, 0.08, 20.4]} />
        </mesh>

        {/* Central Entrance Paved Promenade Walkway */}
        <mesh position={[0, 0.05, 1.8]} material={materials.whiteFascia} receiveShadow>
          <boxGeometry args={[4.2, 0.04, 12.5]} />
        </mesh>

        {/* Symmetrical Campus Green Lawn Quads (Left & Right) */}
        <mesh position={[-4.5, 0.06, 1.2]} receiveShadow>
          <boxGeometry args={[4.4, 0.03, 8.5]} />
          <meshStandardMaterial color="#4A5C42" roughness={0.92} />
        </mesh>
        <mesh position={[4.5, 0.06, 1.2]} receiveShadow>
          <boxGeometry args={[4.4, 0.03, 8.5]} />
          <meshStandardMaterial color="#4A5C42" roughness={0.92} />
        </mesh>

        {/* Lawn Stone Curbs */}
        <mesh position={[-4.5, 0.08, 5.5]} material={materials.blackFrame}><boxGeometry args={[4.5, 0.06, 0.12]} /></mesh>
        <mesh position={[4.5, 0.08, 5.5]} material={materials.blackFrame}><boxGeometry args={[4.5, 0.06, 0.12]} /></mesh>
        <mesh position={[-2.25, 0.08, 1.2]} material={materials.blackFrame}><boxGeometry args={[0.12, 0.06, 8.6]} /></mesh>
        <mesh position={[2.25, 0.08, 1.2]} material={materials.blackFrame}><boxGeometry args={[0.12, 0.06, 8.6]} /></mesh>

        {/* Campus Courtyard Ornamental Trees */}
        {[-6.8, 6.8].map((tx, sideIdx) => (
          wingWindowZs.map((tz, zIdx) => (
            <group key={`quad-tree-${sideIdx}-${zIdx}`} position={[tx > 0 ? 6.7 : -6.7, 0.08, tz]}>
              <mesh position={[0, 0.4, 0]} material={materials.treeBark} castShadow>
                <cylinderGeometry args={[0.05, 0.07, 0.8, 8]} />
              </mesh>
              <mesh position={[0, 1.0, 0]} material={materials.treeFoliage} castShadow>
                <sphereGeometry args={[0.42, 8, 8]} />
              </mesh>
            </group>
          ))
        ))}

        {/* 2. U-SHAPED ACADEMIC BUILDING MASSING */}

        {/* 2A. MAIN CENTRAL ACADEMIC BLOCK (Rear Hall) */}
        <group position={[0, 0, -4.5]}>
          {/* Ground Floor Dark Dado Band */}
          <mesh position={[0, 0.9, 0]} material={materials.charcoalFascia} castShadow receiveShadow>
            <boxGeometry args={[20.5, 1.8, 4.8]} />
          </mesh>
          {/* Upper Academic Stucco Facade */}
          <mesh position={[0, (buildingH + 1.8) / 2, 0]} material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "Central Academic & Faculty Hall", category: "Building Envelope", specs: "High thermal mass masonry with breathable lime-sand mortar, STC 52dB", ecoScore: 94
          })}>
            <boxGeometry args={[20.5, buildingH - 1.8, 4.8]} />
          </mesh>
        </group>

        {/* 2B. WEST WING (Left Forward Projecting Classroom Wing) */}
        <group position={[-8.5, 0, 1.0]}>
          {/* Ground Floor Dark Dado Band */}
          <mesh position={[0, 0.9, 0]} material={materials.charcoalFascia} castShadow receiveShadow>
            <boxGeometry args={[3.5, 1.8, 11.2]} />
          </mesh>
          {/* Upper Classroom Stucco Facade */}
          <mesh position={[0, (buildingH + 1.8) / 2, 0]} material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "West Classroom & Science Wing", category: "Building Envelope", specs: "Acoustic insulated cellular concrete with low-VOC mineral render", ecoScore: 95
          })}>
            <boxGeometry args={[3.5, buildingH - 1.8, 11.2]} />
          </mesh>

          {/* West Wing End-Cap Feature Vertical Stairwell Window Slot (Facing Front) */}
          <mesh position={[0, buildingH / 2, 5.62]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
            name: "West Wing Atrium / Stairwell Feature Glazing", category: "Glazing", specs: "High-VLT structural safety glass for natural core daylighting", ecoScore: 97
          })}>
            <boxGeometry args={[1.4, buildingH - 1.2, 0.08]} />
          </mesh>
          <mesh position={[0, buildingH / 2, 5.64]} material={materials.blackFrame}>
            <boxGeometry args={[1.48, buildingH - 1.15, 0.05]} />
          </mesh>
          {/* Horizontal Glass Division Mullions */}
          {Array.from({ length: effectiveFloors }).map((_, fIdx) => (
            <mesh key={`west-cap-mul-${fIdx}`} position={[0, (fIdx + 0.8) * storyH, 5.66]} material={materials.blackFrame}>
              <boxGeometry args={[1.44, 0.08, 0.08]} />
            </mesh>
          ))}
        </group>

        {/* 2C. EAST WING (Right Forward Projecting Classroom Wing) */}
        <group position={[8.5, 0, 1.0]}>
          {/* Ground Floor Dark Dado Band */}
          <mesh position={[0, 0.9, 0]} material={materials.charcoalFascia} castShadow receiveShadow>
            <boxGeometry args={[3.5, 1.8, 11.2]} />
          </mesh>
          {/* Upper Classroom Stucco Facade */}
          <mesh position={[0, (buildingH + 1.8) / 2, 0]} material={materials.whiteStucco} castShadow receiveShadow onClick={(e) => handleComponentClick(e, {
            name: "East Lecture & Seminar Wing", category: "Building Envelope", specs: "Thermal mass envelope with SLS 1070 approved AAC blockwork", ecoScore: 95
          })}>
            <boxGeometry args={[3.5, buildingH - 1.8, 11.2]} />
          </mesh>

          {/* East Wing End-Cap Feature Vertical Stairwell Window Slot (Facing Front) */}
          <mesh position={[0, buildingH / 2, 5.62]} material={materials.glass} onClick={(e) => handleComponentClick(e, {
            name: "East Wing Atrium / Stairwell Feature Glazing", category: "Glazing", specs: "High-VLT structural safety glass for natural core daylighting", ecoScore: 97
          })}>
            <boxGeometry args={[1.4, buildingH - 1.2, 0.08]} />
          </mesh>
          <mesh position={[0, buildingH / 2, 5.64]} material={materials.blackFrame}>
            <boxGeometry args={[1.48, buildingH - 1.15, 0.05]} />
          </mesh>
          {/* Horizontal Glass Division Mullions */}
          {Array.from({ length: effectiveFloors }).map((_, fIdx) => (
            <mesh key={`east-cap-mul-${fIdx}`} position={[0, (fIdx + 0.8) * storyH, 5.66]} material={materials.blackFrame}>
              <boxGeometry args={[1.44, 0.08, 0.08]} />
            </mesh>
          ))}
        </group>

        {/* 3. RAISED CENTRAL CLOCK TOWER / PEDIMENT PAVILION */}
        <group position={[0, 0, -4.3]}>
          {/* Tower Volume Extending Above Roof */}
          <mesh position={[0, (buildingH + 1.8) / 2, 0.1]} material={materials.whiteStucco} castShadow>
            <boxGeometry args={[5.2, buildingH + 1.8, 5.0]} />
          </mesh>
          {/* Tower Top White Parapet Band */}
          <mesh position={[0, buildingH + 1.85, 0.1]} material={materials.whiteFascia}>
            <boxGeometry args={[5.4, 0.25, 5.2]} />
          </mesh>

          {/* Institutional Round Clock Face (Reference Photo) */}
          <group position={[0, buildingH + 0.8, 2.62]}>
            {/* Clock Outer Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.blackFrame}>
              <cylinderGeometry args={[0.72, 0.72, 0.06, 32]} />
            </mesh>
            {/* Clock White Dial */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]} material={materials.signEmissive}>
              <cylinderGeometry args={[0.66, 0.66, 0.05, 32]} />
            </mesh>
            {/* Clock Hour & Minute Hands */}
            <mesh position={[0, 0.16, 0.06]} material={materials.blackFrame}>
              <boxGeometry args={[0.04, 0.36, 0.02]} />
            </mesh>
            <mesh position={[0.12, 0, 0.06]} rotation={[0, 0, -Math.PI / 3]} material={materials.blackFrame}>
              <boxGeometry args={[0.04, 0.28, 0.02]} />
            </mesh>
          </group>
        </group>

        {/* 4. CENTRAL ENTRANCE PORTICO CANOPY */}
        <group position={[0, 0, -1.9]}>
          {/* Portico Projecting Canopy */}
          <mesh position={[0, 3.2, 0.8]} material={materials.whiteFascia} castShadow onClick={(e) => handleComponentClick(e, {
            name: "Grand Academic Portico Canopy", category: "Entrance Canopy", specs: "Cast-in-place white Portland canopy with recessed LED downlighting", ecoScore: 96
          })}>
            <boxGeometry args={[5.2, 0.28, 2.4]} />
          </mesh>
          {/* 4 Portico Support Columns */}
          {[-2.2, 2.2].map((colX, cIdx) => (
            <mesh key={`portico-col-${cIdx}`} position={[colX, 1.5, 1.8]} material={materials.whiteStucco} castShadow>
              <boxGeometry args={[0.26, 3.0, 0.26]} />
            </mesh>
          ))}
          {/* Glass Main Entrance Doors */}
          <mesh position={[0, 1.4, -0.1]} material={materials.glass}>
            <boxGeometry args={[3.6, 2.6, 0.08]} />
          </mesh>
          <mesh position={[0, 1.4, -0.08]} material={materials.blackFrame}>
            <boxGeometry args={[3.7, 0.08, 0.1]} />
          </mesh>
          <mesh position={[0, 1.4, -0.08]} material={materials.blackFrame}>
            <boxGeometry args={[0.08, 2.6, 0.1]} />
          </mesh>
        </group>

        {/* 5. PUNCTURED CLASSROOM WINDOW GRIDS ACROSS ALL FLOORS */}
        {Array.from({ length: effectiveFloors }).map((_, floorIdx) => {
          const winY = floorIdx * storyH + 1.55;

          return (
            <group key={`edu-win-floor-${floorIdx}`}>
              {/* Rear Central Hall Classroom Windows (Courtyard Facing) */}
              {mainHallWindowXs.map((wx, wIdx) => (
                <group key={`main-win-${floorIdx}-${wIdx}`} position={[wx, winY, -2.08]}>
                  <mesh material={materials.glass} onClick={(e) => handleComponentClick(e, {
                    name: `Level ${floorIdx + 1} High-VLT Daylighting Classroom Windows`, category: "Glazing", specs: "High visible light transmittance glass 72% VLT, glare-reducing coating", ecoScore: 97
                  })}>
                    <boxGeometry args={[1.2, 1.5, 0.08]} />
                  </mesh>
                  {/* Black Frame */}
                  <mesh material={materials.blackFrame}><boxGeometry args={[1.26, 1.56, 0.04]} /></mesh>
                  {/* Center Vertical Mullion */}
                  <mesh material={materials.blackFrame}><boxGeometry args={[0.05, 1.5, 0.06]} /></mesh>
                </group>
              ))}

              {/* West Wing Classroom Windows (Inner Courtyard Facing) */}
              {wingWindowZs.map((wz, wIdx) => (
                <group key={`west-inner-win-${floorIdx}-${wIdx}`} position={[-6.73, winY, wz]}>
                  <mesh material={materials.glass}>
                    <boxGeometry args={[0.08, 1.5, 1.2]} />
                  </mesh>
                  <mesh material={materials.blackFrame}><boxGeometry args={[0.04, 1.56, 1.26]} /></mesh>
                </group>
              ))}

              {/* East Wing Classroom Windows (Inner Courtyard Facing) */}
              {wingWindowZs.map((wz, wIdx) => (
                <group key={`east-inner-win-${floorIdx}-${wIdx}`} position={[6.73, winY, wz]}>
                  <mesh material={materials.glass}>
                    <boxGeometry args={[0.08, 1.5, 1.2]} />
                  </mesh>
                  <mesh material={materials.blackFrame}><boxGeometry args={[0.04, 1.56, 1.26]} /></mesh>
                </group>
              ))}

              {/* Outer Facade Windows (West Wing Outer) */}
              {wingWindowZs.map((wz, wIdx) => (
                <group key={`west-outer-win-${floorIdx}-${wIdx}`} position={[-10.27, winY, wz]}>
                  <mesh material={materials.glass}><boxGeometry args={[0.08, 1.5, 1.2]} /></mesh>
                  <mesh material={materials.blackFrame}><boxGeometry args={[0.04, 1.56, 1.26]} /></mesh>
                </group>
              ))}

              {/* Outer Facade Windows (East Wing Outer) */}
              {wingWindowZs.map((wz, wIdx) => (
                <group key={`east-outer-win-${floorIdx}-${wIdx}`} position={[10.27, winY, wz]}>
                  <mesh material={materials.glass}><boxGeometry args={[0.08, 1.5, 1.2]} /></mesh>
                  <mesh material={materials.blackFrame}><boxGeometry args={[0.04, 1.56, 1.26]} /></mesh>
                </group>
              ))}

              {/* Evening Classroom Warm Glow */}
              {isEvening && (
                <>
                  <pointLight color="#FFF3DC" intensity={0.9} distance={7.0} decay={1.8} position={[0, winY, -3.5]} />
                  <pointLight color="#FFF3DC" intensity={0.7} distance={6.0} decay={1.8} position={[-8.5, winY, 1.0]} />
                  <pointLight color="#FFF3DC" intensity={0.7} distance={6.0} decay={1.8} position={[8.5, winY, 1.0]} />
                </>
              )}
            </group>
          );
        })}

        {/* 6. U-SHAPED ROOF & WHITE PARAPET COPING */}
        {/* Main Rear Roof */}
        <mesh position={[0, roofY + 0.08, -4.5]} material={materials.industrialRoof} receiveShadow onClick={(e) => handleComponentClick(e, {
          name: "High-Albedo Reflective Roof Deck", category: "Roofing", specs: "Multi-layer SBS elastomer membrane with white mineral ballast", ecoScore: 96
        })}>
          <boxGeometry args={[20.3, 0.12, 4.6]} />
        </mesh>
        <mesh position={[0, roofY + 0.18, -4.5]} material={materials.whiteFascia}>
          <boxGeometry args={[20.7, 0.18, 5.0]} />
        </mesh>

        {/* West Wing Roof */}
        <mesh position={[-8.5, roofY + 0.08, 1.0]} material={materials.industrialRoof} receiveShadow>
          <boxGeometry args={[3.3, 0.12, 11.0]} />
        </mesh>
        <mesh position={[-8.5, roofY + 0.18, 1.0]} material={materials.whiteFascia}>
          <boxGeometry args={[3.7, 0.18, 11.4]} />
        </mesh>

        {/* East Wing Roof */}
        <mesh position={[8.5, roofY + 0.08, 1.0]} material={materials.industrialRoof} receiveShadow>
          <boxGeometry args={[3.3, 0.12, 11.0]} />
        </mesh>
        <mesh position={[8.5, roofY + 0.18, 1.0]} material={materials.whiteFascia}>
          <boxGeometry args={[3.7, 0.18, 11.4]} />
        </mesh>

        {/* Evening Courtyard Lighting */}
        {isEvening && (
          <>
            <pointLight color="#FFE2B8" intensity={1.8} distance={14.0} decay={1.8} position={[0, 2.8, -0.8]} />
            <pointLight color="#FFE2B8" intensity={1.2} distance={10.0} decay={1.8} position={[-4.5, 1.5, 2.5]} />
            <pointLight color="#FFE2B8" intensity={1.2} distance={10.0} decay={1.8} position={[4.5, 1.5, 2.5]} />
          </>
        )}
      </group>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TYPOLOGY 6: CONTEMPORARY RESIDENTIAL VILLA (DEFAULT)
  // ══════════════════════════════════════════════════════════════════
  return (
    <group position={[0, 0, 0]}>
      {/* 1. SITE PLATFORM & FOUNDATION */}
      <mesh
        position={[0, -0.25, -0.5]}
        material={materials.foundationPlinth}
        receiveShadow
        onClick={(e) => handleComponentClick(e, {
          name: "Eco-Concrete Plinth Foundation",
          category: "Foundation & Groundwork",
          specs: "30% GGBS / Fly-Ash Blended Mix, SLS 614 Grade 30",
          embodiedCarbon: "0.28 kgCO₂/kg",
          serviceLife: "60 Years",
          ecoScore: 92,
        })}
      >
        <boxGeometry args={[16.8, 0.5, 14.5]} />
      </mesh>

      <mesh
        position={[0, 0.02, -0.5]}
        material={materials.slateTerrace}
        receiveShadow
        onClick={(e) => handleComponentClick(e, {
          name: "Permeable Slate Paver Terrace",
          category: "Hard Landscaping & Flooring",
          specs: "High-friction unpolished non-slip tiles, SLS 1181",
          embodiedCarbon: "0.19 kgCO₂/kg",
          serviceLife: "50 Years",
          ecoScore: 88,
        })}
      >
        <boxGeometry args={[16.2, 0.08, 13.8]} />
      </mesh>

      {/* Floating Entry Steps (Reference Image 1) */}
      <mesh position={[2.8, 0.10, 2.75]} material={materials.slateTerrace} receiveShadow>
        <boxGeometry args={[5.2, 0.16, 1.1]} />
      </mesh>
      <mesh position={[2.8, 0.04, 3.35]} material={materials.slateTerrace} receiveShadow>
        <boxGeometry args={[5.6, 0.08, 0.9]} />
      </mesh>

      {/* 2. GROUND FLOOR MASSING (Warm Taupe / Greige — Reference Image 1) */}
      <mesh
        position={[2.6, 1.6, -1.8]}
        material={materials.taupeWall}
        castShadow
        receiveShadow
        onClick={(e) => handleComponentClick(e, {
          name: "Autoclaved Aerated Concrete (AAC) Walling",
          category: "Structural Envelope",
          specs: "200mm AAC Blockwork with warm mineral render, k=0.12 W/mK",
          embodiedCarbon: "0.32 kgCO₂/kg",
          serviceLife: "50 Years",
          ecoScore: 89,
        })}
      >
        <boxGeometry args={[7.6, 3.1, 7.8]} />
      </mesh>

      <mesh
        position={[-3.8, 1.6, -3.2]}
        material={materials.taupeWall}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[5.2, 3.1, 5.0]} />
      </mesh>

      {/* Ground Floor Columns (Clean Minimalist Architectural Columns) */}
      <mesh
        position={[-6.2, 1.6, 4.8]}
        material={materials.whiteStucco}
        castShadow
        receiveShadow
        onClick={(e) => handleComponentClick(e, {
          name: "Reinforced Concrete Structural Columns",
          category: "Structural Frame",
          specs: "350x350mm RC Columns, SLS 375 High-Yield TMT Rebar",
          embodiedCarbon: "0.38 kgCO₂/kg",
          serviceLife: "65 Years",
          ecoScore: 85,
        })}
      >
        <boxGeometry args={[0.38, 3.15, 0.38]} />
      </mesh>
      <mesh position={[-0.8, 1.6, 4.8]} material={materials.whiteStucco} castShadow receiveShadow>
        <boxGeometry args={[0.38, 3.15, 0.38]} />
      </mesh>
      <mesh position={[-3.5, 3.1, 4.8]} material={materials.whiteStucco} castShadow>
        <boxGeometry args={[5.8, 0.35, 0.42]} />
      </mesh>

      {/* Entrance Door with Vertical Teak Timber Slats (Reference Image 1) */}
      <mesh position={[0.2, 1.35, 2.12]} material={materials.timberSlat} castShadow>
        <boxGeometry args={[1.5, 2.6, 0.12]} />
      </mesh>
      <mesh position={[0.2, 1.35, 2.14]} material={materials.blackFrame}>
        <boxGeometry args={[1.52, 2.62, 0.04]} />
      </mesh>

      {/* Modern Wall Sconce Fixtures on Taupe Wall */}
      <mesh position={[0.35, 2.1, 2.22]} material={materials.blackFrame}><boxGeometry args={[0.1, 0.22, 0.08]} /></mesh>
      <mesh position={[5.35, 2.1, 2.22]} material={materials.blackFrame}><boxGeometry args={[0.1, 0.22, 0.08]} /></mesh>
      <pointLight color="#FFE2B8" intensity={0.9} distance={3.8} decay={2} position={[0.35, 1.95, 2.3]} />
      <pointLight color="#FFE2B8" intensity={0.9} distance={3.8} decay={2} position={[5.35, 1.95, 2.3]} />

      {/* 3. GLAZING & PICTURE WINDOWS */}
      <mesh
        position={[2.8, 1.45, 2.15]}
        material={materials.glass}
        onClick={(e) => handleComponentClick(e, {
          name: "Low-E Double Glazed Picture Window",
          category: "Curtain Walling & Fenestration",
          specs: "6mm Clear Low-E + 12mm Argon + 6mm Tinted Glass, U=1.58 W/m²K",
          embodiedCarbon: "0.45 kgCO₂/kg",
          serviceLife: "35 Years",
          ecoScore: 94,
        })}
      >
        <boxGeometry args={[4.8, 2.7, 0.08]} />
      </mesh>

      {/* Mullions */}
      <mesh position={[2.8, 2.8, 2.16]} material={materials.blackFrame}><boxGeometry args={[4.9, 0.08, 0.12]} /></mesh>
      <mesh position={[2.8, 0.12, 2.16]} material={materials.blackFrame}><boxGeometry args={[4.9, 0.08, 0.12]} /></mesh>
      <mesh position={[0.4, 1.45, 2.16]} material={materials.blackFrame}><boxGeometry args={[0.08, 2.7, 0.12]} /></mesh>
      <mesh position={[2.0, 1.45, 2.16]} material={materials.blackFrame}><boxGeometry args={[0.08, 2.7, 0.12]} /></mesh>
      <mesh position={[3.6, 1.45, 2.16]} material={materials.blackFrame}><boxGeometry args={[0.08, 2.7, 0.12]} /></mesh>
      <mesh position={[5.2, 1.45, 2.16]} material={materials.blackFrame}><boxGeometry args={[0.08, 2.7, 0.12]} /></mesh>

      {/* Corner Window Wrap */}
      <mesh position={[6.42, 1.45, 0.5]} material={materials.glass}><boxGeometry args={[0.08, 2.7, 3.4]} /></mesh>
      <mesh position={[6.44, 2.8, 0.5]} material={materials.blackFrame}><boxGeometry args={[0.12, 0.08, 3.5]} /></mesh>
      <mesh position={[6.44, 0.12, 0.5]} material={materials.blackFrame}><boxGeometry args={[0.12, 0.08, 3.5]} /></mesh>

      <mesh position={[-3.6, 1.45, -0.68]} material={materials.glass}><boxGeometry args={[3.2, 2.2, 0.08]} /></mesh>

      {/* 4. PARAMETRIC UPPER FLOORS */}
      {floors > 1 && Array.from({ length: floors - 1 }).map((_, idx) => {
        const lvl = idx + 1;
        const baseY = lvl * 3.1;
        return (
          <group key={`upper-floor-${lvl}`}>
            <mesh
              position={[-0.4, baseY + 0.15, 0.2]}
              material={materials.whiteStucco}
              castShadow
              receiveShadow
              onClick={(e) => handleComponentClick(e, {
                name: `Floor ${lvl + 1} Post-Tensioned Slab`,
                category: "Structural Frame",
                specs: "220mm Post-tensioned Slab, Reduced Embodied Concrete by 22%",
                ecoScore: 90,
              })}
            >
              <boxGeometry args={[14.2, 0.28, 10.6]} />
            </mesh>

            <mesh position={[-3.6, baseY + 1.7, 0.2]} material={materials.whiteStucco} castShadow receiveShadow>
              <boxGeometry args={[6.2, 2.85, 8.2]} />
            </mesh>

            {/* Balcony Recess Warm Timber Slats Wall (Reference Image 1) */}
            <mesh position={[-3.6, baseY + 1.7, 3.6]} material={materials.timberSlat} castShadow>
              <boxGeometry args={[5.9, 2.7, 0.12]} />
            </mesh>

            <mesh position={[3.0, baseY + 1.7, -1.0]} material={materials.whiteStucco} castShadow receiveShadow>
              <boxGeometry args={[6.8, 2.85, 6.8]} />
            </mesh>

            <mesh position={[3.2, baseY + 1.65, 2.42]} material={materials.glass}>
              <boxGeometry args={[5.2, 2.4, 0.08]} />
            </mesh>
            <mesh position={[3.2, baseY + 2.85, 2.44]} material={materials.blackFrame}><boxGeometry args={[5.3, 0.08, 0.12]} /></mesh>
            <mesh position={[3.2, baseY + 0.45, 2.44]} material={materials.blackFrame}><boxGeometry args={[5.3, 0.08, 0.12]} /></mesh>

            {/* Balcony Railings - Ultra Clear Safety Glass */}
            <mesh position={[-3.6, baseY + 0.6, 4.4]} material={materials.balconyGlass}>
              <boxGeometry args={[6.4, 0.9, 0.06]} />
            </mesh>
            <mesh position={[-3.6, baseY + 1.05, 4.4]} material={materials.blackFrame}>
              <boxGeometry args={[6.5, 0.05, 0.08]} />
            </mesh>

            {isEvening && (
              <pointLight color="#FFE2B8" intensity={1.5} distance={7.0} decay={1.8} position={[3.2, baseY + 1.7, 0.2]} />
            )}
          </group>
        );
      })}

      {/* 5. CANTILEVERED FLAT ROOF WITH CRISP WHITE FASCIA (Reference Images 1 & 2) */}
      <mesh
        position={[-0.2, roofY + 0.16, 0.3]}
        material={materials.whiteFascia}
        castShadow
        receiveShadow
        onClick={(e) => handleComponentClick(e, {
          name: "Solar-Optimized Cantilevered Roof with Crisp White Fascia",
          category: "Roofing & Thermal Shading",
          specs: "1.2m Passive Solar Cantilevered Eaves, SLS 1182",
          ecoScore: 96,
        })}
      >
        <boxGeometry args={[15.6, 0.32, 12.8]} />
      </mesh>

      {/* Dark Architectural Roof Cap / Trim */}
      <mesh position={[-0.2, roofY + 0.34, 0.3]} material={materials.charcoalFascia}>
        <boxGeometry args={[14.8, 0.08, 12.0]} />
      </mesh>

      {/* Modern Architectural Timber Pergola Louvres under Overhang (Reference Image 2) */}
      {[-4.8, -3.2, -1.6, 0.0, 1.6, 3.2, 4.8].map((px, pIdx) => (
        <mesh key={`pergola-beam-${pIdx}`} position={[px, roofY - 0.08, 5.0]} material={materials.timberPergola} castShadow>
          <boxGeometry args={[0.12, 0.18, 2.6]} />
        </mesh>
      ))}

      {/* 6. SOFFIT DOWNLIGHTS */}
      {roofDownlights.map((pos, idx) => (
        <group key={`roof-dl-${idx}`} position={pos}>
          <mesh material={materials.downlightLens}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
          </mesh>
          {isEvening && <pointLight color="#FFE1A8" intensity={1.15} distance={5.8} decay={1.8} position={[0, -0.2, 0]} />}
        </group>
      ))}

      {porchDownlights.map((pos, idx) => (
        <group key={`porch-dl-${idx}`} position={pos}>
          <mesh material={materials.downlightLens}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
          </mesh>
          {isEvening && <pointLight color="#FFE4B5" intensity={0.95} distance={4.8} decay={1.8} position={[0, -0.2, 0]} />}
        </group>
      ))}

      {/* 7. WARM INTERIOR GLOW */}
      {isEvening && (
        <>
          <pointLight color="#FFD699" intensity={1.8} distance={8.0} decay={1.8} position={[2.8, 1.8, 0.0]} />
          <pointLight color="#FFE0B2" intensity={1.1} distance={5.0} decay={2} position={[0.2, 1.6, 1.2]} />
        </>
      )}

      {/* 8. BAMBOO LANDSCAPING */}
      <mesh position={[7.3, 0.25, -0.8]} material={materials.foundationPlinth} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.5, 12.0]} />
      </mesh>
      {isEvening && (
        <pointLight color="#FFE2B8" intensity={0.8} distance={4.5} decay={2} position={[7.3, 0.6, 0]} />
      )}

      {bambooStalks.map(([x, z, h], i) => (
        <group key={`bamboo-${i}`} position={[x, 0.45, z]}>
          <mesh material={materials.bambooStalk} castShadow>
            <cylinderGeometry args={[0.035, 0.045, h, 8]} />
          </mesh>
          <mesh position={[0, h * 0.45, 0]} material={materials.bambooLeaves}>
            <sphereGeometry args={[0.26 + Math.sin(i) * 0.06, 6, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
