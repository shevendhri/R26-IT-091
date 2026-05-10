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
        {/* Critical Issues */}
{failedRules.length > 0 && (
  <div>
    <h3
      style={{
        ...sectionTitle,
        color: '#ff4d4f',
      }}
    >
      Critical Issues
    </h3>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px',
      }}
    >
      {failedRules.map((rule) => (
        <div
          key={rule.ruleNumber}
          style={{
            border:
              '1px solid rgba(231,76,60,0.8)',
            background:
              'rgba(231,76,60,0.05)',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle
              size={20}
              color="#ff4d4f"
            />

            <div>
              <p
                style={{
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '18px',
                  marginBottom: '6px',
                }}
              >
                {rule.name}
              </p>

              <p
                style={{
                  color: '#8aa0b5',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {rule.ruleNumber}
              </p>

              <p
                style={{
                  color: '#ffffff',
                  lineHeight: '1.6',
                  fontSize: '15px',
                }}
              >
                {rule.details}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Warnings */}
{warningRules.length > 0 && (
  <div>
    <h3
      style={{
        ...sectionTitle,
        color: '#ff9f1a',
      }}
    >
      Warnings
    </h3>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px',
      }}
    >
      {warningRules.map((rule) => (
        <div
          key={rule.ruleNumber}
          style={{
            border:
              '1px solid rgba(255,159,26,0.7)',
            background:
              'rgba(255,159,26,0.05)',
            borderRadius: '18px',
            padding: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle
              size={20}
              color="#ff9f1a"
            />

            <div>
              <p
                style={{
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '18px',
                  marginBottom: '6px',
                }}
              >
                {rule.name}
              </p>

              <p
                style={{
                  color: '#8aa0b5',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {rule.ruleNumber}
              </p>

              <p
                style={{
                  color: '#ffffff',
                  lineHeight: '1.6',
                  fontSize: '15px',
                }}
              >
                {rule.details}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Download Report */}
<div style={cardStyle}>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
    }}
  >
    <div>
      <h3
        style={{
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          marginBottom: '8px',
        }}
      >
        Download Report
      </h3>

      <p
        style={{
          color: '#8aa0b5',
          fontSize: '15px',
        }}
      >
        Get a detailed PDF report of
        the fire safety analysis
      </p>
    </div>

    <PDFDownloadLink
      document={generatePDFDocument(results)}
      fileName={`FireSafe_Report_${submissionId}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          style={{
            background: '#27ae60',
            color: '#000',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 26px',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Download size={18} />

          {loading
            ? 'Generating...'
            : 'Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  </div>
</div>

{/* Statistics */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
  }}
>
  {/* Compliant */}
  <div style={cardStyle}>
    <p
      style={{
        color: '#8aa0b5',
        marginBottom: '18px',
      }}
    >
      Compliant Rules
    </p>

    <p
      style={{
        color: '#27ae60',
        fontSize: '54px',
        fontWeight: '700',
        fontFamily:
          "'Orbitron', monospace",
      }}
    >
      {passedRules.length}
    </p>

    <p
      style={{
        color: '#8aa0b5',
        marginTop: '10px',
      }}
    >
      out of {results.rules.length} total
    </p>
  </div>

  {/* Issues */}
  <div style={cardStyle}>
    <p
      style={{
        color: '#8aa0b5',
        marginBottom: '18px',
      }}
    >
      Issues Found
    </p>

    <p
      style={{
        color: '#ff4d4f',
        fontSize: '54px',
        fontWeight: '700',
        fontFamily:
          "'Orbitron', monospace",
      }}
    >
      {failedRules.length +
        warningRules.length}
    </p>

    <p
      style={{
        color: '#8aa0b5',
        marginTop: '10px',
      }}
    >
      {failedRules.length} critical,{' '}
      {warningRules.length} warnings
    </p>
  </div>

  {/* Completion */}
  <div style={cardStyle}>
    <p
      style={{
        color: '#8aa0b5',
        marginBottom: '18px',
      }}
    >
      Completion
    </p>

    <p
      style={{
        color: '#27ae60',
        fontSize: '54px',
        fontWeight: '700',
        fontFamily:
          "'Orbitron', monospace",
      }}
    >
      {results.completionPercentage}%
    </p>

    <p
      style={{
        color: '#8aa0b5',
        marginTop: '10px',
      }}
    >
      Analysis completion
    </p>
  </div>
</div>
   
   
      </div>
  
    </div>
  );
}