import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const CLIENT_QUERY = `
  SELECT
    c.id,
    c.reference_no,
    c.status,
    c.ra_employee_id,
    c.ra_full_name,
    c.ra_team,
    c.submitted_at,
    c.created_at,
    c.updated_at,
    p.legal_entity_name,
    p.entity_type,
    p.country_of_incorporation,
    p.registration_number,
    p.tax_id,
    p.industry_sector,
    p.contact_name,
    p.contact_email,
    p.contact_phone,
    p.website,
    p.annual_revenue_usd,
    p.reg_address_line1,
    p.reg_city,
    p.reg_country,
    k.customer_risk_rating,
    k.cdd_level,
    k.aml_screening_status,
    k.sanctions_screening_status
  FROM onboarding_cases c
  LEFT JOIN client_profiles p ON p.case_id = c.id
  LEFT JOIN kyc_assessments k ON k.case_id = c.id
`;

// GET /api/clients
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`${CLIENT_QUERY} ORDER BY c.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`${CLIENT_QUERY} WHERE c.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const b = req.body;

    const { rows: [caseRow] } = await client.query(
      `INSERT INTO onboarding_cases (status, ra_employee_id, ra_full_name, ra_team)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [b.status || 'draft', b.raEmployeeId || null, b.raFullName || null, b.raTeam || null],
    );

    await client.query(
      `INSERT INTO client_profiles
         (case_id, legal_entity_name, entity_type, country_of_incorporation,
          registration_number, tax_id, industry_sector,
          contact_name, contact_email, contact_phone, website,
          annual_revenue_usd, reg_address_line1, reg_city, reg_country)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        caseRow.id,
        b.legalEntityName || null, b.entityType || null, b.countryOfIncorporation || null,
        b.registrationNumber || null, b.taxId || null, b.industrySector || null,
        b.contactName || null, b.contactEmail || null, b.contactPhone || null,
        b.website || null, b.annualRevenueUsd || null,
        b.regAddressLine1 || null, b.regCity || null, b.regCountry || null,
      ],
    );

    await client.query(
      `INSERT INTO kyc_assessments (case_id, customer_risk_rating, cdd_level)
       VALUES ($1, $2, $3)`,
      [caseRow.id, b.customerRiskRating || null, b.cddLevel || null],
    );

    await client.query('COMMIT');

    const { rows } = await client.query(`${CLIENT_QUERY} WHERE c.id = $1`, [caseRow.id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const b = req.body;
    const { id } = req.params;

    await client.query(
      `UPDATE onboarding_cases
       SET status = $1, ra_employee_id = $2, ra_full_name = $3, ra_team = $4
       WHERE id = $5`,
      [b.status || null, b.raEmployeeId || null, b.raFullName || null, b.raTeam || null, id],
    );

    await client.query(
      `UPDATE client_profiles SET
         legal_entity_name = $1, entity_type = $2, country_of_incorporation = $3,
         registration_number = $4, tax_id = $5, industry_sector = $6,
         contact_name = $7, contact_email = $8, contact_phone = $9,
         website = $10, annual_revenue_usd = $11,
         reg_address_line1 = $12, reg_city = $13, reg_country = $14
       WHERE case_id = $15`,
      [
        b.legalEntityName || null, b.entityType || null, b.countryOfIncorporation || null,
        b.registrationNumber || null, b.taxId || null, b.industrySector || null,
        b.contactName || null, b.contactEmail || null, b.contactPhone || null,
        b.website || null, b.annualRevenueUsd || null,
        b.regAddressLine1 || null, b.regCity || null, b.regCountry || null, id,
      ],
    );

    await client.query(
      `UPDATE kyc_assessments SET customer_risk_rating = $1, cdd_level = $2 WHERE case_id = $3`,
      [b.customerRiskRating || null, b.cddLevel || null, id],
    );

    await client.query('COMMIT');

    const { rows } = await client.query(`${CLIENT_QUERY} WHERE c.id = $1`, [id]);
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM onboarding_cases WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
