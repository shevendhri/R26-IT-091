// frontend/src/components/RoomFurniture.jsx
"use client";
import React, { useMemo } from "react";
import { useMaterial } from "../context/MaterialContext";
import { getRoomTypeFromLabel } from "./FurnitureMap";
import { getFurniturePlacement } from "./FurniturePlacement";
import FurnitureFactory from "./FurnitureFactory";

// Height constants matching Building3DModel
const FLOOR_H = 3.0;
const SLAB_T = 0.20;

/**
 * RoomFurniture orchestrates and renders the furnished objects inside a room.
 * Resolves room type, fetches calculated layout placement coordinates,
 * and renders FurnitureFactory instances.
 */
export default function RoomFurniture({ room, floorIdx, presentationMode }) {
  const { buildingRequirements, buildingInfo } = useMaterial() || {};

  const buildingType = buildingInfo?.building_type || "Residential";

  const items = useMemo(() => {
    // Resolve room type from label
    let roomType = getRoomTypeFromLabel(room.label);
    
    // Fallback if the room label is generic or unrecognized
    if (!roomType) {
      if (room.type === 'WET') {
        roomType = "Bathroom";
      } else {
        const bTypeStr = (buildingType || "").toLowerCase();
        if (bTypeStr.includes('commercial') || bTypeStr.includes('industrial') || bTypeStr.includes('office')) {
          roomType = "Office";
        } else {
          roomType = "Bedroom"; 
        }
      }
    }

    // Calculate layout using the placement engine
    return getFurniturePlacement(
      roomType,
      room.w,
      room.h,
      buildingRequirements || {},
      buildingType
    );
  }, [room.label, room.w, room.h, buildingRequirements, buildingType]);

  if (items.length === 0) return null;

  // Base Y height elevation
  const yBase = floorIdx * FLOOR_H + SLAB_T;

  return (
    <group position={[room.x + room.w / 2, yBase, room.y + room.h / 2]}>
      {items.map((item, i) => (
        <FurnitureFactory
          key={i}
          name={item.name}
          position={item.pos}
          rotation={item.rot}
          scale={item.scale}
        />
      ))}
    </group>
  );
}
