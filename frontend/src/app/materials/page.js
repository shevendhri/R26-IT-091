"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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
  if (!layout || !layout.rooms) return null;
  const scale = 25;
  const padding = 50;
  const viewWidth = (layout.footprint.w * scale) + (padding * 2);
  const viewHeight = (layout.footprint.h * scale) + (padding * 2);

  return (
    <div className="glass-panel glow-border" style={{ padding: '2.5rem', flex: 1.5, background: 'rgba(0,0,0,0.5)', minHeight: '550px', position: 'relative' }}>
      <div className="scan-line"></div>
      <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--blueprint-blue)', letterSpacing: '6px', marginBottom: '2rem' }}>SPATIAL_GENOMICS_PLAN</div>
      <div style={{ background: 'rgba(4, 13, 10, 0.6)', borderRadius: '24px', border: '1px solid var(--glass-border)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="450" viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
          <rect width="100%" height="100%" fill="rgba(14, 165, 233, 0.02)" />
          {layout.rooms.map((room, i) => (
            <g key={i} transform={`translate(${padding + (room.x * scale)}, ${padding + (room.y * scale)})`}>
              <rect 
                width={room.w * scale} 
                height={room.h * scale} 
                fill={room.type === 'WET' ? 'rgba(14, 165, 233, 0.15)' : (room.type === 'HABITABLE' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 255, 255, 0.05)')} 
                stroke={room.type === 'WET' ? 'var(--blueprint-blue)' : (room.type === 'HABITABLE' ? 'var(--eco-glow)' : 'var(--glass-border)')} 
                strokeWidth="2" 
              />
              <text x="5" y="15" fontSize="8" fill="#fff" fontWeight="800" style={{ opacity: 0.8 }}>{room.label.toUpperCase()}</text>
              <text x="5" y="28" fontSize="6" fill="var(--text-secondary)" fontWeight="500">{room.w}m x {room.h}m</text>
            </g>
          ))}
        </svg>
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
