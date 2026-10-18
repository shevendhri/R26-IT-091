"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

// Standard room type templates with architectural defaults
export const ROOM_TEMPLATES = [
  { type: "living", name: "Living Room", w: 5.4, d: 4.2, category: "PUBLIC", color: "#3B82F6" },
  { type: "bedroom", name: "Master Bedroom", w: 4.6, d: 3.8, category: "PRIVATE", color: "#8B5CF6" },
  { type: "kitchen_dining", name: "Kitchen & Dining", w: 4.8, d: 3.6, category: "SERVICE", color: "#F59E0B" },
  { type: "bathroom", name: "En-suite Bathroom", w: 2.8, d: 2.2, category: "HYGIENE", color: "#06B6D4" },
  { type: "office", name: "Home Office / Study", w: 3.6, d: 3.2, category: "HABITABLE", color: "#10B981" },
  { type: "balcony", name: "Outdoor Verandah", w: 4.0, d: 2.0, category: "CIRCULATION", color: "#EC4899" },
];

// Material finishes mapped to room types
const ROOM_MATERIALS = {
  living: { name: "Teak Parquet / Polished Terrazzo", spec: "SLS 1181 Grade A", hatch: "parquet", col: "rgba(180, 110, 50, 0.25)" },
  bedroom: { name: "Engineered Hardwood Timber", spec: "SLS 107 Class I", hatch: "wood", col: "rgba(160, 95, 45, 0.22)" },
  kitchen_dining: { name: "Anti-Slip Matte Porcelain Tile", spec: "SLS 1181 R10", hatch: "grid", col: "rgba(100, 120, 140, 0.25)" },
  bathroom: { name: "Polished Vitrified Ceramic Tile", spec: "SLS 1181 Class 2A", hatch: "diagonal", col: "rgba(56, 189, 248, 0.22)" },
  office: { name: "Honed Titanium Floor Screed", spec: "SLS 1282", hatch: "smooth", col: "rgba(120, 140, 160, 0.2)" },
  balcony: { name: "Flamed Granite Pavers", spec: "SLS 844 External", hatch: "stone", col: "rgba(90, 100, 110, 0.28)" },
};

/**
 * Interactive 2D Space Planner Canvas
 * - Real-time auto-centering in viewport (no clipping or offsets)
 * - Single-row sleek architectural toolbar (no wrapping clutter)
 * - Synchronized live with 3D Cutaway model
 * - Drag-and-drop & resize room bounding boxes
 * - Layered Architectural, Material Spec, Electrical MEP & Dimensions
 * - Vector SVG & JSON export
 */
