"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ── Static option lists ────────────────────────────────────────────────────
const BUILDING_TYPES    = ['Residential', 'Commercial', 'Industrial', 'Educational', 'Healthcare', 'Hotel', 'Mixed Use', 'Office'];
const STRUCTURAL_SYSTEMS = ['Concrete Frame', 'Steel Frame', 'Load-Bearing Masonry', 'Timber Frame'];
const BUDGET_LEVELS     = ['Budget', 'Balanced', 'Premium'];
const SUSTAINABILITY_LEVELS = ['Low', 'Medium', 'High'];
const LOCATIONS = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Trincomalee', 'Negombo',
  'Batticaloa', 'Anuradhapura', 'Ratnapura', 'Kurunegala', 'Badulla', 'Matara'
];

// ── Section 3 option maps ──────────────────────────────────────────────────
const BUILDING_USAGE_OPTIONS = [
  { value: 'Single Family Residence', icon: '🏠' },
  { value: 'Multi Family Residence',  icon: '🏘️' },
  { value: 'Office Building',         icon: '🏢' },
  { value: 'Retail / Commercial',     icon: '🏬' },
  { value: 'Hotel / Hospitality',     icon: '🏨' },
  { value: 'Educational Facility',    icon: '🎓' },
  { value: 'Healthcare Facility',     icon: '🏥' },
  { value: 'Industrial / Warehouse',  icon: '🏭' },
  { value: 'Mixed Use',               icon: '🏙️' },
];

const PRIMARY_GOAL_OPTIONS = [
  { value: 'Lowest Initial Cost',  icon: '💰' },
  { value: 'Lowest Lifecycle Cost', icon: '📉' },
  { value: 'Maximum Durability',   icon: '🔩' },
  { value: 'Sustainability',       icon: '🌿' },
  { value: 'Fast Construction',    icon: '⚡' },
  { value: 'Premium Appearance',   icon: '✨' },
  { value: 'Energy Efficiency',    icon: '☀️' },
  { value: 'Climate Resilience',   icon: '🌊' },
];

const ARCH_STYLE_OPTIONS = [
  { value: 'Modern',        icon: '🏛️' },
  { value: 'Contemporary',  icon: '🔷' },
  { value: 'Tropical',      icon: '🌴' },
  { value: 'Minimalist',    icon: '⬜' },
  { value: 'Traditional',   icon: '🏯' },
  { value: 'Industrial',    icon: '⚙️' },
  { value: 'Luxury',        icon: '💎' },
];

const MATERIAL_PREF_OPTIONS = [
  'Timber', 'Concrete', 'Steel', 'Bamboo', 'Recycled Materials', 'Natural Materials', 'No Preference'
];

const PRIORITY_LEVELS   = ['Low', 'Medium', 'High', 'Critical'];
const FIRE_LEVELS       = ['Standard', 'Enhanced', 'High', 'Critical'];
const LOCAL_MAT_OPTIONS = ['Yes', 'Preferred', 'Neutral', 'No'];
const CERT_OPTIONS      = ['None', 'LEED', 'GREENSL', 'EDGE', 'BREEAM'];
const LIFESPAN_OPTIONS  = ['25 Years', '50 Years', '75 Years', '100+ Years'];
const MAINTENANCE_OPTIONS = ['Very Low', 'Low', 'Medium', 'High'];

// ── Reusable sub-components ────────────────────────────────────────────────
function ChipSelector({ options, value, onChange, multi = false }) {
  const isActive = (v) => multi ? (value || []).includes(v) : value === v;

  const handleClick = (v) => {
    if (!multi) { onChange(v); return; }
    const cur = value || [];
    if (v === 'No Preference') { onChange(['No Preference']); return; }
    const next = cur.includes(v)
      ? cur.filter(x => x !== v)
      : [...cur.filter(x => x !== 'No Preference'), v];
    onChange(next.length === 0 ? [] : next);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map(opt => {
        const label = typeof opt === 'string' ? opt : opt.value;
        const icon  = typeof opt === 'string' ? null : opt.icon;
        const active = isActive(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => handleClick(label)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: active ? '1.5px solid var(--eco-glow)' : '1px solid rgba(255,255,255,0.12)',
              background: active ? 'rgba(0,255,157,0.12)' : 'rgba(255,255,255,0.04)',
              color: active ? 'var(--eco-glow)' : 'rgba(255,255,255,0.7)',
              fontSize: '0.78rem',
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {icon && <span>{icon}</span>}
            {label}
          </button>
        );
      })}
    </div>
  );
}

