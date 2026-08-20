import React from 'react';

// Confidence badge colors as per design
const CONFIDENCE_COLORS = {
  high: '#28a745',   // Green
  medium: '#ffc107', // Amber
  low: '#dc3545'    // Red
};

/**
 * RecommendationConfidence – displays a badge with appropriate color and label.
 * Accepts `confidence` as a string ('high'|'medium'|'low') or a numeric score (0‑1).
 */
export default function RecommendationConfidence({ confidence }) {
  // Normalize confidence to a string key.
  let confidenceKey = 'low';
  if (typeof confidence === 'string') {
    confidenceKey = confidence.toLowerCase();
  } else if (typeof confidence === 'number') {
    if (confidence >= 0.8) confidenceKey = 'high';
    else if (confidence >= 0.5) confidenceKey = 'medium';
    else confidenceKey = 'low';
  }

  const color = CONFIDENCE_COLORS[confidenceKey] || CONFIDENCE_COLORS['low'];
  const label = `${confidenceKey.charAt(0).toUpperCase() + confidenceKey.slice(1)} Confidence`;

  return (
    <div className="glass-card glow-border" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', borderColor: color }}>
      <span style={{ fontWeight: '600', color, marginRight: '0.5rem' }}>{label}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill={color} xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" />
      </svg>
    </div>
  );
}
