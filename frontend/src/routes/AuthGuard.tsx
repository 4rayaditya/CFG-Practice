import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';
import { ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Display smooth loading state during session hydration to prevent layout shift / flash
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

  // 2. Redirect unauthenticated visitors to /login with return location preserved
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Enforce Role-Based Access Control (RBAC) if specific roles are required
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 light-panel rounded-3xl border border-slate-200 text-center shadow-lg space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-amber-600" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Restricted Section</h2>
          <p className="text-xs text-slate-600">
            This area requires <strong className="text-amber-700 font-semibold">{allowedRoles.join(', ')}</strong> access.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-600" />
          <span>Active Role: <strong className="text-slate-900 capitalize">{user.role}</strong> ({user.name})</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Go Back
          </button>
          <Link
            to="/login"
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition"
          >
            Switch Role
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Provide AuthGuard alias for backward compatibility and semantic clarity
export const AuthGuard = ProtectedRoute;
export default ProtectedRoute;
