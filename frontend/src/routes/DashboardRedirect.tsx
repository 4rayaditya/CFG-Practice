import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles } from 'lucide-react';

export const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-sky-600 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Routing to Your Dashboard...</h3>
          <p className="text-xs text-slate-500">Resolving persona permissions</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Decode role and route automatically
  switch (user.role) {
    case 'mentor':
      return <Navigate to="/mentor/doubt-board" replace />;
    case 'admin':
      return <Navigate to="/admin/analytics" replace />;
    case 'student':
    default:
      return <Navigate to="/student/voice-query" replace />;
  }
};
