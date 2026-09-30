import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { AuditLog } from '../types';
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
  const { success } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'rbac' | 'audit' | 'security'>('rbac');

  useEffect(() => {
    api.auditLogs.list().then(setAuditLogs);
  }, [currentRole]);

  const handleResetData = () => {
    if (window.confirm('Reset HMS database back to initial seed data?')) {
      api.resetData();
      success('Database Reset', 'Initialized synthetic demonstration dataset.');
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const permissionsMatrix = [
    { module: 'User Authentication & JWT Verification', admin: true, doctor: true, recep: true, patient: true },
    { module: 'Register Patients (Public / Desk)', admin: true, doctor: false, recep: true, patient: true },
    { module: 'View Full Patient Clinical Directory', admin: true, doctor: true, recep: true, patient: false },
    { module: 'Create & Manage Doctor Availability', admin: true, doctor: true, recep: false, patient: false },
    { module: 'Book & Reschedule Appointments', admin: true, doctor: false, recep: true, patient: true },
    { module: 'Server-side Slot Conflict Prevention (409)', admin: true, doctor: true, recep: true, patient: true },
    { module: 'Write Clinical Diagnoses & Prescriptions', admin: true, doctor: true, recep: false, patient: false },
    { module: 'View Personal Medical History', admin: true, doctor: true, recep: false, patient: true },
    { module: 'Generate Billing Invoices', admin: true, doctor: false, recep: true, patient: false },
    { module: 'Mark Invoices Paid / Record Cash', admin: true, doctor: false, recep: true, patient: false },
    { module: 'Inspect Security Audit Logs & System DDL', admin: true, doctor: false, recep: false, patient: false },
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetData}
          className="text-rose-400 hover:bg-rose-950/40 border-rose-900/50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Reset Demo Database</span>
        </Button>
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
