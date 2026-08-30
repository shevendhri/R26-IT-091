'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ChevronDown, FileWarning, Loader, MinusCircle, Printer, XCircle } from 'lucide-react';
import { db } from '../../lib/db';
import { rerunWithUserConfirmations } from '../../lib/ai-analyzer';
import styles from '../../FireGuard.module.css';

const statusCopy = {
  COMPLIANT: { label: 'No confirmed revisions required', className: styles.statusCompliant },
  REQUIRES_REVISION: { label: 'Requires Revision', className: styles.statusRevision },
  REQUIRES_REVIEW: { label: 'Requires Review', className: styles.statusReview },
  AWAITING_USER_INPUT: { label: 'Review Building Information', className: styles.statusCompliant },
};

const friendlyRuleTitles = {
  'CH2-EXITS-STOREY-COUNT': 'Independent exit provision',
  'CH2-ROOM-EXIT-COUNT-TABLE4': 'Room exit provision',
  'CH2-TRAVEL-DISTANCE-TABLE5': 'Travel distance',
  'CH2-SMOKE-FREE-STAIR-APPROACH': 'Smoke-free stair approach',
  'CH2-STAIR-PRESSURIZATION-HIGHRISE': 'High-rise stair pressurization',
  'CH2-EXIT-DOOR-SWING': 'Exit door swing',
  'CH2-EXIT-DOOR-WIDTH': 'Exit door width',
  'CH2-EXIT-DOOR-HEIGHT': 'Exit door height',
  'CH2-EXIT-LIGHTING': 'Escape route lighting',
  'CH2-EXIT-SIGNAGE': 'Exit signage',
  'CH4-WET-RISING-MAIN': 'Wet rising main',
  'CH4-RISING-MAIN-QUANTITY': 'Wet rising main quantity',
  'CH4-HOSE-REEL': 'Hose reels',
  'CH4-FIRE-LIFT': 'Fire lift',
  'CH4-FIREFIGHTING-SHAFT': 'Firefighting shaft',
  'CH4-FIRE-ALARM-TABLE14': 'Fire alarm provision',
  'CH4-MANUAL-CALL-POINTS': 'Manual call points',
  'CH4-SPRINKLER-HEIGHT': 'Height-triggered sprinkler provision',
  'CH4-SPRINKLER-COMPARTMENTATION': 'Compartmentation sprinkler provision',
  'CH4-SPRINKLER-HIGH-HAZARD-18M': 'High-hazard sprinkler provision',
  'CH4-PORTABLE-EXTINGUISHERS': 'Portable fire extinguishers',
  'CH4-EXTERNAL-HYDRANTS': 'External hydrant',
};

const featureNames = {
  ESCAPE_ROUTE_LIGHTING: 'Escape route lighting',
  EXIT_SIGNAGE: 'Exit signage',
  WET_RISING_MAIN: 'Wet rising main',
  HOSE_REEL: 'Hose reels',
  FIRE_LIFT: 'Fire lift',
  FIRE_FIGHTING_SHAFT: 'Firefighting shaft',
  FIRE_ALARM_SYSTEM: 'Fire alarm',
  MANUAL_CALL_POINT: 'Manual call points',
  SPRINKLER_SYSTEM: 'Sprinkler system',
  PORTABLE_FIRE_EXTINGUISHER: 'Portable fire extinguishers',
  EXTERNAL_HYDRANT: 'External hydrant',
};

function titleForRule(rule) {
  return friendlyRuleTitles[rule.rule_id] || rule.title || rule.description || 'Fire-safety check';
}

