// Mock ICTAD rules for analysis
const ICTAD_RULES = [
  {
    ruleNumber: 'ICTAD-001',
    name: 'Exit Route Requirements',
    description: 'All exit routes must be clearly marked and unobstructed',
    status: 'pass',
    details: 'Exit routes verified and compliant',
  },
  {
    ruleNumber: 'ICTAD-002',
    name: 'Fire Detection System',
    description: 'Fire detection system must be installed and functional',
    status: 'pass',
    details: 'Detection system meets ICTAD standards',
  },
  {
    ruleNumber: 'ICTAD-003',
    name: 'Sprinkler Coverage',
    description: 'Minimum sprinkler head coverage required',
    status: 'pass',
    details: 'Sprinkler system coverage adequate',
  },
  {
    ruleNumber: 'ICTAD-004',
    name: 'Emergency Lighting',
    description: 'Emergency lighting with backup power required',
    status: 'pass',
    details: 'Emergency lighting installed and operational',
  },
  {
    ruleNumber: 'ICTAD-005',
    name: 'Fire-Resistant Materials',
    description: 'Building materials must meet fire resistance ratings',
    status: 'pass',
    details: 'Materials comply with ICTAD ratings',
  },
  {
    ruleNumber: 'ICTAD-006',
    name: 'Evacuation Planning',
    description: 'Evacuation plans must be documented and accessible',
    status: 'pass',
    details: 'Evacuation procedures properly documented',
  },
  {
    ruleNumber: 'ICTAD-007',
    name: 'Fire Extinguisher Placement',
    description: 'Fire extinguishers must be accessible and regularly inspected',
    status: 'pass',
    details: 'All extinguishers properly placed and maintained',
  },
  {
    ruleNumber: 'ICTAD-008',
    name: 'Electrical Safety',
    description: 'Electrical systems must be installed safely',
    status: 'pass',
    details: 'Electrical systems meet safety standards',
  },
  {
    ruleNumber: 'ICTAD-009',
    name: 'Storage Area Safety',
    description: 'Combustible materials storage must be compliant',
    status: 'pass',
    details: 'Storage areas meet fire safety requirements',
  },
  {
    ruleNumber: 'ICTAD-010',
    name: 'Staff Training Records',
    description: 'Proof of fire safety staff training required',
    status: 'pass',
    details: 'Staff training completed and documented',
  },
  {
    ruleNumber: 'ICTAD-011',
    name: 'Maintenance Records',
    description: 'Fire safety system maintenance must be documented',
    status: 'pass',
    details: 'Maintenance records up to date',
  },
  {
    ruleNumber: 'ICTAD-012',
    name: 'Inspection Compliance',
    description: 'Regular inspections by certified inspectors required',
    status: 'pass',
    details: 'Inspections completed by certified personnel',
  },
];

export async function analyzeSubmission(submission) {
  // Simulate AI analysis with variable results based on checklist
  const checkedItems = submission.checklist.filter(item => item.checked).length;
  const totalItems = submission.checklist.length;
  const completionPercentage = Math.round((checkedItems / totalItems) * 100);

  // Simulate analysis with some variance
  const hasErrors = completionPercentage < 60;
  const hasWarnings = completionPercentage < 80;

  // Generate rules with randomized status based on completion
  const analysisRules = ICTAD_RULES.map((rule, index) => {
    let status = 'pass';

    if (hasErrors && index > 8) {
      status = 'fail';
    } else if (hasWarnings && index > 6) {
      status = 'warning';
    }

    return {
      ...rule,
      status,
      details: generateDetails(rule, status),
    };
  });

  const failedRules = analysisRules.filter(r => r.status === 'fail');
  const warningRules = analysisRules.filter(r => r.status === 'warning');

  const overallStatus = failedRules.length > 0 ? 'fail' : warningRules.length > 0 ? 'conditional' : 'pass';

  return {
    submissionId: submission.id,
    timestamp: new Date(),
    completionPercentage,
    rules: analysisRules,
    overallStatus,
    summary: generateSummary(overallStatus, failedRules, warningRules),
    errorCount: failedRules.length,
    warningCount: warningRules.length,
    criticalIssues: failedRules.map(r => r.name),
    pdfGenerated: false,
    planImageUrl: '/api/placeholder-floor-plan',
    annotatedImageUrl: '/api/placeholder-annotated',
  };
}

function generateDetails(rule, status) {
  if (status === 'fail') {
    return `${rule.name} requirements are NOT met. Immediate action required for compliance.`;
  } else if (status === 'warning') {
    return `${rule.name} has minor issues. Recommended improvements should be addressed.`;
  }
  return `${rule.name} is compliant with ICTAD standards.`;
}

function generateSummary(status, failures, warnings) {
  if (status === 'fail') {
    return `Building has ${failures.length} critical fire safety issues that must be resolved before certification can be issued.`;
  }
  if (status === 'conditional') {
    return `Building meets basic requirements but has ${warnings.length} items that need attention for full compliance.`;
  }
  return 'Building meets all fire safety requirements and is eligible for certification.';
}
