import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const mockUsers: Record<UserRole, User> = {
  student: {
    id: 'usr_student_01',
    name: 'Alex Chen',
    email: 'alex.chen@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  mentor: {
    id: 'usr_mentor_01',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.j@techmentor.ai',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialization: ['Distributed Systems', 'Python / FastAPI', 'PostgreSQL pgvector', 'System Design'],
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dev Admin',
    email: 'admin@mentormatch.ai',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mm_user_role') as UserRole) || 'student';
  });

  const [user, setUser] = useState<User | null>(() => mockUsers[currentRole]);

  useEffect(() => {
    setUser(mockUsers[currentRole]);
    localStorage.setItem('mm_user_role', currentRole);
  }, [currentRole]);

  const login = (role: UserRole = 'student') => {
    setCurrentRole(role);
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setRole,
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
