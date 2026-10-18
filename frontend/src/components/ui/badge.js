/**
 * GreenConstructAI Unified Badge Component
 * Standardized across regulatory, material, and status indicators
 */

const variants = {
  default: {
    background: '#D2E4D6',
    color: '#153E28',
    border: '1px solid rgba(21, 62, 40, 0.22)',
  },
  forest: {
    background: '#143825',
    color: '#FCFAF6',
    border: '1px solid #143825',
  },
  sage: {
    background: '#E8EFE9',
    color: '#2A4E39',
    border: '1px solid rgba(42, 78, 57, 0.25)',
  },
  warning: {
    background: 'rgba(200, 138, 50, 0.12)',
    color: '#8D6A4F',
    border: '1px solid rgba(200, 138, 50, 0.28)',
  },
  amber: {
    background: 'rgba(200, 138, 50, 0.12)',
    color: '#8D6A4F',
    border: '1px solid rgba(200, 138, 50, 0.28)',
  },
  destructive: {
    background: 'rgba(184, 92, 67, 0.12)',
    color: '#B85C43',
    border: '1px solid rgba(184, 92, 67, 0.28)',
  },
  danger: {
    background: 'rgba(184, 92, 67, 0.12)',
    color: '#B85C43',
    border: '1px solid rgba(184, 92, 67, 0.28)',
  },
  terracotta: {
    background: 'rgba(184, 92, 67, 0.12)',
    color: '#B85C43',
    border: '1px solid rgba(184, 92, 67, 0.28)',
  },
  outline: {
    background: 'transparent',
    color: '#173A2B',
    border: '1px solid #D5CCBC',
  },
  secondary: {
    background: '#FAF8F4',
    color: '#4B5A50',
    border: '1px solid #D5CCBC',
  },
  success: {
    background: '#D2E4D6',
    color: '#153E28',
    border: '1px solid rgba(21, 62, 40, 0.22)',
  },
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
      className={`arch-badge-unified ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.66rem',
        fontWeight: 750,
        letterSpacing: '0.04em',
        fontFamily: "'Space Grotesk', -apple-system, sans-serif",
        textTransform: 'uppercase',
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

export function RiskBadge({ level = 'LOW', label, ...props }) {
  const levelLower = (level || 'low').toLowerCase();
  const map = {
    high:   'success',
    medium: 'warning',
    low:    'destructive',
  };
  const variant = map[levelLower] || 'secondary';

  return (
    <Badge variant={variant} {...props}>
      {label || `${level} RISK`}
    </Badge>
  );
}

export default Badge;
