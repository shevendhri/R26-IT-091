"use client";
import React from 'react';

/**
 * ProjectValidationStrip – Displays formal project validation status,
 * data quality level, geometry sanity state, and human review gates.
 * Styled with crisp modern cards and high contrast.
 */
export default function ProjectValidationStrip({ data }) {
  if (!data) return null;

  const projectValidation = data.project_validation || {};
  const buildingQuantities = data.building_quantities || {};
  const geomValidation = buildingQuantities.validation_report || {};
  
  const status = projectValidation.status || geomValidation.status || "PASS";
  const isReviewRequired = status === "REVIEW REQUIRED";
  
  const blueprintData = projectValidation.blueprint_data || buildingQuantities.geometry_source || "Estimated";
  const dataQuality = projectValidation.data_quality || "Prototype / Research Dataset";
  const rawMlAssessment = projectValidation.ml_assessment || (data.confidence ? `Confidence: ${data.confidence.confidence_score}%` : "N/A");
  const engineeringAssessment = projectValidation.engineering_assessment || "Preliminary Engineering Validation";
  const mlAssessment = typeof rawMlAssessment === 'string' ? rawMlAssessment.replace(/\s*\|\s*Agreement:\s*\w+/i, '') : rawMlAssessment;

  const issues = projectValidation.geometry_issues || geomValidation.issues || [];

  return (
    <section style={{
      background: '#FFFFFF',
      border: isReviewRequired ? '1px solid #FECACA' : '1px solid #E2E8F0',
      borderLeft: isReviewRequired ? '5px solid #DC2626' : '5px solid #064E3B',
      borderRadius: '10px',
      padding: '1.25rem 1.6rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
    }}>
      {/* Top Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isReviewRequired ? '#DC2626' : '#0F172A', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, sans-serif' }}>
            Preliminary Engineering Validation
          </span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: '6px',
            background: isReviewRequired ? '#FEF2F2' : '#ECFDF5',
            border: isReviewRequired ? '1px solid #FECACA' : '1px solid #A7F3D0',
            color: isReviewRequired ? '#DC2626' : '#065F46',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            {status}
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
          Academic Decision-Support Gate · SLS 614 / SLS 107
        </span>
      </div>

      {/* Grid of 4 Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Geometry State
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: isReviewRequired ? '#DC2626' : '#065F46', fontFamily: 'Space Grotesk, sans-serif' }}>
            {status}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 500 }}>
            {isReviewRequired ? 'Geometric review flagged' : 'Sanity heuristics verified'}
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Blueprint Provenance
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Space Grotesk, sans-serif' }}>
            {blueprintData}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 500 }}>
            Spatial coordinate vectors
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Data Integrity
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Space Grotesk, sans-serif' }}>
            {dataQuality}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 500 }}>
            Curated Sri Lankan dataset
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1.1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Engineered Inference
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', fontFamily: 'Space Grotesk, sans-serif' }}>
            {engineeringAssessment}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 500 }}>
            {mlAssessment}
          </div>
        </div>
      </div>

      {/* Review Gate Notice if flagged */}
      {isReviewRequired && issues.length > 0 && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '0.85rem 1.1rem',
          fontSize: '0.80rem',
          color: '#991B1B'
        }}>
          <strong>Attention — Spatial Geometry Discrepancies:</strong>
          <ul style={{ margin: '0.45rem 0 0', paddingLeft: '1.25rem' }}>
            {issues.map((iss, i) => (
              <li key={i}>{iss}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
