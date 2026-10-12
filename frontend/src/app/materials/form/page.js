"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MaterialSubNav from '@/components/Materials/MaterialSubNav';
import ProjectContextStrip from '@/components/ui/ProjectContextStrip';
import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';

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
  { value: 'Single Family Residence' },
  { value: 'Multi Family Residence' },
  { value: 'Office Building' },
  { value: 'Retail / Commercial' },
  { value: 'Hotel / Hospitality' },
  { value: 'Educational Facility' },
  { value: 'Healthcare Facility' },
  { value: 'Industrial / Warehouse' },
  { value: 'Mixed Use' },
];

const PRIMARY_GOAL_OPTIONS = [
  { value: 'Lowest Initial Cost' },
  { value: 'Lowest Lifecycle Cost' },
  { value: 'Maximum Durability' },
  { value: 'Sustainability' },
  { value: 'Fast Construction' },
  { value: 'Premium Appearance' },
  { value: 'Energy Efficiency' },
  { value: 'Climate Resilience' },
];

const ARCH_STYLE_OPTIONS = [
  { value: 'Modern' },
  { value: 'Contemporary' },
  { value: 'Tropical' },
  { value: 'Minimalist' },
  { value: 'Traditional' },
  { value: 'Industrial' },
  { value: 'Luxury' },
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
      {options.map(opt => {
        const label = typeof opt === 'string' ? opt : opt.value;
        const active = isActive(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => handleClick(label)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '3px',
              border: active ? '1.5px solid #143825' : '1px solid rgba(25, 30, 27, 0.15)',
              background: active ? '#143825' : '#FFFFFF',
              color: active ? '#FCFAF6' : '#262B28',
              boxShadow: active ? '0 2px 8px rgba(26, 56, 43, 0.2)' : 'none',
              fontSize: '0.80rem',
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {active && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#B8583B', display: 'inline-block' }} />}
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
        <span style={{ fontSize: '0.78rem', color: '#6A5646', fontWeight: 600 }}>Functional</span>
        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#8C5929', minWidth: '2ch', textAlign: 'center' }}>{value}</span>
        <span style={{ fontSize: '0.78rem', color: '#6A5646', fontWeight: 600 }}>Premium Visual</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#B57E44', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{ fontSize: '0.68rem', color: n === value ? '#8C5929' : '#8A7666', fontWeight: n === value ? 800 : 500 }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({ label, children, hint }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.84rem',
        fontWeight: 750,
        color: '#20150D',
        marginBottom: hint ? '0.25rem' : '0.65rem',
        fontFamily: 'Space Grotesk, sans-serif',
        letterSpacing: '0.02em',
      }}>
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: '0.74rem', color: '#6A5646', margin: '0 0 0.65rem', lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function ProgressBar({ sections, current }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sections.length}, 1fr)`, gap: '1.25rem' }}>
      {sections.map((label, idx) => {
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <div key={label} style={{
            borderTop: isActive ? '3px solid #143825' : isDone ? '3px solid #4A604F' : '3px solid rgba(25, 30, 27, 0.12)',
            paddingTop: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: isActive ? '#143825' : isDone ? '#4A604F' : '#7C8681',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              0{idx + 1} / {isDone ? 'COMPLETED' : isActive ? 'ACTIVE STAGE' : 'PENDING'}
            </span>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.78rem',
              fontWeight: isActive ? 800 : 600,
              color: isActive ? '#181B1A' : isDone ? '#262B28' : '#7C8681',
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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

  const SECTION_LABELS = ['Building Context', 'Project Preferences', 'Performance & Lifespan'];

  return (
    <div className="arch-page-canvas" style={{ background: '#FAF7F0', minHeight: '100vh' }}>
      <Header />
      <MaterialSubNav />

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '1rem 2rem 5rem' }}>
        <style>{`
          .arch-form-card {
            background: #FFFFFF;
            border: 1px solid rgba(25, 30, 27, 0.14);
            border-radius: 4px;
            padding: 1.8rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 18px rgba(24, 27, 26, 0.03);
            transition: all 0.2s ease;
          }
          .arch-form-card:hover {
            border-color: rgba(26, 56, 43, 0.3);
          }
          .tech-label {
            display: block;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.74rem;
            font-weight: 700;
            color: #181B1A;
            margin-bottom: 0.5rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .premium-input, .premium-select {
            width: 100%;
            padding: 0.75rem 0.95rem;
            border-radius: 3px;
            background: #FBF9F5;
            border: 1px solid rgba(25, 30, 27, 0.16);
            color: #181B1A;
            font-size: 0.88rem;
            font-family: 'Space Grotesk', sans-serif;
            outline: none;
            transition: border-color 0.2s;
          }
          .premium-input:focus, .premium-select:focus {
            border-color: #143825;
            background: #FFFFFF;
          }
        `}</style>

        <ModuleHeroBanner
          track="03 / MATERIAL INTELLIGENCE"
          kicker="INTAKE WORKSHEET"
          title="PROJECT BRIEF & MATERIAL INTAKE"
          subtitle="Step 1 of the hybrid material recommendation pipeline. Define functional program, structural system constraints, and sustainability targets across Sri Lanka's 14 climatic zones."
          imageSrc="/materials_samples.png"
          imageAlt="Sustainable Material Samples"
        />

        {/* Progress indicator */}
        <div className="arch-form-card" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.75rem' }}>
          <ProgressBar sections={SECTION_LABELS} current={activeSection} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Section 1: Building Information ─────────────────────────── */}
          <div
            className="arch-form-card"
            style={{
              cursor: 'pointer',
              borderLeft: activeSection === 0 ? '4px solid #143825' : '1px solid rgba(25, 30, 27, 0.14)'
            }}
            onClick={() => setActiveSection(0)}
          >
              <h2 style={{
                fontSize: '1rem',
                fontFamily: 'Space Grotesk',
                fontWeight: 800,
                color: '#20150D',
                marginBottom: activeSection === 0 ? '1.4rem' : 0,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                Building Information
                <span style={{ fontSize: '0.78rem', color: '#8C5929', fontWeight: 700 }}>{activeSection === 0 ? '▲' : '▼'}</span>
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
              className="arch-form-card"
              style={{
                cursor: 'pointer',
                borderLeft: activeSection === 1 ? '4px solid #143825' : '1px solid rgba(25, 30, 27, 0.14)'
              }}
              onClick={() => setActiveSection(1)}
            >
              <h2 style={{
                fontSize: '0.95rem',
                fontFamily: 'Space Grotesk',
                fontWeight: 800,
                color: '#181B1A',
                marginBottom: activeSection === 1 ? '1.4rem' : 0,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                02 / Project Preferences
                <span style={{ fontSize: '0.78rem', color: '#143825', fontWeight: 700 }}>{activeSection === 1 ? '▲' : '▼'}</span>
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
              className="arch-form-card"
              style={{
                cursor: 'pointer',
                borderLeft: activeSection === 2 ? '4px solid #B8583B' : '1px solid rgba(25, 30, 27, 0.14)'
              }}
              onClick={() => setActiveSection(2)}
            >
              <h2 style={{
                fontSize: '0.95rem',
                fontFamily: 'Space Grotesk',
                fontWeight: 800,
                color: '#181B1A',
                marginBottom: activeSection === 2 ? '0.6rem' : 0,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                03 / Requirements &amp; Priorities
                <span style={{ fontSize: '0.78rem', color: '#B8583B', fontWeight: 700 }}>{activeSection === 2 ? '▲' : '▼'}</span>
              </h2>

              {activeSection === 2 && (
                <div onClick={e => e.stopPropagation()}>
                  <p style={{ fontSize: '0.84rem', color: '#6A5646', marginBottom: '2rem', fontStyle: 'italic', fontWeight: 400 }}>
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
                  <div style={{ height: '1px', background: 'rgba(181, 126, 68, 0.20)', margin: '1.5rem 0' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C5929', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'Space Grotesk' }}>Performance Requirements</div>

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
                  <div style={{ height: '1px', background: 'rgba(181, 126, 68, 0.20)', margin: '1.5rem 0' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8C5929', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'Space Grotesk' }}>Sourcing, Compliance & Longevity</div>

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
                  <div style={{ height: '1px', background: 'rgba(181, 126, 68, 0.20)', margin: '1.5rem 0' }} />

                  {/* 12. Aesthetic Importance Slider */}
                  <QuestionBlock label="Aesthetic Importance" hint="How important is the visual appearance relative to functional performance?">
                    <AestheticSlider
                      value={projectPreferences.aesthetic_importance}
                      onChange={v => setProjPref('aesthetic_importance', v)}
                    />
                  </QuestionBlock>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: '100%',
                fontSize: '0.86rem',
                fontWeight: 800,
                padding: '1.1rem',
                borderRadius: '4px',
                background: '#143825',
                color: '#FCFAF6',
                border: '1px solid #143825',
                boxShadow: '0 4px 14px rgba(26, 56, 43, 0.25)',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                fontFamily: 'Space Grotesk, sans-serif',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Continue to Building Requirements →
            </button>
          </form>
        </main>

        <Footer />
      </div>
  );
}
