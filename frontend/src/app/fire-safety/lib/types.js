// Type definitions for FireSafe LK (using JSDoc comments for reference)

/**
 * @typedef {Object} BuildingInfo
 * @property {string} buildingName
 * @property {string} address
 * @property {string} ownerName
 * @property {string} ownerContact
 * @property {string} squareFootage
 * @property {string} numberOfFloors
 * @property {string} buildingType
 */

/**
 * @typedef {Object} FileUpload
 * @property {string} id
 * @property {string} name
 * @property {number} size
 * @property {Date} uploadedAt
 * @property {'blueprint' | 'compliance' | 'inspection' | 'other'} type
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} id
 * @property {string} name
 * @property {boolean} checked
 * @property {string} [description]
 */

/**
 * @typedef {Object} Submission
 * @property {string} id
 * @property {BuildingInfo} buildingInfo
 * @property {FileUpload[]} files
 * @property {ChecklistItem[]} checklist
 * @property {Date} submittedAt
 * @property {'draft' | 'submitted' | 'analyzing' | 'complete'} status
 * @property {AnalysisResults} [analysisResults]
 */

/**
 * @typedef {Object} ICTADRule
 * @property {string} ruleNumber
 * @property {string} name
 * @property {string} description
 * @property {'pass' | 'fail' | 'warning'} status
 * @property {string} details
 * @property {string[]} [recommendations]
 */

/**
 * @typedef {Object} AnalysisResults
 * @property {string} submissionId
 * @property {Date} timestamp
 * @property {number} completionPercentage
 * @property {ICTADRule[]} rules
 * @property {'pass' | 'fail' | 'conditional'} overallStatus
 * @property {string} summary
 * @property {number} errorCount
 * @property {number} warningCount
 * @property {string[]} criticalIssues
 * @property {boolean} [pdfGenerated]
 * @property {string} [planImageUrl]
 * @property {string} [annotatedImageUrl]
 */

/**
 * @typedef {Object} SubmissionStats
 * @property {number} total
 * @property {number} completed
 * @property {number} analyzing
 * @property {number} pending
 * @property {Submission[]} recentActivity
 */

export {}
