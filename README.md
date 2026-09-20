# Hospital Management System (HMS)

A full-stack Hospital Management System planned for a 5th-semester Software Engineering laboratory project. The system uses a **React frontend**, an **Express backend running on Node.js**, and a **PostgreSQL database**. This README is the complete implementation plan for building the project independently from the current frontend prototype through backend integration, testing, deployment, and final submission.

> **Project status:** The current repository contains a functional frontend prototype with mock data. The Express backend, PostgreSQL schema, JWT authentication, and production integration are planned in this document and should be implemented in the next phases.

---

## 1. Project Summary

The Hospital Management System centralizes routine hospital administration and basic clinical workflows. It supports patient registration, doctor and department management, appointment scheduling, medical-record entry, prescription logging, billing, role-based access control, and administrative reporting.

The first release is an **academic administrative prototype**. It is not intended to replace a certified hospital information system. It does not provide clinical decision-making, emergency triage, medical-imaging integration, laboratory-device integration, insurance processing, telemedicine, or external pharmacy communication.

The system must provide a single source of truth for hospital operations while protecting private patient information. Every protected action must be authenticated, authorized, validated, logged where appropriate, and persisted transactionally.

---

## 2. Objectives

The implementation should achieve the following objectives:

1. Centralize patient, doctor, appointment, clinical, and billing information.
2. Reduce appointment conflicts through server-side slot validation and database constraints.
3. Provide separate workflows for administrators, doctors, receptionists, and patients.
4. Protect passwords and private data through secure authentication and authorization.
5. Maintain normalized relational data with primary keys, foreign keys, constraints, and indexes.
6. Expose a documented REST API that the React frontend can consume.
7. Provide sufficient tests and documentation for a Software Engineering laboratory demonstration.
8. Keep the architecture modular so that additional hospital departments or services can be added later.

---

## 3. Main User Roles

The system uses role-based access control. A user receives only the permissions required for the assigned role.

| Role | Main responsibilities | Example permissions |
|---|---|---|
| Administrator | Manages staff, master data, system oversight, and audit events | Manage staff accounts, view dashboards, manage departments, inspect audit logs |
| Doctor | Conducts consultations and records clinical information | View assigned appointments, view permitted patient history, write diagnoses and prescriptions |
| Receptionist | Supports registration, scheduling, walk-ins, and billing | Register patients, book appointments, manage appointments, create invoices |
| Patient | Uses self-service features | Maintain own profile, browse doctors, book or cancel appointments, view own records and invoices |

A public patient registration form must never allow a user to select Administrator, Doctor, or Receptionist as their own role. Privileged accounts must be created or activated by an authorized administrator.

---

## 4. Functional Scope

### 4.1 Authentication and authorization

The system shall support registration, login, logout, session expiry, password protection, and role enforcement. The Express backend shall issue a signed JSON Web Token after successful authentication. Protected routes shall reject missing, invalid, expired, or insufficiently privileged tokens.

### 4.2 Patient management

Patients shall be able to create and update their own approved profile fields. Authorized staff shall be able to search patients by approved identifiers. A patient must never be able to view another patient’s private records.

### 4.3 Doctor and availability management

The system shall store doctor profiles, specializations, departments, consultation fees, and linked user accounts. Doctors or authorized administrators shall define consultation availability. Inactive, expired, and already-booked slots must not appear as available for new bookings.

### 4.4 Appointment management

Patients and receptionists shall be able to book available appointments. The backend shall validate the patient, doctor, date, time, and slot status. The database must prevent two active appointments from occupying the same doctor and time slot. Appointment statuses should include `scheduled`, `completed`, `cancelled`, and `no_show`.

### 4.5 Medical records and prescriptions

Doctors shall be able to create consultation notes, diagnoses, and prescriptions for assigned appointments. Each clinical entry must be linked to a patient and appointment. Historical records must be preserved rather than silently overwritten. Patients may view their own completed records and prescriptions.

### 4.6 Billing

The system shall create basic invoices for appointments. It shall record consultation fees, approved additional charges, total amounts, payment status, and payment timestamps. The first release may record payment status without integrating an external payment gateway.

### 4.7 Administration and reporting

Administrators should be able to view operational summaries, active staff, appointments by status, outstanding invoices, and audit events. Reports should be read-only in the first release unless a separate requirement permits editing.

---

## 5. Current Frontend Prototype

The current frontend is a React and TypeScript application in `client/`. It uses Tailwind CSS, shadcn-style UI primitives, Wouter-compatible client-side patterns, and Lucide icons.

