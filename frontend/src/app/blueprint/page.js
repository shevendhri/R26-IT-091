'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function BlueprintAnalysis() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [buildingType, setBuildingType] = useState('Residential');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      setFeedback([]);
      setRecommendations(null);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('instruction', instruction);
    formData.append('building_type', buildingType);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/analyze-blueprint', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResultImage(data.annotated_image);
        setFeedback(data.feedback);
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* 🏗️ ECO HEADER */}
      <header className="header">
        <div>
            <h1>GreenConstructAI | <span style={{color: 'var(--primary)'}}>Blueprint AI</span></h1>
            <p>Automated Structural Plan Parsing</p>
        </div>
        <nav className="nav-links">
          <Link href="/blueprint" className="nav-link active">PLAN_ANALYSIS</Link>
          <Link href="/materials" className="nav-link">SELECTOR</Link>
        </nav>
      </header>

      {/* ⚙️ ANALYSIS MODULE (CONTROL PANEL) */}
      <aside className="control-panel">
        <h4 className="section-title">Analysis Module</h4>
        
        <div className="input-group">
            <label>Architectural Source</label>
            <div 
                onClick={() => fileInputRef.current.click()}
                style={{ 
                    border: '1px solid var(--border)', 
                    background: '#0a0a0a',
                    padding: '1.5rem', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    borderLeft: '4px solid var(--primary)'
                }}
            >
                <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
                <p style={{ fontSize: '0.6rem', margin: '0', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    {image ? image.name.toUpperCase() : "LOAD_PLAN_FILE"}
                </p>
            </div>
        </div>

        <div className="input-group">
            <label>Building Classification</label>
            <select 
                className="input-field" 
                value={buildingType} 
                onChange={(e) => setBuildingType(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.8rem', background: '#0a0a0a', color: '#fff', border: '1px solid var(--border)', width: '100%' }}
            >
                <option value="Residential">Residential Floor Plan</option>
                <option value="Commercial">Commercial Office</option>
                <option value="Industrial">Industrial Facility</option>
            </select>
        </div>

        <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Structural Queries</label>
            <textarea 
                className="input-field"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="DETECTION_QUERY..."
                style={{ height: '80px', resize: 'none', fontSize: '0.75rem' }}
            />
        </div>

        <button onClick={handleUpload} className="btn-primary" disabled={loading || !image} style={{ marginTop: '1rem' }}>
            {loading ? 'PROCESSING...' : 'RUN VISION CORE'}
        </button>

        {feedback.length > 0 && (
            <div style={{ marginTop: '3rem', padding: '1rem', background: '#000', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
                <h5 style={{ fontSize: '0.6rem', color: 'var(--primary)', margin: '0 0 1rem 0', letterSpacing: '1px' }}>ENGINEERING_LOG</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {feedback.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.7rem', color: '#fff', fontFamily: 'monospace', lineHeight: '1.4' }}>
                            <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>&gt;</span>{item}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </aside>

      {/* 📐 DUO-VIEW WORKBENCH */}
      <main style={{ padding: '1.5rem', overflow: 'auto' }}>
        <div className="workbench" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* PANEL 1: ORIGINAL PLAN */}
            <div className="blueprint-panel">
                <div style={{ background: '#111', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-tech)', letterSpacing: '2px', color: 'var(--text-muted)' }}>
                    SOURCE_PLAN_DRAFT
                </div>
                <div className="blueprint-view" style={{ background: '#0a0a0a' }}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Source" style={{ filter: 'grayscale(1) contrast(1.1) brightness(0.8)', maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ color: '#222', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '4px' }}>AWAITING_SOURCE</div>
                    )}
                </div>
            </div>

            {/* PANEL 2: PROCESSED MAPPING */}
            <div className="blueprint-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ background: '#111', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-tech)', letterSpacing: '2px', color: 'var(--primary)' }}>
                    STRUCTURAL_DETECTION_OVERLAY
                </div>
                <div className="blueprint-view" style={{ background: '#000' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', fontFamily: 'var(--font-tech)', color: 'var(--primary)', letterSpacing: '3px', fontWeight: '900' }}>PARSING_DRAFT...</p>
                        </div>
                    ) : resultImage ? (
                        <img src={resultImage} alt="Analysis" style={{ boxShadow: '0 0 30px var(--primary-glow)', maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ color: '#222', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '4px' }}>CORE_IDLE</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 🧠 SMART RECOMMENDATION ENGINE */}
        {recommendations && (
          <div style={{ marginTop: '2rem', background: '#0a0a0a', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
             <div style={{ background: '#111', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                 <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', letterSpacing: '1px', fontWeight: 'bold' }}>Smart Recommendation Engine (Rule-based AI Simulation)</h3>
             </div>
             
             <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                 {/* Section A */}
                 <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px' }}>
                     <h4 style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>A. DETECTED LAYOUT</h4>
                     <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#fff', fontSize: '0.8rem' }}>
                         {recommendations.detected_layout.map((item, idx) => (
                             <li key={idx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                 <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>▪</span> {item}
                             </li>
                         ))}
                     </ul>
                 </div>
                 
                 {/* Section B */}
                 <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px' }}>
                     <h4 style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>B. USER REQUEST INTERPRETATION</h4>
                     <p style={{ color: '#fff', fontSize: '0.8rem', lineHeight: '1.6', margin: 0 }}>
                         {recommendations.interpretation}
                     </p>
                 </div>
                 
                 {/* Section C */}
                 <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px', borderLeft: '2px solid #ff4444' }}>
                     <h4 style={{ color: '#ff4444', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>C. IDENTIFIED ISSUES</h4>
                     <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#fff', fontSize: '0.8rem' }}>
                         {recommendations.issues && recommendations.issues.length > 0 ? (
                             recommendations.issues.map((item, idx) => (
                                 <li key={idx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start' }}>
                                     <span style={{ color: '#ff4444', marginRight: '0.5rem' }}>⚠</span> {item}
                                 </li>
                             ))
                         ) : (
                             <li style={{ color: 'var(--text-muted)' }}>No critical layout issues found.</li>
                         )}
                     </ul>
                 </div>
                 
                 {/* Section D */}
                 <div style={{ background: '#111', padding: '1.5rem', borderRadius: '4px', border: '1px solid rgba(0, 255, 0, 0.2)' }}>
                     <h4 style={{ color: 'var(--primary)', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>D. SUGGESTED IMPROVEMENTS</h4>
                     <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#fff', fontSize: '0.8rem' }}>
                         {recommendations.improvements.map((item, idx) => (
                             <li key={idx} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', lineHeight: '1.5' }}>
                                 <span style={{ color: 'var(--primary)', marginRight: '0.5rem', marginTop: '2px' }}>⚡</span> {item}
                             </li>
                         ))}
                     </ul>
                 </div>
             </div>
             
             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: '#050505' }}>
                 <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic', letterSpacing: '0.5px' }}>
                     Disclaimer: Recommendations are generated using rule-based logic informed by architectural design principles. AI-based generative layout modification will be implemented in future development stages.
                 </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
