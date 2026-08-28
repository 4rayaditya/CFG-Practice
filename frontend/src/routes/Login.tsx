import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { 
  Heart, 
  Shield, 
  GraduationCap, 
  Users, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, setRole, signInWithSupabase, signUpWithSupabase, isSupabaseActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('alex.chen@student.edu');
  const [password, setPassword] = useState('MentorMatch2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    setRole(role);
    if (role === 'student') {
      setEmail('alex.chen@student.edu');
      setFullName('Alex Chen');
      setPassword('StudentPass2026!');
    } else if (role === 'mentor') {
      setEmail('sarah.j@techmentor.org');
      setFullName('Dr. Sarah Jenkins');
      setPassword('MentorPass2026!');
    } else {
      setEmail('director@mentormatch.org');
      setFullName('Program Director');
      setPassword('DirectorPass2026!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMode === 'signin') {
        const result = await signInWithSupabase(email, password);
        if (!result.success) {
          setErrorMsg(result.error || 'Invalid credentials. Please try again.');
          setLoading(false);
          return;
        }
        setRole(selectedRole);
        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          if (selectedRole === 'student') navigate('/student/voice-query');
          else if (selectedRole === 'mentor') navigate('/mentor/doubt-board');
          else if (selectedRole === 'admin') navigate('/admin/analytics');
          else navigate(from);
        }, 600);
      } else {
        const result = await signUpWithSupabase(email, password, fullName || 'Community Member', selectedRole);
        if (!result.success) {
          setErrorMsg(result.error || 'Sign-up failed. Please check your details.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Account created successfully! Redirecting to your community dashboard...');
        setTimeout(() => {
          if (selectedRole === 'student') navigate('/student/voice-query');
          else if (selectedRole === 'mentor') navigate('/mentor/doubt-board');
          else navigate('/roadmap');
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Container Card */}
      <div className="light-panel p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 mx-auto flex items-center justify-center shadow-md shadow-sky-600/20 mb-3">
            <Heart className="w-6 h-6 text-white fill-white/20" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {authMode === 'signin' ? 'Welcome to MentorMatch' : 'Join Our Community'}
          </h1>
          <p className="text-xs text-slate-500">
            {authMode === 'signin'
              ? 'Access your voice mentorship sessions & learning pathways'
              : 'Create an account to start asking questions or volunteer as a mentor'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            id="tab-signin"
            onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
              authMode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-signup"
            onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
              authMode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              {authMode === 'signin' ? 'Sign in as' : 'I want to join as a'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                id="role-student"
                onClick={() => handleQuickFill('student')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-medium text-center ${
                  selectedRole === 'student'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/10 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                id="role-mentor"
                onClick={() => handleQuickFill('mentor')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-medium text-center ${
                  selectedRole === 'mentor'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users className={`w-5 h-5 ${selectedRole === 'mentor' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Volunteer</span>
              </button>

              <button
                type="button"
                id="role-admin"
                onClick={() => handleQuickFill('admin')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-medium text-center ${
                  selectedRole === 'admin'
                    ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-500/10 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Shield className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>Director</span>
              </button>
            </div>
          </div>

          {/* Full Name Field (Registration Mode Only) */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-fullname"
                  placeholder="e.g. Alex Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                id="input-email"
                placeholder="name@organization.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              {authMode === 'signin' && (
                <span className="text-xs text-sky-600 hover:text-sky-700 cursor-pointer">
                  Forgot password?
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="input-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                id="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-auth"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-sm transition duration-200 flex items-center justify-center gap-2 ${
              selectedRole === 'mentor'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : selectedRole === 'admin'
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
                : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'signin'
                    ? `Sign In as ${selectedRole === 'mentor' ? 'Volunteer' : selectedRole === 'admin' ? 'Director' : 'Student'}`
                    : `Create ${selectedRole === 'mentor' ? 'Volunteer' : selectedRole === 'admin' ? 'Director' : 'Student'} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick-Fill Presets for Easy Evaluation */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Quick Persona Demo Presets
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-medium border border-sky-200 transition"
            >
              Alex (Student)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('mentor')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-200 transition"
            >
              Dr. Sarah (Mentor)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-medium border border-purple-200 transition"
            >
              Director (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
