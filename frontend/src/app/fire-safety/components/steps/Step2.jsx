'use client';

import { useDropzone } from 'react-dropzone';
import { FileText, Trash2 } from 'lucide-react';

export function Step2({ files, onFilesChange, onNext, onBack }) {
  const handleDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: `FILE-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      type: 'other',
      rawFile: file,
    }));
    onFilesChange([...files, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (id) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-orbitron font-bold text-foreground mb-3">
          Upload Documents
        </h3>
        <div
          {...getRootProps()}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <FileText size={32} className="mx-auto mb-3 text-primary" />
          {isDragActive ? (
            <p className="text-foreground font-semibold">Drop files here...</p>
          ) : (
            <div>
              <p className="text-foreground font-semibold">
                Drag and drop files here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select files (PDF, PNG, JPG, JPEG)
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="rounded-lg p-2 hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} className="text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-6">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
}
