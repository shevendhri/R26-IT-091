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
        // Map MaterialContext fields → API request schema
        console.log('Payload:', {
          // ── Core building parameters (existing — do not remove) ────────
          buildingType:            buildingInfo.building_type      || 'Residential',
          location:                 buildingInfo.location           || 'Colombo',
          floorCount:               parseInt(buildingInfo.floor_count)  || 2,
          totalArea:                parseFloat(buildingInfo.total_area) || 170.0,
          structuralSystem:         buildingInfo.structural_system  || 'Concrete Frame',
          sustainabilityPreference: preferences.sustainability_level || 'Medium',
          budgetLevel:              preferences.budget_tier          || 'Balanced',
          // ── Project Requirements ... omitted for brevity ...
        });
        console.log('Payload object constructed');
        const payload = {
          // ── Core building parameters (existing — do not remove) ────────
          buildingType:            buildingInfo.building_type      || 'Residential',
          location:                 buildingInfo.location           || 'Colombo',
          floorCount:               parseInt(buildingInfo.floor_count)  || 2,
          totalArea:                parseFloat(buildingInfo.total_area) || 170.0,
          structuralSystem:         buildingInfo.structural_system  || 'Concrete Frame',
          sustainabilityPreference: preferences.sustainability_level || 'Medium',
          budgetLevel:              preferences.budget_tier          || 'Balanced',

          // ── Project Requirements & Priorities (enrichment fields) ──────
          // These are passed as-is; current backend ignores unknown keys.
          // Future recommendation models can consume them without UI changes.
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

        const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://127.0.0.1:5000');
    const res = await fetch(`${apiBase}/api/recommendations/generate`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Server error ${res.status}: ${err}`);
        }

        // Clone the response before reading as text for debug logging,
        // so the original body stream stays intact for res.json() below.
        const resClone = res.clone();
        resClone.text().then(raw => console.log('API response raw:', raw));
        const data = await res.json();
        console.log('Parsed response data:', data);

        // Handle both possible response shapes
        let reportPayload = data;
        if (data.success && data.data) {
          reportPayload = data.data;
        }

        if (reportPayload.status === 'success' || reportPayload.success) {
          setReportData({ ...reportPayload, projectPreferences });
          persistReportData({ ...reportPayload, projectPreferences });
          if (reportPayload.blueprint) {
            setBlueprint(reportPayload.blueprint);
          }
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
