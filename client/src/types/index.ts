/**
 * Domain entity types for CarePulse Hospital Management System (HMS)
 * Designed following Clean Architecture principles matching the PostgreSQL/Drizzle Schema
 */

export type UserRole = 'administrator' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  userId?: string;
  mrn: string; // Medical Record Number e.g. MRN-2026-001
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies?: string[];
  medicalHistorySummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  roomFloor: string;
  isActive: boolean;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  availableDate?: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "13:00"
  slotDurationMinutes: number; // e.g. 30
  isActive: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  roomNumber: string;
  contactNumber: string;
  avatarColor: 'blue' | 'green' | 'yellow' | 'purple' | 'teal' | 'red';
  availability: DoctorAvailability[];
  isActive: boolean;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  status: AppointmentStatus;
  reason: string;
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup';
  createdByRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;        // e.g. "500mg"
  frequency: string;     // e.g. "Twice daily after meals"
  duration: string;      // e.g. "7 days"
  instructions: string;  // e.g. "Drink plenty of water"
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  recordDate: string;
  vitals?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weightKg: number;
    oxygenSaturation: number;
  };
  symptoms: string;
  diagnosis: string;
  consultationNotes: string;
  prescriptions: PrescriptionItem[];
  followUpDate?: string;
  createdAt: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'overdue' | 'refunded';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-104
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorName?: string;
  subtotal: number;
  additionalCharges: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'cash' | 'credit_card' | 'upi' | 'insurance';
  paidAt?: string;
  dueDate: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: 'appointment' | 'patient' | 'doctor' | 'medical_record' | 'invoice' | 'auth';
  resourceId: string;
  metadataJson: Record<string, any>;
  ipAddress: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalAppointmentsToday: number;
  pendingConsultations: number;
  totalActivePatients: number;
  availableDoctorsCount: number;
  totalRevenueToday: number;
  unpaidInvoicesCount: number;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}