export default function SpacePlannerCanvas({
  floors = [],
  activeFloorLevel = 1,
  onFloorChange,
  buildingWidth = 14.8,
  buildingDepth = 11.2,
  selectedRoomId = null,
  onSelectRoom,
  onUpdateRooms,
  activeMaterials,
}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 700, h: 500 });
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Layer Visibility
  const [layers, setLayers] = useState({
    arch: true,
    materials: true,
    electrical: false,
    dimensions: true,
    grid: true,
  });

  // Dragging & Resizing State
  const [dragState, setDragState] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Measure dynamic container size
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(320, rect.width);
        const h = Math.max(260, rect.height - 46); // subtract 46px toolbar
        setContainerSize({ w, h });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Active Floor Data
  const currentFloor = useMemo(() => {
    return (
      (floors || []).find((f) => f.level === activeFloorLevel) ||
      floors?.[0] || { level: 1, name: "Floor 1", rooms: [] }
    );
  }, [floors, activeFloorLevel]);

  const rooms = currentFloor.rooms || [];

  // Canvas scaling: 1 meter = 40 pixels on screen at zoom 1.0
  const METERS_TO_PX = 40;

  // Auto-fit & auto-center on size change
  useEffect(() => {
    if (containerSize.w > 100 && containerSize.h > 100) {
      const pad = 64;
      const bldPxW = buildingWidth * METERS_TO_PX;
      const bldPxH = buildingDepth * METERS_TO_PX;
      const scaleX = (containerSize.w - pad * 2) / bldPxW;
      const scaleY = (containerSize.h - pad * 2) / bldPxH;
      const autoZoom = Math.max(0.4, Math.min(1.2, Math.min(scaleX, scaleY)));
      setZoom(Math.round(autoZoom * 100) / 100);
      setPan({ x: 0, y: 0 });
    }
  }, [containerSize.w, containerSize.h, buildingWidth, buildingDepth]);

  // Center of the viewport drawing area
  const originX = containerSize.w / 2;
  const originY = containerSize.h / 2;

  // Coordinate Conversion Helpers (World meters to canvas pixels)
  const toCanvasX = useCallback((meterX) => originX + meterX * METERS_TO_PX, [originX]);
  const toCanvasY = useCallback((meterZ) => originY + meterZ * METERS_TO_PX, [originY]);

  // Snap to 0.2m grid
  const snap = useCallback((val, step = 0.2) => {
    return snapToGrid ? Math.round(val / step) * step : Math.round(val * 100) / 100;
  }, [snapToGrid]);

  // Handle Drag Move & Resize
  const handlePointerDownRoom = (e, room, actionType = "move", handle = null) => {
    e.stopPropagation();
    if (onSelectRoom) onSelectRoom(room);

    setDragState({
      roomId: room.id,
      type: actionType,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origPos: { x: room.position?.x || 0, z: room.position?.z || 0 },
      origDim: { w: room.dimensions?.w || 4.0, d: room.dimensions?.d || 4.0 },
    });
  };

  // Pointer Move during dragging/resizing
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e) => {
      const dxPx = (e.clientX - dragState.startX) / zoom;
      const dyPx = (e.clientY - dragState.startY) / zoom;
      const dxMeters = dxPx / METERS_TO_PX;
      const dyMeters = dyPx / METERS_TO_PX;

      const updatedRooms = rooms.map((r) => {
        if (r.id !== dragState.roomId) return r;

        if (dragState.type === "move") {
          let newX = snap(dragState.origPos.x + dxMeters);
          let newZ = snap(dragState.origPos.z + dyMeters);

          const halfBldW = buildingWidth / 2 - (r.dimensions?.w || 4) / 2 - 0.2;
          const halfBldD = buildingDepth / 2 - (r.dimensions?.d || 4) / 2 - 0.2;
          newX = Math.max(-halfBldW, Math.min(halfBldW, newX));
          newZ = Math.max(-halfBldD, Math.min(halfBldD, newZ));

          return {
            ...r,
            position: { ...r.position, x: newX, z: newZ },
          };
        } else if (dragState.type === "resize") {
          let newW = dragState.origDim.w;
          let newD = dragState.origDim.d;
          let newX = dragState.origPos.x;
          let newZ = dragState.origPos.z;

          if (dragState.handle.includes("e")) {
            newW = Math.max(1.8, snap(dragState.origDim.w + dxMeters));
            newX = snap(dragState.origPos.x + (newW - dragState.origDim.w) / 2);
          } else if (dragState.handle.includes("w")) {
            newW = Math.max(1.8, snap(dragState.origDim.w - dxMeters));
            newX = snap(dragState.origPos.x - (newW - dragState.origDim.w) / 2);
          }

          if (dragState.handle.includes("s")) {
            newD = Math.max(1.8, snap(dragState.origDim.d + dyMeters));
            newZ = snap(dragState.origPos.z + (newD - dragState.origDim.d) / 2);
          } else if (dragState.handle.includes("n")) {
            newD = Math.max(1.8, snap(dragState.origDim.d - dyMeters));
            newZ = snap(dragState.origPos.z - (newD - dragState.origDim.d) / 2);
          }

          const newArea = Math.round(newW * newD * 10) / 10;
          return {
            ...r,
            area: newArea,
            dimensions: { ...r.dimensions, w: newW, d: newD },
            position: { ...r.position, x: newX, z: newZ },
          };
        }
        return r;
      });

      if (onUpdateRooms) {
        onUpdateRooms(currentFloor.level, updatedRooms);
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, rooms, zoom, snap, buildingWidth, buildingDepth, currentFloor.level, onUpdateRooms]);

  // Pan Canvas
  const handleCanvasPointerDown = (e) => {
    if (e.target.closest(".interactive-room-handle") || e.target.closest(".interactive-room-card")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasPointerMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleCanvasPointerUp = () => {
    setIsPanning(false);
  };

  // Add Room
  const handleAddRoom = (template) => {
    const newId = `room_${Date.now()}`;
    const newRoom = {
      id: newId,
      name: template.name,
      furnitureType: template.type,
      category: template.category,
      floor: currentFloor.level,
      area: Math.round(template.w * template.d * 10) / 10,
      dimensions: { w: template.w, d: template.d, h: 2.85 },
      position: { x: 0, y: 0, z: 0 },
      openings: { windows: 1, doors: 1, openingArea: 3.2 },
    };

    const nextRooms = [...rooms, newRoom];
    if (onUpdateRooms) onUpdateRooms(currentFloor.level, nextRooms);
    if (onSelectRoom) onSelectRoom(newRoom);
    setShowAddModal(false);
  };

  // Delete Room
  const handleDeleteRoom = (roomId) => {
    const nextRooms = rooms.filter((r) => r.id !== roomId);
    if (onUpdateRooms) onUpdateRooms(currentFloor.level, nextRooms);
    if (selectedRoomId === roomId && onSelectRoom) {
      onSelectRoom(nextRooms[0] || null);
    }
  };

  // Export SVG
  const handleExportSVG = () => {
    const svgEl = document.getElementById("spaceplanner-svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SpacePlanner_Floor_${currentFloor.level}_Architectural.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const payload = {
      project: "Material Specification Studio",
      floor: currentFloor.level,
      dimensions: { width: buildingWidth, depth: buildingDepth },
      totalRooms: rooms.length,
      rooms: rooms.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.furnitureType,
        areaM2: r.area,
        dimensionsMeters: r.dimensions,
        positionMeters: r.position,
        material: ROOM_MATERIALS[r.furnitureType]?.name || "Standard Plaster & Tile",
      })),
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SpacePlanner_Floor_${currentFloor.level}_Data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#080D1A",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
    >
      {/* ── SLEEK SINGLE-ROW ARCHITECTURAL CONTROL BAR ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "44px",
          padding: "0 12px",
          background: "rgba(10, 16, 30, 0.96)",
          borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
          backdropFilter: "blur(12px)",
          zIndex: 30,
          gap: "8px",
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
          overflowX: "auto",
        }}
      >
        {/* Left: Level Pill Group */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", letterSpacing: "0.05em" }}>
            LEVEL:
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "6px",
              padding: "2px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {(floors || []).map((f) => (
              <button
                key={`floor-btn-${f.level}`}
                onClick={() => onFloorChange && onFloorChange(f.level)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background: f.level === activeFloorLevel ? "rgba(56, 189, 248, 0.3)" : "transparent",
                  color: f.level === activeFloorLevel ? "#38BDF8" : "#64748B",
                  transition: "all 0.15s ease",
                }}
              >
                {f.level}F
              </button>
            ))}
          </div>
        </div>

        {/* Center: Layer Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
          {[
            { id: "arch", label: "Arch", icon: "📐" },
            { id: "materials", label: "Material", icon: "🎨" },
            { id: "electrical", label: "MEP", icon: "⚡" },
            { id: "dimensions", label: "Dims", icon: "📏" },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setLayers((prev) => ({ ...prev, [layer.id]: !prev[layer.id] }))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "3px 7px",
                borderRadius: "5px",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                border: layers[layer.id] ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(255,255,255,0.06)",
                background: layers[layer.id] ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.02)",
                color: layers[layer.id] ? "#38BDF8" : "#64748B",
                transition: "all 0.15s ease",
              }}
            >
              <span>{layer.icon}</span>
              <span>{layer.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Quick Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={() => setSnapToGrid((v) => !v)}
            title="Snap to 0.2m grid"
            style={{
              padding: "3px 8px",
              borderRadius: "5px",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              border: snapToGrid ? "1px solid #10B981" : "1px solid rgba(255,255,255,0.1)",
              background: snapToGrid ? "rgba(16, 185, 129, 0.15)" : "transparent",
              color: snapToGrid ? "#10B981" : "#64748B",
            }}
          >
            🧲 {snapToGrid ? "0.2m" : "Free"}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid #38BDF8",
              background: "rgba(56, 189, 248, 0.2)",
              color: "#38BDF8",
            }}
          >
            <span>+</span> Room
          </button>

          <button
            onClick={handleExportSVG}
            title="Export Architectural Vector SVG"
            style={{
              padding: "3px 7px",
              borderRadius: "5px",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#CBD5E1",
            }}
          >
            SVG
          </button>

          <button
            onClick={handleExportJSON}
            title="Export Structured Floor Plan JSON"
            style={{
              padding: "3px 7px",
              borderRadius: "5px",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#CBD5E1",
            }}
          >
            JSON
          </button>
        </div>
      </div>

      {/* ── 2D CANVAS VIEWPORT (AUTO-CENTERED) ── */}
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: isPanning ? "grabbing" : "grab",
        }}
      >
        <svg
          id="spaceplanner-svg"
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <defs>
            {/* Architectural Grid Patterns */}
            <pattern id="sp-grid-minor" width={METERS_TO_PX * 0.5} height={METERS_TO_PX * 0.5} patternUnits="userSpaceOnUse">
              <path d={`M ${METERS_TO_PX * 0.5} 0 L 0 0 0 ${METERS_TO_PX * 0.5}`} fill="none" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" />
            </pattern>
            <pattern id="sp-grid-major" width={METERS_TO_PX * 1.0} height={METERS_TO_PX * 1.0} patternUnits="userSpaceOnUse">
              <rect width={METERS_TO_PX * 1.0} height={METERS_TO_PX * 1.0} fill="url(#sp-grid-minor)" />
              <path d={`M ${METERS_TO_PX * 1.0} 0 L 0 0 0 ${METERS_TO_PX * 1.0}`} fill="none" stroke="rgba(56, 189, 248, 0.14)" strokeWidth="1.2" />
            </pattern>

            {/* Material Hatch Patterns */}
            <pattern id="hatch-parquet" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(217, 119, 6, 0.35)" strokeWidth="1.2" />
              <line x1="8" y1="0" x2="8" y2="16" stroke="rgba(217, 119, 6, 0.35)" strokeWidth="1.2" />
            </pattern>
            <pattern id="hatch-grid" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
            </pattern>
            <pattern id="hatch-diagonal" width="12" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="12" x2="12" y2="0" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />
            </pattern>

            {/* Dimension Marker Arrows */}
            <marker id="arrow-dim" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill="#10B981" />
            </marker>
          </defs>

          {/* Pan & Zoom Master Group — Centered around originX, originY */}
          <g transform={`translate(${originX + pan.x}, ${originY + pan.y}) scale(${zoom})`}>
            {/* Background Grid */}
            {layers.grid && (
              <rect
                x={-(buildingWidth * METERS_TO_PX) / 2 - 200}
                y={-(buildingDepth * METERS_TO_PX) / 2 - 200}
                width={buildingWidth * METERS_TO_PX + 400}
                height={buildingDepth * METERS_TO_PX + 400}
                fill="url(#sp-grid-major)"
              />
            )}

            {/* Building Envelope Perimeter Plinth */}
            <rect
              x={-(buildingWidth * METERS_TO_PX) / 2}
              y={-(buildingDepth * METERS_TO_PX) / 2}
              width={buildingWidth * METERS_TO_PX}
              height={buildingDepth * METERS_TO_PX}
              fill="rgba(15, 23, 42, 0.78)"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              rx="4"
            />

            {/* Perimeter Wall Thickness (Exterior structural shell) */}
            <rect
              x={-(buildingWidth * METERS_TO_PX) / 2 - 6}
              y={-(buildingDepth * METERS_TO_PX) / 2 - 6}
              width={buildingWidth * METERS_TO_PX + 12}
              height={buildingDepth * METERS_TO_PX + 12}
              fill="none"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1.2"
            />

            {/* ── ROOM BLOCKS ── */}
            {rooms.map((room) => {
              const rw = room.dimensions?.w || 4.0;
              const rd = room.dimensions?.d || 4.0;
              const rx = room.position?.x || 0;
              const rz = room.position?.z || 0;

              const pxW = rw * METERS_TO_PX;
              const pxD = rd * METERS_TO_PX;
              const pxX = rx * METERS_TO_PX - pxW / 2;
              const pxY = rz * METERS_TO_PX - pxD / 2;

              const isSelected = selectedRoomId === room.id;
              const matInfo = ROOM_MATERIALS[room.furnitureType] || ROOM_MATERIALS.living;

              return (
                <g
                  key={`svg-room-${room.id}`}
                  className="interactive-room-card"
                  onPointerDown={(e) => handlePointerDownRoom(e, room, "move")}
                  style={{ cursor: "move" }}
                >
                  {/* Room Base Floor Slab */}
                  <rect
                    x={pxX}
                    y={pxY}
                    width={pxW}
                    height={pxD}
                    fill={isSelected ? "rgba(56, 189, 248, 0.18)" : "rgba(30, 41, 59, 0.85)"}
                    stroke={isSelected ? "#38BDF8" : "rgba(255, 255, 255, 0.28)"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    rx="3"
                  />

                  {/* Material Hatch Overlay Layer */}
                  {layers.materials && (
                    <rect
                      x={pxX}
                      y={pxY}
                      width={pxW}
                      height={pxD}
                      fill={matInfo.hatch ? `url(#hatch-${matInfo.hatch})` : matInfo.col}
                      pointerEvents="none"
                    />
                  )}

                  {/* Room Interior Wall Partitions */}
                  {layers.arch && (
                    <rect
                      x={pxX + 3}
                      y={pxY + 3}
                      width={Math.max(4, pxW - 6)}
                      height={Math.max(4, pxD - 6)}
                      fill="none"
                      stroke={isSelected ? "#38BDF8" : "rgba(148, 163, 184, 0.35)"}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      pointerEvents="none"
                    />
                  )}

                  {/* Room Center Info Label */}
                  <g pointerEvents="none">
                    <text
                      x={pxX + pxW / 2}
                      y={pxY + pxD / 2 - 7}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={Math.min(13, Math.max(10, pxW / 12))}
                      fontWeight="700"
                      letterSpacing="0.03em"
                    >
                      {room.name}
                    </text>

                    <text
                      x={pxX + pxW / 2}
                      y={pxY + pxD / 2 + 8}
                      textAnchor="middle"
                      fill="#38BDF8"
                      fontSize="10px"
                      fontWeight="700"
                    >
                      {room.area || (rw * rd).toFixed(1)} m²
                    </text>

                    {layers.dimensions && (
                      <text
                        x={pxX + pxW / 2}
                        y={pxY + pxD / 2 + 21}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="9px"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {rw.toFixed(1)}m × {rd.toFixed(1)}m
                      </text>
                    )}

                    {layers.materials && (
                      <text
                        x={pxX + pxW / 2}
                        y={pxY + pxD - 7}
                        textAnchor="middle"
                        fill="#F59E0B"
                        fontSize="8px"
                        fontWeight="600"
                      >
                        {matInfo.spec}
                      </text>
                    )}
                  </g>

                  {/* ── ELECTRICAL / MEP LAYER ── */}
                  {layers.electrical && (
                    <g pointerEvents="none">
                      <circle cx={pxX + pxW / 2} cy={pxY + pxD / 2 - 18} r="6" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" strokeWidth="1.5" />
                      <line x1={pxX + pxW / 2 - 4} y1={pxY + pxD / 2 - 22} x2={pxX + pxW / 2 + 4} y2={pxY + pxD / 2 - 14} stroke="#F59E0B" strokeWidth="1.2" />
                      <line x1={pxX + pxW / 2 + 4} y1={pxY + pxD / 2 - 22} x2={pxX + pxW / 2 - 4} y2={pxY + pxD / 2 - 14} stroke="#F59E0B" strokeWidth="1.2" />
                      <circle cx={pxX + 10} cy={pxY + pxD - 10} r="3.5" fill="#10B981" />
                      <text x={pxX + 16} y={pxY + pxD - 7} fill="#10B981" fontSize="7px" fontWeight="800">S1</text>
                      <circle cx={pxX + pxW - 10} cy={pxY + 12} r="3" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
                      <path
                        d={`M ${pxX + 10} ${pxY + pxD - 10} Q ${pxX + 14} ${pxY + pxD / 2} ${pxX + pxW / 2} ${pxY + pxD / 2 - 18}`}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    </g>
                  )}

                  {/* ── RESIZE HANDLES ── */}
                  {isSelected && (
                    <g className="interactive-room-handle">
                      {[
                        { h: "nw", x: pxX - 4, y: pxY - 4, cursor: "nwse-resize" },
                        { h: "ne", x: pxX + pxW - 4, y: pxY - 4, cursor: "nesw-resize" },
                        { h: "se", x: pxX + pxW - 4, y: pxY + pxD - 4, cursor: "nwse-resize" },
                        { h: "sw", x: pxX - 4, y: pxY + pxD - 4, cursor: "nesw-resize" },
                      ].map((corner) => (
                        <rect
                          key={corner.h}
                          x={corner.x}
                          y={corner.y}
                          width="8"
                          height="8"
                          fill="#38BDF8"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          rx="1"
                          style={{ cursor: corner.cursor }}
                          onPointerDown={(e) => handlePointerDownRoom(e, room, "resize", corner.h)}
                        />
                      ))}

                      {/* Delete Button */}
                      <g
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <circle cx={pxX + pxW + 6} cy={pxY - 6} r="7" fill="#EF4444" />
                        <text x={pxX + pxW + 6} y={pxY - 3} textAnchor="middle" fill="#FFF" fontSize="8px" fontWeight="900">✕</text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ── EXTERIOR OVERALL DIMENSIONS STRINGS ── */}
            {layers.dimensions && (
              <g pointerEvents="none">
                {/* Width Top */}
                <line
                  x1={-(buildingWidth * METERS_TO_PX) / 2}
                  y1={-(buildingDepth * METERS_TO_PX) / 2 - 20}
                  x2={(buildingWidth * METERS_TO_PX) / 2}
                  y2={-(buildingDepth * METERS_TO_PX) / 2 - 20}
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <text
                  x={0}
                  y={-(buildingDepth * METERS_TO_PX) / 2 - 26}
                  textAnchor="middle"
                  fill="#10B981"
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  ← {buildingWidth.toFixed(2)} m (WIDTH) →
                </text>

                {/* Depth Left */}
                <line
                  x1={-(buildingWidth * METERS_TO_PX) / 2 - 20}
                  y1={-(buildingDepth * METERS_TO_PX) / 2}
                  x2={-(buildingWidth * METERS_TO_PX) / 2 - 20}
                  y2={(buildingDepth * METERS_TO_PX) / 2}
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <text
                  x={-(buildingWidth * METERS_TO_PX) / 2 - 28}
                  y={0}
                  textAnchor="middle"
                  fill="#10B981"
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="monospace"
                  transform={`rotate(-90 ${-(buildingWidth * METERS_TO_PX) / 2 - 28} 0)`}
                >
                  ← {buildingDepth.toFixed(2)} m (DEPTH) →
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* ── BOTTOM FLOATING HUD CONTROLS ── */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: "6px",
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "10px",
            color: "#94A3B8",
            backdropFilter: "blur(8px)",
          }}
        >
          <span>🖱 Drag room</span>
          <span style={{ color: "#475569" }}>•</span>
          <span>📐 Drag corners to resize</span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ color: "#34D399", fontWeight: 700 }}>⚡ Synced to 3D</span>
        </div>

        {/* Zoom Controls */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(15, 23, 42, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            padding: "3px",
          }}
        >
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.12))}
            style={{
              width: "24px",
              height: "24px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              borderRadius: "4px",
              color: "#FFF",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            +
          </button>
          <span style={{ fontSize: "10px", color: "#38BDF8", fontWeight: 700, padding: "0 4px" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.35, z - 0.12))}
            style={{
              width: "24px",
              height: "24px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              borderRadius: "4px",
              color: "#FFF",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            -
          </button>
          <button
            onClick={() => {
              const pad = 64;
              const bldPxW = buildingWidth * METERS_TO_PX;
              const bldPxH = buildingDepth * METERS_TO_PX;
              const autoZoom = Math.min((containerSize.w - pad * 2) / bldPxW, (containerSize.h - pad * 2) / bldPxH);
              setZoom(Math.round(autoZoom * 100) / 100);
              setPan({ x: 0, y: 0 });
            }}
            title="Reset to Fit View"
            style={{
              padding: "3px 6px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              borderRadius: "4px",
              color: "#94A3B8",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            Fit
          </button>
        </div>
      </div>

      {/* ── ADD ROOM MODAL ── */}
      {showAddModal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "#0F172A",
              border: "1px solid #38BDF8",
              borderRadius: "12px",
              padding: "20px",
              width: "420px",
              maxWidth: "92%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, color: "#FFFFFF", fontSize: "15px", fontWeight: 700 }}>
                Select Room Template
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {ROOM_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => handleAddRoom(tmpl)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#38BDF8";
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", marginBottom: "3px" }}>
                    {tmpl.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#38BDF8", fontWeight: 600 }}>
                    {tmpl.w}m × {tmpl.d}m ({(tmpl.w * tmpl.d).toFixed(1)} m²)
                  </span>
                  <span style={{ fontSize: "9px", color: "#64748B", textTransform: "uppercase", marginTop: "3px" }}>
                    {tmpl.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