function prettyLabel(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function valueOrFallback(value) {
  if (value === null || value === undefined || value === '') return 'Not determined';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not determined';
  if (typeof value === 'object') return Object.keys(value).length ? JSON.stringify(value) : 'Not determined';
  return String(value);
}

function formatNumber(value, unit) {
  if (value === null || value === undefined || value === '') return 'Not determined';
  const number = Number(value);
  const formatted = Number.isFinite(number) ? number.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

function purposeLabel(summary) {
  const classification = summary.purpose_group_classification;
  const group = summary.purpose_group || classification?.purpose_group;
  const title = classification?.purpose_groups?.[0]?.title;
  if (!group) return 'Not determined';
  return title ? `${group} - ${title}` : group;
}

function inputValue(value) {
  return value === null || value === undefined ? '' : String(value);
}

function statusLabel(value) {
  return value === 'Verified' || value === 'CONFIRMED' || value === 'EXTRACTED' || value === 'USER_CONFIRMED'
    ? 'Verified'
    : 'Needs input';
}

function statusClass(value) {
  const normalized = String(value || '').toUpperCase();
  if (['VERIFIED', 'CONFIRMED', 'EXTRACTED', 'USER_CONFIRMED'].includes(normalized)) {
    return 'border-primary/30 bg-primary/10 text-primary';
  }
  if (normalized.includes('REVIEW') || normalized.includes('INPUT') || normalized === 'UNKNOWN') {
    return 'border-[#BC8116]/30 bg-[#F9F0DB] text-[#9A6608]';
  }
  return 'border-border bg-muted text-muted-foreground';
}

function requiredText(value) {
  if (value === true) return 'Required';
  if (value === false) return 'Not required';
  return valueOrFallback(value);
}

function friendlyStatus(status) {
  if (status === 'PASS') return 'Passed';
  if (status === 'VIOLATION') return 'Change Required';
  if (status === 'MANUAL_REVIEW') return 'Needs Verification';
  if (status === 'NOT_APPLICABLE') return 'Not Applicable';
  if (status === 'UNKNOWN') return 'Not determined';
  return prettyLabel(status);
}

function verificationText(item) {
  const missing = item.missing_evidence?.length ? item.missing_evidence.join(', ') : 'Required evidence';
  return {
    unknown: prettyLabel(missing),
    why: item.reason || item.decision_reason || 'This information affects the rule assessment.',
    check: item.verify && !item.verify.includes('Provide legible drawing evidence')
      ? item.verify
      : 'Check the drawings, specifications, or site information and confirm the value.',
  };
}

function featureKey(feature) {
  return feature.feature || feature.feature_type || feature.rule_id || 'FEATURE';
}

function featureTitle(feature) {
  return featureNames[featureKey(feature)] || prettyLabel(featureKey(feature));
}

function featureState(feature, relatedRules) {
  if (relatedRules.some((rule) => rule.status === 'VIOLATION')) return 'Missing or insufficient';
  if (feature.presence_status === 'CONFIRMED_PRESENT' || feature.current_status === 'PASS') return 'Present';
  if (feature.applicability_status === 'NOT_REQUIRED' || feature.required === false) return 'Not applicable';
  if (feature.applicability_status === 'REQUIRED' || feature.required === true) return 'Not verified';
  return 'Needs verification';
}

function buildFeatureCards(features, rules) {
  const map = new Map();
  features.forEach((feature) => {
    const key = featureKey(feature);
    const existing = map.get(key) || { key, feature, rules: [] };
    existing.feature = { ...existing.feature, ...feature };
    map.set(key, existing);
  });
  rules.forEach((rule) => {
    const key = rule.feature || rule.required_feature || Object.keys(featureNames).find((item) => titleForRule(rule).toUpperCase().includes(featureNames[item].toUpperCase()));
    if (!key) return;
    const existing = map.get(key) || { key, feature: { feature: key }, rules: [] };
    existing.rules.push(rule);
    map.set(key, existing);
  });
  return Array.from(map.values());
}

function findRecommendation(rule, recommendations) {
  return recommendations.find((item) => item.rule_id === rule.rule_id);
}

function DetailBlock({ title, children }) {
  return (
    <details className={styles.detailBlock}>
      <summary className={styles.detailSummary}>
        {title}
        <ChevronDown size={16} />
      </summary>
      <div className={styles.detailBody}>{children}</div>
    </details>
  );
}

function ReviewForm({ reviewGroups, verifiedValues, setVerifiedValues, onSubmit, isReviewing }) {
  const renderReviewField = (entry) => {
    const field = entry.field;
    const initialValue = entry.type === 'boolean'
      ? entry.value === true ? 'Yes' : entry.value === false ? 'No' : ''
      : inputValue(entry.value);
    const value = verifiedValues[field] ?? initialValue;
    const common = {
      value,
      onChange: (event) => setVerifiedValues((current) => ({ ...current, [field]: event.target.value })),
      className: styles.input,
    };
    return (
      <label key={field} className="block">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{entry.label}</span>
          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(entry.status)}`}>
            {statusLabel(entry.status)}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-2">
          {entry.type === 'boolean' ? (
            <select {...common}>
              <option value="">Not determined</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          ) : entry.type === 'select' ? (
            <select {...common}>
              <option value="">Not determined</option>
              {(entry.options || []).map((option) => <option key={option} value={option}>{prettyLabel(option)}</option>)}
            </select>
          ) : (
            <input {...common} type={entry.type === 'number' ? 'number' : 'text'} step="any" />
          )}
          {entry.unit && <span className="text-sm text-muted-foreground">{entry.unit}</span>}
        </span>
      </label>
    );
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Review Extracted Building Information</h3>
          <p className={styles.muted}>Confirm uncertain fields before running the final fire-safety assessment.</p>
        </div>
      </div>
      <div className="mt-5 space-y-5">
        {reviewGroups.map((group) => (
          <div key={group.title} className="mx-5 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
            <h4 className="font-orbitron font-bold text-foreground">{group.title}</h4>
            <div className={styles.fieldGrid}>{(group.fields || []).map(renderReviewField)}</div>
          </div>
        ))}
        <div className="px-5 pb-5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isReviewing}
          className={styles.primaryButton}
        >
          {isReviewing ? 'Running assessment' : 'Run Fire-Safety Assessment'}
        </button>
        </div>
      </div>
    </section>
  );
}

function BuildingSummary({ summary }) {
  const rows = [
    ['Project', summary.project_name],
    ['Building use', summary.building_use],
    ['Purpose group', purposeLabel(summary)],
    ['Storeys', summary.storeys],
    ['Total floor area', formatNumber(summary.total_floor_area_m2, 'm2')],
    ['Highest habitable floor', formatNumber(summary.highest_habitable_floor_level_m, 'm')],
    ['Building height', formatNumber(summary.height_m, 'm')],
  ];
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.sectionTitle}>Building Summary</h3>
      </div>
      <div className={styles.summaryGrid}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.summaryItem}>
            <p className={styles.summaryLabel}>{label}</p>
            <p className={styles.summaryValue}>{valueOrFallback(value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChangesRequired({ rules, recommendations }) {
  return (
    <section className={styles.resultSection}>
      <h3 className={styles.sectionTitle}>Changes Required</h3>
      {rules.length ? (
        <div className={styles.resultList}>
          {rules.map((rule) => {
            const recommendation = findRecommendation(rule, recommendations);
            return (
              <article key={rule.rule_id} className={`${styles.resultCard} ${styles.resultCardDanger}`}>
                <div className={styles.resultCardHeader}>
                  <span className={`${styles.resultIcon} ${styles.dangerIcon}`}>
                    <XCircle size={20} />
                  </span>
                  <div className="min-w-0">
                    <h4 className={styles.resultCardTitle}>{titleForRule(rule)}</h4>
                    <p className={styles.resultMeta}>{rule.regulation}</p>
                    <p className="mt-4 text-sm font-semibold text-foreground">Problem</p>
                    <p className="mt-1 text-sm text-muted-foreground">{rule.reason || rule.decision_reason}</p>
                    <div className={styles.conditionGrid}>
                      <div className={styles.conditionBox}>
                        <p className={styles.summaryLabel}>Actual condition</p>
                        <p className="mt-1 text-sm text-foreground">{valueOrFallback(rule.actual)}</p>
                      </div>
                      <div className={styles.conditionBox}>
                        <p className={styles.summaryLabel}>Required condition</p>
                        <p className="mt-1 text-sm text-foreground">{requiredText(rule.required)}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">Recommended action</p>
                    <p className="mt-1 text-sm text-muted-foreground">{recommendation?.corrective_recommendation || rule.recommendation || 'Review and correct the item against the cited regulation.'}</p>
                    <DetailBlock title="Show regulatory details">
                      <pre className="overflow-auto text-xs">{JSON.stringify(rule, null, 2)}</pre>
                    </DetailBlock>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={`${styles.resultCard} ${styles.muted}`}>No confirmed changes are required.</p>
      )}
    </section>
  );
}

function RequiredFeatures({ cards }) {
  return (
    <section className={styles.resultSection}>
      <h3 className={styles.sectionTitle}>Required Fire-Safety Features</h3>
      {cards.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map(({ key, feature, rules }) => (
            <article key={key} className={`${styles.resultCard} ${styles.resultCardNeutral}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className={styles.resultCardTitle}>{featureTitle(feature)}</h4>
                  <p className={styles.resultMeta}>{feature.applicability_status === 'REQUIRED' || feature.required ? 'Required' : 'Needs verification'}</p>
                </div>
                <span className={`${styles.badge} ${styles.badgeNeutral}`}>{featureState(feature, rules)}</span>
              </div>
              {feature.minimum_quantity !== null && feature.minimum_quantity !== undefined && (
                <p className="mt-3 text-sm text-muted-foreground">Minimum: {feature.minimum_quantity}</p>
              )}
              <DetailBlock title="View regulatory details">
                <div className="space-y-2">
                  {[...rules, feature].filter(Boolean).map((item, index) => (
                    <p key={`${key}-${index}`}>{item.rule_id || item.regulation || featureTitle(feature)}: {item.reason || item.description || item.quantity_basis || 'Referenced by FireGuard assessment.'}</p>
                  ))}
                </div>
              </DetailBlock>
            </article>
          ))}
        </div>
      ) : (
        <p className={`${styles.resultCard} ${styles.muted}`}>No feature requirements were returned.</p>
      )}
    </section>
  );
}

