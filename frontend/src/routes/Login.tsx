import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  CheckCircle2,
  Award,
  Clock
} from 'lucide-react';

export const Login: React.FC = () => {
  const { user, isAuthenticated, isLoading, signInWithSupabase, signUpWithSupabase, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const isRegisterRoute = location.pathname === '/register' || location.search.includes('mode=signup');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(isRegisterRoute ? 'signup' : 'signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('rahul.k@student.shiftingorbits.org');
  const [password, setPassword] = useState('StudentPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('signup');
    }
  }, [location.pathname]);

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const getRoleDestination = (role: UserRole) => {
    if (from && from !== '/login' && from !== '/403' && from !== '/forbidden') return from;
    return getDashboardPath(role);
  };

  const handleQuickFill = (role: UserRole, customEmail?: string, customName?: string) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('director@shiftingorbits.org');
      setFullName('Program Director');
      setPassword('DirectorPass2026!');
    } else if (role === 'mentor') {
      setEmail(customEmail || 'sarah.jenkins@shiftingorbits.org');
      setFullName(customName || 'Dr. Sarah Jenkins');
      setPassword('MentorPass2026!');
    } else {
      setEmail('rahul.k@student.shiftingorbits.org');
      setFullName('Rahul Kumar');
      setPassword('StudentPass2026!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const dbRole: UserRole = selectedRole;

      if (authMode === 'signin') {
        const result = await signInWithSupabase(email, password);
        if (!result.success) {
          setErrorMsg(result.error || 'Invalid credentials. Please check your email and password.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Signed in successfully! Redirecting to Shifting Orbits portal...');
        setTimeout(() => {
          navigate(getRoleDestination(dbRole));
        }, 400);
      } else {
        const result = await signUpWithSupabase(email, password, fullName || 'Scholar', dbRole);
        if (!result.success) {
          setErrorMsg(result.error || 'Sign-up failed. Please check your details.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Account created! Redirecting to your learning dashboard...');
        setTimeout(() => {
          navigate(getDashboardPath(dbRole));
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 mx-auto flex items-center justify-center shadow-md shadow-sky-600/20 mb-3">
            <Heart className="w-6 h-6 text-white fill-white/20" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>NGO Field &amp; Cradle-to-College Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {authMode === 'signin' ? 'Shifting Orbits Platform' : 'Join Shifting Orbits'}
          </h1>
          <p className="text-xs text-slate-500">
            {authMode === 'signin'
              ? 'Empowering underprivileged students from cradle to college with targeted mentorship'
              : 'Create an account to join as a scholar or volunteer mentor'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              authMode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              {authMode === 'signin' ? 'Portal Persona' : 'I want to join as a'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs text-center ${
                  selectedRole === 'student'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/10 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>Scholar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('mentor')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs text-center ${
                  selectedRole === 'mentor'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users className={`w-5 h-5 ${selectedRole === 'mentor' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs text-center ${
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

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-sky-500 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-sky-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-sky-500 transition font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="btn-submit-auth"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 ${
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
                    ? `Sign In to ${selectedRole === 'mentor' ? 'Mentor Board' : selectedRole === 'admin' ? 'Admin Portal' : 'Scholar Portal'}`
                    : `Create Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick-Fill Presets for All 5 Mentors, Admin & Students */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Quick One-Click Demo Personas
            </span>
          </div>

          {/* Mentors Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 block">5 Volunteer Mentors (3 assigned students each):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('mentor', 'sarah.jenkins@shiftingorbits.org', 'Dr. Sarah Jenkins')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left transition font-semibold flex items-center justify-between"
              >
                <span>Dr. Sarah Jenkins</span>
                <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded">Active</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('mentor', 'priya.sharma@shiftingorbits.org', 'Priya Sharma')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left transition font-semibold flex items-center justify-between"
              >
                <span>Priya Sharma</span>
                <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded">Active</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('mentor', 'marcus.chen@shiftingorbits.org', 'Marcus Chen')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-left transition font-semibold flex items-center justify-between"
              >
                <span>Marcus Chen</span>
                <span className="text-[10px] text-rose-700 bg-white px-1.5 py-0.5 rounded font-bold">14d Inactive</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('mentor', 'elena.rostova@shiftingorbits.org', 'Elena Rostova')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-left transition font-semibold flex items-center justify-between"
              >
                <span>Elena Rostova</span>
                <span className="text-[10px] text-amber-800 bg-white px-1.5 py-0.5 rounded font-bold">No Doubts 8d</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('mentor', 'alex.rivera@shiftingorbits.org', 'Alex Rivera')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-left transition font-semibold flex items-center justify-between sm:col-span-2"
              >
                <span>Alex Rivera</span>
                <span className="text-[10px] text-orange-800 bg-white px-1.5 py-0.5 rounded font-bold">No Visit 42d (SLA Flag)</span>
              </button>
            </div>
          </div>

          {/* Admin & Student */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold text-center transition"
            >
              Program Director (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold text-center transition"
            >
              Rahul Kumar (Scholar)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
