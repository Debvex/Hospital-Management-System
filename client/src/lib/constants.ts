import { UserRole } from '../types';

export const APP_NAME = 'CarePulse HMS';
export const HOSPITAL_NAME = 'Metro Health Medical Center';

export const USER_ROLES: { role: UserRole; label: string; description: string; color: 'blue' | 'green' | 'yellow' | 'purple' }[] = [
  {
    role: 'administrator',
    label: 'Administrator',
    description: 'System master data, doctor provisioning, security & audit logs',
    color: 'purple',
  },
  {
    role: 'doctor',
    label: 'Doctor',
    description: 'Assigned consultations, patient clinical history & prescriptions',
    color: 'blue',
  },
  {
    role: 'receptionist',
    label: 'Receptionist',
    description: 'Patient admissions, scheduling, walk-ins & invoice generation',
    color: 'yellow',
  },
  {
    role: 'patient',
    label: 'Patient',
    description: 'Self-service appointments, doctor browsing & personal medical records',
    color: 'green',
  },
];

export const DEPARTMENTS = [
  { id: 'dept-1', name: 'Cardiology', code: 'CARD', roomFloor: 'Floor 3 - Wing A' },
  { id: 'dept-2', name: 'Neurology', code: 'NEUR', roomFloor: 'Floor 4 - Wing B' },
  { id: 'dept-3', name: 'Pediatrics', code: 'PEDI', roomFloor: 'Floor 1 - Wing C' },
  { id: 'dept-4', name: 'Orthopedics', code: 'ORTH', roomFloor: 'Floor 2 - Wing A' },
  { id: 'dept-5', name: 'General Medicine', code: 'GMED', roomFloor: 'Ground Floor - OPD' },
  { id: 'dept-6', name: 'Dermatology', code: 'DERM', roomFloor: 'Floor 2 - Wing B' },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
];

export const APPOINTMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: 'blue' | 'green' | 'yellow' | 'red' | 'slate'; bg: string; text: string }
> = {
  scheduled: { label: 'Scheduled', color: 'blue', bg: 'bg-blue-950/70 border border-blue-800/60', text: 'text-blue-300' },
  completed: { label: 'Completed', color: 'green', bg: 'bg-emerald-950/70 border border-emerald-800/60', text: 'text-emerald-300' },
  cancelled: { label: 'Cancelled', color: 'red', bg: 'bg-rose-950/70 border border-rose-800/60', text: 'text-rose-300' },
  no_show: { label: 'No Show', color: 'yellow', bg: 'bg-amber-950/70 border border-amber-800/60', text: 'text-amber-300' },
};

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  unpaid: { label: 'Unpaid', bg: 'bg-amber-950/70 border border-amber-800/60', text: 'text-amber-300' },
  paid: { label: 'Paid', bg: 'bg-emerald-950/70 border border-emerald-800/60', text: 'text-emerald-300' },
  overdue: { label: 'Overdue', bg: 'bg-rose-950/70 border border-rose-800/60', text: 'text-rose-300' },
  refunded: { label: 'Refunded', bg: 'bg-zinc-800 border border-zinc-700', text: 'text-zinc-300' },
};