### Implemented frontend areas

- Responsive HMS operations shell with persistent sidebar on desktop.
- Mobile navigation drawer.
- Dashboard KPI cards for appointments, patients, doctors, and invoices.
- Appointment list and appointment creation modal.
- Patients table with search.
- Doctor directory with availability status.
- Medical records table.
- Billing table with invoice status.
- Settings view showing security and workspace information.
- Notification popover.
- Demo role switcher for Administrator, Doctor, Receptionist, and Patient.
- Mock data and toast feedback for prototype interactions.

### Important limitation

The current frontend uses local arrays and mock interactions. It does not yet authenticate users, call an Express server, persist data, or connect to PostgreSQL. Replace mock data progressively with API calls after the backend foundation is complete.

---

## 6. Recommended Final Architecture

Use a modular monolithic architecture for the first release. The application should have a browser client, a REST API, and a relational database.

```text
React + TypeScript frontend
          |
          | HTTPS / JSON / JWT
          v
Express API on Node.js
  - Routes
  - Controllers
  - Middleware
  - Zod request validation
  - Authentication and RBAC
  - Service layer
  - Drizzle ORM repositories
          |
          | SQL transactions
          v
PostgreSQL database
```

### Component responsibilities

**Frontend:** Renders pages, collects user input, displays server responses, handles client-side navigation, and stores the access token only according to the chosen security strategy.

**Express application:** Receives HTTP requests, applies middleware, validates input, authenticates users, authorizes roles, invokes services, starts database transactions, and returns consistent JSON responses.

**Controller layer:** Converts HTTP requests into service calls and maps service results to HTTP responses. Controllers should not contain complex business rules or raw SQL.

**Service layer:** Contains business rules such as appointment conflict checking, record ownership, invoice total calculation, and role-sensitive operations.

**Repository layer:** Contains database queries and transaction helpers. Use Drizzle ORM with the PostgreSQL driver and keep persistence details out of controllers.

**PostgreSQL:** Stores normalized data and enforces referential integrity, uniqueness, check constraints, and appointment-conflict protection.

**Audit layer:** Records security-sensitive and operational events such as logins, staff-account changes, appointment changes, clinical-entry creation, and invoice updates.

---

## 7. Recommended Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + TypeScript | Browser interface |
| Styling | Tailwind CSS | Responsive visual system |
| UI primitives | shadcn-style components + Radix UI | Accessible interactions |
| Icons | Lucide React | Consistent interface icons |
| Backend runtime | Node.js 20 or later | Server-side JavaScript runtime |
| Backend framework | Express 5 | REST API and middleware pipeline |
| Backend language | TypeScript | Type safety across backend code |
| Validation | Zod | Request, response, and environment validation |
| ORM | Drizzle ORM | Type-safe PostgreSQL queries |
| PostgreSQL driver | `postgres` or `pg` | Database connectivity |
| Migrations | Drizzle Kit | Versioned schema changes |
| Authentication | `jsonwebtoken` or `jose` | JWT signing and verification |
| Password hashing | `bcrypt` or `bcryptjs` | Secure password hashing |
| Testing | Vitest or Jest + Supertest | Unit and API integration testing |
| API documentation | OpenAPI with `swagger-jsdoc` and `swagger-ui-express` | Interactive API reference |
| Formatting | Prettier + ESLint | Code consistency |

The project may use Prisma instead of Drizzle if the team already knows Prisma. The schema and API behavior must remain the same. This README assumes **Drizzle ORM** because it keeps SQL structure explicit and works well with a TypeScript-first Express project.

---

## 8. Suggested Repository Structure

The current frontend scaffold may be expanded into the following structure:

```text
hms_frontend/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── tables/
│       │   ├── forms/
│       │   └── ui/
│       ├── contexts/
│       ├── hooks/
│       ├── lib/
│       │   ├── api.ts
│       │   ├── auth.ts
│       │   ├── constants.ts
│       │   └── validation.ts
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Appointments.tsx
│       │   ├── Patients.tsx
│       │   ├── Doctors.tsx
│       │   ├── MedicalRecords.tsx
│       │   ├── Billing.tsx
│       │   ├── Settings.tsx
│       │   └── Login.tsx
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── cors.ts
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── schema/
│   │   │   ├── relations.ts
│   │   │   └── seed.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   ├── requestId.ts
│   │   │   └── validate.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── patients/
│   │   │   ├── doctors/
│   │   │   ├── appointments/
│   │   │   ├── medicalRecords/
│   │   │   ├── billing/
│   │   │   └── audit/
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   ├── errors.ts
│   │   │   ├── jwt.ts
│   │   │   └── pagination.ts
│   │   └── types/
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── shared/
│   └── api-types.md
├── docs/
│   ├── SRS.md
│   ├── system-design.md
│   ├── ERD.md
│   ├── DFD-context.md
│   ├── DFD-level-0.md
│   ├── DFD-level-1.md
│   └── DFD-level-2.md
├── README.md
└── .gitignore
```

