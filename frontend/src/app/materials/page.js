"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ── CONFIG BAR ──
const ConfigBar = ({ params, handlers, handleGenerate, loading }) => {
  const cities = [
    "Colombo", "Galle", "Kandy", "Negombo", "Ratnapura", "Anuradhapura", "Nuwara Eliya", 
    "Jaffna", "Trincomalee", "Batticaloa", "Matara", "Hambantota", "Kurunegala", "Badulla", "Gampaha", "Kalutara"
  ].sort();

  return (
    <section className="glass-panel glow-border" style={{ 
      padding: '2rem 2.5rem', 
      display: 'flex', 
      flexDirection: 'column',
      gap: '1.5rem', 
      width: '100%', 
      background: 'rgba(255,255,255,0.02)', 
      zIndex: 100, 
      position: 'relative' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '3px' }}>DNA_CONFIG</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk' }}>PROJECT PARAMETERS</div>
        </div>
        <button className="btn-premium" style={{ height: '54px', padding: '0 3rem' }} onClick={handleGenerate} disabled={loading}>
          {loading ? "PROFILING..." : "GENERATE MATRIX"}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
        <div>
          <label className="tech-label">Location</label>
          <select className="tech-input" value={params.city} onChange={e => handlers.setCity(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="tech-label">Sector</label>
          <select className="tech-input" value={params.buildingType} onChange={e => handlers.setBuildingType(e.target.value)}>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
          </select>
        </div>

        <div>
          <label className="tech-label">Floors</label>
          <input className="tech-input" type="number" value={params.numFloors} onChange={e => handlers.setNumFloors(Number(e.target.value))} />
        </div>

        <div>
          <label className="tech-label">Sustainability</label>
          <select className="tech-input" value={params.sustainabilityPref} onChange={e => handlers.setSustainabilityPref(e.target.value)}>
            <option value="Low">Low (Cost-Centric)</option>
            <option value="Medium">Medium (Balanced)</option>
            <option value="High">High (Eco-Priority)</option>
          </select>
        </div>

        <div style={{ flex: 1.5 }}>
          <label className="tech-label">Budget (LKR)</label>
          <input className="tech-input" type="number" value={params.budget} onChange={e => handlers.setBudget(Number(e.target.value))} />
        </div>
      </div>
    </section>
  );
};

// ── COST DASHBOARD ──
const CostDashboard = ({ analysis }) => {
  if (!analysis) return null;
  const isOver = analysis.shortfall > 0;
  const isCritical = analysis.status.includes("INFEASIBLE") || analysis.status.includes("UNDERFUNDED");

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', borderLeft: `6px solid ${isCritical ? 'var(--error-red)' : (isOver ? 'var(--warn-amber)' : 'var(--eco-glow)')}` }}>
      <div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '0.5rem' }}>ESTIMATED_TOTAL_COST</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>LKR {analysis.total_cost.toLocaleString()}</div>
      </div>
      <div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '0.5rem' }}>ALLOCATED_BUDGET</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blueprint-blue)' }}>LKR {analysis.budget_ceiling.toLocaleString()}</div>
      </div>
      <div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '0.5rem' }}>{isOver ? 'BUDGET_SHORTFALL' : 'BUDGET_SURPLUS'}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isOver ? 'var(--error-red)' : 'var(--eco-glow)' }}>
          {isOver ? '-' : '+'} LKR {Math.abs(isOver ? analysis.shortfall : analysis.budget_ceiling - analysis.total_cost).toLocaleString()}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '0.5rem' }}>FEASIBILITY_STATUS</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: isCritical ? 'var(--error-red)' : '#fff' }}>{analysis.status}</div>
      </div>
    </div>
  );
};

// ── LOADING OVERLAY ──
const LoadingOverlay = ({ step }) => {
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
      gap: '2rem' 
    }}>
      <div className="neural-core-v2" style={{ width: '140px', height: '140px' }}>
        <div className="core-ring core-ring-1"></div>
        <div className="core-ring core-ring-2"></div>
        <div className="core-ring core-ring-3"></div>
        <div style={{ fontSize: '4rem' }}>🧬</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '10px', textTransform: 'uppercase', marginBottom: '15px' }}>Neural Core Processing</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk' }}>{step}...</div>
      </div>
    </div>
  );
};

