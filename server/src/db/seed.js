import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEnv } from '../config/env.js';
import { initializeDatabase, pool } from './client.js';
import { seedDatabase as seed } from '../seed.js';

export const seedDatabase = seed;

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  try {
    validateEnv();
    await initializeDatabase();
    const seeded = await seed({ reset: process.argv.includes('--reset') });
    console.log(seeded ? 'Synthetic HMS data seeded.' : 'Database already has data; no changes made.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}