'use client';

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export function VerdictCard({ results }) {
  const { overallStatus, summary, errorCount, warningCount, completionPercentage } = results;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pass':
        return {
          icon: CheckCircle,
          bgColor: 'bg-[#DCEFE2]',
          borderColor: 'border-primary',
          textColor: 'text-primary',
          label: 'CERTIFIED',
        };
      case 'fail':
        return {
          icon: AlertCircle,
          bgColor: 'bg-[#F8E2E0]',
          borderColor: 'border-destructive',
          textColor: 'text-destructive',
          label: 'NOT CERTIFIED',
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-[#F9F0DB]',
          borderColor: 'border-accent',
          textColor: 'text-accent',
          label: 'CONDITIONAL',
        };
    }
  };

  const config = getStatusConfig(overallStatus);
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        'w-full rounded-lg border-2 p-8 transition-all',
        config.borderColor,
        config.bgColor
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <StatusIcon size={40} className={config.textColor} />
          <div className="flex-1">
            <p className={cn('font-orbitron text-sm font-bold', config.textColor)}>
              {config.label}
            </p>
            <p className="text-xl font-bold text-foreground">
              Fire Safety Analysis Result
            </p>
          </div>
          <div className={cn('rounded-lg px-4 py-2', config.bgColor)}>
            <p className="text-2xl font-bold font-orbitron text-primary">
              {completionPercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground">{summary}</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-2xl font-bold text-primary">{results.rules.filter(r => r.status === 'pass').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Compliant</p>
          </div>
          <div className="rounded-lg bg-accent/20 p-4">
            <p className="text-2xl font-bold text-accent">{warningCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Warnings</p>
          </div>
          <div className="rounded-lg bg-destructive/20 p-4">
            <p className="text-2xl font-bold text-destructive">{errorCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Errors</p>
          </div>
        </div>

        {overallStatus === 'fail' && (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive mb-1">Action Required</p>
            <p className="text-sm text-foreground">
              Critical issues must be addressed before certification can be granted. Review the detailed report below.
            </p>
          </div>
        )}
        {overallStatus === 'conditional' && (
          <div className="rounded-lg border border-accent bg-accent/5 p-4">
            <p className="text-sm font-semibold text-accent mb-1">Improvements Needed</p>
            <p className="text-sm text-foreground">
              Address the warnings noted in the report to achieve full compliance and certification.
            </p>
          </div>
        )}
        {overallStatus === 'pass' && (
          <div className="rounded-lg border border-primary bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary mb-1">Certification Approved</p>
            <p className="text-sm text-foreground">
              This building meets all ICTAD fire safety requirements and is eligible for certification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
