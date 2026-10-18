const TYPE_GRADIENTS = {
  living:   'from-amber-100 to-orange-50 border-amber-300 text-amber-900',
  bedroom:  'from-blue-100 to-indigo-50 border-blue-300 text-blue-900',
  bathroom: 'from-teal-100 to-cyan-50 border-teal-300 text-teal-900',
  kitchen:  'from-orange-100 to-red-50 border-orange-300 text-orange-900',
  dining:   'from-rose-100 to-pink-50 border-rose-300 text-rose-900',
  garage:   'from-slate-100 to-gray-50 border-slate-300 text-slate-800',
  study:    'from-purple-100 to-violet-50 border-purple-300 text-purple-900',
  laundry:  'from-cyan-100 to-sky-50 border-cyan-300 text-cyan-900',
  storage:  'from-stone-100 to-neutral-50 border-stone-300 text-stone-800',
  hallway:  'from-lime-100 to-green-50 border-lime-300 text-lime-900',
  porch:    'from-green-100 to-emerald-50 border-green-300 text-green-900',
  balcony:  'from-emerald-100 to-teal-50 border-emerald-300 text-emerald-900',
  other:    'from-slate-100 to-slate-50 border-slate-300 text-slate-800',
};

const TYPE_ICONS = {
  living: '🛋️', bedroom: '🛏️', bathroom: '🚿', kitchen: '🍳',
  dining: '🍽️', garage: '🚗', study: '📚', laundry: '🧺',
  storage: '📦', hallway: '🚪', porch: '🏡', balcony: '🌿', other: '🏠',
};

export default function RoomCard({ room, index, totalArea = 0 }) {
  const type = room.type || 'other';
  const gradientClass = TYPE_GRADIENTS[type] || TYPE_GRADIENTS.other;
  const icon = TYPE_ICONS[type] || TYPE_ICONS.other;
  const displayName = room.name || `Room ${index + 1}`;

  const areaPx = room.wallAreaPx2 || room.area_px2 || 0;
  const areaPercent = totalArea > 0 && areaPx > 0
    ? Math.round((areaPx / totalArea) * 100)
    : 0;
  // Prefer real square footage (from SVG scale calibration) when available;
  // fall back to relative percent-of-floor for the ML/YOLO path.
  const areaLabel = room.areaSqft != null
    ? `${room.areaSqft} sqft`
    : (areaPercent > 0 ? `${areaPercent}% of floor` : '—');

  return (
    <div className={`group bg-gradient-to-br ${gradientClass} border rounded-2xl p-4
      hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}>

      {/* Room name + type */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0">
          <p className="font-heading font-bold text-sm leading-tight truncate">{displayName}</p>
          <p className="text-xs opacity-80 capitalize font-medium">{type}</p>
        </div>
      </div>

      {/* Per-room stats — doors, windows, walls, area */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatBox icon="🚪" label="Doors" value={room.doors ?? 0} />
        <StatBox icon="🪟" label="Windows" value={room.windows ?? 0} />
        <StatBox icon="🧱" label="Walls" value={room.walls ?? 0} />
        <StatBox icon="📐" label="Area" value={areaLabel} small />
      </div>

      {/* Relative size bar */}
      {areaPercent > 0 && (
        <div>
          <div className="flex justify-between text-xs font-heading opacity-80 mb-1">
            <span>Relative size</span>
            <span>{areaPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/35 transition-all duration-700"
              style={{ width: `${areaPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Compliance badges — only present on SVG-parsed plans */}
      {room.compliance && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          <ComplianceBadge ok={room.compliance.ventilation} label="Ventilation" />
          <ComplianceBadge ok={room.compliance.wall_thickness} label="Wall thickness" />
        </div>
      )}
    </div>
  );
}

function ComplianceBadge({ ok, label }) {
  return (
    <span className={`text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
      ok
        ? 'bg-brand-green-dim border-brand-green-border text-brand-green'
        : 'bg-brand-red-dim border-brand-red-border text-brand-red'
    }`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}

function StatBox({ icon, label, value, small }) {
  return (
    <div className="bg-eco-black/30 rounded-inner py-2.5 px-2 text-center">
      <p className="text-base mb-0.5">{icon}</p>
      <p className={`font-heading font-extrabold leading-tight ${small ? 'text-xs' : 'text-xl'}`}>{value}</p>
      <p className="text-xs font-heading opacity-80 mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  );
}
