import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { createAuditLog } from './auditModel.js';
import { mapRecord, recordSelect } from './mappers.js';

export async function listMedicalRecords({ user, patientId }) {
  const params = [];
  let where = '';
  if (user.role === 'patient') {
    if (!user.patientId) return [];
    params.push(user.patientId);
    where = ' WHERE r.patient_id = $1';
  } else if (user.role === 'doctor') {
    params.push(user.doctorId);
    where = ' WHERE r.doctor_id = $1';
  }
  if (patientId && user.role !== 'patient') {
    params.push(patientId);
    where += `${where ? ' AND' : ' WHERE'} r.patient_id = $${params.length}`;
  }
  const result = await pool.query(`${recordSelect}${where} ORDER BY r.record_date DESC`, params);
  return result.rows.map(mapRecord);
}

export async function createMedicalRecord({ body, user, req }) {
  const client = await pool.connect();
  const id = randomUUID();
  try {
    await client.query('BEGIN');
    const appointment = await client.query(
      'SELECT * FROM appointments WHERE id = $1 AND patient_id = $2 AND doctor_id = $3 FOR UPDATE',
      [body.appointmentId, body.patientId, user.doctorId],
    );
    if (!appointment.rowCount) {
      await client.query('ROLLBACK');
      return null;
    }
    const record = await client.query(
      `INSERT INTO medical_records (
        id, appointment_id, patient_id, doctor_id, record_date, vitals, symptoms, diagnosis,
        consultation_notes, prescriptions, follow_up_date
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5::jsonb, $6, $7, $8, $9::jsonb, $10) RETURNING *`,
      [id, body.appointmentId, body.patientId, user.doctorId, JSON.stringify(body.vitals || null),
        String(body.symptoms).trim(), String(body.diagnosis).trim(), String(body.consultationNotes).trim(),
        JSON.stringify(Array.isArray(body.prescriptions) ? body.prescriptions.map((item) => ({ ...item, id: item.id || randomUUID() })) : []),
        body.followUpDate || null],
    );
    await client.query("UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = $1", [body.appointmentId]);
    await createAuditLog({ user, action: 'CREATE_CLINICAL_RECORD', resourceType: 'medical_record', resourceId: id,
      metadata: { patientId: body.patientId, prescriptionsCount: Array.isArray(body.prescriptions) ? body.prescriptions.length : 0 }, req, client });
    await client.query('COMMIT');
    const result = await pool.query(`${recordSelect} WHERE r.id = $1`, [record.rows[0].id]);
    return mapRecord(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}