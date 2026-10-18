"use client";
import { useState, useEffect } from 'react';
import LazyAiHint from '@/components/ui/LazyAiHint.jsx';
import { useRouter } from 'next/navigation';
import { useMaterial } from '@/context/MaterialContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MaterialSubNav from '@/components/Materials/MaterialSubNav';

import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';

/* ══════════════════════════════════════════════════════════════
   Static option data
══════════════════════════════════════════════════════════════ */
const AI_PRIORITIES = [
  { key: 'sustainability',     label: 'Sustainability',     desc: 'Eco-friendly materials & low carbon' },
  { key: 'cost',               label: 'Cost Efficiency',    desc: 'Minimise initial & lifecycle cost' },
  { key: 'durability',         label: 'Durability',         desc: 'Long service life & structural strength' },
  { key: 'low_maintenance',    label: 'Low Maintenance',    desc: 'Minimal upkeep required' },
  { key: 'thermal_comfort',    label: 'Thermal Comfort',    desc: 'Insulation & heat management' },
  { key: 'energy_efficiency',  label: 'Energy Efficiency',  desc: 'Reduce operational energy use' },
  { key: 'aesthetics',         label: 'Aesthetics',         desc: 'Visual quality & finish' },
  { key: 'construction_speed', label: 'Construction Speed', desc: 'Fast build, quick occupancy' },
];

/* ─── Residential ─────────────────────────────────────────── */
const RES_DEFAULTS = {
  bedrooms: 3, bathrooms: 2, living_rooms: 1,
  kitchen_size: 'Medium', elderly_occupants: 0, children_count: 0,
  total_occupants: 4, garden: false, balcony: false,
  solar_ready: false, rainwater_harvesting: false,
  home_office: false, gym_room: false, store_room: false,
  cross_ventilation: 'Medium', natural_light: 'Medium',
  future_expansion: 'None',
};

/* ─── Commercial / Office ─────────────────────────────────── */
const COM_DEFAULTS = {
  office_count: 10, meeting_rooms: 3, reception: true,
  parking_spaces: 20, lift_required: false,
  server_room: false, cafeteria: false,
  daily_visitors: 100, operating_hours: '9–5',
  cross_ventilation: 'Low', natural_light: 'High',
  future_expansion: 'Horizontal',
};

/* ─── Industrial ──────────────────────────────────────────── */
const IND_DEFAULTS = {
  production_area: 500, warehouse_area: 300,
  loading_dock: false, crane_required: false,
  heavy_machinery: false, chemical_storage: false,
  fire_safety_priority: 'Standard',
  workforce_size: 50,
  heavy_vehicle_access: false,
  future_expansion: 'Horizontal',
};

/* ─── Educational ─────────────────────────────────────────── */
const EDU_DEFAULTS = {
  student_count: 300, classroom_count: 12,
  computer_labs: 1, science_labs: 1,
  library: true, auditorium: false,
  sports_facilities: 'None', staff_offices: 10,
  future_expansion: 'None',
};

/* ─── Healthcare ──────────────────────────────────────────── */
const HLT_DEFAULTS = {
  bed_count: 50, icu_beds: 5, operation_theatres: 2,
  consultation_rooms: 10, emergency_facilities: false,
  pharmacy: true, medical_equipment_loads: 'Standard',
  future_expansion: 'Vertical',
};

/* ─── Hotel ───────────────────────────────────────────────── */
const HOT_DEFAULTS = {
  room_count: 50, star_rating: 3,
  restaurant_capacity: 80, conference_rooms: 2,
  gym: false, pool: false, spa: false,
  parking_spaces: 40, future_expansion: 'Vertical',
};

function getDefaults(buildingType) {
  const bt = (buildingType || '').toLowerCase();
  if (bt.includes('commercial') || bt.includes('office') || bt.includes('mixed') || bt.includes('retail')) return COM_DEFAULTS;
  if (bt.includes('industrial')) return IND_DEFAULTS;
  if (bt.includes('educational')) return EDU_DEFAULTS;
  if (bt.includes('healthcare')) return HLT_DEFAULTS;
  if (bt.includes('hotel') || bt.includes('hospitality')) return HOT_DEFAULTS;
  return RES_DEFAULTS;
}

