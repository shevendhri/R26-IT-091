'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloorUploadCard from '@/components/PlanAnalyzer/FloorUploadCard';
import FloorResultPanel from '@/components/PlanAnalyzer/FloorResultPanel';
import './plan-analyzer.css';

const DEFAULT_LABELS = ['Ground Floor', 'First Floor', 'Second Floor', 'Basement'];

function makeFloor(index) {
  return { label: DEFAULT_LABELS[index] || `Floor ${index + 1}`, result: null };
}

function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;

    const steps = 36;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (step >= steps) { clearInterval(timer); setDisplay(target); }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return display;
}

function StatCard({ icon, value, label, color }) {
  const count = useCountUp(value);
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl px-6 py-4 min-w-[100px] border border-eco-border ${color}`}>
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-3xl font-heading font-extrabold leading-none tabular-nums">{count}</span>
      <span className="text-xs font-heading opacity-70 mt-1 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

const PLAN_ANALYZER_FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?usp=header";
const PLAN_ANALYZER_EMBED_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?embedded=true";

export default function PlanAnalyzer() {
  const [floors, setFloors] = useState([makeFloor(0)]);
  const [showFeedbackIframe, setShowFeedbackIframe] = useState(false);

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
    acc.rooms  += c.room   ?? rooms.length;
    acc.doors  += c.door   ?? 0;
    acc.windows += c.window ?? 0;
    acc.walls  += c.wall   ?? 0;
    return acc;
  }, { rooms: 0, doors: 0, windows: 0, walls: 0 });

  return (
    <div className="plan-analyzer-scope" style={{ minHeight: '100vh', background: 'var(--eco-black)', color: 'var(--text-primary)', position: 'relative' }}>
      <Header />

      <div className="blueprint-grid-blue" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6 text-center relative" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 bg-brand-blue-dim border border-brand-blue-border rounded-full px-4 py-1.5 text-xs font-heading text-brand-blue mb-5 font-semibold uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse inline-block" />
          Automated room detection
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl font-extrabold mb-4 text-ink-primary leading-tight tracking-tight">
          Floor Plan Analyzer
        </h1>
        <p className="text-ink-secondary text-lg max-w-xl mx-auto mb-6">
          Upload floor plan images to get an instant per-room breakdown of rooms, doors, windows, and area.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs font-heading text-ink-muted mb-2">
          {['1. Upload a PNG, JPG, PDF or SVG', '2. Click Analyze', '3. Get an instant AI room breakdown'].map((s, i) => (
            <span key={i} className="bg-eco-mid/70 border border-eco-border rounded-full px-3 py-1">{s}</span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-8 relative" style={{ zIndex: 1 }}>
        <div className="bg-eco-card border border-eco-border rounded-card shadow-card p-5">
          <p className="text-center text-xs font-heading text-ink-muted uppercase tracking-widest mb-4">
            {analyzedFloors.length === 0
              ? 'Upload and analyze a floor plan to see results'
              : `Total across ${analyzedFloors.length} floor${analyzedFloors.length > 1 ? 's' : ''}`}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <StatCard icon="🏠" value={totals.rooms}   label="Rooms"   color="bg-brand-green-dim text-brand-green" />
            <StatCard icon="🚪" value={totals.doors}   label="Doors"   color="bg-brand-amber-dim text-brand-amber" />
            <StatCard icon="🪟" value={totals.windows} label="Windows" color="bg-brand-blue-dim text-brand-blue" />
            <StatCard icon="🧱" value={totals.walls}   label="Walls"   color="bg-brand-red-dim text-brand-red" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          <div className="text-center mb-10">
            <button
              onClick={addFloor}
              className="px-6 py-2.5 rounded-xl border border-dashed border-brand-blue-border text-brand-blue hover:bg-brand-blue-dim hover:border-brand-blue font-heading font-semibold transition-all text-sm uppercase tracking-wide"
            >
              + Add Another Floor
            </button>
          </div>
        )}

        {analyzedFloors.length > 0 && (
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-bold text-ink-primary mb-5 flex items-center gap-2">
              <span className="text-brand-blue">✦</span> Analysis Results
            </h2>
            {floors.filter(f => f.result).map((floor, i) => (
              <FloorResultPanel key={i} floor={floor} />
            ))}
          </div>
        )}

        {/* ── Module feedback & evaluation, consistent with the other modules ── */}
        <div style={{
          marginBottom: '3.5rem',
          background: 'linear-gradient(135deg, #FFFFFF 50%, #E2EEF8 100%)',
          borderTop: '4px solid #245D8C',
          borderRight: '1px solid rgba(36, 93, 140, 0.25)',
          borderBottom: '1px solid rgba(36, 93, 140, 0.25)',
          borderLeft: '1px solid rgba(36, 93, 140, 0.25)',
          borderRadius: '20px',
          padding: '2rem 2.2rem',
          boxShadow: '0 4px 18px rgba(36, 93, 140, 0.08), 0 1px 3px rgba(20, 34, 27, 0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <span style={{
                  background: '#C8DDF0', color: '#245D8C', border: '1px solid rgba(36, 93, 140, 0.3)',
                  borderRadius: '20px', padding: '3px 12px', fontSize: '0.7rem', fontWeight: 800,
                  letterSpacing: '0.08em', fontFamily: 'Space Grotesk',
                }}>
                  ● MODULE 01 EVALUATION
                </span>
                <span style={{ fontSize: '0.72rem', color: '#42554A', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  USER FEEDBACK
                </span>
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#14221B', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
                Floor Plan Analyzer — User Feedback & Evaluation
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#42554A', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                Help us refine and evaluate the Floor Plan Analyzer module. Please share your feedback on room detection accuracy, upload flow, and results readability.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowFeedbackIframe(prev => !prev)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem' }}
              >
                {showFeedbackIframe ? 'Hide Embedded Form' : 'Fill Form on Page'}
              </button>
              <a
                href={PLAN_ANALYZER_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#245D8C', color: '#FFFFFF', border: '1px solid #245D8C', borderRadius: '10px',
                  padding: '0.75rem 1.4rem', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.8rem',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 14px rgba(36, 93, 140, 0.25)',
                }}
              >
                Open Google Form
              </a>
            </div>
          </div>

          {showFeedbackIframe && (
            <div style={{ marginTop: '1.75rem', background: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(36, 93, 140, 0.22)', overflow: 'hidden' }}>
              <iframe
                src={PLAN_ANALYZER_EMBED_URL}
                width="100%"
                height="800"
                frameBorder="0"
                style={{ display: 'block', border: 'none' }}
                title="Floor Plan Analyzer Feedback Form"
              >
                Loading Feedback Form…
              </iframe>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
