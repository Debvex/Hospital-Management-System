import { pool } from '../db/client.js';
import { userSelect } from './mappers.js';

export async function findUserByEmail(email) {
  const result = await pool.query(`${userSelect} WHERE LOWER(u.email) = LOWER($1)`, [email]);
  return result.rows[0];
}

export async function listUsers() {
  const result = await pool.query(`${userSelect} ORDER BY u.created_at DESC`);
  return result.rows;
}

export async function registerPatientAccount({ userId, patientId, email, passwordHash, fullName, body, client }) {
  const createdUser = await client.query(
    `INSERT INTO users (id, email, password_hash, role, full_name)
     VALUES ($1, $2, $3, 'patient', $4) RETURNING *`,
    [userId, email, passwordHash, fullName],
  );
  const mrnSeq = await client.query("SELECT nextval('patient_mrn_sequence') AS seq");
  const mrn = `MRN-${new Date().getFullYear()}-${String(mrnSeq.rows[0].seq).padStart(3, '0')}`;
  const patient = await client.query(
    `INSERT INTO patients (
      id, user_id, mrn, full_name, date_of_birth, gender, blood_group, contact_number,
      email, address, emergency_contact, allergies, medical_history_summary
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, '{}', '') RETURNING *`,
    [patientId, userId, mrn, fullName, body.dateOfBirth || '1995-01-01',
      ['male', 'female', 'other'].includes(body.gender) ? body.gender : 'other',
      ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(body.bloodGroup) ? body.bloodGroup : 'O+',
      String(body.contactNumber).trim(), email, 'Self-registered Online Portal Patient',
      JSON.stringify({ name: 'Primary Contact', relationship: 'Self/Family', phone: String(body.contactNumber).trim() })],
  );
  return { user: { ...createdUser.rows[0], patient_id: patientId }, patient: patient.rows[0] };
}

export async function setUserActive(id, isActive) {
  const result = await pool.query(
    `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, full_name, is_active, created_at, updated_at`,
    [isActive, id],
  );
  return result.rows[0] || null;
}

export async function countActiveAdministrators() {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'administrator' AND is_active = TRUE");
  return result.rows[0].count;
}