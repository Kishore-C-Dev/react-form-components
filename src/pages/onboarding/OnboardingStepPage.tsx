import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DynamicFormStep } from '@/components/onboarding/DynamicFormStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStepConfig } from '@/hooks/useStepConfig';
import { useOnboarding } from '@/context/OnboardingContext';
import { validateStep, getStepDefaults, isFieldVisible } from '@/utils/onboardingValidator';
import type { StepFormConfig } from '@/types/onboarding';

const FALLBACK_ORDER = ['client-profile', 'principals', 'rfi', 'kyc', 'review'];

export function OnboardingStepPage() {
  const { requestId, stepId = 'client-profile' } = useParams<{ requestId: string; stepId: string }>();
  const navigate = useNavigate();
  const { config, loading, error } = useStepConfig(stepId);
  const [saving, setSaving] = useState(false);

  const {
    formData, errors, touched, stepConfigs, stepperConfig,
    setFieldValue, setStepErrors, setStepTouched, markStepCompleted,
  } = useOnboarding();

  const stepOrder = stepperConfig?.steps?.map((s) => s.id) ?? FALLBACK_ORDER;
  const currentIndex = stepOrder.indexOf(stepId);
  const isReviewStep = stepId === 'review';
  const isLastFormStep = stepOrder[currentIndex + 1] === 'review';

  /* Seed defaults when config loads */
  useEffect(() => {
    if (!config || config.sections.length === 0) return;
    const defaults = getStepDefaults(config.sections);
    Object.entries(defaults).forEach(([key, val]) => {
      if (!(key in formData)) setFieldValue(key, val);
    });
  }, [config?.stepId]);

  function handleChange(name: string, value: unknown) {
    setFieldValue(name, value);
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setStepErrors(next);
    }
  }

  async function handleNext() {
    if (!config) return;

    /* Validate */
    const stepErrors = validateStep(config.sections, formData, config.submitValidations);
    if (Object.keys(stepErrors).length > 0) {
      setStepErrors({ ...errors, ...stepErrors });
      const allTouched: Record<string, boolean> = {};
      config.sections.forEach((s) => s.fields.forEach((f) => (allTouched[f.name] = true)));
      setStepTouched(allTouched);
      setTimeout(() => {
        document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setSaving(true);
    try {
      /* Build payload from this step's fields */
      const stepFields = config.sections.flatMap((s) => s.fields).map((f) => f.name);
      const payload: Record<string, unknown> = {};
      stepFields.forEach((name) => { payload[name] = formData[name]; });

      /* Save step to DB using requestId from URL */
      await fetch(`/api/onboarding/${requestId}/steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      markStepCompleted(stepId);
    } catch (e) {
      console.error('Step save failed:', e);
    } finally {
      setSaving(false);
    }

    const nextId = stepOrder[currentIndex + 1];
    if (nextId) navigate(`/onboarding/${requestId}/${nextId}`);
  }

  function handlePrevious() {
    const prevId = stepOrder[currentIndex - 1];
    if (prevId) navigate(`/onboarding/${requestId}/${prevId}`);
  }

  function handleEditStep(index: number) {
    navigate(`/onboarding/${requestId}/${stepOrder[index]}`);
  }

  async function handleSubmit() {
    if (requestId) {
      await fetch(`/api/onboarding/${requestId}/submit`, { method: 'PUT' });
    }
    navigate(`/onboarding/${requestId}/submitted`);
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-5">
          {[180, 260, 220].map((h, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white shadow-sm" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load form config: <span className="font-mono">{error}</span>
        </div>
      </div>
    );
  }

  /* ── Review step ── */
  if (isReviewStep) {
    const formStepConfigs = FALLBACK_ORDER
      .filter((id) => id !== 'review' && stepConfigs[id])
      .map((id) => stepConfigs[id] as StepFormConfig);

    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {currentIndex + 1}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Review &amp; Submit</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">Review all entries before final submission</p>
        </div>
        <ReviewStep
          stepConfigs={formStepConfigs}
          stepTitles={formStepConfigs.map((c) => c.title)}
          formData={formData}
          onEditStep={handleEditStep}
        />
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <Button variant="secondary" onClick={handlePrevious}>← Previous</Button>
          <span className="text-sm text-gray-400">Step {currentIndex + 1} of {stepOrder.length}</span>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>Submit to Compliance</Button>
        </div>
      </div>
    );
  }

  /* ── Normal form step ── */
  const stepErrorCount = config
    ? config.sections.flatMap((s) => s.fields)
        .filter((f) => isFieldVisible(f.visibleWhen, formData) && errors[f.name]).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {currentIndex + 1}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">{config?.title}</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">{stepperConfig?.steps?.[currentIndex]?.description}</p>
        </div>
        {stepErrorCount > 0 && (
          <Badge variant="danger">{stepErrorCount} error{stepErrorCount !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {config && (
        <DynamicFormStep
          config={config}
          formData={formData}
          errors={errors}
          touched={touched}
          onChange={handleChange}
        />
      )}

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <Button variant="secondary" onClick={handlePrevious} disabled={currentIndex === 0}>
          ← Previous
        </Button>
        <span className="text-sm text-gray-400">Step {currentIndex + 1} of {stepOrder.length}</span>
        <Button variant="primary" loading={saving} onClick={handleNext}>
          {isLastFormStep ? 'Review & Submit →' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}
