'use client';

import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

export function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            <button
              onClick={() => onStepClick?.(step.number)}
              disabled={step.number > currentStep}
              className={cn(
                'relative z-10 flex h-12 w-12 items-center justify-center rounded-full font-orbitron font-bold transition-all',
                step.number < currentStep
                  ? 'cursor-pointer bg-primary text-primary-foreground'
                  : step.number === currentStep
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'cursor-not-allowed bg-muted text-muted-foreground'
              )}
            >
              {step.number < currentStep ? (
                <Check size={20} />
              ) : (
                step.number
              )}
            </button>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-1 flex-1 mx-2 rounded-full transition-colors',
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {steps.map((step) => (
          <div key={step.number} className="flex-1">
            <p className="text-xs font-semibold text-foreground">{step.title}</p>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
