"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [rooms, setRooms] = useState(null);
  const [totalArea, setTotalArea] = useState(0);
  const [zones, setZones] = useState([]);
  const [workflowRanking, setWorkflowRanking] = useState(null);
  const [justification, setJustification] = useState(null);
  const [impactNotes, setImpactNotes] = useState(null);
  const [aiStrategy, setAiStrategy] = useState(null);
  const [feasibilityReview, setFeasibilityReview] = useState(null);
  const [feasibilityWarning, setFeasibilityWarning] = useState(null);
  const [floorDistribution, setFloorDistribution] = useState(null);

  // Persistence removed to ensure a "Live" feel on every launch
  useEffect(() => {
    localStorage.removeItem('green_construct_project');
  }, []);

  const value = {
    rooms, setRooms,
    totalArea, setTotalArea,
    zones, setZones,
    workflowRanking, setWorkflowRanking,
    justification, setJustification,
    impactNotes, setImpactNotes,
    aiStrategy, setAiStrategy,
    feasibilityReview, setFeasibilityReview,
    feasibilityWarning, setFeasibilityWarning,
    floorDistribution, setFloorDistribution
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
