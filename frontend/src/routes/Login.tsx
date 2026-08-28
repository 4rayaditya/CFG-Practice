import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Heart, Shield, GraduationCap, Users, Lock } from 'lucide-react';

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
      <div className="light-panel p-8 rounded-3xl border border-slate-200 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 mx-auto flex items-center justify-center shadow-md shadow-sky-600/20 mb-3">
            <Heart className="w-6 h-6 text-white fill-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to MentorMatch</h2>
          <p className="text-xs text-slate-600 mt-1">Select your role to explore the community portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Choose Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  selectedRole === 'student'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <GraduationCap className="w-5 h-5 text-sky-600" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('mentor')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  selectedRole === 'mentor'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  selectedRole === 'admin'
                    ? 'bg-purple-50 border-purple-500 text-purple-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Director</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={
                selectedRole === 'student'
                  ? 'alex.chen@student.edu'
                  : selectedRole === 'mentor'
                  ? 'sarah.j@techmentor.ai'
                  : 'admin@mentormatch.org'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-sans focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Security Token</label>
            <div className="relative">
              <input
                type="password"
                disabled
                value="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-sans focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm transition duration-200"
          >
            Enter as {selectedRole === 'admin' ? 'Program Director' : selectedRole === 'mentor' ? 'Volunteer Mentor' : 'Student'}
          </button>
        </form>
      </div>
    </div>
  );
};
