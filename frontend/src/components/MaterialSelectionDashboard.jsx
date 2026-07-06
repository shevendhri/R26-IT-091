import React, { useEffect, useState } from 'react';
import XAIPanel from './Recommendation/XAIPanel';

/**
 * MaterialSelectionDashboard
 * Props:
 * - blueprint, location, profile: passed from workspace
 * - onComplete: called to proceed to Step 7 (3D Concept)
 */
export default function MaterialSelectionDashboard({ blueprint, location, profile, selections, setSelections, onComplete }) {
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState(null);

  useEffect(() => {
    async function fetchAlternatives() {
      try {
        const res = await fetch('http://localhost:5000/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blueprint, location, profile })
        });
        if (!res.ok) {
          console.error('Failed to fetch alternatives:', res.status, res.statusText);
          setAlternatives(null);
        } else {
          const data = await res.json();
          if (data.status === 'success') {
            // Filter out components with no options
            const filtered = Object.fromEntries(
              Object.entries(data.alternatives).filter(([, opts]) => opts && opts.length > 0)
            );
            setAlternatives(filtered);
            const comps = Object.keys(filtered);
            if (comps.length > 0) setActiveComponent(comps[0]);
          } else {
            console.error('Backend error:', data);
            setAlternatives(null);
          }
        }
      } catch (e) {
        console.error('Failed to load material alternatives', e);
        setAlternatives(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAlternatives();
  }, [blueprint, location, profile]);

  const handleSelect = async (component, material) => {
    try {
      await fetch('http://localhost:5000/api/user-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ component, material_id: material.id })
      });
    } catch (e) {
      console.error('Failed to store selection', e);
    }
    setSelections(prev => ({ ...prev, [component]: material.id }));
  };

  const availableComponents = alternatives ? Object.keys(alternatives) : [];
  const selectedCount = Object.keys(selections).length;
  const allSelected = availableComponents.length > 0 && availableComponents.every(c => selections[c]);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <div className="neural-core-v2" style={{ width: '100px', height: '100px', margin: '0 auto 2rem' }}>
          <div className="core-ring core-ring-1"></div>
          <div className="core-ring core-ring-2"></div>
        </div>
        <div style={{ color: 'var(--eco-glow)', fontWeight: 900, letterSpacing: '6px', fontSize: '0.65rem', marginBottom: '0.75rem' }}>
          HYBRID AI ENGINE
        </div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
          Calculating material suitability scores...
        </div>
      </div>
    );
  }

  if (!alternatives || availableComponents.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          No material alternatives found for current parameters.
        </div>
        <button className="btn-premium" onClick={onComplete}>
          PROCEED TO 3D CONCEPT →
        </button>
      </div>
    );
  }

  // Find the top recommendation (or selected option) for the active component to display in XAI Panel
  const activeOpts = activeComponent ? alternatives[activeComponent] : [];
  const activeSelectedMaterialId = activeComponent ? selections[activeComponent] : null;
  const activeMaterial = activeSelectedMaterialId 
    ? activeOpts.find(opt => opt.id === activeSelectedMaterialId) 
    : activeOpts[0]; // default to rank 1

  return (
    <div className="glass-panel glow-border animate-fade-in" style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '5px', textTransform: 'uppercase' }}>
            ALTERNATIVES_ENGINE
          </div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginTop: '0.4rem', color: '#fff' }}>
            ENGINEERING SPECIFICATION
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
            Review AI-recommended materials and lock in selections for the final blueprint.
          </p>
        </div>
        
        {/* Progress pill & Proceed Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: allSelected ? 'rgba(0,255,157,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${allSelected ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
            borderRadius: '24px',
            padding: '0.5rem 1.25rem',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: allSelected ? 'var(--eco-glow)' : '#fff' }}>
              {selectedCount}/{availableComponents.length}
            </div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '2px' }}>SELECTED</div>
          </div>
          <button 
            className="btn-premium" 
            onClick={onComplete}
            disabled={!allSelected}
            style={{ opacity: allSelected ? 1 : 0.5, cursor: allSelected ? 'pointer' : 'not-allowed' }}
          >
            CONFIRM & PROCEED →
          </button>
        </div>
      </div>

      {/* Split Pane Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Pane: Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {availableComponents.map(component => {
            const isCompSelected = Boolean(selections[component]);
            const isActive = activeComponent === component;
            const selectedOpt = isCompSelected ? alternatives[component].find(opt => opt.id === selections[component]) : null;
            
            return (
              <div 
                key={component} 
                onClick={() => setActiveComponent(component)}
                style={{
                  border: `1px solid ${isActive ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  background: isActive ? 'rgba(0,255,157,0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '4px solid var(--eco-glow)' : '4px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: isActive ? 'var(--eco-glow)' : '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {component}
                  </h3>
                  {isCompSelected && <span style={{ color: 'var(--eco-glow)', fontSize: '0.8rem' }}>✓</span>}
                </div>
                {selectedOpt ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedOpt.name}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--warn-amber)' }}>
                    Action Required: Select Material
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Pane: XAI Panel & Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeComponent && activeMaterial && (
            <>
              {/* Top Candidates Quick Select */}
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {activeOpts.map((opt, i) => {
                  const isSelectedForComp = selections[activeComponent] === opt.id;
                  const isBeingViewed = activeMaterial.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(activeComponent, opt)}
                      style={{
                        background: isSelectedForComp ? 'var(--eco-glow)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isSelectedForComp ? 'var(--eco-glow)' : 'var(--glass-border)'}`,
                        color: isSelectedForComp ? '#000' : 'var(--text-secondary)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        outline: isBeingViewed ? '2px solid #fff' : 'none',
                        outlineOffset: '2px'
                      }}
                    >
                      {i === 0 ? 'RANK 1' : `ALT ${i+1}`}: {opt.name.substring(0, 20)}{opt.name.length > 20 ? '...' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Explainable AI Panel */}
              <XAIPanel 
                componentName={activeComponent}
                material={activeMaterial}
                onSelect={() => handleSelect(activeComponent, activeMaterial)}
                isSelected={selections[activeComponent] === activeMaterial.id}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
