/**
 * shadcn/ui-style Card components
 * Built on the existing CSS variable system — no Tailwind required.
 */

export function Card({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={className}
      style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        background: 'rgba(0,0,0,0.2)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', style = {}, ...props }) {
  return (
    <h3
      className={className}
      style={{
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        letterSpacing: '-0.3px',
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={className}
      style={{
        padding: '1rem 1.25rem',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={className}
      style={{
        padding: '0.85rem 1.25rem',
        borderTop: '1px solid var(--border)',
        background: 'rgba(0,0,0,0.15)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
