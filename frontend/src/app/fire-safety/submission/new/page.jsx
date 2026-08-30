'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardEdit,
  FileSearch,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
  ArrowLeft,
} from 'lucide-react';
import { db } from '../../lib/db';
import styles from '../../FireGuard.module.css';
import {
  ANALYSIS_STAGE_MESSAGES,
  analyzeSubmission,
  startManualAssessment,
  startValidatedDemo,
} from '../../lib/ai-analyzer';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewSubmissionPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(null);
  const [activeMode, setActiveMode] = useState(null);

  const handleDrop = (acceptedFiles) => {
    const nextFiles = acceptedFiles.map((file) => ({
      id: `FILE-${Date.now()}-${globalThis.crypto?.randomUUID?.() || Math.random()}`,
      name: file.name,
      size: file.size,
      mediaType: file.type || 'application/octet-stream',
      uploadedAt: new Date(),
      rawFile: file,
    }));
    setFiles((current) => [...current, ...nextFiles]);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (id) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  };

  const handleAnalyze = async (mode) => {
    if (mode !== 'validated' && !files.length) {
      toast.error('Upload at least one drawing before starting the pre-assessment.');
      return;
    }

    setIsSubmitting(true);
    setActiveMode(mode);
    setAnalysisStage('UPLOADING');
    const submission = db.createSubmission({ files, status: mode === 'experimental' ? 'analyzing' : 'complete' });

    try {
      let results;
      if (mode === 'validated') {
        toast.loading('Preparing validated demonstration dataset...', { id: 'analysis' });
        results = await startValidatedDemo();
      } else if (mode === 'manual') {
        toast.loading('Preparing building information review...', { id: 'analysis' });
        results = await startManualAssessment({ files });
      } else {
        toast.loading(ANALYSIS_STAGE_MESSAGES.UPLOADING, { id: 'analysis' });
        results = await analyzeSubmission({ files }, {
          experimental: true,
          onStage: (stage) => {
            setAnalysisStage(stage);
            toast.loading(ANALYSIS_STAGE_MESSAGES[stage] || 'Running FireGuard analysis...', { id: 'analysis' });
          },
        });
      }
      db.updateSubmission(submission.id, {
        status: 'complete',
        analysisResults: results,
      });
      toast.success(mode === 'experimental' ? 'Pre-assessment complete.' : 'Review form ready.', { id: 'analysis' });
      router.push(`/fire-safety/results/${submission.id}`);
    } catch (error) {
      db.updateSubmission(submission.id, {
        status: 'failed',
        analysisError: error.message,
      });
      toast.error(error.message || 'Pre-assessment failed.', { id: 'analysis' });
    } finally {
      setIsSubmitting(false);
      setAnalysisStage(null);
      setActiveMode(null);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
        <div className="mb-6">
          <Link
            href="/fire-safety"
            className={styles.ghostButton}
          >
            <ArrowLeft size={16} />
            Fire Safety
          </Link>
        </div>

      <div className={styles.twoColumn}>
        <section className={styles.sectionStack}>
          <div className={styles.header}>
            <div>
            <p className={styles.eyebrow}>New Assessment</p>
            <h1 className={styles.title}>
              Upload plans for FireGuard review
            </h1>
            <p className={styles.description}>
              Prepare building information, means of escape, and fire-protection evidence for the ICTAD rule engine.
            </p>
            </div>
          </div>

          <div className={styles.modeGrid}>
            <button
              type="button"
              onClick={() => handleAnalyze('validated')}
              disabled={isSubmitting}
              className={`${styles.modeCard} ${styles.modeCardActive}`}
            >
              <div className="flex items-center justify-between gap-3">
                <CheckCircle2 size={22} className="text-primary" />
                <span className={`${styles.badge} ${styles.badgeGreen}`}>Recommended</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Validated Demonstration</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Recommended for research demonstration.</p>
              <p className="mt-3 text-xs font-semibold text-primary">Validated Demonstration Dataset</p>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyze('manual')}
              disabled={isSubmitting || files.length === 0}
              className={styles.modeCard}
            >
              <ClipboardEdit size={22} className="text-primary" />
              <h3 className="mt-4 font-semibold text-foreground">Manual / Assisted Assessment</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter building evidence and run FireGuard rules.</p>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyze('experimental')}
              disabled={isSubmitting || files.length === 0}
              className={styles.modeCard}
            >
              <Sparkles size={22} className="text-accent" />
              <h3 className="mt-4 font-semibold text-foreground">Experimental AI Extraction</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Attempts automatic extraction from the drawing.</p>
              <p className="mt-3 text-xs text-muted-foreground">Experimental feature. Analysis time and extraction completeness may vary.</p>
            </button>
          </div>

          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={42} className="mx-auto mb-4 text-primary" />
            <p className="font-semibold text-foreground">
              {isDragActive ? 'Drop drawings here' : 'Drag drawings here or click to browse'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              PDF, PNG, JPG, or JPEG files up to 25 MB each.
            </p>
          </div>

          {fileRejections.length > 0 && (
            <div className={`${styles.noticeCard} border-destructive bg-destructive/5`}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Some files were not added</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check file type and size, then try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 className={styles.sectionTitle}>Drawing Set</h3>
              </div>
              <span className={styles.muted}>{files.length} file(s)</span>
            </div>

            {files.length ? (
              <div className="divide-y divide-border">
                {files.map((file) => (
                  <div key={file.id} className={styles.fileRow}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFileSize(file.size)} - {file.mediaType || 'Unknown type'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      disabled={isSubmitting}
                      className="shrink-0 rounded-lg p-2 text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/20 disabled:opacity-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${styles.muted} px-5 py-10 text-center`}>
                No drawings selected yet.
              </div>
            )}
          </div>
        </section>

        <aside className={styles.sectionStack}>
          <div className={styles.card}>
            <div className={styles.infoCard}>
            <div className={styles.infoHeading}>
              <span className={styles.infoIcon}>
                <FileSearch size={19} />
              </span>
              <h3 className={styles.sectionTitle}>How FireGuard works</h3>
            </div>
            <ol className={styles.stepList}>
              <li><span className={styles.stepNumber}>1</span><span>Building information is extracted or confirmed.</span></li>
              <li><span className={styles.stepNumber}>2</span><span>Evidence is normalized into a structured building model.</span></li>
              <li><span className={styles.stepNumber}>3</span><span>ICTAD regulations are evaluated using deterministic rules.</span></li>
              <li><span className={styles.stepNumber}>4</span><span>Missing evidence is reported as Manual Review rather than a violation.</span></li>
              <li><span className={styles.stepNumber}>5</span><span>FireGuard recommends required fire-safety features and corrective actions.</span></li>
            </ol>
            </div>
          </div>

          <div className={`${styles.noticeCard} bg-primary/5`}>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 text-primary" />
              <p className="text-sm leading-6 text-foreground">
                FireGuard is a fire-safety pre-assessment and decision-support prototype. It does not replace formal Fire Service Department or regulatory authority approval.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAnalyze('validated')}
            disabled={isSubmitting}
            className={styles.primaryButton}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {activeMode === 'experimental' ? ANALYSIS_STAGE_MESSAGES[analysisStage] || 'Running pre-assessment' : 'Preparing review'}
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Start Validated Demonstration
              </>
            )}
          </button>
        </aside>
      </div>
      </div>
      </main>
    </div>
  );
}
