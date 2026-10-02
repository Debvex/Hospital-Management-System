import {
  Appointment,
  AppointmentStatus,
  AuditLog,
  DashboardSummary,
  Department,
  Doctor,
  Invoice,
  MedicalRecord,
  Patient,
  PaymentStatus,
  User,
  UserRole,
} from '../types';
import { authStorage } from './auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1').replace(/\/$/, '');

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = authStorage.getToken();
  if (token && !token.startsWith('jwt_mock_')) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new AppError(0, 'API_UNAVAILABLE', 'Could not connect to the HMS API. Check that the server is running.');
  }

  if (response.status === 204) return undefined as T;
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = result?.error;
    throw new AppError(response.status, error?.code || 'REQUEST_FAILED', error?.message || 'The request failed.', error?.details);
  }
  return result as T;
}

function queryString(values: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  contactNumber: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  specialization?: string;
  departmentId?: string;
  departmentName?: string;
  qualification?: string;
  staffBadgeId?: string;
}

type AuthResponse =
  | { status: 'active'; token: string; user: User; patient?: Patient; doctor?: Doctor }
  | { status: 'pending_approval'; message: string; request: { id: string; role: UserRole } };

export interface RegistrationRequest {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  contactNumber: string;
  profileData: Record<string, string>;
  status: 'pending';
  createdAt: string;
}

export const api = {
  auth: {
    register: (payload: RegisterPayload) => request<AuthResponse>('/auth/register', {
      method: 'POST', body: JSON.stringify(payload),
    }),
    login: (email: string, password: string) => request<{ token: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
    requestPasswordReset: (email: string) => request<{ success: boolean; message: string }>('/auth/password-reset', {
      method: 'POST', body: JSON.stringify({ email }),
    }),
    getUsers: () => request<User[]>('/auth/users'),
    getCurrentUser: () => authStorage.getStoredUser() as User,
    logout: () => authStorage.clearSession(),
  },
  appointments: {
    list: (filters?: { doctorId?: string; patientId?: string; status?: AppointmentStatus; date?: string }) =>
      request<Appointment[]>(`/appointments${queryString(filters || {})}`),
    create: (data: {
      patientId: string;
      doctorId: string;
      appointmentDate: string;
      startTime: string;
      reason: string;
      type: Appointment['type'];
      createdByRole: UserRole;
    }) => {
      const { createdByRole: _createdByRole, ...payload } = data;
      return request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateStatus: (appointmentId: string, status: AppointmentStatus) =>
      request<Appointment>(`/appointments/${encodeURIComponent(appointmentId)}`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      }),
    cancel: (appointmentId: string, reason?: string) =>
      request<Appointment>(`/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
        method: 'POST', body: JSON.stringify({ reason }),
      }),
  },
  patients: {
    list: (searchQuery?: string) => request<Patient[]>(`/patients${queryString({ search: searchQuery })}`),
    getById: (id: string) => request<Patient>(`/patients/${encodeURIComponent(id)}`),
    create: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'mrn'>) =>
      request<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Pick<Patient, 'contactNumber' | 'address' | 'emergencyContact'>) =>
      request<Patient>(`/patients/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  doctors: {
    list: (departmentId?: string) => request<Doctor[]>(`/doctors${queryString({ departmentId })}`),
    getById: (id: string) => request<Doctor>(`/doctors/${encodeURIComponent(id)}`),
  },
  medicalRecords: {
    list: (patientId?: string) => request<MedicalRecord[]>(`/medical-records${queryString({ patientId })}`),
    create: (data: {
      appointmentId: string;
      patientId: string;
      doctorId: string;
      symptoms: string;
      diagnosis: string;
      consultationNotes: string;
      vitals?: MedicalRecord['vitals'];
      prescriptions: MedicalRecord['prescriptions'];
      followUpDate?: string;
    }) => request<MedicalRecord>('/medical-records', { method: 'POST', body: JSON.stringify(data) }),
  },
  invoices: {
    list: (patientId?: string) => request<Invoice[]>(`/invoices${queryString({ patientId })}`),
    create: (data: {
      appointmentId?: string;
      patientId: string;
      items: Invoice['items'];
      discount?: number;
      paymentMethod?: Invoice['paymentMethod'];
      paymentStatus: PaymentStatus;
    }) => request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    markPaid: (invoiceId: string, paymentMethod: NonNullable<Invoice['paymentMethod']> = 'cash') =>
      request<Invoice>(`/invoices/${encodeURIComponent(invoiceId)}/mark-paid`, {
        method: 'PATCH', body: JSON.stringify({ paymentMethod }),
      }),
  },
  auditLogs: {
    list: () => request<AuditLog[]>('/audit-logs'),
  },
  dashboard: {
    getSummary: () => request<DashboardSummary>('/dashboard/summary'),
  },
  resetData: () => request<{ success: boolean }>('/admin/reset-demo', { method: 'POST' }),
  registrationRequests: {
    list: () => request<RegistrationRequest[]>('/admin/registration-requests'),
    review: (requestId: string, decision: 'approved' | 'rejected') =>
      request<{ id: string; status: 'approved' | 'rejected' }>(
        `/admin/registration-requests/${encodeURIComponent(requestId)}`,
        { method: 'PATCH', body: JSON.stringify({ decision }) },
      ),
  },
  admin: {
    users: () => request<User[]>('/admin/users'),
    setUserActive: (id: string, isActive: boolean) =>
      request<User>(`/admin/users/${encodeURIComponent(id)}/active`, {
        method: 'PATCH', body: JSON.stringify({ isActive }),
      }),
    departments: () => request<Department[]>('/admin/departments'),
    createDepartment: (data: Pick<Department, 'name' | 'code'> & Partial<Pick<Department, 'description' | 'headOfDepartment' | 'roomFloor'>>) =>
      request<Department>('/admin/departments', { method: 'POST', body: JSON.stringify(data) }),
    setDepartmentActive: (id: string, isActive: boolean) =>
      request<Department>(`/admin/departments/${encodeURIComponent(id)}/active`, {
        method: 'PATCH', body: JSON.stringify({ isActive }),
      }),
  },
  departments: {
    list: () => request<Department[]>('/departments'),
  },
};