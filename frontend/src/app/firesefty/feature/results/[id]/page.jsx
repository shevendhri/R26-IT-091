'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { db } from '../../../lib/db';
import { VerdictCard } from '../../../components/VerdictCard';

import Header from '../../../../../components/Header';
import Footer from '../../../../../components/Footer';

import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  Loader,
} from 'lucide-react';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { generatePDFDocument } from '../../../lib/pdf-generator';

export default function ResultsPage() {
  const params = useParams();
  const submissionId = params.id;

  const [submission, setSubmission] =
    useState(null);

  const [showAnnotated, setShowAnnotated] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const sub = db.getSubmission(
      submissionId
    );

    setSubmission(sub || null);
    setIsLoading(false);
  }, [submissionId]);

  /* -------------------------------- */
  /* Loading */
  /* -------------------------------- */

  if (isLoading) {
    return (
      
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1111',
          color: '#e8eaed',
        }}
      >
        
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <Loader
            size={44}
            color="#27ae60"
            style={{
              animation:
                'spin 1s linear infinite',
              marginBottom: '18px',
            }}
          />

          <p
            style={{
              fontSize: '15px',
            }}
          >
            Loading analysis results...
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /* -------------------------------- */
  /* Not Found */
  /* -------------------------------- */

  if (
    !submission ||
    !submission.analysisResults
  ) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px',
          background: '#0d1111',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            border:
              '1px solid rgba(231,76,60,0.3)',
            background:
              'rgba(231,76,60,0.08)',
            borderRadius: '18px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <AlertCircle
            size={40}
            color="#e74c3c"
            style={{
              marginBottom: '18px',
            }}
          />

          <p
            style={{
              color: '#e8eaed',
              fontWeight: '700',
              fontSize: '18px',
            }}
          >
            Submission not found or
            analysis incomplete
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------- */
  /* Data */
  /* -------------------------------- */

  const results =
    submission.analysisResults;

  const failedRules =
    results.rules.filter(
      (r) => r.status === 'fail'
    );

  const warningRules =
    results.rules.filter(
      (r) => r.status === 'warning'
    );

  const passedRules =
    results.rules.filter(
      (r) => r.status === 'pass'
    );

  /* -------------------------------- */
  /* Helpers */
  /* -------------------------------- */

  const sectionTitle = {
    fontFamily:
      "'Orbitron', monospace",
    fontWeight: '700',
    fontSize: '22px',
    marginBottom: '18px',
  };

  const cardStyle = {
    background: '#1a1f24',
    border: '1px solid #2c3e50',
    borderRadius: '20px',
    padding: '24px',
    boxShadow:
      '0 10px 25px rgba(0,0,0,0.25)',
  };

  /* -------------------------------- */
  /* Page */
  /* -------------------------------- */

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
     
        background: '#0d1111',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <Header
        title="Fire Safety Results"
        subtitle={`Submission ID: ${submissionId}`}
      />

      {/* Verdict */}
      <VerdictCard results={results} />

      {/* Main Grid */}
  <div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    maxWidth: '10000px',
  }}
>
        {/* Rules */}
        <div>
          <h3
            style={{
              ...sectionTitle,
              color: '#e8eaed',
            }}
          >
            ICTAD Compliance Rules
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {results.rules.map(
              (rule, index) => {
                const getColors = (
                  status
                ) => {
                  switch (status) {
                    case 'pass':
                      return {
                        border:
                          '#27ae60',
                        bg: 'rgba(39,174,96,0.08)',
                        icon: (
                          <CheckCircle2
                            size={18}
                            color="#27ae60"
                          />
                        ),
                      };

                    case 'fail':
                      return {
                        border:
                          '#e74c3c',
                        bg: 'rgba(231,76,60,0.08)',
                        icon: (
                          <AlertCircle
                            size={18}
                            color="#e74c3c"
                          />
                        ),
                      };

                    default:
                      return {
                        border:
                          '#f39c12',
                        bg: 'rgba(243,156,18,0.08)',
                        icon: (
                          <AlertTriangle
                            size={18}
                            color="#f39c12"
                          />
                        ),
                      };
                  }
                };

                const colors =
                  getColors(
                    rule.status
                  );

                return (
                  <div
                    key={
                      rule.ruleNumber
                    }
                    style={{
                      border: `1px solid ${colors.border}`,
                      background:
                        colors.bg,
                      borderRadius:
                        '16px',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        gap: '12px',
                      }}
                    >
                      {colors.icon}

                      <div>
                        <p
                          style={{
                            fontSize:
                              '11px',
                            color:
                              '#95a5a6',
                            fontWeight:
                              '700',
                            marginBottom:
                              '4px',
                          }}
                        >
                          {
                            rule.ruleNumber
                          }
                        </p>

                        <p
                          style={{
                            fontSize:
                              '14px',
                            color:
                              '#e8eaed',
                            fontWeight:
                              '700',
                          }}
                        >
                          {rule.name}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Floor Plan */}
   
      </div>
    </div>
  );
}