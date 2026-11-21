import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { TextInput } from '@/components/form/TextInput';
import { Select } from '@/components/form/Select';
import type { TableColumn, TableAction } from '@/types/form';

/* ── Types ───────────────────────────────────────────────────────────────── */

interface Client {
  id: string;
  reference_no: string;
  status: string;
  legal_entity_name: string;
  entity_type: string;
  country_of_incorporation: string;
  registration_number: string;
  industry_sector: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  annual_revenue_usd: string;
  customer_risk_rating: string;
  cdd_level: string;
  ra_full_name: string;
  created_at: string;
}

interface ClientForm {
  legalEntityName: string;
  entityType: string;
  countryOfIncorporation: string;
  registrationNumber: string;
  taxId: string;
  industrySector: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  annualRevenueUsd: string;
  status: string;
  customerRiskRating: string;
  cddLevel: string;
}

const EMPTY_FORM: ClientForm = {
  legalEntityName: '', entityType: '', countryOfIncorporation: '',
  registrationNumber: '', taxId: '', industrySector: '',
  contactName: '', contactEmail: '', contactPhone: '',
  annualRevenueUsd: '', status: 'draft', customerRiskRating: '', cddLevel: '',
};

/* ── Badge helpers ───────────────────────────────────────────────────────── */

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'default', submitted: 'info', under_review: 'warning',
  approved: 'success', rejected: 'danger',
};
const RISK_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success', medium: 'warning', high: 'danger',
};

/* ── Options ─────────────────────────────────────────────────────────────── */

