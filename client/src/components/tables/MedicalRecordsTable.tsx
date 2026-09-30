import React, { useState } from 'react';
import { MedicalRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { FileText, Pill, Activity, User, Stethoscope, Calendar, Eye } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  isLoading?: boolean;
}

export const MedicalRecordsTable: React.FC<MedicalRecordsTableProps> = ({
  records,
  isLoading = false,
}) => {
  const { currentRole, currentPatientId, currentDoctorId } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Strictly enforce role-based access control as required in README Section 4.5
  let visibleRecords = records;
  if (currentRole === 'patient' && currentPatientId) {
    visibleRecords = visibleRecords.filter((r) => r.patientId === currentPatientId);
  } else if (currentRole === 'doctor' && currentDoctorId) {
    visibleRecords = visibleRecords.filter((r) => r.doctorId === currentDoctorId);
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-[#181a20] rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14161a] border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Patient Name</th>
                <th className="py-3.5 px-4">Consulting Physician</th>
                <th className="py-3.5 px-4">Clinical Diagnosis</th>
                <th className="py-3.5 px-4">Encounter Date</th>
                <th className="py-3.5 px-4">Prescriptions (Rx)</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Loading clinical encounters...
                  </td>
                </tr>
              ) : visibleRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GoogleIconCircle icon={FileText} color="teal" size="md" />
                      <p className="text-sm font-semibold text-zinc-200">No medical records available</p>
                      <p className="text-xs text-zinc-500">
                        {currentRole === 'patient'
                          ? 'You do not have any published medical records yet.'
                          : 'No clinical notes recorded for this query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-zinc-800/40 transition-colors duration-100"
                  >
                    {/* Patient */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <GoogleIconCircle icon={User} color="green" size="xs" />
                        <div>
                          <span className="font-bold text-zinc-100 block leading-tight">
                            {rec.patientName}
                          </span>
                          <span className="text-[10px] text-zinc-500 block font-mono">
                            ID: {rec.id}
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
                            {rec.doctorName}
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            {rec.doctorSpecialization}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-zinc-200 line-clamp-1" title={rec.diagnosis}>
                        {rec.diagnosis}
                      </p>
                      <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {rec.symptoms}
                      </span>
                    </td>

                    {/* Record Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono tabular-nums text-zinc-300">
                        {rec.recordDate}
                      </span>
                    </td>

                    {/* Prescriptions Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="font-semibold text-teal-300 text-xs">
                          {rec.prescriptions.length} Meds
                        </span>
                      </div>
                    </td>

                    {/* Action: Open Modal */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="p-1.5 text-blue-400 hover:bg-blue-950/40 rounded-xl transition-colors inline-flex items-center gap-1 font-semibold text-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>View Rx</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record & Prescription Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Clinical Encounter Record - ${selectedRecord.recordDate}`}
          subtitle={`Consultation by ${selectedRecord.doctorName} for ${selectedRecord.patientName}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-zinc-100">
            {/* Vitals summary if recorded */}
            {selectedRecord.vitals && (
              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <GoogleIconCircle icon={Activity} color="green" size="xs" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Recorded Vitals
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Blood Pressure</span>
                    <strong className="font-mono text-zinc-200">{selectedRecord.vitals.bloodPressure}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Heart Rate</span>
                    <strong className="font-mono text-zinc-200">{selectedRecord.vitals.heartRate} bpm</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Temperature</span>
                    <strong className="font-mono text-zinc-200">{selectedRecord.vitals.temperature}°C</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Body Weight</span>
                    <strong className="font-mono text-zinc-200">{selectedRecord.vitals.weightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">SpO2</span>
                    <strong className="font-mono text-zinc-200">{selectedRecord.vitals.oxygenSaturation}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis & Findings */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2 text-xs">
              <div>
                <span className="text-zinc-500 font-bold uppercase text-[10px] block">Primary Diagnosis</span>
                <p className="font-bold text-sm text-zinc-100 mt-0.5">{selectedRecord.diagnosis}</p>
              </div>

              <div>
                <span className="text-zinc-500 font-bold uppercase text-[10px] block">Symptoms</span>
                <p className="text-zinc-300 mt-0.5">{selectedRecord.symptoms}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 font-bold uppercase text-[10px] block">Physician Consultation Notes</span>
                <p className="text-zinc-300 leading-relaxed mt-0.5">{selectedRecord.consultationNotes}</p>
              </div>
            </div>

            {/* Prescription List */}
            <div className="p-4 bg-teal-950/40 border border-teal-800/60 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <GoogleIconCircle icon={Pill} color="teal" size="xs" />
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Prescription Orders (Rx)
                </h4>
              </div>

              <div className="space-y-2">
                {selectedRecord.prescriptions.map((rx, idx) => (
                  <div
                    key={rx.id || idx}
                    className="p-3 bg-zinc-900 rounded-xl border border-teal-800/50 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-100 text-sm">{rx.medicineName}</span>
                      <span className="font-mono font-semibold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                        {rx.dosage}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                      <span><strong>Schedule:</strong> {rx.frequency}</span>
                      <span>•</span>
                      <span><strong>Duration:</strong> {rx.duration}</span>
                    </div>
                    {rx.instructions && (
                      <p className="text-zinc-400 text-[11px] italic pt-1">
                        Instructions: {rx.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedRecord.followUpDate && (
              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Next recommended follow-up date: <strong className="text-zinc-200">{selectedRecord.followUpDate}</strong></span>
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MedicalRecordsTable;
