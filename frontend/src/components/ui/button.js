/**
 * shadcn/ui-style Button component
 * Built on the existing CSS variable system — no Tailwind required.
 */

const variants = {
  default: {
    background: 'var(--primary)',
    color: '#000',
    border: 'none',
    fontWeight: 900,
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-main)',
    border: '1px solid var(--border)',
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    fontWeight: 600,
  },
  destructive: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
  },
  secondary: {
    background: 'var(--slate)',
    color: 'var(--text-main)',
    border: 'none',
    fontWeight: 600,
  },
};

const sizes = {
  default: { padding: '0.6rem 1.25rem', fontSize: '0.82rem' },
  sm:      { padding: '0.35rem 0.85rem', fontSize: '0.75rem' },
  lg:      { padding: '0.85rem 2rem',   fontSize: '0.92rem' },
  icon:    { padding: '0.5rem',          fontSize: '1rem', minWidth: '36px', justifyContent: 'center' },
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
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-main)',
        letterSpacing: '0.3px',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = 'brightness(1.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
        e.currentTarget.style.transform = '';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
