import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { mapAuditLog } from './mappers.js';

export async function createAuditLog({ user, action, resourceType, resourceId, metadata = {}, req, client = pool }) {
  await client.query(
    `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, resource_type, resource_id, metadata_json, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
    [randomUUID(), user?.id || null, user?.fullName || 'System', user?.role || 'administrator', action,
      resourceType, resourceId, JSON.stringify(metadata), req.ip || ''],
  );
}

export async function listAuditLogs() {
  const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500');
  return result.rows.map(mapAuditLog);
}