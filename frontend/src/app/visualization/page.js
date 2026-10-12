"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useVisualizationData } from "@/components/Visualization/useVisualizationData";
import Header from "@/components/Header";
import MaterialSubNav from "@/components/Materials/MaterialSubNav";

// Dynamic import of the 3D canvas so WebGL only loads on client
const Villa3DCanvas = dynamic(() => import("@/components/Visualization/Villa3DCanvas"), {
  ssr: false,
  loading: () => (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#FAF7F0",
      color: "#143825", fontFamily: "'Space Grotesk', sans-serif",
      gap: "16px",
    }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "50%",
        border: "3px solid #E2DCD0",
        borderTopColor: "#143825",
        animation: "spin 0.9s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", color: "#143825" }}>
        Loading 3D Material Specification BIM Model…
      </p>
    </div>
  ),
});

// Dynamic import of 2D Space Planner canvas
const SpacePlannerCanvas = dynamic(() => import("@/components/Visualization/SpacePlannerCanvas"), {
  ssr: false,
});

// Presentation Style Modes
export const STYLE_MODES = [
  {
    id: "cutaway",
    label: "Cutaway Plan",
    badge: "SPATIAL",
    desc: "Isometric cutaway floor plan — room zones, structural bays & material finishes",
  },
  {
    id: "architectural",
    label: "Architectural",
    badge: "FACADE",
    desc: "Architectural visualization — building envelope, glazing apertures & finishes",
  },
  {
    id: "engineering",
    label: "Engineering",
    badge: "BIM",
    desc: "RC structural frame, column load paths & preliminary SLS 614 deflection assessment",
  },
  {
    id: "full3d",
    label: "Full 3D",
    badge: "MASSING",
    desc: "Parametric building massing, roof cantilevers & site orientation",
  },
];

