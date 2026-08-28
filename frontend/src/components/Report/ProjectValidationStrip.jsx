"use client";
import React from 'react';

/**
 * ProjectValidationStrip – Displays formal project validation status,
 * data quality level, geometry sanity state, and human review gates.
 * Updated for high-contrast warm sustainable architecture theme.
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
      background: isReviewRequired ? 'rgba(199, 122, 61, 0.08)' : '#FFFFFF',
      border: isReviewRequired ? '1px solid rgba(199, 122, 61, 0.35)' : '1px solid #C8D3CA',
      borderLeft: isReviewRequired ? '4px solid #C77A3D' : '4px solid #245C43',
      borderRadius: '16px',
      padding: '1.4rem 1.6rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 12px rgba(24, 37, 31, 0.06), 0 18px 50px rgba(24, 37, 31, 0.08)'
    }}>
      {/* Top Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #C8D3CA', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isReviewRequired ? '#C77A3D' : '#245C43', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            Project Validation
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            background: isReviewRequired ? 'rgba(199, 122, 61, 0.15)' : '#DDE8DE',
            border: isReviewRequired ? '1px solid rgba(199, 122, 61, 0.4)' : '1px solid rgba(36, 92, 67, 0.25)',
            color: isReviewRequired ? '#C77A3D' : '#245C43',
            textTransform: 'uppercase'
          }}>
            {status}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#526158', fontWeight: 600 }}>
          Academic Engineering Decision-Support
        </span>
      </div>

      {/* Grid of 4 Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: '#F7F9F6', border: '1px solid #C8D3CA', borderRadius: '12px', padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Geometry Status</div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: isReviewRequired ? '#C77A3D' : '#245C43', fontFamily: 'Space Grotesk' }}>
            {status}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#748078', marginTop: '0.2rem', fontWeight: 500 }}>
            {isReviewRequired ? 'Geometric review gate flagged' : 'Sanity heuristics verified'}
          </div>
        </div>

        <div style={{ background: '#F7F9F6', border: '1px solid #C8D3CA', borderRadius: '12px', padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Blueprint Data</div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#3E6F8E', fontFamily: 'Space Grotesk' }}>
            {blueprintData}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#748078', marginTop: '0.2rem', fontWeight: 500 }}>
            {blueprintData === 'Blueprint-extracted' ? 'Extracted from floorplan image' : 'Parametric preliminary baseline'}
          </div>
        </div>

        <div style={{ background: '#F7F9F6', border: '1px solid #C8D3CA', borderRadius: '12px', padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Data Quality</div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk' }}>
            {dataQuality}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#748078', marginTop: '0.2rem', fontWeight: 500 }}>
            Sri Lanka materials catalog
          </div>
        </div>

        <div style={{ background: '#F7F9F6', border: '1px solid #C8D3CA', borderRadius: '12px', padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#526158', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Assessment Layer</div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk' }}>
            {engineeringAssessment}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#748078', marginTop: '0.2rem', fontWeight: 500 }}>
            {mlAssessment}
          </div>
        </div>
      </div>

      {/* Review Required Warning Banner */}
      {isReviewRequired && (
        <div style={{
          background: 'rgba(199, 122, 61, 0.08)',
          border: '1px solid rgba(199, 122, 61, 0.3)',
          borderRadius: '10px',
          padding: '0.85rem 1.1rem',
          fontSize: '0.82rem',
          color: '#18251F',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#C77A3D', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Potential geometry inconsistency — extracted geometry should be reviewed before material quantities are treated as reliable.</span>
          </div>
          {issues.length > 0 && (
            <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem', color: '#C77A3D', fontSize: '0.78rem' }}>
              {issues.map((iss, i) => (
                <li key={i}>{iss}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* System-wide Legal / Academic Disclaimer */}
      <div style={{ fontSize: '0.75rem', color: '#748078', fontStyle: 'italic', lineHeight: 1.5 }}>
        <strong style={{ color: '#18251F' }}>Academic Disclaimer:</strong> {data.disclaimer || "GreenConstructAI provides preliminary decision support and does not replace detailed structural design, architectural approval, quantity surveying, or professional engineering certification."}
      </div>
    </section>
  );
}
