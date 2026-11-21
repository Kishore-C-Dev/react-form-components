import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ host: 'localhost', port: 5432, database: 'client_onboarding', user: 'kishore' });

const ALL_STEPS = ['client-profile', 'principals', 'rfi', 'kyc'];

const clients = [
  /* ── Fully complete (all 4 steps) ───────────────────────── */
  {
    case: { status: 'approved', ra: 'Alice Chen', ra_id: 'EMP-001', team: 'Commercial Banking – APAC', days: 45, steps: ALL_STEPS },
    profile: { legal_entity_name: 'Meridian Capital Holdings Ltd.', entity_type: 'corporation', country_of_incorporation: 'GB', registration_number: 'GB12345678', tax_id: '12-3456789', industry_sector: 'financial_services', contact_name: 'Sarah Mitchell', contact_email: 's.mitchell@meridiancapital.co.uk', contact_phone: '+44 20 7946 0958', annual_revenue_usd: '50m_250m', reg_address_line1: '1 Canada Square', reg_city: 'London', reg_country: 'GB' },
    principals: { signatory_name: 'James Harrington', signatory_designation: 'cfo', signatory_nationality: 'GB', signatory_id_type: 'passport', signatory_id_number: 'GB123456789', signatory_is_pep: 'no', ubo_name: 'Robert Harrington', ubo_nationality: 'GB', ubo_ownership_percent: 65, ubo_id_type: 'passport', ubo_id_number: 'GB987654321', ubo_is_pep: 'no', ubo_relationship_to_entity: 'shareholder' },
    rfi: { primary_business_activity: 'Investment management and private equity across EMEA and APAC markets.', business_activity_types: ['financial_services','consulting'], target_markets: ['western_europe','southeast_asia'], source_of_funds: ['business_revenue','equity'], source_of_wealth: 'business_profits', expected_monthly_inflow: '1m_5m', expected_monthly_outflow: '1m_5m', primary_currencies: ['USD','GBP','EUR'], transaction_types: ['swift','fx'], purpose_of_account: 'investment', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'Barclays Corporate, Deutsche Bank', previous_banking_issues: 'no', correspondent_banking_required: 'yes' },
    kyc: { doc_incorporation_status: 'verified', doc_meoa_status: 'verified', doc_board_resolution_status: 'verified', doc_financial_statements_status: 'verified', doc_ownership_chart_status: 'verified', doc_signatory_id_status: 'verified', doc_ubo_id_status: 'verified', doc_proof_of_address_status: 'verified', aml_screening_status: 'clear', sanctions_screening_status: 'clear', ofac_check_status: 'clear', eu_sanctions_status: 'clear', adverse_media_check: 'clear', customer_risk_rating: 'medium', cdd_level: 'standard', edd_required: 'no', fatf_country_risk: 'low', industry_risk_level: 'medium', risk_rating_justification: 'Medium risk: cross-border FX activity, all screening clear.', ra_employee_id: 'EMP-001', ra_certification: true },
  },
  {
    case: { status: 'approved', ra: 'James Wilson', ra_id: 'EMP-002', team: 'Commercial Banking – Americas', days: 90, steps: ALL_STEPS },
    profile: { legal_entity_name: 'Apex Manufacturing Corp.', entity_type: 'corporation', country_of_incorporation: 'US', registration_number: 'US-DEL-7891234', tax_id: '45-6789012', industry_sector: 'manufacturing', contact_name: 'Robert Hayes', contact_email: 'r.hayes@apexmfg.com', contact_phone: '+1 312 555 0190', annual_revenue_usd: '250m_1b', reg_address_line1: '500 Industrial Pkwy', reg_city: 'Chicago', reg_country: 'US' },
    principals: { signatory_name: 'Robert Hayes', signatory_designation: 'ceo', signatory_nationality: 'US', signatory_id_type: 'passport', signatory_id_number: 'US556677889', signatory_is_pep: 'no', ubo_name: 'Hayes Family Trust', ubo_nationality: 'US', ubo_ownership_percent: 80, ubo_id_type: 'national_id', ubo_id_number: 'TR-0012345', ubo_is_pep: 'no', ubo_relationship_to_entity: 'trust_beneficiary' },
    rfi: { primary_business_activity: 'Manufacture and export of industrial components and precision machinery.', business_activity_types: ['manufacturing','import_export'], target_markets: ['north_america','western_europe'], source_of_funds: ['business_revenue'], source_of_wealth: 'business_profits', expected_monthly_inflow: '5m_10m', expected_monthly_outflow: '5m_10m', primary_currencies: ['USD','EUR'], transaction_types: ['swift','ach'], purpose_of_account: 'operating', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'JPMorgan Chase, Bank of America', previous_banking_issues: 'no', correspondent_banking_required: 'no' },
    kyc: { doc_incorporation_status: 'verified', doc_meoa_status: 'verified', doc_board_resolution_status: 'verified', doc_financial_statements_status: 'verified', doc_ownership_chart_status: 'verified', doc_signatory_id_status: 'verified', doc_ubo_id_status: 'verified', doc_proof_of_address_status: 'verified', aml_screening_status: 'clear', sanctions_screening_status: 'clear', ofac_check_status: 'clear', eu_sanctions_status: 'clear', adverse_media_check: 'clear', customer_risk_rating: 'low', cdd_level: 'standard', edd_required: 'no', fatf_country_risk: 'low', industry_risk_level: 'low', risk_rating_justification: 'Low risk: domestic US entity, clean screening, stable industry.', ra_employee_id: 'EMP-002', ra_certification: true },
  },
  {
    case: { status: 'approved', ra: 'Alice Chen', ra_id: 'EMP-001', team: 'Commercial Banking – APAC', days: 120, steps: ALL_STEPS },
    profile: { legal_entity_name: 'TechVenture Partners GmbH', entity_type: 'llc', country_of_incorporation: 'DE', registration_number: 'DE-HRB-234567', tax_id: 'DE298765432', industry_sector: 'technology', contact_name: 'Klaus Weber', contact_email: 'k.weber@techventure.de', contact_phone: '+49 89 555 7890', annual_revenue_usd: '50m_250m', reg_address_line1: 'Maximilianstr. 35', reg_city: 'Munich', reg_country: 'DE' },
    principals: { signatory_name: 'Klaus Weber', signatory_designation: 'md', signatory_nationality: 'DE', signatory_id_type: 'national_id', signatory_id_number: 'DE-ID-9988776', signatory_is_pep: 'no', ubo_name: 'Weber Holdings SE', ubo_nationality: 'DE', ubo_ownership_percent: 55, ubo_id_type: 'national_id', ubo_id_number: 'WH-00554433', ubo_is_pep: 'no', ubo_relationship_to_entity: 'shareholder' },
    rfi: { primary_business_activity: 'B2B SaaS platform for supply chain management targeting European enterprises.', business_activity_types: ['technology','consulting'], target_markets: ['western_europe','north_america'], source_of_funds: ['equity','business_revenue'], source_of_wealth: 'ipo_exit', expected_monthly_inflow: '1m_5m', expected_monthly_outflow: '500k_1m', primary_currencies: ['EUR','USD'], transaction_types: ['ach','swift'], purpose_of_account: 'operating', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'Commerzbank, Deutsche Bank', previous_banking_issues: 'no', correspondent_banking_required: 'no' },
    kyc: { doc_incorporation_status: 'verified', doc_meoa_status: 'verified', doc_board_resolution_status: 'verified', doc_financial_statements_status: 'verified', doc_ownership_chart_status: 'verified', doc_signatory_id_status: 'verified', doc_ubo_id_status: 'verified', doc_proof_of_address_status: 'verified', aml_screening_status: 'clear', sanctions_screening_status: 'clear', ofac_check_status: 'clear', eu_sanctions_status: 'clear', adverse_media_check: 'clear', customer_risk_rating: 'low', cdd_level: 'standard', edd_required: 'no', fatf_country_risk: 'low', industry_risk_level: 'low', risk_rating_justification: 'Low risk: regulated EU jurisdiction, standard tech entity, clean screening.', ra_employee_id: 'EMP-001', ra_certification: true },
  },
  {
    case: { status: 'approved', ra: 'Sarah Park', ra_id: 'EMP-004', team: 'Commercial Banking – EMEA', days: 150, steps: ALL_STEPS },
    profile: { legal_entity_name: 'Nordic Pharma Holdings AG', entity_type: 'corporation', country_of_incorporation: 'CH', registration_number: 'CHE-123.456.789', tax_id: 'CHE-123.456.789', industry_sector: 'healthcare', contact_name: 'Erik Lindqvist', contact_email: 'e.lindqvist@nordicpharma.ch', contact_phone: '+41 44 555 3456', annual_revenue_usd: 'gt_1b', reg_address_line1: 'Bahnhofstrasse 10', reg_city: 'Zurich', reg_country: 'CH' },
    principals: { signatory_name: 'Erik Lindqvist', signatory_designation: 'ceo', signatory_nationality: 'CH', signatory_id_type: 'passport', signatory_id_number: 'CH-PP-1122334', signatory_is_pep: 'no', ubo_name: 'Lindqvist Family Foundation', ubo_nationality: 'CH', ubo_ownership_percent: 48, ubo_id_type: 'national_id', ubo_id_number: 'CH-NI-99887766', ubo_is_pep: 'no', ubo_relationship_to_entity: 'trust_beneficiary' },
    rfi: { primary_business_activity: 'Development and global distribution of specialty pharmaceuticals and biosimilars.', business_activity_types: ['healthcare'], target_markets: ['western_europe','north_america','east_asia'], source_of_funds: ['business_revenue'], source_of_wealth: 'business_profits', expected_monthly_inflow: 'gt_10m', expected_monthly_outflow: 'gt_10m', primary_currencies: ['CHF','EUR','USD'], transaction_types: ['swift','ach'], purpose_of_account: 'operating', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'UBS, Credit Suisse', previous_banking_issues: 'no', correspondent_banking_required: 'yes' },
    kyc: { doc_incorporation_status: 'verified', doc_meoa_status: 'verified', doc_board_resolution_status: 'verified', doc_financial_statements_status: 'verified', doc_ownership_chart_status: 'verified', doc_signatory_id_status: 'verified', doc_ubo_id_status: 'verified', doc_proof_of_address_status: 'verified', aml_screening_status: 'clear', sanctions_screening_status: 'clear', ofac_check_status: 'clear', eu_sanctions_status: 'clear', adverse_media_check: 'clear', customer_risk_rating: 'low', cdd_level: 'simplified', edd_required: 'no', fatf_country_risk: 'low', industry_risk_level: 'low', risk_rating_justification: 'Low risk: Swiss incorporated, regulated pharma sector, >$1B revenue, all screening clear.', ra_employee_id: 'EMP-004', ra_certification: true },
  },

  /* ── Partially complete (2–3 steps done) ────────────────── */
  {
    case: { status: 'under_review', ra: 'David Kumar', ra_id: 'EMP-003', team: 'Commercial Banking – EMEA', days: 10, steps: ['client-profile', 'principals', 'rfi'] },
    profile: { legal_entity_name: 'Oasis Trading LLC', entity_type: 'llc', country_of_incorporation: 'AE', registration_number: 'AE-DXB-556677', industry_sector: 'trading', contact_name: 'Mohammed Al Rashid', contact_email: 'm.alrashid@oasistrading.ae', contact_phone: '+971 4 555 1234', annual_revenue_usd: '10m_50m', reg_address_line1: 'DIFC Gate Avenue', reg_city: 'Dubai', reg_country: 'AE' },
    principals: { signatory_name: 'Mohammed Al Rashid', signatory_designation: 'md', signatory_nationality: 'AE', signatory_id_type: 'passport', signatory_id_number: 'AE-PP-77665544', signatory_is_pep: 'no', ubo_name: 'Al Rashid Holdings', ubo_nationality: 'AE', ubo_ownership_percent: 100, ubo_id_type: 'passport', ubo_id_number: 'AE-PP-11223344', ubo_is_pep: 'no', ubo_relationship_to_entity: 'shareholder' },
    rfi: { primary_business_activity: 'Commodity trading across Middle East and Southeast Asia markets.', business_activity_types: ['trading','import_export'], target_markets: ['middle_east','southeast_asia'], source_of_funds: ['business_revenue'], source_of_wealth: 'business_profits', expected_monthly_inflow: '1m_5m', expected_monthly_outflow: '1m_5m', primary_currencies: ['USD','AED'], transaction_types: ['swift'], purpose_of_account: 'operating', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'Emirates NBD', previous_banking_issues: 'no', correspondent_banking_required: 'yes' },
    kyc: null,
  },
  {
    case: { status: 'submitted', ra: 'James Wilson', ra_id: 'EMP-002', team: 'Commercial Banking – APAC', days: 60, steps: ['client-profile', 'principals', 'rfi'] },
    profile: { legal_entity_name: 'Pacific Rim Logistics Pte. Ltd.', entity_type: 'corporation', country_of_incorporation: 'SG', registration_number: 'SG-202012345Z', industry_sector: 'logistics', contact_name: 'Linda Tan', contact_email: 'l.tan@pacificrimlogistics.sg', contact_phone: '+65 6555 8901', annual_revenue_usd: '10m_50m', reg_address_line1: '10 Marina Boulevard', reg_city: 'Singapore', reg_country: 'SG' },
    principals: { signatory_name: 'Linda Tan', signatory_designation: 'ceo', signatory_nationality: 'SG', signatory_id_type: 'national_id', signatory_id_number: 'SG-NI-S8812345A', signatory_is_pep: 'no', ubo_name: 'Tan Holdings Pte. Ltd.', ubo_nationality: 'SG', ubo_ownership_percent: 75, ubo_id_type: 'national_id', ubo_id_number: 'SG-NI-S6600123B', ubo_is_pep: 'no', ubo_relationship_to_entity: 'shareholder' },
    rfi: { primary_business_activity: 'Regional freight forwarding and customs brokerage across ASEAN.', business_activity_types: ['logistics'], target_markets: ['southeast_asia','east_asia'], source_of_funds: ['business_revenue'], source_of_wealth: 'business_profits', expected_monthly_inflow: '500k_1m', expected_monthly_outflow: '500k_1m', primary_currencies: ['SGD','USD'], transaction_types: ['swift','ach'], purpose_of_account: 'operating', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'DBS Bank Singapore', previous_banking_issues: 'no', correspondent_banking_required: 'yes' },
    kyc: null,
  },
  {
    case: { status: 'under_review', ra: 'David Kumar', ra_id: 'EMP-003', team: 'Commercial Banking – EMEA', days: 12, steps: ['client-profile', 'principals'] },
    profile: { legal_entity_name: 'Silk Road Commodities LLC', entity_type: 'llc', country_of_incorporation: 'HK', registration_number: 'HK-1234567', industry_sector: 'trading', contact_name: 'Victor Chan', contact_email: 'v.chan@silkroadcommodities.hk', contact_phone: '+852 2555 4321', annual_revenue_usd: '50m_250m', reg_address_line1: 'Two IFC, 8 Finance St', reg_city: 'Hong Kong', reg_country: 'HK' },
    principals: { signatory_name: 'Victor Chan', signatory_designation: 'md', signatory_nationality: 'HK', signatory_id_type: 'passport', signatory_id_number: 'HK-PP-A1234567', signatory_is_pep: 'no', ubo_name: 'Chan Investments Ltd.', ubo_nationality: 'HK', ubo_ownership_percent: 90, ubo_id_type: 'passport', ubo_id_number: 'HK-PP-B9876543', ubo_is_pep: 'no', ubo_relationship_to_entity: 'shareholder' },
    rfi: null,
    kyc: null,
  },
  {
    case: { status: 'submitted', ra: 'Sarah Park', ra_id: 'EMP-004', team: 'Commercial Banking – Americas', days: 75, steps: ['client-profile', 'principals', 'rfi'] },
    profile: { legal_entity_name: 'Blue Horizon Energy Ltd.', entity_type: 'corporation', country_of_incorporation: 'CA', registration_number: 'CA-BC-9876543', tax_id: '789123456', industry_sector: 'energy', contact_name: 'Jennifer MacLeod', contact_email: 'j.macleod@bluehorizonenergy.ca', contact_phone: '+1 604 555 2345', annual_revenue_usd: '250m_1b', reg_address_line1: '1055 W Hastings St', reg_city: 'Vancouver', reg_country: 'CA' },
    principals: { signatory_name: 'Jennifer MacLeod', signatory_designation: 'cfo', signatory_nationality: 'CA', signatory_id_type: 'passport', signatory_id_number: 'CA-PP-XM556677', signatory_is_pep: 'no', ubo_name: 'MacLeod Energy Holdings', ubo_nationality: 'CA', ubo_ownership_percent: 60, ubo_id_type: 'passport', ubo_id_number: 'CA-PP-XM223344', ubo_is_pep: 'no', ubo_relationship_to_entity: 'holding_company' },
    rfi: { primary_business_activity: 'Renewable energy projects (solar, wind) across western Canada.', business_activity_types: ['energy'], target_markets: ['north_america'], source_of_funds: ['equity','loans'], source_of_wealth: 'investments', expected_monthly_inflow: '1m_5m', expected_monthly_outflow: '1m_5m', primary_currencies: ['CAD','USD'], transaction_types: ['ach','swift'], purpose_of_account: 'project_finance', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'RBC, TD Bank', previous_banking_issues: 'no', correspondent_banking_required: 'no' },
    kyc: null,
  },

  /* ── Draft / early stage (0–1 steps) ───────────────────── */
  {
    case: { status: 'draft', ra: 'Alice Chen', ra_id: 'EMP-001', team: 'Commercial Banking – APAC', days: 2, steps: ['client-profile'] },
    profile: { legal_entity_name: 'DataFlow Systems Inc.', entity_type: 'corporation', country_of_incorporation: 'US', registration_number: 'US-CA-5678901', tax_id: '99-1234567', industry_sector: 'technology', contact_name: 'Priya Sharma', contact_email: 'p.sharma@dataflowsystems.com', contact_phone: '+1 415 555 7777', annual_revenue_usd: '1m_10m', reg_address_line1: '101 Mission St', reg_city: 'San Francisco', reg_country: 'US' },
    principals: null, rfi: null, kyc: null,
  },
  {
    case: { status: 'draft', ra: 'James Wilson', ra_id: 'EMP-002', team: 'Commercial Banking – EMEA', days: 1, steps: ['client-profile'] },
    profile: { legal_entity_name: 'Emerald Coast Investments Ltd.', entity_type: 'trust', country_of_incorporation: 'KY', registration_number: 'KY-MC-334455', industry_sector: 'financial_services', contact_name: 'Caroline Hughes', contact_email: 'c.hughes@emeraldcoast.ky', contact_phone: '+1 345 555 8765', annual_revenue_usd: '50m_250m', reg_address_line1: 'Harbour Centre, N Church St', reg_city: 'George Town', reg_country: 'KY' },
    principals: null, rfi: null, kyc: null,
  },
  {
    case: { status: 'rejected', ra: 'David Kumar', ra_id: 'EMP-003', team: 'Commercial Banking – EMEA', days: 25, steps: ['client-profile', 'principals', 'rfi', 'kyc'] },
    profile: { legal_entity_name: 'Prestige Real Estate Corp.', entity_type: 'corporation', country_of_incorporation: 'VG', registration_number: 'BVI-1245678', industry_sector: 'real_estate', contact_name: 'Marcus Thornton', contact_email: 'm.thornton@prestige-re.com', contact_phone: '+1 284 555 9900', annual_revenue_usd: '10m_50m', reg_address_line1: 'Tropic Isle Building', reg_city: 'Road Town', reg_country: 'VG' },
    principals: { signatory_name: 'Marcus Thornton', signatory_designation: 'director', signatory_nationality: 'VG', signatory_id_type: 'passport', signatory_id_number: 'VG-PP-MT9876', signatory_is_pep: 'no', ubo_name: 'Thornton Family Trust', ubo_nationality: 'VG', ubo_ownership_percent: 100, ubo_id_type: 'passport', ubo_id_number: 'VG-PP-TT6543', ubo_is_pep: 'no', ubo_relationship_to_entity: 'trust_beneficiary' },
    rfi: { primary_business_activity: 'Real estate development and investment in Caribbean offshore jurisdictions.', business_activity_types: ['real_estate'], target_markets: ['latin_america'], source_of_funds: ['asset_sale','loans'], source_of_wealth: 'real_estate', expected_monthly_inflow: '500k_1m', expected_monthly_outflow: '500k_1m', primary_currencies: ['USD'], transaction_types: ['swift'], purpose_of_account: 'operating', high_risk_countries_exposure: 'no', cash_intensive_business: 'no', existing_banking_relationships: 'Cayman National Bank', previous_banking_issues: 'no', correspondent_banking_required: 'yes' },
    kyc: { doc_incorporation_status: 'verified', doc_meoa_status: 'verified', doc_board_resolution_status: 'awaiting', doc_financial_statements_status: 'awaiting', doc_ownership_chart_status: 'verified', doc_signatory_id_status: 'verified', doc_ubo_id_status: 'verified', doc_proof_of_address_status: 'verified', aml_screening_status: 'escalated', sanctions_screening_status: 'clear', ofac_check_status: 'clear', eu_sanctions_status: 'clear', adverse_media_check: 'escalated', customer_risk_rating: 'high', cdd_level: 'enhanced', edd_required: 'yes', edd_justification: 'BVI jurisdiction high risk; adverse media match found requiring senior compliance review.', fatf_country_risk: 'high', industry_risk_level: 'high', risk_rating_justification: 'High risk: BVI offshore entity, adverse media match, escalated AML screening.', ra_employee_id: 'EMP-003', ra_certification: true },
  },
  {
    case: { status: 'draft', ra: 'Sarah Park', ra_id: 'EMP-004', team: 'Commercial Banking – EMEA', days: 0, steps: [] },
    profile: null, principals: null, rfi: null, kyc: null,
  },
];

