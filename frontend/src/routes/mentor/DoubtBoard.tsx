import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  Filter,
  HeartHandshake
} from 'lucide-react';
import type { Doubt } from '../../types';

const initialDoubts: Doubt[] = [
  {
    id: 'dbt_001',
    title: 'Understanding recursion and tree traversals in Python',
    description: 'I am practicing binary search tree algorithms and having trouble understanding how the recursive call stack unwinds in pre-order vs in-order.',
    studentId: 'usr_student_01',
    studentName: 'Alex Chen',
    createdAt: '5 mins ago',
    status: 'matched',
    category: 'Computer Science / Algorithms',
    matchedMentors: ['Dr. Sarah Jenkins', 'Alex Rivera'],
    similarityScore: 0.94,
  },
  {
    id: 'dbt_002',
    title: 'Tips for landing first web development internship with no prior experience',
    description: 'What are the best types of portfolio projects to demonstrate understanding of React and clean RESTful APIs for non-profit / social impact projects?',
    studentId: 'usr_student_02',
    studentName: 'Priya Sharma',
    createdAt: '18 mins ago',
    status: 'matched',
    category: 'Career & Projects',
    matchedMentors: ['Dr. Sarah Jenkins'],
    similarityScore: 0.89,
  },
  {
    id: 'dbt_003',
    title: 'How to build accessible web forms for screen readers',
    description: 'What are the essential ARIA attributes and keyboard navigation patterns to ensure my high school community site is accessible to everyone?',
    studentId: 'usr_student_03',
    studentName: 'Liam Vance',
    createdAt: '45 mins ago',
    status: 'resolved',
    category: 'Web Accessibility',
    matchedMentors: ['Dr. Sarah Jenkins'],
    similarityScore: 0.82,
    answer: 'Always prioritize semantic HTML (like <label htmlFor="...">) before adding ARIA. Ensure all interactive elements have visible focus indicators and logical tab order.',
    answeredBy: 'Dr. Sarah Jenkins (Volunteer Mentor)',
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
          answeredBy: 'Dr. Sarah Jenkins (Volunteer Mentor)',
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
      answeredBy: 'Dr. Sarah Jenkins (Volunteer Mentor)',
      answeredAt: 'Just now',
    });
    setReplyText('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Volunteer Mentor Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Student Question Board</h1>
          <p className="text-sm text-slate-600 mt-1">
            Questions matched to your volunteering interests and expertise. Your guidance helps shape their future.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filter === 'all' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filter === 'matched' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Guidance
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filter === 'resolved' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Answered
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
                    ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    {doubt.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {doubt.status === 'resolved' ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] font-medium">
                        Answered
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-medium">
                        Awaiting Reply
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{doubt.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{doubt.description}</p>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
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
            <div className="light-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">{selectedDoubt.category}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    selectedDoubt.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {selectedDoubt.status === 'resolved' ? '✓ Resolved with Mentor Answer' : '● Waiting for Guidance'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedDoubt.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Student: <strong className="text-slate-800">{selectedDoubt.studentName}</strong></span>
                  <span>•</span>
                  <span>Asked {selectedDoubt.createdAt}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed font-sans">
                {selectedDoubt.description}
              </div>

              {/* Resolved Answer View */}
              {selectedDoubt.answer && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Answer by {selectedDoubt.answeredBy}</span>
                    </div>
                    <span>{selectedDoubt.answeredAt}</span>
                  </div>
                  <p className="text-sm text-slate-700">{selectedDoubt.answer}</p>
                </div>
              )}

              {/* Mentor Answer Form */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Your Encouraging Guidance & Solution
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Share a thoughtful explanation, step-by-step pointers, or helpful resources to empower this student..."
                  className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Answer to Student</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="light-panel p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
              Select a student question from the list to review and provide guidance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
