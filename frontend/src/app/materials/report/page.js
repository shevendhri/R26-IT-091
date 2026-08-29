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
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.65rem', fontFamily: 'Space Grotesk' }}>
        AI Execution Trace — Decision Stages
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {TIMELINE_STAGES.map((stage, i) => {
          const isDone = i <= active;
          return (
            <div key={stage.id} style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              background: isDone ? '#DDE8DE' : '#F7F9F6',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: isDone ? '1px solid rgba(36, 92, 67, 0.3)' : '1px solid #C8D3CA'
            }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: isDone ? '#245C43' : '#DCE5DC',
                color: isDone ? '#FFFFFF' : '#526158',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {isDone ? '✓' : stage.id}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isDone ? '#18251F' : '#526158' }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#526158', fontWeight: 500 }}>
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
      background: '#F7F9F6',
      border: '1px solid #C8D3CA',
      borderRadius: '12px',
      padding: '1rem 1.2rem',
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'Space Grotesk' }}>
        Personalized Specification Profile
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '0.45rem 0.75rem',
            background: '#FFFFFF',
            borderRadius: '6px',
            border: '1px solid #C8D3CA'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#526158', fontWeight: 600 }}>{row.label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#18251F', fontFamily: 'Space Grotesk' }}>{row.value}</span>
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
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 15% 10%, rgba(47, 107, 79, 0.10), transparent 30%), radial-gradient(circle at 85% 20%, rgba(120, 184, 147, 0.12), transparent 25%), #EEF1EC',
        color: '#18251F'
      }}>
        <Header />
        <div style={{ padding: '3rem', color: '#526158', textAlign: 'center', marginTop: '10vh' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', fontWeight: 700 }}>Initializing Engineering Decision Support System...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #DCE7DF 0%, #E7EFE9 45%, #DCE6ED 100%)',
      color: '#14221B',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Header />
      {!reportData ? (
        <div style={{ padding: '3rem', color: '#526158', textAlign: 'center', marginTop: '10vh', minHeight: '60vh' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#18251F' }}>
            No Report Data Available
          </div>
          <div style={{ fontSize: '0.9rem', color: '#526158', fontWeight: 500 }}>
            Please complete the material recommendation questionnaire to generate a report.
          </div>
        </div>
      ) : (
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 10 }}>

          {/* 1. Compact Project Context Telemetry Strip */}
          <CompactSummaryStrip data={reportData} />

          {/* 1b. Project Validation Status Strip & Review Gate */}
          <ProjectValidationStrip data={reportData} />

          {/* 2. Primary Recommendation — the main visual focus */}
          <div className="glass-card" style={{
            background: 'linear-gradient(145deg, #FFFFFF 60%, #F6F8F5 100%)',
            borderTop: '4px solid #1E5438',
            borderRight: '1px solid #BDCEBF',
            borderBottom: '1px solid #BDCEBF',
            borderLeft: '1px solid #BDCEBF',
            borderRadius: '20px',
            padding: '1.6rem',
            boxShadow: '0 4px 16px rgba(24, 37, 31, 0.07), 0 18px 48px rgba(24, 37, 31, 0.08)',
          }}>
            <MaterialBreakdown data={reportData} />
          </div>

          {/* 3. Supporting Analysis — All Collapsed by Default */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            <Accordion title="Hybrid Score Breakdown & Decision Factors" subtitle="Engineering Rules + ML Weighting Methodology">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ProjectProfileCard data={reportData} />
                <ProjectOverview data={reportData} />
                <SustainabilityDashboard data={reportData} />
              </div>
            </Accordion>

            <Accordion title="Explainable AI — Feature Importance (XAI)" subtitle="ML Model Feature Weights & Contribution Profile">
              <FeatureImportance data={reportData} />
            </Accordion>

            <Accordion title="AI Execution Trace & System Audit Log" subtitle="Decision Stage Timeline & Full Evaluation Stream">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
                <DecisionTimeline />
                <AuditLogPanel data={reportData} />
              </div>
            </Accordion>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              MODULE 02: MATERIAL SPECIFICATION USER EVALUATION CARD
          ══════════════════════════════════════════════════════════════ */}
          <div style={{
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, #FFFFFF 50%, #DEEFE2 100%)',
            borderTop: '4px solid #1E5438',
            borderRight: '1px solid #BDCEBF',
            borderBottom: '1px solid #BDCEBF',
            borderLeft: '1px solid #BDCEBF',
            borderRadius: '20px',
            padding: '1.8rem 2.2rem',
            boxShadow: '0 4px 18px rgba(30, 84, 56, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                <span style={{
                  background: '#C6E2CD',
                  color: '#1E5438',
                  borderRadius: '20px',
                  padding: '2px 10px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk'
                }}>
                  ● MODULE 02 EVALUATION
                </span>
                <span style={{ fontSize: '0.72rem', color: '#42554A', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  USER FEEDBACK
                </span>
              </div>

              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#14221B',
                margin: '0 0 0.35rem'
              }}>
                Evaluate Material Recommendations
              </h3>

              <p style={{ fontSize: '0.84rem', color: '#42554A', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                How accurate and feasible were these material recommendations? Share your feedback to help us refine the hybrid MCDM and machine learning models.
              </p>
            </div>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdDr5VrYMSK1rY-kMCD5LRCFD6NDlJXLA5nRAGruQrSihD5Rw/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#1E5438',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '0.8rem 1.5rem',
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(30, 84, 56, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Provide Material Feedback
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>

        </main>
      )}
      <Footer />
    </div>
  );
}
