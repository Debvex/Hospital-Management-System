import React, { useState } from 'react';
import { PageId } from '../components/layout/Sidebar';
import GoogleIconCircle from '../components/ui/GoogleIconCircle';
import { Button } from '../components/ui/Button';
import { SplitText, SplitWords } from '../components/ui/SplitText';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  HeartHandshake,
  Shield,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: PageId) => void;
  onOpenBooking: () => void;
}

export const HomePage: React.FC<HomeProps> = ({ onNavigate, onOpenBooking }) => {
  const [animKey, setAnimKey] = useState(0);

  const modules = [
    {
      id: 'dashboard' as PageId,
      title: 'Clinical Operations Dashboard',
      subtitle: 'Real-time telemetry & KPI tracking',
      description:
        'Live overview of today’s patient queue, active specialist rosters, room occupancy, revenue summaries, and quick-action modals.',
      icon: LayoutDashboard,
      color: 'blue' as const,
      badge: 'Real-time',
    },
    {
      id: 'appointments' as PageId,
      title: 'Outpatient Appointments (OPD)',
      subtitle: 'Conflict-free slot reservation engine',
      description:
        'Book and manage consultations with automated 30-minute conflict detection (409 protection), status tracking, and doctor schedule alignment.',
      icon: Calendar,
      color: 'yellow' as const,
      badge: 'Active Booking',
    },
    {
      id: 'patients' as PageId,
      title: 'Patient Directory & EMR',
      subtitle: 'Verified MRN health registries',
      description:
        'Master patient index with Medical Record Numbers (MRN), demographic records, blood group profiling, allergy warnings, and emergency contacts.',
      icon: Users,
      color: 'green' as const,
      badge: 'EMR Records',
    },
    {
      id: 'doctors' as PageId,
      title: 'Medical Faculty & Schedules',
      subtitle: 'Specialist rosters & consultation rooms',
      description:
        'Departmental faculty profiles across Cardiology, Neurology, Pediatrics, Orthopedics, and General Medicine with weekly OPD hours and consultation fees.',
      icon: Stethoscope,
      color: 'purple' as const,
      badge: '5 Departments',
    },
    {
      id: 'medical-records' as PageId,
      title: 'Clinical Notes & Prescriptions',
      subtitle: 'Digital diagnostic & Rx repository',
      description:
        'Structured clinical encounters, physician diagnoses, symptom timelines, typed prescriptions with dosages, and diagnostic lab test orders.',
      icon: FileText,
      color: 'teal' as const,
      badge: 'Clinical EHR',
    },
    {
      id: 'billing' as PageId,
      title: 'Billing & Financial Invoices',
      subtitle: 'Itemized billing & payment settlement',
      description:
        'Transparent hospital billing with automated fee aggregation, tax calculation, insurance reconciliation, and downloadable receipts.',
      icon: CreditCard,
      color: 'red' as const,
      badge: 'Cash & Card',
    },
    {
      id: 'settings' as PageId,
      title: 'Security, RBAC & Audit Ledger',
      subtitle: 'Role-based access & compliance logs',
      description:
        'Multi-role access governance (Administrator, Doctor, Receptionist, Patient) with real-time immutable audit trails for every clinical and administrative event.',
      icon: ShieldCheck,
      color: 'slate' as const,
      badge: 'HIPAA Standard',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Patient Intake & Registration',
      desc: 'Create verified Medical Record Number (MRN) with health history, contact information, and blood group categorization.',
      icon: Users,
      color: 'green' as const,
    },
    {
      step: '02',
      title: 'Specialist Booking & Triage',
      desc: 'Select department doctor with conflict-free availability checks, outpatient room allocation, and instant confirmation.',
      icon: Calendar,
      color: 'yellow' as const,
    },
    {
      step: '03',
      title: 'Clinical Consultation',
      desc: 'Doctor examines vitals, logs diagnosis notes, prescribes medication dosages, and orders required diagnostic laboratory tests.',
      icon: Stethoscope,
      color: 'purple' as const,
    },
    {
      step: '04',
      title: 'Itemized Billing & Settlement',
      desc: 'System aggregates doctor fees, procedures, and taxes into a transparent invoice with instant receipt generation.',
      icon: CreditCard,
      color: 'red' as const,
    },
  ];

  const systemFeatures = [
    {
      title: 'Conflict-Free Scheduling Guard',
      desc: 'Built-in slot overlap prevention halts double-booking of specialist doctors and clinical consultation rooms.',
      icon: Zap,
    },
    {
      title: 'Multi-Role Clinical Access (RBAC)',
      desc: 'Distinct granular workspaces tailored specifically for Administrators, Doctors, Receptionists, and Self-Service Patients.',
      icon: Shield,
    },
    {
      title: 'Centralized Electronic Health Records',
      desc: 'Instant chronological access to historical diagnoses, clinical notes, typed prescriptions, and lab investigations.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Departmental Faculty Management',
      desc: 'Unified rosters covering Cardiology, Neurology, Pediatrics, Orthopedics, and General Outpatient Medicine.',
      icon: Building2,
    },
  ];

  return (
    <div className="relative text-zinc-100 pb-12 space-y-10">
      {/* Decorative ambient lighting for the page */}
      <div className="absolute -top-10 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section with Reuters hospital image background - 100% width, 50% page height just below navbar */}
      <section className="relative w-full min-h-[50vh] flex flex-col justify-center overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/60 bg-[#121418]">
        {/* Reuters Hospital Ward Photo (100% width, 50% page height, opacity: 0.7) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <img
            src="/images/reuters-hospital-ward.jpg"
            alt="Hospital Medical Care Ward - Reuters"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://cloudfront-us-east-2.images.arcpublishing.com/reuters/5L2BZPABWJKGBDMVVAMKVSCR6Y.jpg';
            }}
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.7 }}
          />
          {/* Subtle gradient overlays for text contrast and blending into the page */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12]/92 via-[#0d0f12]/75 to-[#0d0f12]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-black/30" />
        </div>

        {/* Hero Section Content on top of the image */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-4xl space-y-5">
            {/* Top pill with replay trigger */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                Modern Clinical Architecture
              </span>
              <button
                onClick={() => setAnimKey((k) => k + 1)}
                title="Replay split text animation"
                className="group inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-700/60 transition-all cursor-pointer backdrop-blur-md"
              >
                <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
                <span>Replay Animation</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              <SplitText
                animationKey={`title-${animKey}`}
                text="Streamlined Clinical Care & Hospital Operations"
                startDelay={0.06}
                charDelay={0.02}
              />
            </h1>

            <p className="text-zinc-200 text-sm sm:text-base leading-relaxed max-w-3xl drop-shadow-sm font-medium">
              <SplitWords
                animationKey={`desc-${animKey}`}
                text="Welcome to HMS, a comprehensive healthcare management platform engineered to connect clinical medicine with administrative efficiency. Coordinate outpatient consultations, manage verified electronic medical records, maintain specialist departmental schedules, and reconcile billing—all within an intuitive, secure interface."
                startDelay={0.42}
                wordDelay={0.016}
              />
            </p>

            {/* Call to Action buttons */}
            <div
              key={`cta-${animKey}`}
              className="flex flex-wrap items-center gap-3 pt-2 animate-split-word"
              style={{ animationDelay: '0.85s' }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('dashboard')}
                className="gap-2 shadow-lg shadow-blue-900/40"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Operations Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onOpenBooking}
                className="gap-2 border-zinc-600 bg-zinc-900/85 hover:bg-zinc-800 text-zinc-100 backdrop-blur-xs"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Book Appointment</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('doctors')}
                className="gap-2 border-zinc-600 bg-zinc-900/85 hover:bg-zinc-800 text-zinc-100 backdrop-blur-xs"
              >
                <Stethoscope className="w-4 h-4 text-purple-400" />
                <span>View Specialists</span>
              </Button>
            </div>
          </div>

          {/* Quick Highlights Metrics Bar */}
          <div
            key={`metrics-${animKey}`}
            className="mt-8 pt-4 border-0 border-transparent grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl animate-split-word"
            style={{ animationDelay: '1.05s' }}
          >
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono block drop-shadow-sm">100%</span>
              <span className="text-xs text-zinc-300 font-medium">Slot Conflict Guard</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono block drop-shadow-sm">4-Tier</span>
              <span className="text-xs text-zinc-300 font-medium">Role-Based Security</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono block drop-shadow-sm">Real-Time</span>
              <span className="text-xs text-zinc-300 font-medium">Immutable Audit Trail</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Home Page Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full">

      {/* Direct Module Navigation Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
              <SplitText
                animationKey={`modules-title-${animKey}`}
                text="Hospital Modules & Portals"
                startDelay={0.15}
                charDelay={0.02}
              />
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Explore interconnected departmental tools or jump directly into any subsystem.
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-500 self-start sm:self-auto">
            Click any card to launch module
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="group bg-[#181a20] rounded-3xl p-5 border border-zinc-800 shadow-xs hover:border-zinc-700 hover:shadow-xl hover:bg-[#1c1f26] transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <GoogleIconCircle icon={mod.icon} color={mod.color} size="md" />
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mt-0.5 mb-2">
                  {mod.subtitle}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                <span>Access Module</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* End-to-End Clinical Lifecycle Workflow */}
      <section className="bg-[#181a20] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <HeartHandshake className="w-4 h-4 text-blue-400" />
            <span>Operational Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            <SplitText
              animationKey={`lifecycle-title-${animKey}`}
              text="End-to-End Patient Care Lifecycle"
              startDelay={0.2}
              charDelay={0.02}
            />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            From arrival to consultation, treatment documentation, and discharge billing, HMS automates each transition while maintaining data integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((wf, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-zinc-500 font-mono">
                    STEP {wf.step}
                  </span>
                  <GoogleIconCircle icon={wf.icon} color={wf.color} size="sm" />
                </div>
                <h4 className="font-bold text-zinc-100 text-sm mb-1.5">{wf.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{wf.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Features & Architecture */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemFeatures.map((feat, idx) => (
          <div
            key={idx}
            className="bg-[#181a20] rounded-3xl p-6 border border-zinc-800 flex items-start gap-4 shadow-xs"
          >
            <div className="p-2.5 rounded-2xl bg-zinc-800/80 text-blue-400 shrink-0 border border-zinc-700/60">
              <feat.icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100">{feat.title}</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </section>
      </div>
    </div>
  );
};

export default HomePage;
