// src/app/visualization/page.js
"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Sky } from "@react-three/drei";
import SafeEnvironment from "@/components/ui/SafeEnvironment";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import { a } from "@react-spring/three";
import { motion } from "framer-motion";

// --------------------------
// UI Components
// --------------------------
function Inspector({ room, onClose }) {
  if (!room) return null;
  return (
    <div style={{
      position: "absolute",
      top: 20,
      right: 20,
      background: "rgba(0, 0, 0, 0.6)",
      color: "#fff",
      padding: "1rem",
      borderRadius: "0.75rem",
      backdropFilter: "blur(8px)",
      maxWidth: "320px",
      zIndex: 10,
      fontFamily: "'Inter', sans-serif",
    }}>
      <button onClick={onClose} style={{ float: "right", background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem" }}>✖</button>
      <h3 style={{ margin: "0 0 0.5rem 0" }}>{room.type} (#{room.id})</h3>
      <p style={{ margin: 0 }}><strong>Area:</strong> {room.area} m²</p>
      <p style={{ margin: 0 }}><strong>Sustainability:</strong> {room.sustainability_score}</p>
      <p style={{ margin: 0 }}><strong>Materials:</strong> {room.materials?.join(", ")}</p>
    </div>
  );
}

function Room({ data, onSelect, cutaway }) {
  const { position, dimensions, id, type, area, sustainability_score, materials } = data;
  const [hovered, setHovered] = useState(false);

  // Material adapts to cut‑away mode
  const baseColor = "#8fbcd4";
  const color = cutaway ? "rgba(200,200,200,0.3)" : baseColor;
  const opacity = cutaway ? 0.3 : 1;

  return (
    <group>
      <mesh
        position={[position.x, dimensions.height / 2, position.z]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(data)}
        castShadow
        receiveShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      {hovered && (
        <Html position={[position.x, dimensions.height + 0.2, position.z]} distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "0.3rem 0.6rem",
            borderRadius: "0.4rem",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.85rem",
          }}>
            {type}<br />Area: {area} m²
          </div>
        </Html>
      )}
    </group>
  );
}

// --------------------------
// Main Visualization Page
// --------------------------
export default function VisualizationPage() {
  const [scene, setScene] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [cutaway, setCutaway] = useState(false);

  useEffect(() => {
    async function fetchScene() {
      try {
        const resp = await fetch("/api/scene?blueprint={}&location=Colombo");
        const json = await resp.json();
        if (json.status === "success") setScene(json.scene);
      } catch (e) {
        console.error("Failed to load scene", e);
      }
    }
    fetchScene();
  }, []);

  if (!scene) return <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", padding: "2rem" }}>Loading 3‑D visualization…</div>;

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
      background: "linear-gradient(135deg, #1e1e2f, #2a2b45)",
      fontFamily: "'Inter', sans-serif",
    }}>
        {/* Animated header with title and cut‑away toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "rgba(0, 0, 0, 0.35)",
            padding: "0.5rem 1rem",
            borderRadius: "0.6rem",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.1rem",
          }}
        >
          <motion.h1
            style={{ margin: 0, fontSize: "1.3rem", fontWeight: 600 }}
            whileHover={{ scale: 1.05 }}
          >
            GreenConstructAI – Hotel 3D Visualizer
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCutaway(!cutaway)}
            style={{
              background: "rgba(255,255,255,0.25)",
              border: "none",
              borderRadius: "0.4rem",
              color: "#fff",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {cutaway ? "Full View" : "Cut‑away"}
          </motion.button>
        </motion.div>

      <Inspector room={selectedRoom} onClose={() => setSelectedRoom(null)} />

      <Canvas shadows gl={{ antialias: true }} camera={{ position: [20, 15, 20], fov: 55 }}>
        {/* Atmospheric sky and environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <SafeEnvironment preset="city" />
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={0.9}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Post‑processing for a polished look */}
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} intensity={0.2} />
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
        </EffectComposer>
        <OrbitControls makeDefault />
        {scene.rooms.map(room => (
          <Room key={room.id} data={room} onSelect={setSelectedRoom} cutaway={cutaway} />
        ))}
      </Canvas>
    </div>
  );
}
