import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { initialUsers } from '../lib/mockData';
import { api, RegisterPayload } from '../lib/api';
import { authStorage, isTokenValid } from '../lib/auth';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  authScreenMode: 'signin' | 'signup';
  currentPatientId?: string; // If logged in as patient
  currentDoctorId?: string;  // If logged in as doctor
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ status: 'active' } | { status: 'pending_approval'; message: string }>;
  logout: (mode?: 'signin' | 'signup') => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const stored = authStorage.getStoredUser();
    return stored || initialUsers[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = authStorage.getToken();
    return isTokenValid(token);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authScreenMode, setAuthScreenMode] = useState<'signin' | 'signup'>('signin');

  // Link role to patient or doctor ID
  const currentRole = currentUser.role;
  const currentPatientId = currentUser.patientId;
  const currentDoctorId = currentUser.doctorId;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setAuthScreenMode('signin');
      authStorage.setToken(res.token);
      authStorage.setStoredUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(payload);
      if (res.status === 'pending_approval') {
        authStorage.clearSession();
        setCurrentUser(initialUsers[0]);
        setIsAuthenticated(false);
        setAuthScreenMode('signin');
        return { status: 'pending_approval' as const, message: res.message };
      }
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setAuthScreenMode('signin');
      authStorage.setToken(res.token);
      authStorage.setStoredUser(res.user);
      return { status: 'active' as const };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (mode: 'signin' | 'signup' = 'signin') => {
    api.auth.logout();
    setCurrentUser(initialUsers[0]);
    setIsAuthenticated(false);
    setAuthScreenMode(mode);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    return currentUser.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        authScreenMode,
        currentPatientId,
        currentDoctorId,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};