"use client";
import React, { useState } from 'react';
import { scoreColor } from './MaterialCard';
import SectionTitle from './SectionTitle';

/**
 * AuditLogTable – renders the dynamic list of all evaluated candidate logs.
 *
 * Data Traceability:
 *   Audit Logs  → data.audit_log
 *   Log Info    → ranking, category, item_name, ml_score, engineering_score, hybrid_score, explanation
 */
export default function AuditLogTable({ logs }) {
  const [open, setOpen] = useState(false);
  if (!logs || logs.length === 0) return null;
  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <SectionTitle style={{ marginBottom: 0 }}>
          System Audit Logs ({logs.length} Materials Evaluated)
        </SectionTitle>
        <span style={{ color: 'var(--eco-glow)', fontSize: '1rem', fontWeight: 800 }}>
          {open ? '▼' : '▶'}
        </span>
      </div>
      {open && (
        <div style={{ overflowX: 'auto', marginTop: '1.25rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Rank', 'Category', 'Material Specification', 'ML Probability', 'Engineering Suitability', 'Hybrid Aggregation', 'Technical Evaluation Justification'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '7px 12px', color: 'var(--text-dim)', fontWeight: 700 }}>#{log.ranking}</td>
                  <td style={{ padding: '7px 12px', color: 'var(--blueprint-blue)', fontWeight: 700 }}>{log.category}</td>
                  <td style={{ padding: '7px 12px', color: '#fff', fontWeight: 600 }}>{log.item_name}</td>
                  <td style={{ padding: '7px 12px', color: scoreColor(log.ml_score) }}>{log.ml_score != null ? parseFloat(log.ml_score).toFixed(1) : '—'}</td>
                  <td style={{ padding: '7px 12px', color: scoreColor(log.engineering_score) }}>{log.engineering_score != null ? parseFloat(log.engineering_score).toFixed(1) : '—'}</td>
                  <td style={{ padding: '7px 12px', color: scoreColor(log.hybrid_score), fontWeight: 800 }}>{log.hybrid_score != null ? parseFloat(log.hybrid_score).toFixed(1) : '—'}</td>
                  <td style={{ padding: '7px 12px', color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.72rem', lineHeight: 1.4 }}>{log.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
