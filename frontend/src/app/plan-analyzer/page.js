"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/* ─── Light-theme Modal ─────────────────────────────────── */
const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(18, 28, 22, 0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, padding: '2rem'
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: '680px', maxHeight: '85vh',
        background: '#FFFFFF',
        border: '1px solid #C4CFC6',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(24, 37, 31, 0.18)',
        padding: '2rem',
        position: 'relative', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.1rem', right: '1.1rem',
          background: '#F5F7F3', border: '1px solid #C4CFC6',
          borderRadius: '8px', color: '#4A5E52',
          width: '30px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', cursor: 'pointer', lineHeight: 1
        }}>✕</button>
        <h2 style={{
          fontFamily: 'Space Grotesk', fontSize: '1.1rem', color: '#18251F',
          marginBottom: '1.25rem',
          borderBottom: '2px solid #2B5C8A',
          paddingBottom: '0.75rem', fontWeight: 700
        }}>
          {title}
        </h2>
        <div style={{ color: '#4A5E52', lineHeight: '1.75', fontSize: '0.84rem', whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: '0.78rem' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Input / Select styles ─────────────────────────────── */
const inputStyle = {
  background: '#FFFFFF',
  border: '1.5px solid #C4CFC6',
  borderRadius: '8px',
  padding: '0.65rem 0.9rem',
  color: '#18251F',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.855rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A5E52'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.8rem center',
  backgroundSize: '0.9rem',
  cursor: 'pointer',
  paddingRight: '2.5rem',
};

const labelStyle = {
  fontSize: '0.68rem',
  fontWeight: 700,
  color: '#2E4035',
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  marginBottom: '0.38rem',
  display: 'block',
  fontFamily: 'Space Grotesk, sans-serif',
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
  const [showFeedbackIframe, setShowFeedbackIframe] = useState(false);

  const PLAN_ANALYZER_FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?usp=header";
  const PLAN_ANALYZER_EMBED_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeQE97l7m0IcbBybFpldZGTF8ovvJpwk4XZP9qvBZiNRGXY0g/viewform?embedded=true";

  const cities = [
    "Colombo", "Galle", "Kandy", "Negombo", "Ratnapura", "Anuradhapura", "Nuwara Eliya",
    "Jaffna", "Trincomalee", "Batticaloa", "Matara", "Hambantota", "Kurunegala", "Badulla", "Gampaha", "Kalutara"
  ].sort();

  const modalContents = {
    act: {
      title: "Urban Development Act No. 41 of 1978 — Submission Requirements",
      content: `Instructions for submitting building plans as per Urban Development Act No. 41 of 1978:\n\n1. The proposed construction plan should be submitted in 3 copies.\n2. All plans must be prepared by a qualified architect/planner bearing name and signature.\n3. The land owner must counter-sign the submitted plans.\n4. A plot plan prepared by an authorized surveyor on a scale not less than 1:1000 must accompany the application.\n5. All plans must clearly show new and existing building works in colour or composition.`
    },
    special: {
      title: "Special Attention Requirements — Building Plan Preparation",
      content: `Special attention must be paid to the following requirements when preparing building plans:\n\n1. Scale — Plans must be drawn to scale (1:100 standard; foundation details 1:20).\n2. North direction must be indicated correctly.\n3. Building plan must include: front view, side view, cross-section, foundation plan, and site plan.\n4. Method of accessing the land (road name and width) must be shown.\n5. Building footprint and boundary setbacks must be clearly dimensioned.\n6. Toilet and well/tube well positions must be indicated with minimum 60ft separation.\n7. Natural lighting and ventilation through windows must be provided for all rooms.\n8. Roof overhang heights must be specified.\n9. Wall, roof, and foundation slab thicknesses must be marked.\n10. Distance from overhead electric lines must be shown.`
    },
    gazette: {
      title: "Gazette Extraordinary No. 2235/54 — July 2021 Regulatory Notices",
      content: `Key regulatory warnings per Extraordinary Gazette No. 2235/54 (08 July 2021):\n\n1. Do not construct permanent or temporary buildings without a valid permit. Unauthorized construction will incur penalties and may require demolition.\n\n2. Occupying any building without a Certificate of Conformity is prohibited. Violations attract a fine of Rs. 100/- per day.\n\n3. Building approval validity is limited to one year. Extensions must be obtained before expiry.\n\n4. Any deviation from the approved plan requires a revised plan submission and fresh approval before construction proceeds.`
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
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#EAF0F5',
      color: '#18251F',
      fontFamily: 'Inter, sans-serif',
      position: 'relative'
    }}>
      {/* Blueprint grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(47, 111, 163, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 111, 163, 0.05) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      <Header />

      {/* ── Loading Overlay ── */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 5000,
          background: 'rgba(240, 242, 238, 0.94)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem'
        }}>
          <div style={{
            width: '50px', height: '50px',
            border: '3px solid #DBE8F4',
            borderTopColor: '#2B5C8A',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2B5C8A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'Space Grotesk' }}>
              Blueprint Vision Analysis
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18251F', fontFamily: 'Space Grotesk' }}>{loadingStep}…</div>
          </div>
        </div>
      )}

      <main style={{ padding: '2.5rem 1.5rem 3rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        {/* ── Page Header ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #C4CFC6',
          borderTop: '3px solid #2B5C8A',
          borderRadius: '16px',
          padding: '1.5rem 1.8rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          boxShadow: '0 4px 16px rgba(24, 37, 31, 0.06)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="telemetry-badge telemetry-badge-info">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Computer Vision Blueprint Analysis
              </span>
              <span style={{ fontSize: '0.68rem', color: '#7A8C80', fontWeight: 700, fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                MODULE 01
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#18251F', fontFamily: 'Space Grotesk', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Building Plan Analyzer
            </h1>
            <p style={{ color: '#4A5E52', fontSize: '0.82rem', margin: '0.25rem 0 0 0', lineHeight: 1.6 }}>
              AI-driven structural parameter extraction, compliance verification, and geometry analysis from floor plan images.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {Object.keys(modalContents).map(key => (
              <button key={key} onClick={() => setActiveModal(key)} style={{
                background: '#EEF4FB',
                border: '1px solid rgba(43, 92, 138, 0.2)',
                color: '#2B5C8A',
                padding: '0.42rem 0.9rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'Space Grotesk',
                letterSpacing: '0.03em',
                transition: 'all 0.18s ease'
              }}>
                {modalContents[key].title.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'rgba(176, 64, 64, 0.06)',
            border: '1px solid rgba(176, 64, 64, 0.25)',
            borderLeft: '4px solid #B04040',
            borderRadius: '10px',
            padding: '0.8rem 1.1rem',
            color: '#B04040',
            fontSize: '0.84rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Main 2-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.4rem', alignItems: 'start' }}>

          {/* Left: Configuration Panel */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #C4CFC6',
            borderLeft: '4px solid #2B5C8A',
            borderRadius: '14px',
            padding: '1.4rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
            boxShadow: '0 4px 16px rgba(24, 37, 31, 0.06)'
          }}>
            <div style={{ borderBottom: '1px solid #E6EBE4', paddingBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: '#DBE8F4',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2B5C8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#18251F', margin: 0, fontFamily: 'Space Grotesk' }}>
                Upload Plan & Configure
              </h3>
            </div>

            <div>
              <label style={labelStyle}>Geoclimatic Location</label>
              <select
                style={selectStyle}
                value={location}
                onChange={e => setLocation(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#2B5C8A'; e.target.style.boxShadow = '0 0 0 3px rgba(43,92,138,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#C4CFC6'; e.target.style.boxShadow = 'none'; }}
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Building Typology</label>
              <select
                style={selectStyle}
                value={buildingType}
                onChange={e => setBuildingType(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#2B5C8A'; e.target.style.boxShadow = '0 0 0 3px rgba(43,92,138,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#C4CFC6'; e.target.style.boxShadow = 'none'; }}
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Floor Count</label>
                <input
                  style={inputStyle}
                  type="number" min="1" max="15"
                  value={floorCount}
                  onChange={e => setFloorCount(parseInt(e.target.value) || 1)}
                  onFocus={e => { e.target.style.borderColor = '#2B5C8A'; e.target.style.boxShadow = '0 0 0 3px rgba(43,92,138,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#C4CFC6'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Structural System</label>
                <select
                  style={selectStyle}
                  value={structuralSystem}
                  onChange={e => setStructuralSystem(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#2B5C8A'; e.target.style.boxShadow = '0 0 0 3px rgba(43,92,138,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#C4CFC6'; e.target.style.boxShadow = 'none'; }}
                >
                  <option>Concrete Frame</option>
                  <option>Steel Frame</option>
                  <option>Load-bearing Masonry</option>
                  <option>Timber Frame</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Audit Query / Analysis Intent</label>
              <input
                style={inputStyle}
                type="text"
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                placeholder="e.g. Check vertical clearance, structural spacing..."
                onFocus={e => { e.target.style.borderColor = '#2B5C8A'; e.target.style.boxShadow = '0 0 0 3px rgba(43,92,138,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#C4CFC6'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* File Upload Zone */}
            <div>
              <label style={labelStyle}>Blueprint File (Image)</label>
              <div style={{
                position: 'relative', height: '128px',
                border: `2px dashed ${imagePreview ? 'rgba(43, 92, 138, 0.4)' : '#C4CFC6'}`,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: imagePreview ? 'transparent' : '#EEF4FB',
                overflow: 'hidden', cursor: 'pointer',
                transition: 'border-color 0.2s ease, background 0.2s ease'
              }}>
                <input type="file" onChange={handleFileChange} accept="image/*"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                {imagePreview ? (
                  <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} alt="Preview" />
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4A7DAD" strokeWidth="1.5" style={{ marginBottom: '6px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <div style={{ fontSize: '0.72rem', color: '#2B5C8A', fontWeight: 700, fontFamily: 'Space Grotesk' }}>Upload Blueprint Image</div>
                    <div style={{ fontSize: '0.65rem', color: '#7A8C80', marginTop: '2px' }}>PNG, JPG, WebP supported</div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn-plan"
              style={{ width: '100%', cursor: selectedFile ? 'pointer' : 'not-allowed', opacity: selectedFile ? 1 : 0.5 }}
              onClick={handleAnalyzePlan}
              disabled={!selectedFile || loading}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Run Blueprint Vision Analysis
            </button>
          </div>

          {/* Right: Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {analysisResult ? (
              <>
                {/* Annotated Vision Output */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #C4CFC6',
                  borderTop: '3px solid #2B5C8A',
                  borderRadius: '14px',
                  padding: '1.2rem',
                  boxShadow: '0 4px 16px rgba(24, 37, 31, 0.06)',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2B5C8A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.7rem', fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Annotated Vision Output
                  </div>
                  <img src={analysisResult.annotated_image} style={{ width: '100%', display: 'block', borderRadius: '8px' }} alt="Blueprint Vision Overlay" />
                </div>

                {/* Extracted Parameters */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #C4CFC6',
                  borderLeft: '4px solid #2B5C8A',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  boxShadow: '0 4px 16px rgba(24, 37, 31, 0.06)'
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2B5C8A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.9rem', fontFamily: 'Space Grotesk' }}>
                    Extracted Building Parameters
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#EEF4FB' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 700, color: '#2B5C8A', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '2px solid #DBE8F4', fontFamily: 'Space Grotesk' }}>Parameter</th>
                          <th style={{ padding: '8px 12px', fontWeight: 700, color: '#2B5C8A', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '2px solid #DBE8F4', fontFamily: 'Space Grotesk' }}>Extracted Value</th>
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
                        ].map(([param, value], i) => (
                          <tr key={param} style={{ borderBottom: '1px solid #E6EBE4', background: i % 2 === 1 ? '#F8FAF7' : '#FFFFFF' }}>
                            <td style={{ padding: '8px 12px', color: '#4A5E52', fontWeight: 500 }}>{param}</td>
                            <td style={{ padding: '8px 12px', color: '#18251F', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Spatial Compliance Notes */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(184, 114, 46, 0.2)',
                  borderLeft: '4px solid #B8722E',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  boxShadow: '0 4px 16px rgba(24, 37, 31, 0.06)'
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#B8722E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.7rem', fontFamily: 'Space Grotesk' }}>
                    Spatial Compliance Assessment
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {analysisResult.spatial.map((warning, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', color: '#4A5E52' }}>
                        <span style={{ color: '#B8722E', flexShrink: 0, marginTop: '1px' }}>▸</span>
                        <span>{warning}</span>
                      </div>
                    ))}
                    {analysisResult.spatial.length === 0 && (
                      <div style={{ fontSize: '0.82rem', color: '#1E5438', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        No compliance exceptions detected. Plan conforms to regulatory clearance requirements.
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Action */}
                <button className="btn-premium" onClick={handleExportData} style={{
                  padding: '0.9rem 1.4rem', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Export to Material Recommendation Engine
                </button>
              </>
            ) : (
              <div style={{
                background: '#FFFFFF',
                border: '2px dashed #C4CFC6',
                borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '420px', gap: '0.9rem',
                boxShadow: 'none'
              }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: '#EEF4FB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2B5C8A" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#18251F', fontFamily: 'Space Grotesk' }}>
                  Ready for Blueprint Interpretation
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4A5E52', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
                  Upload a floor plan image and configure project parameters to extract structural insights.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MODULE 01: DEDICATED USER EVALUATION & FEEDBACK SECTION
        ══════════════════════════════════════════════════════════════ */}
        <div style={{
          marginTop: '3.5rem',
          background: 'linear-gradient(135deg, #FFFFFF 50%, #E2EEF8 100%)',
          border: '1px solid rgba(36, 93, 140, 0.25)',
          borderTop: '4px solid #245D8C',
          borderRadius: '20px',
          padding: '2rem 2.2rem',
          boxShadow: '0 4px 18px rgba(36, 93, 140, 0.08), 0 1px 3px rgba(20, 34, 27, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <span style={{
                  background: '#C8DDF0',
                  color: '#245D8C',
                  border: '1px solid rgba(36, 93, 140, 0.3)',
                  borderRadius: '20px',
                  padding: '3px 12px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  fontFamily: 'Space Grotesk'
                }}>
                  ● MODULE 01 EVALUATION
                </span>
                <span style={{ fontSize: '0.72rem', color: '#42554A', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  USER FEEDBACK
                </span>
              </div>

              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#14221B',
                margin: '0 0 0.5rem',
                lineHeight: 1.2
              }}>
                Building Plan Analyzer — User Feedback & Evaluation
              </h2>

              <p style={{
                fontSize: '0.86rem',
                color: '#42554A',
                lineHeight: 1.6,
                margin: 0,
                fontWeight: 500
              }}>
                Help us refine and evaluate the Building Plan Analyzer module. Please share your feedback on floor plan interpretation, geometric accuracy, and regulatory compliance checks.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowFeedbackIframe(prev => !prev)}
                style={{
                  background: '#FFFFFF',
                  color: '#245D8C',
                  border: '1.5px solid rgba(36, 93, 140, 0.35)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                {showFeedbackIframe ? 'Hide Embedded Form' : 'Fill Form on Page'}
              </button>

              <a
                href={PLAN_ANALYZER_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#245D8C',
                  color: '#FFFFFF',
                  border: '1px solid #245D8C',
                  borderRadius: '10px',
                  padding: '0.75rem 1.4rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(36, 93, 140, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                Open Google Form
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>

          {/* Embedded Google Form Iframe View */}
          {showFeedbackIframe && (
            <div style={{
              marginTop: '1.75rem',
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid rgba(36, 93, 140, 0.22)',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(20, 34, 27, 0.06)'
            }}>
              <div style={{
                padding: '0.75rem 1.25rem',
                background: '#DEE9EF',
                borderBottom: '1px solid rgba(36, 93, 140, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#245D8C', fontFamily: 'Space Grotesk' }}>
                  Google Forms Live Evaluation Window
                </span>
                <button
                  type="button"
                  onClick={() => setShowFeedbackIframe(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#42554A',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  ✕ Close
                </button>
              </div>
              <iframe
                src={PLAN_ANALYZER_EMBED_URL}
                width="100%"
                height="800"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                style={{ display: 'block', border: 'none' }}
                title="Building Plan Analyzer Feedback Form"
              >
                Loading Feedback Form…
              </iframe>
            </div>
          )}
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