The current WebDev project is frontend-only. If backend work is added inside this repository, keep the `server/` implementation separate from the frontend and document the integration contract in `shared/`.

---

## 9. Express Backend Setup Plan

### 9.1 Create the backend package

From the repository root, create the backend directory and initialize a separate Node.js package:

```bash
mkdir -p server
cd server
pnpm init
pnpm add express cors helmet compression cookie-parser dotenv zod \
  drizzle-orm postgres jsonwebtoken bcryptjs pino pino-http \
  swagger-jsdoc swagger-ui-express
pnpm add -D typescript tsx @types/node @types/express \
  @types/cors @types/cookie-parser @types/compression \
  @types/jsonwebtoken @types/bcryptjs @types/swagger-jsdoc \
  @types/swagger-ui-express drizzle-kit vitest supertest \
  @types/supertest eslint prettier
```

If the project uses npm instead of pnpm, replace `pnpm add` with `npm install` and `pnpm add -D` with `npm install -D`.

### 9.2 Configure TypeScript

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src", "drizzle.config.ts", "tests"]
}
```

### 9.3 Add backend scripts

The `server/package.json` should include:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

### 9.4 Create the Express application

Create `server/src/app.ts` for configuration and `server/src/server.ts` for startup.

```typescript
// server/src/app.ts
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { requestId } from "./middleware/requestId.js";
import { apiRouter } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestId);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);
```

```typescript
// server/src/server.ts
import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8000);

app.listen(port, () => {
  console.log(`HMS API listening on http://localhost:${port}`);
});
```

The application object should be exported separately so Supertest can test it without opening a network port.

### 9.5 Middleware order

Use the following order:

1. Security headers with Helmet.
2. Compression.
3. CORS configuration.
4. JSON and form-body parsers.
5. Cookies if refresh-token cookies are implemented.
6. Request ID and request logging.
7. Health endpoint.
8. API routes.
9. Not-found handler.
10. Central error handler.

The central error handler must be the final middleware. It must not expose stack traces or database internals in production.

---

## 10. Environment Configuration

Create `server/.env` locally and never commit it.

```env
NODE_ENV=development
PORT=8000
APP_NAME=Hospital Management System
DATABASE_URL=postgresql://hms_user:hms_password@localhost:5432/hms_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=info
```

Create `server/.env.example` with safe placeholder values. Validate environment variables at startup with Zod so the process fails clearly when a required value is missing.

Example configuration shape:

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  CORS_ORIGINS: z.string().min(1)
});

export const env = envSchema.parse(process.env);
```

Production secrets must be supplied through the hosting environment or a secret manager.

---

## 11. PostgreSQL and Drizzle Database Plan

Use PostgreSQL with Drizzle ORM and Drizzle Kit migrations. Do not create production tables by manually editing the database. Every schema change must be represented by a migration.

### 11.1 Create a local database

```sql
CREATE USER hms_user WITH PASSWORD 'hms_password';
CREATE DATABASE hms_db OWNER hms_user;
```

The password above is for local development only. Use a strong secret in any shared or production environment.

### 11.2 Drizzle configuration

Create `server/drizzle.config.ts`:

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
```

Create `server/src/db/client.ts`:

```typescript
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env.js";

const client = postgres(env.DATABASE_URL, { max: 10 });
export const db = drizzle(client);
```

### 11.3 Core tables

The normalized design should include at least the following entities:

| Table | Purpose |
|---|---|
| `users` | Login identity, password hash, role, activation status, timestamps |
| `patients` | Patient profile linked to a user where applicable |
| `doctors` | Doctor profile, specialization, department, consultation fee |
| `departments` | Hospital departments and metadata |
| `doctor_availability` | Doctor date/time windows available for appointments |
| `appointments` | Patient-doctor booking and status |
| `medical_records` | Consultation notes and diagnosis linked to an appointment |
| `prescriptions` | Prescription header linked to a medical record or appointment |
| `prescription_items` | Individual medicines and dosage instructions |
| `invoices` | Appointment billing and payment status |
| `invoice_items` | Individual invoice charges |
| `audit_logs` | Security and operational history |

### 11.4 Suggested Drizzle schema fields

Use UUIDs or generated numeric IDs consistently. UUIDs are recommended for public-facing identifiers.

```text
users
  id, email, password_hash, role, is_active, created_at, updated_at

