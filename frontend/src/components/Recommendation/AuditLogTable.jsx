"use client";
import React, { useState } from 'react';

/**
 * AuditLogTable – System evaluation audit stream rendered as a technical diagnostics table.
 * Updated for high-contrast warm sustainable architecture theme.
 */
export default function AuditLogTable({ logs }) {
  const [open, setOpen] = useState(false);
  if (!logs || logs.length === 0) return null;

  const getScoreColor = (score) => {
    const n = parseFloat(score) || 0;
    if (n >= 70) return '#245C43';
    if (n >= 50) return '#C77A3D';
    return '#B94A48';
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #C8D3CA',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.04)'
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.2rem',
          cursor: 'pointer',
          background: '#F7F9F6',
          borderBottom: open ? '1px solid #C8D3CA' : 'none',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#245C43', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.15rem', fontFamily: 'Space Grotesk' }}>
            System Diagnostics
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk' }}>
            Full Evaluation Audit Log — {logs.length} Materials Evaluated
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#526158" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {open && (
        <div style={{ overflowX: 'auto', background: '#FFFFFF' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #C8D3CA', background: '#F7F9F6' }}>
                {['Rank', 'Category', 'Material Specification', 'ML Score', 'Eng. Score', 'Hybrid Score', 'Evaluation Justification'].map((h, i) => (
                  <th key={i} style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#526158',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #C8D3CA', background: i % 2 === 0 ? '#FFFFFF' : '#F7F9F6' }}>
                  <td style={{ padding: '8px 12px', color: '#526158', fontWeight: 800, fontFamily: 'Space Grotesk' }}>#{log.ranking}</td>
                  <td style={{ padding: '8px 12px', color: '#3E6F8E', fontWeight: 700 }}>{log.category}</td>
                  <td style={{ padding: '8px 12px', color: '#18251F', fontWeight: 700 }}>{log.item_name}</td>
                  <td style={{ padding: '8px 12px', color: getScoreColor(log.ml_score), fontWeight: 700 }}>
                    {log.ml_score != null ? parseFloat(log.ml_score).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', color: getScoreColor(log.engineering_score), fontWeight: 700 }}>
                    {log.engineering_score != null ? parseFloat(log.engineering_score).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', color: getScoreColor(log.hybrid_score), fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                    {log.hybrid_score != null ? parseFloat(log.hybrid_score).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', color: '#526158', maxWidth: '340px', lineHeight: 1.4, fontSize: '0.75rem', fontWeight: 500 }}>{log.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
