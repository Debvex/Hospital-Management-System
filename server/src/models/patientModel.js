import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { mapPatient } from './mappers.js';

export async function listPatients({ user, search }) {
  const params = [];
  let query = 'SELECT * FROM patients';
  if (user.role === 'patient') {
    if (!user.patientId) return [];
    params.push(user.patientId);
    query += ' WHERE id = $1';
  } else if (user.role === 'doctor') {
    if (!user.doctorId) return [];
    params.push(user.doctorId);
    query += ' WHERE id IN (SELECT patient_id FROM appointments WHERE doctor_id = $1)';
  }
  if (search) {
    params.push(`%${search}%`);
    query += `${params.length === 1 ? ' WHERE' : ' AND'} (full_name ILIKE $${params.length} OR mrn ILIKE $${params.length} OR contact_number ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }
  const result = await pool.query(`${query} ORDER BY created_at DESC`, params);
  return result.rows.map(mapPatient);
}

export async function findPatientById(id) {
  const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
  return result.rows[0] ? mapPatient(result.rows[0]) : null;
}

export async function createPatient(body) {
  const seq = await pool.query("SELECT nextval('patient_mrn_sequence') AS seq");
  const mrn = `MRN-${new Date().getFullYear()}-${String(seq.rows[0].seq).padStart(3, '0')}`;
  const result = await pool.query(
    `INSERT INTO patients (
      id, mrn, full_name, date_of_birth, gender, blood_group, contact_number, email, address,
      emergency_contact, allergies, medical_history_summary
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12) RETURNING *`,
    [randomUUID(), mrn, String(body.fullName).trim(), body.dateOfBirth, body.gender, body.bloodGroup,
      String(body.contactNumber).trim(), String(body.email || '').trim().toLowerCase(), body.address || '',
      JSON.stringify(body.emergencyContact || {}), Array.isArray(body.allergies) ? body.allergies : [],
      body.medicalHistorySummary || ''],
  );
  return mapPatient(result.rows[0]);
}

export async function updatePatientProfile(id, fields) {
  const result = await pool.query(
    `UPDATE patients SET
      contact_number = COALESCE($1, contact_number),
      address = COALESCE($2, address),
      emergency_contact = COALESCE($3::jsonb, emergency_contact),
      updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [fields.contactNumber ?? null, fields.address ?? null,
      fields.emergencyContact ? JSON.stringify(fields.emergencyContact) : null, id],
  );
  return result.rows[0] ? mapPatient(result.rows[0]) : null;
}

export async function doctorCanViewPatient(doctorId, patientId) {
  const result = await pool.query(
    'SELECT 1 FROM appointments WHERE doctor_id = $1 AND patient_id = $2 LIMIT 1',
    [doctorId, patientId],
  );
  return result.rowCount > 0;
}