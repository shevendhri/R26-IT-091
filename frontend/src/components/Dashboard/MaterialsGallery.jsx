"use client";
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * MaterialsGallery – displays a premium gallery of recommended material categories.
 * Expects `data.recommended_package` containing category objects.
 *
 * Data Traceability:
 *   Material Category  → Object keys from recommended_package
 *   Material Name      → recommended_package[category].name
 */
export default function MaterialsGallery({ data }) {
  if (!data) return null;

  const pkg = data?.recommended_package || {};
  const categories = Object.keys(pkg).filter((key) => typeof pkg[key] === 'object' && pkg[key] !== null);

  if (categories.length === 0) return null;

  // Custom text-based professional structural badges instead of emojis
  const getBadgeCode = (cat) => {
    const badges = {
      foundation: { text: 'FD', bg: 'rgba(0, 255, 157, 0.1)', color: 'var(--eco-glow)' },
      structural: { text: 'ST', bg: 'rgba(14, 165, 233, 0.1)', color: 'var(--blueprint-blue)' },
      concrete: { text: 'CC', bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warn-amber)' },
      walling: { text: 'WL', bg: 'rgba(255, 255, 255, 0.05)', color: '#fff' },
      walls: { text: 'WL', bg: 'rgba(255, 255, 255, 0.05)', color: '#fff' },
      roofing: { text: 'RF', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--eco-emerald)' },
      roof: { text: 'RF', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--eco-emerald)' },
      windows: { text: 'WD', bg: 'rgba(14, 165, 233, 0.1)', color: 'var(--blueprint-blue)' },
      doors: { text: 'DR', bg: 'rgba(255, 255, 255, 0.05)', color: '#fff' },
      flooring: { text: 'FL', bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warn-amber)' },
      ceiling: { text: 'CL', bg: 'rgba(0, 255, 157, 0.1)', color: 'var(--eco-glow)' },
      finishes: { text: 'FN', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--eco-emerald)' },
      finishing: { text: 'FN', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--eco-emerald)' },
      waterproofing: { text: 'WP', bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-red)' },
    };
    return badges[cat.toLowerCase()] || { text: 'MT', bg: 'rgba(255, 255, 255, 0.05)', color: '#fff' };
  };

  return (
    <GlassCard className="dashboard-section materials-gallery" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk', fontSize: '1.4rem' }}>
        Materials Specification Index
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.25rem',
      }}>
        {categories.map((cat) => {
          const entry = pkg[cat];
          const obj = Array.isArray(entry) ? entry[0] : entry;
          const label = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
          const badge = getBadgeCode(cat);

          return (
            <div
              key={cat}
              className="gallery-card"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.85rem',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = badge.color;
                e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: badge.bg,
                border: `1px solid ${badge.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 900,
                color: badge.color,
                fontFamily: 'Space Grotesk',
                letterSpacing: '1px',
                boxShadow: `0 0 10px ${badge.bg}`
              }}>
                {badge.text}
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1.3 }}>
                  {obj.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
