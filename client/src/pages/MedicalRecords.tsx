import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { MedicalRecord } from '../types';
import MedicalRecordsTable from '../components/tables/MedicalRecordsTable';
import { Button } from '../components/ui/Button';
import { FileText, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const MedicalRecordsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.medicalRecords.list();
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentRole]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Clinical Records & Typed Prescriptions (Rx)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Permanent diagnostic history, physician consultation summaries, and medical items.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadRecords}
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Role Scoping Note */}
      <div className="p-3.5 bg-[#181a20] border border-zinc-800 rounded-2xl flex items-center gap-2.5 text-xs text-zinc-300">
        <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          <strong className="text-zinc-100">HIPAA/Privacy Compliance: </strong>
          {currentRole === 'patient'
            ? 'Viewing strictly personal records associated with your patient account.'
            : 'Viewing clinical encounters scoped to your current medical practice role.'}
        </span>
      </div>

      {/* Table */}
      <MedicalRecordsTable records={records} isLoading={isLoading} />
    </div>
  );
};

export default MedicalRecordsPage;
