import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { HttpError, requireFields } from '../lib/errors.js';
import { hashPassword, signToken, verifyPassword } from '../lib/security.js';
import { createAuditLog } from '../models/auditModel.js';
import { findUserByEmail, listUsers as getAllUsers, registerPatientAccount } from '../models/userModel.js';
import { createRegistrationRequest, hasPendingRegistration } from '../models/registrationrequestModel.js';
import { mapPatient, mapUser } from '../models/mappers.js';

export async function register(req, res) {
  const body = req.body || {};
  requireFields(body, ['email', 'password', 'fullName', 'contactNumber']);
  const role = body.role || 'patient';
  if (!['administrator', 'doctor', 'receptionist', 'patient'].includes(role)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Select a valid account role.');
  }
  const email = String(body.email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || String(body.password).length < 8) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Enter a valid email and a password with at least 8 characters.');
  }
  if (role === 'doctor') {
    requireFields(body, ['departmentId', 'specialization']);
    const department = await pool.query('SELECT 1 FROM departments WHERE id = $1 AND is_active = TRUE', [body.departmentId]);
    if (!department.rowCount) throw new HttpError(400, 'VALIDATION_ERROR', 'Select an active hospital department.');
  }
  if (await findUserByEmail(email) || await hasPendingRegistration(email)) {
    throw new HttpError(409, 'CONFLICT_EMAIL_EXISTS', 'An account or registration request with this email already exists.');
  }

  const passwordHash = await hashPassword(body.password);
  if (role !== 'patient') {
    try {
      const request = await createRegistrationRequest({ body: { ...body, role }, email, passwordHash, req });
      return res.status(202).json({
        status: 'pending_approval',
        message: 'Your account request was submitted. An administrator must approve it before you can sign in.',
        request,
      });
    } catch (error) {
      if (error.code === '23505') throw new HttpError(409, 'CONFLICT_EMAIL_EXISTS', 'An account or registration request with this email already exists.');
      throw error;
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const created = await registerPatientAccount({
      userId: randomUUID(), patientId: randomUUID(), email,
      passwordHash, fullName: String(body.fullName).trim(), body, client,
    });
    const user = mapUser(created.user);
    await createAuditLog({ user, action: 'USER_REGISTER', resourceType: 'auth', resourceId: user.id, metadata: { role: 'patient' }, req, client });
    await client.query('COMMIT');
    res.status(201).json({ status: 'active', token: signToken(user), user, patient: mapPatient(created.patient) });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') throw new HttpError(409, 'CONFLICT_EMAIL_EXISTS', 'An account with this email address already exists.');
    throw error;
  } finally {
    client.release();
  }
}

export async function login(req, res) {
  requireFields(req.body, ['email', 'password']);
  const row = await findUserByEmail(String(req.body.email).trim());
  if (!row || !row.is_active || !(await verifyPassword(req.body.password, row.password_hash))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password. Please try again.');
  }
  const user = mapUser(row);
  await createAuditLog({ user, action: 'USER_LOGIN', resourceType: 'auth', resourceId: user.id, req });
  res.json({ token: signToken(user), user });
}

export async function requestPasswordReset(req, res) {
  requireFields(req.body, ['email']);
  const row = await findUserByEmail(String(req.body.email).trim().toLowerCase());
  if (row) {
    const user = mapUser(row);
    await createAuditLog({ user, action: 'PASSWORD_RESET_REQUESTED', resourceType: 'auth', resourceId: user.id, req });
  }
  res.json({ success: true, message: 'If an account with this email exists, password reset instructions will be sent.' });
}

export function currentUser(req, res) {
  res.json({ user: req.user });
}

export function logout(_req, res) {
  res.status(204).end();
}

export async function listUsers(_req, res) {
  const rows = await getAllUsers();
  res.json(rows.map(mapUser));
}

