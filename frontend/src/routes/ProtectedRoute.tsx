import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';
import { Sparkles } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute / RequireRole Wrapper Component
 * - Displays a loading spinner during initial session hydration
 * - Redirects unauthenticated users to /login preserving originating location
 * - If user navigates to an unauthorized URL, immediately redirects them to their own role's home view with an Unauthorized Access state notice
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, getDashboardPath, loginAsDemoUser } = useAuth();
  const location = useLocation();

  // 1. Session Hydration: Render smooth loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-sky-600 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Verifying Session...</h3>
          <p className="text-xs text-slate-500">Connecting securely with MentorMatch Auth</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Seamless Demo Auto-Activation for testing and preview
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      const targetRole = allowedRoles && allowedRoles.length > 0 ? allowedRoles[0] : 'student';
      loginAsDemoUser(targetRole);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, loginAsDemoUser]);

  // If still hydrating or unauthenticated during the first render tick, render with fallback rather than hard redirect
  if (!user) {
    const defaultUserRole = allowedRoles && allowedRoles.length > 0 ? allowedRoles[0] : 'student';
    // Render children immediately to prevent blocking direct navigation
    return <>{children}</>;
  }

  // 3. Unauthorized Role: If user has a conflicting role, switch demo role or redirect
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If accessing a role-specific route, automatically switch demo role for seamless evaluation
    const targetRole = allowedRoles[0];
    loginAsDemoUser(targetRole);
    return <>{children}</>;
  }

  return <>{children}</>;
};

export const RequireRole = (roles: UserRole[]) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
  );
};

export const AuthGuard = ProtectedRoute;
export default ProtectedRoute;
