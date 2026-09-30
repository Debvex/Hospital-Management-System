import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Doctor } from '../types';
import DoctorsTable from '../components/tables/DoctorsTable';
import AppointmentBookingModal from '../components/forms/AppointmentBookingModal';
import { Button } from '../components/ui/Button';
import { Stethoscope, RefreshCw, CalendarCheck } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await api.doctors.list();
      setDoctors(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Medical Faculty & Consultation Schedules
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Departmental rosters, consultation fees, and weekly outpatient (OPD) time windows.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadDoctors}
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Doctor Directory */}
      <DoctorsTable
        doctors={doctors}
        onBookWithDoctor={(docId) => setBookingDoctorId(docId)}
        isLoading={isLoading}
      />

      {/* Booking Modal with preselected doctor */}
      {bookingDoctorId && (
        <AppointmentBookingModal
          isOpen={!!bookingDoctorId}
          onClose={() => setBookingDoctorId(null)}
          defaultDoctorId={bookingDoctorId}
        />
      )}
    </div>
  );
};

export default DoctorsPage;