patients
  id, user_id, full_name, date_of_birth, blood_group,
  contact_number, address, emergency_contact, created_at, updated_at

doctors
  id, user_id, department_id, specialization,
  consultation_fee, room_number, created_at, updated_at

departments
  id, name, description, is_active, created_at

doctor_availability
  id, doctor_id, available_date, start_time, end_time, is_active

appointments
  id, patient_id, doctor_id, availability_id,
  appointment_date, start_time, end_time, status,
  reason, created_by, created_at, updated_at

medical_records
  id, appointment_id, patient_id, doctor_id,
  diagnosis, consultation_notes, created_at, updated_at

prescriptions
  id, medical_record_id, patient_id, doctor_id, notes, created_at

prescription_items
  id, prescription_id, medicine_name, dosage,
  frequency, duration, instructions

invoices
  id, appointment_id, patient_id, subtotal,
  additional_charges, total_amount, payment_status,
  paid_at, created_at, updated_at

invoice_items
  id, invoice_id, description, quantity, unit_price, line_total

audit_logs
  id, actor_user_id, action, resource_type, resource_id,
  metadata_json, ip_address, created_at
```

### 11.5 Key constraints

Apply the following rules in both service logic and the database wherever possible:

- Email addresses must be unique.
- User roles must be restricted to supported role values.
- Foreign keys must reference existing records.
- Appointment dates and times must be valid.
- Appointment status must be restricted to a defined set.
- Invoice totals must not be negative.
- A patient may not have two active appointments with the same doctor and time.
- A doctor may not have overlapping availability windows unless explicitly supported.
- Clinical entries must reference an assigned appointment.
- Deactivated users must not authenticate successfully.
- Deleting clinical records should be disallowed or replaced by an auditable correction workflow.

### 11.6 Appointment conflict protection

The service should check slot availability before inserting an appointment. The database must also enforce the rule because two concurrent requests can pass an application-level check at the same time.

A practical PostgreSQL implementation uses an exclusion constraint over a doctor identifier and a time range when the final schema uses PostgreSQL range types. A simpler academic implementation may use a unique constraint on `(doctor_id, appointment_date, start_time)` for fixed-length slots. Choose one strategy and document it in the ERD and database notes.

### 11.7 Migration workflow

```bash
cd server
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Review every generated migration before applying it. Do not assume generated migrations are always correct.

---

## 12. Authentication and JWT Plan

### 12.1 Registration

1. The patient submits name, email, password, and approved profile fields.
2. Express receives the request and validates it with a Zod schema.
3. The service checks that the email is not already registered.
4. The password is hashed with bcrypt.
5. A `users` row is created with the role `patient`.
6. A linked `patients` row is created inside the same database transaction.
7. The backend returns a safe user representation. It must never return the password or password hash.

### 12.2 Login

1. The client sends email and password to `POST /api/v1/auth/login`.
2. The controller validates the request body.
3. The service retrieves the user by email.
4. The service verifies the password against the stored bcrypt hash.
5. The service rejects invalid credentials with a generic error message.
6. The service confirms that the account is active.
7. The service signs a JWT containing a user identifier, role, issued-at time, and expiry time.
8. The client uses the token on protected requests through the `Authorization: Bearer <token>` header.

### 12.3 Authentication middleware

Create `server/src/middleware/auth.ts` with two separate responsibilities:

- `requireAuth`: verifies the token, loads the user, and attaches it to `req.user`.
- `requireRole(...roles)`: checks that the authenticated user has an allowed role.

Use typed Express request augmentation so TypeScript knows about `req.user`.

```typescript
export type AuthUser = {
  id: string;
  email: string;
  role: "administrator" | "doctor" | "receptionist" | "patient";
};
```

Example route usage:

```typescript
router.get(
  "/audit-logs",
  requireAuth,
  requireRole("administrator"),
  auditController.list
);
```

Authorization must happen on the server. Hiding a frontend button is not a security control.

### 12.4 Token storage decision

For an academic prototype, a short-lived access token in memory is preferable to long-lived browser storage. If refresh tokens are added, use secure, HTTP-only cookies and rotate refresh tokens. Never put a long-lived secret in local storage without documenting the security trade-off.

