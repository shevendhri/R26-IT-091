const TYPE_ICONS = {
  living: '🛋️',
  bedroom: '🛏️',
  bathroom: '🚿',
  kitchen: '🍳',
  dining: '🍽️',
  garage: '🚗',
  study: '📚',
  laundry: '🧺',
  storage: '📦',
  hallway: '🚪',
  porch: '🏡',
  balcony: '🌿',
  other: '🏠',
};

export default function RoomCard({ room, index, totalArea = 0 }) {
  const type = room.type || 'other';
  const icon = TYPE_ICONS[type] || TYPE_ICONS.other;
  const displayName = room.name || `Room ${index + 1}`;

  const areaPx = room.wallAreaPx2 || room.area_px2 || 0;
  const areaPercent = totalArea > 0 && areaPx > 0
    ? Math.round((areaPx / totalArea) * 100)
    : 0;

  const areaLabel = room.areaSqft != null
    ? `${room.areaSqft} sqft`
    : (areaPercent > 0 ? `${areaPercent}%` : '—');

  return (
    <div className="room-card-box">
      {/* Room Name & Type */}
      <div className="room-card-header">
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 className="room-card-title">{displayName}</h4>
          <p className="room-card-type">{type}</p>
        </div>
      </div>

      {/* 4-Column Stat Grid — Explicitly spaced so text NEVER overlaps */}
      <div className="room-stat-grid">
        <div className="room-stat-tile">
          <span className="room-stat-icon">🚪</span>
          <span className="room-stat-val">{room.doors ?? 0}</span>
          <span className="room-stat-lbl">Doors</span>
        </div>
        <div className="room-stat-tile">
          <span className="room-stat-icon">🪟</span>
          <span className="room-stat-val">{room.windows ?? 0}</span>
          <span className="room-stat-lbl">Windows</span>
        </div>
        <div className="room-stat-tile">
          <span className="room-stat-icon">🧱</span>
          <span className="room-stat-val">{room.walls ?? 0}</span>
          <span className="room-stat-lbl">Walls</span>
        </div>
        <div className="room-stat-tile">
          <span className="room-stat-icon">📐</span>
          <span className="room-stat-val">{areaLabel}</span>
          <span className="room-stat-lbl">Area</span>
        </div>
      </div>

      {/* Relative Size Progress Bar */}
      {areaPercent > 0 && (
        <div className="room-relative-bar-wrap">
          <div className="room-relative-bar-label">
            <span>Relative Proportion</span>
            <span style={{ fontWeight: 800, color: '#143825' }}>{areaPercent}%</span>
          </div>
          <div className="room-relative-bar-track">
            <div
              className="room-relative-bar-fill"
              style={{ width: `${Math.min(areaPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Compliance Badges */}
      {room.compliance && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
          <ComplianceBadge ok={room.compliance.ventilation} label="Ventilation" />
          <ComplianceBadge ok={room.compliance.wall_thickness} label="Wall Thickness" />
        </div>
      )}
    </div>
  );
}

function ComplianceBadge({ ok, label }) {
  return (
    <span className={`compliance-badge-pill ${ok ? 'is-ok' : 'is-fail'}`}>
      <span>{ok ? '✓' : '✗'}</span>
      <span>{label}</span>
    </span>
  );
}
