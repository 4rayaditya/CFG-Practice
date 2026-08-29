import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseActive: boolean;
  login: (role?: UserRole) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  getDashboardPath: (role?: UserRole) => string;
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
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

const mockUsers: Record<UserRole, User> = {
  student: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Alex Chen',
    email: 'alex.chen@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  mentor: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.j@techmentor.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialization: ['Computer Science', 'Web & UI Accessibility', 'Algorithms'],
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Program Director',
    email: 'director@mentormatch.org',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mm_user_role') as UserRole) || 'student';
  });

  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mm_auth_token'));
  const [user, setUser] = useState<User | null>(() => mockUsers[currentRole]);
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

          setUser({
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            role: metaRole,
          });
          setCurrentRole(metaRole);
          localStorage.setItem('mm_user_role', metaRole);
        }
        setIsLoading(false);
      }).catch(() => {
        if (mounted) setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        setSession(session);
        if (session) {
          setToken(session.access_token);
          localStorage.setItem('mm_auth_token', session.access_token);
          
          const metaRole = sanitizeRole(
            session.user.user_metadata?.role || 
            session.user.app_metadata?.role || 
            decodeRoleFromJwt(session.access_token)
          );

          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: metaRole,
          });
          setCurrentRole(metaRole);
          localStorage.setItem('mm_user_role', metaRole);
        } else {
          setToken(null);
          localStorage.removeItem('mm_auth_token');
          // In demo mode or logout, fall back to mock current role or null if signed out
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Demo Mode Initial Load Complete
      setIsLoading(false);
    }
  }, []);

  const login = (role: UserRole = 'student') => {
    const validRole = sanitizeRole(role);
    setCurrentRole(validRole);
    setUser(mockUsers[validRole]);
    localStorage.setItem('mm_user_role', validRole);
  };

  const logout = async () => {
    if (isSupabaseConfigured && session) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setToken(null);
    localStorage.removeItem('mm_auth_token');
  };

  const setRole = (role: UserRole) => {
    const validRole = sanitizeRole(role);
    setCurrentRole(validRole);
    setUser(mockUsers[validRole]);
    localStorage.setItem('mm_user_role', validRole);
  };

  const signInWithSupabase = async (email: string, password: string) => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      login(currentRole);
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.session) {
        setSession(data.session);
        setToken(data.session.access_token);
        localStorage.setItem('mm_auth_token', data.session.access_token);
        
        const metaRole = sanitizeRole(
          data.user.user_metadata?.role || 
          data.user.app_metadata?.role || 
          decodeRoleFromJwt(data.session.access_token)
        );

        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: metaRole,
        });
        setCurrentRole(metaRole);
        localStorage.setItem('mm_user_role', metaRole);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUpWithSupabase = async (email: string, password: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    const dbRole = sanitizeRole(role);
    if (!isSupabaseConfigured) {
      login(dbRole);
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: dbRole,
          },
        },
      });
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.session) {
        setSession(data.session);
        setToken(data.session.access_token);
        localStorage.setItem('mm_auth_token', data.session.access_token);
        
        setUser({
          id: data.session.user.id,
          name: data.session.user.user_metadata?.full_name || fullName || 'User',
          email: data.session.user.email || email,
          role: dbRole,
        });
        setCurrentRole(dbRole);
        localStorage.setItem('mm_user_role', dbRole);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
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
