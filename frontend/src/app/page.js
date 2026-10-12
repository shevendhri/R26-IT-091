"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArchitecturalHeroPortal from '@/components/ArchitecturalHeroPortal';

export default function Home() {
  const [activeMaterialTab, setActiveMaterialTab] = useState('aac');

  const scrollToExplore = (e) => {
    e.preventDefault();
    const el = document.getElementById('core-components');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const coreComponents = [
    {
      num: '01',
      title: 'Plan & Blueprint Analyzer',
      category: 'SPATIAL & CAD EXTRACTION',
      desc: 'Computer vision boundary parsing, automated floor plan telemetry, wall/floor area computations, opening ratios, and spatial coordinate vector generation.',
      href: '/plan-analyzer',
      cta: 'Open Plan Analyzer →',
      accent: '#173A2B',
      tag: 'VISION AI',
      img: '/blueprint_desk.png',
      features: ['Automated Wall & Slab Takeoff', 'Boundary Vector Geometry', 'Opening & Fenestration Ratio', 'CAD DXF / PDF Extraction'],
    },
    {
      num: '02',
      title: 'Material Specification & 3D Intelligence',
      category: 'MATERIAL INTELLIGENCE & 3D BIM',
      desc: 'The central research engine synthesizing MCDM TOPSIS, SLS structural checks, and Random Forest models. Unites the intake brief, 3D cutaway model, specification monograph, and project history.',
      href: '/materials/form',
      cta: 'Open Material Specification →',
      accent: '#8D6A4F',
      tag: 'CORE ENGINE',
      isPrimaryFocus: true,
      img: '/materials_samples.png',
      sublinks: [
        { label: 'Project Intake Brief', href: '/materials/form' },
        { label: 'SLS Building Requirements', href: '/materials/building-requirements' },
        { label: '3D BIM Cutaway Studio', href: '/materials/3d' },
        { label: 'Specification Report', href: '/materials/report' },
        { label: 'Project Archives & History', href: '/history' },
      ],
      features: ['Hybrid MCDM + Random Forest', 'Embedded 3D BIM Cutaway Studio', 'SLS 107/614 Engineering Audits', 'Full Decision Trace Monograph'],
    },
    {
      num: '03',
      title: 'Fire Safety Compliance',
      category: 'STATUTORY & LIFE SAFETY',
      desc: 'Preliminary engineering verification of structural fire resistance ratings under SLS 139 and British Standard BS 476, non-combustibility of envelope partitions, and egress travel distances.',
      href: '/fire-safety',
      cta: 'Open Fire Safety Module →',
      accent: '#B85C43',
      tag: 'SLS 139 · BS 476',
      img: '/fire_safety_architecture.jpg',
      features: ['2-Hour Frame Fire Rating', 'Envelope Flame Spread Index', 'Compartment Area Boundaries', 'ICTAD Regulation Audits'],
    },
    {
      num: '04',
      title: 'Green Building Pre-Assessment',
      category: 'SUSTAINABILITY & GREENSL',
      desc: 'Environmental performance scorecard aligned with Green Building Council of Sri Lanka (GBCSL) criteria, calculating embodied carbon intensity (kg CO₂e/m²) and local sourcing indices.',
      href: '/green-assessment',
      cta: 'Open Green Assessment →',
      accent: '#718C77',
      tag: 'GREENSL · GBCSL',
      img: '/biophilic_building.jpg',
      features: ['Embodied Carbon Benchmarking', 'Regional Material Extraction (500km)', 'GBCSL Rating Tier Prediction', 'UDA Blue-Green Compliance'],
    },
  ];


  const sampleProjects = [
    {
      title: 'Tropical Biophilic Villa',
      location: 'Colombo 07 · Wet Lowland',
      area: '170 m² · 2 Floors',
      score: '88.4 / 100',
      tag: 'RESIDENTIAL',
      spec: 'AAC Blocks + Timber Louvers + Clay Tile Roof',
      href: '/materials/form',
    },
    {
      title: 'Bio-Climatic Head Office',
      location: 'Kandy · Hill Country Wet',
      area: '520 m² · 4 Floors',
      score: '91.2 / 100',
      tag: 'COMMERCIAL',
      spec: 'Low-Carbon RC Frame + Terrazzo + Glass Facade',
      href: '/materials/form',
    },
    {
      title: 'Coastal Eco-Resort Pavilion',
      location: 'Galle · High Salinity Coastal',
      area: '240 m² · 1 Floor',
      score: '86.8 / 100',
      tag: 'HOSPITALITY',
      spec: 'CSEB Earth Blocks + Treated Teak + Micro-Concrete',
      href: '/materials/form',
    },
  ];

  const materialSwatches = [
    { id: 'aac', name: 'AAC Eco-Block', category: 'Envelope Partition', density: '550 kg/m³', uValue: '0.16 W/m²K', carbon: '142 kg CO₂/t', sls: 'SLS 107 Class A' },
    { id: 'cseb', name: 'Compressed Earth (CSEB)', category: 'Masonry Unit', density: '1850 kg/m³', uValue: '0.65 W/m²K', carbon: '48 kg CO₂/t', sls: 'SLS 1382 Pass' },
    { id: 'teak', name: 'Sustainably Sourced Teak', category: 'Timber Millwork', density: '650 kg/m³', uValue: '0.14 W/m²K', carbon: '-720 kg CO₂/t', sls: 'Grade 1 Hardwood' },
    { id: 'clay', name: 'Sinhala Terracotta Tile', category: 'Roof Cladding', density: '1900 kg/m³', uValue: '0.85 W/m²K', carbon: '210 kg CO₂/t', sls: 'SLS 614 Standard' },
  ];

  const currentSwatch = materialSwatches.find(m => m.id === activeMaterialTab) || materialSwatches[0];

  return (
    <div className="arch-page-canvas" style={{ background: '#FAF7F0', minHeight: '100vh', color: '#173A2B' }}>
      <Header />

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '1rem 2rem 5rem' }}>

        {/* ═══════════════════════════════════════════════════════
            HERO MASTER SECTION — BIOPHILIC ARCHITECTURAL COMMAND CENTER
        ═══════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '3.5rem',
          paddingTop: '0.5rem',
        }}>

          {/* Layer 1: Ambient High-Key Architectural Backdrop Wash */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/green_architecture.jpg)',
            backgroundPosition: 'center right',
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            opacity: 0.32,
            transform: 'scale(1.08)',
            pointerEvents: 'none',
          }} />

          {/* Layer 2: Warm Natural Cream Gradient Wash for Crisp Typography Legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(250, 247, 240, 0.98) 0%, rgba(250, 247, 240, 0.93) 40%, rgba(250, 247, 240, 0.65) 65%, rgba(250, 247, 240, 0.25) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Layer 3: Foreground Interactive Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Top Telemetry / Compliance Status Ticker */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.5rem 1.5rem',
              fontSize: '0.66rem',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              {/* Left: Engine Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#6E8A74',
                  boxShadow: '0 0 8px rgba(110, 138, 116, 0.7)',
                }} />
                <span style={{ fontWeight: 700, color: '#4B5A50', letterSpacing: '0.08em' }}>
                  DISSERTATION RESEARCH ENGINE · R26-IT-091
                </span>
              </div>

              {/* Right: Regulatory Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#D2E4D6',
                  color: '#153E28',
                  padding: '4px 11px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.64rem',
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  ✓ SLS 107 · 614 · 139 COMPLIANT
                </span>
                <span style={{ color: '#C8BEAE' }}>|</span>
                <span style={{ fontWeight: 700, color: '#2B3B30', fontSize: '0.64rem', letterSpacing: '0.06em' }}>
                  GBCSL GREEN RATING READY
                </span>
                <span style={{ color: '#C8BEAE' }}>|</span>
                <span style={{
                  fontWeight: 700,
                  color: '#9E5638',
                  fontSize: '0.64rem',
                  letterSpacing: '0.06em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  SRI LANKA BIOCLIMATIC AI
                </span>
              </div>
            </div>

            {/* 2-Column Hero Body */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 1.2fr',
              alignItems: 'center',
              padding: '0.5rem 0.5rem 2.5rem',
              gap: '2.5rem',
            }}>
              {/* Left: Monumental Typography & Vision Controls */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div>
                  {/* Brand Kicker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#12261B',
                      color: '#FCFAF6',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '4px 9px',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      CIVIL & ARCHITECTURAL AI
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      color: '#687E70',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      MCDM DECISION MATRIX + 3D BIM
                    </span>
                  </div>

                  {/* Monumental Architectural Title */}
                  <h1 style={{
                    fontFamily: 'Outfit, Space Grotesk, sans-serif',
                    fontSize: 'clamp(3rem, 4.6vw, 4.8rem)',
                    fontWeight: 900,
                    lineHeight: 0.96,
                    letterSpacing: '-0.035em',
                    color: '#133523',
                    margin: '0 0 1.6rem',
                    textTransform: 'uppercase',
                  }}>
                    SRI LANKAN<br />
                    <span style={{ color: '#5E836E' }}>CONSTRUCTION</span><br />
                    INTELLIGENCE
                  </h1>

                  {/* Platform Overview Paragraph */}
                  <p style={{
                    fontSize: '1.05rem',
                    color: '#364A3E',
                    lineHeight: '1.7',
                    margin: 0,
                    maxWidth: '540px',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    An architectural decision-support platform synthesizing CAD boundary geometry, multi-criteria material specification, structural deflection checks, and GBCSL green pre-assessments for Sri Lankan building projects.
                  </p>
                </div>
              </div>

              {/* Right: Featured Biophilic Portal Frame */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ArchitecturalHeroPortal />
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            THE 4 CORE COMPONENTS (BENTO WORKSTATION)
        ═══════════════════════════════════════════════════════ */}
        <section id="core-components" style={{ marginBottom: '4.5rem' }}>
          {/* Section header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1.75rem',
            borderBottom: '1px solid #D8D1C5',
            paddingBottom: '0.85rem',
          }}>
            <div>
              <span style={{
                background: '#173A2B',
                color: '#FCFAF6',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '2px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.4rem',
                letterSpacing: '0.08em',
              }}>
                RESEARCH SYSTEM ARCHITECTURE
              </span>
              <h2 style={{
                fontFamily: 'Outfit, Space Grotesk, sans-serif',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#173A2B',
                margin: 0,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}>
                The 4 Core Research Pillars
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#697068', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
              INTEGRATED ENGINEERING PIPELINE
            </span>
          </div>

          {/* Bento Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.5rem',
          }}>
            {/* PILLAR 01: Plan Analyzer (5 Columns) */}
            <div style={{
              gridColumn: 'span 5',
              background: '#FFFFFF',
              border: '1px solid #D8D1C5',
              borderTop: '4px solid #173A2B',
              borderRadius: '4px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(23, 58, 43, 0.03)',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontFamily: 'Space Grotesk', fontWeight: 900, color: '#173A2B' }}>01</span>
                  <span style={{ fontSize: '0.60rem', fontFamily: 'Space Grotesk', fontWeight: 800, background: 'rgba(23, 58, 43, 0.08)', color: '#173A2B', padding: '2px 8px', borderRadius: '2px' }}>
                    VISION AI
                  </span>
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#697068', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  SPATIAL & CAD EXTRACTION
                </div>
                <h3 style={{ fontFamily: 'Outfit, Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: '#173A2B', margin: '0 0 0.75rem' }}>
                  Plan & Blueprint Analyzer
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#697068', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                  Computer vision boundary parsing, automated floor plan telemetry, wall/floor area computations, opening ratios, and spatial coordinate vector generation.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                  {coreComponents[0].features.map((f, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', fontFamily: 'Space Grotesk', background: '#FBF9F4', border: '1px solid #D8D1C5', padding: '3px 8px', borderRadius: '3px' }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/plan-analyzer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#173A2B',
                  color: '#FCFAF6',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '4px',
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Open Plan Analyzer →
              </Link>
            </div>

            {/* PILLAR 02: Material Specification & 3D Intelligence (7 Columns - FEATURED HERO) */}
            <div style={{
              gridColumn: 'span 7',
              background: '#FBF9F4',
              border: '2px solid #8D6A4F',
              borderTop: '5px solid #8D6A4F',
              borderRadius: '4px',
              padding: '2rem 2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 30px rgba(141, 106, 79, 0.08)',
              position: 'relative',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontFamily: 'Space Grotesk', fontWeight: 900, color: '#8D6A4F' }}>02</span>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'Space Grotesk', fontWeight: 800, background: '#8D6A4F', color: '#FCFAF6', padding: '3px 10px', borderRadius: '2px', letterSpacing: '0.06em' }}>
                    CENTRAL RESEARCH CORE
                  </span>
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#8D6A4F', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  MATERIAL INTELLIGENCE & 3D BIM
                </div>
                <h3 style={{ fontFamily: 'Outfit, Space Grotesk', fontSize: '1.65rem', fontWeight: 900, color: '#173A2B', margin: '0 0 0.75rem' }}>
                  Material Specification & 3D Studio
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#697068', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
                  The research engine synthesizing MCDM TOPSIS, SLS structural rules, and Random Forest models. Unites the intake brief, 3D cutaway model, specification monograph, and project history.
                </p>

                {/* Sublink Workspaces */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #D8D1C5',
                  borderRadius: '4px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ fontSize: '0.60rem', fontWeight: 800, color: '#8D6A4F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>
                    Direct Research Workspaces:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {coreComponents[1].sublinks.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        href={sub.href}
                        style={{
                          fontSize: '0.70rem',
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontWeight: 700,
                          color: '#173A2B',
                          background: '#FBF9F4',
                          border: '1px solid #D8D1C5',
                          padding: '4px 10px',
                          borderRadius: '3px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>→</span> {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #D8D1C5' }}>
                <Link
                  href="/materials/form"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#8D6A4F',
                    color: '#FCFAF6',
                    padding: '0.85rem 1.75rem',
                    borderRadius: '4px',
                    fontFamily: 'Space Grotesk',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Start Project Brief & Spec →
                </Link>
                <span style={{ fontSize: '0.65rem', color: '#697068', fontFamily: 'Space Grotesk' }}>
                  SLS 107/614 Audited
                </span>
              </div>
            </div>

            {/* PILLAR 03: Fire Safety (6 Columns) */}
            <div style={{
              gridColumn: 'span 6',
              background: '#FFFFFF',
              border: '1px solid #D8D1C5',
              borderTop: '4px solid #B85C43',
              borderRadius: '4px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(23, 58, 43, 0.03)',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontFamily: 'Space Grotesk', fontWeight: 900, color: '#B85C43' }}>03</span>
                  <span style={{ fontSize: '0.60rem', fontFamily: 'Space Grotesk', fontWeight: 800, background: 'rgba(184, 92, 67, 0.08)', color: '#B85C43', padding: '2px 8px', borderRadius: '2px' }}>
                    SLS 139 · BS 476
                  </span>
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#697068', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  STATUTORY & LIFE SAFETY
                </div>
                <h3 style={{ fontFamily: 'Outfit, Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: '#173A2B', margin: '0 0 0.75rem' }}>
                  Fire Safety Compliance
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#697068', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                  Preliminary engineering verification of structural fire resistance ratings under SLS 139 and British Standard BS 476, non-combustibility of envelope partitions, and egress travel distances.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                  {coreComponents[2].features.map((f, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', fontFamily: 'Space Grotesk', background: '#FBF9F4', border: '1px solid #D8D1C5', padding: '3px 8px', borderRadius: '3px' }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/fire-safety"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#B85C43',
                  color: '#FCFAF6',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '4px',
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Open Fire Safety Module →
              </Link>
            </div>

            {/* PILLAR 04: Green Building Pre-Assessment (6 Columns) */}
            <div style={{
              gridColumn: 'span 6',
              background: '#FFFFFF',
              border: '1px solid #D8D1C5',
              borderTop: '4px solid #718C77',
              borderRadius: '4px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(23, 58, 43, 0.03)',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontFamily: 'Space Grotesk', fontWeight: 900, color: '#718C77' }}>04</span>
                  <span style={{ fontSize: '0.60rem', fontFamily: 'Space Grotesk', fontWeight: 800, background: 'rgba(113, 140, 119, 0.12)', color: '#718C77', padding: '2px 8px', borderRadius: '2px' }}>
                    GREENSL · GBCSL
                  </span>
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#697068', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  SUSTAINABILITY & GREENSL
                </div>
                <h3 style={{ fontFamily: 'Outfit, Space Grotesk', fontSize: '1.4rem', fontWeight: 800, color: '#173A2B', margin: '0 0 0.75rem' }}>
                  Green Building Pre-Assessment
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#697068', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                  Environmental performance scorecard aligned with Green Building Council of Sri Lanka (GBCSL) criteria, calculating embodied carbon intensity (kg CO₂e/m²) and local sourcing indices.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                  {coreComponents[3].features.map((f, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', fontFamily: 'Space Grotesk', background: '#FBF9F4', border: '1px solid #D8D1C5', padding: '3px 8px', borderRadius: '3px' }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/green-assessment"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#718C77',
                  color: '#FCFAF6',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '4px',
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Open Green Assessment →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SAMPLE CASE STUDIES & LIVE BENCHMARKS
        ═══════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '4.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #D8D1C5',
            paddingBottom: '0.75rem',
          }}>
            <div>
              <span style={{
                background: '#8D6A4F',
                color: '#FCFAF6',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.60rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '2px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.4rem',
                letterSpacing: '0.08em',
              }}>
                DISSERTATION CASE STUDIES
              </span>
              <h2 style={{
                fontFamily: 'Outfit, Space Grotesk, sans-serif',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#173A2B',
                margin: 0,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}>
                Sri Lankan Architectural Benchmarks
              </h2>
            </div>
            <Link href="/history" style={{ fontSize: '0.72rem', color: '#173A2B', fontWeight: 700, fontFamily: 'Space Grotesk', textDecoration: 'none' }}>
              View All Historical Archives →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.25rem' }}>
            {sampleProjects.map((p, idx) => (
              <div key={idx} style={{
                background: '#FFFFFF',
                border: '1px solid #D8D1C5',
                borderRadius: '4px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(23, 58, 43, 0.03)',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.60rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#8D6A4F', background: 'rgba(141, 106, 79, 0.08)', padding: '2px 6px', borderRadius: '2px' }}>
                      {p.tag}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'Space Grotesk', fontWeight: 900, color: '#173A2B' }}>
                      {p.score}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, Space Grotesk', fontSize: '1.15rem', fontWeight: 800, color: '#173A2B', margin: '0 0 0.25rem' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#697068', marginBottom: '0.75rem' }}>
                    {p.location} • {p.area}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#252823', background: '#FBF9F4', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #EFECE4', lineHeight: 1.5 }}>
                    <strong>Specified Package:</strong> {p.spec}
                  </div>
                </div>
                <Link
                  href={p.href}
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #EFECE4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk',
                    color: '#173A2B',
                    textDecoration: 'none',
                  }}
                >
                  <span>Load into Specification Engine</span>
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            MATERIAL MATRIX & SPECIFICATION TELEMETRY
        ═══════════════════════════════════════════════════════ */}
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #D8D1C5',
          borderTop: '4px solid #173A2B',
          borderRadius: '4px',
          padding: '2.5rem 3rem',
          boxShadow: '0 4px 20px rgba(23, 58, 43, 0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#173A2B', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
                MATERIAL INTELLIGENCE DATASET
              </span>
              <h2 style={{ fontFamily: 'Outfit, Space Grotesk', fontSize: '1.85rem', fontWeight: 900, color: '#173A2B', margin: '0.25rem 0 0.5rem', textTransform: 'uppercase' }}>
                Sri Lankan Sustainable Material Matrix
              </h2>
              <p style={{ color: '#697068', fontSize: '0.88rem', margin: 0, maxWidth: '600px' }}>
                Calibrated against Sri Lankan Standards (SLS), regional quarry extraction points, and embodied carbon life-cycle databases.
              </p>
            </div>

            {/* Material selector tabs */}
            <div style={{ display: 'flex', gap: '6px', background: '#F5F1E8', padding: '4px', borderRadius: '4px', border: '1px solid #D8D1C5' }}>
              {materialSwatches.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMaterialTab(m.id)}
                  style={{
                    background: activeMaterialTab === m.id ? '#173A2B' : 'transparent',
                    color: activeMaterialTab === m.id ? '#FCFAF6' : '#697068',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '3px',
                    fontFamily: 'Space Grotesk',
                    fontSize: '0.72rem',
                    fontWeight: activeMaterialTab === m.id ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Material Telemetry Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1.25rem', background: '#FBF9F4', padding: '1.5rem', borderRadius: '4px', border: '1px solid #D8D1C5' }}>
            <div>
              <div style={{ fontSize: '0.60rem', color: '#697068', textTransform: 'uppercase', fontFamily: 'Space Grotesk', fontWeight: 700 }}>MATERIAL APPLICATION</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#173A2B', fontFamily: 'Space Grotesk', marginTop: '4px' }}>{currentSwatch.category}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.60rem', color: '#697068', textTransform: 'uppercase', fontFamily: 'Space Grotesk', fontWeight: 700 }}>BULK DENSITY</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#173A2B', fontFamily: 'Space Grotesk', marginTop: '4px' }}>{currentSwatch.density}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.60rem', color: '#697068', textTransform: 'uppercase', fontFamily: 'Space Grotesk', fontWeight: 700 }}>THERMAL TRANSMITTANCE</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#173A2B', fontFamily: 'Space Grotesk', marginTop: '4px' }}>{currentSwatch.uValue}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.60rem', color: '#697068', textTransform: 'uppercase', fontFamily: 'Space Grotesk', fontWeight: 700 }}>EMBODIED CARBON</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#718C77', fontFamily: 'Space Grotesk', marginTop: '4px' }}>{currentSwatch.carbon}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.60rem', color: '#697068', textTransform: 'uppercase', fontFamily: 'Space Grotesk', fontWeight: 700 }}>SLS STANDARD AUDIT</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#8D6A4F', fontFamily: 'Space Grotesk', marginTop: '4px' }}>{currentSwatch.sls}</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
