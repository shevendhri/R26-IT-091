"use client";

import Link from 'next/link';
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

import CompactSummaryStrip from '@/components/Report/CompactSummaryStrip';
import ProjectContextStrip from '@/components/ui/ProjectContextStrip';
import ProjectValidationStrip from '@/components/Report/ProjectValidationStrip';
import Accordion from '@/components/ui/Accordion';
import DisclaimerBanner from '@/components/ui/DisclaimerBanner';
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
import Report3DStudio from '@/components/Report/Report3DStudio';
import FireSafetySection from '@/components/Report/FireSafetySection';
import GreenAssessmentSection from '@/components/Report/GreenAssessmentSection';
import MaterialSubNav from '@/components/Materials/MaterialSubNav';

// AI Decision Timeline stages (10 Stages representing the complete pipeline)
const TIMELINE_STAGES = [
  { id: 1, label: '01 / User Brief & Intake', desc: 'Project profile, structural preferences and climate context captured', source: 'Questionnaire' },
  { id: 2, label: '02 / Blueprint Geometry', desc: 'Automated CAD floor plan layout & spatial boundary vectors produced', source: 'Blueprint Analysis' },
  { id: 3, label: '03 / Geometry Extraction', desc: '11 structural parameters (envelope, walls, openings, roof) extracted', source: 'Geometry Engine' },
  { id: 4, label: '04 / Sri Lankan Climate Profiling', desc: 'Agro-climatic zone, salinity zone, rainfall & humidity profiled', source: 'Climate Database' },
  { id: 5, label: '05 / SLS Structural Rule Check', desc: 'SLS 107 & SLS 614 structural constraints & load resistance evaluated', source: 'SLS Rules Engine' },
  { id: 6, label: '06 / ML Candidate Scoring', desc: 'Random Forest model inference scored all regional candidates', source: 'ML Model' },
  { id: 7, label: '07 / Hybrid Decision Optimization', desc: '75% Engineering Feasibility + 25% ML Prediction combined via MCDM', source: 'TOPSIS Engine' },
  { id: 8, label: '08 / Fire Safety Compliance', desc: 'SLS 139 / BS 476 structural fire resistance hours verified', source: 'Fire Safety Engine' },
  { id: 9, label: '09 / GREENSL Pre-Assessment', desc: 'Green Building Council of Sri Lanka environmental credits computed', source: 'GREENSL Engine' },
  { id: 10, label: '10 / 3D BIM Model Launch', desc: 'Parametric cutaway & finishes viewer prepared for spatial inspection', source: 'Three.js Pipeline' },
];

function DecisionTimeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active < TIMELINE_STAGES.length - 1) {
      const t = setTimeout(() => setActive(prev => prev + 1), 120);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    <section id="research-trace">
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#173A2B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.65rem', fontFamily: 'Space Grotesk' }}>
        RESEARCH METHODOLOGY TRACE — VIVA AUDIT TRAIL
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {TIMELINE_STAGES.map((stage, i) => {
          const isDone = i <= active;
          return (
            <div key={stage.id} style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              background: isDone ? '#FBF9F4' : '#FFFFFF',
              padding: '0.50rem 0.85rem',
              borderRadius: '3px',
              border: isDone ? '1px solid #173A2B' : '1px solid #D8D2C8',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '3px',
                background: isDone ? '#173A2B' : '#EFECE4',
                color: isDone ? '#FCFAF6' : '#687068',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 800,
                flexShrink: 0,
                fontFamily: 'Space Grotesk'
              }}>
                {isDone ? '✓' : stage.id}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDone ? '#173A2B' : '#687068', fontFamily: 'Space Grotesk' }}>
                  {stage.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#687068' }}>
                    {stage.desc}
                  </span>
                  <span style={{ fontSize: '0.60rem', color: '#9A7557', fontFamily: 'Space Grotesk', textTransform: 'uppercase', fontWeight: 600 }}>
                    [{stage.source}]
                  </span>
                </div>
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
    { label: 'Building Type',       value: data?.building_type || 'Residential' },
    { label: 'Location',            value: data?.location || 'Colombo' },
    { label: 'Floors',              value: data?.floors || 2 },
    { label: 'Total Floor Area',    value: bp.total_floor_area ? `${bp.total_floor_area} m²` : '170.0 m²' },
    { label: 'Structural System',   value: data?.structural_system || 'RC Frame (SLS 614)' },
    { label: 'Climate Zone',        value: climate.zone || 'Wet Zone (Maritime)' },
    { label: 'Relative Humidity',   value: climate.relative_humidity != null ? `${climate.relative_humidity}%` : '80%' },
    { label: 'Salinity Exposure',   value: climate.salinity_zone || 'High (Coastal / Marine)' },
    { label: 'Data Provenance',     value: conf.source || 'Hybrid Engineering + ML' },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #D8D2C8',
      borderRadius: '4px',
      padding: '1.25rem 1.5rem',
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#173A2B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem', fontFamily: 'Space Grotesk' }}>
        PROJECT PROFILE &amp; CLIMATIC CONTEXT PARAMETERS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
        {rows.map(row => (
          <div key={row.label} style={{
            padding: '0.55rem 0.85rem',
            background: '#FBF9F4',
            borderRadius: '3px',
            border: '1px solid #D8D2C8'
          }}>
            <span style={{ fontSize: '0.62rem', color: '#687068', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#252823', fontFamily: 'Space Grotesk', marginTop: '2px', display: 'block' }}>{row.value}</span>
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
      <div className="arch-page-canvas" style={{ background: '#F5F1E8', minHeight: '100vh' }}>
        <Header />
        <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#687068', fontFamily: 'Space Grotesk' }}>
          Loading Research Monograph…
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="arch-page-canvas" style={{ background: '#FAF7F0', minHeight: '100vh' }}>
      <Header />
      <MaterialSubNav />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '1rem 2.5rem 5rem' }}>
        <ProjectContextStrip customData={reportData?.project_info} />

        {/* Monograph Top Architectural Header */}
        <div style={{
          border: '1px solid #E2DCD0',
          background: '#FFFFFF',
          padding: '2rem 2.5rem',
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(20, 56, 37, 0.03)',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2DCD0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                <span style={{
                  background: '#143825',
                  color: '#FAF7F0',
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '3px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  07 / RESEARCH SPECIFICATION MONOGRAPH
                </span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', color: '#697068', fontWeight: 600 }}>
                  VIVA DISSERTATION AUDIT REPORT · R26-IT-091
                </span>
              </div>
              <h1 style={{
                fontFamily: 'Outfit, Space Grotesk, sans-serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                color: '#143825',
                margin: 0,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}>
                Material Specification &amp; Decision Report
              </h1>
            </div>

            <div style={{ textAlign: 'right', fontFamily: 'Space Grotesk' }}>
              <div style={{ fontSize: '0.62rem', color: '#697068', textTransform: 'uppercase', letterSpacing: '0.1em' }}>REPORT ID</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#143825' }}>GC-2026-SPEC-091</div>
              <div style={{ fontSize: '0.68rem', color: '#8D6A4F', marginTop: '2px', fontWeight: 600 }}>SLS 107 · SLS 614 · SLS 139 REFERENCED</div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.86rem', color: '#526158', lineHeight: 1.6, maxWidth: '1020px' }}>
            Comprehensive architectural material decision-support report synthesized via Multi-Criteria Decision Making (MCDM TOPSIS &amp; PROMETHEE-II), machine learning recommendation models, and Urban Development Authority (UDA) regulatory rules for Sri Lanka.
          </p>
        </div>

        {!reportData ? (
          <div style={{
            background: '#FFFFFF',
            border: '1px dashed #E2DCD0',
            borderRadius: '4px',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#697068',
          }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', fontWeight: 800, color: '#143825', margin: '0 0 0.5rem' }}>
              No Active Report Data Generated
            </h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.84rem' }}>
              Please configure project parameters in the Material Intake Worksheet or run the Plan Analyzer.
            </p>
            <a
              href="/materials/form"
              style={{
                display: 'inline-block',
                background: '#143825',
                color: '#FAF7F0',
                padding: '0.8rem 1.6rem',
                borderRadius: '4px',
                fontFamily: 'Space Grotesk',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Start Intake Workflow →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* ── 01 / PROJECT OVERVIEW ── */}
            <section id="project-overview">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>01</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Project Overview &amp; Climatic Context
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <CompactSummaryStrip data={reportData} />
                <ProjectProfileCard data={reportData} />
              </div>
            </section>

            {/* ── 02 / RECOMMENDATION SUMMARY ── */}
            <section id="recommendation-summary">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>02</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Recommendation Summary &amp; Scoring Interpretation
                </span>
              </div>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2DCD0',
                borderRadius: '6px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 8px rgba(20, 56, 37, 0.03)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#143825', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
                      HYBRID DECISION MODEL FORMULATION
                    </span>
                    <h3 style={{ margin: '0.3rem 0 0.4rem', fontSize: '1.1rem', fontWeight: 800, color: '#143825', fontFamily: 'Outfit, Space Grotesk' }}>
                      75% Deterministic SLS Code Rules + 25% Random Forest ML Inference
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#526158', lineHeight: 1.6 }}>
                      The Hybrid Score combines strict deterministic constraints from Sri Lankan Standards (SLS 107 for blocks, SLS 614 for concrete, SLS 139 for fire) with regional machine learning inference. Deterministic structural feasibility holds 75% decision authority to guarantee safety compliance.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '130px', padding: '0.85rem 1rem', background: '#FAF7F0', border: '1px solid #E2DCD0', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.64rem', color: '#697068', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Space Grotesk' }}>Primary Rank Basis</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#143825', fontFamily: 'Space Grotesk', marginTop: '2px' }}>MCDM TOPSIS</div>
                      <span style={{ fontSize: '0.64rem', color: '#5E836E' }}>Multi-Criteria Weighted</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '130px', padding: '0.85rem 1rem', background: '#FAF7F0', border: '1px solid #E2DCD0', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.64rem', color: '#697068', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Space Grotesk' }}>Regulatory Baseline</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#8D6A4F', fontFamily: 'Space Grotesk', marginTop: '2px' }}>SLS &amp; UDA</div>
                      <span style={{ fontSize: '0.64rem', color: '#697068' }}>Sri Lankan Statutory Codes</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 03 / RECOMMENDED MATERIAL PACKAGE (BY BUILDING COMPONENT) ── */}
            <section id="recommended-package" style={{ scrollMarginTop: '120px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{
                  background: '#143825',
                  color: '#FAF7F0',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '3px',
                  letterSpacing: '0.06em'
                }}>
                  03
                </span>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.90rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#143825' }}>
                  Recommended Material Package (Component Breakdown)
                </span>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2DCD0', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 20px rgba(20, 56, 37, 0.03)' }}>
                <MaterialBreakdown data={reportData} />
              </div>
            </section>

            {/* ── 04 / INTERACTIVE 3D BIM MODEL STUDIO ── */}
            <section id="bim-studio">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>04</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Interactive 3D Cutaway BIM Model &amp; Material Finishes Viewer
                </span>
              </div>
              <Report3DStudio data={reportData} />
            </section>

            {/* ── 05 / ENGINEERING & ML ASSESSMENT (DISTINCT MEASURES) ── */}
            <section id="engineering-ml-assessment">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>05</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Engineering vs. Machine Learning Assessments &amp; Feature Attribution
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
                <HybridScorePanel data={reportData} />
                <DecisionFactorsPanel data={reportData} />
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <FeatureImportance data={reportData} />
              </div>
            </section>

            {/* ── 06 / SUSTAINABILITY & EMBODIED CARBON ── */}
            <section id="sustainability-information">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>06</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Sustainability Information &amp; GREENSL Environmental Scorecard
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SustainabilityDashboard data={reportData} />
                <GreenAssessmentSection data={reportData} />
              </div>
            </section>

            {/* ── 07 / PRELIMINARY SAFETY & CODE VALIDATION ── */}
            <section id="safety-validation">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>07</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Warnings, Limitations &amp; Fire Resistance Verification
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ProjectValidationStrip data={reportData} />
                <FireSafetySection data={reportData} />
              </div>
            </section>

            {/* ── 08 / METHODOLOGY, SPATIAL GEOMETRY & DATA PROVENANCE ── */}
            <section id="methodology-provenance">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>08</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Methodology, Spatial Geometry &amp; 10-Stage Execution Trace
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <Accordion title="08.1 / Ranked Alternative Candidates Matrix" subtitle="Component-by-Component Multi-Criteria Evaluation Comparison">
                  <AlternativesTable data={reportData} />
                </Accordion>

                <Accordion title="08.2 / Blueprint Geometry & Spatial Parameters" subtitle="11 Structural Dimensions & Spatial Boundary Vectors">
                  <BlueprintPanel data={reportData} />
                </Accordion>

                <Accordion title="08.3 / Quantity Takeoff & Structural Estimations" subtitle="Estimated Material Volumes, Floor Plinth & Wall Area Computations">
                  <QuantityEstimationPanel data={reportData} />
                </Accordion>

                <Accordion title="08.4 / Research Decision Trace & System Audit Log" subtitle="Formal 10-Stage Execution Audit Trail for Academic Viva Evaluation">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
                    <DecisionTimeline />
                    <AuditLogPanel data={reportData} />
                  </div>
                </Accordion>
              </div>
            </section>

            {/* ── 09 / STATUTORY DISCLAIMER & VIVA FEEDBACK ── */}
            <section id="disclaimer-feedback">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk' }}>09</span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#143825' }}>
                  Academic Decision-Support Disclaimer &amp; Viva Evaluation
                </span>
              </div>

              <DisclaimerBanner />

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2DCD0',
                borderRadius: '6px',
                padding: '2rem 2.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 2px 10px rgba(20, 56, 37, 0.03)',
                marginTop: '1rem',
              }}>
                <div style={{ maxWidth: '800px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                    <span style={{
                      background: '#143825',
                      color: '#FAF7F0',
                      fontFamily: 'Space Grotesk',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                    }}>
                      RESEARCH FEEDBACK
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#697068', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                      UNDERGRADUATE VIVA EVALUATION AUDIT
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: 'Outfit, Space Grotesk, sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#143825',
                    margin: '0 0 0.35rem',
                    textTransform: 'uppercase',
                  }}>
                    Provide Research Feedback on Material Recommendations
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: '#526158', margin: 0, lineHeight: 1.5 }}>
                    Did the recommendations appear reasonable for Sri Lankan climatic conditions? Was the multi-criteria decision reasoning understandable?
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    href="/feedback"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.85rem 1.6rem',
                      textDecoration: 'none',
                      fontSize: '0.78rem',
                      background: '#143825',
                      color: '#FAF7F0',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Feedback Worksheet →
                  </Link>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdDr5VrYMSK1rY-kMCD5LRCFD6NDlJXLA5nRAGruQrSihD5Rw/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.85rem 1.6rem',
                      textDecoration: 'none',
                      fontSize: '0.78rem',
                      background: '#FFFFFF',
                      border: '1px solid #E2DCD0',
                      color: '#143825',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Google Form ↗
                  </a>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
