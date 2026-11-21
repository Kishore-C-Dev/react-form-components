import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { StepFormConfig, StepperConfig, FormData } from '@/types/onboarding';

interface OnboardingContextValue {
  caseId: string | null;
  referenceNo: string | null;
  formData: FormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  completedSteps: Set<string>;
  stepConfigs: Record<string, StepFormConfig>;
  stepperConfig: StepperConfig | null;

  setCaseId: (id: string | null) => void;
  setReferenceNo: (ref: string | null) => void;
  setFieldValue: (name: string, value: unknown) => void;
  loadFormData: (data: FormData) => void;
  setStepErrors: (errors: Record<string, string>) => void;
  setStepTouched: (touched: Record<string, boolean>) => void;
  markStepCompleted: (stepId: string) => void;
  initCompletedSteps: (steps: string[]) => void;
  cacheStepConfig: (stepId: string, config: StepFormConfig) => void;
  setStepperConfig: (config: StepperConfig) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [caseId, setCaseIdState] = useState<string | null>(null);
  const [referenceNo, setReferenceNoState] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepConfigs, setStepConfigs] = useState<Record<string, StepFormConfig>>({});
  const [stepperConfig, setStepperConfigState] = useState<StepperConfig | null>(null);

  const setCaseId = useCallback((id: string | null) => setCaseIdState(id), []);
  const setReferenceNo = useCallback((ref: string | null) => setReferenceNoState(ref), []);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const loadFormData = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const setStepErrors = useCallback((e: Record<string, string>) => setErrors(e), []);

  const setStepTouched = useCallback((t: Record<string, boolean>) => {
    setTouched((prev) => ({ ...prev, ...t }));
  }, []);

  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId));
  }, []);

  const initCompletedSteps = useCallback((steps: string[]) => {
    setCompletedSteps(new Set(steps));
  }, []);

  const cacheStepConfig = useCallback((stepId: string, config: StepFormConfig) => {
    setStepConfigs((prev) => ({ ...prev, [stepId]: config }));
  }, []);

  const setStepperConfig = useCallback((config: StepperConfig) => {
    setStepperConfigState(config);
  }, []);

  const reset = useCallback(() => {
    setCaseIdState(null);
    setReferenceNoState(null);
    setFormData({});
    setErrors({});
    setTouched({});
    setCompletedSteps(new Set());
    setStepConfigs({});
    setStepperConfigState(null);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        caseId, referenceNo, formData, errors, touched, completedSteps,
        stepConfigs, stepperConfig,
        setCaseId, setReferenceNo, setFieldValue, loadFormData,
        setStepErrors, setStepTouched, markStepCompleted, initCompletedSteps,
        cacheStepConfig, setStepperConfig, reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
