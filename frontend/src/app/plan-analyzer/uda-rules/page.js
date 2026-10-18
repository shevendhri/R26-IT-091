'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';
import '../plan-analyzer.css';

const REQUIRED_RULES = [
  { id: 'front_elevation', question: 'Is the front elevation drawn?' },
  { id: 'side_elevation', question: 'Is the side elevation drawn?' },
  { id: 'ground_plan', question: 'Is the ground plan drawn?' },
  { id: 'foundation_details', question: 'Are the Foundation Details provided?' },
  { id: 'septic_tank_details', question: 'Are the Septic Tank Details provided?' },
  { id: 'column_detail', question: 'Are the Column Details provided?' },
];

const STATUS_META = {
  pass: {
    label: 'Found',
    marker: 'PASS',
    bg: '#EAF5EC',
    border: 'rgba(20, 56, 37, 0.25)',
    color: '#143825',
  },
  fail: {
    label: 'Missing',
    marker: 'FAIL',
    bg: '#FDF2F0',
    border: 'rgba(184, 92, 67, 0.3)',
    color: '#B85C43',
  },
  not_verifiable: {
    label: 'Review',
    marker: 'CHECK',
    bg: '#FEF9EE',
    border: 'rgba(217, 119, 6, 0.3)',
    color: '#B45309',
  },
};

