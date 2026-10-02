import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Appointment, AppointmentStatus } from '../types';
import AppointmentsTable from '../components/tables/AppointmentsTable';
import AppointmentBookingModal from '../components/forms/AppointmentBookingModal';
import MedicalRecordModal from '../components/forms/MedicalRecordModal';
import { Button } from '../components/ui/Button';
import GoogleIconCircle from '../components/ui/GoogleIconCircle';
import { Calendar, Plus, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';

export const AppointmentsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const canBookAppointments = currentRole !== 'doctor';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedAppointmentForRecord, setSelectedAppointmentForRecord] = useState<Appointment | null>(null);
  const { success, error } = useToast();

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await api.appointments.list();
      setAppointments(data);
    } catch (err: any) {
      error('Failed to Load Appointments', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await api.appointments.updateStatus(id, status);
      success('Status Updated', `Appointment marked as ${status}`);
      loadAppointments();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Consultation Scheduling & Slot Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Enforces PostgreSQL slot isolation to prevent concurrent double-booking conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAppointments}
            title="Reload appointments"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {canBookAppointments && (
            <Button
              variant="google"
              size="sm"
              onClick={() => setIsBookingModalOpen(true)}
              className="font-bold"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Book Appointment</span>
            </Button>
          )}
        </div>
      </div>

      {/* Lab Demonstration Card for 409 Conflict Protection */}
      <div className="p-4 bg-blue-950/40 border border-blue-900/60 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <GoogleIconCircle icon={ShieldCheck} color="blue" size="sm" />
          <div>
            <h4 className="font-bold text-blue-200">
              Lab Requirement: Server-Side Slot Validation (HTTP 409)
            </h4>
            <p className="text-blue-300/80 mt-0.5">
              Demonstrate duplicate-booking prevention by attempting to book an already occupied slot with Dr. Sarah Jenkins.
            </p>
          </div>
        </div>

        {canBookAppointments && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsBookingModalOpen(true)}
            className="text-xs font-bold text-zinc-100 shrink-0 self-start sm:self-center"
          >
            Test Slot Booking
          </Button>
        )}
      </div>

      {/* Table of Appointments */}
      <AppointmentsTable
        appointments={appointments}
        onStatusChange={handleStatusChange}
        onCreateRecord={(apt) => setSelectedAppointmentForRecord(apt)}
        isLoading={isLoading}
      />

      {/* Booking Modal */}
      {canBookAppointments && (
        <AppointmentBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => loadAppointments()}
        />
      )}

      {/* Doctor Clinical Record & Rx Modal */}
      {selectedAppointmentForRecord && (
        <MedicalRecordModal
          isOpen={!!selectedAppointmentForRecord}
          onClose={() => setSelectedAppointmentForRecord(null)}
          appointment={selectedAppointmentForRecord}
          onSuccess={() => {
            setSelectedAppointmentForRecord(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;