const ENTITY_TYPES = [
  { label: 'Corporation / Ltd', value: 'corporation' },
  { label: 'LLC', value: 'llc' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Limited Partnership (LP)', value: 'lp' },
  { label: 'Sole Proprietorship', value: 'sole_prop' },
  { label: 'Non-Profit', value: 'non_profit' },
  { label: 'Government Entity', value: 'government' },
  { label: 'Trust', value: 'trust' },
];

const COUNTRIES = [
  { label: 'United States', value: 'US' }, { label: 'United Kingdom', value: 'GB' },
  { label: 'Germany', value: 'DE' }, { label: 'France', value: 'FR' },
  { label: 'Switzerland', value: 'CH' }, { label: 'Netherlands', value: 'NL' },
  { label: 'Singapore', value: 'SG' }, { label: 'Hong Kong', value: 'HK' },
  { label: 'UAE', value: 'AE' }, { label: 'Japan', value: 'JP' },
  { label: 'India', value: 'IN' }, { label: 'China', value: 'CN' },
  { label: 'Canada', value: 'CA' }, { label: 'Australia', value: 'AU' },
  { label: 'Cayman Islands', value: 'KY' }, { label: 'British Virgin Islands', value: 'VG' },
];

const INDUSTRIES = [
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Real Estate & Construction', value: 'real_estate' },
  { label: 'Financial Services', value: 'financial_services' },
  { label: 'Technology & IT', value: 'technology' },
  { label: 'Healthcare & Pharmaceuticals', value: 'healthcare' },
  { label: 'Energy & Natural Resources', value: 'energy' },
  { label: 'Trading & Import/Export', value: 'trading' },
  { label: 'Retail & Consumer Goods', value: 'retail' },
  { label: 'Professional Services', value: 'professional_services' },
  { label: 'Transportation & Logistics', value: 'logistics' },
  { label: 'Education', value: 'education' },
  { label: 'Non-Government Organization', value: 'ngo' },
  { label: 'Other', value: 'other' },
];

const REVENUES = [
  { label: '< $1M', value: 'lt_1m' }, { label: '$1M – $10M', value: '1m_10m' },
  { label: '$10M – $50M', value: '10m_50m' }, { label: '$50M – $250M', value: '50m_250m' },
  { label: '$250M – $1B', value: '250m_1b' }, { label: '> $1B', value: 'gt_1b' },
];

const STATUSES = [
  { label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' }, { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const RISK_RATINGS = [
  { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' },
];

const CDD_LEVELS = [
  { label: 'Simplified CDD', value: 'simplified' },
  { label: 'Standard CDD', value: 'standard' },
  { label: 'Enhanced Due Diligence (EDD)', value: 'enhanced' },
];

/* ── Columns ─────────────────────────────────────────────────────────────── */

const columns: TableColumn<Record<string, unknown>>[] = [
  { key: 'reference_no', header: 'Ref #', width: '110px', sortable: true },
  { key: 'legal_entity_name', header: 'Entity Name', sortable: true },
  {
    key: 'entity_type', header: 'Type', sortable: true,
    render: (v) => <span className="capitalize">{String(v ?? '').replace(/_/g, ' ')}</span>,
  },
  {
    key: 'industry_sector', header: 'Industry', sortable: true,
    render: (v) => <span className="capitalize">{String(v ?? '').replace(/_/g, ' ')}</span>,
  },
  { key: 'country_of_incorporation', header: 'Country', sortable: true, width: '80px' },
  {
    key: 'status', header: 'Status', sortable: true,
    render: (v) => (
      <Badge variant={STATUS_VARIANT[String(v)] ?? 'default'} dot>
        {String(v ?? '').replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    key: 'customer_risk_rating', header: 'Risk', sortable: true,
    render: (v) => v ? (
      <Badge variant={RISK_VARIANT[String(v)] ?? 'default'}>
        {String(v).toUpperCase()}
      </Badge>
    ) : <span className="text-gray-400">—</span>,
  },
  { key: 'contact_email', header: 'Contact Email' },
];

/* ── ClientForm component ─────────────────────────────────────────────────── */

function ClientFormFields({
  form,
  onChange,
  isEdit,
}: {
  form: ClientForm;
  onChange: (key: keyof ClientForm, val: string) => void;
  isEdit: boolean;
}) {
  const f = (key: keyof ClientForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(key, e.target.value),
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextInput id="legalEntityName" label="Legal Entity Name" placeholder="Full registered legal name" {...f('legalEntityName')} />
        </div>
        <Select id="entityType" label="Entity Type" options={ENTITY_TYPES} placeholder="Select type" {...f('entityType')} />
        <Select id="countryOfIncorporation" label="Country of Incorporation" options={COUNTRIES} placeholder="Select country" {...f('countryOfIncorporation')} />
        <TextInput id="registrationNumber" label="Registration Number" placeholder="e.g. 12345678" {...f('registrationNumber')} />
        <TextInput id="taxId" label="Tax ID / EIN" placeholder="e.g. 12-3456789" {...f('taxId')} />
        <Select id="industrySector" label="Industry / Sector" options={INDUSTRIES} placeholder="Select industry" {...f('industrySector')} />
        <Select id="annualRevenueUsd" label="Annual Revenue (USD)" options={REVENUES} placeholder="Select range" {...f('annualRevenueUsd')} />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Primary Contact</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput id="contactName" label="Contact Name" placeholder="Full name" {...f('contactName')} />
          <TextInput id="contactEmail" label="Email Address" type="email" placeholder="contact@company.com" {...f('contactEmail')} />
          <TextInput id="contactPhone" label="Phone Number" type="tel" placeholder="+1 (555) 123-4567" {...f('contactPhone')} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">KYC / Status</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEdit && (
            <Select id="status" label="Case Status" options={STATUSES} placeholder="Select status" {...f('status')} />
          )}
          <Select id="customerRiskRating" label="Risk Rating" options={RISK_RATINGS} placeholder="Select rating" {...f('customerRiskRating')} />
          <Select id="cddLevel" label="CDD Level" options={CDD_LEVELS} placeholder="Select CDD level" {...f('cddLevel')} />
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClients(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  function openAdd() {
    setEditingClient(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setForm({
      legalEntityName: client.legal_entity_name ?? '',
      entityType: client.entity_type ?? '',
      countryOfIncorporation: client.country_of_incorporation ?? '',
      registrationNumber: client.registration_number ?? '',
      taxId: '',
      industrySector: client.industry_sector ?? '',
      contactName: client.contact_name ?? '',
      contactEmail: client.contact_email ?? '',
      contactPhone: client.contact_phone ?? '',
      annualRevenueUsd: client.annual_revenue_usd ?? '',
      status: client.status ?? 'draft',
      customerRiskRating: client.customer_risk_rating ?? '',
      cddLevel: client.cdd_level ?? '',
    });
    setSaveError(null);
    setDrawerOpen(true);
  }

  function handleFormChange(key: keyof ClientForm, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const payload = {
      legalEntityName: form.legalEntityName,
      entityType: form.entityType,
      countryOfIncorporation: form.countryOfIncorporation,
      registrationNumber: form.registrationNumber,
      taxId: form.taxId,
      industrySector: form.industrySector,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      annualRevenueUsd: form.annualRevenueUsd,
      status: form.status,
      customerRiskRating: form.customerRiskRating,
      cddLevel: form.cddLevel,
    };
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setDrawerOpen(false);
      await fetchClients();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Delete "${client.legal_entity_name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      await fetchClients();
    } catch (e) {
      alert('Delete failed: ' + (e as Error).message);
    }
  }

  const actions: TableAction<Record<string, unknown>>[] = [
    {
      label: 'Edit',
      onClick: (row) => openEdit(row as unknown as Client),
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => handleDelete(row as unknown as Client),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Commercial banking client registry — {clients.length} record{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          + Add Client
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load clients: {error} — is the API server running?
        </div>
      )}

      {/* Table */}
      <DataTable
        data={clients as unknown as Record<string, unknown>[]}
        columns={columns}
        actions={actions}
        keyField="id"
        loading={loading}
        searchable
        searchPlaceholder="Search by name, country, industry…"
        defaultSortable
        pageSize={10}
        striped
        emptyState={<span>No clients found.</span>}
      />

      {/* Add / Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        subtitle={editingClient ? editingClient.reference_no : 'Create a new onboarding record'}
        width="lg"
        footer={
          <div className="flex items-center justify-between gap-3">
            {saveError && (
              <p className="text-xs text-red-600">{saveError}</p>
            )}
            <div className="ml-auto flex gap-3">
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={saving} onClick={handleSave}>
                {editingClient ? 'Save Changes' : 'Add Client'}
              </Button>
            </div>
          </div>
        }
      >
        <ClientFormFields
          form={form}
          onChange={handleFormChange}
          isEdit={!!editingClient}
        />
      </Drawer>
    </div>
  );
}
