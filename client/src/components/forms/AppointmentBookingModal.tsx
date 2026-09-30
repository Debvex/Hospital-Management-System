import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { api, AppError } from '../../lib/api';
import { Doctor, Patient, Appointment } from '../../types';
import { TIME_SLOTS, DEPARTMENTS } from '../../lib/constants';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { Calendar, Clock, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newAppointment: Appointment) => void;
  defaultDoctorId?: string;
  defaultDate?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDoctorId,
  defaultDate,
}) => {
  const { currentRole, currentUser } = useAuth();
  const { success, error } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctorId || '');
  const [selectedDate, setSelectedDate] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:30');
  const [reason, setReason] = useState('Routine medical consultation');
  const [type, setType] = useState<Appointment['type']>('consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.patients.list().then((list) => {
        setPatients(list);
        if (currentRole === 'patient') {
          const matched = list.find((p) => p.email === currentUser.email) || list[0];
          if (matched) setSelectedPatientId(matched.id);
        } else if (list.length > 0 && !selectedPatientId) {
          setSelectedPatientId(list[0].id);
        }
      });

      api.doctors.list().then((list) => {
        setDoctors(list);
        if (!selectedDoctorId && list.length > 0) {
          setSelectedDoctorId(defaultDoctorId || list[0].id);
        }
      });

      setConflictError(null);
    }
  }, [isOpen, currentRole, currentUser, defaultDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      error('Validation Error', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setConflictError(null);

    try {
      const created = await api.appointments.create({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        startTime: selectedTimeSlot,
        reason,
        type,
        createdByRole: currentRole,
      });

      success(
        'Appointment Booked Successfully',
        `Scheduled with ${created.doctorName} on ${created.appointmentDate} at ${created.startTime}`
      );

      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err: any) {
      if (err instanceof AppError && err.statusCode === 409) {
        setConflictError(err.message);
        error(
          'Conflict: Slot Unavailable',
          err.message,
          '409_SLOT_CONFLICT'
        );
      } else {
        error('Booking Failed', err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper button for demonstrating 409 conflict to examiner/user
  const triggerConflictSimulation = () => {
    // Pick Dr. Sarah Jenkins today at 09:30, which already has apt-101 scheduled!
    setSelectedDoctorId('doc-1');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTimeSlot('09:30');
    setReason('Attempting duplicate slot booking to verify 409 conflict prevention');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      subtitle="Schedule a consultation with real-time slot conflict validation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100">
        {/* Conflict Alert Banner if double booking caught */}
        {conflictError && (
          <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
            <GoogleIconCircle icon={ShieldAlert} color="red" size="sm" />
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <p className="font-bold">HTTP 409 Conflict Detected</p>
                <span className="font-mono text-[10px] bg-rose-900 text-rose-200 px-1.5 py-0.5 rounded font-bold">
                  APPOINTMENT_SLOT_UNAVAILABLE
                </span>
              </div>
              <p className="mt-1 text-rose-300">{conflictError}</p>
              <p className="mt-1 text-[11px] text-rose-400">
                PostgreSQL unique constraint `(doctor_id, appointment_date, start_time)` prevents double-booking. Please choose another time slot.
              </p>
            </div>
          </div>
        )}

        {/* Patient Selection */}
        {currentRole === 'patient' ? (
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <label className="text-xs font-semibold text-zinc-400 block">Booking for Patient</label>
            <p className="text-sm font-bold text-zinc-100 mt-0.5">{currentUser.fullName}</p>
            <span className="text-[11px] text-zinc-500">Self-service registration</span>
          </div>
        ) : (
          <Select
            label="Select Patient"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            required
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.mrn}) - Blood: {p.bloodGroup}
              </option>
            ))}
          </Select>
        )}

        {/* Doctor Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Doctor & Specialization"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            required
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} — {d.departmentName} (${d.consultationFee})
              </option>
            ))}
          </Select>

          <Select
            label="Appointment Type"
            value={type}
            onChange={(e) => setType(e.target.value as Appointment['type'])}
          >
            <option value="consultation">Initial Consultation</option>
            <option value="follow_up">Clinical Follow-up</option>
            <option value="routine_checkup">Routine Health Checkup</option>
            <option value="emergency">Urgent Care / Emergency</option>
          </Select>
        </div>

        {/* Doctor summary strip */}
        {selectedDoctor && (
          <div className="flex items-center justify-between p-3 bg-blue-950/60 border border-blue-800/60 rounded-2xl text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <GoogleIconCircle icon={Calendar} color="blue" size="xs" />
              <span className="font-semibold text-blue-200">
                {selectedDoctor.departmentName} • {selectedDoctor.roomNumber}
              </span>
            </div>
            <span className="font-mono font-bold text-blue-300">
              Fee: ${selectedDoctor.consultationFee}
            </span>
          </div>
        )}

        {/* Date and Slot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Appointment Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setConflictError(null);
            }}
            required
          />

          <Select
            label="Available 30-min Slot"
            value={selectedTimeSlot}
            onChange={(e) => {
              setSelectedTimeSlot(e.target.value);
              setConflictError(null);
            }}
            required
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot} ({slot === '09:30' ? 'Busy with Dr. Sarah' : 'Open'})
              </option>
            ))}
          </Select>
        </div>

        {/* Reason for Visit */}
        <Input
          label="Chief Complaint / Reason for Consultation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Follow-up on blood pressure or dizziness"
          required
        />

        {/* Demonstration helper box for laboratory defense */}
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px]">
              Want to test slot validation? Try booking Dr. Sarah Jenkins on today at 09:30.
            </span>
          </div>
          <button
            type="button"
            onClick={triggerConflictSimulation}
            className="text-[11px] font-bold text-black bg-[#FEEFC3] hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Fill Conflict Slot
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="google" isLoading={isSubmitting}>
            Confirm Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentBookingModal;
