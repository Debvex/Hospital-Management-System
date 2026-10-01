/**
 * Validation utilities for User Authentication & Registration
 * Aligned with backend express-validator / Zod rules
 */

import { UserRole } from '../types';

export interface PasswordStrength {
  score: number; // 0 to 4
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  contactNumber: string;
  // Patient-specific
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  // Doctor-specific
  specialization?: string;
  departmentId?: string;
  qualification?: string;
  // Receptionist-specific
  staffBadgeId?: string;
  // Terms
  acceptedTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@hospital.org).' };
  }
  return { isValid: true };
};

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  let label: PasswordStrength['label'] = 'Weak';
  let color = 'bg-rose-500';

  if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-blue-500';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
  }

  return {
    score,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    label,
    color,
  };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  const strength = checkPasswordStrength(password);
  if (strength.score < 2) {
    return {
      isValid: false,
      error: 'Password must contain a combination of letters, numbers, and special characters.',
    };
  }
  return { isValid: true };
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Contact phone number is required.' };
  }
  // Matches international or domestic phone formats e.g. +1 555-0199 or +91 9876543210
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
  if (!phoneRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid contact phone number.' };
  }
  return { isValid: true };
};

export const validateRegistration = (data: RegisterFormData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = 'Full legal name is required (minimum 2 characters).';
  }

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.isValid) {
    errors.email = emailCheck.error!;
  }

  const passCheck = validatePassword(data.password);
  if (!passCheck.isValid) {
    errors.password = passCheck.error!;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const phoneCheck = validatePhone(data.contactNumber);
  if (!phoneCheck.isValid) {
    errors.contactNumber = phoneCheck.error!;
  }

  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'You must accept the HIPAA compliance and Data Governance terms.';
  }

  // Role specific checks
  if (data.role === 'patient') {
    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required for patient clinical records.';
    }
  }

  if (data.role === 'doctor') {
    if (!data.specialization?.trim()) {
      errors.specialization = 'Clinical specialization is required for doctor credentials.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (data: LoginFormData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const emailCheck = validateEmail(data.email);
  if (!emailCheck.isValid) {
    errors.email = emailCheck.error!;
  }

  if (!data.password || data.password.trim().length === 0) {
    errors.password = 'Password is required to authenticate.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
