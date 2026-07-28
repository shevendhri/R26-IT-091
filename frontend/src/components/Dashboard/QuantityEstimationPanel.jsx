"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * QuantityEstimationPanel – Displays building quantity estimations
 * strictly for engineering validation purposes.
 *
 * Data Traceability:
 *   Building Quantities → data.building_quantities
 *   Blueprint Analysis  → data.blueprint_analysis
 */
export default function QuantityEstimationPanel({ data }) {
  const quantities = data?.building_quantities;
  const analysis = data?.blueprint_analysis;

  if (!quantities && !analysis) return null;

  const metrics = [
    {
      label: 'Wall Area',
      value: quantities?.wall_area_m2 != null ? `${quantities.wall_area_m2} m²` : (analysis?.total_wall_area != null ? `${analysis.total_wall_area} m²` : 'N/A'),
      icon: '🧱',
      color: '#0ea5e9',
      desc: 'Gross external wall surface area'
    },
    {
      label: 'Roof Area',
      value: quantities?.roof_area_m2 != null ? `${quantities.roof_area_m2} m²` : (analysis?.roof_area != null ? `${analysis.roof_area} m²` : 'N/A'),
      icon: '🏠',
      color: '#a78bfa',
      desc: 'Roof surface including slope factor'
    },
    {
      label: 'Estimated Brick Count',
      value: quantities?.estimated_brick_count != null ? quantities.estimated_brick_count.toLocaleString() : 'N/A',
      icon: '🔢',
      color: '#f97316',
      desc: 'Based on 230×100mm standard brick (SLS 39)'
    },
    {
      label: 'Estimated Roof Tiles',
      value: quantities?.estimated_roof_tile_count != null ? quantities.estimated_roof_tile_count.toLocaleString() : 'N/A',
      icon: '🏗️',
      color: '#fbbf24',
      desc: 'Approximate tile count based on roof area'
    },
    {
      label: 'Concrete Volume',
      value: quantities?.concrete_volume_m3 != null ? `${quantities.concrete_volume_m3} m³` : (analysis?.estimated_concrete_volume != null ? `${analysis.estimated_concrete_volume} m³` : 'N/A'),
      icon: '🏛️',
      color: '#34d399',
      desc: 'Structural concrete requirement estimate'
    },
    {
      label: 'Waterproofing Area',
      value: quantities?.waterproofing_area_m2 != null ? `${quantities.waterproofing_area_m2} m²` : 'N/A',
      icon: '💧',
      color: '#06b6d4',
      desc: 'Foundation slab and lower wall protection'
    },
    {
      label: 'Paint Area',
      value: quantities?.paint_area_m2 != null ? `${quantities.paint_area_m2} m²` : 'N/A',
      icon: '🎨',
      color: '#ec4899',
      desc: 'Interior + exterior surface finish area'
    },
    {
      label: 'Foundation Volume',
      value: analysis?.estimated_foundation_volume != null ? `${analysis.estimated_foundation_volume} m³` : 'N/A',
      icon: '⬛',
      color: '#94a3b8',
      desc: 'Estimated foundation excavation volume'
    },
  ].filter(m => m.value !== 'N/A');

  const disclaimer = quantities?.disclaimer;

  return (
    <GlassCard className="dashboard-section" style={{ position: 'relative' }}>
      {/* Accent */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px',
        background: 'radial-gradient(circle at 100% 100%, rgba(14, 165, 233, 0.08), transparent 70%)',
        pointerEvents: 'none'
      }}/>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Engineering Estimation
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', fontFamily: 'Space Grotesk', margin: 0 }}>
          Building Quantity Estimation
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          Computed from blueprint geometry for engineering validation and structural checks.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div style={{
        background: 'rgba(251, 191, 36, 0.06)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        borderRadius: '8px',
        padding: '0.6rem 0.85rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        fontSize: '0.72rem',
        color: '#fbbf24',
        lineHeight: 1.4
      }}>
        <span><strong>Engineering Validation Only</strong> — Quantities are approximate engineering calculations and are not intended for procurement, pricing, or commercial quantity surveying.</span>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${m.color}20`,
            borderRadius: '10px',
            padding: '0.85rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Color accent left bar */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: '3px',
              background: m.color,
              borderRadius: '10px 0 0 10px'
            }}/>

            <div style={{ paddingLeft: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{m.icon}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {m.label}
                </span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: m.color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                {m.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
