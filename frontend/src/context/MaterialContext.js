"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const MaterialContext = createContext(null);
export const useMaterial = () => useContext(MaterialContext);

export const MaterialProvider = ({ children }) => {
  const [buildingInfo, setBuildingInfo] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('buildingInfo') : null;
    return saved ? JSON.parse(saved) : {
      building_type: 'Residential',
      floor_count: 2,
      total_floor_area: 170.0,
      total_area: 170.0,
      wall_area: 270.0,
      roof_area: 110.0,
      window_area: 28.0,
      door_count: 6,
      structural_system: 'Concrete Frame',
      location: 'Colloid',
    };
  });

  const [preferences, setPreferences] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('preferences') : null;
    return saved ? JSON.parse(saved) : {
      sustainability_level: 'Medium',
      budget_tier: 'Balanced',
      maintenance_preference: 'Medium',
      interior_finish: 'Modern',
      exterior_finish: 'Modern',
      material_priority: 'Durability',
    };
  });

  // ── Project Requirements & Priorities (13 engineering signals) ─────────────
  const [projectPreferences, setProjectPreferences] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('projectPreferences') : null;
    return saved ? JSON.parse(saved) : {
      building_usage:            'Office Building',
      primary_goal:              'Maximum Durability',
      architectural_style:       'Modern',
      material_preferences:      [],          // multi-select array
      thermal_comfort_priority:  'Medium',
      energy_priority:           'Medium',
      acoustic_priority:         'Medium',
      fire_resistance_priority:  'Standard',
      local_material_preference: 'Neutral',
      certification_goal:        'None',
      design_lifespan:           '50 Years',
      maintenance_tolerance:     'Medium',
      aesthetic_importance:      5,           // 1-10 slider
    };
  });

  // ── Building Requirements (adaptive questionnaire data) ─────────────────
  const [buildingRequirements, setBuildingRequirements] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('buildingRequirements') : null;
    return saved ? JSON.parse(saved) : null;
  });

  const [reportData, setReportData] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('reportData') : null;
    return saved ? JSON.parse(saved) : null;
  });

  // Hydrate reportData from localStorage on mount if not already set
  useEffect(() => {
    if (!reportData && typeof window !== 'undefined') {
      const stored = localStorage.getItem('reportData');
      if (stored) {
        try {
          setReportData(JSON.parse(stored));
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }, []);
  // Helper to persist report data synchronously
  const persistReportData = (data) => {
    if (typeof window !== 'undefined') {
      if (data) {
        localStorage.setItem('reportData', JSON.stringify(data));
      } else {
        localStorage.removeItem('reportData');
      }
      console.log('[Context] reportData persisted manually', data);
    }
  };
  const [blueprint, setBlueprint] = useState(null);

  // Sync reportData to localStorage
  // Sync reportData to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (reportData) {
        localStorage.setItem('reportData', JSON.stringify(reportData));
      }
      // Do not remove reportData from localStorage when it's null to preserve persisted state across navigation.
    }
  }, [reportData]);

  const value = {
    buildingInfo,
    setBuildingInfo,
    preferences,
    setPreferences,
    projectPreferences,
    setProjectPreferences,
    buildingRequirements,
    setBuildingRequirements,
    reportData,
    setReportData,
    persistReportData,
    blueprint,
    setBlueprint,
  };

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>;
};
