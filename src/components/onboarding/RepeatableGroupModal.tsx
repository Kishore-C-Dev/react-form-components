import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DynamicField } from './DynamicField';
import { isFieldVisible } from '@/utils/onboardingValidator';
import { cn } from '@/utils/cn';
import type { FieldConfig, RepeatableGroupModalStep } from '@/types/onboarding';

type GroupRecord = Record<string, unknown>;

interface RepeatableGroupModalProps {
  title: string;
  steps: RepeatableGroupModalStep[];
  groupFields: FieldConfig[];
  initialValues?: GroupRecord;
  editingIndex: number | null;
  onSave: (record: GroupRecord) => void;
  onCancel: () => void;
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function RepeatableGroupModal({
  title, steps, groupFields, initialValues = {}, editingIndex, onSave, onCancel,
}: RepeatableGroupModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<GroupRecord>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast  = stepIndex === steps.length - 1;

  /* Fields visible on the current step */
  const stepFields = currentStep.fields
    .map((name) => groupFields.find((f) => f.name === name))
    .filter((f): f is FieldConfig => !!f && isFieldVisible(f.visibleWhen, draft));

  /* Validate required fields on current step only */
  function validateStep(): Record<string, string> {
    const errs: Record<string, string> = {};
    currentStep.fields.forEach((name) => {
      const f = groupFields.find((gf) => gf.name === name);
      if (!f || !isFieldVisible(f.visibleWhen, draft)) return;
      if (f.validations?.required?.value) {
        const v = draft[f.name];
        const empty = Array.isArray(v) ? v.length === 0 : !v || String(v).trim() === '';
        if (empty) errs[f.name] = f.validations.required.message ?? 'Required';
      }
    });
    return errs;
  }

  function handleChange(name: string, val: unknown) {
    setDraft((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }

  function handleNext() {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    setErrors({});
    setStepIndex((i) => i + 1);
  }

  function handleBack() {
    setErrors({});
    setStepIndex((i) => i - 1);
  }

  function handleSave() {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    onSave(draft);
  }

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCancel(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    /* ── Overlay ───────────────────────────────────────────────────────── */
    <div className="fixed inset-0 z-50 flex items-stretch bg-gray-900/60 backdrop-blur-sm">
      {/* ── Modal panel (full screen, slight inset on large screens) ────── */}
      <div className="relative m-0 flex w-full flex-col bg-white shadow-2xl md:m-6 md:rounded-2xl">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
              {editingIndex !== null ? `Edit #${editingIndex + 1}` : 'New Entry'}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* ── Step progress bar ─────────────────────────────────────────── */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="mx-auto flex max-w-2xl items-center justify-center">
            {steps.map((step, i) => {
              const done    = i < stepIndex;
              const current = i === stepIndex;
              return (
                <div key={i} className="flex items-center">
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => { if (done) { setErrors({}); setStepIndex(i); } }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 px-3 group',
                      done ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                      done    ? 'border-primary-600 bg-primary-600 text-white'
                      : current ? 'border-primary-600 bg-white text-primary-700 shadow-md shadow-primary-100'
                      :           'border-gray-200 bg-white text-gray-400',
                    )}>
                      {done ? <CheckIcon /> : <span>{i + 1}</span>}
                    </div>
                    <span className={cn(
                      'text-xs font-medium leading-tight text-center max-w-[80px]',
                      current ? 'text-primary-700' : done ? 'text-gray-600' : 'text-gray-400',
                    )}>
                      {step.title}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={cn(
                      'mb-5 h-0.5 w-12 flex-shrink-0 xl:w-20 transition-colors',
                      done ? 'bg-primary-500' : 'bg-gray-200',
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">{currentStep.title}</h3>
              <p className="mt-0.5 text-sm text-gray-500">
                Step {stepIndex + 1} of {steps.length}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {stepFields.map((f) => (
                <div key={f.name} className={cn(f.fullWidth && 'col-span-full')}>
                  <DynamicField
                    field={f}
                    value={draft[f.name]}
                    error={errors[f.name]}
                    onChange={handleChange}
                    dependsOnValue={f.dependsOn ? String(draft[f.dependsOn] ?? '') : undefined}
                  />
                </div>
              ))}
            </div>

            {/* Step validation error summary */}
            {Object.keys(errors).length > 0 && (
              <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Please fix the highlighted fields before continuing.
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>

          <div className="flex items-center gap-3">
            {!isFirst && (
              <Button variant="secondary" onClick={handleBack}>← Back</Button>
            )}
            {isLast ? (
              <Button variant="primary" onClick={handleSave}>
                {editingIndex !== null ? 'Update Entry' : 'Save Entry'}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>Next →</Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
