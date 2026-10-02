/**
 * Authentication & Session token management helpers
 * Mirrors Express JWT verification and role-based access control (RBAC)
 */

import { User, UserRole } from '../types';

const TOKEN_KEY = 'carepulse_hms_token';
const USER_KEY = 'carepulse_hms_user';

export interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to set auth token in storage', e);
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove auth token', e);
    }
  },

  getStoredUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setStoredUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist user to storage', e);
    }
  },

  removeStoredUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to remove user from storage', e);
    }
  },

  clearSession: (): void => {
    authStorage.removeToken();
    authStorage.removeStoredUser();
  },
};

/**
 * Checks if a user has sufficient authorization for a protected action
 */
export const checkPermission = (
  userRole: UserRole,
  allowedRoles: UserRole | UserRole[]
): boolean => {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole);
  }
  return userRole === allowedRoles;
};

/**
 * Parses and verifies expiration for mock / real JWT tokens
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === 'number' && Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
};