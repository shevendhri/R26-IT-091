"use client";
import React from 'react';

/**
 * ProjectValidationStrip – Displays formal project validation status,
 * data quality level, geometry sanity state, and human review gates.
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
  const engineeringAssessment = projectValidation.engineering_assessment || "Preliminary Engineering Validation";
  const mlAssessment = projectValidation.ml_assessment || (data.confidence ? `Confidence: ${data.confidence.confidence_score}% | Agreement: ${data.confidence.confidence_level}` : "N/A");

  const issues = projectValidation.geometry_issues || geomValidation.issues || [];
  const warnings = projectValidation.geometry_warnings || geomValidation.warnings || [];

  return (
    <section style={{
      background: isReviewRequired ? 'rgba(245, 158, 11, 0.05)' : '#0f172a',
      border: isReviewRequired ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #1e293b',
      borderLeft: isReviewRequired ? '4px solid #f59e0b' : '4px solid #10b981',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.9rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
    }}>
      {/* Top Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isReviewRequired ? '#f59e0b' : '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Project Validation
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: isReviewRequired ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isReviewRequired ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            color: isReviewRequired ? '#f59e0b' : '#10b981',
            textTransform: 'uppercase'
          }}>
            {status}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
          Academic Engineering Decision-Support
        </span>
      </div>

      {/* Grid of 4 Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Geometry Status</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isReviewRequired ? '#f59e0b' : '#10b981', fontFamily: 'Space Grotesk' }}>
            {status}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            {isReviewRequired ? 'Geometric review gate flagged' : 'Sanity heuristics verified'}
          </div>
        </div>

        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Blueprint Data</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'Space Grotesk' }}>
            {blueprintData}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            {blueprintData === 'Blueprint-extracted' ? 'Extracted from floorplan image' : 'Parametric preliminary baseline'}
          </div>
        </div>

        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Data Quality</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
            {dataQuality}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            Sri Lanka materials catalog
          </div>
        </div>

        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Assessment Layer</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
            {engineeringAssessment}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            {mlAssessment}
          </div>
        </div>
      </div>

      {/* Review Required Warning Banner */}
      {isReviewRequired && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#f59e0b', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Potential geometry inconsistency — extracted geometry should be reviewed before material quantities are treated as reliable.</span>
          </div>
          {issues.length > 0 && (
            <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem', color: '#f59e0b', fontSize: '0.74rem' }}>
              {issues.map((iss, i) => (
                <li key={i}>{iss}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* System-wide Legal / Academic Disclaimer */}
      <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>
        <strong>Academic Disclaimer:</strong> {data.disclaimer || "GreenConstructAI provides preliminary decision support and does not replace detailed structural design, architectural approval, quantity surveying, or professional engineering certification."}
      </div>
    </section>
  );
}
