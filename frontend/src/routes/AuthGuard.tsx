import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Session Hydration: render smooth loading spinner
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
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Unauthorized Role: Redirect directly to /403 Forbidden page
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/403" 
        state={{ 
          allowedRoles, 
          attemptedPath: location.pathname 
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export const AuthGuard = ProtectedRoute;
export default ProtectedRoute;
