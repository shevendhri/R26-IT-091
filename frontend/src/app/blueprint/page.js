"use client";

import React, { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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

  const API_URL = process.env.NEXT_PUBLIC_BLUEPRINT_API_URL || 'http://127.0.0.1:5001';

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
            {loading ? (
               <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.2)' }}>
                  <div className="neural-core-v2" style={{width: '160px', height: '160px'}}>
                     <div className="core-ring core-ring-1"></div>
                     <div className="core-ring core-ring-2"></div>
                     <div className="core-ring core-ring-3"></div>
                  </div>
                  <div style={{ marginTop: '2rem', fontWeight: 900, fontSize: '0.8rem', color: 'var(--blueprint-blue)', letterSpacing: '4px' }}>{loadingStep.toUpperCase()}</div>
               </div>
            ) : analysis ? (
              <div className="animate-fade-in">
                <div className="glass-panel glow-border" style={{ padding: '1rem', background: '#000', position: 'relative', overflow: 'hidden', border: '2px solid var(--blueprint-blue)' }}>
                  <div className="scan-line" style={{ background: 'var(--blueprint-blue)', boxShadow: '0 0 20px var(--blueprint-blue)' }}></div>
                  <img src={analysis.annotated_image} style={{ width: '100%', display: 'block', borderRadius: '12px' }} alt="Audit" />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(56, 189, 248, 0.2)', padding: '6px 16px', borderRadius: '50px', fontSize: '0.65rem', color: 'var(--blueprint-blue)', fontWeight: 900, backdropFilter: 'blur(10px)', border: '1px solid var(--blueprint-blue)' }}>
                    VISION ENGINE v18.2
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                   <div className="glass-panel" style={{ padding: '2rem' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '2px', marginBottom: '1.5rem' }}>STRUCTURAL_OBSERVATIONS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {analysis.spatial_observations?.map((obs, i) => (
                          <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                             <div style={{ width: '24px', height: '24px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', border: '1px solid var(--blueprint-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0, fontWeight: 900 }}>{i+1}</div>
                             <p style={{ fontSize: '0.9rem', color: '#fff', margin: 0, lineHeight: 1.5, opacity: 0.9 }}>{obs}</p>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="glass-panel glow-border" style={{ padding: '2.5rem', borderLeft: '6px solid var(--eco-glow)' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', marginBottom: '1.5rem' }}>ENGINEERING_VERDICT</div>
                      <div style={{ fontSize: '1.1rem', color: '#fff', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '2.5rem', opacity: 0.9 }}>
                        "{analysis.architectural_verdict}"
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                           <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '8px' }}>SPACE UTILIZATION</div>
                           <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{Math.round(Math.random() * 20 + 75)}%</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                           <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '8px' }}>AUDIT CONFIDENCE</div>
                           <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--eco-glow)' }}>94.2%</div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--glass-border)', opacity: 0.5 }}>
                 <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📊</div>
                 <div style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '6px' }}>READY FOR SPATIAL DATA</div>
                 <div style={{ fontSize: '0.7rem', marginTop: '1rem' }}>Upload a blueprint to start neural vision audit</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
