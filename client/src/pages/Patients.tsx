import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Patient } from '../types';
import PatientsTable from '../components/tables/PatientsTable';
import PatientModal from '../components/forms/PatientModal';
import { Button } from '../components/ui/Button';
import { Users, Plus, RefreshCw } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await api.patients.list();
      setPatients(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Patient Registry & Medical Records (MRN)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Maintain authorized medical identifiers, emergency contacts, and drug allergies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPatients}
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="google"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Register Patient</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <PatientsTable
        patients={patients}
        onAddPatient={() => setIsAddModalOpen(true)}
        isLoading={isLoading}
      />

      {/* Modal */}
      <PatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => loadPatients()}
      />
    </div>
  );
};

export default PatientsPage;
