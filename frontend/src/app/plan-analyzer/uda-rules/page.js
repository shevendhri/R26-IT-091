'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../plan-analyzer.css';

const REQUIRED_RULES = [
  { id: 'front_elevation', question: 'Is the front elevation drawn?' },
  { id: 'side_elevation', question: 'Is the side elevation drawn?' },
  { id: 'ground_plan', question: 'Is the ground plan drawn?' },
  { id: 'foundation_details', question: 'Is the Foundation Details?' },
  { id: 'septic_tank_details', question: 'Is the Spectic Tank Details?' },
  { id: 'column_detail', question: 'Is the column Detail?' },
];

const STATUS_META = {
  pass: {
    label: 'Found',
    marker: 'PASS',
    className: 'bg-brand-green-dim border-brand-green-border text-brand-green',
  },
  fail: {
    label: 'Missing',
    marker: 'FAIL',
    className: 'bg-brand-red-dim border-brand-red-border text-brand-red',
  },
  not_verifiable: {
    label: 'Review',
    marker: 'CHECK',
    className: 'bg-brand-amber-dim border-brand-amber-border text-brand-amber',
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
    <div className="plan-analyzer-scope" style={{ minHeight: '100vh', background: 'var(--eco-black)', color: 'var(--text-primary)', position: 'relative' }}>
      <Header />
      <div className="blueprint-grid-blue" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-14 relative" style={{ zIndex: 1 }}>
        <div className="mb-6">
          <Link href="/plan-analyzer" className="text-sm font-heading font-semibold text-brand-blue hover:brightness-125" style={{ textDecoration: 'none' }}>
            Back to Floor Plan Analyzer
          </Link>
        </div>

        <section className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-blue-dim border border-brand-blue-border rounded-full px-4 py-1.5 text-xs font-heading text-brand-blue mb-5 font-semibold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse inline-block" />
            UDA drawing sheet checker
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4 text-ink-primary leading-tight tracking-tight">
            Check the UDA Rulles
          </h1>
          <p className="text-ink-secondary text-base sm:text-lg max-w-2xl mx-auto">
            Upload a full architectural drawing sheet and check whether the required elevation, plan, foundation, septic tank, and column details are present.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5 items-start">
          <section className="bg-eco-card border border-eco-border rounded-card shadow-card p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-heading text-ink-muted uppercase tracking-widest mb-1">Upload Drawing Sheet</p>
                <h2 className="font-heading text-xl font-bold text-ink-primary">Image Uploading Section</h2>
              </div>
              {file && (
                <button
                  type="button"
                  onClick={() => chooseFile(null)}
                  className="text-xs font-heading font-semibold text-brand-red hover:brightness-110"
                >
                  Clear
                </button>
              )}
            </div>

            {preview && preview !== 'pdf' && (
              <div className="mb-4 rounded-inner overflow-hidden border border-eco-border bg-eco-mid/30 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Uploaded UDA plan sheet preview" className="w-full max-h-[360px] object-contain" />
              </div>
            )}

            {preview === 'pdf' && (
              <div className="mb-4 rounded-inner border border-eco-border bg-eco-mid/30 px-4 py-4">
                <p className="font-heading text-sm font-semibold text-ink-primary truncate">{file.name}</p>
                <p className="text-xs text-ink-muted mt-1">PDF page 1 will be checked.</p>
              </div>
            )}

            <div
              className={`border border-dashed rounded-inner p-5 text-center cursor-pointer transition-all ${
                dragging ? 'border-brand-green bg-brand-green-dim' : 'border-eco-border bg-eco-mid/20 hover:border-eco-border-strong'
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={event => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.svg"
                className="hidden"
                onChange={event => chooseFile(event.target.files?.[0] || null)}
              />
              {file ? (
                <div className="text-sm text-ink-secondary">
                  <p className="font-heading font-semibold text-ink-primary truncate">{file.name}</p>
                  <p className="text-xs text-ink-muted mt-1">Click here to replace the file.</p>
                </div>
              ) : (
                <div>
                  <p className="font-heading text-sm font-semibold text-ink-primary">Click or drag the plan sheet here</p>
                  <p className="text-xs text-ink-muted mt-1">PNG, JPG, PDF, or SVG accepted.</p>
                </div>
              )}
            </div>

            {error && (
              <p className="font-heading text-brand-red text-xs mt-3 bg-brand-red-dim border border-brand-red-border rounded-inner px-3 py-2">{error}</p>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !file}
              className={`btn-premium mt-4 w-full ${loading ? 'is-loading' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analyzing UDA Rules...
                </span>
              ) : 'Analyze'}
            </button>
          </section>

          <section className="bg-eco-card border border-eco-border rounded-card shadow-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-heading text-ink-muted uppercase tracking-widest mb-1">Output</p>
                <h2 className="font-heading text-xl font-bold text-ink-primary">UDA Rules Result</h2>
              </div>
              {result && (
                <span className={`text-xs font-heading font-semibold px-3 py-1 rounded-full border uppercase tracking-wide ${
                  result.overall_status === 'pass'
                    ? STATUS_META.pass.className
                    : result.overall_status === 'fail'
                      ? STATUS_META.fail.className
                      : STATUS_META.not_verifiable.className
                }`}>
                  {result.overall_status === 'pass' ? 'Ready' : result.overall_status === 'fail' ? 'Missing Items' : 'Review Needed'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <SummaryBox label="Found" value={result ? passed : 0} className="bg-brand-green-dim text-brand-green" />
              <SummaryBox label="Missing" value={result ? failed : 0} className="bg-brand-red-dim text-brand-red" />
              <SummaryBox label="Review" value={result ? review : 0} className="bg-brand-amber-dim text-brand-amber" />
            </div>

            <div className="flex flex-col gap-2">
              {items.map(item => {
                const meta = STATUS_META[item.status] || STATUS_META.not_verifiable;
                return (
                  <div key={item.id} className={`rounded-inner border px-4 py-3 ${result ? meta.className : 'bg-eco-mid/40 border-eco-border text-ink-secondary'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-heading font-semibold text-ink-primary/90">{item.question}</p>
                        <p className="text-xs opacity-75 mt-1">{result ? item.evidence : 'Upload a sheet and click Analyze to check this rule.'}</p>
                      </div>
                      <span className="text-[0.68rem] font-heading font-extrabold leading-none px-2 py-1 rounded-md bg-white/55 border border-white/40">
                        {result ? meta.marker : 'WAIT'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Removed: Detected Text Summary per request */}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function mergeRulesWithResult(resultRules = []) {
  return REQUIRED_RULES.map(rule => {
    const found = resultRules.find(item => item.id === rule.id);
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

function SummaryBox({ label, value, className }) {
  return (
    <div className={`rounded-inner border border-eco-border px-3 py-3 text-center ${className}`}>
      <p className="font-heading text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-[0.7rem] font-heading font-semibold uppercase tracking-wide opacity-75 mt-1">{label}</p>
    </div>
  );
}
