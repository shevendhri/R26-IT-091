/**
 * GreenConstructAI Unified Button Component
 * Standardized to Deep Forest Green & Limestone Earth Palette
 */

const variants = {
  default: {
    background: '#143825',
    color: '#FCFAF6',
    border: '1px solid #143825',
    boxShadow: '0 2px 6px rgba(20, 56, 37, 0.15)',
  },
  primary: {
    background: '#143825',
    color: '#FCFAF6',
    border: '1px solid #143825',
    boxShadow: '0 2px 6px rgba(20, 56, 37, 0.15)',
  },
  outline: {
    background: 'rgba(255, 255, 255, 0.6)',
    color: '#143825',
    border: '1px solid #D5CCBC',
  },
  secondary: {
    background: '#ECE5D8',
    color: '#143825',
    border: '1px solid #D5CCBC',
  },
  ghost: {
    background: 'transparent',
    color: '#4B5A50',
    border: '1px solid transparent',
  },
  destructive: {
    background: '#B85C43',
    color: '#FCFAF6',
    border: '1px solid #B85C43',
  },
  amber: {
    background: '#EDE5D8',
    color: '#7E6048',
    border: '1px solid #D8CCBD',
  },
};

const sizes = {
  default: { padding: '0.65rem 1.35rem', fontSize: '0.78rem' },
  sm:      { padding: '0.4rem 0.9rem',    fontSize: '0.72rem' },
  lg:      { padding: '0.85rem 1.85rem',  fontSize: '0.85rem' },
  icon:    { padding: '0.5rem',           fontSize: '1rem', minWidth: '36px', justifyContent: 'center' },
};

export function Button({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) {
  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.default;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`arch-btn-unified ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        borderRadius: '6px',
        fontWeight: 700,
        fontFamily: "'Space Grotesk', -apple-system, sans-serif",
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.18s ease',
        textDecoration: 'none',
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
