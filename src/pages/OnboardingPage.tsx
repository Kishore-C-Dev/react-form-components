import { useState, useCallback } from 'react';
import { Stepper } from '@/components/onboarding/Stepper';
import { DynamicFormStep } from '@/components/onboarding/DynamicFormStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  validateStep,
  getStepDefaults,
} from '@/utils/onboardingValidator';
import type { StepFormConfig, FormData } from '@/types/onboarding';

import stepperConfigJson from '@/config/onboarding/stepperConfig.json';
import step1Json from '@/config/onboarding/step1_client_profile.json';
import step2Json from '@/config/onboarding/step2_principals.json';
import step3Json from '@/config/onboarding/step3_rfi.json';
import step4Json from '@/config/onboarding/step4_kyc.json';

const STEP_CONFIGS: StepFormConfig[] = [
  step1Json as StepFormConfig,
  step2Json as StepFormConfig,
  step3Json as StepFormConfig,
  step4Json as StepFormConfig,
];

const REVIEW_STEP_INDEX = STEP_CONFIGS.length; // index 4

function buildInitialFormData(): FormData {
  return STEP_CONFIGS.reduce<FormData>(
    (acc, config) => ({ ...acc, ...getStepDefaults(config.sections) }),
    {},
  );
}

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<FormData>(buildInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const stepperSteps = stepperConfigJson.steps;
  const isReviewStep = currentStep === REVIEW_STEP_INDEX;

  const handleChange = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  function handleNext() {
    const config = STEP_CONFIGS[currentStep];
    const stepErrors = validateStep(
      config.sections,
      formData,
      config.submitValidations,
    );

    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      // Touch all fields in current step so errors show
      const allTouched: Record<string, boolean> = {};
      config.sections.forEach((s) =>
        s.fields.forEach((f) => (allTouched[f.name] = true)),
      );
      setTouched((prev) => ({ ...prev, ...allTouched }));
      return;
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrevious() {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleEditStep(index: number) {
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setFormData(buildInitialFormData());
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }

  const errorCount = Object.keys(errors).length;

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Onboarding Submitted</h2>
        <p className="mt-2 text-gray-500">
          The client onboarding assessment for <strong>{String(formData.legalEntityName || 'this client')}</strong> has
          been submitted to Compliance for review. A reference number will be generated shortly.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
          <Badge variant="success" dot>Submitted</Badge>
          <span className="text-sm text-green-700 font-medium">
            REF-{Date.now().toString(36).toUpperCase()}
          </span>
        </div>
        <div className="mt-8">
          <Button variant="secondary" onClick={handleReset}>
            Start New Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Commercial Banking Client Onboarding
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                New Client RFI &amp; KYC Assessment — Relationship Associate Portal
              </p>
            </div>
            <Badge variant="info">Draft</Badge>
          </div>

          {/* Stepper */}
          <div className="mt-6">
            <Stepper
              steps={stepperSteps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleEditStep}
            />
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Step heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                {currentStep + 1}
              </span>
              <h2 className="text-lg font-semibold text-gray-900">
                {isReviewStep
                  ? 'Review & Submit'
                  : STEP_CONFIGS[currentStep].title}
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {isReviewStep
                ? 'Review all entered information before final submission'
                : stepperSteps[currentStep]?.description}
            </p>
          </div>
          {errorCount > 0 && (
            <Badge variant="danger">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Step content */}
        {isReviewStep ? (
          <ReviewStep
            stepConfigs={STEP_CONFIGS}
            stepTitles={STEP_CONFIGS.map((c) => c.title)}
            formData={formData}
            onEditStep={handleEditStep}
          />
        ) : (
          <DynamicFormStep
            config={STEP_CONFIGS[currentStep]}
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleChange}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {stepperSteps.length}
            </span>
          </div>

          {isReviewStep ? (
            <Button variant="primary" onClick={handleSubmit}>
              Submit to Compliance
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNext}>
              {currentStep === STEP_CONFIGS.length - 1
                ? 'Review & Submit →'
                : 'Next →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
