import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

/* ── Types ───────────────────────────────────────────────────────────────── */

interface OnboardingCase {
  id: string;
  reference_no: string;
  status: string;
  completed_steps: string[];
  current_step: string;        // from API
  total_steps: number;         // from API
  steps: { id: string; title: string; description: string; order: number }[]; // from API
  created_at: string;
  updated_at: string;
  ra_full_name: string;
  legal_entity_name: string | null;
  entity_type: string | null;
  industry_sector: string | null;
  country_of_incorporation: string | null;
  contact_email: string | null;
  customer_risk_rating: string | null;
}


/* ── Step config ─────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 'client-profile', label: 'Client Profile', short: 'CP' },
  { id: 'principals',     label: 'Principal Officers', short: 'PO' },
  { id: 'rfi',            label: 'RFI',              short: 'RFI' },
  { id: 'kyc',            label: 'KYC',              short: 'KYC' },
];

/* ── Badge helpers ───────────────────────────────────────────────────────── */

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'default', submitted: 'info', under_review: 'warning',
  approved: 'success', rejected: 'danger',
};
const RISK_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success', medium: 'warning', high: 'danger',
};

/* ── Step progress indicator ─────────────────────────────────────────────── */

function StepProgress({ completedSteps, currentStep }: { completedSteps: string[]; currentStep: string }) {
  const done = new Set(completedSteps);
  return (
    <div className="flex items-end gap-0">
      {STEPS.map((step, i) => {
        const isComplete = done.has(step.id);
        const isCurrent = currentStep === step.id;
        const nextDone = i < STEPS.length - 1 && done.has(STEPS[i + 1].id);

        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center gap-1">
              <div
                title={step.label}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold transition-colors',
                  isComplete
                    ? 'bg-primary-600 text-white'
                    : isCurrent
                      ? 'border-[3px] border-primary-500 bg-primary-100 text-primary-700'
                      : 'border-2 border-gray-200 bg-white text-gray-400',
                )}
              >
                {isComplete ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                ) : (
                  step.short
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium leading-none',
                  isCurrent ? 'text-primary-600' : isComplete ? 'text-gray-500' : 'text-gray-300',
                )}
              >
                {step.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('mt-3 h-px w-4 flex-shrink-0', isComplete && nextDone ? 'bg-primary-400' : isComplete ? 'bg-primary-300' : 'bg-gray-200')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export function OnboardingRequestsPage() {
  const navigate = useNavigate();

  const [cases, setCases] = useState<OnboardingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'in_progress' | 'complete'>('all');

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCases(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  /* Create a new case then navigate to its first step */
  async function handleNew() {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const data = await res.json();
    navigate(`/onboarding/${data.id}/client-profile`);
  }

  /* Resume — navigate to requestId route; layout handles fetching & hydrating */
  function handleResume(caseRow: OnboardingCase) {
    const target = caseRow.current_step ?? 'client-profile';
    navigate(`/onboarding/${caseRow.id}/${target}`);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name || 'this draft'}"? This cannot be undone.`)) return;
    await fetch(`/api/onboarding/${id}`, { method: 'DELETE' });
    fetchCases();
  }

  /* ── Filtering ── */
  const filtered = cases.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'draft') return c.status === 'draft' && c.completed_steps.length < 4;
    if (filter === 'in_progress') return ['submitted','under_review'].includes(c.status) || (c.status === 'draft' && c.completed_steps.length > 0 && c.completed_steps.length < 4);
    if (filter === 'complete') return ['approved','rejected'].includes(c.status) || c.completed_steps.length === 4;
    return true;
  });

  const counts = {
    all: cases.length,
    draft: cases.filter((c) => c.status === 'draft' && c.completed_steps.length < 4).length,
    in_progress: cases.filter((c) => ['submitted','under_review'].includes(c.status) || (c.status === 'draft' && c.completed_steps.length > 0 && c.completed_steps.length < 4)).length,
    complete: cases.filter((c) => ['approved','rejected'].includes(c.status) || c.completed_steps.length === 4).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cases.length} request{cases.length !== 1 ? 's' : ''} — click <strong>Resume</strong> to continue a draft
          </p>
        </div>
        <Button variant="primary" onClick={handleNew}>+ New Onboarding</Button>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 border-b border-gray-200">
        {(['all','draft','in_progress','complete'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              filter === f
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {f === 'all' ? 'All' : f === 'draft' ? 'Draft' : f === 'in_progress' ? 'In Progress' : 'Complete'}
            <span className={cn('rounded-full px-1.5 py-0.5 text-xs', filter === f ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500')}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load: {error} — is the API server running?
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* Cases list */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">No onboarding requests found</p>
          <Button variant="primary" className="mt-4" onClick={handleNew}>Start First Onboarding</Button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reference</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client / Entity</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Step Progress</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Risk</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Last Updated</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => {
                const isResumable = !['approved', 'rejected'].includes(c.status);
                const isComplete = c.completed_steps.length === 4;
                const entityName = c.legal_entity_name || <span className="italic text-gray-400">Unnamed draft</span>;

                return (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Reference */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-500">{c.reference_no}</span>
                    </td>

                    {/* Entity */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{entityName}</div>
                      {c.industry_sector && (
                        <div className="mt-0.5 text-xs capitalize text-gray-400">
                          {c.industry_sector.replace(/_/g, ' ')} · {c.country_of_incorporation}
                        </div>
                      )}
                    </td>

                    {/* Step progress */}
                    <td className="px-5 py-4">
                      <StepProgress completedSteps={c.completed_steps ?? []} currentStep={c.current_step} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[c.status] ?? 'default'} dot>
                        {c.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>

                    {/* Risk */}
                    <td className="px-5 py-4">
                      {c.customer_risk_rating ? (
                        <Badge variant={RISK_VARIANT[c.customer_risk_rating] ?? 'default'}>
                          {c.customer_risk_rating.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(c.updated_at || c.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {isResumable && !isComplete && (
                          <Button
                            variant="primary"
                            size="sm"
                                onClick={() => handleResume(c)}
                          >
                            Resume
                          </Button>
                        )}
                        {(isComplete || !isResumable) && (
                          <Button
                            variant="secondary"
                            size="sm"
                                onClick={() => handleResume(c)}
                          >
                            View
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.legal_entity_name ?? '')}
                          className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
