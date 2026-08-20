"use client";
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

import CompactSummaryStrip from '@/components/Report/CompactSummaryStrip';
import ProjectValidationStrip from '@/components/Report/ProjectValidationStrip';
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

// AI Decision Timeline stages — no emojis, use status indicators
const TIMELINE_STAGES = [
  { id: 1, label: 'Questionnaire Completed', desc: 'User profile and requirements captured' },
  { id: 2, label: 'Blueprint Generated', desc: 'Automated floor plan layout produced' },
  { id: 3, label: 'Geometry Extracted', desc: '11 structural and geometric parameters computed' },
  { id: 4, label: 'Climate Analysis', desc: 'Climate zone, humidity, salinity and rainfall profiled' },
  { id: 5, label: 'Engineering Rules Applied', desc: 'SLS structural load constraints validated' },
  { id: 6, label: 'ML Prediction Computed', desc: 'Machine learning model scored all candidates' },
  { id: 7, label: 'Hybrid Ranking Generated', desc: '75% Engineering + 25% ML scores combined' },
  { id: 8, label: 'Top Materials Selected', desc: 'Ranked material package built per component' },
  { id: 9, label: '3D Visualization Ready', desc: 'Conceptual 3D model prepared for launch' },
];

function DecisionTimeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active < TIMELINE_STAGES.length - 1) {
      const t = setTimeout(() => setActive(prev => prev + 1), 200);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    <section>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        AI Execution Trace — Decision Stages
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {TIMELINE_STAGES.map((stage, i) => {
          const isDone = i <= active;
          return (
            <div key={stage.id} style={{
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center',
              background: isDone ? 'rgba(16, 185, 129, 0.04)' : '#090d16',
              padding: '0.4rem 0.65rem',
              borderRadius: '4px',
              border: isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #1e293b'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                border: isDone ? '1px solid #10b981' : '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                color: isDone ? '#10b981' : '#64748b',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {isDone ? '✓' : stage.id}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isDone ? '#f8fafc' : '#64748b' }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
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
      background: '#090d16',
      border: '1px solid #1e293b',
      borderRadius: '6px',
      padding: '0.85rem 1rem',
    }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Personalized Specification Profile
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem' }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.35rem 0.5rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{row.label}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>{row.value}</span>
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
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
        <Header />
        <div style={{ padding: '3rem', color: '#64748b', textAlign: 'center', marginTop: '10vh' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>Initializing Engineering Decision Support System...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', color: '#f8fafc' }}>
      <div className="premium-bg">
        <div className="gradient-mesh" />
        <div className="blueprint-grid" />
      </div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        {!reportData ? (
          <div style={{ padding: '3rem', color: '#94a3b8', textAlign: 'center', marginTop: '10vh', minHeight: '60vh' }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              No Report Data Available
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Please complete the material recommendation questionnaire to generate a report.
            </div>
          </div>
        ) : (
          <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* 1. Compact Project Context Telemetry Strip */}
            <CompactSummaryStrip data={reportData} />

            {/* 1b. Project Validation Status Strip & Review Gate */}
            <ProjectValidationStrip data={reportData} />

            {/* 2. Primary Recommendation — the main visual focus */}
            <div style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}>
              <MaterialBreakdown data={reportData} />
            </div>

            {/* 3. Supporting Analysis — All Collapsed by Default */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

              <Accordion title="Hybrid Score Breakdown & Decision Factors" subtitle="Engineering Rules + ML Weighting Methodology">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
                  <HybridScorePanel data={reportData} />
                  <DecisionFactorsPanel data={reportData} />
                </div>
              </Accordion>

              <Accordion title="Alternative Material Evaluation Matrix" subtitle="Ranked Candidate Comparison by Component">
                <AlternativesTable data={reportData} />
              </Accordion>

              <Accordion title="Blueprint Geometry & Floorplan Parameters" subtitle="11 Structural Dimensions & Schematic Layout">
                <BlueprintPanel data={reportData} />
              </Accordion>

              <Accordion title="Quantity Takeoff & Material Estimates" subtitle="Structural Unit Volumes from Geometry Computation">
                <QuantityEstimationPanel data={reportData} />
              </Accordion>

              <Accordion title="Project Specification & Sri Lankan Climate Profile" subtitle="Environmental Constraints & Sustainability Context">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <ProjectProfileCard data={reportData} />
                  <ProjectOverview data={reportData} />
                  <SustainabilityDashboard data={reportData} />
                </div>
              </Accordion>

              <Accordion title="Explainable AI — Feature Importance (XAI)" subtitle="ML Model Feature Weights & Contribution Profile">
                <FeatureImportance data={reportData} />
              </Accordion>

              <Accordion title="AI Execution Trace & System Audit Log" subtitle="Decision Stage Timeline & Full Evaluation Stream">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
                  <DecisionTimeline />
                  <AuditLogPanel data={reportData} />
                </div>
              </Accordion>

            </div>

          </main>
        )}
        <Footer />
      </div>
    </div>
  );
}