### 12.5 Logout and expiry

JWT access tokens are stateless. The client can remove its local token on logout. The backend should enforce expiration. If immediate token revocation is required, add a server-side session or token-revocation table, but keep that feature outside the minimum release unless required.

### 12.6 Password rules

The initial password policy should require a reasonable minimum length and reject common invalid input. Passwords must not be logged, returned in responses, or included in audit metadata.

---

## 13. Express REST API Plan

Use versioned endpoints under `/api/v1`. Return consistent JSON response shapes and HTTP status codes.

### 13.1 Authentication endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a patient |
| `POST` | `/api/v1/auth/login` | Authenticate a user |
| `GET` | `/api/v1/auth/me` | Return the current user |
| `POST` | `/api/v1/auth/logout` | Clear client session or revoke session if implemented |
| `POST` | `/api/v1/auth/change-password` | Change the authenticated user password |

### 13.2 Patient endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/patients` | Search patients for authorized staff |
| `POST` | `/api/v1/patients` | Create a patient through staff workflow |
| `GET` | `/api/v1/patients/:patientId` | View an authorized patient profile |
| `PATCH` | `/api/v1/patients/:patientId` | Update approved fields |
| `GET` | `/api/v1/me/patient-profile` | View the current patient profile |

### 13.3 Doctor and availability endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/doctors` | List active doctors |
| `POST` | `/api/v1/doctors` | Create a doctor profile as administrator |
| `GET` | `/api/v1/doctors/:doctorId` | View a doctor profile |
| `PATCH` | `/api/v1/doctors/:doctorId` | Update doctor information |
| `GET` | `/api/v1/doctors/:doctorId/availability` | List available periods |
| `POST` | `/api/v1/doctors/:doctorId/availability` | Create availability as doctor or administrator |
| `DELETE` | `/api/v1/availability/:availabilityId` | Remove an availability period |

### 13.4 Appointment endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/appointments` | Search by date, doctor, patient, or status |
| `POST` | `/api/v1/appointments` | Book an appointment |
| `GET` | `/api/v1/appointments/:appointmentId` | View appointment details |
| `PATCH` | `/api/v1/appointments/:appointmentId` | Reschedule or update status |
| `POST` | `/api/v1/appointments/:appointmentId/cancel` | Cancel an appointment |
| `GET` | `/api/v1/appointments/today` | Return today’s operational queue |

### 13.5 Medical-record endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/medical-records` | List records allowed for the current role |
| `POST` | `/api/v1/medical-records` | Create a consultation record as an assigned doctor |
| `GET` | `/api/v1/medical-records/:recordId` | View one record |
| `POST` | `/api/v1/prescriptions` | Create a prescription |
| `GET` | `/api/v1/patients/:patientId/history` | View permitted history |

### 13.6 Billing endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/invoices` | Search invoices |
| `POST` | `/api/v1/invoices` | Create an invoice |
| `GET` | `/api/v1/invoices/:invoiceId` | View invoice details |
| `PATCH` | `/api/v1/invoices/:invoiceId` | Update approved billing fields |
| `POST` | `/api/v1/invoices/:invoiceId/mark-paid` | Record payment status |

### 13.7 System endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/dashboard/summary` | Dashboard KPIs for authorized roles |
| `GET` | `/api/v1/audit-logs` | Audit events for administrators |

### 13.8 Express module pattern

Each module should contain its route, controller, service, schema, and repository responsibilities.

```text
modules/appointments/
├── appointment.routes.ts
├── appointment.controller.ts
├── appointment.service.ts
├── appointment.repository.ts
├── appointment.schemas.ts
└── appointment.types.ts
```

The route should connect middleware and controller methods. The controller should parse validated input and call the service. The service should enforce business rules and call the repository. The repository should perform database queries.

Avoid putting SQL queries, password hashing, or complex business rules directly inside route files.

---

## 14. API Response and Error Conventions

Use standard HTTP status codes:

| Status | Meaning |
|---:|---|
| `200` | Successful read or update |
| `201` | Resource created |
| `204` | Successful operation with no response body |
| `400` | Invalid request or business-rule violation |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but not authorized |
| `404` | Resource not found or not visible to the user |
| `409` | Conflict, such as a duplicate booking |
| `422` | Optional validation status if the API adopts this convention |
| `500` | Unexpected server error |

Do not expose stack traces, SQL statements, password data, or internal secrets to the client. Log diagnostic details on the server while returning a safe message to the user.