function EngineerVerification({ rules }) {
  return (
    <section className={styles.resultSection}>
      <h3 className={styles.sectionTitle}>Needs Engineer Verification</h3>
      {rules.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {rules.map((item) => {
            const copy = verificationText(item);
            return (
              <article key={item.rule_id} className={`${styles.resultCard} ${styles.resultCardWarning}`}>
                <div className={styles.resultCardHeader}>
                  <span className={`${styles.resultIcon} ${styles.warningIcon}`}>
                    <FileWarning size={19} />
                  </span>
                  <div>
                    <h4 className={styles.resultCardTitle}>{titleForRule(item)}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">Unknown: {copy.unknown}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{copy.why}</p>
                    <p className="mt-3 text-sm font-semibold text-foreground">Required verification</p>
                    <p className="mt-1 text-sm text-muted-foreground">{copy.check}</p>
                    <DetailBlock title="Show regulatory details">
                      <pre className="overflow-auto text-xs">{JSON.stringify(item, null, 2)}</pre>
                    </DetailBlock>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={`${styles.resultCard} ${styles.muted}`}>No engineer verification items were returned.</p>
      )}
    </section>
  );
}

function PassedChecks({ rules }) {
  return (
    <section className={styles.resultSection}>
      <h3 className={styles.sectionTitle}>Checks Passed</h3>
      {rules.length ? (
        <div className="grid gap-2 md:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule.rule_id} className={`${styles.resultCard} ${styles.resultCardSuccess}`}>
              <div className={styles.resultCardHeader}>
              <span className={`${styles.resultIcon} ${styles.successIcon}`}>
                <CheckCircle2 size={18} />
              </span>
              <div>
                <p className={styles.resultCardTitle}>{titleForRule(rule)}</p>
                <p className={styles.resultMeta}>{valueOrFallback(rule.actual)} confirmed / {requiredText(rule.required)} required</p>
              </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={`${styles.resultCard} ${styles.muted}`}>No passed checks were returned.</p>
      )}
    </section>
  );
}

function NotApplicable({ rules }) {
  return (
    <details className={styles.technicalPanel}>
      <summary className={styles.detailSummary}>
        Not Applicable
        <span className={styles.muted}>{rules.length} checks not applicable</span>
      </summary>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {rules.map((rule) => (
          <div key={rule.rule_id} className={`${styles.resultCard} ${styles.resultCardNeutral}`}>
            <div className="flex items-center gap-2">
              <span className={`${styles.resultIcon} ${styles.neutralIcon}`}>
                <MinusCircle size={16} />
              </span>
              <p className={styles.resultCardTitle}>{titleForRule(rule)}</p>
            </div>
            <DetailBlock title="Show regulatory details">
              <pre className="overflow-auto text-xs">{JSON.stringify(rule, null, 2)}</pre>
            </DetailBlock>
          </div>
        ))}
      </div>
    </details>
  );
}

function AdvancedTechnicalDetails({ results, extraction, extractedEvidence, warnings, conflicts, pageAnalysis }) {
  return (
    <details className={styles.technicalPanel}>
      <summary className={styles.detailSummary}>
        Advanced Technical Details
        <ChevronDown size={16} />
      </summary>
      <div className="mt-4 space-y-4">
        <pre className={styles.technicalPre}>{JSON.stringify({
          extraction_summary: extraction,
          extracted_evidence: extractedEvidence,
          evidence_warnings: warnings,
          conflicts,
          page_analysis: pageAnalysis,
          geometry_analysis: results.geometry_analysis,
          project_schema: results.project_schema || results.normalized_project_schema,
        }, null, 2)}</pre>
      </div>
    </details>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState();
  const [verifiedValues, setVerifiedValues] = useState({});
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setSubmission(db.getSubmission(id) || null);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const results = submission?.analysisResults;
  const allRules = useMemo(() => results?.rules || results?.rule_results || [], [results]);
  const grouped = useMemo(() => ({
    violations: allRules.filter((rule) => rule.status === 'VIOLATION'),
    manual: allRules.filter((rule) => rule.status === 'MANUAL_REVIEW'),
    pass: allRules.filter((rule) => rule.status === 'PASS'),
    notApplicable: allRules.filter((rule) => rule.status === 'NOT_APPLICABLE'),
  }), [allRules]);

  if (submission === undefined) {
    return (
      <div className={`${styles.page} p-12 text-center`}>
        <Loader className="mx-auto animate-spin text-primary" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`${styles.page} px-4 py-8 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-4xl rounded-xl border border-destructive bg-destructive/5 p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-semibold text-destructive">Analysis results are unavailable.</h2>
          {submission?.analysisError && <p className="mt-2 text-sm text-muted-foreground">{submission.analysisError}</p>}
        </div>
      </div>
    );
  }

  const summary = results.project_summary || {};
  const extraction = results.extraction_summary || {};
  const extractedEvidence = results.extracted_evidence || {};
  const recommendations = results.recommendations || [];
  const manualItems = results.manual_review_items || [];
  const warnings = [...(results.evidence_warnings || []), ...(extraction.warnings || [])];
  const conflicts = results.conflicts || results.normalized_project_schema?.conflicts || [];
  const pageAnalysis = results.page_analysis || [];
  const awaitingReview = results.overall_status === 'AWAITING_USER_INPUT';
  const copy = statusCopy[results.overall_status] || statusCopy.REQUIRES_REVIEW;
  const featureCards = buildFeatureCards(results.required_fire_features || [], allRules);
  const standaloneRecommendations = recommendations.filter((item) => !grouped.violations.some((rule) => rule.rule_id === item.rule_id));
  const reviewGroups = results.panel_review_groups?.length
    ? results.panel_review_groups
    : [{ title: 'Building Information', fields: (results.fields_needing_verification || []).map((entry) => ({
        field: typeof entry === 'string' ? entry : entry.field,
        label: typeof entry === 'string' ? prettyLabel(entry) : entry.label || prettyLabel(entry.field),
        type: /sprinkler|riser|alarm|lift|pump|hydrant_system/i.test(typeof entry === 'string' ? entry : entry.field) ? 'boolean' : 'text',
        status: 'Needs input',
      })) }];

  const handleReviewSubmit = async () => {
    const confirmations = Object.fromEntries(Object.entries(verifiedValues).filter(([, value]) => value !== '' && value !== 'Unknown'));
    if (!Object.keys(confirmations).length) return;
    setIsReviewing(true);
    try {
      const reviewed = await rerunWithUserConfirmations(results.project_schema || results.normalized_project_schema, confirmations);
      const nextResults = { ...results, ...reviewed };
      db.updateSubmission(id, { analysisResults: nextResults });
      setSubmission((current) => ({ ...current, analysisResults: nextResults }));
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
      <section className={`${styles.statusPanel} ${copy.className}`}>
        <p className={styles.eyebrow}>Overall Assessment</p>
        <h2 className={styles.title}>{copy.label}</h2>
        {!awaitingReview && (
          <div className={styles.resultMetrics}>
            <div className={styles.metricCard}><p className={styles.statValue}>{grouped.violations.length}</p><p className={styles.muted}>Confirmed Violations</p></div>
            <div className={styles.metricCard}><p className={styles.statValue}>{grouped.manual.length}</p><p className={styles.muted}>Need Verification</p></div>
            <div className={styles.metricCard}><p className={styles.statValue}>{grouped.pass.length}</p><p className={styles.muted}>Passed</p></div>
            <div className={styles.metricCard}><p className={styles.statValue}>{grouped.notApplicable.length}</p><p className={styles.muted}>Not Applicable</p></div>
          </div>
        )}
        {results.analysis_mode?.dataset === 'Validated Demonstration Dataset' && (
          <div className="mt-4 rounded-lg border border-primary/40 bg-background/70 p-3">
            <p className="text-sm font-semibold text-foreground">Validated Demonstration Dataset</p>
            <p className="mt-1 text-sm text-muted-foreground">Previously validated drawing evidence is used for this demonstration. ICTAD rules are evaluated live by FireGuard.</p>
          </div>
        )}
      </section>

      <BuildingSummary summary={summary} />

      {awaitingReview ? (
        <ReviewForm
          reviewGroups={reviewGroups}
          verifiedValues={verifiedValues}
          setVerifiedValues={setVerifiedValues}
          onSubmit={handleReviewSubmit}
          isReviewing={isReviewing}
        />
      ) : (
        <>
          <ChangesRequired rules={grouped.violations} recommendations={recommendations} />
          <RequiredFeatures cards={featureCards} />
          <EngineerVerification rules={manualItems.length ? manualItems : grouped.manual} />
          <PassedChecks rules={grouped.pass} />
          <NotApplicable rules={grouped.notApplicable} />
          {standaloneRecommendations.length > 0 && (
            <section>
              <h3 className={styles.sectionTitle}>Additional Recommendations</h3>
              <div className={styles.resultList}>
                {standaloneRecommendations.map((item, index) => (
                  <article key={`${item.rule_id}-${index}`} className={`${styles.resultCard} ${styles.resultCardNeutral}`}>
                    <p className={styles.resultCardTitle}>{titleForRule(item)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.corrective_recommendation}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AdvancedTechnicalDetails
        results={results}
        extraction={extraction}
        extractedEvidence={extractedEvidence}
        warnings={warnings}
        conflicts={conflicts}
        pageAnalysis={pageAnalysis}
      />

      <section className={styles.footerActions}>
        <p className={styles.muted}>
          FireGuard is a fire-safety pre-assessment and decision-support prototype. It does not replace formal Fire Service Department or regulatory authority approval.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className={styles.ghostButton}>
            <Printer size={16} />
            Print Report
          </button>
          <Link href="/fire-safety/submission/new" className={styles.primaryButton}>
            Start New Assessment
          </Link>
        </div>
      </section>
        </div>
      </main>
    </div>
  );
}
