"use client";

import React, { useState, useEffect } from 'react';
import { useMaterial } from '@/context/MaterialContext';

export default function ProjectContextStrip({ customData = null }) {
  const materialContext = useMaterial();
  const [localInfo, setLocalInfo] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('buildingInfo');
        if (saved) {
          setLocalInfo(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const info = customData || materialContext?.buildingInfo || localInfo || {};
  const climate = customData?.climate_profile || {};

  const buildingType = info.building_type || 'Residential';
  const location = info.location || climate.city || 'Colombo';
  const climateZone = climate.zone || climate.type || info.climate_zone || 'Wet Zone (Maritime)';
  const area = info.total_floor_area || info.total_area || 170;
  const floors = info.floor_count || info.floors || 2;
  const structuralSystem = info.structural_system || 'Concrete Frame (SLS 614)';

  return (
    <div
      suppressHydrationWarning
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2DCD0',
        borderRadius: '4px',
        padding: '0.65rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.70rem',
        fontFamily: 'Space Grotesk, sans-serif',
        boxShadow: '0 1px 4px rgba(20, 56, 37, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#143825',
        }} />
        <span style={{ fontWeight: 800, color: '#143825', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          PROJECT CONTEXT:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: '#143825' }}>
        <div>
          <span style={{ color: '#697068', textTransform: 'uppercase', fontSize: '0.62rem' }}>TYPE: </span>
          <strong style={{ color: '#143825' }}>{buildingType}</strong>
        </div>
        <span style={{ color: '#E2DCD0' }}>|</span>
        <div>
          <span style={{ color: '#697068', textTransform: 'uppercase', fontSize: '0.62rem' }}>LOCATION: </span>
          <strong>{location}</strong>
        </div>
        <span style={{ color: '#E2DCD0' }}>|</span>
        <div>
          <span style={{ color: '#697068', textTransform: 'uppercase', fontSize: '0.62rem' }}>CLIMATE: </span>
          <strong>{climateZone}</strong>
        </div>
        <span style={{ color: '#E2DCD0' }}>|</span>
        <div>
          <span style={{ color: '#697068', textTransform: 'uppercase', fontSize: '0.62rem' }}>AREA: </span>
          <strong>{area} m²</strong>
        </div>
        <span style={{ color: '#E2DCD0' }}>|</span>
        <div>
          <span style={{ color: '#697068', textTransform: 'uppercase', fontSize: '0.62rem' }}>FLOORS: </span>
          <strong>{floors} Levels</strong>
        </div>
        <span style={{ color: '#E2DCD0' }}>|</span>
        <div>
          <span style={{ color: '#697068', textTransform: 'uppercase', fontSize: '0.62rem' }}>STRUCTURE: </span>
          <strong>{structuralSystem}</strong>
        </div>
      </div>

      <div style={{ color: '#8D6A4F', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        SOURCE: ACTIVE PROJECT BRIEF
      </div>
    </div>
  );
}
