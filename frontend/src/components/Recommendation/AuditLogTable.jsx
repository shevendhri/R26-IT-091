"use client";
import React, { useState } from 'react';

/**
 * AuditLogTable – System evaluation audit stream rendered as a technical diagnostics table.
 * Collapsed by default; available on demand.
 */
export default function AuditLogTable({ logs }) {
  const [open, setOpen] = useState(false);
  if (!logs || logs.length === 0) return null;

  const getScoreColor = (score) => {
    const n = parseFloat(score) || 0;
    if (n >= 70) return '#10b981';
    if (n >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          background: '#0b0f19',
          borderBottom: open ? '1px solid #1e293b' : 'none',
        }}
      >
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.1rem' }}>
            System Diagnostics
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
            Full Evaluation Audit Log — {logs.length} Materials Evaluated
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {open && (
        <div style={{ overflowX: 'auto', background: '#090d16' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                {['Rank', 'Category', 'Material Specification', 'ML Score', 'Eng. Score', 'Hybrid Score', 'Evaluation Justification'].map((h, i) => (
                  <th key={i} style={{
                    padding: '7px 10px',
                    textAlign: 'left',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '6px 10px', color: '#64748b', fontWeight: 700 }}>#{log.ranking}</td>
                  <td style={{ padding: '6px 10px', color: '#38bdf8', fontWeight: 600 }}>{log.category}</td>
                  <td style={{ padding: '6px 10px', color: '#f8fafc', fontWeight: 600 }}>{log.item_name}</td>
                  <td style={{ padding: '6px 10px', color: getScoreColor(log.ml_score) }}>
                    {log.ml_score != null ? parseFloat(log.ml_score).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '6px 10px', color: getScoreColor(log.engineering_score) }}>
                    {log.engineering_score != null ? parseFloat(log.engineering_score).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '6px 10px', color: getScoreColor(log.hybrid_score), fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                    {log.hybrid_score != null ? parseFloat(log.hybrid_score).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '6px 10px', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.4, fontSize: '0.7rem' }}>{log.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
