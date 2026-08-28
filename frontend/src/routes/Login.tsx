import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Sparkles, Shield, GraduationCap, Briefcase, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    setRole(selectedRole);
    if (selectedRole === 'student') navigate('/student/voice-query');
    else if (selectedRole === 'mentor') navigate('/mentor/doubt-board');
    else if (selectedRole === 'admin') navigate('/admin/analytics');
    else navigate(from);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to MentorMatch AI</h2>
          <p className="text-xs text-slate-400 mt-1">Select your role to explore the role-based routing</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Select Role / Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  selectedRole === 'student'
                    ? 'bg-indigo-600/20 border-indigo-500 text-cyan-300'
                    : 'glass-card border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('mentor')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  selectedRole === 'mentor'
                    ? 'bg-indigo-600/20 border-indigo-500 text-cyan-300'
                    : 'glass-card border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-600/20 border-indigo-500 text-cyan-300'
                    : 'glass-card border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={
                selectedRole === 'student'
                  ? 'alex.chen@student.edu'
                  : selectedRole === 'mentor'
                  ? 'sarah.j@techmentor.ai'
                  : 'admin@mentormatch.ai'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-sm font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Security Token</label>
            <div className="relative">
              <input
                type="password"
                disabled
                value="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-sm font-mono focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition duration-200"
          >
            Sign In as {selectedRole.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
};
