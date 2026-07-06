"use client";

import React, { Suspense, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const msg = searchParams.get('msg') || 'An unexpected error occurred.';

  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/materials/form'), 8000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: '#fff', padding: '2rem' }}>
      <Header />
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❗️ Error</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{msg}</p>
        {/* Suggested next steps */}
        <div style={{ textAlign: 'left', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '6px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Possible reasons</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Input parameters exceed material capability limits (e.g., stress, thermal thresholds).</li>
            <li>Missing or incomplete material preference selections.</li>
            <li>Constraints too strict given the available material catalog.</li>
            <li>Recent updates to validation rules causing stricter checks.</li>
          </ul>
          <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Suggested actions</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Adjust your material preferences or relax certain constraints.</li>
            <li>Review the detailed logs in the console for specific parameter values.</li>
            <li>Contact support if you believe the inputs are valid.</li>
          </ul>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.replace('/materials/form')}
            style={{
              background: 'var(--eco-glow)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '6px',
              color: '#000',
            }}
          >
            Return to Form
          </button>
          <button
            onClick={() => router.replace('/materials/processing')}
            style={{
              background: '#ff6b6b',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '6px',
              color: '#fff',
            }}
          >
            Retry
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-primary)', padding: '2rem' }}>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}

