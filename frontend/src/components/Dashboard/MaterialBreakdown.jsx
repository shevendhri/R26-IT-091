import React from 'react';
import EngineeringCard from '@/components/Dashboard/EngineeringCard';

/**
 * MaterialBreakdown – Renders exactly ONE primary recommended card per canonical component.
 * Updated for high-contrast warm sustainable architecture theme.
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
      if (obj.canonical_component && obj.canonical_component !== comp.key) {
        continue;
      }
      canonicalItems.push({
        key: comp.key,
        label: comp.label,
        material: obj
      });
    }
  }

  if (canonicalItems.length === 0) {
    return (
      <section style={{ padding: '1rem', color: '#526158' }}>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>No material specification data available.</p>
      </section>
    );
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2DCD0', paddingBottom: '1.1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.30rem', fontWeight: 800, color: '#143825', margin: 0, fontFamily: 'Outfit, Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
            Primary Recommended Material Package
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#526158', margin: '0.35rem 0 0 0', fontWeight: 500, lineHeight: 1.5 }}>
            Engineered specifications selected by the Hybrid Recommendation Engine for Sri Lankan climate and SLS-referenced rule checks.
          </p>
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '6px 14px',
          borderRadius: '4px',
          background: '#EBF3ED',
          border: '1px solid #D2E4D6',
          color: '#143825',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'Space Grotesk, sans-serif',
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 3px rgba(20, 56, 37, 0.04)',
        }}>
          ✓ Rank #1 Specification Package
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {canonicalItems.map((item) => (
          <EngineeringCard key={item.key} label={item.label} material={item.material} />
        ))}
      </div>
    </section>
  );
}
