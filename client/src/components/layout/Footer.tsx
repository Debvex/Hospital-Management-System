import React from 'react';
import { PageId } from './Sidebar';
import {
  Hospital,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Activity,
  ChevronRight,
  Stethoscope,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Settings,
  LayoutDashboard,
  Home,
} from 'lucide-react';
import GoogleIconCircle from '../ui/GoogleIconCircle';

interface FooterProps {
  onSelectPage: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectPage }) => {
  const currentYear = new Date().getFullYear();

  const navigationColumns = [
    {
      title: 'Clinical Operations',
      links: [
        { label: 'Home & Overview', page: 'home' as PageId, icon: Home },
        { label: 'Live KPI Dashboard', page: 'dashboard' as PageId, icon: LayoutDashboard },
        { label: 'Appointments & OPD', page: 'appointments' as PageId, icon: Calendar },
        { label: 'Patient Directory', page: 'patients' as PageId, icon: Users },
      ],
    },
    {
      title: 'Medical & Administration',
      links: [
        { label: 'Specialists & Rosters', page: 'doctors' as PageId, icon: Stethoscope },
        { label: 'Medical EHR Records', page: 'medical-records' as PageId, icon: FileText },
        { label: 'Billing & Invoices', page: 'billing' as PageId, icon: CreditCard },
        { label: 'Settings & Audit Logs', page: 'settings' as PageId, icon: Settings },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#121418] border-t border-zinc-800 text-zinc-300 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <GoogleIconCircle icon={Hospital} color="blue" size="md" />
              <div>
                <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  HMS
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-[#000000] text-white border-2 border-white font-mono">
                    Enterprise
                  </span>
                </span>
                <p className="text-xs text-zinc-400 font-medium">Hospital Management System</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Integrated clinical administration, real-time doctor scheduling, verified electronic medical records, and transparent patient billing designed for high-standard medical facilities.
            </p>

            {/* Compliance & Availability Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#000000] text-[#fcfcfc] border-2 border-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                HIPAA Compliant
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#000103] text-white border-2 border-white">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                24/7 OPD & Triage
              </span>
            </div>
          </div>

          {/* Nav Links Column 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5 flex items-center gap-1.5">
              <span>{navigationColumns[0].title}</span>
            </h4>
            <ul className="space-y-2">
              {navigationColumns[0].links.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => {
                      onSelectPage(link.page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors text-left"
                  >
                    <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transform group-hover:translate-x-0.5 transition-all" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Links Column 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5 flex items-center gap-1.5">
              <span>{navigationColumns[1].title}</span>
            </h4>
            <ul className="space-y-2">
              {navigationColumns[1].links.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => {
                      onSelectPage(link.page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors text-left"
                  >
                    <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transform group-hover:translate-x-0.5 transition-all" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details & Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3.5">
              Contact & Helplines
            </h4>

            <div className="space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-zinc-200 font-mono font-medium">+91 3830093034</span>
                  <span className="text-[11px] text-zinc-500">24/7 Emergency & Triage Hotline</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-zinc-200 font-medium">contact@modern-hms.health</span>
                  <span className="text-[11px] text-zinc-500">General OPD & Patient Inquiries</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-zinc-200">742 Evergreen Healthcare Way</span>
                  <span className="text-[11px] text-zinc-500">Metro Medical City, Suite 400</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-zinc-200">Emergency OPD: 24/7/365</span>
                  <span className="text-[11px] text-zinc-500">Specialist Clinics: 08:00 - 20:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal line without 'all systems operational' */}
        <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>&copy; {currentYear} CarePulse HMS. Designed for modern healthcare infrastructure.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-zinc-700">•</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Patient Health Information (PHI)</span>
            <span className="text-zinc-700">•</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Audit & Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
