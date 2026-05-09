export default function Header() {
  return (
    <header style={{ 
      padding: '1.5rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary, #2ecc71)' }}>
        GreenConstructAI
      </div>
      <nav>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
          ← Back to Home
        </a>
      </nav>
    </header>
  );
}
