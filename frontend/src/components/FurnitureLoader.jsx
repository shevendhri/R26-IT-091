// frontend/src/components/FurnitureLoader.jsx
"use client";
import React from "react";

/**
 * FurnitureLoader renders the procedural fallback component directly.
 * GLB model loading is disabled since no GLB assets are available.
 * When GLB models are added to /public/models/furniture/, this component
 * can be updated to attempt loading them first.
 */
export default function FurnitureLoader({ url, fallback, ...props }) {
  // Always render the procedural fallback geometry
  return fallback || null;
}
