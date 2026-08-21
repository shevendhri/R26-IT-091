"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, padding: '2rem'
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: '700px', maxHeight: '85vh',
        background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px',
        padding: '2rem', position: 'relative', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none', color: '#94a3b8',
          fontSize: '1.2rem', cursor: 'pointer'
        }}>✕</button>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', color: '#f8fafc', marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', fontWeight: 600 }}>
          {title}
        </h2>
        <div style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: '0.78rem' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default function PlanAnalyzer() {
  const router = useRouter();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState("Colombo");
  const [buildingType, setBuildingType] = useState("Residential");
  const [structuralSystem, setStructuralSystem] = useState("Concrete Frame");
  const [floorCount, setFloorCount] = useState(2);
  const [userQuery, setUserQuery] = useState("Perform full structural and regulatory audit.");
  
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const cities = [
    "Colombo", "Galle", "Kandy", "Negombo", "Ratnapura", "Anuradhapura", "Nuwara Eliya", 
    "Jaffna", "Trincomalee", "Batticaloa", "Matara", "Hambantota", "Kurunegala", "Badulla", "Gampaha", "Kalutara"
  ].sort();

  const modalContents = {
    act: {
      title: "Urban Development Act No. 41 of 1978 — Submission Requirements",
      content: `Instructions for submitting building plans as per Urban Development Act No. 41 of 1978:

1. The proposed construction plan should be submitted in 3 copies.
2. All plans must be prepared by a qualified architect/planner bearing name and signature.
3. The land owner must counter-sign the submitted plans.
4. A plot plan prepared by an authorized surveyor on a scale not less than 1:1000 must accompany the application.
5. All plans must clearly show new and existing building works in colour or composition.`
    },
    special: {
      title: "Special Attention Requirements — Building Plan Preparation",
      content: `Special attention must be paid to the following requirements when preparing building plans:

1. Scale — Plans must be drawn to scale (1:100 standard; foundation details 1:20).
2. North direction must be indicated correctly.
3. Building plan must include: front view, side view, cross-section, foundation plan, and site plan.
4. Method of accessing the land (road name and width) must be shown.
5. Building footprint and boundary setbacks must be clearly dimensioned.
6. Toilet and well/tube well positions must be indicated with minimum 60ft separation.
7. Natural lighting and ventilation through windows must be provided for all rooms.
8. Roof overhang heights must be specified.
9. Wall, roof, and foundation slab thicknesses must be marked.
10. Distance from overhead electric lines must be shown.`
    },
    gazette: {
      title: "Gazette Extraordinary No. 2235/54 — July 2021 Regulatory Notices",
      content: `Key regulatory warnings per Extraordinary Gazette No. 2235/54 (08 July 2021):

1. Do not construct permanent or temporary buildings without a valid permit. Unauthorized construction will incur penalties and may require demolition.

2. Occupying any building without a Certificate of Conformity is prohibited. Violations attract a fine of Rs. 100/- per day.

3. Building approval validity is limited to one year. Extensions must be obtained before expiry.

4. Any deviation from the approved plan requires a revised plan submission and fresh approval before construction proceeds.`
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyzePlan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setLoadingStep("Reading Blueprint Layout Layers");
    setError(null);
    setTimeout(() => setLoadingStep("Detecting Structural Core Boundaries"), 1000);
    setTimeout(() => setLoadingStep("Resolving Dimensions and Occupancy Ratios"), 2200);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("userQuery", userQuery);
    formData.append("location", location);
    formData.append("building_type", buildingType);
    formData.append("structural_system", structuralSystem);
    formData.append("floor_count", floorCount);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/analyze-blueprint`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.status === "success") {
        setAnalysisResult(data);
      } else {
        setError(data.message || "Blueprint Vision Analyzer failed.");
      }
    } catch (err) {
      console.error(err);
      setError(`Analysis Service Offline. Ensure backend is running at ${API_BASE}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!analysisResult || !analysisResult.structured_info) return;
    localStorage.setItem("imported_building_info", JSON.stringify(analysisResult.structured_info));
    router.push("/materials");
  };

  const inputStyle = {
    background: '#090d16',
    border: '1px solid #1e293b',
    borderRadius: '4px',
    padding: '0.6rem 0.85rem',
    color: '#f8fafc',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem',
    width: '100%',
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '0.9rem',
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', position: 'relative' }}>
      <div className="premium-bg">
        <div className="gradient-mesh" />
        <div className="blueprint-grid" />
      </div>
      
      <Header />

      {/* Loading Overlay */}
      {loading && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 5000, 
          background: 'rgba(9, 13, 22, 0.97)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' 
        }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #1e293b', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Blueprint Vision Analysis
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>{loadingStep}...</div>
          </div>
        </div>
      )}

      <main style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Page Header */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="telemetry-badge telemetry-badge-info">Computer Vision Blueprint Analysis</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', color: '#f8fafc', fontFamily: 'Space Grotesk', fontWeight: 700, margin: 0 }}>
              Blueprint Plan Analyzer
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.2rem 0 0 0' }}>
              AI-driven structural parameter extraction, compliance verification, and geometry analysis from floor plan images.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.keys(modalContents).map(key => (
              <button key={key} onClick={() => setActiveModal(key)} style={{
                background: '#090d16',
                border: '1px solid #1e293b',
                color: '#94a3b8',
                padding: '0.4rem 0.85rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 600
              }}>
                {modalContents[key].title.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderLeft: '4px solid #ef4444', borderRadius: '6px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          
          {/* Left: Configuration Panel */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.6rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk' }}>Upload Plan & Configure Parameters</h3>
            </div>

            <div>
              <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', display: 'block' }}>Geoclimatic Location</label>
              <select style={selectStyle} value={location} onChange={e => setLocation(e.target.value)}>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', display: 'block' }}>Building Typology</label>
              <select style={selectStyle} value={buildingType} onChange={e => setBuildingType(e.target.value)}>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', display: 'block' }}>Floor Count</label>
                <input style={inputStyle} type="number" min="1" max="15" value={floorCount}
                  onChange={e => setFloorCount(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', display: 'block' }}>Structural System</label>
                <select style={selectStyle} value={structuralSystem} onChange={e => setStructuralSystem(e.target.value)}>
                  <option>Concrete Frame</option>
                  <option>Steel Frame</option>
                  <option>Load-bearing Masonry</option>
                  <option>Timber Frame</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', display: 'block' }}>Audit Query / Analysis Intent</label>
              <input style={inputStyle} type="text" value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                placeholder="e.g. Check vertical clearance, structural spacing..." />
            </div>

            <div>
              <label style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', display: 'block' }}>Blueprint File (Image)</label>
              <div style={{
                position: 'relative', height: '120px', border: '2px dashed #334155',
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#090d16', overflow: 'hidden', cursor: 'pointer'
              }}>
                <input type="file" onChange={handleFileChange} accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                {imagePreview ? (
                  <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} alt="Preview" />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginBottom: '6px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Choose Blueprint Image</div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn-premium"
              style={{ width: '100%', cursor: selectedFile ? 'pointer' : 'not-allowed', opacity: selectedFile ? 1 : 0.5 }}
              onClick={handleAnalyzePlan}
              disabled={!selectedFile || loading}
            >
              Run Blueprint Vision Analysis
            </button>
          </div>

          {/* Right: Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysisResult ? (
              <>
                {/* Annotated Vision Output */}
                <div style={{
                  background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px',
                  padding: '0.75rem', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Annotated Vision Output
                  </div>
                  <img src={analysisResult.annotated_image} style={{ width: '100%', display: 'block', borderRadius: '4px' }} alt="Blueprint Vision Overlay" />
                </div>

                {/* Extracted Parameters Table */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Extracted Building Parameters
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                          <th style={{ padding: '7px 8px', fontWeight: 700, color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase' }}>Parameter</th>
                          <th style={{ padding: '7px 8px', fontWeight: 700, color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase' }}>Extracted Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Building Typology", analysisResult.structured_info.building_type],
                          ["Floor Count", `${analysisResult.structured_info.floor_count} storeys`],
                          ["Total Floor Area", `${analysisResult.structured_info.total_floor_area} m²`],
                          ["Wall Area", `${analysisResult.structured_info.wall_area} m²`],
                          ["Roof Area", `${analysisResult.structured_info.roof_area} m²`],
                          ["Window Openings Area", `${analysisResult.structured_info.window_area} m²`],
                          ["Door Units Count", `${analysisResult.structured_info.door_count} nos`],
                          ["Structural Frame System", analysisResult.structured_info.structural_system],
                          ["Geoclimatic Location", analysisResult.structured_info.location]
                        ].map(([param, value]) => (
                          <tr key={param} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '7px 8px', color: '#94a3b8' }}>{param}</td>
                            <td style={{ padding: '7px 8px', color: '#f8fafc', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Spatial Compliance Notes */}
                <div style={{ background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderLeft: '4px solid #f59e0b', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Spatial Compliance Assessment
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {analysisResult.spatial.map((warning, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#cbd5e1' }}>
                        <span style={{ color: '#f59e0b', flexShrink: 0 }}>▸</span>
                        <span>{warning}</span>
                      </div>
                    ))}
                    {analysisResult.spatial.length === 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        No compliance exceptions detected. Plan conforms to regulatory clearance requirements.
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Action */}
                <button className="btn-premium" onClick={handleExportData} style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Export to Material Recommendation Engine
                </button>
              </>
            ) : (
              <div style={{
                background: '#0f172a', border: '1px dashed #334155', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '400px', gap: '0.75rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#64748b' }}>Ready for Blueprint Interpretation</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', maxWidth: '280px' }}>Select a plan file and run the analysis to extract structural parameters.</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {activeModal && (
        <Modal isOpen={true} onClose={() => setActiveModal(null)}
          title={modalContents[activeModal].title}
          content={modalContents[activeModal].content}
        />
      )}
    </div>
  );
}
