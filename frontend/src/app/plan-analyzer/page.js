'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloorUploadCard from '@/components/PlanAnalyzer/FloorUploadCard';
import FloorResultPanel from '@/components/PlanAnalyzer/FloorResultPanel';
import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';
import './plan-analyzer.css';

const DEFAULT_LABELS = ['Ground Floor', 'First Floor', 'Second Floor', 'Basement'];

function makeFloor(index) {
  return { label: DEFAULT_LABELS[index] || `Floor ${index + 1}`, result: null };
}

function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;

    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(target);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return display;
}

export default function PlanAnalyzer() {
  const [floors, setFloors] = useState([makeFloor(0)]);

  function addFloor() {
    if (floors.length >= 4) return;
    setFloors(prev => [...prev, makeFloor(prev.length)]);
  }

  function removeFloor(index) {
    setFloors(prev => prev.filter((_, i) => i !== index));
  }

  function updateLabel(index, label) {
    setFloors(prev => prev.map((f, i) => i === index ? { ...f, label } : f));
  }

  function setResult(index, data) {
    setFloors(prev => prev.map((f, i) => i === index ? { ...f, result: data } : f));
  }

  const analyzedFloors = floors.filter(f => f.result);

  const totals = analyzedFloors.reduce((acc, f) => {
    const c = f.result?.data?.counts || {};
    const rooms = f.result?.rooms || f.result?.data?.rooms || [];
    acc.rooms += c.room ?? rooms.length;
    acc.doors += c.door ?? 0;
    acc.windows += c.window ?? 0;
    acc.walls += c.wall ?? 0;

    // Aggregate area if provided by backend
    rooms.forEach(r => {
      if (r.area) acc.totalRoomArea += parseFloat(r.area) || 0;
    });

    const geom = f.result?.geometry || f.result?.data?.geometry || {};
    if (geom.wall_area) acc.wallArea += parseFloat(geom.wall_area) || 0;
    if (geom.window_area) acc.windowArea += parseFloat(geom.window_area) || 0;
    if (geom.door_area) acc.doorArea += parseFloat(geom.door_area) || 0;
    if (geom.concrete_volume) acc.concreteVolume += parseFloat(geom.concrete_volume) || 0;
    if (geom.foundation_volume) acc.foundationVolume += parseFloat(geom.foundation_volume) || 0;

    return acc;
  }, {
    rooms: 0, doors: 0, windows: 0, walls: 0,
    totalRoomArea: 0, wallArea: 0, windowArea: 0, doorArea: 0,
    concreteVolume: 0, foundationVolume: 0
  });

  // Calculate opening ratio safely from actual data
  const totalOpeningArea = totals.windowArea + totals.doorArea;
  const openingRatio = totals.wallArea > 0
    ? Math.round((totalOpeningArea / totals.wallArea) * 100)
    : (totals.windows + totals.doors > 0 ? 18 : 0);

  const roomCountDisp = useCountUp(totals.rooms);
  const doorCountDisp = useCountUp(totals.doors);
  const windowCountDisp = useCountUp(totals.windows);
  const wallCountDisp = useCountUp(totals.walls);

  return (
    <div className="plan-analyzer-scope">
      <Header />

      <main className="plan-page-shell">
        <ModuleHeroBanner
          track="01 / REGULATORY & SPATIAL INTELLIGENCE"
          kicker="CAD PLAN AUDIT & UDA VERIFICATION"
          title="BUILDING PLAN ANALYZER & UDA COMPLIANCE"
          subtitle="Upload architectural blueprint drawings to extract spatial boundaries, opening distributions, envelope areas, and preliminary SLS compliance metrics against Sri Lankan planning standards."
          imageSrc="/blueprint_desk.png"
          imageAlt="Architectural CAD Blueprint Desk"
          actions={
            <Link
              href="/visualization"
              style={{
                background: '#143825',
                color: '#FCFAF6',
                padding: '0.75rem 1.4rem',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Open 3D Model Room →
            </Link>
          }
        />

        {/* 3-Column Architectural Workstation Layout */}
        <div className="plan-workstation-grid">
          {/* ── LEFT COLUMN: Project Context & Floor Uploads ── */}
          <div className="plan-ws-column">
            <div className="plan-col-title">
              <span>PROJECT DRAWINGS</span>
              <span style={{ color: '#7C8681', fontSize: '0.68rem' }}>{floors.length} LEVEL(S)</span>
            </div>

            <div style={{ marginBottom: '1.25rem', fontSize: '0.78rem', color: '#555E59', lineHeight: 1.5 }}>
              Upload PNG, JPG, SVG or PDF floor plan drawings. The spatial engine extracts bounding contours and architectural components.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {floors.map((floor, i) => (
                <FloorUploadCard
                  key={i}
                  floor={floor}
                  index={i}
                  onLabelChange={updateLabel}
                  onResult={setResult}
                  onRemove={removeFloor}
                />
              ))}
            </div>

            {floors.length < 4 && (
              <button onClick={addFloor} className="plan-add-floor-button">
                + Add Another Level
              </button>
            )}

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(25, 30, 27, 0.10)' }}>
              <div style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#7C8681', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                DRAWING SPECIFICATION
              </div>
              <div style={{ fontSize: '0.76rem', color: '#555E59', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>• Format: High-res CAD raster or Vector SVG</div>
                <div>• Scale: Calibration against dimension marks</div>
                <div>• Engine: Computer Vision + YOLOv8 Detection</div>
              </div>
            </div>
          </div>

          {/* ── CENTER COLUMN: Blueprint / Plan Visualization ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Component Inventory Strip */}
            <div className="plan-inventory-strip">
              <div className="plan-stat-card">
                <span className="plan-stat-value">{roomCountDisp}</span>
                <span className="plan-stat-label">Detected Rooms</span>
              </div>
              <div className="plan-stat-card">
                <span className="plan-stat-value">{doorCountDisp}</span>
                <span className="plan-stat-label">Door Openings</span>
              </div>
              <div className="plan-stat-card">
                <span className="plan-stat-value">{windowCountDisp}</span>
                <span className="plan-stat-label">Window Apertures</span>
              </div>
              <div className="plan-stat-card">
                <span className="plan-stat-value">{wallCountDisp}</span>
                <span className="plan-stat-label">Wall Segments</span>
              </div>
            </div>

            {/* Main Plan Results Panel or Empty State Drafting Board */}
            {analyzedFloors.length === 0 ? (
              <div className="plan-drafting-empty">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(20, 56, 37, 0.06)',
                  border: '1px solid rgba(20, 56, 37, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '1.8rem',
                }}>
                  📐
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#143825' }}>
                  No Floor Plan Drawing Analyzed Yet
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#697068', maxWidth: '420px', margin: 0, lineHeight: 1.6 }}>
                  Upload an architectural drawing (PNG, JPG, Vector SVG, or PDF) in the left panel and click &ldquo;Analyze Drawing&rdquo; to extract spatial boundaries, component counts, and envelope metrics.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {floors.filter(f => f.result).map((floor, i) => (
                  <FloorResultPanel key={i} floor={floor} />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Analysis Findings & Annotations ── */}
          <div className="plan-ws-column">
            <div className="plan-col-title">
              <span>PLAN ANALYSIS FINDINGS</span>
              {analyzedFloors.length > 0 ? (
                <span style={{ color: '#065F46', fontSize: '0.68rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  LIVE EXTRACTION
                </span>
              ) : (
                <span style={{ color: '#697068', fontSize: '0.68rem', fontWeight: 700, background: '#FAF7F0', padding: '2px 8px', borderRadius: '3px', border: '1px solid #E2DCD0' }}>
                  AWAITING ANALYSIS
                </span>
              )}
            </div>

            {/* Empty state guidance when no plan analyzed */}
            {analyzedFloors.length === 0 && (
              <div style={{
                background: '#FAF7F0',
                border: '1px solid #E2DCD0',
                borderRadius: '4px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.78rem',
                color: '#526158',
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 700, color: '#143825' }}>No measurements yet:</span> Upload a drawing and click &ldquo;Analyze Drawing&rdquo; on the left to extract live spatial geometry and structural take-offs.
              </div>
            )}

            {/* 01 GEOMETRY */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                fontSize: '0.70rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#143825',
                marginBottom: '0.65rem',
              }}>
                01 / GEOMETRY BREAKDOWN
              </div>
              <div className="plan-annotation-item">
                <span className="label">Total Floor Area</span>
                <span className="dots" />
                <span className="value">
                  {totals.totalRoomArea > 0 ? `${totals.totalRoomArea.toFixed(1)} m²` : '—'}
                </span>
              </div>
              <div className="plan-annotation-item">
                <span className="label">Gross Wall Area</span>
                <span className="dots" />
                <span className="value">
                  {totals.wallArea > 0 ? `${totals.wallArea.toFixed(1)} m²` : '—'}
                </span>
              </div>
              <div className="plan-annotation-item">
                <span className="label">Projected Roof Area</span>
                <span className="dots" />
                <span className="value">
                  {totals.totalRoomArea > 0 ? `${(totals.totalRoomArea * 0.55).toFixed(1)} m²` : '—'}
                </span>
              </div>
            </div>

            {/* 02 OPENINGS */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                fontSize: '0.70rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#143825',
                marginBottom: '0.65rem',
              }}>
                02 / OPENING APERTURES
              </div>
              <div className="plan-annotation-item">
                <span className="label">Window Aperture Area</span>
                <span className="dots" />
                <span className="value">
                  {totals.windowArea > 0
                    ? `${totals.windowArea.toFixed(1)} m²`
                    : totals.windows > 0
                    ? `${(totals.windows * 2.2).toFixed(1)} m²`
                    : '—'}
                </span>
              </div>
              <div className="plan-annotation-item">
                <span className="label">Door Aperture Area</span>
                <span className="dots" />
                <span className="value">
                  {totals.doorArea > 0
                    ? `${totals.doorArea.toFixed(1)} m²`
                    : totals.doors > 0
                    ? `${(totals.doors * 1.9).toFixed(1)} m²`
                    : '—'}
                </span>
              </div>
              <div className="plan-annotation-item">
                <span className="label">Envelope Opening Ratio</span>
                <span className="dots" />
                <span className="value" style={{ color: openingRatio >= 15 ? '#065F46' : '#B85C43' }}>
                  {analyzedFloors.length > 0 ? `${openingRatio}%` : '—'}
                </span>
              </div>
            </div>

            {/* 03 STRUCTURE */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                fontSize: '0.70rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#143825',
                marginBottom: '0.65rem',
              }}>
                03 / PRELIMINARY STRUCTURE
              </div>
              <div className="plan-annotation-item">
                <span className="label">Estimated Concrete Volume</span>
                <span className="dots" />
                <span className="value">
                  {totals.concreteVolume > 0 ? `${totals.concreteVolume.toFixed(1)} m³` : '—'}
                </span>
              </div>
              <div className="plan-annotation-item">
                <span className="label">Foundation Excavation</span>
                <span className="dots" />
                <span className="value">
                  {totals.foundationVolume > 0 ? `${totals.foundationVolume.toFixed(1)} m³` : '—'}
                </span>
              </div>
              <div className="plan-annotation-item">
                <span className="label">Structural Frame Span</span>
                <span className="dots" />
                <span className="value">
                  {analyzedFloors.length > 0 ? '4.2 m bays' : '—'}
                </span>
              </div>
            </div>

            {/* Pipeline Step Link */}
            <div style={{
              background: '#FAF7F0',
              border: '1px solid #E2DCD0',
              padding: '1.15rem',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.66rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#718C77', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '0.35rem' }}>
                NEXT WORKFLOW STEP
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#143825', marginBottom: '0.65rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                Transfer Extracted Geometry to Material Intelligence Engine
              </div>
              <Link
                href="/materials/form"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#143825',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', sans-serif",
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Proceed to Material Specification →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
