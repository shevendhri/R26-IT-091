"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ display: 'block', height: 'auto', minHeight: '100vh' }}>
      {/* 🌿 ECO-CONSTRUCTION HEADER */}
      <header className="header" style={{ marginBottom: '0' }}>
        <div>
            <h1>GreenConstructAI | <span style={{color: 'var(--primary)'}}>Portal</span></h1>
            <p>Sustainable Structural Analysis Platform</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1.5rem', opacity: 0.8 }}>
            <span>🏢</span> <span>🍃</span> <span>📐</span>
        </div>
      </header>

      <main style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
        <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-tech)', fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-2px', margin: 0, color: '#fff' }}>
                Sustainable <span style={{color: 'var(--primary)'}}>Engineering</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '1rem auto', fontWeight: 500 }}>
                High-fidelity structural analysis and automated plan parsing 
                tailored for high-performance eco-friendly construction.
            </p>
        </div>

        {/* ⚙️ PROJECT TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* TILE 1: BLUEPRINT ANALYSIS */}
            <Link href="/blueprint" style={{ textDecoration: 'none' }}>
                <div className="spec-sheet" style={{ borderTop: '6px solid var(--primary)', cursor: 'pointer', textAlign: 'left', height: '100%' }}>
                    <div className="spec-sheet-header" style={{ background: 'var(--primary)', color: '#000' }}>
                        <h3 style={{ color: '#000' }}>BLUEPRINT AI</h3>
                        <span style={{ fontWeight: 900, fontSize: '0.7rem' }}>STRUCTURAL_PARSING</span>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <p style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Computer vision modules for parsing architectural plans and identifying 
                            structural elements for site preparation.
                        </p>
                        <div style={{ background: '#000', padding: '1.2rem', border: '1px solid var(--border)', color: 'var(--primary)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                            OPEN PLAN ANALYZER →
                        </div>
                    </div>
                </div>
            </Link>

            {/* TILE 2: MATERIAL SELECTOR */}
            <Link href="/materials" style={{ textDecoration: 'none' }}>
                <div className="spec-sheet" style={{ borderTop: '6px solid var(--slate)', cursor: 'pointer', textAlign: 'left', height: '100%' }}>
                    <div className="spec-sheet-header">
                        <h3>SPECIFIER</h3>
                        <span style={{ fontWeight: 900, fontSize: '0.7rem' }}>DECISION_LOGIC</span>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <p style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Multi-criteria decision modeling to optimize material selection 
                            against BSR standards and sustainability metrics.
                        </p>
                        <div style={{ background: '#000', padding: '1.2rem', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>
                            OPEN OPTIMIZATION TOOLS →
                        </div>
                    </div>
                </div>
            </Link>

        </div>

        {/* 📊 SYSTEM STATUS FOOTER */}
        <div style={{ marginTop: '6rem', borderTop: '1px solid #333', paddingTop: '2rem', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
            <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 900 }}>BSR_DATABASE</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 900 }}>v2024_SYNCED</div>
            </div>
            <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 900 }}>ANALYSIS CORE</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 900 }}>READY</div>
            </div>
            <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 900 }}>SUSTAINABILITY</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 900 }}>VERIFIED</div>
            </div>
        </div>
      </main>
    </div>
  );
}