// ── BLUEPRINT CANVAS ──
const BlueprintCanvas = ({ layout }) => {
  const [activeFloor, setActiveFloor] = useState(0);
  if (!layout || (!layout.rooms && !layout.floors_data)) return null;
  
  const scale = 25;
  const padding = 45;
  const viewWidth = (layout.footprint.w * scale) + (padding * 2);
  const viewHeight = (layout.footprint.h * scale) + (padding * 2);

  const currentFloor = layout.floors_data ? layout.floors_data[activeFloor] : { rooms: layout.rooms, label: "GROUND FLOOR" };

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

  const getRoomIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('bedroom')) return '🛏️';
    if (l.includes('bath')) return '🚿';
    if (l.includes('living')) return '🛋️';
    if (l.includes('kitchen')) return '🍳';
    if (l.includes('dining')) return '🍽️';
    if (l.includes('office') || l.includes('study')) return '🖥️';
    return '📦';
  };

  return (
    <div className="glass-panel glow-border" style={{ padding: '2.5rem', flex: 1.5, background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', minHeight: '620px', position: 'relative', overflow: 'hidden' }}>
      <div className="scan-line" style={{ background: 'linear-gradient(to right, transparent, rgba(56, 189, 248, 0.2), transparent)', height: '2px' }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '5px', textTransform: 'uppercase' }}>Architectural Protocol v18.4</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk', marginTop: '0.5rem' }}>MULTI-LEVEL SPATIAL MAPPING</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 900, letterSpacing: '2px' }}>SYSTEM_REF: GC-2026-X</div>
          <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700, marginTop: '0.2rem' }}>SCALE 1:50</div>
        </div>
      </div>

      {/* FLOOR SWITCHER */}
      {layout.floors_data && layout.floors_data.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          {layout.floors_data.map((floor, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveFloor(idx)}
              className={`glow-border ${activeFloor === idx ? 'active-floor-btn' : ''}`}
              style={{
                padding: '8px 16px',
                background: activeFloor === idx ? 'var(--blueprint-blue)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '1px'
              }}
            >
              {floor.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ 
        background: '#020617', 
        borderRadius: '20px', 
        border: '1px solid #1e293b', 
        padding: '15px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
          backgroundSize: '30px 30px',
          opacity: 0.2
        }}></div>

        <svg width="100%" height="450" viewBox={`0 0 ${viewWidth} ${viewHeight}`} style={{ position: 'relative', zIndex: 2 }}>
          <rect x={padding} y={padding} width={layout.footprint.w * scale} height={layout.footprint.h * scale} fill="none" stroke="#1e293b" strokeWidth="10" rx="4" />
          <rect x={padding} y={padding} width={layout.footprint.w * scale} height={layout.footprint.h * scale} fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="10 5" opacity="0.5" />

          {currentFloor.rooms.map((room, i) => (
            <g key={i} transform={`translate(${padding + (room.x * scale)}, ${padding + (room.y * scale)})`}>
              <rect width={room.w * scale} height={room.h * scale} fill={getRoomColor(room.type)} stroke={getRoomStroke(room.type)} strokeWidth="2" rx="2" />
              <rect width="25" height="12" fill={getRoomStroke(room.type)} opacity="0.8" rx="2" x="5" y="5" />
              <text x="17.5" y="14" fontSize="6" fill="#000" fontWeight="900" textAnchor="middle">{i+1}</text>
              <text x="8" y="28" fontSize="9" fill="#fff" fontWeight="900" style={{ letterSpacing: '0.5px' }}>{room.label.toUpperCase()}</text>
              <text x="8" y="42" fontSize="7" fill="#64748b" fontWeight="700">{room.w}m x {room.h}m ({Math.round(room.w * room.h)}m²)</text>
              <text x={room.w * scale - 20} y={room.h * scale - 10} fontSize="12">{getRoomIcon(room.label)}</text>
            </g>
          ))}

          <g opacity="0.6">
            <line x1={padding} y1={padding - 20} x2={padding + layout.footprint.w * scale} y2={padding - 20} stroke="#38bdf8" strokeWidth="1" />
            <text x={padding + (layout.footprint.w * scale)/2} y={padding - 28} fontSize="8" fill="#38bdf8" textAnchor="middle" fontWeight="800">WIDTH: {layout.footprint.w}m</text>
            <line x1={padding - 20} y1={padding} x2={padding - 20} y2={padding + layout.footprint.h * scale} stroke="#38bdf8" strokeWidth="1" />
            <text x={padding - 28} y={padding + (layout.footprint.h * scale)/2} fontSize="8" fill="#38bdf8" textAnchor="middle" transform={`rotate(-90, ${padding - 28}, ${padding + (layout.footprint.h * scale)/2})`} fontWeight="800">DEPTH: {layout.footprint.h}m</text>
          </g>
        </svg>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
        {['PUBLIC', 'PRIVATE', 'WET'].map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', background: getRoomColor(type), border: `1.5px solid ${getRoomStroke(type)}`, borderRadius: '3px' }}></div>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── MAIN PAGE ──
export default function MaterialsPage() {
  const [city, setCity] = useState("Colombo");
  const [buildingType, setBuildingType] = useState("Residential");
  const [numFloors, setNumFloors] = useState(1);
  const [budget, setBudget] = useState(25000000);
  const [sustainabilityPref, setSustainabilityPref] = useState("Medium");
  const [specs, setSpecs] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);
  const [workflowRanking, setWorkflowRanking] = useState(null);
  const [activeTab, setActiveTab] = useState("Foundation");

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    setLoadingStep("Synchronizing Climate Matrix");
    setTimeout(() => setLoadingStep("Optimizing Structural DNA"), 1000);
    setTimeout(() => setLoadingStep("Auditing Material Lifecycle"), 2000);
    try {
      const res = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, building_type: buildingType, num_floors: numFloors, max_budget: budget, sustainability_pref: sustainabilityPref, specs: specs }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWorkflowRanking(data.ranking);
        const phases = Object.keys(data.ranking.workflow_results);
        if (phases.length > 0) setActiveTab(phases[0]);
      } else { setError(data.message); }
    } catch (err) { setError("Neural Core Offline."); } finally { setLoading(false); }
  };

  const isCritical = workflowRanking?.feasibility_review?.status_label?.includes("INFEASIBLE") || 
                     workflowRanking?.feasibility_review?.status_label?.includes("UNDERFUNDED");

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff', position: 'relative' }}>
      <div className="premium-bg"><div className="gradient-mesh"></div><div className="blueprint-grid"></div></div>
      
      {loading && <LoadingOverlay step={loadingStep} />}
      <Header />
      
      <main style={{ padding: '2rem 3rem', display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 10 }}>
        <ConfigBar 
          params={{ city, buildingType, numFloors, budget, specs, sustainabilityPref }} 
          handlers={{ setCity, setBuildingType, setNumFloors, setBudget, setSpecs, setSustainabilityPref }} 
          handleGenerate={handleGenerate} 
          loading={loading} 
        />

        {error && <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '6px solid var(--error-red)' }}>{error}</div>}

        {workflowRanking ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }} className="animate-fade-in">
            
            <CostDashboard analysis={{ ...workflowRanking.budget_analysis, shortfall: workflowRanking.feasibility_review.shortfall }} />

            {isCritical ? (
               <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', border: '2px solid var(--error-red)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚠️</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--error-red)', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>PROJECT INFEASIBLE</h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                    The neural core has determined that your current budget (LKR {budget.toLocaleString()}) is insufficient for a {numFloors}-storey {buildingType} project in {city}.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                     {workflowRanking.feasibility_review.audit_logs.map((log, i) => (
                       <div key={i} style={{ color: 'var(--error-red)', fontSize: '0.9rem', fontWeight: 700 }}>► {log}</div>
                     ))}
                  </div>
               </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <BlueprintCanvas layout={workflowRanking.spatial_layout} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--eco-glow)', letterSpacing: '4px', marginBottom: '1rem' }}>CLIMATE_STRATEGY</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{workflowRanking.climate_profile.key.replace('_', ' ')}</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>{workflowRanking.climate_profile.logic}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--blueprint-blue)', letterSpacing: '4px', marginBottom: '1rem' }}>AUDIT_RATIONALE</div>
                      {workflowRanking.spatial_layout?.blueprint_summary.map((s, i) => <div key={i} style={{ marginBottom: '10px', fontSize: '0.85rem' }}>► {s}</div>)}
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem' }}>Material Optimization Matrix</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.keys(workflowRanking.workflow_results).map(phase => (
                        <button 
                          key={phase} 
                          onClick={() => setActiveTab(phase)} 
                          style={{ 
                            padding: '0.6rem 1.2rem', 
                            background: activeTab === phase ? 'var(--eco-glow)' : 'rgba(255,255,255,0.05)', 
                            color: activeTab === phase ? 'var(--eco-black)' : '#fff', 
                            border: '1px solid var(--glass-border)', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            transition: 'all 0.3s'
                          }}>
                          {phase.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {workflowRanking.workflow_results[activeTab]?.length > 0 ? (
                      workflowRanking.workflow_results[activeTab].map((mat, i) => (
                        <div key={i} className="glass-panel glow-border" style={{ padding: '2rem', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{mat.Name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--eco-glow)', fontWeight: 900 }}>SCORE: {mat.Display_Score}</div>
                          </div>
                          
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Metric Quantity:</span>
                              <span style={{ fontWeight: 700 }}>{mat.Quantity}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phase Cost:</span>
                              <span style={{ fontWeight: 700, color: 'var(--eco-glow)' }}>LKR {mat.Phase_Cost.toLocaleString()}</span>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, minHeight: '80px' }}>{mat.Rationale}</p>
                          
                          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '15px' }}>
                            {Object.entries(mat.Alignment_Breakdown).map(([label, val]) => (
                              <div key={label} style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>{label.slice(0, 3)}</div>
                                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--eco-glow)', width: `${val}%` }} />
                                  </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', border: '1px dashed var(--glass-border)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔬</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No optimal materials found for {activeTab} within the current budget/sustainability constraints.</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px' }}>
             <div className="neural-core-v2" style={{ width: '120px', height: '120px' }}><div className="core-ring core-ring-1"></div><div style={{fontSize: '4rem'}}>🏗️</div></div>
             <div style={{ marginTop: '2rem', opacity: 0.5, letterSpacing: '8px', fontWeight: 900 }}>SYSTEM_READY</div>
             <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Configure project parameters and generate engineering matrix</div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