A useful error shape is:

```json
{
  "error": {
    "code": "APPOINTMENT_SLOT_UNAVAILABLE",
    "message": "The selected appointment slot is no longer available.",
    "details": null,
    "requestId": "optional-request-id"
  }
}
```

Create typed application errors so the central Express error middleware can map known errors to status codes.

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}
```

The error middleware should handle `AppError`, Zod errors, database constraint errors, and unknown errors separately.

---

## 15. OpenAPI Documentation Plan

Document the Express API with OpenAPI so that the final project has a browsable API contract.

Recommended setup:

1. Add `swagger-jsdoc` and `swagger-ui-express`.
2. Create an OpenAPI definition in `server/src/config/openapi.ts`.
3. Add route annotations or maintain a separate YAML document.
4. Mount the documentation at `/api-docs` in development.
5. Do not expose sensitive development endpoints in production without a reason.

The documentation must include:

- Authentication scheme.
- Request and response schemas.
- Role requirements.
- Common error responses.
- Appointment conflict response.
- Pagination and filtering parameters.
- Example requests using synthetic data.

---

## 16. Frontend Integration Plan

Replace mock arrays one module at a time. Do not connect every screen to the API simultaneously.

### Phase 1: API client

Create `client/src/lib/api.ts` with a single configured HTTP client. It should provide:

- Base URL configuration.
- JSON request and response handling.
- Authorization header injection.
- Central handling for `401`, `403`, `409`, and validation errors.
- Typed helper functions for each endpoint group.
- An abort or cancellation mechanism for requests that are no longer needed.

### Phase 2: authentication context

Create an authentication context that stores the current user, loading state, login action, logout action, and role. The application should show a login screen when no valid session exists.

### Phase 3: replace dashboard mock data

Replace the dashboard arrays with requests to `/api/v1/dashboard/summary` and `/api/v1/appointments/today`. Keep loading, empty, error, and retry states visible.

### Phase 4: replace operational tables

Connect Patients, Doctors, Medical Records, and Billing to their respective list endpoints. Add pagination before the data volume becomes large.

### Phase 5: connect mutations

Connect appointment creation, rescheduling, cancellation, record creation, invoice creation, and payment status updates. After each mutation, refresh the affected query or update local state from the server response.

### Frontend integration rules

- Treat the backend as the source of truth.
- Never trust role information supplied only by the browser.
- Validate forms on the client for usability and on the server for security.
- Show success and error feedback for every mutation.
- Keep table filters in the URL when practical.
- Use empty states for no results rather than blank screens.
- Preserve the current responsive design and mobile navigation.
- Show a clear session-expired state when the API returns `401`.

---

## 17. Security and Privacy Checklist

Before declaring the project complete, verify all of the following:

- Passwords are hashed and never stored in plain text.
- Generic login errors do not reveal whether an email exists.
- JWT secrets are not committed to Git.
- JWT expiry is enforced.
- Every protected endpoint has a server-side authorization check.
- Patient records are scoped to the correct patient, doctor, or staff role.
- Deactivated accounts cannot log in.
- CORS is limited to known frontend origins.
- Helmet is configured for security headers.
- Request bodies are validated with Zod.
- SQL queries use Drizzle parameters rather than string concatenation.
- Sensitive values are excluded from logs.
- Rate limiting is considered for login and public registration routes.
- Audit events include actor, action, resource, timestamp, and outcome where appropriate.
- The production deployment uses HTTPS.
- Development data is synthetic and does not contain real patient information.

The application is an academic prototype. Do not test it with real patient information or present it as a certified medical system.

---

## 18. Testing Strategy

Testing should be traceable to the requirements and should cover both successful and rejected workflows.

### 18.1 Unit tests

Test password hashing, JWT creation and validation, appointment conflict rules, invoice totals, role checks, and field validators independently.

### 18.2 Express API integration tests

Use Vitest or Jest with Supertest to test the exported Express `app`. Use a dedicated test database or transaction rollback strategy.

Example test categories:

```text
Authentication:
  - valid login succeeds
  - invalid password fails safely
  - expired token is rejected
  - deactivated user is rejected
  - public registration cannot create an administrator

Appointments:
  - valid booking succeeds
  - duplicate active slot returns 409
  - patient cannot book for another patient without permission
  - doctor can view assigned appointments
  - receptionist can book on behalf of a patient

Medical records:
  - assigned doctor can write a record
  - unassigned doctor is rejected
  - patient can view own completed record
  - patient cannot view another patient’s record

