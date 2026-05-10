// Mock database for storing submissions
const submissions = new Map();

// Initialize with some demo data
function initializeDemoData() {
  if (submissions.size > 0) return;

  const demoSubmissions = [
    {
      id: 'SUB-001',
      buildingInfo: {
        buildingName: 'Colombo Business Tower',
        address: '123 Galle Road, Colombo 3',
        ownerName: 'Jayasinghe Developers',
        ownerContact: '+94 11 234 5678',
        squareFootage: '50000',
        numberOfFloors: '15',
        buildingType: 'Commercial Office',
      },
      files: [
        {
          id: 'FILE-001',
          name: 'Floor_Plan_Ground.pdf',
          size: 2456789,
          uploadedAt: new Date('2024-05-01'),
          type: 'blueprint',
        },
        {
          id: 'FILE-002',
          name: 'Fire_Safety_Report.pdf',
          size: 1234567,
          uploadedAt: new Date('2024-05-02'),
          type: 'compliance',
        },
      ],
      checklist: [
        { id: 'CHK-001', name: 'Emergency Exits', checked: true },
        { id: 'CHK-002', name: 'Fire Alarms', checked: true },
        { id: 'CHK-003', name: 'Sprinkler System', checked: true },
      ],
      submittedAt: new Date('2024-05-15'),
      status: 'complete',
      analysisResults: {
        submissionId: 'SUB-001',
        timestamp: new Date('2024-05-20'),
        completionPercentage: 100,
        rules: [
          {
            ruleNumber: 'ICTAD-001',
            name: 'Exit Route Requirements',
            description: 'All exit routes must be clearly marked and unobstructed',
            status: 'pass',
            details: 'All 8 exit routes meet requirements',
            recommendations: [],
          },
          {
            ruleNumber: 'ICTAD-002',
            name: 'Fire Detection System',
            description: 'Fire detection system must be installed and functional',
            status: 'pass',
            details: 'Modern smoke detection system installed throughout building',
            recommendations: [],
          },
          {
            ruleNumber: 'ICTAD-003',
            name: 'Sprinkler Coverage',
            description: 'Minimum sprinkler head coverage required',
            status: 'pass',
            details: '100% coverage with ICTAD-approved systems',
            recommendations: [],
          },
        ],
        overallStatus: 'pass',
        summary: 'Building meets all fire safety requirements',
        errorCount: 0,
        warningCount: 0,
        criticalIssues: [],
        pdfGenerated: true,
      },
    },
  ];

  demoSubmissions.forEach(sub => {
    submissions.set(sub.id, sub);
  });
}

export const db = {
  // Get all submissions
  getAllSubmissions() {
    initializeDemoData();
    return Array.from(submissions.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  },

  // Get submission by ID
  getSubmission(id) {
    initializeDemoData();
    return submissions.get(id);
  },

  // Create new submission
  createSubmission(buildingInfo) {
    initializeDemoData();
    const id = `SUB-${Date.now()}`;
    const submission = {
      id,
      buildingInfo,
      files: [],
      checklist: getDefaultChecklist(),
      submittedAt: new Date(),
      status: 'draft',
    };
    submissions.set(id, submission);
    return submission;
  },

  // Update submission
  updateSubmission(id, updates) {
    initializeDemoData();
    const submission = submissions.get(id);
    if (!submission) return undefined;

    const updated = { ...submission, ...updates };
    submissions.set(id, updated);
    return updated;
  },

  // Add file to submission
  addFile(submissionId, file) {
    initializeDemoData();
    const submission = submissions.get(submissionId);
    if (!submission) return undefined;

    submission.files.push(file);
    submissions.set(submissionId, submission);
    return submission;
  },

  // Update checklist
  updateChecklist(submissionId, checklist) {
    initializeDemoData();
    const submission = submissions.get(submissionId);
    if (!submission) return undefined;

    submission.checklist = checklist;
    submissions.set(submissionId, submission);
    return submission;
  },

  // Get stats
  getStats() {
    initializeDemoData();
    const allSubmissions = Array.from(submissions.values());
    return {
      total: allSubmissions.length,
      completed: allSubmissions.filter(s => s.status === 'complete').length,
      analyzing: allSubmissions.filter(s => s.status === 'analyzing').length,
      pending: allSubmissions.filter(s => s.status === 'draft').length,
      recentActivity: allSubmissions.slice(0, 5),
    };
  },
};

export function getDefaultChecklist() {
  return [
    { id: 'CHK-001', name: 'Emergency Exits', checked: false, description: 'Clearly marked and unobstructed' },
    { id: 'CHK-002', name: 'Fire Alarms', checked: false, description: 'Installed and functional' },
    { id: 'CHK-003', name: 'Sprinkler System', checked: false, description: 'Coverage and maintenance' },
    { id: 'CHK-004', name: 'Fire Extinguishers', checked: false, description: 'Accessible and inspected' },
    { id: 'CHK-005', name: 'Emergency Lighting', checked: false, description: 'Backup power available' },
    { id: 'CHK-006', name: 'Evacuation Plan', checked: false, description: 'Posted and communicated' },
    { id: 'CHK-007', name: 'Material Storage', checked: false, description: 'Non-combustible materials' },
    { id: 'CHK-008', name: 'Staff Training', checked: false, description: 'Fire safety procedures' },
  ];
}
