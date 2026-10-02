import { randomUUID } from 'node:crypto';
import { pool } from '../db/client.js';
import { HttpError } from '../lib/errors.js';
import { appointmentSelect, mapAppointment } from './mappers.js';

export async function listAppointments({ user, filters }) {
  const conditions = [];
  const params = [];
  if (user.role === 'patient') {
    if (!user.patientId) return [];
    params.push(user.patientId);
    conditions.push(`a.patient_id = $${params.length}`);
  } else if (user.role === 'doctor') {
    if (!user.doctorId) return [];
    params.push(user.doctorId);
    conditions.push(`a.doctor_id = $${params.length}`);
  }
  for (const [key, column] of [['patientId', 'a.patient_id'], ['doctorId', 'a.doctor_id'], ['status', 'a.status'], ['date', 'a.appointment_date']]) {
    if (filters[key]) {
      params.push(filters[key]);
      conditions.push(`${column} = $${params.length}`);
    }
  }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(`${appointmentSelect}${where} ORDER BY a.appointment_date, a.start_time`, params);
  return result.rows.map(mapAppointment);
}

export async function findAppointmentRow(id) {
  const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createAppointment(body, role) {
  const doctor = await pool.query(
    `SELECT d.id FROM doctors d
     JOIN users u ON u.id = d.user_id
     JOIN departments dep ON dep.id = d.department_id
     WHERE d.id = $1 AND d.is_active AND u.is_active AND dep.is_active`,
    [body.doctorId],
  );
  if (!doctor.rowCount) throw new HttpError(400, 'INVALID_RELATION', 'Doctor is not active or available.');
  const id = randomUUID();
  const endMinutes = Number(body.startTime.slice(0, 2)) * 60 + Number(body.startTime.slice(3)) + 30;
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
  await pool.query(
    `INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, start_time, end_time, status, reason, type, created_by_role)
     VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, $9)`,
    [id, body.patientId, body.doctorId, body.appointmentDate, body.startTime, endTime,
      String(body.reason).trim(), body.type, role],
  );
  const result = await pool.query(`${appointmentSelect} WHERE a.id = $1`, [id]);
  return mapAppointment(result.rows[0]);
}

export async function updateAppointmentStatus(id, status) {
  const result = await pool.query(
    'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id', [status, id],
  );
  if (!result.rowCount) return null;
  const appointment = await pool.query(`${appointmentSelect} WHERE a.id = $1`, [id]);
  return mapAppointment(appointment.rows[0]);
}