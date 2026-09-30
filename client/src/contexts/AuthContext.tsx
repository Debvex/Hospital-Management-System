import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { initialUsers, initialPatients, initialDoctors } from '../lib/mockData';
import { api } from '../lib/api';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  currentPatientId?: string; // If logged in as patient
  currentDoctorId?: string;  // If logged in as doctor
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Link role to mock linked patient or doctor ID
  const currentRole = currentUser.role;
  const currentPatientId = currentRole === 'patient' ? initialPatients[0].id : undefined;
  const currentDoctorId = currentRole === 'doctor' ? initialDoctors[0].id : undefined;

  const switchRole = (role: UserRole) => {
    const matchedUser = initialUsers.find((u) => u.role === role) || {
      id: `user-${role}`,
      email: `${role}@example.test`,
      role,
      fullName: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(matchedUser);

    api.auditLogs.logAction({
      actorUserId: matchedUser.id,
      actorName: matchedUser.fullName,
      actorRole: role,
      action: 'DEMO_ROLE_SWITCH',
      resourceType: 'auth',
      resourceId: matchedUser.id,
      metadataJson: { switchedTo: role },
    });
  };

  const login = async (email: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, role);
      setCurrentUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    switchRole('patient');
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
        currentPatientId,
        currentDoctorId,
        isLoading,
        switchRole,
        login,
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
