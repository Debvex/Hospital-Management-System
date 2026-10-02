# Hospital Management System (HMS)

A full-stack Hospital Management System comprising of features like patient registration, doctor and department management, appointment scheduling, medical records, prescriptions, billing, and administrative reporting behind role-based access control.


![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express%20on%20Node.js-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20RBAC-orange)
![Status](https://img.shields.io/badge/Status-Academic%20prototype-lightgrey)


## Features

- Authentication and authorization
- Patient management
- Doctors and availability
- Appointments
- Medical records and prescriptions
- Billing
- Administration
- Responsive UI

## User Roles

| Role | Responsibilities | Example permissions |
|---|---|---|
| **Administrator** | Staff, master data, oversight, audit | Approve staff accounts, view dashboards, manage departments, inspect audit logs |
| **Doctor** | Consultations and clinical entries | View assigned appointments, view permitted patient history, write diagnoses and prescriptions |
| **Receptionist** | Registration, scheduling, billing | Register patients, book and manage appointments, create invoices |
| **Patient** | Self-service | Maintain own profile, browse doctors, book or cancel appointments, view own records and invoices |

**Account approval rule:** the public signup form may *request* any supported role, but **Administrator, Doctor, and Receptionist accounts stay inactive until an administrator reviews and approves them.** A requested role never grants permissions by itself.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, shadcn-style components on Radix UI, Lucide icons |
| Backend runtime | Node.js 20 or later |
| Backend framework | Express 4 (JavaScript ES modules), MVC structure under `server/src/` |
| Database | PostgreSQL via `pg` with parameterized SQL |
| Schema setup | Idempotent SQL schema (tables, indexes, slot-conflict enforcement) |
| Authentication | HMAC-SHA256 JWT using Node.js `crypto` |
| Password hashing | Node.js `scrypt` with per-password salt |
| Testing | Node.js built-in test runner |
| Package managers | `pnpm` for `client/`, `npm` for `server/` |

---

## Architecture

This is a 1-Tier architecture which comprises of:

```text
React + TypeScript frontend (client/)
          │
          │  HTTPS / JSON / Authorization: Bearer <JWT>
          ▼
Express API on Node.js (server/)
  ├─ Routes        bind URLs to controllers and middleware
  ├─ Middleware    JWT verification, role checks, error handling
  ├─ Controllers   validate input, coordinate workflows
  └─ Models        own the PostgreSQL queries
          │
          │  Parameterized SQL / transactions
          ▼
PostgreSQL database
```

- **Routes** connect requests to controllers.
- **Controllers** validate input and orchestrate business rules (conflict checking, record ownership, invoice totals).
- **Models** hold all SQL; controllers contain no raw queries.
- **PostgreSQL** enforces referential integrity, uniqueness, check constraints, and appointment-conflict protection.

---

## Repository Structure

```text
hospital-management-system/
├── client/                 # React + TypeScript frontend (pnpm)
├── server/                 # Express API and database layer (npm)
│   ├── src/                # Routes, controllers, middleware, and models
│   ├── schema/             # PostgreSQL schema
│   ├── seed/               # Synthetic demo data
│   ├── tests/              # Backend tests
│   └── README.md           # Backend setup and endpoint reference
├── docs/                   # SRS, system design, ERD, and DFDs
└── README.md               # Project overview and setup instructions
```


## Project Quick Start

### Prerequisites

- Node.js 20 or later
- PostgreSQL 14 or later (running locally)
- `pnpm` (frontend) and `npm` (backend)

### 1. Clone

```bash
git clone https://github.com/sitabja-web/hospital-management-system.git
cd hospital-management-system
```

### 2. Create the database

```sql
CREATE USER hms_user WITH PASSWORD 'hms_password';
CREATE DATABASE hms_db OWNER hms_user;
```

>for local development only

### 3. Configure and start the backend

```bash
cd server   
pnpm install
pnpm dev
```

Remember to setup these necessary things in `server/.env`:

```env
DATABASE_URL=postgresql://hms_user:hms_password@localhost:5432/hms_db
JWT_SECRET=<long-random-string>   # e.g. node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Seed command for inserting dummy data:

```bash
pnpm run db:seed
```

### 4. Start the frontend

In a second terminal:

```bash
cd client
pnpm install
pnpm dev
```

The client targets `http://localhost:8000/api/v1` by default. To point it elsewhere, set `VITE_API_BASE_URL`.

### 5. Verify

```bash
curl http://localhost:8000/health
# { "status": "ok" }
```

### Useful commands

| Where | Command | Purpose |
|---|---|---|
| `client/` | `pnpm dev` | Start the dev server |
| `client/` | `pnpm lint` | Lint the frontend |
| `client/` | `pnpm build` | Production build |
| `server/` | `npm run dev` | Start the API |
| `server/` | `npm test` | Run backend tests |
| `server/` | `npm run db:seed` | Seed synthetic data |

---

## Demo Accounts

The seed data provides one synthetic account per role:

| Role | Email |
|---|---|
| Administrator | `administrator@example.test` |
| Doctor | `doctor@example.test` |
| Receptionist | `receptionist@example.test` |
| Patient | `patient@example.test` |

Seed passwords are defined in the seed script and documented in [`server/README.md`](server/README.md). Never reuse them outside local development.

---

## API Overview

All endpoints are versioned under **`/api/v1`**; the health check is at `/health`. Protected routes require `Authorization: Bearer <token>`.

| Group | Base path | Highlights |
|---|---|---|
| Auth | `/auth` | `register`, `login`, `me`, `logout`, `change-password` |
| Patients | `/patients`, `/me/patient-profile` | Staff search, create, view, update; own profile |
| Doctors | `/doctors`, `/availability` | List and manage doctors; create and remove availability |
| Appointments | `/appointments` | Search, book, reschedule, cancel, `today` queue |
| Medical records | `/medical-records`, `/prescriptions`, `/patients/:id/history` | Role-scoped records, prescriptions, history |
| Billing | `/invoices` | Create, view, update, `mark-paid` |
| System | `/dashboard/summary`, `/audit-logs` | KPIs for authorized roles; admin-only audit log |



**Status codes:** `200` OK · `201` created · `204` no content · `400` invalid request · `401` unauthenticated · `403` forbidden · `404` not found or not visible · `409` conflict (e.g., slot already booked) · `500` unexpected error.

**Error shape:**

```json
{
  "error": {
    "code": "APPOINTMENT_SLOT_UNAVAILABLE",
    "message": "The selected appointment slot is no longer available.",
    "details": null
  }
}
```

---

## Database Design

PostgreSQL holds a normalized relational model. Core entities:

| Entity | Purpose |
|---|---|
| `users` | Login identity, password hash, role, activation status |
| `patients` | Patient profile linked to a user |
| `doctors`, `departments` | Doctor profiles, specialization, fee, department |
| `doctor_availability` | Bookable date/time windows |
| `appointments` | Patient–doctor bookings and status |
| `medical_records` | Consultation notes and diagnoses |
| `prescriptions`, `prescription_items` | Prescription headers and medicine lines |
| `invoices`, `invoice_items` | Billing and payment status |
| `audit_logs` | Security and operational history |

**Key rules enforced at the database level**

- Unique email addresses; roles and appointment statuses restricted to defined values.
- Foreign keys on every relationship; invoice totals cannot be negative.
- **No double booking:** two active appointments cannot occupy the same doctor and time slot. The application checks availability first, and the database constraint is the final guard against concurrent requests.
- Clinical records are never silently deleted or overwritten.

The full ERD is in [`docs/`](docs/).

---

## Security Model

- Passwords are salted and hashed with `scrypt`; hashes are never returned or logged.
- Login failures return a generic message that does not reveal whether an email exists.
- JWTs are signed (HMAC-SHA256), expire, and are verified on every protected request.
- **All authorization is enforced on the server.** Hiding a UI button is not a security control.
- Deactivated and unapproved accounts cannot authenticate.
- Patient records are scoped by role: patients see only their own data; doctors see only permitted records for their assigned appointments.
- SQL uses parameterized queries only.
- `.env` files, tokens, and secrets are never committed.
- Errors never expose stack traces or database internals in production.

---

## Testing

```bash
cd server
npm test
```

The backend suite uses the Node.js built-in test runner for unit and smoke tests. Scenarios worth covering or demonstrating:

| Area | Scenarios |
|---|---|
| Authentication | Valid login succeeds · wrong password fails safely · expired token rejected · deactivated user rejected · public signup cannot create an active privileged account |
| Appointments | Valid booking · duplicate slot returns `409` · patient cannot book for another patient · receptionist can book on behalf of a patient |
| Medical records | Assigned doctor can write · unassigned doctor rejected · patient cannot view another patient's record |
| Billing | Totals computed correctly · negative charge rejected · patient sees only own invoices |

---

## Demonstration Walkthrough

1. Start PostgreSQL, the API, and the frontend.
2. Sign in as the **administrator**; show dashboard KPIs and the operational queue.
3. Open the doctor directory and show availability status.
4. Register or select a patient and **book an appointment** in an open slot.
5. Try booking the **same slot again** and show the `409` conflict.
6. Switch to the **doctor**; open the assigned appointment and write a consultation record and prescription.
7. Switch to the **patient**; confirm only their own records are visible.
8. Open **billing**, create or view an invoice, and mark it paid.
9. Show the endpoint reference in `server/README.md` and the passing test run.
10. Explain how JWT, RBAC, validation, foreign keys, and normalization protect the system.

---

## Documentation

| Document | Location |
|---|---|
| Backend setup and endpoints | [`server/README.md`](server/README.md) |
| Software Requirements Specification (IEEE-style) | `docs/SRS.md` |
| System design | `docs/system-design.md` |
| Entity-Relationship Diagram | `docs/ERD.md` |
| Context diagram and DFD Levels 0, 1, 2 | `docs/DFD-*.md` |

Documentation describes the **implemented** system. When behavior changes, update the relevant document in the same change.


<sub>Built for the Software Engineering laboratory (5th semester). For educational use only.</sub>