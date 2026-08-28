import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  isAuthenticated: boolean;
  isSupabaseActive: boolean;
  login: (role?: UserRole) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
}

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

  // Listen for real Supabase Auth session changes if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
        if (data.session) {
          setSession(data.session);
          setToken(data.session.access_token);
          localStorage.setItem('mm_auth_token', data.session.access_token);
          const metaRole = (data.session.user.user_metadata?.role as UserRole) || 'student';
          setUser({
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            role: metaRole,
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (session) {
          setToken(session.access_token);
          localStorage.setItem('mm_auth_token', session.access_token);
          const metaRole = (session.user.user_metadata?.role as UserRole) || 'student';
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: metaRole,
          });
        } else {
          setToken(null);
          localStorage.removeItem('mm_auth_token');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = (role: UserRole = 'student') => {
    setCurrentRole(role);
    setUser(mockUsers[role]);
    localStorage.setItem('mm_user_role', role);
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
    setCurrentRole(role);
    setUser(mockUsers[role]);
    localStorage.setItem('mm_user_role', role);
  };

  const signInWithSupabase = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo fallback mode
      login(currentRole);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.session) {
        setSession(data.session);
        setToken(data.session.access_token);
        localStorage.setItem('mm_auth_token', data.session.access_token);
        const metaRole = (data.user.user_metadata?.role as UserRole) || 'student';
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: metaRole,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUpWithSupabase = async (email: string, password: string, fullName: string, role: UserRole) => {
    if (!isSupabaseConfigured) {
      // Demo fallback mode
      login(role);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });
      if (error) return { success: false, error: error.message };
      if (data.session) {
        setSession(data.session);
        setToken(data.session.access_token);
        localStorage.setItem('mm_auth_token', data.session.access_token);
      }
      return { success: true };
    } catch (err: any) {
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
        isSupabaseActive: isSupabaseConfigured,
        login,
        logout,
        setRole,
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
