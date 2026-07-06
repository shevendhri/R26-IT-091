"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Building3DModel from '@/components/Building3DModel';
import MaterialSelectionDashboard from '@/components/MaterialSelectionDashboard';

const getWallMaterialName = (id) => {
  const wallMap = {
    '7': 'Premium Wire-Cut Clay Brick (Brick Texture)',
    '8': 'AAC Eco-Block (Plaster Texture)',
    '9': 'High-Density Cement Block (Concrete Texture)',
    '10': 'Insulated Spandrel Panel (Metal Sheet Texture)',
    '24': 'Stabilized Earth Block (CSEB) (Brick Texture)'
  };
  return wallMap[String(id)] || 'Standard Plaster (Concrete Texture)';
};

const getRoomFlooringName = (label, selectedFlooringId) => {
  const l = (label || '').toLowerCase();
  if (l.includes('master') || l.includes('bedroom') || l.includes('dining') || l.includes('study')) {
    return 'Hardwood Timber Planks (Wood Texture)';
  }
  if (l.includes('bath') || l.includes('kitchen')) {
    return 'Standard Ceramic Tiles (Ceramic Texture)';
  }
  if (l.includes('garage') || l.includes('utility') || l.includes('balcony')) {
    return 'Exposed Concrete Floor (Concrete Texture)';
  }
  const floorMap = {
    '14': 'Industrial Epoxy (Concrete Texture)',
    '15': 'Polished Terrazzo (Terrazzo Texture)',
    '16': 'Premium Porcelain GVT Slab (Marble Texture)',
    '25': 'Recycled Composite Decking (Wood Texture)',
    '31': 'Standard Ceramic Tile (Ceramic Texture)'
  };
  return floorMap[String(selectedFlooringId)] || 'Standard Floor Finishes (Terrazzo Texture)';
};

