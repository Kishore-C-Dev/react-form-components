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
      .then((data) => {
        cache.set(url, data);
        inflight.delete(url);
        return data;
      })
      .catch((err) => {
        inflight.delete(url);
        throw err;
      });
    inflight.set(url, p);
  }
  return inflight.get(url)!;
}

export function useFieldOptions(
  dataSource: string | undefined,
  staticOptions: FieldOption[] | undefined,
): { options: FieldOption[]; loading: boolean; error: string | null } {
  const [options, setOptions] = useState<FieldOption[]>(() =>
    dataSource && cache.has(dataSource) ? cache.get(dataSource)! : (staticOptions ?? []),
  );
  const [loading, setLoading] = useState(!!dataSource && !cache.has(dataSource));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataSource) return;
    if (cache.has(dataSource)) {
      setOptions(cache.get(dataSource)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchOptions(dataSource)
      .then((data) => { setOptions(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, [dataSource]);

  return { options, loading, error };
}
