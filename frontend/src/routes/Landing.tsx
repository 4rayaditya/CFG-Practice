import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Mic, 
  Heart, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Zap, 
  ShieldCheck, 
  Award, 
  Layers, 
  LogIn, 
  UserPlus,
  Home,
  GraduationCap,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Landing: React.FC = () => {
  const { user, isAuthenticated, isLoading, getDashboardPath } = useAuth();

  // If user is ALREADY authenticated, automatically redirect to their respective dashboard
  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto pt-6 pb-4">
        {/* NGO Impact Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-xs">
          <Heart className="w-3.5 h-3.5 text-emerald-600" />
          <span>Shifting Orbits — High School Student Learning Hub</span>
        </div>

        {/* Primary Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-800 leading-snug sm:leading-tight">
          Supportive Mentorship & Academic Help for{' '}
          <span className="text-teal-700 font-black">
            High School Students
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Ask questions in Physics, Chemistry, Algebra, Geometry, Biology, World History, and Literature. Dedicated mentors and supportive teachers are here to help you learn step-by-step.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-sm transition duration-150"
          >
            <LogIn className="w-5 h-5" />
            <span>Student & Teacher Login</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/mentors"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium shadow-sm transition duration-150"
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Meet Our Teachers</span>
          </Link>

          <Link
            to="/roadmap"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition duration-150"
          >
            <Compass className="w-5 h-5 text-sky-600" />
            <span>Academic Study Roadmaps</span>
          </Link>
        </div>

        {/* Live Metrics Strip */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-800 font-bold">15 Active Scholars</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span className="text-slate-800 font-bold">5 Specialized Mentors</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-slate-800 font-bold">Rule-Based Priority Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-600" />
            <span className="text-slate-800 font-bold">Speech-to-Text Field Logs</span>
          </div>
        </div>
      </section>

      {/* 6 Key Pillars Feature Grid */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Our Solution Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Ground Reality in NGO Field Education
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Rule-Based Priority Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly flags students facing attendance drops (&lt;75%), overdue home visits (&gt;30 days), academic risks, or environmental hardship for immediate NGO intervention.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Personalized Career Pathways</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cradle-to-college milestones tailored to student passions—spanning secondary board exams, engineering, vocational nursing, and software systems.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Speech-to-Text Field Logger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mentors dictate home visit notes on their phones during student house visits. Auto-generates structured summaries and action items for the Director dashboard.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Assigned Mentor Boards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each mentor oversees exactly their 3 assigned students, monitoring confidential dossiers, solving doubts, and coordinating guidance requests.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Mentor SLA Inactivity Tracker</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin dashboard alerts when mentors are inactive &gt;10 days, haven't solved doubts in 5 days, or haven't visited students in 30 days to maintain service excellence.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Verified Progress Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive telemetry on student attendance, competencies, and doubt resolutions with printable NGO verified progress transcripts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
