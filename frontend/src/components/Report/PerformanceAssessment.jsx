import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

/**
 * PerformanceAssessment – shows high‑level performance metrics derived from the AI recommendation.
 * Currently a placeholder; replace with detailed charts/tables as needed.
 */
export default function PerformanceAssessment({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const metrics = data?.metrics ?? {};
  const aiScore = typeof metrics.overall_hybrid_score === 'number' ? metrics.overall_hybrid_score.toFixed(1) : 'N/A';
  const sustainability = typeof metrics.average_sustainability === 'number' ? metrics.average_sustainability.toFixed(1) : 'N/A';

  return (
    <GlassCard className="glass-card">
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Performance Assessment</h2>
      <p><strong>AI Score:</strong> {aiScore}</p>
      <p><strong>Sustainability:</strong> {sustainability}</p>
    </GlassCard>
  );
}
