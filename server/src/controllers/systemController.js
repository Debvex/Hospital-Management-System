import { env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';
import { getDashboardSummary } from '../models/dashboardModel.js';
import { listAuditLogs } from '../models/auditModel.js';
import { seedDatabase } from '../db/seed.js';
import { pool } from '../db/client.js';

export async function health(_req, res) {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
}

export async function dashboard(req, res) {
  res.json(await getDashboardSummary(req.user));
}

export async function auditLogs(_req, res) {
  res.json(await listAuditLogs());
}

export async function resetDemo(_req, res) {
  if (env.nodeEnv === 'production') throw new HttpError(403, 'FORBIDDEN', 'Demo data reset is disabled in production.');
  await seedDatabase({ reset: true });
  res.json({ success: true });
}