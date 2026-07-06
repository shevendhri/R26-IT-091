"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useMaterial } from '@/context/MaterialContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import Building3DModel from '@/components/Building3DModel';

/* ─────────────────────── Shared inline style tokens ─────────────────────── */
/* ══════════════════════════════════════════════════════════════ */
/*  Component                                                     */
/* ══════════════════════════════════════════════════════════════ */
function Model3DPage() {
  const { blueprint: contextBlueprint, reportData, buildingInfo } = useMaterial();
  const router = useRouter();
  // Resolve blueprint from context state OR from reportData (persisted in localStorage)
  const blueprint = contextBlueprint || reportData?.blueprint || null;

  // Mounted guard to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Package selector state
  const [selectedPackageKey, setSelectedPackageKey] = useState('Sustainable Package');

  // Set default package once report data is loaded
  useEffect(() => {
    if (reportData?.packages) {
      const keys = Object.keys(reportData.packages);
      if (keys.length > 0) {
        const recommendedKey = keys.find(k => k.toLowerCase().includes('sustainable')) || keys[0];
        setSelectedPackageKey(recommendedKey);
      }
    }
  }, [reportData]);

  // 3D View and Presentation States
  const [activeTab, setActiveTab] = useState('architectural');

  const presentationMode = useMemo(() => {
    if (activeTab === 'architectural') return 'architectural';
    if (activeTab === 'engineering') return 'engineering';
    if (activeTab === 'material') return 'material';
    if (activeTab === 'cutaway') return 'dollhouse';
    return 'architectural';
  }, [activeTab]);

  const threeDMode = useMemo(() => {
    if (activeTab === 'cutaway') return 'interior';
    return 'exterior';
  }, [activeTab]);

  const [showLabels, setShowLabels] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [activeFloor, setActiveFloor] = useState(-1);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Blueprint fallback UI will be rendered conditionally in JSX

  // Derive active package selections from state
  const pkg = useMemo(() => {
    if (reportData?.packages && reportData.packages[selectedPackageKey]) {
      const p = reportData.packages[selectedPackageKey];
      const converted = {};
      if (p.materials && Array.isArray(p.materials)) {
        p.materials.forEach(m => {
          const comp = String(m.component).toLowerCase();
          let key = comp;
          if (comp.includes('wall')) key = 'walls';
          if (comp.includes('roof')) key = 'roofing';
          if (comp.includes('floor')) key = 'flooring';
          if (comp.includes('door')) key = 'doors';
          if (comp.includes('window')) key = 'windows';
          converted[key] = { id: m.id, name: m.name };
        });
      }
      return converted;
    }
    return reportData?.recommended_package || {};
  }, [reportData, selectedPackageKey]);

  const climate = reportData?.climate_profile || {};

  const city = climate?.city || buildingInfo?.location || 'Colombo';
  const rain = climate?.rainfall || '2400 mm';
  const humidity = climate?.humidity || '80%';
  const salinity = climate?.salinity || 'High';
  const bType = buildingInfo?.building_type || 'Residential';
  const floors = buildingInfo?.floor_count || blueprint?.num_floors || 2;
  const area = buildingInfo?.total_area || (blueprint?.footprint?.w * blueprint?.footprint?.h * floors) || 170;
  const struct = buildingInfo?.structural_system || 'Concrete Frame';
  const climateZone = climate?.type || 'Moderate Coastal Humid';
  const floorsData = blueprint?.floors_data || [];

  // Dynamic Engineering Insights Based on Parameters
  const insights = useMemo(() => {
    const list = [];
    const rainfallVal = parseInt(rain) || 0;
    const humidityVal = parseInt(humidity) || 0;
    const loc = city.toLowerCase();

    if (rainfallVal > 2000 || ['colombo', 'galle', 'kandy'].some(c => loc.includes(c))) {
      list.push("Extended eaves and rainwater drainage pipes integrated for heavy monsoon precipitation.");
    }
    if (humidityVal > 75 || ['colombo', 'galle'].some(c => loc.includes(c))) {
      list.push("Building envelope textures calibrated to handle high tropical humidity exposure.");
    }
    if (salinity === 'High' || ['galle', 'colombo', 'jaffna'].some(c => loc.includes(c))) {
      list.push("Corrosion-resistant finishes applied to exterior window framings and structural joint bindings.");
    }
    if (loc.includes('jaffna') || loc.includes('dry')) {
      list.push("Window overhang louvers and solar shading details rendered on windows to minimize solar heat gains.");
    }
    if (loc.includes('kandy') || loc.includes('nuwara')) {
      list.push("Pitched roof structure selected to optimize water runoff and snow load support in cooler regions.");
    }
    if (struct.includes('Steel') || struct.includes('Composite')) {
      list.push("Exposed structural steel and perimeter lateral bracing visualized for wind loads compliance.");
    } else {
      list.push("Skeletal concrete framing visible along core structural grid junctions.");
    }
    return list;
  }, [city, rain, humidity, salinity, struct]);

  // Bottom recommended materials mapping
  const highlightCategories = [
    { key: 'structural', label: 'Structure', icon: '🦴', defaultMat: 'TMT High-Yield Rebar' },
    { key: 'concrete',   label: 'Concrete',  icon: '🧱', defaultMat: 'Marine-Grade Concrete Mix' },
    { key: 'roofing',    label: 'Roof',      icon: '🏛️', defaultMat: 'Portuguese Clay Tile' },
    { key: 'windows',    label: 'Windows',   icon: '🪟', defaultMat: 'uPVC Window Frame' },
    { key: 'doors',      label: 'Doors',     icon: '🚪', defaultMat: 'Solid Teak Wood Door' },
  ];

  // Resolve material selections for the sidebar "Active Materials" display
  const resolvedSelections = useMemo(() => ({
    Walls:    pkg?.walls?.id    || pkg?.walls?.name    || 'Plaster',
    Roof:     pkg?.roofing?.id  || pkg?.roofing?.name  || 'Concrete Roof',
    Flooring: pkg?.flooring?.id || pkg?.flooring?.name || 'Terrazzo',
    Doors:    pkg?.doors?.id    || pkg?.doors?.name    || 'Teak Door',
    Windows:  pkg?.windows?.id  || pkg?.windows?.name  || 'Aluminium Frame',
  }), [pkg]);

  // Render fallback if blueprint is missing
  const blueprintMissing = !blueprint || !blueprint.floors_data;

  // Render based on mounted state
  useEffect(() => {
    if (blueprintMissing) {
      router.push('/materials/form');
    }
  }, [blueprintMissing]);

  /* ── derived helpers ── */
  const tabs = [
    { label: 'Architectural', val: 'architectural' },
    { label: 'Engineering',   val: 'engineering'   },
    { label: 'Material',      val: 'material'      },
    { label: 'Cutaway',       val: 'cutaway'       },
  ];

  const paramCards = [
    { label: 'Location',      value: city,         color: '#c084fc' },
    { label: 'Building Type', value: bType,         color: '#60a5fa' },
    { label: 'Floors',        value: floors,        color: '#34d399' },
    { label: 'Total Area',    value: `${area} m²`,  color: '#f59e0b' },
    { label: 'Structure',     value: struct,        color: '#f97316' },
    { label: 'Climate Zone',  value: climateZone,   color: '#06b6d4' },
  ];

  const keyMap = { Walls:'walls', Roof:'roofing', Flooring:'flooring', Doors:'doors', Windows:'windows' };

  /* ══════════ JSX ══════════ */
  // Guard: don't render context-dependent values during SSR to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div className="viewer-page">
      <Header />

      <div className="viewer-inner">

        {/* ── Hero ── */}
        <section className="viewer-hero">
          <div className="viewer-hero-eyebrow">
            <span className="viewer-hero-badge">● LIVE 3D ENGINE</span>
            <span style={{ fontSize:'0.6rem', color:'#8892b0', letterSpacing:'1px' }}>
              REAL-TIME RENDERING
            </span>
          </div>
          <h1 className="viewer-hero-title">3D Building Visualizer</h1>
          <p className="viewer-hero-sub">
            Procedurally generated model with climate-adaptive material mapping and
            engineering-grade structural overlays.
          </p>
        </section>

        {/* ── 6 Parameter Summary Cards ── */}
        <div className="viewer-param-grid">
          {paramCards.map((c, i) => (
            <div key={i} className="viewer-param-card">
              <div className="viewer-param-label">{c.label}</div>
              <div className="viewer-param-value" style={{ color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* ── Viewer + Sidebar (CSS Grid side-by-side) ── */}
        <div className="viewer-viewer-grid">

          {/* LEFT: 3D viewer column */}
          <div className="viewer-viewer-col">

            {/* Tab bar + cutaway toggles */}
            <div className="viewer-tab-bar-row">
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.val}
                    onClick={() => { setActiveTab(tab.val); setSelectedRoom(null); }}
                    className={activeTab === tab.val ? "viewer-tab-btn-active" : "viewer-tab-btn-idle"}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Package Selection Toolbar */}
              {reportData?.packages && (
                <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.58rem', fontWeight:900, color:'#8892b0', letterSpacing:'1px' }}>SELECT PACKAGE:</span>
                  {Object.keys(reportData.packages).map(pkgKey => (
                    <button
                      key={pkgKey}
                      onClick={() => setSelectedPackageKey(pkgKey)}
                      className={selectedPackageKey === pkgKey ? "viewer-toggle-btn-on" : "viewer-toggle-btn-off"}
                    >
                      {pkgKey.replace(' Package', '').toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'cutaway' && (
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <button
                    onClick={() => setShowLabels(p => !p)}
                    className={showLabels ? "viewer-toggle-btn-on" : "viewer-toggle-btn-off"}
                  >
                    🏷️ LABELS {showLabels ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setShowFurniture(p => !p)}
                    className={showFurniture ? "viewer-toggle-btn-on" : "viewer-toggle-btn-off"}
                  >
                    🛋️ FURNITURE {showFurniture ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
            </div>

            {/* 3D Canvas */}
            <div className="viewer-canvas-box">
              <div className="viewer-live-badge">● LIVE 3D ENGINE</div>
              <div className="viewer-canvas-fade" />

              <Building3DModel
                blueprint={blueprint}
                threeDMode={threeDMode}
                selections={resolvedSelections}
                showLabels={showLabels}
                showFurniture={showFurniture}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                activeFloor={activeFloor}
                onChangeActiveFloor={setActiveFloor}
                presentationMode={presentationMode}
              />

              {/* Floor selector — interior mode only, multiple floors */}
              {threeDMode !== 'exterior' && floorsData.length > 1 && (
                <div className="viewer-floor-pill">
                  {floorsData.map((_, f) => (
                    <button
                      key={f}
                      onClick={() => { setActiveFloor(f); setSelectedRoom(null); }}
                      className={activeFloor === f ? "viewer-floor-btn-active" : "viewer-floor-btn-idle"}
                    >
                      {f === 0 ? 'GROUND' : `LEVEL ${f + 1}`}
                    </button>
                  ))}
                  <button
                    onClick={() => { setActiveFloor(-1); setSelectedRoom(null); }}
                    className={activeFloor === -1 ? "viewer-floor-btn-active" : "viewer-floor-btn-idle"}
                  >
                    ALL FLOORS
                  </button>
                </div>
              )}
            </div>
            {/* end canvas box */}

          </div>
          {/* end viewer col */}

          {/* RIGHT: Sidebar */}
          <div className="viewer-sidebar">

            {/* Room Inspector / Building Overview */}
            <div className="viewer-side-sep">
              {selectedRoom ? (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                    <span className="viewer-side-label">ROOM INSPECTOR</span>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      style={{ background:'transparent', border:'none', color:'#8892b0', fontSize:'0.62rem', cursor:'pointer', fontWeight:700 }}
                    >
                      RESET
                    </button>
                  </div>
                  <h3 style={{ fontSize:'1.15rem', fontWeight:800, margin:'0 0 1rem', fontFamily:'Space Grotesk', color:'#f1f5f9' }}>
                    {selectedRoom.label.toUpperCase()}
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', fontSize:'0.78rem', color:'#8892b0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span>Dimensions:</span>
                      <span style={{ color:'#fff', fontWeight:700 }}>{selectedRoom.w}m × {selectedRoom.h}m</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span>Floor Area:</span>
                      <span style={{ color:'var(--eco-glow,#00ff9d)', fontWeight:700 }}>{selectedRoom.area} m²</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span>Zoning:</span>
                      <span style={{ color:'#fff', fontWeight:700 }}>{selectedRoom.type || 'HABITABLE'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="viewer-side-label">BUILDING OVERVIEW</div>
                  <h3 className="viewer-side-h3">Model Summary</h3>
                  <p style={{ fontSize:'0.75rem', color:'#8892b0', lineHeight:1.6, margin:0 }}>
                    Rendered utilizing procedurally generated textures and geometries mapping
                    engineering requirements to visual indicators.
                  </p>
                </>
              )}
            </div>

            {/* Material Highlight Legend — material tab only */}
            {activeTab === 'material' && (
              <div className="viewer-side-sep">
                <div className="viewer-side-label">HIGHLIGHT LEGEND</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {[
                    { label:'Walling Material',  color:'#f97316', desc:'Orange Highlight'  },
                    { label:'Roofing Material',  color:'#10b981', desc:'Emerald Highlight' },
                    { label:'Flooring Material', color:'#f59e0b', desc:'Amber Highlight'   },
                    { label:'Doors & Windows',   color:'#06b6d4', desc:'Cyan Highlight'    },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', padding:'0.45rem 0.7rem', fontSize:'0.72rem' }}>
                      <div style={{ width:'10px', height:'10px', borderRadius:'50%', backgroundColor:item.color, boxShadow:`0 0 8px ${item.color}`, flexShrink:0 }} />
                      <span style={{ fontWeight:800, color:'#fff' }}>{item.label}</span>
                      <span style={{ color:'#64748b', marginLeft:'auto', fontSize:'0.62rem' }}>{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Climate Conditions */}
            <div className="viewer-side-sep">
              <div className="viewer-side-label">CLIMATE CONDITIONS</div>
              <div className="viewer-climate-grid">
                {[
                  { label:'Rainfall', val:rain,     color:'#60a5fa' },
                  { label:'Humidity', val:humidity,  color:'#34d399' },
                  { label:'Salinity', val:salinity,  color:'#f59e0b' },
                  { label:'Zone',     val:city,      color:'#c084fc' },
                ].map((item, idx) => (
                  <div key={idx} className="viewer-climate-card">
                    <div className="viewer-climate-label">{item.label}</div>
                    <div style={{ fontSize:'0.85rem', fontWeight:800, color:item.color, marginTop:'2px' }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Insights */}
            <div className="viewer-side-sep">
              <div className="viewer-side-label">DESIGN INSIGHTS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
                {insights.map((insight, idx) => (
                  <div key={idx} className="viewer-insight-row">
                    <span>💡</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Materials */}
            <div>
              <div className="viewer-side-label">ACTIVE MATERIALS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {Object.entries(resolvedSelections).map(([comp, val], idx) => {
                  const label = comp === 'Walls' ? 'Walling' : comp;
                  const item  = pkg?.[keyMap[comp]] || {};
                  return (
                    <div key={idx} className="viewer-mat-row">
                      <span style={{ color:'#8892b0' }}>{label}:</span>
                      <span style={{ fontWeight:800, color:'#fff', maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {item.name || `Material #${val}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          {/* end sidebar */}

        </div>
        {/* end viewerGrid */}

        {/* ── Material Highlight Cards ── */}
        <div style={{ marginBottom:'0.5rem', fontSize:'0.62rem', fontWeight:900, color:'#8892b0', letterSpacing:'2px', textTransform:'uppercase' }}>
          Recommended Material Highlights
        </div>
        <div className="viewer-highlight-grid">
          {highlightCategories.map((cat, idx) => {
            const matObj  = pkg?.[cat.key] || {};
            const matName = matObj.name || cat.defaultMat;
            return (
              <div key={idx} className="viewer-highlight-card">
                <div style={{ fontSize:'1.6rem', marginBottom:'0.5rem' }}>{cat.icon}</div>
                <div style={{ fontSize:'0.58rem', fontWeight:800, color:'#8892b0', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'0.35rem' }}>
                  {cat.label}
                </div>
                <div style={{ fontSize:'0.8rem', fontWeight:800, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {matName}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Navigation Buttons ── */}
        <div className="viewer-nav-row">
          <Link href="/materials/recommendations" className="viewer-nav-ghost">
            ← Back to Recommendations
          </Link>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <Link href="/materials/report" className="viewer-nav-primary">
              View Full Report →
            </Link>
            <Link href="/materials/form" className="viewer-nav-ghost">
              New Analysis
            </Link>
          </div>
        </div>

      </div>
      {/* end inner */}

      {/* Responsive overrides via a style tag */}
      

      <Footer />
    </div>
  );
}

export default Model3DPage;
