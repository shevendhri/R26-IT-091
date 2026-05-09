/**
 * shadcn/ui-style Badge component
 * Built on the existing CSS variable system — no Tailwind required.
 */

const variants = {
  default:     { background: 'var(--primary)',    color: '#000' },
  secondary:   { background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' },
  destructive: { background: '#e74c3c',           color: '#fff' },
  outline:     { background: 'transparent',       color: 'var(--text-main)', border: '1px solid var(--border)' },
  success:     { background: 'rgba(39,174,96,0.15)', color: 'var(--primary)', border: '1px solid rgba(39,174,96,0.3)' },
  warning:     { background: 'rgba(243,156,18,0.15)', color: '#f39c12',      border: '1px solid rgba(243,156,18,0.3)' },
  danger:      { background: 'rgba(231,76,60,0.15)',  color: '#e74c3c',      border: '1px solid rgba(231,76,60,0.3)' },
};

export function Badge({
  children,
  variant = 'default',
  className = '',
  style = {},
  ...props
}) {
  const variantStyle = variants[variant] || variants.default;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.65rem',
        borderRadius: '100px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.5px',
        fontFamily: 'var(--font-main)',
        whiteSpace: 'nowrap',
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Convenience: risk-level badge. Pass level = 'HIGH' | 'MEDIUM' | 'LOW'.
 */
export function RiskBadge({ level = 'LOW', label, ...props }) {
  const levelLower = (level || 'low').toLowerCase();
  const map = {
    high:   'success',   // HIGH sustainability = good (green)
    medium: 'warning',
    low:    'danger',    // LOW sustainability = bad (red)
  };
  const lifecycleMap = {
    low:    'success',   // Low lifecycle risk = good
    medium: 'warning',
    high:   'danger',
  };
  // Detect if this is a lifecycle risk or sustainability rating
  const v = label === 'lifecycle' ? lifecycleMap[levelLower] : map[levelLower];

  return (
    <Badge variant={v || 'secondary'} {...props}>
      {level}
    </Badge>
  );
}
