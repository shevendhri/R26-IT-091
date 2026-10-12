'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from './lib/db';
import { Activity, AlertCircle, CheckCircle, Clock, Eye, FileText, Flame, Plus } from 'lucide-react';
import styles from './FireGuard.module.css';
import ModuleHeroBanner from '@/components/ui/ModuleHeroBanner';

export default function Dashboard() {
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    analyzing: 0,
    pending: 0,
    recentActivity: [],
  });

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const allSubmissions = db.getAllSubmissions();
      setSubmissions(allSubmissions);
      setStats(db.getStats());
    });
    return () => {
      active = false;
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return styles.badgeGreen;
      case 'failed':
      case 'error':
        return styles.badgeRed;
      case 'analyzing':
        return styles.badgeAmber;
      case 'submitted':
        return styles.badgeNeutral;
      case 'draft':
        return styles.badgeNeutral;
      default:
        return styles.badgeNeutral;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle size={16} />;
      case 'failed':
      case 'error':
        return <AlertCircle size={16} />;
      case 'analyzing':
        return <Clock size={16} className="animate-spin" />;
      case 'submitted':
        return <FileText size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusLabel = (status = '') => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'failed':
      case 'error':
        return 'Failed';
      case 'analyzing':
        return 'Analyzing';
      case 'submitted':
        return 'Submitted';
      case 'draft':
        return 'Draft';
      default:
        return status ? status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Draft';
    }
  };

  const getProjectName = (submission) => (
    submission.analysisResults?.project_summary?.project_title
    || submission.buildingInfo?.buildingName
    || 'Building Assessment'
  );

  const getBuildingUse = (submission) => {
    const projectName = getProjectName(submission).trim().toLowerCase();
    const buildingUse = (
      submission.analysisResults?.project_summary?.building_use
      || submission.analysisResults?.project_summary?.purpose_group
      || submission.buildingInfo?.buildingType
      || ''
    ).trim();

    if (!buildingUse || buildingUse.toLowerCase() === projectName) {
      return 'Not determined';
    }

    return buildingUse;
  };

  const formatSubmittedDate = (date) => {
    const submittedAt = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(submittedAt.getTime())) return 'Not dated';
    return submittedAt.toLocaleDateString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const statCards = [
    { label: 'System Status', value: 'Active', icon: Activity, accent: styles.iconGreen },
    { label: 'Total Assessments', value: stats.total, icon: FileText, accent: styles.iconBlue },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, accent: styles.iconGreen },
    { label: 'Analyzing', value: stats.analyzing, icon: Clock, accent: styles.iconAmber },
  ];

  const recentLimit = 5;
  const displayedSubmissions = showAllAssessments ? submissions : submissions.slice(0, recentLimit);
  const hasMoreAssessments = submissions.length > recentLimit;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
        <ModuleHeroBanner
          track="04 / FIRE CODE VALIDATION"
          kicker="ICTAD & LIFE SAFETY EGRESS AUDIT"
          title="FIREGUARD LIFE SAFETY & COMPLIANCE ENGINE"
          subtitle="Assess architectural and fire-safety drawings against Sri Lankan ICTAD fire regulations, egress geometry, and travel distance standards."
          imageSrc="/fire_safety_architecture.jpg"
          imageAlt="Fire Safety Engineering & Architectural Compliance"
          actions={
            <Link
              href="/fire-safety/submission/new"
              className={styles.primaryButton}
              style={{
                background: '#143825',
                color: '#FCFAF6',
                padding: '0.75rem 1.4rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.74rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Plus size={16} />
              New Assessment
            </Link>
          }
        />

        <section className={styles.statsGrid}>
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className={styles.statCard}>
                <div className={styles.statInner}>
                  <div>
                    <p className={styles.statLabel}>{stat.label}</p>
                    <p className={styles.statValue}>{stat.value}</p>
                  </div>
                  <span className={`${styles.statIcon} ${stat.accent}`}>
                    <Icon size={20} />
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Recent Assessments</h2>
              <p className={styles.muted}>Saved FireGuard reports from this browser.</p>
            </div>
            <span className={`${styles.badge} ${styles.badgeFire}`}>
              <Flame size={14} />
              Backend Rule Engine
            </span>
          </div>

          {submissions.length ? (
            <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Project', 'Building Use', 'Status', 'Submitted', 'Action'].map((heading) => (
                      <th key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {displayedSubmissions.map((submission) => {
                    const projectName = getProjectName(submission);
                    const buildingUse = getBuildingUse(submission);
                    const isComplete = submission.status === 'complete';
                    const isFailed = submission.status === 'failed' || submission.status === 'error';

                    return (
                    <tr key={submission.id}>
                      <td>
                        <span className={styles.truncate} title={projectName}>{projectName}</span>
                      </td>
                      <td>
                        <span className={styles.truncate} title={buildingUse}>{buildingUse}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          {getStatusLabel(submission.status)}
                        </span>
                      </td>
                      <td>
                        {formatSubmittedDate(submission.submittedAt)}
                      </td>
                      <td>
                        {isComplete ? (
                          <Link
                            href={`/fire-safety/results/${submission.id}`}
                            className={styles.ghostButton}
                          >
                            <Eye size={14} />
                            View Report
                          </Link>
                        ) : isFailed ? (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>Unavailable</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>Unavailable</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {hasMoreAssessments && (
              <div className={styles.tableFooter}>
                <button
                  type="button"
                  onClick={() => setShowAllAssessments((value) => !value)}
                  className={styles.secondaryButton}
                >
                  {showAllAssessments ? 'Show Latest Assessments' : 'View All Assessments'}
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="px-5 py-12 text-center sm:px-6">
              <div className={`${styles.statIcon} ${styles.iconGreen} mx-auto`}>
                <FileText size={24} />
              </div>
              <h3 className={styles.sectionTitle}>No assessments yet</h3>
              <p className={`${styles.muted} mx-auto mt-2 max-w-md`}>
                Upload an architectural plan to begin a FireGuard pre-assessment.
              </p>
              <Link
                href="/fire-safety/submission/new"
                className={`${styles.primaryButton} mt-5`}
              >
                <Plus size={18} />
                New Assessment
              </Link>
            </div>
          )}
        </section>
        </div>
      </main>
    </div>
  );
}
