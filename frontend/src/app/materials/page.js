"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Materials() {
  const [budget, setBudget] = useState(1000000);
  const [city, setCity] = useState('Colombo');
  const [buildingType, setBuildingType] = useState('Residential');
  const [specs, setSpecs] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflowRanking, setWorkflowRanking] = useState(null);
  const [justification, setJustification] = useState(null);
  const [impactNotes, setImpactNotes] = useState(null);
  const [aiStrategy, setAiStrategy] = useState(null);
  const [prognosis, setPrognosis] = useState(null);
  const [activeTab, setActiveTab] = useState('Structural');
  const [landscapeAnalysis, setLandscapeAnalysis] = useState(null);

  const fetchMaterials = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            max_budget: parseFloat(budget), 
            city, 
            building_type: buildingType,
            specs 
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWorkflowRanking(data.workflow_results);
        setJustification(data.mathematical_justification);
        setImpactNotes(data.impact_notes);
        setAiStrategy(data.ai_strategy);
        setPrognosis(data.prognosis);
        
        if (!data.workflow_results[activeTab]) {
            const first = Object.keys(data.workflow_results)[0];
            if (first) setActiveTab(first);
        }

        setLandscapeAnalysis({ 
            label: 'Site Context Active', 
            summary: `Optimizing material durability and carbon threshold for ${city} terrain.` 
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialsForTab = () => {
    if (!workflowRanking || !workflowRanking[activeTab]) return [];
    return workflowRanking[activeTab];
  };

  return (
    <div className="container">
      {/* 🏗️ ECO HEADER */}
      <header className="header">
        <div>
            <h1>GreenConstructAI | <span style={{color: 'var(--primary)'}}>Specifier</span></h1>
            <p>Sustainable Material Decision Support</p>
        </div>
        <nav className="nav-links">
          <Link href="/blueprint" className="nav-link">PLAN_ANALYSIS</Link>
          <Link href="/materials" className="nav-link active">SELECTOR</Link>
        </nav>
      </header>

      {/* ⚙️ CONTROL PANEL */}
      <aside className="control-panel">
        <h4 className="section-title">Analysis Parameters</h4>
        <form onSubmit={fetchMaterials}>
          <div className="input-group">
            <label>Project Budget (LKR)</label>
            <input 
              type="number" 
              className="input-field"
              value={budget} 
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Location Context</label>
            <select className="input-field" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="Colombo">Colombo (Coastal)</option>
                <option value="Kandy">Kandy (Highland)</option>
                <option value="Nuwara Eliya">Nuwara Eliya (Cold/Damp)</option>
                <option value="Anuradhapura">Anuradhapura (Dry Zone)</option>
                <option value="Hambantota">Hambantota (Arid)</option>
                <option value="Custom">Enter Custom Location...</option>
            </select>
            {city === 'Custom' && (
                <input 
                    type="text" 
                    className="input-field" 
                    style={{ marginTop: '0.5rem', borderLeft: '4px solid var(--primary)' }} 
                    placeholder="Type custom city..." 
                    onChange={(e) => setCity(e.target.value)}
                    autoFocus
                />
            )}
          </div>

          <div className="input-group">
            <label>Building Sector</label>
            <select className="input-field" value={buildingType} onChange={(e) => setBuildingType(e.target.value)}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: '1.5rem'}}>
            {loading ? 'ANALYZING...' : 'EXECUTE OPTIMIZATION'}
          </button>
        </form>

        {justification && justification[activeTab] && (
            <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#0a0a0a', border: '1px solid var(--border)' }}>
                <h5 style={{ fontSize: '0.6rem', color: 'var(--primary)', margin: '0 0 1rem 0', letterSpacing: '1px' }}>SCORING_WEIGHTS (%)</h5>
                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {['COST','CARBON','STRUCTURAL','LIFECYCLE'].map((label, idx) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-tech)' }}>
                            <span>{label}</span>
                            <span style={{color: '#fff'}}>{(justification[activeTab].weights[idx] * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </aside>

      {/* 📊 RESULT DASHBOARD */}
      <main style={{ padding: '2rem', overflowY: 'auto' }}>
        
        {/* 🧠 AI STRATEGY ROW */}
        {aiStrategy && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Regional Analysis */}
                    <div style={{ background: 'var(--slate)', padding: '1.5rem', borderLeft: '6px solid var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: '1px' }}>REGIONAL ANALYSIS: {city.toUpperCase()}</h4>
                        <p style={{ margin: '0.4rem 0 0 0', fontSize: '1rem', fontWeight: 600 }}>{landscapeAnalysis?.summary}</p>
                        {impactNotes && impactNotes[activeTab] && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#fff', fontStyle: 'italic', opacity: 0.8 }}>
                                &gt; {impactNotes[activeTab]}
                            </div>
                        )}
                    </div>

                    {/* AI Trained Model Insight */}
                    <div style={{ background: '#050a05', border: '1px solid var(--primary)', padding: '1.5rem', boxShadow: '0 0 30px var(--primary-glow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: '1px' }}>AI OPTIMIZATION MODEL</h4>
                            <span style={{ fontSize: '0.5rem', color: '#fff', background: 'var(--primary)', padding: '0.1rem 0.4rem', fontWeight: 900 }}>ACTIVE</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>{aiStrategy}</p>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.6rem', color: 'var(--text-muted)' }}>AI-assisted optimization model integrated for decision support.</div>
                    </div>
                </div>

                {/* Structural Prognosis */}
                {prognosis && (
                    <div style={{ background: '#0a0a0a', padding: '1.25rem 1.5rem', border: '1px dashed var(--primary)', borderLeft: '6px solid var(--primary)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: '1px' }}>🏗️ SITE-SPECIFIC STRUCTURAL PROGNOSIS</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6', fontFamily: 'var(--font-tech)' }}>
                            {prognosis}
                        </p>
                    </div>
                )}
            </div>
        )}

        {!workflowRanking && !loading && (
            <div style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.2 }}>
                <h3 style={{ fontFamily: 'var(--font-tech)', letterSpacing: '4px' }}>AWAITING_CORE_INITIALIZATION</h3>
                <p>Run project settings to synchronize with the optimization model.</p>
            </div>
        )}

        {workflowRanking && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
                {['Structural', 'Finishing', 'Openings'].map(phase => (
                    <button 
                        key={phase}
                        onClick={() => setActiveTab(phase)}
                        disabled={!workflowRanking[phase]}
                        style={{ 
                            padding: '0.75rem 1.5rem', 
                            background: activeTab === phase ? 'var(--primary)' : 'transparent',
                            color: activeTab === phase ? '#000' : 'var(--text-muted)',
                            border: '1px solid ' + (activeTab === phase ? 'var(--primary)' : 'var(--border)'),
                            cursor: 'pointer', fontWeight: 900, fontSize: '0.65rem', fontFamily: 'var(--font-tech)', letterSpacing: '1px',
                            opacity: workflowRanking[phase] ? 1 : 0.3
                        }}
                    >
                        {phase.toUpperCase()} PHASE
                    </button>
                ))}
            </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {getMaterialsForTab().map((mat, idx) => (
            <section key={mat.id} className="spec-sheet" style={{ 
                borderLeft: idx === 0 ? '6px solid var(--primary)' : '1px solid var(--border)', 
                borderTop: 'none',
                background: '#121616'
            }}>
              <div className="spec-sheet-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{fontSize: '1.1rem', margin: 0}}>{mat.Name}</h3>
                    {idx === 0 && <span style={{ background: 'var(--primary)', color: '#000', fontSize: '0.55rem', fontWeight: 900, padding: '0.2rem 0.5rem' }}>TOP SELECTION</span>}
                </div>
                <span className="rank-badge">RANK #{idx + 1}</span>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Performance Column */}
                    <div style={{ flex: '1 1 250px' }}>
                        <h5 style={{ fontSize: '0.6rem', color: 'var(--primary)', margin: '0 0 1rem 0', letterSpacing: '1px' }}>PERFORMANCE_METRICS</h5>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{color: 'var(--text-muted)', width: '120px'}}>{activeTab === 'Structural' ? 'COMP. STRENGTH' : 'FIRE RATING'}</span>
                                <span style={{fontWeight: 900}}>{mat.Strength_N_mm2 || mat.Fire_Rating || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{color: 'var(--text-muted)', width: '120px'}}>CARBON FOOTPRINT</span>
                                <span style={{fontWeight: 900, color: 'var(--primary)'}}>{mat.Embodied_Carbon} kgCO2e</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{color: 'var(--text-muted)', width: '120px'}}>SERVICE LIFE</span>
                                <span style={{fontWeight: 900}}>{mat.Service_Life} YRS</span>
                            </div>
                        </div>
                    </div>

                    {/* Financials Column */}
                    <div style={{ flex: '1 1 200px', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                        <h5 style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', letterSpacing: '1px' }}>BSR_FINANCIALS</h5>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{color: 'var(--text-muted)'}}>UNIT RATE</span>
                                <span style={{fontWeight: 900}}>{mat.Rate_Display}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                <span style={{color: 'var(--text-muted)'}}>OPTIM_SCORE</span>
                                <span style={{fontWeight: 900, color: 'var(--primary)'}}>{(mat.Topsis_Score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="progress-container" style={{ marginTop: '0.25rem' }}>
                                <div className="progress-bar" style={{ width: `${mat.Topsis_Score * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Risk Column */}
                    <div style={{ flex: '1 1 200px', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                        <h5 style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', letterSpacing: '1px' }}>ENVIRONMENTAL & RISK</h5>
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{fontSize: '0.6rem', fontWeight: 600}}>SUSTAINABILITY</span>
                                <span className={`risk-badge risk-${(mat.Sustainability_Risk === 'HIGH' ? 'low' : mat.Sustainability_Risk === 'MEDIUM' ? 'medium' : 'high')}`}>{mat.Sustainability_Risk || 'HIGH'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{fontSize: '0.6rem', fontWeight: 600}}>LIFECYCLE RISK</span>
                                <span className={`risk-badge risk-${(mat.Lifecycle_Risk || 'low').toLowerCase()}`}>{mat.Lifecycle_Risk || 'LOW'}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', background: 'rgba(39, 174, 96, 0.05)', border: '1px dashed var(--primary)', padding: '0.5rem', fontSize: '0.6rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                                Material suitability aligns with regional environmental conditions.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--slate)' }}>
                    <div style={{fontSize: '0.55rem', color: 'var(--primary)', fontWeight: 900, marginBottom: '0.4rem'}}>SYSTEM_ANALYSIS_RATIONALE:</div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#ccc', lineHeight: '1.5', fontFamily: 'monospace' }}>{mat.Rationale}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
