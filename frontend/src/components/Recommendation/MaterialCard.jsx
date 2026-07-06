"use client";

// ── Helpers shared across the card ──
export function scoreColor(v) {
  const n = parseFloat(v) || 0;
  if (n >= 70) return 'var(--eco-glow)';
  if (n >= 50) return 'var(--warn-amber)';
  return 'var(--error-red)';
}

function ScoreBar({ label, value, max = 100 }) {
  const pct = Math.min(100, Math.max(0, ((parseFloat(value) || 0) / max) * 100));
  const color = scoreColor(value);
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>{value != null ? parseFloat(value).toFixed(1) : 'N/A'}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
    </div>
  );
}

function VetoBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: '6px', padding: '2px 10px', fontSize: '0.65rem', fontWeight: 800,
      color: 'var(--error-red)', letterSpacing: '1px', textTransform: 'uppercase'
    }}>
      ENGINEERING VETO
    </span>
  );
}

/** Renders the top-3 candidates table for a category */
function AlternativesTable({ candidates }) {
  if (!candidates || candidates.length === 0) return null;
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        TOP CANDIDATES
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['#', 'Material', 'Hybrid', 'ML', 'Eng'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i === 0 ? 'rgba(0,255,157,0.03)' : 'transparent' }}>
                <td style={{ padding: '7px 10px', color: i === 0 ? 'var(--eco-glow)' : 'var(--text-dim)', fontWeight: 800 }}>#{c.rank}</td>
                <td style={{ padding: '7px 10px', color: i === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: i === 0 ? 700 : 400 }}>{c.material}</td>
                <td style={{ padding: '7px 10px', color: scoreColor(c.hybrid_score), fontWeight: 700 }}>{c.hybrid_score?.toFixed(1)}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-secondary)' }}>{c.ml_score != null ? c.ml_score.toFixed(1) : '—'}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-secondary)' }}>{c.engineering_score?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * MaterialCard — renders a single recommended material category card.
 * Props:
 *   categoryKey  – package key e.g. "foundation"
 *   displayName  – human label e.g. "Foundation"
 *   item         – the package item object from recommended_package
 *   candidates   – top3_candidates array for this category
 *
 * Data Traceability (all metrics from backend payload):
 *   Engineering Score   → item.eng_score
 *   ML Score            → item.ml_score
 *   Hybrid Score        → item.score
 *   Sustainability      → item.sustainability_rating
 *   Embodied Carbon     → item.embodied_carbon
 *   Service Life        → item.service_life
 *   Cost Guidance       → item.cost_guidance
 *   AI Justification    → item.rationale
 */
export default function MaterialCard({ categoryKey, displayName, item, candidates }) {
  if (!item || !item.name) return null;

  const isVetoed = item.selection_reason?.vetoed === true;
  const hybridScore = item.score;
  const engScore = item.eng_score;
  const mlScore = item.ml_score;

  return (
    <div className="glass-card" style={{ position: 'relative', padding: '1.75rem', marginBottom: 0 }}>
      {/* Category header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '4px' }}>
            {displayName}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk', lineHeight: 1.3 }}>
            {item.name}
          </div>
          {isVetoed && <div style={{ marginTop: '6px' }}><VetoBadge /></div>}
        </div>
        {/* Hybrid score ring */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: scoreColor(hybridScore), fontFamily: 'Space Grotesk', lineHeight: 1 }}>
            {hybridScore != null ? parseFloat(hybridScore).toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>HYBRID</div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ marginBottom: '1rem' }}>
        <ScoreBar label="Hybrid Score"      value={hybridScore} />
        <ScoreBar label="Engineering Score" value={engScore} />
        <ScoreBar label="ML Score"          value={mlScore} />
        <ScoreBar label="Sustainability"    value={item.sustainability_rating} />
      </div>

      {/* Metadata chips – only genuine backend fields */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Carbon', value: item.embodied_carbon != null ? item.embodied_carbon.toFixed(2) + ' kgCO₂/kg' : null },
          { label: 'Service Life', value: item.service_life != null ? item.service_life + ' yrs' : null },
          { label: 'Cost', value: item.cost_guidance || null },
        ].filter(c => c.value).map(c => (
          <span key={c.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '3px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.6rem', marginRight: '4px' }}>{c.label}:</span>
            {c.value}
          </span>
        ))}
      </div>

      {/* XAI Justification – from item.rationale (backend ExplanationEngine) */}
      {item.rationale && (
        <div style={{
          background: 'rgba(0,255,157,0.04)', border: '1px solid rgba(0,255,157,0.1)',
          borderRadius: '10px', padding: '1rem', marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--eco-glow)', borderRadius: '50%', boxShadow: '0 0 8px var(--eco-glow)' }}></span>
            AI JUSTIFICATION
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {item.rationale}
          </p>
        </div>
      )}

      {/* Top-3 Alternatives */}
      <AlternativesTable candidates={candidates} />
    </div>
  );
}
