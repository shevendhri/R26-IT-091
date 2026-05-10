'use client';

import { useDropzone } from 'react-dropzone';
import { FileText, Trash2 } from 'lucide-react';

export function Step2({
  files,
  onFilesChange,
  onNext,
  onBack,
}) {
  const handleDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: `FILE-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      type: 'other',
    }));

    onFilesChange([...files, ...newFiles]);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const removeFile = (id) => {
    onFilesChange(
      files.filter((f) => f.id !== id)
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';

    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + ' KB';

    return (
      (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Title */}
      <div>
        <h3
          style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: '700',
            fontSize: '28px',
            color: '#27ae60',
            marginBottom: '18px',
          }}
        >
          Upload Documents
        </h3>

        {/* Upload Box */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${
              isDragActive
                ? '#27ae60'
                : '#2c3e50'
            }`,
            backgroundColor: isDragActive
              ? 'rgba(39,174,96,0.08)'
              : '#11161b',
            borderRadius: '18px',
            padding: '50px 30px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: '0.3s ease',
          }}
        >
          <input {...getInputProps()} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '18px',
            }}
          >
            <FileText
              size={40}
              color="#27ae60"
            />
          </div>

          {isDragActive ? (
            <p
              style={{
                color: '#e8eaed',
                fontWeight: '700',
                fontSize: '16px',
              }}
            >
              Drop files here...
            </p>
          ) : (
            <div>
              <p
                style={{
                  color: '#e8eaed',
                  fontWeight: '700',
                  fontSize: '17px',
                  marginBottom: '8px',
                }}
              >
                Drag and drop files here
              </p>

              <p
                style={{
                  color: '#95a5a6',
                  fontSize: '14px',
                }}
              >
                or click to select files
                (PDF, PNG, JPG)
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  backgroundColor:
                    'rgba(44,62,80,0.35)',
                  border:
                    '1px solid #2c3e50',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                {/* File Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <FileText
                    size={22}
                    color="#27ae60"
                  />

                  <div>
                    <p
                      style={{
                        color: '#e8eaed',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '4px',
                      }}
                    >
                      {file.name}
                    </p>

                    <p
                      style={{
                        color: '#95a5a6',
                        fontSize: '12px',
                      }}
                    >
                      {formatFileSize(
                        file.size
                      )}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() =>
                    removeFile(file.id)
                  }
                  style={{
                    border: 'none',
                    background:
                      'rgba(231,76,60,0.12)',
                    padding: '10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                  }}
                >
                  <Trash2
                    size={18}
                    color="#e74c3c"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '18px',
          paddingTop: '14px',
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            flex: 1,
            border: '1px solid #27ae60',
            background: 'transparent',
            color: '#27ae60',
            padding: '15px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: '0.3s ease',
          }}
        >
          Back
        </button>

        {/* Continue */}
        <button
          onClick={onNext}
          style={{
            flex: 1,
            border: 'none',
            background:
              'linear-gradient(90deg, #27ae60, #2ecc71)',
            color: '#0d1111',
            padding: '15px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: '0.3s ease',
            boxShadow:
              '0 8px 20px rgba(39,174,96,0.25)',
          }}
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
}