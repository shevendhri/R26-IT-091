"use client";
import PropTypes from 'prop-types';

export default function AiHint({ color, children }) {
  const colors = {
    green: { bg: 'rgba(0,255,157,0.06)', border: 'rgba(0,255,157,0.2)', text: 'rgba(0,255,157,0.9)' },
    blue: { bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.2)', text: 'rgba(96,165,250,0.9)' },
    amber: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', text: 'rgba(245,158,11,0.9)' },
    cyan: { bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)', text: 'rgba(6,182,212,0.9)' },
    red: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.25)', text: 'rgba(239,68,68,0.9)' },
  };
  const c = colors[color] || colors.green;
  return (
    <div style={{ marginTop: '0.5rem', marginBottom: '0.6rem', padding: '0.6rem 0.9rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '0.72rem', color: c.text }}>
      {children}
    </div>
  );
}

AiHint.propTypes = {
  color: PropTypes.oneOf(['green', 'blue', 'amber', 'cyan', 'red']),
  children: PropTypes.node.isRequired,
};
