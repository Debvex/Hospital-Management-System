import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  LogOut,
  UserPlus,
} from 'lucide-react';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { SplitText } from '../ui/SplitText';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenBookAppointment: () => void;
  pageTitle: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onOpenBookAppointment,
  pageTitle,
}) => {
  const { currentRole, currentUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Dr. Sarah Jenkins is on consultation duty',
      time: '10m ago',
      type: 'info',
      icon: Clock,
      color: 'blue' as const,
    },
    {
      id: 2,
      title: 'Appointment slot conflict validation active (409 protection)',
      time: '35m ago',
      type: 'success',
      icon: CheckCircle,
      color: 'green' as const,
    },
    {
      id: 3,
      title: '2 pending unpaid invoices ready for billing desk review',
      time: '1h ago',
      type: 'warning',
      icon: AlertTriangle,
      color: 'yellow' as const,
    },
  ];
  const visibleNotifications = notifications.filter((notification) =>
    notification.id !== 3 || currentRole === 'administrator' || currentRole === 'receptionist',
  );

  return (
    <header className="sticky top-0 z-20 bg-[#14161a]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left Zone: Menu toggle + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-2xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Toggle navigation menu"
            title="Open menu"
          >
            <Menu className="w-5 h-5 text-zinc-200" />
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-zinc-100 tracking-tight leading-snug">
              <SplitText
                animationKey={pageTitle}
                text={pageTitle}
                startDelay={0.04}
                charDelay={0.018}
              />
            </h1>
          </div>
        </div>

        {/* Center / Right Zone: Notifications and account actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Action Button: Book Appointment */}
          {currentRole !== 'doctor' && (
            <Button
              variant="google"
              size="sm"
              onClick={onOpenBookAppointment}
              className="font-bold flex items-center h-9 shrink-0"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </Button>
          )}

          {/* Notifications Popover */}
          <div className="relative flex items-center shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 rounded-full hover:bg-zinc-800 transition-colors relative cursor-pointer flex items-center justify-center h-9 w-9"
              aria-label="View notifications"
            >
              <GoogleIconCircle
                icon={Bell}
                color="yellow"
                size="sm"
                interactive
                badge={visibleNotifications.length}
              />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#181a20] rounded-3xl shadow-2xl border border-zinc-800 p-4 z-40 animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-2">
                    <h3 className="text-sm font-bold text-zinc-100">Hospital Notifications</h3>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Live Queue Feed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {visibleNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-800/60 transition-colors"
                      >
                        <GoogleIconCircle icon={n.icon} color={n.color} size="xs" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 leading-snug">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-zinc-500 mt-0.5 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Account Popover */}
          <div className="relative flex items-center shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 h-9 px-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 hover:border-zinc-600 transition-all cursor-pointer text-left select-none shrink-0"
              aria-label="User account menu"
              title="Account & Authentication"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                {currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:flex flex-col justify-center leading-none pr-0.5">
                <span className="text-xs font-bold text-zinc-100 truncate max-w-27.5">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium capitalize mt-0.5">
                  {currentRole}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#181a20] rounded-3xl shadow-2xl border border-zinc-800 p-4 z-40 animate-in fade-in zoom-in-95 duration-150 text-zinc-100 space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-100 truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                        {currentRole}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout('signup');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>Create Patient Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout('signin');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;