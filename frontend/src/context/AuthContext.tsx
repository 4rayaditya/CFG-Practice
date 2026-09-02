import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { INITIAL_MENTORS, INITIAL_STUDENTS } from '../data/mockData';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseActive: boolean;
  login: (role?: UserRole, customUser?: Partial<User>) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  getDashboardPath: (role?: UserRole) => string;
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (role: UserRole, email?: string) => void;
}

export const getDashboardPath = (role?: UserRole): string => {
  switch (role) {
    case 'mentor':
      return '/mentor/doubt-board';
    case 'admin':
      return '/admin/analytics';
    case 'student':
    default:
      return '/student/voice-query';
  }
};

export const sanitizeRole = (rawRole: any): UserRole => {
  const normalized = String(rawRole || '').toLowerCase().trim();
  if (normalized === 'volunteer' || normalized === 'mentor') return 'mentor';
  if (normalized === 'director' || normalized === 'admin') return 'admin';
  return 'student';
};

export const decodeRoleFromJwt = (token: string | null): UserRole => {
  if (!token) return 'student';
  try {
    const parts = token.split('.');
    if (parts.length < 2) return 'student';
    const payload = JSON.parse(atob(parts[1]));
    const roleCandidate = 
      payload.user_metadata?.role || 
      payload.app_metadata?.role || 
      payload.role;
    return sanitizeRole(roleCandidate);
  } catch {
    return 'student';
  }
};

