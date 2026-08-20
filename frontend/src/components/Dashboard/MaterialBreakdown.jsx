import React from 'react';
import EngineeringCard from '@/components/Dashboard/EngineeringCard';

/**
 * MaterialBreakdown – Renders exactly ONE primary recommended card per canonical component.
 * Eliminates duplicate cards and standardizes taxonomy.
 */
const CANONICAL_COMPONENTS = [
  { key: 'foundation', label: 'Foundation', fallbackKeys: ['foundation'] },
  { key: 'structural_frame', label: 'Structural Frame', fallbackKeys: ['structural_frame', 'structural_concrete', 'structural', 'concrete'] },
  { key: 'reinforcement', label: 'Reinforcement', fallbackKeys: ['reinforcement', 'structural_rebar'] },
  { key: 'walling', label: 'Walling', fallbackKeys: ['walling', 'walls'] },
  { key: 'roofing', label: 'Roofing', fallbackKeys: ['roofing'] },
  { key: 'windows', label: 'Windows', fallbackKeys: ['windows'] },
  { key: 'doors', label: 'Doors', fallbackKeys: ['doors'] },
  { key: 'flooring', label: 'Flooring', fallbackKeys: ['flooring'] },
  { key: 'ceiling', label: 'Ceiling', fallbackKeys: ['ceiling'] },
  { key: 'finishes', label: 'Finishes', fallbackKeys: ['finishes', 'finishing'] },
  { key: 'waterproofing', label: 'Waterproofing', fallbackKeys: ['waterproofing'] },
];

export default function MaterialBreakdown({ data }) {
  if (!data) return null;
  
  const pkg = data?.recommended_package || {};

  // Resolve unique canonical list
  const seenMaterialNames = new Set();
  const canonicalItems = [];

  for (const comp of CANONICAL_COMPONENTS) {
    let resolved = null;
    for (const k of comp.fallbackKeys) {
      if (pkg[k]) {
        resolved = pkg[k];
        break;
      }
    }
    if (resolved) {
      const obj = Array.isArray(resolved) ? resolved[0] : typeof resolved === 'object' ? resolved : { name: resolved };
      const matName = obj?.name || '';
      // Only avoid duplicate if it's identical material in the same phase
      canonicalItems.push({
        key: comp.key,
        label: comp.label,
        material: obj
      });
    }
  }

  if (canonicalItems.length === 0) {
    return (
      <section style={{ padding: '1rem', color: '#64748b' }}>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>No material specification data available.</p>
      </section>
    );
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk' }}>
            Primary Recommended Material Package
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
            Engineered specifications selected by the Hybrid Recommendation Engine for Sri Lankan climate and SLS-referenced rule checks.
          </p>
        </div>
        <span className="telemetry-badge telemetry-badge-success">
          Rank #1 Specification Package
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {canonicalItems.map((item) => (
          <EngineeringCard key={item.key} label={item.label} material={item.material} />
        ))}
      </div>
    </section>
  );
}
