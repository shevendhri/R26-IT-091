'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/db';
import styles from '../../FireGuard.module.css';

const titleFor=(rule)=>(rule.title||rule.rule_name||rule.rule_id||'Fire-safety violation').replaceAll('_',' ');
const value=(input)=>input===null||input===undefined||input===''?'Not confirmed':typeof input==='object'?JSON.stringify(input):String(input);
const recommendationFor=(rule,recommendations)=>recommendations.find((item)=>item.rule_id===rule.rule_id)?.corrective_recommendation||rule.recommendation||'Correct the identified condition in accordance with the cited ICTAD requirement and update the fire-safety plan.';

export default function ResultsPage(){
 const {id}=useParams(); const [submission,setSubmission]=useState();
 useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active)setSubmission(db.getSubmission(id)||null);});return()=>{active=false;};},[id]);
 const results=submission?.analysisResults;
 const violations=useMemo(()=>(results?.rules||results?.rule_results||[]).filter((rule)=>rule.status==='VIOLATION'),[results]);
 if(submission===undefined)return <div className={`${styles.page} p-16 text-center`}><Loader2 className="mx-auto animate-spin text-primary"/></div>;
 if(!results)return <div className={`${styles.page} p-8`}><main className={styles.resultsContainer}><h1 className={styles.title}>Analysis results are unavailable.</h1></main></div>;
 const summary=results.project_summary||{}; const recommendations=results.recommendations||[];
 return <div className={styles.page}><main className={styles.main}><div className={styles.resultsContainer}>
  <Link href="/fire-safety" className={styles.ghostButton}><ArrowLeft size={16}/> Back to Fire Safety</Link>
  <header className={`${styles.header} mt-6`}><div><p className={styles.eyebrow}>Pre-Assessment Results</p><h1 className={styles.title}>Fire Safety Assessment Results</h1><p className={`${styles.muted} mt-2`}>FireGuard pipeline: AI-assisted evidence extraction → deterministic ICTAD assessment</p></div></header>
  <section className={styles.card}><div className={styles.resultsSummaryGrid}>{[['Project',summary.project_name],['Building Use',summary.building_use],['Confirmed Violations',violations.length]].map(([label,item])=><div key={label} className={styles.summaryItem}><p className={styles.summaryLabel}>{label}</p><p className={styles.summaryValue}>{value(item)}</p></div>)}</div></section>
  <section className={styles.resultSection}><div><p className={styles.eyebrow}>Violations + Recommended Corrections</p><h2 className={styles.sectionTitle}>{violations.length} Confirmed {violations.length===1?'Violation':'Violations'}</h2></div>
   {violations.length===0?<div className={`${styles.noticeCard} ${styles.noViolationCard}`}><h3 className={styles.resultCardTitle}>No Confirmed Violations Found</h3><p className={`${styles.muted} mt-2`}>FireGuard did not identify a confirmed ICTAD violation from the currently available evidence.</p></div>:
   <div className={styles.resultList}>{violations.map((rule,index)=><article key={rule.rule_id} className={`${styles.resultCard} ${styles.resultCardDanger} ${styles.violationCard}`}>
    <div className={styles.violationHeading}><span className={`${styles.resultIcon} ${styles.dangerIcon}`}><AlertTriangle size={21}/></span><div><p className={styles.summaryLabel}>Violation {index+1}</p><h3 className={styles.violationTitle}>{titleFor(rule)}</h3></div></div>
    <div className={styles.violationContent}><div><p className={styles.summaryLabel}>Problem</p><p className={styles.violationProblem}>{value(rule.reason||rule.decision_reason)}</p><div className={styles.conditionGrid}><div className={styles.conditionBox}><p className={styles.summaryLabel}>Current</p><p className={styles.conditionValue}>{value(rule.actual||rule.source_evidence)}</p></div><div className={styles.conditionBox}><p className={styles.summaryLabel}>Required</p><p className={styles.conditionValue}>{value(rule.required)}</p></div></div></div>
     <div className={styles.recommendationPanel}><div className={styles.recommendationHeading}><ShieldCheck size={21}/><h4>Recommended Correction</h4></div><p>{recommendationFor(rule,recommendations)}</p><p className={styles.regulationLine}><strong>Regulation:</strong> {value(rule.regulation||rule.source||rule.clause)}</p></div>
    </div>
   </article>)}</div>}
  </section>
  <footer className={styles.footerActions}><p className={styles.muted}>FireGuard provides an ICTAD fire-safety pre-assessment for decision support.</p><div className="flex flex-wrap gap-2"><Link href="/fire-safety" className={styles.ghostButton}>Back to Fire Safety</Link><Link href="/fire-safety/submission/new" className={styles.primaryButton}>Start New Assessment</Link></div></footer>
 </div></main></div>;
}
