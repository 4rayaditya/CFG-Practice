import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Mic, 
  Users, 
  Compass, 
  Activity, 
  Menu, 
  X,
  UserCheck,
  Sparkles
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
    { name: 'Ask a Question', path: '/student/voice-query', icon: Mic },
    { name: 'Mentor Hub', path: '/mentor/doubt-board', icon: Users },
    { name: 'Learning Pathways', path: '/roadmap', icon: Compass },
    { name: 'Community Impact', path: '/admin/analytics', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with NGO Theme */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-500 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Mentor<span className="text-sky-600">Match</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-700 -mt-0.5">
                Community Mentorship Initiative
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
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Persona Switcher */}
          <div className="hidden lg:flex items-center gap-4">
            {/* View As Switcher */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <label className="text-xs font-medium text-slate-600">Active View:</label>
              <select
                value={user?.role || 'student'}
                onChange={(e) => setRole(e.target.value as 'student' | 'mentor' | 'admin')}
                aria-label="Switch Role View"
                className="bg-white text-xs font-semibold text-slate-700 rounded-md px-2 py-1 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="student">Student View</option>
                <option value="mentor">Volunteer Mentor</option>
                <option value="admin">Program Director</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
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
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 text-sky-600" />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2 text-xs">
            <span className="text-slate-500 font-medium">Switch Active Persona:</span>
            <select
              value={user?.role || 'student'}
              onChange={(e) => {
                setRole(e.target.value as 'student' | 'mentor' | 'admin');
                setMobileMenuOpen(false);
              }}
              aria-label="Switch User Role"
              className="bg-slate-50 text-xs font-semibold text-slate-700 rounded px-2 py-1 border border-slate-200"
            >
              <option value="student">Student</option>
              <option value="mentor">Volunteer Mentor</option>
              <option value="admin">Program Director</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
