'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, FileSearch, Loader2, UploadCloud, X } from 'lucide-react';
import { db } from '../../lib/db';
import { analyzeFirePlan, runFireGuardAssessment } from '../../lib/ai-analyzer';
import styles from '../../FireGuard.module.css';

const INITIAL={project_name:'',building_use:'',purpose_group:'',storey_count:'',highest_habitable_floor_level_m:'',building_height_m:'',total_floor_area_m2:'',independent_exit_count:'',escape_arrangement:'TWO_WAY',travel_distance_m:'',corridor_width_m:'',staircase_count:'',stair_width_m:'',protected_stair:'true'};
const PURPOSES=['1(a)','1(b)','1(c)','2(a)','2(b)','3','4','5','6','7(a)','7(b)'];
const FIELDS=[['project_name','Project / Building Name','text'],['building_use','Building Use','text'],['storey_count','Number of Storeys','number'],['highest_habitable_floor_level_m','Highest Habitable Floor Level (m)','number'],['building_height_m','Building Height (m)','number'],['total_floor_area_m2','Total Floor Area (m²)','number'],['independent_exit_count','Independent Exits','number'],['travel_distance_m','Maximum Travel Distance (m)','number'],['corridor_width_m','Corridor Width (m)','number'],['staircase_count','Number of Staircases','number'],['stair_width_m','Minimum Stair Width (m)','number']];
const PROCESSING_STAGES=['Building information prepared','Analyzing submitted fire plan','Normalizing fire-safety evidence','Evaluating ICTAD requirements'];

export default function NewSubmissionPage(){
 const router=useRouter();
 const [step,setStep]=useState(1); const [stage,setStage]=useState(0); const [form,setForm]=useState(INITIAL); const [files,setFiles]=useState([]); const [busy,setBusy]=useState(false);
 const update=(event)=>setForm((current)=>({...current,[event.target.name]:event.target.value}));
 const {getRootProps,getInputProps,isDragActive}=useDropzone({onDrop:(accepted)=>setFiles(accepted.map((rawFile)=>({id:`${rawFile.name}-${rawFile.lastModified}`,name:rawFile.name,size:rawFile.size,mediaType:rawFile.type||'application/octet-stream',rawFile}))),accept:{'application/pdf':['.pdf'],'image/*':['.png','.jpg','.jpeg']},maxSize:25*1024*1024});
 const normalized=()=>Object.fromEntries(Object.entries(form).map(([key,value])=>[key,key==='protected_stair'?value==='true':FIELDS.some(([field,,type])=>field===key&&type==='number')?Number(value):value]));
 const analyze=async()=>{
  if(!files.length)return toast.error('Upload a fire-safety plan first.');
  setBusy(true); setStep(3); setStage(1);
  const submission=db.createSubmission({files,buildingData:normalized(),status:'analyzing'});
  try{
   const evidence=await analyzeFirePlan(files);
   setStage(2);
   await new Promise((resolve)=>setTimeout(resolve,350));
   setStage(3);
   const results=await runFireGuardAssessment(normalized(),evidence.model_result,files);
   db.updateSubmission(submission.id,{status:'complete',analysisResults:results});
   router.push(`/fire-safety/results/${submission.id}`);
  }catch(error){db.updateSubmission(submission.id,{status:'failed',analysisError:error.message});toast.error(error.message);setBusy(false);setStep(2);}
 };
 return <div className={styles.page}><main className={styles.main}><div className={styles.container}>
  <Link href="/fire-safety" className={styles.ghostButton}><ArrowLeft size={16}/> Fire Safety</Link>
  <header className={`${styles.header} mt-6`}><div><p className={styles.eyebrow}>New Assessment · {step===1?'Building Information':step===2?'Fire Plan':'Processing'}</p><h1 className={styles.title}>{step===3?'Analyzing Fire-Safety Plan':'Fire Safety Assessment'}</h1><p className={styles.description}>{step===1?'Enter the building information required for ICTAD fire-safety pre-assessment.':step===2?'Upload Fire-Safety Plan': 'FireGuard is preparing the submitted drawing for ICTAD pre-assessment.'}</p></div></header>
  {step===1&&<form onSubmit={(event)=>{event.preventDefault();setStep(2);}} className={styles.card}><div className={styles.fieldGrid}>
   {FIELDS.slice(0,2).map(([name,label,type])=><label key={name} className="block"><span className={styles.fieldName}>{label}</span><input required name={name} type={type} value={form[name]} onChange={update} className={styles.input}/></label>)}
   <label className="block"><span className={styles.fieldName}>Purpose Group</span><select required name="purpose_group" value={form.purpose_group} onChange={update} className={styles.input}><option value="">Select / confirm</option>{PURPOSES.map((item)=><option key={item} value={item}>{item}</option>)}</select></label>
   {FIELDS.slice(2).map(([name,label,type])=><label key={name} className="block"><span className={styles.fieldName}>{label}</span><input required min="0" step="any" name={name} type={type} value={form[name]} onChange={update} className={styles.input}/></label>)}
   <label className="block"><span className={styles.fieldName}>Escape Arrangement</span><select name="escape_arrangement" value={form.escape_arrangement} onChange={update} className={styles.input}><option value="ONE_WAY">One way</option><option value="TWO_WAY">Two way</option></select></label>
   <label className="block"><span className={styles.fieldName}>Protected Stair</span><select name="protected_stair" value={form.protected_stair} onChange={update} className={styles.input}><option value="true">Yes</option><option value="false">No</option></select></label>
  </div><div className="mt-6"><button className={styles.primaryButton}>Continue to Fire Plan</button></div></form>}
  {step===2&&<section className={styles.sectionStack}><div {...getRootProps()} className={`${styles.dropzone} ${isDragActive?styles.dropzoneActive:''}`}><input {...getInputProps()}/><UploadCloud size={42} className="mx-auto mb-4 text-primary"/><p className="font-semibold">{isDragActive?'Drop plan here':'Drag fire-safety plan here or click to browse'}</p><p className={styles.muted}>PDF, PNG, JPG, JPEG · maximum 25 MB</p></div>{files.map((file)=><div className={styles.fileRow} key={file.id}><span>{file.name}</span><button type="button" onClick={()=>setFiles([])} aria-label="Remove plan"><X size={17}/></button></div>)}<div className="flex gap-3"><button type="button" className={styles.ghostButton} onClick={()=>setStep(1)}>Back</button><button type="button" className={styles.primaryButton} disabled={busy||!files.length} onClick={analyze}><FileSearch size={18}/> Analyze Fire Plan</button></div></section>}
  {step===3&&<section className={`${styles.card} ${styles.processingCard}`} aria-live="polite"><Loader2 size={42} className="animate-spin text-primary"/><div className={styles.processingStages}>{PROCESSING_STAGES.map((label,index)=><div key={label} className={styles.processingStage}>{index<stage?<CheckCircle2 size={20} className="text-primary"/>:<Loader2 size={20} className={index===stage?'animate-spin text-primary':styles.muted}/>}<span className={index<=stage?'font-semibold':styles.muted}>{label}</span></div>)}</div></section>}
 </div></main></div>;
}
