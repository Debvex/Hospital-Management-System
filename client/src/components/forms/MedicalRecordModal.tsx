import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { api } from '../../lib/api';
import { Appointment, MedicalRecord, PrescriptionItem } from '../../types';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { Plus, Trash2, Pill, Activity } from 'lucide-react';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: MedicalRecord) => void;
  appointment?: Appointment | null;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}) => {
  const { success, error } = useToast();

  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [bp, setBp] = useState('120/80 mmHg');
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(36.6);
  const [weight, setWeight] = useState(70);
  const [spo2, setSpo2] = useState(99);
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'p-1',
      medicineName: 'Amoxicillin Trihydrate',
      dosage: '500mg',
      frequency: 'Every 8 hours with meals',
      duration: '7 days',
      instructions: 'Complete full course even if symptoms subside',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setSymptoms(appointment.reason || 'Reported symptoms during consultation.');
      setDiagnosis('Acute uncomplicated consultation diagnosis.');
      setConsultationNotes('Patient evaluated in outpatient clinic. Vital signs stable.');
    }
  }, [appointment]);

  const addPrescriptionItem = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        medicineName: '',
        dosage: '100mg',
        frequency: 'Once daily after breakfast',
        duration: '14 days',
        instructions: 'Take with full glass of water',
      },
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) {
      error('Error', 'No appointment selected.');
      return;
    }
    if (!diagnosis || !consultationNotes) {
      error('Validation Error', 'Diagnosis and Consultation Notes are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await api.medicalRecords.create({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        symptoms,
        diagnosis,
        consultationNotes,
        vitals: {
          bloodPressure: bp,
          heartRate: Number(hr),
          temperature: Number(temp),
          weightKg: Number(weight),
          oxygenSaturation: Number(spo2),
        },
        prescriptions: prescriptions.filter((p) => p.medicineName.trim().length > 0),
        followUpDate: followUpDate || undefined,
      });

      success('Clinical Record & Rx Created', `Prescription generated for ${record.patientName}`);
      onSuccess(record);
      onClose();
    } catch (err: any) {
      error('Failed to Save Record', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Clinical Record & Prescription"
      subtitle={`Encounter for ${appointment?.patientName || 'Patient'} (${appointment?.patientMrn || ''})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-100">
        {/* Patient & Doctor strip */}
        <div className="flex flex-wrap items-center justify-between p-3.5 bg-blue-950/60 border border-blue-800/60 rounded-2xl text-xs text-blue-200">
          <div>
            <span className="text-zinc-400">Patient: </span>
            <strong className="text-zinc-100">{appointment?.patientName}</strong>
            <span className="mx-2 text-zinc-600">•</span>
            <span className="font-mono text-blue-300">{appointment?.patientMrn}</span>
          </div>
          <div>
            <span className="text-zinc-400">Doctor: </span>
            <strong className="text-zinc-100">{appointment?.doctorName}</strong>
          </div>
        </div>

        {/* Vital Signs Row */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <GoogleIconCircle icon={Activity} color="green" size="xs" />
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Encounter Vitals
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <Input
              label="BP (mmHg)"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              placeholder="120/80"
            />
            <Input
              label="Heart Rate"
              type="number"
              value={hr}
              onChange={(e) => setHr(Number(e.target.value))}
            />
            <Input
              label="Temp (°C)"
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
            <Input
              label="SpO2 (%)"
              type="number"
              value={spo2}
              onChange={(e) => setSpo2(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Clinical Symptoms and Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Chief Symptoms / Subjective Complaints"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Reported symptoms"
            required
          />

          <Input
            label="Clinical Diagnosis (ICD or Medical Terms)"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Essential Hypertension, Acute Bronchitis"
            required
          />
        </div>

        {/* Doctor Consultation Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Consultation Findings & Clinical Plan
          </label>
          <textarea
            value={consultationNotes}
            onChange={(e) => setConsultationNotes(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-zinc-700/80 bg-[#181a20] p-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-zinc-500"
            placeholder="Doctor's objective examination observations, test recommendations, and care plan..."
            required
          />
        </div>

        {/* Prescription Items (Rx) */}
        <div className="p-4 bg-teal-950/40 border border-teal-800/60 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GoogleIconCircle icon={Pill} color="teal" size="xs" />
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Prescription Items (Rx)
              </h4>
            </div>
            <button
              type="button"
              onClick={addPrescriptionItem}
              className="text-xs font-bold text-teal-200 bg-teal-900 hover:bg-teal-800 border border-teal-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-200" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {prescriptions.map((rx, idx) => (
              <div
                key={rx.id}
                className="p-3 bg-zinc-900 rounded-xl border border-teal-800/50 shadow-2xs space-y-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input
                    placeholder="Medicine Name (e.g. Metformin)"
                    value={rx.medicineName}
                    onChange={(e) => updatePrescriptionItem(idx, 'medicineName', e.target.value)}
                  />
                  <Input
                    placeholder="Dosage (e.g. 500mg)"
                    value={rx.dosage}
                    onChange={(e) => updatePrescriptionItem(idx, 'dosage', e.target.value)}
                  />
                  <Input
                    placeholder="Frequency (e.g. BD pc)"
                    value={rx.frequency}
                    onChange={(e) => updatePrescriptionItem(idx, 'frequency', e.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Duration (7 days)"
                      value={rx.duration}
                      onChange={(e) => updatePrescriptionItem(idx, 'duration', e.target.value)}
                    />
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescriptionItem(idx)}
                        className="p-2 text-zinc-400 hover:text-rose-400 rounded-lg cursor-pointer"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4 text-zinc-400 hover:text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
                <Input
                  placeholder="Patient Instructions (e.g. Take with warm water before meals)"
                  value={rx.instructions}
                  onChange={(e) => updatePrescriptionItem(idx, 'instructions', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up date */}
        <div className="w-full sm:w-1/2">
          <Input
            label="Recommended Follow-up Date (Optional)"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="google" isLoading={isSubmitting}>
            Save Record & Complete Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MedicalRecordModal;