export default function EngineeringWorkspace() {
  // ── STEP STATE ──
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [apiError, setApiError] = useState(null);

  // ── DATA STATE ──
  const [setup, setSetup] = useState({
    city: "Colombo",
    building_type: "Residential",
    num_floors: 1
  });

  // ── DYNAMIC QUESTIONNAIRE ──
  const [questionnaireSchema, setQuestionnaireSchema] = useState([]);
  const [questionnaire, setQuestionnaire] = useState({});

  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch(`http://localhost:5000/api/questionnaire-schema?building_type=${setup.building_type}`);
        if (!res.ok) throw new Error('Schema fetch failed');
        const data = await res.json();
        if (data.status === 'success') {
          setQuestionnaireSchema(data.schema);
          const initialQ = { building_type: setup.building_type };
          data.schema.forEach(field => {
             initialQ[field.key] = field.default;
          });
          setQuestionnaire(initialQ);
        }
      } catch (err) {
        console.error('Failed to fetch schema:', err);
      }
    }
    fetchSchema();
  }, [setup.building_type]);

  // Removed useEffect syncing building_type to avoid cascading renders.
  // We will merge it during the API call.

  // Debug logs
  console.log('buildingType', setup.building_type);
  console.log('questionnaire state', questionnaire);
  console.log('currentStep', currentStep);

  const [styleAnalysis, setStyleAnalysis] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const [userProfile, setUserProfile] = useState(null);
  const [buildingProgram, setBuildingProgram] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [materialPackage, setMaterialPackage] = useState(null);
  const [materialSelections, setMaterialSelections] = useState({});
  const [materialAlternatives, setMaterialAlternatives] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState("recommended"); // "recommended", "eco_premium", "climate_resilient"
  const [threeDMode, setThreeDMode] = useState("exterior"); // "exterior", "interior"
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [activeFloor, setActiveFloor] = useState(-1); // -1 = all floors
  const [landscapeData, setLandscapeData] = useState(null);
  const [presentationMode, setPresentationMode] = useState("architectural"); // "engineering", "architectural", "dollhouse"


  // ── ROOM ICON HELPER ──
  const getRoomIcon = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('master') || l.includes('bedroom'))  return '🛏️';
    if (l.includes('bath') || l.includes('toilet') || l.includes('restroom')) return '🚿';
    if (l.includes('kitchen') || l.includes('pantry'))  return '🍳';
    if (l.includes('living') || l.includes('lounge') || l.includes('lobby')) return '🛋️';
    if (l.includes('dining'))                            return '🍽️';
    if (l.includes('office') || l.includes('study') || l.includes('meeting')) return '💼';
    if (l.includes('utility') || l.includes('laundry') || l.includes('store')) return '🔧';
    if (l.includes('garage') || l.includes('parking'))  return '🚗';
    if (l.includes('balcony') || l.includes('terrace') || l.includes('verandah')) return '🌿';
    if (l.includes('stair') || l.includes('corridor') || l.includes('hall')) return '🚪';
    return '🏠';
  };

  // ── FURNITURE INVENTORY HELPER ──
  const getFurnitureList = (label, w, h) => {
    const l = (label || '').toLowerCase();
    if (l.includes('master')) {
      return ['King Size Bed', 'Dual Side Tables & Lamps', 'Dressing Table & Mirror', 'Large Wardrobe', 'Indoor Potted Palm'];
    }
    if (l.includes('bedroom') || l.includes('sleeping') || l.includes('guest') || l.includes('children') || l.includes('kid')) {
      return ['Standard Bed', 'Side Table & Reading Lamp', 'Wardrobe', 'Study Desk & Chair'];
    }
    if (l.includes('bath') || l.includes('toilet') || l.includes('restroom') || l.includes('wc') || l.includes('powder')) {
      return ['Ceramic Toilet Unit', 'Vanity Sink Cabinet & Mirror', 'Glass Shower Enclosure'];
    }
    if (l.includes('kitchen') || l.includes('pantry') || l.includes('cook')) {
      const items = ['Kitchen Counter & Cabinets', 'Built-in Steel Sink', 'Stove Cooktop', 'Upper Cabinets', 'Double-door Refrigerator'];
      if (w > 3.2 && h > 3.2) items.push('Central Prep Island & Stools');
      return items;
    }
    if (l.includes('living') || l.includes('lounge') || l.includes('sitting') || l.includes('family')) {
      return ['Fabric Upholstered Sofa', 'Central Coffee Table', 'TV Console & TV screen', 'Large Area Rug', 'Decorative Floor Plants'];
    }
    if (l.includes('dining')) {
      return ['Hardwood Dining Table', `${w > 1.4 ? '6x' : '4x'} Dining Chairs`];
    }
    if (l.includes('office') || l.includes('study') || l.includes('library') || l.includes('reading')) {
      return ['L-shaped Office Desk', 'High-back Ergonomic Chair', 'Computer Monitor', 'Tall Bookshelf'];
    }
    if (l.includes('utility') || l.includes('laundry') || l.includes('store') || l.includes('storage')) {
      return ['Front-load Washing Machine', 'Multi-tier Storage Shelving'];
    }
    if (l.includes('garage') || l.includes('parking') || l.includes('carport')) {
      return ['Simplified Vehicle (Car)', 'Wall Tool Shelf', 'Heavy-duty Storage Box'];
    }
    if (l.includes('stair') || l.includes('hall') || l.includes('corridor') || l.includes('lobby') || l.includes('passage')) {
      return ['Multi-step Wooden Staircase', 'Steel & Timber Handrail'];
    }
    return [];
  };


  // ── LIST OF CITIES ──
  const cities = [
    "Colombo", "Galle", "Kandy", "Negombo", "Ratnapura", "Anuradhapura", "Nuwara Eliya", 
    "Jaffna", "Trincomalee", "Batticaloa", "Matara", "Hambantota", "Kurunegala", "Badulla", "Gampaha", "Kalutara"
  ].sort();

  // ── STEP SUBMIT HANDLERS ──

  // Step 1 -> Step 2
  const handleProceedSetup = () => {
    setCurrentStep(2);
  };

  // Step 2 -> Step 3
  const handleSavePreferences = async () => {
    console.log('🛎️ handleSavePreferences invoked');
    setLoading(true);
    setApiError(null);
    setLoadingStep("Structuring User Profile DNA");
    try {
      // Step 1: Submit questionnaire
      let profile = null;
      try {
        const res = await fetch('http://localhost:5000/api/questionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...questionnaire, building_type: setup.building_type })
        });
        if (!res.ok) throw new Error(`Questionnaire API error: ${res.status}`);
        const data = await res.json();
        if (data.status === "success" && data.profile) {
          console.log('✅ Questionnaire API success', data);
          profile = data.profile;
          setUserProfile(data.profile);
        } else {
          throw new Error(data.detail || "Questionnaire returned unexpected response");
        }
      } catch (qErr) {
        console.error('Questionnaire API failed:', qErr);
        setApiError(`Backend error: ${qErr.message}. Make sure the backend server is running on port 5000.`);
        setLoading(false);
        return;
      }

      // Step 2: Generate building program
      setLoadingStep("Synthesizing Architectural Space Requirements");
      try {
        const progRes = await fetch('http://localhost:5000/api/building-program', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: profile,
            building_type: setup.building_type,
            num_floors: setup.num_floors
          })
        });
        if (!progRes.ok) throw new Error(`Building Program API error: ${progRes.status}`);
        const progData = await progRes.json();
        if (progData.status === "success") {
            console.log('🏗️ Received building program', progData);
            setBuildingProgram(progData);
        } else {
          // Fallback: create a minimal building program so step 3 still renders
          console.warn('Building program API issue, using fallback:', progData);
          setBuildingProgram({
            status: "success",
            total_area: ((questionnaire.bedrooms_needed || 3) * 20) + 60,
            net_area: ((questionnaire.bedrooms_needed || 3) * 18) + 50,
            blueprint_summary: [`${questionnaire.bedrooms_needed || 3} Bedrooms`, `${questionnaire.num_bathrooms || 2} Bathrooms`, "Living Room", "Kitchen"],
            relationships: ["Bedrooms adjacent to bathrooms", "Living room connects to kitchen", "Entrance foyer at main access"]
          });
        }
              } catch (progErr) {
          console.warn('Building program API failed, using fallback:', progErr);
          // Still advance with fallback data
          console.log('⚠️ Building program fallback used');
          setBuildingProgram({
            status: "success",
            total_area: ((questionnaire.bedrooms_needed || 3) * 20) + 60,
            net_area: ((questionnaire.bedrooms_needed || 3) * 18) + 50,
            blueprint_summary: [`${questionnaire.bedrooms_needed || 3} Bedrooms`, `${questionnaire.num_bathrooms || 2} Bathrooms`, "Living Room", "Kitchen & Dining"],
            relationships: ["Bedrooms adjacent to bathrooms", "Living room connects to kitchen", "Entrance foyer at main access"]
          });
        }
        // Duplicate fallback removed – original block consolidated earlier



      // Always advance to step 3 if questionnaire succeeded
      console.log('🚀 Advancing to Step 3');
            setCurrentStep(3);

    } catch (err) {
      console.error('handleSavePreferences unexpected error:', err);
      setApiError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Step 4
  const handleGenerateBlueprint = async () => {
    setLoading(true);
    setApiError(null);
    setLoadingStep("Compiling 2D Floor Plan Matrices");
    try {
      const res = await fetch('http://localhost:5000/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userProfile,
          building_type: setup.building_type,
          num_floors: setup.num_floors
        })
      });
      if (!res.ok) throw new Error(`Blueprint API error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && data.blueprint) {
        setBlueprint(data.blueprint);
      } else {
        // Fallback minimal blueprint
        setBlueprint({
          footprint: { w: 12, h: 10 },
          num_floors: setup.num_floors,
          style_pref: questionnaire.style_pref,
          relationships: ["Living room adjacent to kitchen", "Bedrooms on upper floor"],
          floors_data: [{ floor: 1, rooms: [
            { id: 'r1', label: 'Living Room', type: 'PUBLIC', x: 0, y: 0, w: 6, h: 5 },
            { id: 'r2', label: 'Kitchen', type: 'WET', x: 6, y: 0, w: 6, h: 5 },
            { id: 'r3', label: 'Master Bedroom', type: 'PRIVATE', x: 0, y: 5, w: 6, h: 5 },
            { id: 'r4', label: 'Bathroom', type: 'WET', x: 6, y: 5, w: 6, h: 5 }
          ]}]
        });
        console.warn('Blueprint API issue, using fallback:', data);
      }
      setCurrentStep(4);
    } catch (err) {
      console.error('handleGenerateBlueprint error:', err);
      setApiError(`Blueprint error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> Step 4.5 (Style Analysis)
  const handleStyleAnalysis = async () => {
    setLoading(true);
    setApiError(null);
    setLoadingStep("Resolving Architectural Style Profile & Building Massing");
    try {
      let styleData = null;
      try {
        const res = await fetch('http://localhost:5000/api/architectural-style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: { ...userProfile, budget_tier: questionnaire.budget_tier },
            location: setup.city,
            total_area: buildingProgram?.total_area || 150,
            num_floors: setup.num_floors
          })
        });
        if (!res.ok) throw new Error(`Style API error: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
          styleData = data;
        } else {
          throw new Error(data.detail || 'Style API returned unexpected response');
        }
      } catch (styleErr) {
        console.warn('Style API failed, using fallback:', styleErr);
        // Fallback style analysis
        styleData = {
          status: 'success',
          style_profile: {
            style: questionnaire.style_pref || 'Modern',
            roof_type: 'Hip Roof',
            window_family: 'Large Sliding',
            door_family: 'Timber Pivot',
            reasoning: 'Style resolved from user preferences.',
            confidence: 0.75,
            roof_pitch: 1.0,
            roof_overhang: 1.8,
            has_verandah: true,
            has_balcony: false,
            column_style: 'square'
          },
          building_form: {
            massing_shape: 'Rectangular',
            cantilever_depth: 0.6,
            facade_projection: 1.0,
            roof_profile: { type: 'Hip Roof', pitch: 1.0 }
          },
          questionnaire_audit: []
        };
      }

      setStyleAnalysis(styleData);

      // Fetch landscape in background (optional — never blocks step advance)
      fetch('http://localhost:5000/api/landscape-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style_name: styleData.style_profile?.style || 'Modern',
          location: setup.city,
          budget_tier: questionnaire.budget_tier || 'Balanced',
          bp_w: blueprint?.footprint?.w || 10,
          bp_h: blueprint?.footprint?.h || 8
        })
      }).then(r => r.json()).then(lData => {
        if (lData.status === 'success') setLandscapeData(lData.landscape);
      }).catch(e => console.warn('Landscape optional, skipped:', e));

      // Always advance
      setCurrentStep(5);

    } catch (err) {
      console.error('handleStyleAnalysis error:', err);
      setApiError(`Style analysis error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 4.5 -> Step 5
  const handleRecommendMaterials = async () => {
    setLoading(true);
    setApiError(null);
    setLoadingStep("Calculating Structural Suitability Scores");
    try {
      let pkgData = null;
      try {
        const res = await fetch('http://localhost:5000/recommend-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blueprint: blueprint,
            location: setup.city,
            profile: userProfile
          })
        });
        if (!res.ok) throw new Error(`Recommend API error: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success' || data.climate_profile) {
          pkgData = data;
        } else {
          throw new Error(data.detail || 'Recommend API returned unexpected response');
        }
      } catch (recErr) {
        console.warn('Recommend materials API failed, using fallback:', recErr);
        pkgData = {
          status: 'success',
          climate_profile: { zone: setup.city, humidity: 'High', rainfall: 'High' },
          recommended_package: {
            wall: { name: 'AAC Eco-Block', score: 82 },
            roof: { name: 'Clay Roof Tiles', score: 79 },
            floor: { name: 'Ceramic Tiles', score: 85 },
            door: { name: 'Timber Solid Door', score: 80 },
            window: { name: 'Aluminium Sliding', score: 88 }
          }
        };
      }
      setMaterialPackage(pkgData);
      // Always advance to step 5
      setCurrentStep(6);
    } catch (err) {
      console.error('handleRecommendMaterials error:', err);
      setApiError(`Recommendations error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  const getRoomColor = (type) => {
    switch(type) {
      case 'WET': return 'rgba(56, 189, 248, 0.12)';
      case 'PUBLIC': return 'rgba(255, 255, 255, 0.04)';
      case 'PRIVATE': return 'rgba(0, 255, 157, 0.06)';
      default: return 'rgba(255, 255, 255, 0.02)';
    }
  };

  const getRoomStroke = (type) => {
    switch(type) {
      case 'WET': return '#38bdf8';
      case 'PUBLIC': return '#ffffff';
      case 'PRIVATE': return '#00ff9d';
      default: return '#475569';
    }
  };

  // ── LOADING VIEW ──
  if (loading) {
    return (
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
        gap: '2.5rem' 
      }}>
        <div className="neural-core-v2" style={{ width: '150px', height: '150px' }}>
          <div className="core-ring core-ring-1"></div>
          <div className="core-ring core-ring-2"></div>
          <div className="core-ring core-ring-3"></div>
          <div style={{ fontSize: '4.5rem' }}>🧬</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '10px', textTransform: 'uppercase', marginBottom: '15px' }}>SYSTEM MIGRATING</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk' }}>{loadingStep}...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff', position: 'relative' }}>
      <div className="premium-bg"><div className="gradient-mesh"></div><div className="blueprint-grid"></div></div>
      
      <Header />
      
      <main style={{ padding: '2rem 3rem', position: 'relative', zIndex: 10 }}>
        
        {/* ── STEPPER HEADER ── */}
        <section className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', gap: '1.5rem' }}>
            {[
              "1. SETUP", "2. QUESTIONNAIRE", "3. PROGRAM", "4. BLUEPRINT",
              "4.5 STYLE", "5. RECOMMENDATIONS", "6. ALTERNATIVES", "7. 3D CONCEPT", "8. REPORT"
            ].map((label, idx) => {
              // Map display index to actual step number
              const stepNums = [1,2,3,4,5,6,7,8,9];
              const stepNum = stepNums[idx];
              const active = stepNum === currentStep;
              const completed = stepNum < currentStep;
              return (
                <div 
                  key={label} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    opacity: active ? 1 : (completed ? 0.8 : 0.35),
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: active ? 'var(--eco-glow)' : (completed ? 'var(--blueprint-blue)' : 'rgba(255,255,255,0.05)'),
                    color: active ? '#000' : '#fff',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.7rem', 
                    fontWeight: 900 
                  }}>
                    {completed ? "✓" : (stepNum === 5 ? "5" : Math.round(stepNum))}
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1px', whiteSpace: 'nowrap', color: active ? 'var(--eco-glow)' : '#fff' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── STEP WORKSPACES ── */}
        <section style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* STEP 1: PROJECT SETUP */}
          {currentStep === 1 && (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3.5rem', maxWidth: '650px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
                <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk' }}>PROJECT INITIAL SETUP</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Define core geo-spatial and volumetric properties.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                <div>
                  <label className="tech-label">Geographic Location</label>
                  <select className="tech-input" value={setup.city} onChange={e => setSetup({...setup, city: e.target.value})}>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="tech-label">Building Typology</label>
                  <select className="tech-input" value={setup.building_type} onChange={e => setSetup({...setup, building_type: e.target.value})}>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                    <option>Hotel</option>
                  </select>
                </div>

                <div>
                  <label className="tech-label">Total Floor count</label>
                  <input className="tech-input" type="number" min="1" max="15" value={setup.num_floors} onChange={e => setSetup({...setup, num_floors: parseInt(e.target.value) || 1})} />
                </div>
              </div>

              <button className="btn-premium" style={{ width: '100%' }} onClick={handleProceedSetup}>
                PROCEED TO QUESTIONNAIRE
              </button>
            </div>
          )}

          {/* STEP 2: USER QUESTIONNAIRE — STATIC HARDCODED (RELIABLE) */}
          {currentStep === 2 && (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                <h2 style={{ fontSize: '1.75rem', fontFamily: 'Space Grotesk' }}>AI DESIGN QUESTIONNAIRE</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Specify design traits and sustainability goals for your {setup.building_type} project.</p>
              </div>

              {/* Error Banner */}
              {apiError && (
                <div style={{
                  background: 'rgba(255,60,60,0.12)',
                  border: '1px solid rgba(255,80,80,0.5)',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                  <div>
                    <div style={{ color: '#ff6b6b', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '4px' }}>SYSTEM ERROR</div>
                    <div style={{ color: '#ffaaaa', fontSize: '0.8rem', lineHeight: 1.5 }}>{apiError}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {questionnaireSchema.map((field) => (
                  <div key={field.key}>
                    <label className="tech-label">{field.label}</label>
                    {field.type === 'select' ? (
                      <select className="tech-input" 
                        value={questionnaire[field.key] !== undefined ? questionnaire[field.key] : field.default}
                        onChange={e => setQuestionnaire({...questionnaire, [field.key]: e.target.value})}>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input className="tech-input" type="number" min={field.min} max={field.max}
                        value={questionnaire[field.key] !== undefined ? questionnaire[field.key] : field.default}
                        onChange={e => setQuestionnaire({...questionnaire, [field.key]: parseInt(e.target.value) || 0})} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(1)}>
                  BACK
                </button>
                <button className="btn-premium" style={{ flex: 2 }} onClick={handleSavePreferences}>
                  SUBMIT PREFERENCES
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BUILDING PROGRAM */}
          {currentStep === 3 && (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3.5rem', maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px' }}>PROGRAM_COMPILER</div>
                <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>AI BUILDING PROGRAM</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>ESTIMATED TOTAL AREA</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--eco-glow)', marginTop: '5px' }}>{buildingProgram?.total_area || 0} m²</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>NET HABITABLE AREA</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--blueprint-blue)', marginTop: '5px' }}>{buildingProgram?.net_area || 0} m²</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CIRCULATION MULTIPLIER</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginTop: '5px' }}>+15%</div>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <div className="tech-label">Spatial Zoning Distribution</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {buildingProgram?.blueprint_summary?.map((summary, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', gap: '15px' }}>
                      <span style={{ color: 'var(--eco-glow)' }}>►</span>
                      <span>{summary}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <div className="tech-label">Structural Relationships</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {buildingProgram?.relationships?.map((rel, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', gap: '15px' }}>
                      <span style={{ color: 'var(--blueprint-blue)' }}>✦</span>
                      <span>{rel}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(2)}>
                  BACK
                </button>
                <button className="btn-premium" style={{ flex: 2 }} onClick={handleGenerateBlueprint}>
                  GENERATE BLUEPRINT LAYOUT
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BLUEPRINT VIEWER */}
          {currentStep === 4 && blueprint && (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '4px' }}>BLUEPRINT_DASHBOARD</div>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>AI BLUEPRINT GENERATOR</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800 }}>FOOTPRINT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{blueprint.footprint.w}m x {blueprint.footprint.h}m</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
                
                {/* SVG Blueprint Canvas */}
                <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '24px', padding: '2rem', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
                    backgroundSize: '30px 30px',
                    opacity: 0.1,
                    borderRadius: '24px'
                  }}></div>

                  <svg width="100%" height="450" viewBox={`0 0 ${(blueprint.footprint.w * 22) + 90} ${(blueprint.footprint.h * 22) + 90}`} style={{ position: 'relative', zIndex: 2 }}>
                    <rect x="45" y="45" width={blueprint.footprint.w * 22} height={blueprint.footprint.h * 22} fill="none" stroke="#1e293b" strokeWidth="8" rx="4" />
                    
                    {blueprint.floors_data[0].rooms.map((room, i) => (
                      <g key={i} transform={`translate(${45 + (room.x * 22)}, ${45 + (room.y * 22)})`}>
                        <rect width={room.w * 22} height={room.h * 22} fill={getRoomColor(room.type)} stroke={getRoomStroke(room.type)} strokeWidth="2" rx="2" />
                        <text x="8" y="24" fontSize="10" fill="#fff" fontWeight="800">{room.label.toUpperCase()}</text>
                        <text x="8" y="38" fontSize="7" fill="var(--text-dim)" fontWeight="700">{room.w}m x {room.h}m</text>
                        <text x={room.w * 22 - 20} y={room.h * 22 - 10} fontSize="12">{getRoomIcon(room.label)}</text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Properties list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)' }}>
                    <div className="tech-label">Spatial DNA metrics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Style Preference:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{blueprint.style_pref}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Elevations count:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{blueprint.num_floors} Level(s)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zoned Rooms:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{blueprint.floors_data[0].rooms.length} Units</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)' }}>
                    <div className="tech-label">Adjacency constraints verified</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {blueprint.relationships.map((rel, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--eco-glow)' }}>✔</span>
                          <span>{rel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(3)}>
                      BACK
                    </button>
                    <button className="btn-premium" style={{ flex: 2 }} onClick={handleStyleAnalysis}>PROCEED TO STYLE ANALYSIS</button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4.5: ARCHITECTURAL STYLE & MASSING ANALYSIS */}
          {currentStep === 5 && styleAnalysis && (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3rem', maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px' }}>STYLE_INTELLIGENCE_ENGINE</div>
                <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>ARCHITECTURAL STYLE & MASSING ANALYSIS</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.5rem' }}>AI-resolved style profile, geometry variables, and building form parameters.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Resolved Style Card */}
                <div style={{ background: 'linear-gradient(135deg,rgba(0,255,157,0.08),rgba(56,189,248,0.06))', border: '1px solid rgba(0,255,157,0.3)', borderRadius: '20px', padding: '2rem' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px', marginBottom: '1rem' }}>RESOLVED STYLE PROFILE</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>{styleAnalysis.style_profile?.style || 'Modern'}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {[styleAnalysis.style_profile?.roof_type, styleAnalysis.style_profile?.window_family, styleAnalysis.style_profile?.door_family].filter(Boolean).map((tag, i) => (
                      <span key={i} style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(0,255,157,0.1)', border: '1px solid rgba(0,255,157,0.3)', borderRadius: '20px', padding: '3px 10px', color: 'var(--eco-glow)' }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>{styleAnalysis.style_profile?.reasoning?.substring(0, 200)}...</div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--eco-glow)' }}>{Math.round((styleAnalysis.style_profile?.confidence || 0.85) * 100)}%</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 900 }}>MATCH CONFIDENCE</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--blueprint-blue)' }}>{styleAnalysis.style_profile?.roof_pitch || 0}</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 900 }}>ROOF PITCH FACTOR</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{styleAnalysis.style_profile?.roof_overhang || 0}m</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 900 }}>EAVE OVERHANG</div>
                    </div>
                  </div>
                </div>

                {/* Building Form Massing Card */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '2rem' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '4px', marginBottom: '1rem' }}>BUILDING FORM & MASSING</div>
                  {styleAnalysis.building_form && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['Massing Shape', styleAnalysis.building_form.massing_shape],
                        ['Cantilever Depth', `${styleAnalysis.building_form.cantilever_depth}m`],
                        ['Facade Projection', `${styleAnalysis.building_form.facade_projection}m`],
                        ['Roof Type', styleAnalysis.building_form.roof_profile?.type],
                        ['Roof Pitch', styleAnalysis.building_form.roof_profile?.pitch],
                        ['Has Verandah', styleAnalysis.style_profile?.has_verandah ? 'Yes' : 'No'],
                        ['Has Balcony', styleAnalysis.style_profile?.has_balcony ? 'Yes' : 'No'],
                        ['Column Style', styleAnalysis.style_profile?.column_style]
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{k}:</span>
                          <span style={{ fontWeight: 800, color: '#fff' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Color Palette Preview */}
              {styleAnalysis.style_profile?.color_palette && (
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1rem' }}>RESOLVED COLOR PALETTE</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {Object.entries(styleAnalysis.style_profile.color_palette).map(([key, hex]) => (
                      <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: hex, border: '2px solid rgba(255,255,255,0.15)', margin: '0 auto 6px' }} />
                        <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 900, textTransform: 'uppercase' }}>{key}</div>
                        <div style={{ fontSize: '0.58rem', color: '#fff', fontWeight: 700 }}>{hex}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questionnaire Impact Audit Trail */}
              {styleAnalysis.questionnaire_audit && (
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '3px', marginBottom: '1rem' }}>QUESTIONNAIRE → DESIGN IMPACT AUDIT</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {styleAnalysis.questionnaire_audit.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 100px 1fr', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.78rem', alignItems: 'start' }}>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>{item.question}</span>
                        <span style={{ color: 'var(--eco-glow)', fontWeight: 800 }}>{item.answer}</span>
                        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(4)}>BACK</button>
                <button className="btn-premium" style={{ flex: 2 }} onClick={handleRecommendMaterials}>RECOMMEND MATERIAL PACKAGE</button>
              </div>
            </div>
          )}

          {/* STEP 5: RECOMMENDED MATERIAL PACKAGE */}
          {currentStep === 6 && materialPackage && (() => {
            const logs = materialPackage.audit_log || auditLogs || [];
            const getRank1 = (catNames) => {
              const items = logs.filter(l => catNames.includes(l.category));
              if (items.length === 0) return {};
              items.sort((a, b) => (b.hybrid_score || 0) - (a.hybrid_score || 0));
              const best = items[0];
              return {
                name: best.item_name,
                rationale: best.explanation,
                cost_guidance: best.cost_score,
                service_life: best.service_life || "30",
                sustainability_rating: best.sustainability_score || "50"
              };
            };
            return (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px' }}>RECOMMENDATION_MATRIX</div>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>RECOMMENDED BUILDING PACKAGE</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800 }}>CLIMATE SYSTEM</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--eco-glow)' }}>{materialPackage.climate_profile.type}</div>
                </div>
              </div>

              {/* Climate brief and warnings */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>ENGINEERING_VERDICT</span>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{materialPackage.engineering_verdict}</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--warn-amber)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>CLIMATE RISK ADVISORY</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{materialPackage.climate_profile.risk_advisory}</p>
                </div>
              </div>

              {/* Core Material package grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3.5rem' }}>
                
                {/* Structural Section */}
                <div style={{ border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--blueprint-blue)', borderBottom: '1px solid var(--glass-border)' }}>
                    STRUCTURAL MEMBERS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--glass-border)' }}>
                    {[
                      { label: "Foundation", data: getRank1(['Foundation']) },
                      { label: "Columns", data: getRank1(['Columns', 'Structural']) },
                      { label: "Beams", data: getRank1(['Beams', 'Structural']) },
                      { label: "Slabs", data: getRank1(['Flooring', 'Slabs']) }
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: 'var(--eco-black)', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>{item.data?.name || "Standard Spec"}</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '15px', minHeight: '60px' }}>{item.data?.rationale || ""}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>EST. COST:</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--eco-glow)' }}>{item.data?.cost_guidance || "-"}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SERVICE LIFE:</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{item.data?.service_life || "30"} Years</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SUSTAINABILITY:</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{item.data?.sustainability_rating || "50"} / 100</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-structural systems */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
                  {[
                    { label: "Wall Systems", data: getRank1(['Walls', 'Walling']), icon: '🧱' },
                    { label: "Roof Systems", data: getRank1(['Roof', 'Roofing']), icon: '🏠' },
                    { label: "Openings", data: getRank1(['Windows', 'Doors', 'Openings']), icon: '🪟' },
                    { label: "Finishes", data: getRank1(['Finishes', 'Finishing']), icon: '🎨' },
                    { label: "Envelope Systems", data: getRank1(['Envelope', 'Waterproofing']), icon: '🛡️' }
                  ].map((item, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{item.label}</span>
                        <span>{item.icon}</span>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>{item.data?.name || "Standard Spec"}</div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', minHeight: '60px' }}>{item.data?.rationale || ""}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>EST. COST:</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--eco-glow)' }}>{item.data?.cost_guidance || "-"}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SERVICE LIFE:</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{item.data?.service_life || "30"} Years</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>SUSTAINABILITY:</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{item.data?.sustainability_rating || "50"} / 100</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(4)}>BACK</button>
                <button className="btn-premium" style={{ flex: 2 }} onClick={() => setCurrentStep(7)}>PROCEED TO DESIGN ALTERNATIVES</button>
              </div>
            </div>
            );
          })()}

          {/* STEP 6: MATERIAL SELECTION DASHBOARD */}
          {currentStep === 7 && blueprint && (
            <MaterialSelectionDashboard
              blueprint={blueprint}
              location={setup.city}
              profile={userProfile}
              selections={materialSelections}
              setSelections={setMaterialSelections}
              onComplete={() => setCurrentStep(8)}
            />
          )}

          {/* STEP 7: 3D PREVIEW */}
{/* STEP 7: 3D PREVIEW */}
          {currentStep === 8 && blueprint && (
            <div className="glass-panel glow-border animate-fade-in" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '4px' }}>CONCEPTUALIZATION_ENGINE</div>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>3D SPATIAL PREVIEW</h2>
                </div>
                
                {/* Presentation Mode + View Mode Switchers + Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {/* Presentation Mode Row */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { label: "⚙️ ENGINEERING", val: "engineering" },
                      { label: "🏛️ ARCHITECTURAL", val: "architectural" },
                      { label: "🏠 DOLLHOUSE", val: "dollhouse" }
                    ].map((mode) => (
                      <button
                        key={mode.val}
                        onClick={() => {
                          setPresentationMode(mode.val);
                          if (mode.val === 'dollhouse') {
                            setThreeDMode('dollhouse');
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          background: presentationMode === mode.val
                            ? 'linear-gradient(135deg, var(--eco-glow), #38bdf8)'
                            : 'rgba(255,255,255,0.04)',
                          color: presentationMode === mode.val ? '#000' : '#888',
                          border: `1px solid ${presentationMode === mode.val ? 'var(--eco-glow)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.55rem', fontWeight: 900, letterSpacing: '1.5px',
                          transition: 'all 0.2s'
                        }}>
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  {/* View Mode Row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { label: "🌿 EXTERIOR VIEW", val: "exterior" },
                      { label: "🛋️ INTERIOR CUTAWAY", val: "interior" },
                      { label: "🏠 DOLLHOUSE VIEW", val: "dollhouse" }
                    ].map((mode) => (
                      <button
                        key={mode.val}
                        onClick={() => {
                          setThreeDMode(mode.val);
                          if (mode.val === 'exterior') {
                            setSelectedRoom(null);
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          background: threeDMode === mode.val ? 'var(--eco-glow)' : 'rgba(255,255,255,0.05)',
                          color: threeDMode === mode.val ? '#000' : '#fff',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.62rem', fontWeight: 900, letterSpacing: '1px'
                        }}>
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  {/* Toggle row */}
                  {threeDMode !== 'exterior' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setShowLabels(p => !p)}
                        style={{
                          padding: '5px 12px',
                          background: showLabels ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.04)',
                          color: showLabels ? 'var(--eco-glow)' : '#aaa',
                          border: `1px solid ${showLabels ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
                          borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.58rem', fontWeight: 900, letterSpacing: '1px'
                        }}>
                        {showLabels ? '🏷 LABELS ON' : '🏷 LABELS OFF'}
                      </button>
                      <button
                        onClick={() => setShowFurniture(p => !p)}
                        style={{
                          padding: '5px 12px',
                          background: showFurniture ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.04)',
                          color: showFurniture ? 'var(--eco-glow)' : '#aaa',
                          border: `1px solid ${showFurniture ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
                          borderRadius: '6px', cursor: 'pointer',
                          fontSize: '0.58rem', fontWeight: 900, letterSpacing: '1px'
                        }}>
                        {showFurniture ? '🛋 FURNITURE ON' : '🛋 FURNITURE OFF'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '2.5rem', minHeight: '600px', width: '100%' }}>
                
                <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
               
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                    <Building3DModel
                      blueprint={blueprint}
                      threeDMode={threeDMode}
                      selections={materialSelections}
                      showLabels={showLabels}
                      showFurniture={showFurniture}
                      selectedRoom={selectedRoom}
                      onSelectRoom={(room) => setSelectedRoom(room)}
                      activeFloor={activeFloor}
                      onChangeActiveFloor={(f) => {
                        setActiveFloor(f);
                        setSelectedRoom(null);
                      }}
                      presentationMode={presentationMode}
                      landscapeData={landscapeData}
                      styleAnalysis={styleAnalysis}
                    />
                  </div>
</div>
                  {/* Floor navigation strip — visible in interior / dollhouse */}
                  {threeDMode !== 'exterior' && blueprint.floors_data.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '6px' }}>
                      {blueprint.floors_data.map((_, f) => (
                        <button
                          key={f}
                          onClick={() => { setActiveFloor(f); setSelectedRoom(null); }}
                          style={{
                            padding: '5px 14px',
                            background: activeFloor === f ? 'var(--eco-glow)' : 'rgba(15,23,42,0.85)',
                            color: activeFloor === f ? '#000' : '#fff',
                            border: `1px solid ${activeFloor === f ? 'var(--eco-glow)' : 'rgba(255,255,255,0.15)'}`,
                            borderRadius: '20px', cursor: 'pointer',
                            fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px',
                            backdropFilter: 'blur(10px)', transition: 'all 0.2s'
                          }}
                        >
                          {f === 0 ? 'GROUND' : `LEVEL ${f + 1}`}
                        </button>
                      ))}
                      <button
                        onClick={() => { setActiveFloor(-1); setSelectedRoom(null); }}
                        style={{
                          padding: '5px 14px',
                          background: activeFloor === -1 ? 'var(--eco-glow)' : 'rgba(15,23,42,0.85)',
                          color: activeFloor === -1 ? '#000' : '#fff',
                          border: `1px solid ${activeFloor === -1 ? 'var(--eco-glow)' : 'rgba(255,255,255,0.15)'}`,
                          borderRadius: '20px', cursor: 'pointer',
                          fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px',
                          backdropFilter: 'blur(10px)', transition: 'all 0.2s'
                        }}
                      >
                        ALL
                      </button>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: threeDMode !== 'exterior' && blueprint.floors_data.length > 1 ? '58px' : '20px', left: '20px', zIndex: 20, pointerEvents: 'none' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '4px' }}>
                      Drag to rotate • Scroll to zoom • {
                        threeDMode === 'exterior' ? 'Orbit to explore exterior facade' :
                        threeDMode === 'dollhouse' ? 'Top-down view • Click rooms to inspect' :
                        'Click rooms to inspect interior detail'
                      }
                    </div>
                  </div>
                </div>

                {/* Info Panel + Room Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Dynamic Room Inspector */}
                  <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', border: selectedRoom ? '1px solid var(--eco-glow)' : '1px solid var(--glass-border)', transition: 'all 0.3s' }}>
                    {selectedRoom ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="tech-label" style={{ color: 'var(--eco-glow)' }}>ROOM INSPECTOR</span>
                          <button 
                            onClick={() => setSelectedRoom(null)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '0.55rem',
                              fontWeight: 800,
                              padding: '4px 8px',
                              cursor: 'pointer'
                            }}
                          >
                            RESET VIEW
                          </button>
                        </div>
                        
                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'Space Grotesk', marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                          {getRoomIcon(selectedRoom.label)} {selectedRoom.label.toUpperCase()}
                        </h3>
                        
                        <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,255,157,0.08)', border: '1px solid var(--eco-glow)', borderRadius: '20px', padding: '3px 10px' }}>
                          <span style={{ fontSize: '0.52rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '1px' }}>LEVEL</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                            {selectedRoom.floorIdx === 0 ? 'GROUND FLOOR' : `LEVEL ${selectedRoom.floorIdx + 1}`}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1.25rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Dimensions:</span>
                            <span style={{ fontWeight: 800 }}>{selectedRoom.w}m × {selectedRoom.h}m</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Floor Area:</span>
                            <span style={{ fontWeight: 800, color: 'var(--eco-glow)' }}>{selectedRoom.area} m²</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Zoning Type:</span>
                            <span style={{ fontWeight: 800 }}>{selectedRoom.type || 'HABITABLE'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', fontSize: '0.8rem' }}>
                          <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', marginBottom: '4px' }}>SURFACE MATERIALS</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Wall Finish:</span>
                            <span style={{ fontWeight: 800, color: '#fff' }}>{getWallMaterialName(materialSelections['Walls'] || '8')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Flooring:</span>
                            <span style={{ fontWeight: 800, color: '#fff' }}>{getRoomFlooringName(selectedRoom.label, materialSelections['Flooring'] || '15')}</span>
                          </div>
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '1rem', fontStyle: 'italic' }}>
                          {selectedRoom.label.toLowerCase().includes('bedroom') 
                            ? 'Private quarters automatically scaled with style-influenced bed framing, side tables, wardrobes, and desk configurations.' 
                            : selectedRoom.label.toLowerCase().includes('kitchen')
                            ? 'L-countertop prep area with built-in steel sink, burners stove, upper cabinetry and double-door refrigerator.'
                            : selectedRoom.label.toLowerCase().includes('bath')
                            ? 'Plumbing-grouped wet zone featuring ceramic toilet unit, vanity sink cabinet, and glass shower enclosure.'
                            : selectedRoom.label.toLowerCase().includes('living')
                            ? 'Primary entertainment zone including fabric-upholstered sofas, central coffee table and media console.'
                            : selectedRoom.label.toLowerCase().includes('dining')
                            ? 'Dedicated dining area layout featuring styled dining table top and chairs.'
                            : 'Zoned area with automatic architectural layout and furniture placements.'}
                        </p>

                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                          <span className="tech-label" style={{ display: 'block', marginBottom: '8px' }}>FURNITURE INVENTORY</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                            {getFurnitureList(selectedRoom.label, selectedRoom.w, selectedRoom.h).map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--eco-glow)' }}>•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="tech-label">3D INTERACTIVE SPACE</span>
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,255,157,0.08)', border: '1px solid var(--eco-glow)', borderRadius: '20px', padding: '4px 12px' }}>
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px' }}>STYLE</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{blueprint.style_pref || 'Modern'}</span>
                          </div>
                          {threeDMode !== 'exterior' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56,189,248,0.08)', border: '1px solid var(--blueprint-blue)', borderRadius: '20px', padding: '4px 12px' }}>
                              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '2px' }}>FLOOR</span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                                {activeFloor === -1 ? 'ALL' : activeFloor === 0 ? 'GROUND' : `LEVEL ${activeFloor + 1}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
                          {threeDMode === 'exterior'
                            ? 'Explore the fully styled exterior with custom roof structures, door designs, window profiles, and landscaping.'
                            : threeDMode === 'dollhouse'
                            ? 'Observe the top-down cutaway showing all floors and spatial layouts. Select any room to inspect.'
                            : 'Select any room from the 3D model or legend list below to focus, pan, and inspect furniture placements.'}
                        </p>
                        
                        {/* Quick floor switcher in sidebar — only for multi-floor buildings */}
                        {blueprint.floors_data.length > 1 && threeDMode !== 'exterior' && (
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {blueprint.floors_data.map((_, f) => (
                              <button
                                key={f}
                                onClick={() => { setActiveFloor(f); setSelectedRoom(null); }}
                                style={{
                                  padding: '4px 10px',
                                  background: activeFloor === f ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.04)',
                                  color: activeFloor === f ? 'var(--eco-glow)' : '#888',
                                  border: `1px solid ${activeFloor === f ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
                                  borderRadius: '6px', cursor: 'pointer',
                                  fontSize: '0.55rem', fontWeight: 800, letterSpacing: '1px',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {f === 0 ? 'GND' : `L${f + 1}`}
                              </button>
                            ))}
                            <button
                              onClick={() => { setActiveFloor(-1); setSelectedRoom(null); }}
                              style={{
                                padding: '4px 10px',
                                background: activeFloor === -1 ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.04)',
                                color: activeFloor === -1 ? 'var(--eco-glow)' : '#888',
                                border: `1px solid ${activeFloor === -1 ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
                                borderRadius: '6px', cursor: 'pointer',
                                fontSize: '0.55rem', fontWeight: 800, letterSpacing: '1px',
                                transition: 'all 0.2s'
                              }}
                            >
                              ALL
                            </button>
                          </div>
                        )}

                        <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.72rem' }}>
                          <div style={{ color: 'var(--eco-glow)', fontWeight: 800, marginBottom: '6px', letterSpacing: '1px' }}>ROOM INSPECTOR INSTRUCTIONS</div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {threeDMode === 'exterior' 
                              ? 'Switch to Interior Cutaway or Dollhouse View, then click any room to trigger camera glides and display detailed space audits.'
                              : 'Click any room in the 3D view or legend below to center the camera and view spatial details & furniture inventory.'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Room Legend */}
                  <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="tech-label">ROOM IDENTIFICATION LEGEND</span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                        {activeFloor === -1 ? `${blueprint.floors_data.flatMap(f => f.rooms).length} ZONES` : `FLOOR ${activeFloor === 0 ? 'GND' : activeFloor + 1} · ${blueprint.floors_data[activeFloor]?.rooms?.length || 0} ZONES`}
                      </span>
                    </div>
                    <div className="legend-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                      {blueprint.floors_data.flatMap((floor, fIdx) =>
                        floor.rooms
                          .filter(() => activeFloor === -1 || fIdx === activeFloor)
                          .map((room, rIdx) => {
                            const l = room.label.toLowerCase();
                            let floorColor = '#C8C0B8';
                            if (l.includes('bedroom') || l.includes('master')) floorColor = '#D4A574';
                            else if (l.includes('bath') || l.includes('restroom')) floorColor = '#B8D4E3';
                            else if (l.includes('kitchen') || l.includes('pantry')) floorColor = '#D9CFC1';
                            else if (l.includes('living') || l.includes('lobby')) floorColor = '#C4A882';
                            else if (l.includes('dining')) floorColor = '#9C7E5C';
                            else if (l.includes('office') || l.includes('study') || l.includes('meeting')) floorColor = '#B8A894';
                            else floorColor = '#A8A8A0';
                            
                            const isRoomSelected = selectedRoom?.id === room.id;
                            return (
                              <div 
                                key={`${fIdx}-${rIdx}`}
                                onClick={() => {
                                  setSelectedRoom({ ...room, floorIdx: fIdx });
                                  if (threeDMode === 'exterior') setThreeDMode('interior');
                                  if (activeFloor !== fIdx) setActiveFloor(fIdx);
                                }}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '10px', 
                                  padding: '8px 10px', 
                                  borderRadius: '8px', 
                                  background: isRoomSelected ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${isRoomSelected ? 'var(--eco-glow)' : 'transparent'}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: floorColor, flexShrink: 0 }}></div>
                                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, flex: 1 }}>{getRoomIcon(room.label)} {room.label}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                  {blueprint.floors_data.length > 1 && activeFloor === -1 && (
                                    <span style={{ fontSize: '0.5rem', color: 'var(--blueprint-blue)', fontWeight: 700 }}>
                                      {fIdx === 0 ? 'GND' : `L${fIdx + 1}`}
                                    </span>
                                  )}
                                  <span style={{ fontSize: '0.65rem', color: isRoomSelected ? 'var(--eco-glow)' : 'var(--text-dim)', fontWeight: isRoomSelected ? 700 : 500 }}>
                                    {isRoomSelected ? 'ACTIVE' : `${room.w}×${room.h}m`}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto' }}>
                    <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(7)}>
                      BACK
                    </button>
                    <button className="btn-premium" style={{ flex: 2 }} onClick={() => setCurrentStep(9)}>
                      COMPILE ENGINEERING REPORT
                    </button>
                  </div>
                </div>

              </div>
            
          )}


          {/* STEP 8: FINAL ENGINEERING REPORT */}
          {currentStep === 9 && blueprint && materialPackage && (() => {
            const recs = materialPackage.recommended_package || {};
            
            const budgetMap = { Low: 'ECONOMY TIER', Medium: 'MID-RANGE TIER', High: 'PREMIUM TIER' };
            const budgetTier = budgetMap[questionnaire.maintenance_pref] || 'MID-RANGE TIER';
            console.log("Recompiling budgetTier step 9...", budgetTier);
            
            const allComponents = [
              { key: 'foundation', label: 'Foundation', icon: '⚓', data: recs.foundation || {}, category: 'Structural' },
              { key: 'structural', label: 'Structural System', icon: '🏗️', data: recs.structural || {}, category: 'Structural' },
              { key: 'concrete', label: 'Concrete', icon: '🧱', data: recs.concrete || {}, category: 'Structural' },
              { key: 'walls', label: 'Wall Systems', icon: '🧱', data: recs.walls || {}, category: 'Envelope' },
              { key: 'roofing', label: 'Roofing', icon: '🏠', data: recs.roofing || {}, category: 'Envelope' },
              { key: 'doors', label: 'Doors', icon: '🚪', data: recs.doors || {}, category: 'Openings' },
              { key: 'windows', label: 'Windows / Glazing', icon: '🪟', data: recs.windows || {}, category: 'Openings' },
              { key: 'flooring', label: 'Flooring', icon: '🟫', data: recs.flooring || {}, category: 'Interior' },
              { key: 'ceiling', label: 'Ceiling', icon: '⬛', data: recs.ceiling || {}, category: 'Interior' },
              { key: 'finishes', label: 'Surface Finishes', icon: '🎨', data: recs.finishes || {}, category: 'Interior' },
              { key: 'waterproofing', label: 'Waterproofing / Sealant', icon: '🛡️', data: recs.waterproofing || {}, category: 'Protection' }
            ];
            const alternativesData = [
              { label: 'ECO-PREMIUM ALTERNATIVE', color: '#00ff9d', bg: 'rgba(0,255,157,0.05)', border: 'rgba(0,255,157,0.3)', items: materialPackage.design_alternatives?.eco_premium || {} },
              { label: 'CLIMATE-RESILIENT ALTERNATIVE', color: '#38bdf8', bg: 'rgba(56,189,248,0.05)', border: 'rgba(56,189,248,0.3)', items: materialPackage.design_alternatives?.climate_resilient || {} }
            ];
            const confidence = materialPackage.display_confidence !== undefined ? materialPackage.display_confidence : 'N/A';
            const metrics = materialPackage.metrics || {};
            const average_eng_score = metrics.project_eng_score !== undefined ? metrics.project_eng_score : null;
            const average_ml_score = metrics.project_ml_score !== undefined ? metrics.project_ml_score : null;
            const average_hybrid_score = metrics.project_hybrid_score !== undefined ? metrics.project_hybrid_score : null;

            const sPref = blueprint.style_pref || questionnaire.style_pref || 'Modern';
            const styleInfo = {
              theme: sPref.toUpperCase(),
              exterior: `The exterior facade features a ${sPref} architectural profile, optimized for the selected structural system and local climate context.`,
              interior: `Interior spaces follow a ${sPref} aesthetic, with coordinated furniture placements, lighting strategies, and surface finishes.`
            };

            return (
            <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>

              {/* ── REPORT HEADER ── */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,255,157,0.08) 0%, rgba(56,189,248,0.06) 100%)', border: '1px solid rgba(0,255,157,0.2)', borderRadius: '24px', padding: '3rem', marginBottom: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--eco-glow), var(--blueprint-blue), var(--eco-glow))' }} />
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '8px', marginBottom: '12px' }}>GREENCONSTRUCTAI · ENGINEERING INTELLIGENCE PLATFORM</div>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: '0 0 8px 0' }}>PRELIMINARY MATERIAL FEASIBILITY REPORT</h1>
                <div style={{ fontSize: '0.7rem', color: 'var(--blueprint-blue)', letterSpacing: '4px', fontWeight: 900 }}>SRI LANKA ENGINEERING STANDARDS AUDIT // CONCEPT LEVEL // REF: {setup.city.toUpperCase()}-{setup.building_type.toUpperCase().slice(0,3)}-{setup.num_floors}FL</div>
                
                {(!materialPackage.climate_profile || !materialPackage.climate_profile.type) && (
                  <div style={{ marginTop: '1rem', color: 'var(--warn-amber)', fontSize: '0.8rem', fontWeight: 700 }}>⚠️ Climate data unavailable. Falling back to default archetype.</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '2px' }}>ENG VALIDATION</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{average_eng_score !== null ? average_eng_score + '%' : 'Not Applicable'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '2px' }}>ML SUITABILITY</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--blueprint-blue)', marginTop: '4px' }}>{average_ml_score !== null ? average_ml_score + '%' : 'Not Applicable'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '2px' }}>HYBRID SCORE</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--eco-glow)', marginTop: '4px' }}>{average_hybrid_score !== null ? average_hybrid_score + '%' : 'Not Applicable'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '2px' }}>CONFIDENCE</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{confidence !== 'N/A' ? confidence + '%' : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 1+2: PROJECT + CLIMATE ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§1 PROJECT PARAMETERS</div>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Location', setup.city],
                        ['Typology', setup.building_type],
                        ['Height Index', `${setup.num_floors} Floor(s)`],
                        ['Footprint', `${blueprint.total_area || blueprint.footprint?.w * blueprint.footprint?.h || 'Not Applicable'} m²`],
                        ['Rooms', `${blueprint.floors_data?.[0]?.rooms?.length || 'Not Applicable'} Zones`]
                      ].map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '7px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{k}</td>
                          <td style={{ padding: '7px 0', color: '#fff', fontWeight: 700, textAlign: 'right' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§2 GEOCLIMATIC ARCHETYPE</div>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Climate Zone', materialPackage?.climate_profile?.type || 'Intermediate Tropical'],
                        ['Relative Humidity', materialPackage?.climate_profile?.humidity || 'High'],
                        ['Annual Rainfall', materialPackage?.climate_profile?.rainfall || 'Moderate'],
                        ['Temperature Band', materialPackage?.climate_profile?.temperature || '25-32°C'],
                        ['Salinity Exposure', materialPackage?.climate_profile?.salinity || 'Low']
                      ].map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '7px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{k}</td>
                          <td style={{ padding: '7px 0', color: '#fff', fontWeight: 700, textAlign: 'right' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── SECTION 3: USER PREFERENCES + BUDGET TIER ── */}
              <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§3 USER PREFERENCES & DESIGN INTENT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(0,255,157,0.06)', border: '1px solid rgba(0,255,157,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🏛️</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>ARCHITECTURAL STYLE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--eco-glow)' }}>{blueprint.style_pref || questionnaire.style_pref}</div>
                  </div>
                  <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>💰</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>BUDGET TIER</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--blueprint-blue)' }}>{budgetTier}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🌿</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>SUSTAINABILITY</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{questionnaire.sustainability_pref || 'Balanced'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>⏱️</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>MAINTENANCE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{questionnaire.maintenance_pref || 'Standard'}</div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: CORE REQUIREMENTS ── */}
              <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§3 CORE REQUIREMENTS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  {(() => {
                    const getOccValue = (val, suffix) => val !== undefined && val !== null ? `${val} ${suffix}` : "Not Specified";
                    const occupancyMap = {
                      'Residential': ['Family Size', getOccValue(questionnaire.family_size, 'Occupants')],
                      'Commercial': ['Customer Capacity', getOccValue(questionnaire.customer_capacity, 'Persons')],
                      'Industrial': ['Workforce Size', getOccValue(questionnaire.workforce_size, 'Workers')],
                      'Educational': ['Student Capacity', questionnaire.student_capacity !== undefined && questionnaire.student_capacity !== null ? `${questionnaire.student_capacity} Students` : getOccValue(questionnaire.student_count, 'Students')],
                      'Healthcare': ['Bed Count', getOccValue(questionnaire.bed_count, 'Beds')],
                      'Hotel': ['Room Count', getOccValue(questionnaire.room_count, 'Rooms')]
                    };
                    return [
                      occupancyMap[setup.building_type] || ['Occupancy', 'Not Specified'],
                      ['Budget Tier', questionnaire.budget_tier || "Not Specified"],
                      ['Maintenance Strategy', questionnaire.maintenance_pref || "Not Specified"]
                    ].map((item, i) => (
                      <div key={i} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>{item[0].toUpperCase()}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{item[1]}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* ── SECTION 4: FULL MATERIAL SPECIFICATIONS ── */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§4 RECOMMENDED MATERIAL SPECIFICATIONS — FULL BREAKDOWN</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 90px 90px 90px 90px 90px', background: 'rgba(255,255,255,0.04)', padding: '10px 16px', fontSize: '0.58rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '1px', gap: '8px' }}>
                    <span>COMPONENT</span>
                    <span>MATERIAL & RATIONALE</span>
                    <span style={{ textAlign: 'center' }}>ENG SCORE</span>
                    <span style={{ textAlign: 'center' }}>ML SCORE</span>
                    <span style={{ textAlign: 'center' }}>FINAL</span>
                    <span style={{ textAlign: 'center' }}>SVC LIFE</span>
                    <span style={{ textAlign: 'center' }}>CO₂e</span>
                    <span style={{ textAlign: 'center' }}>EST. COST</span>
                  </div>
                  {allComponents.map((comp, idx) => {
                    const d = comp.data || {};
                    const isMissing = Object.keys(d).length === 0;
                    const finalScore = d.score !== undefined && d.score !== null ? d.score : 'N/A';
                    const engScore = d.eng_score !== undefined && d.eng_score !== null ? d.eng_score : 'N/A';
                    const mlScore = d.ml_score !== undefined && d.ml_score !== null ? d.ml_score : 'N/A';
                    const svcLife = d.service_life !== undefined && d.service_life !== null ? d.service_life : 'N/A';
                    const carbon = d.embodied_carbon !== undefined && d.embodied_carbon !== null ? d.embodied_carbon : 'N/A';
                    const susRating = d.sustainability_rating ?? 50;
                    const vetoed = d.vetoed || false;
                    const scoreColor = vetoed ? '#ef4444' : (finalScore === 'N/A' ? 'var(--text-dim)' : (finalScore >= 80 ? 'var(--eco-glow)' : finalScore >= 60 ? 'var(--warn-amber)' : '#ef4444'));
                    
                    return (
                      <div key={comp.key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 90px 90px 90px 90px 90px', padding: '14px 16px', fontSize: '0.8rem', borderBottom: idx < allComponents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', gap: '8px', alignItems: 'center', background: idx % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent', opacity: isMissing ? 0.6 : 1 }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '1px' }}>{comp.icon} {comp.category.toUpperCase()}</div>
                          <div style={{ fontWeight: 800, color: '#fff', marginTop: '2px' }}>{comp.label}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: vetoed ? '#ef4444' : 'var(--eco-glow)', marginBottom: '3px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {d.name || 'Not Specified'}
                            {vetoed && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', letterSpacing: '1px' }}>VETOED</span>}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: vetoed ? '#fca5a5' : 'var(--text-secondary)', lineHeight: 1.4 }}>{d.veto_reason || d.rationale || 'Not Specified'}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--blueprint-blue)' }}>{engScore}</div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800 }}>/ 100</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 900, color: '#a78bfa' }}>{mlScore}</div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800 }}>/ 100</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: scoreColor }}>{finalScore}</div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800 }}>HYBRID</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{svcLife}</div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800 }}>YRS</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: susRating >= 65 ? 'var(--eco-glow)' : 'var(--warn-amber)' }}>{carbon}</div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: 800 }}>kgCO₂/kg</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--eco-glow)' }}>{d.cost_guidance !== undefined && d.cost_guidance !== null ? d.cost_guidance : 'N/A'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── SECTION 5: SUSTAINABILITY METRICS SUMMARY ── */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§5 AGGREGATE SUSTAINABILITY METRICS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {(() => {
                    const avgSus = metrics.average_sustainability !== undefined && metrics.average_sustainability !== null ? metrics.average_sustainability : 'N/A';
                    const avgLife = metrics.average_service_life !== undefined && metrics.average_service_life !== null ? metrics.average_service_life : 'N/A';
                    const avgCarbon = metrics.average_carbon !== undefined && metrics.average_carbon !== null ? metrics.average_carbon : 'N/A';
                    const avgScore = metrics.overall_hybrid_score !== undefined && metrics.overall_hybrid_score !== null ? metrics.overall_hybrid_score : 'N/A';
                    return [
                      { label: 'AVG. SUSTAINABILITY RATING', value: avgSus !== 'N/A' ? `${avgSus}/100` : 'N/A', icon: '🌱', color: avgSus !== 'N/A' && avgSus >= 65 ? 'var(--eco-glow)' : 'var(--warn-amber)' },
                      { label: 'AVG. SERVICE LIFE', value: avgLife !== 'N/A' ? `${avgLife} Years` : 'N/A', icon: '⏱️', color: '#fff' },
                      { label: 'AVG. EMBODIED CARBON', value: avgCarbon !== 'N/A' ? `${avgCarbon} kgCO₂/kg` : 'N/A', icon: '🌍', color: avgCarbon !== 'N/A' && parseFloat(avgCarbon) < 0.5 ? 'var(--eco-glow)' : 'var(--warn-amber)' },
                      { label: 'AVG. HYBRID SCORE', value: avgScore !== 'N/A' ? `${avgScore}/100` : 'N/A', icon: '🧠', color: avgScore !== 'N/A' && avgScore >= 75 ? 'var(--eco-glow)' : 'var(--blueprint-blue)' }
                    ].map((m, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{m.icon}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px', marginTop: '6px' }}>{m.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* ── SECTION 6: DESIGN PACKAGE ALTERNATIVES ── */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§6 DESIGN PACKAGE ALTERNATIVES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {/* Alternative 1 — Baseline Recommendation */}
                  <div style={{ background: 'rgba(0,255,157,0.05)', border: '1px solid rgba(0,255,157,0.25)', borderRadius: '16px', padding: '1.75rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--eco-glow)', color: '#000', fontSize: '0.55rem', fontWeight: 900, padding: '3px 10px', borderRadius: '20px', letterSpacing: '2px' }}>ALTERNATIVE #1</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--eco-glow)', fontWeight: 900, letterSpacing: '2px', marginBottom: '1rem', marginTop: '6px' }}>BASELINE RECOMMENDATION</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { icon: '⚓', label: 'Foundation', val: allComponents.find(c => c.key === 'foundation')?.data?.name || 'N/A' },
                        { icon: '🧱', label: 'Walls', val: allComponents.find(c => c.key === 'walls')?.data?.name || 'N/A' },
                        { icon: '🏠', label: 'Roofing', val: allComponents.find(c => c.key === 'roofing')?.data?.name || 'N/A' },
                        { icon: '🎨', label: 'Finishes', val: allComponents.find(c => c.key === 'finishes')?.data?.name || 'N/A' },
                        { icon: '🛡️', label: 'Waterproof', val: allComponents.find(c => c.key === 'waterproofing')?.data?.name || 'N/A' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', minWidth: '80px' }}>{item.icon} {item.label}:</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', textAlign: 'right', flex: 1 }}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,255,157,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Suitability Score:</span>
                        <span style={{ color: 'var(--eco-glow)', fontWeight: 900 }}>{materialPackage.metrics?.project_hybrid_score || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                  {/* Alternative 2 — Eco Premium */}
                  <div style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '16px', padding: '1.75rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--blueprint-blue)', color: '#000', fontSize: '0.55rem', fontWeight: 900, padding: '3px 10px', borderRadius: '20px', letterSpacing: '2px' }}>ALTERNATIVE #2</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--blueprint-blue)', fontWeight: 900, letterSpacing: '2px', marginBottom: '1rem', marginTop: '6px' }}>ECO-PREMIUM PACKAGE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { icon: '⚓', label: 'Foundation', name: materialPackage.design_alternatives?.eco_premium?.foundation?.name || 'N/A' },
                        { icon: '🧱', label: 'Walls', name: materialPackage.design_alternatives?.eco_premium?.walls?.name || 'N/A' },
                        { icon: '🏠', label: 'Roofing', name: materialPackage.design_alternatives?.eco_premium?.roof?.name || 'N/A' },
                        { icon: '🎨', label: 'Finishes', name: materialPackage.design_alternatives?.eco_premium?.finishes?.name || 'N/A' },
                        { icon: '🌿', label: 'Orientation', name: 'Passive Solar + Ventilation' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', minWidth: '80px' }}>{item.icon} {item.label}:</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', textAlign: 'right', flex: 1 }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(56,189,248,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Suitability Score:</span>
                        <span style={{ color: 'var(--blueprint-blue)', fontWeight: 900 }}>{materialPackage.design_alternatives?.eco_premium?.hybrid_score || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                  {/* Alternative 3 — Climate Resilient */}
                  <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px', padding: '1.75rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--warn-amber)', color: '#000', fontSize: '0.55rem', fontWeight: 900, padding: '3px 10px', borderRadius: '20px', letterSpacing: '2px' }}>ALTERNATIVE #3</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--warn-amber)', fontWeight: 900, letterSpacing: '2px', marginBottom: '1rem', marginTop: '6px' }}>CLIMATE-RESILIENT PACKAGE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { icon: '⚓', label: 'Foundation', name: materialPackage.design_alternatives?.climate_resilient?.foundation?.name || 'N/A' },
                        { icon: '🧱', label: 'Walls', name: materialPackage.design_alternatives?.climate_resilient?.walls?.name || 'N/A' },
                        { icon: '🏠', label: 'Roofing', name: materialPackage.design_alternatives?.climate_resilient?.roof?.name || 'N/A' },
                        { icon: '🎨', label: 'Finishes', name: materialPackage.design_alternatives?.climate_resilient?.finishes?.name || 'N/A' },
                        { icon: '🛡️', label: 'Waterproof', name: materialPackage.design_alternatives?.climate_resilient?.envelope?.name || 'N/A' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', minWidth: '80px' }}>{item.icon} {item.label}:</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', textAlign: 'right', flex: 1 }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(245,158,11,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Suitability Score:</span>
                        <span style={{ color: 'var(--warn-amber)', fontWeight: 900 }}>{materialPackage.design_alternatives?.climate_resilient?.hybrid_score || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 7: 3D VISUALIZATION SUMMARY ── */}
              <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.5rem' }}>§7 3D VISUALIZATION SUMMARY — {(blueprint.style_pref || 'Modern').toUpperCase()} THEME</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(0,255,157,0.04)', border: '1px solid rgba(0,255,157,0.15)', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🌿</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '2px', marginBottom: '8px' }}>EXTERIOR APPEARANCE</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{styleInfo.exterior}</p>
                  </div>
                  <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🛋️</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '2px', marginBottom: '8px' }}>INTERIOR STYLE</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{styleInfo.interior}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏗️</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#fff', letterSpacing: '2px', marginBottom: '8px' }}>SELECTED MATERIALS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { icon: '⚓', label: 'Structure', val: allComponents.find(c => c.key === 'foundation')?.data?.name?.split(' ').slice(0,3).join(' ') || 'N/A' },
                        { icon: '🧱', label: 'Walls', val: allComponents.find(c => c.key === 'walls')?.data?.name?.split(' ').slice(0,3).join(' ') || 'N/A' },
                        { icon: '🏠', label: 'Roof', val: allComponents.find(c => c.key === 'roofing')?.data?.name?.split(' ').slice(0,3).join(' ') || 'N/A' },
                        { icon: '🟫', label: 'Floor', val: allComponents.find(c => c.key === 'flooring')?.data?.name?.split(' ').slice(0,3).join(' ') || 'N/A' }
                      ].map(({ icon, label, val }) => (
                        <div key={label} style={{ display: 'flex', gap: '6px', fontSize: '0.72rem' }}>
                          <span>{icon}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
                          <span style={{ color: '#fff', fontWeight: 700, flex: 1 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 8: FINAL SCORE BREAKDOWN + METHODOLOGY ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§8 FINAL SCORE BREAKDOWN</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Engineering Validation Score (70%)', val: average_eng_score !== null ? average_eng_score : 'N/A', color: 'var(--eco-glow)', source: 'mcdm_engine.py' },
                      { label: 'ML Suitability Score (30%)', val: average_ml_score !== null ? average_ml_score : 'N/A', color: '#a78bfa', source: 'greenconstruct_model.pkl' },
                      { label: 'Hybrid Final Score', val: average_hybrid_score !== null ? average_hybrid_score : 'N/A', color: 'var(--blueprint-blue)', source: 'Hybrid 70/30 Engine' },
                      { label: 'Confidence', val: confidence !== null && confidence !== 'N/A' ? confidence : 'N/A', color: '#fff', source: 'Backend Confidence' }
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: i < 3 ? '1rem' : 0 }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{s.label}</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px', marginTop: '2px' }}>SOURCE: {s.source}</div>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: s.color }}>{s.val}{s.val !== 'N/A' && s.label !== 'Confidence' ? '/100' : s.val !== 'N/A' ? '%' : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.25)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§9 STRUCTURAL LOAD & QUANTITY ESTIMATES</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {Object.entries(materialPackage.estimated_quantities || {}).map(([key, val], i) => (
                      <div key={key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>{key.toUpperCase()}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── SECTION 10: API DIAGNOSTICS & SYSTEM METADATA ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§10 ENGINE METADATA</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { l: 'App Version', v: materialPackage.api_metadata?.version || 'N/A' },
                      { l: 'Environment', v: materialPackage.api_metadata?.environment || 'N/A' },
                      { l: 'ML Model', v: materialPackage.api_metadata?.ml_model_version || 'N/A' },
                      { l: 'Data Registry', v: materialPackage.api_metadata?.dataset_version || 'N/A' },
                      { l: 'Computation Time', v: `${materialPackage.api_metadata?.latency_ms || 0} ms` }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>{item.l}:</span>
                        <span style={{ color: '#fff', fontWeight: 700 }}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '1.25rem' }}>§11 RAW COMPONENT REASONING</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '10px' }}>
                    {materialPackage.reasoning?.length > 0 ? materialPackage.reasoning.map((r, i) => (
                      <div key={i} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', borderLeft: '2px solid var(--eco-glow)' }}>
                        {r}
                      </div>
                    )) : (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>No internal reasoning data returned.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 12: AUDIT LOG TRANSPARENCY ── */}
              {(() => {
                const auditLogs = materialPackage.audit_log || [];
                if (auditLogs.length === 0) return null;
                return (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px', marginBottom: '0.5rem' }}>§12 RECOMMENDATION AUDIT TRANSPARENCY LOG</div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                      Full decision audit trail — dataset source, dataset row, ML model score, engineering score, hybrid score, and ranking for every recommendation generated this session.
                    </p>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px 60px 70px 55px', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', fontSize: '0.5rem', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: '1px', gap: '6px' }}>
                        <span>CATEGORY</span>
                        <span>ITEM / SOURCE</span>
                        <span style={{ textAlign:'center' }}>ML</span>
                        <span style={{ textAlign:'center' }}>ENG</span>
                        <span style={{ textAlign:'center' }}>HYBRID</span>
                        <span style={{ textAlign:'center' }}>RANK</span>
                      </div>
                      {auditLogs.slice(0, 30).map((log, i) => {
                        const hybridColor = log.hybrid_score >= 75 ? 'var(--eco-glow)' : log.hybrid_score >= 55 ? 'var(--warn-amber)' : '#ef4444';
                        return (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px 60px 70px 55px', padding: '9px 12px', fontSize: '0.72rem', borderBottom: i < auditLogs.slice(0,30).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', gap: '6px', alignItems: 'center', background: i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.3 }}>{log.category}</div>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}>{log.item_name}</div>
                              <div style={{ color: 'var(--text-dim)', fontSize: '0.55rem' }}>src: {log.dataset_source} · row: {log.dataset_row}</div>
                            </div>
                            <div style={{ textAlign: 'center', color: '#a78bfa', fontWeight: 800 }}>{log.ml_score}</div>
                            <div style={{ textAlign: 'center', color: 'var(--eco-glow)', fontWeight: 800 }}>{log.engineering_score}</div>
                            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.8rem', color: hybridColor }}>{log.hybrid_score}</div>
                            <div style={{ textAlign: 'center', color: '#fff', fontWeight: 900 }}>#{log.ranking}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── REPORT FOOTER ── */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(8)}>
                  BACK
                </button>
                <span>Report Date: {new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>Standard: SLS 1226:2023 / SLS 735:2017</span>
              </div>

              {/* ── ACTION BUTTONS ── */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="glass-panel" style={{ flex: 1, padding: '1rem', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => setCurrentStep(8)}>
                  BACK
                </button>
                <button className="btn-premium" style={{ flex: 2 }} onClick={() => window.print()}>
                  🖨️ PRINT ENGINEERING REPORT
                </button>
                <Link href="/" className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#fff', fontWeight: 800, border: '1px solid var(--blueprint-blue)' }}>
                  EXIT WORKSPACE
                </Link>
              </div>

            </div>
            );
          })()}

        </section>

      </main>
      
      <Footer />
    </div>
  );
}
