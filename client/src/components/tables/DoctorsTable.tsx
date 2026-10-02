import React, { useState } from 'react';
import { Doctor } from '../../types';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { Stethoscope, Clock, Calendar, MapPin, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { DEPARTMENTS } from '../../lib/constants';

interface DoctorsTableProps {
  doctors: Doctor[];
  onBookWithDoctor: (doctorId: string) => void;
  isLoading?: boolean;
}

export const DoctorsTable: React.FC<DoctorsTableProps> = ({
  doctors,
  onBookWithDoctor,
  isLoading = false,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDept === 'all') return true;
    return doc.departmentId === selectedDept;
  });

  return (
    <div className="space-y-4">
      {/* Department Filter tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700/80 overflow-x-auto">
        <button
          onClick={() => setSelectedDept('all')}
          className={`
            px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
            ${selectedDept === 'all' ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'}
          `}
        >
          All Departments
        </button>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
              ${selectedDept === dept.id ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'}
            `}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doc) => {
          return (
            <div
              key={doc.id}
              className="bg-[#181a20] rounded-3xl border border-zinc-800 p-5 shadow-xs hover:border-zinc-700 hover:shadow-lg transition-all duration-200 flex flex-col justify-between text-zinc-100"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <GoogleIconCircle
                      icon={Stethoscope}
                      color={doc.avatarColor}
                      size="md"
                    />
                    <div>
                      <h3 className="font-bold text-zinc-100 text-sm leading-tight">
                        {doc.fullName}
                      </h3>
                      <span className="text-xs text-blue-400 font-semibold block mt-0.5">
                        {doc.departmentName}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    ₹{doc.consultationFee}
                  </span>
                </div>

                {/* Subtitle / Specialization */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {doc.specialization}
                </p>

                {/* Meta details */}
                <div className="mt-3.5 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-zinc-300">{doc.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{doc.experienceYears} Years Clinical Experience</span>
                  </div>
                </div>

                {/* Availability Preview */}
                <div className="mt-3 p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      Weekly OPD Hours
                    </span>
                    <span className="text-emerald-400">Available</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-400">
                    {doc.availability.slice(0, 2).map((av) => (
                      <div key={av.id} className="flex items-center justify-between">
                        <span>{av.dayOfWeek}:</span>
                        <span className="font-mono tabular-nums text-zinc-300">{av.startTime} - {av.endTime}</span>
                      </div>
                    ))}
                    {doc.availability.length > 2 && (
                      <span className="text-[10px] text-zinc-500 block pt-0.5">
                        +{doc.availability.length - 2} additional clinic days
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">30 min slots</span>
                <Button
                  size="sm"
                  variant="google"
                  onClick={() => onBookWithDoctor(doc.id)}
                  className="text-xs h-8 px-3 font-bold"
                >
                  <span>Book Slot</span>
                  <ChevronRight className="w-3.5 h-3.5 text-black" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorsTable;