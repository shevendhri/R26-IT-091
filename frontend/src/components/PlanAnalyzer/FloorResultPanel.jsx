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
      if (step >= steps) { clearInterval(timer); setValue(target); }
    }, interval);
  }

  return [value, start];
}

function AnimatedBadge({ icon, label, value, color, onVisible }) {
  const [count, startCount] = useCountUp(value);
  const [triggered, setTriggered] = useState(false);

  function trigger() {
    if (!triggered) { setTriggered(true); startCount(); }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl p-4 min-w-[90px] ${color} border border-eco-border shadow-sm`}
      ref={el => { if (el && !triggered) { trigger(); } }}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-heading text-2xl font-extrabold leading-none">{count}</span>
      <span className="text-xs opacity-70 mt-0.5 font-medium">{label}</span>
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
  // 'mode' only records the original upload's file type now — every upload
  // (SVG included) runs through the same real YOLO detection, so there's no
  // more "exact ground truth" path to distinguish in the badge.
  const badgeLabel = '~ AI Detection';
  const badgeClass = 'bg-brand-blue-dim border-brand-blue-border text-brand-blue';

  return (
    <>
    <div className="bg-eco-card backdrop-blur border border-eco-border rounded-card shadow-card p-6 mb-6 animate-fade-in">
      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-heading text-xl font-bold text-ink-primary flex items-center gap-2">
          🏠 {label}
        </h2>
        <span className={`text-xs font-heading font-semibold px-3 py-1 rounded-full border uppercase tracking-wide ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Building-level compliance — only present on SVG-parsed plans */}
      {buildingCompliance && (
        <div className="flex flex-wrap gap-2 mb-5">
          <BuildingComplianceBadge ok={buildingCompliance.has_toilet} label="Toilet present" />
          <BuildingComplianceBadge ok={buildingCompliance.scale_established} label="Scale established" />
        </div>
      )}

      {/* Animated stat badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <AnimatedBadge icon="🏠" label="Rooms" value={roomCount} color="bg-brand-green-dim text-brand-green" />
        <AnimatedBadge icon="🚪" label="Doors" value={doorCount} color="bg-brand-amber-dim text-brand-amber" />
        <AnimatedBadge icon="🪟" label="Windows" value={windowCount} color="bg-brand-blue-dim text-brand-blue" />
        <AnimatedBadge icon="🧱" label="Walls" value={wallCount} color="bg-brand-red-dim text-brand-red" />
      </div>

      {/* Mobile tab switcher */}
      {overlay && rooms.length > 0 && (
        <div className="flex lg:hidden gap-2 mb-4">
          {['overlay', 'rooms'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg font-heading text-sm font-semibold transition-colors ${
                tab === t ? 'bg-brand-green text-white' : 'bg-eco-mid/70 text-ink-secondary hover:bg-eco-mid'
              }`}
            >
              {t === 'overlay' ? '🗺️ Overlay' : '🏠 Rooms'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Overlay image */}
        {overlay && (tab === 'overlay' || window.innerWidth >= 1024) && (
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-heading text-ink-muted font-medium uppercase tracking-widest">Annotated Floor Plan</p>
              <button
                onClick={() => setZoomOpen(true)}
                className="text-xs font-heading font-semibold text-brand-blue hover:brightness-125 transition-colors"
              >
                ⤢ Full screen
              </button>
            </div>
            <div
              className="relative group cursor-zoom-in rounded-inner overflow-hidden border border-eco-border"
              onClick={() => setZoomOpen(true)}
            >
              <img
                src={overlay}
                alt={`${label} overlay`}
                className="w-full object-contain max-h-96 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#14221B]/0 group-hover:bg-[#14221B]/10 transition-colors rounded-inner" />
            </div>
            {/* Legend — colors match the overlay image's own fixed palette (drawn server-side), not the app's brand tokens */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs font-heading text-ink-secondary">
              <LegendDot color="bg-yellow-400" label="Rooms" />
              <LegendDot color="bg-red-500" label="Walls" />
              <LegendDot color="bg-green-400" label="Doors" />
              <LegendDot color="bg-blue-400" label="Windows" />
            </div>
          </div>
        )}

        {/* Room cards */}
        {rooms.length > 0 && (tab === 'rooms' || window.innerWidth >= 1024) && (
          <div className={overlay ? 'lg:w-1/2' : 'w-full'}>
            <p className="text-xs font-heading text-ink-muted mb-3 font-medium uppercase tracking-widest">
              Room Breakdown — {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            </p>
            <div className={`grid gap-3 ${rooms.length <= 2 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} ${rooms.length > 6 ? 'max-h-[520px] overflow-y-auto pr-1 scrollbar-thin' : ''}`}>
              {rooms.map((room, i) => (
                <RoomCard
                  key={i}
                  room={room}
                  index={i}
                  totalArea={Math.max(...rooms.map(r => r.wallAreaPx2 || 0))}
                />
              ))}
            </div>
          </div>
        )}

        {/* No rooms detected */}
        {rooms.length === 0 && (
          <div className="w-full">
            <div className="bg-eco-mid/60 border border-eco-border rounded-inner px-4 py-3 text-ink-secondary text-sm">
              No individual rooms detected. Train the model for per-room breakdown (see guideline Section 7).
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomOpen && overlay && (
        <div
          className="fixed inset-0 z-50 bg-[#14221B]/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white text-2xl transition-colors"
            >✕</button>
            <img
              src={overlay}
              alt={`${label} overlay full`}
              className="w-full rounded-card border border-eco-border-strong shadow-2xl object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>

    {approvalChecklist.length > 0 && <ApprovalChecklist items={approvalChecklist} />}
    </>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function BuildingComplianceBadge({ ok, label }) {
  return (
    <span className={`text-xs font-heading font-semibold px-3 py-1 rounded-full border uppercase tracking-wide ${
      ok
        ? 'bg-brand-green-dim border-brand-green-border text-brand-green'
        : 'bg-brand-red-dim border-brand-red-border text-brand-red'
    }`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}
