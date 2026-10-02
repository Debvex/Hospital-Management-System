import { HttpError, requireFields, validDate } from '../lib/errors.js';
import { createAuditLog } from '../models/auditModel.js';
import { createAppointment, findAppointmentRow, listAppointments, updateAppointmentStatus } from '../models/appointmentModel.js';

const statuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
const types = ['consultation', 'follow_up', 'emergency', 'routine_checkup'];

export async function list(req, res) {
  if (!['administrator', 'receptionist', 'doctor', 'patient'].includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'You cannot view appointments.');
  }
  res.json(await listAppointments({ user: req.user, filters: req.query }));
}

export async function create(req, res) {
  const body = req.body || {};
  requireFields(body, ['patientId', 'doctorId', 'appointmentDate', 'startTime', 'reason', 'type']);
  if (!['administrator', 'receptionist', 'patient'].includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'Only patients and authorized staff can book appointments.');
  }
  if (!validDate(body.appointmentDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.startTime) || !types.includes(body.type)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Appointment date, time, or type is invalid.');
  }
  if (req.user.role === 'patient' && body.patientId !== req.user.patientId) {
    throw new HttpError(403, 'FORBIDDEN', 'Patients may only book appointments for themselves.');
  }
  try {
    const appointment = await createAppointment(body, req.user.role);
    await createAuditLog({ user: req.user, action: 'CREATE_APPOINTMENT', resourceType: 'appointment', resourceId: appointment.id,
      metadata: { doctor: appointment.doctorName, patient: appointment.patientName, date: appointment.appointmentDate, slot: appointment.startTime }, req });
    res.status(201).json(appointment);
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'APPOINTMENT_SLOT_UNAVAILABLE',
        `The selected appointment slot (${body.startTime} on ${body.appointmentDate}) is no longer available with this doctor.`,
        { doctorId: body.doctorId });
    }
    if (error.code === '23503') throw new HttpError(400, 'INVALID_RELATION', 'Patient or doctor not found.');
    throw error;
  }
}

export async function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!statuses.includes(status)) throw new HttpError(400, 'VALIDATION_ERROR', 'Appointment status is invalid.');
  const appointment = await findAppointmentRow(req.params.appointmentId);
  if (!appointment) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');
  const isPatientOwner = req.user.role === 'patient' && appointment.patient_id === req.user.patientId;
  const isStaff = ['administrator', 'receptionist'].includes(req.user.role);
  const permitted = isStaff || (isPatientOwner && status === 'cancelled');
  if (!permitted) throw new HttpError(403, 'FORBIDDEN', 'You cannot change this appointment status.');
  const updated = await updateAppointmentStatus(req.params.appointmentId, status);
  await createAuditLog({ user: req.user, action: 'UPDATE_APPOINTMENT_STATUS', resourceType: 'appointment', resourceId: updated.id, metadata: { newStatus: status }, req });
  res.json(updated);
}

export async function cancel(req, res) {
  req.body = { status: 'cancelled' };
  return updateStatus(req, res);
}