async function seed() {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    await dbClient.query('DELETE FROM onboarding_cases');
    console.log('Cleared existing data\n');

    for (const c of clients) {
      const isActive = ['submitted','approved','under_review','rejected'].includes(c.case.status);
      const daysExpr = `now() - interval '${c.case.days} days'`;

      const { rows: [caseRow] } = await dbClient.query(
        `INSERT INTO onboarding_cases
           (status, ra_employee_id, ra_full_name, ra_team, completed_steps, submitted_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, ${isActive ? daysExpr : 'null'}, ${daysExpr}, ${daysExpr})
         RETURNING id, reference_no`,
        [c.case.status, c.case.ra_id, c.case.ra, c.case.team, c.case.steps],
      );
      const { id } = caseRow;

      if (c.profile) {
        await dbClient.query(`
          INSERT INTO client_profiles
            (case_id, legal_entity_name, entity_type, country_of_incorporation,
             registration_number, tax_id, industry_sector, contact_name,
             contact_email, contact_phone, annual_revenue_usd,
             reg_address_line1, reg_city, reg_country)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [id, c.profile.legal_entity_name, c.profile.entity_type, c.profile.country_of_incorporation,
           c.profile.registration_number||null, c.profile.tax_id||null, c.profile.industry_sector,
           c.profile.contact_name, c.profile.contact_email, c.profile.contact_phone,
           c.profile.annual_revenue_usd, c.profile.reg_address_line1, c.profile.reg_city, c.profile.reg_country],
        );
      }

      if (c.principals) {
        const p = c.principals;
        await dbClient.query(`
          INSERT INTO principal_officers
            (case_id, signatory_name, signatory_designation, signatory_nationality,
             signatory_id_type, signatory_id_number, signatory_is_pep,
             ubo_name, ubo_nationality, ubo_ownership_percent, ubo_id_type,
             ubo_id_number, ubo_is_pep, ubo_relationship_to_entity)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [id, p.signatory_name, p.signatory_designation, p.signatory_nationality,
           p.signatory_id_type, p.signatory_id_number, p.signatory_is_pep,
           p.ubo_name, p.ubo_nationality, p.ubo_ownership_percent, p.ubo_id_type,
           p.ubo_id_number, p.ubo_is_pep, p.ubo_relationship_to_entity],
        );
      }

      if (c.rfi) {
        const r = c.rfi;
        await dbClient.query(`
          INSERT INTO rfi_submissions
            (case_id, primary_business_activity, business_activity_types, target_markets,
             source_of_funds, source_of_wealth, expected_monthly_inflow, expected_monthly_outflow,
             primary_currencies, transaction_types, purpose_of_account,
             high_risk_countries_exposure, cash_intensive_business,
             existing_banking_relationships, previous_banking_issues, correspondent_banking_required)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [id, r.primary_business_activity, r.business_activity_types, r.target_markets,
           r.source_of_funds, r.source_of_wealth, r.expected_monthly_inflow, r.expected_monthly_outflow,
           r.primary_currencies, r.transaction_types, r.purpose_of_account,
           r.high_risk_countries_exposure, r.cash_intensive_business,
           r.existing_banking_relationships, r.previous_banking_issues, r.correspondent_banking_required],
        );
      }

      if (c.kyc) {
        const k = c.kyc;
        await dbClient.query(`
          INSERT INTO kyc_assessments
            (case_id, doc_incorporation_status, doc_meoa_status, doc_board_resolution_status,
             doc_financial_statements_status, doc_ownership_chart_status, doc_signatory_id_status,
             doc_ubo_id_status, doc_proof_of_address_status,
             aml_screening_status, sanctions_screening_status, ofac_check_status,
             eu_sanctions_status, adverse_media_check,
             customer_risk_rating, cdd_level, edd_required, edd_justification,
             fatf_country_risk, industry_risk_level, risk_rating_justification,
             ra_certification)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
          [id,
           k.doc_incorporation_status, k.doc_meoa_status, k.doc_board_resolution_status,
           k.doc_financial_statements_status, k.doc_ownership_chart_status, k.doc_signatory_id_status,
           k.doc_ubo_id_status, k.doc_proof_of_address_status,
           k.aml_screening_status, k.sanctions_screening_status, k.ofac_check_status,
           k.eu_sanctions_status, k.adverse_media_check,
           k.customer_risk_rating, k.cdd_level, k.edd_required||'no', k.edd_justification||null,
           k.fatf_country_risk, k.industry_risk_level, k.risk_rating_justification,
           k.ra_certification],
        );
      }

      const steps = c.case.steps.length;
      const label = steps === 4 ? '4/4 ✓' : steps === 0 ? '0/4 (blank)' : `${steps}/4`;
      console.log(`  [${c.case.status.padEnd(12)}] ${label.padEnd(10)} ${c.profile?.legal_entity_name ?? '(unnamed)'}`);
    }

    await dbClient.query('COMMIT');
    console.log(`\nSeeded ${clients.length} cases.`);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    dbClient.release();
    await pool.end();
  }
}

seed();
