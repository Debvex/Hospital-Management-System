export const userSelect = `
  SELECT u.*, p.id AS patient_id, d.id AS doctor_id
  FROM users u
  LEFT JOIN patients p ON p.user_id = u.id
  LEFT JOIN doctors d ON d.user_id = u.id`;

export const appointmentSelect = `
  SELECT a.*, p.full_name AS patient_name, p.mrn AS patient_mrn,
    d.full_name AS doctor_name, dep.name AS department_name
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN doctors d ON d.id = a.doctor_id
  JOIN departments dep ON dep.id = d.department_id`;

export const recordSelect = `
  SELECT r.*, p.full_name AS patient_name, d.full_name AS doctor_name, d.specialization
  FROM medical_records r
  JOIN patients p ON p.id = r.patient_id
  JOIN doctors d ON d.id = r.doctor_id`;

export const invoiceSelect = `
  SELECT i.*, p.full_name AS patient_name,
    (SELECT d.full_name FROM appointments a JOIN doctors d ON d.id = a.doctor_id WHERE a.id = i.appointment_id) AS doctor_name
  FROM invoices i JOIN patients p ON p.id = i.patient_id`;

const dateString = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10);

export function mapUser(row) {
  return {
    id: row.id, email: row.email, role: row.role, fullName: row.full_name,
    isActive: row.is_active, createdAt: row.created_at, updatedAt: row.updated_at,
    ...(row.patient_id ? { patientId: row.patient_id } : {}),
    ...(row.doctor_id ? { doctorId: row.doctor_id } : {}),
  };
}

export function mapPatient(row) {
  return {
    id: row.id, ...(row.user_id ? { userId: row.user_id } : {}), mrn: row.mrn,
    fullName: row.full_name, dateOfBirth: dateString(row.date_of_birth), gender: row.gender,
    bloodGroup: row.blood_group, contactNumber: row.contact_number, email: row.email,
    address: row.address, emergencyContact: row.emergency_contact || {}, allergies: row.allergies || [],
    medicalHistorySummary: row.medical_history_summary, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapDoctor(row) {
  return {
    id: row.id, userId: row.user_id, fullName: row.full_name, email: row.email,
    departmentId: row.department_id, departmentName: row.department_name,
    specialization: row.specialization, qualification: row.qualification,
    experienceYears: row.experience_years, consultationFee: Number(row.consultation_fee || 0),
    roomNumber: row.room_number, contactNumber: row.contact_number, avatarColor: row.avatar_color,
    availability: row.availability || [], isActive: row.is_active,
  };
}

export function mapAppointment(row) {
  return {
    id: row.id, patientId: row.patient_id, patientName: row.patient_name, patientMrn: row.patient_mrn,
    doctorId: row.doctor_id, doctorName: row.doctor_name, departmentName: row.department_name,
    appointmentDate: dateString(row.appointment_date), startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5), status: row.status, reason: row.reason, type: row.type,
    createdByRole: row.created_by_role, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapRecord(row) {
  return {
    id: row.id, appointmentId: row.appointment_id, patientId: row.patient_id,
    patientName: row.patient_name, doctorId: row.doctor_id, doctorName: row.doctor_name,
    doctorSpecialization: row.specialization, recordDate: dateString(row.record_date),
    vitals: row.vitals || undefined, symptoms: row.symptoms, diagnosis: row.diagnosis,
    consultationNotes: row.consultation_notes, prescriptions: row.prescriptions || [],
    followUpDate: row.follow_up_date ? dateString(row.follow_up_date) : undefined, createdAt: row.created_at,
  };
}

export function mapInvoice(row) {
  return {
    id: row.id, invoiceNumber: row.invoice_number,
    ...(row.appointment_id ? { appointmentId: row.appointment_id } : {}),
    patientId: row.patient_id, patientName: row.patient_name,
    ...(row.doctor_name ? { doctorName: row.doctor_name } : {}),
    subtotal: Number(row.subtotal || 0), additionalCharges: Number(row.additional_charges || 0),
    discount: Number(row.discount || 0), totalAmount: Number(row.total_amount || 0),
    paymentStatus: row.payment_status, ...(row.payment_method ? { paymentMethod: row.payment_method } : {}),
    ...(row.paid_at ? { paidAt: row.paid_at } : {}), dueDate: dateString(row.due_date),
    items: row.items || [], createdAt: row.created_at,
  };
}

export function mapAuditLog(row) {
  return {
    id: row.id, actorUserId: row.actor_user_id || 'system', actorName: row.actor_name,
    actorRole: row.actor_role, action: row.action, resourceType: row.resource_type,
    resourceId: row.resource_id, metadataJson: row.metadata_json || {}, ipAddress: row.ip_address,
    createdAt: row.created_at,
  };
}