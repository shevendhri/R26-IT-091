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
    <div style={{ minHeight: '100vh', background: '#F3F5F1', color: '#18251F', fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main style={{ maxWidth: '820px', margin: '3.5rem auto 5rem', padding: '0 1.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #C4CFC6',
          borderRadius: '20px',
          padding: '2.5rem 3rem',
          boxShadow: '0 8px 30px rgba(24, 37, 31, 0.06)',
          textAlign: 'center'
        }}>
          {/* Error icon badge */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#FDF2EE',
            border: '1px solid rgba(217, 91, 50, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D95B32',
            fontSize: '1.6rem',
            margin: '0 auto 1.2rem'
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#18251F',
            margin: '0 0 0.6rem',
            letterSpacing: '-0.02em'
          }}>
            Recommendation Analysis Error
          </h1>

          <p style={{
            fontSize: '0.92rem',
            color: '#A8492E',
            background: '#FDF2EE',
            border: '1px solid rgba(217, 91, 50, 0.2)',
            borderRadius: '10px',
            padding: '0.8rem 1.2rem',
            margin: '0 0 2rem',
            fontWeight: 600,
            lineHeight: 1.5
          }}>
            {msg}
          </p>

          {/* Diagnostic breakdown */}
          <div style={{
            textAlign: 'left',
            background: '#F8FAF7',
            border: '1px solid #E6EBE4',
            padding: '1.5rem',
            borderRadius: '14px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk', margin: '0 0 0.6rem' }}>
              Possible Causes
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: '#4A5E52', fontSize: '0.82rem', lineHeight: 1.7, margin: '0 0 1.2rem' }}>
              <li>Input constraints exceed available material catalog limits (stress, thermal, or climate boundaries).</li>
              <li>Missing or incomplete material requirement selections.</li>
              <li>Network or backend API service interruption.</li>
            </ul>

            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#18251F', fontFamily: 'Space Grotesk', margin: '0 0 0.6rem' }}>
              Recommended Next Steps
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: '#4A5E52', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>
              <li>Return to the specification form to review and adjust parameters.</li>
              <li>Retry the analysis with standard baseline constraints.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.replace('/materials/form')}
              style={{
                background: '#1E5438',
                border: 'none',
                padding: '0.8rem 1.8rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                fontFamily: 'Space Grotesk',
                cursor: 'pointer',
                borderRadius: '10px',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(30, 84, 56, 0.25)'
              }}
            >
              Return to Form
            </button>
            <button
              onClick={() => router.replace('/materials/processing')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #C4CFC6',
                padding: '0.8rem 1.8rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontFamily: 'Space Grotesk',
                cursor: 'pointer',
                borderRadius: '10px',
                color: '#18251F'
              }}
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
