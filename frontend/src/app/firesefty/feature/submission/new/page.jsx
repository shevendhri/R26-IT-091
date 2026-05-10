'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '../../../../../components/Header';
import Footer from '../../../../../components/Footer';

import { ProgressIndicator } from '../../../components/ProgressIndicator';
import { Step1 } from '../../../components/steps/Step1';
import { Step2 } from '../../../components/steps/Step2';
import { Step3 } from '../../../components/steps/Step3';

import { db } from '../../../lib/db';
import { analyzeSubmission } from '../../../lib/ai-analyzer';

import toast from 'react-hot-toast';

export default function NewSubmissionPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [buildingInfo, setBuildingInfo] = useState({
    buildingName: '',
    address: '',
    ownerName: '',
    ownerContact: '',
    squareFootage: '',
    numberOfFloors: '',
    buildingType: '',
  });

  const [files, setFiles] = useState([]);

  const steps = [
    { number: 1, title: 'Building Info', description: 'Basic details' },
    { number: 2, title: 'Documents', description: 'Upload & verify' },
    { number: 3, title: 'Review', description: 'Confirm details' },
  ];

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const submission = db.createSubmission(buildingInfo);

      files.forEach(file => {
        db.addFile(submission.id, file);
      });

      db.updateSubmission(submission.id, {
        status: 'submitted',
        submittedAt: new Date(),
      });

      toast.success('Submission received! Starting analysis...');

      setTimeout(async () => {
        const updatedSubmission = db.getSubmission(submission.id);

        if (updatedSubmission) {
          const results = await analyzeSubmission(updatedSubmission);

          db.updateSubmission(submission.id, {
            status: 'complete',
            analysisResults: results,
          });

          toast.success('Analysis complete!');
          router.push(`/firesefty/feature/results/${submission.id}`);
        }
      }, 3000);

    } catch (error) {
      toast.error('Failed to submit. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0d1111',
        color: '#e8eaed',
        fontFamily: "'Inter', sans-serif",
   
      }}
    >
      <Header />

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Page Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '12px',
          }}
        >
          <h1
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '38px',
              fontWeight: '900',
              color: '#27ae60',
              marginBottom: '10px',
              letterSpacing: '1px',
            }}
          >
            FIRE SAFETY SUBMISSION
          </h1>

          <p
            style={{
              color: '#95a5a6',
              fontSize: '16px',
            }}
          >
            Submit building plans and documents for AI-powered fire safety analysis
          </p>
        </div>

        {/* Progress Indicator Wrapper */}
        <div
          style={{
            backgroundColor: '#1a1f24',
            border: '1px solid #2c3e50',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
          }}
        >
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
          />
        </div>

        {/* Main Card */}
        <div
          style={{
            backgroundColor: '#1a1f24',
            border: '1px solid #2c3e50',
            borderRadius: '18px',
            padding: '36px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
            transition: 'all 0.3s ease',
          }}
        >
          {currentStep === 1 && (
            <Step1
              buildingInfo={buildingInfo}
              onChange={setBuildingInfo}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2
              files={files}
              onFilesChange={setFiles}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3
              submission={{
                id: 'temp',
                buildingInfo,
                files,
                submittedAt: new Date(),
                status: 'draft',
              }}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onBack={handlePrevStep}
            />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '50px',
        }}
      >
        <Footer />
      </div>
    </div>
  );
}