export default function VisualizationPage() {
  const {
    buildingType,
    floorCount,
    totalFloorArea,
    location,
    climateZone,
    structuralSystem,
    isBlueprintDerived,
    geometrySource,
    visualizationStatus,
    contextStatus,
    editProjectUrl,
    floorsData,
    allRooms,
    questionnaireInputs,
    activeMaterials,
    quantities,
    componentsList,
    detectedIssues,
    researchTrace,
    specComparison,
    rawBlueprint,
  } = useVisualizationData();

  const [mounted, setMounted] = useState(false);
  const [styleMode, setStyleMode] = useState("cutaway"); // "cutaway" | "architectural" | "engineering" | "full3d"
  const [focusMode, setFocusMode] = useState("rooms");   // "rooms" | "furniture" | "components" | "structure" | "materials" | "all"
  const [viewPreset, setViewPreset] = useState("iso");   // "iso" | "front" | "top" | "side"
  const [isExploded, setIsExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [isEvening, setIsEvening] = useState(false);
  const [isXray, setIsXray] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [isolatedFloor, setIsolatedFloor] = useState("all"); // "all" | 1 | 2 | 3 ...
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [researchTraceOpen, setResearchTraceOpen] = useState(false);
  const [activeTraceStage, setActiveTraceStage] = useState(4); // Default to Stage 5 (3D Representation)

  // ── Studio Features ──────────────────────────────────────────────────
  const [specMode, setSpecMode] = useState("eco"); // "eco" | "baseline"
  const [showGhostEnvelope, setShowGhostEnvelope] = useState(false);
  const [sunHour, setSunHour] = useState(12.0); // 6.0 to 18.0
  const [isSunPlaying, setIsSunPlaying] = useState(false);
  const [snapshotToast, setSnapshotToast] = useState(null);

  const snapshotTriggerRef = useRef(null);

  // Sidebars (Collapsible for Clean Viewport)
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [collapsedFloors, setCollapsedFloors] = useState({});
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  // Selection states
  const [selectedComp, setSelectedComp] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [inspectorTab, setInspectorTab] = useState("room"); // "room" | "eco_delta" | "furniture" | "component"
  const [activePreset, setActivePreset] = useState(null);

  // ── Space Planner & View Layout State (3d | split | 2d) ───────────────
  const [layoutView, setLayoutView] = useState("3d");
  const [customFloors, setCustomFloors] = useState(null);

  useEffect(() => {
    if (floorsData && floorsData.length > 0 && !customFloors) {
      setCustomFloors(floorsData);
    }
  }, [floorsData, customFloors]);

  const displayFloors = customFloors || floorsData || [];

  const handleUpdateRooms = useCallback((floorLevel, updatedRooms) => {
    setCustomFloors((prev) => {
      const current = prev || floorsData || [];
      return current.map((fl) => {
        if (fl.level === floorLevel) {
          const totalArea = Math.round(updatedRooms.reduce((sum, r) => sum + (r.area || 0), 0) * 10) / 10;
          return {
            ...fl,
            rooms: updatedRooms,
            floorArea: totalArea,
          };
        }
        return fl;
      });
    });
  }, [floorsData]);

  const bType = (buildingType || "").toLowerCase();
  const isHotel = bType.includes("hotel") || bType.includes("resort") || bType.includes("hospitality");
  const isCommercial = bType.includes("commercial") || bType.includes("office") || bType.includes("retail") || bType.includes("mixed");
  const isIndustrial = bType.includes("industrial") || bType.includes("warehouse") || bType.includes("factory") || bType.includes("logistics");
  const isHealthcare = bType.includes("health") || bType.includes("hospital") || bType.includes("clinic") || bType.includes("medical");

  const buildingWidth = isIndustrial ? 18.0 : isHotel ? 16.4 : isCommercial ? 15.0 : isHealthcare ? 16.5 : 14.8;
  const buildingDepth = isIndustrial ? 12.0 : isHotel ? 13.2 : isCommercial ? 12.0 : isHealthcare ? 12.5 : 11.2;

  // Automatic Solar Simulation Animation Loop
  useEffect(() => {
    if (!isSunPlaying) return;
    const interval = setInterval(() => {
      setSunHour((prev) => {
        const next = prev + 0.15;
        return next > 18.0 ? 6.0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSunPlaying]);

  useEffect(() => {
    setMounted(true);
    if (allRooms && allRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(allRooms[0]);
    }
    if (componentsList && componentsList.length > 0 && !selectedComp) {
      setSelectedComp(componentsList[0]);
    }
  }, [allRooms, componentsList]);

  // Solar dynamic computations for Sri Lanka (~6.9°N)
  const solarHUD = useMemo(() => {
    const isNight = sunHour < 5.75 || sunHour > 18.25;
    const clamped = Math.max(6.0, Math.min(18.0, sunHour));
    const progress = (clamped - 6.0) / 12.0;
    const theta = progress * Math.PI;
    const elevation = Math.round(Math.sin(theta) * 84);
    const azimuth = Math.round(90 + progress * 180);
    const shadingPct = elevation > 60 ? 94 : Math.round(55 + (elevation / 60) * 39);

    const h = Math.floor(sunHour);
    const m = Math.round((sunHour - h) * 60);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const timeStr = `${displayH}:${m < 10 ? "0" : ""}${m} ${ampm}`;

    return {
      timeStr,
      elevation,
      azimuth,
      shadingPct,
      isNight,
    };
  }, [sunHour]);

  // Handle room selection from 3D scene or Room List
  const handleSelectRoom = useCallback((room, cameraPos, cameraTarget) => {
    setSelectedRoom(room);
    setInspectorTab("room");
    setInspectorOpen(true);
    if (cameraPos && cameraTarget) {
      setActivePreset({
        id: `room_${room.id}`,
        label: room.name,
        pos: cameraPos,
        target: cameraTarget,
      });
    }
  }, []);

  // "Step Inside" Eye-Level Room Inspection
  const handleStepInsideRoom = useCallback((room) => {
    const targetRoom = room || selectedRoom;
    if (!targetRoom) return;
    const rx = targetRoom.position?.x || 0;
    const ry = (targetRoom.floor - 1) * 3.1 + 1.55; // 1.55m eye height
    const rz = targetRoom.position?.z || 0;
    setActivePreset({
      id: `eye_${targetRoom.id}`,
      label: `Eye-Level: ${targetRoom.name}`,
      pos: [rx, ry, rz + 0.9],
      target: [rx, ry, rz - 1.8],
    });
  }, [selectedRoom]);

  // High-Resolution Snapshot Capture
  const handleCaptureSnapshot = useCallback(() => {
    if (snapshotTriggerRef.current) {
      const ok = snapshotTriggerRef.current();
      if (ok !== false) {
        setSnapshotToast("HD 3D Viewport Render Downloaded Successfully!");
        setTimeout(() => setSnapshotToast(null), 3000);
      }
    }
  }, []);

  // Handle component selection from Palette, Inspector, or 3D Hotspot
  const handleSelectComponent = useCallback((comp, cameraPos, cameraTarget) => {
    setSelectedComp(comp);
    setInspectorTab("component");
    setInspectorOpen(true);
    if (cameraPos && cameraTarget) {
      setActivePreset({
        id: `focus_${comp.id}`,
        label: comp.name,
        pos: cameraPos,
        target: cameraTarget,
      });
    } else {
      setActivePreset(null);
    }
  }, []);

  const handleStyleChange = (modeId) => {
    setStyleMode(modeId);
    if (modeId === "engineering") {
      setIsEvening(false);
      setIsXray(false);
    } else if (modeId === "architectural") {
      setIsEvening(false);
    }
  };

  const handleResetCamera = () => {
    setActivePreset(null);
    setViewPreset("iso");
  };

  // Toggle Floor Accordion
  const toggleFloorCollapse = (floorLevel) => {
    setCollapsedFloors(prev => ({
      ...prev,
      [floorLevel]: !prev[floorLevel]
    }));
  };

  // Filtered rooms based on search query
  const filteredFloors = useMemo(() => {
    if (!displayFloors || displayFloors.length === 0) return [];
    if (!roomSearchQuery.trim()) return displayFloors;

    const q = roomSearchQuery.toLowerCase();
    return displayFloors.map(floor => ({
      ...floor,
      rooms: (floor.rooms || []).filter(r =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.function || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q)
      )
    })).filter(floor => floor.rooms.length > 0);
  }, [displayFloors, roomSearchQuery]);

  // Total count of all rooms
  const totalRoomsCount = useMemo(() => {
    if (!displayFloors) return 0;
    return displayFloors.reduce((acc, f) => acc + (f.rooms?.length || 0), 0);
  }, [displayFloors]);

  // Interactive 7-Stage Viva Decision Trace Pipeline
  const vivaPipelineStages = useMemo(() => {
    return [
      {
        id: "questionnaire",
        step: 1,
        title: "User Questionnaire Inputs",
        subtitle: "Spatial requirements & client constraints",
        status: "Ingested",
        details: [
          { label: "Building Typology", value: buildingType },
          { label: "Floor Count", value: `${floorCount} Stories` },
          { label: "Total Gross Area", value: `${totalFloorArea} m²` },
          { label: "Location / Province", value: `${location} (${climateZone})` },
          { label: "Structural System", value: structuralSystem },
          { label: "Bedrooms Required", value: questionnaireInputs?.bedrooms ?? 3 },
          { label: "Bathrooms Required", value: questionnaireInputs?.bathrooms ?? 2 },
          { label: "Cross-Ventilation Spec", value: questionnaireInputs?.crossVentilation ?? "Medium" },
          { label: "Daylighting Spec", value: questionnaireInputs?.naturalLight ?? "Medium" },
        ],
        influence: "Defines the parametric bounding envelope, room schedule, and base area allocations."
      },
      {
        id: "context",
        step: 2,
        title: "Project Context & Urban Bylaws",
        subtitle: "Sri Lankan regulatory zoning parameters",
        status: "Evaluated",
        details: [
          { label: "Regulatory Code", value: "UDA Planning & Building Regulations No. 41" },
          { label: "Setback Mandate", value: "Min 1.0m side setback, 3.0m street frontage" },
          { label: "Maximum Site Coverage", value: "65% allowable plinth coverage" },
          { label: "Floor Area Ratio (FAR)", value: `${(totalFloorArea / (totalFloorArea * 0.65)).toFixed(2)}` },
          { label: "Ventilation Ratio", value: ">= 15% clear aperture for habitable spaces" },
        ],
        influence: "Establishes boundary clearances and minimum opening ratios for Sri Lankan tropical compliance."
      },
      {
        id: "blueprint",
        step: 3,
        title: "Blueprint Geometry & CAD Analysis",
        subtitle: "Vision-based boundary and opening detection",
        status: isBlueprintDerived ? "Extracted" : "Parametric Inference",
        details: [
          { label: "Extraction Source", value: geometrySource },
          { label: "Analyzed Floors", value: `${floorsData?.length || floorCount} Levels` },
          { label: "Detected Space Zones", value: `${allRooms?.length || 0} Functional Rooms` },
          { label: "Detected Openings", value: `${quantities?.door_count || 4} Doors, ${Math.round(quantities?.window_area || 25)} m² Windows` },
          { label: "Regulatory Issues", value: `${detectedIssues?.length || 0} Compliance Checks Evaluated` },
        ],
        influence: isBlueprintDerived 
          ? "Uses detected CAD wall vectors and opening schedules directly."
          : "Generates non-overlapping spatial boundaries fitted to questionnaire parameters."
      },
      {
        id: "spatial",
        step: 4,
        title: "Spatial & Furniture Allocation",
        subtitle: "Room schedule, dimensional layout & furniture rules",
        status: "Synthesized",
        details: [
          { label: "Ground Floor Spaces", value: floorsData?.[0]?.rooms?.map(r => r.name).join(", ") || "Living Room, Dining Area, Kitchen" },
          { label: "Upper Floor Spaces", value: floorsData?.[1]?.rooms?.map(r => r.name).join(", ") || "Master Bedroom, Bedroom 2, Bathroom" },
          { label: "Circulation Factor", value: "15% - 20% dedicated internal circulation" },
          { label: "Average Room Height", value: "2.85m clear internal datum" },
        ],
        influence: "Produces exact 3D coordinates (X, Y, Z) and dimensional bounds for each room pod."
      },
      {
        id: "model3d",
        step: 5,
        title: "3D Representation",
        subtitle: "Parametric mesh, room zoning & dollhouse cutaway",
        status: "Current Stage",
        details: [
          { label: "Style Presentation", value: `${styleMode.toUpperCase()} Cutaway View` },
          { label: "PBR Material Binding", value: "Three.js physically-based standard materials" },
          { label: "Lighting Simulation", value: isEvening ? "Evening Golden Hour (3200K)" : "Daylight Solar Azimuth (5800K)" },
          { label: "Dynamic View Modes", value: "Focus filtering, Exploded Floor offsets & Room tagging" },
        ],
        influence: "Delivers interactive WebGL visualization connected to recommendation engine data."
      },
      {
        id: "engineering",
        step: 6,
        title: "Engineering & SLS Rule Check",
        subtitle: "Structural rules, column load paths & deflection limits",
        status: "Preliminary Check Passed",
        details: [
          { label: "Design Code", value: "SLS 614: Structural Concrete Standard" },
          { label: "Span-to-Depth Ratio", value: "L/24 allowable span limit verified" },
          { label: "Deflection Limit", value: "L / 360 span threshold SLS-referenced rule check passed" },
          { label: "Concrete Grade", value: "Grade 25 / 30 RC elements (SLS 107 / SLS 1181)" },
          { label: "Reinforcement Steel", value: "500 MPa high-yield deformed bars (SLS 375)" },
        ],
        influence: "Validates grid spans, framing elements, and structural suitability."
      },
      {
        id: "materials",
        step: 7,
        title: "Material Intelligence & Ranking",
        subtitle: "Hybrid MCDM + ML, LCA embodied carbon & PBR binding",
        status: "Optimized",
        details: [
          { label: "Ranking Model", value: "TOPSIS + PROMETHEE-II + Random Forest Classifier" },
          { label: "Evaluated Criteria", value: "Structural Strength, Thermal Resistance, Local Cost, Carbon Footprint" },
          { label: "Top Wall Material", value: activeMaterials?.wall?.material || "Wire-Cut Clay Brick" },
          { label: "Top Floor Material", value: activeMaterials?.floor?.material || "Polished Porcelain Tiles" },
        ],
        influence: "Selects optimal Sri Lankan materials and binds textures to the 3D model."
      },
    ];
  }, [buildingType, floorCount, totalFloorArea, location, climateZone, structuralSystem, questionnaireInputs, isBlueprintDerived, geometrySource, floorsData, allRooms, quantities, detectedIssues, styleMode, isEvening, activeMaterials]);

  // Glassmorphism styling helper
  const glassStyle = {
    background: "#FFFFFF",
    backdropFilter: "blur(16px)",
    border: "1px solid #E2DCD0",
    boxShadow: "0 8px 30px rgba(23, 58, 43, 0.08)",
    color: "#143825",
  };

  if (!mounted) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, #111827 0%, #060810 100%)",
        color: "#94A3B8",
        fontFamily: "'Space Grotesk', sans-serif",
        gap: "16px",
        zIndex: 100,
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid rgba(56, 189, 248, 0.2)",
          borderTopColor: "#38BDF8",
          animation: "spin 0.9s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em" }}>
          Initializing 3D Decision-Support Studio…
        </p>
      </div>
    );
  }

  return (
    <div className="arch-page-canvas" style={{ background: "#FAF7F0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <MaterialSubNav />

      {/* ── Main Studio Viewport ── */}
      <div style={{
        position: "relative",
        flex: 1,
        width: "100%",
        height: "calc(100vh - 125px)",
        minHeight: "680px",
        overflow: "hidden",
        background: "#EAE6DD",
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: "#143825",
        userSelect: "none",
      }}>
        {/* ── 1. SINGLE STREAMLINED TOP NAVIGATION HEADER (52px) ─────────────── */}
        <header style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: "52px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2DCD0",
          background: "rgba(251, 249, 244, 0.96)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 2px 8px rgba(23, 58, 43, 0.04)",
        }}>
        {/* Left: Brand Logo & Context Summary Badge & View Mode Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "4px",
              background: "#143825",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FCFAF6" strokeWidth="2.2">
                <path d="M11 20A7 7 0 0 1 4 13C4 7 11 2 20 2c0 9-5 16-12 17a8 8 0 0 1-5 1" />
                <path d="M2 21c0-4 3-7 7-7" />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 900, color: "#143825", fontFamily: "Space Grotesk", letterSpacing: "0.02em" }}>
                GREENCONSTRUCT<span style={{ color: "#B85C43" }}>AI</span>
              </span>
              <span style={{
                fontSize: "9px",
                padding: "2px 6px",
                borderRadius: "3px",
                background: "#EFECE4",
                border: "1px solid #E2DCD0",
                color: "#143825",
                fontWeight: 700,
                fontFamily: "Space Grotesk",
              }}>
                3D BIM MODEL · {buildingType}
              </span>
            </div>
          </Link>

          {/* View Layout Selector (Sleek segmented switcher) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            background: "#FFFFFF",
            padding: "2px 3px",
            borderRadius: "8px",
            border: "1px solid #E2DCD0",
            marginLeft: "6px",
          }}>
            {[
              { id: "3d", label: "3D", icon: "🌐" },
              { id: "split", label: "Split", icon: "⚡" },
              { id: "2d", label: "Planner", icon: "📐" },
            ].map((layout) => {
              const isAct = layoutView === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => {
                    setLayoutView(layout.id);
                    if (layout.id === "split" || layout.id === "2d") {
                      setLeftSidebarOpen(false);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    padding: "3px 8px",
                    borderRadius: "5px",
                    background: isAct ? "#143825" : "transparent",
                    border: isAct ? "1px solid #143825" : "1px solid transparent",
                    color: isAct ? "#FFFFFF" : "#687068",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{layout.icon}</span>
                  <span>{layout.label}</span>
                </button>
              );
            })}
          </div>

          {/* Spaces Sidebar Docked Header Toggle */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            id="btn-toggle-spaces"
            title={leftSidebarOpen ? "Hide Spaces Directory" : "Show Spaces Directory"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "6px",
              background: leftSidebarOpen ? "#143825" : "#FFFFFF",
              border: "1px solid #E2DCD0",
              color: leftSidebarOpen ? "#FFFFFF" : "#143825",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span>🚪 Spaces</span>
            <span style={{
              fontSize: "9px",
              padding: "1px 4px",
              borderRadius: "3px",
              background: leftSidebarOpen ? "rgba(255, 255, 255, 0.2)" : "#EFECE4",
              color: leftSidebarOpen ? "#FFFFFF" : "#143825",
              fontFamily: "monospace",
            }}>
              {totalRoomsCount}
            </span>
          </button>
        </div>

        {/* Center: 3D Presentation Style Mode Pills (Hidden in 2D Space Planner mode) */}
        {layoutView !== "2d" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            background: "#FFFFFF",
            padding: "2px 3px",
            borderRadius: "8px",
            border: "1px solid #E2DCD0",
            flexShrink: 0,
          }}>
            {STYLE_MODES.map((mode) => {
              const isActive = styleMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleStyleChange(mode.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: layoutView === "split" ? "4px 8px" : "4px 10px",
                    borderRadius: "6px",
                    background: isActive ? "#143825" : "transparent",
                    border: isActive ? "1px solid #143825" : "1px solid transparent",
                    color: isActive ? "#FFFFFF" : "#687068",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{mode.label}</span>
                  {mode.badge && layoutView !== "split" && (
                    <span style={{
                      fontSize: "8px",
                      padding: "1px 3px",
                      borderRadius: "3px",
                      background: isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.05)",
                      color: isActive ? "#ECFDF5" : "#64748B",
                      fontFamily: "monospace",
                    }}>
                      {mode.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Spec Mode Toggle + Essential Tools */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, whiteSpace: "nowrap" }}>
          {/* A/B Spec Mode Toggle Button */}
          <button
            onClick={() => setSpecMode(specMode === "eco" ? "baseline" : "eco")}
            title="Toggle between AI Recommended Green Materials and Standard Baseline Construction"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 8px",
              borderRadius: "6px",
              background: specMode === "eco"
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.22) 100%)"
                : "rgba(245, 158, 11, 0.18)",
              border: `1px solid ${specMode === "eco" ? "#10B981" : "#F59E0B"}`,
              color: specMode === "eco" ? "#34D399" : "#FBBF24",
              fontSize: "10px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <span>{specMode === "eco" ? "🌱 AI Eco" : "🏛️ Baseline"}</span>
            <span style={{
              fontSize: "9px",
              padding: "1px 3px",
              borderRadius: "3px",
              background: specMode === "eco" ? "rgba(16, 185, 129, 0.35)" : "rgba(245, 158, 11, 0.35)",
              color: "#FFFFFF",
              fontFamily: "monospace",
            }}>
              {specMode === "eco" ? "-38% CO₂" : "+38%"}
            </span>
          </button>

          {/* Quick 3D Controls: Ghost, Exploded, Labels (Hidden in 2D Space Planner mode) */}
          {styleMode === "cutaway" && layoutView !== "2d" && (
            <button
              onClick={() => setShowGhostEnvelope(!showGhostEnvelope)}
              title="Toggle Translucent Exterior Facade Envelope"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: showGhostEnvelope ? "#143825" : "#FFFFFF",
                border: "1px solid #E2DCD0",
                color: showGhostEnvelope ? "#FFFFFF" : "#143825",
                transition: "all 0.15s ease",
              }}
            >
              <span>👁️ Ghost</span>
              <span style={{
                fontSize: "9px",
                padding: "1px 4px",
                borderRadius: "3px",
                background: showGhostEnvelope ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.1)",
                color: showGhostEnvelope ? "#FFFFFF" : "#64748B",
                fontWeight: 800,
              }}>
                {showGhostEnvelope ? "ON" : "OFF"}
              </span>
            </button>
          )}

          {/* Exploded View Toggle */}
          {layoutView !== "2d" && (
            <button
              onClick={() => setIsExploded(!isExploded)}
              title="Toggle Exploded Multi-Story Separation"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: isExploded ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${isExploded ? "rgba(16, 185, 129, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                color: isExploded ? "#34D399" : "#94A3B8",
                transition: "all 0.15s ease",
              }}
            >
              <span>🏢 Exploded</span>
              <span style={{
                fontSize: "9px",
                padding: "1px 4px",
                borderRadius: "3px",
                background: isExploded ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)",
                color: isExploded ? "#FFFFFF" : "#64748B",
                fontWeight: 800,
              }}>
                {isExploded ? "ON" : "OFF"}
              </span>
            </button>
          )}

          {/* 3D Room Labels Toggle */}
          {layoutView !== "2d" && (
            <button
              onClick={() => setShowLabels(!showLabels)}
              title="Toggle 3D Floating Room Tags On/Off"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: showLabels ? "#143825" : "#FFFFFF",
                border: "1px solid #E2DCD0",
                color: showLabels ? "#FFFFFF" : "#143825",
                transition: "all 0.15s ease",
              }}
            >
              <span>🏷️ Labels</span>
              <span style={{
                fontSize: "9px",
                padding: "1px 4px",
                borderRadius: "3px",
                background: showLabels ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.1)",
                color: showLabels ? "#FFFFFF" : "#64748B",
                fontWeight: 800,
              }}>
                {showLabels ? "ON" : "OFF"}
              </span>
            </button>
          )}

          <div style={{ width: "1px", height: "18px", background: "rgba(255, 255, 255, 0.12)", margin: "0 2px" }} />

          <button
            onClick={() => setResearchTraceOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              borderRadius: "6px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              color: "#A5B4FC",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <span>🔬 Trace</span>
          </button>

          <button
            onClick={() => setMaterialsModalOpen(true)}
            id="btn-materials-specs"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34D399",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <span>✨ Materials</span>
          </button>

          {/* Inspector Panel Docked Header Toggle */}
          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            id="btn-toggle-inspector"
            title={inspectorOpen ? "Hide Inspector Panel" : "Show Inspector Panel"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              borderRadius: "6px",
              background: inspectorOpen ? "#143825" : "#FFFFFF",
              border: "1px solid #E2DCD0",
              color: inspectorOpen ? "#FFFFFF" : "#143825",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span>📊 Inspector</span>
          </button>

          <Link
            href="/materials/form"
            id="btn-edit-project"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#D5CEC1",
              fontSize: "11px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span>← Brief</span>
          </Link>

          <Link
            href="/materials/report"
            id="btn-view-report"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              borderRadius: "4px",
              background: "#143825",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FCFAF6",
              fontSize: "11px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span>Report ↗</span>
          </Link>
        </div>
      </header>

      {/* ── ARCHITECTURAL CUTAWAY STUDIO TOOLBAR DOCK ── */}
      {layoutView !== "2d" && (
        <div style={{
          position: "absolute",
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 38,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "5px 14px",
          borderRadius: "6px",
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(14px)",
          border: "1px solid #E2DCD0",
          boxShadow: "0 4px 18px rgba(23, 58, 43, 0.08)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "11px",
          color: "#143825",
        }}>
          {/* FOCUS */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "9px", color: "#8C9690", fontWeight: 700, letterSpacing: "0.10em" }}>FOCUS</span>
            {["rooms", "components", "structure", "materials", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFocusMode(f)}
                style={{
                  padding: "3px 7px",
                  borderRadius: "3px",
                  background: focusMode === f ? "#1A382B" : "transparent",
                  border: focusMode === f ? "1px solid #244C3B" : "1px solid transparent",
                  color: focusMode === f ? "#FFFFFF" : "#687068",
                  fontWeight: focusMode === f ? 800 : 600,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "14px", background: "rgba(255, 255, 255, 0.15)" }} />

          {/* FLOOR */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "9px", color: "#8C9690", fontWeight: 700, letterSpacing: "0.10em" }}>FLOOR</span>
            {["all", 1, 2, 3].slice(0, (floorCount || 2) + 1).map((fl) => (
              <button
                key={fl}
                onClick={() => setIsolatedFloor(fl)}
                style={{
                  padding: "3px 7px",
                  borderRadius: "3px",
                  background: isolatedFloor === fl ? "#1A382B" : "transparent",
                  border: isolatedFloor === fl ? "1px solid #244C3B" : "1px solid transparent",
                  color: isolatedFloor === fl ? "#FFFFFF" : "#687068",
                  fontWeight: isolatedFloor === fl ? 800 : 600,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {fl === "all" ? "ALL" : `0${fl}`}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "14px", background: "rgba(255, 255, 255, 0.15)" }} />

          {/* VIEW */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "9px", color: "#8C9690", fontWeight: 700, letterSpacing: "0.10em" }}>VIEW</span>
            {[
              { id: "iso", label: "ISOMETRIC" },
              { id: "front", label: "FRONT" },
              { id: "top", label: "TOP" },
              { id: "side", label: "SIDE" },
            ].map((vp) => (
              <button
                key={vp.id}
                onClick={() => setViewPreset(vp.id)}
                style={{
                  padding: "3px 7px",
                  borderRadius: "3px",
                  background: viewPreset === vp.id ? "#1A382B" : "transparent",
                  border: viewPreset === vp.id ? "1px solid #244C3B" : "1px solid transparent",
                  color: viewPreset === vp.id ? "#FFFFFF" : "#687068",
                  fontWeight: viewPreset === vp.id ? 800 : 600,
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                {vp.label}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "14px", background: "rgba(255, 255, 255, 0.15)" }} />

          {/* EXPLODE */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            style={{
              padding: "3px 8px",
              borderRadius: "3px",
              background: isExploded ? "#B8583B" : "transparent",
              border: isExploded ? "1px solid #D66E50" : "1px solid rgba(255, 255, 255, 0.18)",
              color: isExploded ? "#FFFFFF" : "#D6C7B2",
              fontWeight: 800,
              fontSize: "10px",
              letterSpacing: "0.06em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {isExploded ? "EXPLODED ON" : "EXPLODE"}
          </button>
        </div>
      )}

      {/* ── 2. COLLAPSIBLE LEFT ROOMS SIDEBAR ──────────────────────────────── */}
      <AnimatePresence>
        {leftSidebarOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "62px",
              left: "14px",
              bottom: "44px",
              width: "260px",
              zIndex: 35,
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              overflow: "hidden",
              ...glassStyle,
            }}
          >
            {/* Sidebar Header with Collapse Button */}
            <div style={{
              padding: "10px 12px",
              borderBottom: "1px solid #E2DCD0",
              background: "#FAF7F0",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#143825" }}>
                    Rooms Directory
                  </span>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: "8px",
                    background: "#EFECE4",
                    color: "#143825",
                    fontFamily: "monospace",
                  }}>
                    {totalRoomsCount}
                  </span>
                </div>
                <button
                  onClick={() => setLeftSidebarOpen(false)}
                  title="Collapse Rooms Panel"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: "2px 4px",
                  }}
                >
                  ◂
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "5px 8px 5px 26px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    color: "#F8FAFC",
                    fontSize: "11px",
                    outline: "none",
                  }}
                />
                <span style={{ position: "absolute", left: "8px", top: "6px", fontSize: "10px", color: "#64748B" }}>
                  🔍
                </span>
              </div>
            </div>

            {/* Scrollable Room List Grouped by Floor */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {filteredFloors.map((floor) => {
                const isCollapsed = collapsedFloors[floor.level];
                return (
                  <div key={`left-floor-${floor.level}`} style={{ marginBottom: "8px" }}>
                    <div
                      onClick={() => toggleFloorCollapse(floor.level)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "5px 8px",
                        borderRadius: "5px",
                        background: "rgba(255, 255, 255, 0.03)",
                        cursor: "pointer",
                        fontSize: "10px",
                        fontWeight: 800,
                        color: "#94A3B8",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ fontSize: "8px" }}>{isCollapsed ? "▶" : "▼"}</span>
                        <span>{floor.name ? floor.name.toUpperCase() : `FLOOR ${floor.level}`}</span>
                      </div>
                      <span style={{ fontSize: "9px", color: "#64748B", fontFamily: "monospace" }}>
                        {floor.rooms?.length || 0} spaces
                      </span>
                    </div>

                    {!isCollapsed && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "3px", paddingLeft: "4px" }}>
                        {(floor.rooms || []).map((room, roomIdx) => {
                          const isSelected = selectedRoom?.id === room.id;
                          return (
                            <div
                              key={`side-room-f${floor.level}-i${roomIdx}`}
                              onClick={() => {
                                handleSelectRoom(
                                  room,
                                  [room.position?.x || 0, (room.floor - 1) * 3.1 + 4.5, (room.position?.z || 0) + 5.5],
                                  [room.position?.x || 0, (room.floor - 1) * 3.1 + 1.2, room.position?.z || 0]
                                );
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "5px 8px",
                                borderRadius: "5px",
                                background: isSelected ? "rgba(16, 185, 129, 0.18)" : "transparent",
                                border: isSelected ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid transparent",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{
                                  width: "5px",
                                  height: "5px",
                                  borderRadius: "50%",
                                  background: isSelected ? "#10B981" : "#38BDF8",
                                  boxShadow: isSelected ? "0 0 6px #10B981" : "none",
                                }} />
                                <span style={{
                                  fontSize: "11px",
                                  fontWeight: isSelected ? 800 : 500,
                                  color: isSelected ? "#FFFFFF" : "#E2E8F0",
                                }}>
                                  {room.name}
                                </span>
                              </div>
                              <span style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                color: isSelected ? "#34D399" : "#64748B",
                                fontFamily: "monospace",
                              }}>
                                {room.area} m²
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* ── 3. FLOATING 3D NAVIGATION GIZMO (BOTTOM-LEFT) ─────────────────── */}
      {layoutView !== "2d" && (
        <div style={{
          position: "absolute",
          bottom: "44px",
          left: layoutView === "split" ? "calc(50% + 14px)" : (leftSidebarOpen ? "284px" : "14px"),
          zIndex: 35,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          padding: "4px",
          borderRadius: "8px",
          ...glassStyle,
          transition: "left 0.2s ease",
        }}>
        <button
          onClick={handleResetCamera}
          title="Reset to North Isometric"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "5px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#38BDF8",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          N
        </button>
        <button
          onClick={() => setViewPreset("front")}
          title="Zoom Front"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "5px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#F8FAFC",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          onClick={() => setViewPreset("top")}
          title="Zoom Out"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "5px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#F8FAFC",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          -
        </button>
        <button
          onClick={() => {
            setActivePreset(null);
            setViewPreset("iso");
          }}
          title="Fit View to Screen"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "5px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#34D399",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          ⛶
        </button>
        <button
          onClick={handleCaptureSnapshot}
          title="Download High-Resolution 3D Snapshot"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "5px",
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            color: "#38BDF8",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          📷
        </button>
      </div>
      )}

      {/* Snapshot Toast Notification */}
      <AnimatePresence>
        {snapshotToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "absolute",
              bottom: "48px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.95)",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: 800,
              boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
            }}
          >
            <span>✓</span>
            <span>{snapshotToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. DISCREET FLOATING SOLAR TIMELINE PILL (BOTTOM-CENTER) ───────── */}
      {layoutView !== "2d" && (
        <div style={{
          position: "absolute",
          bottom: "44px",
          left: layoutView === "split" ? "75%" : "50%",
          transform: "translateX(-50%)",
          zIndex: 35,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 14px",
          borderRadius: "24px",
          ...glassStyle,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px" }}>☀️</span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#FBBF24", fontFamily: "monospace" }}>
              {solarHUD.timeStr}
            </span>
          </div>

          {/* Minimal Sun Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "160px" }}>
            <span style={{ fontSize: "9px", color: "#64748B", fontFamily: "monospace" }}>6am</span>
            <input
              type="range"
              min="6"
              max="18"
              step="0.25"
              value={sunHour}
              onChange={(e) => setSunHour(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: "#F59E0B",
                cursor: "pointer",
                height: "4px",
              }}
            />
            <span style={{ fontSize: "9px", color: "#64748B", fontFamily: "monospace" }}>6pm</span>
          </div>

          <span style={{
            fontSize: "10px",
            color: "#94A3B8",
            fontFamily: "monospace",
            background: "rgba(255, 255, 255, 0.05)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}>
            {solarHUD.elevation}° Alt · {solarHUD.shadingPct}% Shaded
          </span>

          <button
            onClick={() => setIsSunPlaying(!isSunPlaying)}
            style={{
              padding: "3px 8px",
              borderRadius: "12px",
              background: isSunPlaying ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
              border: `1px solid ${isSunPlaying ? "#EF4444" : "#10B981"}`,
              color: isSunPlaying ? "#F87171" : "#34D399",
              fontSize: "10px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {isSunPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      )}

      {/* ── 5. MAIN WORKSPACE: 3D HERO CANVAS / 2D SPACE PLANNER / SPLIT ────── */}
      <main style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
        {/* 2D Space Planner Canvas (in split or 2d mode) */}
        {(layoutView === "split" || layoutView === "2d") && (
          <div
            style={{
              width: layoutView === "split" ? "50%" : "100%",
              height: "100%",
              position: "relative",
              borderRight: layoutView === "split" ? "2px solid rgba(56, 189, 248, 0.3)" : "none",
              zIndex: 10,
              paddingTop: "54px",
            }}
          >
            <SpacePlannerCanvas
              floors={displayFloors}
              activeFloorLevel={isolatedFloor === "all" ? 1 : parseInt(isolatedFloor, 10) || 1}
              onFloorChange={(lvl) => setIsolatedFloor(lvl)}
              buildingWidth={buildingWidth}
              buildingDepth={buildingDepth}
              selectedRoomId={selectedRoom?.id}
              onSelectRoom={(r) => handleSelectRoom(r)}
              onUpdateRooms={handleUpdateRooms}
              activeMaterials={activeMaterials}
            />
          </div>
        )}

        {/* 3D WebGL Canvas (in 3d or split mode) */}
        {(layoutView === "3d" || layoutView === "split") && (
          <div
            style={{
              width: layoutView === "split" ? "50%" : "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <Villa3DCanvas
              floorCount={floorCount}
              buildingType={buildingType}
              structuralSystem={structuralSystem}
              styleMode={styleMode}
              focusMode={focusMode}
              specMode={specMode}
              sunHour={sunHour}
              showGhostEnvelope={showGhostEnvelope}
              isExploded={isExploded}
              isEvening={isEvening}
              isXray={isXray}
              isAutoRotating={isAutoRotating}
              showHotspots={showLabels}
              showFurniture={showFurniture}
              showDimensions={showDimensions}
              isolatedFloor={isolatedFloor}
              floorsData={displayFloors}
              selectedRoomId={selectedRoom?.id}
              selectedComponentId={focusMode === "components" ? (selectedComp?.componentKey || selectedComp?.id) : null}
              highlightedComponent={focusMode === "components" ? (selectedComp?.componentKey || selectedComp?.id) : null}
              activeMaterials={activeMaterials}
              activePreset={activePreset}
              viewPreset={viewPreset}
              detectedIssues={detectedIssues}
              blueprintData={rawBlueprint}
              onSelectRoom={handleSelectRoom}
              onSelectComponent={handleSelectComponent}
              onRegisterSnapshot={(fn) => {
                snapshotTriggerRef.current = fn;
              }}
            />
          </div>
        )}
      </main>

      {/* ── 6. COLLAPSIBLE RIGHT 4-TAB INSPECTOR PANEL ──────────────────────── */}
      <AnimatePresence>
        {inspectorOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 70 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "62px",
              right: "14px",
              bottom: "44px",
              width: "340px",
              zIndex: 35,
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              overflow: "hidden",
              ...glassStyle,
            }}
          >
            {/* Panel Tab Switcher Header with Collapse Button */}
            <div style={{
              padding: "8px 10px",
              borderBottom: "1px solid #E2DCD0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#FAF7F0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <button
                  onClick={() => setInspectorTab("room")}
                  style={{
                    padding: "4px 7px",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    background: inspectorTab === "room" ? "rgba(16, 185, 129, 0.2)" : "transparent",
                    border: inspectorTab === "room" ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid transparent",
                    color: inspectorTab === "room" ? "#34D399" : "#94A3B8",
                  }}
                >
                  Space
                </button>
                <button
                  onClick={() => setInspectorTab("eco_delta")}
                  style={{
                    padding: "4px 7px",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    background: inspectorTab === "eco_delta" ? "rgba(16, 185, 129, 0.2)" : "transparent",
                    border: inspectorTab === "eco_delta" ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid transparent",
                    color: inspectorTab === "eco_delta" ? "#34D399" : "#94A3B8",
                  }}
                >
                  ⚖️ Eco Delta
                </button>
                <button
                  onClick={() => setInspectorTab("furniture")}
                  style={{
                    padding: "4px 7px",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    background: inspectorTab === "furniture" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                    border: inspectorTab === "furniture" ? "1px solid rgba(56, 189, 248, 0.5)" : "1px solid transparent",
                    color: inspectorTab === "furniture" ? "#38BDF8" : "#94A3B8",
                  }}
                >
                  Furniture
                </button>
                <button
                  onClick={() => setInspectorTab("component")}
                  style={{
                    padding: "4px 7px",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    background: inspectorTab === "component" ? "rgba(168, 85, 247, 0.2)" : "transparent",
                    border: inspectorTab === "component" ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid transparent",
                    color: inspectorTab === "component" ? "#C084FC" : "#94A3B8",
                  }}
                >
                  Material
                </button>
              </div>

              <button
                onClick={() => setInspectorOpen(false)}
                title="Collapse Inspector"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "2px",
                }}
              >
                ▸
              </button>
            </div>

            {/* Panel Content (Scrollable) */}
            <div style={{ padding: "12px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {/* ── TAB 1: ROOM SPACE INSPECTION ───────────────────────── */}
              {inspectorTab === "room" && selectedRoom && (
                <>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h2 style={{ margin: "0", fontSize: "16px", fontWeight: 800, color: "#F8FAFC" }}>
                        {selectedRoom.name}
                      </h2>
                      <span style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        color: "#34D399",
                      }}>
                        {selectedRoom.category || "PRIVATE"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStepInsideRoom(selectedRoom)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "7px 10px",
                        borderRadius: "6px",
                        background: "linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 165, 233, 0.18) 100%)",
                        border: "1px solid rgba(56, 189, 248, 0.45)",
                        color: "#38BDF8",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>🚶 Step Inside Space (Eye-Level 1.6m)</span>
                    </button>
                  </div>

                  {/* SPATIAL INFORMATION */}
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "6px" }}>
                      SPATIAL SPECIFICATION
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Floor Level</span>
                        <span style={{ color: "#F8FAFC", fontWeight: 700 }}>Floor {selectedRoom.floor}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Usable Area</span>
                        <span style={{ color: "#34D399", fontWeight: 800 }}>{selectedRoom.area} m²</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Dimensions</span>
                        <span style={{ color: "#F8FAFC", fontWeight: 600 }}>{selectedRoom.dimensions?.w || 4.2} × {selectedRoom.dimensions?.d || 3.8} × 2.85 m</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Occupancy</span>
                        <span style={{ color: "#F8FAFC", fontWeight: 600 }}>{selectedRoom.occupancy || "2 People"}</span>
                      </div>
                    </div>
                  </div>

                  {/* OPENINGS & DAYLIGHT */}
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "6px" }}>
                      OPENINGS & VENTILATION
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Windows / Apertures</span>
                        <span style={{ color: "#F8FAFC", fontWeight: 600 }}>{selectedRoom.openings?.windows ?? 2} Units ({selectedRoom.openings?.openingArea ?? 4.8} m²)</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Window-to-Floor Ratio</span>
                        <span style={{ color: "#38BDF8", fontWeight: 700 }}>
                          {Math.round(((selectedRoom.openings?.openingArea || 4.8) / (selectedRoom.area || 24)) * 100)}% (SLS ≥15%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SUGGESTED IMPROVEMENT */}
                  <div style={{ background: "rgba(56, 189, 248, 0.06)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                    <div style={{ fontSize: "9px", color: "#38BDF8", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "3px" }}>
                      SUGGESTED OPTIMIZATION
                    </div>
                    <div style={{ fontSize: "10px", color: "#E2E8F0", lineHeight: "1.4" }}>
                      • {selectedRoom.suggestedImprovement || "Maintain cross-ventilation path to control tropical humidity levels."}
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB 2: REAL-TIME ECO SPEC DELTA ─────────────────────── */}
              {inspectorTab === "eco_delta" && specComparison && (
                <>
                  <div>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#34D399", letterSpacing: "0.06em" }}>
                      LCA CARBON & ENERGY SIMULATION
                    </span>
                    <h2 style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: 800, color: "#F8FAFC" }}>
                      Baseline vs AI Eco-Spec
                    </h2>
                  </div>

                  {/* 3 Metric Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "8px 10px", borderRadius: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "#94A3B8" }}>EMBODIED CARBON</span>
                        <span style={{ fontSize: "13px", fontWeight: 900, color: "#34D399" }}>🔻 -{specComparison.delta?.carbonSavedPct}%</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
                        Eco: {specComparison.eco?.embodiedCarbon} vs Baseline: {specComparison.baseline?.embodiedCarbon} kgCO₂e/m²
                      </div>
                    </div>

                    <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "8px 10px", borderRadius: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "#94A3B8" }}>THERMAL U-VALUE</span>
                        <span style={{ fontSize: "13px", fontWeight: 900, color: "#38BDF8" }}>🔻 -{specComparison.delta?.uValueReductionPct}%</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
                        Eco: {specComparison.eco?.avgUValue} vs Baseline: {specComparison.baseline?.avgUValue} W/m²K
                      </div>
                    </div>

                    <div style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.25)", padding: "8px 10px", borderRadius: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "#94A3B8" }}>CIRCULARITY SCORE</span>
                        <span style={{ fontSize: "13px", fontWeight: 900, color: "#C084FC" }}>+{specComparison.delta?.circularityDeltaPts} pts</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
                        Eco: {specComparison.eco?.circularityScore}/100 vs Baseline: {specComparison.baseline?.circularityScore}/100
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: "9px", color: "#94A3B8", fontWeight: 800, marginBottom: "4px" }}>
                      TOTAL PROJECT IMPACT
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <span style={{ color: "#94A3B8" }}>Total CO₂e Saved</span>
                      <span style={{ color: "#34D399", fontWeight: 800, fontFamily: "monospace" }}>
                        {specComparison.delta?.carbonSavedKg?.toLocaleString()} kg CO₂e
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB 3: FURNITURE SCHEDULE ──────────────────────────── */}
              {inspectorTab === "furniture" && selectedRoom && (
                <>
                  <div>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#38BDF8", letterSpacing: "0.06em" }}>
                      {selectedRoom.name.toUpperCase()}
                    </span>
                    <h2 style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: 800, color: "#F8FAFC" }}>
                      Furniture Allocation
                    </h2>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(selectedRoom.furnitureSchedule || [
                      { name: "Main Furniture Ensemble", material: "Treated sustainable timber & fabric", dimensions: "Custom Spec", quantity: 1, embodiedCarbon: "0.18 kgCO₂/kg" }
                    ]).map((fItem, fIdx) => (
                      <div
                        key={`f-item-${fIdx}`}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "6px",
                          padding: "8px 10px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#F8FAFC" }}>{fItem.name}</span>
                          <span style={{ fontSize: "9px", color: "#38BDF8", fontFamily: "monospace" }}>Qty: {fItem.quantity}</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "2px" }}>
                          Finish: {fItem.material}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── TAB 4: MATERIAL COMPONENT ───────────────────────────── */}
              {inspectorTab === "component" && (
                <>
                  <div>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#C084FC", letterSpacing: "0.06em" }}>
                      {selectedComp?.category || "BUILDING ENVELOPE"}
                    </span>
                    <h2 style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: 800, color: "#F8FAFC" }}>
                      {selectedComp?.material || "Selected Specification"}
                    </h2>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "11px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Standard</span>
                        <span style={{ color: "#F8FAFC", fontWeight: 700 }}>{selectedComp?.standard || "SLS 107 / SLS 1181"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Engineering Score</span>
                        <span style={{ color: "#34D399", fontWeight: 800 }}>{selectedComp?.engineeringScore || 88}/100</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#94A3B8" }}>Embodied Carbon</span>
                        <span style={{ color: "#38BDF8", fontWeight: 700 }}>{selectedComp?.embodiedCarbon || "0.24 kgCO₂e/kg"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* ── 7. RESEARCH TRACE MODAL (7-STAGE VIVA PIPELINE) ────────────────── */}
      <AnimatePresence>
        {researchTraceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 60,
              background: "rgba(3, 7, 18, 0.88)",
              backdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setResearchTraceOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: "860px",
                maxHeight: "85vh",
                background: "rgba(10, 15, 26, 0.98)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                boxShadow: "0 0 50px rgba(99, 102, 241, 0.25)",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.10)", paddingBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "#A5B4FC", fontWeight: 800, letterSpacing: "0.08em" }}>
                    7-STAGE VIVA RESEARCH TRACE
                  </span>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#F8FAFC" }}>
                    Questionnaire → Context → Blueprint → 3D Model Decision Trace
                  </h2>
                </div>
                <button
                  onClick={() => setResearchTraceOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    color: "#94A3B8",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Stage Progress Pills */}
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                {vivaPipelineStages.map((st, i) => {
                  const isActive = activeTraceStage === i;
                  return (
                    <button
                      key={`st-tab-${st.id}`}
                      onClick={() => setActiveTraceStage(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: isActive ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                        border: isActive ? "1px solid rgba(99, 102, 241, 0.7)" : "1px solid rgba(255, 255, 255, 0.08)",
                        color: isActive ? "#C7D2FE" : "#94A3B8",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: isActive ? "#6366F1" : "rgba(255, 255, 255, 0.1)",
                        color: "#FFFFFF", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {st.step}
                      </span>
                      <span>{st.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Data Card */}
              {vivaPipelineStages[activeTraceStage] && (
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "8px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "9px", color: "#818CF8", fontWeight: 800 }}>
                        STAGE {vivaPipelineStages[activeTraceStage].step} OF 7
                      </span>
                      <h3 style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: 800, color: "#F8FAFC" }}>
                        {vivaPipelineStages[activeTraceStage].title}
                      </h3>
                    </div>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#A5B4FC",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}>
                      {vivaPipelineStages[activeTraceStage].status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {vivaPipelineStages[activeTraceStage].details.map((d, dIdx) => (
                      <div
                        key={`det-${dIdx}`}
                        style={{
                          background: "rgba(0, 0, 0, 0.3)",
                          padding: "6px 8px",
                          borderRadius: "5px",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <div style={{ fontSize: "9px", color: "#94A3B8" }}>{d.label}</div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#F1F5F9", marginTop: "1px" }}>
                          {d.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 8. MATERIAL PALETTE DRAWER ─────────────────────────────────────── */}
      <AnimatePresence>
        {materialDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 60,
              background: "rgba(3, 7, 18, 0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              justifyContent: "flex-end",
            }}
            onClick={() => setMaterialDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              style={{
                width: "360px",
                height: "100%",
                background: "rgba(10, 15, 26, 0.98)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#F8FAFC" }}>
                  Material Specifications
                </h3>
                <button
                  onClick={() => setMaterialDrawerOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {componentsList.map((comp) => {
                  const isSelected = selectedComp?.id === comp.id;
                  return (
                    <div
                      key={`palette-comp-${comp.id}`}
                      onClick={() => {
                        handleSelectComponent(comp);
                        setMaterialDrawerOpen(false);
                      }}
                      style={{
                        padding: "10px",
                        borderRadius: "6px",
                        background: isSelected ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "9px", color: "#64748B", fontWeight: 700 }}>{comp.category}</span>
                        <span style={{ fontSize: "9px", color: "#34D399", fontWeight: 700 }}>Score: {comp.engineeringScore}</span>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: isSelected ? "#38BDF8" : "#F8FAFC", marginTop: "2px" }}>
                        {comp.material}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 9. MINIMAL SLIM BOTTOM PROVENANCE STRIP (36px) ────────────────── */}
      <footer style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: "36px",
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(20, 23, 22, 0.96)",
        fontSize: "10px",
        color: "#8C9690",
        fontFamily: "'Space Grotesk', sans-serif",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#D6C7B2", fontWeight: 800, letterSpacing: "0.08em" }}>RESEARCH PROVENANCE</span>
          <span>📐 Geometry: <strong style={{ color: "#FFFFFF" }}>{isBlueprintDerived ? "Blueprint-Derived CAD Vectors" : "Questionnaire Spatial Spec"}</strong></span>
          <span>🧱 Materials: <strong style={{ color: "#FFFFFF" }}>Hybrid MCDM Recommendation</strong></span>
          <span>⚖️ Rules: <strong style={{ color: "#FFFFFF" }}>SLS 614 / SLS 107 Rule Check</strong></span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setResearchTraceOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#C47A5A",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "Space Grotesk",
              letterSpacing: "0.04em",
            }}
          >
            Pipeline Stage: <strong style={{ color: "#4ADE80" }}>05 / 3D Representation</strong>
          </button>
          <span>|</span>
          <span style={{ color: "#D6C7B2", fontWeight: 700 }}>Sri Lankan Biophilic Studio</span>
        </div>
      </footer>
      </div>
    </div>
  );
}