import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { AuditLog, Department, User } from '../types';
import GoogleIconCircle from '../components/ui/GoogleIconCircle';
import { Button } from '../components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
  Database,
  KeyRound,
  FileCode,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const { success, error } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'rbac' | 'requests' | 'staff' | 'departments' | 'audit' | 'security'>('rbac');
  const [registrationRequests, setRegistrationRequests] = useState<Awaited<ReturnType<typeof api.registrationRequests.list>>>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');

  useEffect(() => {
    if (currentRole === 'administrator') {
      api.auditLogs.list().then(setAuditLogs).catch(() => setAuditLogs([]));
      api.registrationRequests.list().then(setRegistrationRequests).catch(() => setRegistrationRequests([]));
      api.admin.users().then(setStaff).catch(() => setStaff([]));
      api.admin.departments().then(setDepartments).catch(() => setDepartments([]));
    } else {
      setAuditLogs([]);
      setRegistrationRequests([]);
      setStaff([]);
      setDepartments([]);
    }
  }, [currentRole]);

  const handleRegistrationReview = async (requestId: string, decision: 'approved' | 'rejected') => {
    try {
      await api.registrationRequests.review(requestId, decision);
      setRegistrationRequests((requests) => requests.filter((request) => request.id !== requestId));
      success(decision === 'approved' ? 'Account Approved' : 'Request Rejected', 'Registration request reviewed.');
    } catch (err: any) {
      error('Review Failed', err.message || 'Could not review registration request.');
    }
  };

  const handleStaffStatusChange = async (user: User) => {
    try {
      const updated = await api.admin.setUserActive(user.id, !user.isActive);
      setStaff((current) => current.map((item) => item.id === updated.id ? updated : item));
      success(updated.isActive ? 'Account Activated' : 'Account Deactivated', `${updated.fullName}'s account status was updated.`);
    } catch (err: any) {
      error('Account Update Failed', err.message || 'Could not update this account.');
    }
  };

  const handleCreateDepartment = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const department = await api.admin.createDepartment({
        name: departmentName,
        code: departmentCode,
        description: departmentDescription,
      });
      setDepartments((current) => [...current, department].sort((left, right) => left.name.localeCompare(right.name)));
      setDepartmentName('');
      setDepartmentCode('');
      setDepartmentDescription('');
      success('Department Added', `${department.name} is now available.`);
    } catch (err: any) {
      error('Department Creation Failed', err.message || 'Could not create department.');
    }
  };

  const handleDepartmentStatus = async (department: Department) => {
    try {
      const updated = await api.admin.setDepartmentActive(department.id, !department.isActive);
      setDepartments((current) => current.map((item) => item.id === updated.id ? updated : item));
      success('Department Updated', `${updated.name} is ${updated.isActive ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      error('Department Update Failed', err.message || 'Could not update department.');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset HMS database back to initial seed data?')) {
      try {
        await api.resetData();
        success('Database Reset', 'Initialized synthetic demonstration dataset.');
        window.location.reload();
      } catch (err: any) {
        error('Reset Failed', err.message || 'Could not reset the demonstration data.');
      }
    }
  };

  const permissionsMatrix = [
    { module: 'User Authentication & JWT Verification', admin: true, doctor: true, recep: true, patient: true },
    { module: 'Register Patients (Public / Desk)', admin: true, doctor: false, recep: true, patient: true },
    { module: 'View Permitted Patient Profiles', admin: true, doctor: true, recep: true, patient: false },
    { module: 'Maintain Own Patient Profile', admin: false, doctor: false, recep: false, patient: true },
    { module: 'Create & Manage Doctor Availability', admin: true, doctor: true, recep: false, patient: false },
    { module: 'Book & Reschedule Appointments', admin: true, doctor: false, recep: true, patient: true },
    { module: 'Server-side Slot Conflict Prevention (409)', admin: true, doctor: true, recep: true, patient: true },
    { module: 'Write Clinical Diagnoses & Prescriptions', admin: true, doctor: true, recep: false, patient: false },
    { module: 'View Permitted Clinical Records', admin: true, doctor: true, recep: false, patient: true },
    { module: 'Generate Billing Invoices', admin: true, doctor: false, recep: true, patient: false },
    { module: 'Mark Invoices Paid / Record Cash', admin: true, doctor: false, recep: true, patient: false },
    { module: 'Inspect Security Audit Logs & System DDL', admin: true, doctor: false, recep: false, patient: false },
    { module: 'Manage Staff Accounts & Departments', admin: true, doctor: false, recep: false, patient: false },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Security, Permissions & Audit Ledger
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Role-Based Access Control (RBAC), authentication policy, and transaction audit trails.
          </p>
        </div>

        {currentRole === 'administrator' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="text-rose-400 hover:bg-rose-950/40 border-rose-900/50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo Database</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700/80 w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'rbac' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'
          }`}
        >
          RBAC Permissions Matrix
        </button>

        {currentRole === 'administrator' && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'requests' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Staff Requests ({registrationRequests.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'staff' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Staff Accounts
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'departments' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Departments
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'audit' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Security Architecture
        </button>
      </div>

      {/* Tab 1: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4 text-zinc-100">
          <div className="flex items-center gap-2.5 mb-2">
            <GoogleIconCircle icon={ShieldCheck} color="purple" size="sm" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Role-Based Access Control (RBAC) Specification
              </h3>
              <p className="text-xs text-zinc-400">
                Guaranteed by Express middleware <code className="font-mono text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">requireAuth</code> and <code className="font-mono text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">requireRole(...roles)</code>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#14161a] border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Functional Capability</th>
                  <th className="py-3 px-3 text-center">Administrator</th>
                  <th className="py-3 px-3 text-center">Doctor</th>
                  <th className="py-3 px-3 text-center">Receptionist</th>
                  <th className="py-3 px-3 text-center">Patient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-medium text-zinc-200">{item.module}</td>
                    <td className="py-3 px-3 text-center">
                      {item.admin ? (
                        <span className="inline-block w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.doctor ? (
                        <span className="inline-block w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.recep ? (
                        <span className="inline-block w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.patient ? (
                        <span className="inline-block w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4 text-zinc-100">
          <div>
            <h3 className="text-base font-bold">Pending Account Requests</h3>
            <p className="text-xs text-zinc-400 mt-1">Approve staff accounts only after verifying the applicant and their role.</p>
          </div>
          {currentRole !== 'administrator' ? (
            <p className="text-sm text-amber-300">Administrator access is required to review account requests.</p>
          ) : registrationRequests.length === 0 ? (
            <p className="text-sm text-zinc-400">There are no pending account requests.</p>
          ) : (
            <div className="space-y-3">
              {registrationRequests.map((request) => (
                <div key={request.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{request.fullName}</p>
                    <p className="text-xs text-zinc-400">{request.email} · {request.contactNumber}</p>
                    <p className="text-xs text-blue-300 capitalize mt-1">Requested role: {request.role}</p>
                    {request.role === 'doctor' && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {request.profileData.specialization} · {request.profileData.departmentId}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-500 mt-1">Submitted {new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleRegistrationReview(request.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button size="sm" variant="google" onClick={() => handleRegistrationReview(request.id, 'approved')}>
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4 text-zinc-100">
          <div>
            <h3 className="text-base font-bold">Staff Accounts</h3>
            <p className="text-xs text-zinc-400 mt-1">Deactivate or reactivate an existing account. At least one Administrator must remain active.</p>
          </div>
          <div className="space-y-2">
            {staff.filter((user) => user.role !== 'patient').map((user) => (
              <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-sm">{user.fullName}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-xs text-blue-300 capitalize mt-1">{user.role} · {user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <Button size="sm" variant={user.isActive ? 'outline' : 'google'} onClick={() => handleStaffStatusChange(user)}>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5 text-zinc-100">
          <div>
            <h3 className="text-base font-bold">Hospital Departments</h3>
            <p className="text-xs text-zinc-400 mt-1">Create departments and control whether they can accept new doctor assignments.</p>
          </div>
          <form onSubmit={handleCreateDepartment} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <label className="space-y-1 text-xs text-zinc-300">
              <span>Department name</span>
              <input required value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} className="w-full rounded-xl border border-zinc-700 bg-[#14161a] px-3 py-2 text-sm text-zinc-100" />
            </label>
            <label className="space-y-1 text-xs text-zinc-300">
              <span>Code</span>
              <input required maxLength={12} value={departmentCode} onChange={(event) => setDepartmentCode(event.target.value)} className="w-full rounded-xl border border-zinc-700 bg-[#14161a] px-3 py-2 text-sm text-zinc-100" />
            </label>
            <Button type="submit" variant="google">Add Department</Button>
            <label className="space-y-1 text-xs text-zinc-300 sm:col-span-3">
              <span>Description</span>
              <input value={departmentDescription} onChange={(event) => setDepartmentDescription(event.target.value)} className="w-full rounded-xl border border-zinc-700 bg-[#14161a] px-3 py-2 text-sm text-zinc-100" />
            </label>
          </form>
          <div className="space-y-2">
            {departments.map((department) => (
              <div key={department.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div>
                  <p className="font-semibold text-sm">{department.name} <span className="ml-2 font-mono text-xs text-zinc-400">{department.code}</span></p>
                  <p className="text-xs text-zinc-400">{department.description || 'No description'} · {department.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleDepartmentStatus(department)}>
                  {department.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4 text-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GoogleIconCircle icon={ShieldAlert} color="red" size="sm" />
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Operational Audit Trail
                </h3>
                <p className="text-xs text-zinc-400">
                  Immutable event log recording actor, action, resource ID, IP address, and metadata
                </p>
              </div>
            </div>

            {currentRole !== 'administrator' && (
              <span className="text-xs text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full font-semibold border border-amber-800/60">
                Admin-Privileged Endpoint
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-200 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-semibold text-zinc-200">{log.actorName}</span>
                    <span className="text-[10px] text-zinc-400 capitalize">({log.actorRole})</span>
                  </div>
                  <p className="text-zinc-400 font-mono text-[11px]">
                    Resource: {log.resourceType} ({log.resourceId})
                  </p>
                </div>

                <div className="text-right text-[11px] text-zinc-500 font-mono tabular-nums shrink-0">
                  <span>{log.createdAt.replace('T', ' ').slice(0, 19)}</span>
                  <span className="block text-[10px] text-zinc-500">IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security Architecture */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-100">
          <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <GoogleIconCircle icon={KeyRound} color="blue" size="sm" />
              <h3 className="font-bold text-zinc-100 text-sm">Authentication Strategy</h3>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400 list-disc list-inside leading-relaxed">
              <li>Stateless JSON Web Tokens (JWT) signed with HS256 secret.</li>
              <li>Tokens delivered via Authorization Bearer header.</li>
              <li>Passwords salted and hashed using bcrypt (10 rounds).</li>
              <li>User deactivation halts session upon next token expiry.</li>
            </ul>
          </div>

          <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <GoogleIconCircle icon={Database} color="green" size="sm" />
              <h3 className="font-bold text-zinc-100 text-sm">PostgreSQL Concurrency Protection</h3>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400 list-disc list-inside leading-relaxed">
              <li>Unique slot constraint: <code className="font-mono text-zinc-200 bg-zinc-800 px-1">UNIQUE(doctor_id, appointment_date, start_time)</code></li>
              <li>Rejects duplicate active bookings returning HTTP 409.</li>
              <li>Drizzle ORM transactions wrap multi-entity patient creation.</li>
              <li>Audit logging triggered on every state mutation.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;