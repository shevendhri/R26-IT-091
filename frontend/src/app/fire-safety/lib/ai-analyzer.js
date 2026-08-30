const API_URL = process.env.NEXT_PUBLIC_FIREGUARD_API_URL || 'http://localhost:8000';

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
