import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isFieldVisible } from '@/utils/onboardingValidator';
import type { StepFormConfig, FormData } from '@/types/onboarding';

interface ReviewStepProps {
  stepConfigs: StepFormConfig[];
  stepTitles: string[];
  formData: FormData;
  onEditStep: (index: number) => void;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  return String(value);
}

function getRiskBadgeVariant(val: string): 'success' | 'warning' | 'danger' | 'info' {
  if (val === 'low' || val === 'clear' || val === 'verified') return 'success';
  if (val === 'medium' || val === 'pending_verification' || val === 'pending') return 'warning';
  if (val === 'high' || val === 'very_high' || val === 'escalated' || val === 'declined' || val === 'blocked') return 'danger';
  return 'info';
}

const RISK_FIELDS = new Set(['customerRiskRating', 'amlScreeningStatus', 'sanctionsScreeningStatus', 'ofacCheckStatus', 'cddLevel']);

export function ReviewStep({ stepConfigs, stepTitles, formData, onEditStep }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">Please review all entries before submitting</p>
            <p className="mt-0.5 text-xs text-blue-600">
              Click <span className="font-medium">Edit</span> on any section to make changes. Once submitted, the form will be sent to Compliance for review.
            </p>
          </div>
        </div>
      </div>

      {stepConfigs.map((config, stepIndex) => (
        <div key={config.stepId} className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Step header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {stepIndex + 1}
              </div>
              <h3 className="font-semibold text-gray-900">{stepTitles[stepIndex]}</h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(stepIndex)}
            >
              Edit
            </Button>
          </div>

          {/* Sections */}
          <div className="divide-y divide-gray-50">
            {config.sections.map((section, si) => {
              const visibleFields = section.fields.filter((f) =>
                isFieldVisible(f.visibleWhen, formData),
              );
              if (visibleFields.length === 0) return null;

              return (
                <div key={si} className="px-5 py-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {section.title}
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {visibleFields.map((field) => {
                      const raw = formData[field.name];
                      const display = formatValue(raw);
                      const isRiskField = RISK_FIELDS.has(field.name);

                      return (
                        <div
                          key={field.name}
                          className={field.fullWidth ? 'sm:col-span-2' : ''}
                        >
                          <dt className="text-xs text-gray-500">{field.label}</dt>
                          <dd className="mt-0.5">
                            {isRiskField && display !== '—' ? (
                              <Badge variant={getRiskBadgeVariant(String(raw))}>
                                {display}
                              </Badge>
                            ) : field.type === 'checkbox' ? (
                              <span className={`text-sm font-medium ${!!raw ? 'text-green-600' : 'text-gray-500'}`}>
                                {!!raw ? '✓ Confirmed' : '✗ Not confirmed'}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-gray-800">{display}</span>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
