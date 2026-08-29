import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Forbidden: React.FC = () => {
  const { user, getDashboardPath } = useAuth();
  const location = useLocation();
  const state = location.state as { allowedRoles?: string[]; attemptedPath?: string } | undefined;

  return (
    <div className="max-w-md mx-auto my-12 p-8 sm:p-10 light-panel rounded-3xl border border-slate-200 text-center shadow-lg space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-amber-600 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          Error 403 • Access Forbidden
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 pt-2">Restricted Access</h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          You do not have permission to view {state?.attemptedPath ? <span className="font-mono font-semibold text-slate-800">{state.attemptedPath}</span> : 'this resource'}.
          {state?.allowedRoles && (
            <span className="block mt-1">
              Required Role: <strong className="text-amber-700 font-semibold">{state.allowedRoles.join(', ')}</strong>
            </span>
          )}
        </p>
      </div>

      {user && (
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Current Persona: <strong className="text-slate-900 capitalize">{user.role}</strong> ({user.name})
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to={getDashboardPath(user?.role)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>My Dashboard</span>
        </Link>
        <Link
          to="/login"
          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch Account</span>
        </Link>
      </div>
    </div>
  );
};
