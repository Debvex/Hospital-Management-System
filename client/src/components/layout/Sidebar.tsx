import React from 'react';
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  CreditCard,
  Settings,
  Hospital,
  LogOut,
  X,
} from 'lucide-react';
import GoogleIconCircle, { GoogleColor } from '../ui/GoogleIconCircle';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessPage } from '../../lib/permissions';

export type PageId =
  | 'home'
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'doctors'
  | 'medical-records'
  | 'billing'
  | 'settings';

interface NavItem {
  id: PageId;
  label: string;
  icon: any;
  color: GoogleColor;
  allowedRoles?: ('administrator' | 'doctor' | 'receptionist' | 'patient')[];
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, color: 'blue' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'purple', allowedRoles: ['administrator', 'receptionist'] },
  { id: 'appointments', label: 'Appointments', icon: Calendar, color: 'yellow', allowedRoles: ['administrator', 'doctor', 'receptionist', 'patient'] },
  {
    id: 'patients',
    label: 'Patients',
    icon: Users,
    color: 'green',
    allowedRoles: ['administrator', 'doctor', 'receptionist', 'patient'],
  },
  { id: 'doctors', label: 'Doctors & Schedule', icon: Stethoscope, color: 'purple', allowedRoles: ['administrator', 'receptionist', 'patient'] },
  { id: 'medical-records', label: 'Medical Records', icon: FileText, color: 'teal', allowedRoles: ['administrator', 'doctor', 'patient'] },
  { id: 'billing', label: 'Billing & Invoices', icon: CreditCard, color: 'red', allowedRoles: ['administrator', 'receptionist', 'patient'] },
  {
    id: 'settings',
    label: 'Settings & Audit',
    icon: Settings,
    color: 'slate',
    allowedRoles: ['administrator'],
  },
];

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
}) => {
  const { currentUser, currentRole, logout } = useAuth();

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    return canAccessPage(currentRole, item.id);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#14161a] border-r border-zinc-800 w-64 md:w-72 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <GoogleIconCircle icon={Hospital} color="red" size="md" />
          <div>
            <span className="text-base font-extrabold tracking-tight text-zinc-100 block leading-tight">
              HMS
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-zinc-200" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Operations Menu
          </p>
        </div>

        {filteredNavItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          const label = item.id === 'patients' && currentRole === 'patient' ? 'My Profile' : item.label;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectPage(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 text-left cursor-pointer
                ${
                  isActive
                    ? 'bg-[#1e293b] text-blue-200 shadow-xs border border-blue-700/50'
                    : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <GoogleIconCircle
                  icon={Icon}
                  color={item.color}
                  size="sm"
                />
                <span className="truncate">{label}</span>
              </div>

              {item.badge && (
                <span
                  className={`
                    text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums
                    ${isActive ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}
                  `}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User profile card at bottom */}
      <div className="p-3 border-t border-zinc-800 bg-[#181a20] m-2 rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-100 truncate">
                {currentUser.fullName}
              </p>
              <span className="text-[11px] font-medium text-zinc-400 capitalize block truncate">
                {currentRole}
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            title="Sign out or switch user"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-zinc-400 hover:text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Drawer Overlay for Sidebar with slow uncover motion */}
      <aside
        className={`fixed inset-0 z-50 flex transition-all duration-500 ${
          isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-500'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop with slow uncover fade */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-500 ease-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />

        {/* Drawer panel with slow uncover reveal motion */}
        <div
          className={`relative z-10 w-72 max-w-[85vw] h-full shadow-2xl transition-transform duration-500 ease-out will-change-transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;