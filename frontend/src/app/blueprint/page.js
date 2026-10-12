"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArchVizScene from '../../components/ArchVizScene';
import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';

// 🧬 Spatial Status Banner for Blueprint Intelligence
const BlueprintStatus = ({ status = "ACTIVE" }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginBottom: '1.75rem',
    padding: '1.25rem 1.5rem',
    background: '#FAF7F0',
    border: '1px solid #E2DCD0',
    borderTop: '3px solid #143825',
    borderRadius: '4px',
  }}>
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '4px',
      background: '#143825',
      color: '#FCFAF6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
    }}>
      📐
    </div>
    <div>
      <div style={{
        fontSize: '0.62rem',
        fontWeight: 800,
        color: '#143825',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        Spatial Vision Engine · {status}
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#143825', fontFamily: 'Space Grotesk, sans-serif' }}>
        CAD Architectural Plan Vision Workstation
      </div>
      <div style={{ fontSize: '0.72rem', color: '#697068', marginTop: '2px' }}>
        Automated Boundary Vectorization & Structural Load Path Mapping
      </div>
    </div>
  </div>
);

// 🏷️ Spatial Legend Component
const SpatialLegend = () => (
  <div style={{
    padding: '1.5rem',
    background: '#FAF7F0',
    border: '1px solid #E2DCD0',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(20, 56, 37, 0.04)',
  }}>
    <div style={{
      fontSize: '0.65rem',
      fontWeight: 800,
      color: '#143825',
      letterSpacing: '0.10em',
      marginBottom: '1rem',
      textTransform: 'uppercase',
      fontFamily: 'Space Grotesk, sans-serif',
      borderBottom: '1px solid #E2DCD0',
      paddingBottom: '0.5rem',
    }}>
      Spatial Metrics Key
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
      {[
        { label: 'STRUCTURAL CORE', col: '#B85C43', desc: 'Mandatory load-bearing path' },
        { label: 'SPATIAL ALLOCATION', col: '#143825', desc: 'Optimized functional zoning' },
        { label: 'THERMAL ENVELOPE', col: '#8D6A4F', desc: 'Passive solar gain boundary' }
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.col, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#143825', fontFamily: 'Space Grotesk, sans-serif' }}>{item.label}</div>
            <div style={{ fontSize: '0.65rem', color: '#697068' }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function BlueprintIntelligence() {
  const [image, setImage] = useState(null);
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const API_URL = (process.env.NEXT_PUBLIC_BLUEPRINT_API_URL || process.env.NEXT_PUBLIC_API_BASE) ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');

  const handleProcess = async (e) => {
    if (e) e.preventDefault();
    if (!image) return;

    setLoading(true);
    setLoadingStep("Extracting Spatial Vector DNA...");

    const formData = new FormData();
    try {
        const blob = await fetch(image).then(r => r.blob());
        formData.append('image', blob, 'blueprint.jpg');
        formData.append('userQuery', query || "Perform a full architectural audit.");

        const res = await fetch(`${API_URL}/api/analyze-blueprint`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        setAnalysis(data);
    } catch (err) {
        console.error("Blueprint Analysis Error:", err);
    } finally {
        setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImage(URL.createObjectURL(file));
        setAnalysis(null);
    }
  };

  return (
    <div className="arch-page-canvas" style={{ minHeight: '100vh', background: '#FAF7F0' }}>
      <Header />

      <main style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
        <ModuleHeroBanner
          track="01 / SPATIAL VISION & LOAD PATH"
          kicker="CAD PLAN BOUNDARY VECTORIZATION"
          title="CAD ARCHITECTURAL PLAN VISION WORKSTATION"
          subtitle="Automated boundary vectorization, structural load path mapping, and interactive 3D WebGL BIM reconstruction directly from uploaded architectural drawings."
          imageSrc="/blueprint_desk.png"
          imageAlt="Architectural CAD Blueprint Workspace"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 440px) 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN */}
          <div>
            <BlueprintStatus status={loading ? "SYNCING" : "ACTIVE"} />
            
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2DCD0',
              borderRadius: '4px',
              padding: '1.75rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(20, 56, 37, 0.04)',
            }}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#143825',
                letterSpacing: '0.10em',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                fontFamily: 'Space Grotesk, sans-serif',
                borderBottom: '1px solid #E2DCD0',
                paddingBottom: '0.5rem',
              }}>
                Blueprint Input & Telemetry
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="tech-label">ARCHITECTURAL BLUEPRINT FILE</label>
                <div style={{
                  position: 'relative',
                  height: '180px',
                  border: '2px dashed #E2DCD0',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FAF7F0',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={onFileChange}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                  />
                  {image ? (
                    <img src={image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Uploaded Architectural Blueprint Preview" />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📁</div>
                      <div style={{ fontSize: '0.72rem', color: '#143825', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                        CLICK OR DRAG CAD PLAN
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#697068', marginTop: '4px' }}>
                        Supports JPG, PNG, Architectural Scans
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label className="tech-label">AUDIT INTENT & MODIFICATIONS</label>
                <textarea 
                  className="tech-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Check for vertical expansion feasibility and opening ratio compliance..."
                  style={{ minHeight: '110px', resize: 'vertical' }}
                />
              </div>

              <button 
                className="btn-premium"
                onClick={handleProcess}
                disabled={loading || !image}
                style={{ width: '100%' }}
              >
                {loading ? `${loadingStep || 'Processing CAD Plan…'}` : 'Run Blueprint Vision Audit →'}
              </button>
            </div>

            <SpatialLegend />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{
            minHeight: '620px',
            background: '#FFFFFF',
            border: '1px solid #E2DCD0',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(20, 56, 37, 0.04)',
            position: 'relative',
          }}>
            <div style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid #E2DCD0',
              background: '#FAF7F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#143825',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Interactive 3D Architectural Scene View
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                color: '#8D6A4F',
                background: 'rgba(141, 106, 79, 0.08)',
                padding: '2px 8px',
                borderRadius: '3px',
              }}>
                WEBGL BIM RENDERER
              </span>
            </div>
            <div style={{ height: '560px', position: 'relative' }}>
              <ArchVizScene />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
