"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const MaterialContext = createContext(null);
export const useMaterial = () => useContext(MaterialContext);

const DEFAULT_BUILDING_INFO = {
  building_type: 'Residential',
  floor_count: 2,
  total_floor_area: 170.0,
  total_area: 170.0,
  wall_area: 270.0,
  roof_area: 110.0,
  window_area: 28.0,
  door_count: 6,
  structural_system: 'Concrete Frame',
  location: 'Colombo',
};

const DEFAULT_PREFERENCES = {
  sustainability_level: 'Medium',
  budget_tier: 'Balanced',
  maintenance_preference: 'Medium',
  interior_finish: 'Modern',
  exterior_finish: 'Modern',
  material_priority: 'Durability',
};

const DEFAULT_PROJECT_PREFERENCES = {
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

export const MaterialProvider = ({ children }) => {
  const [buildingInfo, setBuildingInfo] = useState(DEFAULT_BUILDING_INFO);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [projectPreferences, setProjectPreferences] = useState(DEFAULT_PROJECT_PREFERENCES);
  const [buildingRequirements, setBuildingRequirements] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [blueprint, setBlueprint] = useState(null);

  // Hydrate from localStorage once mounted on client to prevent SSR hydration mismatches
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedInfo = localStorage.getItem('buildingInfo');
      if (savedInfo) setBuildingInfo(JSON.parse(savedInfo));
    } catch (e) {}
    try {
      const savedPref = localStorage.getItem('preferences');
      if (savedPref) setPreferences(JSON.parse(savedPref));
    } catch (e) {}
    try {
      const savedProj = localStorage.getItem('projectPreferences');
      if (savedProj) setProjectPreferences(JSON.parse(savedProj));
    } catch (e) {}
    try {
      const savedReq = localStorage.getItem('buildingRequirements');
      if (savedReq) setBuildingRequirements(JSON.parse(savedReq));
    } catch (e) {}
    try {
      const savedReport = localStorage.getItem('reportData');
      if (savedReport) setReportData(JSON.parse(savedReport));
    } catch (e) {}
  }, []);

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
    }
  };


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
