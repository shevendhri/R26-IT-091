import React from 'react';
import EngineeringCard from '@/components/Dashboard/EngineeringCard';

/**
 * MaterialBreakdown – Displays recommended material specifications inside structured cards.
 * Labeled explicitly as "3. AI Recommendation Explanation" to align with data traceability profiles.
 *
 * Data Traceability:
 *   Material Breakdown  → data.recommended_package
 */
export default function MaterialBreakdown({ data }) {
  if (!data) return null;
  
  const pkg = data?.recommended_package || {};
  const categories = Object.keys(pkg).filter(key => typeof pkg[key] === 'object' && pkg[key] !== null);

  if (categories.length === 0) {
    return (
      <section className="glass-card">
        <div className="section-header">
          <span className="section-dot eco"></span>
          <h2>3. AI Recommendation Explanation</h2>
        </div>
        <p style={{ color: 'var(--text-dim)' }}>No material data available.</p>
      </section>
    );
  }

  return (
    <section className="glass-card">
      <div className="section-header">
        <span className="section-dot eco"></span>
        <h2>3. AI Recommendation Explanation</h2>
      </div>
      <div className="card-grid">
        {categories.map((cat) => {
          const entry = pkg[cat];
          if (!entry) return null;
          const obj = Array.isArray(entry) ? entry[0] : typeof entry === 'object' ? entry : { name: entry };
          const label = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
          return <EngineeringCard key={cat} label={label} material={obj} />;
        })}
      </div>
    </section>
  );
}
