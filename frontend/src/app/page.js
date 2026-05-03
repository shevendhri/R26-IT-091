"use client";

import React from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const members = [
    { name: "Shevendhri", role: "Project Lead & AI Developer", icon: "🌱" },
    { name: "Sukitha", role: "Structural Systems Engineer", icon: "🏗️" },
    { name: "Savidya", role: "Sustainable Material Analyst", icon: "🍃" },
    { name: "Jaindu", role: "Frontend Architect", icon: "💻" }
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', transition: 'all 0.4s' }}>
      {/* 🚀 NAVIGATION HEADER */}
      <header className="header" style={{ position: 'sticky', top: 0, backdropFilter: 'blur(10px)', background: 'var(--glass-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌿</span>
            <div>
                <h1 style={{ fontSize: '1rem', margin: 0 }}>GreenConstructAI</h1>
                <p style={{ fontSize: '0.5rem', color: 'var(--primary)', margin: 0, fontWeight: 900 }}>ENGINEERING THE FUTURE</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <nav className="nav-links">
            <Link href="/blueprint" className="nav-link">ANALYSIS</Link>
            <Link href="/materials" className="nav-link">MATERIALS</Link>
          </nav>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'var(--panel-bg)', 
              border: '1px solid var(--border)', 
              color: 'var(--text-main)', 
              padding: '0.5rem', 
              borderRadius: '50%', 
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* 🏔️ HERO SECTION */}
      <section style={{ 
        position: 'relative', 
        height: '70vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: 'url("/hero.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden'
      }}>
        <div style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), var(--bg))' 
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 2rem' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-tech)', 
            fontSize: '4rem', 
            fontWeight: 900, 
            color: '#fff', 
            textTransform: 'uppercase', 
            letterSpacing: '-2px',
            margin: 0
          }}>
            Sustainable <span style={{ color: 'var(--primary)' }}>Construction</span> AI
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#ccc', 
            maxWidth: '700px', 
            margin: '1.5rem auto',
            lineHeight: '1.6'
          }}>
            Empowering modern engineering with AI-driven blueprint parsing and 
            scientifically validated material decision-making systems.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/blueprint" className="btn-primary" style={{ textDecoration: 'none', width: 'auto', padding: '1rem 2rem' }}>
                START ANALYSIS
            </Link>
            <Link href="/materials" className="btn-primary" style={{ textDecoration: 'none', width: 'auto', padding: '1rem 2rem', background: 'var(--slate)', boxShadow: 'none' }}>
                VIEW MATERIALS
            </Link>
          </div>
        </div>
      </section>

      {/* 👥 TEAM SECTION */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ 
            fontFamily: 'var(--font-tech)', 
            fontSize: '2rem', 
            textAlign: 'center', 
            marginBottom: '4rem',
            color: 'var(--text-main)'
        }}>
            MEET THE <span style={{ color: 'var(--primary)' }}>ARCHITECTS</span>
        </h3>
        
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
        }}>
            {members.map(member => (
                <div key={member.name} style={{ 
                    background: 'var(--panel-bg)', 
                    border: '1px solid var(--border)', 
                    padding: '2rem', 
                    textAlign: 'center',
                    borderRadius: '12px',
                    transition: 'transform 0.3s'
                }} className="team-card">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{member.icon}</div>
                    <h4 style={{ margin: '0.5rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{member.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</p>
                </div>
            ))}
        </div>
      </section>

      {/* 🛠️ CORE MODULES */}
      <section style={{ padding: '4rem 2rem', background: 'var(--slate)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontFamily: 'var(--font-tech)', fontSize: '1.5rem', color: 'var(--text-main)' }}>The GreenConstruct <span style={{ color: 'var(--primary)' }}>Ecosystem</span></h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                    Our platform integrates two core modules designed to streamline the construction workflow. 
                    From the moment a blueprint is uploaded, our Computer Vision engine identifies spatial layouts, 
                    while our MCDM engine ensures that every material specified meets the highest standards of 
                    strength, cost-efficiency, and environmental impact.
                </p>
            </div>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Blueprint Parsing AI</h5>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated room detection and spatial reasoning for optimized layouts.</p>
                </div>
                <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Material Decision Engine</h5>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-criteria ranking based on BSR standards and sustainability indices.</p>
                </div>
            </div>
        </div>
      </section>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>© 2024 GREENCONSTRUCTAI | BUILT FOR ACADEMIC EXCELLENCE</p>
      </footer>

      <style jsx>{`
        .team-card:hover {
            transform: translateY(-10px);
            border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}