Billing:
  - invoice total is calculated correctly
  - negative charge is rejected
  - receptionist can create an invoice
  - patient can view only permitted invoices

Express middleware:
  - unknown route returns a consistent 404 response
  - malformed JSON returns a safe error
  - validation errors return structured details
  - unexpected errors do not expose stack traces in production
```

### 18.3 Frontend tests

Test role-aware navigation, form validation, appointment modal submission, search filtering, loading states, empty states, notification behavior, and responsive navigation.

### 18.4 Database tests

Test foreign keys, unique constraints, appointment conflict protection, invoice restrictions, and migration reproducibility from an empty database.

### 18.5 Acceptance criteria

The project is ready for demonstration when:

1. Each defined role can complete its permitted primary workflow.
2. Unauthorized requests return `401` or `403` as appropriate.
3. Double booking is prevented under normal and concurrent request tests.
4. Valid records persist after restarting the backend.
5. API documentation is available at the documented route.
6. Frontend and backend tests pass.
7. Database migrations can recreate the schema from an empty database.
8. The final documentation matches the implemented behavior.

---

## 19. Development Roadmap

### Milestone 1: Requirements and design baseline

Confirm the SRS, scope, role permissions, ERD, Context Diagram, DFD Level 0, DFD Level 1, and DFD Level 2. Freeze the first-release scope before implementation.

### Milestone 2: Frontend prototype

Complete the navigation shell, dashboard, tables, forms, responsive layout, and mock-data interactions. This milestone is represented by the current frontend prototype.

### Milestone 3: Express project foundation

Create the TypeScript server package, configure Express, add Helmet, CORS, compression, request IDs, error handling, environment validation, and the `/health` endpoint.

### Milestone 4: Database foundation

Create PostgreSQL locally, define Drizzle schema files, create migrations, seed development data, and verify constraints.

### Milestone 5: Authentication foundation

Implement registration, bcrypt password hashing, login, JWT validation, current-user lookup, role middleware, logout behavior, and account activation rules.

### Milestone 6: Core workflows

Implement patient profiles, doctor directory, availability, appointment booking, cancellation, and conflict prevention.

### Milestone 7: Clinical and billing workflows

Implement medical records, prescriptions, invoices, payment status, and role-scoped history access.

### Milestone 8: Frontend integration

Replace mock data with API calls, connect forms to mutations, add loading and error states, and verify all roles in the browser.

### Milestone 9: Testing and documentation

Complete the test suite, update the traceability matrix, revise diagrams if implementation changes, and prepare the final demonstration script.

### Milestone 10: Deployment and submission

Set production environment variables, run migrations, deploy the application, verify health checks, capture screenshots, and submit the SRS, system design, diagrams, source code, test evidence, and presentation.

---

## 20. Local Development Commands

### Frontend

```bash
cd /home/ubuntu/hms_frontend
pnpm install
pnpm dev
pnpm check
pnpm build
```

### Backend

In a second terminal:

```bash
cd /home/ubuntu/hms_frontend/server
pnpm install
pnpm dev
```

The Express API should run on port `8000` by default. The frontend should use an environment variable such as `VITE_API_BASE_URL=http://localhost:8000/api/v1`.

### Database

Create the local database and user, then run:

```bash
cd /home/ubuntu/hms_frontend/server
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### Tests and checks

```bash
cd /home/ubuntu/hms_frontend/server
pnpm check
pnpm test
pnpm build
```

### Development data

Create a seed command that inserts only synthetic users, doctors, patients, appointments, records, and invoices. Make the command idempotent so that running it twice does not create duplicates.

```bash
pnpm db:seed
```

Use clearly documented development accounts such as:

```text
administrator@example.test
 doctor@example.test
receptionist@example.test
   patient@example.test
