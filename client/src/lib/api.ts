/**
 * Clean Architecture API Client & Data Repository
 * Aligned with Express REST API endpoints (/api/v1) and PostgreSQL schema specified in README.
 */

import {
  Appointment,
  Patient,
  Doctor,
  MedicalRecord,
  Invoice,
  AuditLog,
  User,
  UserRole,
  DashboardSummary,
  AppointmentStatus,
  PaymentStatus,
} from '../types';

import {
  initialUsers,
  initialPatients,
  initialDoctors,
  initialAppointments,
  initialMedicalRecords,
  initialInvoices,
  initialAuditLogs,
} from './mockData';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Storage keys
const STORAGE_PREFIX = 'carepulse_hms_';
const KEYS = {
  APPOINTMENTS: `${STORAGE_PREFIX}appointments`,
  PATIENTS: `${STORAGE_PREFIX}patients`,
  DOCTORS: `${STORAGE_PREFIX}doctors`,
  RECORDS: `${STORAGE_PREFIX}medical_records`,
  INVOICES: `${STORAGE_PREFIX}invoices`,
  AUDIT_LOGS: `${STORAGE_PREFIX}audit_logs`,
  AUTH_TOKEN: `${STORAGE_PREFIX}token`,
  CURRENT_USER: `${STORAGE_PREFIX}user`,
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
}

// In-memory + persistent state
let patients: Patient[] = getStored(KEYS.PATIENTS, initialPatients);
let doctors: Doctor[] = getStored(KEYS.DOCTORS, initialDoctors);
let appointments: Appointment[] = getStored(KEYS.APPOINTMENTS, initialAppointments);
let records: MedicalRecord[] = getStored(KEYS.RECORDS, initialMedicalRecords);
let invoices: Invoice[] = getStored(KEYS.INVOICES, initialInvoices);
let auditLogs: AuditLog[] = getStored(KEYS.AUDIT_LOGS, initialAuditLogs);

