import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  Filter
} from 'lucide-react';
import type { Doubt } from '../../types';

const initialDoubts: Doubt[] = [
  {
    id: 'dbt_001',
    title: 'PostgreSQL pgvector cosine distance indexing strategy',
    description: 'When running 1536-dimensional OpenAI vector queries over 100k records in Supabase, ivfflat index queries are slow. Should I switch to HNSW?',
    studentId: 'usr_student_01',
    studentName: 'Alex Chen',
    createdAt: '5 mins ago',
    status: 'matched',
    category: 'PostgreSQL / pgvector',
    matchedMentors: ['Dr. Sarah Jenkins', 'Alex Rivera'],
    similarityScore: 0.94,
  },
  {
    id: 'dbt_002',
    title: 'FastAPI CORS preflight 405 error with React frontend',
    description: 'Options request fails on custom Authorization bearer header during login flow from localhost:5173.',
    studentId: 'usr_student_02',
    studentName: 'Priya Sharma',
    createdAt: '18 mins ago',
    status: 'matched',
    category: 'FastAPI / Web Security',
    matchedMentors: ['Dr. Sarah Jenkins'],
    similarityScore: 0.89,
  },
  {
    id: 'dbt_003',
    title: 'Service worker background sync with IndexedDB audio blobs',
    description: 'How to trigger the sync event reliably on mobile browsers when re-establishing online connection.',
    studentId: 'usr_student_03',
    studentName: 'Liam Vance',
    createdAt: '45 mins ago',
    status: 'resolved',
    category: 'PWA / Offline',
    matchedMentors: ['Dr. Sarah Jenkins'],
    similarityScore: 0.82,
    answer: 'Register a sync tag with registration.sync.register("sync-audio") and handle the event in the service worker.',
    answeredBy: 'Dr. Sarah Jenkins',
    answeredAt: '12 mins ago',
  }
];

export const DoubtBoard: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>(initialDoubts);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(initialDoubts[0]);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'matched' | 'resolved'>('all');

  const filteredDoubts = doubts.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedDoubt) return;

    const updated = doubts.map((d) => {
      if (d.id === selectedDoubt.id) {
        return {
          ...d,
          status: 'resolved' as const,
          answer: replyText,
          answeredBy: 'Dr. Sarah Jenkins (You)',
          answeredAt: 'Just now',
        };
      }
      return d;
    });

    setDoubts(updated);
    setSelectedDoubt({
      ...selectedDoubt,
      status: 'resolved',
      answer: replyText,
      answeredBy: 'Dr. Sarah Jenkins (You)',
      answeredAt: 'Just now',
    });
    setReplyText('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">
            <span>CUJ 3 • Mentor Live Doubt Feed</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Mentor Doubt Board</h1>
          <p className="text-sm text-slate-400 mt-1">
            Vector-matched queries tailored specifically to your domain expertise (pgvector Cosine score).
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 glass-card p-1.5 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Doubts
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'matched' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Awaiting Answer
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'resolved' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Grid Layout: Left List + Right Detail/Reply */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doubt List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDoubts.map((doubt) => {
            const isSelected = selectedDoubt?.id === doubt.id;
            return (
              <div
                key={doubt.id}
                onClick={() => setSelectedDoubt(doubt)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'glass-panel border-cyan-500/50 glow-cyan bg-slate-900/90'
                    : 'glass-card border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    {doubt.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {doubt.similarityScore && (
                      <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 text-[11px]">
                        Match: {(doubt.similarityScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{doubt.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{doubt.description}</p>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doubt.studentName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{doubt.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Doubt Details & Reply Workspace */}
        <div className="lg:col-span-7">
          {selectedDoubt ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{selectedDoubt.category}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    selectedDoubt.status === 'resolved'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800'
                  }`}>
                    {selectedDoubt.status === 'resolved' ? '✓ Resolved' : '● Awaiting Mentor Answer'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedDoubt.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>Student: <strong className="text-slate-200">{selectedDoubt.studentName}</strong></span>
                  <span>•</span>
                  <span>Posted {selectedDoubt.createdAt}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
                {selectedDoubt.description}
              </div>

              {/* Resolved Answer View */}
              {selectedDoubt.answer && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Answer by {selectedDoubt.answeredBy}</span>
                    </div>
                    <span>{selectedDoubt.answeredAt}</span>
                  </div>
                  <p className="text-sm text-slate-200">{selectedDoubt.answer}</p>
                </div>
              )}

              {/* Mentor Answer Form */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Your Answer (Broadcasts via Supabase Realtime)
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide your solution, code pointers, or architectural recommendations..."
                  className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Answer to Student</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-400">
              Select a doubt from the list to review and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
