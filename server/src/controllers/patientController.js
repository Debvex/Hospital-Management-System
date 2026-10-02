import { HttpError, requireFields, validDate } from '../lib/errors.js';
import { createAuditLog } from '../models/auditModel.js';
import { createPatient, doctorCanViewPatient, findPatientById, listPatients, updatePatientProfile } from '../models/patientModel.js';

const staffRoles = ['administrator', 'doctor', 'receptionist'];
const genders = ['male', 'female', 'other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function redactClinicalFields(patient) {
  const { allergies: _allergies, medicalHistorySummary: _history, ...profile } = patient;
  return profile;
}

export async function list(req, res) {
  if (req.user.role !== 'patient' && !staffRoles.includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'You cannot view patient profiles.');
  }
  if (req.user.role === 'doctor' && !req.user.doctorId) return res.json([]);
  const patients = await listPatients({ user: req.user, search: String(req.query.search || '').trim() });
  res.json(req.user.role === 'receptionist' ? patients.map(redactClinicalFields) : patients);
}

export async function getById(req, res) {
  if (req.user.role === 'patient' && req.user.patientId !== req.params.patientId) {
    throw new HttpError(404, 'NOT_FOUND', 'Patient not found.');
  }
  if (req.user.role === 'doctor' && !(await doctorCanViewPatient(req.user.doctorId, req.params.patientId))) {
    throw new HttpError(404, 'NOT_FOUND', 'Patient not found.');
  }
  if (req.user.role !== 'patient' && !staffRoles.includes(req.user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'You cannot view patient profiles.');
  }
  const patient = await findPatientById(req.params.patientId);
  if (!patient) throw new HttpError(404, 'NOT_FOUND', 'Patient not found.');
  res.json(req.user.role === 'receptionist' ? redactClinicalFields(patient) : patient);
}

export async function create(req, res) {
  const body = req.body || {};
  requireFields(body, ['fullName', 'dateOfBirth', 'gender', 'bloodGroup', 'contactNumber']);
  if (!validDate(body.dateOfBirth) || !genders.includes(body.gender) || !bloodGroups.includes(body.bloodGroup)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Patient details contain an invalid date, gender, or blood group.');
  }
  const patient = await createPatient(body);
  await createAuditLog({ user: req.user, action: 'REGISTER_PATIENT', resourceType: 'patient', resourceId: patient.id, metadata: { mrn: patient.mrn }, req });
  res.status(201).json(patient);
}

export async function update(req, res) {
  const isOwner = req.user.role === 'patient' && req.user.patientId === req.params.patientId;
  if (!isOwner && req.user.role !== 'administrator') {
    throw new HttpError(403, 'FORBIDDEN', 'Only the patient or an administrator can update this profile.');
  }
  const body = req.body || {};
  const fields = {};
  if (body.contactNumber !== undefined) {
    if (typeof body.contactNumber !== 'string' || body.contactNumber.trim().length < 7) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Contact number is invalid.');
    }
    fields.contactNumber = body.contactNumber.trim();
  }
  if (body.address !== undefined) fields.address = String(body.address).trim();
  if (body.emergencyContact !== undefined) {
    if (!body.emergencyContact || typeof body.emergencyContact !== 'object' || Array.isArray(body.emergencyContact)) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Emergency contact details are invalid.');
    }
    fields.emergencyContact = body.emergencyContact;
  }
  if (!Object.keys(fields).length) throw new HttpError(400, 'VALIDATION_ERROR', 'Provide at least one editable profile field.');
  const patient = await updatePatientProfile(req.params.patientId, fields);
  if (!patient) throw new HttpError(404, 'NOT_FOUND', 'Patient not found.');
  await createAuditLog({ user: req.user, action: 'UPDATE_PATIENT_PROFILE', resourceType: 'patient', resourceId: patient.id, req });
  res.json(patient);
}

