import React, { useState } from 'react';
import { Patient } from '../../types';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { User, Phone, Mail, ShieldAlert, Heart, Calendar, Plus, Eye, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface PatientsTableProps {
  patients: Patient[];
  onAddPatient: () => void;
  canCreate?: boolean;
  onEditPatient?: (patient: Patient) => void;
  onSelectPatient?: (patient: Patient) => void;
  isLoading?: boolean;
}

export const PatientsTable: React.FC<PatientsTableProps> = ({
  patients,
  onAddPatient,
  canCreate = true,
  onEditPatient,
  isLoading = false,
}) => {
  const { currentRole } = useAuth();
  const canViewClinicalDetails = currentRole !== 'receptionist';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.contactNumber.includes(q) ||
      p.bloodGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by MRN, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-700/80 bg-[#181a20] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {canCreate && (
          <Button
            variant="google"
            size="sm"
            onClick={onAddPatient}
            className="self-start sm:self-center font-bold"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Register Patient</span>
          </Button>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-[#181a20] rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14161a] border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Patient Name</th>
                <th className="py-3.5 px-4">MRN</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Contact & Email</th>
                {canViewClinicalDetails && <th className="py-3.5 px-4">Allergies</th>}
                <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={canViewClinicalDetails ? 6 : 5} className="py-12 text-center text-zinc-400">
                    Loading patient database...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={canViewClinicalDetails ? 6 : 5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GoogleIconCircle icon={User} color="green" size="md" />
                      <p className="text-sm font-semibold text-zinc-200">No patients found</p>
                      <p className="text-xs text-zinc-500">
                        Check your search terms or enroll a new patient.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr
                    key={pat.id}
                    className="hover:bg-zinc-800/40 transition-colors duration-100"
                  >
                    {/* Name & Gender */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <GoogleIconCircle icon={User} color="green" size="xs" />
                        <div>
                          <span className="font-bold text-zinc-100 block leading-tight">
                            {pat.fullName}
                          </span>
                          <span className="text-[11px] text-zinc-400 capitalize block mt-0.5">
                            {pat.gender} • DOB: {pat.dateOfBirth}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* MRN */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-xs bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded-lg border border-zinc-700">
                        {pat.mrn}
                      </span>
                    </td>

                    {/* Blood Group */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/60">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-500" />
                        {pat.bloodGroup}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col text-zinc-300">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-zinc-200">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          <span>{pat.contactNumber}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500 truncate max-w-xs mt-0.5">
                          {pat.email}
                        </span>
                      </div>
                    </td>

                    {canViewClinicalDetails && (
                      <td className="py-3.5 px-4">
                        {pat.allergies && pat.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {pat.allergies.map((alg) => (
                              <span key={alg} className="text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded-md">
                                {alg}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-zinc-500 text-[11px]">NKDA (None)</span>}
                      </td>
                    )}

                    {/* Action: View full patient record */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => setSelectedPatientForView(pat)}
                        className="p-1.5 text-blue-400 hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Profile</span>
                      </button>
                      {onEditPatient && (
                        <button
                          onClick={() => onEditPatient(pat)}
                          className="ml-2 p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Profile Modal */}
      {selectedPatientForView && (
        <Modal
          isOpen={!!selectedPatientForView}
          onClose={() => setSelectedPatientForView(null)}
          title={`Clinical Profile: ${selectedPatientForView.fullName}`}
          subtitle={`Hospital Identification: ${selectedPatientForView.mrn}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-zinc-100">
            {/* Quick stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Blood Group</span>
                <span className="font-bold text-zinc-100 text-sm mt-0.5 block">{selectedPatientForView.bloodGroup}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Gender</span>
                <span className="font-bold text-zinc-100 text-sm capitalize mt-0.5 block">{selectedPatientForView.gender}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Date of Birth</span>
                <span className="font-mono text-zinc-200 text-xs mt-0.5 block">{selectedPatientForView.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Registered Date</span>
                <span className="font-mono text-zinc-200 text-xs mt-0.5 block">{selectedPatientForView.createdAt.split('T')[0]}</span>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-zinc-200 uppercase text-[11px] tracking-wider">Contact Details</h4>
              <p className="text-zinc-300"><strong>Phone:</strong> {selectedPatientForView.contactNumber}</p>
              <p className="text-zinc-300"><strong>Email:</strong> {selectedPatientForView.email}</p>
              <p className="text-zinc-300"><strong>Address:</strong> {selectedPatientForView.address}</p>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl space-y-1.5 text-xs">
              <h4 className="font-bold text-amber-300 uppercase text-[11px] tracking-wider">Emergency Contact</h4>
              <p className="text-zinc-200">
                <strong>{selectedPatientForView.emergencyContact.name}</strong> ({selectedPatientForView.emergencyContact.relationship})
              </p>
              <p className="font-mono text-zinc-400">{selectedPatientForView.emergencyContact.phone}</p>
            </div>

            {canViewClinicalDetails && (
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2 text-xs">
                <h4 className="font-bold text-zinc-200 uppercase text-[11px] tracking-wider">Medical Notes</h4>
                <p className="text-zinc-300 leading-relaxed">{selectedPatientForView.medicalHistorySummary}</p>
                <div className="pt-2">
                  <span className="font-semibold text-zinc-300">Known Allergies: </span>
                  {selectedPatientForView.allergies && selectedPatientForView.allergies.length > 0
                    ? <span className="text-rose-400 font-semibold">{selectedPatientForView.allergies.join(', ')}</span>
                    : <span className="text-zinc-500">None reported</span>}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedPatientForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientsTable;