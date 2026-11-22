import { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/onboarding/Stepper';
import { Badge } from '@/components/ui/Badge';
import { useOnboarding } from '@/context/OnboardingContext';
import type { StepperConfig } from '@/types/onboarding';

interface TaskDetails {
  case: {
    id: string;
    reference_no: string;
    status: string;
    completed_steps: string[];
    ra_full_name: string;
  };
  steps: { id: string; title: string; description: string; order: number }[];
  current_step: string;
  total_steps: number;
  profile: Record<string, unknown> | null;
  principals: Record<string, unknown> | null;
  rfi: Record<string, unknown> | null;
  kyc: Record<string, unknown> | null;
}

/* Flatten DB snake_case rows → camelCase formData */
function flattenTaskData(data: TaskDetails): Record<string, unknown> {
  const f: Record<string, unknown> = {};

  const p = data.profile;
  if (p) Object.assign(f, {
    legalEntityName: p.legal_entity_name ?? '',
    entityType: p.entity_type ?? '',
    countryOfIncorporation: p.country_of_incorporation ?? '',
    dateOfIncorporation: p.date_of_incorporation ? String(p.date_of_incorporation).split('T')[0] : '',
    registrationNumber: p.registration_number ?? '',
    taxId: p.tax_id ?? '',
    lei: p.lei ?? '',
    industrySector: p.industry_sector ?? '',
    regAddressLine1: p.reg_address_line1 ?? '',
    regAddressLine2: p.reg_address_line2 ?? '',
    regCity: p.reg_city ?? '',
    regState: p.reg_state ?? '',
    regPostalCode: p.reg_postal_code ?? '',
    regCountry: p.reg_country ?? '',
    contactName: p.contact_name ?? '',
    contactDesignation: p.contact_designation ?? '',
    contactEmail: p.contact_email ?? '',
    contactPhone: p.contact_phone ?? '',
    website: p.website ?? '',
    annualRevenueUsd: p.annual_revenue_usd ?? '',
  });

  const o = data.principals;
  if (o) Object.assign(f, {
    signatories: o.signatories ?? [],
    uboName: o.ubo_name ?? '',
    uboNationality: o.ubo_nationality ?? '',
    uboOwnershipPercent: o.ubo_ownership_percent != null ? String(o.ubo_ownership_percent) : '',
    uboCountryOfResidence: o.ubo_country_of_residence ?? '',
    uboIdType: o.ubo_id_type ?? '',
    uboIdNumber: o.ubo_id_number ?? '',
    uboIsPep: o.ubo_is_pep ?? '',
    uboRelationshipToEntity: o.ubo_relationship_to_entity ?? '',
  });

  const r = data.rfi;
  if (r) Object.assign(f, {
    primaryBusinessActivity: r.primary_business_activity ?? '',
    businessActivityTypes: r.business_activity_types ?? [],
    targetMarkets: r.target_markets ?? [],
    operatingCountriesCount: r.operating_countries_count ?? '',
    sourceOfFunds: r.source_of_funds ?? [],
    sourceOfWealth: r.source_of_wealth ?? '',
    expectedMonthlyInflow: r.expected_monthly_inflow ?? '',
    expectedMonthlyOutflow: r.expected_monthly_outflow ?? '',
    avgTransactionSize: r.avg_transaction_size ?? '',
    monthlyTxCount: r.monthly_tx_count ?? '',
    primaryCurrencies: r.primary_currencies ?? [],
    transactionTypes: r.transaction_types ?? [],
    purposeOfAccount: r.purpose_of_account ?? '',
    highRiskCountriesExposure: r.high_risk_countries_exposure ?? '',
    highRiskCountriesDetails: r.high_risk_countries_details ?? '',
    cashIntensiveBusiness: r.cash_intensive_business ?? '',
    existingBankingRelationships: r.existing_banking_relationships ?? '',
    previousBankingIssues: r.previous_banking_issues ?? '',
    previousBankingIssuesDetails: r.previous_banking_issues_details ?? '',
    correspondentBankingRequired: r.correspondent_banking_required ?? '',
    additionalRfiNotes: r.additional_rfi_notes ?? '',
  });

  const k = data.kyc;
  if (k) Object.assign(f, {
    docIncorporationStatus: k.doc_incorporation_status ?? '',
    docMemoaStatus: k.doc_meoa_status ?? '',
    docBoardResolutionStatus: k.doc_board_resolution_status ?? '',
    docFinancialStatementsStatus: k.doc_financial_statements_status ?? '',
    docOwnershipChartStatus: k.doc_ownership_chart_status ?? '',
    docSignatoryIdStatus: k.doc_signatory_id_status ?? '',
    docUboIdStatus: k.doc_ubo_id_status ?? '',
    docProofOfAddressStatus: k.doc_proof_of_address_status ?? '',
    amlScreeningStatus: k.aml_screening_status ?? '',
    sanctionsScreeningStatus: k.sanctions_screening_status ?? '',
    ofacCheckStatus: k.ofac_check_status ?? '',
    euSanctionsStatus: k.eu_sanctions_status ?? '',
    adverseMediaCheck: k.adverse_media_check ?? '',
    screeningNotes: k.screening_notes ?? '',
    customerRiskRating: k.customer_risk_rating ?? '',
    cddLevel: k.cdd_level ?? '',
    eddRequired: k.edd_required ?? '',
    eddJustification: k.edd_justification ?? '',
    fatfCountryRisk: k.fatf_country_risk ?? '',
    industryRiskLevel: k.industry_risk_level ?? '',
    riskRatingJustification: k.risk_rating_justification ?? '',
    dateOfAssessment: k.date_of_assessment ? String(k.date_of_assessment).split('T')[0] : '',
    raCertification: k.ra_certification ?? false,
  });

  return f;
}

export function OnboardingLayout() {
  const { requestId, stepId } = useParams<{ requestId: string; stepId: string }>();
  const navigate = useNavigate();
  const {
    setCaseId, setReferenceNo, loadFormData, initCompletedSteps, setStepperConfig, stepperConfig, completedSteps, reset,
  } = useOnboarding();

  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* Fetch task details whenever requestId changes */
  useEffect(() => {
    if (!requestId) return;
    reset();
    setLoading(true);
    setFetchError(null);

    fetch(`/api/onboarding/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<TaskDetails>;
      })
      .then((data) => {
        setTaskDetails(data);

        /* Hydrate context from API response */
        setCaseId(data.case.id);
        setReferenceNo(data.case.reference_no);
        initCompletedSteps(data.case.completed_steps ?? []);
        setStepperConfig({ steps: data.steps } as StepperConfig);
        loadFormData(flattenTaskData(data));

        /* Auto-redirect to current_step if no stepId in URL */
        if (!stepId) {
          navigate(`/onboarding/${requestId}/${data.current_step}`, { replace: true });
        }
      })
      .catch((err: Error) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [requestId]);

  const steps = taskDetails?.steps ?? [];
  const currentStepIndex = steps.findIndex((s) => s.id === stepId);

  /* Build completed-step indices for Stepper */
  const completedIndices = new Set(
    steps.map((s, i) => (completedSteps.has(s.id) ? i : -1)).filter((i) => i >= 0),
  );

  function handleStepClick(index: number) {
    if (steps[index]) navigate(`/onboarding/${requestId}/${steps[index].id}`);
  }

  /* Loading state while task details are being fetched */
  if (loading || !stepperConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-4 py-5">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="h-6 w-64 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                  {i < 4 && <div className="mx-2 h-0.5 w-12 animate-pulse bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
          {[180, 260, 180].map((h, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white shadow-sm" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load task details for <code className="font-mono">{requestId}</code>: {fetchError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header + stepper */}
      <div className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Commercial Banking Client Onboarding
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {taskDetails?.case.reference_no} &mdash; New Client RFI &amp; KYC Assessment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">
                Step {currentStepIndex + 1} of {taskDetails?.total_steps ?? steps.length}
              </Badge>
              <Badge
                variant={
                  taskDetails?.case.status === 'approved' ? 'success'
                  : taskDetails?.case.status === 'rejected' ? 'danger'
                  : taskDetails?.case.status === 'submitted' ? 'info'
                  : taskDetails?.case.status === 'under_review' ? 'warning'
                  : 'default'
                }
              >
                {taskDetails?.case.status?.replace(/_/g, ' ') ?? 'draft'}
              </Badge>
            </div>
          </div>

          <div className="mt-6">
            <Stepper
              steps={steps}
              currentStep={currentStepIndex}
              completedSteps={completedIndices}
              onStepClick={handleStepClick}
            />
          </div>
        </div>
      </div>

      {/* Current step content */}
      <Outlet />
    </div>
  );
}
