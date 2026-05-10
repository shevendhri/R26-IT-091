'use client';

import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export function VerdictCard({ results }) {
  const {
    overallStatus,
    summary,
    errorCount,
    warningCount,
    completionPercentage,
  } = results;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pass':
        return {
          icon: CheckCircle,
          borderColor: '#27ae60',
          background:
            'rgba(39,174,96,0.12)',
          textColor: '#27ae60',
          label: 'CERTIFIED',
        };

      case 'fail':
        return {
          icon: AlertCircle,
          borderColor: '#e74c3c',
          background:
            'rgba(231,76,60,0.12)',
          textColor: '#e74c3c',
          label: 'NOT CERTIFIED',
        };

      default:
        return {
          icon: AlertTriangle,
          borderColor: '#f39c12',
          background:
            'rgba(243,156,18,0.12)',
          textColor: '#f39c12',
          label: 'CONDITIONAL',
        };
    }
  };

  const config = getStatusConfig(
    overallStatus
  );

  const StatusIcon = config.icon;

  return (
    <div
      style={{
        width: '100%',
        border: `2px solid ${config.borderColor}`,
        borderRadius: '22px',
        padding: '34px',
        background: config.background,
        transition: '0.3s ease',
        backdropFilter: 'blur(10px)',
        boxShadow:
          '0 10px 30px rgba(0,0,0,0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Top Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap',
          }}
        >
          {/* Icon */}
          <div>
            <StatusIcon
              size={44}
              color={config.textColor}
            />
          </div>

          {/* Title */}
          <div
            style={{
              flex: 1,
            }}
          >
            <p
              style={{
                fontFamily:
                  "'Orbitron', monospace",
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '1px',
                color: config.textColor,
                marginBottom: '6px',
              }}
            >
              {config.label}
            </p>

            <p
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#e8eaed',
              }}
            >
              Fire Safety Analysis
              Result
            </p>
          </div>

          {/* Percentage */}
          <div
            style={{
              background:
                'rgba(255,255,255,0.04)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '18px 24px',
              textAlign: 'center',
              minWidth: '120px',
            }}
          >
            <p
              style={{
                fontSize: '34px',
                fontWeight: '900',
                fontFamily:
                  "'Orbitron', monospace",
                color: '#27ae60',
                marginBottom: '4px',
              }}
            >
              {completionPercentage}%
            </p>

            <p
              style={{
                fontSize: '12px',
                color: '#95a5a6',
              }}
            >
              Completion
            </p>
          </div>
        </div>

        {/* Summary */}
        <p
          style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: '#e8eaed',
          }}
        >
          {summary}
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '18px',
          }}
        >
          {/* Compliant */}
          <div
            style={{
              background:
                'rgba(39,174,96,0.12)',
              border:
                '1px solid rgba(39,174,96,0.2)',
              borderRadius: '16px',
              padding: '22px',
            }}
          >
            <p
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#27ae60',
                marginBottom: '6px',
              }}
            >
              {
                results.rules.filter(
                  (r) =>
                    r.status === 'pass'
                ).length
              }
            </p>

            <p
              style={{
                fontSize: '13px',
                color: '#95a5a6',
              }}
            >
              Compliant
            </p>
          </div>

          {/* Warnings */}
          <div
            style={{
              background:
                'rgba(243,156,18,0.12)',
              border:
                '1px solid rgba(243,156,18,0.2)',
              borderRadius: '16px',
              padding: '22px',
            }}
          >
            <p
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#f39c12',
                marginBottom: '6px',
              }}
            >
              {warningCount}
            </p>

            <p
              style={{
                fontSize: '13px',
                color: '#95a5a6',
              }}
            >
              Warnings
            </p>
          </div>

          {/* Errors */}
          <div
            style={{
              background:
                'rgba(231,76,60,0.12)',
              border:
                '1px solid rgba(231,76,60,0.2)',
              borderRadius: '16px',
              padding: '22px',
            }}
          >
            <p
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#e74c3c',
                marginBottom: '6px',
              }}
            >
              {errorCount}
            </p>

            <p
              style={{
                fontSize: '13px',
                color: '#95a5a6',
              }}
            >
              Errors
            </p>
          </div>
        </div>

        {/* Status Message */}
        {overallStatus === 'fail' && (
          <div
            style={{
              border:
                '1px solid rgba(231,76,60,0.3)',
              background:
                'rgba(231,76,60,0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#e74c3c',
                marginBottom: '8px',
              }}
            >
              Action Required
            </p>

            <p
              style={{
                fontSize: '14px',
                color: '#e8eaed',
                lineHeight: '1.7',
              }}
            >
              Critical issues must
              be addressed before
              certification can be
              granted. Review the
              detailed report below.
            </p>
          </div>
        )}

        {overallStatus ===
          'conditional' && (
          <div
            style={{
              border:
                '1px solid rgba(243,156,18,0.3)',
              background:
                'rgba(243,156,18,0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#f39c12',
                marginBottom: '8px',
              }}
            >
              Improvements Needed
            </p>

            <p
              style={{
                fontSize: '14px',
                color: '#e8eaed',
                lineHeight: '1.7',
              }}
            >
              Address the warnings
              noted in the report to
              achieve full compliance
              and certification.
            </p>
          </div>
        )}

        {overallStatus === 'pass' && (
          <div
            style={{
              border:
                '1px solid rgba(39,174,96,0.3)',
              background:
                'rgba(39,174,96,0.08)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#27ae60',
                marginBottom: '8px',
              }}
            >
              Certification Approved
            </p>

            <p
              style={{
                fontSize: '14px',
                color: '#e8eaed',
                lineHeight: '1.7',
              }}
            >
              This building meets all
              ICTAD fire safety
              requirements and is
              eligible for
              certification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}