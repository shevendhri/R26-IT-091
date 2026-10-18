const STORAGE_KEY = 'fireguard.assessments.v1';
const submissions = new Map();
let hydrated = false;

function isBrowser() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function reviveDates(submission) {
  return {
    ...submission,
    submittedAt: submission.submittedAt ? new Date(submission.submittedAt) : new Date(),
    completedAt: submission.completedAt ? new Date(submission.completedAt) : undefined,
    files: submission.files || [],
  };
}

function serializeSubmission(submission) {
  return {
    ...submission,
    files: (submission.files || []).map(({ rawFile, ...file }) => file),
  };
}

function hydrate() {
  if (hydrated || !isBrowser()) return;
  hydrated = true;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    stored.map(reviveDates).forEach((submission) => submissions.set(submission.id, submission));
  } catch {
    submissions.clear();
  }
}

function persist() {
  if (!isBrowser()) return;
  const data = Array.from(submissions.values()).map(serializeSubmission);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function makeProjectLabel(results) {
  const summary = results?.project_summary || {};
  return (
    summary.project_title ||
    summary.building_use ||
    summary.purpose_group ||
    'Backend pre-assessment'
  );
}

export const db = {
  getAllSubmissions() {
    hydrate();
    return Array.from(submissions.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  },

  getSubmission(id) {
    hydrate();
    return submissions.get(id);
  },

  createSubmission({ files = [], status = 'analyzing', buildingData = null } = {}) {
    hydrate();
    const id = `PRE-${Date.now()}`;
    const submission = {
      id,
      buildingData,
      buildingInfo: {
        buildingName: buildingData?.project_name || 'FireGuard pre-assessment',
        address: 'User-confirmed building information',
        buildingType: buildingData?.building_use || 'Pending',
      },
      files,
      submittedAt: new Date(),
      status,
    };
    submissions.set(id, submission);
    persist();
    return submission;
  },

  updateSubmission(id, updates) {
    hydrate();
    const submission = submissions.get(id);
    if (!submission) return undefined;

    const next = {
      ...submission,
      ...updates,
      files: updates.files || submission.files,
    };

    if (updates.analysisResults) {
      next.buildingInfo = {
        ...next.buildingInfo,
        buildingName: makeProjectLabel(updates.analysisResults),
        buildingType: updates.analysisResults.project_summary?.purpose_group || 'Not extracted',
      };
      next.completedAt = new Date();
    }

    submissions.set(id, next);
    persist();
    return next;
  },

  getStats() {
    hydrate();
    const allSubmissions = Array.from(submissions.values());
    return {
      total: allSubmissions.length,
      completed: allSubmissions.filter((s) => s.status === 'complete').length,
      analyzing: allSubmissions.filter((s) => s.status === 'analyzing').length,
      pending: allSubmissions.filter((s) => s.status === 'draft').length,
      recentActivity: allSubmissions.slice(0, 5),
    };
  },
};
