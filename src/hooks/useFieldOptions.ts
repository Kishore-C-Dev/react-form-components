import { useEffect, useState } from 'react';
import type { FieldOption } from '@/types/onboarding';

const cache = new Map<string, FieldOption[]>();
const inflight = new Map<string, Promise<FieldOption[]>>();

async function fetchOptions(url: string): Promise<FieldOption[]> {
  if (cache.has(url)) return cache.get(url)!;
  if (!inflight.has(url)) {
    const p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<FieldOption[]>;
      })
      .then((data) => { cache.set(url, data); inflight.delete(url); return data; })
      .catch((err) => { inflight.delete(url); throw err; });
    inflight.set(url, p);
  }
  return inflight.get(url)!;
}

function resolveUrl(dataSource: string, dependsOnValue?: string): string | null {
  if (!dependsOnValue) return null; // parent not yet selected — don't fetch
  return `${dataSource}/${encodeURIComponent(dependsOnValue)}`;
}

export function useFieldOptions(
  dataSource: string | undefined,
  staticOptions: FieldOption[] | undefined,
  dependsOnValue?: string,
): { options: FieldOption[]; loading: boolean; error: string | null } {
  const hasDependency = dataSource !== undefined && dependsOnValue !== undefined;

  // For independent fields (no dependsOn), URL is just dataSource
  // For dependent fields, URL includes the parent value
  const effectiveUrl = !dataSource
    ? null
    : hasDependency
      ? resolveUrl(dataSource, dependsOnValue)
      : dataSource;

  const [options, setOptions] = useState<FieldOption[]>(() => {
    if (effectiveUrl && cache.has(effectiveUrl)) return cache.get(effectiveUrl)!;
    return staticOptions ?? [];
  });
  const [loading, setLoading] = useState(!!effectiveUrl && !cache.has(effectiveUrl ?? ''));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveUrl) {
      // Parent not yet chosen — clear options and show nothing
      setOptions([]);
      setLoading(false);
      return;
    }
    if (cache.has(effectiveUrl)) {
      setOptions(cache.get(effectiveUrl)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchOptions(effectiveUrl)
      .then((data) => { setOptions(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, [effectiveUrl]);

  return { options, loading, error };
}
