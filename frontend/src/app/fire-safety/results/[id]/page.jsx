'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { db } from '../../lib/db';
import styles from '../../FireGuard.module.css';

const readable = (value) => String(value || '').replaceAll('_', ' ');
const value = (input) => input === null || input === undefined || input === '' ? 'Not available' : typeof input === 'object' ? 'See assessment evidence' : String(input);
const title = (rule) => readable(rule.title || rule.rule_name || 'Fire-safety requirement');
function Badge({ status }) {
  const tone = status === 'PASS' ? styles.badgeGreen : status === 'VIOLATION' ? styles.badgeRed : styles.badgeAmber;
  const text = status === 'PASS' ? 'Passed' : status === 'VIOLATION' ? 'Violation' : 'Needs Verification';
  return <span className={`${styles.badge} ${tone}`}>{text}</span>;
}

function RuleCard({ rule }) {
  const status = rule.status;
  const Icon = status === 'PASS' ? CheckCircle2 : status === 'VIOLATION' ? AlertTriangle : ClipboardCheck;
  const tone = status === 'PASS' ? styles.resultCardSuccess : status === 'VIOLATION' ? styles.resultCardDanger : styles.resultCardWarning;
  const actual = rule.actual_value ?? rule.actual;
  const required = rule.evaluated_requirement ?? rule.required;
  const missing = rule.missing_evidence || [];
  return <article className={`${styles.resultCard} ${tone}`}>
    <div className={styles.resultCardHeader}><span className={`${styles.resultIcon} ${status === 'PASS' ? styles.successIcon : status === 'VIOLATION' ? styles.dangerIcon : styles.warningIcon}`}><Icon size={19}/></span><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className={styles.resultCardTitle}>{title(rule)}</h3><Badge status={status}/></div><p className={styles.resultMeta}>{rule.regulation || 'Applicable ICTAD requirement'}</p></div></div>
    {rule.location && <p className={styles.resultMeta}>{rule.location}</p>}
    <p className={styles.resultMeta}>{rule.reason || rule.decision_reason}</p>
    {(actual !== null && actual !== undefined || required !== null && required !== undefined) && <div className={styles.conditionGrid}><div className={styles.conditionBox}><p className={styles.summaryLabel}>Building / plan evidence</p><p className={styles.summaryValue}>{value(actual)}</p></div><div className={styles.conditionBox}><p className={styles.summaryLabel}>Requirement</p><p className={styles.summaryValue}>{value(required)}</p></div></div>}
    {status === 'MANUAL_REVIEW' && <div className={styles.detailBlock}><p className={styles.summaryLabel}>Next step</p><p className={styles.detailBody}>{missing.length ? `Verify: ${missing.join(', ')}.` : 'Ask a qualified reviewer to confirm the remaining plan or installation evidence.'}</p></div>}
    {status === 'VIOLATION' && rule.recommendation && <div className={styles.detailBlock}><p className={styles.summaryLabel}>Recommended correction</p><p className={styles.detailBody}>{rule.recommendation}</p></div>}
  </article>;
}

export default function ResultsPage() {
  const { id } = useParams(); const [submission, setSubmission] = useState();
  useEffect(() => { let active = true; Promise.resolve().then(() => { if (active) setSubmission(db.getSubmission(id) || null); }); return () => { active = false; }; }, [id]);
  if (submission === undefined) return <div className={`${styles.page} p-16 text-center`}><Loader2 className="mx-auto animate-spin text-primary"/></div>;
  const results = submission?.analysisResults;
  if (!results) return <div className={`${styles.page} p-8`}><main className={styles.resultsContainer}><h1 className={styles.title}>Assessment results are unavailable.</h1><Link href="/fire-safety/submission/new" className={styles.primaryButton}>Start an assessment</Link></main></div>;
  const allRules = results.rules || results.rule_results || results.applied_rules || [];
  const passed = allRules.filter((rule) => rule.status === 'PASS');
  const violations = allRules.filter((rule) => rule.status === 'VIOLATION');
  const reviews = allRules.filter((rule) => rule.status === 'MANUAL_REVIEW');
  const summary = results.project_summary || {};
  const final = violations.length ? 'Requires Revision' : reviews.length ? 'Requires Review' : 'Preliminary assessment complete';
  return <div className={styles.page}><main className={styles.main}><div className={styles.resultsContainer}>
    <Link href="/fire-safety" className={styles.ghostButton}><ArrowLeft size={16}/> Back to Fire Safety</Link>
    <header className={styles.header}><div><p className={styles.eyebrow}>FireGuard preliminary report</p><h1 className={styles.title}>{summary.project_name || 'Fire Safety Assessment'}</h1><p className={styles.description}>{summary.building_use || 'Building use not supplied'}{summary.storeys ? ` · ${summary.storeys} storeys` : ''}{summary.height_m ? ` · ${summary.height_m} m high` : ''}</p></div><div className={`${styles.statusPanel} ${violations.length ? styles.statusRevision : reviews.length ? styles.statusReview : styles.statusCompliant}`}><p className={styles.summaryLabel}>Final fire-safety assessment</p><p className={styles.sectionTitle}>{final}</p></div></header>
    <section className={styles.card}><div className={styles.resultsSummaryGrid}>{[['Passed Checks', passed.length], ['Violations Found', violations.length], ['Needs Verification', reviews.length]].map(([name, count]) => <div className={styles.summaryItem} key={name}><p className={styles.summaryLabel}>{name}</p><p className={styles.summaryValue}>{count}</p></div>)}</div></section>
    <section className={styles.resultSection}><div><p className={styles.eyebrow}>Violations found</p><h2 className={styles.sectionTitle}>Items requiring correction</h2></div>{violations.length ? <div className={styles.resultList}>{violations.map((rule, index) => <RuleCard key={`${rule.rule_id}-${index}`} rule={rule}/>)}</div> : <div className={styles.noticeCard}><p className={styles.muted}>No confirmed violations were identified from the available assessment evidence.</p></div>}</section>
    <section className={styles.resultSection}><div><p className={styles.eyebrow}>Passed fire safety checks</p><h2 className={styles.sectionTitle}>Requirements supported by the available evidence</h2></div>{passed.length ? <div className={styles.resultList}>{passed.map((rule, index) => <RuleCard key={`${rule.rule_id}-${index}`} rule={rule}/>)}</div> : <div className={styles.noticeCard}><p className={styles.muted}>No regulatory checks have enough verified evidence to be shown as passed yet.</p></div>}</section>
    <section className={styles.resultSection}><div><p className={styles.eyebrow}>Needs verification</p><h2 className={styles.sectionTitle}>Information to confirm with a qualified reviewer</h2></div>{reviews.length ? <div className={styles.resultList}>{reviews.map((rule, index) => <RuleCard key={`${rule.rule_id}-${index}`} rule={rule}/>)}</div> : <div className={styles.noticeCard}><p className={styles.muted}>No additional verification items were returned for the assessed requirements.</p></div>}</section>
    <footer className={styles.footerActions}><p className={styles.muted}>This preliminary assessment is based on the submitted building details and fire plan. Final compliance should be confirmed by a qualified fire-safety professional.</p><Link href="/fire-safety/submission/new" className={styles.primaryButton}><Search size={17}/> Start New Assessment</Link></footer>
  </div></main></div>;
}
