export const documentCategories = [
  "Architectural Drawings",
  "MEP Drawings",
  "BOQ / Cost Documents",
  "Material Specifications",
  "Energy Reports",
  "Water Reports",
  "Certificates",
  "Photos / Site Evidence",
];

export const sampleDocuments = [
  {
    name: "Solar PV Layout.pdf",
    category: "Energy Reports",
    criterion: "EA-4.2",
    status: "Pending Local NLP Extraction",
  },
  {
    name: "Rainwater Tank Calculation.xlsx",
    category: "Water Reports",
    criterion: "WE-3.4.3",
    status: "Mapped to Criteria",
  },
  {
    name: "Paint VOC Certificate.pdf",
    category: "Certificates",
    criterion: "EQ-6.4.2",
    status: "Pending Review",
  },
];

export const extractionWorkflowSteps = [
  "Uploaded Documents",
  "Text Extraction",
  "Sustainability Feature Detection",
  "UDA Criteria Mapping",
  "User Confirmation",
];

export const extractedFeatures = [
  "Solar PV system detected",
  "Rainwater harvesting mentioned",
  "Low-VOC paint certificate found",
  "Recycled material percentage identified",
];

export const sampleMappings = [
  {
    feature: "Solar PV system detected",
    criterion: "EA-4.2 On-site Renewable Energy",
    confidence: "91%",
    confirmation: "Pending",
  },
  {
    feature: "Rainwater harvesting mentioned",
    criterion: "WE-3.4.3 Harvested Rainwater",
    confidence: "86%",
    confirmation: "Pending",
  },
  {
    feature: "Low-VOC paint certificate found",
    criterion: "EQ-6.4.2 Paints and Coatings",
    confidence: "94%",
    confirmation: "Confirmed",
  },
  {
    feature: "Recycled material percentage identified",
    criterion: "MR-5.1.2 Reused and Recycled Materials / Products",
    confidence: "78%",
    confirmation: "Needs Review",
  },
];
