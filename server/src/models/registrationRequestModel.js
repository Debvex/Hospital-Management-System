import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { HttpError } from '../lib/errors.js';
import { createAuditLog } from './auditModel.js';

function mapRequest(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    fullName: row.full_name,
    contactNumber: row.contact_number,
    profileData: row.profile_data || {},
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createRegistrationRequest({ body, email, passwordHash, req }) {
  const profileData = {
    ...(body.role === 'doctor' ? {
      departmentId: body.departmentId,
      specialization: String(body.specialization || '').trim(),
      qualification: String(body.qualification || '').trim(),
    } : {}),
    ...(body.role === 'receptionist' ? { staffBadgeId: String(body.staffBadgeId || '').trim() } : {}),
  };
  const id = randomUUID();
  const result = await pool.query(
    `INSERT INTO registration_requests (
      id, email, password_hash, role, full_name, contact_number, profile_data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    RETURNING id, email, role, full_name, contact_number, profile_data, status, created_at`,
    [id, email, passwordHash, body.role, String(body.fullName).trim(),
      String(body.contactNumber).trim(), JSON.stringify(profileData)],
  );
  await createAuditLog({
    user: { fullName: String(body.fullName).trim(), role: body.role },
    action: 'ROLE_REGISTRATION_REQUESTED',
    resourceType: 'auth',
    resourceId: id,
    metadata: { requestedRole: body.role },
    req,
  });
  return mapRequest(result.rows[0]);
}

export async function hasPendingRegistration(email) {
  const result = await pool.query(
    "SELECT 1 FROM registration_requests WHERE LOWER(email) = LOWER($1) AND status = 'pending'",
    [email],
  );
  return result.rowCount > 0;
}

export async function listPendingRegistrationRequests() {
  const result = await pool.query(
    `SELECT id, email, role, full_name, contact_number, profile_data, status, created_at
     FROM registration_requests WHERE status = 'pending' ORDER BY created_at ASC`,
  );
  return result.rows.map(mapRequest);
}

export async function reviewRegistrationRequest({ requestId, decision, reviewer, req }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT * FROM registration_requests WHERE id = $1 AND status = 'pending' FOR UPDATE`,
      [requestId],
    );
    if (!result.rowCount) {
      await client.query('ROLLBACK');
      return null;
    }

    const request = result.rows[0];
    let userId;
    if (decision === 'approved') {
      userId = randomUUID();
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, full_name, profile_data, is_active)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, TRUE)`,
        [userId, request.email, request.password_hash, request.role, request.full_name,
          JSON.stringify(request.profile_data || {})],
      );

      if (request.role === 'doctor') {
        const department = await client.query(
          'SELECT id FROM departments WHERE id = $1 AND is_active = TRUE',
          [request.profile_data?.departmentId],
        );
        if (!department.rowCount) {
          throw new HttpError(400, 'INVALID_DEPARTMENT', 'The requested doctor department is unavailable.');
        }
        await client.query(
          `INSERT INTO doctors (
            id, user_id, department_id, full_name, email, specialization, qualification,
            experience_years, consultation_fee, room_number, contact_number, avatar_color,
            availability, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 140, 'Pending assignment', $8, 'blue', '[]'::jsonb, TRUE)`,
          [randomUUID(), userId, department.rows[0].id,
            request.full_name.startsWith('Dr.') ? request.full_name : `Dr. ${request.full_name}`,
            request.email, request.profile_data.specialization, request.profile_data.qualification || '',
            request.contact_number],
        );
      }
    }

    await client.query(
      `UPDATE registration_requests
       SET status = $1, password_hash = NULL, reviewed_by = $2, reviewed_at = NOW()
       WHERE id = $3`,
      [decision, reviewer.id, requestId],
    );
    await createAuditLog({
      user: reviewer,
      action: decision === 'approved' ? 'ROLE_REGISTRATION_APPROVED' : 'ROLE_REGISTRATION_REJECTED',
      resourceType: 'auth',
      resourceId: requestId,
      metadata: { requestedRole: request.role, email: request.email },
      req,
      client,
    });
    await client.query('COMMIT');
    return { id: requestId, userId, email: request.email, role: request.role, status: decision };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
