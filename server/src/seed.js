import 'dotenv/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, initializeDatabase } from './db/client.js';
import { hashPassword } from './lib/security.js';

const demoPassword = 'Password@123';

const departments = [
  ['dept-1', 'Cardiology', 'CARD', 'Heart and vascular care', 'Dr. Sarah Jenkins', 'Floor 3 - Wing A'],
  ['dept-2', 'Neurology', 'NEUR', 'Neurological care', 'Dr. Michael Chen', 'Floor 4 - Wing B'],
  ['dept-3', 'Pediatrics', 'PEDI', 'Child wellness care', 'Dr. Amara Patel', 'Floor 1 - Wing C'],
  ['dept-4', 'Orthopedics', 'ORTH', 'Bone and joint care', 'Dr. Robert Alverez', 'Floor 2 - Wing A'],
  ['dept-5', 'General Medicine', 'GMED', 'Primary and internal medicine', "Dr. Linda O'Connor", 'Ground Floor - OPD'],
  ['dept-6', 'Dermatology', 'DERM', 'Skin and dermatological care', 'Unassigned', 'Floor 2 - Wing B'],
];

const users = [
  ['user-admin', 'administrator@example.test', 'administrator', 'Dr. Evelyn Vance, MD'],
  ['user-doc-1', 'doctor@example.test', 'doctor', 'Dr. Sarah Jenkins'],
  ['user-recep', 'receptionist@example.test', 'receptionist', 'Marcus Sterling'],
  ['user-pat-1', 'patient@example.test', 'patient', 'Eleanor Bennett'],
  ['user-doc-2', 'm.chen@hospital.test', 'doctor', 'Dr. Michael Chen'],
  ['user-doc-3', 'a.patel@hospital.test', 'doctor', 'Dr. Amara Patel'],
  ['user-doc-4', 'r.alverez@hospital.test', 'doctor', 'Dr. Robert Alverez'],
  ['user-doc-5', 'l.oconnor@hospital.test', 'doctor', "Dr. Linda O'Connor"],
];

