import React from 'react';
import AuditLogTable from '../Recommendation/AuditLogTable';

/**
 * AuditLogPanel – A panel component that wraps the AuditLogTable with a header and
 * optional styling.
 *
 * Data Traceability:
 *   Audit Logs  → data.audit_log
 */
export default function AuditLogPanel({ data }) {
  if (!data) return null;

  const auditLogs = data.audit_log || [];

  if (auditLogs.length === 0) return null;

  return (
    <section style={{ marginTop: '1.5rem' }}>
      <AuditLogTable logs={auditLogs} />
    </section>
  );
}