function getGroup(buildingType) {
  const bt = (buildingType || '').toLowerCase();
  if (bt.includes('commercial') || bt.includes('office') || bt.includes('mixed') || bt.includes('retail')) return 'commercial';
  if (bt.includes('industrial')) return 'industrial';
  if (bt.includes('educational')) return 'educational';
  if (bt.includes('healthcare')) return 'healthcare';
  if (bt.includes('hotel') || bt.includes('hospitality')) return 'hotel';
  return 'residential';
}

/* ══════════════════════════════════════════════════════════════
   Reusable field components
══════════════════════════════════════════════════════════════ */
const FS = {
  label: "tech-label",
  input: "premium-input",
  select: "premium-select",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label className={FS.label}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, desc }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: value ? 'rgba(46, 99, 67, 0.12)' : '#FAF7F2',
        border: `1.5px solid ${value ? '#2E6343' : 'rgba(181, 126, 68, 0.28)'}`,
        boxShadow: value ? '0 0 12px rgba(46, 99, 67, 0.15)' : 'none',
        borderRadius: '12px', padding: '0.75rem 1rem', cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '0.65rem',
      }}
    >
      <div style={{
        width: '36px', height: '20px', borderRadius: '10px', flexShrink: 0,
        background: value ? '#2E6343' : 'rgba(181, 126, 68, 0.35)',
        boxShadow: value ? '0 0 10px rgba(46, 99, 67, 0.35)' : 'none',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '19px' : '3px',
          width: '14px', height: '14px', borderRadius: '50%',
          background: '#FFFFFF',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: value ? '#2E6343' : '#20150D' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.74rem', color: '#6A5646', marginTop: '2px', fontWeight: 500 }}>{desc}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(181, 126, 68, 0.20)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2E6343', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.78rem', color: '#6A5646', marginTop: '2px', fontWeight: 500 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Dynamic section renderers (one per building group)
══════════════════════════════════════════════════════════════ */
function ResidentialSections({ data, set }) {
  return (
    <>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Interior Layout" subtitle="Room count and kitchen configuration" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Bedrooms"><input type="number" min="1" max="20" className={FS.input} value={data.bedrooms} onChange={e => set('bedrooms', +e.target.value)} /></Field>
          <Field label="Bathrooms"><input type="number" min="1" max="10" className={FS.input} value={data.bathrooms} onChange={e => set('bathrooms', +e.target.value)} /></Field>
          <Field label="Living Rooms"><input type="number" min="1" max="5" className={FS.input} value={data.living_rooms} onChange={e => set('living_rooms', +e.target.value)} /></Field>
          <Field label="Kitchen Size">
            <select className={FS.select} value={data.kitchen_size} onChange={e => set('kitchen_size', e.target.value)}>
              {['Small', 'Medium', 'Open-Plan', 'Large'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Occupancy Profile" subtitle="Who will live in this building?" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Total Occupants"><input type="number" min="1" max="50" className={FS.input} value={data.total_occupants} onChange={e => set('total_occupants', +e.target.value)} /></Field>
          <Field label="Elderly Occupants"><input type="number" min="0" max="20" className={FS.input} value={data.elderly_occupants} onChange={e => set('elderly_occupants', +e.target.value)} /></Field>
          <Field label="Children (under 12)"><input type="number" min="0" max="20" className={FS.input} value={data.children_count} onChange={e => set('children_count', +e.target.value)} /></Field>
        </div>
        {data.elderly_occupants > 0 && <LazyAiHint color="green">AI will recommend non-slip flooring and accessibility-friendly finishes.</LazyAiHint>}
        {data.children_count > 0 && <LazyAiHint color="blue">AI will prioritise rounded-edge finishes and low-VOC, child-safe materials.</LazyAiHint>}
      </div>

      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Outdoor & Envelope" subtitle="External spaces and envelope features" />
        <Toggle label="Garden / Landscaping" value={data.garden} onChange={v => set('garden', v)} desc="Will the building have outdoor garden space?" />
        <Toggle label="Balcony / Terrace" value={data.balcony} onChange={v => set('balcony', v)} desc="One or more balconies required" />
      </div>

      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Green Utilities" subtitle="Energy and water systems" />
        <Toggle label="Solar Panel Ready" value={data.solar_ready} onChange={v => set('solar_ready', v)} desc="Roof will be optimised for PV panel installation" />
        <Toggle label="Rainwater Harvesting" value={data.rainwater_harvesting} onChange={v => set('rainwater_harvesting', v)} desc="Roof material selected for water collection compatibility" />
        {data.solar_ready && <LazyAiHint color="amber">Roofing materials will be optimised for PV load bearing and thermal performance.</LazyAiHint>}
        {data.rainwater_harvesting && <LazyAiHint color="cyan">Roof material will be selected for water-collection compatibility and non-toxicity.</LazyAiHint>}
      </div>

      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Special Rooms" subtitle="Additional functional spaces required" />
        <Toggle label="Home Office" value={data.home_office} onChange={v => set('home_office', v)} desc="Acoustic insulation will be prioritised" />
        <Toggle label="Gym / Recreation Room" value={data.gym_room} onChange={v => set('gym_room', v)} desc="Impact-resistant flooring recommended" />
        <Toggle label="Store Room / Pantry" value={data.store_room} onChange={v => set('store_room', v)} />
      </div>

      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Ventilation & Natural Light" subtitle="Passive environmental control preferences" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Field label="Cross Ventilation Priority">
            <select className={FS.select} value={data.cross_ventilation} onChange={e => set('cross_ventilation', e.target.value)}>
              {['Low', 'Medium', 'High'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Natural Light Priority">
            <select className={FS.select} value={data.natural_light} onChange={e => set('natural_light', e.target.value)}>
              {['Low', 'Medium', 'High'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        {data.cross_ventilation === 'High' && <LazyAiHint color="cyan">Larger window apertures and louvre systems will be recommended.</LazyAiHint>}
      </div>

      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Future Expansion" subtitle="Structural provisions for future growth" />
        <Field label="Expansion Plans">
          <select className={FS.select} value={data.future_expansion} onChange={e => set('future_expansion', e.target.value)}>
            {['None', 'Add a Floor (Vertical)', 'Extend Outward (Horizontal)', 'Both'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        {data.future_expansion !== 'None' && <LazyAiHint color="green">Higher structural safety factor will be applied in material selection.</LazyAiHint>}
      </div>
    </>
  );
}

function CommercialSections({ data, set }) {
  return (
    <>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Office Spaces" subtitle="Workspace and occupancy configuration" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Office / Workspace Count"><input type="number" min="1" className={FS.input} value={data.office_count} onChange={e => set('office_count', +e.target.value)} /></Field>
          <Field label="Meeting Rooms"><input type="number" min="0" className={FS.input} value={data.meeting_rooms} onChange={e => set('meeting_rooms', +e.target.value)} /></Field>
          <Field label="Parking Spaces"><input type="number" min="0" className={FS.input} value={data.parking_spaces} onChange={e => set('parking_spaces', +e.target.value)} /></Field>
          <Field label="Daily Visitors (est.)"><input type="number" min="0" className={FS.input} value={data.daily_visitors} onChange={e => set('daily_visitors', +e.target.value)} /></Field>
          <Field label="Operating Hours">
            <select className={FS.select} value={data.operating_hours} onChange={e => set('operating_hours', e.target.value)}>
              {['9–5', '8–6', '24/7', 'Shift Work'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Natural Light Priority">
            <select className={FS.select} value={data.natural_light} onChange={e => set('natural_light', e.target.value)}>
              {['Low', 'Medium', 'High'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Facilities & Services" />
        <Toggle label="Reception Area" value={data.reception} onChange={v => set('reception', v)} />
        <Toggle label="Lift / Elevator Required" value={data.lift_required} onChange={v => set('lift_required', v)} desc="Structural provisions for shaft and machine room" />
        <Toggle label="Server / IT Room" value={data.server_room} onChange={v => set('server_room', v)} desc="Raised floor and EMI-shielding finishes" />
        <Toggle label="Cafeteria / Pantry" value={data.cafeteria} onChange={v => set('cafeteria', v)} />
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Future Expansion" />
        <Field label="Expansion Plans">
          <select className={FS.select} value={data.future_expansion} onChange={e => set('future_expansion', e.target.value)}>
            {['None', 'Vertical', 'Horizontal', 'Both'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>
    </>
  );
}

function IndustrialSections({ data, set }) {
  return (
    <>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Facility Dimensions" subtitle="Production and storage area estimates" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Field label="Production Area (m²)"><input type="number" min="0" className={FS.input} value={data.production_area} onChange={e => set('production_area', +e.target.value)} /></Field>
          <Field label="Warehouse Area (m²)"><input type="number" min="0" className={FS.input} value={data.warehouse_area} onChange={e => set('warehouse_area', +e.target.value)} /></Field>
          <Field label="Workforce Size"><input type="number" min="1" className={FS.input} value={data.workforce_size} onChange={e => set('workforce_size', +e.target.value)} /></Field>
          <Field label="Fire Safety Priority">
            <select className={FS.select} value={data.fire_safety_priority} onChange={e => set('fire_safety_priority', e.target.value)}>
              {['Standard', 'Enhanced', 'High', 'Critical'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Equipment & Access Requirements" />
        <Toggle label="Loading Dock Required" value={data.loading_dock} onChange={v => set('loading_dock', v)} />
        <Toggle label="Overhead Crane Required" value={data.crane_required} onChange={v => set('crane_required', v)} desc="Structural steel frame with crane rail provisions" />
        <Toggle label="Heavy Machinery" value={data.heavy_machinery} onChange={v => set('heavy_machinery', v)} desc="Reinforced slab and vibration-damping flooring" />
        <Toggle label="Heavy Vehicle Access" value={data.heavy_vehicle_access} onChange={v => set('heavy_vehicle_access', v)} />
        <Toggle label="Chemical / Hazmat Storage" value={data.chemical_storage} onChange={v => set('chemical_storage', v)} desc="Chemical-resistant flooring and coatings applied" />
        {data.chemical_storage && <LazyAiHint color="red">Acid-resistant and anti-static coatings will be prioritised in recommendation.</LazyAiHint>}
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Future Expansion" />
        <Field label="Expansion Plans">
          <select className={FS.select} value={data.future_expansion} onChange={e => set('future_expansion', e.target.value)}>
            {['None', 'Vertical', 'Horizontal', 'Both'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>
    </>
  );
}

function EducationalSections({ data, set }) {
  return (
    <>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Educational Facility" subtitle="Academic space and capacity requirements" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Student Capacity"><input type="number" min="10" className={FS.input} value={data.student_count} onChange={e => set('student_count', +e.target.value)} /></Field>
          <Field label="Classrooms"><input type="number" min="1" className={FS.input} value={data.classroom_count} onChange={e => set('classroom_count', +e.target.value)} /></Field>
          <Field label="Computer Labs"><input type="number" min="0" className={FS.input} value={data.computer_labs} onChange={e => set('computer_labs', +e.target.value)} /></Field>
          <Field label="Science Labs"><input type="number" min="0" className={FS.input} value={data.science_labs} onChange={e => set('science_labs', +e.target.value)} /></Field>
          <Field label="Staff Offices"><input type="number" min="0" className={FS.input} value={data.staff_offices} onChange={e => set('staff_offices', +e.target.value)} /></Field>
          <Field label="Sports Facilities">
            <select className={FS.select} value={data.sports_facilities} onChange={e => set('sports_facilities', e.target.value)}>
              {['None', 'Indoor', 'Outdoor', 'Both'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Special Facilities" />
        <Toggle label="Library" value={data.library} onChange={v => set('library', v)} />
        <Toggle label="Auditorium / Assembly Hall" value={data.auditorium} onChange={v => set('auditorium', v)} desc="Acoustic panels and tiered floor recommended" />
      </div>
    </>
  );
}

function HealthcareSections({ data, set }) {
  return (
    <>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Healthcare Facility" subtitle="Clinical space and capacity requirements" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Total Beds"><input type="number" min="1" className={FS.input} value={data.bed_count} onChange={e => set('bed_count', +e.target.value)} /></Field>
          <Field label="ICU Beds"><input type="number" min="0" className={FS.input} value={data.icu_beds} onChange={e => set('icu_beds', +e.target.value)} /></Field>
          <Field label="Operation Theatres"><input type="number" min="0" className={FS.input} value={data.operation_theatres} onChange={e => set('operation_theatres', +e.target.value)} /></Field>
          <Field label="Consultation Rooms"><input type="number" min="1" className={FS.input} value={data.consultation_rooms} onChange={e => set('consultation_rooms', +e.target.value)} /></Field>
          <Field label="Medical Equipment Loads">
            <select className={FS.select} value={data.medical_equipment_loads} onChange={e => set('medical_equipment_loads', e.target.value)}>
              {['Standard', 'Heavy', 'Critical'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Emergency & Special Services" />
        <Toggle label="Emergency Department" value={data.emergency_facilities} onChange={v => set('emergency_facilities', v)} />
        <Toggle label="Pharmacy" value={data.pharmacy} onChange={v => set('pharmacy', v)} />
      </div>
    </>
  );
}

function HotelSections({ data, set }) {
  return (
    <>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Hotel Specification" subtitle="Room count and star rating" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Total Rooms"><input type="number" min="5" className={FS.input} value={data.room_count} onChange={e => set('room_count', +e.target.value)} /></Field>
          <Field label="Star Rating Target">
            <select className={FS.select} value={data.star_rating} onChange={e => set('star_rating', +e.target.value)}>
              {[3, 4, 5].map(o => <option key={o} value={o}>{o} Star</option>)}
            </select>
          </Field>
          <Field label="Restaurant Capacity"><input type="number" min="0" className={FS.input} value={data.restaurant_capacity} onChange={e => set('restaurant_capacity', +e.target.value)} /></Field>
          <Field label="Conference Rooms"><input type="number" min="0" className={FS.input} value={data.conference_rooms} onChange={e => set('conference_rooms', +e.target.value)} /></Field>
          <Field label="Parking Spaces"><input type="number" min="0" className={FS.input} value={data.parking_spaces} onChange={e => set('parking_spaces', +e.target.value)} /></Field>
        </div>
      </div>
      <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title="Premium Facilities" />
        <Toggle label="Fitness / Gym" value={data.gym} onChange={v => set('gym', v)} />
        <Toggle label="Swimming Pool" value={data.pool} onChange={v => set('pool', v)} desc="Waterproofing and corrosion-resistant materials required" />
        <Toggle label="Spa / Wellness Centre" value={data.spa} onChange={v => set('spa', v)} />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   AI Priority Ranking Card
══════════════════════════════════════════════════════════════ */
function PriorityCard({ item, rank, onUp, onDown, isFirst, isLast }) {
  const isTop3 = rank <= 3;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: isTop3 ? 'rgba(46, 99, 67, 0.08)' : '#FAF7F2',
      border: `1.5px solid ${isTop3 ? 'rgba(46, 99, 67, 0.40)' : 'rgba(181, 126, 68, 0.25)'}`,
      boxShadow: isTop3 ? '0 0 15px rgba(46, 99, 67, 0.12)' : 'none',
      borderRadius: '12px', padding: '0.85rem 1rem',
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: isTop3 ? 'linear-gradient(135deg, #2E6343 0%, #1A402A 100%)' : '#FAF7F2',
        color: isTop3 ? '#FFFFFF' : '#8A7666',
        border: isTop3 ? 'none' : '1px solid rgba(181, 126, 68, 0.3)',
        boxShadow: isTop3 ? '0 0 10px rgba(46, 99, 67, 0.35)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 900,
      }}>{rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#20150D' }}>{item.label}</span>
          {isTop3 && <span style={{ fontSize: '0.65rem', background: 'rgba(46, 99, 67, 0.15)', color: '#2E6343', padding: '2px 7px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.5px' }}>HIGH WEIGHT</span>}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#6A5646', marginTop: '2px', fontWeight: 500 }}>{item.desc}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <button type="button" onClick={onUp} disabled={isFirst} style={{ background: '#FFFFFF', border: '1px solid rgba(181, 126, 68, 0.30)', borderRadius: '6px', color: isFirst ? 'rgba(0,0,0,0.2)' : '#20150D', width: '28px', height: '24px', cursor: isFirst ? 'default' : 'pointer', fontSize: '0.65rem', transition: 'all 0.15s' }}>▲</button>
        <button type="button" onClick={onDown} disabled={isLast} style={{ background: '#FFFFFF', border: '1px solid rgba(181, 126, 68, 0.30)', borderRadius: '6px', color: isLast ? 'rgba(0,0,0,0.2)' : '#20150D', width: '28px', height: '24px', cursor: isLast ? 'default' : 'pointer', fontSize: '0.65rem', transition: 'all 0.15s' }}>▼</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Page Component
══════════════════════════════════════════════════════════════ */
export default function BuildingRequirementsPage() {
  const router = useRouter();
  const { buildingInfo, setBuildingInfo, buildingRequirements, setBuildingRequirements } = useMaterial();

  const buildingType = buildingInfo?.building_type || 'Residential';
  const group = getGroup(buildingType);

  const [data, setData] = useState(() => {
    if (buildingRequirements && buildingRequirements._group === group) {
      return buildingRequirements;
    }
    return { ...getDefaults(buildingType), _group: group };
  });

  useEffect(() => {
    const newGroup = getGroup(buildingType);
    if (data._group !== newGroup) {
      setData({ ...getDefaults(buildingType), _group: newGroup });
    }
  }, [buildingType]);

  const [priorities, setPriorities] = useState(() => {
    if (buildingRequirements?.ai_priorities) {
      const saved = buildingRequirements.ai_priorities;
      return saved.map(key => AI_PRIORITIES.find(p => p.key === key)).filter(Boolean);
    }
    return [...AI_PRIORITIES];
  });

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...priorities];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setPriorities(next);
  };
  const moveDown = (idx) => {
    if (idx === priorities.length - 1) return;
    const next = [...priorities];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setPriorities(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      _group: group,
      building_type: buildingType,
      ai_priorities: priorities.map(p => p.key),
      ai_priority_weights: Object.fromEntries(
        priorities.map((p, i) => [p.key, parseFloat(((priorities.length - i) / priorities.length).toFixed(3))])
      ),
    };
    setBuildingRequirements(payload);
    localStorage.setItem('buildingRequirements', JSON.stringify(payload));

    const floorsCount = parseInt(data.floor_count || data.floors || data.stories || data.num_floors || buildingInfo?.floor_count || 2, 10);
    const updatedInfo = {
      ...buildingInfo,
      building_type: buildingType,
      floor_count: floorsCount,
    };
    if (setBuildingInfo) {
      setBuildingInfo(updatedInfo);
    }
    localStorage.setItem('buildingInfo', JSON.stringify(updatedInfo));

    router.push('/materials/processing');
  };

  const stepDot = (active, done) => ({
    width: '28px', height: '28px', borderRadius: '3px',
    background: done ? '#143825' : active ? '#B8583B' : '#FFFFFF',
    color: done || active ? '#FCFAF6' : '#7C8681',
    border: active ? '1px solid #B8583B' : done ? '1px solid #143825' : '1px solid rgba(25, 30, 27, 0.16)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 800,
    fontFamily: 'Space Grotesk, sans-serif',
  });

  return (
    <div className="arch-page-canvas" style={{ background: '#FAF7F0', minHeight: '100vh' }}>
      <Header />
      <MaterialSubNav />

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '1rem 2rem 5rem', position: 'relative', zIndex: 10 }}>
        <ModuleHeroBanner
          track="03 / MATERIAL INTELLIGENCE"
          kicker="SLS ENGINEERING RULE CONSTRAINTS"
          title="BUILDING REQUIREMENTS & PERFORMANCE"
          subtitle={`Configure spatial parameters, occupancy profiles, and engineering priorities for your ${buildingType} project.`}
          imageSrc="/materials_samples.png"
          imageAlt="Sustainable Material Samples and Testing"
        />

        {/* Progress stepper */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
          background: '#FFFFFF',
          border: '1px solid rgba(25, 30, 27, 0.12)',
          padding: '1rem 1.25rem',
          borderRadius: '4px',
        }}>
          {[
            { n: '1', label: 'Brief Specification', done: true },
            { n: '2', label: 'Building Requirements', active: true },
            { n: '3', label: 'Rule Engine Check' },
            { n: '4', label: 'Material Decisions' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={stepDot(s.active, s.done)}>{s.done ? '✓' : s.n}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.62rem', fontFamily: 'Space Grotesk', color: '#7C8681', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STAGE 0{i + 1}</span>
                <span style={{ fontSize: '0.74rem', fontWeight: s.active || s.done ? 700 : 500, color: s.active ? '#181B1A' : s.done ? '#143825' : '#7C8681', fontFamily: 'Space Grotesk' }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(181, 126, 68, 0.28)', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.8rem', boxShadow: '0 8px 24px rgba(45, 30, 20, 0.06)' }}>
              {group === 'residential'  && <ResidentialSections  data={data} set={set} />}
              {group === 'commercial'   && <CommercialSections   data={data} set={set} />}
              {group === 'industrial'   && <IndustrialSections   data={data} set={set} />}
              {group === 'educational'  && <EducationalSections  data={data} set={set} />}
              {group === 'healthcare'   && <HealthcareSections   data={data} set={set} />}
              {group === 'hotel'        && <HotelSections        data={data} set={set} />}
            </div>

            {/* AI Design Priorities */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(181, 126, 68, 0.28)', borderRadius: '20px', padding: '1.8rem', marginBottom: '2rem', boxShadow: '0 8px 24px rgba(45, 30, 20, 0.06)' }}>
              <SectionHeader title="AI Design Priorities" subtitle="Rank what matters most — these become weights in the recommendation algorithm" />
              <p style={{ fontSize: '0.8rem', color: '#6A5646', marginBottom: '1.25rem', fontStyle: 'italic', fontWeight: 500 }}>
                Use ▲▼ arrows to re-rank. Top 3 (highlighted) receive the highest weighting.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {priorities.map((item, idx) => (
                  <PriorityCard key={item.key} item={item} rank={idx + 1} onUp={() => moveUp(idx)} onDown={() => moveDown(idx)} isFirst={idx === 0} isLast={idx === priorities.length - 1} />
                ))}
              </div>
              <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: 'rgba(46, 99, 67, 0.08)', border: '1px solid rgba(46, 99, 67, 0.25)', borderRadius: '10px', fontSize: '0.8rem', color: '#2E6343', fontWeight: 600 }}>
                📊 These priorities are converted to numerical weights (1.0 → 0.125) and passed into the Multi-Criteria Decision Making engine.
              </div>
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => router.push('/materials/form')}
                style={{
                  padding: '0.85rem 1.6rem',
                  background: '#FFFFFF',
                  border: '1px solid rgba(25, 30, 27, 0.20)',
                  borderRadius: '4px',
                  color: '#181B1A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Space Grotesk',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                ← Back to Specification
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  maxWidth: '380px',
                  fontSize: '0.82rem',
                  padding: '0.95rem 1.8rem',
                  background: '#143825',
                  color: '#FFFFFF',
                  border: '1px solid #143825',
                  borderRadius: '4px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(26, 56, 43, 0.25)',
                  fontFamily: 'Space Grotesk',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Generate AI Recommendations →
              </button>
            </div>

          </form>
        </main>

        <Footer />
      </div>
  );
}
