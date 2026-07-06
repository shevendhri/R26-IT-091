"use client";
import LoadingOverlay from '@/components/LoadingOverlay';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMaterial } from '@/context/MaterialContext';

export default function ProcessingPage() {
  const router = useRouter();
  const { buildingInfo, preferences, projectPreferences, buildingRequirements, setReportData, setBlueprint, persistReportData } = useMaterial();
  
  const [loadingStep, setLoadingStep] = useState('Initialising Climate Analysis');

  useEffect(() => {
    console.log('[Processing] component mounted'); console.log('[PROCESSING] Starting recommendation request');
    const steps = [
      [0,    'Loading Geoclimatic Constraints'],
      [900,  'Resolving Multi-Criteria Decision Weights'],
      [1800, 'Running ML Hybrid Recommendation Engine'],
      [2700, 'Extracting XAI Explainability Features'],
      [3400, 'Ranking Materials by Hybrid Score'],
    ];
    const timers = steps.map(([delay, label]) =>
      setTimeout(() => setLoadingStep(label), delay)
    );

    const fetchRecommendations = async () => {
      try {
        console.log('[Processing] starting API call');
        // Map MaterialContext fields → API request schema
        const payload = {
          // ── Core building parameters (existing — do not remove) ────────
          buildingType:             buildingInfo.building_type      || 'Residential',
          location:                 buildingInfo.location           || 'Colombo',
          floorCount:               parseInt(buildingInfo.floor_count)  || 2,
          totalArea:                parseFloat(buildingInfo.total_area) || 170.0,
          structuralSystem:         buildingInfo.structural_system  || 'Concrete Frame',
          sustainabilityPreference: preferences.sustainability_level || 'Medium',
          budgetLevel:              preferences.budget_tier          || 'Balanced',

          // ── Project Requirements & Priorities (enrichment fields) ──────
          // These are passed as-is; current backend ignores unknown keys.
          // Future recommendation models can consume them without UI changes.
          building_usage:           projectPreferences?.building_usage            || 'Office Building',
          primary_goal:             projectPreferences?.primary_goal              || 'Maximum Durability',
          architectural_style:      projectPreferences?.architectural_style       || 'Modern',
          material_preferences:     projectPreferences?.material_preferences      || [],
          thermal_comfort_priority: projectPreferences?.thermal_comfort_priority  || 'Medium',
          energy_priority:          projectPreferences?.energy_priority           || 'Medium',
          acoustic_priority:        projectPreferences?.acoustic_priority         || 'Medium',
          fire_resistance_priority: projectPreferences?.fire_resistance_priority  || 'Standard',
          local_material_preference: projectPreferences?.local_material_preference || 'Neutral',
          certification_goal:       projectPreferences?.certification_goal        || 'None',
          design_lifespan:          projectPreferences?.design_lifespan           || '50 Years',
          maintenance_tolerance:    projectPreferences?.maintenance_tolerance     || 'Medium',
          aesthetic_importance:     projectPreferences?.aesthetic_importance      ?? 5,

          // ── New Dynamic Requirements Fields ──
          buildingRequirements:     buildingRequirements                          || {},
        };

        console.log('[Processing] payload', payload);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';
    const res = await fetch(`${apiBase}/api/recommendations/generate`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        console.log('[Processing] raw response status', res.status);
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Server error ${res.status}: ${err}`);
        }

        const data = await res.json();
        console.log('[Processing] API response', data);

        // Handle both possible response shapes
        let reportPayload = data;
        if (data.success && data.data) {
          reportPayload = data.data;
        }
        console.log('[PROCESSING] REPORT PAYLOAD', reportPayload);

        if (reportPayload.status === 'success' || reportPayload.success) {
          console.log('[Processing] setting report data');
          console.log('[PROCESSING] SETTING REPORT DATA');
          setReportData({ ...reportPayload, projectPreferences });
          console.log('[PROCESSING] SAVING TO LOCAL STORAGE');
          persistReportData({ ...reportPayload, projectPreferences });
          if (reportPayload.blueprint) {
            setBlueprint(reportPayload.blueprint);
          }
          console.log('[PROCESSING] NAVIGATING TO REPORT');
          // Small delay to ensure state updates before navigation
          setTimeout(() => router.replace('/materials/report'), 100);
        } else {
          console.warn('[Processing] API returned error status', reportPayload);
          router.replace(
            '/materials/error?msg=' + encodeURIComponent(reportPayload.detail || 'Recommendation failed')
          );
        }
      } catch (e) {
        console.error('[Processing] API error:', e);
        router.replace(
          '/materials/error?msg=' + encodeURIComponent(e.message)
        );
      }
    };

    fetchRecommendations();
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingOverlay step={loadingStep} />;
}
