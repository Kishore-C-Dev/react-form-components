import { useEffect, useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import type { StepFormConfig } from '@/types/onboarding';

interface UseStepConfigResult {
  config: StepFormConfig | null;
  loading: boolean;
  error: string | null;
}

export function useStepConfig(stepId: string): UseStepConfigResult {
  const { stepConfigs, cacheStepConfig } = useOnboarding();
  const cached = stepConfigs[stepId] ?? null;

  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/config/onboarding/step_${stepId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} loading step_${stepId}.json`);
        return res.json() as Promise<StepFormConfig>;
      })
      .then((config) => {
        cacheStepConfig(stepId, config);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [stepId]);

  return { config: cached, loading, error };
}
