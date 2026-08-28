import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Mic, 
  Layers, 
  Map, 
  BarChart3, 
  Activity, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, setRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  useEffect(() => {
    api.getHealth().then((res) => {
      if (res.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    });
  }, []);

  const navLinks = [
    { name: 'Voice Intake', path: '/student/voice-query', icon: Mic, role: 'student' },
    { name: 'Mentor Board', path: '/mentor/doubt-board', icon: Layers, role: 'mentor' },
    { name: 'AI Roadmap', path: '/roadmap', icon: Map, role: 'all' },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, role: 'admin' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                MentorMatch<span className="text-cyan-400">.ai</span>
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 -mt-1">
                PWA • Offline AI Sync
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-cyan-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Backend Health & Role Selector */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Backend connection indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                backendStatus === 'connected'
                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                  : backendStatus === 'checking'
                  ? 'bg-amber-950/50 text-amber-400 border-amber-800/60'
                  : 'bg-rose-950/50 text-rose-400 border-rose-800/60'
              }`}
              title={`FastAPI Server: ${backendStatus}`}
            >
              <Activity className={`w-3 h-3 ${backendStatus === 'connected' ? 'animate-pulse' : ''}`} />
              <span>Backend {backendStatus === 'connected' ? 'CORS OK' : backendStatus}</span>
            </div>

            {/* Persona Switcher for pair programming test */}
            <div className="flex items-center gap-2 glass-card px-2.5 py-1.5 rounded-xl border border-slate-700/60">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <label className="text-xs text-slate-400">Role:</label>
              <select
                value={user?.role || 'student'}
                onChange={(e) => setRole(e.target.value as 'student' | 'mentor' | 'admin')}
                aria-label="Switch User Role"
                className="bg-slate-900 text-xs font-medium text-slate-200 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-cyan-400"
              >
                <option value="student">Student (Alex)</option>
                <option value="mentor">Mentor (Dr. Sarah)</option>
                <option value="admin">Admin (Dev)</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
