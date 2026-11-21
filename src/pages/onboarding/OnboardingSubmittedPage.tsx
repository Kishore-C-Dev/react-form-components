import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

export function OnboardingSubmittedPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { formData, referenceNo, reset } = useOnboarding();

  async function handleNewOnboarding() {
    reset();
    const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const data = await res.json();
    navigate(`/onboarding/${data.id}/client-profile`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Onboarding Submitted</h2>
      <p className="mt-2 text-gray-500">
        The client onboarding assessment for{' '}
        <strong>{String(formData.legalEntityName || 'this client')}</strong> has been
        submitted to Compliance for review.
      </p>

      <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-3">
        <Badge variant="success" dot>
          Submitted
        </Badge>
        <span className="font-mono text-sm font-semibold text-green-700">{referenceNo ?? requestId}</span>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Summary
        </p>
        <dl className="space-y-1 text-sm">
          {[
            ['Entity', formData.legalEntityName],
            ['Type', formData.entityType],
            ['Country', formData.countryOfIncorporation],
            ['Industry', formData.industrySector],
            ['RA', formData.raFullName],
            ['Risk Rating', formData.customerRiskRating],
          ].map(([label, val]) =>
            val ? (
              <div key={String(label)} className="flex justify-between gap-4">
                <dt className="text-gray-500">{String(label ?? '')}</dt>
                <dd className="font-medium text-gray-800">{String(val ?? '')}</dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button variant="secondary" onClick={() => requestId && navigate(`/onboarding/${requestId}/review`)}>
          View Submission
        </Button>
        <Button variant="primary" onClick={handleNewOnboarding}>
          Start New Onboarding
        </Button>
      </div>
    </div>
  );
}
