// reportHelpers.js – safe getters for reportData
export const get = (obj, path, defaultValue) => {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? defaultValue;
};

export const getProjectSummary = (reportData) => {
  const ps = reportData?.project_summary || {};
  return {
    buildingType: ps.building_type || '—',
    location: ps.location || '—',
    totalArea: ps.total_area ?? '—',
    floorCount: ps.floor_count ?? '—',
    climateZone: reportData?.climate_profile?.zone || '—',
  };
};

export const getPreferences = (reportData) => {
  const pref = reportData?.project_preferences || {};
  return {
    budgetLevel: pref.budget_level || '—',
    sustainability: pref.sustainability_preference || '—',
    durability: pref.durability_preference || '—',
    certification: pref.certification_preference || '—',
  };
};

export const getClimateProfile = (reportData) => {
  const cp = reportData?.climate_profile || {};
  return {
    zone: cp.zone || '—',
    rainfall: cp.rainfall ?? '—',
    humidity: cp.humidity ?? '—',
    temperature: cp.temperature ?? '—',
  };
};

export const getMetrics = (reportData) => {
  const m = reportData?.metrics || {};
  return {
    overallScore: m.overall_score ?? '—',
    sustainabilityRating: m.sustainability_rating ?? '—',
    climateCompatible: m.climate_compatible ?? null,
    durabilityScore: m.durability_score ?? null,
    certificationReady: m.certification_ready ?? null,
  };
};

export const getRecommendedPackage = (reportData) => reportData?.recommended_package || {};
export const getTopCandidates = (reportData) => reportData?.top3_candidates || {};
export const getFeatureImportance = (reportData) => reportData?.feature_importance || [];
export const getBlueprint = (reportData) => reportData?.blueprint || {};
export const getAuditLog = (reportData) => reportData?.audit_log || [];
