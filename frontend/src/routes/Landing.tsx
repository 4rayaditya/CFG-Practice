import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  Sparkles, 
  Cpu, 
  WifiOff, 
  Zap, 
  ArrowRight, 
  BarChart4 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Offline-Capable Voice AI Mentorship</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
          Speak Your Doubt. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Get Matched In Real-Time.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Record complex coding doubts on the go—even offline. Powered by OpenAI Whisper, 
          GPT-4o-mini structured parsing, and Supabase <span className="text-cyan-400 font-mono">pgvector</span> matching.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/student/voice-query"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition duration-200"
          >
            <Mic className="w-5 h-5" />
            <span>Try Voice Intake</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/mentor/doubt-board"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold hover:-translate-y-0.5 transition duration-200"
          >
            <span>Mentor Doubt Board</span>
          </Link>

          <Link
            to="/admin/analytics"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold hover:-translate-y-0.5 transition duration-200"
          >
            <BarChart4 className="w-5 h-5 text-indigo-400" />
            <span>Admin Analytics</span>
          </Link>
        </div>

        {/* Current Active Persona Banner */}
        <div className="mt-8 p-3 rounded-xl glass-card max-w-md mx-auto flex items-center justify-between border border-slate-800 text-xs">
          <span className="text-slate-400">Current active persona:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400 capitalize">{user?.role || 'Guest'}</span>
            <span className="text-slate-500">({user?.name})</span>
          </div>
        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition duration-300">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
            <WifiOff className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">CUJ 1: Offline Voice Sync</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Record doubts anywhere with zero connectivity. Audio is safely queued in IndexedDB and automatically synced to Whisper when connection restores.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition duration-300">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">CUJ 2: Semantic pgvector Match</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            GPT-4o-mini extracts key technical keywords and generates high-dimensional embeddings to match doubts with the top 3 domain mentors in milliseconds.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-purple-500/40 transition duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">CUJ 3: Real-Time Resolution</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Mentors answer from a curated board. Supabase Realtime delivers instantaneous notifications to student devices with live answer streaming.
          </p>
        </div>
      </section>

      {/* Engineering Architecture Breakdown */}
      <section className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">4-Engineer Architectural Alignment</h2>
            <p className="text-sm text-slate-400">Collaborative fullstack & AI platform split (PRD.md)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800 px-3 py-1.5 rounded-lg">
            <span>You are Person 3: UI & Analytics</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-cyan-400 mb-1">Person 1</div>
            <div className="font-semibold text-slate-200 text-sm">DB & Auth</div>
            <div className="text-xs text-slate-400 mt-2">Supabase PostgreSQL, pgvector schema, Row Level Security & JWTs.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-indigo-400 mb-1">Person 2</div>
            <div className="font-semibold text-slate-200 text-sm">AI & Vector Engine</div>
            <div className="text-xs text-slate-400 mt-2">OpenAI Whisper API, GPT-4o-mini structuring & vector embeddings.</div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 glow-indigo">
            <div className="text-xs font-mono text-cyan-300 font-bold mb-1">Person 3 (Current)</div>
            <div className="font-semibold text-white text-sm">UI, Routing & Analytics</div>
            <div className="text-xs text-indigo-200 mt-2">Vite SPA, Tailwind CSS, AuthGuards, Recharts Dashboard & UI Flow.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-purple-400 mb-1">Person 4</div>
            <div className="font-semibold text-slate-200 text-sm">PWA & Real-Time</div>
            <div className="text-xs text-slate-400 mt-2">vite-plugin-pwa, IndexedDB sync, Supabase Realtime listeners.</div>
          </div>
        </div>
      </section>
    </div>
  );
};