export default function UdaRulesPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview && preview !== 'pdf') URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function chooseFile(nextFile) {
    const nextPreview = makePreview(nextFile);
    setFile(nextFile);
    setPreview(nextPreview);
    setResult(null);
    setError('');
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) chooseFile(droppedFile);
  }

  async function handleAnalyze() {
    if (!file) {
      setError('Please upload a plan sheet image first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const form = new FormData();
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      form.append(isSvg ? 'svg' : 'png', file);

      const apiUrl = process.env.NEXT_PUBLIC_BLUEPRINT_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/check-uda-rules`, {
        method: 'POST',
        body: form,
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || `Server error ${response.status}`);
      }

      setResult(body);
    } catch (err) {
      setError(err.message || 'UDA rules analysis failed. Please confirm the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const items = mergeRulesWithResult(result?.rules);
  const passed = items.filter(item => item.status === 'pass').length;
  const failed = items.filter(item => item.status === 'fail').length;
  const review = items.filter(item => item.status === 'not_verifiable').length;

  return (
    <div className="plan-analyzer-scope">
      <Header />

      <main className="plan-page-shell">
        <ModuleHeroBanner
          track="01 / REGULATORY & SPATIAL INTELLIGENCE"
          kicker="UDA SUBMISSION COMPLIANCE CHECKER"
          title="UDA DRAWING SHEET RULES VERIFIER"
          subtitle="Audit complete architectural submission sheets to verify mandatory requirements under Sri Lankan Urban Development Authority (UDA) regulations: elevations, floor plans, foundation, column, and septic details."
          imageSrc="/blueprint_desk.png"
          imageAlt="UDA Plan Sheet Blueprint Desk"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href="/plan-analyzer"
                style={{
                  background: '#143825',
                  color: '#FCFAF6',
                  padding: '0.75rem 1.4rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>← Back to Plan Analyzer</span>
              </Link>
            </div>
          }
        />

        {/* 2-Column Workstation Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
          marginTop: '1.5rem',
        }}>
          {/* ── LEFT: Upload & Sheet Preview ── */}
          <section className="plan-ws-column">
            <div className="plan-col-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>UPLOAD DRAWING SHEET</span>
              {file && (
                <button
                  type="button"
                  onClick={() => chooseFile(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#B85C43',
                    fontSize: '0.72rem',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  Clear Sheet
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#555E59', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Upload the complete architectural drawing submission sheet (PNG, JPG, Vector SVG, or PDF). The rules engine checks for mandatory drawing elevations, structural details, and sanitization specs.
            </p>

            {preview && preview !== 'pdf' && (
              <div style={{
                marginBottom: '1rem',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #E2DCD0',
                background: '#FAF7F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Uploaded UDA plan sheet preview" style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' }} />
              </div>
            )}

            {preview === 'pdf' && (
              <div style={{
                marginBottom: '1rem',
                borderRadius: '4px',
                border: '1px solid #E2DCD0',
                background: '#FAF7F0',
                padding: '1rem',
              }}>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#143825', margin: 0 }}>
                  📄 {file.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#7C8681', margin: '4px 0 0' }}>PDF page 1 will be converted and audited for UDA rules.</p>
              </div>
            )}

            <div
              style={{
                border: dragging ? '2px dashed #143825' : '1px dashed #C8C0B2',
                borderRadius: '4px',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(20, 56, 37, 0.05)' : '#FCFAF6',
                transition: 'all 0.2s ease',
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={event => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.svg"
                style={{ display: 'none' }}
                onChange={event => chooseFile(event.target.files?.[0] || null)}
              />
              {file ? (
                <div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#143825', margin: 0 }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#7C8681', marginTop: '4px' }}>Click to replace drawing sheet</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📋</div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#143825', margin: 0 }}>
                    Click or drag drawing sheet here
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#7C8681', marginTop: '4px' }}>PNG, JPG, PDF, or SVG formats supported</p>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                marginTop: '1rem',
                fontSize: '0.76rem',
                color: '#B85C43',
                background: '#FDF2F0',
                border: '1px solid rgba(184, 92, 67, 0.25)',
                borderRadius: '4px',
                padding: '0.75rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="plan-analyze-button"
              style={{
                marginTop: '1.25rem',
                width: '100%',
                opacity: (loading || !file) ? 0.6 : 1,
                cursor: (loading || !file) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Verifying UDA Rules...' : 'Audit Drawing Sheet for UDA Compliance'}
            </button>
          </section>

          {/* ── RIGHT: UDA Rules Checklist Results ── */}
          <section className="plan-ws-column">
            <div className="plan-col-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>UDA REGULATORY AUDIT RESULTS</span>
              {result && (
                <span style={{
                  fontSize: '0.68rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  background: result.overall_status === 'pass' ? '#EAF5EC' : result.overall_status === 'fail' ? '#FDF2F0' : '#FEF9EE',
                  color: result.overall_status === 'pass' ? '#143825' : result.overall_status === 'fail' ? '#B85C43' : '#B45309',
                  border: `1px solid ${result.overall_status === 'pass' ? 'rgba(20, 56, 37, 0.25)' : result.overall_status === 'fail' ? 'rgba(184, 92, 67, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
                }}>
                  {result.overall_status === 'pass' ? 'UDA Submission Ready' : result.overall_status === 'fail' ? 'Missing Mandatory Elements' : 'Manual Review Required'}
                </span>
              )}
            </div>

            {/* Score Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                background: '#EAF5EC',
                border: '1px solid rgba(20, 56, 37, 0.2)',
                borderRadius: '4px',
                padding: '0.85rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#143825' }}>
                  {result ? passed : 0}
                </div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', fontWeight: 700, textTransform: 'uppercase', color: '#143825', letterSpacing: '0.06em' }}>
                  Compliant Items
                </div>
              </div>

              <div style={{
                background: '#FDF2F0',
                border: '1px solid rgba(184, 92, 67, 0.2)',
                borderRadius: '4px',
                padding: '0.85rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#B85C43' }}>
                  {result ? failed : 0}
                </div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', fontWeight: 700, textTransform: 'uppercase', color: '#B85C43', letterSpacing: '0.06em' }}>
                  Missing Items
                </div>
              </div>

              <div style={{
                background: '#FEF9EE',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                borderRadius: '4px',
                padding: '0.85rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#B45309' }}>
                  {result ? review : 0}
                </div>
                <div style={{ fontSize: '0.68rem', fontFamily: 'Space Grotesk', fontWeight: 700, textTransform: 'uppercase', color: '#B45309', letterSpacing: '0.06em' }}>
                  Pending Review
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {items.map(item => {
                const meta = STATUS_META[item.status] || STATUS_META.not_verifiable;
                const isResolved = !!result;
                return (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: '4px',
                      border: `1px solid ${isResolved ? meta.border : '#E2DCD0'}`,
                      background: isResolved ? meta.bg : '#FCFAF6',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: isResolved ? meta.color : '#1A2E22',
                      }}>
                        {item.question}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#697068', marginTop: '3px' }}>
                        {isResolved ? (item.evidence || 'Verified in blueprint layout') : 'Upload drawing sheet and click Audit to verify this requirement.'}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.65rem',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      background: isResolved ? '#FFFFFF' : '#EAE6DC',
                      border: `1px solid ${isResolved ? meta.border : '#D8D2C5'}`,
                      color: isResolved ? meta.color : '#7C8681',
                      flexShrink: 0,
                    }}>
                      {isResolved ? meta.marker : 'PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function mergeRulesWithResult(resultRules = []) {
  return REQUIRED_RULES.map(rule => {
    const found = (resultRules || []).find(item => item.id === rule.id);
    return {
      ...rule,
      status: found?.status || 'not_verifiable',
      evidence: found?.evidence || '',
    };
  });
}

function makePreview(file) {
  if (!file) return null;
  if (file.type === 'application/pdf') return 'pdf';
  return URL.createObjectURL(file);
}
