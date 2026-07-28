"use client";
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

// Import Premium Dashboard Components
import ExecutiveHero from '@/components/Dashboard/ExecutiveHero';
import AiRecommendationHero from '@/components/Report/AiRecommendationHero';
import Accordion from '@/components/ui/Accordion';
import BlueprintPanel from '@/components/Dashboard/BlueprintPanel';
import ProjectOverview from '@/components/Dashboard/ProjectOverview';
import SustainabilityDashboard from '@/components/Dashboard/SustainabilityDashboard';
import FeatureImportance from '@/components/Dashboard/FeatureImportance';
import MaterialBreakdown from '@/components/Dashboard/MaterialBreakdown';
import AlternativesTable from '@/components/Dashboard/AlternativesTable';
import AuditLogPanel from '@/components/Dashboard/AuditLogPanel';
import HybridScorePanel from '@/components/Dashboard/HybridScorePanel';
import DecisionFactorsPanel from '@/components/Dashboard/DecisionFactorsPanel';
import QuantityEstimationPanel from '@/components/Dashboard/QuantityEstimationPanel';

// AI Decision Timeline stages
const TIMELINE_STAGES = [
  { id: 1, label: 'Questionnaire Completed', icon: '📋', desc: 'User profile and requirements captured' },
  { id: 2, label: 'Blueprint Generated', icon: '🏗️', desc: 'Automated floor plan layout produced' },
  { id: 3, label: 'Geometry Extracted', icon: '📐', desc: '11 structural and geometric parameters computed' },
  { id: 4, label: 'Climate Analysis', icon: '🌤️', desc: 'Climate zone, humidity, salinity and rainfall profiled' },
  { id: 5, label: 'Engineering Rules Applied', icon: '⚙️', desc: 'SLS structural load constraints validated' },
  { id: 6, label: 'ML Prediction Computed', icon: '🤖', desc: 'Machine learning model scored all candidates' },
  { id: 7, label: 'Hybrid Ranking Generated', icon: '🏆', desc: '75% Engineering + 25% ML scores combined' },
  { id: 8, label: 'Top Materials Selected', icon: '✅', desc: 'Ranked material package built per component' },
  { id: 9, label: '3D Visualization Ready', icon: '🔭', desc: 'Conceptual 3D model prepared for launch' },
];

function DecisionTimeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active < TIMELINE_STAGES.length - 1) {
      const t = setTimeout(() => setActive(prev => prev + 1), 200);
      return () => clearTimeout(t);
    }
  }, [active]);

  return <section style={{
         background: 'rgba(255,255,255,0.015)',
         border: '1px solid rgba(255,255,255,0.04)',
         borderRadius: '12px',
         padding: '1.5rem',
       }}>      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        AI Execution Trace
      </div>
      <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'Space Grotesk', margin: '0 0 1.25rem 0' }}>
        Decision Timeline
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {TIMELINE_STAGES.map((stage, i) => {
          const isDone = i <= active;
          const isLast = i === TIMELINE_STAGES.length - 1;
          return (
            <div key={stage.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {/* Connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--eco-glow)' : 'rgba(255,255,255,0.06)',
                  border: isDone ? '2px solid var(--eco-glow)' : '2px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  transition: 'all 0.4s ease',
                  boxShadow: isDone ? '0 0 12px rgba(0,255,157,0.3)' : 'none',
                  color: isDone ? '#000' : 'var(--text-dim)',
                  fontWeight: 900
                }}>
                  {isDone ? '✓' : stage.id}
                </div>
                {!isLast && (
                  <div style={{
                    width: '2px',
                    height: '32px',
                    background: isDone ? 'rgba(0,255,157,0.3)' : 'rgba(255,255,255,0.05)',
                    transition: 'background 0.4s ease'
                  }}/>
                )}
              </div>

              {/* Content */}
              <div style={{ paddingTop: '4px', paddingBottom: isLast ? 0 : '1rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem' }}>{stage.icon}</span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: isDone ? 700 : 500,
                    color: isDone ? '#fff' : 'var(--text-dim)',
                    fontFamily: 'Space Grotesk',
                    transition: 'color 0.4s ease'
                  }}>
                    {stage.label}
                  </span>
                </div>
                <div style={{ fontSize: '0.67rem', color: isDone ? 'var(--text-secondary)' : 'rgba(255,255,255,0.2)', marginTop: '2px', lineHeight: 1.4, transition: 'color 0.4s ease' }}>
                  {stage.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>;
}

function ProjectProfileCard({ data }) {
  const bp = data?.blueprint || {};
  const climate = data?.climate_profile || {};
  const conf = data?.confidence || {};

  const rows = [
    { label: 'Location', value: climate.city || 'N/A' },
    { label: 'Building Type', value: bp.building_type || 'N/A' },
    { label: 'Floors', value: bp.num_floors ? `${bp.num_floors} Floors` : 'N/A' },
    { label: 'Total Area', value: bp.total_area ? `${bp.total_area} m²` : 'N/A' },
    { label: 'Climate Zone', value: climate.type || 'N/A' },
    { label: 'Humidity', value: climate.humidity || 'N/A' },
    { label: 'Salinity', value: climate.salinity || 'N/A' },
    { label: 'Structural System', value: bp.structural_system || 'N/A' },
    { label: 'Decision Confidence', value: conf.confidence_level || 'N/A' },
  ];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.015)',
      border: '1px solid rgba(14,165,233,0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0ea5e9', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Personalized Recommendation
      </div>
      <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'Space Grotesk', margin: '0 0 1rem 0' }}>
        Project Profile
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.55rem 0',
            borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{row.label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk', textAlign: 'right', maxWidth: '55%' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { reportData } = useMaterial();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: 'var(--text-primary)' }}>
        <Header />
        <div style={{ padding: '2rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10vh' }}>
          <h2>Initializing Engineering Dashboard...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div className="premium-bg">
        <div className="gradient-mesh" />
        <div className="blueprint-grid" />
        <div className="topo-pattern" />
      </div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        {!reportData ? (
          <div style={{ padding: '2rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10vh', minHeight: '60vh' }}>
            <h2>Initializing Engineering Dashboard...</h2>
          </div>
        ) : (
          <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Section 1: Executive Summary Hero Banner */}
            <ExecutiveHero data={reportData} />
            <AiRecommendationHero data={reportData} />

            {/* Section 2: Hybrid Score + Decision Factors (Full Width) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              gap: '2rem',
              alignItems: 'start'
            }}>
               <HybridScorePanel data={reportData} />
               <DecisionFactorsPanel data={reportData} />
            </div>

            {/* Section 3: Split Grid Layout – Blueprint + Recommendations on left, sidebar on right */}
            <div className="report-layout-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
              gap: '2rem',
              alignItems: 'start'
            }}>

              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <Accordion title="Blueprint & Geometry" defaultOpen={false}>
                  <BlueprintPanel data={reportData} />
                </Accordion>
                <Accordion title="Material Package Details" defaultOpen={false}>
                  <MaterialBreakdown data={reportData} />
                </Accordion>
                <Accordion title="Quantity Estimation" defaultOpen={false}>
                  <QuantityEstimationPanel data={reportData} />
                </Accordion>
              </div>

              {/* Right Column – Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <Accordion title="AI Decision Timeline" defaultOpen={false}>
                  <DecisionTimeline />
                </Accordion>
                <Accordion title="Project Profile" defaultOpen={false}>
                  <ProjectProfileCard data={reportData} />
                </Accordion>
                <Accordion title="Project & Climate Overview" defaultOpen={false}>
                  <ProjectOverview data={reportData} />
                </Accordion>
                <Accordion title="Sustainability KPIs" defaultOpen={false}>
                  <SustainabilityDashboard data={reportData} />
                </Accordion>
                <Accordion title="Feature Importance (XAI)" defaultOpen={false}>
                  <FeatureImportance data={reportData} />
                </Accordion>
                <Accordion title="Alternative Materials" defaultOpen={false}>
                  <AlternativesTable data={reportData} />
                </Accordion>
                <Accordion title="Audit Log" defaultOpen={false}>
                  <AuditLogPanel data={reportData} />
                </Accordion>
              </div>

            </div>

          </main>
        )}
        <Footer />
      </div>
    </div>
  );
}
