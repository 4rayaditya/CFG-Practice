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
  const { user, isAuthenticated, isLoading, getDashboardPath } = useAuth();
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

  // 2. Unauthenticated: Redirect to /login with return location
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Unauthorized Role: Redirect immediately to their own role's home view with notice
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const userHomePath = getDashboardPath(user.role);
    return (
      <Navigate 
        to={userHomePath} 
        state={{ 
          unauthorizedError: true, 
          message: `Unauthorized Access: Your account (${user.role}) cannot access ${location.pathname}.`,
          attemptedPath: location.pathname 
        }} 
        replace 
      />
    );
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