const doctors = [
  {
    id: 'doc-1', userId: 'user-doc-1', departmentId: 'dept-1', fullName: 'Dr. Sarah Jenkins',
    email: 'doctor@example.test', specialization: 'Interventional Cardiology & Preventive Care',
    qualification: 'MD, FACC, Harvard Medical School', experienceYears: 14, consultationFee: 150,
    roomNumber: 'Room 304 - Wing A', contactNumber: '+1 (555) 234-5678', avatarColor: 'blue',
    availability: [
      { id: 'av-1', doctorId: 'doc-1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-2', doctorId: 'doc-1', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-3', doctorId: 'doc-1', dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '17:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-4', doctorId: 'doc-1', dayOfWeek: 'Friday', startTime: '09:00', endTime: '12:00', slotDurationMinutes: 30, isActive: true },
    ],
  },
  {
    id: 'doc-2', userId: 'user-doc-2', departmentId: 'dept-2', fullName: 'Dr. Michael Chen',
    email: 'm.chen@hospital.test', specialization: 'Cognitive Disorders & Neuro-Oncology',
    qualification: 'MD, PhD, Johns Hopkins Medicine', experienceYears: 11, consultationFee: 180,
    roomNumber: 'Room 412 - Wing B', contactNumber: '+1 (555) 345-6789', avatarColor: 'purple',
    availability: [
      { id: 'av-5', doctorId: 'doc-2', dayOfWeek: 'Monday', startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-6', doctorId: 'doc-2', dayOfWeek: 'Thursday', startTime: '10:00', endTime: '15:00', slotDurationMinutes: 30, isActive: true },
    ],
  },
  {
    id: 'doc-3', userId: 'user-doc-3', departmentId: 'dept-3', fullName: 'Dr. Amara Patel',
    email: 'a.patel@hospital.test', specialization: 'Neonatal & Child Wellness Care',
    qualification: 'MD, FAAP, Stanford University', experienceYears: 9, consultationFee: 120,
    roomNumber: 'Room 108 - Wing C', contactNumber: '+1 (555) 456-7890', avatarColor: 'yellow',
    availability: [
      { id: 'av-7', doctorId: 'doc-3', dayOfWeek: 'Monday', startTime: '09:00', endTime: '15:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-8', doctorId: 'doc-3', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '14:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-9', doctorId: 'doc-3', dayOfWeek: 'Friday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isActive: true },
    ],
  },
  {
    id: 'doc-4', userId: 'user-doc-4', departmentId: 'dept-4', fullName: 'Dr. Robert Alverez',
    email: 'r.alverez@hospital.test', specialization: 'Joint Reconstruction & Sports Medicine',
    qualification: 'MS Ortho, Mayo Clinic College', experienceYears: 16, consultationFee: 160,
    roomNumber: 'Room 214 - Wing A', contactNumber: '+1 (555) 567-8901', avatarColor: 'teal',
    availability: [
      { id: 'av-10', doctorId: 'doc-4', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '14:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-11', doctorId: 'doc-4', dayOfWeek: 'Thursday', startTime: '13:00', endTime: '17:00', slotDurationMinutes: 30, isActive: true },
    ],
  },
  {
    id: 'doc-5', userId: 'user-doc-5', departmentId: 'dept-5', fullName: "Dr. Linda O'Connor",
    email: 'l.oconnor@hospital.test', specialization: 'Internal Medicine & Chronic Disease Management',
    qualification: 'MD, University of Pennsylvania', experienceYears: 18, consultationFee: 100,
    roomNumber: 'OPD Desk 3', contactNumber: '+1 (555) 678-9012', avatarColor: 'green',
    availability: [
      { id: 'av-12', doctorId: 'doc-5', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-13', doctorId: 'doc-5', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isActive: true },
      { id: 'av-14', doctorId: 'doc-5', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, isActive: true },
    ],
  },
];

const patients = [
  {
    id: 'pat-1', userId: 'user-pat-1', mrn: 'MRN-2026-001', fullName: 'Eleanor Bennett', dateOfBirth: '1988-04-14',
    gender: 'female', bloodGroup: 'O+', contactNumber: '+1 (555) 912-3456', email: 'patient@example.test',
    address: '742 Evergreen Terrace, Springfield', emergencyContact: { name: 'Thomas Bennett', relationship: 'Spouse', phone: '+1 (555) 912-3499' },
    allergies: ['Penicillin', 'Sulfa drugs'], medicalHistorySummary: 'Hypertension diagnosed 2021, controlled via lifestyle and ACE inhibitors.',
  },
  {
    id: 'pat-2', mrn: 'MRN-2026-002', fullName: 'James Alexander Davis', dateOfBirth: '1975-11-23',
    gender: 'male', bloodGroup: 'A+', contactNumber: '+1 (555) 834-1290', email: 'j.davis@consumer.test',
    address: '104 Oakridge Crescent, Metro City', emergencyContact: { name: 'Claire Davis', relationship: 'Sister', phone: '+1 (555) 834-1291' },
    allergies: ['Aspirin'], medicalHistorySummary: 'Type 2 Diabetes mellitus, mild lumbar disc degeneration.',
  },
  {
    id: 'pat-3', mrn: 'MRN-2026-003', fullName: 'Sophia Maria Ramirez', dateOfBirth: '2001-08-05',
    gender: 'female', bloodGroup: 'B-', contactNumber: '+1 (555) 723-8841', email: 'sophia.ramirez@consumer.test',
    address: '512 Harbor Boulevard, Metro City', emergencyContact: { name: 'Carlos Ramirez', relationship: 'Father', phone: '+1 (555) 723-8800' },
    allergies: [], medicalHistorySummary: 'Seasonal allergic rhinitis, no chronic pathologies.',
  },
  {
    id: 'pat-4', mrn: 'MRN-2026-004', fullName: 'William Harrison Vance', dateOfBirth: '1962-02-17',
    gender: 'male', bloodGroup: 'AB+', contactNumber: '+1 (555) 645-3129', email: 'w.vance@consumer.test',
    address: '88 Meadowbrook Lane, Springfield', emergencyContact: { name: 'Martha Vance', relationship: 'Spouse', phone: '+1 (555) 645-3100' },
    allergies: ['Codeine'], medicalHistorySummary: 'Post-CABG surgery in 2022, routine cardiology follow-up.',
  },
];

async function clearDemoData(client) {
  await client.query('DELETE FROM audit_logs');
  await client.query('DELETE FROM registration_requests');
  await client.query('DELETE FROM invoices');
  await client.query('DELETE FROM medical_records');
  await client.query('DELETE FROM appointments');
  await client.query('DELETE FROM doctors');
  await client.query('DELETE FROM patients');
  await client.query('DELETE FROM users');
  await client.query('DELETE FROM departments');
  await client.query("ALTER SEQUENCE patient_mrn_sequence RESTART WITH 5");
  await client.query("ALTER SEQUENCE invoice_number_sequence RESTART WITH 105");
}

export async function seedDatabase({ reset = false } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT COUNT(*)::int AS count FROM users');
    if (existing.rows[0].count > 0 && !reset) {
      await client.query('COMMIT');
      return false;
    }
    if (reset) await clearDemoData(client);

    for (const [id, name, code, description, head, floor] of departments) {
      await client.query(
        `INSERT INTO departments (id, name, code, description, head_of_department, room_floor)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, name, code, description, head, floor],
      );
    }

    const passwordHash = await hashPassword(demoPassword);
    for (const [id, email, role, fullName] of users) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, full_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, email, passwordHash, role, fullName],
      );
    }

    for (const doctor of doctors) {
      await client.query(
        `INSERT INTO doctors (
          id, user_id, department_id, full_name, email, specialization, qualification,
          experience_years, consultation_fee, room_number, contact_number, avatar_color, availability
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)`,
        [doctor.id, doctor.userId, doctor.departmentId, doctor.fullName, doctor.email,
          doctor.specialization, doctor.qualification, doctor.experienceYears, doctor.consultationFee,
          doctor.roomNumber, doctor.contactNumber, doctor.avatarColor, JSON.stringify(doctor.availability)],
      );
    }

    for (const patient of patients) {
      await client.query(
        `INSERT INTO patients (
          id, user_id, mrn, full_name, date_of_birth, gender, blood_group, contact_number,
          email, address, emergency_contact, allergies, medical_history_summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13)`,
        [patient.id, patient.userId || null, patient.mrn, patient.fullName, patient.dateOfBirth,
          patient.gender, patient.bloodGroup, patient.contactNumber, patient.email, patient.address,
          JSON.stringify(patient.emergencyContact), patient.allergies, patient.medicalHistorySummary],
      );
    }

    const appointmentRows = [
      ['apt-101', 'pat-1', 'doc-1', 'CURRENT_DATE', '09:30', '10:00', 'scheduled', 'Quarterly cardiovascular review and blood pressure assessment', 'consultation', 'patient'],
      ['apt-102', 'pat-2', 'doc-4', 'CURRENT_DATE', '10:30', '11:00', 'scheduled', 'Follow-up on lower back physiotherapy regimen', 'follow_up', 'receptionist'],
      ['apt-103', 'pat-3', 'doc-5', 'CURRENT_DATE', '11:00', '11:30', 'scheduled', 'Persistent fatigue, sore throat and seasonal allergies', 'consultation', 'receptionist'],
      ['apt-104', 'pat-4', 'doc-1', "'2026-09-18'::date", '11:30', '12:00', 'completed', 'Post-CABG stress ECG interpretation and statin check', 'routine_checkup', 'administrator'],
      ['apt-105', 'pat-1', 'doc-2', "'2026-09-15'::date", '14:00', '14:30', 'completed', 'Occasional vestibular dizziness and migraine prophylaxis review', 'consultation', 'patient'],
    ];
    for (const [id, patientId, doctorId, dateSql, start, end, status, reason, type, createdByRole] of appointmentRows) {
      await client.query(
        `INSERT INTO appointments (
          id, patient_id, doctor_id, appointment_date, start_time, end_time, status, reason, type, created_by_role
        ) VALUES ($1, $2, $3, ${dateSql}, $4, $5, $6, $7, $8, $9)`,
        [id, patientId, doctorId, start, end, status, reason, type, createdByRole],
      );
    }

    const recordSeeds = [
      {
        id: 'rec-201', appointmentId: 'apt-104', patientId: 'pat-4', doctorId: 'doc-1', date: '2026-09-18',
        vitals: { bloodPressure: '124/78 mmHg', heartRate: 68, temperature: 36.7, weightKg: 82.5, oxygenSaturation: 99 },
        symptoms: 'Reports good exercise tolerance walking 45 mins daily without chest discomfort or shortness of breath.',
        diagnosis: 'Stable ischemic heart disease status-post coronary artery bypass grafting; well-controlled dyslipidemia.',
        notes: 'Stress ECG shows no signs of inducible myocardial ischemia. Lipid panel demonstrates LDL cholesterol at 64 mg/dL. Continue current medical regimen and regular cardiac exercise.',
        prescriptions: [
          { id: 'rx-1', medicineName: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime', duration: '90 days', instructions: 'Take with or without food' },
          { id: 'rx-2', medicineName: 'Metoprolol Succinate ER', dosage: '50mg', frequency: 'Once daily in the morning', duration: '90 days', instructions: 'Do not crush or chew' },
          { id: 'rx-3', medicineName: 'Aspirin (Enteric-coated)', dosage: '81mg', frequency: 'Once daily with meals', duration: '90 days', instructions: 'Cardioprotective low dose' },
        ], followUpDate: '2026-12-18',
      },
      {
        id: 'rec-202', appointmentId: 'apt-105', patientId: 'pat-1', doctorId: 'doc-2', date: '2026-09-15',
        vitals: { bloodPressure: '118/74 mmHg', heartRate: 72, temperature: 36.6, weightKg: 64, oxygenSaturation: 98 },
        symptoms: 'Episodic pulsating unilateral headache with photophobia approximately 2 times monthly.',
        diagnosis: 'Common migraine without aura (ICD-10 G43.009).',
        notes: 'Cranial nerve exam normal. No focal motor or sensory deficits. Recommend hydration, sleep hygiene, and trial of Sumatriptan at acute onset.',
        prescriptions: [
          { id: 'rx-4', medicineName: 'Sumatriptan Tablets', dosage: '50mg', frequency: 'As needed at migraine onset', duration: '10 doses', instructions: 'May repeat once after 2 hours if required' },
          { id: 'rx-5', medicineName: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Nightly', duration: '60 days', instructions: 'Nutritional prophylaxis support' },
        ], followUpDate: '2026-11-15',
      },
    ];
    for (const record of recordSeeds) {
      await client.query(
        `INSERT INTO medical_records (
          id, appointment_id, patient_id, doctor_id, record_date, vitals, symptoms, diagnosis,
          consultation_notes, prescriptions, follow_up_date
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10::jsonb, $11)`,
        [record.id, record.appointmentId, record.patientId, record.doctorId, record.date,
          JSON.stringify(record.vitals), record.symptoms, record.diagnosis, record.notes,
          JSON.stringify(record.prescriptions), record.followUpDate],
      );
    }

    const invoiceSeeds = [
      { id: 'inv-301', number: 'INV-2026-101', appointmentId: 'apt-104', patientId: 'pat-4', subtotal: 150, extra: 75, discount: 0, total: 225, status: 'paid', method: 'credit_card', paidAt: '2026-09-18T12:20:00Z', due: '2026-09-18', doctor: 'Dr. Sarah Jenkins', items: [['item-1', 'Cardiology Specialist Consultation', 1, 150], ['item-2', '12-Lead Diagnostic Stress Electrocardiogram (ECG)', 1, 75]] },
      { id: 'inv-302', number: 'INV-2026-102', appointmentId: 'apt-105', patientId: 'pat-1', subtotal: 180, extra: 0, discount: 18, total: 162, status: 'paid', method: 'upi', paidAt: '2026-09-15T14:45:00Z', due: '2026-09-15', doctor: 'Dr. Michael Chen', items: [['item-3', 'Neurology Consultation & Diagnostic Evaluation', 1, 180]] },
      { id: 'inv-303', number: 'INV-2026-103', appointmentId: 'apt-101', patientId: 'pat-1', subtotal: 150, extra: 35, discount: 0, total: 185, status: 'unpaid', method: null, paidAt: null, due: '2026-10-08', doctor: 'Dr. Sarah Jenkins', items: [['item-4', 'Consultation Fee - Cardiology', 1, 150], ['item-5', 'Routine BP & Metabolic Panel Fee', 1, 35]] },
      { id: 'inv-304', number: 'INV-2026-104', appointmentId: 'apt-102', patientId: 'pat-2', subtotal: 160, extra: 40, discount: 0, total: 200, status: 'unpaid', method: null, paidAt: null, due: '2026-10-06', doctor: 'Dr. Robert Alverez', items: [['item-6', 'Orthopedics Rehabilitation Review', 1, 160], ['item-7', 'Lumbar Spine Biomechanical Assessment', 1, 40]] },
    ];
    for (const invoice of invoiceSeeds) {
      const items = invoice.items.map(([id, description, quantity, unitPrice]) => ({ id, description, quantity, unitPrice, lineTotal: quantity * unitPrice }));
      await client.query(
        `INSERT INTO invoices (
          id, invoice_number, appointment_id, patient_id, subtotal, additional_charges, discount,
          total_amount, payment_status, payment_method, paid_at, due_date, items
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)`,
        [invoice.id, invoice.number, invoice.appointmentId, invoice.patientId, invoice.subtotal,
          invoice.extra, invoice.discount, invoice.total, invoice.status, invoice.method, invoice.paidAt,
          invoice.due, JSON.stringify(items)],
      );
    }

    const auditSeeds = [
      ['log-501', 'user-admin', 'Dr. Evelyn Vance, MD', 'administrator', 'CREATE_DOCTOR_PROFILE', 'doctor', 'doc-1', { doctorEmail: 'doctor@example.test', department: 'Cardiology' }],
      ['log-502', 'user-pat-1', 'Eleanor Bennett', 'patient', 'BOOK_APPOINTMENT', 'appointment', 'apt-101', { doctorId: 'doc-1', slot: '09:30' }],
      ['log-503', 'user-doc-1', 'Dr. Sarah Jenkins', 'doctor', 'RECORD_CLINICAL_CONSULTATION', 'medical_record', 'rec-201', { patientId: 'pat-4', prescriptionsCount: 3 }],
      ['log-504', 'user-recep', 'Marcus Sterling', 'receptionist', 'RECORD_PAYMENT', 'invoice', 'inv-301', { paymentMethod: 'credit_card', amount: 225 }],
    ];
    for (const [id, actorId, actorName, actorRole, action, resourceType, resourceId, metadata] of auditSeeds) {
      await client.query(
        `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, resource_type, resource_id, metadata_json, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, '127.0.0.1')`,
        [id, actorId, actorName, actorRole, action, resourceType, resourceId, JSON.stringify(metadata)],
      );
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  try {
    await initializeDatabase();
    const seeded = await seedDatabase({ reset: process.argv.includes('--reset') });
    console.log(seeded ? 'Synthetic HMS data seeded.' : 'Database already has data; no changes made.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}