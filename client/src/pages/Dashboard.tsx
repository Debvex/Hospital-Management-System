import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Appointment, DashboardSummary, Doctor } from '../types';
import GoogleIconCircle from '../components/ui/GoogleIconCircle';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Calendar,
  Users,
  Stethoscope,
  CreditCard,
  Clock,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  Activity,
  Receipt,
} from 'lucide-react';
import { PageId } from '../components/layout/Sidebar';
import { APPOINTMENT_STATUS_CONFIG } from '../lib/constants';
import { SplitText } from '../components/ui/SplitText';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenBooking: () => void;
  onOpenPatientModal: () => void;
  onOpenInvoiceModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenPatientModal,
  onOpenInvoiceModal,
}) => {
  const { currentRole, currentUser } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todayQueue, setTodayQueue] = useState<Appointment[]>([]);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [sum, apts, docs] = await Promise.all([
          api.dashboard.getSummary(),
          api.appointments.list({ date: new Date().toISOString().split('T')[0] }),
          api.doctors.list(),
        ]);
        setSummary(sum);
        setTodayQueue(apts);
        setDoctorsOnDuty(docs.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [currentRole]);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Welcome Banner */}
      <div className="bg-[#181a20] rounded-3xl p-6 border border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            <SplitText
              text={`Welcome back, ${currentUser.fullName}`}
              startDelay={0.06}
              charDelay={0.02}
            />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {currentRole === 'administrator' &&
              'System oversight mode: Review live operational queues, doctor schedules, and audit trails.'}
            {currentRole === 'doctor' &&
              'Clinical mode: Access assigned consultations, patient vitals, and issue typed prescriptions.'}
            {currentRole === 'receptionist' &&
              'Admissions desk: Manage patient check-ins, book conflict-free appointment slots, and generate invoices.'}
            {currentRole === 'patient' &&
              'Self-service portal: Browse available medical specialists, book slots, and access clinical records.'}
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="google"
            size="sm"
            onClick={onOpenBooking}
            className="font-bold"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Book Appointment</span>
          </Button>

          {(currentRole === 'receptionist' || currentRole === 'administrator') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPatientModal}
            >
              <Users className="w-3.5 h-3.5 text-zinc-300" />
              <span>Enroll Patient</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid - Featuring Google-styled Circular Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Appointments Today */}
        <div
          onClick={() => onNavigate('appointments')}
          className="bg-[#181a20] rounded-3xl p-5 border border-zinc-800 shadow-xs hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <GoogleIconCircle icon={Calendar} color="yellow" size="md" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Today's Slots
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums block">
              {summary?.totalAppointmentsToday ?? '3'}
            </span>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-amber-400 font-semibold">
                {summary?.pendingConsultations ?? '2'} Pending
              </span>{' '}
              in queue
            </p>
          </div>
        </div>

        {/* KPI 2: Active Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="bg-[#181a20] rounded-3xl p-5 border border-zinc-800 shadow-xs hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <GoogleIconCircle icon={Users} color="green" size="md" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Enrolled Patients
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums block">
              {summary?.totalActivePatients ?? '4'}
            </span>
            <p className="text-xs text-zinc-400 mt-1">Verified MRN records</p>
          </div>
        </div>

        {/* KPI 3: Available Doctors */}
        <div
          onClick={() => onNavigate('doctors')}
          className="bg-[#181a20] rounded-3xl p-5 border border-zinc-800 shadow-xs hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <GoogleIconCircle icon={Stethoscope} color="blue" size="md" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Specialist Doctors
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums block">
              {summary?.availableDoctorsCount ?? '5'}
            </span>
            <p className="text-xs text-zinc-400 mt-1">Across 6 hospital departments</p>
          </div>
        </div>

        {/* KPI 4: Pending Invoices / Revenue */}
        <div
          onClick={() => onNavigate('billing')}
          className="bg-[#181a20] rounded-3xl p-5 border border-zinc-800 shadow-xs hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <GoogleIconCircle icon={CreditCard} color="red" size="md" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Billing Ledger
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums block">
              ₹{summary?.totalRevenueToday ?? '570'}
            </span>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-rose-400 font-semibold">
                {summary?.unpaidInvoicesCount ?? '2'} Invoices Unpaid
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Operational Split: Today's Queue & Hospital Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Operational Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <GoogleIconCircle icon={Clock} color="blue" size="sm" />
                <div>
                  <h3 className="text-base font-bold text-zinc-100 leading-tight">
                    Today's Clinical Appointment Queue
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Live schedule tracking for {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {todayQueue.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No appointments booked for today yet.
              </div>
            ) : (
              <div className="space-y-3">
                {todayQueue.map((apt) => {
                  const statusConf = APPOINTMENT_STATUS_CONFIG[apt.status] || APPOINTMENT_STATUS_CONFIG.scheduled;

                  return (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex flex-col items-center justify-center shrink-0 font-mono">
                          <span className="text-[11px] font-bold text-zinc-100 leading-none">
                            {apt.startTime}
                          </span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">
                            30m
                          </span>
                        </div>

                        <div className="min-w-0">
                          <span className="font-bold text-xs text-zinc-100 block truncate">
                            {apt.patientName}
                          </span>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {apt.doctorName} • {apt.departmentName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`
                            px-2 py-0.5 rounded-full text-[10px] font-semibold
                            ${statusConf.bg} ${statusConf.text}
                          `}
                        >
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Doctors on Duty & Fast Actions */}
        <div className="space-y-4">
          {/* Doctors On Duty */}
          <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <GoogleIconCircle icon={Stethoscope} color="purple" size="sm" />
                <h3 className="text-sm font-bold text-zinc-100">Physicians On Duty</h3>
              </div>
              <button
                onClick={() => onNavigate('doctors')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Directory
              </button>
            </div>

            <div className="space-y-3">
              {doctorsOnDuty.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GoogleIconCircle
                      icon={Stethoscope}
                      color={doc.avatarColor}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-100 block truncate">
                        {doc.fullName}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {doc.departmentName} • {doc.roomNumber}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md shrink-0">
                    ₹{doc.consultationFee}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;