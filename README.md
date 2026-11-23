# React Form Components — Commercial Banking Onboarding

A full-stack onboarding platform for commercial banking KYC workflows. Built with React + TypeScript on the frontend and Express + PostgreSQL on the backend.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Seed Data](#seed-data)
- [Repeatable Group Widget](#repeatable-group-widget)
- [Dynamic Form Fields — dataSource & dependsOn](#dynamic-form-fields)
- [API Reference](#api-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| Backend | Express.js (Node.js ESM) |
| Database | PostgreSQL |
| State | React Context (OnboardingContext) |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- npm

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Kishore-C-Dev/react-form-components.git
cd react-form-components

# 2. Install dependencies
npm install
```

---

## Database Setup

### 1. Create the database

```bash
createdb client_onboarding
```

### 2. Create the schema

Connect to the database and run the following SQL:

```sql
-- Core case table
CREATE TABLE onboarding_cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no    TEXT UNIQUE NOT NULL DEFAULT 'REF-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  status          TEXT NOT NULL DEFAULT 'draft',
  ra_employee_id  TEXT,
  ra_full_name    TEXT,
  ra_team         TEXT,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ,
  completed_steps TEXT[] NOT NULL DEFAULT '{}'
);

-- Step 1: Client profile
CREATE TABLE client_profiles (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                   UUID UNIQUE NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,
  legal_entity_name         TEXT,
  entity_type               TEXT,
  country_of_incorporation  TEXT,
  date_of_incorporation     DATE,
  registration_number       TEXT,
  tax_id                    TEXT,
  lei                       TEXT,
  industry_sector           TEXT,
  reg_address_line1         TEXT,
  reg_address_line2         TEXT,
  reg_city                  TEXT,
  reg_state                 TEXT,
  reg_postal_code           TEXT,
  reg_country               TEXT,
  contact_name              TEXT,
  contact_designation       TEXT,
  contact_email             TEXT,
  contact_phone             TEXT,
  website                   TEXT,
  annual_revenue_usd        TEXT
);

-- Step 2: Principal officers (signatories stored as JSONB array)
CREATE TABLE principal_officers (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                   UUID UNIQUE NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,
  signatories               JSONB NOT NULL DEFAULT '[]',
  ubo_name                  TEXT,
  ubo_nationality           TEXT,
  ubo_ownership_percent     NUMERIC,
  ubo_country_of_residence  TEXT,
  ubo_id_type               TEXT,
  ubo_id_number             TEXT,
  ubo_is_pep                TEXT,
  ubo_relationship_to_entity TEXT
);

-- Step 3: RFI
CREATE TABLE rfi_submissions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                         UUID UNIQUE NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,
  primary_business_activity       TEXT,
  business_activity_types         TEXT[],
  target_markets                  TEXT[],
  operating_countries_count       TEXT,
  source_of_funds                 TEXT[],
  source_of_wealth                TEXT,
  expected_monthly_inflow         TEXT,
  expected_monthly_outflow        TEXT,
  avg_transaction_size            TEXT,
  monthly_tx_count                TEXT,
  primary_currencies              TEXT[],
  transaction_types               TEXT[],
  purpose_of_account              TEXT,
  high_risk_countries_exposure    TEXT,
  high_risk_countries_details     TEXT,
  cash_intensive_business         TEXT,
  existing_banking_relationships  TEXT,
  previous_banking_issues         TEXT,
  previous_banking_issues_details TEXT,
  correspondent_banking_required  TEXT,
  additional_rfi_notes            TEXT
);

-- Step 4: KYC assessment
CREATE TABLE kyc_assessments (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                       UUID UNIQUE NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,
  doc_incorporation_status      TEXT,
  doc_meoa_status               TEXT,
  doc_board_resolution_status   TEXT,
  doc_financial_statements_status TEXT,
  doc_ownership_chart_status    TEXT,
  doc_signatory_id_status       TEXT,
  doc_ubo_id_status             TEXT,
  doc_proof_of_address_status   TEXT,
  aml_screening_status          TEXT,
  sanctions_screening_status    TEXT,
  ofac_check_status             TEXT,
  eu_sanctions_status           TEXT,
  adverse_media_check           TEXT,
  screening_notes               TEXT,
  customer_risk_rating          TEXT,
  cdd_level                     TEXT,
  edd_required                  TEXT,
  edd_justification             TEXT,
  fatf_country_risk             TEXT,
  industry_risk_level           TEXT,
  risk_rating_justification     TEXT,
  date_of_assessment            DATE,
  ra_certification              BOOLEAN DEFAULT false
);
```

### 3. Configure the database connection

Edit `server/db.js` to match your local PostgreSQL credentials:

```js
export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'client_onboarding',
  user: 'your_pg_username',   // ← change this
  password: 'your_password',  // ← add if needed
});
```

---

## Running the App

### Run everything together (recommended)

```bash
npm run dev:all
```

This starts both servers concurrently:
- **Vite** (frontend) → `http://localhost:5173`
- **API** (Express) → `http://localhost:3001`

### Run separately

```bash
# Terminal 1 — API server
npm run server

# Terminal 2 — Vite dev server
npm run dev
```

### Build for production

```bash
npm run build
npm run preview
```

---

## Seed Data

The seed script populates the database with realistic onboarding cases at various stages of completion.

### Run the seed

```bash
npm run seed
```

### What it creates

| Status | Count | Description |
|---|---|---|
| `approved` | 4 | All 4 steps complete, fully reviewed |
| `under_review` | 2 | Submitted and in compliance review |
| `submitted` | 2 | All steps done, pending review |
| `draft` | varies | Partially completed (0–3 steps) |

Each case includes realistic data: legal entity names, registered addresses, UBO details, AML screening results, risk ratings, etc.

### Customising seed data

Open `server/seed.js` and add entries to the `clients` array. Each entry has four sections:

```js
{
  case: {
    status: 'draft',               // draft | submitted | under_review | approved | rejected
    ra: 'Alice Chen',              // relationship manager name
    ra_id: 'EMP-001',
    team: 'Commercial Banking – APAC',
    days: 10,                      // days ago the case was created
    steps: ['client-profile'],     // which steps are already completed
  },
  profile: {
    legal_entity_name: 'Acme Corp Ltd.',
    entity_type: 'corporation',    // corporation | llc | partnership | lp | trust | non_profit
    country_of_incorporation: 'SG',
    industry_sector: 'technology',
    contact_name: 'Jane Smith',
    contact_email: 'jane@acme.com',
    reg_address_line1: '1 Raffles Place',
    reg_city: 'Singapore',
    reg_country: 'SG',
    annual_revenue_usd: '10m_50m',
  },
  principals: {
    // Legacy flat fields — still stored for seeded data
    signatory_name: 'Jane Smith',
    signatory_designation: 'ceo',
    ubo_name: 'Acme Holdings Pte.',
    ubo_ownership_percent: 80,
    ubo_is_pep: 'no',
    ubo_relationship_to_entity: 'shareholder',
  },
  rfi: {
    primary_business_activity: 'B2B software services.',
    business_activity_types: ['technology'],
    source_of_funds: ['business_revenue'],
    primary_currencies: ['USD', 'SGD'],
    expected_monthly_inflow: '500k_1m',
    purpose_of_account: 'operating',
    high_risk_countries_exposure: 'no',
    correspondent_banking_required: 'no',
  },
  kyc: null,  // null = step not yet completed
}
```

> **Note:** Re-running the seed appends new cases rather than truncating. To start fresh, run `TRUNCATE onboarding_cases CASCADE;` in psql first.

---

## Project Structure

```
react-form-components/
├── public/
│   └── config/onboarding/          # Step form config JSON files
│       ├── step_client-profile.json
│       ├── step_principals.json
│       ├── step_rfi.json
│       ├── step_kyc.json
│       └── step_review.json
├── server/
│   ├── db.js                       # PostgreSQL connection pool
│   ├── index.js                    # Express app entry point
│   ├── seed.js                     # Database seed script
│   └── routes/
│       ├── onboarding.js           # Onboarding CRUD + step save endpoints
│       ├── ref.js                  # Reference data (countries, states, currencies)
│       └── clients.js
├── src/
│   ├── components/
│   │   ├── onboarding/
│   │   │   ├── DynamicField.tsx         # Renders any field type from config
│   │   │   ├── DynamicFormStep.tsx      # Renders a full step's sections + fields
│   │   │   ├── RepeatableGroupWidget.tsx # Multi-record table widget
│   │   │   ├── RepeatableGroupModal.tsx  # Multi-step full-screen modal
│   │   │   ├── Stepper.tsx
│   │   │   └── ReviewStep.tsx
│   │   ├── form/                        # Base form primitives (TextInput, Select…)
│   │   └── ui/                          # UI components (Button, Badge…)
│   ├── context/
│   │   └── OnboardingContext.tsx        # Shared form state across all steps
│   ├── hooks/
│   │   ├── useStepConfig.ts             # Fetches + caches step JSON config
│   │   └── useFieldOptions.ts           # Fetches + caches dropdown options
│   ├── pages/
│   │   ├── OnboardingRequestsPage.tsx   # Case list with step progress stepper
│   │   └── onboarding/
│   │       ├── OnboardingLayout.tsx     # Fetches case, hydrates context, shows stepper
│   │       ├── OnboardingStepPage.tsx   # Renders current step, handles Next/Save
│   │       └── OnboardingSubmittedPage.tsx
│   ├── types/
│   │   └── onboarding.ts               # All TypeScript types for the form system
│   └── utils/
│       └── onboardingValidator.ts      # Field validation + default value helpers
└── vite.config.ts                      # Vite config — proxies /api to :3001
```

---

## Repeatable Group Widget

The `repeatable-group` field type renders a table of records with Add / Edit / Delete actions. It is configured entirely from the step JSON — no code changes needed.

### Basic usage (inline panel)

```json
{
  "name": "directors",
  "type": "repeatable-group",
  "label": "Board of Directors",
  "fullWidth": true,
  "maxRecords": 5,
  "tableColumns": [
    { "label": "Full Name",   "field": "name" },
    { "label": "Role",        "field": "role" },
    { "label": "Nationality", "field": "nationality" }
  ],
  "groupFields": [
    {
      "name": "name",
      "label": "Full Name",
      "type": "text",
      "placeholder": "Legal full name",
      "fullWidth": true,
      "validations": { "required": { "value": true, "message": "Name is required" } }
    },
    {
      "name": "role",
      "label": "Role",
      "type": "select",
      "options": [
        { "label": "Chairman",  "value": "chairman" },
        { "label": "Director",  "value": "director" },
        { "label": "Secretary", "value": "secretary" }
      ]
    },
    {
      "name": "nationality",
      "label": "Nationality",
      "type": "select",
      "dataSource": "/api/ref/nationalities",
      "placeholder": "Select nationality…"
    }
  ]
}
```

### With a multi-step full-screen modal

Add `modalSteps` to split the group fields across multiple steps in a full-screen modal. Each step lists the field `name` values to show on that step.

```json
{
  "name": "signatories",
  "type": "repeatable-group",
  "label": "Authorized Signatories",
  "maxRecords": 3,
  "modalSteps": [
    { "title": "Personal Details",  "fields": ["name", "designation", "nationality", "dob"] },
    { "title": "Identity Document", "fields": ["idType", "idNumber", "idExpiry", "countryOfResidence"] },
    { "title": "Compliance",        "fields": ["isPep", "pepDetails"] }
  ],
  "tableColumns": [
    { "label": "Full Name",   "field": "name" },
    { "label": "Designation", "field": "designation" },
    { "label": "Nationality", "field": "nationality" }
  ],
  "groupFields": [ ... ]
}
```

**Without `modalSteps`** → an inline accordion panel opens below the table.  
**With `modalSteps`** → a full-screen modal opens with a step progress bar.

### How data flows

```
Modal / Panel (local draft state)
  → onSave(record)
    → RepeatableGroupWidget
       → onChange('signatories', [...all records...])
         → OnboardingStepPage.handleChange()
           → OnboardingContext.formData.signatories = [...]
```

