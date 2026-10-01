import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import GoogleIconCircle from '../components/ui/GoogleIconCircle';
import {
  Hospital,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Phone,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';
import { UserRole } from '../types';
import { useToast } from '../components/ui/Toast';
import {
  checkPasswordStrength,
  validateRegistration,
  validateLogin,
  RegisterFormData,
} from '../lib/validation';
import { SplitText } from '../components/ui/SplitText';
import { api } from '../lib/api';

interface LoginProps {
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

export const LoginPage: React.FC<LoginProps> = ({ onSuccess, initialMode = 'signin' }) => {
  const { login, register } = useAuth();
  const { success, error, info } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('administrator@example.test');
  const [loginPassword, setLoginPassword] = useState('Password@123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Sign Up State
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    contactNumber: '',
    dateOfBirth: '',
    gender: 'female',
    bloodGroup: 'O+',
    specialization: '',
    departmentId: 'dept-1',
    qualification: '',
    staffBadgeId: '',
    acceptedTerms: false,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const passwordStrength = checkPasswordStrength(registerData.password);

  // Handle Login Submit
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginErrors({});

    const validation = validateLogin({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.isValid) {
      setLoginErrors(validation.errors);
      error('Validation Error', Object.values(validation.errors)[0]);
      return;
    }

    setIsLoading(true);
    try {
      await login(loginEmail, undefined, loginPassword);
      success('Authenticated Successfully', `Welcome to CarePulse HMS`);
      onSuccess();
    } catch (err: any) {
      error('Authentication Failed', err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});

    const validation = validateRegistration(registerData);
    if (!validation.isValid) {
      setRegErrors(validation.errors);
      error('Validation Failed', Object.values(validation.errors)[0]);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        contactNumber: registerData.contactNumber,
        dateOfBirth: registerData.dateOfBirth,
        gender: registerData.gender,
        bloodGroup: registerData.bloodGroup,
        specialization: registerData.specialization,
        departmentId: registerData.departmentId,
        departmentName:
          registerData.departmentId === 'dept-1'
            ? 'Cardiology'
            : registerData.departmentId === 'dept-2'
            ? 'Neurology'
            : 'General Medicine',
        qualification: registerData.qualification,
        staffBadgeId: registerData.staffBadgeId,
      });

      success(
        'Account Registered!',
        `Welcome ${registerData.fullName}, your ${registerData.role.toUpperCase()} profile is active.`
      );
      onSuccess();
    } catch (err: any) {
      error('Registration Error', err.message || 'Could not register user account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = async (demoEmail: string, role: UserRole) => {
    setLoginEmail(demoEmail);
    setLoginPassword('Password@123');
    setIsLoading(true);
    try {
      await login(demoEmail, role, 'Password@123');
      success('Logged In', `Authenticated as ${role.toUpperCase()} profile.`);
      onSuccess();
    } catch (err: any) {
      error('Demo Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      error('Email Required', 'Please enter your registered email address.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await api.auth.requestPasswordReset(forgotEmail);
      info('Password Reset Initiated', res.message);
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setIsForgotLoading(false);
    }
  };

  const roleCards: {
    role: UserRole;
    title: string;
    description: string;
    icon: any;
    color: 'purple' | 'blue' | 'yellow' | 'green';
  }[] = [
    {
      role: 'patient',
      title: 'Patient',
      description: 'Book OPD consultations, view prescriptions & invoices',
      icon: User,
      color: 'green',
    },
    {
      role: 'doctor',
      title: 'Doctor / Specialist',
      description: 'Review patient appointments, diagnoses & write prescriptions',
      icon: Stethoscope,
      color: 'blue',
    },
    {
      role: 'receptionist',
      title: 'Receptionist',
      description: 'Manage front desk queue, register patients & billing',
      icon: UserCheck,
      color: 'yellow',
    },
    {
      role: 'administrator',
      title: 'Administrator',
      description: 'System-wide governance, security rules & audit logs',
      icon: ShieldCheck,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0f1115] text-zinc-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex">
            <GoogleIconCircle icon={Hospital} color="red" size="xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            <SplitText text="CarePulse HMS Portal" startDelay={0.05} charDelay={0.02} />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Unified Clinical Medicine & Hospital Administration Environment
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#181a20] rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Navigation Tabs: Sign In / Create Account */}
          <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setLoginErrors({});
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setRegErrors({});
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: SIGN IN (LOGIN) FORM                              */}
          {/* ======================================================== */}
          {mode === 'signin' && (
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Hospital or Patient Email Address"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. administrator@example.test"
                  icon={<Mail className="w-4 h-4 text-zinc-400" />}
                  error={loginErrors.email}
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-300 tracking-wide">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full rounded-2xl border bg-[#14161a] pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        loginErrors.password
                          ? 'border-rose-500'
                          : 'border-zinc-700/80 hover:border-zinc-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-rose-400 font-medium">{loginErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500/30"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">Demo: Password@123</span>
                </div>

                <Button
                  type="submit"
                  variant="google"
                  size="lg"
                  className="w-full font-bold shadow-lg"
                  isLoading={isLoading}
                >
                  <LogIn className="w-4 h-4 text-black mr-1" />
                  <span>Sign In to HMS Portal</span>
                </Button>
              </form>

              {/* 1-Click Demo Accounts for Rapid Evaluation */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    1-Click Examiner Demo Accounts
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Instant Switch
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoLogin('administrator@example.test', 'administrator')
                    }
                    className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-zinc-700 transition-all flex items-center gap-2.5 text-left cursor-pointer group"
                  >
                    <GoogleIconCircle icon={ShieldCheck} color="purple" size="xs" />
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-100 block leading-tight group-hover:text-purple-300">
                        Admin
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        Full Operations
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('doctor@example.test', 'doctor')}
                    className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-zinc-700 transition-all flex items-center gap-2.5 text-left cursor-pointer group"
                  >
                    <GoogleIconCircle icon={Stethoscope} color="blue" size="xs" />
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-100 block leading-tight group-hover:text-blue-300">
                        Doctor
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        Clinical & Rx
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemoLogin('receptionist@example.test', 'receptionist')
                    }
                    className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-zinc-700 transition-all flex items-center gap-2.5 text-left cursor-pointer group"
                  >
                    <GoogleIconCircle icon={UserCheck} color="yellow" size="xs" />
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-100 block leading-tight group-hover:text-amber-300">
                        Receptionist
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        Admit & Billing
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('patient@example.test', 'patient')}
                    className="p-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-zinc-700 transition-all flex items-center gap-2.5 text-left cursor-pointer group"
                  >
                    <GoogleIconCircle icon={User} color="green" size="xs" />
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-100 block leading-tight group-hover:text-emerald-300">
                        Patient
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        Self-Service
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SIGN UP / REGISTRATION FORM                       */}
          {/* ======================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Role Selection Cluster */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleCards.map((rc) => {
                    const isSelected = registerData.role === rc.role;
                    return (
                      <div
                        key={rc.role}
                        onClick={() =>
                          setRegisterData((prev) => ({ ...prev, role: rc.role }))
                        }
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 text-left ${
                          isSelected
                            ? 'bg-[#1e293b] border-blue-500 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                        }`}
                      >
                        <GoogleIconCircle icon={rc.icon} color={rc.color} size="xs" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-100 block">
                            {rc.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                            {rc.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Core User Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Legal Name"
                  type="text"
                  value={registerData.fullName}
                  onChange={(e) =>
                    setRegisterData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder={
                    registerData.role === 'doctor' ? 'e.g. Dr. Arthur Wright' : 'e.g. Sarah Miller'
                  }
                  icon={<User className="w-4 h-4 text-zinc-400" />}
                  error={regErrors.fullName}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="e.g. name@hospital.health"
                  icon={<Mail className="w-4 h-4 text-zinc-400" />}
                  error={regErrors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Phone Number"
                  type="tel"
                  value={registerData.contactNumber}
                  onChange={(e) =>
                    setRegisterData((prev) => ({ ...prev, contactNumber: e.target.value }))
                  }
                  placeholder="+1 (555) 019-2834"
                  icon={<Phone className="w-4 h-4 text-zinc-400" />}
                  error={regErrors.contactNumber}
                  required
                />

                {/* Role Specific Conditional Field */}
                {registerData.role === 'patient' && (
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={registerData.dateOfBirth}
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                    }
                    error={regErrors.dateOfBirth}
                    required
                  />
                )}

                {registerData.role === 'doctor' && (
                  <Input
                    label="Clinical Specialization"
                    type="text"
                    value={registerData.specialization}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        specialization: e.target.value,
                      }))
                    }
                    placeholder="e.g. Cardiology & Arrhythmia"
                    icon={<Stethoscope className="w-4 h-4 text-zinc-400" />}
                    error={regErrors.specialization}
                    required
                  />
                )}

                {registerData.role === 'receptionist' && (
                  <Input
                    label="Staff Desk / Badge ID"
                    type="text"
                    value={registerData.staffBadgeId}
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, staffBadgeId: e.target.value }))
                    }
                    placeholder="e.g. REC-FLOOR-1"
                    icon={<Building className="w-4 h-4 text-zinc-400" />}
                  />
                )}

                {registerData.role === 'administrator' && (
                  <Input
                    label="Admin Security Clearance"
                    type="text"
                    value="Level 4 - Full System Oversight"
                    disabled
                    icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
                  />
                )}
              </div>

              {/* Patient Gender & Blood Group Row */}
              {registerData.role === 'patient' && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Gender Identity"
                    value={registerData.gender}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        gender: e.target.value as any,
                      }))
                    }
                    options={[
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                      { value: 'other', label: 'Other / Non-binary' },
                    ]}
                  />

                  <Select
                    label="Blood Group"
                    value={registerData.bloodGroup}
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, bloodGroup: e.target.value }))
                    }
                    options={[
                      { value: 'A+', label: 'A+ (Positive)' },
                      { value: 'A-', label: 'A- (Negative)' },
                      { value: 'B+', label: 'B+ (Positive)' },
                      { value: 'B-', label: 'B- (Negative)' },
                      { value: 'AB+', label: 'AB+ (Positive)' },
                      { value: 'AB-', label: 'AB- (Negative)' },
                      { value: 'O+', label: 'O+ (Positive)' },
                      { value: 'O-', label: 'O- (Negative)' },
                    ]}
                  />
                </div>
              )}

              {/* Doctor Medical Department & Qualification Row */}
              {registerData.role === 'doctor' && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Department"
                    value={registerData.departmentId}
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, departmentId: e.target.value }))
                    }
                    options={[
                      { value: 'dept-1', label: 'Cardiology' },
                      { value: 'dept-2', label: 'Neurology' },
                      { value: 'dept-3', label: 'General Medicine' },
                      { value: 'dept-4', label: 'Pediatrics' },
                      { value: 'dept-5', label: 'Orthopedics' },
                    ]}
                  />

                  <Input
                    label="Medical Qualification"
                    type="text"
                    value={registerData.qualification}
                    onChange={(e) =>
                      setRegisterData((prev) => ({ ...prev, qualification: e.target.value }))
                    }
                    placeholder="e.g. MBBS, MD (Harvard)"
                  />
                </div>
              )}

              {/* Password Fields with Strength Meter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300 tracking-wide">
                    Create Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="Min 8 characters"
                      className={`w-full rounded-2xl border bg-[#14161a] pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        regErrors.password
                          ? 'border-rose-500'
                          : 'border-zinc-700/80 hover:border-zinc-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regErrors.password && (
                    <p className="text-xs text-rose-400 font-medium">{regErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300 tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Repeat password"
                      className={`w-full rounded-2xl border bg-[#14161a] pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        regErrors.confirmPassword
                          ? 'border-rose-500'
                          : 'border-zinc-700/80 hover:border-zinc-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {regErrors.confirmPassword && (
                    <p className="text-xs text-rose-400 font-medium">
                      {regErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {registerData.password && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-400">
                      Password Security Strength:
                    </span>
                    <span
                      className={`font-bold font-mono text-[11px] ${
                        passwordStrength.score >= 3
                          ? 'text-emerald-400'
                          : passwordStrength.score === 2
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step
                            ? passwordStrength.color
                            : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400 pt-1">
                    <span
                      className={
                        passwordStrength.hasMinLength ? 'text-emerald-400' : 'text-zinc-500'
                      }
                    >
                      ✓ At least 8 characters
                    </span>
                    <span
                      className={
                        passwordStrength.hasUppercase && passwordStrength.hasLowercase
                          ? 'text-emerald-400'
                          : 'text-zinc-500'
                      }
                    >
                      ✓ Upper & lowercase
                    </span>
                    <span
                      className={
                        passwordStrength.hasNumber ? 'text-emerald-400' : 'text-zinc-500'
                      }
                    >
                      ✓ Includes numbers
                    </span>
                    <span
                      className={
                        passwordStrength.hasSpecialChar ? 'text-emerald-400' : 'text-zinc-500'
                      }
                    >
                      ✓ Special character (!@#)
                    </span>
                  </div>
                </div>
              )}

              {/* Data Governance & HIPAA Consent */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={registerData.acceptedTerms}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        acceptedTerms: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="leading-snug">
                    I acknowledge and agree to CarePulse HMS{' '}
                    <strong className="text-white">HIPAA Medical Records Privacy</strong>, Patient Data
                    Governance, and Electronic Healthcare System Security policies.
                  </span>
                </label>
                {regErrors.acceptedTerms && (
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {regErrors.acceptedTerms}
                  </p>
                )}
              </div>

              {/* Register Submit Button */}
              <Button
                type="submit"
                variant="google"
                size="lg"
                className="w-full font-bold shadow-lg"
                isLoading={isLoading}
              >
                <UserPlus className="w-4 h-4 text-black mr-1" />
                <span>Complete Registration & Launch Portal</span>
              </Button>
            </form>
          )}

          {/* Guest / Demo Explorer Link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSuccess}
              className="text-xs text-zinc-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Or continue into portal as demo viewer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#181a20] rounded-3xl border border-zinc-800 p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <GoogleIconCircle icon={HelpCircle} color="yellow" size="md" />
              <div>
                <h3 className="text-base font-bold text-zinc-100">Reset Account Password</h3>
                <p className="text-xs text-zinc-400">
                  Enter your registered hospital or patient email address.
                </p>
              </div>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="doctor@example.test"
                icon={<Mail className="w-4 h-4 text-zinc-400" />}
                required
              />

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                In this demonstration environment, default laboratory accounts use password{' '}
                <code className="text-blue-400 font-mono font-bold">Password@123</code>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="google"
                  size="sm"
                  isLoading={isForgotLoading}
                >
                  Send Recovery Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
