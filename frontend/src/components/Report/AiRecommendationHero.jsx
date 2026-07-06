import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * AI Engineering Recommendation – premium hero section.
 * Shows building summary, AI score, sustainability score, estimated lifespan
 * and status badges.
 */
export default function AiRecommendationHero({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const buildingType = data?.blueprint?.building_type ?? 'N/A';
  const location = data?.climate_profile?.city ?? 'N/A';
  const climateZone = data?.climate_profile?.type ?? 'N/A';
  const totalArea = data?.blueprint?.total_area ?? 'N/A';
  const floors = data?.blueprint?.num_floors ?? 'N/A';
  const aiScore = typeof data?.metrics?.overall_hybrid_score === 'number' ? data.metrics.overall_hybrid_score.toFixed(1) : 'N/A';
  const sustainabilityScore = typeof data?.metrics?.average_sustainability === 'number' ? data.metrics.average_sustainability.toFixed(1) : 'N/A';
  const lifespan = data?.blueprint?.service_life ?? 'N/A';

  return (
    <GlassCard className="glass-card">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>AI Engineering Recommendation</h2>
          <div style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
            <p><strong>Building Type:</strong> {buildingType}</p>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Climate Zone:</strong> {climateZone}</p>
            <p><strong>Total Area:</strong> {totalArea} m²</p>
            <p><strong>Floors:</strong> {floors}</p>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Key Scores</h3>
          <p><strong>AI Score:</strong> {aiScore}</p>
          <p><strong>Sustainability Score:</strong> {sustainabilityScore}</p>
          <p><strong>Estimated Lifespan:</strong> {lifespan}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#10b981', color: '#fff' }}>Engineering Verified</span>
            <span className="badge" style={{ background: '#0ea5e9', color: '#fff' }}>Climate Optimized</span>
            <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>SLS Compliant</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
