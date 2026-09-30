import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';
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
  const { currentRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

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

        {/* Center / Right Zone: Search, Role Switcher, Notifications, Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick role switcher for lab evaluations */}
          <div className="hidden lg:block">
            <RoleSwitcher compact />
          </div>

          {/* Quick Action Button: Book Appointment */}
          <Button
            variant="google"
            size="sm"
            onClick={onOpenBookAppointment}
            className="font-bold flex items-center"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span className="hidden sm:inline">Book Appointment</span>
            <span className="sm:hidden">Book</span>
          </Button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 rounded-full hover:bg-zinc-800 transition-colors relative cursor-pointer"
              aria-label="View notifications"
            >
              <GoogleIconCircle
                icon={Bell}
                color="yellow"
                size="sm"
                interactive
                badge={notifications.length}
              />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181a20] rounded-3xl shadow-2xl border border-zinc-800 p-4 z-40 animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-2">
                    <h3 className="text-sm font-bold text-zinc-100">Hospital Notifications</h3>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Live Queue Feed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {notifications.map((n) => (
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
        </div>
      </div>
    </header>
  );
};

export default Topbar;
