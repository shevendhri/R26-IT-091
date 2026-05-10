'use client';

import { Check } from 'lucide-react';

export function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
}) {
  return (
    <div
      style={{
        width: '100%',
      }}
    >
      {/* Top Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div
              key={step.number}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
              }}
            >
              {/* Step Circle */}
              <button
                onClick={() => onStepClick?.(step.number)}
                disabled={step.number > currentStep}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: '700',
                  fontSize: '16px',
                  transition: '0.3s ease',
                  cursor:
                    step.number > currentStep
                      ? 'not-allowed'
                      : 'pointer',

                  background: isCompleted || isActive
                    ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
                    : '#2c3e50',

                  color:
                    isCompleted || isActive
                      ? '#0d1111'
                      : '#95a5a6',

                  boxShadow: isActive
                    ? '0 0 0 4px rgba(39,174,96,0.25)'
                    : 'none',
                }}
              >
                {isCompleted ? (
                  <Check size={22} />
                ) : (
                  step.number
                )}
              </button>

              {/* Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    height: '5px',
                    flex: 1,
                    marginLeft: '12px',
                    marginRight: '12px',
                    borderRadius: '999px',
                    transition: '0.3s ease',

                    background:
                      currentStep > step.number
                        ? 'linear-gradient(90deg, #27ae60, #2ecc71)'
                        : '#2c3e50',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          gap: '12px',
        }}
      >
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              flex: 1,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#e8eaed',
                marginBottom: '6px',
              }}
            >
              {step.title}
            </p>

            {step.description && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#95a5a6',
                  lineHeight: '1.4',
                }}
              >
                {step.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}