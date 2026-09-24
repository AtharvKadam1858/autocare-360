'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { INITIAL_USERS } from './db/seedData';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  allDemoUsers: User[];
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default to ADMIN

  useEffect(() => {
    const saved = localStorage.getItem('autocare360_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = INITIAL_USERS.find((u) => u.id === parsed.id) || parsed;
        setCurrentUser(match);
      } catch {
        // use default
      }
    }
  }, []);

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('autocare360_user', JSON.stringify(user));
  };

  const switchRole = (role: UserRole) => {
    const match = INITIAL_USERS.find((u) => u.role === role);
    if (match) {
      handleSetUser(match);
    }
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetUser,
        switchRole,
        allDemoUsers: INITIAL_USERS,
        hasPermission,
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
