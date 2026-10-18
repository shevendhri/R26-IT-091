import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * TechnicalAudit – displays audit information in a collapsible <details> block.
 */
export default function TechnicalAudit({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const auditLog = data?.audit_log ?? [];
  return (
    <GlassCard className="glass-card">
      <details style={{ cursor: 'pointer' }}>
        <summary style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Technical Audit</summary>
        {auditLog.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No audit entries.</p>
        ) : (
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-primary)' }}>
            {auditLog.map((entry, i) => (
              <li key={i} style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {JSON.stringify(entry, null, 2)}
              </li>
            ))}
          </ul>
        )}
      </details>
    </GlassCard>
  );
}
