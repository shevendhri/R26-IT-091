'use client';

import { FileText, Building2 } from 'lucide-react';

export function Step3({
  submission,
  isSubmitting,
  onSubmit,
  onBack,
}) {
  const { buildingInfo, files } = submission;

  return (
    <div className="space-y-6">
      <h3 className="font-orbitron font-bold text-foreground">
        Review Your Submission
      </h3>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-primary" />
          <h4 className="font-semibold text-foreground">Building Information</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Building Name</p>
            <p className="text-sm text-foreground mt-1">{buildingInfo.buildingName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Building Type</p>
            <p className="text-sm text-foreground mt-1">{buildingInfo.buildingType}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground">Address</p>
            <p className="text-sm text-foreground mt-1">{buildingInfo.address}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Owner Name</p>
            <p className="text-sm text-foreground mt-1">{buildingInfo.ownerName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Contact</p>
            <p className="text-sm text-foreground mt-1">{buildingInfo.ownerContact}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Square Footage</p>
            <p className="text-sm text-foreground mt-1">
              {parseInt(buildingInfo.squareFootage).toLocaleString()} sq ft
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Number of Floors</p>
            <p className="text-sm text-foreground mt-1">{buildingInfo.numberOfFloors}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-primary" />
          <h4 className="font-semibold text-foreground">
            Uploaded Documents ({files.length})
          </h4>
        </div>

        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2"
              >
                <FileText size={16} className="text-primary" />
                <span className="text-sm text-foreground">{file.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No documents uploaded
          </p>
        )}
      </div>

      <div className="rounded-lg border border-primary bg-primary/10 p-4">
        <p className="text-sm text-foreground">
          <strong>Next Step:</strong> Click &quot;Submit for Analysis&quot; to send your submission for AI-powered fire safety analysis. You will receive a detailed report with recommendations within minutes.
        </p>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit for Analysis'
          )}
        </button>
      </div>
    </div>
  );
}
