"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff', position: 'relative' }}>
      <div className="premium-bg"><div className="gradient-mesh"></div><div className="blueprint-grid"></div></div>
      
      <Header />
      
      <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 10 }}>
        
        <div className="neural-core-v2" style={{ width: '200px', height: '200px', marginBottom: '3rem' }}>
          <div className="core-ring core-ring-1"></div>
          <div className="core-ring core-ring-2"></div>
          <div className="core-ring core-ring-3"></div>
          <div style={{ fontSize: '5rem' }}>🌎</div>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', 
          fontWeight: 900, 
          color: '#fff', 
          lineHeight: 1.05, 
          marginBottom: '2rem', 
          fontFamily: 'Space Grotesk',
          letterSpacing: '-2px'
        }}>
          INTELLIGENT <span style={{ color: 'var(--eco-glow)', textShadow: '0 0 40px rgba(0, 255, 157, 0.3)' }}>SUSTAINABLE</span><br/>ARCHITECTURES
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
          color: 'var(--text-secondary)', 
          maxWidth: '800px', 
          margin: '0 auto 4rem', 
          lineHeight: 1.6, 
          fontWeight: 500 
        }}>
          The world's first Neural Feasibility Engine for sustainable construction. 
          Analyze blueprints, optimize materials, and engineer for climate resilience in real-time with Sri Lankan engineering benchmarks.
        </p>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
           <Link href="/materials" className="btn-premium" style={{ padding: '1.2rem 3rem', minWidth: '250px', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            START ENGINEERING MATRIX
           </Link>
           <Link href="/blueprint" className="glass-panel glow-border" style={{ 
            padding: '1.2rem 3rem', 
            minWidth: '250px', 
            textDecoration: 'none', 
            color: '#fff', 
            fontWeight: 800, 
            letterSpacing: '2px', 
            fontSize: '0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid var(--blueprint-blue)'
           }}>
            SCAN BLUEPRINT AI
           </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1400px', marginTop: '8rem' }}>
           {[
             { title: 'CLIMATE ADAPTIVE', desc: 'Predictive material performance across 14+ Sri Lankan micro-climates including coastal and highland zones.', icon: '🧪' },
             { title: 'SPATIAL NEURAL MAPS', desc: 'Computer Vision analysis of floorplans with automated occupancy logic and structural audit.', icon: '📐' },
             { title: 'ECO-FISCAL AUDIT', desc: 'Real-time cost estimation balanced with embodied carbon tracking and feasibility gating.', icon: '🌿' }
           ].map((f, i) => (
             <div key={i} className="glass-panel glow-border" style={{ padding: '3.5rem 2.5rem', textAlign: 'left' }}>
                <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--eco-glow)', fontFamily: 'Space Grotesk' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{f.desc}</p>
             </div>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
