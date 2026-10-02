import 'dotenv/config';
import { app } from './app.js';
import { env, validateEnv } from './config/env.js';
import { initializeDatabase, pool } from './db/client.js';
import { seedDatabase } from './db/seed.js';

try {
  validateEnv();
  await initializeDatabase();
  const didSeed = await seedDatabase();
  if (didSeed) console.log('Initialized synthetic HMS demonstration records.');
  app.listen(env.port, () => console.log(`HMS API listening on http://localhost:${env.port}`));
} catch (error) {
  console.error(`Unable to start HMS API: ${error.message}`);
  await pool.end();
  process.exitCode = 1;
}