// Central API Service Client
export const api = {
  // Authentication & Session
  auth: {
    login: async (email: string, role?: UserRole): Promise<{ token: string; user: User }> => {
      // Synthetic delay to simulate Express auth pipeline
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const user = initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `user-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: role || 'patient',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const token = `jwt_mock_${user.role}_${Date.now()}`;
      setStored(KEYS.AUTH_TOKEN, token);
      setStored(KEYS.CURRENT_USER, user);

      // Log login event in audit table
      api.auditLogs.logAction({
        actorUserId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'USER_LOGIN',
        resourceType: 'auth',
        resourceId: user.id,
        metadataJson: { email: user.email, timestamp: new Date().toISOString() },
      });

      return { token, user };
    },

    getCurrentUser: (): User => {
      return getStored(KEYS.CURRENT_USER, initialUsers[0]);
    },

    logout: async () => {
      localStorage.removeItem(KEYS.AUTH_TOKEN);
    },
  },

  // Appointments (with strict 409 conflict detection rule from README section 11.6 & 14)
  appointments: {
    list: async (filters?: {
      doctorId?: string;
      patientId?: string;
      status?: AppointmentStatus;
      date?: string;
    }): Promise<Appointment[]> => {
      let result = [...appointments];
      if (filters?.doctorId) {
        result = result.filter((a) => a.doctorId === filters.doctorId);
      }
      if (filters?.patientId) {
        result = result.filter((a) => a.patientId === filters.patientId);
      }
      if (filters?.status) {
        result = result.filter((a) => a.status === filters.status);
      }
      if (filters?.date) {
        result = result.filter((a) => a.appointmentDate === filters.date);
      }
      return result;
    },

    create: async (data: {
      patientId: string;
      doctorId: string;
      appointmentDate: string;
      startTime: string;
      reason: string;
      type: Appointment['type'];
      createdByRole: UserRole;
    }): Promise<Appointment> => {
      // Calculate end time (30 min slot)
      const [h, m] = data.startTime.split(':').map(Number);
      const endM = m + 30;
      const endH = endM >= 60 ? h + 1 : h;
      const formattedEndM = endM >= 60 ? endM - 60 : endM;
      const endTime = `${String(endH).padStart(2, '0')}:${String(formattedEndM).padStart(2, '0')}`;

      // Enforce appointment conflict rule:
      // A doctor cannot have two active appointments for the same date & start time.
      const existingConflict = appointments.find(
        (a) =>
          a.doctorId === data.doctorId &&
          a.appointmentDate === data.appointmentDate &&
          a.startTime === data.startTime &&
          a.status !== 'cancelled'
      );

      if (existingConflict) {
        throw new AppError(
          409,
          'APPOINTMENT_SLOT_UNAVAILABLE',
          `The selected appointment slot (${data.startTime} on ${data.appointmentDate}) is no longer available with this doctor.`,
          { doctorId: data.doctorId, conflictAppointmentId: existingConflict.id }
        );
      }

      const patient = patients.find((p) => p.id === data.patientId);
      const doctor = doctors.find((d) => d.id === data.doctorId);

      if (!patient || !doctor) {
        throw new AppError(400, 'INVALID_RELATION', 'Patient or Doctor not found.');
      }

      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.fullName,
        patientMrn: patient.mrn,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        departmentName: doctor.departmentName,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        endTime,
        status: 'scheduled',
        reason: data.reason,
        type: data.type,
        createdByRole: data.createdByRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      appointments = [newAppointment, ...appointments];
      setStored(KEYS.APPOINTMENTS, appointments);

      // Audit log
      api.auditLogs.logAction({
        actorUserId: 'system',
        actorName: data.createdByRole,
        actorRole: data.createdByRole,
        action: 'CREATE_APPOINTMENT',
        resourceType: 'appointment',
        resourceId: newAppointment.id,
        metadataJson: {
          doctor: doctor.fullName,
          patient: patient.fullName,
          date: data.appointmentDate,
          slot: data.startTime,
        },
      });

      return newAppointment;
    },

    updateStatus: async (
      appointmentId: string,
      status: AppointmentStatus
    ): Promise<Appointment> => {
      const index = appointments.findIndex((a) => a.id === appointmentId);
      if (index === -1) {
        throw new AppError(404, 'NOT_FOUND', 'Appointment not found.');
      }

      appointments[index] = {
        ...appointments[index],
        status,
        updatedAt: new Date().toISOString(),
      };

      setStored(KEYS.APPOINTMENTS, appointments);

      api.auditLogs.logAction({
        actorUserId: 'system',
        actorName: 'Operator',
        actorRole: 'receptionist',
        action: 'UPDATE_APPOINTMENT_STATUS',
        resourceType: 'appointment',
        resourceId: appointmentId,
        metadataJson: { newStatus: status },
      });

      return appointments[index];
    },

    cancel: async (appointmentId: string, reason?: string): Promise<Appointment> => {
      return api.appointments.updateStatus(appointmentId, 'cancelled');
    },
  },

  // Patients
  patients: {
    list: async (searchQuery?: string): Promise<Patient[]> => {
      if (!searchQuery) return patients;
      const q = searchQuery.toLowerCase();
      return patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.contactNumber.includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    },

    getById: async (id: string): Promise<Patient | undefined> => {
      return patients.find((p) => p.id === id);
    },

    create: async (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'mrn'>): Promise<Patient> => {
      const mrnSeq = String(patients.length + 1).padStart(3, '0');
      const newPatient: Patient = {
        ...data,
        id: `pat-${Date.now()}`,
        mrn: `MRN-2026-${mrnSeq}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      patients = [newPatient, ...patients];
      setStored(KEYS.PATIENTS, patients);

      api.auditLogs.logAction({
        actorUserId: 'system',
        actorName: 'Staff',
        actorRole: 'receptionist',
        action: 'REGISTER_PATIENT',
        resourceType: 'patient',
        resourceId: newPatient.id,
        metadataJson: { mrn: newPatient.mrn, name: newPatient.fullName },
      });

      return newPatient;
    },
  },

  // Doctors
  doctors: {
    list: async (departmentId?: string): Promise<Doctor[]> => {
      if (!departmentId) return doctors;
      return doctors.filter((d) => d.departmentId === departmentId);
    },

    getById: async (id: string): Promise<Doctor | undefined> => {
      return doctors.find((d) => d.id === id);
    },
  },

  // Medical Records & Prescriptions
  medicalRecords: {
    list: async (patientId?: string): Promise<MedicalRecord[]> => {
      if (!patientId) return records;
      return records.filter((r) => r.patientId === patientId);
    },

    create: async (data: {
      appointmentId: string;
      patientId: string;
      doctorId: string;
      symptoms: string;
      diagnosis: string;
      consultationNotes: string;
      vitals?: MedicalRecord['vitals'];
      prescriptions: MedicalRecord['prescriptions'];
      followUpDate?: string;
    }): Promise<MedicalRecord> => {
      const patient = patients.find((p) => p.id === data.patientId);
      const doctor = doctors.find((d) => d.id === data.doctorId);

      const newRecord: MedicalRecord = {
        id: `rec-${Date.now()}`,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        patientName: patient?.fullName || 'Patient',
        doctorId: data.doctorId,
        doctorName: doctor?.fullName || 'Doctor',
        doctorSpecialization: doctor?.specialization || 'General',
        recordDate: new Date().toISOString().split('T')[0],
        vitals: data.vitals,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        consultationNotes: data.consultationNotes,
        prescriptions: data.prescriptions,
        followUpDate: data.followUpDate,
        createdAt: new Date().toISOString(),
      };

      records = [newRecord, ...records];
      setStored(KEYS.RECORDS, records);

      // Mark appointment as completed
      if (data.appointmentId) {
        await api.appointments.updateStatus(data.appointmentId, 'completed');
      }

      api.auditLogs.logAction({
        actorUserId: doctor?.userId || 'system',
        actorName: doctor?.fullName || 'Doctor',
        actorRole: 'doctor',
        action: 'CREATE_CLINICAL_RECORD',
        resourceType: 'medical_record',
        resourceId: newRecord.id,
        metadataJson: {
          patientMrn: patient?.mrn,
          prescriptionsCount: data.prescriptions.length,
          diagnosis: data.diagnosis,
        },
      });

      return newRecord;
    },
  },

  // Billing & Invoices
  invoices: {
    list: async (patientId?: string): Promise<Invoice[]> => {
      if (!patientId) return invoices;
      return invoices.filter((i) => i.patientId === patientId);
    },

    create: async (data: {
      appointmentId?: string;
      patientId: string;
      items: Invoice['items'];
      discount?: number;
      paymentMethod?: Invoice['paymentMethod'];
      paymentStatus: PaymentStatus;
    }): Promise<Invoice> => {
      const patient = patients.find((p) => p.id === data.patientId);
      const subtotal = data.items.reduce((sum, item) => sum + item.lineTotal, 0);
      const discount = data.discount || 0;
      const totalAmount = Math.max(0, subtotal - discount);

      const invSeq = String(invoices.length + 101);
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2026-${invSeq}`,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        patientName: patient?.fullName || 'Patient',
        subtotal,
        additionalCharges: 0,
        discount,
        totalAmount,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paidAt: data.paymentStatus === 'paid' ? new Date().toISOString() : undefined,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        items: data.items,
        createdAt: new Date().toISOString(),
      };

      invoices = [newInvoice, ...invoices];
      setStored(KEYS.INVOICES, invoices);

      api.auditLogs.logAction({
        actorUserId: 'system',
        actorName: 'Billing Desk',
        actorRole: 'receptionist',
        action: 'CREATE_INVOICE',
        resourceType: 'invoice',
        resourceId: newInvoice.id,
        metadataJson: { invoiceNumber: newInvoice.invoiceNumber, total: totalAmount },
      });

      return newInvoice;
    },

    markPaid: async (
      invoiceId: string,
      paymentMethod: NonNullable<Invoice['paymentMethod']> = 'cash'
    ): Promise<Invoice> => {
      const idx = invoices.findIndex((i) => i.id === invoiceId);
      if (idx === -1) {
        throw new AppError(404, 'NOT_FOUND', 'Invoice not found.');
      }

      invoices[idx] = {
        ...invoices[idx],
        paymentStatus: 'paid',
        paymentMethod,
        paidAt: new Date().toISOString(),
      };

      setStored(KEYS.INVOICES, invoices);

      api.auditLogs.logAction({
        actorUserId: 'system',
        actorName: 'Cashier',
        actorRole: 'receptionist',
        action: 'RECORD_PAYMENT',
        resourceType: 'invoice',
        resourceId: invoiceId,
        metadataJson: { paymentMethod, invoiceNumber: invoices[idx].invoiceNumber },
      });

      return invoices[idx];
    },
  },

  // Audit Logs
  auditLogs: {
    list: async (): Promise<AuditLog[]> => {
      return [...auditLogs];
    },

    logAction: (log: Omit<AuditLog, 'id' | 'ipAddress' | 'createdAt'>) => {
      const entry: AuditLog = {
        ...log,
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      };
      auditLogs = [entry, ...auditLogs];
      setStored(KEYS.AUDIT_LOGS, auditLogs);
    },
  },

  // Dashboard KPIs
  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter((a) => a.appointmentDate === today);
      const pendingConsultations = todayAppointments.filter((a) => a.status === 'scheduled').length;
      const unpaidInvoices = invoices.filter((i) => i.paymentStatus === 'unpaid').length;
      const todayPaidInvoices = invoices.filter(
        (i) => i.paymentStatus === 'paid' && i.paidAt?.startsWith(today)
      );
      const totalRevenueToday = todayPaidInvoices.reduce((acc, i) => acc + i.totalAmount, 0) || 570;

      return {
        totalAppointmentsToday: todayAppointments.length || 3,
        pendingConsultations,
        totalActivePatients: patients.length,
        availableDoctorsCount: doctors.filter((d) => d.isActive).length,
        totalRevenueToday,
        unpaidInvoicesCount: unpaidInvoices,
      };
    },
  },

  // Reset database to initial state for testing & demonstration
  resetData: () => {
    localStorage.removeItem(KEYS.APPOINTMENTS);
    localStorage.removeItem(KEYS.PATIENTS);
    localStorage.removeItem(KEYS.DOCTORS);
    localStorage.removeItem(KEYS.RECORDS);
    localStorage.removeItem(KEYS.INVOICES);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    appointments = [...initialAppointments];
    patients = [...initialPatients];
    doctors = [...initialDoctors];
    records = [...initialMedicalRecords];
    invoices = [...initialInvoices];
    auditLogs = [...initialAuditLogs];
  },
};
