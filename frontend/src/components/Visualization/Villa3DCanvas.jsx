"use client";

import React, { useRef, useEffect, useState, useMemo, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, Grid } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import ArchitecturalVilla from "./ArchitecturalVilla";
import CutawayFloorPlan from "./CutawayFloorPlan";
import EngineeringBIMView from "./EngineeringBIMView";

/**
 * AutoFramingController
 * Automatically calculates the 3D model's bounding box and smoothly positions
 * the camera to fit the building into ~75-80% of the canvas.
 */
function AutoFramingController({
  modelGroupRef,
  targetPos,
  targetLookAt,
  autoRotate,
  viewPreset,
  floorCount,
  buildingType,
  styleMode,
  isExploded,
}) {
  const { camera, size: canvasSize } = useThree();
  const controlsRef = useRef();
  const isTransitioningRef = useRef(false);
  const targetCamPosRef = useRef(new THREE.Vector3(12, 10, 12));
  const targetCenterRef = useRef(new THREE.Vector3(0, 1.5, 0));

  // Compute bounding box and framing vector
  const computeFraming = (mode = viewPreset || "iso") => {
    if (!modelGroupRef.current) return;

    const box = new THREE.Box3().setFromObject(modelGroupRef.current);
    if (box.isEmpty()) {
      // Fallback based on floor count if bounding box not yet ready
      const h = Math.max(1, floorCount) * (isExploded ? 6.5 : 3.1);
      box.min.set(-8, 0, -6);
      box.max.set(8, h + 1, 6);
    }

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 6.0);
    const fovRad = (camera.fov * Math.PI) / 180;
    // Fit factor for ~75% viewport fill
    const aspect = canvasSize.width / (canvasSize.height || 1);
    const dist = ((maxDim / 2) / Math.sin(fovRad / 2)) * (aspect < 1.0 ? 1.35 : 1.08);

    targetCenterRef.current.copy(center);

    if (mode === "front") {
      targetCamPosRef.current.set(center.x, center.y + dist * 0.12, center.z + dist * 0.95);
    } else if (mode === "top") {
      targetCamPosRef.current.set(center.x + 0.001, center.y + dist * 1.15, center.z);
    } else if (mode === "side") {
      targetCamPosRef.current.set(center.x + dist * 0.95, center.y + dist * 0.12, center.z);
    } else if (mode === "corner") {
      targetCamPosRef.current.set(center.x - dist * 0.65, center.y + dist * 0.45, center.z + dist * 0.65);
    } else {
      // Default: Isometric perspective
      targetCamPosRef.current.set(
        center.x + dist * 0.68,
        center.y + dist * 0.55,
        center.z + dist * 0.68
      );
    }

    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 1200);
  };

  // Re-frame whenever floor count, building type, style mode, isExploded, or preset changes
  useEffect(() => {
    const timer = setTimeout(() => {
      computeFraming(viewPreset);
    }, 140);
    return () => clearTimeout(timer);
  }, [floorCount, buildingType, styleMode, viewPreset, isExploded]);

  // Handle explicit custom focus target (e.g. from component selection)
  useEffect(() => {
    if (targetPos && targetLookAt) {
      targetCamPosRef.current.set(targetPos[0], targetPos[1], targetPos[2]);
      targetCenterRef.current.set(targetLookAt[0], targetLookAt[1], targetLookAt[2]);
      isTransitioningRef.current = true;
      const timer = setTimeout(() => {
        isTransitioningRef.current = false;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [targetPos, targetLookAt]);

  // Smooth lerp in useFrame
  useFrame(() => {
    if (isTransitioningRef.current) {
      camera.position.lerp(targetCamPosRef.current, 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetCenterRef.current, 0.08);
        controlsRef.current.update();
      }
    } else if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={2.0}
      maxDistance={95}
    />
  );
}

/**
 * Sri Lanka Geographic Solar Angle & Lighting Parameters Engine (~6.9° N Latitude)
 */
function calculateSunParams(hour = 12.0) {
  const isNight = hour < 5.75 || hour > 18.25;
  const clampedHour = Math.max(6.0, Math.min(18.0, hour));
  const progress = (clampedHour - 6.0) / 12.0; // 0 to 1
  const theta = progress * Math.PI; // 0 (East) to PI (West)
  
  const sunX = -Math.cos(theta) * 46;
  const sunY = Math.sin(theta) * 42;
  const sunZ = Math.sin(theta) * 16 + 8; // southern tropical bias

  // Solar elevation angle in degrees
  const elevationDeg = Math.round(Math.sin(theta) * 84);
  // Azimuth angle from North (0° = North, 90° = East, 180° = South, 270° = West)
  const azimuthDeg = Math.round(90 + progress * 180);

  // Passive roof overhang shading effectiveness index (%)
  const shadingCoveragePct = elevationDeg > 60 ? 94 : Math.round(55 + (elevationDeg / 60) * 39);

  // Color temperature & intensity
  let lightColor = "#FFF8ED";
  let intensity = 1.45;
  let skyTurbidity = 0.1;
  let skyRayleigh = 0.5;

  if (isNight) {
    lightColor = "#64748B";
    intensity = 0.25;
    skyRayleigh = 3.5;
  } else if (progress < 0.2) { // 6am - 8:30am Warm Sunrise
    lightColor = "#FFAA5A";
    intensity = 0.85 + progress * 2.5;
    skyRayleigh = 2.2;
  } else if (progress > 0.8) { // 3:30pm - 6pm Golden Sunset
    lightColor = "#FF8A48";
    intensity = 1.4 - (progress - 0.8) * 3.5;
    skyRayleigh = 2.8;
  } else { // Midday Bright Tropical Sunlight
    lightColor = "#FFFDF9";
    intensity = 1.55;
    skyRayleigh = 0.45;
  }

  return {
    sunPosition: [sunX, Math.max(0.5, sunY), sunZ],
    elevationDeg,
    azimuthDeg,
    shadingCoveragePct,
    lightColor,
    intensity,
    isNight,
    skyTurbidity,
    skyRayleigh,
  };
}

/**
 * Snapshot Canvas Bridge to safely download high-resolution WebGL screenshots
 */
function SnapshotCanvasBridge({ onRegisterSnapshot }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (onRegisterSnapshot) {
      onRegisterSnapshot(() => {
        try {
          gl.render(scene, camera);
          const dataUrl = gl.domElement.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `GreenConstructAI_3D_Studio_${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          return true;
        } catch (err) {
          console.error("Failed to capture 3D canvas snapshot:", err);
          return false;
        }
      });
    }
  }, [gl, scene, camera, onRegisterSnapshot]);
  return null;
}

export default function Villa3DCanvas({
  floorCount = 2,
  buildingType = "Residential",
  structuralSystem = "Concrete Frame (SLS 614)",
  styleMode = "cutaway", // "cutaway" | "architectural" | "engineering" | "full3d"
  focusMode = "all",     // "rooms" | "components" | "structure" | "materials" | "all"
  specMode = "eco",      // "eco" | "baseline"
  sunHour = 12.0,        // 6.0 to 18.0
  showGhostEnvelope = false,
  isExploded = false,
  isEvening = false,
  isXray = false,
  isAutoRotating = false,
  showHotspots = true,
  showFurniture = true,
  showDimensions = true,
  isolatedFloor = "all", // "all" | 1 | 2 | 3 ...
  floorsData = [],
  selectedRoomId = null,
  selectedComponentId = null,
  highlightedComponent = null,
  activeMaterials,
  activePreset,
  viewPreset = "iso", // "iso" | "front" | "top" | "side"
  detectedIssues = [],
  blueprintData = null,
  onSelectRoom,
  onSelectComponent,
  onRegisterSnapshot,
}) {
  const modelGroupRef = useRef();
  const isEngineering = styleMode === "engineering";
  const isCutaway = styleMode === "cutaway";
  const floors = Math.max(1, parseInt(floorCount, 10) || 2);

  // Dynamic Sun calculation
  const sunParams = useMemo(() => {
    return calculateSunParams(isEvening ? 18.5 : sunHour);
  }, [sunHour, isEvening]);

  // Custom position/lookAt if an inspector component or room is actively focused
  const targetPos = activePreset?.pos ? activePreset.pos : null;
  const targetLookAt = activePreset?.target ? activePreset.target : null;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: isEvening ? 1.08 : (isEngineering ? 1.15 : 1.25),
        powerPreference: "high-performance",
      }}
      camera={{
        position: [14, 12, 14],
        fov: 40,
        near: 0.1,
        far: 400,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <SnapshotCanvasBridge onRegisterSnapshot={onRegisterSnapshot} />

      {/* ── Lighting & Atmosphere Environment ──────────────────────────── */}
      {isEngineering ? (
        // Engineering technical blueprint CAD background
        <>
          <color attach="background" args={["#030712"]} />
          <ambientLight intensity={0.48} color="#38BDF8" />
          <directionalLight
            castShadow
            position={[16, 28, 16]}
            intensity={1.25}
            color="#FFFFFF"
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-8, 4, 6]} intensity={1.4} color="#F59E0B" distance={30} />
          <pointLight position={[8, 4, -6]} intensity={1.4} color="#38BDF8" distance={30} />
          <Grid
            renderOrder={-1}
            position={[0, -0.05, 0]}
            infiniteGrid
            cellSize={0.8}
            cellThickness={0.7}
            cellColor="#1E3A5F"
            sectionSize={4.0}
            sectionThickness={1.4}
            sectionColor="#38BDF8"
            fadeDistance={55}
          />
        </>
      ) : isCutaway ? (
        // Cutaway clean architectural studio lighting with dynamic solar position
        <>
          <color attach="background" args={[sunParams.isNight ? "#0B0F19" : "#F1F5F9"]} />
          <ambientLight intensity={sunParams.isNight ? 0.45 : 0.78} color={sunParams.isNight ? "#FFE6C2" : "#FFFFFF"} />
          <directionalLight
            castShadow
            position={sunParams.sunPosition}
            intensity={sunParams.intensity}
            color={sunParams.lightColor}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={90}
            shadow-camera-left={-18}
            shadow-camera-right={18}
            shadow-camera-top={18}
            shadow-camera-bottom={-18}
          />
          <hemisphereLight
            intensity={sunParams.isNight ? 0.35 : 0.52}
            color={sunParams.lightColor}
            groundColor={sunParams.isNight ? "#1B1813" : "#E2E8F0"}
          />
          <pointLight position={[0, 2.5, 0]} intensity={sunParams.isNight ? 1.0 : 0.35} color="#FFBA60" distance={12} />
        </>
      ) : sunParams.isNight ? (
        // Architectural / Full 3D Evening Atmosphere
        <>
          <color attach="background" args={["#080C18"]} />
          <fog attach="fog" args={["#080C18", 40, 130]} />
          <ambientLight intensity={0.35} color="#364A66" />
          <directionalLight
            castShadow
            position={sunParams.sunPosition}
            intensity={0.65}
            color="#94B7E8"
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <hemisphereLight intensity={0.24} color="#4A6587" groundColor="#1A1F28" />
        </>
      ) : (
        // Architectural / Full 3D Dynamic Solar Atmosphere
        <>
          <Sky
            sunPosition={sunParams.sunPosition}
            turbidity={sunParams.skyTurbidity}
            rayleigh={sunParams.skyRayleigh}
            mieCoefficient={0.005}
            mieDirectionalG={0.82}
          />
          <ambientLight intensity={0.68} color="#FFFFFF" />
          <directionalLight
            castShadow
            position={sunParams.sunPosition}
            intensity={sunParams.intensity}
            color={sunParams.lightColor}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <hemisphereLight intensity={0.45} color="#EDF4FA" groundColor="#E5DFD7" />
        </>
      )}

      {/* ── Auto-Framing Bounding Box Camera Controller ───────────────── */}
      <AutoFramingController
        modelGroupRef={modelGroupRef}
        targetPos={targetPos}
        targetLookAt={targetLookAt}
        autoRotate={isAutoRotating}
        viewPreset={viewPreset}
        floorCount={floors}
        buildingType={buildingType}
        styleMode={styleMode}
        isExploded={isExploded}
      />

      {/* ── Post-Processing Bloom ────────────────────────────────────── */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={sunParams.isNight || isEngineering ? 0.55 : 0.88}
          luminanceSmoothing={0.4}
          intensity={sunParams.isNight ? 1.0 : (isEngineering ? 0.7 : 0.3)}
        />
      </EffectComposer>

      {/* ── Model Root Group for Dynamic Bounding Box Measurement ─────── */}
      <group ref={modelGroupRef}>
        {styleMode === "cutaway" && (
          <CutawayFloorPlan
            floorsData={floorsData}
            floorCount={floors}
            buildingType={buildingType}
            isEvening={sunParams.isNight}
            isXray={isXray}
            specMode={specMode}
            showGhostEnvelope={showGhostEnvelope}
            showHotspots={showHotspots}
            showFurniture={showFurniture}
            showDimensions={showDimensions}
            isolatedFloor={isolatedFloor}
            isExploded={isExploded}
            focusMode={focusMode}
            viewPreset={viewPreset}
            selectedRoomId={selectedRoomId}
            selectedComponentId={selectedComponentId}
            highlightedComponent={highlightedComponent}
            activeMaterials={activeMaterials}
            onSelectRoom={onSelectRoom}
            onSelectComponent={onSelectComponent}
          />
        )}

        {styleMode === "engineering" && (
          <EngineeringBIMView
            floorCount={floors}
            buildingType={buildingType}
            structuralSystem={structuralSystem}
            activeMaterials={activeMaterials}
            showHotspots={showHotspots}
            showDimensions={showDimensions}
            isolatedFloor={isolatedFloor}
            selectedComponentId={selectedComponentId}
            highlightedComponent={highlightedComponent}
            detectedIssues={detectedIssues}
            onSelectComponent={onSelectComponent}
          />
        )}

        {(styleMode === "architectural" || styleMode === "full3d") && (
          <ArchitecturalVilla
            floorCount={floors}
            buildingType={buildingType}
            isEvening={sunParams.isNight}
            isXray={isXray}
            specMode={specMode}
            isolatedFloor={isolatedFloor}
            selectedComponentId={selectedComponentId}
            highlightedComponent={highlightedComponent}
            activeMaterials={activeMaterials}
            onSelectComponent={onSelectComponent}
          />
        )}
      </group>
    </Canvas>
  );
}
