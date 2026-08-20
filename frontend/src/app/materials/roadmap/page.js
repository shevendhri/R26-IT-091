"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RoadmapPage() {
  const stages = [
    { title: 'STAGE 01 📐', description: 'Plan Analyzer extracts architectural layers, room boundaries, and spatial parameters.' },
    { title: 'STAGE 02 🔬', description: 'Material Specification Engine calculates construction quantities and applies MCDM decision scoring.' },
    { title: 'STAGE 03 📋', description: 'Bill of Materials (BOM) is generated with component quantities, units, cost, embodied carbon, and service life.' },
    { title: 'STAGE 04 🥫', description: 'Planner5D integration will render a 3D interior/exterior layout mapping material textures to coordinates.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff' }}>
      <Header />
      <main style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--eco-glow)', marginBottom: '1rem' }}>Future Integration Roadmap</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {stages.map((s, i) => (
            <li key={i} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>{s.title}</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{s.description}</p>
            </li>
          ))}
        </ul>
        <Link href="/materials/form">
          <a style={{ marginTop: '2rem', display: 'inline-block', background: 'var(--eco-glow)', padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#000' }}>Start the workflow</a>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