The widget stores records in the shared `OnboardingContext.formData` — the same context all other form fields use. The array is written to the database when the user clicks **Next** on that step, as part of the step's payload.

### Supported field types inside groupFields

All standard field types work inside `groupFields`:

| Type | Description |
|---|---|
| `text`, `email`, `tel`, `url`, `number`, `date` | Standard inputs |
| `select` | Dropdown — use `options` or `dataSource` |
| `multiselect` | Multi-value dropdown — use `options` or `dataSource` |
| `radio` | Inline radio buttons — use `options` |
| `textarea` | Multi-line text |
| `checkbox` | Single boolean toggle |

Fields inside `groupFields` also support:
- `dataSource` — load options from an API endpoint
- `dependsOn` — cascade from another field in the same group record
- `visibleWhen` — conditional visibility within the group form
- `validations.required` — per-step validation in the modal

---

## Dynamic Form Fields

Form fields are defined in JSON config files under `public/config/onboarding/`. The system supports three advanced patterns:

### API-driven options (`dataSource`)

Instead of hardcoding `options`, point to a reference endpoint:

```json
{
  "name": "countryOfIncorporation",
  "type": "select",
  "dataSource": "/api/ref/countries",
  "placeholder": "Select country…"
}
```

Available reference endpoints:

| Endpoint | Returns |
|---|---|
| `GET /api/ref/countries` | 204 countries (ISO 3166-1) |
| `GET /api/ref/nationalities` | 204 countries + "Other" |
| `GET /api/ref/currencies` | 32 major currencies |
| `GET /api/ref/states/:country` | States/provinces for US, CA, AU, GB, DE, IN, AE, SG, CN, BR, CH, NL |

Options are fetched once and cached at module level — navigating between steps never re-fetches.

### Cascading dropdowns (`dependsOn`)

Make a field's options depend on another field's value:

```json
{ "name": "regCountry", "type": "select", "dataSource": "/api/ref/countries" },
{ "name": "regState",   "type": "select", "dataSource": "/api/ref/states",
  "dependsOn": "regCountry", "placeholder": "Select state / province…" }
```

When the parent changes, the child resets its value and re-fetches `${dataSource}/${parentValue}` (e.g. `/api/ref/states/US`). The child shows "Select a value above first…" and is disabled until a parent value is chosen.

### Pre-selected defaults (`defaultSelected`)

For `dataSource` fields, specify a pre-selected value:

```json
{
  "name": "primaryCurrencies",
  "type": "multiselect",
  "dataSource": "/api/ref/currencies",
  "defaultSelected": ["USD"]
}
```

---

## API Reference

### Onboarding cases

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/onboarding` | List all cases with step progress |
| `POST` | `/api/onboarding` | Create a new blank draft |
| `GET` | `/api/onboarding/:id` | Get full case details + all step data |
| `PUT` | `/api/onboarding/:id/steps/:stepId` | Save one step's data and mark complete |
| `PUT` | `/api/onboarding/:id/submit` | Submit case for compliance review |
| `DELETE` | `/api/onboarding/:id` | Delete a case |

### Reference data

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/ref/countries` | Full country list |
| `GET` | `/api/ref/nationalities` | Countries + "Other" |
| `GET` | `/api/ref/currencies` | Major currencies |
| `GET` | `/api/ref/states/:country` | States / provinces by country code |

### Step IDs

| Step | stepId | Table |
|---|---|---|
| Client Profile | `client-profile` | `client_profiles` |
| Principal Officers | `principals` | `principal_officers` |
| RFI | `rfi` | `rfi_submissions` |
| KYC Assessment | `kyc` | `kyc_assessments` |

---

## Data Flow Summary

```
User fills form field
  → OnboardingContext.formData updated (in-memory)

User clicks Next
  → Validates current step's fields
  → PUT /api/onboarding/:id/steps/:stepId  (current step fields only)
  → DB upserts into the step's table
  → completed_steps updated on onboarding_cases
  → Navigates to next step

User resumes a draft
  → GET /api/onboarding/:id  (all 4 tables joined)
  → flattenTaskData() maps DB rows → formData keys
  → OnboardingContext hydrated with all saved data
  → Layout redirects to current_step URL
```
