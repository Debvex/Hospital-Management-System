import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import GoogleIconCircle from '../components/ui/GoogleIconCircle';
import { Hospital, ShieldCheck, Stethoscope, UserCheck, User, Lock, Mail } from 'lucide-react';
import { UserRole } from '../types';
import { useToast } from '../components/ui/Toast';

interface LoginProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState('administrator@example.test');
  const [password, setPassword] = useState('Password@123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      error('Validation Error', 'Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email);
      success('Authenticated Successfully', `Welcome to CarePulse HMS`);
      onSuccess();
    } catch (err: any) {
      error('Authentication Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, role: UserRole) => {
    setEmail(demoEmail);
    setIsLoading(true);
    try {
      await login(demoEmail, role);
      success('Logged In', `Switched to ${role.toUpperCase()} profile`);
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f1115] text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex">
            <GoogleIconCircle icon={Hospital} color="red" size="xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            HMS
          </h1>
          <p className="text-xs text-zinc-400">
            Google App Themed Hospital Management System
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#181a20] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Staff / Patient Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. doctor@example.test"
              icon={<Mail className="w-4 h-4 text-zinc-400" />}
              required
            />

            <Input
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={<Lock className="w-4 h-4 text-zinc-400" />}
              required
            />

            <Button
              type="submit"
              variant="google"
              size="lg"
              className="w-full font-bold"
              isLoading={isLoading}
            >
              Sign In to HMS Portal
            </Button>
          </form>

          {/* Quick Demo Logins for Examiner & Lab Testing */}
          <div className="pt-4 border-t border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                1-Click Laboratory Test Accounts
              </span>
              <span className="text-[10px] text-blue-400 font-semibold font-mono">
                RBAC
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('administrator@example.test', 'administrator')}
                className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center gap-2 text-left cursor-pointer"
              >
                <GoogleIconCircle icon={ShieldCheck} color="purple" size="xs" />
                <div>
                  <span className="font-bold text-zinc-100 block leading-none">Admin</span>
                  <span className="text-[10px] text-zinc-400">Full System</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor@example.test', 'doctor')}
                className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center gap-2 text-left cursor-pointer"
              >
                <GoogleIconCircle icon={Stethoscope} color="blue" size="xs" />
                <div>
                  <span className="font-bold text-zinc-100 block leading-none">Doctor</span>
                  <span className="text-[10px] text-zinc-400">Clinical Rx</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('receptionist@example.test', 'receptionist')}
                className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center gap-2 text-left cursor-pointer"
              >
                <GoogleIconCircle icon={UserCheck} color="yellow" size="xs" />
                <div>
                  <span className="font-bold text-zinc-100 block leading-none">Receptionist</span>
                  <span className="text-[10px] text-zinc-400">Admissions/Bills</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patient@example.test', 'patient')}
                className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center gap-2 text-left cursor-pointer"
              >
                <GoogleIconCircle icon={User} color="green" size="xs" />
                <div>
                  <span className="font-bold text-zinc-100 block leading-none">Patient</span>
                  <span className="text-[10px] text-zinc-400">Self-service</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
