import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'client_onboarding',
  user: 'kishore',
});

pool.on('error', (err) => console.error('DB pool error:', err.message));
