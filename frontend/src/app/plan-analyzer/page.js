"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '2rem'
    }} onClick={onClose}>
      <div 
        className="glass-panel glow-border" 
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '85vh',
          padding: '3rem',
          position: 'relative',
          overflowY: 'auto',
          backgroundColor: 'var(--eco-deep)',
          border: '1px solid var(--eco-glow-soft)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'color 0.3s'
          }}
        >
          ✕
        </button>

        <h2 style={{ 
          fontFamily: 'Space Grotesk', 
          fontSize: '2rem', 
          color: 'var(--eco-glow)', 
          marginBottom: '2rem',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '1rem'
        }}>
          {title}
        </h2>

        <div style={{ 
          color: 'var(--text-primary)', 
          lineHeight: '1.8', 
          fontSize: '1rem',
          whiteSpace: 'pre-wrap'
        }}>
          {content}
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-premium" 
            onClick={onClose}
            style={{ padding: '0.8rem 2rem', fontSize: '0.8rem' }}
          >
            UNDERSTOOD
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PlanAnalyzer() {
  const router = useRouter();
  
  // Form parameters
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState("Colombo");
  const [buildingType, setBuildingType] = useState("Residential");
  const [structuralSystem, setStructuralSystem] = useState("Concrete Frame");
  const [floorCount, setFloorCount] = useState(2);
  const [userQuery, setUserQuery] = useState("Perform full structural and regulatory audit.");
  
  // UI states
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
      title: "Act No 4 of 1978",
      content: `Instructions for submitting building plans as per Urban Development Act No. 41 of 1978

1. i The proposed construction plan/plan should be submitted in 3 copies.
iI All plans submitted should be prepared by an architect/planner and should bear the name and address. They should be signed.
iii The owner of the land or site should be signed.
iv The Authority may require the submission of such additional details and plans as the Authority may deem necessary.
v A copy of the plot plan prepared by an authorized surveyor on a scale not less than 1:1000 should be submitted with the building application.
vi All plans should clearly and accurately show the new building work and all parts and proposals of any existing building in colour or composition.`
    },
    special: {
      title: "Special Actions",
      content: `Special attention should be paid to the following requirements when preparing building plans.

2. i To be in scale (8 - 0 0 -1*00031: 100) Foundation details 2' - 0*1* or 120
ii North direction should be indicated correctly.
iii Building plan, house plan should consist of front view, side view, cross-section, foundation and field plan. In cases where the complexity of the building increases, several cross-sections should be shown according to that nature.
iv The method of accessing the relevant land should be indicated. (Name and width of the main road)
v The method of establishing the building on the relevant land and the nearest distance from the boundaries to the building should be clearly indicated.
vi The toilets and well / tube well should be clearly indicated. (The distance should not be less than 60 feet.) The distance between the proposed wells and pit latrines and the well should be 60* - 0' from the well.

3. i The floor plan - front view, cross section, length - width of windows and doors should contain the square footage of the building.
ii Every room in a building should be provided with natural light and ventilation through windows and doors or other approved windows.
iii The use and length and width of the various parts of the rooms in the building should be indicated.
iv The location of all doors, windows and windows should be indicated.
v The height of each roof overhang should be indicated.
vi The thickness of the walls - roof - foundation slabs should be indicated.

4. i The distance from the building to the overhead electric wires shall be indicated.
ii Methods of discharging rainwater.
iii Every building intended for human habitation shall have a toilet. Such toilet shall be indicated in the plan. Otherwise, the construction of the building shall not be permitted.

5. i No permanent or temporary building shall be constructed or altered or any parking space shall be marked within the limits of the building.
ii The minimum number of parking spaces shall be indicated in the plan submitted in accordance with the standards of the Land Development Authority. In cases where the Urban Development Authority is of the opinion that the owner is unable to provide the required number of parking spaces, a service charge shall be paid in respect of each parking space not provided.

6. i No building, existing or proposed to be constructed, shall be used for any purpose other than that approved by the Authority.
ii Building plans shall be prepared in accordance with the planning and building regulations of the Urban Development Authority.`
    },
    gazette: {
      title: "No 223/54 - July 2021",
      content: `For more details, see the Extraordinary Gazette of the Democratic Socialist Republic of Sri Lanka No. 2235/54 and the Gazette Extraordinary dated 08 July 2021.

Warning.

1. Do not construct permanent or temporary buildings or carry out any construction-related activities without obtaining a permit. Doing so will be considered as unauthorized construction and action will be taken as per the law. You will have to pay fines only if an unauthorized construction can be legalized.

2. It is prohibited to occupy or use any building without obtaining a certificate of conformity. Those who do so will have to pay a fine of Rs. 100/- per day.

3. The validity period of the approval for the construction of the building is limited to one year and the validity period must be extended before the expiry of that period.

4. It is illegal to construct/reconstruct/alter/change the approved plan of a building without the approval of this Pradeshiya Sabha. If it is necessary to construct the building differently from the approved plan, a revised plan must be submitted without delay. The construction of the building should not be started until the said revised plan is approved by the Chairman.`
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

    try {
      const res = await fetch("http://localhost:5000/api/analyze-blueprint", {
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
      setError("AI Vision Service Offline. Ensure backend is running at http://localhost:5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!analysisResult || !analysisResult.structured_info) return;
    
    // Store in localStorage to pass it to the Material Specification module
    localStorage.setItem(
      "imported_building_info", 
      JSON.stringify(analysisResult.structured_info)
    );
    
    // Redirect to Materials module page
    router.push("/materials");
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff', position: 'relative' }}>
      <div className="premium-bg">
        <div className="gradient-mesh"></div>
        <div className="blueprint-grid"></div>
      </div>
      
      <Header />

      {loading && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 5000, 
          background: 'rgba(4, 13, 10, 0.98)', 
          backdropFilter: 'blur(30px)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '2rem' 
        }}>
          <div className="neural-core-v2" style={{ width: '130px', height: '130px' }}>
            <div className="core-ring core-ring-1"></div>
            <div className="core-ring core-ring-2"></div>
            <div className="core-ring core-ring-3"></div>
            <div style={{ fontSize: '3.5rem' }}>📐</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '10px', textTransform: 'uppercase', marginBottom: '15px' }}>Vision core analysis</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk' }}>{loadingStep}...</div>
          </div>
        </div>
      )}

      <main style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header Section */}
        <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--eco-glow)', fontFamily: 'Space Grotesk', fontWeight: 800, marginBottom: '0.5rem' }}>
              Building Plan Analyzer
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
              AI-Based Blueprint Compliance Audits & Architectural Layer Interpretation
            </p>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem 1.5rem', borderRadius: '50px', border: '1px solid var(--blueprint-blue)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--blueprint-blue)' }}>
            VISION PIPELINE v18.2
          </div>
        </div>

        {/* Info Buttons Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {Object.keys(modalContents).map(key => (
            <button 
              key={key}
              className="glass-panel glow-border"
              onClick={() => setActiveModal(key)}
              style={{ 
                padding: '1.25rem', 
                color: '#fff', 
                cursor: 'pointer', 
                fontSize: '0.8rem', 
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.01)',
                transition: 'all 0.3s'
              }}
            >
              {modalContents[key].title}
            </button>
          ))}
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '6px solid var(--error-red)', marginBottom: '2rem', color: 'var(--error-red)', fontWeight: 700 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
          {/* Left Side: Upload and Configuration Form */}
          <div className="glass-panel glow-border" style={{ padding: '2.5rem', height: 'fit-content', background: 'rgba(13, 43, 33, 0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontFamily: 'Space Grotesk', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              Upload Plan File & Define Context
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label className="tech-label">Geoclimatic Location</label>
                <select className="tech-input" value={location} onChange={e => setLocation(e.target.value)}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="tech-label">Building Typology</label>
                <select className="tech-input" value={buildingType} onChange={e => setBuildingType(e.target.value)}>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="tech-label">Floor Count</label>
                  <input 
                    className="tech-input" 
                    type="number" 
                    min="1" 
                    max="15" 
                    value={floorCount} 
                    onChange={e => setFloorCount(parseInt(e.target.value) || 1)} 
                  />
                </div>
                <div>
                  <label className="tech-label">Structural Frame System</label>
                  <select className="tech-input" value={structuralSystem} onChange={e => setStructuralSystem(e.target.value)}>
                    <option>Concrete Frame</option>
                    <option>Steel Frame</option>
                    <option>Load-bearing Masonry</option>
                    <option>Timber Frame</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="tech-label">Audit Query / Intent</label>
                <input 
                  className="tech-input" 
                  type="text" 
                  value={userQuery} 
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="e.g. Check for vertical clearance, structural spacing..." 
                />
              </div>

              <div>
                <label className="tech-label">Blueprint Document (Image/PDF)</label>
                <div style={{ position: 'relative', height: '140px', border: '2px dashed var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                  <input type="file" onChange={handleFileChange} accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                  {imagePreview ? (
                    <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="Preview" />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📁</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CHOOSE BLUEPRINT IMAGE</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="btn-premium"
              style={{ 
                width: '100%', 
                padding: '1rem',
                cursor: selectedFile ? 'pointer' : 'not-allowed',
                opacity: selectedFile ? 1 : 0.6
              }}
              onClick={handleAnalyzePlan}
              disabled={!selectedFile || loading}
            >
              Analyze Building Plan
            </button>
          </div>

          {/* Right Side: Analysis Results & Structured Info Table */}
          <div style={{ minHeight: '550px' }}>
            {analysisResult ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Visual Vision Overlay */}
                <div className="glass-panel glow-border" style={{ padding: '1rem', background: '#000', position: 'relative', overflow: 'hidden', border: '1px solid var(--blueprint-blue)' }}>
                  <div className="scan-line" style={{ background: 'var(--blueprint-blue)', height: '2px' }}></div>
                  <img src={analysisResult.annotated_image} style={{ width: '100%', display: 'block', borderRadius: '12px' }} alt="Blueprint Vision Overlay" />
                </div>

                {/* BUILDING COMPONENTS EXTRACTED TABLE */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
                    § Extracted Building Parameters
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '10px 8px', fontWeight: 700 }}>Parameter</th>
                          <th style={{ padding: '10px 8px', fontWeight: 700 }}>Inferred Dimension/Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Building Typology", analysisResult.structured_info.building_type],
                          ["Floor Count", `${analysisResult.structured_info.floor_count} storeys`],
                          ["Total Floor Area", `${analysisResult.structured_info.total_floor_area} m²`],
                          ["Estimated Wall Area", `${analysisResult.structured_info.wall_area} m²`],
                          ["Estimated Roof Area", `${analysisResult.structured_info.roof_area} m²`],
                          ["Window Openings Area", `${analysisResult.structured_info.window_area} m²`],
                          ["Door Units Count", `${analysisResult.structured_info.door_count} nos`],
                          ["Structural Frame System", analysisResult.structured_info.structural_system],
                          ["Geoclimatic Zone Location", analysisResult.structured_info.location]
                        ].map(([param, value]) => (
                          <tr key={param} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{param}</td>
                            <td style={{ padding: '10px 8px', color: 'var(--eco-glow)', fontWeight: 800 }}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Spatial Compliance Warnings */}
                <div className="glass-panel" style={{ padding: '2rem', borderLeft: '5px solid var(--warn-amber)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--warn-amber)', letterSpacing: '2px', marginBottom: '1.25rem' }}>
                    SPATIAL COMPLIANCE ISSUES DETECTED
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysisResult.spatial.map((warning, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--warn-amber)' }}>⚠️</span>
                        <span>{warning}</span>
                      </div>
                    ))}
                    {analysisResult.spatial.length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        No compliance exceptions found. Plan complies with regulatory clearances.
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Action */}
                <button 
                  className="btn-premium"
                  onClick={handleExportData}
                  style={{
                    padding: '1.25rem',
                    background: 'var(--eco-glow)',
                    color: 'var(--eco-black)',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    letterSpacing: '2px'
                  }}
                >
                  Export Data to Material Specification Module ➔
                </button>
              </div>
            ) : (
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '450px', background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--glass-border)', opacity: 0.5 }}>
                <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>📊</div>
                <div style={{ fontWeight: 900, fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '5px' }}>READY FOR BLUEPRINT INTERPRETATION</div>
                <div style={{ fontSize: '0.65rem', marginTop: '1rem', color: 'var(--text-dim)' }}>Select a plan file and click Analyze to generate structured parameters.</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {activeModal && (
        <Modal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          title={modalContents[activeModal].title}
          content={modalContents[activeModal].content}
        />
      )}
    </div>
  );
}
