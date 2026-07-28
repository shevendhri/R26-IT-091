import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';

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
    <GlassCard
      className="glass-card"
      style={{
        padding: '1.5rem',
        background: 'linear-gradient(145deg, rgba(20,20,30,0.9) 0%, rgba(15,15,22,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }}></div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2.5rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Column – Project Summary */}
        <div style={{ flex: '1 1 300px', color: '#fff' }}>
          <h2
            style={{
              margin: '0 0 1.2rem 0',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 600,
              fontFamily: 'Space Grotesk',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.4)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            Project Context
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.6rem 2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <span style={{ color: '#9ca3af' }}>Building Type</span>
            <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{buildingType}</span>
            <span style={{ color: '#9ca3af' }}>Location</span>
            <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{location}</span>
            <span style={{ color: '#9ca3af' }}>Climate Zone</span>
            <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{climateZone}</span>
            <span style={{ color: '#9ca3af' }}>Total Area</span>
            <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{totalArea} m²</span>
            <span style={{ color: '#9ca3af' }}>Floors</span>
            <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{floors}</span>
          </div>
        </div>

        {/* Right Column – Scores & CTA */}
        <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Top Row: Scores */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 120px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                AI Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', lineHeight: '1', textShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>{aiScore}</div>
            </div>
            <div style={{ flex: '1 1 120px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Eco Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0ea5e9', lineHeight: '1', textShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }}>{sustainabilityScore}</div>
            </div>
            <div style={{ flex: '1 1 120px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Est. Lifespan
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b', lineHeight: '1', textShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>{lifespan}</div>
            </div>
          </div>

          {/* Bottom Row: Badges & CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ENG VERIFIED
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '4px', background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                CLIMATE OPTIMIZED
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                SLS COMPLIANT
              </span>
            </div>

            <Link
              href="/materials/3d"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease',
                border: '1px solid #3b82f6',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              3D VIEWER
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
