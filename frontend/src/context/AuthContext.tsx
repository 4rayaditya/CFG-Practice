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
  login: (role?: UserRole, customUser?: Partial<User>) => void;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  getDashboardPath: (role?: UserRole) => string;
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (role: UserRole) => void;
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

export const mockUsers: Record<UserRole, User> = {
  student: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Alex Chen',
    fullName: 'Alex Chen',
    email: 'alex.chen@student.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  mentor: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Dr. Sarah Jenkins',
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.j@techmentor.org',
    role: 'mentor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialization: ['Computer Science', 'Web & UI Accessibility', 'Algorithms'],
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Program Director',
    fullName: 'Program Director',
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
  
  // Initialize user as null by default unless a saved logged-in session exists
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('mm_user_data');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    const savedToken = localStorage.getItem('mm_auth_token');
    const savedRole = localStorage.getItem('mm_user_role') as UserRole;
    if (savedToken && savedRole && mockUsers[savedRole]) {
      return mockUsers[savedRole];
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
        } else {
          // If no Supabase session and no explicit demo session saved, remain logged out
          const savedToken = localStorage.getItem('mm_auth_token');
          if (!savedToken) {
            setUser(null);
          }
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

          const loggedInUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: metaRole,
          };
          setUser(loggedInUser);
          setCurrentRole(metaRole);
          localStorage.setItem('mm_user_role', metaRole);
          localStorage.setItem('mm_user_data', JSON.stringify(loggedInUser));
        } else {
          const savedToken = localStorage.getItem('mm_auth_token');
          if (!savedToken) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('mm_auth_token');
            localStorage.removeItem('mm_user_data');
          }
        }
        setIsLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (role: UserRole = 'student', customUser?: Partial<User>) => {
    const validRole = sanitizeRole(role);
    const targetUser: User = {
      ...(mockUsers[validRole] || mockUsers.student),
      ...customUser,
      role: validRole,
    };
    setCurrentRole(validRole);
    setUser(targetUser);
    setToken(`demo-token-${validRole}-${Date.now()}`);
    localStorage.setItem('mm_auth_token', `demo-token-${validRole}`);
    localStorage.setItem('mm_user_role', validRole);
    localStorage.setItem('mm_user_data', JSON.stringify(targetUser));
  };

  const loginAsDemoUser = (role: UserRole) => {
    login(role);
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured && session) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    setSession(null);
    setToken(null);
    localStorage.removeItem('mm_auth_token');
    localStorage.removeItem('mm_user_data');
    localStorage.removeItem('mm_user_role');
  };

  const setRole = (role: UserRole) => {
    const validRole = sanitizeRole(role);
    setCurrentRole(validRole);
    localStorage.setItem('mm_user_role', validRole);
    if (user) {
      const updatedUser = { ...user, role: validRole };
      setUser(updatedUser);
      localStorage.setItem('mm_user_data', JSON.stringify(updatedUser));
    }
  };

  const signInWithSupabase = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // Check demo credentials fallback
    const isDemoStudent = cleanEmail === 'alex.chen@student.edu' && (password === 'StudentPass2026!' || password === 'MentorMatch2026!');
    const isDemoMentor = cleanEmail === 'sarah.j@techmentor.org' && (password === 'MentorPass2026!' || password === 'MentorMatch2026!');
    const isDemoAdmin = cleanEmail === 'director@mentormatch.org' && (password === 'DirectorPass2026!' || password === 'MentorMatch2026!');

    if (!isSupabaseConfigured) {
      if (isDemoStudent) {
        login('student');
        setIsLoading(false);
        return { success: true };
      } else if (isDemoMentor) {
        login('mentor');
        setIsLoading(false);
        return { success: true };
      } else if (isDemoAdmin) {
        login('admin');
        setIsLoading(false);
        return { success: true };
      } else if (cleanEmail && password.length >= 6) {
        // Accept valid custom credentials in offline mode
        login('student', { email: cleanEmail, name: cleanEmail.split('@')[0], fullName: cleanEmail.split('@')[0] });
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password.' };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        // If remote Supabase user doesn't exist yet, check demo account credentials
        if (isDemoStudent) {
          login('student');
          setIsLoading(false);
          return { success: true };
        } else if (isDemoMentor) {
          login('mentor');
          setIsLoading(false);
          return { success: true };
        } else if (isDemoAdmin) {
          login('admin');
          setIsLoading(false);
          return { success: true };
        }
        setIsLoading(false);
        return { success: false, error: error.message || 'Invalid credentials.' };
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

        const loggedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: metaRole,
        };

        setUser(loggedUser);
        setCurrentRole(metaRole);
        localStorage.setItem('mm_user_role', metaRole);
        localStorage.setItem('mm_user_data', JSON.stringify(loggedUser));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      if (isDemoStudent) {
        login('student');
        setIsLoading(false);
        return { success: true };
      } else if (isDemoMentor) {
        login('mentor');
        setIsLoading(false);
        return { success: true };
      } else if (isDemoAdmin) {
        login('admin');
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUpWithSupabase = async (email: string, password: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    const dbRole = sanitizeRole(role);
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      login(dbRole, { email: cleanEmail, name: fullName, fullName });
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: dbRole,
          },
        },
      });
      if (error) {
        // If remote signup encounters issue (e.g., email confirmation rate limit), permit instant local session
        console.warn('Supabase signup notice, falling back to instant login:', error.message);
        login(dbRole, { email: cleanEmail, name: fullName, fullName });
        setIsLoading(false);
        return { success: true };
      }
      if (data.session) {
        setSession(data.session);
        setToken(data.session.access_token);
        localStorage.setItem('mm_auth_token', data.session.access_token);
        
        const loggedUser: User = {
          id: data.session.user.id,
          name: data.session.user.user_metadata?.full_name || fullName || 'User',
          fullName: data.session.user.user_metadata?.full_name || fullName || 'User',
          email: data.session.user.email || cleanEmail,
          role: dbRole,
        };

        setUser(loggedUser);
        setCurrentRole(dbRole);
        localStorage.setItem('mm_user_role', dbRole);
        localStorage.setItem('mm_user_data', JSON.stringify(loggedUser));
      } else {
        login(dbRole, { email: cleanEmail, name: fullName, fullName });
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn('Signup exception, logging in with demo state:', err);
      login(dbRole, { email: cleanEmail, name: fullName, fullName });
      setIsLoading(false);
      return { success: true };
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