```

Do not use real email addresses or real patient data.

---

## 21. Git and Collaboration Workflow

Use small branches and focused commits.

```bash
git checkout -b feature/express-authentication
git add .
git commit -m "Implement JWT authentication with Express"
git push -u origin feature/express-authentication
```

Recommended commit groups:

- `docs: baseline HMS requirements and design`
- `feat: add Express TypeScript server foundation`
- `feat: add Drizzle schema and PostgreSQL migrations`
- `feat: implement JWT authentication`
- `feat: add appointment management API`
- `feat: connect appointments frontend`
- `test: add role and booking coverage`
- `docs: update implementation and deployment guide`

Do not commit `.env`, database dumps containing private information, generated build output, access tokens, or real patient data.

---

## 22. Deployment Plan

The deployment should contain a frontend service, an Express API service, and a managed PostgreSQL database or a controlled PostgreSQL instance.

### Backend deployment steps

1. Build the TypeScript server with `pnpm build`.
2. Start the server with `pnpm start`.
3. Provide the production `DATABASE_URL`.
4. Provide a strong random `JWT_SECRET`.
5. Configure the production frontend origin in `CORS_ORIGINS`.
6. Run Drizzle migrations before accepting traffic.
7. Create an initial administrator through a secure procedure.
8. Disable verbose development logging.
9. Configure HTTPS at the hosting or reverse-proxy layer.
10. Verify `/health`, authentication, authorization, and database connectivity.

### Frontend deployment steps

1. Set `VITE_API_BASE_URL` to the deployed Express API URL.
2. Run the frontend build.
3. Serve the generated static files.
4. Configure SPA fallback routing if the host requires it.
5. Test the deployed API from the deployed frontend origin.

### Production verification

Before the final demonstration or release:

- Test login for all roles.
- Test a successful appointment booking.
- Test duplicate-slot rejection.
- Test record privacy between two patients.
- Test invoice creation and payment status.
- Confirm that CORS allows only the intended frontend origin.
- Confirm that logs do not contain passwords, tokens, or private clinical content.
- Create a backup and document the restore procedure.

For the academic submission, a local or temporary deployment is sufficient if the evaluator can run the project reproducibly. The README must state the exact commands, environment variables, migration steps, and test commands.

---

## 23. Final Demonstration Script

Use the following sequence for the laboratory demonstration:

1. Start PostgreSQL, the Express backend, and the React frontend.
2. Open the login page and sign in as an administrator.
3. Show the dashboard KPIs and operational queue.
4. Open the doctor directory and demonstrate availability status.
5. Register or select a patient.
6. Create an appointment using an available slot.
7. Attempt to book the same slot again and show the `409` conflict response.
8. Switch to the doctor workflow.
9. Open the assigned appointment and create a consultation record and prescription.
10. Switch to the patient workflow and show that the patient can view only their own permitted records.
11. Open billing, create or view an invoice, and update its payment status.
12. Show the Express API documentation at `/api-docs`.
13. Show the database migration status and test results.
14. Explain how JWT, RBAC, validation, foreign keys, normalization, and Express middleware protect the system.

Do not demonstrate with real patient information.

---

## 24. Documentation Deliverables

The final repository should contain:

- SRS document based on IEEE-style requirements organization.
- System design document.
- Context Diagram.
- DFD Level 0.
- DFD Level 1.
- DFD Level 2.
- Normalized ER Diagram.
- PostgreSQL schema and Drizzle migration notes.
- Express API endpoint documentation.
- Test plan and test results.
- Installation and deployment instructions.
- Project presentation.
- This README as the implementation guide.

When implementation changes a requirement or diagram, update the documentation in the same change. The documentation must describe the implemented system, not an earlier design that no longer exists.

---

## 25. Known Limitations and Future Scope

The first release intentionally excludes imaging, laboratory integration, insurance claims, external pharmacy communication, telemedicine, advanced accounting, emergency triage, and clinical decision support.

Possible future extensions include email or SMS reminders, downloadable invoices, password reset, configurable departments, richer audit reports, laboratory integration, DICOM imaging support, external pharmacy integration, and carefully governed analytics. These features should be added only after the core security, privacy, and data-integrity requirements are stable.

---

## 26. References

[1]: https://expressjs.com/ "Express Documentation"

[2]: https://nodejs.org/docs/latest/api/ "Node.js Documentation"

[3]: https://www.postgresql.org/docs/ "PostgreSQL Documentation"

[4]: https://orm.drizzle.team/docs/overview "Drizzle ORM Documentation"

[5]: https://orm.drizzle.team/docs/kit-overview "Drizzle Kit Documentation"

[6]: https://zod.dev/ "Zod Documentation"

[7]: https://www.rfc-editor.org/rfc/rfc7519 "RFC 7519: JSON Web Token"

[8]: https://owasp.org/www-project-top-ten/ "OWASP Top 10 Web Application Security Risks"

[9]: https://vitest.dev/ "Vitest Documentation"

[10]: https://github.com/ladjs/supertest "Supertest Documentation"

[11]: https://swagger.io/specification/ "OpenAPI Specification"

[12]: https://helmetjs.github.io/ "Helmet Documentation"
