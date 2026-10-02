CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  head_of_department TEXT NOT NULL DEFAULT '',
  room_floor TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'doctor', 'receptionist', 'patient')),
  full_name TEXT NOT NULL,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  mrn TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  allergies TEXT[] NOT NULL DEFAULT '{}',
  medical_history_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualification TEXT NOT NULL DEFAULT '',
  experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (consultation_fee >= 0),
  room_number TEXT NOT NULL DEFAULT '',
  contact_number TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT 'blue',
  availability JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  reason TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consultation', 'follow_up', 'emergency', 'routine_checkup')),
  created_by_role TEXT NOT NULL CHECK (created_by_role IN ('administrator', 'doctor', 'receptionist', 'patient')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot_unique
  ON appointments (doctor_id, appointment_date, start_time)
  WHERE status <> 'cancelled';

CREATE TABLE IF NOT EXISTS medical_records (
  id TEXT PRIMARY KEY,
  appointment_id TEXT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE RESTRICT,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  record_date DATE NOT NULL,
  vitals JSONB,
  symptoms TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  consultation_notes TEXT NOT NULL,
  prescriptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (additional_charges >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'paid', 'overdue', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'upi', 'insurance')),
  paid_at TIMESTAMPTZ,
  due_date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registration_requests (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'doctor', 'receptionist')),
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS registration_requests_pending_email_unique
  ON registration_requests (LOWER(email)) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('administrator', 'doctor', 'receptionist', 'patient')),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('appointment', 'patient', 'doctor', 'department', 'medical_record', 'invoice', 'auth')),
  resource_id TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_resource_type_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_resource_type_check
  CHECK (resource_type IN ('appointment', 'patient', 'doctor', 'department', 'medical_record', 'invoice', 'auth'));

CREATE SEQUENCE IF NOT EXISTS patient_mrn_sequence START 5;
CREATE SEQUENCE IF NOT EXISTS invoice_number_sequence START 105;

CREATE INDEX IF NOT EXISTS appointments_patient_date_idx ON appointments (patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS appointments_doctor_date_idx ON appointments (doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS records_patient_date_idx ON medical_records (patient_id, record_date DESC);
CREATE INDEX IF NOT EXISTS invoices_patient_created_idx ON invoices (patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);