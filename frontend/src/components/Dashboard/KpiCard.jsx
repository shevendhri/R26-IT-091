"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

export default function KpiCard({ label, value }) {
  return (
    <GlassCard className="kpi-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </GlassCard>
  );
}
