import { useState } from 'react';
import RoomCard from './RoomCard';
import ApprovalChecklist from './ApprovalChecklist';

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const [ran, setRan] = useState(false);

  function start() {
    if (ran) return;
    setRan(true);
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setValue(Math.round((target / steps) * step));
      if (step >= steps) {
        clearInterval(timer);
        setValue(target);
      }
    }, interval);
  }

  return [value, start];
}

function AnimatedStatBadge({ icon, label, value }) {
  const [count, startCount] = useCountUp(value);
  const [triggered, setTriggered] = useState(false);

  function trigger() {
    if (!triggered) {
      setTriggered(true);
      startCount();
    }
  }

  return (
    <div
      className="animated-stat-tile"
      ref={(el) => {
        if (el && !triggered) {
          trigger();
        }
      }}
    >
      <span className="animated-stat-icon">{icon}</span>
      <span className="animated-stat-num">{count}</span>
      <span className="animated-stat-name">{label}</span>
    </div>
  );
}

export default function FloorResultPanel({ floor }) {
  const { label, result } = floor;
  const counts = result?.data?.counts || {};
  const rooms = result?.rooms || result?.data?.rooms || [];
  const overlay = result?.overlay;
  const buildingCompliance = result?.compliance || result?.data?.compliance;
  const approvalChecklist = result?.approvalChecklist || result?.data?.approvalChecklist || [];
  const [tab, setTab] = useState('overlay');
  const [zoomOpen, setZoomOpen] = useState(false);

  const roomCount = counts.room ?? rooms.length;
  const doorCount = counts.door ?? 0;
  const windowCount = counts.window ?? 0;
  const wallCount = counts.wall ?? 0;

  return (
    <>
      <div className="floor-result-container">
        {/* Header Panel */}
        <div className="floor-result-header">
          <h3 className="floor-result-title">
            <span>🏠</span>
            <span>{label}</span>
          </h3>

          <div className="floor-header-actions">
            <a href="/visualization" className="floor-space-planner-btn">
              <span>📐</span>
              <span>Open in 2D/3D Space Planner →</span>
            </a>
            <span className="floor-badge-tag">
              ⚡ AI CAD Detection
            </span>
          </div>
        </div>

        {/* Building-level compliance */}
        {buildingCompliance && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <BuildingComplianceBadge ok={buildingCompliance.has_toilet} label="Toilet Present" />
            <BuildingComplianceBadge ok={buildingCompliance.scale_established} label="Scale Established" />
          </div>
        )}

        {/* 4 Animated Stat Tiles */}
        <div className="animated-stat-grid">
          <AnimatedStatBadge icon="🏠" label="Rooms" value={roomCount} />
          <AnimatedStatBadge icon="🚪" label="Doors" value={doorCount} />
          <AnimatedStatBadge icon="🪟" label="Windows" value={windowCount} />
          <AnimatedStatBadge icon="🧱" label="Walls" value={wallCount} />
        </div>

        {/* Main Floor Content: Left Overlay, Right Rooms */}
        <div className="floor-layout-split">
          {/* Overlay Image */}
          {overlay && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: 'uppercase', color: '#143825', letterSpacing: '0.08em' }}>
                  Annotated CAD Plan
                </span>
                <button
                  onClick={() => setZoomOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3B82F6',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                  type="button"
                >
                  ⤢ Full Screen
                </button>
              </div>

              <div
                className="floor-overlay-box"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setZoomOpen(true)}
              >
                <img
                  src={overlay}
                  alt={`${label} annotated overlay`}
                  className="floor-overlay-img"
                />
              </div>

              {/* Legend Dots */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.72rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#526158' }}>
                <LegendDot color="#FBBF24" label="Rooms" />
                <LegendDot color="#EF4444" label="Walls" />
                <LegendDot color="#10B981" label="Doors" />
                <LegendDot color="#3B82F6" label="Windows" />
              </div>
            </div>
          )}

          {/* Room Breakdown Grid */}
          {rooms.length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, textTransform: 'uppercase', color: '#143825', letterSpacing: '0.08em' }}>
                  Room Breakdown — {rooms.length} Detected
                </span>
              </div>

              <div className="room-cards-scroll-container">
                {rooms.map((room, i) => (
                  <RoomCard
                    key={i}
                    room={room}
                    index={i}
                    totalArea={Math.max(...rooms.map((r) => r.wallAreaPx2 || 0))}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', background: '#FAF7F0', border: '1px solid #E2DCD0', borderRadius: '4px', textAlign: 'center', color: '#697068', fontSize: '0.82rem' }}>
              No individual room contours extracted from this drawing.
            </div>
          )}
        </div>

        {/* Fullscreen Zoom Modal */}
        {zoomOpen && overlay && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(20, 56, 37, 0.88)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setZoomOpen(false)}
          >
            <div
              style={{ position: 'relative', maxWidth: '1200px', width: '100%', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomOpen(false)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  color: '#FAF7F0',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.75rem',
                  cursor: 'pointer',
                }}
                type="button"
              >
                ✕
              </button>
              <img
                src={overlay}
                alt={`${label} full resolution`}
                style={{
                  width: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  background: '#FFFFFF',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Approval Checklist */}
      {approvalChecklist.length > 0 && <ApprovalChecklist items={approvalChecklist} />}
    </>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: color }} />
      <span>{label}</span>
    </span>
  );
}

function BuildingComplianceBadge({ ok, label }) {
  return (
    <span className={`compliance-badge-pill ${ok ? 'is-ok' : 'is-fail'}`}>
      <span>{ok ? '✓' : '✗'}</span>
      <span>{label}</span>
    </span>
  );
}
