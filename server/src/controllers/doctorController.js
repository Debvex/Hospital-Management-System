import { HttpError } from '../lib/errors.js';
import { findDoctorById, listDoctors } from '../models/doctorModel.js';

export async function list(req, res) {
  if (!['administrator', 'receptionist', 'patient'].includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'This role cannot browse the doctor directory.');
  }
  res.json(await listDoctors(req.query.departmentId));
}

export async function getById(req, res) {
  if (!['administrator', 'receptionist', 'patient'].includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'This role cannot browse the doctor directory.');
  }
  const doctor = await findDoctorById(req.params.doctorId);
  if (!doctor) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  res.json(doctor);
}