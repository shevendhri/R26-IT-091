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
      height: "4.2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      background: "rgba(7, 24, 16, 0.75)",
      color: "#fff",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(74, 222, 128, 0.15)",
      zIndex: 20,
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "1.15rem" }}>
        <span style={{ fontWeight: 900, color: "#4ADE80" }}>GREEN</span>
        <span style={{ fontWeight: 700, color: "#FFFFFF" }}>CONSTRUCT</span>
        <span style={{
          fontWeight: 900,
          fontSize: "0.75rem",
          color: "#071810",
          background: "linear-gradient(135deg, #4ADE80, #22c55e)",
          borderRadius: "5px",
          padding: "1px 7px",
          marginLeft: "4px"
        }}>AI</span>
        <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 8px" }}>·</span>
        <span style={{ fontSize: "0.95rem", color: "#A8C8B4", fontWeight: 600 }}>Hotel 3D Visualizer</span>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.7rem",
        color: "#4ADE80",
        fontWeight: 700,
        background: "rgba(74, 222, 128, 0.1)",
        border: "1px solid rgba(74, 222, 128, 0.25)",
        padding: "5px 12px",
        borderRadius: "100px"
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80" }} />
        INTERACTIVE 3D
      </div>
    </header>
  );
}
