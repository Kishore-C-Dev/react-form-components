import { cn } from '@/utils/cn';
import type { StepperStep } from '@/types/onboarding';

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (index: number) => void;
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function Stepper({ steps, currentStep, completedSteps, onStepClick }: StepperProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max items-start px-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;
          const isClickable = isCompleted && index < currentStep;

          return (
            <div key={step.id} className="flex items-start">
              {/* Step item */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={cn(
                  'flex flex-col items-center gap-2 px-3 py-1 transition-opacity',
                  isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    isCompleted
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : isCurrent
                        ? 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-200'
                        : 'border-gray-300 bg-white text-gray-400',
                  )}
                >
                  {isCompleted ? <CheckIcon /> : <span>{index + 1}</span>}
                </div>

                {/* Labels */}
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      'text-xs font-semibold leading-tight',
                      isCurrent || isCompleted ? 'text-gray-800' : 'text-gray-400',
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="hidden text-[10px] leading-tight text-gray-400 sm:block">
                    {step.description}
                  </span>
                </div>
              </button>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div className="mt-4 h-0.5 w-12 flex-shrink-0 self-start xl:w-16">
                  <div
                    className={cn(
                      'h-full transition-colors',
                      completedSteps.has(index) ? 'bg-primary-500' : 'bg-gray-200',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
