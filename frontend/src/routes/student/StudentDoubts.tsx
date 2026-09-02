import React, { useState } from 'react';
import { StudentDoubtHub } from '../../components/student/StudentDoubtHub';
import { 
  MessageSquare, 
  Mic, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  BookOpen,
  Filter,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export const StudentDoubts: React.FC = () => {
  const { user } = useAuth();
  const [quickQuestion, setQuickQuestion] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToast, setSubmittedToast] = useState(false);

  const handleSubmitQuickDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedToast(true);
      setQuickQuestion('');
      setTimeout(() => setSubmittedToast(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Centralized Doubt Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ask Questions & Connect with Mentors
          </h1>
          <p className="text-sm text-sky-100 leading-relaxed">
            Record a voice question or type your concept roadblocks. Real-time routing matches your doubt to subject teachers and volunteer engineers.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/student/voice-query"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-sky-800 text-xs font-bold hover:bg-sky-50 shadow-sm transition"
            >
              <Mic className="w-4 h-4 text-sky-600" />
              <span>Voice AI Query & Matching</span>
            </Link>
            <Link
              to="/student/buddy"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-800/60 hover:bg-sky-800 text-white border border-white/20 text-xs font-bold transition"
            >
              <Users className="w-4 h-4" />
              <span>Ask a Senior Buddy</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Quick Text Doubt Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-600" />
          <span>Quick Ask</span>
        </h2>
        
        {submittedToast && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your question has been posted to the mentor queue! Volunteer mentors will review it shortly.</span>
          </div>
        )}

        <form onSubmit={handleSubmitQuickDoubt} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="sm:w-48">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Question Details
              </label>
              <input
                type="text"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                placeholder="e.g. How do I balance redox equations with oxidation numbers?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="sm:self-end">
              <button
                type="submit"
                disabled={isSubmitting || !quickQuestion.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post Doubt'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Student Doubt Hub Component */}
      <StudentDoubtHub />
    </div>
  );
};

export default StudentDoubts;
