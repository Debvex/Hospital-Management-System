import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { APPOINTMENT_STATUS_CONFIG } from '../../lib/constants';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  FilePlus,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AppointmentsTableProps {
  appointments: Appointment[];
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onCreateRecord?: (appointment: Appointment) => void;
  isLoading?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onStatusChange,
  onCreateRecord,
  isLoading = false,
}) => {
  const { currentRole, currentDoctorId, currentPatientId } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Role-sensitive filtering as mandated in README Section 3 & 4.4
  let visibleAppointments = appointments;

  if (currentRole === 'doctor' && currentDoctorId) {
    visibleAppointments = visibleAppointments.filter((a) => a.doctorId === currentDoctorId);
  } else if (currentRole === 'patient' && currentPatientId) {
    visibleAppointments = visibleAppointments.filter((a) => a.patientId === currentPatientId);
  }

  // Filter by status tab
  if (filterStatus !== 'all') {
    visibleAppointments = visibleAppointments.filter((a) => a.status === filterStatus);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    visibleAppointments = visibleAppointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.patientMrn.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented status filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700/80 overflow-x-auto">
          {['all', 'scheduled', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer
                ${
                  filterStatus === st
                    ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600'
                    : 'text-zinc-400 hover:text-white'
                }
              `}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-700/80 bg-[#181a20] px-3.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#181a20] rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14161a] border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Patient (MRN)</th>
                <th className="py-3.5 px-4">Doctor & Dept</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Loading appointments queue...
                  </td>
                </tr>
              ) : visibleAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GoogleIconCircle icon={Calendar} color="yellow" size="md" />
                      <p className="text-sm font-semibold text-zinc-200">No appointments found</p>
                      <p className="text-xs text-zinc-500">
                        Try changing the status filter or schedule a new appointment.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleAppointments.map((apt) => {
                  const statusConf = APPOINTMENT_STATUS_CONFIG[apt.status] || APPOINTMENT_STATUS_CONFIG.scheduled;

                  return (
                    <tr
                      key={apt.id}
                      className="hover:bg-zinc-800/40 transition-colors duration-100"
                    >
                      {/* Patient */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <GoogleIconCircle icon={User} color="green" size="xs" />
                          <div>
                            <span className="font-bold text-zinc-100 block leading-tight">
                              {apt.patientName}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">
                              {apt.patientMrn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <GoogleIconCircle icon={Stethoscope} color="blue" size="xs" />
                          <div>
                            <span className="font-semibold text-zinc-100 block leading-tight">
                              {apt.doctorName}
                            </span>
                            <span className="text-[11px] text-zinc-400 block">
                              {apt.departmentName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-zinc-300">
                          <div className="flex items-center gap-1 font-mono font-medium tabular-nums text-zinc-100">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{apt.startTime} - {apt.endTime}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 mt-0.5 font-mono tabular-nums">
                            {apt.appointmentDate}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-zinc-200 truncate" title={apt.reason}>
                          {apt.reason}
                        </p>
                        <span className="text-[10px] text-zinc-400 capitalize block mt-0.5">
                          {apt.type.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`
                            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                            ${statusConf.bg} ${statusConf.text}
                          `}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Doctor action: Write clinical record if scheduled */}
                          {currentRole === 'doctor' &&
                            apt.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="google"
                                onClick={() => onCreateRecord && onCreateRecord(apt)}
                                className="text-xs h-7 px-2.5"
                                title="Write consultation notes & prescription"
                              >
                                <FilePlus className="w-3.5 h-3.5 text-black" />
                                <span>Consult & Rx</span>
                              </Button>
                            )}

                          {/* Receptionist / Admin actions */}
                          {(currentRole === 'receptionist' || currentRole === 'administrator') &&
                            apt.status === 'scheduled' && (
                              <button
                                onClick={() => onStatusChange(apt.id, 'completed')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
                                title="Mark Completed"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              </button>
                            )}

                          {/* Cancellation allowed for staff and booking patient */}
                          {(currentRole === 'patient' || currentRole === 'receptionist' || currentRole === 'administrator') &&
                            apt.status === 'scheduled' && (
                            <button
                              onClick={() => onStatusChange(apt.id, 'cancelled')}
                              className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-4 h-4 text-rose-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsTable;