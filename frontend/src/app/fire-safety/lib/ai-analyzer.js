const API_URL = process.env.NEXT_PUBLIC_FIREGUARD_API_URL || 'http://localhost:8000';

// Keep the transport contract safe even if assessment data was restored from
// history or supplied by a future form instead of the current submission UI.
function normalizeOptionalBoolean(value) {
  if (value === true || value === false || value === null || value === undefined) return value ?? null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'yes' || normalized === 'true') return true;
  if (normalized === 'no' || normalized === 'false') return false;
  return null;
}

export const ANALYSIS_STAGE_MESSAGES = {
  UPLOADING: 'Uploading drawing...',
  PREPARING_PLAN: 'Uploading drawing...',
  READING_OVERVIEW: 'Reading building information...',
  READING_DETAILS: 'Preparing review...',
  BUILDING_PROJECT_SCHEMA: 'Preparing review...',
  CHECKING_ICTAD_RULES: 'Applying ICTAD fire-safety rules...',
  PREPARING_ASSESSMENT: 'Preparing assessment...',
  COMPLETE: 'Pre-assessment complete.',
  FAILED: 'Pre-assessment failed.',
};

function appendFiles(form, submission) {
  submission.files.forEach((file) => {
    if (file.rawFile) form.append('files', file.rawFile, file.name);
  });
}

export async function analyzeSubmission(submission, options = {}) {
  const form = new FormData();
  appendFiles(form, submission);
  if (![...form.keys()].length) throw new Error('Select at least one drawing file.');
  options.onStage?.('UPLOADING');
  const stagedMessages = ['PREPARING_PLAN', 'READING_OVERVIEW', 'BUILDING_PROJECT_SCHEMA'];
  let stageIndex = 0;
  const timer = setInterval(() => {
    options.onStage?.(stagedMessages[Math.min(stageIndex, stagedMessages.length - 1)]);
    stageIndex += 1;
  }, 3500);
  try {
    const url = options.experimental ? `${API_URL}/api/fireguard/analyze?experimental=true` : `${API_URL}/api/fireguard/analyze`;
    const response = await fetch(url, { method: 'POST', body: form });
    if (!response.ok) {
      let message = `Analysis failed (${response.status})`;
      try { message = (await response.json()).detail || message; } catch { /* non-JSON server error */ }
      options.onStage?.('FAILED');
      throw new Error(message);
    }
    options.onStage?.('COMPLETE');
    return response.json();
  } finally {
    clearInterval(timer);
  }
}

export async function startValidatedDemo() {
  const response = await fetch(`${API_URL}/api/fireguard/panel/validated-demo`, { method: 'POST' });
  if (!response.ok) {
    let message = `Validated demonstration failed (${response.status})`;
    try { message = (await response.json()).detail || message; } catch { /* non-JSON server error */ }
    throw new Error(message);
  }
  return response.json();
}

export async function startManualAssessment(submission) {
  const form = new FormData();
  appendFiles(form, submission);
  const response = await fetch(`${API_URL}/api/fireguard/panel/manual`, { method: 'POST', body: form });
  if (!response.ok) {
    let message = `Manual assessment failed (${response.status})`;
    try { message = (await response.json()).detail || message; } catch { /* non-JSON server error */ }
    throw new Error(message);
  }
  return response.json();
}

export async function rerunWithUserConfirmations(projectSchema, confirmations) {
  const response = await fetch(`${API_URL}/api/fireguard/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_schema: projectSchema, confirmations }),
  });
  if (!response.ok) {
    let message = `Review failed (${response.status})`;
    try { message = (await response.json()).detail || message; } catch { /* non-JSON server error */ }
    throw new Error(message);
  }
  return response.json();
}

export async function analyzeFirePlan(files) {
  const form = new FormData();
  const selected = files[0];
  if (!selected?.rawFile) throw new Error('Select one PDF, PNG, JPG, or JPEG fire plan.');
  form.append('file', selected.rawFile, selected.name);
  const response = await fetch(`${API_URL}/api/fireguard/analyze-plan`, { method: 'POST', body: form });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || 'Fire plan analysis failed.');
  const result = await response.json();
  if (!result.evidence?.some((item) => item.detection_status === 'DETECTED' && Number.isInteger(item.count))) {
    throw new Error('No usable fire-item counts were detected. The assessment was stopped so zero counts are not reported as violations.');
  }
  return result;
}

export async function runFireGuardAssessment(buildingData, evidence) {
  const project = {
    project_name: buildingData.project_name,
    building_use: buildingData.building_use,
    purpose_group: buildingData.purpose_group,
    storeys: buildingData.storey_count,
    building_height_m: buildingData.building_height_m,
    building_area_m2: buildingData.total_floor_area_m2,
    max_floor_area_per_storey_m2: buildingData.max_floor_area_per_storey_m2,
    number_of_exits: buildingData.independent_exit_count,
    number_of_staircases: buildingData.staircase_count,
    travel_distance_m: buildingData.travel_distance_m,
    corridor_width_m: buildingData.corridor_width_m,
    stair_width_m: buildingData.stair_width_m,
    protected_stair: normalizeOptionalBoolean(buildingData.protected_stair),
    highest_habitable_floor_level_m: buildingData.highest_habitable_floor_level_m,
    escape_arrangement: buildingData.escape_arrangement,
    sprinkler_protected: normalizeOptionalBoolean(buildingData.sprinkler_protected),
    largest_room_occupant_load: buildingData.largest_room_occupant_load,
    exit_door_swing_outward: normalizeOptionalBoolean(buildingData.exit_door_swing_outward),
    minimum_exit_door_clear_width_m: buildingData.minimum_exit_door_clear_width_m,
    minimum_exit_door_clear_height_m: buildingData.minimum_exit_door_clear_height_m,
    exit_lighting_confirmed: normalizeOptionalBoolean(buildingData.exit_lighting_confirmed),
    exit_signs_confirmed: normalizeOptionalBoolean(buildingData.exit_signs_confirmed),
    fire_alarm_system_confirmed: normalizeOptionalBoolean(buildingData.fire_alarm_system_confirmed),
    manual_call_points_confirmed: normalizeOptionalBoolean(buildingData.manual_call_points_confirmed),
    external_hydrants_confirmed: normalizeOptionalBoolean(buildingData.external_hydrants_confirmed),
    relevant_plan_set_complete: normalizeOptionalBoolean(buildingData.relevant_plan_set_complete),
  };
  const response = await fetch(`${API_URL}/api/fireguard/assessment`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, evidence: evidence.evidence || [] }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const detail = Array.isArray(payload.detail)
      ? payload.detail.map((item) => {
          const field = (item.loc || []).filter((part) => part !== 'body').join(' → ');
          return `${field || 'Assessment data'}: ${item.msg}`;
        }).join('. ')
      : payload.detail;
    throw new Error(detail || 'Fire-safety assessment failed.');
  }
  const result = await response.json();
  // Normalize the public API result for the existing results page and history.
  return { ...result, overall_status: result.final_status?.replaceAll(' ', '_').toUpperCase(), rules: result.applied_rules, project_summary: project };
}
