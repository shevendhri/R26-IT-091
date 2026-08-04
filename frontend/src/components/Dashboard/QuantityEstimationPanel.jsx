"use client";
import React from 'react';

/**
 * QuantityEstimationPanel – Displays building quantity estimations for engineering validation.
 */
export default function QuantityEstimationPanel({ data }) {
  const quantities = data?.building_quantities;
  const analysis = data?.blueprint_analysis;

  if (!quantities && !analysis) return null;

  const metrics = [
    {
      label: 'Wall Area',
      value: quantities?.wall_area_m2 != null ? `${quantities.wall_area_m2} m²` : (analysis?.total_wall_area != null ? `${analysis.total_wall_area} m²` : 'N/A'),
      desc: 'Gross external wall surface area'
    },
    {
      label: 'Roof Area',
      value: quantities?.roof_area_m2 != null ? `${quantities.roof_area_m2} m²` : (analysis?.roof_area != null ? `${analysis.roof_area} m²` : 'N/A'),
      desc: 'Roof surface including slope factor'
    },
    {
      label: 'Estimated Brick Count',
      value: quantities?.estimated_brick_count != null ? quantities.estimated_brick_count.toLocaleString() : 'N/A',
      desc: 'Based on 230×100mm standard brick (SLS 39)'
    },
    {
      label: 'Estimated Roof Tiles',
      value: quantities?.estimated_roof_tile_count != null ? quantities.estimated_roof_tile_count.toLocaleString() : 'N/A',
      desc: 'Approximate tile count based on roof area'
    },
    {
      label: 'Concrete Volume',
      value: quantities?.concrete_volume_m3 != null ? `${quantities.concrete_volume_m3} m³` : (analysis?.estimated_concrete_volume != null ? `${analysis.estimated_concrete_volume} m³` : 'N/A'),
      desc: 'Structural concrete requirement estimate'
    },
    {
      label: 'Waterproofing Area',
      value: quantities?.waterproofing_area_m2 != null ? `${quantities.waterproofing_area_m2} m²` : 'N/A',
      desc: 'Foundation slab and lower wall protection'
    },
    {
      label: 'Paint Area',
      value: quantities?.paint_area_m2 != null ? `${quantities.paint_area_m2} m²` : 'N/A',
      desc: 'Interior + exterior surface finish area'
    },
    {
      label: 'Foundation Volume',
      value: analysis?.estimated_foundation_volume != null ? `${analysis.estimated_foundation_volume} m³` : 'N/A',
      desc: 'Estimated foundation excavation volume'
    },
  ].filter(m => m.value !== 'N/A');

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk' }}>
          Building Quantity Takeoff & Material Estimates
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
          Computed from blueprint geometry strictly for engineering validation and load assessment.
        </p>
      </div>

      <div style={{
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '6px',
        padding: '0.55rem 0.75rem',
        fontSize: '0.72rem',
        color: '#f59e0b',
        lineHeight: 1.4
      }}>
        <strong>Engineering Validation Notice:</strong> Quantities are approximate structural engineering calculations for model evaluation, not for commercial QS procurement.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem'
          }}>
            <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
