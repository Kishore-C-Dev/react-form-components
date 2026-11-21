import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/* ── Step definitions (single source of truth) ───────────────────────────── */
const STEPS = [
  { id: 'client-profile', title: 'Client Profile',      description: 'Legal entity & contact details',    order: 1 },
  { id: 'principals',     title: 'Principal Officers',  description: 'Directors, signatories & UBOs',     order: 2 },
  { id: 'rfi',            title: 'RFI',                 description: 'Request for Information',           order: 3 },
  { id: 'kyc',            title: 'KYC Assessment',      description: 'Know Your Customer',                order: 4 },
];

function getCurrentStep(completedSteps = []) {
  const done = new Set(completedSteps);
  return STEPS.find((s) => !done.has(s.id))?.id ?? 'review';
}

/* ── List all cases with progress ───────────────────────────────────────── */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id, c.reference_no, c.status, c.completed_steps,
        c.created_at, c.updated_at, c.submitted_at,
        c.ra_employee_id, c.ra_full_name, c.ra_team,
        p.legal_entity_name, p.entity_type, p.industry_sector,
        p.country_of_incorporation, p.contact_email, p.annual_revenue_usd,
        k.customer_risk_rating, k.cdd_level
      FROM onboarding_cases c
      LEFT JOIN client_profiles   p ON p.case_id = c.id
      LEFT JOIN kyc_assessments   k ON k.case_id = c.id
      ORDER BY c.updated_at DESC NULLS LAST, c.created_at DESC
    `);
    // Enrich each row with step metadata
    const enriched = rows.map((row) => ({
      ...row,
      steps:        STEPS,
      total_steps:  STEPS.length,
      current_step: getCurrentStep(row.completed_steps),
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Create a new blank case ─────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { rows: [row] } = await pool.query(
      `INSERT INTO onboarding_cases (status) VALUES ('draft') RETURNING *`,
    );
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Get full task details (steps, current_step, all saved data) ─────────── */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [cRes, pRes, oRes, rRes, kRes] = await Promise.all([
      pool.query('SELECT * FROM onboarding_cases     WHERE id = $1',      [id]),
      pool.query('SELECT * FROM client_profiles      WHERE case_id = $1', [id]),
      pool.query('SELECT * FROM principal_officers   WHERE case_id = $1', [id]),
      pool.query('SELECT * FROM rfi_submissions      WHERE case_id = $1', [id]),
      pool.query('SELECT * FROM kyc_assessments      WHERE case_id = $1', [id]),
    ]);
    if (!cRes.rows.length) return res.status(404).json({ error: 'Not found' });

    const caseRow = cRes.rows[0];
    res.json({
      case:         caseRow,
      steps:        STEPS,
      total_steps:  STEPS.length,
      current_step: getCurrentStep(caseRow.completed_steps),
      profile:      pRes.rows[0] ?? null,
      principals:   oRes.rows[0] ?? null,
      rfi:          rRes.rows[0] ?? null,
      kyc:          kRes.rows[0] ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Save one step's data and mark it complete ───────────────────────────── */
router.put('/:id/steps/:stepId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id, stepId } = req.params;
    const b = req.body;

    switch (stepId) {
      case 'client-profile':
        await client.query(`
          INSERT INTO client_profiles
            (case_id, legal_entity_name, entity_type, country_of_incorporation,
             date_of_incorporation, registration_number, tax_id, lei, industry_sector,
             contact_name, contact_designation, contact_email, contact_phone, website,
             annual_revenue_usd, reg_address_line1, reg_address_line2, reg_city,
             reg_state, reg_postal_code, reg_country)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
          ON CONFLICT (case_id) DO UPDATE SET
            legal_entity_name=$2, entity_type=$3, country_of_incorporation=$4,
            date_of_incorporation=$5, registration_number=$6, tax_id=$7, lei=$8,
            industry_sector=$9, contact_name=$10, contact_designation=$11,
            contact_email=$12, contact_phone=$13, website=$14,
            annual_revenue_usd=$15, reg_address_line1=$16, reg_address_line2=$17,
            reg_city=$18, reg_state=$19, reg_postal_code=$20, reg_country=$21
        `, [id,
          b.legalEntityName||null, b.entityType||null, b.countryOfIncorporation||null,
          b.dateOfIncorporation||null, b.registrationNumber||null, b.taxId||null,
          b.lei||null, b.industrySector||null,
          b.contactName||null, b.contactDesignation||null, b.contactEmail||null,
          b.contactPhone||null, b.website||null, b.annualRevenueUsd||null,
          b.regAddressLine1||null, b.regAddressLine2||null, b.regCity||null,
          b.regState||null, b.regPostalCode||null, b.regCountry||null,
        ]);
        break;

      case 'principals':
        await client.query(`
          INSERT INTO principal_officers
            (case_id, signatory_name, signatory_designation, signatory_nationality,
             signatory_dob, signatory_id_type, signatory_id_number, signatory_id_expiry,
             signatory_country_of_residence, signatory_is_pep, signatory_pep_details,
             ubo_name, ubo_nationality, ubo_ownership_percent, ubo_country_of_residence,
             ubo_id_type, ubo_id_number, ubo_is_pep, ubo_relationship_to_entity)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
          ON CONFLICT (case_id) DO UPDATE SET
            signatory_name=$2, signatory_designation=$3, signatory_nationality=$4,
            signatory_dob=$5, signatory_id_type=$6, signatory_id_number=$7,
            signatory_id_expiry=$8, signatory_country_of_residence=$9,
            signatory_is_pep=$10, signatory_pep_details=$11,
            ubo_name=$12, ubo_nationality=$13, ubo_ownership_percent=$14,
            ubo_country_of_residence=$15, ubo_id_type=$16, ubo_id_number=$17,
            ubo_is_pep=$18, ubo_relationship_to_entity=$19
        `, [id,
          b.signatoryName||null, b.signatoryDesignation||null, b.signatoryNationality||null,
          b.signatoryDob||null, b.signatoryIdType||null, b.signatoryIdNumber||null,
          b.signatoryIdExpiry||null, b.signatoryCountryOfResidence||null,
          b.signatoryIsPep||null, b.signatoryPepDetails||null,
          b.uboName||null, b.uboNationality||null,
          b.uboOwnershipPercent ? parseFloat(b.uboOwnershipPercent) : null,
          b.uboCountryOfResidence||null, b.uboIdType||null, b.uboIdNumber||null,
          b.uboIsPep||null, b.uboRelationshipToEntity||null,
        ]);
        break;

      case 'rfi':
        await client.query(`
          INSERT INTO rfi_submissions
            (case_id, primary_business_activity, business_activity_types, target_markets,
             operating_countries_count, source_of_funds, source_of_wealth,
             expected_monthly_inflow, expected_monthly_outflow, avg_transaction_size,
             monthly_tx_count, primary_currencies, transaction_types, purpose_of_account,
             high_risk_countries_exposure, high_risk_countries_details,
             cash_intensive_business, existing_banking_relationships,
             previous_banking_issues, previous_banking_issues_details,
             correspondent_banking_required, additional_rfi_notes)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
          ON CONFLICT (case_id) DO UPDATE SET
            primary_business_activity=$2, business_activity_types=$3, target_markets=$4,
            operating_countries_count=$5, source_of_funds=$6, source_of_wealth=$7,
            expected_monthly_inflow=$8, expected_monthly_outflow=$9, avg_transaction_size=$10,
            monthly_tx_count=$11, primary_currencies=$12, transaction_types=$13,
            purpose_of_account=$14, high_risk_countries_exposure=$15,
            high_risk_countries_details=$16, cash_intensive_business=$17,
            existing_banking_relationships=$18, previous_banking_issues=$19,
            previous_banking_issues_details=$20, correspondent_banking_required=$21,
            additional_rfi_notes=$22
        `, [id,
          b.primaryBusinessActivity||null,
          b.businessActivityTypes||null, b.targetMarkets||null,
          b.operatingCountriesCount||null, b.sourceOfFunds||null, b.sourceOfWealth||null,
          b.expectedMonthlyInflow||null, b.expectedMonthlyOutflow||null,
          b.avgTransactionSize||null, b.monthlyTxCount||null,
          b.primaryCurrencies||null, b.transactionTypes||null, b.purposeOfAccount||null,
          b.highRiskCountriesExposure||null, b.highRiskCountriesDetails||null,
          b.cashIntensiveBusiness||null, b.existingBankingRelationships||null,
          b.previousBankingIssues||null, b.previousBankingIssuesDetails||null,
          b.correspondentBankingRequired||null, b.additionalRfiNotes||null,
        ]);
        break;

      case 'kyc':
        await client.query(`
          INSERT INTO kyc_assessments
            (case_id, doc_incorporation_status, doc_meoa_status, doc_board_resolution_status,
             doc_financial_statements_status, doc_ownership_chart_status,
             doc_signatory_id_status, doc_ubo_id_status, doc_proof_of_address_status,
             aml_screening_status, sanctions_screening_status, ofac_check_status,
             eu_sanctions_status, adverse_media_check, screening_notes,
             customer_risk_rating, cdd_level, edd_required, edd_justification,
             fatf_country_risk, industry_risk_level, risk_rating_justification,
             date_of_assessment, ra_certification)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
          ON CONFLICT (case_id) DO UPDATE SET
            doc_incorporation_status=$2, doc_meoa_status=$3, doc_board_resolution_status=$4,
            doc_financial_statements_status=$5, doc_ownership_chart_status=$6,
            doc_signatory_id_status=$7, doc_ubo_id_status=$8, doc_proof_of_address_status=$9,
            aml_screening_status=$10, sanctions_screening_status=$11, ofac_check_status=$12,
            eu_sanctions_status=$13, adverse_media_check=$14, screening_notes=$15,
            customer_risk_rating=$16, cdd_level=$17, edd_required=$18, edd_justification=$19,
            fatf_country_risk=$20, industry_risk_level=$21, risk_rating_justification=$22,
            date_of_assessment=$23, ra_certification=$24
        `, [id,
          b.docIncorporationStatus||null, b.docMemoaStatus||null, b.docBoardResolutionStatus||null,
          b.docFinancialStatementsStatus||null, b.docOwnershipChartStatus||null,
          b.docSignatoryIdStatus||null, b.docUboIdStatus||null, b.docProofOfAddressStatus||null,
          b.amlScreeningStatus||null, b.sanctionsScreeningStatus||null, b.ofacCheckStatus||null,
          b.euSanctionsStatus||null, b.adverseMediaCheck||null, b.screeningNotes||null,
          b.customerRiskRating||null, b.cddLevel||null, b.eddRequired||null, b.eddJustification||null,
          b.fatfCountryRisk||null, b.industryRiskLevel||null, b.riskRatingJustification||null,
          b.dateOfAssessment||null, !!b.raCertification,
        ]);
        // Mirror RA info on the case itself
        await client.query(
          `UPDATE onboarding_cases SET ra_employee_id=$1, ra_full_name=$2, ra_team=$3 WHERE id=$4`,
          [b.raEmployeeId||null, b.raFullName||null, b.raTeamDepartment||null, id],
        );
        break;

      default:
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Unknown step: ${stepId}` });
    }

    // Mark step complete (deduplicated)
    await client.query(`
      UPDATE onboarding_cases
      SET completed_steps = array_append(array_remove(completed_steps, $1::text), $1::text),
          updated_at = now()
      WHERE id = $2
    `, [stepId, id]);

    await client.query('COMMIT');
    res.json({ success: true, stepId, caseId: id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/* ── Submit for review ───────────────────────────────────────────────────── */
router.put('/:id/submit', async (req, res) => {
  try {
    await pool.query(
      `UPDATE onboarding_cases SET status='submitted', submitted_at=now(), updated_at=now() WHERE id=$1`,
      [req.params.id],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Delete ──────────────────────────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM onboarding_cases WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
