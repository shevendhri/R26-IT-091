import React from "react";

// Header component for the 3D visualization page
// Provides a sleek top bar with the application title and optional branding.
// Uses a semi‑transparent dark background with backdrop blur for a modern look.

export default function Header() {
  return (
    <header style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      background: "rgba(0, 0, 0, 0.35)",
      color: "#fff",
      backdropFilter: "blur(8px)",
      zIndex: 20,
      fontFamily: "'Inter', sans-serif",
      fontSize: "1.25rem",
    }}>
      <div style={{ fontWeight: "600" }}>GreenConstructAI – Hotel Visualizer</div>
      {/* Placeholder for a logo or branding image */}
      <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.2)", borderRadius: "50%" }} />
    </header>
  );
}
