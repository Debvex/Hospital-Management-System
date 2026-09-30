import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../lib/constants';
import { UserRole } from '../../types';
import GoogleIconCircle from '../ui/GoogleIconCircle';
import { ShieldCheck, Stethoscope, UserCheck, User, Sparkles } from 'lucide-react';
import { useToast } from '../ui/Toast';

const roleIcons: Record<UserRole, any> = {
  administrator: ShieldCheck,
  doctor: Stethoscope,
  receptionist: UserCheck,
  patient: User,
};

export const RoleSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentRole, switchRole, currentUser } = useAuth();
  const { info } = useToast();

  const handleSwitch = (role: UserRole) => {
    switchRole(role);
    info(
      `Role Switched to ${role.toUpperCase()}`,
      `Viewing HMS through ${role} permissions and customized clinical workflows.`
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-zinc-800/80 rounded-2xl border border-zinc-700">
        {USER_ROLES.map(({ role, label, color }) => {
          const isActive = currentRole === role;
          const Icon = roleIcons[role];
          return (
            <button
              key={role}
              onClick={() => handleSwitch(role)}
              title={`Switch role to ${label}`}
              className={`
                px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer
                ${isActive ? 'bg-zinc-900 text-white shadow-xs border border-zinc-600' : 'text-zinc-400 hover:text-white'}
              `}
            >
              <GoogleIconCircle
                icon={Icon}
                color={color}
                size="xs"
              />
              <span className="hidden sm:inline capitalize">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-[#181a20] border border-zinc-800 rounded-3xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <GoogleIconCircle icon={Sparkles} color="yellow" size="sm" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Interactive Lab Role Switcher (RBAC)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Currently acting as <strong className="text-zinc-100 capitalize">{currentUser.fullName}</strong> ({currentRole})
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 self-start sm:self-center">
          IEEE Lab Demo Mode
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {USER_ROLES.map(({ role, label, description, color }) => {
          const isActive = currentRole === role;
          const Icon = roleIcons[role];

          return (
            <button
              key={role}
              onClick={() => handleSwitch(role)}
              className={`
                flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? 'bg-[#1e293b] border-blue-500/80 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
                }
              `}
            >
              <div className="flex items-center mb-1.5">
                <GoogleIconCircle icon={Icon} color={color} size="sm" />
              </div>
              <span className="text-xs font-bold text-zinc-100">{label}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSwitcher;
