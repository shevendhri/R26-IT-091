'use client';

import { FileText, Building2 } from 'lucide-react';

export function Step3({
  submission,
  isSubmitting,
  onSubmit,
  onBack,
}) {
  const { buildingInfo, files } = submission;

  const sectionCardStyle = {
    backgroundColor: '#1a1f24',
    border: '1px solid #2c3e50',
    borderRadius: '18px',
    padding: '28px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#95a5a6',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle = {
    fontSize: '15px',
    color: '#e8eaed',
    fontWeight: '500',
    lineHeight: '1.5',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Header */}
      <h3
        style={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: '700',
          fontSize: '28px',
          color: '#27ae60',
        }}
      >
        Review Your Submission
      </h3>

      {/* Building Information */}
      <div style={sectionCardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          <Building2
            size={22}
            color="#27ae60"
          />

          <h4
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#e8eaed',
            }}
          >
            Building Information
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          <div>
            <p style={labelStyle}>
              Building Name
            </p>

            <p style={valueStyle}>
              {buildingInfo.buildingName}
            </p>
          </div>

          <div>
            <p style={labelStyle}>
              Building Type
            </p>

            <p style={valueStyle}>
              {buildingInfo.buildingType}
            </p>
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
            }}
          >
            <p style={labelStyle}>
              Address
            </p>

            <p style={valueStyle}>
              {buildingInfo.address}
            </p>
          </div>

          <div>
            <p style={labelStyle}>
              Owner Name
            </p>

            <p style={valueStyle}>
              {buildingInfo.ownerName}
            </p>
          </div>

          <div>
            <p style={labelStyle}>
              Contact
            </p>

            <p style={valueStyle}>
              {buildingInfo.ownerContact}
            </p>
          </div>

          <div>
            <p style={labelStyle}>
              Square Footage
            </p>

            <p style={valueStyle}>
              {parseInt(
                buildingInfo.squareFootage
              ).toLocaleString()}{' '}
              sq ft
            </p>
          </div>

          <div>
            <p style={labelStyle}>
              Number of Floors
            </p>

            <p style={valueStyle}>
              {buildingInfo.numberOfFloors}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <div style={sectionCardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '22px',
          }}
        >
          <FileText
            size={22}
            color="#27ae60"
          />

          <h4
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#e8eaed',
            }}
          >
            Uploaded Documents (
            {files.length})
          </h4>
        </div>

        {files.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor:
                    'rgba(44,62,80,0.35)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border:
                    '1px solid #2c3e50',
                }}
              >
                <FileText
                  size={18}
                  color="#27ae60"
                />

                <span
                  style={{
                    color: '#e8eaed',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {file.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              color: '#95a5a6',
              fontStyle: 'italic',
              fontSize: '14px',
            }}
          >
            No documents uploaded
          </p>
        )}
      </div>

      {/* Info Box */}
      <div
        style={{
          border: '1px solid #27ae60',
          background:
            'rgba(39,174,96,0.08)',
          borderRadius: '16px',
          padding: '22px',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: '#e8eaed',
            lineHeight: '1.7',
          }}
        >
          <strong>
            Next Step:
          </strong>{' '}
          Click "Submit for Analysis"
          to send your submission for
          AI-powered fire safety
          analysis. You will receive
          a detailed report with
          recommendations within
          minutes.
        </p>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '18px',
          paddingTop: '10px',
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          disabled={isSubmitting}
          style={{
            flex: 1,
            border: '1px solid #27ae60',
            background: 'transparent',
            color: '#27ae60',
            padding: '16px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: isSubmitting
              ? 'not-allowed'
              : 'pointer',
            opacity: isSubmitting
              ? 0.5
              : 1,
            transition: '0.3s ease',
          }}
        >
          Back
        </button>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          style={{
            flex: 1,
            border: 'none',
            background:
              'linear-gradient(90deg, #27ae60, #2ecc71)',
            color: '#0d1111',
            padding: '16px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: isSubmitting
              ? 'not-allowed'
              : 'pointer',
            opacity: isSubmitting
              ? 0.7
              : 1,
            transition: '0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow:
              '0 8px 20px rgba(39,174,96,0.25)',
          }}
        >
          {isSubmitting ? (
            <>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  border:
                    '2px solid #0d1111',
                  borderTop:
                    '2px solid transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation:
                    'spin 1s linear infinite',
                }}
              />

              Submitting...
            </>
          ) : (
            'Submit for Analysis'
          )}
        </button>
      </div>

      {/* Spinner Animation */}
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