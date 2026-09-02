import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Mic, 
  Users, 
  Compass, 
  Activity, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Shield, 
  GraduationCap, 
  Sparkles,
  FileText,
  Home,
  Award,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  // Strict RBAC Navigation Link Isolation with All Feature Portals
  const getNavLinks = () => {
    if (!isAuthenticated || !user) {
      return [
        { name: 'Home', path: '/', icon: Heart },
        { name: 'Ask & Doubts', path: '/student/doubts', icon: MessageSquare },
        { name: 'Buddy Mentoring', path: '/student/buddy', icon: Users },
        { name: 'Badges & Rewards', path: '/student/rewards', icon: Award },
        { name: 'College Pathways', path: '/roadmap', icon: Compass },
        { name: 'Discover Mentors', path: '/mentors', icon: Sparkles },
      ];
    }

    if (user.role === 'student') {
      return [
        { name: 'Ask & Doubts', path: '/student/doubts', icon: MessageSquare },
        { name: 'Voice AI Query', path: '/student/voice-query', icon: Mic },
        { name: 'Buddy Mentoring', path: '/student/buddy', icon: Users },
        { name: 'Badges & Rewards', path: '/student/rewards', icon: Award },
        { name: 'My College Pathway', path: '/roadmap', icon: Compass },
        { name: 'Skill Mastery', path: '/student/progress', icon: GraduationCap },
      ];
    }

    if (user.role === 'mentor') {
      return [
        { name: 'Assigned Doubts & Students', path: '/mentor/doubt-board', icon: Users },
        { name: 'Offline Field Logger', path: '/mentor/log-visit', icon: Mic },
        { name: 'Curriculum Tracks', path: '/roadmap', icon: GraduationCap },
        { name: 'Discover Mentors', path: '/mentors', icon: Compass },
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Admin Telemetry & Governance', path: '/admin/analytics', icon: Activity },
        { name: 'Curriculum Pathways', path: '/roadmap', icon: Compass },
        { name: 'Discover Mentors', path: '/mentors', icon: Users },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: Shield };
      case 'mentor':
        return { label: 'Teacher / Mentor', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Users };
      case 'student':
      default:
        return { label: 'Student', bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: GraduationCap };
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Shifting<span className="text-sky-600">Orbits</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 -mt-0.5">
                Cradle to College Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items - Strictly Filtered by Role */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors duration-150 ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Auth Status / Profile Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Role Pill */}
                {(() => {
                  const badge = getRoleBadge(user.role);
                  const BadgeIcon = badge.icon;
                  return (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}

                {/* User Name */}
                <span className="text-xs font-bold text-slate-700 max-w-[140px] truncate">
                  {user.fullName || user.name || user.email}
                </span>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition duration-150"
                  title="Sign out of Shifting Orbits"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
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

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated && user ? (
              <div className="space-y-2 px-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Signed in as:</span>
                  <span className="font-semibold text-slate-800">{user.fullName || user.name || user.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-sky-600 text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
