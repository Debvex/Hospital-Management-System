import { HttpError, requireFields } from '../lib/errors.js';
import { createMedicalRecord, listMedicalRecords } from '../models/medicalRecordModel.js';

export async function list(req, res) {
  if (!['administrator', 'doctor', 'patient'].includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'You cannot view clinical records.');
  }
  res.json(await listMedicalRecords({ user: req.user, patientId: req.query.patientId }));
}

export async function create(req, res) {
  const body = req.body || {};
  requireFields(body, ['appointmentId', 'patientId', 'doctorId', 'symptoms', 'diagnosis', 'consultationNotes']);
  if (body.doctorId !== req.user.doctorId) throw new HttpError(403, 'FORBIDDEN', 'Doctors may only write their own consultation records.');
  try {
    const record = await createMedicalRecord({ body, user: req.user, req });
    if (!record) throw new HttpError(404, 'APPOINTMENT_NOT_FOUND', 'Assigned appointment not found.');
    res.status(201).json(record);
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'RECORD_EXISTS', 'A medical record already exists for this appointment.');
    throw error;
  }
}

