"use client";

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArchVizScene from '../../components/ArchVizScene';

// 🧬 Neural Core Status for Blueprint v18.0
const BlueprintNeuralStatus = ({ status = "ACTIVE" }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
    <div className="neural-core-v2" style={{ width: '70px', height: '70px' }}>
      <div className="core-ring core-ring-1"></div>
      <div className="core-ring core-ring-2"></div>
      <div style={{ fontSize: '1.2rem', zIndex: 10 }}>📐</div>
    </div>
    <div>
      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '3px', textTransform: 'uppercase' }}>
        Spatial Engine {status}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk' }}>
        v18.2 Vision Workstation
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
        Architectural Audit // Real-time Mapping
      </div>
    </div>
  </div>
);

// 🏷️ Spatial Legend Component v18.0
const SpatialLegend = () => (
  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }}>
    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '1rem' }}>SPATIAL_METRICS_KEY</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
      {[
        { label: 'STRUCTURAL CORE', col: '#ef4444', desc: 'Mandatory load path' },
        { label: 'RE-ALLOCATION ZONE', col: 'var(--blueprint-blue)', desc: 'Optimized spatial use' },
        { label: 'THERMAL ENVELOPE', col: 'var(--warn-amber)', desc: 'Solar gain boundary' }
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.col, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#fff' }}>{item.label}</div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
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

  const API_URL = process.env.NEXT_PUBLIC_BLUEPRINT_API_URL || 'http://localhost:5000';

  const handleProcess = async (e) => {
    if (e) e.preventDefault();
    if (!image) return;

    setLoading(true);
    setLoadingStep("Extracting Spatial DNA...");

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
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff', position: 'relative' }}>
      <div className="premium-bg"><div className="gradient-mesh"></div><div className="blueprint-grid"></div></div>
      
      <Header />

      <main style={{ padding: '3rem 2rem', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '3rem' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ maxWidth: '450px' }}>
            <BlueprintNeuralStatus status={loading ? "SYNCING" : "ACTIVE"} />
            
            <div className="glass-panel glow-border" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '2px', marginBottom: '1.5rem' }}>VISION_INPUT</div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="tech-label">ARCHITECTURAL BLUEPRINT</label>
                <div style={{ position: 'relative', height: '180px', border: '2px dashed var(--glass-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                  <input type="file" onChange={onFileChange} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                  {image ? (
                    <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} alt="Preview" />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SELECT PHYSICAL PLAN</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="tech-label">MODIFICATION INTENT</label>
                <textarea 
                  className="tech-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Check for vertical expansion feasibility..."
                  style={{ minHeight: '120px', resize: 'none' }}
                />
              </div>

              <button 
                className="btn-premium"
                onClick={handleProcess}
                disabled={loading || !image}
                style={{ width: '100%' }}
              >
                {loading ? 'PROCESSING ARCHITECTURE...' : 'RUN VISION AUDIT'}
              </button>
            </div>

            <SpatialLegend />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ minHeight: '600px' }}>
            <ArchVizScene />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