export const mockUsers: Record<string, User> = {
  admin: {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Program Director',
    fullName: 'Program Director',
    email: 'director@shiftingorbits.org',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'director@shiftingorbits.org': {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Program Director',
    fullName: 'Program Director',
    email: 'director@shiftingorbits.org',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'sarah.jenkins@shiftingorbits.org': {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Dr. Sarah Jenkins',
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@shiftingorbits.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialization: ['Physics', 'Chemistry', 'Kinematics'],
    assignedStudentIds: ['stu-001', 'stu-002', 'stu-003'],
  },
  'priya.sharma@shiftingorbits.org': {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@shiftingorbits.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialization: ['Algebra', 'Calculus', 'Trigonometry'],
    assignedStudentIds: ['stu-004', 'stu-005', 'stu-006'],
  },
  'marcus.chen@shiftingorbits.org': {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Marcus Chen',
    fullName: 'Marcus Chen',
    email: 'marcus.chen@shiftingorbits.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialization: ['Chemistry', 'Biology', 'Redox Reactions'],
    assignedStudentIds: ['stu-007', 'stu-008', 'stu-009'],
  },
  'elena.rostova@shiftingorbits.org': {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Elena Rostova',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@shiftingorbits.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialization: ['Geometry', 'Algebra', 'Trigonometry'],
    assignedStudentIds: ['stu-010', 'stu-011', 'stu-012'],
  },
  'alex.rivera@shiftingorbits.org': {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Alex Rivera',
    fullName: 'Alex Rivera',
    email: 'alex.rivera@shiftingorbits.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialization: ['World History', 'Literature', 'Essay Writing'],
    assignedStudentIds: ['stu-013', 'stu-014', 'stu-015'],
  },
  student: {
    id: 'stu-001',
    name: 'Rahul Kumar',
    fullName: 'Rahul Kumar',
    email: 'rahul.k@student.shiftingorbits.org',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    assignedMentorId: '00000000-0000-0000-0000-000000000001',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mm_user_role') as UserRole) || 'student';
  });

  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mm_auth_token'));
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('mm_user_data');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize state with Supabase Auth session listener
  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
        if (!mounted) return;
        if (data.session) {
          setSession(data.session);
          setToken(data.session.access_token);
          localStorage.setItem('mm_auth_token', data.session.access_token);
          
          const metaRole = sanitizeRole(
            data.session.user.user_metadata?.role || 
            data.session.user.app_metadata?.role || 
            decodeRoleFromJwt(data.session.access_token)
          );

          const loggedInUser: User = {
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            role: metaRole,
          };
          setUser(loggedInUser);
          setCurrentRole(metaRole);
          localStorage.setItem('mm_user_role', metaRole);
          localStorage.setItem('mm_user_data', JSON.stringify(loggedInUser));
        }
        setIsLoading(false);
      }).catch(() => {
        if (mounted) setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, currentSession: Session | null) => {
          if (!mounted) return;
          setSession(currentSession);
          if (currentSession) {
            setToken(currentSession.access_token);
            localStorage.setItem('mm_auth_token', currentSession.access_token);
            
            const metaRole = sanitizeRole(
              currentSession.user.user_metadata?.role || 
              currentSession.user.app_metadata?.role || 
              decodeRoleFromJwt(currentSession.access_token)
            );

            const loggedInUser: User = {
              id: currentSession.user.id,
              name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || 'User',
              fullName: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || 'User',
              email: currentSession.user.email || '',
              role: metaRole,
            };
            setUser(loggedInUser);
            setCurrentRole(metaRole);
            localStorage.setItem('mm_user_role', metaRole);
            localStorage.setItem('mm_user_data', JSON.stringify(loggedInUser));
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        authListener?.subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemoUser = (role: UserRole, email?: string) => {
    let demoUser: User;
    if (email && mockUsers[email]) {
      demoUser = mockUsers[email];
    } else if (role === 'admin') {
      demoUser = mockUsers.admin;
    } else if (role === 'mentor') {
      demoUser = mockUsers['sarah.jenkins@shiftingorbits.org'];
    } else {
      demoUser = mockUsers.student;
    }

    setUser(demoUser);
    setCurrentRole(demoUser.role);
    setToken('mock-jwt-token-demo');
    localStorage.setItem('mm_auth_token', 'mock-jwt-token-demo');
    localStorage.setItem('mm_user_role', demoUser.role);
    localStorage.setItem('mm_user_data', JSON.stringify(demoUser));
  };

  const login = (role?: UserRole, customUser?: Partial<User>) => {
    const targetRole = role || currentRole || 'student';
    let baseUser = targetRole === 'admin' ? mockUsers.admin : targetRole === 'mentor' ? mockUsers['sarah.jenkins@shiftingorbits.org'] : mockUsers.student;
    const finalUser: User = { ...baseUser, ...customUser, role: targetRole };
    
    setUser(finalUser);
    setCurrentRole(targetRole);
    setToken('mock-jwt-token-custom');
    localStorage.setItem('mm_auth_token', 'mock-jwt-token-custom');
    localStorage.setItem('mm_user_role', targetRole);
    localStorage.setItem('mm_user_data', JSON.stringify(finalUser));
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured && session) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setToken(null);
      localStorage.removeItem('mm_auth_token');
      localStorage.removeItem('mm_user_role');
      localStorage.removeItem('mm_user_data');
    }
  };

  const setRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('mm_user_role', newRole);
      localStorage.setItem('mm_user_data', JSON.stringify(updatedUser));
    }
  };

  const signInWithSupabase = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Check if matching any of our mock demo users for instant local login
    if (mockUsers[email]) {
      const matched = mockUsers[email];
      setUser(matched);
      setCurrentRole(matched.role);
      localStorage.setItem('mm_auth_token', 'mock-token-' + matched.id);
      localStorage.setItem('mm_user_role', matched.role);
      localStorage.setItem('mm_user_data', JSON.stringify(matched));
      return { success: true };
    }

    if (!isSupabaseConfigured) {
      // Fallback demo user
      loginAsDemoUser('student');
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { success: false, error: error.message };
      if (!data.session) return { success: false, error: 'No active session returned.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const signUpWithSupabase = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: fullName,
        fullName,
        email,
        role,
      };
      setUser(newUser);
      setCurrentRole(role);
      localStorage.setItem('mm_auth_token', 'mock-token-' + newUser.id);
      localStorage.setItem('mm_user_role', role);
      localStorage.setItem('mm_user_data', JSON.stringify(newUser));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        isAuthenticated: !!user,
        isLoading,
        isSupabaseActive: isSupabaseConfigured,
        login,
        logout,
        setRole,
        getDashboardPath,
        signInWithSupabase,
        signUpWithSupabase,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
