// Narrative.jsx – project narrative component
"use client";
import React, { useState, useEffect } from "react";
import GlassCard from '@/components/ui/GlassCard';

/**
 * Narrative – displays project narrative or engineering verdict.
 * Falls back to a friendly placeholder when no text is available.
 */
export default function Narrative({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const text = data?.narrative ?? data?.engineering_verdict ?? "";
  if (!text) {
    return (
      <GlassCard className="dashboard-section narrative">
        <h2 style={{ marginTop: 0 }}>Narrative</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          No narrative available.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="dashboard-section narrative">
      <h2 style={{ marginTop: 0 }}>Narrative</h2>
      <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
        {text}
      </p>
    </GlassCard>
  );
}
