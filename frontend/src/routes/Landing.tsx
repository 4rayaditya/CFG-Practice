import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Mic, 
  Heart, 
  Users, 
  WifiOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Zap,
  Radio,
  ShieldCheck,
  Award,
  Layers,
  Flame,
  LogIn,
  UserPlus
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider shadow-xs animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Nonprofit Educational Mentorship Initiative</span>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight sm:leading-none">
          MentorMatch AI <br />
          <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Instant Voice-Powered Technical Mentorship
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Speak your coding doubts aloud—even completely offline. Our sub-second AI classifier transcribes and matches your question with specialized volunteer mentors in real-time.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/25 hover:-translate-y-0.5 transition duration-200"
          >
            <UserPlus className="w-5 h-5" />
            <span>Get Started / Sign Up</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold shadow-xs hover:-translate-y-0.5 transition duration-200"
          >
            <LogIn className="w-5 h-5 text-sky-600" />
            <span>Log In</span>
          </Link>

          <Link
            to="/roadmap"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition duration-200"
          >
            <Compass className="w-5 h-5 text-teal-600" />
            <span>Explore Learning Paths</span>
          </Link>
        </div>

        {/* Live Metrics Strip */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-800 font-bold">100% Free & Open-Source</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-slate-800 font-bold">&lt; 4.2 Min Avg. Turnaround</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span className="text-slate-800 font-bold">Supabase pgvector Verified</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered to Bridge the Tech Mentorship Gap
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Combining browser-native PWA caching, high-velocity inference, and vector embeddings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Feature 1: Offline PWA Recording */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition duration-200 space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Offline PWA Recording</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No stable internet? Record your doubts in high-fidelity WebM audio. They are safely cached in IndexedDB and automatically dispatched to Groq Whisper when back online.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-sky-700">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Zero data loss guarantee</span>
            </div>
          </div>

          {/* Feature 2: Sub-Second AI Routing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition duration-200 space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sub-Second AI Routing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Groq Whisper transcribes English and Hindi voice intake instantly, while Groq LLaMA 3.3 extracts clean titles, tags, urgency, and categorized roadblocks with JSON precision.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-teal-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Structured metadata extraction</span>
            </div>
          </div>

          {/* Feature 3: Real-Time Volunteer Matching */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition duration-200 space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Real-Time Volunteer Matching</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Computes 384-dimensional dense vectors to match queries against mentor profiles using PostgreSQL pgvector cosine similarity, with live WebSocket doubt board broadcasts.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Supabase Realtime broadcast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact Callout */}
      <section className="bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            Empowering Next-Gen Engineers
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Learning Journey?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Join hundreds of students asking voice questions and getting answers from volunteer engineers at top tech companies.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition shadow-lg shadow-sky-500/20 text-sm"
            >
              Create Free Student Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition text-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