function AestheticSlider({ value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Functional</span>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--eco-glow)', minWidth: '2ch', textAlign: 'center' }}>{value}</span>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Premium Visual</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--eco-glow)', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{ fontSize: '0.6rem', color: n === value ? 'var(--eco-glow)' : 'rgba(255,255,255,0.2)', fontWeight: n === value ? 800 : 400 }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({ label, children, hint }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <label style={{
        fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.35rem'
      }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem', fontStyle: 'italic' }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── Progress bar component ─────────────────────────────────────────────────
function ProgressBar({ sections, current }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
      {sections.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: i <= current ? 'var(--eco-glow)' : 'rgba(255,255,255,0.1)',
            color: i <= current ? '#000' : 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 900, transition: 'all 0.3s ease',
          }}>{i + 1}</div>
          <div style={{ marginLeft: '0.4rem', flex: 1 }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: i === current ? '#fff' : 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{s}</div>
          </div>
          {i < sections.length - 1 && (
            <div style={{ width: '24px', height: '2px', background: i < current ? 'var(--eco-glow)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', flexShrink: 0, marginLeft: '0.4rem' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main form page ─────────────────────────────────────────────────────────
export default function FormPage() {
  const router = useRouter();
  const {
    buildingInfo, setBuildingInfo,
    preferences, setPreferences,
    projectPreferences, setProjectPreferences,
  } = useMaterial();

  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const imported = localStorage.getItem('imported_building_info');
    if (imported) {
      try {
        const parsed = JSON.parse(imported);
        setBuildingInfo(prev => ({
          ...prev,
          building_type:    parsed.building_type     || prev.building_type,
          location:         parsed.location           || prev.location,
          floor_count:      parsed.floor_count        || prev.floor_count,
          total_area:       parsed.total_floor_area   || parsed.total_area || prev.total_area || 170.0,
          wall_area:        parsed.wall_area          || prev.wall_area,
          structural_system: parsed.structural_system || prev.structural_system,
        }));
        localStorage.removeItem('imported_building_info');
      } catch (e) {
        console.error('Error importing building info:', e);
      }
    }
  }, [setBuildingInfo]);

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const setProjPref = (key, value) => {
    setProjectPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('buildingInfo',         JSON.stringify(buildingInfo));
    localStorage.setItem('preferences',          JSON.stringify(preferences));
    localStorage.setItem('projectPreferences',   JSON.stringify(projectPreferences));
    router.push('/materials/building-requirements');
  };

  const SECTION_LABELS = ['Building Information', 'Project Preferences', 'Requirements & Priorities'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff' }}>
      <div className="premium-bg"><div className="gradient-mesh" /><div className="blueprint-grid" /></div>
      <Header />

      <main style={{ padding: '3rem 2rem', maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--eco-glow)', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            AI RECOMMENDATION ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'Space Grotesk', fontWeight: 800, lineHeight: 1.1 }}>
            Building <span style={{ color: 'var(--eco-glow)' }}>Specification</span> Input
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
            Provide your building parameters and project requirements to generate a full AI + Engineering material recommendation with XAI explanations.
          </p>
        </div>

        {/* Progress indicator */}
        <ProgressBar sections={SECTION_LABELS} current={activeSection} />

        <form onSubmit={handleSubmit}>

          {/* ── Section 1: Building Information ─────────────────────────── */}
          <div
            id="section-building"
            className="glass-card"
            style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
            onClick={() => setActiveSection(0)}
          >
            <h2 style={{ fontSize: '1rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--eco-glow)', marginBottom: activeSection === 0 ? '1.5rem' : 0, textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              🏗️ Building Information
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{activeSection === 0 ? '▲' : '▼'}</span>
            </h2>
            {activeSection === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }} onClick={e => e.stopPropagation()}>
                <div>
                  <label className="tech-label">Building Type</label>
                  <select name="building_type" value={buildingInfo.building_type} onChange={handleBuildingChange} className="premium-select">
                    {BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="tech-label">Location (City)</label>
                  <select name="location" value={buildingInfo.location} onChange={handleBuildingChange} className="premium-select">
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="tech-label">Number of Floors</label>
                  <input type="number" name="floor_count" min="1" max="50" value={buildingInfo.floor_count ?? ''} onChange={handleBuildingChange} className="premium-input" />
                </div>
                <div>
                  <label className="tech-label">Total Floor Area (m²)</label>
                  <input type="number" name="total_area" min="10" value={buildingInfo.total_area ?? ''} onChange={handleBuildingChange} className="premium-input" />
                </div>
                <div>
                  <label className="tech-label">Wall Area (m²)</label>
                  <input type="number" name="wall_area" min="0" value={buildingInfo.wall_area ?? ''} onChange={handleBuildingChange} className="premium-input" />
                </div>
                <div>
                  <label className="tech-label">Structural System</label>
                  <select name="structural_system" value={buildingInfo.structural_system} onChange={handleBuildingChange} className="premium-select">
                    {STRUCTURAL_SYSTEMS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 2: Project Preferences ──────────────────────────── */}
          <div
            id="section-preferences"
            className="glass-card"
            style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
            onClick={() => setActiveSection(1)}
          >
            <h2 style={{ fontSize: '1rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--blueprint-blue)', marginBottom: activeSection === 1 ? '1.5rem' : 0, textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              🎯 Project Preferences
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{activeSection === 1 ? '▲' : '▼'}</span>
            </h2>
            {activeSection === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }} onClick={e => e.stopPropagation()}>
                <div>
                  <label className="tech-label">Sustainability Preference</label>
                  <select name="sustainability_level" value={preferences.sustainability_level} onChange={handlePrefChange} className="premium-select">
                    {SUSTAINABILITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="tech-label">Budget Level</label>
                  <select name="budget_tier" value={preferences.budget_tier} onChange={handlePrefChange} className="premium-select">
                    {BUDGET_LEVELS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="tech-label">Maintenance Preference</label>
                  <select name="maintenance_preference" value={preferences.maintenance_preference} onChange={handlePrefChange} className="premium-select">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
                <div>
                  <label className="tech-label">Material Priority</label>
                  <select name="material_priority" value={preferences.material_priority} onChange={handlePrefChange} className="premium-select">
                    <option>Durability</option><option>Sustainability</option><option>Cost</option><option>Aesthetics</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 3: Project Requirements & Priorities ─────────────── */}
          <div
            id="section-requirements"
            className="glass-card glow-border"
            style={{
              marginBottom: '2rem',
              cursor: 'pointer',
            }}
            onClick={() => setActiveSection(2)}
          >
            {/* Accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--eco-glow), var(--blueprint-blue))' }} />

            <h2 style={{
              fontSize: '1rem', fontFamily: 'Space Grotesk', fontWeight: 700,
              color: 'var(--eco-glow)', marginBottom: activeSection === 2 ? '0.5rem' : 0,
              textTransform: 'uppercase', letterSpacing: '2px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              📋 Project Requirements & Priorities
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{activeSection === 2 ? '▲' : '▼'}</span>
            </h2>

            {activeSection === 2 && (
              <div onClick={e => e.stopPropagation()}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontStyle: 'italic' }}>
                  These engineering signals shape your material recommendation profile — think of this as your project brief.
                </p>

                {/* 1. Building Usage Category */}
                <QuestionBlock
                  label="Building Usage Category"
                  hint="Primary intended use — drives fire, acoustic, and durability requirements."
                >
                  <ChipSelector
                    options={BUILDING_USAGE_OPTIONS}
                    value={projectPreferences.building_usage}
                    onChange={v => setProjPref('building_usage', v)}
                  />
                </QuestionBlock>

                {/* 2. Primary Project Goal */}
                <QuestionBlock label="Primary Project Goal" hint="What is your highest priority for this project?">
                  <ChipSelector
                    options={PRIMARY_GOAL_OPTIONS}
                    value={projectPreferences.primary_goal}
                    onChange={v => setProjPref('primary_goal', v)}
                  />
                </QuestionBlock>

                {/* 3. Architectural Style */}
                <QuestionBlock label="Desired Architectural Style" hint="Visual character of the completed building.">
                  <ChipSelector
                    options={ARCH_STYLE_OPTIONS}
                    value={projectPreferences.architectural_style}
                    onChange={v => setProjPref('architectural_style', v)}
                  />
                </QuestionBlock>

                {/* 4. Material Preferences — multi-select */}
                <QuestionBlock label="Material Family Preferences" hint="Select all that apply. 'No Preference' clears other selections.">
                  <ChipSelector
                    options={MATERIAL_PREF_OPTIONS}
                    value={projectPreferences.material_preferences}
                    onChange={v => setProjPref('material_preferences', v)}
                    multi
                  />
                </QuestionBlock>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />
                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Performance Requirements</div>

                {/* 5–8: Priority level questions in 2-column grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem 2rem' }}>
                  <QuestionBlock label="Indoor Thermal Comfort Priority">
                    <ChipSelector options={PRIORITY_LEVELS} value={projectPreferences.thermal_comfort_priority} onChange={v => setProjPref('thermal_comfort_priority', v)} />
                  </QuestionBlock>
                  <QuestionBlock label="Energy Performance Priority">
                    <ChipSelector options={PRIORITY_LEVELS} value={projectPreferences.energy_priority} onChange={v => setProjPref('energy_priority', v)} />
                  </QuestionBlock>
                  <QuestionBlock label="Acoustic Performance Priority">
                    <ChipSelector options={PRIORITY_LEVELS} value={projectPreferences.acoustic_priority} onChange={v => setProjPref('acoustic_priority', v)} />
                  </QuestionBlock>
                  <QuestionBlock label="Fire Resistance Requirement">
                    <ChipSelector options={FIRE_LEVELS} value={projectPreferences.fire_resistance_priority} onChange={v => setProjPref('fire_resistance_priority', v)} />
                  </QuestionBlock>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />
                <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Sourcing, Compliance & Longevity</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem 2rem' }}>
                  <QuestionBlock label="Local Material Preference">
                    <ChipSelector options={LOCAL_MAT_OPTIONS} value={projectPreferences.local_material_preference} onChange={v => setProjPref('local_material_preference', v)} />
                  </QuestionBlock>
                  <QuestionBlock label="Green Certification Goal">
                    <ChipSelector options={CERT_OPTIONS} value={projectPreferences.certification_goal} onChange={v => setProjPref('certification_goal', v)} />
                  </QuestionBlock>
                  <QuestionBlock label="Expected Design Lifespan">
                    <ChipSelector options={LIFESPAN_OPTIONS} value={projectPreferences.design_lifespan} onChange={v => setProjPref('design_lifespan', v)} />
                  </QuestionBlock>
                  <QuestionBlock label="Maintenance Tolerance">
                    <ChipSelector options={MAINTENANCE_OPTIONS} value={projectPreferences.maintenance_tolerance} onChange={v => setProjPref('maintenance_tolerance', v)} />
                  </QuestionBlock>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.5rem 0' }} />

                {/* 12. Aesthetic Importance Slider */}
                <QuestionBlock label="Aesthetic Importance" hint="How important is the visual appearance relative to functional performance?">
                  <AestheticSlider
                    value={projectPreferences.aesthetic_importance}
                    onChange={v => setProjPref('aesthetic_importance', v)}
                  />
                </QuestionBlock>

                {/* Future: Operational Constraints — reserved for Version 2 */}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn-premium" style={{ width: '100%', fontSize: '0.9rem', padding: '1.2rem' }}>
            Continue → Building Requirements
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
