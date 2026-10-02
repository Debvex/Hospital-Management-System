import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { api } from '../../lib/api';
import { Patient } from '../../types';
import { BLOOD_GROUPS } from '../../lib/constants';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  initialData?: Patient | null;
  selfService?: boolean;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  selfService = false,
}) => {
  const { success, error } = useToast();
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '1995-05-15');
  const [gender, setGender] = useState<Patient['gender']>(initialData?.gender || 'male');
  const [bloodGroup, setBloodGroup] = useState<Patient['bloodGroup']>(initialData?.bloodGroup || 'O+');
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || '+1 (555) 000-0000');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [emergencyName, setEmergencyName] = useState(initialData?.emergencyContact.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(initialData?.emergencyContact.relationship || 'Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState(initialData?.emergencyContact.phone || '+1 (555) 000-1111');
  const [allergiesText, setAllergiesText] = useState(initialData?.allergies?.join(', ') || '');
  const [historySummary, setHistorySummary] = useState(initialData?.medicalHistorySummary || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !contactNumber) {
      error('Validation Error', 'Full Name and Contact Number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const allergies = allergiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const patientData = {
        fullName,
        dateOfBirth,
        gender,
        bloodGroup,
        contactNumber,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@patient.test`,
        address: address || 'Metro City Healthcare District',
        emergencyContact: {
          name: emergencyName || 'Primary Relative',
          relationship: emergencyRelation,
          phone: emergencyPhone,
        },
        allergies,
        medicalHistorySummary: historySummary || 'No reported prior chronic conditions.',
      };
      const saved = selfService && initialData
        ? await api.patients.update(initialData.id, {
            contactNumber,
            address,
            emergencyContact: {
              name: emergencyName,
              relationship: emergencyRelation,
              phone: emergencyPhone,
            },
          })
        : await api.patients.create(patientData);

      success(selfService ? 'Profile Updated' : 'Patient Registered', selfService ? 'Your contact details were updated.' : `${saved.fullName} enrolled with ID ${saved.mrn}`);
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      error('Registration Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selfService ? 'Edit My Profile' : initialData ? 'Edit Patient Record' : 'Register New Patient'}
      subtitle={selfService ? 'Update your contact details and emergency contact.' : 'Complete clinical profile, emergency contacts, and medical history'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!selfService && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Johnathan Doe"
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
        )}

        <div className={`grid grid-cols-1 gap-4 ${selfService ? 'sm:grid-cols-1' : 'sm:grid-cols-3'}`}>
          {!selfService && (
            <>
              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Patient['gender'])}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Select
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as Patient['bloodGroup'])}
              >
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </Select>
            </>
          )}
          <Input
            label="Contact Phone"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="+1 (555) 000-0000"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!selfService && <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@example.test"
          />}

          <Input
            label="Residential Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Health Ave, Springfield"
          />
        </div>

        {/* Emergency Contact Sub-Form */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Emergency Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Contact Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
            <Input
              label="Relationship"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              placeholder="Spouse / Parent"
            />
            <Input
              label="Emergency Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+1 (555) 000-1111"
            />
          </div>
        </div>

        {!selfService && <div className="space-y-1.5">
          <Input
            label="Known Drug Allergies (comma-separated)"
            value={allergiesText}
            onChange={(e) => setAllergiesText(e.target.value)}
            placeholder="e.g. Penicillin, Aspirin, Sulfa drugs"
          />
        </div>}

        {!selfService && <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Medical History Summary
          </label>
          <textarea
            value={historySummary}
            onChange={(e) => setHistorySummary(e.target.value)}
            rows={2}
            className="w-full rounded-2xl border border-zinc-700/80 bg-[#181a20] p-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-zinc-500"
            placeholder="Known chronic illnesses, previous surgeries, or conditions..."
          />
        </div>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="google" isLoading={isSubmitting}>
            {selfService || initialData ? 'Save Changes' : 'Enroll Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientModal;