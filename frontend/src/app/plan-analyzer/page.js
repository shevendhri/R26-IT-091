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
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(target);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return display;
}

function StatCard({ icon, value, label }) {
  const count = useCountUp(value);
  return (
    <div className="plan-stat-card">
      <span className="plan-stat-icon" aria-hidden="true">{icon}</span>
      <span className="plan-stat-value">{count}</span>
      <span className="plan-stat-label">{label}</span>
    </div>
  );
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
    return acc;
  }, { rooms: 0, doors: 0, windows: 0, walls: 0 });

  return (
    <div className="plan-analyzer-scope">
      <Header />

      <main className="plan-page-shell">
        <section className="plan-hero-section">
          <div className="plan-hero-badge">
            <span className="plan-badge-dot" />
            Automated Room Detection
          </div>
          <h1 className="plan-hero-title">Floor Plan Analyzer</h1>
          <p className="plan-hero-subtitle">
            Upload floor plan images to get an instant per-room breakdown of rooms, doors, windows, and area.
          </p>
          <div className="plan-helper-steps" aria-label="Plan analyzer workflow">
            <span>1. Upload a PNG, JPG, PDF or SVG</span>
            <span>2. Click Analyze</span>
            <span>3. Get an instant AI room breakdown</span>
          </div>
        </section>

        <section className="plan-summary-card" aria-label="Floor plan totals">
          <h2 className="plan-summary-title">
            {analyzedFloors.length === 0
              ? 'Upload and analyze a floor plan to see results'
              : `Total across ${analyzedFloors.length} floor${analyzedFloors.length > 1 ? 's' : ''}`}
          </h2>
          <div className="plan-stats-grid">
            <StatCard icon="🏠" value={totals.rooms} label="Rooms" />
            <StatCard icon="🚪" value={totals.doors} label="Doors" />
            <StatCard icon="🪟" value={totals.windows} label="Windows" />
            <StatCard icon="🧱" value={totals.walls} label="Walls" />
          </div>
        </section>

        <section className="plan-upload-section" aria-label="Floor uploads">
          <div className="plan-upload-list">
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
              Add Another Floor
            </button>
          )}
        </section>

        {analyzedFloors.length > 0 && (
          <section className="plan-results-section" aria-label="Analysis results">
            <div className="plan-section-heading">
              <p>Detected Floor Layout</p>
              <h2>Analysis Results</h2>
            </div>
            {floors.filter(f => f.result).map((floor, i) => (
              <FloorResultPanel key={i} floor={floor} />
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}



