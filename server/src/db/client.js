import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function initializeDatabase() {
  const schemaPath = fileURLToPath(new URL('./schema/schema.sql', import.meta.url));
  await pool.query(await readFile(schemaPath, 'utf8'));
}